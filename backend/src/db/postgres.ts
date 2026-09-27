import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '..', '.env') });
dotenv.config();

const { Pool } = pg;

const PG_URI = process.env.PG_URI || process.env.DATABASE_URL || 'postgresql://postgres:change-me-postgres@localhost:5432/museum';

export const pgPool = new Pool({
  connectionString: PG_URI,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20
});

let isPgConnected = false;

pgPool.on('connect', () => {
  isPgConnected = true;
});

pgPool.on('error', (err) => {
  console.warn('[PostgreSQL Pool Warning]:', err.message);
  isPgConnected = false;
});

/**
 * Khởi tạo bảng dữ liệu quan hệ, kiểm toán & bảo mật trong PostgreSQL
 */
export async function initPostgresTables(): Promise<boolean> {
  try {
    const client = await pgPool.connect();
    isPgConnected = true;
    console.log(`[PostgreSQL] Đã kết nối cơ sở dữ liệu quan hệ thành công tại: ${PG_URI.replace(/:[^:@]*@/, ':****@')}`);

    try {
      // 1. Bảng Vai trò & Quyền hạn (Roles)
      await client.query(`
        CREATE TABLE IF NOT EXISTS roles (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(128) NOT NULL,
          description TEXT,
          permissions JSONB DEFAULT '[]',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 2. Bảng Người dùng & Phân quyền (Users)
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          username VARCHAR(64) UNIQUE NOT NULL,
          email VARCHAR(128) NOT NULL,
          password_hash VARCHAR(256) NOT NULL,
          full_name VARCHAR(128),
          role_id VARCHAR(64) REFERENCES roles(id) ON DELETE SET NULL,
          is_active BOOLEAN DEFAULT true,
          last_login_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 3. Bảng Nhật ký kiểm toán hoạt động (Audit Logs)
      await client.query(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id BIGSERIAL PRIMARY KEY,
          user_id VARCHAR(64),
          username VARCHAR(64),
          action VARCHAR(128) NOT NULL,
          resource VARCHAR(128) NOT NULL,
          details JSONB DEFAULT '{}',
          ip_address VARCHAR(64),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 4. Bảng Cấu hình hệ thống (System Settings)
      await client.query(`
        CREATE TABLE IF NOT EXISTS system_settings (
          key VARCHAR(128) PRIMARY KEY,
          value JSONB NOT NULL,
          description TEXT,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Khởi tạo các vai trò mẫu chuẩn nếu bảng trống
      const roleCheck = await client.query('SELECT COUNT(*) FROM roles;');
      if (parseInt(roleCheck.rows[0].count, 10) === 0) {
        await client.query(`
          INSERT INTO roles (id, name, description, permissions) VALUES
          ('role-superadmin', 'Quản Trị Viên Tối Cao', 'Toàn quyền điều hành hệ thống bảo tàng', '["*"]'),
          ('role-editor', 'Biên Tập Viên Di Sản', 'Biên tập gian phòng, hiện vật và thuyết minh', '["read:*", "write:rooms", "write:artifacts", "write:floorplan"]'),
          ('role-viewer', 'Khách Tra Cứu', 'Quyền đọc và chiêm ngưỡng dữ liệu số hóa', '["read:*"]');
        `);
        console.log('[PostgreSQL] Đã khởi tạo 3 vai trò mẫu chuẩn (Superadmin, Editor, Viewer).');
      }

      // Khởi tạo tài khoản Quản trị viên mặc định trong PostgreSQL
      const userCheck = await client.query('SELECT COUNT(*) FROM users;');
      if (parseInt(userCheck.rows[0].count, 10) === 0) {
        // Hash mặc định của mật khẩu admin (bcrypt)
        const bcrypt = (await import('bcryptjs')).default;
        const defaultHash = await bcrypt.hash('admin123', 10);
        await client.query(`
          INSERT INTO users (id, username, email, password_hash, full_name, role_id, is_active)
          VALUES ('user-admin-default', 'admin', 'huynhtanlocpp09@gmail.com', $1, 'Quản Trị Viên Bảo Tàng', 'role-superadmin', true);
        `, [defaultHash]);
        console.log('[PostgreSQL] Đã khởi tạo tài khoản quản trị mặc định (admin) trong PostgreSQL.');
      }

      return true;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.warn('[PostgreSQL] Không thể khởi tạo kết nối PostgreSQL (sẽ tự động kết nối lại khi có yêu cầu):', err.message);
    isPgConnected = false;
    return false;
  }
}

/**
 * Trợ thủ ghi nhật ký kiểm toán vào PostgreSQL
 */
export async function logAudit(
  action: string,
  resource: string,
  options: { userId?: string; username?: string; details?: any; ipAddress?: string } = {}
) {
  if (!isPgConnected) return;
  try {
    await pgPool.query(
      `INSERT INTO audit_logs (user_id, username, action, resource, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [
        options.userId || 'system',
        options.username || 'System Admin',
        action,
        resource,
        JSON.stringify(options.details || {}),
        options.ipAddress || '127.0.0.1'
      ]
    );
  } catch (err: any) {
    console.warn('[Audit Log Warning]:', err.message);
  }
}

/**
 * Kiểm tra trạng thái kết nối PostgreSQL
 */
export function getPgStatus(): { connected: boolean; uri: string } {
  return {
    connected: isPgConnected,
    uri: PG_URI.replace(/:[^:@]*@/, ':****@')
  };
}
