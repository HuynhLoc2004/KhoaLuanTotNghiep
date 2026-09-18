import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { artifactStore } from '../store_artifacts.js';
import { generateQRCodeBuffer } from '../services/qr.js';
import { uploadToCloudinary } from '../services/cloudinary.js';

export const artifactsRouter = Router();

// Đường dẫn script tạo lưới 3D từ ảnh đơn
const PYTHON_PATH = process.env.PYTHON_PATH || (process.platform === 'win32' ? 'python' : 'python3');
const DEPTH_MESH_SCRIPT = process.env.DEPTH_MESH_SCRIPT || (
  fs.existsSync(path.join(process.cwd(), 'stitching_worker', 'depth_mesh_generator.py'))
    ? path.join(process.cwd(), 'stitching_worker', 'depth_mesh_generator.py')
    : path.join(process.cwd(), '..', 'stitching_worker', 'depth_mesh_generator.py')
);

// Thư mục lưu trữ cục bộ cho các khung hình 360 và file 3D
const ARTIFACT_UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'artifacts');
if (!fs.existsSync(ARTIFACT_UPLOADS_DIR)) {
  fs.mkdirSync(ARTIFACT_UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ARTIFACT_UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `art_${Date.now()}_${cleanName}${ext}`);
  }
});

const uploadFrames = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB mỗi ảnh
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file định dạng hình ảnh (JPEG, PNG, WebP)'));
    }
  }
});

const uploadModel = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB cho file 3D
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.glb' || ext === '.gltf' || ext === '.obj' || ext === '.fbx') {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file định dạng 3D (.glb, .gltf, .obj)'));
    }
  }
});

// GET /api/artifacts
artifactsRouter.get('/', (req: Request, res: Response) => {
  try {
    const list = artifactStore.getAll();
    res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/artifacts/:id
artifactsRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const item = artifactStore.getById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hiện vật di sản' });
    }
    res.json({ success: true, data: item });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/artifacts
artifactsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, code, thumbnailUrl } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Tên và Mã hiện vật là bắt buộc' });
    }
    const created = await artifactStore.create(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/artifacts/:id
artifactsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updated = await artifactStore.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hiện vật' });
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/artifacts/:id
artifactsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const ok = await artifactStore.delete(id);
    if (!ok) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hiện vật để xóa' });
    }
    res.json({ success: true, message: 'Đã xóa hiện vật thành công' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/artifacts/upload-frames (Tải lên hàng loạt ảnh mâm xoay 360)
artifactsRouter.post(
  '/upload-frames',
  uploadFrames.array('files', 72),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ success: false, message: 'Vui lòng chọn ít nhất một hình ảnh' });
      }

      // Sắp xếp các file theo tên gốc (thường camera chụp chuỗi ảnh turntable đánh số 01, 02, 03...)
      files.sort((a, b) => a.originalname.localeCompare(b.originalname, undefined, { numeric: true }));

      const urls: string[] = [];

      for (const file of files) {
        try {
          // Thử upload lên Cloudinary
          const result = await uploadToCloudinary(file.path, 'museum/artifacts_3d/frames');
          urls.push(result.secure_url);
          try { fs.unlinkSync(file.path); } catch {}
        } catch (cloudErr) {
          // Fallback lưu local url
          urls.push(`/uploads/artifacts/${file.filename}`);
        }
      }

      res.json({
        success: true,
        count: urls.length,
        data: {
          images: urls,
          thumbnail: urls[0]
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Lỗi tải ảnh mâm xoay' });
    }
  }
);

// POST /api/artifacts/upload-model (Tải lên file 3D .glb / .gltf)
artifactsRouter.post(
  '/upload-model',
  uploadModel.single('file'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Vui lòng chọn file 3D (.glb, .gltf)' });
      }

      // Lưu file 3D cục bộ phục vụ WebGL
      const modelUrl = `/uploads/artifacts/${req.file.filename}`;

      res.json({
        success: true,
        data: {
          url: modelUrl,
          filename: req.file.filename,
          size: req.file.size
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Lỗi tải file 3D' });
    }
  }
);

// GET /api/artifacts/:id/qr-download (Tải file PNG mã QR chất lượng cao phục vụ in ấn)
artifactsRouter.get('/:id/qr-download', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const item = artifactStore.getById(id);
    if (!item) {
      return res.status(404).send('Không tìm thấy hiện vật');
    }

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol || 'http';
    const targetUrl = `${protocol}://${host}/artifact/${item.id}`;

    const buffer = await generateQRCodeBuffer(targetUrl, 1000);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="QR_${item.code}_${item.id}.png"`);
    res.send(buffer);
  } catch (err: any) {
    res.status(500).send('Lỗi sinh mã QR: ' + err.message);
  }
});

// POST /api/artifacts/generate-3d-mesh (Tạo file 3D .GLB lồi lõm thực sự từ 1 ảnh)
artifactsRouter.post(
  '/generate-3d-mesh',
  uploadFrames.single('file'),
  async (req: Request, res: Response) => {
    try {
      let inputPath = req.file?.path;
      const { imageUrl, artifactId, depthScale, resolution } = req.body;

      // Nếu không có file upload thì tải từ imageUrl
      let tempDownloadPath = '';
      if (!inputPath && imageUrl) {
        tempDownloadPath = path.join(ARTIFACT_UPLOADS_DIR, `temp_src_${Date.now()}.jpg`);
        if (imageUrl.startsWith('http')) {
          const resp = await fetch(imageUrl);
          const buf = Buffer.from(await resp.arrayBuffer());
          fs.writeFileSync(tempDownloadPath, buf);
          inputPath = tempDownloadPath;
        } else {
          // Local relative path
          const cleanRel = imageUrl.replace(/^\/uploads\//, '');
          const candidates = [
            path.join(process.cwd(), 'public', 'uploads', cleanRel),
            path.join(ARTIFACT_UPLOADS_DIR, cleanRel),
            path.join(ARTIFACT_UPLOADS_DIR, path.basename(cleanRel)),
            path.join(process.cwd(), 'backend', 'public', 'uploads', cleanRel)
          ];
          for (const cand of candidates) {
            if (fs.existsSync(cand)) {
              inputPath = cand;
              break;
            }
          }
        }
      }

      if (!inputPath || !fs.existsSync(inputPath)) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp ảnh hiện vật hợp lệ để tạo 3D' });
      }

      const outFilename = `mesh_3d_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.glb`;
      const outGlbPath = path.join(ARTIFACT_UPLOADS_DIR, outFilename);

      const args = [
        DEPTH_MESH_SCRIPT,
        '--image', inputPath,
        '--output', outGlbPath,
        '--depth-scale', String(depthScale || 0.35),
        '--resolution', String(resolution || 160)
      ];

      console.log('[DepthTo3D] Khởi chạy Python worker:', PYTHON_PATH, args.join(' '));

      const py = spawn(PYTHON_PATH, args);
      let stdout = '';
      let stderr = '';

      py.stdout.on('data', (d) => { stdout += d.toString(); });
      py.stderr.on('data', (d) => { stderr += d.toString(); });

      py.on('close', async (code) => {
        // Dọn temp download nếu có
        if (tempDownloadPath && fs.existsSync(tempDownloadPath)) {
          try { fs.unlinkSync(tempDownloadPath); } catch {}
        }

        if (code !== 0 || !fs.existsSync(outGlbPath)) {
          console.error('[DepthTo3D Error]:', stderr || stdout);
          return res.status(500).json({
            success: false,
            message: `Lỗi sinh mô hình 3D: ${stderr || stdout || 'Không thể tạo file 3D'}`
          });
        }

        let parsed: any = {};
        try {
          parsed = JSON.parse(stdout.trim());
        } catch {
          parsed = { vertices: 10000, faces: 18000 };
        }

        const modelUrl = `/uploads/artifacts/${outFilename}`;

        // Cập nhật vào hiện vật nếu có artifactId
        if (artifactId) {
          await artifactStore.update(artifactId as string, { model3dUrl: modelUrl });
        }

        res.json({
          success: true,
          data: {
            model3dUrl: modelUrl,
            vertices: parsed.vertices,
            faces: parsed.faces,
            sizeBytes: parsed.size_bytes
          }
        });
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Lỗi hệ thống khi sinh mô hình 3D' });
    }
  }
);

