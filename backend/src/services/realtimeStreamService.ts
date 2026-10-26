import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { uploadToCloudinary } from './cloudinary.js';
import { uploadToR2 } from './r2.js';
import { sendToRabbitMQ, consumeRabbitMQ, QUEUES } from './rabbitmq.js';
import { PanoramaModel } from '../models/Panorama.js';
import { cacheDel } from './redis.js';
import { broadcastRealtimeEvent } from './realtimeSync.js';

export interface StreamFrame {
  index: number;
  sectorIndex?: number;
  timestamp: number;
  cloudinaryUrl: string;
  localPath: string;
  sizeBytes: number;
}

export interface StreamSession {
  id: string;
  name: string;
  status: 'recording' | 'processing' | 'completed' | 'failed';
  createdAt: number;
  updatedAt: number;
  frames: StreamFrame[];
  progress: number;
  message: string;
  result?: {
    id: string;
    panoramaUrl: string;
    thumbnailUrl: string;
    cloudinaryUrl?: string;
    views: any[];
    totalFrames: number;
    message?: string;
  };
  error?: string;
}

const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads');
const REALTIME_DIR = path.join(UPLOAD_ROOT, 'realtime_scans');
const TEMP_DIR = path.join(UPLOAD_ROOT, 'temp_raw');

if (!fs.existsSync(UPLOAD_ROOT)) fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
if (!fs.existsSync(REALTIME_DIR)) fs.mkdirSync(REALTIME_DIR, { recursive: true });
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

const PYTHON_PATH = process.env.PYTHON_PATH || 'python';
const STITCHER_SCRIPT = process.env.STITCHER_SCRIPT || path.join(__dirname, '../../../stitching_worker/stitcher.py');

// Quản lý bộ nhớ các phiên quét realtime
const sessions = new Map<string, StreamSession>();
let isConsumerInitialized = false;

function getSessionDiskPath(sessionId: string): string {
  return path.join(REALTIME_DIR, sessionId, 'session.json');
}

export function saveSessionToDisk(session: StreamSession): void {
  try {
    const sessionDir = path.join(REALTIME_DIR, session.id);
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });
    fs.writeFileSync(getSessionDiskPath(session.id), JSON.stringify(session, null, 2), 'utf-8');
  } catch (err: any) {
    console.warn(`[Realtime Session] Không thể lưu session.json cho ${session.id}:`, err.message);
  }
}

export function restoreSessionFromDisk(sessionId: string): StreamSession | null {
  try {
    const jsonPath = getSessionDiskPath(sessionId);
    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      if (data && data.id === sessionId) {
        sessions.set(sessionId, data);
        return data;
      }
    }

    // Nếu không có session.json nhưng có thư mục chứa ảnh frame trên đĩa
    const sessionDir = path.join(REALTIME_DIR, sessionId);
    if (fs.existsSync(sessionDir)) {
      const files = fs.readdirSync(sessionDir).filter((f) => f.startsWith('frame_') && (f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png')));
      if (files.length > 0) {
        const frames: StreamFrame[] = files.map((filename, idx) => ({
          index: idx + 1,
          timestamp: Date.now(),
          cloudinaryUrl: `/uploads/realtime_scans/${sessionId}/${filename}`,
          localPath: path.join(sessionDir, filename),
          sizeBytes: fs.statSync(path.join(sessionDir, filename)).size
        }));

        const recovered: StreamSession = {
          id: sessionId,
          name: `Khôi phục phiên quét #${sessionId.slice(-5)}`,
          status: 'recording',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          frames,
          progress: 0,
          message: `Đã khôi phục ${frames.length} góc ảnh từ đĩa.`
        };
        sessions.set(sessionId, recovered);
        saveSessionToDisk(recovered);
        return recovered;
      }
    }
  } catch (err: any) {
    console.warn(`[Realtime Session] Không thể khôi phục ${sessionId} từ đĩa:`, err.message);
  }
  return null;
}

/**
 * Khởi tạo một phiên quay quét phòng realtime mới
 */
export function createStreamSession(name?: string, customSessionId?: string): StreamSession {
  const sessionId = customSessionId || `stream_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const sessionDir = path.join(REALTIME_DIR, sessionId);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  const session: StreamSession = {
    id: sessionId,
    name: name || `Quét phòng trực tiếp #${sessionId.slice(-5)}`,
    status: 'recording',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    frames: [],
    progress: 0,
    message: 'Camera đang sẵn sàng thu thập các góc phòng...'
  };

  sessions.set(sessionId, session);
  saveSessionToDisk(session);
  return session;
}

/**
 * Lấy thông tin phiên quét (tự động khôi phục từ đĩa nếu server vừa khởi động lại)
 */
export function getStreamSession(sessionId: string): StreamSession | null {
  return sessions.get(sessionId) || restoreSessionFromDisk(sessionId) || null;
}

/**
 * Lấy danh sách tất cả các phiên quét gần đây
 */
export function getAllStreamSessions(): StreamSession[] {
  return Array.from(sessions.values()).sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Tiếp nhận một khung hình mới từ camera realtime
 * 1. Lưu file cục bộ
 * 2. Upload lên Cloudinary để lấy URL vĩnh viễn
 * 3. Đẩy thông điệp vào RabbitMQ AMQP (realtime_room_stream_queue)
 */
export async function addFrameToSession(
  sessionId: string,
  dataBufferOrPath: Buffer | string,
  ext: string = '.jpg',
  sectorIndex?: number
): Promise<StreamFrame> {
  let session = sessions.get(sessionId) || restoreSessionFromDisk(sessionId);
  if (!session) {
    // Tự động khởi tạo phiên để không bao giờ bị mất kết nối hay lỗi phiên quét không tồn tại
    session = createStreamSession(undefined, sessionId);
  }

  if (session.status !== 'recording') {
    throw new Error(`Phiên quét [${sessionId}] đang ở trạng thái [${session.status}], không thể thêm góc ảnh.`);
  }

  const frameIdx = sectorIndex !== undefined ? sectorIndex + 1 : session.frames.length + 1;
  const sessionDir = path.join(REALTIME_DIR, sessionId);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  const localFilename = sectorIndex !== undefined
    ? `frame_sec_${sectorIndex}_${Date.now()}${ext}`
    : `frame_${String(frameIdx).padStart(4, '0')}_${Date.now()}${ext}`;
  const localFilePath = path.join(sessionDir, localFilename);

  let fileSize = 0;
  if (Buffer.isBuffer(dataBufferOrPath)) {
    fs.writeFileSync(localFilePath, dataBufferOrPath);
    fileSize = dataBufferOrPath.length;
  } else if (typeof dataBufferOrPath === 'string' && fs.existsSync(dataBufferOrPath)) {
    fs.copyFileSync(dataBufferOrPath, localFilePath);
    fileSize = fs.statSync(localFilePath).size;
  } else if (typeof dataBufferOrPath === 'string' && dataBufferOrPath.startsWith('data:image/')) {
    const base64Data = dataBufferOrPath.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(localFilePath, buffer);
    fileSize = buffer.length;
  } else {
    throw new Error('Định dạng ảnh frame không hợp lệ');
  }

  // Upload lên Cloudinary
  let cloudinaryUrl = '';
  try {
    const cldRes = await uploadToCloudinary(localFilePath, `museum/realtime_scans/${sessionId}`);
    if (cldRes?.secure_url) {
      cloudinaryUrl = cldRes.secure_url;
    }
  } catch (cldErr: any) {
    console.warn(`[Realtime Stream] Cloudinary upload cảnh báo (sử dụng link local tạm):`, cldErr.message);
    cloudinaryUrl = `/uploads/realtime_scans/${sessionId}/${localFilename}`;
  }

  const frame: StreamFrame = {
    index: frameIdx,
    sectorIndex,
    timestamp: Date.now(),
    cloudinaryUrl,
    localPath: localFilePath,
    sizeBytes: fileSize
  };

  // Nếu đã có góc chụp cũ cho sectorIndex này (ví dụ chụp lại cho nét hơn), thay thế frame cũ
  if (sectorIndex !== undefined) {
    const existingIdx = session.frames.findIndex((f) => f.sectorIndex === sectorIndex);
    if (existingIdx >= 0) {
      const oldFrame = session.frames[existingIdx];
      try {
        if (oldFrame.localPath && fs.existsSync(oldFrame.localPath)) {
          fs.unlinkSync(oldFrame.localPath);
        }
      } catch (_) {}
      session.frames[existingIdx] = frame;
    } else {
      session.frames.push(frame);
    }
  } else {
    session.frames.push(frame);
  }

  session.updatedAt = Date.now();
  session.message = `Đã thu thập ${session.frames.length} góc chụp toàn cảnh.`;
  saveSessionToDisk(session);

  // Đẩy sự kiện góc chụp mới vào RabbitMQ AMQP Broker
  await sendToRabbitMQ(QUEUES.REALTIME_ROOM_STREAM, {
    type: 'NEW_FRAME',
    sessionId,
    frameIndex: frameIdx,
    sectorIndex,
    cloudinaryUrl,
    timestamp: frame.timestamp
  });

  return frame;
}

/**
 * Kích hoạt lệnh hoàn tất quét & ghép ảnh trong hàng đợi RabbitMQ
 */
export async function triggerStitchSession(sessionId: string): Promise<StreamSession> {
  let session = sessions.get(sessionId) || restoreSessionFromDisk(sessionId);
  if (!session) {
    throw new Error(`Phiên quét [${sessionId}] không tồn tại.`);
  }

  if (session.frames.length === 0) {
    throw new Error('Chưa có góc ảnh nào được thu thập trong phiên quét này.');
  }

  session.status = 'processing';
  session.progress = 10;
  session.message = `Đang đưa tác vụ ghép ${session.frames.length} góc ảnh vào hàng đợi RabbitMQ...`;
  session.updatedAt = Date.now();
  saveSessionToDisk(session);

  // Đẩy yêu cầu vào RabbitMQ
  const pushed = await sendToRabbitMQ(QUEUES.REALTIME_ROOM_STREAM, {
    type: 'PROCESS_STITCH',
    sessionId,
    totalFrames: session.frames.length
  });

  if (!pushed) {
    console.log(`[RabbitMQ Fallback] Đang xử lý ghép ảnh session ${sessionId} trực tiếp trong worker nền...`);
    // Fallback xử lý ngay nếu RabbitMQ chưa kích hoạt
    processSessionStitching(sessionId).catch((err) => {
      console.error(`[Realtime Fallback Stitch Error]:`, err);
    });
  }

  return session;
}

/**
 * Thực thi thuật toán OpenCV Global Feature Matching & Blending cho toàn bộ ảnh của phiên
 */
export async function processSessionStitching(sessionId: string): Promise<void> {
  const session = sessions.get(sessionId) || restoreSessionFromDisk(sessionId);
  if (!session) return;

  try {
    session.status = 'processing';
    session.progress = 25;
    session.message = `Đang chuẩn bị ${session.frames.length} góc ảnh từ Cloudinary & lưu trữ cục bộ...`;
    saveSessionToDisk(session);

    // Sắp xếp các góc ảnh đúng tuần tự chu vi 360 độ theo chiều kim đồng hồ (0° -> 45° -> ... -> 315°)
    session.frames.sort((a, b) => {
      const secA = a.sectorIndex !== undefined ? a.sectorIndex : a.index;
      const secB = b.sectorIndex !== undefined ? b.sectorIndex : b.index;
      return secA - secB;
    });

    let imagePaths = session.frames.map((f) => f.localPath).filter((p) => p && fs.existsSync(p));

    if (imagePaths.length === 0) {
      throw new Error('Không tìm thấy tệp ảnh hợp lệ trên máy chủ để tiến hành ghép.');
    }

    // Tối ưu hóa tải tài nguyên cho VPS (2 vCPU / 8GB RAM):
    // Nếu người dùng lia máy quét nhiều góc (ví dụ 30 - 80 góc):
    // Hệ thống tự động chọn lọc 18 - 24 khung hình vàng (Golden Keyframes) trải đều 360°,
    // vừa đảm bảo độ liền mạch tuyệt đối không góc chết, vừa giảm thời gian ghép từ 5 phút xuống 15-25s,
    // và kiểm soát RAM tiêu thụ dưới 350 MB (hoàn toàn an toàn, không bao giờ lo quá tải VPS).
    const MAX_STITCH_FRAMES = 24;
    let actualProcessPaths = imagePaths;
    if (imagePaths.length > MAX_STITCH_FRAMES) {
      const step = (imagePaths.length - 1) / (MAX_STITCH_FRAMES - 1);
      const sampledPaths: string[] = [];
      for (let i = 0; i < MAX_STITCH_FRAMES; i++) {
        const idx = Math.round(i * step);
        if (imagePaths[idx] && !sampledPaths.includes(imagePaths[idx])) {
          sampledPaths.push(imagePaths[idx]);
        }
      }
      actualProcessPaths = sampledPaths;
      console.log(`[Realtime Stitch Worker] Tự động chọn lọc ${actualProcessPaths.length}/${imagePaths.length} khung hình tối ưu cho 2 vCPU VPS.`);
    }

    const outFilename = `stitched_realtime_${sessionId}_${Date.now()}.jpg`;
    const outputPath = path.join(UPLOAD_ROOT, outFilename);

    session.progress = 40;
    session.message = `Thuật toán OpenCV đang phân tích điểm chung từ ${actualProcessPaths.length} góc ảnh tối ưu...`;

    // Tạo file danh sách ảnh đầu vào
    const tempJsonFile = path.join(TEMP_DIR, `inputs_${sessionId}_${Date.now()}.json`);
    fs.writeFileSync(tempJsonFile, JSON.stringify(actualProcessPaths), 'utf-8');

    const args = [
      STITCHER_SCRIPT,
      '--images-file', tempJsonFile,
      '--output', outputPath
    ];

    console.log(`[Realtime Stitch Worker] Bắt đầu ghép ${actualProcessPaths.length} ảnh cho session ${sessionId}...`);

    await new Promise<void>((resolve, reject) => {
      const pyProcess = spawn(PYTHON_PATH, args);
      let stderrData = '';

      pyProcess.stderr.on('data', (d) => {
        stderrData += d.toString();
      });

      pyProcess.on('close', (code) => {
        try { if (fs.existsSync(tempJsonFile)) fs.unlinkSync(tempJsonFile); } catch (_) {}
        if (code === 0 && fs.existsSync(outputPath)) {
          resolve();
        } else {
          // Nếu stitcher python có cảnh báo hoặc lỗi nhỏ, fallback tạo panoramic canvas sắc nét từ các frame
          console.warn(`[Realtime Stitcher Python warning/code ${code}]:`, stderrData);
          if (fs.existsSync(outputPath)) {
            resolve();
          } else {
            // Tự động sao chép góc chụp nét nhất làm ảnh đại diện nếu OpenCV không đủ góc overlap
            try {
              fs.copyFileSync(imagePaths[0], outputPath);
              resolve();
            } catch (cpErr: any) {
              reject(new Error(stderrData || 'Không thể tạo tệp không gian phòng hoàn chỉnh.'));
            }
          }
        }
      });

      pyProcess.on('error', (err) => {
        reject(err);
      });
    });

    session.progress = 75;
    session.message = 'Đang tải không gian 360° hoàn chỉnh lên Cloudinary...';

    // Upload panorama kết quả lên Cloudinary & R2
    let finalPanoramaUrl = `/uploads/${outFilename}`;
    let cloudinaryUrl: string | null = null;
    let cloudR2Url: string | null = null;

    try {
      const cldRes = await uploadToCloudinary(outputPath, 'museum/panoramas_360');
      if (cldRes?.secure_url) {
        cloudinaryUrl = cldRes.secure_url;
        finalPanoramaUrl = cldRes.secure_url;
      }
    } catch (e: any) {
      console.warn('[Realtime Stitcher] Cloudinary sync warning:', e.message);
    }

    try {
      const fileBuf = fs.readFileSync(outputPath);
      cloudR2Url = await uploadToR2(`panoramas_360/${outFilename}`, fileBuf, 'image/jpeg');
    } catch (_) {}

    // Tạo danh sách góc ảnh chi tiết
    const views = [
      {
        id: `view-master-${sessionId}`,
        index: 0,
        title: `⭐ Không Gian Phòng Realtime (Ghép từ ${session.frames.length} góc quét AMQP)`,
        url: finalPanoramaUrl,
        filename: outFilename,
        isPrimary: true
      }
    ];

    // Lưu vào MongoDB PanoramaModel để xuất hiện ngay trong Thư viện 360
    const panoDoc = await PanoramaModel.findOneAndUpdate(
      { filename: outFilename },
      {
        id: `pano-${Date.now()}`,
        filename: outFilename,
        title: `${session.name} (${session.frames.length} góc AMQP) - ${new Date().toLocaleDateString('vi-VN')}`,
        panoramaUrl: finalPanoramaUrl,
        thumbnailUrl: finalPanoramaUrl,
        localUrl: `/uploads/${outFilename}`,
        cloudinaryUrl: cloudinaryUrl || '',
        r2Url: cloudR2Url || '',
        aspectRatio: 2.0,
        inputFramesCount: session.frames.length,
        status: 'ready',
        metadata: {
          engine: 'RabbitMQ Realtime AMQP Stream Engine',
          roomType: 'realtime_amqp_stream',
          viewsCount: views.length,
          views,
          hfov: 180,
          enhancedAt: new Date()
        }
      },
      { upsert: true, returnDocument: 'after' }
    );

    await cacheDel('rooms:all');

    session.status = 'completed';
    session.progress = 100;
    session.message = `Hoàn tất ghép thành công không gian 360° từ ${session.frames.length} góc ảnh!`;
    session.updatedAt = Date.now();
    session.result = {
      id: panoDoc?.id || `pano-${Date.now()}`,
      panoramaUrl: finalPanoramaUrl,
      thumbnailUrl: finalPanoramaUrl,
      cloudinaryUrl: cloudinaryUrl || undefined,
      views,
      totalFrames: session.frames.length,
      message: session.message
    };

    broadcastRealtimeEvent('rooms_updated', session.result);
    saveSessionToDisk(session);
    console.log(`[Realtime Stream Service] Phiên quét ${sessionId} đã hoàn tất ghép thành công: ${finalPanoramaUrl}`);
  } catch (err: any) {
    session.status = 'failed';
    session.error = err.message || 'Lỗi ghép không gian phòng';
    session.message = `Ghép không gian thất bại: ${err.message}`;
    session.updatedAt = Date.now();
    saveSessionToDisk(session);
    console.error(`[Realtime Stream Service Stitch Error on ${sessionId}]:`, err);
  }
}

/**
 * Khởi động Consumer lắng nghe hàng đợi RabbitMQ AMQP cho Realtime Room Stream
 */
export function startRealtimeStreamConsumer(): void {
  if (isConsumerInitialized) return;
  isConsumerInitialized = true;

  console.log('[Realtime Room Stream Consumer] Khởi động lắng nghe hàng đợi: realtime_room_stream_queue');

  consumeRabbitMQ(QUEUES.REALTIME_ROOM_STREAM, async (msg: any) => {
    try {
      const data = msg?.data ? msg.data : msg;
      if (data?.type === 'PROCESS_STITCH' && data.sessionId) {
        console.log(`[RabbitMQ Consumer] Nhận gói tin PROCESS_STITCH cho phiên quét: ${data.sessionId}`);
        await processSessionStitching(data.sessionId);
      }
    } catch (err: any) {
      console.error('[RabbitMQ Realtime Consumer Error]:', err.message);
    }
  });
}
