import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
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

    const query = mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id };
    const room = await RoomModel.findOne(query);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy gian phòng để thêm hotspot' });
    }

    room.hotspots.push(newHs);
    await room.save();
    await cacheDel('rooms:all');

    res.status(201).json({ success: true, data: newHs, room });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE hotspot
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
    await cacheDel('rooms:all');

    res.json({ success: true, data: hs, room });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE hotspot
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
    await cacheDel('rooms:all');

    res.json({ success: true, message: 'Đã xóa hotspot khỏi cơ sở dữ liệu', room });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
