import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { FloorPlanMapModel } from '../models/FloorPlanMap.js';
import { RoomModel } from '../models/Room.js';
import { analyzeFloorPlanImage } from '../services/floorPlanAnalyzer.js';
import { uploadToCloudinary } from '../services/cloudinary.js';
import { getSystemBrandingConfig } from '../models/SystemBranding.js';

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
 * Lấy sơ đồ mặt bằng và đồ thị liên kết không gian hiện tại (Đồng bộ 100% với CSDL MongoDB thực tế)
 */
floorPlanRouter.get('/', async (req: Request, res: Response) => {
  try {
    const dbRooms = await RoomModel.find({ active: true }).sort({ orderIndex: 1 }).lean();
    let floorPlan = await FloorPlanMapModel.findOne({ id: 'floor_plan_main', active: true }).lean();

    // Kiểm tra tính đồng bộ giữa floorPlan và dbRooms thật:
    // 1. Chưa có floorPlan trong CSDL
    // 2. Số lượng node khác số lượng phòng thực tế trong CSDL
    // 3. Có node mock cũ (như node_central_rotunda) hoặc node trỏ tới roomId không còn tồn tại
    // 4. Tên phòng hoặc mã phòng trong node bị lệch so với dữ liệu thật trong CSDL
    const roomSet = new Set(dbRooms.map((r: any) => r.id));
    const hasMockNode = floorPlan?.nodes?.some((n: any) => n.id === 'node_central_rotunda' || !n.roomId || !roomSet.has(n.roomId));
    const nodeCountMismatch = (floorPlan?.nodes?.length || 0) !== dbRooms.length;
    const roomDataMismatch = dbRooms.some((r: any) => {
      const node = floorPlan?.nodes?.find((n: any) => n.roomId === r.id);
      return !node || node.name !== r.name || node.code !== r.code;
    });

    const needsResync = !floorPlan || hasMockNode || nodeCountMismatch || roomDataMismatch;

    if (needsResync) {
      console.log('[FloorPlanRoute] Phát hiện dữ liệu gian phòng thay đổi trong MongoDB, đang tự động đồng bộ lại sơ đồ mặt bằng...');
      const branding = await getSystemBrandingConfig();
      const updatedMap = await analyzeFloorPlanImage(
        '',
        branding?.guideMapUrl || floorPlan?.imageUrl || '',
        {
          title: branding?.guideMapTitle || floorPlan?.title || 'Sơ Đồ Mặt Bằng & Vị Trí Các Gian Trưng Bày',
          description: branding?.guideMapDesc || floorPlan?.description || 'Bản đồ kiến trúc không gian và vị trí các gian phòng'
        }
      );
      floorPlan = updatedMap.toObject ? updatedMap.toObject() : updatedMap;
    }

    res.json({
      success: true,
      data: floorPlan
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

    // Thực hiện phân tích hình học & topo qua Sharp
    const analyzedMap = await analyzeFloorPlanImage(localFilePath, finalImageUrl, {
      title,
      description,
      forceRebuild: true
    });

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
