import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadToCloudinary } from '../services/cloudinary.js';

export const uploadRouter = Router();

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
    cb(null, `pano_${Date.now()}_${cleanName}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file định dạng hình ảnh (JPEG, PNG, WebP)'));
    }
  }
});

// POST /api/upload/panorama (Uploads to real Cloudinary)
uploadRouter.post('/panorama', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Vui lòng chọn file ảnh để tải lên' });
  }

  const localFilePath = req.file.path;

  try {
    console.log('[Cloudinary] Đang tải ảnh lên Cloudinary folder: museum/panoramas_360...');
    const result = await uploadToCloudinary(localFilePath, 'museum/panoramas_360');
    console.log('[Cloudinary] Tải lên thành công! URL:', result.secure_url);

    // Optionally remove local temp file
    try {
      fs.unlinkSync(localFilePath);
    } catch {}

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        filename: req.file.filename,
        size: result.bytes,
        format: result.format,
        storage: 'cloudinary'
      }
    });
  } catch (cloudErr: any) {
    console.warn('[Cloudinary] Lỗi upload Cloudinary, chuyển sang lưu máy chủ cục bộ:', cloudErr.message);
    // Fallback to local URL if Cloudinary has connection issue
    const localUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      data: {
        url: localUrl,
        filename: req.file.filename,
        size: req.file.size,
        storage: 'local'
      }
    });
  }
});

// POST /api/upload/branding-logo (Tải ảnh logo nhận diện của bảo tàng)
uploadRouter.post('/branding-logo', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Vui lòng chọn file ảnh logo để tải lên' });
  }

  const localFilePath = req.file.path;

  try {
    console.log('[Cloudinary] Đang tải logo bảo tàng lên Cloudinary folder: museum/branding...');
    const result = await uploadToCloudinary(localFilePath, 'museum/branding');
    console.log('[Cloudinary] Tải logo thành công! URL:', result.secure_url);

    try {
      fs.unlinkSync(localFilePath);
    } catch {}

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        filename: req.file.filename,
        storage: 'cloudinary'
      }
    });
  } catch (cloudErr: any) {
    console.warn('[Cloudinary] Lỗi tải Cloudinary, dùng máy chủ cục bộ:', cloudErr.message);
    const localUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      data: {
        url: localUrl,
        filename: req.file.filename,
        storage: 'local'
      }
    });
  }
});

