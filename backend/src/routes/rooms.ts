import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { RoomModel, IRoom, IHotspot } from '../models/Room.js';
import { ArtifactModel } from '../models/Artifact.js';
import { cacheGet, cacheSet, cacheDel, cacheDelPattern } from '../services/redis.js';
import { broadcastRealtimeEvent } from '../services/realtimeSync.js';
import { pgPool, logAudit } from '../db/postgres.js';
import { pgUpsertRoom, pgDeleteRoom } from '../db/syncEngine.js';

export const roomsRouter = Router();

const getId = (param: unknown): string => {
  if (Array.isArray(param)) return param[0];
  return String(param || '');
};

// GET all rooms (PostgreSQL Primary + Redis cache TTL 300s + MongoDB Fallback)
roomsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const cachedRooms = await cacheGet<any[]>('rooms:all');
    if (cachedRooms && cachedRooms.length > 0) {
      return res.json({ success: true, data: cachedRooms, fromCache: true });
    }

    let rooms: any[] = [];

    // 1. Truy vấn từ PostgreSQL (Primary Database)
    try {
      const pgRes = await pgPool.query(`
        SELECT r.id, r.code, r.name, r.period, r.category, r.description,
               r.panorama_url as "panoramaUrl", r.thumbnail_url as "thumbnailUrl",
               r.initial_view as "initialView", r.order_index as "orderIndex",
               r.active, r.ai_voice_enabled as "aiVoiceEnabled",
               r.ai_knowledge_prompt as "aiKnowledgePrompt", r.ai_script as "aiScript",
               r.ai_voice_lang as "aiVoiceLang", r.qr_scan_count as "qrScanCount",
               r.scenes_count as "scenesCount", r.translations, r.topic_id as "topicId",
               COALESCE(
                 json_agg(
                   json_build_object(
                     'id', h.id,
                     'type', h.type,
                     'title', h.title,
                     'description', h.description,
                     'targetRoomId', h.target_room_id,
                     'artifactId', h.artifact_id,
                     'pitch', h.pitch,
                     'yaw', h.yaw
                   )
                 ) FILTER (WHERE h.id IS NOT NULL), '[]'
               ) as hotspots
        FROM rooms r
        LEFT JOIN hotspots h ON r.id = h.room_id
        GROUP BY r.id
        ORDER BY r.order_index ASC, r.created_at ASC;
      `);

      if (pgRes.rows.length > 0) {
        rooms = pgRes.rows;
      }
    } catch (pgErr: any) {
      console.warn('[Rooms PostgreSQL Query Warning]:', pgErr.message);
    }

    // 2. Fallback sang MongoDB nếu PostgreSQL chưa có bản ghi nào
    if (rooms.length === 0) {
      rooms = await RoomModel.find({}).sort({ orderIndex: 1 }).lean();
    }

    if (rooms.length > 0) {
      await cacheSet('rooms:all', rooms, 300); // 5 minutes TTL
    }
    res.json({ success: true, data: rooms });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single room (PostgreSQL Primary + Redis cache TTL 600s)
roomsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    const cacheKey = `rooms:detail:${id}`;
    const cached = await cacheGet<any>(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, fromCache: true });
    }

    let room: any = null;

    // 1. Truy vấn PostgreSQL Primary
    try {
      const pgRes = await pgPool.query(`
        SELECT r.id, r.code, r.name, r.period, r.category, r.description,
               r.panorama_url as "panoramaUrl", r.thumbnail_url as "thumbnailUrl",
               r.initial_view as "initialView", r.order_index as "orderIndex",
               r.active, r.ai_voice_enabled as "aiVoiceEnabled",
               r.ai_knowledge_prompt as "aiKnowledgePrompt", r.ai_script as "aiScript",
               r.ai_voice_lang as "aiVoiceLang", r.qr_scan_count as "qrScanCount",
               r.scenes_count as "scenesCount", r.translations, r.topic_id as "topicId",
               COALESCE(
                 json_agg(
                   json_build_object(
                     'id', h.id,
                     'type', h.type,
                     'title', h.title,
                     'description', h.description,
                     'targetRoomId', h.target_room_id,
                     'artifactId', h.artifact_id,
                     'pitch', h.pitch,
                     'yaw', h.yaw
                   )
                 ) FILTER (WHERE h.id IS NOT NULL), '[]'
               ) as hotspots
        FROM rooms r
        LEFT JOIN hotspots h ON r.id = h.room_id
        WHERE r.id = $1 OR r.code = $1
        GROUP BY r.id
        LIMIT 1;
      `, [id]);

      if (pgRes.rows.length > 0) {
        room = pgRes.rows[0];
      }
    } catch (pgErr: any) {
      console.warn('[Rooms Detail PG Warning]:', pgErr.message);
    }

    // 2. Fallback sang MongoDB
    if (!room) {
      room = await RoomModel.findOne({ $or: [{ id }, { code: id }] }).lean();
    }

    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy gian phòng này' });
    }

    await cacheSet(cacheKey, room, 600); // 10 minutes TTL
    res.json({ success: true, data: room });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CREATE room
roomsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      code,
      name,
      period,
      category,
      description,
      panoramaUrl,
      thumbnailUrl,
      initialView,
      aiVoiceEnabled,
      aiKnowledgePrompt,
      aiScript,
      aiVoiceLang,
      scenesCount,
      qrScanCount
    } = req.body;
    if (!name || !panoramaUrl) {
      return res.status(400).json({ success: false, message: 'Tên gian phòng và đường dẫn ảnh 360 là bắt buộc' });
    }

    const count = await RoomModel.countDocuments();
    const newId = `room-${Date.now()}`;
    const newRoom = await RoomModel.create({
      id: newId,
      code: code || `P-${100 + count + 1}`,
      name,
      period: period || 'Tiến trình Lịch sử VN',
      category: category || period || 'Tiến trình Lịch sử VN',
      description: description || '',
      panoramaUrl,
      thumbnailUrl: thumbnailUrl || panoramaUrl,
      initialView: initialView || { pitch: 0, yaw: 0, fov: 90 },
      hotspots: [],
      orderIndex: count + 1,
      active: true,
      aiVoiceEnabled: !!aiVoiceEnabled,
      aiKnowledgePrompt: aiKnowledgePrompt || '',
      aiScript: aiScript || '',
      aiVoiceLang: aiVoiceLang || 'vi-south',
      qrScanCount: qrScanCount || 0,
      scenesCount: scenesCount || 1
    });

    // Đồng bộ lập tức sang PostgreSQL Primary
    await pgUpsertRoom(newRoom.toObject());
    await logAudit('CREATE_ROOM', 'rooms', { details: { id: newRoom.id, name: newRoom.name } });

    await cacheDel('rooms:all');
    broadcastRealtimeEvent('rooms_updated', { action: 'create', room: newRoom });
    res.status(201).json({ success: true, data: newRoom });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE room (Dual-write PostgreSQL Primary & MongoDB Mirror)
roomsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    const query = mongoose.isValidObjectId(id)
      ? { $or: [{ id }, { _id: id }, { code: id }] }
      : { $or: [{ id }, { code: id }] };
    const room = await RoomModel.findOne(query);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy gian phòng' });
    }

    // Nếu có translations, ghi đè toàn bộ Map để đảm bảo các ngôn ngữ bị xoá được loại bỏ triệt để
    if (req.body.translations !== undefined) {
      room.set('translations', req.body.translations);
      room.markModified('translations');
    }

    const { translations, ...restFields } = req.body;
    Object.assign(room, restFields);

    const updated = await room.save();

    // Đồng bộ sang PostgreSQL Primary
    await pgUpsertRoom(updated.toObject());
    await logAudit('UPDATE_ROOM', 'rooms', { details: { id: updated.id, name: updated.name } });

    await Promise.all([
      cacheDel('rooms:all'),
      cacheDel(`rooms:detail:${id}`),
      cacheDel(`rooms:detail:${room.id}`)
    ]);
    broadcastRealtimeEvent('rooms_updated', { action: 'update', room: updated.toJSON() });
    res.json({ success: true, data: updated.toJSON() });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE room (Xóa phòng thật trong PostgreSQL Primary + MongoDB Mirror + dọn dẹp liên kết)
roomsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    const query = mongoose.isValidObjectId(id)
      ? { $or: [{ id }, { _id: id }, { code: id }] }
      : { $or: [{ id }, { code: id }] };
    const room = await RoomModel.findOne(query);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy gian phòng' });
    }

    const realId = room.id;
    await RoomModel.deleteOne({ _id: room._id });

    // Xóa trong PostgreSQL Primary
    await pgDeleteRoom(realId);
    await logAudit('DELETE_ROOM', 'rooms', { details: { id: realId, code: room.code } });

    // Chặt chẽ quan hệ dữ liệu: Gỡ bỏ liên kết phòng khỏi các hiện vật thuộc gian phòng này trong cả PostgreSQL & MongoDB
    try {
      await pgPool.query('UPDATE artifacts SET room_id = NULL, room_code = NULL WHERE room_id = $1 OR room_code = $2;', [realId, room.code]);
      await ArtifactModel.updateMany(
        { $or: [{ roomId: realId }, { roomCode: room.code }] },
        { $unset: { roomId: 1, roomCode: 1 } }
      );
      // Dọn dẹp điểm chuyển tiếp (hotspots) ở các phòng khác trỏ tới phòng này
      await pgPool.query('DELETE FROM hotspots WHERE target_room_id = $1;', [realId]);
      await RoomModel.updateMany(
        { 'hotspots.targetRoomId': realId },
        { $pull: { hotspots: { targetRoomId: realId } } }
      );
    } catch (relErr) {
      console.warn('[Rooms] Lỗi dọn dẹp liên kết hiện vật/hotspots:', relErr);
    }

    await Promise.all([
      cacheDel('rooms:all'),
      cacheDel(`rooms:detail:${id}`),
      cacheDel(`rooms:detail:${realId}`),
      cacheDelPattern('artifacts:*')
    ]);

    broadcastRealtimeEvent('rooms_updated', { action: 'delete', roomId: realId });
    res.json({ success: true, message: 'Đã xóa gian phòng và dọn dẹp liên kết cơ sở dữ liệu' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADD hotspot (PostgreSQL & MongoDB)
roomsRouter.post('/:id/hotspots', async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    const { type, title, description, targetRoomId, artifactId, pitch, yaw } = req.body;
    if (pitch === undefined || yaw === undefined) {
      return res.status(400).json({ success: false, message: 'Tọa độ pitch và yaw là bắt buộc' });
    }

    const newHs: IHotspot = {
      id: `hs-${Date.now()}`,
      type: type || 'navigation',
      title: title || 'Điểm liên kết',
      description: description || '',
      targetRoomId,
      artifactId,
      pitch: Number(pitch),
      yaw: Number(yaw)
    };

    const query = mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id };
    const room = await RoomModel.findOne(query);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy gian phòng để thêm hotspot' });
    }

    room.hotspots.push(newHs);
    await room.save();

    // Đồng bộ sang PostgreSQL Primary
    await pgUpsertRoom(room.toObject());

    await Promise.all([
      cacheDel('rooms:all'),
      cacheDel(`rooms:detail:${id}`),
      cacheDel(`rooms:detail:${room.id}`)
    ]);

    broadcastRealtimeEvent('rooms_updated', { action: 'hotspot_create', roomId: id, hotspot: newHs });
    res.status(201).json({ success: true, data: newHs, room });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE hotspot (PostgreSQL & MongoDB)
roomsRouter.put('/:id/hotspots/:hotspotId', async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    const hotspotId = getId(req.params.hotspotId);

    const query = mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id };
    const room = await RoomModel.findOne(query);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy gian phòng' });
    }

    const hs = room.hotspots.find((h) => h.id === hotspotId || (h as any)._id?.toString() === hotspotId);
    if (!hs) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hotspot' });
    }

    Object.assign(hs, req.body);
    await room.save();

    // Đồng bộ sang PostgreSQL Primary
    await pgUpsertRoom(room.toObject());

    await Promise.all([
      cacheDel('rooms:all'),
      cacheDel(`rooms:detail:${id}`),
      cacheDel(`rooms:detail:${room.id}`)
    ]);

    broadcastRealtimeEvent('rooms_updated', { action: 'hotspot_update', roomId: id, hotspot: hs });
    res.json({ success: true, data: hs, room });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE hotspot (PostgreSQL & MongoDB)
roomsRouter.delete('/:id/hotspots/:hotspotId', async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    const hotspotId = getId(req.params.hotspotId);

    const query = mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id };
    const room = await RoomModel.findOne(query);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy gian phòng' });
    }

    room.hotspots = room.hotspots.filter(
      (h) => h.id !== hotspotId && (h as any)._id?.toString() !== hotspotId
    );
    await room.save();

    // Đồng bộ sang PostgreSQL Primary
    await pgUpsertRoom(room.toObject());

    await Promise.all([
      cacheDel('rooms:all'),
      cacheDel(`rooms:detail:${id}`),
      cacheDel(`rooms:detail:${room.id}`)
    ]);

    broadcastRealtimeEvent('rooms_updated', { action: 'hotspot_delete', roomId: id, hotspotId });
    res.json({ success: true, message: 'Đã xóa hotspot khỏi cơ sở dữ liệu', room });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
