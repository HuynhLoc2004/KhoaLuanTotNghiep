import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { uploadToCloudinary } from '../services/cloudinary.js';
import { uploadToR2 } from '../services/r2.js';
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
  let isClosed = false;

  // Giám sát Timeout 180 giây chống treo vô hạn cho tiến trình
  const timeoutTimer = setTimeout(() => {
    if (!isClosed) {
      console.error('[Stitch API] Quá thời gian ghép ảnh (180s). Đang tự động kết thúc tiến trình...');
      isClosed = true;
      try {
        pyProcess.kill('SIGKILL');
      } catch (kErr) {
        console.warn('Kill process warning:', kErr);
      }
      if (!res.headersSent) {
        return res.status(504).json({
          success: false,
          error: 'ERR_TIMEOUT',
          message: 'Quá trình xử lý vượt quá thời gian cho phép (180s). Vui lòng thử lại với chùm ảnh có độ chồng lấp rõ ràng hơn.'
        });
      }
    }
  }, 180000);

  pyProcess.stdout.on('data', (data) => {
    stdoutData += data.toString();
  });

  pyProcess.stderr.on('data', (data) => {
    stderrData += data.toString();
    console.log(`[OpenCV Worker Log]: ${data.toString().trim()}`);
  });

  pyProcess.on('close', async (code) => {
    clearTimeout(timeoutTimer);
    if (isClosed || res.headersSent) return;
    isClosed = true;

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
      if (!stdoutData.trim()) {
        console.error('[Stitch API] Python worker trả về stdout rỗng. Stderr:', stderrData);
        return res.status(500).json({
          success: false,
          error: 'ERR_WORKER_EMPTY_RESPONSE',
          message: 'Không nhận được kết quả từ bộ xử lý thị giác máy tính OpenCV.',
          rawStderr: stderrData
        });
      }

      const result = JSON.parse(stdoutData.trim());

      if (result.success) {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.get('host');
        const baseUrl = process.env.PUBLIC_API_URL ? process.env.PUBLIC_API_URL.replace(/\/$/, '') : `${protocol}://${host}`;

        let finalPanoramaUrl = `${baseUrl}/uploads/${outFilename}`;
        
        // 1. Tự động đồng bộ ảnh 360 lên Cloudflare R2 Storage (Lưu trữ vĩnh viễn, bảo toàn 100% độ nét 4K gốc)
        let cloudR2Url: string | null = null;
        try {
          if (fs.existsSync(outputPath)) {
            console.log(`[Stitch API] Đang tải ảnh 360 lên Cloudflare R2 CDN (panoramas_360/${outFilename})...`);
            const fileBuf = fs.readFileSync(outputPath);
            cloudR2Url = await uploadToR2(`panoramas_360/${outFilename}`, fileBuf, 'image/jpeg');
            if (cloudR2Url) {
              finalPanoramaUrl = cloudR2Url;
              console.log('[Stitch API] Đã lưu trữ thành công lên Cloudflare R2 CDN:', finalPanoramaUrl);
            }
          }
        } catch (r2Err: any) {
          console.warn('[Stitch API R2 Sync Warning]:', r2Err.message);
        }

        // 2. Đồng thời đồng bộ sao lưu lên Cloudinary CDN
        try {
          console.log('[Stitch API] Đang đồng bộ sao lưu ảnh 360 lên Cloudinary (folder: museum/panoramas_360)...');
          const cldRes = await uploadToCloudinary(outputPath, 'museum/panoramas_360');
          if (cldRes && cldRes.secure_url) {
            if (!cloudR2Url) {
              finalPanoramaUrl = cldRes.secure_url;
            }
            console.log('[Stitch API] Đã đồng bộ thành công lên Cloudinary CDN:', cldRes.secure_url);
          }
        } catch (cldErr: any) {
          console.warn('[Stitch API Cloudinary Sync Warning]:', cldErr.message, '- Dùng fallback URL.');
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
