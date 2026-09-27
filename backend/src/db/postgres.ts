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

      // 5. Bảng Chuyên đề bảo tàng (Topics)
      await client.query(`
        CREATE TABLE IF NOT EXISTS topics (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(256) NOT NULL,
          description TEXT,
          order_index INT DEFAULT 1,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 6. Bảng Gian phòng không gian ảo 360° (Rooms)
      await client.query(`
        CREATE TABLE IF NOT EXISTS rooms (
          id VARCHAR(64) PRIMARY KEY,
          code VARCHAR(64) NOT NULL,
          name VARCHAR(256) NOT NULL,
          period VARCHAR(256) DEFAULT 'Tiến trình Lịch sử VN',
          category VARCHAR(256) DEFAULT 'Tiến trình Lịch sử VN',
          description TEXT,
          panorama_url TEXT NOT NULL,
          thumbnail_url TEXT NOT NULL,
          initial_view JSONB DEFAULT '{"pitch":0,"yaw":0,"fov":90}',
          order_index INT DEFAULT 1,
          active BOOLEAN DEFAULT true,
          ai_voice_enabled BOOLEAN DEFAULT false,
          ai_knowledge_prompt TEXT,
          ai_script TEXT,
          ai_voice_lang VARCHAR(32) DEFAULT 'vi-south',
          qr_scan_count INT DEFAULT 0,
          scenes_count INT DEFAULT 1,
          translations JSONB DEFAULT '{}',
          topic_id VARCHAR(64) REFERENCES topics(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 7. Bảng Điểm tương tác trong phòng (Hotspots - Relational 1-N với Rooms)
      await client.query(`
        CREATE TABLE IF NOT EXISTS hotspots (
          id VARCHAR(64) PRIMARY KEY,
          room_id VARCHAR(64) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
          type VARCHAR(32) DEFAULT 'navigation',
          title VARCHAR(256) NOT NULL,
          description TEXT,
          target_room_id VARCHAR(64) REFERENCES rooms(id) ON DELETE SET NULL,
          artifact_id VARCHAR(64),
          pitch FLOAT NOT NULL,
          yaw FLOAT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_hotspots_room_id ON hotspots(room_id);
      `);

      // 8. Bảng Hiện vật di sản văn hóa (Artifacts - Relational với Rooms & Topics)
      await client.query(`
        CREATE TABLE IF NOT EXISTS artifacts (
          id VARCHAR(64) PRIMARY KEY,
          code VARCHAR(64) UNIQUE NOT NULL,
          name VARCHAR(256) NOT NULL,
          room_id VARCHAR(64) REFERENCES rooms(id) ON DELETE SET NULL,
          room_code VARCHAR(64),
          topic_id VARCHAR(64) REFERENCES topics(id) ON DELETE SET NULL,
          category VARCHAR(256) DEFAULT 'Cổ vật di sản',
          period VARCHAR(256) DEFAULT 'Thời cổ',
          origin VARCHAR(256) DEFAULT 'Bảo tàng Lịch sử TP.HCM',
          description TEXT,
          dimensions VARCHAR(128),
          images JSONB DEFAULT '[]',
          thumbnail_url TEXT,
          model_3d_url TEXT,
          audio_narration_url TEXT,
          voice_language VARCHAR(32) DEFAULT 'vi',
          qr_code_url TEXT,
          status VARCHAR(32) DEFAULT 'active',
          processing_status VARCHAR(32) DEFAULT 'idle',
          processing_error TEXT,
          model_metadata JSONB DEFAULT '{}',
          translations JSONB DEFAULT '{}',
          order_index INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_artifacts_room_id ON artifacts(room_id);
        CREATE INDEX IF NOT EXISTS idx_artifacts_topic_id ON artifacts(topic_id);
      `);

      // 9. Bảng Sơ đồ mặt bằng bảo tàng (Floor Plans)
      await client.query(`
        CREATE TABLE IF NOT EXISTS floor_plans (
          id VARCHAR(64) PRIMARY KEY,
          title VARCHAR(256) NOT NULL,
          description TEXT,
          image_url TEXT,
          image_width INT DEFAULT 1920,
          image_height INT DEFAULT 1080,
          analyzed_at TIMESTAMP WITH TIME ZONE,
          analysis_algorithm VARCHAR(128) DEFAULT 'hybrid_cv_gemini',
          compass_orientation JSONB DEFAULT '{"detected":false,"northAngleDeg":0,"confidence":1,"description":"Mặc định hướng Bắc"}',
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 10. Bảng Vùng không gian sơ đồ (Floor Plan Nodes - Relational 1-N với Floor Plans & Rooms)
      await client.query(`
        CREATE TABLE IF NOT EXISTS floor_plan_nodes (
          id VARCHAR(64) PRIMARY KEY,
          floor_plan_id VARCHAR(64) NOT NULL REFERENCES floor_plans(id) ON DELETE CASCADE,
          room_id VARCHAR(64) REFERENCES rooms(id) ON DELETE SET NULL,
          code VARCHAR(64) NOT NULL,
          name VARCHAR(256) NOT NULL,
          period VARCHAR(256),
          category VARCHAR(256),
          x FLOAT NOT NULL,
          y FLOAT NOT NULL,
          width FLOAT NOT NULL,
          height FLOAT NOT NULL,
          is_entrance BOOLEAN DEFAULT false,
          color_tag VARCHAR(32) DEFAULT '#C5A880',
          panorama_url TEXT,
          thumbnail_url TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_fp_nodes_plan_id ON floor_plan_nodes(floor_plan_id);
      `);

      // 11. Bảng Cửa thông phòng & Lối di chuyển (Floor Plan Edges - Relational 1-N với Floor Plans)
      await client.query(`
        CREATE TABLE IF NOT EXISTS floor_plan_edges (
          id VARCHAR(64) PRIMARY KEY,
          floor_plan_id VARCHAR(64) NOT NULL REFERENCES floor_plans(id) ON DELETE CASCADE,
          from_node_id VARCHAR(64) NOT NULL,
          to_node_id VARCHAR(64) NOT NULL,
          direction VARCHAR(32) NOT NULL,
          compass_direction VARCHAR(32) NOT NULL,
          door_x FLOAT NOT NULL,
          door_y FLOAT NOT NULL,
          label VARCHAR(256),
          target_room_name VARCHAR(256),
          distance FLOAT,
          is_return BOOLEAN DEFAULT false
        );
        CREATE INDEX IF NOT EXISTS idx_fp_edges_plan_id ON floor_plan_edges(floor_plan_id);
      `);

      // 12. Bảng Ngôn ngữ hỗ trợ (Languages)
      await client.query(`
        CREATE TABLE IF NOT EXISTS languages (
          code VARCHAR(16) PRIMARY KEY,
          name VARCHAR(64) NOT NULL,
          native_name VARCHAR(64) NOT NULL,
          flag_icon VARCHAR(64) DEFAULT '🌐',
          is_default BOOLEAN DEFAULT false,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 13. Bảng Nhận diện thương hiệu & Thông tin bảo tàng (System Branding)
      await client.query(`
        CREATE TABLE IF NOT EXISTS system_branding (
          id VARCHAR(64) PRIMARY KEY,
          museum_name VARCHAR(256) NOT NULL,
          short_name VARCHAR(64) DEFAULT 'BTLS',
          emblem_text VARCHAR(128),
          logo_url TEXT,
          tagline TEXT,
          city VARCHAR(128) DEFAULT 'TP. Hồ Chí Minh',
          address TEXT,
          contact_email VARCHAR(128),
          hotline VARCHAR(64),
          header_menu_items JSONB DEFAULT '[]',
          hero_title TEXT,
          hero_tagline TEXT,
          hero_banner_url TEXT,
          hero_video_url TEXT,
          intro_title TEXT,
          intro_desc TEXT,
          intro_image_url TEXT,
          guide_map_url TEXT,
          guide_map_title TEXT,
          guide_map_desc TEXT,
          guide_opening_days TEXT,
          guide_morning_hours TEXT,
          guide_afternoon_hours TEXT,
          guide_closed_note TEXT,
          guide_ticket_adult VARCHAR(64),
          guide_ticket_student VARCHAR(64),
          guide_ticket_child VARCHAR(64),
          guide_bus_routes TEXT,
          guide_parking_info TEXT,
          guide_google_maps_url TEXT,
          data JSONB DEFAULT '{}',
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
