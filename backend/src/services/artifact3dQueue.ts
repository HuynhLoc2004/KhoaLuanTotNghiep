import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawn } from 'child_process';
import { ArtifactModel } from '../models/Artifact';

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

interface IQueueJob {
  jobId: string;
  artifactId: string;
  imagePath: string;
  depthScale: number;
  resolution: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  createdAt: number;
}

// In-memory Job Queue & Hash Cache
const jobQueue: IQueueJob[] = [];
let isProcessingQueue = false;

// Cache: hash -> { model3dUrl, metadata }
const modelCache = new Map<string, { model3dUrl: string; metadata: any }>();

function computeFileHash(filePath: string): string {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  } catch {
    return `${Date.now()}_${Math.random()}`;
  }
}

/**
 * Thêm một tác vụ dựng 3D vào hàng đợi bất đồng bộ
 */
export async function enqueue3DReconstruction(
  artifactId: string,
  imagePath: string,
  depthScale = 0.35,
  resolution = 160
): Promise<{ jobId: string; cached: boolean; model3dUrl?: string }> {
  // 1. Kiểm tra cache dựa trên SHA256 của ảnh đầu vào
  const fileHash = computeFileHash(imagePath);
  if (modelCache.has(fileHash)) {
    const cached = modelCache.get(fileHash)!;
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
    return { jobId: `cached_${fileHash.substring(0, 8)}`, cached: true, model3dUrl: cached.model3dUrl };
  }

  // 2. Tạo Job ID mới và đánh dấu trạng thái processing
  const jobId = `job_3d_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  await ArtifactModel.findByIdAndUpdate(artifactId, {
    processingStatus: 'processing',
    processingError: ''
  });

  const job: IQueueJob = {
    jobId,
    artifactId,
    imagePath,
    depthScale,
    resolution,
    status: 'pending',
    createdAt: Date.now()
  };

  jobQueue.push(job);
  console.log(`[3D Queue] Đã đưa tác vụ ${jobId} vào hàng đợi (Tổng đang chờ: ${jobQueue.length})`);

  // Kích hoạt luồng xử lý nền
  processNextJob();

  return { jobId, cached: false };
}

/**
 * Xử lý tuần tự các tác vụ trong hàng đợi nền (FIFO)
 */
async function processNextJob() {
  if (isProcessingQueue) return;
  const job = jobQueue.find(j => j.status === 'pending');
  if (!job) return;

  isProcessingQueue = true;
  job.status = 'processing';

  const outFilename = `model_3d_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.glb`;
  const outGlbPath = path.join(MODELS_3D_DIR, outFilename);
  const model3dUrl = `/uploads/artifacts/models_3d/${outFilename}`;

  console.log(`[3D Queue] Bắt đầu xử lý Job ${job.jobId} cho hiện vật ${job.artifactId}...`);

  const args = [
    ARTIFACT_SCRIPT,
    '--image', job.imagePath,
    '--output', outGlbPath,
    '--depth-scale', String(job.depthScale),
    '--resolution', String(job.resolution)
  ];

  const py = spawn(PYTHON_PATH, args);
  let stdoutData = '';
  let stderrData = '';

  py.stdout.on('data', (d) => { stdoutData += d.toString(); });
  py.stderr.on('data', (d) => {
    stderrData += d.toString();
    console.log(`[Python 3D Worker Log]: ${d.toString().trim()}`);
  });

  py.on('close', async (code) => {
    isProcessingQueue = false;

    if (code === 0 && fs.existsSync(outGlbPath)) {
      let parsed: any = {};
      try {
        parsed = JSON.parse(stdoutData.trim());
      } catch {
        parsed = {};
      }

      const fileHash = computeFileHash(job.imagePath);
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

      // Lưu vào Cache
      modelCache.set(fileHash, { model3dUrl, metadata });

      // Cập nhật MongoDB
      await ArtifactModel.findByIdAndUpdate(job.artifactId, {
        model3dUrl,
        processingStatus: 'completed',
        processingError: '',
        modelMetadata: metadata
      });

      job.status = 'completed';
      console.log(`[3D Queue] Hoàn tất Job ${job.jobId} xuất sắc! Model lưu tại: ${model3dUrl}`);
    } else {
      const errMsg = stderrData || stdoutData || 'Không thể tạo file mô hình 3D';
      job.status = 'failed';
      job.error = errMsg;

      await ArtifactModel.findByIdAndUpdate(job.artifactId, {
        processingStatus: 'failed',
        processingError: errMsg
      });
      console.error(`[3D Queue] Thất bại Job ${job.jobId}:`, errMsg);
    }

    // Tiếp tục xử lý job kế tiếp nếu còn trong hàng đợi
    setTimeout(processNextJob, 500);
  });

  py.on('error', async (err) => {
    isProcessingQueue = false;
    job.status = 'failed';
    job.error = err.message;
    await ArtifactModel.findByIdAndUpdate(job.artifactId, {
      processingStatus: 'failed',
      processingError: err.message
    });
    console.error(`[3D Queue] Lỗi tiến trình Python:`, err.message);
    setTimeout(processNextJob, 500);
  });
}

/**
 * Tra cứu trạng thái tác vụ
 */
export function getJobStatus(jobId: string) {
  return jobQueue.find(j => j.jobId === jobId);
}
