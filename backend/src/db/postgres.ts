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
          mongo_id VARCHAR(64),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 14. Bảng Vé tham quan bảo tàng (Tickets - Relational với Users)
      await client.query(`
        CREATE TABLE IF NOT EXISTS museum_tickets (
          id VARCHAR(64) PRIMARY KEY,
          ticket_code VARCHAR(64) UNIQUE NOT NULL,
          user_id VARCHAR(64),
          user_email VARCHAR(128) NOT NULL,
          user_name VARCHAR(128),
          user_phone VARCHAR(64),
          ticket_type VARCHAR(64) NOT NULL DEFAULT 'standard',
          ticket_title VARCHAR(256) DEFAULT 'Vé Tham Quan Tiêu Chuẩn',
          quantity INT NOT NULL DEFAULT 1,
          unit_price INT NOT NULL DEFAULT 30000,
          total_amount INT NOT NULL DEFAULT 30000,
          visit_date DATE NOT NULL,
          time_slot VARCHAR(64) NOT NULL DEFAULT '08:00 - 11:30',
          status VARCHAR(32) NOT NULL DEFAULT 'paid',
          payment_method VARCHAR(64) NOT NULL DEFAULT 'VNPay / Chuyển khoản QR',
          qr_code_data TEXT,
          notes TEXT,
          mongo_id VARCHAR(64),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON museum_tickets(user_id);
        CREATE INDEX IF NOT EXISTS idx_tickets_user_email ON museum_tickets(user_email);
        CREATE INDEX IF NOT EXISTS idx_tickets_ticket_code ON museum_tickets(ticket_code);
        CREATE INDEX IF NOT EXISTS idx_tickets_visit_date ON museum_tickets(visit_date);
        CREATE INDEX IF NOT EXISTS idx_tickets_mongo_id ON museum_tickets(mongo_id);

        -- 15. Bảng Quản lý Cấu hình Loại vé & Đơn giá thật (Ticket Types - Admin CMS)
        CREATE TABLE IF NOT EXISTS ticket_types (
          id VARCHAR(64) PRIMARY KEY,
          code VARCHAR(64) UNIQUE NOT NULL,
          name VARCHAR(256) NOT NULL,
          price INT NOT NULL DEFAULT 30000,
          original_price INT DEFAULT 0,
          description TEXT,
          benefits JSONB DEFAULT '[]',
          is_active BOOLEAN DEFAULT TRUE,
          display_order INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_ticket_types_code ON ticket_types(code);
        CREATE INDEX IF NOT EXISTS idx_ticket_types_active ON ticket_types(is_active);

        -- 16. Bảng Quản lý Khung giờ tham quan (Ticket Time Slots)
        CREATE TABLE IF NOT EXISTS ticket_time_slots (
          id VARCHAR(64) PRIMARY KEY,
          slot_name VARCHAR(128) NOT NULL,
          max_capacity INT DEFAULT 300,
          is_active BOOLEAN DEFAULT TRUE,
          display_order INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- 17. Bảng Hóa đơn / Lịch sử đơn hàng (Orders - Tích hợp PayOS)
        CREATE TABLE IF NOT EXISTS orders (
          id VARCHAR(64) PRIMARY KEY,
          order_code BIGINT UNIQUE NOT NULL,
          user_id VARCHAR(64),
          customer_name VARCHAR(128) NOT NULL,
          customer_email VARCHAR(128) NOT NULL,
          customer_phone VARCHAR(64) NOT NULL,
          total_amount INT NOT NULL,
          status VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending, paid, cancelled, expired
          payment_method VARCHAR(64) DEFAULT 'PayOS',
          payment_link_id VARCHAR(128),
          checkout_url TEXT,
          qr_code_data TEXT,
          paid_at TIMESTAMP WITH TIME ZONE,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_orders_order_code ON orders(order_code);
        CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
        CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
        CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
        CREATE INDEX IF NOT EXISTS idx_orders_expires_at ON orders(expires_at);

        -- 18. Bảng Chi tiết đơn hàng (Order Items)
        CREATE TABLE IF NOT EXISTS order_items (
          id VARCHAR(64) PRIMARY KEY,
          order_id VARCHAR(64) REFERENCES orders(id) ON DELETE CASCADE,
          ticket_type_code VARCHAR(64) NOT NULL,
          ticket_title VARCHAR(256) NOT NULL,
          quantity INT NOT NULL DEFAULT 1,
          unit_price INT NOT NULL DEFAULT 30000,
          total_price INT NOT NULL DEFAULT 30000,
          visit_date DATE NOT NULL,
          time_slot VARCHAR(64) NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

        -- Bổ sung order_id vào bảng museum_tickets
        ALTER TABLE museum_tickets ADD COLUMN IF NOT EXISTS order_id VARCHAR(64);
        CREATE INDEX IF NOT EXISTS idx_tickets_order_id ON museum_tickets(order_id);

        -- Nâng cấp Schema: Đảm bảo toàn bộ các bảng quan hệ đều có trường 'mongo_id' kèm Index
        ALTER TABLE users ADD COLUMN IF NOT EXISTS mongo_id VARCHAR(64);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(64);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
        ALTER TABLE topics ADD COLUMN IF NOT EXISTS mongo_id VARCHAR(64);
        ALTER TABLE rooms ADD COLUMN IF NOT EXISTS mongo_id VARCHAR(64);
        ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS mongo_id VARCHAR(64);
        ALTER TABLE floor_plans ADD COLUMN IF NOT EXISTS mongo_id VARCHAR(64);
        ALTER TABLE floor_plan_nodes ADD COLUMN IF NOT EXISTS mongo_id VARCHAR(64);
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS mongo_id VARCHAR(64);

        -- Đảm bảo bảng system_branding có đầy đủ 100% cột cho toàn bộ các Section CMS của trang quản trị
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS header_menu_items JSONB DEFAULT '[]';
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS hero_title TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS hero_tagline TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS hero_banner_url TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS hero_video_url TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS hero_cta1_text VARCHAR(256);
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS hero_cta2_text VARCHAR(256);
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS intro_tag VARCHAR(256);
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS intro_title TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS intro_desc TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS intro_badge_text VARCHAR(256);
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS intro_image_url TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS intro_cta_text VARCHAR(256);
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS rooms_tag VARCHAR(256);
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS rooms_title TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS rooms_desc TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS rooms_cta_text VARCHAR(256);
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS rooms_featured_id VARCHAR(64);
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS rooms_showcase_image_url TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS artifacts_tag VARCHAR(256);
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS artifacts_title TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS artifacts_desc TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS artifacts_cta_text VARCHAR(256);
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS guide_tag VARCHAR(256);
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS guide_title TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS guide_desc TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS guide_cta_text VARCHAR(256);
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS guide_map_url TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS guide_map_title TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS guide_map_desc TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS guide_opening_days TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS guide_morning_hours TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS guide_afternoon_hours TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS guide_closed_note TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS guide_ticket_adult VARCHAR(64);
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS guide_ticket_student VARCHAR(64);
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS guide_ticket_child VARCHAR(64);
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS guide_bus_routes TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS guide_parking_info TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS guide_google_maps_url TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS guide_google_maps_embed TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS guide_rule1_title VARCHAR(256);
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS guide_rule1_desc TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS guide_rule2_title VARCHAR(256);
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS guide_rule2_desc TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS guide_rule3_title VARCHAR(256);
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS guide_rule3_desc TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS guide_rule4_title VARCHAR(256);
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS guide_rule4_desc TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS footer_copyright_text TEXT;
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}';
        ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

        CREATE INDEX IF NOT EXISTS idx_users_mongo_id ON users(mongo_id);
        CREATE INDEX IF NOT EXISTS idx_topics_mongo_id ON topics(mongo_id);
        CREATE INDEX IF NOT EXISTS idx_rooms_mongo_id ON rooms(mongo_id);
        CREATE INDEX IF NOT EXISTS idx_artifacts_mongo_id ON artifacts(mongo_id);
        CREATE INDEX IF NOT EXISTS idx_floor_plans_mongo_id ON floor_plans(mongo_id);
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

      // Khởi tạo các loại vé mẫu chuẩn bảo tàng nếu bảng trống
      const ticketTypeCheck = await client.query('SELECT COUNT(*) FROM ticket_types;');
      if (parseInt(ticketTypeCheck.rows[0].count, 10) === 0) {
        await client.query(`
          INSERT INTO ticket_types (id, code, name, price, original_price, description, benefits, is_active, display_order)
          VALUES
          ('tt_standard', 'standard', 'Vé Người Lớn (Tiêu Chuẩn)', 30000, 30000, 'Khách tham quan công dân Việt Nam và quốc tế từ 16 đến 59 tuổi', '["Tham quan toàn bộ gian phòng di sản 360°", "Thuyết minh tự động qua mã QR", "Tự do trải nghiệm sa bàn và hiện vật"]', true, 1),
          ('tt_student', 'student', 'Vé Học Sinh - Sinh Viên', 15000, 30000, 'Xuất trình thẻ học sinh hoặc thẻ sinh viên còn hiệu lực tại cổng vào', '["Giảm 50% giá vé tham quan tiêu chuẩn", "Tham quan toàn bộ bảo tàng", "Thuyết minh tự động qua mã QR"]', true, 2),
          ('tt_senior', 'senior', 'Vé Người Cao Tuổi & Trẻ Em', 15000, 30000, 'Dành cho người cao tuổi từ 60 tuổi trở lên hoặc trẻ em từ 6 đến 15 tuổi', '["Ưu đãi giá vé di sản đặc biệt", "Lối đi ưu tiên tại cổng soát vé", "Hỗ trợ hướng dẫn tận tình"]', true, 3),
          ('tt_vip', 'vip', 'Vé Tham Quan Toàn Diện VIP', 100000, 120000, 'Trải nghiệm trọn gói kèm thuyết minh viên chuyên nghiệp và tương tác 3D', '["Thuyết minh viên chuyên nghiệp đi cùng đoàn", "Trải nghiệm không gian 3D tương tác đa phương tiện", "Bản đồ di sản lưu niệm bảo tàng", "Hàng lối soát vé ưu tiên riêng biệt"]', true, 4);
        `);
        console.log('[PostgreSQL] Đã khởi tạo 4 loại vé tham quan mẫu chuẩn.');
      }

      // Khởi tạo các khung giờ tham quan nếu bảng trống
      const slotCheck = await client.query('SELECT COUNT(*) FROM ticket_time_slots;');
      if (parseInt(slotCheck.rows[0].count, 10) === 0) {
        await client.query(`
          INSERT INTO ticket_time_slots (id, slot_name, max_capacity, is_active, display_order)
          VALUES
          ('slot_morning', 'Buổi sáng: 08:00 - 11:30', 300, true, 1),
          ('slot_afternoon', 'Buổi chiều: 13:30 - 17:00', 300, true, 2);
        `);
        console.log('[PostgreSQL] Đã khởi tạo 2 khung giờ tham quan chuẩn.');
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
