import { Router, Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import {
  getGaussianSplatUrl,
  setGaussianSplatUrl,
  pingGaussianSplatWorker,
  reconstructRoomSplat
} from '../services/gaussianSplatService.js';

export const splatRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB mỗi ảnh
    files: 50 // Tối đa 50 ảnh
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận các định dạng ảnh (.jpg, .jpeg, .png, .webp)'));
    }
  }
});

/**
 * 1. Lấy trạng thái Colab 3DGS Worker & URL hiện tại
 */
splatRouter.get('/status', async (_req: Request, res: Response) => {
  try {
    const url = await getGaussianSplatUrl();
    const ping = await pingGaussianSplatWorker();
    res.json({
      configuredUrl: url,
      workerStatus: ping
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 2. Cập nhật động URL Cloudflare Quick Tunnel mới từ Colab
 */
splatRouter.post('/set-worker-url', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL không hợp lệ' });
    }
    const updated = await setGaussianSplatUrl(url);
    const ping = await pingGaussianSplatWorker(updated);
    res.json({
      message: 'Cập nhật URL thành công',
      url: updated,
      ping
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * 3. Tái tạo 3D Gaussian Splatting từ danh sách ảnh phòng
 */
splatRouter.post('/reconstruct', upload.array('images', 50), async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length < 3) {
    return res.status(400).json({
      error: 'Vui lòng tải lên tối thiểu 3 bức ảnh (khuyến nghị 20 - 30 ảnh để kết quả nét nhất)'
    });
  }

  const roomName = (req.body.roomName as string) || 'room';

  try {
    const result = await reconstructRoomSplat(files, roomName);
    res.json({
      message: 'Tái tạo không gian 3D Gaussian Splatting thành công!',
      ...result
    });
  } catch (err: any) {
    console.error('[3DGS Reconstruction Error]:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Lỗi khi tái tạo 3D Gaussian Splatting'
    });
  }
});

/**
 * 4. Lấy danh sách các scene 3DGS (.ply) đã từng tái tạo
 */
splatRouter.get('/list', async (_req: Request, res: Response) => {
  try {
    const splatsDir = path.join(process.cwd(), 'public', 'uploads', 'splats');
    if (!fs.existsSync(splatsDir)) {
      return res.json({ scenes: [] });
    }

    const files = await fs.promises.readdir(splatsDir);
    const scenes = await Promise.all(
      files
        .filter((f) => f.endsWith('.ply') || f.endsWith('.splat'))
        .map(async (f) => {
          const stat = await fs.promises.stat(path.join(splatsDir, f));
          return {
            filename: f,
            url: `/uploads/splats/${f}`,
            sizeBytes: stat.size,
            sizeMB: (stat.size / 1024 / 1024).toFixed(2),
            createdAt: stat.birthtime
          };
        })
    );

    scenes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ scenes });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
