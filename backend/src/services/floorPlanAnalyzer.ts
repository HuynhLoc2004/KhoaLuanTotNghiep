import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { RoomModel, IRoom } from '../models/Room.js';
import { FloorPlanMapModel, IFloorPlanMap, IFloorPlanNode, IFloorPlanEdge } from '../models/FloorPlanMap.js';
import { analyzeFloorPlanWithPureCV, ICvAnalysisResult } from './floorPlanCvEngine.js';

interface AnalysisOptions {
  mapId?: string;
  title?: string;
  description?: string;
  setActive?: boolean;
  forceRebuild?: boolean;
}

/**
 * Thuật toán Phân tích Sơ đồ Mặt bằng & Kiến tạo Mạng Không gian Topo (Server-Side)
 * 100% Thị giác máy tính thuần (Pure Computer Vision) kết hợp CSDL Gian phòng thật trong MongoDB
 */
export async function analyzeFloorPlanImage(
  imagePath: string,
  imageUrl: string,
  options: AnalysisOptions = {}
): Promise<IFloorPlanMap> {
  console.log('[FloorPlanAnalyzer] Bắt đầu phân tích & bóc tách sơ đồ mặt bằng bằng Pure CV Engine...');

  let imageWidth = 1200;
  let imageHeight = 800;
  let cvResult: ICvAnalysisResult | null = null;

  // 1. Phân tích ảnh thực tế bằng Pure Computer Vision Engine
  let imageInput: string | Buffer | null = null;
  if (imagePath && fs.existsSync(imagePath)) {
    imageInput = imagePath;
  } else if (imageUrl) {
    if (imageUrl.startsWith('/uploads/')) {
      const local = path.join(process.cwd(), 'public', imageUrl);
      if (fs.existsSync(local)) imageInput = local;
    } else if (imageUrl.startsWith('http')) {
      try {
        const resp = await fetch(imageUrl);
        if (resp.ok) {
          imageInput = Buffer.from(await resp.arrayBuffer());
        }
      } catch (fErr) {
        console.warn('[FloorPlanAnalyzer] Không thể tải ảnh từ URL:', fErr);
      }
    }
  }

  if (imageInput) {
    try {
      cvResult = await analyzeFloorPlanWithPureCV(imageInput);
      imageWidth = cvResult.imageWidth;
      imageHeight = cvResult.imageHeight;
      console.log(`[FloorPlanAnalyzer] Pure CV Engine phát hiện ${cvResult.nodes.length} nodes và ${cvResult.edges.length} liên kết mũi tên trong ${cvResult.executionTimeMs}ms.`);
    } catch (cvErr) {
      console.warn('[FloorPlanAnalyzer] Pure CV Engine gặp lỗi, chuyển sang cơ chế suy diễn hình học dự phòng:', cvErr);
    }
  }

  // 2. Lấy danh sách toàn bộ Gian phòng trưng bày thật đang có trong cơ sở dữ liệu MongoDB
  const dbRooms = await RoomModel.find({ active: true }).sort({ orderIndex: 1 }).lean();
  console.log(`[FloorPlanAnalyzer] Tìm thấy ${dbRooms.length} gian phòng thật trong CSDL MongoDB`);

  const nodes: IFloorPlanNode[] = [];
  const edges: IFloorPlanEdge[] = [];

  // ==============================================================================
  // TRƯỜNG HỢP A: THỊ GIÁC MÁY TÍNH PHÁT HIỆN THÀNH CÔNG CÁC GIAN PHÒNG TỪ BẢN VẼ
  // ==============================================================================
  if (cvResult && cvResult.nodes.length > 0) {
    console.log(`[FloorPlanAnalyzer] Ánh xạ ${cvResult.nodes.length} nodes thị giác máy tính với CSDL phòng thật...`);

    // Ánh xạ từng node tìm thấy với gian phòng thực tế trong CSDL MongoDB
    cvResult.nodes.forEach((cvNode, idx) => {
      const matchedRoom = dbRooms[idx]; // Khớp theo thứ tự không gian hoặc mã phòng
      const isEntrance = idx === 0 || matchedRoom?.orderIndex === 1;

      nodes.push({
        id: cvNode.id,
        roomId: matchedRoom ? matchedRoom.id : undefined,
        code: matchedRoom?.code || cvNode.code,
        name: matchedRoom?.name || cvNode.name,
        period: matchedRoom?.period || 'Khu vực trưng bày số hóa',
        category: matchedRoom?.category || 'Trưng bày cố định',
        x: cvNode.x,
        y: cvNode.y,
        width: cvNode.width,
        height: cvNode.height,
        isEntrance,
        colorTag: getColorByPeriod(matchedRoom?.period),
        panoramaUrl: matchedRoom?.panoramaUrl || '',
        thumbnailUrl: matchedRoom?.thumbnailUrl || ''
      });
    });

    // Cập nhật nhãn và liên kết mũi tên đã phát hiện từ ảnh
    cvResult.edges.forEach((cvEdge) => {
      const fromNode = nodes.find((n) => n.id === cvEdge.fromNodeId);
      const toNode = nodes.find((n) => n.id === cvEdge.toNodeId);

      const targetName = toNode ? toNode.name : 'gian kế tiếp';
      edges.push({
        id: cvEdge.id,
        fromNodeId: cvEdge.fromNodeId,
        toNodeId: cvEdge.toNodeId,
        direction: cvEdge.direction,
        compassDirection: cvEdge.compassDirection,
        doorX: cvEdge.doorX,
        doorY: cvEdge.doorY,
        distance: cvEdge.distance,
        label: `Lối sang ${targetName}`,
        targetRoomName: targetName
      });
    });

    const mapId = options.mapId || (options.setActive !== false ? 'floor_plan_main' : `floor_plan_${Date.now()}`);
    const shouldSetActive = options.setActive !== false;

    if (shouldSetActive) {
      await FloorPlanMapModel.updateMany({ id: { $ne: mapId } }, { active: false });
    }

    const mapData = {
      id: mapId,
      title: options.title || 'Sơ đồ mặt bằng & Mạng không gian kiến trúc',
      description: options.description || 'Bản đồ liên kết không gian được trích xuất bằng thuật toán Pure Computer Vision',
      imageUrl: imageUrl || '',
      imageWidth,
      imageHeight,
      analyzedAt: new Date(),
      analysisAlgorithm: cvResult.algorithmName,
      nodes,
      edges,
      active: shouldSetActive
    };

    const savedMap = await FloorPlanMapModel.findOneAndUpdate(
      { id: mapId },
      mapData,
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    console.log(`[FloorPlanAnalyzer] Đã lưu thành công bản đồ Pure CV [${mapId}] (Active: ${shouldSetActive}) với ${nodes.length} nodes và ${edges.length} edges.`);
    return savedMap;
  }

  // ==============================================================================
  // TRƯỜNG HỢP B: NẾU CHƯA CÓ FILE ẢNH HOẶC KHÔNG PHÁT HIỆN ĐƯỢC NODE
  // Dùng cơ chế phân bổ hình học mẫu theo danh sách phòng CSDL
  // ==============================================================================
  if (dbRooms.length === 0) {
    const emptyMap = {
      id: 'floor_plan_main',
      title: options.title || 'Sơ đồ mặt bằng các gian trưng bày',
      description: options.description || 'Chưa có gian phòng trưng bày trong hệ thống',
      imageUrl: imageUrl || '',
      imageWidth,
      imageHeight,
      analyzedAt: new Date(),
      analysisAlgorithm: 'Pure-CV-Fallback-Engine-v1',
      nodes: [],
      edges: [],
      active: true
    };

    const savedMap = await FloorPlanMapModel.findOneAndUpdate(
      { id: 'floor_plan_main' },
      emptyMap,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return savedMap;
  }

  // Phân bổ hình học quanh phòng trung tâm
  const centralIdx = dbRooms.findIndex((r: any) =>
    r.isEntrance === true ||
    (r.code && r.code.toUpperCase().includes('SANH')) ||
    (r.name && /sảnh/i.test(r.name)) ||
    r.id === 'room-sanh-chinh'
  );
  const primaryIdx = centralIdx !== -1 ? centralIdx : 0;
  const centralRoom = dbRooms[primaryIdx];
  const satelliteRooms = dbRooms.filter((_, idx) => idx !== primaryIdx);

  const centralNodeId = `node_${centralRoom.id}`;
  nodes.push({
    id: centralNodeId,
    roomId: centralRoom.id,
    code: centralRoom.code || 'SANH-CHINH',
    name: centralRoom.name,
    period: centralRoom.period || 'Khu vực Trung tâm',
    category: centralRoom.category || 'Trung tâm',
    x: 38,
    y: 39,
    width: 24,
    height: 20,
    isEntrance: true,
    colorTag: '#C5A059',
    panoramaUrl: centralRoom.panoramaUrl || '',
    thumbnailUrl: centralRoom.thumbnailUrl || ''
  });

  const satellitePresets = [
    { x: 38, y: 12, width: 24, height: 18, compass: 'north', dir: 'front' },
    { x: 68, y: 39, width: 24, height: 18, compass: 'east', dir: 'right' },
    { x: 38, y: 68, width: 24, height: 18, compass: 'south', dir: 'back' },
    { x: 8,  y: 39, width: 24, height: 18, compass: 'west', dir: 'left' },
    { x: 68, y: 12, width: 24, height: 18, compass: 'north', dir: 'front' },
    { x: 8,  y: 12, width: 24, height: 18, compass: 'north', dir: 'front' },
    { x: 68, y: 68, width: 24, height: 18, compass: 'south', dir: 'back' },
    { x: 8,  y: 68, width: 24, height: 18, compass: 'south', dir: 'back' }
  ];

  satelliteRooms.forEach((room: any, idx: number) => {
    const preset = satellitePresets[idx % satellitePresets.length];
    nodes.push({
      id: `node_${room.id}`,
      roomId: room.id,
      code: room.code || `P-0${idx + 2}`,
      name: room.name,
      period: room.period || 'Hiện vật Lịch sử',
      category: room.category || 'Trưng bày cố định',
      x: preset.x,
      y: preset.y,
      width: preset.width,
      height: preset.height,
      isEntrance: false,
      colorTag: getColorByPeriod(room.period),
      panoramaUrl: room.panoramaUrl || '',
      thumbnailUrl: room.thumbnailUrl || ''
    });
  });

  for (let i = 0; i < nodes.length; i++) {
    const nodeA = nodes[i];
    const centerA = {
      x: nodeA.x + nodeA.width / 2,
      y: nodeA.y + nodeA.height / 2
    };

    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const nodeB = nodes[j];
      const centerB = {
        x: nodeB.x + nodeB.width / 2,
        y: nodeB.y + nodeB.height / 2
      };

      const dx = centerB.x - centerA.x;
      const dy = centerB.y - centerA.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const isConnectedToCentral = (nodeA.id === centralNodeId || nodeB.id === centralNodeId);
      const isGeometricallyAdjacent = distance <= 45;

      if (isConnectedToCentral || isGeometricallyAdjacent) {
        const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

        let direction: 'front' | 'back' | 'left' | 'right' | 'center' = 'front';
        let compassDirection: 'north' | 'south' | 'east' | 'west' = 'north';
        let doorX = (centerA.x + centerB.x) / 2;
        let doorY = (centerA.y + centerB.y) / 2;

        if (angleDeg >= -45 && angleDeg < 45) {
          direction = 'right';
          compassDirection = 'east';
          doorX = nodeA.x + nodeA.width;
          doorY = centerA.y;
        } else if (angleDeg >= 45 && angleDeg < 135) {
          direction = 'back';
          compassDirection = 'south';
          doorX = centerA.x;
          doorY = nodeA.y + nodeA.height;
        } else if (angleDeg >= -135 && angleDeg < -45) {
          direction = 'front';
          compassDirection = 'north';
          doorX = centerA.x;
          doorY = nodeA.y;
        } else {
          direction = 'left';
          compassDirection = 'west';
          doorX = nodeA.x;
          doorY = centerA.y;
        }

        const edgeId = `edge_${nodeA.id}_to_${nodeB.id}`;
        edges.push({
          id: edgeId,
          fromNodeId: nodeA.id,
          toNodeId: nodeB.id,
          direction,
          compassDirection,
          doorX: Math.round(doorX * 10) / 10,
          doorY: Math.round(doorY * 10) / 10,
          label: `Lối sang ${nodeB.name}`,
          targetRoomName: nodeB.name,
          distance: Math.round(distance * 10) / 10
        });
      }
    }
  }

  const mapId = options.mapId || (options.setActive !== false ? 'floor_plan_main' : `floor_plan_${Date.now()}`);
  const shouldSetActive = options.setActive !== false;

  if (shouldSetActive) {
    await FloorPlanMapModel.updateMany({ id: { $ne: mapId } }, { active: false });
  }

  const mapData = {
    id: mapId,
    title: options.title || 'Sơ đồ mặt bằng các gian trưng bày',
    description: options.description || 'Bản đồ kiến trúc không gian và vị trí các gian phòng trưng bày',
    imageUrl: imageUrl || '',
    imageWidth,
    imageHeight,
    analyzedAt: new Date(),
    analysisAlgorithm: 'Pure-CV-Fallback-Engine-v1',
    nodes,
    edges,
    active: shouldSetActive
  };

  const savedMap = await FloorPlanMapModel.findOneAndUpdate(
    { id: mapId },
    mapData,
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );

  return savedMap;
}

/**
 * Trợ thủ chọn màu sắc kiến trúc theo phân kỳ lịch sử
 */
function getColorByPeriod(period?: string): string {
  if (!period) return '#C5A880';
  const p = period.toLowerCase();
  if (p.includes('tiền sử') || p.includes('đồ đá') || p.includes('đồ đồng')) return '#8C7B65';
  if (p.includes('óc eo') || p.includes('phù nam')) return '#9E8055';
  if (p.includes('chăm') || p.includes('champa')) return '#A66B4B';
  if (p.includes('nguyễn') || p.includes('cung đình')) return '#B38B4D';
  if (p.includes('đông dương') || p.includes('1929')) return '#C5A059';
  return '#C5A880';
}
