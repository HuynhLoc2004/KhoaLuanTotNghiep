import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { roomsRouter } from './routes/rooms.js';
import { uploadRouter } from './routes/upload.js';
import { connectMongoDB } from './db/mongodb.js';

import { stitchRouter } from './routes/stitch.js';

dotenv.config({ path: path.join(process.cwd(), '..', '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['*']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// API routes
app.use('/api/rooms', roomsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/stitch', stitchRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Bảo tàng Lịch sử TP.HCM - 360 Tour API',
    database: 'MongoDB Real Service (localhost:27017)',
    storage: 'Cloudinary Real Media + Cloudflare R2',
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
connectMongoDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[Bảo tàng Lịch sử TP.HCM API] Máy chủ chạy tại http://localhost:${PORT}`);
  });
});
