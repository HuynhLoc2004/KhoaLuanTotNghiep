import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ArtifactModel } from '../models/Artifact';
import { RoomModel } from '../models/Room';
import { generateQRCodeBuffer, generateQRCodeDataURL } from '../services/qr';
import { enqueue3DReconstruction, getJobStatus } from '../services/artifact3dQueue';
import { cacheGet, cacheSet, cacheDel, cacheDelPattern } from '../services/redis';

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
 * Danh sách toàn bộ hiện vật có bộ lọc theo danh mục, trạng thái và tìm kiếm (Có Redis cache TTL 300s)
 */
artifactsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, status, roomId } = req.query;
    const filter: any = {};

    if (category && category !== 'all') {
      filter.category = category;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (roomId) {
      filter.roomId = roomId;
    }
    if (search && typeof search === 'string') {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { code: { $regex: q, $options: 'i' } },
        { period: { $regex: q, $options: 'i' } }
      ];
    }

    const cacheKey = `artifacts:list:${JSON.stringify({ category, search, status, roomId })}`;
    const cached = await cacheGet<any>(cacheKey);
    if (cached) {
      return res.json({ ...cached, fromCache: true });
    }

    const items = await ArtifactModel.find(filter).sort({ orderIndex: 1, createdAt: -1 }).lean();
    const result = {
      success: true,
      count: items.length,
      data: items
    };

    // TTL 300s (5 phút)
    await cacheSet(cacheKey, result, 300);

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi tải danh sách hiện vật: ' + err.message });
  }
});

/**
 * GET /api/artifacts/:id
 * Chi tiết một hiện vật kèm tự động tạo mã QR nếu chưa có (Có Redis cache TTL 600s)
 */
artifactsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const cacheKey = `artifacts:item:${id}`;
    const cached = await cacheGet<any>(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, fromCache: true });
    }

    let item = await ArtifactModel.findById(id);
    if (!item) {
      item = await ArtifactModel.findOne({ code: id });
    }
    if (!item) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hiện vật' });
    }

    // Tự động tạo mã QR data URL nếu chưa có
    if (!item.qrCodeUrl) {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.get('host');
      const targetUrl = `${protocol}://${host}/artifact/${item.id}`;
      try {
        const qrDataUrl = await generateQRCodeDataURL(targetUrl, 320);
        item.qrCodeUrl = qrDataUrl;
        await item.save();
      } catch (qrErr) {
        console.warn('[Artifacts] Không thể sinh mã QR:', qrErr);
      }
    }

    const data = item.toJSON();
    await cacheSet(cacheKey, data, 600); // 10 phút TTL

    res.json({ success: true, data });
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

    const created = await ArtifactModel.create({
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
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const targetUrl = `${protocol}://${host}/artifact/${created.id}`;
    try {
      created.qrCodeUrl = await generateQRCodeDataURL(targetUrl, 320);
      await created.save();
    } catch {}

    // Xóa cache danh sách để phản ánh dữ liệu mới lập tức
    await cacheDelPattern('artifacts:*');

    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi tạo hiện vật: ' + err.message });
  }
});

/**
 * PUT /api/artifacts/:id
 * Cập nhật thông tin hiện vật (Đồng bộ MongoDB thật & xóa cache ngay)
 */
artifactsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updated = await ArtifactModel.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hiện vật để cập nhật' });
    }

    // Xóa cache chi tiết và cache danh sách
    await Promise.all([
      cacheDelPattern('artifacts:*'),
      cacheDel(`artifacts:item:${id}`),
      cacheDel(`artifacts:item:${updated.code}`)
    ]);

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật hiện vật: ' + err.message });
  }
});

/**
 * DELETE /api/artifacts/:id
 * Xóa hiện vật thật 100% trong MongoDB + dọn dẹp file 3D + liên kết Hotspot + xóa cache
 */
artifactsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const deleted = await ArtifactModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hiện vật để xóa' });
    }

    // 1. Dọn dẹp file 3D trên đĩa
    if (deleted.model3dUrl && deleted.model3dUrl.includes('/uploads/artifacts/models_3d/')) {
      const filename = path.basename(deleted.model3dUrl);
      const filePath = path.join(ARTIFACTS_UPLOAD_DIR, 'models_3d', filename);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch {}
      }
    }

    // 2. Chặt chẽ quan hệ dữ liệu: Gỡ bỏ hotspot liên kết trong RoomModel
    try {
      await RoomModel.updateMany(
        { 'hotspots.artifactId': id },
        { $pull: { hotspots: { artifactId: id } } }
      );
    } catch (relErr) {
      console.warn('[Artifacts] Lỗi dọn dẹp liên kết hotspot:', relErr);
    }

    // 3. Xóa cache
    await Promise.all([
      cacheDelPattern('artifacts:*'),
      cacheDel(`artifacts:item:${id}`),
      cacheDel(`artifacts:item:${deleted.code}`),
      cacheDel('rooms:all')
    ]);

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
  try {
    const id = req.params.id as string;
    const { imageUrl, depthScale, resolution } = req.body;

    const artifact = await ArtifactModel.findById(id);
    if (!artifact) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hiện vật' });
    }

    // Xác định ảnh nguồn
    const targetImageUrl = imageUrl || artifact.thumbnailUrl || (artifact.images.length > 0 ? artifact.images[0] : null);
    if (!targetImageUrl) {
      return res.status(400).json({ success: false, message: 'Hiện vật chưa có hình ảnh chụp để dựng mô hình 3D' });
    }

    // Chuyển URL tương đối sang đường dẫn thực tế trên server
    let localImagePath = '';
    if (targetImageUrl.startsWith('http')) {
      // Tải tạm file về server
      const tempPath = path.join(ARTIFACTS_UPLOAD_DIR, `temp_gen_${Date.now()}.jpg`);
      const resp = await fetch(targetImageUrl);
      const buf = Buffer.from(await resp.arrayBuffer());
      fs.writeFileSync(tempPath, buf);
      localImagePath = tempPath;
    } else {
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
    }

    if (!localImagePath || !fs.existsSync(localImagePath)) {
      return res.status(400).json({ success: false, message: 'Không thể tìm thấy file ảnh gốc trên máy chủ' });
    }

    // Đưa vào hàng đợi xử lý bất đồng bộ kèm kiểm tra Cache
    const dScale = depthScale ? Number(depthScale) : 0.35;
    const resValue = resolution ? Number(resolution) : 160;

    const result = await enqueue3DReconstruction(artifact.id, localImagePath, dScale, resValue);

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
    const artifact = await ArtifactModel.findById(id);
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
    const id = req.params.id as string;
    const item = await ArtifactModel.findById(id);
    if (!item) {
      return res.status(404).send('Không tìm thấy hiện vật');
    }

    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host') || 'localhost:3000';
    const targetUrl = `${protocol}://${host}/artifact/${item.id}`;

    const buffer = await generateQRCodeBuffer(targetUrl, 1000);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="QR_${item.code}_${item.id}.png"`);
    res.send(buffer);
  } catch (err: any) {
    res.status(500).send('Lỗi sinh mã QR: ' + err.message);
  }
});
