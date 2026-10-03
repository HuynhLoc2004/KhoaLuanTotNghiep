import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { ArtifactModel } from '../models/Artifact.js';
import { RoomModel } from '../models/Room.js';
import { generateQRCodeBuffer, generateQRCodeDataURL } from '../services/qr.js';
import { cacheGet, cacheSet, cacheDel, cacheDelPattern } from '../services/redis.js';
import { broadcastRealtimeEvent } from '../services/realtimeSync.js';
import { enqueue3DReconstruction } from '../services/artifact3dQueue.js';
import { getTripoSRUrl, setTripoSRUrl, pingTripoSR, acquireUser3DLock, releaseUser3DLock } from '../services/triposrClient.js';
import { pgPool, logAudit } from '../db/postgres.js';
import { pgUpsertArtifact, pgDeleteArtifact } from '../db/syncEngine.js';

export const artifactsRouter = Router();

// Thư mục lưu trữ tĩnh cho hiện vật
const ARTIFACTS_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'artifacts');
if (!fs.existsSync(ARTIFACTS_UPLOAD_DIR)) {
  fs.mkdirSync(ARTIFACTS_UPLOAD_DIR, { recursive: true });
}

// Cấu hình Multer cho ảnh
const storageImage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, ARTIFACTS_UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `art_img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
    cb(null, unique);
  }
});
const uploadImage = multer({
  storage: storageImage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file định dạng hình ảnh (.jpg, .png, .webp)'));
    }
  }
});

// Cấu hình Multer cho file 3D (.glb, .gltf)
const storageModel = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const modelsDir = path.join(ARTIFACTS_UPLOAD_DIR, 'models_3d');
    if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir, { recursive: true });
    cb(null, modelsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `model_3d_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
    cb(null, unique);
  }
});
const uploadModel = multer({
  storage: storageModel,
  limits: { fileSize: 100 * 1024 * 1024 }
});

/**
 * GET /api/artifacts
 * Danh sách toàn bộ hiện vật (PostgreSQL Primary + Redis cache TTL 300s + MongoDB Fallback)
 */
artifactsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, status, roomId } = req.query;

    const cacheKey = `artifacts:list:${JSON.stringify({ category, search, status, roomId })}`;
    const cached = await cacheGet<any>(cacheKey);
    if (cached) {
      return res.json({ ...cached, fromCache: true });
    }

    let formatted: any[] = [];

    // 1. Truy vấn PostgreSQL Primary với SQL quan hệ tối ưu
    try {
      const conditions: string[] = [];
      const params: any[] = [];

      if (category && category !== 'all') {
        params.push(category);
        conditions.push(`category = $${params.length}`);
      }
      if (status && status !== 'all') {
        params.push(status);
        conditions.push(`status = $${params.length}`);
      }
      if (roomId) {
        params.push(roomId);
        conditions.push(`(room_id = $${params.length} OR room_code = $${params.length})`);
      }
      if (search && typeof search === 'string') {
        params.push(`%${search.trim()}%`);
        conditions.push(`(name ILIKE $${params.length} OR code ILIKE $${params.length} OR period ILIKE $${params.length})`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const pgRes = await pgPool.query(`
        SELECT id, code, name, room_id as "roomId", room_code as "roomCode", topic_id as "topicId",
               category, period, origin, description, dimensions, images, thumbnail_url as "thumbnailUrl",
               model_3d_url as "model3dUrl", audio_narration_url as "audioNarrationUrl",
               voice_language as "voiceLanguage", qr_code_url as "qrCodeUrl", status,
               processing_status as "processingStatus", processing_error as "processingError",
               model_metadata as "modelMetadata", translations, order_index as "orderIndex",
               created_at as "createdAt", updated_at as "updatedAt"
        FROM artifacts
        ${whereClause}
        ORDER BY order_index ASC, created_at DESC;
      `, params);

      if (pgRes.rows.length > 0) {
        formatted = pgRes.rows;
      }
    } catch (pgErr: any) {
      console.warn('[Artifacts PG List Warning]:', pgErr.message);
    }

    // 2. Fallback sang MongoDB nếu PostgreSQL chưa có dữ liệu
    if (formatted.length === 0) {
      const filter: any = {};
      if (category && category !== 'all') filter.category = category;
      if (status && status !== 'all') filter.status = status;
      if (roomId) filter.roomId = roomId;
      if (search && typeof search === 'string' && search.trim()) {
        const q = search.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        filter.$or = [
          { name: { $regex: q, $options: 'i' } },
          { code: { $regex: q, $options: 'i' } },
          { period: { $regex: q, $options: 'i' } }
        ];
      }
      const items = await ArtifactModel.find(filter).sort({ orderIndex: 1, createdAt: -1 }).lean();
      formatted = items.map((item: any) => ({
        ...item,
        id: item._id ? item._id.toString() : item.id
      }));
    }

    const result = {
      success: true,
      count: formatted.length,
      data: formatted
    };

    // Chỉ cache nếu có dữ liệu để tránh chặn dữ liệu mới vừa thêm
    if (formatted.length > 0) {
      await cacheSet(cacheKey, result, 300);
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi tải danh sách hiện vật: ' + err.message });
  }
});

/**
 * GET /api/artifacts/colab-tunnel
 * Lấy cấu hình URL Cloudflare Tunnel Colab và kiểm tra trạng thái GPU T4 trực tiếp
 */
artifactsRouter.get('/colab-tunnel', async (_req: Request, res: Response) => {
  try {
    const url = await getTripoSRUrl();
    const pingResult = await pingTripoSR(url);
    res.json({
      success: true,
      data: {
        configured: !!url,
        ...pingResult,
        url
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi kiểm tra Colab Tunnel: ' + err.message });
  }
});

/**
 * POST /api/artifacts/colab-tunnel
 * Lưu URL Cloudflare Tunnel mới (trycloudflare.com) và kiểm tra kết nối ngay
 */
artifactsRouter.post('/colab-tunnel', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    const updatedUrl = await setTripoSRUrl(url || '');
    const pingResult = await pingTripoSR(updatedUrl);

    res.json({
      success: true,
      message: pingResult.ok
        ? 'Đã kết nối thành công tới Colab GPU T4 Worker!'
        : (updatedUrl ? 'Đã lưu URL nhưng chưa kết nối được tới Colab' : 'Đã xóa cấu hình Colab Tunnel'),
      data: {
        configured: !!updatedUrl,
        ...pingResult,
        url: updatedUrl
      }
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Lỗi cập nhật Colab Tunnel' });
  }
});

/**
 * GET /api/artifacts/:id
 * Chi tiết một hiện vật (PostgreSQL Primary + Redis cache TTL 600s + MongoDB Fallback)
 */
artifactsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id as string;
    const id = decodeURIComponent(String(rawId || '').trim());
    if (!id) {
      return res.status(400).json({ success: false, message: 'Thiếu mã hiện vật' });
    }

    const cacheKey = `artifacts:item:${id.toLowerCase()}`;
    const cached = await cacheGet<any>(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, fromCache: true });
    }

    let artifact: any = null;

    // 1. Truy vấn PostgreSQL Primary
    try {
      const pgRes = await pgPool.query(`
        SELECT id, code, name, room_id as "roomId", room_code as "roomCode", topic_id as "topicId",
               category, period, origin, description, dimensions, images, thumbnail_url as "thumbnailUrl",
               model_3d_url as "model3dUrl", audio_narration_url as "audioNarrationUrl",
               voice_language as "voiceLanguage", qr_code_url as "qrCodeUrl", status,
               processing_status as "processingStatus", processing_error as "processingError",
               model_metadata as "modelMetadata", translations, order_index as "orderIndex",
               created_at as "createdAt", updated_at as "updatedAt"
        FROM artifacts
        WHERE id = $1 OR code = $1 OR LOWER(code) = LOWER($1) OR mongo_id = $1
        LIMIT 1;
      `, [id]);

      if (pgRes.rows.length > 0) {
        artifact = pgRes.rows[0];
      }
    } catch (pgErr: any) {
      console.warn('[Artifact Detail PG Warning]:', pgErr.message);
    }

    // 2. Fallback sang MongoDB
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(404).json({ success: false, message: 'Mã hiện vật không hợp lệ' });
    }

    if (!artifact) {
      const codeRegex = new RegExp(`^${id.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i');
      const query = mongoose.isValidObjectId(id)
        ? { $or: [{ _id: id }, { id }, { code: id }, { code: codeRegex }] }
        : { $or: [{ id }, { code: id }, { code: codeRegex }] };
      const item = await ArtifactModel.findOne(query);
      if (item) {
        artifact = item.toJSON();
      }
    }

    if (!artifact) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hiện vật' });
    }

    // Tự động tạo mã QR data URL chuẩn nếu chưa có hoặc nếu trước đó bị lỗi undefined
    const targetCode = artifact.code || artifact.id || (artifact._id ? artifact._id.toString() : '');
    const isCorruptQr = !artifact.qrCodeUrl || artifact.qrCodeUrl.includes('undefined') || !artifact.qrCodeUrl.startsWith('data:image/');
    if (isCorruptQr && targetCode && targetCode !== 'undefined') {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.get('host');
      const targetUrl = `${protocol}://${host}/?artifact=${encodeURIComponent(targetCode)}`;
      try {
        const qrDataUrl = await generateQRCodeDataURL(targetUrl, 320);
        artifact.qrCodeUrl = qrDataUrl;
        const targetId = artifact.id || (artifact._id ? artifact._id.toString() : targetCode);
        await ArtifactModel.updateOne({ $or: [{ id: targetId }, { code: targetCode }] }, { $set: { qrCodeUrl: qrDataUrl } });
        await pgPool.query('UPDATE artifacts SET qr_code_url = $1 WHERE id = $2 OR code = $3', [qrDataUrl, targetId, targetCode]);
      } catch (qrErr) {
        console.warn('[Artifacts] Không thể sinh mã QR:', qrErr);
      }
    }

    await cacheSet(cacheKey, artifact, 600); // 10 phút TTL
    res.json({ success: true, data: artifact });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi lấy chi tiết hiện vật: ' + err.message });
  }
});

/**
 * POST /api/artifacts
 * Tạo mới một hiện vật (Đồng bộ MongoDB thật & xóa cache ngay)
 */
artifactsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, code, category, period, origin, description, dimensions, images, thumbnailUrl, model3dUrl, audioNarrationUrl, voiceLanguage, roomId, roomCode, topicId } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Tên và Mã hiện vật là bắt buộc' });
    }

    // Kiểm tra trùng mã code
    const existing = await ArtifactModel.findOne({ code: code.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: `Mã hiện vật "${code}" đã tồn tại trên hệ thống` });
    }

    const _id = new mongoose.Types.ObjectId();
    const created = await ArtifactModel.create({
      _id,
      id: _id.toString(),
      name: name.trim(),
      code: code.trim(),
      roomId: roomId || undefined,
      roomCode: roomCode || undefined,
      topicId: topicId || undefined,
      category: category || 'Cổ vật di sản',
      period: period || 'Thời cổ',
      origin: origin || 'Bảo tàng Lịch sử TP.HCM',
      description: description || '',
      dimensions: dimensions || '',
      images: Array.isArray(images) ? images : [],
      thumbnailUrl: thumbnailUrl || (Array.isArray(images) && images.length > 0 ? images[0] : ''),
      model3dUrl: model3dUrl || '',
      audioNarrationUrl: audioNarrationUrl || '',
      voiceLanguage: voiceLanguage || 'vi',
      status: 'active',
      processingStatus: 'idle'
    });

    // Tạo mã QR cho trang xem hiện vật
    const targetCode = created.code || created.id;
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const targetUrl = `${protocol}://${host}/?artifact=${encodeURIComponent(targetCode)}`;
    try {
      created.qrCodeUrl = await generateQRCodeDataURL(targetUrl, 320);
      await created.save();
    } catch {}

    // Đồng bộ lập tức sang PostgreSQL Primary
    await pgUpsertArtifact(created.toObject ? created.toObject() : created);
    await logAudit('CREATE_ARTIFACT', 'artifacts', { details: { id: created.id, code: created.code, name: created.name } });

    // Xóa cache danh sách để phản ánh dữ liệu mới lập tức
    await cacheDelPattern('artifacts:*');

    broadcastRealtimeEvent('artifacts_updated', { action: 'create', artifact: created });
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi tạo hiện vật: ' + err.message });
  }
});

/**
 * PUT /api/artifacts/:id
 * Cập nhật thông tin hiện vật (Đồng bộ hai chiều PostgreSQL Primary & MongoDB Mirror & xóa cache ngay)
 */
artifactsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ success: false, message: 'Mã định danh hiện vật (ID) không hợp lệ' });
    }

    const query = mongoose.isValidObjectId(id) ? { $or: [{ _id: id }, { id }, { code: id }] } : { $or: [{ id }, { code: id }] };
    let updated = await ArtifactModel.findOneAndUpdate(query, { $set: req.body }, { returnDocument: 'after' });

    // Nếu chưa có trong MongoDB (do trước đây chỉ lưu ở PostgreSQL), nạp và đồng bộ vào MongoDB
    if (!updated) {
      try {
        const pgCheck = await pgPool.query('SELECT * FROM artifacts WHERE id = $1 OR code = $1 OR mongo_id = $1 LIMIT 1', [id]);
        if (pgCheck.rows.length > 0) {
          const row = pgCheck.rows[0];
          const mergedData = { ...row, ...req.body, id: row.id, code: req.body.code || row.code };
          const artId = row.id || row.mongo_id || id;
          updated = await ArtifactModel.create({
            id: artId,
            code: mergedData.code,
            name: mergedData.name,
            category: mergedData.category,
            period: mergedData.period,
            origin: mergedData.origin,
            description: mergedData.description,
            dimensions: mergedData.dimensions,
            images: Array.isArray(mergedData.images) ? mergedData.images : (typeof mergedData.images === 'string' ? JSON.parse(mergedData.images || '[]') : []),
            thumbnailUrl: mergedData.thumbnailUrl || mergedData.thumbnail_url || '',
            model3dUrl: mergedData.model3dUrl || mergedData.model_3d_url || '',
            audioNarrationUrl: mergedData.audioNarrationUrl || mergedData.audio_narration_url || '',
            voiceLanguage: mergedData.voiceLanguage || mergedData.voice_language || 'vi',
            status: mergedData.status || 'active',
            processingStatus: mergedData.processingStatus || mergedData.processing_status || 'idle'
          });
        }
      } catch (findPgErr) {
        console.warn('[Artifacts] Lỗi kiểm tra PG khi cập nhật:', findPgErr);
      }
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hiện vật để cập nhật' });
    }

    // Đồng bộ sang PostgreSQL Primary
    await pgUpsertArtifact(updated.toObject ? updated.toObject() : updated);
    await logAudit('UPDATE_ARTIFACT', 'artifacts', { details: { id: updated.id, code: updated.code, name: updated.name } });

    // Xóa cache chi tiết và cache danh sách
    await Promise.all([
      cacheDelPattern('artifacts:*'),
      cacheDel(`artifacts:item:${id}`),
      cacheDel(`artifacts:item:${updated.code}`),
      cacheDel(`artifacts:item:${updated.id}`)
    ]);

    broadcastRealtimeEvent('artifacts_updated', { action: 'update', artifact: updated });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật hiện vật: ' + err.message });
  }
});

/**
 * DELETE /api/artifacts/:id
 * Xóa hiện vật thật 100% trong PostgreSQL Primary + MongoDB + dọn dẹp file 3D + liên kết Hotspot + xóa cache
 */
artifactsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ success: false, message: 'Mã định danh hiện vật (ID) không hợp lệ' });
    }

    // 1. Thử tìm và xóa trong MongoDB
    const query = mongoose.isValidObjectId(id) ? { $or: [{ _id: id }, { id }, { code: id }] } : { $or: [{ id }, { code: id }] };
    let deleted = await ArtifactModel.findOneAndDelete(query);

    // 2. Thử tìm và xóa trong PostgreSQL Primary
    let pgDeleted: any = null;
    try {
      const pgRes = await pgPool.query(
        'DELETE FROM artifacts WHERE id = $1 OR mongo_id = $1 OR code = $1 RETURNING *;',
        [id]
      );
      if (pgRes.rows.length > 0) {
        pgDeleted = pgRes.rows[0];
      }
    } catch (pgErr: any) {
      console.warn('[Artifacts] Lỗi xóa PostgreSQL:', pgErr.message);
    }

    // Nếu không tìm thấy ở cả MongoDB lẫn PostgreSQL -> 404
    if (!deleted && !pgDeleted) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hiện vật để xóa' });
    }

    const artifactInfo = deleted || pgDeleted;
    const targetId = artifactInfo.id || id;
    const targetCode = artifactInfo.code || id;
    const model3dUrl = artifactInfo.model3dUrl || artifactInfo.model_3d_url;

    // Xóa thêm trong PostgreSQL nếu mới chỉ xóa ở MongoDB
    if (deleted && !pgDeleted) {
      await pgDeleteArtifact(targetId);
      if (targetCode && targetCode !== targetId) {
        await pgDeleteArtifact(targetCode);
      }
    }

    // 1. Dọn dẹp file 3D trên đĩa
    if (model3dUrl && model3dUrl.includes('/uploads/artifacts/models_3d/')) {
      const filename = path.basename(model3dUrl);
      const filePath = path.join(ARTIFACTS_UPLOAD_DIR, 'models_3d', filename);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch {}
      }
    }

    // 2. Chặt chẽ quan hệ dữ liệu: Gỡ bỏ hotspot liên kết trong PostgreSQL Primary & RoomModel
    try {
      await pgPool.query('DELETE FROM hotspots WHERE artifact_id = $1 OR artifact_id = $2 OR artifact_id = $3;', [id, targetId, targetCode]);
      await RoomModel.updateMany(
        { 'hotspots.artifactId': { $in: [id, targetId, targetCode] } },
        { $pull: { hotspots: { artifactId: { $in: [id, targetId, targetCode] } } } }
      );
    } catch (relErr) {
      console.warn('[Artifacts] Lỗi dọn dẹp liên kết hotspot:', relErr);
    }

    // 3. Xóa cache Redis
    await Promise.all([
      cacheDelPattern('artifacts:*'),
      cacheDel(`artifacts:item:${id}`),
      cacheDel(`artifacts:item:${targetId}`),
      cacheDel(`artifacts:item:${targetCode}`),
      cacheDel('rooms:all')
    ]);

    broadcastRealtimeEvent('artifacts_updated', { action: 'delete', artifactId: id });
    res.json({ success: true, message: 'Đã xóa hiện vật và dọn dẹp liên kết thành công' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi xóa hiện vật: ' + err.message });
  }
});

/**
 * POST /api/artifacts/upload-image
 * Tải lên một hình ảnh hiện vật
 */
artifactsRouter.post('/upload-image', uploadImage.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn file hình ảnh' });
    }
    const relativeUrl = `/uploads/artifacts/${req.file.filename}`;
    res.json({
      success: true,
      data: {
        url: relativeUrl,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Lỗi tải ảnh hiện vật' });
  }
});

/**
 * POST /api/artifacts/isolate-image
 * Sử dụng AI Rembg để bóc tách phông nền, loại bỏ tủ kính, tường và chi tiết thừa xung quanh hiện vật
 */
artifactsRouter.post('/isolate-image', async (req: Request, res: Response) => {
  try {
    const { imageUrl, artifactId } = req.body;
    if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(400).json({ success: false, message: 'Thiếu đường dẫn hình ảnh cần tách nền' });
    }

    let pathname = imageUrl;
    try {
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        pathname = new URL(imageUrl).pathname;
      }
    } catch (_) {}
    const cleanRel = pathname.replace(/^\/?uploads\//, '').replace(/^\//, '');
    const filename = path.basename(cleanRel);
    const candidates = [
      path.join(process.cwd(), 'public', 'uploads', cleanRel),
      path.join(process.cwd(), 'backend', 'public', 'uploads', cleanRel),
      path.join(ARTIFACTS_UPLOAD_DIR, filename),
      path.join(process.cwd(), 'public', 'uploads', filename),
      path.join(process.cwd(), 'backend', 'public', 'uploads', filename),
      path.join(process.cwd(), 'public', cleanRel),
      path.join(process.cwd(), 'backend', 'public', cleanRel)
    ];
    let localImagePath = '';
    for (const cand of candidates) {
      if (fs.existsSync(cand)) {
        localImagePath = cand;
        break;
      }
    }

    if (!localImagePath || !fs.existsSync(localImagePath)) {
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        try {
          const resp = await fetch(imageUrl);
          if (resp.ok) {
            const tempDownloadPath = path.join(ARTIFACTS_UPLOAD_DIR, `temp_iso_${Date.now()}_${filename || 'img.jpg'}`);
            const arrayBuffer = await resp.arrayBuffer();
            fs.writeFileSync(tempDownloadPath, Buffer.from(arrayBuffer));
            localImagePath = tempDownloadPath;
          }
        } catch (fetchErr) {
          console.error('[isolate-image] Failed to download remote image:', fetchErr);
        }
      } else if (imageUrl.startsWith('data:image/')) {
        try {
          const matches = imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const buffer = Buffer.from(matches[2], 'base64');
            const tempDownloadPath = path.join(ARTIFACTS_UPLOAD_DIR, `temp_b64_${Date.now()}.png`);
            fs.writeFileSync(tempDownloadPath, buffer);
            localImagePath = tempDownloadPath;
          }
        } catch (b64Err) {
          console.error('[isolate-image] Failed to decode base64 image:', b64Err);
        }
      }
    }

    if (!localImagePath || !fs.existsSync(localImagePath)) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy file ảnh gốc trên máy chủ (hoặc không thể tải ảnh từ URL)' });
    }

    const outFilename = `isolated_${Date.now()}_${path.basename(localImagePath, path.extname(localImagePath))}.png`;
    const outPath = path.join(ARTIFACTS_UPLOAD_DIR, outFilename);
    const scriptCandidates = [
      process.env.REMOVE_BG_SCRIPT,
      path.join(process.cwd(), 'stitching_worker', 'remove_bg.py'),
      path.join(process.cwd(), '..', 'stitching_worker', 'remove_bg.py'),
      '/app/stitching_worker/remove_bg.py'
    ].filter(Boolean) as string[];
    const scriptPath = scriptCandidates.find(p => fs.existsSync(p)) || path.join(process.cwd(), 'stitching_worker', 'remove_bg.py');
    const pythonBin = process.env.PYTHON_PATH || (process.platform === 'win32' ? 'python' : 'python3');

    await new Promise<void>((resolve, reject) => {
      const py = spawn(pythonBin, [scriptPath, localImagePath, outPath]);
      let errData = '';
      py.stderr.on('data', (d) => { errData += d.toString(); });
      py.on('close', (code) => {
        if (code === 0 && fs.existsSync(outPath)) {
          resolve();
        } else {
          reject(new Error(errData || `Python script exited with code ${code}`));
        }
      });
    });

    const newUrl = `/uploads/artifacts/${outFilename}`;

    if (artifactId) {
      const query = mongoose.isValidObjectId(artifactId)
        ? { $or: [{ _id: artifactId }, { id: artifactId }, { code: artifactId }] }
        : { $or: [{ id: artifactId }, { code: artifactId }] };
      const art = await ArtifactModel.findOne(query);
      if (art) {
        art.thumbnailUrl = newUrl;
        if (art.images && art.images.length > 0) {
          art.images[0] = newUrl;
        } else {
          art.images = [newUrl];
        }
        await art.save();
        await pgUpsertArtifact(art.toObject());
        await Promise.all([
          cacheDelPattern('artifacts:*'),
          cacheDel(`artifacts:item:${art.id}`),
          cacheDel(`artifacts:item:${art.code}`)
        ]);
        broadcastRealtimeEvent('artifacts_updated', { action: 'update', artifactId: art.id });
      }
    }

    res.json({
      success: true,
      message: 'Đã bóc tách phông nền và căn chỉnh tập trung vào hiện vật thành công!',
      data: {
        url: newUrl,
        originalUrl: imageUrl
      }
    });
  } catch (err: any) {
    console.error('[Isolate Image Error]:', err);
    res.status(500).json({ success: false, message: 'Lỗi bóc tách nền hiện vật: ' + (err.message || 'Không xác định') });
  }
});

/**
 * POST /api/artifacts/upload-model
 * Tải lên trực tiếp file 3D (.glb, .gltf)
 */
artifactsRouter.post('/upload-model', uploadModel.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn file 3D (.glb, .gltf)' });
    }
    const relativeUrl = `/uploads/artifacts/models_3d/${req.file.filename}`;
    res.json({
      success: true,
      data: {
        url: relativeUrl,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Lỗi tải file 3D' });
  }
});

/**
 * POST /api/artifacts/:id/generate-3d
 * Kích hoạt luồng hàng đợi sinh mô hình 3D .GLB từ ảnh đơn
 */
artifactsRouter.post('/:id/generate-3d', async (req: Request, res: Response) => {
  const userId = (req as any).user?.id || (req as any).user?.email || req.ip || 'anonymous_user';

  // 1. Kiểm tra khóa đồng thời chống spam click (1 tác vụ 3D / 1 tài khoản tại 1 thời điểm)
  const lockAcquired = await acquireUser3DLock(userId);
  if (!lockAcquired) {
    return res.status(429).json({
      success: false,
      message: 'Yêu cầu tạo mô hình 3D trước đó của bạn đang được xử lý trên GPU. Vui lòng đợi trong giây lát!'
    });
  }

  try {
    const id = req.params.id as string;
    const { imageUrl, depthScale, resolution } = req.body;

    const query = mongoose.isValidObjectId(id)
      ? { $or: [{ _id: id }, { id }, { code: id }] }
      : { $or: [{ id }, { code: id }] };
    let artifact = await ArtifactModel.findOne(query);
    if (!artifact) {
      await releaseUser3DLock(userId);
      return res.status(404).json({ success: false, message: 'Không tìm thấy hiện vật' });
    }

    // Xác định ảnh nguồn mặt trước
    const targetImageUrl = imageUrl || artifact.thumbnailUrl || (artifact.images.length > 0 ? artifact.images[0] : null);
    if (!targetImageUrl) {
      await releaseUser3DLock(userId);
      return res.status(400).json({ success: false, message: 'Hiện vật chưa có hình ảnh chụp để dựng mô hình 3D' });
    }

    // Nếu ảnh là URL Cloudinary/R2 (http...), truyền trực tiếp URL -> 0% RAM VPS!
    let localImagePath = targetImageUrl;
    if (!targetImageUrl.startsWith('http')) {
      const cleanRel = targetImageUrl.replace(/^\/uploads\//, '');
      const candidates = [
        path.join(process.cwd(), 'public', 'uploads', cleanRel),
        path.join(ARTIFACTS_UPLOAD_DIR, path.basename(cleanRel)),
        path.join(process.cwd(), 'backend', 'public', 'uploads', cleanRel)
      ];
      for (const cand of candidates) {
        if (fs.existsSync(cand)) {
          localImagePath = cand;
          break;
        }
      }

      if (!localImagePath || !fs.existsSync(localImagePath)) {
        await releaseUser3DLock(userId);
        return res.status(400).json({ success: false, message: 'Không thể tìm thấy file ảnh gốc trên máy chủ' });
      }
    }

    // Xác định ảnh nguồn mặt sau (nếu có)
    const { backImageUrl } = req.body;
    const targetBackImageUrl = backImageUrl || (artifact.images && artifact.images.length > 1 ? artifact.images[1] : null);
    let localBackImagePath = targetBackImageUrl || '';
    if (targetBackImageUrl && !targetBackImageUrl.startsWith('http')) {
      const cleanRelB = targetBackImageUrl.replace(/^\/uploads\//, '');
      const candidatesB = [
        path.join(process.cwd(), 'public', 'uploads', cleanRelB),
        path.join(ARTIFACTS_UPLOAD_DIR, path.basename(cleanRelB)),
        path.join(process.cwd(), 'backend', 'public', 'uploads', cleanRelB)
      ];
      for (const candB of candidatesB) {
        if (fs.existsSync(candB)) {
          localBackImagePath = candB;
          break;
        }
      }
    }

    // Đưa vào hàng đợi xử lý bất đồng bộ kèm kiểm tra Cache
    const dScale = depthScale ? Number(depthScale) : 1.0;
    const resValue = resolution ? Number(resolution) : 110;

    const targetArtifactId = String(artifact._id || artifact.id);
    const result = await enqueue3DReconstruction(
      targetArtifactId,
      localImagePath,
      localBackImagePath || undefined,
      dScale,
      resValue,
      userId
    );

    res.json({
      success: true,
      message: result.cached
        ? 'Mô hình 3D đã được tải ngay lập tức từ bộ nhớ đệm Cache!'
        : 'Đã đưa tác vụ dựng 3D vào hàng đợi xử lý nền. Vui lòng theo dõi trạng thái tiến trình.',
      data: {
        jobId: result.jobId,
        cached: result.cached,
        model3dUrl: result.model3dUrl || artifact.model3dUrl,
        status: result.cached ? 'completed' : 'processing'
      }
    });
  } catch (err: any) {
    await releaseUser3DLock(userId);
    res.status(500).json({ success: false, message: 'Lỗi kích hoạt tiến trình 3D: ' + err.message });
  }
});

/**
 * GET /api/artifacts/:id/3d-status
 * Tra cứu tiến độ tạo mô hình 3D của hiện vật
 */
artifactsRouter.get('/:id/3d-status', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const query = mongoose.isValidObjectId(id)
      ? { $or: [{ _id: id }, { id }, { code: id }] }
      : { $or: [{ id }, { code: id }] };
    let artifact: any = await ArtifactModel.findOne(query);
    if (!artifact) {
      const pgRes = await pgPool.query(`
        SELECT id, processing_status as "processingStatus", processing_error as "processingError",
               model_3d_url as "model3dUrl", model_metadata as "modelMetadata"
        FROM artifacts
        WHERE id = $1 OR code = $1 OR mongo_id = $1
        LIMIT 1;
      `, [id]);
      if (pgRes.rows.length > 0) {
        artifact = pgRes.rows[0];
      }
    }
    if (!artifact) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hiện vật' });
    }

    res.json({
      success: true,
      data: {
        artifactId: artifact.id,
        processingStatus: artifact.processingStatus,
        processingError: artifact.processingError,
        model3dUrl: artifact.model3dUrl,
        modelMetadata: artifact.modelMetadata
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi kiểm tra trạng thái 3D: ' + err.message });
  }
});

/**
 * GET /api/artifacts/:id/qr-download
 * Xuất file ảnh PNG mã QR chất lượng cao phục vụ in ấn bảng trưng bày
 */
artifactsRouter.get('/:id/qr-download', async (req: Request, res: Response) => {
  try {
    const id = (req.params.id as string || '').trim();
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(404).send('Không tìm thấy hiện vật');
    }

    const codeRegex = new RegExp(`^${id.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i');
    const query = mongoose.isValidObjectId(id)
      ? { $or: [{ _id: id }, { id }, { code: id }, { code: codeRegex }] }
      : { $or: [{ id }, { code: id }, { code: codeRegex }] };
    const item = await ArtifactModel.findOne(query);
    if (!item) {
      return res.status(404).send('Không tìm thấy hiện vật');
    }

    const targetCode = item.code || item.id || item._id.toString();
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host') || process.env.PUBLIC_API_URL?.replace(/https?:\/\//, '') || 'museumhcm.duckdns.org';
    const targetUrl = `${protocol}://${host}/?artifact=${encodeURIComponent(targetCode)}`;

    const buffer = await generateQRCodeBuffer(targetUrl, 1000);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="QR_${item.code || targetCode}.png"`);
    res.send(buffer);
  } catch (err: any) {
    res.status(500).send('Lỗi sinh mã QR: ' + err.message);
  }
});



