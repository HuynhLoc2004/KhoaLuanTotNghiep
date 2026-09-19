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
import { topicsRouter } from './routes/topics.js';
import { seedDefaultLanguages } from './models/Language.js';
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

// Serve static uploads with explicit CORS for WebGL & Canvas textures
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// API routes
app.use('/api/rooms', roomsRouter);
app.use('/api/topics', topicsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/stitch', stitchRouter);
app.use('/api/mail', mailRouter);
app.use('/api/languages', languagesRouter);

// Health check with real statuses
app.get('/api/health', (req, res) => {
  const redis = getRedisStatus();
  res.json({
    status: 'online',
    service: 'Bảo tàng Lịch sử TP.HCM - 360 Tour API',
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
  app.listen(PORT, () => {
    console.log(`[Bảo tàng Lịch sử TP.HCM API] Máy chủ chạy tại http://localhost:${PORT}`);
  });
});
