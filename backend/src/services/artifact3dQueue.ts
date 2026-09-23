import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawn } from 'child_process';
import { ArtifactModel } from '../models/Artifact';
import {
  cacheGet,
  cacheSet,
  cacheDelPattern,
  pushJobToQueue,
  popJobFromQueue
} from './redis';

const PYTHON_PATH = process.env.PYTHON_PATH || (process.platform === 'win32'
  ? 'C:\\Users\\HUYNH TAN LOC\\AppData\\Local\\Programs\\Python\\Python312\\python.exe'
  : 'python3');

const ARTIFACT_SCRIPT = process.env.ARTIFACT_3D_SCRIPT || (fs.existsSync(path.join(process.cwd(), 'stitching_worker', 'artifact_3d_generator.py'))
  ? path.join(process.cwd(), 'stitching_worker', 'artifact_3d_generator.py')
  : path.join(process.cwd(), '..', 'stitching_worker', 'artifact_3d_generator.py'));

const ARTIFACT_UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'artifacts');
const MODELS_3D_DIR = path.join(ARTIFACT_UPLOADS_DIR, 'models_3d');

// Đảm bảo thư mục lưu trữ tồn tại
if (!fs.existsSync(MODELS_3D_DIR)) {
  fs.mkdirSync(MODELS_3D_DIR, { recursive: true });
}

export interface I3DJobData {
  jobId: string;
  artifactId: string;
  imagePath: string;
  backImagePath?: string;
  depthScale: number;
  resolution: number;
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
 */
export async function enqueue3DReconstruction(
  artifactId: string,
  imagePath: string,
  backImagePath?: string,
  depthScale = 0.35,
  resolution = 160
): Promise<{ jobId: string; cached: boolean; model3dUrl?: string }> {
  // 1. Kiểm tra cache dựa trên SHA256 (kèm mã phân biệt mặt sau độc lập v5 vòm mượt chống méo)
  const fileHash = computeFileHash(imagePath) + (backImagePath ? `_back_${computeFileHash(backImagePath)}` : '_dorsal_synced_v5');
  const cacheKey = `artifact:3d_cache:${fileHash}`;

  const cached = await cacheGet<{ model3dUrl: string; metadata: any }>(cacheKey);
  if (cached && cached.model3dUrl) {
    // Kiểm tra xem file vật lý có thực sự tồn tại trên ổ cứng VPS hay không
    const localGlbFilename = path.basename(cached.model3dUrl);
    const localGlbPath = path.join(MODELS_3D_DIR, localGlbFilename);

    if (fs.existsSync(localGlbPath)) {
      console.log(`[3D Queue] Tìm thấy trong Cache cho mã băm ${fileHash.substring(0, 10)}... Trả về ngay lập tức.`);
      await ArtifactModel.findByIdAndUpdate(artifactId, {
        model3dUrl: cached.model3dUrl,
        processingStatus: 'completed',
        processingError: '',
        modelMetadata: {
          ...cached.metadata,
          inputImageSha256: fileHash
        }
      });
      await cacheDelPattern('artifacts:*');
      return { jobId: `cached_${fileHash.substring(0, 8)}`, cached: true, model3dUrl: cached.model3dUrl };
    }
  }

  // 2. Tạo Job ID mới và đánh dấu trạng thái processing trong MongoDB thật
  const jobId = `job_3d_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  await ArtifactModel.findByIdAndUpdate(artifactId, {
    processingStatus: 'processing',
    processingError: ''
  });
  await cacheDelPattern('artifacts:*');

  const job: I3DJobData = {
    jobId,
    artifactId,
    imagePath,
    backImagePath: backImagePath || undefined,
    depthScale,
    resolution,
    status: 'pending',
    createdAt: Date.now()
  };

  // Đẩy vào Redis Queue; nếu Redis chưa kết nối, đẩy vào bộ nhớ RAM
  const pushedToRedis = await pushJobToQueue('artifact_3d', job);
  if (!pushedToRedis) {
    memoryJobs.push(job);
  }

  console.log(`[3D Queue] Đã đưa tác vụ ${jobId} vào hàng đợi (Redis: ${pushedToRedis ? 'Yes' : 'Memory Fallback'})`);

  // Kích hoạt Consumer Worker nếu chưa chạy
  triggerWorker();

  return { jobId, cached: false };
}

/**
 * Worker Consumer xử lý công việc từ Queue
 */
async function processSingleJob(jobInput: I3DJobData): Promise<void> {
  const job: I3DJobData = ((jobInput as any)?.data ? (jobInput as any).data : jobInput) as I3DJobData;
  const artifactId = String(job.artifactId || (job as any).id || '');
  const imagePath = String(job.imagePath || '');
  const backImagePath = job.backImagePath ? String(job.backImagePath) : '';
  const depthScale = (typeof job.depthScale === 'number' && !isNaN(job.depthScale))
    ? job.depthScale
    : (parseFloat(String(job.depthScale)) || 0.35);
  const resolution = (typeof job.resolution === 'number' && !isNaN(job.resolution))
    ? job.resolution
    : (parseInt(String(job.resolution), 10) || 160);
  const jobId = job.jobId || `job_${Date.now()}`;

  const outFilename = `model_3d_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.glb`;
  const outGlbPath = path.join(MODELS_3D_DIR, outFilename);
  const model3dUrl = `/uploads/artifacts/models_3d/${outFilename}`;

  console.log(`[3D Consumer] Đang chạy tác vụ dựng 3D cho hiện vật: ${artifactId} (Job: ${jobId}, depthScale: ${depthScale}, resolution: ${resolution}, hasBack: ${!!backImagePath})...`);

  if (!artifactId || !imagePath || !fs.existsSync(imagePath)) {
    console.error(`[3D Consumer] Dữ liệu job không hợp lệ hoặc không tìm thấy file ảnh:`, { artifactId, imagePath });
    if (artifactId) {
      await ArtifactModel.findByIdAndUpdate(artifactId, {
        processingStatus: 'failed',
        processingError: 'Không tìm thấy file ảnh gốc trên máy chủ để dựng 3D'
      });
      await cacheDelPattern('artifacts:*');
    }
    return;
  }

  return new Promise<void>((resolve) => {
    const args = [
      ARTIFACT_SCRIPT,
      '--image', imagePath,
      '--output', outGlbPath,
      '--depth-scale', String(depthScale),
      '--resolution', String(resolution)
    ];
    if (backImagePath && fs.existsSync(backImagePath)) {
      args.push('--back-image', backImagePath);
    }

    const py = spawn(PYTHON_PATH, args);
    let stdoutData = '';
    let stderrData = '';

    py.stdout.on('data', (d) => { stdoutData += d.toString(); });
    py.stderr.on('data', (d) => {
      stderrData += d.toString();
      console.log(`[Python 3D Worker Log]: ${d.toString().trim()}`);
    });

    py.on('close', async (code) => {
      if (code === 0 && fs.existsSync(outGlbPath)) {
        let parsed: any = {};
        try {
          parsed = JSON.parse(stdoutData.trim());
        } catch {
          parsed = {};
        }

        const fileHash = computeFileHash(imagePath) + (backImagePath ? `_back_${computeFileHash(backImagePath)}` : '_dorsal_synced_v5');
        const metadata = {
          vertices: parsed.vertices || 0,
          faces: parsed.faces || 0,
          sizeBytes: parsed.sizeBytes || fs.statSync(outGlbPath).size,
          width: parsed.dimensions?.width || 0,
          height: parsed.dimensions?.height || 0,
          depth: parsed.dimensions?.depth || 0,
          generatedAt: new Date(),
          inputImageSha256: fileHash
        };

        // Lưu vào Redis Cache với TTL 30 ngày (2,592,000 giây)
        const cacheKey = `artifact:3d_cache:${fileHash}`;
        await cacheSet(cacheKey, { model3dUrl, metadata }, 86400 * 30);

        // Cập nhật MongoDB thật
        await ArtifactModel.findByIdAndUpdate(artifactId, {
          model3dUrl,
          processingStatus: 'completed',
          processingError: '',
          modelMetadata: metadata
        });

        // Xóa cache danh sách để dashboard admin hiển thị ngay
        await cacheDelPattern('artifacts:*');

        job.status = 'completed';
        console.log(`[3D Consumer] Hoàn tất xuất sắc Job ${jobId}! Model URL: ${model3dUrl}`);
      } else {
        const errMsg = stderrData || stdoutData || 'Không thể tạo file mô hình 3D';
        job.status = 'failed';
        job.error = errMsg;

        await ArtifactModel.findByIdAndUpdate(artifactId, {
          processingStatus: 'failed',
          processingError: errMsg
        });
        await cacheDelPattern('artifacts:*');
        console.error(`[3D Consumer] Thất bại Job ${jobId}:`, errMsg);
      }
      resolve();
    });

    py.on('error', async (err) => {
      job.status = 'failed';
      job.error = err.message;
      await ArtifactModel.findByIdAndUpdate(artifactId, {
        processingStatus: 'failed',
        processingError: err.message
      });
      await cacheDelPattern('artifacts:*');
      console.error(`[3D Consumer] Lỗi tiến trình Python:`, err.message);
      resolve();
    });
  });
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
  console.log('[3D Queue Consumer] Đã kích hoạt tiến trình lắng nghe hàng đợi 3D (queue:artifact_3d)');
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
