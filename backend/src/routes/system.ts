import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { authenticate, requireAdmin, AuthRequest } from './auth.js';
import { cacheGet, cacheSet, cacheDel } from '../services/redis.js';

export const systemRouter = Router();

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
}

const DEFAULT_CONFIG: MaintenanceConfig = {
  enabled: false,
  title: 'Hệ Thống Đang Nâng Cấp & Bảo Trì',
  message: 'Bảo tàng Lịch sử TP. Hồ Chí Minh đang cập nhật dữ liệu hiện vật và bảo trì định kỳ. Trình duyệt sẽ tự động kết nối lại khi hoàn tất.',
  estimatedMinutes: 30,
  updatedAt: new Date().toISOString(),
  updatedBy: 'Hệ thống'
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

  return {
    ...DEFAULT_CONFIG,
    ...(jsonConfig || {}),
    enabled: hasFlag || (jsonConfig?.enabled ?? false)
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
    const newConfig: MaintenanceConfig = {
      enabled: Boolean(enabled),
      title: (title && String(title).trim()) || current.title,
      message: (message && String(message).trim()) || current.message,
      estimatedMinutes: Number(estimatedMinutes) > 0 ? Number(estimatedMinutes) : current.estimatedMinutes,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user?.username || 'admin'
    };

    writeMaintenanceState(newConfig);

    // Cập nhật Redis cache nếu có
    await cacheSet(REDIS_MAINTENANCE_KEY, newConfig, 86400);

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
