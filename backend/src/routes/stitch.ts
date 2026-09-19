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

const VERIFY_DIR = path.join(TEMP_DIR, 'verified_frames');
if (!fs.existsSync(VERIFY_DIR)) fs.mkdirSync(VERIFY_DIR, { recursive: true });

const singleFrameStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      if (!fs.existsSync(VERIFY_DIR)) {
        fs.mkdirSync(VERIFY_DIR, { recursive: true });
      }
      cb(null, VERIFY_DIR);
    } catch (dirErr: any) {
      cb(dirErr, VERIFY_DIR);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `frame_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`);
  }
});

const uploadSingleFrame = (req: Request, res: Response, next: NextFunction) => {
  multer({
    storage: singleFrameStorage,
    limits: { fileSize: 35 * 1024 * 1024 }
  }).single('frame')(req, res, (err: any) => {
    if (err) {
      console.warn('[Verify Frame Multer Warning]:', err.message);
      return res.status(400).json({
        success: false,
        message: `Lỗi lưu trữ ảnh tạm: ${err.message}`
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
 * POST /api/stitch/verify-frame
 * Nhận 1 ảnh đơn lẻ vừa chụp từ camera điện thoại -> Thẩm định chất lượng thời gian thực (Đạt / Chưa đạt)
 */
stitchRouter.post('/verify-frame', uploadSingleFrame, async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp file ảnh chụp từ camera'
    });
  }

  const filePath = req.file.path;
  const prevFilePath = req.body.prevFilePath as string;

  const args = [STITCHER_SCRIPT, '--verify-image', filePath];
  if (prevFilePath && fs.existsSync(prevFilePath)) {
    args.push('--prev-image', prevFilePath);
  }

  const pyProcess = spawn(PYTHON_PATH, args);
  let stdoutData = '';
  let stderrData = '';

  pyProcess.stdout.on('data', (d) => { stdoutData += d.toString(); });
  pyProcess.stderr.on('data', (d) => { stderrData += d.toString(); });

  pyProcess.on('close', (code) => {
    try {
      if (!stdoutData.trim()) {
        console.error('[Verify Frame API] Worker stdout rỗng. Stderr:', stderrData);
        return res.status(500).json({
          success: false,
          message: 'Không nhận được kết quả phân tích từ Python OpenCV',
          rawStderr: stderrData
        });
      }

      const result = JSON.parse(stdoutData.trim());
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.get('host');
      const baseUrl = process.env.PUBLIC_API_URL ? process.env.PUBLIC_API_URL.replace(/\/$/, '') : `${protocol}://${host}`;
      const relPath = path.relative(path.join(process.cwd(), 'public'), filePath).replace(/\\/g, '/');

      return res.json({
        success: true,
        data: {
          serverPath: filePath,
          url: `${baseUrl}/${relPath}`,
          filename: req.file!.filename,
          evaluation: result
        }
      });
    } catch (parseErr: any) {
      console.error('[Verify Frame API] Lỗi parse JSON:', parseErr.message, stdoutData);
      return res.status(500).json({
        success: false,
        message: 'Lỗi định dạng phản hồi từ Python worker'
      });
    }
  });

  pyProcess.on('error', (err) => {
    console.error('[Verify Frame API] Không thể khởi chạy tiến trình Python:', err);
    res.status(500).json({
      success: false,
      message: `Không thể khởi chạy worker Python: ${err.message}`
    });
  });
});

/**
 * POST /api/stitch
 * Nhận danh sách ảnh rời từ điện thoại -> Kích hoạt worker OpenCV -> Trả về URL ảnh Equirectangular 2:1
 */
stitchRouter.post('/', uploadMiddleware, async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) || [];
  let imagePaths: string[] = files.map(f => f.path);

  // Hỗ trợ truyền danh sách serverPaths đã thẩm định sẵn từ các bước chụp trước
  if (imagePaths.length === 0 && req.body.serverPaths) {
    try {
      const parsed = typeof req.body.serverPaths === 'string' ? JSON.parse(req.body.serverPaths) : req.body.serverPaths;
      if (Array.isArray(parsed)) {
        imagePaths = parsed.filter((p: string) => typeof p === 'string' && fs.existsSync(p));
      }
    } catch (parseErr) {
      console.warn('[Stitch API] Lỗi parse serverPaths:', parseErr);
    }
  }

  if (!imagePaths || imagePaths.length < 1) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng chọn tối thiểu 1 ảnh toàn cảnh PANO hoặc chùm ảnh rời để thực hiện ghép.'
    });
  }


  const outFilename = `stitched_360_${Date.now()}.jpg`;
  const outputPath = path.join(UPLOAD_ROOT, outFilename);

  console.log(`[Stitch API] Bắt đầu ghép ${imagePaths.length} tấm ảnh qua OpenCV...`);

  // Chuẩn bị arguments cho Python script (mặc định width=0 để tự động thích ứng chất lượng theo ảnh gốc, chống vỡ hạt)
  const targetWidth = req.body.width ? String(req.body.width) : '0';
  const args = [
    STITCHER_SCRIPT,
    '--images', ...imagePaths,
    '--output', outputPath,
    '--width', targetWidth
  ];

  const pyProcess = spawn(PYTHON_PATH, args);

  let stdoutData = '';
  let stderrData = '';
  let isClosed = false;

  // Giám sát Timeout 300 giây (5 phút) bảo đảm hoàn tất chùm ảnh lớn an toàn
  const timeoutTimer = setTimeout(() => {
    if (!isClosed) {
      console.error('[Stitch API] Quá thời gian ghép ảnh (300s). Đang tự động kết thúc tiến trình...');
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
          message: 'Quá trình xử lý vượt quá thời gian cho phép (300s). Vui lòng thử lại với chùm ảnh có độ chồng lấp rõ ràng hơn.'
        });
      }
    }
  }, 300000);

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

    // Dọn dẹp các file ảnh gốc tạm thời sau khi xử lý xong (chỉ xóa job folder riêng biệt, TUYỆT ĐỐI KHÔNG XÓA VERIFY_DIR)
    try {
      if (imagePaths.length > 0) {
        const jobFolder = path.dirname(imagePaths[0]);
        if (jobFolder !== VERIFY_DIR && jobFolder !== TEMP_DIR && fs.existsSync(jobFolder)) {
          fs.rmSync(jobFolder, { recursive: true, force: true });
        } else {
          // Nếu là các file trong VERIFY_DIR thì chỉ xóa từng file tạm đã ghép xong
          for (const p of imagePaths) {
            try {
              if (fs.existsSync(p)) fs.unlinkSync(p);
            } catch (_) {}
          }
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
        const protocol = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
        const host = (req.headers['x-forwarded-host'] as string) || req.get('host') || '103-170-233-206.sslip.io';
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
              console.log('[Stitch API] Đã lưu trữ thành công lên Cloudflare R2 CDN:', cloudR2Url);
            }
          }
        } catch (r2Err: any) {
          console.warn('[Stitch API R2 Sync Warning]:', r2Err.message);
        }

        // 2. Đồng thời đồng bộ lên Cloudinary CDN (Được kích hoạt chuẩn CORS toàn cầu cho WebGL Pannellum)
        let cloudinaryUrl: string | null = null;
        try {
          console.log('[Stitch API] Đang đồng bộ ảnh 360 lên Cloudinary (folder: museum/panoramas_360)...');
          const cldRes = await uploadToCloudinary(outputPath, 'museum/panoramas_360');
          if (cldRes && cldRes.secure_url) {
            cloudinaryUrl = cldRes.secure_url;
            console.log('[Stitch API] Đã đồng bộ thành công lên Cloudinary CDN:', cloudinaryUrl);
          }
        } catch (cldErr: any) {
          console.warn('[Stitch API Cloudinary Sync Warning]:', cldErr.message, '- Dùng fallback URL.');
        }

        // Xóa cache danh sách phòng trong Redis
        await cacheDel('rooms:all');

        // Ưu tiên Cloudinary URL cho WebGL Viewer vì Cloudinary luôn có CORS header chuẩn (Access-Control-Allow-Origin: *)
        // Nếu không có Cloudinary, sử dụng Local URL từ máy chủ (cũng đã kích hoạt CORS)
        // Nếu dùng R2 thì bọc qua Proxy endpoint để tránh lỗi bảo mật WebGL
        if (cloudinaryUrl) {
          finalPanoramaUrl = cloudinaryUrl;
        } else if (fs.existsSync(outputPath)) {
          finalPanoramaUrl = `${baseUrl}/uploads/${outFilename}`;
        } else if (cloudR2Url) {
          finalPanoramaUrl = `${baseUrl}/api/stitch/proxy-image?url=${encodeURIComponent(cloudR2Url)}`;
        }

        console.log(`[Stitch API] Ghép thành công! URL ảnh hiển thị: ${finalPanoramaUrl}`);
        return res.json({
          success: true,
          data: {
            panoramaUrl: finalPanoramaUrl,
            cloudinaryUrl: cloudinaryUrl,
            r2Url: cloudR2Url,
            localUrl: `${baseUrl}/uploads/${outFilename}`,
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

/**
 * GET /api/stitch/proxy-image?url=...
 * Proxy hình ảnh hỗ trợ CORS header cho WebGL Canvas/Pannellum
 */
stitchRouter.get('/proxy-image', async (req: Request, res: Response) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    return res.status(400).send('Missing url query parameter');
  }

  try {
    const remoteRes = await fetch(targetUrl);
    if (!remoteRes.ok) {
      return res.status(remoteRes.status).send(`Failed to fetch image: ${remoteRes.statusText}`);
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Content-Type', remoteRes.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    const arrayBuf = await remoteRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuf));
  } catch (err: any) {
    console.error('[Proxy Image Error]:', err.message);
    return res.status(500).send('Error proxying image');
  }
});

/**
 * GET /api/stitch/history
 * Lấy danh sách các bức ảnh 360° đã được tạo / ghép nối trên hệ thống
 */
stitchRouter.get('/history', async (req: Request, res: Response) => {
  try {
    if (!fs.existsSync(UPLOAD_ROOT)) {
      return res.json({ success: true, count: 0, panoramas: [] });
    }

    const files = await fs.promises.readdir(UPLOAD_ROOT);
    const panoFiles = files.filter(f => f.startsWith('stitched_360_') && (f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.webp')));

    const host = (req.headers['x-forwarded-host'] as string) || req.get('host') || '103-170-233-206.sslip.io';
    const proto = (req.headers['x-forwarded-proto'] as string) || (req.protocol === 'https' ? 'https' : 'http');

    const panoramas = await Promise.all(
      panoFiles.map(async (file) => {
        const filePath = path.join(UPLOAD_ROOT, file);
        const stats = await fs.promises.stat(filePath);
        return {
          filename: file,
          url: `${proto}://${host}/uploads/${file}`,
          size: stats.size,
          createdAt: stats.mtime
        };
      })
    );

    panoramas.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({
      success: true,
      count: panoramas.length,
      panoramas
    });
  } catch (err: any) {
    console.error('[Stitch History Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Không thể đọc lịch sử ảnh 360: ' + err.message
    });
  }
});

/**
 * DELETE /api/stitch/panoramas/:filename
 * Xóa file ảnh 360 khỏi thư mục uploads
 */
stitchRouter.delete('/panoramas/:filename', async (req: Request, res: Response) => {
  try {
    const filename = Array.isArray(req.params.filename) ? req.params.filename[0] : String(req.params.filename || '');
    if (!filename.startsWith('stitched_360_') || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ success: false, message: 'Tên file không hợp lệ hoặc không có quyền xóa' });
    }
    const filePath = path.join(UPLOAD_ROOT, filename);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
    return res.json({ success: true, message: 'Đã xóa file ảnh 360 thành công' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/stitch/panoramas/batch-delete
 * Xóa nhiều file ảnh 360 cùng lúc
 */
stitchRouter.post('/panoramas/batch-delete', async (req: Request, res: Response) => {
  try {
    const { filenames } = req.body;
    if (!Array.isArray(filenames) || filenames.length === 0) {
      return res.status(400).json({ success: false, message: 'Danh sách file cần xóa không hợp lệ' });
    }

    let deletedCount = 0;
    for (const filename of filenames) {
      const cleanName = String(filename || '');
      if (cleanName.startsWith('stitched_360_') && !cleanName.includes('..') && !cleanName.includes('/') && !cleanName.includes('\\')) {
        const filePath = path.join(UPLOAD_ROOT, cleanName);
        if (fs.existsSync(filePath)) {
          try {
            await fs.promises.unlink(filePath);
            deletedCount++;
          } catch (e) {}
        }
      }
    }

    return res.json({
      success: true,
      message: `Đã dọn dẹp thành công ${deletedCount} file ảnh không gian 360°`,
      deletedCount
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});




