import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { cacheGet, cacheSet } from './redis.js';

const REDIS_3DGS_URL_KEY = 'system:3dgs:tunnel_url';
const DEFAULT_3DGS_URL = 'https://fireplace-end-specials-caps.trycloudflare.com';

const SPLATS_DIR = path.join(process.cwd(), 'public', 'uploads', 'splats');
if (!fs.existsSync(SPLATS_DIR)) {
  fs.mkdirSync(SPLATS_DIR, { recursive: true });
}

export interface GaussianWorkerPingResult {
  ok: boolean;
  status: string;
  url: string;
  gpu?: string;
  message?: string;
  latencyMs?: number;
}

/**
 * Lấy URL Cloudflare Tunnel của Colab 3DGS Worker
 */
export async function getGaussianSplatUrl(): Promise<string> {
  try {
    const cachedUrl = await cacheGet<string>(REDIS_3DGS_URL_KEY);
    if (cachedUrl && typeof cachedUrl === 'string' && cachedUrl.trim().length > 0) {
      return cachedUrl.trim().replace(/\/+$/, '');
    }
  } catch (err: any) {
    console.warn('[3DGS Service] Cảnh báo đọc URL từ Redis:', err.message);
  }

  const envUrl = process.env.COLAB_3DGS_URL || DEFAULT_3DGS_URL;
  return envUrl.trim().replace(/\/+$/, '');
}

/**
 * Cập nhật động URL Cloudflare Quick Tunnel mới cho 3DGS Worker
 */
export async function setGaussianSplatUrl(rawUrl: string): Promise<string> {
  const cleanUrl = (rawUrl || '').trim().replace(/\/+$/, '');
  if (!cleanUrl) {
    await cacheSet(REDIS_3DGS_URL_KEY, '', 86400 * 30);
    return '';
  }

  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    throw new Error('URL phải bắt đầu bằng http:// hoặc https:// (Ví dụ: https://xyz.trycloudflare.com)');
  }

  await cacheSet(REDIS_3DGS_URL_KEY, cleanUrl, 86400 * 30);
  console.log(`[3DGS Service] Đã cập nhật 3DGS Tunnel URL mới: ${cleanUrl}`);
  return cleanUrl;
}

/**
 * Kiểm tra kết nối tới Colab 3DGS Worker (Health Check)
 */
export async function pingGaussianSplatWorker(overrideUrl?: string): Promise<GaussianWorkerPingResult> {
  const targetUrl = overrideUrl ? overrideUrl.trim().replace(/\/+$/, '') : await getGaussianSplatUrl();
  if (!targetUrl) {
    return {
      ok: false,
      status: 'unconfigured',
      url: '',
      message: 'Chưa cấu hình URL Cloudflare cho 3DGS Worker'
    };
  }

  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${targetUrl}/`, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const latencyMs = Date.now() - startTime;
    if (res.ok) {
      const data = await res.json().catch(() => ({})) as any;
      return {
        ok: true,
        status: data.status || 'online',
        url: targetUrl,
        gpu: data.gpu || 'T4 GPU',
        latencyMs
      };
    } else {
      return {
        ok: false,
        status: 'error_response',
        url: targetUrl,
        message: `HTTP ${res.status}: ${res.statusText}`,
        latencyMs
      };
    }
  } catch (err: any) {
    return {
      ok: false,
      status: 'offline',
      url: targetUrl,
      message: err.name === 'AbortError' ? 'Hết thời gian chờ kết nối (Timeout 10s)' : err.message,
      latencyMs: Date.now() - startTime
    };
  }
}

/**
 * Đóng gói danh sách ảnh và gửi sang Colab để tái tạo 3D Gaussian Splatting
 */
export async function reconstructRoomSplat(
  files: Express.Multer.File[],
  sessionName = 'room'
): Promise<{ success: boolean; plyUrl: string; filename: string; sizeBytes: number }> {
  if (!files || files.length < 3) {
    throw new Error('Cần tối thiểu 3 ảnh để tái tạo không gian 3D (Khuyến nghị 20 - 30 ảnh)');
  }

  const workerUrl = await getGaussianSplatUrl();
  if (!workerUrl) {
    throw new Error('Chưa thiết lập URL 3DGS Colab Worker');
  }

  const timestamp = Date.now();
  const sessionId = `${sessionName}_${timestamp}`;
  console.log(`[3DGS Service] Bắt đầu đóng gói ${files.length} ảnh cho phiên ${sessionId}...`);

  // 1. Nén danh sách ảnh thành file ZIP trong bộ nhớ
  const createArchiver: any = archiver;
  const archive = createArchiver('zip', { zlib: { level: 6 } });
  const chunks: Buffer[] = [];

  archive.on('data', (chunk: Buffer) => chunks.push(chunk));
  const zipPromise = new Promise<Buffer>((resolve, reject) => {
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);
  });

  files.forEach((file, idx) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `frame_${String(idx + 1).padStart(3, '0')}${ext}`;
    archive.append(file.buffer, { name: filename });
  });

  await archive.finalize();
  const zipBuffer = await zipPromise;
  console.log(`[3DGS Service] Đã nén ZIP (${(zipBuffer.length / 1024 / 1024).toFixed(2)} MB). Đang gửi sang: ${workerUrl}/reconstruct...`);

  // 2. Gửi request multipart sang Colab Worker
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(zipBuffer)], { type: 'application/zip' });
  formData.append('file', blob, `${sessionId}.zip`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 phút timeout

  try {
    const response = await fetch(`${workerUrl}/reconstruct`, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Worker báo lỗi HTTP ${response.status}: ${errText.slice(0, 300)}`);
    }

    const plyBuffer = Buffer.from(await response.arrayBuffer());
    if (plyBuffer.length < 1000) {
      throw new Error('File PLY trả về không hợp lệ hoặc kích thước quá nhỏ');
    }

    // 3. Lưu file .ply vào static storage public/uploads/splats/
    const outputFilename = `splat_${sessionId}.ply`;
    const outputPath = path.join(SPLATS_DIR, outputFilename);
    await fs.promises.writeFile(outputPath, plyBuffer);

    console.log(`[3DGS Service] Đã lưu thành công 3DGS PLY: ${outputPath} (${(plyBuffer.length / 1024 / 1024).toFixed(2)} MB)`);

    return {
      success: true,
      plyUrl: `/uploads/splats/${outputFilename}`,
      filename: outputFilename,
      sizeBytes: plyBuffer.length
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Quá thời gian xử lý (Timeout 10 phút) từ Colab GPU');
    }
    throw err;
  }
}
