/**
 * trellisClient.ts - TRELLIS 3D Generation Client
 * =================================================
 * Thay the hoàn toàn triposrClient.ts.
 * Gọi Python script trellis_service.py (chạy gradio_client -> HuggingFace TRELLIS Space)
 * và trả về kết quả file .glb.
 *
 * Giữ nguyên interface acquireUser3DLock / releaseUser3DLock
 * để artifact3dQueue.ts không cần sửa nhiều.
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { redisClient, cacheGet, cacheSet } from './redis.js';

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------
const PYTHON_PATH = process.env.PYTHON_PATH || (
  process.platform === 'win32'
    ? 'C:\\Users\\HUYNH TAN LOC\\AppData\\Local\\Programs\\Python\\Python312\\python.exe'
    : 'python3'
);

const TRELLIS_SCRIPT = (() => {
  const candidates = [
    path.join(process.cwd(), 'stitching_worker', 'trellis_service.py'),
    path.join(process.cwd(), '..', 'stitching_worker', 'trellis_service.py'),
  ];
  return candidates.find(p => fs.existsSync(p)) || candidates[0];
})();

/** Timeout tối đa chờ TRELLIS (ms) - 5 phút vì HF Spaces có thể warm-up lâu */
const TRELLIS_TIMEOUT_MS = parseInt(process.env.TRELLIS_TIMEOUT_MS || '300000', 10);

/**
 * Lấy HuggingFace Access Token từ biến môi trường ACCCESS_TOKEN_HUGE_SPACE.
 * Token chỉ có quyền read (đủ để gọi public Space API).
 */
function getHFToken(): string {
  return (
    process.env.ACCCESS_TOKEN_HUGE_SPACE ||
    process.env.HF_TOKEN ||
    ''
  );
}

// Bộ nhớ đệm khóa đồng thời cục bộ dự phòng
const memoryUserLocks = new Map<string, number>();

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------
export interface TrellisPingResult {
  ok: boolean;
  status: 'ready' | 'unconfigured' | 'unreachable';
  message: string;
  engine?: string;
}

export interface TrellisGenerateOptions {
  imagePath: string;
  destFilePath: string;
  jobId: string;
}

export interface TrellisGenerateResult {
  sizeBytes: number;
  format: string;
  generationTimeSeconds: number;
  engine: string;
}

// ---------------------------------------------------------------------------
// CONCURRENCY LOCK (giống triposrClient để backward compat)
// ---------------------------------------------------------------------------
export async function acquireUser3DLock(userId: string, ttlSeconds = 300): Promise<boolean> {
  const cleanId = (userId || 'anonymous').trim();
  const lockKey = `lock:3d_user:${cleanId}`;

  if (redisClient) {
    try {
      const result = await (redisClient as any).set(lockKey, '1', 'EX', ttlSeconds, 'NX');
      return result === 'OK';
    } catch (err: any) {
      console.warn('[TRELLIS Lock] Redis Mutex Lock warning:', err.message);
    }
  }

  const now = Date.now();
  if (memoryUserLocks.has(lockKey)) {
    const expiresAt = memoryUserLocks.get(lockKey)!;
    if (now < expiresAt) return false;
  }
  memoryUserLocks.set(lockKey, now + ttlSeconds * 1000);
  return true;
}

export async function releaseUser3DLock(userId: string): Promise<void> {
  const cleanId = (userId || 'anonymous').trim();
  const lockKey = `lock:3d_user:${cleanId}`;
  memoryUserLocks.delete(lockKey);
  if (redisClient) {
    try { await (redisClient as any).del(lockKey); } catch {}
  }
}

// ---------------------------------------------------------------------------
// PING / STATUS CHECK
// ---------------------------------------------------------------------------
export async function pingTrellis(): Promise<TrellisPingResult> {
  if (!fs.existsSync(TRELLIS_SCRIPT)) {
    return {
      ok: false,
      status: 'unconfigured',
      message: `Không tìm thấy script trellis_service.py tại: ${TRELLIS_SCRIPT}`
    };
  }

  return {
    ok: true,
    status: 'ready',
    engine: 'TRELLIS via HuggingFace Spaces (gradio_client)',
    message: 'Script TRELLIS sẵn sàng. Sẽ kết nối HuggingFace khi nhận request đầu tiên.'
  };
}

// ---------------------------------------------------------------------------
// CORE: GỌI PYTHON SCRIPT VÀ LẤY KẾT QUẢ GLB
// ---------------------------------------------------------------------------
export async function generate3DWithTrellis(
  options: TrellisGenerateOptions
): Promise<TrellisGenerateResult> {
  const { imagePath, destFilePath, jobId } = options;

  if (!fs.existsSync(TRELLIS_SCRIPT)) {
    throw new Error(`Không tìm thấy trellis_service.py tại: ${TRELLIS_SCRIPT}. Vui lòng kiểm tra cấu hình.`);
  }

  if (!fs.existsSync(imagePath)) {
    throw new Error(`File ảnh đầu vào không tồn tại: ${imagePath}`);
  }

  console.log(`[TRELLIS Client] Bắt đầu Job ${jobId} | ảnh: ${path.basename(imagePath)} | script: ${TRELLIS_SCRIPT}`);

  return new Promise<TrellisGenerateResult>((resolve, reject) => {
    const env = {
      ...process.env,
      // Truyền HuggingFace Access Token (read-only) từ biến ACCCESS_TOKEN_HUGE_SPACE
      HF_TOKEN: getHFToken(),
      TRELLIS_TIMEOUT: String(Math.floor(TRELLIS_TIMEOUT_MS / 1000)),
    };

    const args = [
      TRELLIS_SCRIPT,
      '--image', imagePath,
      '--output', destFilePath,
    ];

    const py = spawn(PYTHON_PATH, args, { env });

    let stdoutData = '';
    let stderrData = '';

    py.stdout.on('data', (d: Buffer) => { stdoutData += d.toString(); });
    py.stderr.on('data', (d: Buffer) => {
      const line = d.toString().trim();
      stderrData += line + '\n';
      // In log stderr của Python ra console Node.js (các dòng [TRELLIS Service] ...)
      console.log(`  [py-trellis] ${line}`);
    });

    // Timeout bảo vệ - kill process nếu chạy quá lâu
    const killer = setTimeout(() => {
      py.kill('SIGTERM');
      reject(new Error(`TRELLIS timeout sau ${TRELLIS_TIMEOUT_MS / 1000}s. Space HuggingFace có thể đang quá tải.`));
    }, TRELLIS_TIMEOUT_MS + 30000); // +30s buffer

    py.on('close', async (code: number | null) => {
      clearTimeout(killer);

      let parsed: any = {};
      try {
        // Lấy dòng JSON cuối cùng của stdout (tránh lẫn log khác)
        const lines = stdoutData.trim().split('\n').filter(l => l.trim().startsWith('{'));
        if (lines.length > 0) {
          parsed = JSON.parse(lines[lines.length - 1]);
        }
      } catch {
        parsed = {};
      }

      if (code === 0 && parsed.success && fs.existsSync(destFilePath)) {
        const fileStats = fs.statSync(destFilePath);
        if (fileStats.size < 100) {
          reject(new Error('File GLB từ TRELLIS quá nhỏ hoặc rỗng, có thể bị lỗi định dạng'));
          return;
        }

        console.log(`[TRELLIS Client] ✓ Job ${jobId} hoàn tất! Size: ${(fileStats.size/1024/1024).toFixed(2)}MB, Time: ${parsed.generation_time_seconds}s`);
        resolve({
          sizeBytes: fileStats.size,
          format: 'glb',
          generationTimeSeconds: parsed.generation_time_seconds || 0,
          engine: parsed.engine || 'TRELLIS (HuggingFace Spaces)',
        });
      } else {
        const errorMsg = parsed.error
          || stderrData.split('\n').filter(Boolean).slice(-3).join(' | ')
          || stdoutData
          || `Python exit code ${code}`;
        console.error(`[TRELLIS Client] ✗ Job ${jobId} thất bại:`, errorMsg);
        reject(new Error(errorMsg));
      }
    });

    py.on('error', (err: Error) => {
      clearTimeout(killer);
      reject(new Error(`Không thể khởi động Python: ${err.message}. Kiểm tra PYTHON_PATH trong .env`));
    });
  });
}

// ---------------------------------------------------------------------------
// BACKWARD COMPAT: Alias để artifact3dQueue.ts gọi được mà ít sửa nhất
// ---------------------------------------------------------------------------
/** Alias: dùng thay cho getTripoSRUrl() - luôn trả về 'trellis' để signal "đã cấu hình" */
export async function getTrellisStatus(): Promise<string> {
  return fs.existsSync(TRELLIS_SCRIPT) ? 'trellis_ready' : '';
}
