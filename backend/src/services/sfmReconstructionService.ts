import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { cacheGet, cacheSet } from './redis.js';

export interface ReconstructionJob {
  id: string;
  roomName: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  message: string;
  glbUrl?: string;
  objUrl?: string;
  fileSizeMB?: number;
  durationSeconds?: number;
  error?: string;
  createdAt: number;
  completedAt?: number;
  totalImages: number;
  engine?: string;
}

export interface ToolsStatus {
  colmap: boolean;
  openMVS: boolean;
  python: boolean;
  details: string;
}

const JOBS_MEMORY = new Map<string, ReconstructionJob>();

const ROOMS_3D_DIR = path.join(process.cwd(), 'public', 'uploads', 'rooms_3d');
const JOBS_TEMP_DIR = path.join(process.cwd(), 'public', 'uploads', 'reconstruction_jobs');

[ROOMS_3D_DIR, JOBS_TEMP_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const PYTHON_PATH = process.env.PYTHON_PATH || (process.platform === 'win32'
  ? 'C:\\Users\\HUYNH TAN LOC\\AppData\\Local\\Programs\\Python\\Python312\\python.exe'
  : 'python3');

const PIPELINE_SCRIPT = (() => {
  const candidates = [
    path.join(process.cwd(), 'stitching_worker', 'reconstruction_pipeline.py'),
    path.join(process.cwd(), '..', 'stitching_worker', 'reconstruction_pipeline.py'),
    '/app/stitching_worker/reconstruction_pipeline.py'
  ];
  return candidates.find((p) => fs.existsSync(p)) || candidates[0];
})();

/**
 * Kiểm tra trạng thái các công cụ học thuật COLMAP & OpenMVS
 */
export async function checkToolsStatus(): Promise<ToolsStatus> {
  let hasColmap = false;
  let hasOpenMVS = false;

  try {
    const colmapProc = spawn('colmap', ['-h']);
    await new Promise((resolve) => {
      colmapProc.on('error', () => resolve(false));
      colmapProc.on('close', (code) => {
        hasColmap = code === 0 || code === 1;
        resolve(true);
      });
    });
  } catch {}

  try {
    const mvsProc = spawn('InterfaceCOLMAP', ['-h']);
    await new Promise((resolve) => {
      mvsProc.on('error', () => resolve(false));
      mvsProc.on('close', (code) => {
        hasOpenMVS = code === 0 || code === 1;
        resolve(true);
      });
    });
  } catch {}

  let details = '';
  if (hasColmap && hasOpenMVS) {
    details = 'Hệ thống đã cài đặt đầy đủ bộ đôi học thuật COLMAP SfM & OpenMVS MVS.';
  } else if (hasColmap && !hasOpenMVS) {
    details = 'Đã có COLMAP SfM. OpenMVS chưa có (sẽ dùng bộ Mesh Converter của COLMAP).';
  } else {
    details = 'Chưa phát hiện COLMAP trên PATH máy chủ. Hãy cài bằng lệnh: sudo apt-get install -y colmap';
  }

  return {
    colmap: hasColmap,
    openMVS: hasOpenMVS,
    python: fs.existsSync(PYTHON_PATH) || true,
    details
  };
}

/**
 * Lấy trạng thái của một công việc tái tạo không gian 3D
 */
export async function getReconstructionJob(jobId: string): Promise<ReconstructionJob | null> {
  if (JOBS_MEMORY.has(jobId)) {
    return JOBS_MEMORY.get(jobId)!;
  }
  try {
    const fromCache = await cacheGet<ReconstructionJob>(`sfm_job:${jobId}`);
    if (fromCache) {
      JOBS_MEMORY.set(jobId, fromCache);
      return fromCache;
    }
  } catch {}
  return null;
}

/**
 * Lưu cập nhật trạng thái job vào RAM & Redis
 */
async function saveJobState(job: ReconstructionJob): Promise<void> {
  JOBS_MEMORY.set(job.id, job);
  try {
    await cacheSet(`sfm_job:${job.id}`, job, 86400 * 7); // Giữ 7 ngày
  } catch {}
}

/**
 * Khởi chạy tiến trình nền tái tạo không gian 3D bằng COLMAP + OpenMVS
 */
export async function startReconstructionJob(
  roomName: string,
  files: Express.Multer.File[],
  cameraModel = 'OPENCV_FISHEYE'
): Promise<ReconstructionJob> {
  const jobId = `sfm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const jobDir = path.join(JOBS_TEMP_DIR, jobId);
  const imagesDir = path.join(jobDir, 'images');

  fs.mkdirSync(imagesDir, { recursive: true });

  // Lưu các file ảnh tải lên vào thư mục job
  files.forEach((file, idx) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `frame_${String(idx + 1).padStart(4, '0')}${ext}`;
    fs.writeFileSync(path.join(imagesDir, filename), file.buffer);
  });

  const outputGlbName = `room_3d_${jobId}.glb`;
  const outputGlbPath = path.join(ROOMS_3D_DIR, outputGlbName);

  const job: ReconstructionJob = {
    id: jobId,
    roomName: roomName || 'Không Gian Bảo Tàng 3D',
    status: 'processing',
    progress: 5,
    currentStep: 'Khởi tạo',
    message: `Đã nạp ${files.length} ảnh góc rộng. Bắt đầu pipeline COLMAP SfM...`,
    createdAt: Date.now(),
    totalImages: files.length
  };

  await saveJobState(job);

  // Kích hoạt tiến trình Python nền
  const args = [
    PIPELINE_SCRIPT,
    '--images', imagesDir,
    '--output', outputGlbPath,
    '--camera-model', cameraModel,
    '--matcher', files.length > 15 ? 'sequential' : 'exhaustive'
  ];

  console.log(`[SfM Service] Khởi chạy Job ${jobId}: ${PYTHON_PATH} ${args.join(' ')}`);

  const pyProcess = spawn(PYTHON_PATH, args, {
    cwd: jobDir,
    env: { ...process.env, PYTHONUNBUFFERED: '1' }
  });

  pyProcess.stdout.on('data', async (data: Buffer) => {
    const text = data.toString('utf-8');
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.startsWith('PROGRESS_EVENT:')) {
        try {
          const event = JSON.parse(line.replace('PROGRESS_EVENT:', '').trim());
          job.progress = Math.min(99, event.percent || job.progress);
          job.currentStep = event.stepName || job.currentStep;
          job.message = event.message || job.message;
          await saveJobState(job);
        } catch {}
      } else if (line.startsWith('PIPELINE_RESULT:')) {
        try {
          const resData = JSON.parse(line.replace('PIPELINE_RESULT:', '').trim());
          if (resData.success) {
            job.status = 'completed';
            job.progress = 100;
            job.currentStep = 'Hoàn thành';
            job.message = 'Tái tạo không gian 3D SfM-MVS thành công!';
            job.glbUrl = `/uploads/rooms_3d/${outputGlbName}`;
            job.fileSizeMB = resData.sizeMB;
            job.durationSeconds = resData.durationSeconds;
            job.completedAt = Date.now();
            job.engine = resData.engine;
          } else {
            job.status = 'failed';
            job.error = resData.error || 'Pipeline báo lỗi thất bại';
          }
          await saveJobState(job);
        } catch {}
      }
    }
  });

  pyProcess.stderr.on('data', (data: Buffer) => {
    const errText = data.toString('utf-8');
    console.log(`[SfM Pipeline ${jobId}]: ${errText.trim()}`);
  });

  pyProcess.on('close', async (code: number) => {
    console.log(`[SfM Service] Job ${jobId} kết thúc với exit code: ${code}`);
    if (code === 0 && fs.existsSync(outputGlbPath)) {
      if (job.status !== 'completed') {
        job.status = 'completed';
        job.progress = 100;
        job.currentStep = 'Hoàn tất';
        job.glbUrl = `/uploads/rooms_3d/${outputGlbName}`;
        const st = fs.statSync(outputGlbPath);
        job.fileSizeMB = Math.round((st.size / 1024 / 1024) * 100) / 100;
        job.completedAt = Date.now();
        await saveJobState(job);
      }
    } else if (job.status !== 'completed') {
      job.status = 'failed';
      job.error = job.error || `Tiến trình kết thúc bất thường (mã lỗi ${code})`;
      await saveJobState(job);
    }

    // Dọn dẹp thư mục ảnh tạm sau khi xong để tiết kiệm đĩa
    try {
      if (fs.existsSync(jobDir)) {
        fs.rmSync(jobDir, { recursive: true, force: true });
      }
    } catch {}
  });

  return job;
}

/**
 * Liệt kê danh sách các mô hình không gian 3D (.glb) đã từng được tạo
 */
export async function listReconstructedModels(): Promise<Array<{ filename: string; url: string; sizeMB: string; createdAt: string }>> {
  const result: Array<{ filename: string; url: string; sizeMB: string; createdAt: string }> = [];
  try {
    if (!fs.existsSync(ROOMS_3D_DIR)) return result;
    const files = fs.readdirSync(ROOMS_3D_DIR);
    for (const f of files) {
      if (f.endsWith('.glb') || f.endsWith('.obj') || f.endsWith('.ply')) {
        const fullPath = path.join(ROOMS_3D_DIR, f);
        const stats = fs.statSync(fullPath);
        result.push({
          filename: f,
          url: `/uploads/rooms_3d/${f}`,
          sizeMB: (stats.size / 1024 / 1024).toFixed(2),
          createdAt: stats.mtime.toISOString()
        });
      }
    }
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('[SfM Service] Lỗi liệt kê models:', err);
  }
  return result;
}
