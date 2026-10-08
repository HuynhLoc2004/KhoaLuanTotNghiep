-- CƠ SỞ DỮ LIỆU BẢO TÀNG LỊCH SỬ TP. HỒ CHÍ MINH
-- Toàn bộ 20 bảng quan hệ cho ERD Editor

CREATE TABLE roles (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
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

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    username VARCHAR(64),
    action VARCHAR(128) NOT NULL,
    resource VARCHAR(128) NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_settings (
    key VARCHAR(128) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE topics (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    description TEXT,
    order_index INT DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(256) NOT NULL,
    period VARCHAR(256) DEFAULT 'Tiến trình Lịch sử VN',
    category VARCHAR(256) DEFAULT 'Tiến trình Lịch sử VN',
    description TEXT,
    panorama_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    initial_view JSONB DEFAULT '{"pitch":0,"yaw":0,"fov":90}',
    topic_id VARCHAR(64) REFERENCES topics(id) ON DELETE SET NULL,
    order_index INT DEFAULT 1,
    active BOOLEAN DEFAULT true,
    ai_voice_enabled BOOLEAN DEFAULT false,
    ai_knowledge_prompt TEXT,
    ai_script TEXT,
    ai_voice_lang VARCHAR(32) DEFAULT 'vi-south',
    qr_scan_count INT DEFAULT 0,
    scenes_count INT DEFAULT 1,
    translations JSONB DEFAULT '{}',
    audio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hotspots (
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

CREATE TABLE artifacts (
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

CREATE TABLE floor_plans (
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

CREATE TABLE floor_plan_nodes (
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

CREATE TABLE floor_plan_edges (
    id VARCHAR(64) PRIMARY KEY,
    floor_plan_id VARCHAR(64) NOT NULL REFERENCES floor_plans(id) ON DELETE CASCADE,
    from_node_id VARCHAR(64) NOT NULL REFERENCES floor_plan_nodes(id) ON DELETE CASCADE,
    to_node_id VARCHAR(64) NOT NULL REFERENCES floor_plan_nodes(id) ON DELETE CASCADE,
    direction VARCHAR(32) NOT NULL,
    compass_direction VARCHAR(32) NOT NULL,
    door_x FLOAT NOT NULL,
    door_y FLOAT NOT NULL,
    label VARCHAR(256),
    target_room_name VARCHAR(256),
    distance FLOAT,
    is_return BOOLEAN DEFAULT false
);

CREATE TABLE floor_plan_nav_settings (
    id VARCHAR(64) PRIMARY KEY,
    floor_plan_id VARCHAR(64) NOT NULL REFERENCES floor_plans(id) ON DELETE CASCADE,
    voice_enabled BOOLEAN DEFAULT true,
    auto_play_voice BOOLEAN DEFAULT false,
    speech_speed FLOAT DEFAULT 1.0,
    tts_provider VARCHAR(32) DEFAULT 'google',
    welcome_message JSONB DEFAULT '{"vi":"Xin chào, tôi là trợ lý dẫn đường bản đồ. Hãy chọn vị trí bạn đang đứng và điểm bạn muốn đến.","en":"Hello, I am your museum map navigator. Please select your current location and desired destination."}',
    custom_rules JSONB DEFAULT '[]',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE floor_plan_nav_logs (
    id VARCHAR(64) PRIMARY KEY,
    floor_plan_id VARCHAR(64) NOT NULL REFERENCES floor_plans(id) ON DELETE CASCADE,
    start_node_id VARCHAR(64) NOT NULL,
    start_node_name VARCHAR(256),
    end_node_id VARCHAR(64) NOT NULL,
    end_node_name VARCHAR(256),
    lang VARCHAR(16) DEFAULT 'vi',
    path_node_ids JSONB NOT NULL,
    step_count INT DEFAULT 0,
    total_distance FLOAT DEFAULT 0,
    instruction_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE languages (
    code VARCHAR(16) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    native_name VARCHAR(64) NOT NULL,
    flag_icon VARCHAR(64) DEFAULT '🌐',
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_branding (
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

CREATE TABLE ticket_types (
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

CREATE TABLE ticket_time_slots (
    id VARCHAR(64) PRIMARY KEY,
    slot_name VARCHAR(128) NOT NULL,
    open_time VARCHAR(16) DEFAULT '08:00',
    close_time VARCHAR(16) DEFAULT '17:00',
    max_capacity INT DEFAULT 300,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id VARCHAR(64) PRIMARY KEY,
    order_code BIGINT UNIQUE NOT NULL,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(128) NOT NULL,
    customer_email VARCHAR(128) NOT NULL,
    customer_phone VARCHAR(64) NOT NULL,
    total_amount INT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(64) DEFAULT 'PayOS',
    payment_link_id VARCHAR(128),
    checkout_url TEXT,
    qr_code_data TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) REFERENCES orders(id) ON DELETE CASCADE,
    ticket_type_code VARCHAR(64) NOT NULL REFERENCES ticket_types(code) ON DELETE RESTRICT,
    ticket_title VARCHAR(256) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price INT NOT NULL DEFAULT 30000,
    total_price INT NOT NULL DEFAULT 30000,
    visit_date DATE NOT NULL,
    time_slot VARCHAR(64) NOT NULL
);

CREATE TABLE museum_tickets (
    id VARCHAR(64) PRIMARY KEY,
    ticket_code VARCHAR(64) UNIQUE NOT NULL,
    order_id VARCHAR(64) REFERENCES orders(id) ON DELETE SET NULL,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(128) NOT NULL,
    user_name VARCHAR(128),
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
