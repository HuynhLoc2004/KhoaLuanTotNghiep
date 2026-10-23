import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawn } from 'child_process';
import mongoose from 'mongoose';
import { ArtifactModel } from '../models/Artifact';
import { pgUpsertArtifact } from '../db/syncEngine';
import {
  cacheGet,
  cacheSet,
  cacheDelPattern,
  pushJobToQueue,
  popJobFromQueue
} from './redis';
import { sendToRabbitMQ, consumeRabbitMQ, QUEUES } from './rabbitmq';
import { acquireUser3DLock, releaseUser3DLock, generate3DWithTrellis, pingTrellis } from './trellisClient.js';
import { uploadToR2 } from './r2.js';
import { broadcastRealtimeEvent } from './realtimeSync.js';

const PYTHON_PATH = process.env.PYTHON_PATH || (process.platform === 'win32'
  ? 'C:\\Users\\HUYNH TAN LOC\\AppData\\Local\\Programs\\Python\\Python312\\python.exe'
  : 'python3');

const ARTIFACT_SCRIPT = process.env.ARTIFACT_3D_SCRIPT || (fs.existsSync(path.join(process.cwd(), 'stitching_worker', 'artifact_3d_generator.py'))
  ? path.join(process.cwd(), 'stitching_worker', 'artifact_3d_generator.py')
  : path.join(process.cwd(), '..', 'stitching_worker', 'artifact_3d_generator.py'));

const ARTIFACT_UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'artifacts');
const MODELS_3D_DIR = path.join(ARTIFACT_UPLOADS_DIR, 'models_3d');

/**
 * Cập nhật trạng thái tiến trình 3D của hiện vật đồng bộ cả MongoDB & PostgreSQL Primary
 */
async function updateArtifact3DState(artifactId: string, updateFields: any): Promise<any> {
  try {
    const query = mongoose.isValidObjectId(artifactId)
      ? { $or: [{ _id: artifactId }, { id: artifactId }, { code: artifactId }] }
      : { $or: [{ id: artifactId }, { code: artifactId }] };

    const updated = await ArtifactModel.findOneAndUpdate(query, { $set: updateFields }, { new: true });
    if (updated) {
      await pgUpsertArtifact(updated.toObject ? updated.toObject() : updated);
      return updated;
    }
  } catch (err: any) {
    console.warn('[3D Queue] Cảnh báo cập nhật trạng thái Artifact:', err.message);
  }
  return null;
}

// Đảm bảo thư mục lưu trữ tồn tại
if (!fs.existsSync(MODELS_3D_DIR)) {
  fs.mkdirSync(MODELS_3D_DIR, { recursive: true });
}

export interface I3DJobData {
  jobId: string;
  artifactId: string;
  imagePath: string;
  backImagePath?: string;
  multiImages?: string[];
  reconstructionMode?: 'single' | 'front_back' | 'multiview';
  angleLabels?: string[];
  depthScale: number;
  resolution: number;
  userId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  createdAt: number;
}

// Fallback in-memory queue & local jobs tracker
const memoryJobs: I3DJobData[] = [];
let isWorkerRunning = false;
let isConsumerLoopStarted = false;

function computeFileHash(filePath: string): string {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  } catch {
    return `${Date.now()}_${Math.random()}`;
  }
}

/**
 * Thêm một tác vụ dựng 3D vào hàng đợi bất đồng bộ (Queue: artifact_3d)
 * Hỗ trợ chế độ tái tạo đơn (Single-view 1 mặt) và ghép đa góc độ (Multi-view nhiều ảnh)
 */
export async function enqueue3DReconstruction(
  artifactId: string,
  imagePath: string,
  backImagePath?: string,
  depthScale = 1.0,
  resolution = 110,
  userId?: string,
  options?: {
    multiImages?: string[];
    reconstructionMode?: 'single' | 'front_back' | 'multiview';
    angleLabels?: string[];
  }
): Promise<{ jobId: string; cached: boolean; model3dUrl?: string }> {
  const multiImages = (options?.multiImages || []).filter(p => p && fs.existsSync(p));
  const reconstructionMode = options?.reconstructionMode || (
    multiImages.length > 0 ? 'multiview' : (backImagePath ? 'front_back' : 'single')
  );

  // 1. Kiểm tra cache dựa trên SHA256 tổng hợp của tất cả ảnh đầu vào và chế độ tái tạo
  let fileHash = computeFileHash(imagePath);
  if (backImagePath && fs.existsSync(backImagePath)) {
    fileHash += `_back_${computeFileHash(backImagePath).substring(0, 8)}`;
  }
  if (multiImages.length > 0) {
    fileHash += `_multi_${multiImages.map(p => computeFileHash(p).substring(0, 6)).join('_')}`;
  }
  fileHash += `_${reconstructionMode}_trellis_v17`;
  const cacheKey = `artifact:3d_cache:${fileHash}`;

  const cached = await cacheGet<{ model3dUrl: string; metadata: any }>(cacheKey);
  if (cached && cached.model3dUrl) {
    // Kiểm tra xem file vật lý có thực sự tồn tại trên ổ cứng VPS hay không
    const localGlbFilename = path.basename(cached.model3dUrl);
    const localGlbPath = path.join(MODELS_3D_DIR, localGlbFilename);

    if (fs.existsSync(localGlbPath)) {
      console.log(`[3D Queue] Tìm thấy trong Cache cho chế độ ${reconstructionMode} (${fileHash.substring(0, 10)}...). Trả về ngay.`);
      if (userId) await releaseUser3DLock(userId);
      await updateArtifact3DState(artifactId, {
        model3dUrl: cached.model3dUrl,
        processingStatus: 'completed',
        processingError: '',
        modelMetadata: {
          ...cached.metadata,
          reconstructionMode,
          inputImageSha256: fileHash
        }
      });
      await cacheDelPattern('artifacts:*');
      return { jobId: `cached_${fileHash.substring(0, 8)}`, cached: true, model3dUrl: cached.model3dUrl };
    }
  }

  // 2. Tạo Job ID mới và đánh dấu trạng thái processing trong MongoDB thật
  const jobId = `job_3d_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  await updateArtifact3DState(artifactId, {
    processingStatus: 'processing',
    processingError: ''
  });
  await cacheDelPattern('artifacts:*');

  const job: I3DJobData = {
    jobId,
    artifactId,
    imagePath,
    backImagePath: backImagePath || undefined,
    multiImages: multiImages.length > 0 ? multiImages : undefined,
    reconstructionMode,
    angleLabels: options?.angleLabels,
    depthScale,
    resolution,
    userId,
    status: 'pending',
    createdAt: Date.now()
  };

  // 1. Thử đẩy vào RabbitMQ Message Broker
  const pushedToRabbitMQ = await sendToRabbitMQ(QUEUES.ARTIFACT_3D, job);
  let pushedToRedis = false;
  if (!pushedToRabbitMQ) {
    // 2. Fallback sang Redis Queue
    pushedToRedis = await pushJobToQueue('artifact_3d', job);
    if (!pushedToRedis) {
      // 3. Fallback sang bộ nhớ RAM
      memoryJobs.push(job);
    }
  }

  const queueDest = pushedToRabbitMQ ? 'RabbitMQ' : (pushedToRedis ? 'Redis Queue' : 'Memory Queue');
  console.log(`[3D Queue] Đã đưa tác vụ ${jobId} vào hàng đợi (${queueDest})`);

  // Kích hoạt Consumer Worker nếu chưa chạy
  triggerWorker();

  return { jobId, cached: false };
}

/**
 * Worker Consumer xử lý công việc từ Queue
 */
async function processSingleJob(jobInput: I3DJobData): Promise<void> {
  const job: I3DJobData = ((jobInput as any)?.data ? (jobInput as any).data : jobInput) as I3DJobData;
  try {
    await runJobInternal(job);
  } finally {
    if (job.userId) {
      await releaseUser3DLock(job.userId);
    }
  }
}

async function runJobInternal(job: I3DJobData): Promise<void> {
  const artifactId = String(job.artifactId || (job as any).id || '');
  const imagePath = String(job.imagePath || '');
  const jobId = job.jobId || `job_${Date.now()}`;

  const outFilename = `model_3d_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.glb`;
  const outGlbPath = path.join(MODELS_3D_DIR, outFilename);
  const model3dUrl = `/uploads/artifacts/models_3d/${outFilename}`;

  console.log(`[3D Consumer] Bắt đầu TRELLIS Job ${jobId} cho hiện vật: ${artifactId}`);

  if (!artifactId || !imagePath || !fs.existsSync(imagePath)) {
    console.error(`[3D Consumer] Dữ liệu job không hợp lệ hoặc không tìm thấy file ảnh:`, { artifactId, imagePath });
    if (artifactId) {
      await updateArtifact3DState(artifactId, {
        processingStatus: 'failed',
        processingError: 'Không tìm thấy file ảnh gốc trên máy chủ để dựng 3D'
      });
      await cacheDelPattern('artifacts:*');
    }
    return;
  }

  // Chuẩn bị danh sách ảnh phụ (ảnh mặt sau + các góc chụp tư liệu)
  const extraImages: string[] = [];
  if (job.backImagePath && fs.existsSync(job.backImagePath) && !extraImages.includes(job.backImagePath)) {
    extraImages.push(job.backImagePath);
  }
  if (job.multiImages && job.multiImages.length > 0) {
    for (const p of job.multiImages) {
      if (p && fs.existsSync(p) && !extraImages.includes(p)) {
        extraImages.push(p);
      }
    }
  }

  // Gọi TRELLIS qua HuggingFace Spaces (gradio_client)
  try {
    const trellisRes = await generate3DWithTrellis({
      imagePath,
      multiImages: extraImages,
      destFilePath: outGlbPath,
      jobId,
    });

    // Upload backup lên Cloudflare R2 CDN (không bắt buộc)
    let finalModelUrl = model3dUrl;
    try {
      const r2FileStream = fs.createReadStream(outGlbPath);
      const r2Url = await uploadToR2(`models_3d/${outFilename}`, r2FileStream, 'model/gltf-binary', trellisRes.sizeBytes);
      if (r2Url) {
        console.log(`[3D Consumer] Đã sync lên Cloudflare R2 backup:`, r2Url);
      }
    } catch (r2Err: any) {
      console.warn(`[3D Consumer] R2 upload warning (vẫn phục vụ từ VPS local):`, r2Err.message);
    }

    const reconstructionMode = trellisRes.reconstructionMode || job.reconstructionMode || (extraImages.length > 0 ? 'multiview' : 'single');
    const inputImagesCount = trellisRes.inputImagesCount || (1 + extraImages.length);

    let fileHash = computeFileHash(imagePath);
    if (job.backImagePath && fs.existsSync(job.backImagePath)) {
      fileHash += `_back_${computeFileHash(job.backImagePath).substring(0, 8)}`;
    }
    if (extraImages.length > 0) {
      fileHash += `_multi_${extraImages.map(p => computeFileHash(p).substring(0, 6)).join('_')}`;
    }
    fileHash += `_${reconstructionMode}_trellis_v17`;

    const metadata = {
      aiEngine: trellisRes.engine,
      format: 'glb',
      sizeBytes: trellisRes.sizeBytes,
      generationTimeSeconds: trellisRes.generationTimeSeconds,
      reconstructionMode,
      inputImagesCount,
      angleLabels: job.angleLabels || (extraImages.length > 0 ? ['Mặt trước', ...extraImages.map((_, i) => `Góc #${i + 1}`)] : ['Mặt trước']),
      generatedAt: new Date(),
      inputImageSha256: fileHash
    };

    // Cache Redis 30 ngày
    const cacheKey = `artifact:3d_cache:${fileHash}`;
    await cacheSet(cacheKey, { model3dUrl: finalModelUrl, metadata }, 86400 * 30);

    // Cập nhật MongoDB & PostgreSQL
    await updateArtifact3DState(artifactId, {
      model3dUrl: finalModelUrl,
      processingStatus: 'completed',
      processingError: '',
      modelMetadata: metadata
    });

    await cacheDelPattern('artifacts:*');
    job.status = 'completed';
    console.log(`[3D Consumer] ✓ TRELLIS Job ${jobId} hoàn tất! Model: ${finalModelUrl} (${(trellisRes.sizeBytes/1024/1024).toFixed(2)}MB, ${trellisRes.generationTimeSeconds}s)`);

    // Broadcast real-time để client tự động hiển thị model 3D mới (không cần reload trang)
    broadcastRealtimeEvent('artifacts_updated', {
      action: 'update',
      artifactId,
      model3dUrl: finalModelUrl,
      processingStatus: 'completed'
    });

  } catch (trellisErr: any) {
    const rawMsg = trellisErr.message || 'Lỗi không xác định từ TRELLIS';
    const errMsg = rawMsg.startsWith('TRELLIS 3D') || rawMsg.startsWith('Lỗi') ? rawMsg : `Lỗi dựng 3D: ${rawMsg}`;
    console.error(`[3D Consumer] ✗ TRELLIS Job ${jobId} thất bại:`, errMsg);
    job.status = 'failed';
    job.error = errMsg;
    await updateArtifact3DState(artifactId, {
      processingStatus: 'failed',
      processingError: errMsg
    });
    await cacheDelPattern('artifacts:*');

    // Broadcast thất bại để admin biết ngay, không cần reload
    broadcastRealtimeEvent('artifacts_updated', {
      action: 'update',
      artifactId,
      processingStatus: 'failed',
      processingError: errMsg
    });
  }
}

/**
 * Vòng lặp Consumer kiểm tra hàng đợi (Redis Queue hoặc Memory Queue)
 */
async function triggerWorker() {
  if (isWorkerRunning) return;
  isWorkerRunning = true;

  try {
    while (true) {
      // 1. Thử lấy job từ Redis Queue
      let rawJob = await popJobFromQueue('artifact_3d');

      // 2. Nếu Redis không có job, lấy từ memory queue
      if (!rawJob && memoryJobs.length > 0) {
        rawJob = memoryJobs.shift();
      }

      if (!rawJob) {
        break; // Hết việc, tạm dừng worker
      }

      const job: I3DJobData = ((rawJob as any)?.data ? (rawJob as any).data : rawJob) as I3DJobData;
      await processSingleJob(job);
      await new Promise(r => setTimeout(r, 200)); // Nghỉ 200ms giữa các job
    }
  } catch (err: any) {
    console.error('[3D Consumer Worker Loop Error]:', err.message);
  } finally {
    isWorkerRunning = false;
  }
}

/**
 * Khởi động background consumer lặp định kỳ kiểm tra hàng đợi
 */
export function startArtifact3DConsumer() {
  if (isConsumerLoopStarted) return;
  isConsumerLoopStarted = true;
  console.log('[3D Queue Consumer] Đã kích hoạt tiến trình lắng nghe hàng đợi 3D (RabbitMQ & Redis fallback)');

  // 1. Lắng nghe trực tiếp từ RabbitMQ Message Broker
  consumeRabbitMQ(QUEUES.ARTIFACT_3D, async (rawJob) => {
    const job: I3DJobData = ((rawJob as any)?.data ? (rawJob as any).data : rawJob) as I3DJobData;
    await processSingleJob(job);
  });

  // 2. Định kỳ kiểm tra Redis / Memory Queue fallback
  setInterval(() => {
    if (!isWorkerRunning) {
      triggerWorker();
    }
  }, 3000);
}

/**
 * Tra cứu trạng thái tác vụ
 */
export async function getJobStatus(jobId: string) {
  const mem = memoryJobs.find(j => j.jobId === jobId);
  if (mem) return mem;
  return null;
}
