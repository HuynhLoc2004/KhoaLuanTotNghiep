import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { FloorPlanMapModel, FloorPlanNavSettingModel, FloorPlanNavLogModel } from '../models/FloorPlanMap.js';
import { RoomModel } from '../models/Room.js';
import { analyzeFloorPlanImage } from '../services/floorPlanAnalyzer.js';
import { uploadToCloudinary } from '../services/cloudinary.js';
import { getSystemBrandingConfig } from '../models/SystemBranding.js';
import { broadcastRealtimeEvent } from '../services/realtimeSync.js';
import { pgPool, logAudit } from '../db/postgres.js';
import {
  pgUpsertFloorPlan,
  pgDeleteFloorPlan,
  syncFloorPlanNodesToRooms,
  pgUpsertNavSettings,
  pgSaveNavLog,
  pgGetNavLogs
} from '../db/syncEngine.js';
import {
  findShortestPath,
  buildLocalizedInstructions,
  generateNavTtsAudio,
  resolveNodeId
} from '../services/floorPlanNavigator.js';

export const floorPlanRouter = Router();

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `floorplan_${Date.now()}_${cleanName}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file định dạng hình ảnh (JPEG, PNG, WebP)'));
    }
  }
});

/**
 * GET /api/floor-plan
 * Lấy sơ đồ mặt bằng đang active trên Client (Đồng bộ 100% với CSDL MongoDB thực tế)
 */
floorPlanRouter.get('/', async (req: Request, res: Response) => {
  try {
    // 1. Kiểm tra số lượng sơ đồ trong CSDL MongoDB
    let totalCount = await FloorPlanMapModel.countDocuments();
    if (totalCount === 0) {
      // Kiểm tra xem PostgreSQL có sơ đồ không để tự động phục hồi tức thì
      try {
        const pgCountRes = await pgPool.query('SELECT COUNT(*) FROM floor_plans;');
        const pgCount = parseInt(pgCountRes.rows[0].count, 10);
        if (pgCount > 0) {
          const { runStartupDataSync } = await import('../db/syncEngine.js');
          await runStartupDataSync();
          totalCount = await FloorPlanMapModel.countDocuments();
        }
      } catch (err: any) {
        console.warn('[FloorPlanRoute] Kiểm tra PostgreSQL fallback:', err.message);
      }
    }

    if (totalCount === 0) {
      return res.json({
        success: true,
        data: null
      });
    }

    // 2. Tìm bản đồ đang active
    let floorPlan = await FloorPlanMapModel.findOne({ active: true }).sort({ updatedAt: -1 }).lean();
    if (!floorPlan) {
      floorPlan = await FloorPlanMapModel.findOne().sort({ updatedAt: -1, createdAt: -1 }).lean();
    }

    // Nếu CSDL không có bản đồ nào (hoặc đã bị xóa), trả về null, tuyệt đối KHÔNG tự sinh mock rác
    res.json({
      success: true,
      data: floorPlan || null
    });
  } catch (error: any) {
    console.error('[FloorPlanRoute GET Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải sơ đồ mặt bằng: ' + (error.message || '')
    });
  }
});

/**
 * GET /api/floor-plan/list
 * Lấy danh sách toàn bộ các bản đồ trong kho lưu trữ kèm Phân Trang chuẩn mực
 */
floorPlanRouter.get('/list', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 6));
    const skip = (page - 1) * limit;

    let total = await FloorPlanMapModel.countDocuments();
    if (total === 0) {
      try {
        const pgCountRes = await pgPool.query('SELECT COUNT(*) FROM floor_plans;');
        const pgCount = parseInt(pgCountRes.rows[0].count, 10);
        if (pgCount > 0) {
          const { runStartupDataSync } = await import('../db/syncEngine.js');
          await runStartupDataSync();
          total = await FloorPlanMapModel.countDocuments();
        }
      } catch {}
    }

    const items = await FloorPlanMapModel.find()
      .sort({ active: -1, updatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const activeMap = await FloorPlanMapModel.findOne({ active: true }).lean();

    res.json({
      success: true,
      data: items,
      activeId: activeMap?.id || null,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err: any) {
    console.error('[FloorPlanRoute LIST Error]:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi tải danh sách bản đồ trong kho: ' + (err.message || '')
    });
  }
});

/**
 * Hàm đồng bộ thông tin sơ đồ mặt bằng sang SystemBranding, cập nhật Redis Cache và phát sóng SSE
 */
async function syncFloorPlanToBranding(map: { imageUrl?: string; title?: string; description?: string } | null) {
  try {
    const { SystemBranding, REDIS_BRANDING_KEY } = await import('../models/SystemBranding.js');
    const { cacheSet } = await import('../services/redis.js');
    const updatePayload: Record<string, any> = {
      guideMapUrl: map?.imageUrl || '',
      guideMapTitle: map?.title || 'Sơ đồ mặt bằng các gian trưng bày',
      guideMapDesc: map?.description || 'Bản đồ kiến trúc không gian và vị trí các gian phòng trưng bày'
    };
    const updatedBranding = await SystemBranding.findOneAndUpdate(
      {},
      { $set: updatePayload },
      { new: true, upsert: true }
    ).lean();
    if (updatedBranding) {
      try {
        await cacheSet(REDIS_BRANDING_KEY, updatedBranding, 86400);
      } catch {}
      try {
        const { pgUpsertBranding } = await import('../db/syncEngine.js');
        await pgUpsertBranding(updatedBranding);
      } catch (pgErr) {
        console.warn('[FloorPlanRoute] Lỗi đồng bộ Branding sang PostgreSQL:', pgErr);
      }
      broadcastRealtimeEvent('branding_updated', updatedBranding);
    }
  } catch (err) {
    console.warn('[FloorPlanRoute] Lỗi đồng bộ sang SystemBranding:', err);
  }
}

/**
 * POST /api/floor-plan/activate/:id
 * Kích hoạt bản đồ được chọn từ kho lên Client
 */
floorPlanRouter.post('/activate/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = {
      $or: [
        { id },
        ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : [])
      ]
    };
    const targetMap = await FloorPlanMapModel.findOne(query);
    if (!targetMap) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bản đồ chỉ định trong kho' });
    }

    // Đặt tất cả các bản đồ khác thành inactive
    await FloorPlanMapModel.updateMany({ _id: { $ne: targetMap._id } }, { active: false });
    targetMap.active = true;
    await targetMap.save();

    // Đồng bộ trạng thái active vào PostgreSQL Primary
    try {
      await pgPool.query('UPDATE floor_plans SET active = false WHERE id != $1 AND mongo_id != $1', [targetMap.id]);
      await pgPool.query('UPDATE floor_plans SET active = true WHERE id = $1 OR mongo_id = $1', [targetMap.id]);
    } catch (pgErr: any) {
      console.warn('[FloorPlan PG Activate Warning]:', pgErr.message);
    }

    // Tự động map và đồng bộ các phòng di sản vào sơ đồ
    await syncFloorPlanNodesToRooms(targetMap);

    // Đồng bộ vào SystemBranding để Header, Cẩm nang & Client đồng bộ 100%
    if (targetMap.imageUrl) {
      await syncFloorPlanToBranding(targetMap);
    }

    // Phát sóng sự kiện Realtime cho toàn bộ Client
    broadcastRealtimeEvent('floor_plan_updated', targetMap.toObject ? targetMap.toObject() : targetMap);

    res.json({
      success: true,
      message: `Đã kích hoạt thành công bản đồ "${targetMap.title}" lên Client!`,
      data: targetMap
    });
  } catch (err: any) {
    console.error('[FloorPlanRoute ACTIVATE Error]:', err);
    res.status(500).json({ success: false, message: 'Lỗi kích hoạt bản đồ: ' + (err.message || '') });
  }
});

/**
 * DELETE /api/floor-plan/:id
 * Xóa bản đồ khỏi danh sách
 */
floorPlanRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = {
      $or: [
        { id },
        ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : [])
      ]
    };
    const target = await FloorPlanMapModel.findOne(query);
    if (!target) {
      return res.json({ success: true, message: 'Bản đồ không còn tồn tại hoặc đã được xóa' });
    }

    const wasActive = target.active;
    await FloorPlanMapModel.deleteOne(query);
    await pgDeleteFloorPlan(target.id);
    await logAudit('DELETE_FLOOR_PLAN', 'floor_plan', { details: { id: target.id } });

    // Kiểm tra số lượng sơ đồ mặt bằng còn lại trong CSDL
    const totalRemaining = await FloorPlanMapModel.countDocuments();
    if (totalRemaining === 0) {
      // ĐÃ XÓA SẠCH: CSDL không còn bản đồ nào, xóa triệt để liên kết trong Branding và phát thông báo null
      await syncFloorPlanToBranding(null);
      broadcastRealtimeEvent('floor_plan_updated', null);
    } else if (wasActive) {
      // Nếu vừa xóa bản đồ đang áp dụng, tự động kích hoạt bản đồ mới nhất còn lại
      const remaining = await FloorPlanMapModel.findOne().sort({ updatedAt: -1 });
      if (remaining) {
        remaining.active = true;
        await remaining.save();
        try {
          await pgPool.query('UPDATE floor_plans SET active = false WHERE id != $1 AND mongo_id != $1', [remaining.id]);
          await pgPool.query('UPDATE floor_plans SET active = true WHERE id = $1 OR mongo_id = $1', [remaining.id]);
        } catch {}
        broadcastRealtimeEvent('floor_plan_updated', remaining.toObject ? remaining.toObject() : remaining);
        await syncFloorPlanToBranding(remaining);
      } else {
        await syncFloorPlanToBranding(null);
        broadcastRealtimeEvent('floor_plan_updated', null);
      }
    }

    res.json({
      success: true,
      message: 'Đã xóa sơ đồ mặt bằng thành công'
    });
  } catch (err: any) {
    console.error('[FloorPlanRoute DELETE Error]:', err);
    res.status(500).json({ success: false, message: 'Lỗi khi xóa sơ đồ: ' + (err.message || '') });
  }
});

/**
 * POST /api/floor-plan/analyze
 * Admin tải ảnh sơ đồ mặt bằng lên -> Server dùng Sharp & thuật toán Topo phân tích phòng và hướng cửa
 */
floorPlanRouter.post('/analyze', upload.single('file'), async (req: Request, res: Response) => {
  try {
    let localFilePath = '';
    let finalImageUrl = req.body.imageUrl || '';

    if (req.file) {
      localFilePath = req.file.path;
      finalImageUrl = `/uploads/${req.file.filename}`;

      // Upload lên Cloudinary nếu có cấu hình
      try {
        const cloudRes = await uploadToCloudinary(localFilePath, 'museum/floor_plans');
        if (cloudRes && cloudRes.secure_url) {
          finalImageUrl = cloudRes.secure_url;
        }
      } catch (cloudErr) {
        console.warn('[FloorPlanRoute] Cloudinary upload bỏ qua, dùng local url:', cloudErr);
      }
    } else if (finalImageUrl) {
      // Dùng URL đã có
      if (finalImageUrl.startsWith('/uploads/')) {
        localFilePath = path.join(process.cwd(), 'public', finalImageUrl);
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp file ảnh sơ đồ mặt bằng hoặc imageUrl hợp lệ'
      });
    }

    const title = req.body.title || 'Sơ Đồ Mặt Bằng & Cẩm Nang Tham Quan';
    const description = req.body.description || 'Mạng lưới liên kết không gian và cửa thông phòng được phân tích từ sơ đồ kiến trúc';
    const setActive = req.body.setActive !== 'false';
    const mapId = req.body.mapId || (setActive ? 'floor_plan_main' : `floor_plan_${Date.now()}`);

    // Thực hiện phân tích hình học & topo qua Sharp & Pure CV
    const analyzedMap = await analyzeFloorPlanImage(localFilePath, finalImageUrl, {
      mapId,
      title,
      description,
      setActive,
      forceRebuild: true
    });

    // Tự động map và đồng bộ các node của sơ đồ với 18 phòng di sản thực tế và tạo liên kết hotspots
    await syncFloorPlanNodesToRooms(analyzedMap);

    // Đồng bộ lập tức sang PostgreSQL Primary
    await pgUpsertFloorPlan(analyzedMap);
    await logAudit('ANALYZE_FLOOR_PLAN', 'floor_plan', { details: { id: analyzedMap.id, title: analyzedMap.title } });

    // Chỉ đồng bộ System Branding và broadcast nếu được đánh dấu active
    if (setActive) {
      await syncFloorPlanToBranding({
        imageUrl: finalImageUrl,
        title,
        description
      });

      // Phát sóng đồng bộ thời gian thực cho khách tham quan và admin
      broadcastRealtimeEvent('floor_plan_updated', analyzedMap);
    }

    res.json({
      success: true,
      message: 'Phân tích sơ đồ mặt bằng thành công bằng thuật toán Sharp & Topo không gian',
      data: analyzedMap,
      summary: {
        nodeCount: analyzedMap.nodes.length,
        edgeCount: analyzedMap.edges.length,
        imageDimensions: `${analyzedMap.imageWidth}x${analyzedMap.imageHeight}`
      }
    });
  } catch (error: any) {
    console.error('[FloorPlanRoute Analyze Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi trong quá trình phân tích ảnh sơ đồ: ' + (error.message || '')
    });
  }
});

/**
 * PUT /api/floor-plan/:id/node-mapping
 * Gán hoặc gỡ gán Gian phòng 360° cho 1 phòng cụ thể trên sơ đồ mặt bằng
 */
floorPlanRouter.put('/:id/node-mapping', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nodeId, roomId } = req.body;

    if (!nodeId) {
      return res.status(400).json({ success: false, message: 'Thiếu nodeId cần gán' });
    }

    const query = {
      $or: [
        { id },
        ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : [])
      ]
    };
    const targetMap = await FloorPlanMapModel.findOne(query);
    if (!targetMap) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sơ đồ mặt bằng' });
    }

    const targetNode = targetMap.nodes.find((n) => n.id === nodeId);
    if (!targetNode) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy vị trí phòng trên sơ đồ' });
    }

    if (roomId) {
      const room = await RoomModel.findOne({
        $or: [
          { id: roomId },
          ...(mongoose.isValidObjectId(roomId) ? [{ _id: roomId }] : [])
        ]
      }).lean();

      if (!room) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy gian phòng 360° tương ứng' });
      }

      targetNode.roomId = room.id;
      targetNode.panoramaUrl = room.panoramaUrl || '';
      targetNode.thumbnailUrl = room.thumbnailUrl || '';
    } else {
      (targetNode as any).roomId = null;
      targetNode.panoramaUrl = '';
      targetNode.thumbnailUrl = '';
    }

    targetMap.markModified('nodes');
    await targetMap.save();

    // Đồng bộ sang PostgreSQL Primary
    await pgUpsertFloorPlan(targetMap.toObject ? targetMap.toObject() : targetMap);
    await logAudit('UPDATE_FLOOR_PLAN_MAPPING', 'floor_plan', { details: { id: targetMap.id, nodeId, roomId } });

    if (targetMap.active) {
      broadcastRealtimeEvent('floor_plan_updated', targetMap.toObject ? targetMap.toObject() : targetMap);
    }

    res.json({
      success: true,
      message: roomId ? 'Gán gian phòng 360° thành công' : 'Đã gỡ liên kết gian phòng',
      data: targetMap
    });
  } catch (err: any) {
    console.error('[FloorPlanRoute Node Mapping Error]:', err);
    res.status(500).json({ success: false, message: 'Lỗi khi gán gian phòng: ' + (err.message || '') });
  }
});

/**
 * PUT /api/floor-plan/:id/batch-mapping
 * Lưu toàn bộ cấu hình gán nhiều phòng 360° cùng lúc
 */
floorPlanRouter.put('/:id/batch-mapping', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { mappings } = req.body; // Array of { nodeId: string, roomId: string | null }

    if (!Array.isArray(mappings)) {
      return res.status(400).json({ success: false, message: 'Dữ liệu mappings phải là một mảng' });
    }

    const query = {
      $or: [
        { id },
        ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : [])
      ]
    };
    const targetMap = await FloorPlanMapModel.findOne(query);
    if (!targetMap) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sơ đồ mặt bằng' });
    }

    const allRooms = await RoomModel.find().lean();
    const roomMap = new Map<string, any>();
    allRooms.forEach((r) => {
      roomMap.set(r.id, r);
      if (r._id) roomMap.set(r._id.toString(), r);
    });

    for (const m of mappings) {
      const targetNode = targetMap.nodes.find((n) => n.id === m.nodeId);
      if (!targetNode) continue;

      if (m.roomId && roomMap.has(m.roomId)) {
        const room = roomMap.get(m.roomId);
        targetNode.roomId = room.id;
        targetNode.panoramaUrl = room.panoramaUrl || '';
        targetNode.thumbnailUrl = room.thumbnailUrl || '';
      } else {
        (targetNode as any).roomId = null;
        targetNode.panoramaUrl = '';
        targetNode.thumbnailUrl = '';
      }
    }

    targetMap.markModified('nodes');
    await targetMap.save();

    // Đồng bộ sang PostgreSQL Primary
    await pgUpsertFloorPlan(targetMap.toObject ? targetMap.toObject() : targetMap);
    await logAudit('UPDATE_FLOOR_PLAN_BATCH_MAPPING', 'floor_plan', { details: { id: targetMap.id, count: mappings.length } });

    if (targetMap.active) {
      broadcastRealtimeEvent('floor_plan_updated', targetMap.toObject ? targetMap.toObject() : targetMap);
    }

    res.json({
      success: true,
      message: 'Đã lưu toàn bộ liên kết không gian sơ đồ thành công',
      data: targetMap
    });
  } catch (err: any) {
    console.error('[FloorPlanRoute Batch Mapping Error]:', err);
    res.status(500).json({ success: false, message: 'Lỗi khi lưu liên kết không gian: ' + (err.message || '') });
  }
});

/**
 * POST /api/floor-plan/navigate
 * Trợ lý Dẫn đường Thông minh: Tính toán lộ trình ngắn nhất, sinh chỉ dẫn đa ngôn ngữ và tạo Voice AI
 */
floorPlanRouter.post('/navigate', async (req: Request, res: Response) => {
  try {
    const { floorPlanId, startNodeId, endNodeId, lang = 'vi' } = req.body;

    if (!startNodeId || !endNodeId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp điểm xuất phát (startNodeId) và điểm đến (endNodeId)'
      });
    }

    // 1. Tìm bản đồ chỉ định hoặc bản đồ đang kích hoạt
    let map = null;
    if (floorPlanId) {
      map = await FloorPlanMapModel.findOne({ id: floorPlanId }).lean();
    }
    if (!map) {
      map = await FloorPlanMapModel.findOne({ active: true }).lean();
    }
    if (!map) {
      map = await FloorPlanMapModel.findOne().sort({ updatedAt: -1 }).lean();
    }

    if (!map || !map.nodes || map.nodes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sơ đồ mặt bằng hợp lệ để dẫn đường'
      });
    }

    const resolvedStartId = resolveNodeId(map.nodes, startNodeId) || startNodeId;
    const resolvedEndId = resolveNodeId(map.nodes, endNodeId) || endNodeId;

    const startNode = map.nodes.find((n) => n.id === resolvedStartId);
    const endNode = map.nodes.find((n) => n.id === resolvedEndId);

    if (!startNode) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy điểm xuất phát [${startNodeId}] trên sơ đồ`
      });
    }
    if (!endNode) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy điểm đến [${endNodeId}] trên sơ đồ`
      });
    }

    // 2. Tìm lộ trình ngắn nhất bằng thuật toán Dijkstra
    const pathResult = findShortestPath(map as any, resolvedStartId, resolvedEndId);

    if (!pathResult) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy lối đi liên kết giữa "${startNode.name}" và "${endNode.name}".`
      });
    }

    // 3. Xây dựng chỉ dẫn từng bước chuẩn ngữ pháp theo ngôn ngữ client
    const { steps, summary } = buildLocalizedInstructions(
      startNode,
      endNode,
      pathResult.rawSteps,
      map.nodes,
      lang
    );

    // 4. Sinh file âm thanh thuyết minh chỉ đường Voice AI
    let audioUrl = '';
    try {
      audioUrl = await generateNavTtsAudio(summary, lang);
    } catch (ttsErr: any) {
      console.warn('[FloorPlanRoute Navigate TTS Warning]:', ttsErr.message);
    }

    // 5. Lưu vết nhật ký tìm đường vào PostgreSQL & MongoDB (Dữ liệu thật 100%)
    const navLogData = {
      id: `nav_log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      floorPlanId: map.id,
      startNodeId: startNode.id,
      startNodeName: startNode.name,
      endNodeId: endNode.id,
      endNodeName: endNode.name,
      lang,
      pathNodeIds: pathResult.pathNodeIds,
      stepCount: steps.length,
      totalDistance: pathResult.totalDistance,
      instructionText: summary,
      createdAt: new Date()
    };

    try {
      await pgSaveNavLog(navLogData);
      await FloorPlanNavLogModel.create(navLogData);
    } catch (logErr: any) {
      console.warn('[FloorPlanRoute Navigate Log Warning]:', logErr.message);
    }

    res.json({
      success: true,
      data: {
        startNode,
        endNode,
        pathNodeIds: pathResult.pathNodeIds,
        pathEdgeIds: pathResult.pathEdgeIds,
        steps,
        totalDistance: pathResult.totalDistance,
        estimatedMinutes: Math.max(1, Math.round(pathResult.totalDistance / 20)),
        instructionSummary: summary,
        audioUrl,
        lang
      }
    });
  } catch (error: any) {
    console.error('[FloorPlanRoute Navigate Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi trong quá trình tính toán dẫn đường: ' + (error.message || '')
    });
  }
});

/**
 * GET /api/floor-plan/nav-settings
 * Lấy cấu hình Trợ lý Dẫn đường Bản đồ
 */
floorPlanRouter.get('/nav-settings', async (req: Request, res: Response) => {
  try {
    const floorPlanId = (req.query.floorPlanId as string) || 'floor_plan_main';

    let settings = await FloorPlanNavSettingModel.findOne({ floorPlanId }).lean();
    if (!settings) {
      // Fallback mặc định
      settings = {
        id: `nav_setting_${floorPlanId}`,
        floorPlanId,
        voiceEnabled: true,
        autoPlayVoice: false,
        speechSpeed: 1.0,
        ttsProvider: 'google',
        welcomeMessage: {
          vi: 'Xin chào, tôi là trợ lý dẫn đường bản đồ. Hãy chọn vị trí bạn đang đứng và điểm bạn muốn đến.',
          en: 'Hello, I am your museum map navigator. Please select your current location and desired destination.',
          fr: 'Bonjour, je suis votre guide cartographique. Choisissez votre position et votre destination.',
          zh: '您好，我是展厅地图导航助手。请选择您当前所在的位置和想要前往的目的地。',
          ja: 'こんにちは、館内マップナビゲーターです。現在地と目的地を選択してください。'
        },
        customRules: []
      } as any;
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (err: any) {
    console.error('[FloorPlanRoute GET Nav Settings Error]:', err);
    res.status(500).json({ success: false, message: 'Lỗi tải cấu hình trợ lý: ' + (err.message || '') });
  }
});

/**
 * PUT /api/floor-plan/nav-settings
 * Cập nhật cấu hình Trợ lý Dẫn đường Bản đồ (Admin CMS)
 */
floorPlanRouter.put('/nav-settings', async (req: Request, res: Response) => {
  try {
    const {
      floorPlanId = 'floor_plan_main',
      voiceEnabled = true,
      autoPlayVoice = false,
      speechSpeed = 1.0,
      ttsProvider = 'google',
      welcomeMessage = {},
      customRules = []
    } = req.body;

    const settingId = `nav_setting_${floorPlanId}`;
    const updatePayload = {
      id: settingId,
      floorPlanId,
      voiceEnabled,
      autoPlayVoice,
      speechSpeed,
      ttsProvider,
      welcomeMessage,
      customRules,
      updatedAt: new Date()
    };

    const saved = await FloorPlanNavSettingModel.findOneAndUpdate(
      { floorPlanId },
      updatePayload,
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    // Đồng bộ sang PostgreSQL
    await pgUpsertNavSettings(saved.toObject ? saved.toObject() : saved);
    await logAudit('UPDATE_FLOOR_PLAN_NAV_SETTINGS', 'floor_plan', { details: { floorPlanId, voiceEnabled } });

    res.json({
      success: true,
      message: 'Cập nhật cấu hình Trợ lý Dẫn đường thành công',
      data: saved
    });
  } catch (err: any) {
    console.error('[FloorPlanRoute PUT Nav Settings Error]:', err);
    res.status(500).json({ success: false, message: 'Lỗi cập nhật cấu hình: ' + (err.message || '') });
  }
});

/**
 * GET /api/floor-plan/nav-logs
 * Lấy lịch sử tìm đường thật để Admin thống kê luồng tham quan
 */
floorPlanRouter.get('/nav-logs', async (req: Request, res: Response) => {
  try {
    const floorPlanId = req.query.floorPlanId as string | undefined;
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 30));

    // Ưu tiên đọc từ PostgreSQL primary
    let logs = await pgGetNavLogs(floorPlanId, limit);
    if (!logs || logs.length === 0) {
      const q = floorPlanId ? { floorPlanId } : {};
      logs = await FloorPlanNavLogModel.find(q).sort({ createdAt: -1 }).limit(limit).lean();
    }

    res.json({
      success: true,
      data: logs
    });
  } catch (err: any) {
    console.error('[FloorPlanRoute Nav Logs Error]:', err);
    res.status(500).json({ success: false, message: 'Lỗi tải lịch sử tìm đường: ' + (err.message || '') });
  }
});

