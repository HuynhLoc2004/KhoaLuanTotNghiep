import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { FloorPlanMapModel } from '../models/FloorPlanMap.js';
import { RoomModel } from '../models/Room.js';
import { analyzeFloorPlanImage } from '../services/floorPlanAnalyzer.js';
import { uploadToCloudinary } from '../services/cloudinary.js';
import { getSystemBrandingConfig } from '../models/SystemBranding.js';
import { broadcastRealtimeEvent } from '../services/realtimeSync.js';

export const floorPlanRouter = Router();

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `floorplan_${Date.now()}_${cleanName}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file định dạng hình ảnh (JPEG, PNG, WebP)'));
    }
  }
});

/**
 * GET /api/floor-plan
 * Lấy sơ đồ mặt bằng đang active trên Client (Đồng bộ 100% với CSDL MongoDB thực tế)
 */
floorPlanRouter.get('/', async (req: Request, res: Response) => {
  try {
    // 1. Tìm bản đồ đang active
    let floorPlan = await FloorPlanMapModel.findOne({ active: true }).sort({ updatedAt: -1 }).lean();
    if (!floorPlan) {
      floorPlan = await FloorPlanMapModel.findOne().sort({ updatedAt: -1, createdAt: -1 }).lean();
    }

    // Nếu CSDL không có bản đồ nào (hoặc đã bị xóa), trả về null, tuyệt đối KHÔNG tự sinh mock rác
    res.json({
      success: true,
      data: floorPlan || null
    });
  } catch (error: any) {
    console.error('[FloorPlanRoute GET Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải sơ đồ mặt bằng: ' + (error.message || '')
    });
  }
});

/**
 * GET /api/floor-plan/list
 * Lấy danh sách toàn bộ các bản đồ trong kho lưu trữ kèm Phân Trang chuẩn mực
 */
floorPlanRouter.get('/list', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 6));
    const skip = (page - 1) * limit;

    const total = await FloorPlanMapModel.countDocuments();
    const items = await FloorPlanMapModel.find()
      .sort({ active: -1, updatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const activeMap = await FloorPlanMapModel.findOne({ active: true }).lean();

    res.json({
      success: true,
      data: items,
      activeId: activeMap?.id || null,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err: any) {
    console.error('[FloorPlanRoute LIST Error]:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi tải danh sách bản đồ trong kho: ' + (err.message || '')
    });
  }
});

/**
 * POST /api/floor-plan/activate/:id
 * Kích hoạt bản đồ được chọn từ kho lên Client
 */
floorPlanRouter.post('/activate/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const targetMap = await FloorPlanMapModel.findOne({ id });
    if (!targetMap) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bản đồ chỉ định trong kho' });
    }

    // Đặt tất cả các bản đồ khác thành inactive
    await FloorPlanMapModel.updateMany({ id: { $ne: id } }, { active: false });
    targetMap.active = true;
    await targetMap.save();

    // Đồng bộ vào SystemBranding để Header, Cẩm nang & Client đồng bộ 100%
    if (targetMap.imageUrl) {
      try {
        const { SystemBranding } = await import('../models/SystemBranding.js');
        await SystemBranding.findOneAndUpdate(
          { id: 'default_branding' },
          {
            guideMapUrl: targetMap.imageUrl,
            guideMapTitle: targetMap.title,
            guideMapDesc: targetMap.description
          },
          { upsert: true, returnDocument: 'after' }
        );
      } catch (bErr) {
        console.warn('[FloorPlanRoute] Lỗi cập nhật branding:', bErr);
      }
    }

    // Phát sóng sự kiện Realtime cho toàn bộ Client
    broadcastRealtimeEvent('floor_plan_updated', targetMap.toObject ? targetMap.toObject() : targetMap);

    res.json({
      success: true,
      message: `Đã kích hoạt thành công bản đồ "${targetMap.title}" lên Client!`,
      data: targetMap
    });
  } catch (err: any) {
    console.error('[FloorPlanRoute ACTIVATE Error]:', err);
    res.status(500).json({ success: false, message: 'Lỗi kích hoạt bản đồ: ' + (err.message || '') });
  }
});

/**
 * DELETE /api/floor-plan/:id
 * Xóa bản đồ khỏi danh sách
 */
floorPlanRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = {
      $or: [
        { id },
        ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : [])
      ]
    };
    const target = await FloorPlanMapModel.findOne(query);
    if (!target) {
      return res.json({ success: true, message: 'Bản đồ không còn tồn tại hoặc đã được xóa' });
    }

    const wasActive = target.active;
    await FloorPlanMapModel.deleteOne(query);

    // Nếu vừa xóa bản đồ đang áp dụng, tự động kích hoạt bản đồ mới nhất còn lại nếu có
    if (wasActive) {
      const remaining = await FloorPlanMapModel.findOne().sort({ updatedAt: -1 });
      if (remaining) {
        remaining.active = true;
        await remaining.save();
        broadcastRealtimeEvent('floor_plan_updated', remaining.toObject ? remaining.toObject() : remaining);
        if (remaining.imageUrl) {
          try {
            const { SystemBranding } = await import('../models/SystemBranding.js');
            await SystemBranding.findOneAndUpdate(
              { id: 'default_branding' },
              {
                guideMapUrl: remaining.imageUrl,
                guideMapTitle: remaining.title,
                guideMapDesc: remaining.description
              }
            );
          } catch {}
        }
      } else {
        // Không còn bản đồ nào trong CSDL: Xóa sạch liên kết mặt bằng trong Branding
        try {
          const { SystemBranding } = await import('../models/SystemBranding.js');
          await SystemBranding.findOneAndUpdate(
            { id: 'default_branding' },
            {
              guideMapUrl: '',
              guideMapTitle: '',
              guideMapDesc: ''
            }
          );
        } catch {}
        broadcastRealtimeEvent('floor_plan_updated', null);
      }
    }

    res.json({
      success: true,
      message: 'Đã xóa sơ đồ mặt bằng thành công'
    });
  } catch (err: any) {
    console.error('[FloorPlanRoute DELETE Error]:', err);
    res.status(500).json({ success: false, message: 'Lỗi khi xóa sơ đồ: ' + (err.message || '') });
  }
});

/**
 * POST /api/floor-plan/analyze
 * Admin tải ảnh sơ đồ mặt bằng lên -> Server dùng Sharp & thuật toán Topo phân tích phòng và hướng cửa
 */
floorPlanRouter.post('/analyze', upload.single('file'), async (req: Request, res: Response) => {
  try {
    let localFilePath = '';
    let finalImageUrl = req.body.imageUrl || '';

    if (req.file) {
      localFilePath = req.file.path;
      finalImageUrl = `/uploads/${req.file.filename}`;

      // Upload lên Cloudinary nếu có cấu hình
      try {
        const cloudRes = await uploadToCloudinary(localFilePath, 'museum/floor_plans');
        if (cloudRes && cloudRes.secure_url) {
          finalImageUrl = cloudRes.secure_url;
        }
      } catch (cloudErr) {
        console.warn('[FloorPlanRoute] Cloudinary upload bỏ qua, dùng local url:', cloudErr);
      }
    } else if (finalImageUrl) {
      // Dùng URL đã có
      if (finalImageUrl.startsWith('/uploads/')) {
        localFilePath = path.join(process.cwd(), 'public', finalImageUrl);
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp file ảnh sơ đồ mặt bằng hoặc imageUrl hợp lệ'
      });
    }

    const title = req.body.title || 'Sơ Đồ Mặt Bằng & Cẩm Nang Tham Quan';
    const description = req.body.description || 'Mạng lưới liên kết không gian và cửa thông phòng được phân tích từ sơ đồ kiến trúc';
    const setActive = req.body.setActive !== 'false';
    const mapId = req.body.mapId || (setActive ? 'floor_plan_main' : `floor_plan_${Date.now()}`);

    // Thực hiện phân tích hình học & topo qua Sharp & Pure CV
    const analyzedMap = await analyzeFloorPlanImage(localFilePath, finalImageUrl, {
      mapId,
      title,
      description,
      setActive,
      forceRebuild: true
    });

    // Chỉ đồng bộ System Branding và broadcast nếu được đánh dấu active
    if (setActive) {
      try {
        const { SystemBranding } = await import('../models/SystemBranding.js');
        await SystemBranding.findOneAndUpdate(
          { id: 'default_branding' },
          {
            guideMapUrl: finalImageUrl,
            guideMapTitle: title,
            guideMapDesc: description
          },
          { upsert: true, returnDocument: 'after' }
        );
      } catch (bErr) {
        console.warn('[FloorPlanRoute] Không thể cập nhật branding guideMapUrl:', bErr);
      }

      // Phát sóng đồng bộ thời gian thực cho khách tham quan và admin
      broadcastRealtimeEvent('floor_plan_updated', analyzedMap);
    }

    res.json({
      success: true,
      message: 'Phân tích sơ đồ mặt bằng thành công bằng thuật toán Sharp & Topo không gian',
      data: analyzedMap,
      summary: {
        nodeCount: analyzedMap.nodes.length,
        edgeCount: analyzedMap.edges.length,
        imageDimensions: `${analyzedMap.imageWidth}x${analyzedMap.imageHeight}`
      }
    });
  } catch (error: any) {
    console.error('[FloorPlanRoute Analyze Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi trong quá trình phân tích ảnh sơ đồ: ' + (error.message || '')
    });
  }
});
