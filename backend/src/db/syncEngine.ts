import { pgPool } from './postgres.js';
import { Topic, INITIAL_TOPICS } from '../models/Topic.js';
import { Room } from '../models/Room.js';
import { ArtifactModel } from '../models/Artifact.js';
import { FloorPlanMap } from '../models/FloorPlanMap.js';
import { Language } from '../models/Language.js';
import { SystemBranding } from '../models/SystemBranding.js';
import { User } from '../models/User.js';
import { Role } from '../models/Role.js';

/**
 * ĐỒNG BỘ DỮ LIỆU TOÀN DIỆN GIỮA POSTGRESQL (PRIMARY) VÀ MONGODB (MIRROR / DOCUMENT STORE)
 * Đảm bảo dữ liệu là THẬT 100%, bảo toàn các khóa ngoại và cấu trúc quan hệ.
 */

// ==========================================
// 1. HELPERS THAO TÁC POSTGRESQL
// ==========================================

export async function pgUpsertTopic(topic: any) {
  try {
    const id = topic.id || topic._id?.toString();
    if (!id) return;
    await pgPool.query(`
      INSERT INTO topics (id, name, description, order_index, active, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        order_index = EXCLUDED.order_index,
        active = EXCLUDED.active,
        updated_at = CURRENT_TIMESTAMP;
    `, [id, topic.name || '', topic.description || '', topic.orderIndex ?? 1, topic.active ?? true]);
  } catch (err: any) {
    console.warn(`[SyncEngine] Lỗi đồng bộ Topic sang PostgreSQL (${topic.id}):`, err.message);
  }
}

export async function pgDeleteTopic(id: string) {
  try {
    await pgPool.query('DELETE FROM topics WHERE id = $1', [id]);
  } catch (err: any) {
    console.warn(`[SyncEngine] Lỗi xóa Topic trong PostgreSQL (${id}):`, err.message);
  }
}

export async function pgUpsertRoom(room: any) {
  try {
    const id = room.id || room._id?.toString();
    if (!id) return;

    await pgPool.query(`
      INSERT INTO rooms (
        id, code, name, period, category, description, panorama_url, thumbnail_url,
        initial_view, order_index, active, ai_voice_enabled, ai_knowledge_prompt,
        ai_script, ai_voice_lang, qr_scan_count, scenes_count, translations, topic_id, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        code = EXCLUDED.code,
        name = EXCLUDED.name,
        period = EXCLUDED.period,
        category = EXCLUDED.category,
        description = EXCLUDED.description,
        panorama_url = EXCLUDED.panorama_url,
        thumbnail_url = EXCLUDED.thumbnail_url,
        initial_view = EXCLUDED.initial_view,
        order_index = EXCLUDED.order_index,
        active = EXCLUDED.active,
        ai_voice_enabled = EXCLUDED.ai_voice_enabled,
        ai_knowledge_prompt = EXCLUDED.ai_knowledge_prompt,
        ai_script = EXCLUDED.ai_script,
        ai_voice_lang = EXCLUDED.ai_voice_lang,
        qr_scan_count = EXCLUDED.qr_scan_count,
        scenes_count = EXCLUDED.scenes_count,
        translations = EXCLUDED.translations,
        topic_id = EXCLUDED.topic_id,
        updated_at = CURRENT_TIMESTAMP;
    `, [
      id,
      room.code || id,
      room.name || '',
      room.period || 'Tiến trình Lịch sử VN',
      room.category || 'Tiến trình Lịch sử VN',
      room.description || '',
      room.panoramaUrl || '',
      room.thumbnailUrl || '',
      JSON.stringify(room.initialView || { pitch: 0, yaw: 0, fov: 90 }),
      room.orderIndex ?? 1,
      room.active ?? true,
      room.aiVoiceEnabled ?? false,
      room.aiKnowledgePrompt || '',
      room.aiScript || '',
      room.aiVoiceLang || 'vi-south',
      room.qrScanCount ?? 0,
      room.scenesCount ?? 1,
      JSON.stringify(room.translations || {}),
      room.topicId || null
    ]);

    // Đồng bộ danh sách Hotspots con (Quan hệ 1-N)
    await pgPool.query('DELETE FROM hotspots WHERE room_id = $1', [id]);
    if (Array.isArray(room.hotspots) && room.hotspots.length > 0) {
      for (const hs of room.hotspots) {
        if (!hs.id) continue;
        await pgPool.query(`
          INSERT INTO hotspots (id, room_id, type, title, description, target_room_id, artifact_id, pitch, yaw)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            target_room_id = EXCLUDED.target_room_id,
            artifact_id = EXCLUDED.artifact_id,
            pitch = EXCLUDED.pitch,
            yaw = EXCLUDED.yaw;
        `, [
          hs.id,
          id,
          hs.type || 'navigation',
          hs.title || '',
          hs.description || '',
          hs.targetRoomId || null,
          hs.artifactId || null,
          hs.pitch ?? 0,
          hs.yaw ?? 0
        ]);
      }
    }
  } catch (err: any) {
    console.warn(`[SyncEngine] Lỗi đồng bộ Room sang PostgreSQL (${room.id}):`, err.message);
  }
}

export async function pgDeleteRoom(id: string) {
  try {
    await pgPool.query('DELETE FROM rooms WHERE id = $1', [id]);
  } catch (err: any) {
    console.warn(`[SyncEngine] Lỗi xóa Room trong PostgreSQL (${id}):`, err.message);
  }
}

export async function pgUpsertArtifact(artifact: any) {
  try {
    const id = artifact.id || artifact._id?.toString();
    if (!id || !artifact.code) return;

    await pgPool.query(`
      INSERT INTO artifacts (
        id, code, name, room_id, room_code, topic_id, category, period, origin,
        description, dimensions, images, thumbnail_url, model_3d_url,
        audio_narration_url, voice_language, qr_code_url, status,
        processing_status, processing_error, model_metadata, translations,
        order_index, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        code = EXCLUDED.code,
        name = EXCLUDED.name,
        room_id = EXCLUDED.room_id,
        room_code = EXCLUDED.room_code,
        topic_id = EXCLUDED.topic_id,
        category = EXCLUDED.category,
        period = EXCLUDED.period,
        origin = EXCLUDED.origin,
        description = EXCLUDED.description,
        dimensions = EXCLUDED.dimensions,
        images = EXCLUDED.images,
        thumbnail_url = EXCLUDED.thumbnail_url,
        model_3d_url = EXCLUDED.model_3d_url,
        audio_narration_url = EXCLUDED.audio_narration_url,
        voice_language = EXCLUDED.voice_language,
        qr_code_url = EXCLUDED.qr_code_url,
        status = EXCLUDED.status,
        processing_status = EXCLUDED.processing_status,
        processing_error = EXCLUDED.processing_error,
        model_metadata = EXCLUDED.model_metadata,
        translations = EXCLUDED.translations,
        order_index = EXCLUDED.order_index,
        updated_at = CURRENT_TIMESTAMP;
    `, [
      id,
      artifact.code,
      artifact.name || '',
      artifact.roomId || null,
      artifact.roomCode || '',
      artifact.topicId || null,
      artifact.category || 'Cổ vật di sản',
      artifact.period || 'Thời cổ',
      artifact.origin || 'Bảo tàng Lịch sử TP.HCM',
      artifact.description || '',
      artifact.dimensions || '',
      JSON.stringify(artifact.images || []),
      artifact.thumbnailUrl || '',
      artifact.model3dUrl || '',
      artifact.audioNarrationUrl || '',
      artifact.voiceLanguage || 'vi',
      artifact.qrCodeUrl || '',
      artifact.status || 'active',
      artifact.processingStatus || 'idle',
      artifact.processingError || '',
      JSON.stringify(artifact.modelMetadata || {}),
      JSON.stringify(artifact.translations || {}),
      artifact.orderIndex ?? 0
    ]);
  } catch (err: any) {
    console.warn(`[SyncEngine] Lỗi đồng bộ Artifact sang PostgreSQL (${artifact.code}):`, err.message);
  }
}

export async function pgDeleteArtifact(id: string) {
  try {
    await pgPool.query('DELETE FROM artifacts WHERE id = $1', [id]);
  } catch (err: any) {
    console.warn(`[SyncEngine] Lỗi xóa Artifact trong PostgreSQL (${id}):`, err.message);
  }
}

export async function pgUpsertFloorPlan(fp: any) {
  try {
    const id = fp.id || fp._id?.toString();
    if (!id) return;

    await pgPool.query(`
      INSERT INTO floor_plans (
        id, title, description, image_url, image_width, image_height,
        analyzed_at, analysis_algorithm, compass_orientation, active, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        image_url = EXCLUDED.image_url,
        image_width = EXCLUDED.image_width,
        image_height = EXCLUDED.image_height,
        analyzed_at = EXCLUDED.analyzed_at,
        analysis_algorithm = EXCLUDED.analysis_algorithm,
        compass_orientation = EXCLUDED.compass_orientation,
        active = EXCLUDED.active,
        updated_at = CURRENT_TIMESTAMP;
    `, [
      id,
      fp.title || '',
      fp.description || '',
      fp.imageUrl || '',
      fp.imageWidth ?? 1920,
      fp.imageHeight ?? 1080,
      fp.analyzedAt ? new Date(fp.analyzedAt) : new Date(),
      fp.analysisAlgorithm || 'hybrid_cv_gemini',
      JSON.stringify(fp.compassOrientation || { detected: false, northAngleDeg: 0, confidence: 1, description: 'Mặc định hướng Bắc' }),
      fp.active ?? true
    ]);

    // Đồng bộ Nodes
    await pgPool.query('DELETE FROM floor_plan_nodes WHERE floor_plan_id = $1', [id]);
    if (Array.isArray(fp.nodes) && fp.nodes.length > 0) {
      for (const n of fp.nodes) {
        if (!n.id) continue;
        await pgPool.query(`
          INSERT INTO floor_plan_nodes (
            id, floor_plan_id, room_id, code, name, period, category,
            x, y, width, height, is_entrance, color_tag, panorama_url, thumbnail_url
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            code = EXCLUDED.code,
            room_id = EXCLUDED.room_id,
            x = EXCLUDED.x,
            y = EXCLUDED.y,
            width = EXCLUDED.width,
            height = EXCLUDED.height,
            is_entrance = EXCLUDED.is_entrance,
            color_tag = EXCLUDED.color_tag,
            panorama_url = EXCLUDED.panorama_url,
            thumbnail_url = EXCLUDED.thumbnail_url;
        `, [
          n.id,
          id,
          n.roomId || null,
          n.code || n.id,
          n.name || '',
          n.period || '',
          n.category || '',
          n.x ?? 0,
          n.y ?? 0,
          n.width ?? 10,
          n.height ?? 10,
          n.isEntrance ?? false,
          n.colorTag || '#C5A880',
          n.panoramaUrl || '',
          n.thumbnailUrl || ''
        ]);
      }
    }

    // Đồng bộ Edges
    await pgPool.query('DELETE FROM floor_plan_edges WHERE floor_plan_id = $1', [id]);
    if (Array.isArray(fp.edges) && fp.edges.length > 0) {
      for (const e of fp.edges) {
        if (!e.id) continue;
        await pgPool.query(`
          INSERT INTO floor_plan_edges (
            id, floor_plan_id, from_node_id, to_node_id, direction,
            compass_direction, door_x, door_y, label, target_room_name, distance, is_return
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO UPDATE SET
            direction = EXCLUDED.direction,
            compass_direction = EXCLUDED.compass_direction,
            door_x = EXCLUDED.door_x,
            door_y = EXCLUDED.door_y,
            label = EXCLUDED.label,
            target_room_name = EXCLUDED.target_room_name,
            distance = EXCLUDED.distance,
            is_return = EXCLUDED.is_return;
        `, [
          e.id,
          id,
          e.fromNodeId,
          e.toNodeId,
          e.direction || 'front',
          e.compassDirection || 'north',
          e.doorX ?? 50,
          e.doorY ?? 50,
          e.label || '',
          e.targetRoomName || '',
          e.distance ?? 10,
          e.isReturn ?? false
        ]);
      }
    }
  } catch (err: any) {
    console.warn(`[SyncEngine] Lỗi đồng bộ FloorPlan sang PostgreSQL (${fp.id}):`, err.message);
  }
}

export async function pgDeleteFloorPlan(id: string) {
  try {
    await pgPool.query('DELETE FROM floor_plans WHERE id = $1', [id]);
  } catch (err: any) {
    console.warn(`[SyncEngine] Lỗi xóa FloorPlan trong PostgreSQL (${id}):`, err.message);
  }
}

export async function pgUpsertLanguage(lang: any) {
  try {
    await pgPool.query(`
      INSERT INTO languages (code, name, native_name, flag_icon, is_default, is_active, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT (code) DO UPDATE SET
        name = EXCLUDED.name,
        native_name = EXCLUDED.native_name,
        flag_icon = EXCLUDED.flag_icon,
        is_default = EXCLUDED.is_default,
        is_active = EXCLUDED.is_active,
        updated_at = CURRENT_TIMESTAMP;
    `, [lang.code, lang.name, lang.nativeName, lang.flagIcon || '🌐', lang.isDefault ?? false, lang.isActive ?? true]);
  } catch (err: any) {
    console.warn(`[SyncEngine] Lỗi đồng bộ Language sang PostgreSQL (${lang.code}):`, err.message);
  }
}

export async function pgUpsertBranding(branding: any) {
  try {
    const id = branding.id || 'system-branding-main';
    await pgPool.query(`
      INSERT INTO system_branding (
        id, museum_name, short_name, emblem_text, logo_url, tagline,
        city, address, contact_email, hotline, header_menu_items,
        hero_title, hero_tagline, hero_banner_url, hero_video_url,
        intro_title, intro_desc, intro_image_url, guide_map_url,
        guide_map_title, guide_map_desc, guide_opening_days,
        guide_morning_hours, guide_afternoon_hours, guide_closed_note,
        guide_ticket_adult, guide_ticket_student, guide_ticket_child,
        guide_bus_routes, guide_parking_info, guide_google_maps_url,
        data, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        museum_name = EXCLUDED.museum_name,
        short_name = EXCLUDED.short_name,
        emblem_text = EXCLUDED.emblem_text,
        logo_url = EXCLUDED.logo_url,
        tagline = EXCLUDED.tagline,
        city = EXCLUDED.city,
        address = EXCLUDED.address,
        contact_email = EXCLUDED.contact_email,
        hotline = EXCLUDED.hotline,
        header_menu_items = EXCLUDED.header_menu_items,
        hero_title = EXCLUDED.hero_title,
        hero_tagline = EXCLUDED.hero_tagline,
        hero_banner_url = EXCLUDED.hero_banner_url,
        hero_video_url = EXCLUDED.hero_video_url,
        intro_title = EXCLUDED.intro_title,
        intro_desc = EXCLUDED.intro_desc,
        intro_image_url = EXCLUDED.intro_image_url,
        guide_map_url = EXCLUDED.guide_map_url,
        guide_map_title = EXCLUDED.guide_map_title,
        guide_map_desc = EXCLUDED.guide_map_desc,
        guide_opening_days = EXCLUDED.guide_opening_days,
        guide_morning_hours = EXCLUDED.guide_morning_hours,
        guide_afternoon_hours = EXCLUDED.guide_afternoon_hours,
        guide_closed_note = EXCLUDED.guide_closed_note,
        guide_ticket_adult = EXCLUDED.guide_ticket_adult,
        guide_ticket_student = EXCLUDED.guide_ticket_student,
        guide_ticket_child = EXCLUDED.guide_ticket_child,
        guide_bus_routes = EXCLUDED.guide_bus_routes,
        guide_parking_info = EXCLUDED.guide_parking_info,
        guide_google_maps_url = EXCLUDED.guide_google_maps_url,
        data = EXCLUDED.data,
        updated_at = CURRENT_TIMESTAMP;
    `, [
      id,
      branding.museumName || 'Bảo tàng Lịch sử TP. Hồ Chí Minh',
      branding.shortName || 'BTLS',
      branding.emblemText || '',
      branding.logoUrl || '',
      branding.tagline || '',
      branding.city || 'TP. Hồ Chí Minh',
      branding.address || '',
      branding.contactEmail || '',
      branding.hotline || '',
      JSON.stringify(branding.headerMenuItems || []),
      branding.heroTitle || '',
      branding.heroTagline || '',
      branding.heroBannerUrl || '',
      branding.heroVideoUrl || '',
      branding.introTitle || '',
      branding.introDesc || '',
      branding.introImageUrl || '',
      branding.guideMapUrl || '',
      branding.guideMapTitle || '',
      branding.guideMapDesc || '',
      branding.guideOpeningDays || '',
      branding.guideMorningHours || '',
      branding.guideAfternoonHours || '',
      branding.guideClosedNote || '',
      branding.guideTicketAdult || '30.000 VNĐ',
      branding.guideTicketStudent || '15.000 VNĐ',
      branding.guideTicketChild || 'Miễn phí',
      branding.guideBusRoutes || '',
      branding.guideParkingInfo || '',
      branding.guideGoogleMapsUrl || '',
      JSON.stringify(branding.data || {})
    ]);
  } catch (err: any) {
    console.warn('[SyncEngine] Lỗi đồng bộ Branding sang PostgreSQL:', err.message);
  }
}

export async function pgUpsertUser(user: any) {
  try {
    const id = user.id || user._id?.toString();
    if (!id || !user.username) return;

    await pgPool.query(`
      INSERT INTO users (id, username, email, password_hash, full_name, role_id, is_active, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        email = EXCLUDED.email,
        password_hash = CASE WHEN EXCLUDED.password_hash != 'NO_PASSWORD_OTP_ONLY' THEN EXCLUDED.password_hash ELSE users.password_hash END,
        full_name = EXCLUDED.full_name,
        role_id = EXCLUDED.role_id,
        is_active = EXCLUDED.is_active,
        updated_at = CURRENT_TIMESTAMP;
    `, [
      id,
      user.username,
      user.email,
      user.password || 'NO_PASSWORD_OTP_ONLY',
      user.fullName || '',
      user.role === 'admin' ? 'role-superadmin' : (user.role === 'editor' ? 'role-editor' : 'role-viewer'),
      user.isActive ?? true
    ]);
  } catch (err: any) {
    console.warn(`[SyncEngine] Lỗi đồng bộ User sang PostgreSQL (${user.username}):`, err.message);
  }
}

// ==========================================
// 2. KHỞI CHẠY ĐỒNG BỘ TOÀN DIỆN KHI SERVER STARTUP
// ==========================================
export async function runStartupDataSync() {
  try {
    console.log('[SyncEngine] Bắt đầu kiểm tra và đồng bộ hai chiều giữa PostgreSQL (Primary) và MongoDB...');

    // 1. Đồng bộ Topics
    const pgTopics = await pgPool.query('SELECT COUNT(*) FROM topics;');
    const pgTopicCount = parseInt(pgTopics.rows[0].count, 10);
    const mongoTopics = await Topic.find().lean();

    if (pgTopicCount === 0 && mongoTopics.length > 0) {
      console.log(`[SyncEngine] Đang di chuyển ${mongoTopics.length} Topics từ MongoDB sang PostgreSQL...`);
      for (const t of mongoTopics) {
        await pgUpsertTopic(t);
      }
    } else if (pgTopicCount === 0 && mongoTopics.length === 0) {
      console.log('[SyncEngine] Khởi tạo dữ liệu chuyên đề hạt nhân mặc định cho PostgreSQL & MongoDB...');
      for (const t of INITIAL_TOPICS) {
        await pgUpsertTopic(t);
        await Topic.updateOne({ id: t.id }, { $set: t }, { upsert: true });
      }
    }

    // 2. Đồng bộ Rooms
    const pgRooms = await pgPool.query('SELECT COUNT(*) FROM rooms;');
    const pgRoomCount = parseInt(pgRooms.rows[0].count, 10);
    const mongoRooms = await Room.find().lean();

    if (pgRoomCount === 0 && mongoRooms.length > 0) {
      console.log(`[SyncEngine] Đang di chuyển ${mongoRooms.length} Rooms & Hotspots từ MongoDB sang PostgreSQL...`);
      for (const r of mongoRooms) {
        await pgUpsertRoom(r);
      }
    }

    // 3. Đồng bộ Artifacts
    const pgArtifacts = await pgPool.query('SELECT COUNT(*) FROM artifacts;');
    const pgArtifactCount = parseInt(pgArtifacts.rows[0].count, 10);
    const mongoArtifacts = await ArtifactModel.find().lean();

    if (pgArtifactCount === 0 && mongoArtifacts.length > 0) {
      console.log(`[SyncEngine] Đang di chuyển ${mongoArtifacts.length} Artifacts từ MongoDB sang PostgreSQL...`);
      for (const a of mongoArtifacts) {
        await pgUpsertArtifact(a);
      }
    }

    // 4. Đồng bộ FloorPlan
    const pgFp = await pgPool.query('SELECT COUNT(*) FROM floor_plans;');
    const pgFpCount = parseInt(pgFp.rows[0].count, 10);
    const mongoFp = await FloorPlanMap.find().lean();

    if (pgFpCount === 0 && mongoFp.length > 0) {
      console.log(`[SyncEngine] Đang di chuyển ${mongoFp.length} Sơ đồ mặt bằng từ MongoDB sang PostgreSQL...`);
      for (const fp of mongoFp) {
        await pgUpsertFloorPlan(fp);
      }
    }

    // 5. Đồng bộ Languages
    const pgLang = await pgPool.query('SELECT COUNT(*) FROM languages;');
    const pgLangCount = parseInt(pgLang.rows[0].count, 10);
    const mongoLang = await Language.find().lean();

    if (pgLangCount === 0 && mongoLang.length > 0) {
      for (const l of mongoLang) {
        await pgUpsertLanguage(l);
      }
    }

    // 6. Đồng bộ Users
    const pgUsers = await pgPool.query('SELECT COUNT(*) FROM users;');
    const pgUserCount = parseInt(pgUsers.rows[0].count, 10);
    const mongoUsers = await User.find().lean();

    if (pgUserCount <= 1 && mongoUsers.length > 0) {
      for (const u of mongoUsers) {
        await pgUpsertUser(u);
      }
    }

    console.log('[SyncEngine] Hoàn tất đồng bộ dữ liệu PostgreSQL (Primary CSDL quan hệ) & MongoDB (Mirror NoSQL)!');
  } catch (err: any) {
    console.warn('[SyncEngine Warning] Quá trình kiểm tra đồng bộ gặp cảnh báo (hệ thống vẫn hoạt động):', err.message);
  }
}
