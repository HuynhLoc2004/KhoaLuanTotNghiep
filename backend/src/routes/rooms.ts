import { Router, Request, Response } from 'express';
import { RoomModel, IRoom, IHotspot } from '../models/Room.js';
import { cacheGet, cacheSet, cacheDel } from '../services/redis.js';

export const roomsRouter = Router();

const getId = (param: unknown): string => {
  if (Array.isArray(param)) return param[0];
  return String(param || '');
};

// GET all rooms (with Redis cache acceleration)
roomsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const cachedRooms = await cacheGet<IRoom[]>('rooms:all');
    if (cachedRooms) {
      return res.json({ success: true, data: cachedRooms, fromCache: true });
    }

    const rooms = await RoomModel.find({}).sort({ orderIndex: 1 }).lean();
    await cacheSet('rooms:all', rooms, 300); // 5 minutes TTL
    res.json({ success: true, data: rooms });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single room
roomsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    const room = await RoomModel.findOne({ id }).lean();
    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy gian phòng này' });
    }
    res.json({ success: true, data: room });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CREATE room
roomsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { code, name, period, description, panoramaUrl, thumbnailUrl, initialView } = req.body;
    if (!name || !panoramaUrl) {
      return res.status(400).json({ success: false, message: 'Tên gian phòng và đường dẫn ảnh 360 là bắt buộc' });
    }

    const count = await RoomModel.countDocuments();
    const newId = `room-${Date.now()}`;
    const newRoom = await RoomModel.create({
      id: newId,
      code: code || `P-${100 + count + 1}`,
      name,
      period: period || 'Hiện vật Lịch sử',
      description: description || '',
      panoramaUrl,
      thumbnailUrl: thumbnailUrl || panoramaUrl,
      initialView: initialView || { pitch: 0, yaw: 0, fov: 90 },
      hotspots: [],
      orderIndex: count + 1,
      active: true
    });

    await cacheDel('rooms:all');
    res.status(201).json({ success: true, data: newRoom });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE room
roomsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    const updated = await RoomModel.findOneAndUpdate({ id }, { $set: req.body }, { new: true }).lean();
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy gian phòng' });
    }
    await cacheDel('rooms:all');
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE room
roomsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    const result = await RoomModel.deleteOne({ id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy gian phòng' });
    }
    await cacheDel('rooms:all');
    res.json({ success: true, message: 'Đã xóa gian phòng khỏi cơ sở dữ liệu' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADD hotspot
roomsRouter.post('/:id/hotspots', async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    const { type, title, description, targetRoomId, pitch, yaw } = req.body;
    if (pitch === undefined || yaw === undefined) {
      return res.status(400).json({ success: false, message: 'Tọa độ pitch và yaw là bắt buộc' });
    }

    const newHs: IHotspot = {
      id: `hs-${Date.now()}`,
      type: type || 'navigation',
      title: title || 'Điểm liên kết',
      description: description || '',
      targetRoomId,
      pitch: Number(pitch),
      yaw: Number(yaw)
    };

    const updated = await RoomModel.findOneAndUpdate(
      { id },
      { $push: { hotspots: newHs } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy gian phòng để thêm hotspot' });
    }

    res.status(201).json({ success: true, data: newHs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE hotspot
roomsRouter.put('/:id/hotspots/:hotspotId', async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    const hotspotId = getId(req.params.hotspotId);
    const fieldsToSet: Record<string, any> = {};
    for (const [k, v] of Object.entries(req.body)) {
      fieldsToSet[`hotspots.$.${k}`] = v;
    }

    const updated = await RoomModel.findOneAndUpdate(
      { id, 'hotspots.id': hotspotId },
      { $set: fieldsToSet },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hotspot' });
    }

    const hs = updated.hotspots.find(h => h.id === hotspotId);
    res.json({ success: true, data: hs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE hotspot
roomsRouter.delete('/:id/hotspots/:hotspotId', async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    const hotspotId = getId(req.params.hotspotId);

    const updated = await RoomModel.findOneAndUpdate(
      { id },
      { $pull: { hotspots: { id: hotspotId } } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy gian phòng' });
    }

    res.json({ success: true, message: 'Đã xóa hotspot' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
