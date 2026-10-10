import { Request } from 'express';
import { SystemLogModel, LogLevel, LogModule } from '../models/SystemLog.js';
import { AuditLogModel } from '../models/AuditLog.js';
import { broadcastRealtimeEvent } from './realtimeSync.js';
import { pgPool } from '../db/postgres.js';

export interface LogContextOptions {
  req?: Request;
  userId?: string;
  username?: string;
  role?: string;
  resource?: string;
  statusCode?: number;
  durationMs?: number;
  details?: Record<string, any>;
  tags?: string[];
  error?: any;
}

/**
 * Trích xuất an toàn thông tin tác nhân từ Express Request
 */
function extractActorFromReq(req?: Request) {
  if (!req) return { userId: 'system', username: 'Hệ thống', role: 'system', ipAddress: '127.0.0.1', userAgent: '', method: '', path: '' };

  const user = (req as any).user;
  const ipAddress =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  return {
    userId: user?._id || user?.id || 'guest',
    username: user?.name || user?.username || (user ? 'Người dùng xác thực' : 'Khách vãng lai'),
    role: user?.role || 'guest',
    ipAddress,
    userAgent: req.headers['user-agent'] || '',
    method: req.method,
    path: req.originalUrl || req.url
  };
}

/**
 * Chuẩn hóa lỗi ra định dạng phân tích có cấu trúc
 */
function formatErrorDetails(err: any) {
  if (!err) return undefined;
  if (typeof err === 'string') {
    return { name: 'Error', message: err, stack: '' };
  }
  return {
    name: err.name || 'Error',
    message: err.message || String(err),
    stack: err.stack ? err.stack.split('\n').slice(0, 10).join('\n') : '',
    code: err.code ? String(err.code) : undefined
  };
}

class SystemLogger {
  /**
   * Ghi nhận một bản ghi nhật ký hoàn chỉnh vào NoSQL MongoDB và phát sóng Realtime
   */
  async log(
    level: LogLevel,
    module: LogModule,
    action: string,
    message: string,
    options: LogContextOptions = {}
  ) {
    try {
      const actor = extractActorFromReq(options.req);

      const userId = options.userId || actor.userId;
      const username = options.username || actor.username;
      const role = options.role || actor.role;
      const ipAddress = options.req ? actor.ipAddress : (options.details?.ipAddress || '127.0.0.1');
      const userAgent = actor.userAgent;
      const method = options.req?.method || actor.method;
      const path = options.req ? actor.path : (options.details?.path || '');

      const parsedError = formatErrorDetails(options.error);

      // 1. Lưu bản ghi chi tiết vào NoSQL MongoDB
      const logDoc = await SystemLogModel.create({
        level,
        module,
        action,
        message,
        statusCode: options.statusCode,
        durationMs: options.durationMs || 0,
        ipAddress,
        userAgent,
        userId,
        username,
        role,
        resource: options.resource || '',
        method,
        path,
        error: parsedError,
        details: options.details || {},
        tags: options.tags || []
      });

      // 2. Đồng bộ sang AuditLogModel để đảm bảo tương thích hoàn toàn
      AuditLogModel.create({
        userId,
        username,
        action: `${level}_${module}_${action}`,
        resource: options.resource || module,
        details: {
          message,
          statusCode: options.statusCode,
          error: parsedError,
          ...options.details
        },
        ipAddress
      }).catch(() => {});

      // 3. Đồng thời lưu PostgreSQL Audit Log nếu cần
      try {
        await pgPool.query(
          `INSERT INTO audit_logs (user_id, username, action, resource, details, ip_address)
           VALUES ($1, $2, $3, $4, $5, $6);`,
          [
            userId,
            username,
            `${module}:${action}`,
            options.resource || module,
            JSON.stringify({ message, level, details: options.details || {} }),
            ipAddress
          ]
        );
      } catch {}

      // 4. Phát sóng sự kiện Realtime SSE để Admin Dashboard hiển thị ngay lập tức
      broadcastRealtimeEvent('system_log_created', logDoc.toObject());

      return logDoc;
    } catch (err: any) {
      console.warn('[SystemLogger Error]:', err.message);
      return null;
    }
  }

  info(module: LogModule, action: string, message: string, options: LogContextOptions = {}) {
    return this.log('INFO', module, action, message, options);
  }

  success(module: LogModule, action: string, message: string, options: LogContextOptions = {}) {
    return this.log('SUCCESS', module, action, message, options);
  }

  warn(module: LogModule, action: string, message: string, options: LogContextOptions = {}) {
    return this.log('WARN', module, action, message, options);
  }

  error(module: LogModule, action: string, message: string, error?: any, options: LogContextOptions = {}) {
    return this.log('ERROR', module, action, message, { ...options, error: error || options.error });
  }
}

export const systemLogger = new SystemLogger();
export default systemLogger;
