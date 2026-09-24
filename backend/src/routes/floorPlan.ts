import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { FloorPlanMapModel } from '../models/FloorPlanMap.js';
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
 * Lấy sơ đồ mặt bằng và đồ thị liên kết không gian hiện tại
 */
floorPlanRouter.get('/', async (req: Request, res: Response) => {
  try {
    let floorPlan = await FloorPlanMapModel.findOne({ id: 'floor_plan_main', active: true }).lean();

    // Nếu chưa có trong DB, tự động khởi tạo phân tích baseline dựa trên các phòng hiện có trong CSDL
    if (!floorPlan) {
      console.log('[FloorPlanRoute] Chưa có sơ đồ trong DB, đang tự động khởi tạo baseline...');
      const branding = await getSystemBrandingConfig();
      const initialMap = await analyzeFloorPlanImage(
        '',
        branding?.guideMapUrl || '',
        {
          title: branding?.guideMapTitle || 'Sơ Đồ Mặt Bằng & Cẩm Nang Tham Quan',
          description: branding?.guideMapDesc || 'Mạng lưới liên kết không gian và cửa thông phòng được phân tích từ sơ đồ kiến trúc'
        }
      );
      floorPlan = initialMap.toObject ? initialMap.toObject() : initialMap;
    }

    res.json({
      success: true,
      data: floorPlan
    });
  } catch (error: any) {
    console.error('[FloorPlanRoute GET Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải sơ đồ mặt bằng kiến trúc: ' + (error.message || '')
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
