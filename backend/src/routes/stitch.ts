import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { uploadToCloudinary } from '../services/cloudinary.js';
import { cacheDel } from '../services/redis.js';

export const stitchRouter = Router();

const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads');
const TEMP_DIR = path.join(UPLOAD_ROOT, 'temp_raw');

if (!fs.existsSync(UPLOAD_ROOT)) fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req: any, file, cb) => {
    if (!req._jobDir) {
      req._jobDir = path.join(TEMP_DIR, `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);
      if (!fs.existsSync(req._jobDir)) fs.mkdirSync(req._jobDir, { recursive: true });
      req._fileIndex = 0;
    }
    cb(null, req._jobDir);
  },
  filename: (req: any, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const idx = req._fileIndex !== undefined ? req._fileIndex++ : 0;
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    // Đặt tên file theo tiền tố thứ tự số tăng dần chuẩn: 0000_name, 0001_name để đảm bảo thứ tự quét vòng tròn
    cb(null, `${String(idx).padStart(4, '0')}_${cleanBase}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB per image
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/') || 
                    /\.(jpe?g|png|webp|heic|heif|bmp)$/i.test(file.originalname);
    if (isImage) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file định dạng hình ảnh (JPEG, PNG, WebP, HEIC)'));
    }
  }
});

const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  upload.array('images', 50)(req, res, (err: any) => {
    if (err) {
      console.warn('[Multer Warning]:', err.message);
      return res.status(400).json({
        success: false,
        message: `Lỗi tải file ảnh: ${err.message}`
      });
    }
    next();
  });
};

// Đường dẫn Python (hỗ trợ cả Windows local và Linux/Docker)
const PYTHON_PATH = process.env.PYTHON_PATH || (process.platform === 'win32'
  ? 'C:\\Users\\HUYNH TAN LOC\\AppData\\Local\\Programs\\Python\\Python312\\python.exe'
  : 'python3');

const STITCHER_SCRIPT = process.env.STITCHER_SCRIPT || (fs.existsSync(path.join(process.cwd(), 'stitching_worker', 'stitcher.py'))
  ? path.join(process.cwd(), 'stitching_worker', 'stitcher.py')
  : path.join(process.cwd(), '..', 'stitching_worker', 'stitcher.py'));

/**
 * POST /api/stitch
 * Nhận danh sách ảnh rời từ điện thoại -> Kích hoạt worker OpenCV -> Trả về URL ảnh Equirectangular 2:1
 */
stitchRouter.post('/', uploadMiddleware, async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length < 1) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng chọn tối thiểu 1 ảnh toàn cảnh PANO hoặc chùm ảnh rời để thực hiện ghép.'
    });
  }

  const imagePaths = files.map(f => f.path);
  const outFilename = `stitched_360_${Date.now()}.jpg`;
  const outputPath = path.join(UPLOAD_ROOT, outFilename);

  console.log(`[Stitch API] Bắt đầu ghép ${files.length} tấm ảnh qua OpenCV...`);

  // Chuẩn bị arguments cho Python script
  const args = [
    STITCHER_SCRIPT,
    '--images', ...imagePaths,
    '--output', outputPath,
    '--width', '4096'
  ];

  const pyProcess = spawn(PYTHON_PATH, args);

  let stdoutData = '';
  let stderrData = '';

  pyProcess.stdout.on('data', (data) => {
    stdoutData += data.toString();
  });

  pyProcess.stderr.on('data', (data) => {
    stderrData += data.toString();
    console.log(`[OpenCV Worker Log]: ${data.toString().trim()}`);
  });

  pyProcess.on('close', async (code) => {
    // Dọn dẹp các file ảnh gốc tạm thời sau khi xử lý xong
    try {
      if (imagePaths.length > 0) {
        const jobFolder = path.dirname(imagePaths[0]);
        if (fs.existsSync(jobFolder)) {
          fs.rmSync(jobFolder, { recursive: true, force: true });
        }
      }
    } catch (cleanErr) {
      console.warn('[Stitch API] Lỗi dọn dẹp file tạm:', cleanErr);
    }

    try {
      const result = JSON.parse(stdoutData.trim());

      if (result.success) {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.get('host');
        const baseUrl = process.env.PUBLIC_API_URL ? process.env.PUBLIC_API_URL.replace(/\/$/, '') : `${protocol}://${host}`;

        let finalPanoramaUrl = `${baseUrl}/uploads/${outFilename}`;
        
        // Tự động đồng bộ ảnh 360 lên Cloudinary CDN
        try {
          console.log('[Stitch API] Đang đồng bộ ảnh 360 lên Cloudinary (folder: museum/panoramas_360)...');
          const cldRes = await uploadToCloudinary(outputPath, 'museum/panoramas_360');
          if (cldRes && cldRes.secure_url) {
            finalPanoramaUrl = cldRes.secure_url;
            console.log('[Stitch API] Đã đồng bộ thành công lên Cloudinary CDN:', finalPanoramaUrl);
          }
        } catch (cldErr: any) {
          console.warn('[Stitch API Cloudinary Sync Warning]:', cldErr.message, '- Dùng fallback URL cục bộ.');
        }

        // Xóa cache danh sách phòng trong Redis
        await cacheDel('rooms:all');

        console.log(`[Stitch API] Ghép thành công! URL ảnh: ${finalPanoramaUrl}`);
        return res.json({
          success: true,
          data: {
            panoramaUrl: finalPanoramaUrl,
            filename: outFilename,
            width: result.width,
            height: result.height,
            aspectRatio: result.aspectRatio,
            message: result.message
          }
        });
      } else {
        console.error(`[Stitch API] Lỗi OpenCV: ${result.error}`);
        return res.status(400).json({
          success: false,
          error: result.error,
          message: result.detail || 'Không thể ghép nối chùm ảnh này.'
        });
      }
    } catch (parseErr) {
      console.error('[Stitch API] Lỗi parse kết quả từ Python worker:', parseErr, stdoutData, stderrData);
      return res.status(500).json({
        success: false,
        message: 'Lỗi trong quá trình thực thi thuật toán ghép ảnh OpenCV.',
        rawStderr: stderrData
      });
    }
  });

  pyProcess.on('error', (procErr) => {
    console.error('[Stitch API] Lỗi khởi chạy tiến trình Python:', procErr);
    res.status(500).json({
      success: false,
      message: `Không thể khởi chạy worker Python: ${procErr.message}`
    });
  });
});
