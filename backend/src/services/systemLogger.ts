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
 * Danh sách các trường nhạy cảm cần loại bỏ hoặc ẩn mã hóa
 */
const SENSITIVE_KEY_REGEX = /(password|pass|token|secret|apiKey|api_key|authorization|bearer|cookie|checksum|cardNumber|cvv|pin|privateKey|auth|session|credential)/i;

/**
 * Khử mã độc / ẩn thông tin nhạy cảm khỏi dữ liệu nhật ký một cách an toàn (Chống rò rỉ bảo mật)
 */
export function sanitizeData(data: any, depth = 0): any {
  if (depth > 6) return '[MAX_DEPTH]';
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    // Ẩn Bearer token nếu có trong chuỗi
    if (data.toLowerCase().startsWith('bearer ') && data.length > 15) {
      return 'Bearer [REDACTED_TOKEN]';
    }
    // Ẩn JWT token nếu có cấu trúc eyJ...
    if (/eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/.test(data)) {
      return data.replace(/eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g, '[REDACTED_JWT]');
    }
    // Ẩn chuỗi kết nối chứa mật khẩu (mongodb://user:pass@...)
    if (/(mongodb|postgres|postgresql|mysql):\/\/[^:\s]+:[^@\s]+@/.test(data)) {
      return data.replace(/(:)([^:\s@]+)(@)/g, '$1***$3');
    }
    return data;
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.slice(0, 100).map((item) => sanitizeData(item, depth + 1));
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      if (SENSITIVE_KEY_REGEX.test(key)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeData(data[key], depth + 1);
      }
    }
    return sanitized;
  }

  return String(data);
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

  // Lọc sạch URL và đường dẫn nếu có token trong query
  let safePath = req.originalUrl || req.url || '';
  if (safePath.includes('token=')) {
    safePath = safePath.replace(/([?&]token=)[^&]+/g, '$1[REDACTED]');
  }

  return {
    userId: user?._id || user?.id || 'guest',
    username: user?.name || user?.username || (user ? 'Người dùng xác thực' : 'Khách vãng lai'),
    role: user?.role || 'guest',
    ipAddress,
    userAgent: (req.headers['user-agent'] || '').slice(0, 255),
    method: req.method,
    path: safePath
  };
}

/**
 * Chuẩn hóa lỗi ra định dạng phân tích có cấu trúc và loại bỏ đường dẫn file nội bộ nhạy cảm
 */
function formatErrorDetails(err: any) {
  if (!err) return undefined;
  if (typeof err === 'string') {
    return { name: 'Error', message: sanitizeData(err), stack: '' };
  }

  const rawMsg = err.message || String(err);
  let stack = err.stack ? err.stack.split('\n').slice(0, 8).join('\n') : '';

  // Ẩn đường dẫn tuyệt đối của máy chủ trên stack trace
  stack = stack.replace(/([a-zA-Z]:\\[^\n\r]+?|(?:\/[a-zA-Z0-9._-]+)+\/)(?=backend|frontend|node_modules)/g, '.../');

  return {
    name: err.name || 'Error',
    message: sanitizeData(rawMsg),
    stack: sanitizeData(stack),
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
      const sanitizedDetails = sanitizeData(options.details || {});
      const sanitizedMessage = sanitizeData(message || '');

      // 1. Lưu bản ghi chi tiết vào NoSQL MongoDB
      const logDoc = await SystemLogModel.create({
        level,
        module,
        action: action ? String(action).slice(0, 80) : 'UNKNOWN',
        message: sanitizedMessage,
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
        details: sanitizedDetails,
        tags: options.tags || []
      });

      // 2. Đồng bộ sang AuditLogModel để đảm bảo tương thích hoàn toàn
      AuditLogModel.create({
        userId,
        username,
        action: `${level}_${module}_${action}`,
        resource: options.resource || module,
        details: {
          message: sanitizedMessage,
          statusCode: options.statusCode,
          error: parsedError,
          ...sanitizedDetails
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
