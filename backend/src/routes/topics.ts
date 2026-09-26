import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Topic, INITIAL_TOPICS } from '../models/Topic.js';
import { RoomModel } from '../models/Room.js';

export const topicsRouter = Router();

const getId = (param: unknown): string => {
  if (Array.isArray(param)) return param[0];
  return String(param || '');
};

const findTopicByIdOrSlug = async (id: string) => {
  const query = mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id };
  return await Topic.findOne(query);
};

// GET /api/topics - Lấy danh sách tất cả chuyên đề trưng bày
topicsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const topics = await Topic.find({}).sort({ orderIndex: 1, createdAt: 1 }).lean();

    // Tính toán số lượng gian phòng đang trực thuộc từng chuyên đề
    const topicsWithRoomCount = await Promise.all(
      topics.map(async (topic) => {
        const roomCount = await RoomModel.countDocuments({
          $or: [{ period: topic.name }, { category: topic.name }]
        });
        return {
          ...topic,
          roomCount
        };
      })
    );

    res.json({ success: true, data: topicsWithRoomCount });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi tải danh mục chuyên đề: ' + err.message });
  }
});

// POST /api/topics - Thêm chuyên đề mới
topicsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, orderIndex, active } = req.body;
    const trimmedName = String(name || '').trim();

    if (!trimmedName) {
      return res.status(400).json({ success: false, message: 'Tên chuyên đề không được để trống' });
    }

    // Kiểm tra trùng tên chuyên đề
    const existing = await Topic.findOne({ name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, message: `Chuyên đề "${trimmedName}" đã tồn tại trong hệ thống` });
    }

    // Lấy số thứ tự lớn nhất
    const lastTopic = await Topic.findOne().sort({ orderIndex: -1 });
    const nextOrder = typeof orderIndex === 'number' ? orderIndex : (lastTopic?.orderIndex || 0) + 1;

    const newTopic = new Topic({
      name: trimmedName,
      description: String(description || '').trim(),
      orderIndex: nextOrder,
      active: active !== undefined ? Boolean(active) : true
    });

    await newTopic.save();
    res.status(201).json({
      success: true,
      data: { ...newTopic.toObject(), roomCount: 0 },
      message: `Đã tạo chuyên đề "${newTopic.name}" thành công`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi tạo chuyên đề mới: ' + err.message });
  }
});

// PUT /api/topics/:id - Cập nhật chuyên đề
topicsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    const { name, description, orderIndex, active } = req.body;

    const topic = await findTopicByIdOrSlug(id);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy chuyên đề này' });
    }

    const oldName = topic.name;
    const trimmedName = name ? String(name).trim() : '';

    if (trimmedName && trimmedName !== oldName) {
      // Kiểm tra trùng tên với chuyên đề khác
      const duplicate = await Topic.findOne({
        id: { $ne: topic.id },
        name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
      });
      if (duplicate) {
        return res.status(400).json({ success: false, message: `Tên chuyên đề "${trimmedName}" đã được sử dụng` });
      }
      topic.name = trimmedName;

      // Đồng bộ cập nhật tên chuyên đề ở các gian phòng đang liên kết
      await RoomModel.updateMany(
        { $or: [{ period: oldName }, { category: oldName }] },
        { period: trimmedName, category: trimmedName }
      );
    }

    if (description !== undefined) topic.description = String(description).trim();
    if (typeof orderIndex === 'number') topic.orderIndex = orderIndex;
    if (active !== undefined) topic.active = Boolean(active);

    await topic.save();

    const roomCount = await RoomModel.countDocuments({
      $or: [{ period: topic.name }, { category: topic.name }]
    });

    res.json({
      success: true,
      data: { ...topic.toObject(), roomCount },
      message: `Đã cập nhật chuyên đề "${topic.name}" thành công`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật chuyên đề: ' + err.message });
  }
});

// DELETE /api/topics/:id - Xóa chuyên đề
topicsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    const topic = await findTopicByIdOrSlug(id);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy chuyên đề để xóa' });
    }

    // Kiểm tra xem có gian phòng nào đang dùng chuyên đề này không
    const roomCount = await RoomModel.countDocuments({
      $or: [{ period: topic.name }, { category: topic.name }]
    });

    if (roomCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa chuyên đề "${topic.name}" vì đang có ${roomCount} gian phòng trực thuộc. Vui lòng chuyển các phòng sang chuyên đề khác trước khi xóa.`
      });
    }

    await Topic.deleteOne({ _id: topic._id });
    res.json({ success: true, message: `Đã xóa chuyên đề "${topic.name}" thành công` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi xóa chuyên đề: ' + err.message });
  }
});
