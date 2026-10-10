import { Router, Request, Response } from 'express';
import { SystemLogModel, LogLevel, LogModule } from '../models/SystemLog.js';
import { authenticate, requireAdmin, AuthRequest } from './auth.js';
import { systemLogger } from '../services/systemLogger.js';

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
 * DELETE /api/system/logs/cleanup
 * Dọn dẹp nhật ký cũ hoặc giải phóng dung lượng
 */
logsRouter.delete('/cleanup', async (req: Request, res: Response) => {
  try {
    const { olderThanDays = 30, keepErrorsOnly = false } = req.body;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThanDays, 10));

    const deleteFilter: any = {
      createdAt: { $lt: cutoffDate }
    };

    if (keepErrorsOnly) {
      deleteFilter.level = { $ne: 'ERROR' };
    }

    const result = await SystemLogModel.deleteMany(deleteFilter);

    await systemLogger.info('SYSTEM', 'CLEANUP_LOGS', `Đã dọn dẹp ${result.deletedCount} bản ghi nhật ký cũ`, {
      req,
      details: { olderThanDays, keepErrorsOnly, deletedCount: result.deletedCount }
    });

    res.json({
      success: true,
      message: `Đã dọn dẹp ${result.deletedCount} bản ghi nhật ký cũ hơn ${olderThanDays} ngày`,
      deletedCount: result.deletedCount
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi dọn dẹp nhật ký: ' + (err.message || '') });
  }
});

/**
 * GET /api/system/logs/export/json
 * Xuất dữ liệu nhật ký dạng JSON để tải về máy
 */
logsRouter.get('/export/json', async (req: Request, res: Response) => {
  try {
    const { level, module: logModule, limit = 500 } = req.query;
    const filter: any = {};
    if (level && level !== 'all') filter.level = level;
    if (logModule && logModule !== 'all') filter.module = logModule;

    const exportLimit = Math.min(2000, parseInt(limit as string, 10) || 500);
    const logs = await SystemLogModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(exportLimit)
      .lean();

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="system_logs_${Date.now()}.json"`);
    res.send(JSON.stringify(logs, null, 2));
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi xuất dữ liệu: ' + (err.message || '') });
  }
});
