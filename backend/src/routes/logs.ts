import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { SystemLogModel, LogLevel, LogModule } from '../models/SystemLog.js';
import { ArchivedLogPackageModel } from '../models/ArchivedLogPackage.js';
import { authenticate, requireAdmin, AuthRequest } from './auth.js';
import { systemLogger } from '../services/systemLogger.js';

const ARCHIVE_DIR = path.join(process.cwd(), 'storage', 'log_archives');
function ensureArchiveDir() {
  if (!fs.existsSync(ARCHIVE_DIR)) {
    fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
  }
}

export const logsRouter = Router();

// Tất cả các API quản trị nhật ký yêu cầu quyền Admin
logsRouter.use(authenticate, requireAdmin);

/**
 * GET /api/system/logs
 * Lấy danh sách nhật ký hệ thống NoSQL với bộ lọc đa chiều & phân trang chuẩn
 */
logsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const { level, module: logModule, search, hasError, startDate, endDate, action } = req.query;

    const filter: any = {};

    if (level && level !== 'all') {
      filter.level = level;
    }

    if (logModule && logModule !== 'all') {
      filter.module = logModule;
    }

    if (action && typeof action === 'string' && action.trim()) {
      filter.action = action.trim();
    }

    if (hasError === 'true') {
      filter.level = 'ERROR';
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim();
      const regex = new RegExp(q.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
      filter.$or = [
        { message: regex },
        { action: regex },
        { path: regex },
        { username: regex },
        { ipAddress: regex },
        { resource: regex },
        { 'error.message': regex }
      ];
    }

    const [logs, total] = await Promise.all([
      SystemLogModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SystemLogModel.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: logs,
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
      message: 'Lỗi truy xuất danh sách nhật ký hệ thống: ' + (err.message || '')
    });
  }
});

/**
 * GET /api/system/logs/stats
 * Thống kê tổng hợp thông minh phục vụ Dashboard Giám sát hệ thống
 */
logsRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    const [
      total,
      errorCount,
      warnCount,
      infoCount,
      successCount,
      moduleStats,
      recentErrors
    ] = await Promise.all([
      SystemLogModel.countDocuments(),
      SystemLogModel.countDocuments({ level: 'ERROR' }),
      SystemLogModel.countDocuments({ level: 'WARN' }),
      SystemLogModel.countDocuments({ level: 'INFO' }),
      SystemLogModel.countDocuments({ level: 'SUCCESS' }),
      SystemLogModel.aggregate([
        { $group: { _id: '$module', count: { $sum: 1 }, errors: { $sum: { $cond: [{ $eq: ['$level', 'ERROR'] }, 1, 0] } } } },
        { $sort: { count: -1 } }
      ]),
      SystemLogModel.find({ level: 'ERROR' })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    const errorRate = total > 0 ? Number(((errorCount / total) * 100).toFixed(1)) : 0;

    res.json({
      success: true,
      data: {
        total,
        errorCount,
        warnCount,
        infoCount,
        successCount,
        errorRate,
        byModule: moduleStats.map((m) => ({
          module: m._id,
          count: m.count,
          errors: m.errors
        })),
        recentErrors
      }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy thống kê nhật ký: ' + (err.message || '')
    });
  }
});

/**
 * GET /api/system/logs/:id
 * Lấy chi tiết và phân tích sâu 1 bản ghi nhật ký
 */
logsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const log = await SystemLogModel.findById(req.params.id).lean();
    if (!log) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bản ghi nhật ký' });
    }
    res.json({ success: true, data: log });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi tải bản ghi: ' + (err.message || '') });
  }
});

/**
 * Helper: Tạo filter dọn dẹp theo phân loại an toàn
 */
function buildPruneFilter(options: {
  cleanType: string;
  olderThanDays: number;
  preserveErrors?: boolean;
  preserveAdminAudit?: boolean;
}) {
  const days = Math.max(1, parseInt(String(options.olderThanDays), 10) || 7);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const filter: any = { createdAt: { $lt: cutoffDate } };

  if (options.cleanType === 'BOT_SCANS_ONLY') {
    // Chỉ các request 404 từ khách vãng lai dò quét cổng
    filter.statusCode = 404;
    filter.role = { $nin: ['ADMIN', 'STAFF'] };
  } else if (options.cleanType === 'ROUTINE_INFO') {
    // Chỉ log INFO & SUCCESS bình thường cũ
    filter.level = { $in: ['INFO', 'SUCCESS'] };
    filter.role = { $nin: ['ADMIN', 'STAFF'] };
  } else {
    // FULL_PRUNE_WITH_TRACE_PRESERVED (Mặc định)
    // Dọn toàn bộ nhưng bảo vệ tuyệt đối ERROR và Admin Audit
    if (options.preserveErrors !== false) {
      filter.level = { $ne: 'ERROR' };
      filter.statusCode = { $lt: 500 };
    }
    if (options.preserveAdminAudit !== false) {
      filter.role = { $nin: ['ADMIN', 'STAFF'] };
      filter.module = { $nin: ['AUTH', 'SYSTEM', 'TICKETS'] };
    }
  }

  return { filter, cutoffDate };
}

/**
 * GET /api/system/logs/cleanup/preview
 * Dự báo trước số bản ghi có thể dọn an toàn & các bản ghi được bảo vệ tuyệt đối
 */
logsRouter.get('/cleanup/preview', async (req: Request, res: Response) => {
  try {
    const cleanType = (req.query.cleanType as string) || 'BOT_SCANS_ONLY';
    const olderThanDays = parseInt(req.query.olderThanDays as string, 10) || 7;
    const preserveErrors = req.query.preserveErrors !== 'false';
    const preserveAdminAudit = req.query.preserveAdminAudit !== 'false';

    const { filter } = buildPruneFilter({
      cleanType,
      olderThanDays,
      preserveErrors,
      preserveAdminAudit
    });

    const [candidateCount, totalLogsCount, protectedErrorsCount, protectedAdminAuditCount] = await Promise.all([
      SystemLogModel.countDocuments(filter),
      SystemLogModel.countDocuments(),
      SystemLogModel.countDocuments({ level: 'ERROR' }),
      SystemLogModel.countDocuments({ role: { $in: ['ADMIN', 'STAFF'] } })
    ]);

    const estimatedFreeMb = Number(((candidateCount * 0.75) / 1024).toFixed(2));

    res.json({
      success: true,
      preview: {
        cleanType,
        olderThanDays,
        candidateCount,
        totalLogsCount,
        protectedErrorsCount,
        protectedAdminAuditCount,
        estimatedFreeMb
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi dự báo dọn dẹp: ' + (err.message || '') });
  }
});

/**
 * POST /api/system/logs/cleanup/archive-and-prune
 * Đóng gói nén sao lưu theo Ngày-Tháng-Năm và dọn dẹp an toàn các bản ghi
 */
logsRouter.post('/cleanup/archive-and-prune', async (req: Request, res: Response) => {
  try {
    const {
      cleanType = 'BOT_SCANS_ONLY',
      olderThanDays = 7,
      preserveErrors = true,
      preserveAdminAudit = true,
      backupBeforeDelete = true
    } = req.body;

    const { filter, cutoffDate } = buildPruneFilter({
      cleanType,
      olderThanDays,
      preserveErrors,
      preserveAdminAudit
    });

    const logsToArchive = await SystemLogModel.find(filter).lean();
    if (logsToArchive.length === 0) {
      return res.json({
        success: true,
        message: 'Không có bản ghi nào phù hợp điều kiện để dọn dẹp.',
        deletedCount: 0
      });
    }

    let archivedPackage: any = null;

    if (backupBeforeDelete) {
      ensureArchiveDir();
      const now = new Date();
      const dateTag = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `logs_archive_${cleanType.toLowerCase()}_${dateTag}.json.gz`;
      const filePath = path.join(ARCHIVE_DIR, fileName);

      // Nén Gzip JSON
      const jsonBuffer = Buffer.from(JSON.stringify(logsToArchive, null, 2), 'utf-8');
      const gzBuffer = zlib.gzipSync(jsonBuffer);
      fs.writeFileSync(filePath, gzBuffer);

      archivedPackage = await ArchivedLogPackageModel.create({
        packageId: `archive_${Date.now()}`,
        fileName,
        filePath,
        recordCount: logsToArchive.length,
        fileSizeBytes: gzBuffer.length,
        category: cleanType,
        olderThanDays,
        dateFrom: logsToArchive[logsToArchive.length - 1]?.createdAt,
        dateTo: logsToArchive[0]?.createdAt,
        archivedBy: (req as any).user?.username || 'Admin'
      });
    }

    // Xoá bản ghi khỏi MongoDB
    const deleteResult = await SystemLogModel.deleteMany(filter);

    await systemLogger.info('SYSTEM', 'CLEANUP_LOGS', `Đã dọn dẹp & lưu trữ ${deleteResult.deletedCount} bản ghi nhật ký`, {
      req,
      details: {
        cleanType,
        olderThanDays,
        deletedCount: deleteResult.deletedCount,
        archivedPackageId: archivedPackage?.packageId
      }
    });

    res.json({
      success: true,
      message: `Đã dọn dẹp và đóng gói lưu trữ an toàn ${deleteResult.deletedCount} bản ghi`,
      deletedCount: deleteResult.deletedCount,
      package: archivedPackage
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi dọn dẹp và lưu trữ: ' + (err.message || '') });
  }
});

/**
 * DELETE /api/system/logs/cleanup (Tương thích ngược)
 */
logsRouter.delete('/cleanup', async (req: Request, res: Response) => {
  try {
    const { olderThanDays = 30, keepErrorsOnly = true } = req.body;
    const cleanType = keepErrorsOnly ? 'FULL_PRUNE_WITH_TRACE_PRESERVED' : 'ROUTINE_INFO';

    const { filter } = buildPruneFilter({
      cleanType,
      olderThanDays,
      preserveErrors: keepErrorsOnly,
      preserveAdminAudit: true
    });

    const result = await SystemLogModel.deleteMany(filter);

    res.json({
      success: true,
      message: `Đã dọn dẹp ${result.deletedCount} bản ghi`,
      deletedCount: result.deletedCount
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi dọn dẹp: ' + (err.message || '') });
  }
});

/**
 * GET /api/system/logs/archives
 * Lấy danh sách các gói lưu trữ đã tạo để xem hoặc khôi phục
 */
logsRouter.get('/archives', async (req: Request, res: Response) => {
  try {
    const packages = await ArchivedLogPackageModel.find()
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, packages });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách gói lưu trữ: ' + (err.message || '') });
  }
});

/**
 * POST /api/system/logs/archives/:id/restore
 * Khôi phục bản ghi từ gói lưu trữ trở lại MongoDB NoSQL
 */
logsRouter.post('/archives/:id/restore', async (req: Request, res: Response) => {
  try {
    const pkg = await ArchivedLogPackageModel.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy gói lưu trữ' });
    }

    if (!fs.existsSync(pkg.filePath)) {
      return res.status(404).json({ success: false, message: 'Tệp gói lưu trữ không còn tồn tại trên máy chủ' });
    }

    // Đọc và giải nén Gzip
    const gzBuffer = fs.readFileSync(pkg.filePath);
    const jsonStr = zlib.gunzipSync(gzBuffer).toString('utf-8');
    const logs: any[] = JSON.parse(jsonStr);

    if (!Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({ success: false, message: 'Gói lưu trữ không có dữ liệu để khôi phục' });
    }

    // Khôi phục vào MongoDB bằng bulkWrite với upsert để không bị lỗi duplicate key
    const bulkOps = logs.map((l) => ({
      updateOne: {
        filter: { _id: l._id },
        update: { $set: l },
        upsert: true
      }
    }));

    // Chia batch 500
    const chunkSize = 500;
    for (let i = 0; i < bulkOps.length; i += chunkSize) {
      const chunk = bulkOps.slice(i, i + chunkSize);
      await SystemLogModel.bulkWrite(chunk, { ordered: false });
    }

    pkg.restoredAt = new Date();
    await pkg.save();

    await systemLogger.info('SYSTEM', 'RESTORE_LOGS', `Đã khôi phục ${logs.length} bản ghi nhật ký từ gói ${pkg.fileName}`, {
      req,
      details: { packageId: pkg.packageId, recordCount: logs.length }
    });

    res.json({
      success: true,
      message: `Khôi phục thành công ${logs.length} bản ghi từ gói lưu trữ vào cơ sở dữ liệu MongoDB`,
      restoredCount: logs.length
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi khôi phục nhật ký: ' + (err.message || '') });
  }
});

/**
 * GET /api/system/logs/archives/:id/download
 * Tải file nén JSON/GZ về máy tính lưu trữ lạnh
 */
logsRouter.get('/archives/:id/download', async (req: Request, res: Response) => {
  try {
    const pkg = await ArchivedLogPackageModel.findById(req.params.id);
    if (!pkg || !fs.existsSync(pkg.filePath)) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tệp gói lưu trữ' });
    }

    res.setHeader('Content-Type', 'application/gzip');
    res.setHeader('Content-Disposition', `attachment; filename="${pkg.fileName}"`);
    fs.createReadStream(pkg.filePath).pipe(res);
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi tải tệp: ' + (err.message || '') });
  }
});

/**
 * DELETE /api/system/logs/archives/:id
 * Xoá vĩnh viễn gói lưu trữ
 */
logsRouter.delete('/archives/:id', async (req: Request, res: Response) => {
  try {
    const pkg = await ArchivedLogPackageModel.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy gói lưu trữ' });
    }

    if (fs.existsSync(pkg.filePath)) {
      try {
        fs.unlinkSync(pkg.filePath);
      } catch (e) {
        // ignore
      }
    }

    await ArchivedLogPackageModel.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Đã xóa gói lưu trữ' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi xóa gói lưu trữ: ' + (err.message || '') });
  }
});

/**
 * Bản dịch xuất JSON nhật ký hệ thống đồng bộ theo 5 ngôn ngữ chuẩn mực
 */
const LOGS_I18N: Record<string, {
  systemTitle: string;
  fileType: string;
  levelLabels: Record<string, string>;
  moduleLabels: Record<string, string>;
  roleLabels: Record<string, string>;
}> = {
  vi: {
    systemTitle: 'Bảo tàng Lịch sử TP. Hồ Chí Minh',
    fileType: 'Nhật ký giám sát & an ninh hệ thống (System Logs)',
    levelLabels: {
      INFO: 'Thông tin (INFO)',
      SUCCESS: 'Thành công (SUCCESS)',
      WARN: 'Cảnh báo (WARN)',
      ERROR: 'Sự cố / Lỗi (ERROR)'
    },
    moduleLabels: {
      ROOMS: 'Gian phòng 360°',
      ARTIFACTS: 'Cổ vật di sản 3D',
      STITCHING: 'Ghép ảnh 360°',
      FLOOR_PLAN: 'Sơ đồ mặt bằng',
      TICKETS: 'Vé & Giao dịch thanh toán',
      AUTH: 'Xác thực & Tài khoản',
      SYSTEM: 'Hệ thống',
      AI_VOICE: 'Trợ lý AI & Giọng nói',
      DATABASE: 'Cơ sở dữ liệu',
      SHOWCASE: 'Trưng bày'
    },
    roleLabels: {
      ADMIN: 'Quản trị viên cấp cao',
      STAFF: 'Nhân viên bảo tàng',
      USER: 'Người dùng đã đăng ký',
      GUEST: 'Khách tham quan'
    }
  },
  en: {
    systemTitle: 'Ho Chi Minh City History Museum',
    fileType: 'System Audit & Monitoring Logs',
    levelLabels: {
      INFO: 'Information (INFO)',
      SUCCESS: 'Success (SUCCESS)',
      WARN: 'Warning (WARN)',
      ERROR: 'Incident / Error (ERROR)'
    },
    moduleLabels: {
      ROOMS: '360° Exhibition Rooms',
      ARTIFACTS: '3D Heritage Artifacts',
      STITCHING: '360° Image Stitching',
      FLOOR_PLAN: 'Floor Plan Mapping',
      TICKETS: 'Tickets & Payments',
      AUTH: 'Authentication & Accounts',
      SYSTEM: 'System & Infra',
      AI_VOICE: 'AI Assistant & Voice',
      DATABASE: 'Database',
      SHOWCASE: 'Showcase'
    },
    roleLabels: {
      ADMIN: 'System Administrator',
      STAFF: 'Museum Staff',
      USER: 'Registered User',
      GUEST: 'Visitor / Guest'
    }
  },
  fr: {
    systemTitle: 'Musée d\'Histoire de Hô Chi Minh-Ville',
    fileType: 'Journaux d\'audit et de surveillance du système',
    levelLabels: {
      INFO: 'Information (INFO)',
      SUCCESS: 'Succès (SUCCESS)',
      WARN: 'Avertissement (WARN)',
      ERROR: 'Erreur / Incident (ERROR)'
    },
    moduleLabels: {
      ROOMS: 'Salles 360°',
      ARTIFACTS: 'Artefacts 3D',
      STITCHING: 'Assemblage 360°',
      FLOOR_PLAN: 'Plan d\'étage',
      TICKETS: 'Billetterie et Paiements',
      AUTH: 'Authentification et Comptes',
      SYSTEM: 'Système',
      AI_VOICE: 'Assistant IA et Voix',
      DATABASE: 'Base de données',
      SHOWCASE: 'Vitrine'
    },
    roleLabels: {
      ADMIN: 'Administrateur',
      STAFF: 'Personnel',
      USER: 'Utilisateur enregistré',
      GUEST: 'Visiteur'
    }
  },
  zh: {
    systemTitle: '胡志明市历史博物馆',
    fileType: '系统审计与监控日志',
    levelLabels: {
      INFO: '信息 (INFO)',
      SUCCESS: '成功 (SUCCESS)',
      WARN: '警告 (WARN)',
      ERROR: '故障 / 错误 (ERROR)'
    },
    moduleLabels: {
      ROOMS: '360°全景展厅',
      ARTIFACTS: '3D文物遗迹',
      STITCHING: '360°图像拼接',
      FLOOR_PLAN: '导览平面图',
      TICKETS: '门票与支付',
      AUTH: '认证与账户',
      SYSTEM: '系统管理',
      AI_VOICE: 'AI语音助理',
      DATABASE: '数据库',
      SHOWCASE: '展品陈列'
    },
    roleLabels: {
      ADMIN: '超级管理员',
      STAFF: '馆内工作人员',
      USER: '注册用户',
      GUEST: '访客'
    }
  },
  ja: {
    systemTitle: 'ホーチミン市歴史博物館',
    fileType: 'システム監査および監視ログ',
    levelLabels: {
      INFO: '情報 (INFO)',
      SUCCESS: '成功 (SUCCESS)',
      WARN: '警告 (WARN)',
      ERROR: '障害 / エラー (ERROR)'
    },
    moduleLabels: {
      ROOMS: '360°展示室',
      ARTIFACTS: '3D文化財遺物',
      STITCHING: '360°画像スティッチング',
      FLOOR_PLAN: 'フロアマップ',
      TICKETS: 'チケット＆決済',
      AUTH: '認証・アカウント',
      SYSTEM: 'システム管理',
      AI_VOICE: 'AI音声アシスタント',
      DATABASE: 'データベース',
      SHOWCASE: '展示ショーケース'
    },
    roleLabels: {
      ADMIN: '管理者',
      STAFF: 'スタッフ',
      USER: '登録ユーザー',
      GUEST: '一般来館者'
    }
  }
};

/**
 * GET /api/system/logs/export/json
 * Xuất dữ liệu nhật ký dạng JSON chuẩn hóa theo ngôn ngữ hiện hành của hệ thống
 */
logsRouter.get('/export/json', async (req: Request, res: Response) => {
  try {
    const { level, module: logModule, limit = 500, lang = 'vi' } = req.query;
    const filter: any = {};
    if (level && level !== 'all') filter.level = level;
    if (logModule && logModule !== 'all') filter.module = logModule;

    const exportLimit = Math.min(2000, parseInt(limit as string, 10) || 500);
    const logs = await SystemLogModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(exportLimit)
      .lean();

    const currentLang = (typeof lang === 'string' && LOGS_I18N[lang.toLowerCase()]) ? lang.toLowerCase() : 'vi';
    const dict = LOGS_I18N[currentLang];

    const formattedLogs = logs.map((log: any) => ({
      id: String(log._id),
      recordedAt: log.createdAt ? new Date(log.createdAt).toLocaleString(currentLang === 'vi' ? 'vi-VN' : currentLang) : '',
      timestampIso: log.createdAt ? new Date(log.createdAt).toISOString() : '',
      level: dict.levelLabels[log.level] || log.level,
      module: dict.moduleLabels[log.module] || log.module,
      action: log.action || '',
      message: log.message || '',
      httpStatus: log.statusCode || 200,
      durationMs: log.durationMs || 0,
      resource: log.resource || '',
      actor: {
        username: log.username || 'System',
        role: dict.roleLabels[log.role] || log.role || 'Guest',
        ipAddress: log.ipAddress || ''
      },
      error: log.error && (log.error.name || log.error.message) ? {
        name: log.error.name,
        message: log.error.message,
        code: log.error.code,
        stack: log.error.stack
      } : undefined,
      metadata: log.details && Object.keys(log.details).length > 0 ? log.details : undefined
    }));

    const exportPayload = {
      system: dict.systemTitle,
      fileType: dict.fileType,
      language: currentLang,
      exportedAt: new Date().toISOString(),
      totalRecords: formattedLogs.length,
      filters: {
        level: level || 'all',
        module: logModule || 'all'
      },
      logs: formattedLogs
    };

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="system_logs_${currentLang}_${new Date().toISOString().slice(0, 10)}.json"`);
    res.send(JSON.stringify(exportPayload, null, 2));
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi xuất dữ liệu: ' + (err.message || '') });
  }
});

