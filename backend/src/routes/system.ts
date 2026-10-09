import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { authenticate, requireAdmin, AuthRequest } from './auth.js';
import { redisClient, cacheGet, cacheSet, cacheDel, getRedisStatus, getQueueLength } from '../services/redis.js';
import { RoomModel } from '../models/Room.js';
import { PanoramaModel } from '../models/Panorama.js';
import { ArtifactModel } from '../models/Artifact.js';
import {
  SystemBranding,
  getSystemBrandingConfig,
  REDIS_BRANDING_KEY,
  DEFAULT_BRANDING
} from '../models/SystemBranding.js';
import { broadcastRealtimeEvent, handleRealtimeStream } from '../services/realtimeSync.js';
import { getPgStatus, logAudit } from '../db/postgres.js';
import { getRabbitMQStatus } from '../services/rabbitmq.js';
import { pgUpsertBranding, syncAuditLogs } from '../db/syncEngine.js';
import { AuditLogModel } from '../models/AuditLog.js';

export const systemRouter = Router();

// Kênh truyền sự kiện thời gian thực Server-Sent Events (SSE)
systemRouter.get('/realtime-stream', handleRealtimeStream);
systemRouter.get('/stream', handleRealtimeStream);

const REDIS_MAINTENANCE_KEY = 'system:maintenance:config';

// Danh sách các thư mục có thể chứa cờ bảo trì trên môi trường Docker, Local, và Nginx Host
function getMaintenancePaths(): string[] {
  return [
    path.join(process.cwd(), 'maintenance_flag'),
    path.join(process.cwd(), '..', 'maintenance_flag'),
    '/app/maintenance_flag',
    '/var/www/maintenance',
    '/var/www/museum'
  ];
}

interface MaintenanceConfig {
  enabled: boolean;
  title: string;
  message: string;
  estimatedMinutes: number;
  updatedAt: string;
  updatedBy: string;
  startTime?: string;
  expectedEndTime?: string;
  remainingMinutes?: number;
}

const DEFAULT_CONFIG: MaintenanceConfig = {
  enabled: false,
  title: 'Hệ Thống Đang Nâng Cấp & Bảo Trì',
  message: 'Bảo tàng Lịch sử TP. Hồ Chí Minh đang cập nhật dữ liệu hiện vật và bảo trì định kỳ. Trình duyệt sẽ tự động kết nối lại khi hoàn tất.',
  estimatedMinutes: 30,
  updatedAt: new Date().toISOString(),
  updatedBy: 'Hệ thống',
  startTime: new Date().toISOString(),
  expectedEndTime: new Date(Date.now() + 30 * 60000).toISOString(),
  remainingMinutes: 30
};

/**
 * Đọc trạng thái bảo trì hiện tại
 */
function readMaintenanceState(): MaintenanceConfig {
  const dirs = getMaintenancePaths();
  let hasFlag = false;
  let jsonConfig: Partial<MaintenanceConfig> | null = null;

  for (const dir of dirs) {
    const flagPath = path.join(dir, 'maintenance.flag');
    if (fs.existsSync(flagPath)) {
      hasFlag = true;
    }
    const jsonPath = path.join(dir, 'maintenance.json');
    if (!jsonConfig && fs.existsSync(jsonPath)) {
      try {
        const raw = fs.readFileSync(jsonPath, 'utf8');
        jsonConfig = JSON.parse(raw);
      } catch {
        // Ignored
      }
    }
  }

  // Luôn bảo lưu thông điệp bảo trì và số phút ước tính hợp lệ, không để giá trị rỗng/0 ghi đè
  const sanitizedTitle = jsonConfig?.title?.trim() || DEFAULT_CONFIG.title;
  const sanitizedMessage =
    !jsonConfig?.message || jsonConfig.message.includes('phục hồi hoạt động')
      ? DEFAULT_CONFIG.message
      : jsonConfig.message;
  const sanitizedMinutes =
    Number(jsonConfig?.estimatedMinutes) > 0
      ? Number(jsonConfig?.estimatedMinutes)
      : DEFAULT_CONFIG.estimatedMinutes;

  const updatedAt = jsonConfig?.updatedAt || DEFAULT_CONFIG.updatedAt;
  const isEnabled = hasFlag || (jsonConfig?.enabled ?? false);
  const updatedTime = new Date(updatedAt).getTime();
  const validUpdatedTime = isNaN(updatedTime) ? Date.now() : updatedTime;
  const expectedEndTime = new Date(validUpdatedTime + sanitizedMinutes * 60000).toISOString();
  const remainingMinutes = isEnabled
    ? Math.max(0, Math.ceil((new Date(expectedEndTime).getTime() - Date.now()) / 60000))
    : sanitizedMinutes;

  return {
    ...DEFAULT_CONFIG,
    ...(jsonConfig || {}),
    title: sanitizedTitle,
    message: sanitizedMessage,
    estimatedMinutes: sanitizedMinutes,
    enabled: isEnabled,
    updatedAt,
    startTime: new Date(validUpdatedTime).toISOString(),
    expectedEndTime,
    remainingMinutes
  };
}

/**
 * Ghi trạng thái bảo trì vào tất cả các thư mục cờ
 */
function writeMaintenanceState(config: MaintenanceConfig): void {
  const dirs = getMaintenancePaths();

  for (const dir of dirs) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const flagPath = path.join(dir, 'maintenance.flag');
      const jsonPath = path.join(dir, 'maintenance.json');

      if (config.enabled) {
        fs.writeFileSync(flagPath, 'MAINTENANCE_ACTIVE\n');
      } else {
        if (fs.existsSync(flagPath)) {
          fs.unlinkSync(flagPath);
        }
      }

      fs.writeFileSync(jsonPath, JSON.stringify(config, null, 2), 'utf8');
    } catch (err) {
      // Bỏ qua lỗi nếu không có quyền ghi ở một số đường dẫn không tồn tại
    }
  }
}

/**
 * GET /api/system/maintenance
 * Công khai: Lấy thông tin trạng thái bảo trì hệ thống
 */
systemRouter.get('/maintenance', async (req: Request, res: Response) => {
  try {
    const state = readMaintenanceState();
    res.json({
      success: true,
      maintenance: state
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Không thể đọc trạng thái bảo trì hệ thống',
      error: err.message
    });
  }
});

/**
 * POST /api/system/maintenance
 * Quản trị viên: Bật hoặc Tắt chế độ bảo trì chủ động
 */
systemRouter.post('/maintenance', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { enabled, title, message, estimatedMinutes } = req.body;

    const current = readMaintenanceState();
    const nowIso = new Date().toISOString();
    const estMin = Number(estimatedMinutes) > 0 ? Number(estimatedMinutes) : current.estimatedMinutes;
    const isEn = Boolean(enabled);
    const expEndIso = new Date(Date.now() + estMin * 60000).toISOString();

    const newConfig: MaintenanceConfig = {
      enabled: isEn,
      title: (title && String(title).trim()) || current.title,
      message: (message && String(message).trim()) || current.message,
      estimatedMinutes: estMin,
      updatedAt: nowIso,
      updatedBy: req.user?.username || 'admin',
      startTime: nowIso,
      expectedEndTime: expEndIso,
      remainingMinutes: isEn ? estMin : 0
    };

    writeMaintenanceState(newConfig);

    // Cập nhật Redis cache nếu có
    await cacheSet(REDIS_MAINTENANCE_KEY, newConfig, 86400);

    // Đồng bộ thời gian thực cho mọi client đang xem web không cần reload trang
    broadcastRealtimeEvent('maintenance_updated', newConfig);

    res.json({
      success: true,
      message: newConfig.enabled
        ? 'Đã kích hoạt chế độ bảo trì hệ thống thành công.'
        : 'Đã tắt chế độ bảo trì, hệ thống đã trở lại hoạt động bình thường.',
      maintenance: newConfig
    });
  } catch (err: any) {
    console.error('[SystemRouter] Lỗi cấu hình bảo trì:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật trạng thái bảo trì',
      error: err.message
    });
  }
});

/**
 * GET /api/system/info
 * Quản trị viên: Lấy thông số tài nguyên máy chủ và trạng thái kết nối thực tế (DB, Redis, Queue)
 */
systemRouter.get('/info', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const memory = process.memoryUsage();

    // 1. Kiểm tra cơ sở dữ liệu MongoDB thật 100%
    const dbConnected = mongoose.connection.readyState === 1;
    let dbPingMs = 0;
    let roomsCount = 0;
    let panoramasCount = 0;
    let artifactsCount = 0;
    if (dbConnected) {
      try {
        const startDb = performance.now();
        await mongoose.connection.db?.admin().ping();
        dbPingMs = Math.round(performance.now() - startDb);
        roomsCount = await RoomModel.countDocuments();
        panoramasCount = await PanoramaModel.countDocuments();
        artifactsCount = await ArtifactModel.countDocuments();
      } catch {
        dbPingMs = -1;
      }
    }

    // 2. Kiểm tra bộ nhớ đệm Redis Cache thật 100%
    let redisConnected = false;
    let redisPingMs = 0;
    let redisKeysCount = 0;
    let redisMemoryHuman = '';
    if (redisClient && redisClient.status === 'ready') {
      try {
        const startRedis = performance.now();
        await redisClient.ping();
        redisPingMs = Math.round(performance.now() - startRedis);
        redisConnected = true;
        redisKeysCount = await redisClient.dbsize();
        const memInfo = await redisClient.info('memory');
        const match = memInfo.match(/used_memory_human:([^\r\n]+)/);
        if (match) redisMemoryHuman = match[1].trim();
      } catch {
        redisConnected = false;
      }
    } else {
      redisConnected = Boolean(getRedisStatus()?.connected);
    }

    // 3. Kiểm tra hàng đợi tác vụ độc lập (Stitching Queue & 3D Reconstruction Queue) thật 100%
    const stitchingQueuePending = await getQueueLength('stitching');
    const artifact3dQueuePending = await getQueueLength('artifact_3d');

    res.json({
      success: true,
      info: {
        serverTime: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memoryRssMb: Math.round(memory.rss / 1024 / 1024),
        memoryHeapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
        redisConnected,
        environment: process.env.NODE_ENV || 'production',
        database: {
          connected: dbConnected,
          name: mongoose.connection.name || 'museum',
          roomsCount,
          panoramasCount,
          artifactsCount,
          pingMs: dbPingMs
        },
        postgres: {
          connected: getPgStatus().connected,
          uri: getPgStatus().uri,
          type: 'Primary Relational Database (CSDL Quan Hệ Gốc)'
        },
        redis: {
          connected: redisConnected,
          keysCount: redisKeysCount,
          pingMs: redisPingMs,
          memoryUsedHuman: redisMemoryHuman || 'OK'
        },
        rabbitmq: {
          connected: getRabbitMQStatus().connected,
          uri: getRabbitMQStatus().uri,
          type: 'Enterprise Message Broker (AMQP)'
        },
        queue: {
          name: 'stitching',
          pendingJobs: stitchingQueuePending,
          status: stitchingQueuePending > 0 ? 'processing' : 'ready'
        },
        queues: {
          stitching: {
            name: 'queue:stitching',
            pendingJobs: stitchingQueuePending,
            status: stitchingQueuePending > 0 ? 'processing' : 'ready'
          },
          artifact3d: {
            name: 'queue:artifact_3d',
            pendingJobs: artifact3dQueuePending,
            status: artifact3dQueuePending > 0 ? 'processing' : 'ready'
          }
        },
        publicIp: req.get('host')?.replace(/:\d+$/, '') || process.env.PUBLIC_API_URL?.replace(/https?:\/\//, '') || 'museumhcm.duckdns.org',
        domain: 'museumhcm.duckdns.org'
      }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi đọc thông tin hệ thống',
      error: err.message
    });
  }
});

/**
 * GET /api/system/branding
 * Công khai: Lấy cấu hình nhận diện thương hiệu của Bảo tàng (cho Client, Tour 360, Header, Login, Maintenance)
 */
systemRouter.get('/branding', async (req: Request, res: Response) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const branding = await getSystemBrandingConfig();
    res.json({
      success: true,
      branding
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Không thể tải cấu hình nhận diện bảo tàng',
      error: err.message
    });
  }
});

/**
 * GET /api/system/favicon
 * Phục vụ Favicon động chuẩn xác 100% theo logo thương hiệu thực tế của Bảo tàng
 * Nếu bảo tàng có logo ảnh (Cloudinary / File upload) -> Chuyển hướng trực tiếp 307
 * Nếu bảo tàng dùng biểu trưng chữ (Emblem) -> Sinh SVG sắc nét đúng chuẩn
 */
systemRouter.get('/favicon', async (req: Request, res: Response) => {
  try {
    const branding = await getSystemBrandingConfig();
    const logoUrl = branding.logoUrl && String(branding.logoUrl).trim();

    if (logoUrl) {
      res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
      return res.redirect(307, logoUrl);
    }

    const emblem = (branding.emblemText || 'BT').trim() || 'BT';
    const fontSize = emblem.length > 2 ? (emblem.length > 3 ? 18 : 22) : 28;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><defs><linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#8C2D19"/><stop offset="100%" stop-color="#5A1A0C"/></linearGradient><linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#F3E5AB"/><stop offset="50%" stop-color="#D4A86A"/><stop offset="100%" stop-color="#AA7C39"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#bgGrad)"/><rect x="2" y="2" width="60" height="60" rx="12" fill="none" stroke="url(#goldGrad)" stroke-width="2.5" stroke-opacity="0.85"/><text x="32" y="44" font-family="'Be Vietnam Pro', system-ui, -apple-system, sans-serif, Arial" font-size="${fontSize}" font-weight="800" text-anchor="middle" fill="#FFFFFF" letter-spacing="1">${emblem}</text></svg>`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    return res.send(svg);
  } catch (err: any) {
    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="14" fill="#8C2D19"/><text x="32" y="44" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="#FFF">BT</text></svg>`;
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(fallbackSvg);
  }
});

/**
 * POST /api/system/branding
 * Quản trị viên: Cập nhật cấu hình nhận diện thương hiệu bảo tàng (Tên, Logo, Biểu trưng, Địa chỉ, Email, ...)
 */
systemRouter.post('/branding', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const current = await getSystemBrandingConfig();

    const targetMuseumName = req.body.museumName !== undefined && String(req.body.museumName).trim()
      ? String(req.body.museumName).trim()
      : current.museumName;

    const targetShortName = req.body.shortName !== undefined && String(req.body.shortName).trim()
      ? String(req.body.shortName).trim()
      : current.shortName;

    if (!targetMuseumName) {
      return res.status(400).json({
        success: false,
        message: 'Tên đầy đủ của bảo tàng không được để trống.'
      });
    }

    if (!targetShortName) {
      return res.status(400).json({
        success: false,
        message: 'Tên rút gọn của bảo tàng không được để trống.'
      });
    }

    const {
      emblemText,
      logoUrl,
      tagline,
      city,
      address,
      contactEmail,
      hotline,
      emailSenderName
    } = req.body;

    const updatePayload = {
      museumName: targetMuseumName,
      shortName: targetShortName,
      emblemText: (emblemText && String(emblemText).trim().toUpperCase().slice(0, 6)) || current.emblemText || 'BT',
      logoUrl: logoUrl !== undefined ? String(logoUrl).trim() : current.logoUrl,
      tagline: tagline !== undefined ? String(tagline).trim() : current.tagline,
      city: city !== undefined ? String(city).trim() : current.city,
      address: address !== undefined ? String(address).trim() : current.address,
      contactEmail: contactEmail !== undefined ? String(contactEmail).trim() : current.contactEmail,
      hotline: hotline !== undefined ? String(hotline).trim() : current.hotline,
      emailSenderName: emailSenderName !== undefined ? String(emailSenderName).trim() : current.emailSenderName,
      // Header Dynamic Menu Items (Hỗ trợ Dropdown đa cấp)
      headerMenuItems: req.body.headerMenuItems !== undefined ? req.body.headerMenuItems : current.headerMenuItems,
      // Hero Showcase
      heroTitle: req.body.heroTitle !== undefined ? String(req.body.heroTitle).trim() : current.heroTitle,
      heroTagline: req.body.heroTagline !== undefined ? String(req.body.heroTagline).trim() : current.heroTagline,
      heroBannerUrl: req.body.heroBannerUrl !== undefined ? String(req.body.heroBannerUrl).trim() : current.heroBannerUrl,
      heroVideoUrl: req.body.heroVideoUrl !== undefined ? String(req.body.heroVideoUrl).trim() : current.heroVideoUrl,
      heroCta1Text: req.body.heroCta1Text !== undefined ? String(req.body.heroCta1Text).trim() : current.heroCta1Text,
      heroCta2Text: req.body.heroCta2Text !== undefined ? String(req.body.heroCta2Text).trim() : current.heroCta2Text,
      // Intro Section
      introTag: req.body.introTag !== undefined ? String(req.body.introTag).trim() : current.introTag,
      introTitle: req.body.introTitle !== undefined ? String(req.body.introTitle).trim() : current.introTitle,
      introDesc: req.body.introDesc !== undefined ? String(req.body.introDesc).trim() : current.introDesc,
      introBadgeText: req.body.introBadgeText !== undefined ? String(req.body.introBadgeText).trim() : current.introBadgeText,
      introImageUrl: req.body.introImageUrl !== undefined ? String(req.body.introImageUrl).trim() : current.introImageUrl,
      introCtaText: req.body.introCtaText !== undefined ? String(req.body.introCtaText).trim() : current.introCtaText,
      // Rooms Section
      roomsTag: req.body.roomsTag !== undefined ? String(req.body.roomsTag).trim() : current.roomsTag,
      roomsTitle: req.body.roomsTitle !== undefined ? String(req.body.roomsTitle).trim() : current.roomsTitle,
      roomsDesc: req.body.roomsDesc !== undefined ? String(req.body.roomsDesc).trim() : current.roomsDesc,
      roomsCtaText: req.body.roomsCtaText !== undefined ? String(req.body.roomsCtaText).trim() : current.roomsCtaText,
      roomsFeaturedId: req.body.roomsFeaturedId !== undefined ? String(req.body.roomsFeaturedId).trim() : current.roomsFeaturedId,
      roomsShowcaseImageUrl: req.body.roomsShowcaseImageUrl !== undefined ? String(req.body.roomsShowcaseImageUrl).trim() : current.roomsShowcaseImageUrl,
      // Artifacts Section
      artifactsTag: req.body.artifactsTag !== undefined ? String(req.body.artifactsTag).trim() : current.artifactsTag,
      artifactsTitle: req.body.artifactsTitle !== undefined ? String(req.body.artifactsTitle).trim() : current.artifactsTitle,
      artifactsDesc: req.body.artifactsDesc !== undefined ? String(req.body.artifactsDesc).trim() : current.artifactsDesc,
      artifactsCtaText: req.body.artifactsCtaText !== undefined ? String(req.body.artifactsCtaText).trim() : current.artifactsCtaText,
      artifactsFeaturedId: req.body.artifactsFeaturedId !== undefined ? String(req.body.artifactsFeaturedId).trim() : current.artifactsFeaturedId,
      artifactsShowcaseImageUrl: req.body.artifactsShowcaseImageUrl !== undefined ? String(req.body.artifactsShowcaseImageUrl).trim() : current.artifactsShowcaseImageUrl,
      // Guide & Floor Plan Section
      guideTag: req.body.guideTag !== undefined ? String(req.body.guideTag).trim() : current.guideTag,
      guideTitle: req.body.guideTitle !== undefined ? String(req.body.guideTitle).trim() : current.guideTitle,
      guideDesc: req.body.guideDesc !== undefined ? String(req.body.guideDesc).trim() : current.guideDesc,
      guideCtaText: req.body.guideCtaText !== undefined ? String(req.body.guideCtaText).trim() : current.guideCtaText,
      guideMapUrl: req.body.guideMapUrl !== undefined ? String(req.body.guideMapUrl).trim() : current.guideMapUrl,
      guideMapTitle: req.body.guideMapTitle !== undefined ? String(req.body.guideMapTitle).trim() : current.guideMapTitle,
      guideMapDesc: req.body.guideMapDesc !== undefined ? String(req.body.guideMapDesc).trim() : current.guideMapDesc,
      // Thông tin thực địa & Bản đồ Google Maps do Admin quản lý
      guideOpeningDays: req.body.guideOpeningDays !== undefined ? String(req.body.guideOpeningDays).trim() : current.guideOpeningDays,
      guideMorningHours: req.body.guideMorningHours !== undefined ? String(req.body.guideMorningHours).trim() : current.guideMorningHours,
      guideAfternoonHours: req.body.guideAfternoonHours !== undefined ? String(req.body.guideAfternoonHours).trim() : current.guideAfternoonHours,
      guideClosedNote: req.body.guideClosedNote !== undefined ? String(req.body.guideClosedNote).trim() : current.guideClosedNote,
      guideTicketAdult: req.body.guideTicketAdult !== undefined ? String(req.body.guideTicketAdult).trim() : current.guideTicketAdult,
      guideTicketStudent: req.body.guideTicketStudent !== undefined ? String(req.body.guideTicketStudent).trim() : current.guideTicketStudent,
      guideTicketChild: req.body.guideTicketChild !== undefined ? String(req.body.guideTicketChild).trim() : current.guideTicketChild,
      guideBusRoutes: req.body.guideBusRoutes !== undefined ? String(req.body.guideBusRoutes).trim() : current.guideBusRoutes,
      guideParkingInfo: req.body.guideParkingInfo !== undefined ? String(req.body.guideParkingInfo).trim() : current.guideParkingInfo,
      guideGoogleMapsUrl: req.body.guideGoogleMapsUrl !== undefined ? String(req.body.guideGoogleMapsUrl).trim() : current.guideGoogleMapsUrl,
      guideGoogleMapsEmbed: req.body.guideGoogleMapsEmbed !== undefined ? String(req.body.guideGoogleMapsEmbed).trim() : current.guideGoogleMapsEmbed,
      guideRule1Title: req.body.guideRule1Title !== undefined ? String(req.body.guideRule1Title).trim() : current.guideRule1Title,
      guideRule1Desc: req.body.guideRule1Desc !== undefined ? String(req.body.guideRule1Desc).trim() : current.guideRule1Desc,
      guideRule2Title: req.body.guideRule2Title !== undefined ? String(req.body.guideRule2Title).trim() : current.guideRule2Title,
      guideRule2Desc: req.body.guideRule2Desc !== undefined ? String(req.body.guideRule2Desc).trim() : current.guideRule2Desc,
      guideRule3Title: req.body.guideRule3Title !== undefined ? String(req.body.guideRule3Title).trim() : current.guideRule3Title,
      guideRule3Desc: req.body.guideRule3Desc !== undefined ? String(req.body.guideRule3Desc).trim() : current.guideRule3Desc,
      guideRule4Title: req.body.guideRule4Title !== undefined ? String(req.body.guideRule4Title).trim() : current.guideRule4Title,
      guideRule4Desc: req.body.guideRule4Desc !== undefined ? String(req.body.guideRule4Desc).trim() : current.guideRule4Desc,
      // Footer
      footerCopyrightText: req.body.footerCopyrightText !== undefined ? String(req.body.footerCopyrightText).trim() : current.footerCopyrightText,
      updatedBy: req.user?.username || 'admin'
    };

    let updatedDoc = await SystemBranding.findOneAndUpdate(
      {},
      { $set: updatePayload },
      { new: true, upsert: true }
    ).lean();

    // Đồng bộ lập tức sang PostgreSQL Primary
    await pgUpsertBranding(updatedDoc);
    await logAudit('UPDATE_BRANDING', 'system_branding', { details: { museumName: updatePayload.museumName } });

    // Cập nhật ngay lập tức Redis cache để mọi dịch vụ dùng dữ liệu mới (<1ms)
    try {
      await cacheSet(REDIS_BRANDING_KEY, updatedDoc, 86400);
    } catch {}

    // Phát sóng đồng bộ thời gian thực cho toàn bộ Client mà không cần F5/Reload trang
    broadcastRealtimeEvent('branding_updated', updatedDoc);

    console.log(`[SystemBranding] Quản trị viên (${req.user?.username}) đã cập nhật nhận diện bảo tàng: ${updatePayload.museumName}`);

    res.json({
      success: true,
      message: 'Cập nhật cấu hình nhận diện bảo tàng thành công! Toàn bộ hệ thống đã được đồng bộ.',
      branding: updatedDoc
    });
  } catch (err: any) {
    console.error('[SystemBranding] Lỗi cập nhật cấu hình thương hiệu:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật cấu hình nhận diện',
      error: err.message
    });
  }
});

/**
 * GET /api/system/audit-logs
 * Lấy danh sách nhật ký kiểm toán từ MongoDB (hỗ trợ phân trang và lọc theo action, resource, username)
 */
systemRouter.get('/audit-logs', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.action) {
      filter.action = req.query.action;
    }
    if (req.query.resource) {
      filter.resource = req.query.resource;
    }
    if (req.query.username) {
      filter.username = { $regex: req.query.username as string, $options: 'i' };
    }

    const [logs, total] = await Promise.all([
      AuditLogModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLogModel.countDocuments(filter)
    ]);

    res.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi truy xuất danh sách nhật ký kiểm toán từ MongoDB',
      error: err.message
    });
  }
});

/**
 * POST /api/system/audit-logs/sync
 * Kích hoạt đồng bộ tức thời nhật ký kiểm toán từ PostgreSQL sang MongoDB
 */
systemRouter.post('/audit-logs/sync', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    await syncAuditLogs();
    const count = await AuditLogModel.countDocuments();
    res.json({
      success: true,
      message: `Đã đồng bộ toàn bộ nhật ký kiểm toán thành công! Hiện có ${count} bản ghi trong MongoDB.`,
      totalInMongo: count
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đồng bộ nhật ký kiểm toán',
      error: err.message
    });
  }
});


