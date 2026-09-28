import mongoose from 'mongoose';
import { pgPool } from './postgres.js';
import { Topic, INITIAL_TOPICS } from '../models/Topic.js';
import { Room } from '../models/Room.js';
import { ArtifactModel } from '../models/Artifact.js';
import { FloorPlanMap } from '../models/FloorPlanMap.js';
import { Language } from '../models/Language.js';
import { SystemBranding } from '../models/SystemBranding.js';
import { User } from '../models/User.js';
import { Role } from '../models/Role.js';
import { cacheSet, cacheDel, cacheDelPattern } from '../services/redis.js';
import { broadcastRealtimeEvent } from '../services/realtimeSync.js';

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
    const mongoId = topic._id ? topic._id.toString() : (topic.mongoId || topic.mongo_id || null);
    if (!id) return;
    await pgPool.query(`
      INSERT INTO topics (id, name, description, order_index, active, mongo_id, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        order_index = EXCLUDED.order_index,
        active = EXCLUDED.active,
        mongo_id = COALESCE(EXCLUDED.mongo_id, topics.mongo_id),
        updated_at = CURRENT_TIMESTAMP;
    `, [id, topic.name || '', topic.description || '', topic.orderIndex ?? 1, topic.active ?? true, mongoId]);
  } catch (err: any) {
    console.warn(`[SyncEngine] Lỗi đồng bộ Topic sang PostgreSQL (${topic.id}):`, err.message);
  }
}

export async function pgDeleteTopic(id: string) {
  try {
    await pgPool.query('DELETE FROM topics WHERE id = $1 OR mongo_id = $1', [id]);
  } catch (err: any) {
    console.warn(`[SyncEngine] Lỗi xóa Topic trong PostgreSQL (${id}):`, err.message);
  }
}

export async function pgUpsertRoom(room: any) {
  try {
    const id = room.id || room._id?.toString();
    const mongoId = room._id ? room._id.toString() : (room.mongoId || room.mongo_id || null);
    if (!id) return;

    await pgPool.query(`
      INSERT INTO rooms (
        id, code, name, period, category, description, panorama_url, thumbnail_url,
        initial_view, order_index, active, ai_voice_enabled, ai_knowledge_prompt,
        ai_script, ai_voice_lang, qr_scan_count, scenes_count, translations, topic_id, mongo_id, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, CURRENT_TIMESTAMP)
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
        mongo_id = COALESCE(EXCLUDED.mongo_id, rooms.mongo_id),
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
      room.topicId || null,
      mongoId
    ]);

    // Đồng bộ danh sách Hotspots con (Quan hệ 1-N)
    await pgPool.query('DELETE FROM hotspots WHERE room_id = $1', [id]);
    if (Array.isArray(room.hotspots) && room.hotspots.length > 0) {
      for (const hs of room.hotspots) {
        if (!hs.id) continue;
        let validTargetRoomId: string | null = hs.targetRoomId || null;
        if (validTargetRoomId) {
          const targetExists = await pgPool.query('SELECT 1 FROM rooms WHERE id = $1 OR mongo_id = $1 OR code = $1', [validTargetRoomId]);
          if (targetExists.rows.length === 0) {
            validTargetRoomId = null;
          }
        }
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
          validTargetRoomId,
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

export async function pgDeleteRoom(id: string, code?: string, mongoId?: string) {
  try {
    const identifiers = [id, code, mongoId].filter(Boolean) as string[];
    if (identifiers.length === 0) return;

    // 1. Gỡ bỏ liên kết phòng khỏi các hiện vật an toàn (không xóa hiện vật)
    await pgPool.query(`
      UPDATE artifacts SET room_id = NULL, room_code = NULL
      WHERE room_id = ANY($1::text[]) 
         OR room_code = ANY($1::text[])
         OR room_id IN (SELECT id FROM rooms WHERE id = ANY($1::text[]) OR code = ANY($1::text[]) OR mongo_id = ANY($1::text[]));
    `, [identifiers]);

    // 2. Dọn dẹp điểm hotspots trỏ tới phòng này
    await pgPool.query(`
      DELETE FROM hotspots
      WHERE target_room_id = ANY($1::text[])
         OR target_room_id IN (SELECT id FROM rooms WHERE id = ANY($1::text[]) OR code = ANY($1::text[]) OR mongo_id = ANY($1::text[]));
    `, [identifiers]);

    // 3. Xóa các hotspots thuộc chính phòng này
    await pgPool.query(`
      DELETE FROM hotspots
      WHERE room_id = ANY($1::text[])
         OR room_id IN (SELECT id FROM rooms WHERE id = ANY($1::text[]) OR code = ANY($1::text[]) OR mongo_id = ANY($1::text[]));
    `, [identifiers]);

    // 4. Xóa phòng theo ID, code hoặc mongo_id
    const deleteRes = await pgPool.query(
      'DELETE FROM rooms WHERE id = ANY($1::text[]) OR code = ANY($1::text[]) OR mongo_id = ANY($1::text[]);',
      [identifiers]
    );
    console.log(`[SyncEngine] Đã xóa ${deleteRes.rowCount} phòng trong PostgreSQL (${identifiers.join(', ')})`);
  } catch (err: any) {
    console.warn(`[SyncEngine] Lỗi xóa Room trong PostgreSQL (${id}):`, err.message);
  }
}

export async function pgUpsertArtifact(artifact: any) {
  try {
    const id = artifact.id || artifact._id?.toString();
    const mongoId = artifact._id ? artifact._id.toString() : (artifact.mongoId || artifact.mongo_id || null);
    if (!id || !artifact.code) return;

    let validRoomId: string | null = artifact.roomId || null;
    if (validRoomId) {
      const roomCheck = await pgPool.query('SELECT id FROM rooms WHERE id = $1 OR mongo_id = $1 OR code = $1 LIMIT 1', [validRoomId]);
      if (roomCheck.rows.length > 0) {
        validRoomId = roomCheck.rows[0].id;
      } else {
        validRoomId = null;
      }
    }

    let validTopicId: string | null = artifact.topicId || null;
    if (validTopicId) {
      const topicCheck = await pgPool.query('SELECT id FROM topics WHERE id = $1 OR mongo_id = $1 LIMIT 1', [validTopicId]);
      if (topicCheck.rows.length > 0) {
        validTopicId = topicCheck.rows[0].id;
      } else {
        validTopicId = null;
      }
    }

    await pgPool.query(`
      INSERT INTO artifacts (
        id, code, name, room_id, room_code, topic_id, category, period, origin,
        description, dimensions, images, thumbnail_url, model_3d_url,
        audio_narration_url, voice_language, qr_code_url, status,
        processing_status, processing_error, model_metadata, translations,
        order_index, mongo_id, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, CURRENT_TIMESTAMP)
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
        mongo_id = COALESCE(EXCLUDED.mongo_id, artifacts.mongo_id),
        updated_at = CURRENT_TIMESTAMP;
    `, [
      id,
      artifact.code,
      artifact.name || '',
      validRoomId,
      artifact.roomCode || '',
      validTopicId,
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
      artifact.orderIndex ?? 0,
      mongoId
    ]);
  } catch (err: any) {
    console.warn(`[SyncEngine] Lỗi đồng bộ Artifact sang PostgreSQL (${artifact.code}):`, err.message);
  }
}

export async function pgDeleteArtifact(id: string) {
  try {
    await pgPool.query('DELETE FROM artifacts WHERE id = $1 OR mongo_id = $1 OR code = $1', [id]);
  } catch (err: any) {
    console.warn(`[SyncEngine] Lỗi xóa Artifact trong PostgreSQL (${id}):`, err.message);
  }
}

export async function pgUpsertFloorPlan(fp: any) {
  try {
    const id = fp.id || fp._id?.toString();
    const mongoId = fp._id ? fp._id.toString() : (fp.mongoId || fp.mongo_id || null);
    if (!id) return;

    await pgPool.query(`
      INSERT INTO floor_plans (
        id, title, description, image_url, image_width, image_height,
        analyzed_at, analysis_algorithm, compass_orientation, active, mongo_id, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
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
        mongo_id = COALESCE(EXCLUDED.mongo_id, floor_plans.mongo_id),
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
      fp.active ?? true,
      mongoId
    ]);

    // Đồng bộ Nodes
    await pgPool.query('DELETE FROM floor_plan_nodes WHERE floor_plan_id = $1', [id]);
    if (Array.isArray(fp.nodes) && fp.nodes.length > 0) {
      for (const n of fp.nodes) {
        if (!n.id) continue;
        let validRoomId: string | null = n.roomId || null;
        if (validRoomId) {
          const rCheck = await pgPool.query('SELECT id FROM rooms WHERE id = $1 OR mongo_id = $1 OR code = $1 LIMIT 1', [validRoomId]);
          if (rCheck.rows.length > 0) {
            validRoomId = rCheck.rows[0].id;
          } else {
            validRoomId = null;
          }
        }
        const nodeMongoId = n._id ? n._id.toString() : (n.mongoId || null);
        await pgPool.query(`
          INSERT INTO floor_plan_nodes (
            id, floor_plan_id, room_id, code, name, period, category,
            x, y, width, height, is_entrance, color_tag, panorama_url, thumbnail_url, mongo_id
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
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
            thumbnail_url = EXCLUDED.thumbnail_url,
            mongo_id = COALESCE(EXCLUDED.mongo_id, floor_plan_nodes.mongo_id);
        `, [
          n.id,
          id,
          validRoomId,
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
          n.thumbnailUrl || '',
          nodeMongoId
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
    await pgPool.query('DELETE FROM floor_plans WHERE id = $1 OR mongo_id = $1', [id]);
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
    const mongoId = branding._id ? branding._id.toString() : (branding.mongoId || branding.mongo_id || null);
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
        data, mongo_id, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, CURRENT_TIMESTAMP)
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
        mongo_id = COALESCE(EXCLUDED.mongo_id, system_branding.mongo_id),
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
      JSON.stringify(branding.data || {}),
      mongoId
    ]);
  } catch (err: any) {
    console.warn('[SyncEngine] Lỗi đồng bộ Branding sang PostgreSQL:', err.message);
  }
}

export async function pgUpsertUser(user: any) {
  try {
    const id = user.id || user._id?.toString();
    const mongoId = user._id ? user._id.toString() : (user.mongoId || user.mongo_id || null);
    if (!id || !user.username) return;

    await pgPool.query(`
      INSERT INTO users (id, username, email, password_hash, full_name, role_id, is_active, mongo_id, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        email = EXCLUDED.email,
        password_hash = CASE WHEN EXCLUDED.password_hash != 'NO_PASSWORD_OTP_ONLY' THEN EXCLUDED.password_hash ELSE users.password_hash END,
        full_name = EXCLUDED.full_name,
        role_id = EXCLUDED.role_id,
        is_active = EXCLUDED.is_active,
        mongo_id = COALESCE(EXCLUDED.mongo_id, users.mongo_id),
        updated_at = CURRENT_TIMESTAMP;
    `, [
      id,
      user.username,
      user.email,
      user.password || 'NO_PASSWORD_OTP_ONLY',
      user.fullName || '',
      user.role === 'admin' ? 'role-superadmin' : (user.role === 'editor' ? 'role-editor' : 'role-viewer'),
      user.isActive ?? true,
      mongoId
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

    if (pgRoomCount === 0 && mongoRooms.length === 0) {
      console.log('[SyncEngine] CSDL phòng trưng bày đang trống (không tự động nạp mẫu để tôn trọng thao tác của quản trị viên; có thể nạp từ Admin hoặc API seed-heritage)...');
    } else if (pgRoomCount === 0 && mongoRooms.length > 0) {
      console.log(`[SyncEngine] Đang di chuyển ${mongoRooms.length} Rooms & Hotspots từ MongoDB sang PostgreSQL...`);
      for (const r of mongoRooms) {
        await pgUpsertRoom(r);
      }
    } else if (mongoRooms.length === 0 && pgRoomCount > 0) {
      console.log(`[SyncEngine] Đồng bộ dọn sạch các phòng còn sót lại trong PostgreSQL do MongoDB đang trống...`);
      await pgPool.query('DELETE FROM hotspots; DELETE FROM rooms;');
      await cacheDelPattern('rooms:*');
    } else if (mongoRooms.length > 0 && pgRoomCount > 0) {
      // Cả 2 đều có dữ liệu: dọn dẹp các phòng thừa trong PostgreSQL nếu đã bị xóa khỏi MongoDB từ trước
      const mongoRoomIds = new Set(mongoRooms.map(r => r.id));
      const pgAll = await pgPool.query('SELECT id, code, mongo_id FROM rooms;');
      for (const row of pgAll.rows) {
        if (!mongoRoomIds.has(row.id) && !mongoRoomIds.has(row.code) && (!row.mongo_id || !mongoRoomIds.has(row.mongo_id))) {
          console.log(`[SyncEngine] Dọn dẹp phòng thừa trong PostgreSQL do đã bị xóa từ trước: ${row.id} (${row.code})`);
          await pgDeleteRoom(row.id, row.code, row.mongo_id);
        }
      }
    }

    // 3. Đồng bộ Artifacts
    const pgArtifacts = await pgPool.query('SELECT COUNT(*) FROM artifacts;');
    const pgArtifactCount = parseInt(pgArtifacts.rows[0].count, 10);
    const mongoArtifacts = await ArtifactModel.find().lean();

    if (pgArtifactCount === 0 && mongoArtifacts.length === 0) {
      console.log('[SyncEngine] CSDL hiện vật đang trống (không tự ý chèn dữ liệu mẫu, chờ dữ liệu thật từ quản trị viên)...');
    } else if (pgArtifactCount === 0 && mongoArtifacts.length > 0) {
      console.log(`[SyncEngine] Đang di chuyển ${mongoArtifacts.length} Artifacts từ MongoDB sang PostgreSQL...`);
      for (const a of mongoArtifacts) {
        await pgUpsertArtifact(a);
      }
    } else if (mongoArtifacts.length === 0 && pgArtifactCount > 0) {
      console.log(`[SyncEngine] Đang nạp ngược ${pgArtifactCount} Artifacts từ PostgreSQL sang MongoDB...`);
      const pgAllArt = await pgPool.query('SELECT * FROM artifacts ORDER BY order_index ASC;');
      for (const row of pgAllArt.rows) {
        const artId = row.id || row.mongo_id;
        await ArtifactModel.updateOne({ $or: [{ id: artId }, { code: row.code }] }, {
          $set: {
            id: artId,
            code: row.code,
            name: row.name,
            roomId: row.room_id,
            roomCode: row.room_code,
            topicId: row.topic_id,
            category: row.category,
            period: row.period,
            origin: row.origin,
            description: row.description,
            dimensions: row.dimensions,
            images: typeof row.images === 'string' ? JSON.parse(row.images || '[]') : (row.images || []),
            thumbnailUrl: row.thumbnail_url,
            model3dUrl: row.model_3d_url,
            audioNarrationUrl: row.audio_narration_url,
            voiceLanguage: row.voice_language,
            qrCodeUrl: row.qr_code_url,
            status: row.status,
            processingStatus: row.processing_status,
            processingError: row.processing_error,
            modelMetadata: typeof row.model_metadata === 'string' ? JSON.parse(row.model_metadata || '{}') : (row.model_metadata || {}),
            translations: typeof row.translations === 'string' ? JSON.parse(row.translations || '{}') : (row.translations || {}),
            orderIndex: row.order_index ?? 0
          }
        }, { upsert: true });
      }
    } else {
      // Cả 2 đều có dữ liệu: Thực hiện đồng bộ 2 chiều để bảo đảm không hiện vật nào bị mất đồng bộ
      console.log(`[SyncEngine] Đồng bộ hai chiều giữa PostgreSQL (${pgArtifactCount}) và MongoDB (${mongoArtifacts.length}) cho toàn bộ hiện vật...`);
      for (const a of mongoArtifacts) {
        await pgUpsertArtifact(a);
      }
      const pgAllArt = await pgPool.query('SELECT * FROM artifacts ORDER BY order_index ASC;');
      for (const row of pgAllArt.rows) {
        const artId = row.id || row.mongo_id;
        await ArtifactModel.updateOne({ $or: [{ id: artId }, { code: row.code }] }, {
          $set: {
            id: artId,
            code: row.code,
            name: row.name,
            roomId: row.room_id,
            roomCode: row.room_code,
            topicId: row.topic_id,
            category: row.category,
            period: row.period,
            origin: row.origin,
            description: row.description,
            dimensions: row.dimensions,
            images: typeof row.images === 'string' ? JSON.parse(row.images || '[]') : (row.images || []),
            thumbnailUrl: row.thumbnail_url,
            model3dUrl: row.model_3d_url,
            audioNarrationUrl: row.audio_narration_url,
            voiceLanguage: row.voice_language,
            qrCodeUrl: row.qr_code_url,
            status: row.status,
            processingStatus: row.processing_status,
            processingError: row.processing_error,
            modelMetadata: typeof row.model_metadata === 'string' ? JSON.parse(row.model_metadata || '{}') : (row.model_metadata || {}),
            translations: typeof row.translations === 'string' ? JSON.parse(row.translations || '{}') : (row.translations || {}),
            orderIndex: row.order_index ?? 0
          }
        }, { upsert: true });
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

    // Tuyệt đối không tự động gán phòng giả vào sơ đồ. Chỉ lưu trữ các liên kết do quản trị viên thiết lập.

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

    // 7. Đồng bộ 2 chiều các khoá chéo (Cross-database Key Linking: mongo_id <-> id)
    // Đảm bảo mọi bản ghi ở PostgreSQL có mongo_id và mọi document ở MongoDB có id
    try {
      // Rooms
      const allMongoRooms = await Room.find().lean();
      for (const mr of allMongoRooms) {
        const mId = mr._id ? mr._id.toString() : null;
        if (mId && (mr.id || mr.code)) {
          await pgPool.query(
            `UPDATE rooms SET mongo_id = $1 WHERE (id = $2 OR code = $3) AND (mongo_id IS NULL OR mongo_id != $1)`,
            [mId, mr.id || '', mr.code || '']
          );
        }
      }
      const pgRoomsWithMongoId = await pgPool.query(`SELECT id, code, mongo_id FROM rooms WHERE mongo_id IS NOT NULL;`);
      for (const row of pgRoomsWithMongoId.rows) {
        if (row.mongo_id && row.id) {
          await Room.updateOne(
            { _id: row.mongo_id, id: { $exists: false } },
            { $set: { id: row.id } }
          );
        }
      }

      // Artifacts
      const allMongoArt = await ArtifactModel.find().lean();
      for (const ma of allMongoArt) {
        const mId = ma._id ? ma._id.toString() : null;
        if (mId && (ma.id || ma.code)) {
          await pgPool.query(
            `UPDATE artifacts SET mongo_id = $1 WHERE (id = $2 OR code = $3) AND (mongo_id IS NULL OR mongo_id != $1)`,
            [mId, ma.id || '', ma.code || '']
          );
        }
      }
      const pgArtWithMongoId = await pgPool.query(`SELECT id, code, mongo_id FROM artifacts WHERE mongo_id IS NOT NULL;`);
      for (const row of pgArtWithMongoId.rows) {
        if (row.mongo_id && row.id) {
          await ArtifactModel.updateOne(
            { _id: row.mongo_id, id: { $exists: false } },
            { $set: { id: row.id } }
          );
        }
      }

      // Topics
      const allMongoTopics = await Topic.find().lean();
      for (const mt of allMongoTopics) {
        const mId = mt._id ? mt._id.toString() : null;
        if (mId && (mt.id || (mt as any).code)) {
          await pgPool.query(
            `UPDATE topics SET mongo_id = $1 WHERE (id = $2 OR code = $3) AND (mongo_id IS NULL OR mongo_id != $1)`,
            [mId, mt.id || '', (mt as any).code || '']
          );
        }
      }

      // Floor plans
      const allMongoFp = await FloorPlanMap.find().lean();
      for (const mfp of allMongoFp) {
        const mId = mfp._id ? mfp._id.toString() : null;
        if (mId && mfp.id) {
          await pgPool.query(
            `UPDATE floor_plans SET mongo_id = $1 WHERE id = $2 AND (mongo_id IS NULL OR mongo_id != $1)`,
            [mId, mfp.id]
          );
        }
      }

      // Branding
      const mongoBrandingDoc = await SystemBranding.findOne().lean();
      if (mongoBrandingDoc && mongoBrandingDoc._id) {
        await pgPool.query(
          `UPDATE system_branding SET mongo_id = $1 WHERE id = 'default_branding' AND (mongo_id IS NULL OR mongo_id != $1)`,
          [mongoBrandingDoc._id.toString()]
        );
      }
    } catch (crossKeyErr: any) {
      console.warn('[SyncEngine Warning] Cảnh báo liên kết khoá chéo mongo_id:', crossKeyErr.message);
    }

    console.log('[SyncEngine] Hoàn tất đồng bộ dữ liệu PostgreSQL (Primary CSDL quan hệ) & MongoDB (Mirror NoSQL)!');
  } catch (err: any) {
    console.warn('[SyncEngine Warning] Quá trình kiểm tra đồng bộ gặp cảnh báo (hệ thống vẫn hoạt động):', err.message);
  }
}

// ==========================================
// 4. DỮ LIỆU SEED 18 PHÒNG VÀ HIỆN VẬT DI SẢN THẬT 100%
// ==========================================

export const HERITAGE_18_ROOMS_SEED = [
  {
    id: 'room-p-01',
    code: 'P-01',
    name: 'Thời Nguyên thủy',
    period: 'Thời kỳ tiền sử & sơ sử',
    category: 'Tiền sử Việt Nam',
    description: 'Gian trưng bày các dấu tích sơ kỳ đá cũ, văn hóa Hòa Bình, Bắc Sơn, công cụ đá ghè đẽo và dấu tích người vượn cổ tại Việt Nam.',
    panoramaUrl: 'https://res.cloudinary.com/djkif9ubs/image/upload/v1790468240/museum/branding_assets/pano_1790468235321_Acnos-bao-tang-lich-su-03_kvfot5.jpg',
    thumbnailUrl: 'https://res.cloudinary.com/djkif9ubs/image/upload/v1790468240/museum/branding_assets/pano_1790468235321_Acnos-bao-tang-lich-su-03_kvfot5.jpg',
    initialView: { pitch: 0, yaw: 0, fov: 90 },
    orderIndex: 1,
    topicId: 'tien-trinh-lich-su-vn',
    active: true,
    aiVoiceEnabled: true,
    aiVoiceLang: 'vi-south',
    aiScript: 'Chào mừng quý khách đến với Phòng 1: Thời kỳ Nguyên thủy. Nơi lưu giữ những hiện vật đá ghè đẽo hàng vạn năm tuổi của tổ tiên người Việt cổ.',
    hotspots: [
      { id: 'hs-p01-to-p02', type: 'navigation', title: 'Sang Phòng P-02: Thời dựng nước và giữ nước', description: 'Lối sang gian trưng bày Văn hóa Đông Sơn', targetRoomId: 'room-p-02', pitch: -5, yaw: 90 },
      { id: 'hs-p01-to-p17', type: 'navigation', title: 'Sang Phòng P-17: Dân tộc phía Nam Việt Nam', description: 'Lối sang cánh phải', targetRoomId: 'room-p-17', pitch: -5, yaw: -90 }
    ]
  },
  {
    id: 'room-p-02',
    code: 'P-02',
    name: 'Thời dựng nước và giữ nước',
    period: 'Thời đại Hùng Vương - An Dương Vương',
    category: 'Khởi nguyên dân tộc',
    description: 'Trưng bày nền văn minh nông nghiệp lúa nước rực rỡ, văn hóa Đông Sơn, thạp đồng, giáo mác và Trống đồng Bảo vật Quốc gia.',
    panoramaUrl: '/uploads/stitched_360_1789646150876.jpg',
    thumbnailUrl: '/uploads/drum_isolated.png',
    initialView: { pitch: 0, yaw: 45, fov: 90 },
    orderIndex: 2,
    topicId: 'tien-trinh-lich-su-vn',
    active: true,
    aiVoiceEnabled: true,
    aiVoiceLang: 'vi-south',
    aiScript: 'Quý khách đang chiêm ngưỡng không gian Thời dựng nước và giữ nước với tâm điểm là Trống đồng Đông Sơn - đỉnh cao nghệ thuật đúc đồng cổ xưa.',
    hotspots: [
      { id: 'hs-p02-to-p01', type: 'navigation', title: 'Về Phòng P-01: Thời Nguyên thủy', description: 'Lối về phòng trước', targetRoomId: 'room-p-01', pitch: -5, yaw: -90 },
      { id: 'hs-p02-to-p03', type: 'navigation', title: 'Sang Phòng P-03: Thời Ngô - Đinh - Tiền Lê', description: 'Lối sang giai đoạn độc lập tự chủ', targetRoomId: 'room-p-03', pitch: -5, yaw: 0 },
      { id: 'hs-p02-art-drum', type: 'artifact', title: 'Trống đồng Đông Sơn', description: 'Bảo vật Quốc gia mô phỏng 3D tương tác 360°', artifactId: 'art-trong-dong-dong-son', pitch: -10, yaw: 45 }
    ]
  },
  {
    id: 'room-p-03',
    code: 'P-03',
    name: 'Thời Ngô - Đinh - Tiền Lê',
    period: 'Thế kỷ X - Độc lập tự chủ',
    category: 'Độc lập tự chủ',
    description: 'Kỷ nguyên phục hưng nền độc lập dân tộc sau hơn một nghìn năm Bắc thuộc, chiến thắng Bạch Đằng năm 938 của Ngô Quyền và kinh đô Hoa Lư.',
    panoramaUrl: '/uploads/stitched_360_1789651346352.jpg',
    thumbnailUrl: '/uploads/stitched_360_1789651346352.jpg',
    initialView: { pitch: 0, yaw: 0, fov: 90 },
    orderIndex: 3,
    topicId: 'tien-trinh-lich-su-vn',
    active: true,
    aiVoiceEnabled: true,
    aiVoiceLang: 'vi-south',
    hotspots: [
      { id: 'hs-p03-to-p02', type: 'navigation', title: 'Về Phòng P-02: Thời dựng nước', description: 'Lối về phòng trước', targetRoomId: 'room-p-02', pitch: -5, yaw: 180 },
      { id: 'hs-p03-to-p04', type: 'navigation', title: 'Sang Phòng P-04: Thời Lý', description: 'Lối sang vương triều Lý', targetRoomId: 'room-p-04', pitch: -5, yaw: 0 }
    ]
  },
  {
    id: 'room-p-04',
    code: 'P-04',
    name: 'Thời Lý',
    period: 'Thế kỷ XI - XIII: Văn minh Đại Việt',
    category: 'Vương triều Lý',
    description: 'Thời kỳ định đô Thăng Long (1010), đỉnh cao mỹ thuật Phật giáo thời Lý với tượng rồng uốn khúc hình sin, lá đề và gốm men ngọc hoàng cung.',
    panoramaUrl: 'https://res.cloudinary.com/djkif9ubs/image/upload/v1790468364/museum/branding_assets/pano_1790468360285_Acnos-bao-tang-lich-su-03_hbc4hq.jpg',
    thumbnailUrl: 'https://res.cloudinary.com/djkif9ubs/image/upload/v1790468364/museum/branding_assets/pano_1790468360285_Acnos-bao-tang-lich-su-03_hbc4hq.jpg',
    initialView: { pitch: 0, yaw: 0, fov: 90 },
    orderIndex: 4,
    topicId: 'tien-trinh-lich-su-vn',
    active: true,
    aiVoiceEnabled: true,
    aiVoiceLang: 'vi-south',
    hotspots: [
      { id: 'hs-p04-to-p03', type: 'navigation', title: 'Về Phòng P-03: Ngô - Đinh - Tiền Lê', description: 'Lối về phòng trước', targetRoomId: 'room-p-03', pitch: -5, yaw: 180 },
      { id: 'hs-p04-to-p05', type: 'navigation', title: 'Sang Phòng P-05: Thời Trần - Hồ', description: 'Lối sang vương triều Trần', targetRoomId: 'room-p-05', pitch: -5, yaw: 90 }
    ]
  },
  {
    id: 'room-p-05',
    code: 'P-05',
    name: 'Thời Trần - Hồ',
    period: 'Thế kỷ XIII - XV: Ba lần đại thắng Nguyên Mông',
    category: 'Vương triều Trần - Hồ',
    description: 'Hào khí Đông A, vũ khí quân sự và cọc gỗ Bạch Đằng năm 1288, cùng dấu ấn thành lũy đá vương triều Hồ.',
    panoramaUrl: '/uploads/stitched_360_1789651467746.jpg',
    thumbnailUrl: '/uploads/stitched_360_1789651467746.jpg',
    initialView: { pitch: 0, yaw: 0, fov: 90 },
    orderIndex: 5,
    topicId: 'tien-trinh-lich-su-vn',
    active: true,
    aiVoiceEnabled: true,
    aiVoiceLang: 'vi-south',
    hotspots: [
      { id: 'hs-p05-to-p04', type: 'navigation', title: 'Về Phòng P-04: Thời Lý', description: 'Lối về phòng trước', targetRoomId: 'room-p-04', pitch: -5, yaw: -90 },
      { id: 'hs-p05-to-p06', type: 'navigation', title: 'Sang Phòng P-06: Văn hóa Champa', description: 'Lối sang cánh nghệ thuật Chămpa', targetRoomId: 'room-p-06', pitch: -5, yaw: 0 },
      { id: 'hs-p05-to-p18', type: 'navigation', title: 'Sang Phòng P-18: Tượng Phật giáo Châu Á', description: 'Lối sang sảnh Phật giáo', targetRoomId: 'room-p-18', pitch: -5, yaw: 90 }
    ]
  },
  {
    id: 'room-p-06',
    code: 'P-06',
    name: 'Văn hóa Champa',
    period: 'Thế kỷ II - XVII: Di sản văn hóa Chămpa',
    category: 'Di sản miền Trung',
    description: 'Bộ sưu tập điêu khắc đá sa thạch Champa phong phú bậc nhất phương Nam, với tượng Nữ thần Saraswati, thần Shiva, Garuda và phù điêu vũ nữ Trà Kiệu.',
    panoramaUrl: 'https://res.cloudinary.com/djkif9ubs/image/upload/v1790468364/museum/branding_assets/pano_1790468360285_Acnos-bao-tang-lich-su-03_hbc4hq.jpg',
    thumbnailUrl: 'https://res.cloudinary.com/djkif9ubs/image/upload/v1790468364/museum/branding_assets/pano_1790468360285_Acnos-bao-tang-lich-su-03_hbc4hq.jpg',
    initialView: { pitch: 0, yaw: 30, fov: 90 },
    orderIndex: 6,
    topicId: 'van-hoa-nam-bo-co-vat',
    active: true,
    aiVoiceEnabled: true,
    aiVoiceLang: 'vi-south',
    hotspots: [
      { id: 'hs-p06-to-p05', type: 'navigation', title: 'Về Phòng P-05: Thời Trần - Hồ', description: 'Lối về phòng trước', targetRoomId: 'room-p-05', pitch: -5, yaw: 180 },
      { id: 'hs-p06-to-p07', type: 'navigation', title: 'Sang Phòng P-07: Văn hóa Óc Eo', description: 'Lối sang nền văn minh cổ Phù Nam', targetRoomId: 'room-p-07', pitch: -5, yaw: 0 },
      { id: 'hs-p06-art-saraswati', type: 'artifact', title: 'Tượng Nữ thần Saraswati', description: 'Bảo vật Quốc gia điêu khắc sa thạch Tháp Mẫm', artifactId: 'art-tuong-nu-than-saraswati', pitch: -8, yaw: 30 }
    ]
  },
  {
    id: 'room-p-07',
    code: 'P-07',
    name: 'Văn hóa Óc Eo',
    period: 'Thế kỷ I - VII: Vương quốc Phù Nam cổ',
    category: 'Văn minh Phù Nam',
    description: 'Gian trưng bày đồ sộ nền văn minh cảng thị Óc Eo cổ đại, tượng Phật bằng gỗ sao cổ hàng nghìn năm tuổi, đồ trang sức vàng và khuôn đúc thủy tinh.',
    panoramaUrl: 'https://res.cloudinary.com/djkif9ubs/image/upload/v1790468240/museum/branding_assets/pano_1790468235321_Acnos-bao-tang-lich-su-03_kvfot5.jpg',
    thumbnailUrl: 'https://res.cloudinary.com/djkif9ubs/image/upload/v1790468240/museum/branding_assets/pano_1790468235321_Acnos-bao-tang-lich-su-03_kvfot5.jpg',
    initialView: { pitch: 0, yaw: -30, fov: 90 },
    orderIndex: 7,
    topicId: 'van-hoa-nam-bo-co-vat',
    active: true,
    aiVoiceEnabled: true,
    aiVoiceLang: 'vi-south',
    hotspots: [
      { id: 'hs-p07-to-p06', type: 'navigation', title: 'Về Phòng P-06: Văn hóa Champa', description: 'Lối về phòng trước', targetRoomId: 'room-p-06', pitch: -5, yaw: 180 },
      { id: 'hs-p07-to-p08', type: 'navigation', title: 'Sang Phòng P-08: Điêu khắc đá Campuchia', description: 'Lối sang phòng kế tiếp', targetRoomId: 'room-p-08', pitch: -5, yaw: 90 },
      { id: 'hs-p07-art-buddha', type: 'artifact', title: 'Tượng Phật Sa Đéc', description: 'Bảo vật Quốc gia bằng gỗ sao thế kỷ IV', artifactId: 'art-tuong-phat-sa-dec', pitch: -6, yaw: -30 }
    ]
  },
  {
    id: 'room-p-08',
    code: 'P-08',
    name: 'Điêu khắc đá Campuchia',
    period: 'Thế kỷ IX - XIII: Nghệ thuật điêu khắc Khmer cổ',
    category: 'Nghệ thuật Châu Á',
    description: 'Bộ sưu tập tượng thần Hindu và Phật giáo phong cách Angkor Wat, Banteay Srei và Bayon bằng đá sa thạch độc đáo.',
    panoramaUrl: '/uploads/stitched_360_1789658000391.jpg',
    thumbnailUrl: '/uploads/stitched_360_1789658000391.jpg',
    initialView: { pitch: 0, yaw: 0, fov: 90 },
    orderIndex: 8,
    topicId: 'van-hoa-nam-bo-co-vat',
    active: true,
    aiVoiceEnabled: true,
    aiVoiceLang: 'vi-south',
    hotspots: [
      { id: 'hs-p08-to-p07', type: 'navigation', title: 'Về Phòng P-07: Văn hóa Óc Eo', description: 'Lối về phòng trước', targetRoomId: 'room-p-07', pitch: -5, yaw: -90 },
      { id: 'hs-p08-to-p09', type: 'navigation', title: 'Sang Phòng P-09: Thời Lê - Mạc, Trịnh - Nguyễn', description: 'Lối sang giai đoạn phân tranh', targetRoomId: 'room-p-09', pitch: -5, yaw: 180 }
    ]
  },
  {
    id: 'room-p-09',
    code: 'P-09',
    name: 'Thời Lê - Mạc, Trịnh - Nguyễn',
    period: 'Thế kỷ XV - XVIII: Thời kỳ Hậu Lê và phân tranh',
    category: 'Thời kỳ Hậu Lê',
    description: 'Di sản thời Hậu Lê rực rỡ, thời kỳ Nam - Bắc triều, chiến tranh Trịnh - Nguyễn và sự nghiệp mở cõi phương Nam của các chúa Nguyễn.',
    panoramaUrl: '/uploads/stitched_360_1789651467746.jpg',
    thumbnailUrl: '/uploads/stitched_360_1789651467746.jpg',
    initialView: { pitch: 0, yaw: 0, fov: 90 },
    orderIndex: 9,
    topicId: 'tien-trinh-lich-su-vn',
    active: true,
    aiVoiceEnabled: true,
    aiVoiceLang: 'vi-south',
    hotspots: [
      { id: 'hs-p09-to-p08', type: 'navigation', title: 'Về Phòng P-08: Điêu khắc Campuchia', description: 'Lối về phòng trước', targetRoomId: 'room-p-08', pitch: -5, yaw: 0 },
      { id: 'hs-p09-to-p10', type: 'navigation', title: 'Sang Phòng P-10: Thời Tây Sơn', description: 'Lối sang vương triều Tây Sơn', targetRoomId: 'room-p-10', pitch: -5, yaw: 180 }
    ]
  },
  {
    id: 'room-p-10',
    code: 'P-10',
    name: 'Thời Tây Sơn',
    period: '1778 - 1802: Phong trào khởi nghĩa Tây Sơn',
    category: 'Triều đại Tây Sơn',
    description: 'Kỷ vật thời hoàng đế Quang Trung - Nguyễn Huệ, đại thắng quân Thanh năm 1789 tại Ngọc Hồi - Đống Đa, tiền đồng và sắc phong.',
    panoramaUrl: '/uploads/stitched_360_1789658000391.jpg',
    thumbnailUrl: '/uploads/stitched_360_1789658000391.jpg',
    initialView: { pitch: 0, yaw: 0, fov: 90 },
    orderIndex: 10,
    topicId: 'tien-trinh-lich-su-vn',
    active: true,
    aiVoiceEnabled: true,
    aiVoiceLang: 'vi-south',
    hotspots: [
      { id: 'hs-p10-to-p09', type: 'navigation', title: 'Về Phòng P-09: Thời Lê - Mạc', description: 'Lối về phòng trước', targetRoomId: 'room-p-09', pitch: -5, yaw: 0 },
      { id: 'hs-p10-to-p11', type: 'navigation', title: 'Sang Phòng P-11: Súng Thần công - Đại bác', description: 'Lối sang kho vũ khí thần công', targetRoomId: 'room-p-11', pitch: -5, yaw: 90 }
    ]
  },
  {
    id: 'room-p-11',
    code: 'P-11',
    name: 'Súng Thần công - Đại bác',
    period: 'Thế kỷ XVIII - XIX: Vũ khí quân sự cổ',
    category: 'Vũ khí di sản',
    description: 'Hệ thống súng Thần công đúc bằng đồng và gang thời chúa Nguyễn và triều Nguyễn, bảo vật phòng thủ bờ cõi và kinh thành Huế.',
    panoramaUrl: '/uploads/stitched_360_1789658000391.jpg',
    thumbnailUrl: '/uploads/stitched_360_1789658000391.jpg',
    initialView: { pitch: 0, yaw: -45, fov: 90 },
    orderIndex: 11,
    topicId: 'tien-trinh-lich-su-vn',
    active: true,
    aiVoiceEnabled: true,
    aiVoiceLang: 'vi-south',
    hotspots: [
      { id: 'hs-p11-to-p10', type: 'navigation', title: 'Về Phòng P-10: Thời Tây Sơn', description: 'Lối về phòng trước', targetRoomId: 'room-p-10', pitch: -5, yaw: -90 },
      { id: 'hs-p11-art-cannon', type: 'artifact', title: 'Súng Thần công Triều Nguyễn', description: 'Đại bác đúc bằng đồng cổ thế kỷ XIX', artifactId: 'art-sung-than-cong-nguyen', pitch: -10, yaw: -45 }
    ]
  },
  {
    id: 'room-p-12',
    code: 'P-12',
    name: 'Thời Nguyễn',
    period: '1802 - 1945: Triều đại phong kiến cuối cùng',
    category: 'Triều Nguyễn',
    description: 'Văn hóa cung đình Huế, long bào, mũ cánh chuồn, đồ pháp lam hoàng gia, ấn triện ngọc và sắc chỉ triều Nguyễn.',
    panoramaUrl: 'https://res.cloudinary.com/djkif9ubs/image/upload/v1790468364/museum/branding_assets/pano_1790468360285_Acnos-bao-tang-lich-su-03_hbc4hq.jpg',
    thumbnailUrl: 'https://res.cloudinary.com/djkif9ubs/image/upload/v1790468364/museum/branding_assets/pano_1790468360285_Acnos-bao-tang-lich-su-03_hbc4hq.jpg',
    initialView: { pitch: 0, yaw: 0, fov: 90 },
    orderIndex: 12,
    topicId: 'tien-trinh-lich-su-vn',
    active: true,
    aiVoiceEnabled: true,
    aiVoiceLang: 'vi-south',
    hotspots: [
      { id: 'hs-p12-to-p18', type: 'navigation', title: 'Sang Phòng P-18: Tượng Phật giáo', description: 'Lối sang sảnh Phật giáo', targetRoomId: 'room-p-18', pitch: -5, yaw: -90 },
      { id: 'hs-p12-to-p13', type: 'navigation', title: 'Sang Phòng P-13: Sưu tập Dương Hà', description: 'Lối sang cánh sưu tập đặc biệt', targetRoomId: 'room-p-13', pitch: -5, yaw: 90 }
    ]
  },
  {
    id: 'room-p-13',
    code: 'P-13',
    name: 'Sưu tập Dương Hà',
    period: 'Cổ vật quý hiếm do gia đình Dương Hà hiến tặng',
    category: 'Sưu tập tư nhân',
    description: 'Hàng trăm hiện vật ngà voi, ngọc quý, đồ sứ ký kiểu và mỹ nghệ tinh xảo do cụ Dương Bá Trạc và gia đình sưu tập, hiến tặng cho quốc gia.',
    panoramaUrl: '/uploads/stitched_360_1789651467746.jpg',
    thumbnailUrl: '/uploads/stitched_360_1789651467746.jpg',
    initialView: { pitch: 0, yaw: 0, fov: 90 },
    orderIndex: 13,
    topicId: 'suu-tap-dac-biet',
    active: true,
    aiVoiceEnabled: true,
    aiVoiceLang: 'vi-south',
    hotspots: [
      { id: 'hs-p13-to-p12', type: 'navigation', title: 'Về Phòng P-12: Thời Nguyễn', description: 'Lối về phòng trước', targetRoomId: 'room-p-12', pitch: -5, yaw: -90 },
      { id: 'hs-p13-to-p14', type: 'navigation', title: 'Sang Phòng P-14: Thương mại hàng hải', description: 'Lối sang gốm sứ tàu đắm', targetRoomId: 'room-p-14', pitch: -5, yaw: 180 }
    ]
  },
  {
    id: 'room-p-14',
    code: 'P-14',
    name: 'Thương mại hàng hải - Gốm sứ',
    period: 'Thế kỷ XIV - XVIII: Gốm sứ tàu đắm biển Đông',
    category: 'Hàng hải cổ vật',
    description: 'Gốm hoa lam Chu Đậu, đồ gốm men xanh trắng, gốm thời Minh - Thanh được trục vớt từ các con tàu đắm giao thương quốc tế trên biển Đông.',
    panoramaUrl: '/uploads/stitched_360_1789651467746.jpg',
    thumbnailUrl: '/uploads/stitched_360_1789651467746.jpg',
    initialView: { pitch: 0, yaw: 60, fov: 90 },
    orderIndex: 14,
    topicId: 'suu-tap-dac-biet',
    active: true,
    aiVoiceEnabled: true,
    aiVoiceLang: 'vi-south',
    hotspots: [
      { id: 'hs-p14-to-p13', type: 'navigation', title: 'Về Phòng P-13: Sưu tập Dương Hà', description: 'Lối về phòng trước', targetRoomId: 'room-p-13', pitch: -5, yaw: 0 },
      { id: 'hs-p14-to-p15', type: 'navigation', title: 'Sang Phòng P-15: Cổ vật tàu đắm biển Đông', description: 'Lối sang phòng chuyên đề tàu đắm', targetRoomId: 'room-p-15', pitch: -5, yaw: 90 },
      { id: 'hs-p14-to-p16', type: 'navigation', title: 'Sang Phòng P-16: Sưu tập Vương Hồng Sển', description: 'Lối sang gian đồ cổ học giả Vương Hồng Sển', targetRoomId: 'room-p-16', pitch: -5, yaw: 180 },
      { id: 'hs-p14-art-chudau', type: 'artifact', title: 'Đĩa gốm hoa lam Chu Đậu', description: 'Cổ vật khảo cổ tàu đắm Cù Lao Chàm thế kỷ XV', artifactId: 'art-dia-gom-chu-dau', pitch: -10, yaw: 60 }
    ]
  },
  {
    id: 'room-p-15',
    code: 'P-15',
    name: 'Cổ vật tàu đắm biển Đông',
    period: 'Di vật từ những con tàu đắm ngoài khơi',
    category: 'Hàng hải cổ vật',
    description: 'Những vết tích hà bám, tiền cổ, hồ tiêu hóa thạch và cổ vật trục vớt từ tàu đắm Bình Châu, Hòn Cau, Cù Lao Chàm.',
    panoramaUrl: '/uploads/stitched_360_1789651346352.jpg',
    thumbnailUrl: '/uploads/stitched_360_1789651346352.jpg',
    initialView: { pitch: 0, yaw: 0, fov: 90 },
    orderIndex: 15,
    topicId: 'suu-tap-dac-biet',
    active: true,
    aiVoiceEnabled: true,
    aiVoiceLang: 'vi-south',
    hotspots: [
      { id: 'hs-p15-to-p14', type: 'navigation', title: 'Về Phòng P-14: Thương mại hàng hải', description: 'Lối về phòng trước', targetRoomId: 'room-p-14', pitch: -5, yaw: -90 }
    ]
  },
  {
    id: 'room-p-16',
    code: 'P-16',
    name: 'Sưu tập Vương Hồng Sển',
    period: 'Đồ cổ, gốm sứ độc bản học giả Vương Hồng Sển',
    category: 'Sưu tập tư nhân',
    description: 'Kho báu cổ ngoạn vô giá gồm đồ gốm sứ Việt Nam, Trung Hoa, Nhật Bản và các bình vôi độc bản của nhà nghiên cứu văn hóa Nam Bộ Vương Hồng Sển.',
    panoramaUrl: '/uploads/stitched_360_1789651346352.jpg',
    thumbnailUrl: '/uploads/stitched_360_1789651346352.jpg',
    initialView: { pitch: 0, yaw: 45, fov: 90 },
    orderIndex: 16,
    topicId: 'suu-tap-dac-biet',
    active: true,
    aiVoiceEnabled: true,
    aiVoiceLang: 'vi-south',
    hotspots: [
      { id: 'hs-p16-to-p14', type: 'navigation', title: 'Về Phòng P-14: Thương mại hàng hải', description: 'Lối về phòng trước', targetRoomId: 'room-p-14', pitch: -5, yaw: 0 },
      { id: 'hs-p16-to-p17', type: 'navigation', title: 'Sang Phòng P-17: Dân tộc phía Nam', description: 'Lối sang gian dân tộc học', targetRoomId: 'room-p-17', pitch: -5, yaw: -90 },
      { id: 'hs-p16-art-binhvoi', type: 'artifact', title: 'Bình vôi gốm men độc bản', description: 'Cổ vật đặc trưng văn hóa ăn trầu Việt Nam', artifactId: 'art-binh-voi-gom-vuong-hong-sen', pitch: -8, yaw: 45 }
    ]
  },
  {
    id: 'room-p-17',
    code: 'P-17',
    name: 'Dân tộc phía Nam Việt Nam',
    period: 'Bản sắc văn hóa các dân tộc phương Nam',
    category: 'Dân tộc học',
    description: 'Trang phục truyền thống, cồng chiêng Tây Nguyên, đồ dùng sinh hoạt và nhạc cụ cổ của các dân tộc Kinh, Hoa, Chăm, Khmer sinh sống tại phương Nam.',
    panoramaUrl: 'https://res.cloudinary.com/djkif9ubs/image/upload/v1790468240/museum/branding_assets/pano_1790468235321_Acnos-bao-tang-lich-su-03_kvfot5.jpg',
    thumbnailUrl: 'https://res.cloudinary.com/djkif9ubs/image/upload/v1790468240/museum/branding_assets/pano_1790468235321_Acnos-bao-tang-lich-su-03_kvfot5.jpg',
    initialView: { pitch: 0, yaw: 0, fov: 90 },
    orderIndex: 17,
    topicId: 'van-hoa-nam-bo-co-vat',
    active: true,
    aiVoiceEnabled: true,
    aiVoiceLang: 'vi-south',
    hotspots: [
      { id: 'hs-p17-to-p16', type: 'navigation', title: 'Về Phòng P-16: Sưu tập Vương Hồng Sển', description: 'Lối về gian đồ cổ', targetRoomId: 'room-p-16', pitch: -5, yaw: 90 },
      { id: 'hs-p17-to-p01', type: 'navigation', title: 'Về Phòng P-01: Thời Nguyên thủy', description: 'Lối thông về sảnh chính ban đầu', targetRoomId: 'room-p-01', pitch: -5, yaw: -90 }
    ]
  },
  {
    id: 'room-p-18',
    code: 'P-18',
    name: 'Tượng Phật giáo Châu Á',
    period: 'Nghệ thuật Phật giáo các quốc gia Châu Á',
    category: 'Mỹ thuật tôn giáo',
    description: 'Tượng Phật Thích Ca, Bồ Tát Quán Thế Âm bằng gỗ, đồng, đá với các phong cách nghệ thuật Việt Nam, Thái Lan, Lào, Campuchia, Nhật Bản và Tây Tạng.',
    panoramaUrl: 'https://res.cloudinary.com/djkif9ubs/image/upload/v1790468364/museum/branding_assets/pano_1790468360285_Acnos-bao-tang-lich-su-03_hbc4hq.jpg',
    thumbnailUrl: 'https://res.cloudinary.com/djkif9ubs/image/upload/v1790468364/museum/branding_assets/pano_1790468360285_Acnos-bao-tang-lich-su-03_hbc4hq.jpg',
    initialView: { pitch: 0, yaw: 0, fov: 90 },
    orderIndex: 18,
    topicId: 'van-hoa-nam-bo-co-vat',
    active: true,
    aiVoiceEnabled: true,
    aiVoiceLang: 'vi-south',
    hotspots: [
      { id: 'hs-p18-to-p05', type: 'navigation', title: 'Sang Phòng P-05: Thời Trần - Hồ', description: 'Lối sang cánh vương triều Trần', targetRoomId: 'room-p-05', pitch: -5, yaw: -90 },
      { id: 'hs-p18-to-p12', type: 'navigation', title: 'Sang Phòng P-12: Thời Nguyễn', description: 'Lối sang cánh vương triều Nguyễn', targetRoomId: 'room-p-12', pitch: -5, yaw: 90 }
    ]
  }
];

export const HERITAGE_ARTIFACTS_SEED = [
  {
    id: 'art-trong-dong-dong-son',
    code: 'BTLS-001',
    name: 'Trống đồng Đông Sơn',
    roomId: 'room-p-02',
    roomCode: 'P-02',
    topicId: 'tien-trinh-lich-su-vn',
    category: 'Bảo vật Quốc gia',
    period: 'Thế kỷ VI - III TCN: Văn hóa Đông Sơn',
    origin: 'Bảo tàng Lịch sử TP. Hồ Chí Minh',
    description: 'Trống đồng Đông Sơn tiêu biểu cho nền văn minh nông nghiệp lúa nước và nghệ thuật đúc đồng đỉnh cao của người Việt cổ. Mặt trống khắc họa ngôi sao nhiều cánh cùng hình ảnh người giã gạo, chim lạc bay.',
    thumbnailUrl: '/uploads/drum_isolated.png',
    images: ['/uploads/drum_isolated.png', '/uploads/real3d_angled.png', '/uploads/real3d_front.png'],
    model3dUrl: '/uploads/drum_camera_projected.glb',
    voiceLanguage: 'vi',
    status: 'active',
    processingStatus: 'completed',
    orderIndex: 1,
    modelMetadata: {
      vertices: 12480,
      faces: 24960,
      sizeBytes: 2048152
    }
  }
];

export async function syncFloorPlanNodesToRooms(analyzedMap: any) {
  if (!analyzedMap || !Array.isArray(analyzedMap.nodes) || analyzedMap.nodes.length === 0) return analyzedMap;

  // 1. Chỉ liên kết với các phòng đang thực sự tồn tại trong CSDL, không tự động sinh phòng giả

  // 2. Chỉ đồng bộ thông tin phòng nếu vị trí node đã được quản trị viên chủ động gán roomId
  for (const node of analyzedMap.nodes) {
    if (!node.roomId) {
      node.roomId = null;
      node.panoramaUrl = '';
      node.thumbnailUrl = '';
      continue;
    }

    const room = await Room.findOne({
      $or: [
        { id: node.roomId },
        ...(mongoose.isValidObjectId(node.roomId) ? [{ _id: node.roomId }] : [])
      ]
    });

    if (room) {
      node.roomId = room.id;
      node.roomCode = room.code;
      node.roomName = room.name;
      node.panoramaUrl = room.panoramaUrl || '';
      node.thumbnailUrl = room.thumbnailUrl || room.panoramaUrl || '';
    } else {
      node.roomId = null;
      node.panoramaUrl = '';
      node.thumbnailUrl = '';
    }
  }

  // 3. Nếu sơ đồ có edges, tự động kết nối navigation hotspots giữa các phòng tương ứng
  if (Array.isArray(analyzedMap.edges) && analyzedMap.edges.length > 0) {
    for (const node of analyzedMap.nodes) {
      if (!node.roomId) continue;
      const targetEdges = analyzedMap.edges.filter((e: any) => e.source === node.id || e.target === node.id);
      const neighborRoomIds = targetEdges.map((e: any) => {
        const neighborNodeId = e.source === node.id ? e.target : e.source;
        const neighborNode = analyzedMap.nodes.find((n: any) => n.id === neighborNodeId);
        return neighborNode?.roomId;
      }).filter(Boolean);

      const currentRoom = await Room.findOne({ id: node.roomId });
      if (currentRoom) {
        let roomChanged = false;
        for (const neighborId of neighborRoomIds) {
          const alreadyLinked = currentRoom.hotspots?.some((h: any) => h.targetRoomId === neighborId);
          if (!alreadyLinked) {
            const neighborRoom = await Room.findOne({ id: neighborId });
            const newHs = {
              id: `hs-${currentRoom.code.toLowerCase()}-to-${neighborRoom?.code?.toLowerCase() || neighborId}`,
              type: 'navigation',
              title: `Sang ${neighborRoom?.name || 'gian phòng kế tiếp'}`,
              description: `Lối thông sang ${neighborRoom?.name || ''}`,
              targetRoomId: neighborId,
              pitch: -5,
              yaw: 0
            };
            if (!currentRoom.hotspots) currentRoom.hotspots = [];
            currentRoom.hotspots.push(newHs as any);
            roomChanged = true;
          }
        }
        if (roomChanged) {
          await currentRoom.save();
          await pgUpsertRoom(currentRoom.toObject());
        }
      }
    }
  }

  // 4. Lưu lại bản đồ đã map vào MongoDB và PostgreSQL
  if (analyzedMap.save) {
    await analyzedMap.save();
  } else if (analyzedMap.id) {
    await FloorPlanMap.updateOne({ id: analyzedMap.id }, { $set: { nodes: analyzedMap.nodes, edges: analyzedMap.edges } });
  }
  await pgUpsertFloorPlan(analyzedMap.toObject ? analyzedMap.toObject() : analyzedMap);

  // 5. Đồng bộ vào SystemBranding
  await SystemBranding.findOneAndUpdate(
    {},
    {
      $set: {
        roomsFeaturedId: 'room-p-01',
        roomsShowcaseImageUrl: 'https://res.cloudinary.com/djkif9ubs/image/upload/v1790468240/museum/branding_assets/pano_1790468235321_Acnos-bao-tang-lich-su-03_kvfot5.jpg',
        guideMapUrl: analyzedMap.imageUrl,
        guideMapTitle: analyzedMap.title,
        guideMapDesc: analyzedMap.description
      }
    },
    { upsert: true, new: true }
  );

  const updatedBranding = await SystemBranding.findOne().lean();
  if (updatedBranding) {
    await pgUpsertBranding(updatedBranding);
  }

  await cacheDel('rooms:all');
  await cacheDel('cache:branding:settings');
  broadcastRealtimeEvent('floor_plan_updated', analyzedMap.toObject ? analyzedMap.toObject() : analyzedMap);
  broadcastRealtimeEvent('rooms_updated', { action: 'batch_sync' });

  return analyzedMap;
}

export async function seedHeritageMuseumData() {
  console.log('[SyncEngine] Khởi tạo bộ dữ liệu Di sản thật 100% cho Bảo tàng Lịch sử TP.HCM...');
  
  // 1. Chuyên đề
  for (const t of INITIAL_TOPICS) {
    await Topic.updateOne({ id: t.id }, { $set: t }, { upsert: true });
    await pgUpsertTopic(t);
  }

  // 2. 18 Gian phòng trưng bày (Giai đoạn 1: Upsert phòng không kèm hotspots)
  for (const r of HERITAGE_18_ROOMS_SEED) {
    const { hotspots, ...roomWithoutHotspots } = r;
    await Room.updateOne(
      { id: r.id },
      { $set: roomWithoutHotspots },
      { upsert: true }
    );
    await pgUpsertRoom({ ...roomWithoutHotspots, hotspots: [] });
  }

  // 3. Cập nhật Hotspots (Giai đoạn 2: Khi tất cả phòng đã tồn tại trong CSDL quan hệ)
  for (const r of HERITAGE_18_ROOMS_SEED) {
    await Room.updateOne({ id: r.id }, { $set: { hotspots: r.hotspots } });
    const fullRoom = await Room.findOne({ id: r.id }).lean();
    if (fullRoom) {
      await pgUpsertRoom(fullRoom);
    }
  }

  // 4. Hiện vật di sản Bảo vật Quốc gia (Giai đoạn 3: Liên kết với phòng)
  for (const art of HERITAGE_ARTIFACTS_SEED) {
    await ArtifactModel.updateOne({ id: art.id }, { $set: art }, { upsert: true });
    await pgUpsertArtifact(art);
  }

  // 5. Sơ đồ mặt bằng: Nếu có sơ đồ, tự động map 18 phòng
  const activeMap = await FloorPlanMap.findOne({ active: true }) || await FloorPlanMap.findOne();
  if (activeMap) {
    await syncFloorPlanNodesToRooms(activeMap);
  }

  // 6. Xóa cache Redis
  await Promise.all([
    cacheDel('rooms:all'),
    cacheDelPattern('artifacts:*'),
    cacheDel('topics:all'),
    cacheDel('cache:branding:settings')
  ]);

  console.log('[SyncEngine] Đã hoàn tất đồng bộ 18 Gian phòng & Cổ vật di sản thật sang PostgreSQL và MongoDB!');
}

