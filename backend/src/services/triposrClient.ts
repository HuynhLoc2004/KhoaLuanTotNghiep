import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { redisClient, cacheGet, cacheSet } from './redis.js';

const REDIS_TRIPOSR_URL_KEY = 'system:triposr:tunnel_url';
export const TRIPOSR_API_KEY = process.env.TRIPOSR_API_KEY || 'triposr_museum_secret_key_2026';

// Bộ nhớ đệm khóa đồng thời cục bộ dự phòng (Fallback Concurrency Map)
const memoryUserLocks = new Map<string, number>();

export interface TripoSRPingResult {
  ok: boolean;
  status: string;
  url: string;
  device?: string;
  model?: string;
  message?: string;
  latencyMs?: number;
}

export interface TripoSRStreamOptions {
  imageUrl?: string;
  imagePath?: string;
  destFilePath: string;
  jobId: string;
  foregroundRatio?: number;
  mcResolution?: number;
}

/**
 * 1. CƠ CHẾ KHÓA ĐỒNG THỜI (CONCURRENCY MUTEX LOCK / ANTI-SPAM)
 * Giới hạn: Mỗi người dùng chỉ được chạy tối đa 1 tác vụ 3D tại một thời điểm.
 * Khóa tự động hết hạn sau ttlSeconds (180s) tránh kẹt khóa vĩnh viễn nếu mạng rớt.
 */
export async function acquireUser3DLock(userId: string, ttlSeconds = 180): Promise<boolean> {
  const cleanId = (userId || 'anonymous').trim();
  const lockKey = `lock:3d_user:${cleanId}`;

  // 1. Thử khóa trên Redis (NX: Chỉ set nếu chưa tồn tại)
  if (redisClient) {
    try {
      const result = await redisClient.set(lockKey, '1', 'EX', ttlSeconds, 'NX');
      return result === 'OK';
    } catch (err: any) {
      console.warn('[3D Lock] Cảnh báo Redis Mutex Lock:', err.message);
    }
  }

  // 2. Fallback In-memory Map trên RAM VPS
  const now = Date.now();
  if (memoryUserLocks.has(lockKey)) {
    const expiresAt = memoryUserLocks.get(lockKey)!;
    if (now < expiresAt) {
      return false; // Đang có tác vụ đang chạy
    }
  }
  memoryUserLocks.set(lockKey, now + ttlSeconds * 1000);
  return true;
}

/**
 * Giải phóng khóa đồng thời cho người dùng khi tác vụ hoàn thành hoặc lỗi
 */
export async function releaseUser3DLock(userId: string): Promise<void> {
  const cleanId = (userId || 'anonymous').trim();
  const lockKey = `lock:3d_user:${cleanId}`;

  memoryUserLocks.delete(lockKey);
  if (redisClient) {
    try {
      await redisClient.del(lockKey);
    } catch {}
  }
}

/**
 * Lấy URL Cloudflare Quick Tunnel của Colab TripoSR
 * Thứ tự ưu tiên: Redis cache cấu hình động -> Biến môi trường .env
 */
export async function getTripoSRUrl(): Promise<string> {
  try {
    const cachedUrl = await cacheGet<string>(REDIS_TRIPOSR_URL_KEY);
    if (cachedUrl && typeof cachedUrl === 'string' && cachedUrl.trim().length > 0) {
      return cachedUrl.trim().replace(/\/+$/, '');
    }
  } catch (err: any) {
    console.warn('[TripoSR Client] Cảnh báo đọc URL từ Redis:', err.message);
  }

  const envUrl = process.env.TRIPOSR_API_URL || process.env.COLAB_TUNNEL_URL || '';
  return envUrl.trim().replace(/\/+$/, '');
}

/**
 * Cập nhật động URL Cloudflare Quick Tunnel mới từ Google Colab
 */
export async function setTripoSRUrl(rawUrl: string): Promise<string> {
  const cleanUrl = (rawUrl || '').trim().replace(/\/+$/, '');
  if (!cleanUrl) {
    await cacheSet(REDIS_TRIPOSR_URL_KEY, '', 86400 * 30);
    return '';
  }

  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    throw new Error('URL phải bắt đầu bằng http:// hoặc https:// (Ví dụ: https://xyz.trycloudflare.com)');
  }

  await cacheSet(REDIS_TRIPOSR_URL_KEY, cleanUrl, 86400 * 30);
  console.log(`[TripoSR Client] Đã cập nhật Colab Tunnel URL: ${cleanUrl}`);
  return cleanUrl;
}

/**
 * Kiểm tra kết nối tới Colab AI Worker (Health check kèm X-API-Key)
 */
export async function pingTripoSR(overrideUrl?: string): Promise<TripoSRPingResult> {
  const targetUrl = overrideUrl ? overrideUrl.trim().replace(/\/+$/, '') : await getTripoSRUrl();
  if (!targetUrl) {
    return {
      ok: false,
      status: 'unconfigured',
      url: '',
      message: 'Chưa cấu hình Endpoint Colab TripoSR Cloudflare Tunnel'
    };
  }

  const startTime = Date.now();
  try {
    const healthUrl = `${targetUrl}/health`;
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-Key': TRIPOSR_API_KEY,
        'User-Agent': 'Museum-Backend-VPS/1.0'
      },
      signal: AbortSignal.timeout(6000)
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const msg = response.status === 401
        ? 'Sai mã X-API-Key bảo mật giữa VPS và Google Colab'
        : `Máy chủ Colab phản hồi mã lỗi HTTP ${response.status}`;
      return {
        ok: false,
        status: `http_${response.status}`,
        url: targetUrl,
        latencyMs,
        message: msg
      };
    }

    let body: any = {};
    try {
      body = await response.json();
    } catch {
      body = {};
    }

    return {
      ok: true,
      status: 'ready',
      url: targetUrl,
      device: body.device || 'GPU Tesla T4',
      model: body.model || 'TripoSR',
      latencyMs,
      message: body.message || 'Kết nối GPU Colab thành công, AI Worker sẵn sàng nhận lệnh'
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      ok: false,
      status: 'unreachable',
      url: targetUrl,
      latencyMs,
      message: err.name === 'TimeoutError'
        ? 'Kết nối quá hạn (Timeout > 6s). Kiểm tra xem Google Colab hoặc Cloudflare Tunnel có đang bật không.'
        : `Không thể kết nối tới Colab: ${err.message}`
    };
  }
}

/**
 * 2. CHUYỂN TIẾP TÁC VỤ VÀ STREAM FILE NHỊ PHÂN VỀ ĐĨA CỤC BỘ (ZERO RAM BUFFERING)
 * Nhận response stream từ Colab và pipe thẳng vào fileStream trên đĩa VPS.
 * VPS RAM chỉ tốn ~64KB buffer chunk của TCP socket, tuyệt đối không giữ cả file GLB trong RAM!
 */
export async function stream3DFromColabToFile(
  options: TripoSRStreamOptions
): Promise<{ sizeBytes: number; format: string }> {
  const { imageUrl, imagePath, destFilePath, jobId, foregroundRatio = 0.85, mcResolution = 256 } = options;

  const targetUrl = await getTripoSRUrl();
  if (!targetUrl) {
    throw new Error('Chưa cấu hình Endpoint Colab TripoSR Tunnel. Vui lòng cập nhật URL trycloudflare.com vào hệ thống.');
  }

  const startTime = Date.now();
  let response: Response;

  // Header bảo mật bắt buộc kèm X-API-Key
  const headers: Record<string, string> = {
    'X-API-Key': TRIPOSR_API_KEY,
    'User-Agent': 'Museum-Backend-VPS/1.0'
  };

  // Ưu tiên truyền JSON nhẹ { image_url, job_id } nếu có Cloudinary URL
  if (imageUrl && imageUrl.startsWith('http')) {
    console.log(`[TripoSR Stream] Gửi JSON Image URL (${imageUrl}) sang Colab: ${targetUrl}/render...`);
    headers['Content-Type'] = 'application/json';

    response = await fetch(`${targetUrl}/render`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        image_url: imageUrl,
        job_id: jobId,
        foreground_ratio: foregroundRatio,
        mc_resolution: mcResolution
      }),
      signal: AbortSignal.timeout(180000)
    });
  } else if (imagePath && fs.existsSync(imagePath)) {
    // Nếu là file cục bộ, gửi FormData
    console.log(`[TripoSR Stream] Gửi FormData ảnh (${path.basename(imagePath)}) sang Colab: ${targetUrl}/generate-3d...`);
    const fileBuffer = fs.readFileSync(imagePath);
    const ext = path.extname(imagePath).toLowerCase() || '.png';
    const mimeType = ext === '.png' ? 'image/png' : (ext === '.webp' ? 'image/webp' : 'image/jpeg');

    const formData = new FormData();
    const fileBlob = new Blob([fileBuffer], { type: mimeType });
    formData.append('file', fileBlob, path.basename(imagePath));
    formData.append('job_id', jobId);
    formData.append('foreground_ratio', String(foregroundRatio));
    formData.append('mc_resolution', String(mcResolution));

    response = await fetch(`${targetUrl}/generate-3d`, {
      method: 'POST',
      headers,
      body: formData,
      signal: AbortSignal.timeout(180000)
    });
  } else {
    throw new Error('Không có hình ảnh hợp lệ (cần URL hoặc file path) để gửi sang AI Worker');
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
    } catch {
      errorDetail = await response.text();
    }
    throw new Error(`Colab AI Worker phản hồi lỗi HTTP ${response.status} (${durationSec}s): ${errorDetail}`);
  }

  if (!response.body) {
    throw new Error('Phản hồi từ Colab không chứa dữ liệu body stream');
  }

  // Đảm bảo thư mục đích tồn tại
  const destDir = path.dirname(destFilePath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // STREAM TRỰC TIẾP TỪ NETWORK VÀO FILE Ổ CỨNG -> ZERO RAM USAGE TRÊN VPS!
  const fileWriteStream = fs.createWriteStream(destFilePath);
  const nodeReadable = Readable.fromWeb(response.body as any);
  await pipeline(nodeReadable, fileWriteStream);

  const fileStats = fs.statSync(destFilePath);
  if (fileStats.size < 50) {
    try { fs.unlinkSync(destFilePath); } catch {}
    throw new Error('File GLB stream từ Colab bị rỗng hoặc không đúng định dạng');
  }

  console.log(`[TripoSR Stream] Stream thành công .GLB (${(fileStats.size / 1024 / 1024).toFixed(2)} MB) vào đĩa sau ${durationSec}s!`);

  return {
    sizeBytes: fileStats.size,
    format: 'glb'
  };
}
