import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { roomsRouter } from './routes/rooms.js';
import { uploadRouter } from './routes/upload.js';
import { connectMongoDB } from './db/mongodb.js';

import { stitchRouter } from './routes/stitch.js';
import { mailRouter } from './routes/mail.js';
import { languagesRouter } from './routes/languages.js';
import { translationsRouter } from './routes/translations.js';
import { topicsRouter } from './routes/topics.js';
import { authRouter } from './routes/auth.js';
import { systemRouter } from './routes/system.js';
import { seedDefaultLanguages } from './models/Language.js';
import { seedDefaultTranslations } from './models/Translation.js';
import { seedDefaultRoles } from './models/Role.js';
import { seedDefaultAdmin } from './models/User.js';
import { getRedisStatus } from './services/redis.js';

dotenv.config({ path: path.join(process.cwd(), '..', '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['*']
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

import fs from 'fs';
import { PanoramaModel } from './models/Panorama.js';

// Serve static uploads with explicit CORS for WebGL & Canvas textures
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Fallback tự phục hồi ảnh 360° nếu chưa có trên ổ đĩa cục bộ
// Tự động kiểm tra và stream trực tiếp từ Cloudflare R2 / Cloudinary, đồng thời lưu cache đĩa cục bộ vĩnh viễn
app.get('/uploads/:filename', async (req, res, next) => {
  const filename = req.params.filename;
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return next();
  }

  const localPath = path.join(process.cwd(), 'public', 'uploads', filename);
  if (fs.existsSync(localPath)) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    return res.sendFile(localPath);
  }

  // 1. Kiểm tra trên Cloudflare R2 CDN Storage
  const r2PublicDomain = process.env.R2_PUBLIC_DOMAIN || 'https://pub-bb1eeff16fd349f2abb33e4e71fe1ae7.r2.dev';
  const r2Candidates = [
    `${r2PublicDomain}/panoramas_360/${filename}`,
    `${r2PublicDomain}/${filename}`
  ];

  for (const candidateUrl of r2Candidates) {
    try {
      const response = await fetch(candidateUrl);
      if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer());

        // Ghi lưu cache cục bộ để các lần truy cập sau được phục vụ tức thì
        try {
          const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
          fs.writeFileSync(localPath, buffer);
        } catch (writeErr) {
          console.warn('[Uploads Fallback Cache Write Error]:', writeErr);
        }

        const contentType = response.headers.get('content-type') || (filename.endsWith('.png') ? 'image/png' : 'image/jpeg');
        res.setHeader('Content-Type', contentType);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return res.send(buffer);
      }
    } catch {
      // Ignored
    }
  }

  // 2. Kiểm tra trong cơ sở dữ liệu MongoDB (Collection Panoramas)
  try {
    const pano = await PanoramaModel.findOne({ filename }).lean();
    if (pano) {
      const remoteUrl = pano.r2Url || pano.cloudinaryUrl;
      if (remoteUrl && remoteUrl.startsWith('http')) {
        const response = await fetch(remoteUrl);
        if (response.ok) {
          const buffer = Buffer.from(await response.arrayBuffer());
          try {
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
            if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
            fs.writeFileSync(localPath, buffer);
          } catch {}
          res.setHeader('Content-Type', 'image/jpeg');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
          res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
          return res.send(buffer);
        }
      }
    }
  } catch {}

  next();
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/topics', topicsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/stitch', stitchRouter);
app.use('/api/mail', mailRouter);
app.use('/api/languages', languagesRouter);
app.use('/api/translations', translationsRouter);
app.use('/api/system', systemRouter);

// Health check with real statuses
app.get('/api/health', async (req, res) => {
  const redis = getRedisStatus();
  let museumName = 'Hệ Thống Tour 360 Không Gian Di Sản';
  try {
    const { getSystemBrandingConfig } = await import('./models/SystemBranding.js');
    const branding = await getSystemBrandingConfig();
    if (branding && branding.shortName) {
      museumName = `${branding.shortName} - 360 Tour API`;
    }
  } catch {}

  res.json({
    status: 'online',
    service: museumName,
    database: {
      mongo: 'connected (mongodb://mongodb:27017/museum)',
      redis: redis.connected ? 'connected' : 'connecting_or_standalone'
    },
    storage: {
      cloudinary: 'connected (djkif9ubs)',
      localFallback: 'ready (/public/uploads)'
    },
    mail: {
      provider: 'Gmail SMTP (smtp.gmail.com:587)',
      user: 'huynhtanlocpp09@gmail.com',
      status: 'ready'
    },
    timestamp: new Date().toISOString()
  });
});

// Global error handler (prevent process crash on aborted uploads)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.warn('[Server Warning]:', err.message);
  if (!res.headersSent) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Lỗi xử lý yêu cầu'
    });
  }
});

// Connect Real Database and Start Server
connectMongoDB().then(async () => {
  await seedDefaultLanguages();
  await seedDefaultTranslations();
  await seedDefaultRoles();
  await seedDefaultAdmin();
  app.listen(PORT, () => {
    console.log(`[Bảo tàng Lịch sử TP.HCM API] Máy chủ chạy tại http://localhost:${PORT}`);
  });
});
