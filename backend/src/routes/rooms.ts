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

// POST /api/rooms/seed-heritage (Khởi tạo lại 18 gian phòng di sản và bảo vật cho Bảo tàng Lịch sử TP.HCM)
roomsRouter.post('/seed-heritage', async (req: Request, res: Response) => {
  try {
    const { seedHeritageMuseumData } = await import('../db/syncEngine.js');
    await seedHeritageMuseumData();
    const rooms = await RoomModel.find().lean();
    res.json({
      success: true,
      message: 'Khởi tạo thành công 18 gian phòng di sản và bảo vật quốc gia!',
      count: rooms.length,
      data: rooms
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all rooms (PostgreSQL Primary + Redis cache TTL 30s + MongoDB Fallback)
roomsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const isFresh = req.query.fresh === 'true' || req.query._t !== undefined || req.headers['cache-control'] === 'no-cache';
    if (!isFresh) {
      const cachedRooms = await cacheGet<any[]>('rooms:all');
      if (cachedRooms && cachedRooms.length > 0) {
        return res.json({ success: true, data: cachedRooms, fromCache: true });
      }
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
      await cacheSet('rooms:all', rooms, 30); // 30 seconds TTL để tránh giữ cache quá lâu khi admin chỉnh sửa
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
        WHERE r.id = $1 OR r.code = $1 OR r.mongo_id = $1
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
      const query = mongoose.isValidObjectId(id)
        ? { $or: [{ id }, { _id: id }, { code: id }] }
        : { $or: [{ id }, { code: id }] };
      room = await RoomModel.findOne(query).lean();
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

    await Promise.all([
      cacheDel('rooms:all'),
      cacheDelPattern('rooms:*')
    ]);
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

// DELETE all rooms (Xóa sạch toàn bộ phòng trưng bày và liên kết trên CẢ PostgreSQL, MongoDB và Redis)
roomsRouter.delete('/all/clear', async (req: Request, res: Response) => {
  try {
    // 1. Xóa toàn bộ trong MongoDB
    await RoomModel.deleteMany({});
    await ArtifactModel.updateMany({}, { $unset: { roomId: 1, roomCode: 1 } });

    // 2. Xóa toàn bộ trong PostgreSQL
    try {
      await pgPool.query('DELETE FROM hotspots; DELETE FROM rooms;');
      await pgPool.query('UPDATE artifacts SET room_id = NULL, room_code = NULL;');
    } catch (pgErr: any) {
      console.warn('[Rooms] Lỗi xóa phòng trong PostgreSQL:', pgErr.message);
    }

    // 3. Xóa sạch mọi cache liên quan tới rooms & artifacts
    await Promise.all([
      cacheDel('rooms:all'),
      cacheDelPattern('rooms:*'),
      cacheDelPattern('artifacts:*')
    ]);

    broadcastRealtimeEvent('rooms_updated', { action: 'delete_all' });
    res.json({ success: true, message: 'Đã xóa toàn bộ gian phòng trưng bày thành công' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE room (Xóa phòng triệt để trong CẢ PostgreSQL Primary VÀ MongoDB Mirror + dọn dẹp liên kết)
roomsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);

    // 1. Tìm trong MongoDB
    const query = mongoose.isValidObjectId(id)
      ? { $or: [{ id }, { _id: id }, { code: id }] }
      : { $or: [{ id }, { code: id }] };
    const room = await RoomModel.findOne(query);

    // 2. Tìm trong PostgreSQL
    let pgRoom: any = null;
    try {
      const pgRes = await pgPool.query(
        'SELECT id, code, mongo_id FROM rooms WHERE id = $1 OR code = $1 OR mongo_id = $1 LIMIT 1;',
        [id]
      );
      if (pgRes.rows.length > 0) {
        pgRoom = pgRes.rows[0];
      }
    } catch (pgErr: any) {
      console.warn('[Rooms] Lỗi tìm phòng PostgreSQL:', pgErr.message);
    }

    if (!room && !pgRoom) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy gian phòng cần xóa' });
    }

    const realId = room?.id || pgRoom?.id || id;
    const realCode = room?.code || pgRoom?.code || '';
    const mongoId = room?._id?.toString() || pgRoom?.mongo_id || id;

    // 3. Xóa khỏi MongoDB
    await RoomModel.deleteMany({
      $or: [
        { id: realId },
        { code: realCode },
        ...(mongoose.isValidObjectId(mongoId) ? [{ _id: mongoId }] : [])
      ]
    });

    // 4. Xóa khỏi PostgreSQL Primary
    await pgDeleteRoom(realId, realCode, mongoId);
    await logAudit('DELETE_ROOM', 'rooms', { details: { id: realId, code: realCode } });

    // 5. Gỡ bỏ liên kết phòng khỏi các hiện vật và hotspots trên cả hai CSDL
    try {
      await pgPool.query(
        'UPDATE artifacts SET room_id = NULL, room_code = NULL WHERE room_id = $1 OR room_code = $2;',
        [realId, realCode]
      );
      await ArtifactModel.updateMany(
        { $or: [{ roomId: realId }, { roomCode: realCode }] },
        { $unset: { roomId: 1, roomCode: 1 } }
      );
      await pgPool.query(
        'DELETE FROM hotspots WHERE target_room_id = $1 OR target_room_id = $2;',
        [realId, realCode]
      );
      await RoomModel.updateMany(
        { 'hotspots.targetRoomId': { $in: [realId, realCode] } },
        { $pull: { hotspots: { targetRoomId: { $in: [realId, realCode] } } } }
      );
    } catch (relErr: any) {
      console.warn('[Rooms] Lỗi dọn dẹp liên kết hiện vật/hotspots:', relErr.message);
    }

    // 6. Xóa cache Redis triệt để
    await Promise.all([
      cacheDel('rooms:all'),
      cacheDel(`rooms:detail:${id}`),
      cacheDel(`rooms:detail:${realId}`),
      cacheDelPattern('rooms:*'),
      cacheDelPattern('artifacts:*')
    ]);

    broadcastRealtimeEvent('rooms_updated', { action: 'delete', roomId: realId, roomCode: realCode, mongoId, id });
    res.json({ success: true, message: 'Đã xóa gian phòng và đồng bộ dữ liệu thành công' });
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
