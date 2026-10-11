import fs from 'fs';
import path from 'path';
import http from 'http';
import { cloudinary } from './cloudinary.js';
import { systemLogger } from './systemLogger.js';
import { logAudit } from '../db/postgres.js';
import { RoomModel } from '../models/Room.js';
import { PanoramaModel } from '../models/Panorama.js';
import { ArtifactModel } from '../models/Artifact.js';
import { FloorPlanMapModel } from '../models/FloorPlanMap.js';
import { SystemBranding } from '../models/SystemBranding.js';
import { User } from '../models/User.js';
import { Topic } from '../models/Topic.js';
import { SystemLogModel } from '../models/SystemLog.js';
import { redisClient, cacheGet, cacheSet } from './redis.js';

export interface AutoCleanupConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly';
  cleanDocker: boolean;
  cleanCloudinary: boolean;
  cleanMongoBotLogs: boolean;
  cleanAppTemp: boolean;
  lastRunAt?: string;
  lastResult?: {
    freedGb: number;
    dockerCleaned: boolean;
    cloudinaryDeletedCount: number;
    mongoLogsDeletedCount: number;
    tempFilesCount: number;
    actionsTaken: string[];
  };
}

const REDIS_CONFIG_KEY = 'system:cleanup:config';

let inMemoryConfig: AutoCleanupConfig = {
  enabled: true,
  frequency: 'daily',
  cleanDocker: true,
  cleanCloudinary: true,
  cleanMongoBotLogs: true,
  cleanAppTemp: true
};

/**
 * Lấy cấu hình dọn dẹp định kỳ
 */
export async function getScheduledCleanupConfig(): Promise<AutoCleanupConfig> {
  try {
    const cached = await cacheGet<AutoCleanupConfig>(REDIS_CONFIG_KEY);
    if (cached) {
      inMemoryConfig = { ...inMemoryConfig, ...cached };
    }
  } catch {
    // fallback in-memory
  }
  return inMemoryConfig;
}

/**
 * Cập nhật cấu hình dọn dẹp định kỳ
 */
export async function updateScheduledCleanupConfig(patch: Partial<AutoCleanupConfig>): Promise<AutoCleanupConfig> {
  const current = await getScheduledCleanupConfig();
  const updated: AutoCleanupConfig = {
    ...current,
    ...patch
  };
  inMemoryConfig = updated;
  try {
    await cacheSet(REDIS_CONFIG_KEY, updated, 30 * 24 * 3600);
  } catch {
    // fallback
  }
  return updated;
}

/**
 * Gọi Docker Engine API qua Unix domain socket
 */
function callDockerSocketApi(method: string, apiPath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const socketPath = '/var/run/docker.sock';
    if (!fs.existsSync(socketPath)) {
      return reject(new Error('DOCKER_SOCKET_NOT_FOUND'));
    }
    const req = http.request({
      socketPath,
      path: apiPath,
      method,
      headers: { 'Host': 'localhost' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(60000, () => {
      req.destroy();
      reject(new Error('DOCKER_API_TIMEOUT'));
    });
    req.end();
  });
}

/**
 * Trích xuất toàn bộ URL và public_id hình ảnh đang thực sự được dùng trong CSDL
 */
async function getAllActiveImageReferences(): Promise<Set<string>> {
  const refs = new Set<string>();

  const addIfStr = (val: any) => {
    if (!val) return;
    if (typeof val === 'string' && val.trim().length > 0) {
      const trimmed = val.trim();
      refs.add(trimmed);
      // Trích xuất public_id trong URL Cloudinary
      // VD: https://res.cloudinary.com/djkif9ubs/image/upload/v1728639234/museum/panoramas_360/sample_1.jpg -> museum/panoramas_360/sample_1
      const m = trimmed.match(/museum\/[^?#\s]+/);
      if (m) {
        const cleanId = m[0].replace(/\.[^/.]+$/, '');
        refs.add(cleanId);
      }
    } else if (Array.isArray(val)) {
      val.forEach(addIfStr);
    } else if (typeof val === 'object') {
      Object.values(val).forEach(addIfStr);
    }
  };

  try {
    const [rooms, panos, artifacts, floorPlans, brandings, users, topics] = await Promise.all([
      RoomModel.find({}).lean(),
      PanoramaModel.find({}).lean(),
      ArtifactModel.find({}).lean(),
      FloorPlanMapModel.find({}).lean(),
      SystemBranding.find({}).lean(),
      User.find({}).lean(),
      Topic.find({}).lean()
    ]);

    (rooms as any[]).forEach((r: any) => {
      addIfStr(r.thumbnail);
      addIfStr(r.coverImage);
      addIfStr(r.floorPlan);
    });

    (panos as any[]).forEach((p: any) => {
      addIfStr(p.url);
      addIfStr(p.cloudinaryUrl);
      addIfStr(p.thumbnailUrl);
      addIfStr(p.cubemapUrls);
    });

    (artifacts as any[]).forEach((a: any) => {
      addIfStr(a.thumbnail);
      addIfStr(a.images);
      addIfStr(a.modelUrl);
    });

    (floorPlans as any[]).forEach((fp: any) => {
      addIfStr(fp.imageUrl);
      addIfStr(fp.thumbnailUrl);
    });

    (brandings as any[]).forEach((b: any) => {
      addIfStr(b.logoUrl);
      addIfStr(b.heroBannerUrl);
      addIfStr(b.brandingAssets);
    });

    (users as any[]).forEach((u: any) => {
      addIfStr(u.avatar);
      addIfStr(u.avatarUrl);
    });

    (topics as any[]).forEach((t: any) => {
      addIfStr(t.icon);
      addIfStr(t.thumbnail);
    });
  } catch (err) {
    console.error('[Scheduled Cleanup] Lỗi nạp active image references:', err);
  }

  return refs;
}

/**
 * Quét các ảnh mồ côi (không còn liên kết trong DB) trên Cloudinary
 */
export async function scanOrphanedCloudinaryImages(maxInspect = 500): Promise<{
  totalScanned: number;
  orphanedList: Array<{ public_id: string; secure_url: string; bytes: number; created_at: string }>;
}> {
  const activeRefs = await getAllActiveImageReferences();
  const orphanedList: Array<{ public_id: string; secure_url: string; bytes: number; created_at: string }> = [];
  let totalScanned = 0;

  try {
    // Quét folder gốc 'museum' trên Cloudinary
    const res = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'museum/',
      max_results: maxInspect
    });

    const resources = res.resources || [];
    totalScanned = resources.length;
    const now = Date.now();
    const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000; // Bảo lưu an toàn ảnh tạo trong 24h qua

    for (const r of resources) {
      const publicId = r.public_id;
      const secureUrl = r.secure_url;
      const createdAtMs = new Date(r.created_at).getTime();

      // Nếu ảnh mới tải lên dưới 24h -> bỏ qua không xóa để tránh xung đột
      if (now - createdAtMs < GRACE_PERIOD_MS) {
        continue;
      }

      let isUsed = false;
      if (activeRefs.has(publicId) || activeRefs.has(secureUrl)) {
        isUsed = true;
      } else {
        for (const ref of activeRefs) {
          if (ref.includes(publicId) || secureUrl.includes(ref)) {
            isUsed = true;
            break;
          }
        }
      }

      if (!isUsed) {
        orphanedList.push({
          public_id: publicId,
          secure_url: secureUrl,
          bytes: r.bytes || 0,
          created_at: r.created_at
        });
      }
    }
  } catch (err: any) {
    console.warn('[Cloudinary Prune] Không thể kết nối Cloudinary API:', err.message);
  }

  return { totalScanned, orphanedList };
}

/**
 * Xóa danh sách ảnh mồ côi trên Cloudinary
 */
export async function deleteOrphanedCloudinaryImages(publicIds: string[]): Promise<number> {
  if (!publicIds || publicIds.length === 0) return 0;
  try {
    let deletedCount = 0;
    const batchSize = 100;
    for (let i = 0; i < publicIds.length; i += batchSize) {
      const batch = publicIds.slice(i, i + batchSize);
      const res = await cloudinary.api.delete_resources(batch);
      const deletedMap = res.deleted || {};
      deletedCount += Object.keys(deletedMap).length;
    }
    return deletedCount;
  } catch (err: any) {
    console.error('[Cloudinary Prune] Lỗi xóa ảnh:', err);
    return 0;
  }
}

/**
 * Thực thi dọn dẹp toàn diện (VPS SSD, Docker, MongoDB Bot Logs, Cloudinary Orphaned Assets)
 */
export async function executeComprehensiveCleanup(options: {
  cleanDocker?: boolean;
  cleanCloudinary?: boolean;
  cleanMongoBotLogs?: boolean;
  cleanAppTemp?: boolean;
  isScheduled?: boolean;
  user?: { id?: string; username?: string };
} = {}): Promise<{
  success: boolean;
  message: string;
  freedGb: number;
  dockerCleaned: boolean;
  cloudinaryDeletedCount: number;
  mongoLogsDeletedCount: number;
  tempFilesCount: number;
  actionsTaken: string[];
  beforeStats: any;
  afterStats: any;
}> {
  const config = await getScheduledCleanupConfig();
  const doDocker = options.cleanDocker ?? config.cleanDocker;
  const doCloudinary = options.cleanCloudinary ?? config.cleanCloudinary;
  const doMongo = options.cleanMongoBotLogs ?? config.cleanMongoBotLogs;
  const doTemp = options.cleanAppTemp ?? config.cleanAppTemp;

  const getDiskStats = () => {
    try {
      const checkPath = process.platform === 'win32' ? process.cwd().substring(0, 3) : '/';
      const stat = (fs as any).statfsSync(checkPath);
      const bsize = stat.bsize || 4096;
      const totalB = Number(stat.blocks) * bsize;
      const freeB = Number(stat.bavail ?? stat.bfree) * bsize;
      const usedB = totalB - freeB;
      return {
        totalGb: +(totalB / (1024 * 1024 * 1024)).toFixed(1),
        usedGb: +(usedB / (1024 * 1024 * 1024)).toFixed(1),
        freeGb: +(freeB / (1024 * 1024 * 1024)).toFixed(1),
        percent: Math.min(100, Math.max(0, Math.round((usedB / totalB) * 100)))
      };
    } catch {
      return null;
    }
  };

  const beforeStats = getDiskStats();
  const actionsTaken: string[] = [];
  let dockerCleaned = false;
  let cloudinaryDeletedCount = 0;
  let mongoLogsDeletedCount = 0;
  let tempFilesCount = 0;

  // 1. Docker BuildKit Cache & Dangling Images Prune
  if (doDocker && fs.existsSync('/var/run/docker.sock')) {
    try {
      await Promise.allSettled([
        callDockerSocketApi('POST', '/build/prune?all=true&keep-storage=0'),
        callDockerSocketApi('POST', '/images/prune?filters=%7B%22dangling%22%3A%5B%22true%22%5D%7D'),
        callDockerSocketApi('POST', '/containers/prune')
      ]);
      dockerCleaned = true;
      actionsTaken.push('Đã giải phóng BuildKit Cache & Docker Images cũ');
      actionsTaken.push('Đã dọn dẹp các container đã dừng');
    } catch (dockerErr: any) {
      console.warn('[Cleanup Engine] Docker prune cảnh báo:', dockerErr?.message);
    }
  }

  // 2. Cloudinary Orphaned Images Prune
  if (doCloudinary) {
    try {
      const { orphanedList } = await scanOrphanedCloudinaryImages(300);
      if (orphanedList.length > 0) {
        const publicIds = orphanedList.map(o => o.public_id);
        cloudinaryDeletedCount = await deleteOrphanedCloudinaryImages(publicIds);
        if (cloudinaryDeletedCount > 0) {
          actionsTaken.push(`Đã dọn ${cloudinaryDeletedCount} ảnh mồ côi không dùng trên Cloudinary`);
        }
      }
    } catch (cErr: any) {
      console.warn('[Cleanup Engine] Cloudinary prune cảnh báo:', cErr?.message);
    }
  }

  // 3. MongoDB Bot 404 Scanner Logs
  if (doMongo) {
    try {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const botUrls = ['/service-account.json', '/.env', '/pdown', '/api/mcp', '/login', '/api/v1/version', '/api/.env'];
      const deleteResult = await SystemLogModel.deleteMany({
        $or: [
          { path: { $in: botUrls }, statusCode: 404 },
          { level: 'INFO', createdAt: { $lt: threeDaysAgo } }
        ]
      });
      mongoLogsDeletedCount = deleteResult.deletedCount || 0;
      if (mongoLogsDeletedCount > 0) {
        actionsTaken.push(`Đã dọn ${mongoLogsDeletedCount} bản ghi log bot scanner 404 MongoDB`);
      }
    } catch (mErr: any) {
      console.warn('[Cleanup Engine] MongoDB logs cleanup cảnh báo:', mErr?.message);
    }
  }

  // 4. Temporary Application Files
  if (doTemp) {
    const tempDirs = [
      path.join(process.cwd(), 'scratch'),
      path.join(process.cwd(), 'storage', 'temp'),
      path.join(process.cwd(), 'public', 'uploads', 'temp')
    ];
    for (const d of tempDirs) {
      if (fs.existsSync(d)) {
        try {
          const files = fs.readdirSync(d);
          for (const f of files) {
            const fp = path.join(d, f);
            try {
              if (fs.statSync(fp).isFile()) {
                fs.unlinkSync(fp);
                tempFilesCount++;
              }
            } catch {}
          }
        } catch {}
      }
    }
    if (tempFilesCount > 0) {
      actionsTaken.push(`Đã dọn ${tempFilesCount} tệp tạm/cache ứng dụng`);
    }
  }

  const afterStats = getDiskStats();
  const freedGb = (beforeStats && afterStats) ? Math.max(0, +(beforeStats.usedGb - afterStats.usedGb).toFixed(1)) : 0;

  const resultSummary = {
    freedGb,
    dockerCleaned,
    cloudinaryDeletedCount,
    mongoLogsDeletedCount,
    tempFilesCount,
    actionsTaken
  };

  // Cập nhật trạng thái lần chạy gần nhất
  await updateScheduledCleanupConfig({
    lastRunAt: new Date().toISOString(),
    lastResult: resultSummary
  });

  // Ghi nhật ký kiểm toán & system logger
  try {
    await logAudit(
      options.isScheduled ? 'SCHEDULED_SYSTEM_CLEANUP' : 'MANUAL_SYSTEM_CLEANUP',
      'SYSTEM',
      {
        userId: options.user?.id || 'system',
        username: options.user?.username || (options.isScheduled ? 'Tự động định kỳ' : 'Admin'),
        details: { ...resultSummary, beforeStats, afterStats }
      }
    );

    await systemLogger.info('SYSTEM', 'CLEANUP_ENGINE', `Dọn dẹp hệ thống hoàn tất (Giải phóng: ${freedGb} GB, ${cloudinaryDeletedCount} ảnh Cloudinary)`, {
      details: resultSummary
    });
  } catch {}

  return {
    success: true,
    message: `Đã dọn dẹp hệ thống thành công! Giải phóng ~${freedGb} GB SSD & ${cloudinaryDeletedCount} ảnh Cloudinary thừa.`,
    freedGb,
    dockerCleaned,
    cloudinaryDeletedCount,
    mongoLogsDeletedCount,
    tempFilesCount,
    actionsTaken,
    beforeStats,
    afterStats
  };
}

/**
 * Khởi động tiến trình kiểm tra & chạy dọn dẹp tự động định kỳ
 */
export function startPeriodicSystemCleanupJob() {
  console.log('[Scheduled Cleanup] Đã kích hoạt công cụ tự động dọn rác định kỳ (Mỗi ngày lúc 03:00 AM)...');

  // Kiểm tra mỗi 30 phút
  setInterval(async () => {
    try {
      const config = await getScheduledCleanupConfig();
      if (!config.enabled) return;

      const now = new Date();
      const currentHour = now.getHours();

      // Nếu là khung giờ đêm 02:00 - 04:00 sáng
      const isNightTime = currentHour >= 2 && currentHour <= 4;
      let shouldRun = false;

      if (!config.lastRunAt) {
        shouldRun = isNightTime;
      } else {
        const lastRunTime = new Date(config.lastRunAt).getTime();
        const diffHours = (Date.now() - lastRunTime) / (1000 * 60 * 60);

        if (config.frequency === 'daily' && diffHours >= 23 && isNightTime) {
          shouldRun = true;
        } else if (config.frequency === 'weekly' && diffHours >= 166 && isNightTime) {
          shouldRun = true;
        }
      }

      if (shouldRun) {
        console.log('[Scheduled Cleanup] Bắt đầu chu kỳ dọn dẹp rác tự động định kỳ...');
        await executeComprehensiveCleanup({ isScheduled: true });
      }
    } catch (err: any) {
      console.error('[Scheduled Cleanup Job Error]:', err.message);
    }
  }, 30 * 60 * 1000);
}
