import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Topic, INITIAL_TOPICS } from '../models/Topic.js';
import { RoomModel } from '../models/Room.js';
import { ArtifactModel } from '../models/Artifact.js';
import { pgPool, logAudit } from '../db/postgres.js';
import { pgUpsertTopic, pgDeleteTopic } from '../db/syncEngine.js';
import { cacheGet, cacheSet, cacheDel } from '../services/redis.js';

export const topicsRouter = Router();

const getId = (param: unknown): string => {
  if (Array.isArray(param)) return param[0];
  return String(param || '');
};

const findTopicByIdOrSlug = async (id: string) => {
  const query = mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id };
  return await Topic.findOne(query);
};

// GET /api/topics - Lấy danh sách tất cả chuyên đề trưng bày (PostgreSQL Primary + Redis Caching)
topicsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const cached = await cacheGet<any[]>('topics:all');
    if (cached) {
      return res.json({ success: true, data: cached, fromCache: true });
    }

    // 1. Truy vấn từ PostgreSQL làm nguồn sự thật chính (Primary)
    let topicsWithRoomCount: any[] = [];
    try {
      const pgRes = await pgPool.query(`
        SELECT t.id, t.name, t.description, t.order_index as "orderIndex", t.active, t.created_at as "createdAt",
               COUNT(r.id)::int as "roomCount"
        FROM topics t
        LEFT JOIN rooms r ON (r.period = t.name OR r.category = t.name OR r.topic_id = t.id)
        GROUP BY t.id
        ORDER BY t.order_index ASC, t.created_at ASC;
      `);

      if (pgRes.rows.length > 0) {
        topicsWithRoomCount = pgRes.rows;
      }
    } catch (pgErr: any) {
      console.warn('[Topics PostgreSQL Query Warning]:', pgErr.message);
    }

    // 2. Fallback sang MongoDB nếu PostgreSQL chưa có dữ liệu
    if (topicsWithRoomCount.length === 0) {
      const topics = await Topic.find({}).sort({ orderIndex: 1, createdAt: 1 }).lean();
      topicsWithRoomCount = await Promise.all(
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
    }

    if (topicsWithRoomCount.length > 0) {
      await cacheSet('topics:all', topicsWithRoomCount, 300);
    }
    res.json({ success: true, data: topicsWithRoomCount });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi tải danh mục chuyên đề: ' + err.message });
  }
});

// POST /api/topics - Thêm chuyên đề mới (PostgreSQL Primary + MongoDB Mirror)
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

    // Đồng bộ lập tức sang PostgreSQL Primary
    await pgUpsertTopic(newTopic.toObject());
    await cacheDel('topics:all');

    await logAudit('CREATE_TOPIC', 'topics', { details: { name: trimmedName, id: newTopic.id } });

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

      // Đồng bộ cập nhật tên chuyên đề ở các gian phòng đang liên kết (MongoDB & PostgreSQL)
      await RoomModel.updateMany(
        { $or: [{ period: oldName }, { category: oldName }] },
        { period: trimmedName, category: trimmedName }
      );
      try {
        await pgPool.query('UPDATE rooms SET period = $1, category = $1 WHERE period = $2 OR category = $2 OR topic_id = $3;', [trimmedName, oldName, topic.id]);
      } catch (err: any) {
        console.warn('[Topics Update PG Warning]:', err.message);
      }
    }

    if (description !== undefined) topic.description = String(description).trim();
    if (typeof orderIndex === 'number') topic.orderIndex = orderIndex;
    if (active !== undefined) topic.active = Boolean(active);

    await topic.save();

    // Đồng bộ sang PostgreSQL Primary
    await pgUpsertTopic(topic.toObject());
    await cacheDel('topics:all');

    await logAudit('UPDATE_TOPIC', 'topics', { details: { name: topic.name, id: topic.id } });

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

    // Xóa trong PostgreSQL Primary
    await pgDeleteTopic(topic.id);

    // Gỡ bỏ liên kết topic_id ở artifacts nếu có
    try {
      await pgPool.query('UPDATE artifacts SET topic_id = NULL WHERE topic_id = $1;', [topic.id]);
      await ArtifactModel.updateMany({ topicId: topic.id }, { $unset: { topicId: 1 } });
    } catch (cleanErr: any) {
      console.warn('[Topics Delete Artifact Cleanup Warning]:', cleanErr.message);
    }

    await cacheDel('topics:all');

    await logAudit('DELETE_TOPIC', 'topics', { details: { name: topic.name, id: topic.id } });

    res.json({ success: true, message: `Đã xóa chuyên đề "${topic.name}" thành công` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi xóa chuyên đề: ' + err.message });
  }
});
