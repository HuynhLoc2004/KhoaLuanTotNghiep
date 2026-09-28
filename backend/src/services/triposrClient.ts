import fs from 'fs';
import path from 'path';
import { cacheGet, cacheSet } from './redis.js';

const REDIS_TRIPOSR_URL_KEY = 'system:triposr:tunnel_url';

export interface TripoSRPingResult {
  ok: boolean;
  status: string;
  url: string;
  device?: string;
  model?: string;
  message?: string;
  latencyMs?: number;
}

export interface TripoSRGenerateOptions {
  imagePath: string;
  jobId: string;
  foregroundRatio?: number;
  mcResolution?: number;
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
 * Cập nhật động URL Cloudflare Quick Tunnel mới từ Google Colab (Lưu vào Redis)
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
 * Kiểm tra kết nối tới Colab AI Worker (Health check)
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
        'User-Agent': 'Museum-Backend-VPS/1.0'
      },
      signal: AbortSignal.timeout(6000)
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      return {
        ok: false,
        status: `http_${response.status}`,
        url: targetUrl,
        latencyMs,
        message: `Máy chủ Colab phản hồi mã lỗi HTTP ${response.status}`
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
      device: body.device || 'GPU T4',
      model: body.model || 'VAST-AI-Research/TripoSR',
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
 * Gửi ảnh từ VPS sang Colab AI Worker để sinh mô hình 3D .GLB
 * Nhận stream nhị phân (ArrayBuffer) và trả về Buffer
 */
export async function generate3DViaTripoSR(
  options: TripoSRGenerateOptions
): Promise<{ glbBuffer: Buffer; format: string; sizeBytes: number; rawMetadata?: any }> {
  const { imagePath, jobId, foregroundRatio = 0.85, mcResolution = 256 } = options;

  const targetUrl = await getTripoSRUrl();
  if (!targetUrl) {
    throw new Error('Chưa cấu hình Endpoint Colab TripoSR Tunnel. Vui lòng cập nhật URL trycloudflare.com vào hệ thống.');
  }

  if (!fs.existsSync(imagePath)) {
    throw new Error(`Không tìm thấy file ảnh gốc trên VPS: ${imagePath}`);
  }

  console.log(`[TripoSR Client] Chuẩn bị gửi ảnh ${path.basename(imagePath)} (Job: ${jobId}) sang Colab: ${targetUrl}/generate-3d...`);

  const fileBuffer = fs.readFileSync(imagePath);
  const ext = path.extname(imagePath).toLowerCase() || '.png';
  const mimeType = ext === '.png' ? 'image/png' : (ext === '.webp' ? 'image/webp' : 'image/jpeg');

  const formData = new FormData();
  const fileBlob = new Blob([fileBuffer], { type: mimeType });
  formData.append('file', fileBlob, path.basename(imagePath));
  formData.append('job_id', jobId);
  formData.append('foreground_ratio', String(foregroundRatio));
  formData.append('mc_resolution', String(mcResolution));

  const startTime = Date.now();
  const generateEndpoint = `${targetUrl}/generate-3d`;

  // Timeout tối đa 3 phút (180s) cho tác vụ suy luận AI trên GPU T4
  const response = await fetch(generateEndpoint, {
    method: 'POST',
    body: formData,
    signal: AbortSignal.timeout(180000)
  });

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

  const arrayBuffer = await response.arrayBuffer();
  const glbBuffer = Buffer.from(arrayBuffer);

  if (glbBuffer.length < 50) {
    throw new Error('Dữ liệu mô hình 3D trả về từ Colab bị rỗng hoặc không đúng định dạng');
  }

  console.log(`[TripoSR Client] Hoàn tất nhận mô hình .GLB (${(glbBuffer.length / 1024 / 1024).toFixed(2)} MB) sau ${durationSec}s từ Colab!`);

  return {
    glbBuffer,
    format: 'glb',
    sizeBytes: glbBuffer.length
  };
}
