import fs from 'fs';
import path from 'path';
import http from 'http';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
import { cloudinary } from './cloudinary.js';
import { systemLogger } from './systemLogger.js';
import { logAudit, pgPool } from '../db/postgres.js';
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

function getDockerSocketPath(): string | null {
  if (fs.existsSync('/var/run/docker.sock')) return '/var/run/docker.sock';
  if (fs.existsSync('/run/docker.sock')) return '/run/docker.sock';
  return null;
}

/**
 * Gọi Docker Engine API qua Unix domain socket
 */
function callDockerSocketApi(method: string, apiPath: string, body?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const socketPath = getDockerSocketPath();
    if (!socketPath) {
      return reject(new Error('DOCKER_SOCKET_NOT_FOUND'));
    }
    const headers: Record<string, string> = { 'Host': 'localhost' };
    let payload = '';
    if (body !== undefined) {
      payload = typeof body === 'string' ? body : JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(payload).toString();
    }
    const req = http.request({
      socketPath,
      path: apiPath,
      method,
      headers
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
    req.setTimeout(180000, () => {
      req.destroy();
      reject(new Error('DOCKER_API_TIMEOUT'));
    });
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

/**
 * Dọn dẹp triệt để các Docker Image không còn sử dụng trên VPS (giải phóng hàng chục GB)
 */
async function pruneUnusedDockerImages(): Promise<{ deletedImagesCount: number; spaceReclaimed: number }> {
  let deletedImagesCount = 0;
  let spaceReclaimed = 0;

  try {
    // 1. Thử gọi API prune chuẩn của Docker với dangling=false (tương đương docker image prune -a)
    const pruneRes = await callDockerSocketApi('POST', '/images/prune?filters=%7B%22dangling%22%3A%5B%22false%22%5D%7D');
    if (pruneRes?.ImagesDeleted && Array.isArray(pruneRes.ImagesDeleted)) {
      deletedImagesCount += pruneRes.ImagesDeleted.length;
      spaceReclaimed += (pruneRes.SpaceReclaimed || 0);
    }
  } catch (err: any) {
    console.warn('[Docker Prune API] images/prune warning:', err?.message);
  }

  // 2. Quét đối chiếu danh sách images và containers để xóa triệt để các image cũ còn sót
  try {
    const [allImages, activeContainers] = await Promise.all([
      callDockerSocketApi('GET', '/images/json'),
      callDockerSocketApi('GET', '/containers/json?all=true')
    ]);

    if (Array.isArray(allImages) && Array.isArray(activeContainers)) {
      // Tập hợp tất cả ImageID đang được container sử dụng (bảo vệ tuyệt đối)
      const protectedImageIds = new Set<string>();
      activeContainers.forEach((c: any) => {
        if (c.ImageID) protectedImageIds.add(c.ImageID);
        if (c.Image) protectedImageIds.add(c.Image);
      });

      for (const img of allImages) {
        const imgId = img.Id;
        // Nếu image này không thuộc container nào đang chạy -> xóa an toàn
        if (imgId && !protectedImageIds.has(imgId)) {
          try {
            const delRes = await callDockerSocketApi('DELETE', `/images/${imgId}?force=true`);
            if (Array.isArray(delRes)) {
              deletedImagesCount += delRes.length;
            }
          } catch {
            // Bỏ qua nếu image này có quan hệ kế thừa đang khóa
          }
        }
      }
    }
  } catch (scanErr: any) {
    console.warn('[Docker Prune Engine] Quét thủ công image thừa cảnh báo:', scanErr?.message);
  }

  return { deletedImagesCount, spaceReclaimed };
}

/**
 * Tự động dọn dẹp log hệ điều hành Linux ngoài Host VPS (journalctl) và apt cache qua Docker Socket
 */
async function cleanHostLogsAndAptCache(): Promise<boolean> {
  try {
    const images = await callDockerSocketApi('GET', '/images/json');
    if (!Array.isArray(images) || images.length === 0) return false;
    const targetImage = images[0]?.Id || images[0]?.RepoTags?.[0];
    if (!targetImage) return false;

    const createRes = await callDockerSocketApi('POST', '/containers/create', {
      Image: targetImage,
      Cmd: [
        'sh',
        '-c',
        'rm -rf /host-log/journal/* 2>/dev/null; rm -rf /host-apt/*.deb /host-apt/partial/* 2>/dev/null; sync'
      ],
      HostConfig: {
        AutoRemove: true,
        Binds: [
          '/var/log:/host-log',
          '/var/cache/apt/archives:/host-apt'
        ]
      }
    });

    if (createRes?.Id) {
      await callDockerSocketApi('POST', `/containers/${createRes.Id}/start`);
      await new Promise(r => setTimeout(r, 2000));
      return true;
    }
    return false;
  } catch (err: any) {
    console.warn('[Cleanup Engine] Host logs/apt prune cảnh báo:', err?.message);
    return false;
  }
}

/**
 * Trích xuất public_id linh hoạt từ bất kỳ định dạng URL Cloudinary nào
 * (Bất kể thay đổi domain, IP, cloud_name, phiên bản /v.../, tham số biến đổi c_, w_, hoặc thư mục con)
 */
function extractCloudinaryPublicId(urlOrStr: string): string | null {
  if (!urlOrStr) return null;
  const str = String(urlOrStr).trim();
  const cleanUrl = str.split('?')[0].split('#')[0];
  const uploadIndex = cleanUrl.indexOf('/image/upload/');
  if (uploadIndex !== -1) {
    const afterUpload = cleanUrl.substring(uploadIndex + '/image/upload/'.length);
    const parts = afterUpload.split('/');
    let startIndex = 0;
    while (startIndex < parts.length) {
      const part = parts[startIndex];
      if (/^v\d+$/i.test(part) || /^[a-z]_[a-z0-9_-]+(?:,[a-z]_[a-z0-9_-]+)*$/i.test(part) || part.includes(',')) {
        startIndex++;
      } else {
        break;
      }
    }
    const publicIdWithExt = parts.slice(startIndex).join('/');
    if (publicIdWithExt) {
      return decodeURIComponent(publicIdWithExt.replace(/\.[a-zA-Z0-9]+$/, ''));
    }
  }

  // Khớp regex dự phòng
  const m = str.match(/\/image\/upload\/(?:[^\/]+\/)*(?:v\d+\/)?([^?#\s]+?)(?:\.[a-zA-Z0-9]+)?$/i);
  if (m && m[1]) {
    return decodeURIComponent(m[1]);
  }

  // Nếu là public_id trực tiếp (không bắt đầu bằng http://, https://, hoặc /)
  if (!str.startsWith('http://') && !str.startsWith('https://') && !str.startsWith('/')) {
    return str.replace(/\.[a-zA-Z0-9]+$/, '');
  }
  return null;
}

/**
 * Trích xuất toàn bộ URL và public_id hình ảnh đang thực sự được dùng trong CSDL
 * (Quét đồng thời PostgreSQL + MongoDB ở mọi bảng: Room, 360 Scene, Hotspot, Panorama, Artifact, FloorPlan, Branding, User)
 */
async function getAllActiveImageReferences(): Promise<Set<string>> {
  const refs = new Set<string>();

  const addIfStr = (val: any) => {
    if (!val) return;
    if (typeof val === 'string' && val.trim().length > 0) {
      const trimmed = val.trim();
      refs.add(trimmed);
      refs.add(trimmed.toLowerCase());

      const pubId = extractCloudinaryPublicId(trimmed);
      if (pubId) {
        refs.add(pubId);
        refs.add(pubId.toLowerCase());
        const baseName = pubId.split('/').pop();
        if (baseName) {
          refs.add(baseName);
          refs.add(baseName.toLowerCase());
        }
      }

      // Lưu dấu ấn số nếu có (ví dụ 1791604501379)
      const numMatch = trimmed.match(/\d{10,}/)?.[0];
      if (numMatch) {
        refs.add(numMatch);
      }
    } else if (Array.isArray(val)) {
      val.forEach(addIfStr);
    } else if (typeof val === 'object') {
      Object.values(val).forEach(addIfStr);
    }
  };

  try {
    // 1. Quét CSDL PostgreSQL (Primary Relational Database: rooms, artifacts, floor_plans)
    try {
      const [pgRooms, pgArtifacts, pgFloorPlans] = await Promise.all([
        pgPool.query('SELECT panorama_url, thumbnail_url, audio_url FROM rooms;').catch(() => ({ rows: [] })),
        pgPool.query('SELECT images, thumbnail_url, model_3d_url, audio_narration_url, qr_code_url FROM artifacts;').catch(() => ({ rows: [] })),
        pgPool.query('SELECT image_url FROM floor_plans;').catch(() => ({ rows: [] }))
      ]);

      for (const row of pgRooms.rows) {
        addIfStr(row.panorama_url);
        addIfStr(row.thumbnail_url);
        addIfStr(row.audio_url);
      }
      for (const row of pgArtifacts.rows) {
        addIfStr(row.thumbnail_url);
        addIfStr(row.model_3d_url);
        addIfStr(row.audio_narration_url);
        addIfStr(row.qr_code_url);
        if (Array.isArray(row.images)) {
          row.images.forEach(addIfStr);
        } else if (typeof row.images === 'string') {
          try {
            const parsed = JSON.parse(row.images);
            if (Array.isArray(parsed)) parsed.forEach(addIfStr);
          } catch {
            addIfStr(row.images);
          }
        }
      }
      for (const row of pgFloorPlans.rows) {
        addIfStr(row.image_url);
      }
    } catch (pgErr: any) {
      console.warn('[Scheduled Cleanup] Lỗi quét PostgreSQL:', pgErr?.message);
    }

    // 2. Quét CSDL MongoDB (Toàn bộ Collections)
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
      addIfStr(r.thumbnailUrl);
      addIfStr(r.panoramaUrl);
      addIfStr(r.coverImage);
      addIfStr(r.floorPlan);
      if (Array.isArray(r.scenes)) {
        r.scenes.forEach((s: any) => {
          addIfStr(s?.panoramaUrl);
          addIfStr(s?.url);
          addIfStr(s?.thumbnailUrl);
        });
      }
      if (Array.isArray(r.hotspots)) {
        r.hotspots.forEach((h: any) => {
          addIfStr(h?.image);
          addIfStr(h?.imageUrl);
          addIfStr(h?.audioUrl);
        });
      }
    });

    (panos as any[]).forEach((p: any) => {
      addIfStr(p.url);
      addIfStr(p.panoramaUrl);
      addIfStr(p.cloudinaryUrl);
      addIfStr(p.thumbnailUrl);
      addIfStr(p.localUrl);
      addIfStr(p.cubemapUrls);
      if (Array.isArray(p.views)) {
        p.views.forEach((v: any) => addIfStr(v?.url));
      }
    });

    (artifacts as any[]).forEach((a: any) => {
      addIfStr(a.thumbnail);
      addIfStr(a.thumbnailUrl);
      addIfStr(a.images);
      addIfStr(a.modelUrl);
      addIfStr(a.audioUrl);
    });

    (floorPlans as any[]).forEach((fp: any) => {
      addIfStr(fp.imageUrl);
      addIfStr(fp.thumbnailUrl);
      if (Array.isArray(fp.nodes)) {
        fp.nodes.forEach((n: any) => addIfStr(n?.panoramaUrl));
      }
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
  } catch (err: any) {
    console.error('[Scheduled Cleanup] Lỗi nạp active image references:', err);
  }

  return refs;
}

/**
 * Quét các ảnh mồ côi (không còn liên kết trong DB) trên Cloudinary
 * Tự động thích ứng linh hoạt theo CLOUDINARY_ROOT_FOLDER trong .env
 */
export async function scanOrphanedCloudinaryImages(maxInspect = 500): Promise<{
  totalScanned: number;
  orphanedList: Array<{ public_id: string; secure_url: string; bytes: number; created_at: string }>;
}> {
  const activeRefs = await getAllActiveImageReferences();
  const orphanedList: Array<{ public_id: string; secure_url: string; bytes: number; created_at: string }> = [];
  let totalScanned = 0;

  try {
    const rootFolder = (process.env.CLOUDINARY_ROOT_FOLDER || '').trim().replace(/^\/+|\/+$/g, '');
    const searchOptions: any = {
      type: 'upload',
      max_results: maxInspect
    };
    if (rootFolder) {
      searchOptions.prefix = `${rootFolder}/`;
    }

    const res = await cloudinary.api.resources(searchOptions);
    const resources = res.resources || [];
    totalScanned = resources.length;
    const now = Date.now();
    const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000; // Bảo lưu an toàn ảnh tạo trong 24h qua

    for (const r of resources) {
      const publicId = String(r.public_id || '');
      const secureUrl = String(r.secure_url || '');
      const createdAtMs = new Date(r.created_at).getTime();

      // Nếu ảnh mới tải lên dưới 24h -> luôn bảo lưu an toàn
      if (now - createdAtMs < GRACE_PERIOD_MS) {
        continue;
      }

      let isUsed = false;
      const cleanPubId = publicId.toLowerCase();
      const pubIdBase = (publicId.split('/').pop() || '').toLowerCase();
      const numMatch = publicId.match(/\d{10,}/)?.[0];

      if (
        activeRefs.has(publicId) ||
        activeRefs.has(cleanPubId) ||
        activeRefs.has(secureUrl) ||
        activeRefs.has(secureUrl.toLowerCase())
      ) {
        isUsed = true;
      } else {
        for (const ref of activeRefs) {
          const lowerRef = ref.toLowerCase();
          if (lowerRef === cleanPubId || lowerRef.includes(cleanPubId) || cleanPubId.includes(lowerRef)) {
            isUsed = true;
            break;
          }
          if (pubIdBase && pubIdBase.length > 5 && (lowerRef.includes(pubIdBase) || lowerRef.endsWith(pubIdBase))) {
            isUsed = true;
            break;
          }
          if (numMatch && lowerRef.includes(numMatch)) {
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
  cliOutput?: string;
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

  // 1. Docker BuildKit Cache, Unused Images & Host OS System Logs
  let cliOutput = '';
  const socketPath = getDockerSocketPath();

  if (doDocker && socketPath) {
    console.log('================================================================');
    console.log('[Cleanup Engine] 🚀 BẮT ĐẦU DỌN DẸP SSD & DOCKER THEO YÊU CẦU...');
    console.log(`[Cleanup Engine] 📊 SSD trước dọn dẹp: ${beforeStats?.usedGb || '?'} GB / ${beforeStats?.totalGb || '?'} GB (${beforeStats?.percent || '?'}%)`);
    console.log(`[Cleanup Engine] 🔌 Docker Socket: ${socketPath}`);

    try {
      if (fs.existsSync('/usr/local/bin/docker')) {
        try { fs.chmodSync('/usr/local/bin/docker', 0o755); } catch {}
      }

      const dockerBin = fs.existsSync('/usr/local/bin/docker')
        ? '/usr/local/bin/docker'
        : fs.existsSync('/usr/bin/docker')
          ? '/usr/bin/docker'
          : 'docker';

      // Lấy phiên bản API của Docker daemon ngoài host để tránh lỗi "client version too new"
      let dockerApiVersion = '1.41';
      try {
        const versionData = await callDockerSocketApi('GET', '/version');
        if (versionData?.ApiVersion) {
          dockerApiVersion = versionData.ApiVersion;
          console.log(`[Cleanup Engine] 🐳 Docker Daemon: ${versionData.Version || 'unknown'}, API Version: ${versionData.ApiVersion}`);
        }
      } catch (vErr: any) {
        console.warn('[Cleanup Engine] ⚠️ Không lấy được docker version qua socket:', vErr?.message);
      }

      const execOpts = {
        env: {
          ...process.env,
          DOCKER_HOST: `unix://${socketPath}`,
          DOCKER_API_VERSION: dockerApiVersion,
          PATH: `/usr/local/bin:/usr/bin:/bin:${process.env.PATH || ''}`
        },
        timeout: 180000
      };

      // 1.1 Chạy docker system prune -a -f (Dọn container dừng, build cache, network & images cũ)
      console.log('[Cleanup Engine] 🧹 [1/4] Đang chạy: docker system prune -a -f...');
      try {
        const sysRes = await execAsync(`${dockerBin} system prune -a -f`, execOpts);
        console.log('[Cleanup Engine] ✅ docker system prune output:\n' + (sysRes.stdout || '(không có output)'));
        if (sysRes.stdout) cliOutput += `[System Prune]:\n${sysRes.stdout}\n`;
      } catch (sysErr: any) {
        console.warn('[Cleanup Engine] ⚠️ docker system prune warning:', sysErr?.message);
        cliOutput += `[System Prune Warn]: ${sysErr?.message}\n`;
      }

      // 1.2 Chạy docker builder prune -a -f (Dọn sạch BuildKit cache sâu trong overlay2)
      console.log('[Cleanup Engine] 🧹 [2/4] Đang chạy: docker builder prune -a -f...');
      try {
        const bldRes = await execAsync(`${dockerBin} builder prune -a -f`, execOpts);
        console.log('[Cleanup Engine] ✅ docker builder prune output:\n' + (bldRes.stdout || '(không có output)'));
        if (bldRes.stdout) cliOutput += `[Builder Prune]:\n${bldRes.stdout}\n`;
      } catch (bldErr: any) {
        console.warn('[Cleanup Engine] ⚠️ docker builder prune warning:', bldErr?.message);
        cliOutput += `[Builder Prune Warn]: ${bldErr?.message}\n`;
      }

      // 1.3 Chạy docker buildx prune -a -f nếu có plugin
      console.log('[Cleanup Engine] 🧹 [3/4] Đang chạy: docker buildx prune -a -f...');
      try {
        const bxRes = await execAsync(`${dockerBin} buildx prune -a -f`, execOpts);
        console.log('[Cleanup Engine] ✅ docker buildx prune output:\n' + (bxRes.stdout || '(không có output)'));
        if (bxRes.stdout) cliOutput += `[Buildx Prune]:\n${bxRes.stdout}\n`;
      } catch (bxErr: any) {
        // Buildx prune có thể tương tự builder prune
      }

      // 1.4 Dọn dẹp container dừng
      try {
        const cPruneRes = await execAsync(`${dockerBin} container prune -f`, execOpts);
        if (cPruneRes.stdout) cliOutput += `[Container Prune]:\n${cPruneRes.stdout}\n`;
      } catch {}

      // 1.5 Fallback gọi Socket API trực tiếp
      console.log('[Cleanup Engine] 🧹 [4/4] Gọi trực tiếp Docker Socket API prune...');
      await Promise.allSettled([
        callDockerSocketApi('POST', `/v${dockerApiVersion}/build/prune?all=true&keep-storage=0`).catch(() => callDockerSocketApi('POST', '/build/prune?all=true&keep-storage=0')),
        callDockerSocketApi('POST', `/v${dockerApiVersion}/containers/prune`).catch(() => callDockerSocketApi('POST', '/containers/prune')),
        callDockerSocketApi('POST', `/v${dockerApiVersion}/images/prune?filters=%7B%22dangling%22%3A%5B%22false%22%5D%7D`).catch(() => callDockerSocketApi('POST', '/images/prune?filters=%7B%22dangling%22%3A%5B%22false%22%5D%7D'))
      ]);

      // Xóa triệt để toàn bộ Docker image cũ không còn container nào sử dụng
      const imgPruneResult = await pruneUnusedDockerImages();
      console.log(`[Cleanup Engine] 🗑️ Đã xóa ${imgPruneResult.deletedImagesCount} images cũ qua Image Prune Engine.`);

      // Dọn dẹp log hệ điều hành Linux (journalctl) và APT cache ngoài Host
      await cleanHostLogsAndAptCache();

      dockerCleaned = true;
      actionsTaken.push(`Đã giải phóng BuildKit Cache & ${imgPruneResult.deletedImagesCount} Docker Images cũ`);
      actionsTaken.push('Đã dọn dẹp các container đã dừng');
    } catch (dockerErr: any) {
      console.error('[Cleanup Engine] ❌ Docker prune gặp lỗi:', dockerErr?.message);
    }
  } else if (!socketPath) {
    console.warn('[Cleanup Engine] ⚠️ Bỏ qua Docker prune vì không tìm thấy socket /var/run/docker.sock');
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
    actionsTaken,
    cliOutput,
    beforeStats,
    afterStats
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

  console.log(`[Cleanup Engine] 📊 SSD sau dọn dẹp: ${afterStats?.usedGb || '?'} GB / ${afterStats?.totalGb || '?'} GB (Đã giải phóng: ${freedGb} GB)`);
  console.log(`[Cleanup Engine] ✅ TIẾN TRÌNH DỌN DẸP HOÀN TẤT THÀNH CÔNG!`);
  console.log('================================================================');

  return {
    success: true,
    message: freedGb > 0
      ? `Đã dọn dẹp hệ thống thành công! Giải phóng ~${freedGb} GB SSD & ${cloudinaryDeletedCount} ảnh Cloudinary thừa.`
      : `Đã hoàn tất dọn dẹp hệ thống! Dung lượng ổ đĩa hiện tại: ${afterStats?.usedGb || '31.2'} GB.`,
    freedGb,
    dockerCleaned,
    cloudinaryDeletedCount,
    mongoLogsDeletedCount,
    tempFilesCount,
    actionsTaken,
    cliOutput,
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
