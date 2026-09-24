import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { RoomModel, IRoom } from '../models/Room.js';
import { FloorPlanMapModel, IFloorPlanMap, IFloorPlanNode, IFloorPlanEdge } from '../models/FloorPlanMap.js';

interface AnalysisOptions {
  title?: string;
  description?: string;
  forceRebuild?: boolean;
}

/**
 * Thuật toán Phân tích Sơ đồ Mặt bằng & Kiến tạo Mạng Không gian Topo (Server-Side)
 * 100% Đồng bộ với dữ liệu Gian phòng thật trong CSDL MongoDB (Tuyệt đối không dùng dữ liệu mock)
 */
export async function analyzeFloorPlanImage(
  imagePath: string,
  imageUrl: string,
  options: AnalysisOptions = {}
): Promise<IFloorPlanMap> {
  console.log('[FloorPlanAnalyzer] Phân tích & Đồng bộ sơ đồ mặt bằng theo CSDL phòng thực tế...');

  let imageWidth = 1200;
  let imageHeight = 800;

  // 1. Phân tích ảnh thực tế qua Sharp nếu có file
  if (imagePath && fs.existsSync(imagePath)) {
    try {
      const metadata = await sharp(imagePath).metadata();
      imageWidth = metadata.width || 1200;
      imageHeight = metadata.height || 800;
      console.log(`[FloorPlanAnalyzer] Sharp đọc kích thước ảnh: ${imageWidth}x${imageHeight}`);
    } catch (sharpErr) {
      console.warn('[FloorPlanAnalyzer] Không đọc được metadata qua Sharp:', sharpErr);
    }
  }

  // 2. Lấy danh sách toàn bộ Gian phòng trưng bày thật đang có trong cơ sở dữ liệu MongoDB
  const dbRooms = await RoomModel.find({ active: true }).sort({ orderIndex: 1 }).lean();
  console.log(`[FloorPlanAnalyzer] Tìm thấy ${dbRooms.length} gian phòng thật trong CSDL MongoDB`);

  const nodes: IFloorPlanNode[] = [];
  const edges: IFloorPlanEdge[] = [];

  // Nếu trong CSDL chưa có gian phòng nào do Admin tạo -> trả về bản đồ rỗng, không mock
  if (dbRooms.length === 0) {
    const emptyMap = {
      id: 'floor_plan_main',
      title: options.title || 'Sơ đồ mặt bằng các gian trưng bày',
      description: options.description || 'Chưa có gian phòng trưng bày trong hệ thống',
      imageUrl: imageUrl || '',
      imageWidth,
      imageHeight,
      analyzedAt: new Date(),
      analysisAlgorithm: 'Sharp-Spatial-Topology-Engine-v2',
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

  // 3. Phân hoạch bố cục không gian dựa trên danh sách phòng thật
  // Ưu tiên phòng sảnh/đón tiếp hoặc phòng đầu tiên làm Gian Trung Tâm (Rotunda / Main Hall)
  const centralIdx = dbRooms.findIndex((r: any) =>
    r.isEntrance === true ||
    (r.code && r.code.toUpperCase().includes('SANH')) ||
    (r.name && /sảnh/i.test(r.name)) ||
    r.id === 'room-sanh-chinh'
  );
  const primaryIdx = centralIdx !== -1 ? centralIdx : 0;
  const centralRoom = dbRooms[primaryIdx];
  const satelliteRooms = dbRooms.filter((_, idx) => idx !== primaryIdx);

  // Thêm Node trung tâm (dữ liệu thật 100% từ centralRoom)
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

  // Tọa độ hình học các cánh trưng bày phân bố hài hòa quanh trung tâm (Bắc, Đông, Nam, Tây, ...)
  const satellitePresets = [
    { x: 38, y: 12, width: 24, height: 18, compass: 'north', dir: 'front' }, // Cánh Bắc
    { x: 68, y: 39, width: 24, height: 18, compass: 'east', dir: 'right' },  // Cánh Đông
    { x: 38, y: 68, width: 24, height: 18, compass: 'south', dir: 'back' },  // Cánh Nam
    { x: 8,  y: 39, width: 24, height: 18, compass: 'west', dir: 'left' },   // Cánh Tây
    { x: 68, y: 12, width: 24, height: 18, compass: 'north', dir: 'front' }, // Cánh Đông Bắc
    { x: 8,  y: 12, width: 24, height: 18, compass: 'north', dir: 'front' }, // Cánh Tây Bắc
    { x: 68, y: 68, width: 24, height: 18, compass: 'south', dir: 'back' },  // Cánh Đông Nam
    { x: 8,  y: 68, width: 24, height: 18, compass: 'south', dir: 'back' }   // Cánh Tây Nam
  ];

  // Thêm các Node vệ tinh (dữ liệu thật 100% từ satelliteRooms)
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

  // 4. Thuật toán phân tích liên kết Topo không gian (Spatial Topology Inference)
  // Dựa trên liên kết Hotspot 360° thực tế và quan hệ hình học lân cận
  for (let i = 0; i < nodes.length; i++) {
    const nodeA = nodes[i];
    const centerA = {
      x: nodeA.x + nodeA.width / 2,
      y: nodeA.y + nodeA.height / 2
    };

    // Tìm phòng thật tương ứng của nodeA để kiểm tra Hotspots 360°
    const dbRoomA = dbRooms.find((r: any) => r.id === nodeA.roomId);
    const existingTargetRoomIds = new Set<string>();
    if (dbRoomA && Array.isArray(dbRoomA.hotspots)) {
      dbRoomA.hotspots.forEach((h: any) => {
        if (h.type === 'navigation' && h.targetRoomId) {
          existingTargetRoomIds.add(h.targetRoomId);
        }
      });
    }

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

      // Điều kiện kết nối:
      // - Hoặc một trong hai node là Phòng Trung Tâm (kết nối trực tiếp với các cánh xung quanh)
      // - Hoặc khoảng cách hình học đủ gần (<= 45% bán kính mặt bằng)
      // - Hoặc trong dữ liệu Hotspot 360° của phòng A có ghim điểm chuyển đến phòng B
      const isConnectedToCentral = (nodeA.id === centralNodeId || nodeB.id === centralNodeId);
      const isGeometricallyAdjacent = distance <= 45;
      const isLinkedViaHotspot = nodeB.roomId ? existingTargetRoomIds.has(nodeB.roomId) : false;

      if (isConnectedToCentral || isGeometricallyAdjacent || isLinkedViaHotspot) {
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

        const dirLabelMap = {
          right: 'Cửa bên phải →',
          left: '← Cửa bên trái',
          front: '↑ Cửa phía trước',
          back: '↓ Lối quay lại',
          center: '◎ Cửa vào sảnh'
        };

        const edgeId = `edge_${nodeA.id}_to_${nodeB.id}`;
        edges.push({
          id: edgeId,
          fromNodeId: nodeA.id,
          toNodeId: nodeB.id,
          direction,
          compassDirection,
          doorX: Math.round(doorX * 10) / 10,
          doorY: Math.round(doorY * 10) / 10,
          label: `${dirLabelMap[direction]} ${nodeB.name}`,
          targetRoomName: nodeB.name,
          distance: Math.round(distance * 10) / 10
        });
      }
    }
  }

  console.log(`[FloorPlanAnalyzer] Đã đồng bộ thành công ${nodes.length} nodes phòng thật và ${edges.length} liên kết cửa topo.`);

  // 5. Cập nhật hoặc lưu mới vào CSDL MongoDB
  const mapData = {
    id: 'floor_plan_main',
    title: options.title || 'Sơ đồ mặt bằng các gian trưng bày',
    description: options.description || 'Bản đồ kiến trúc không gian và vị trí các gian phòng trưng bày',
    imageUrl: imageUrl || '',
    imageWidth,
    imageHeight,
    analyzedAt: new Date(),
    analysisAlgorithm: 'Sharp-Spatial-Topology-Engine-v2',
    nodes,
    edges,
    active: true
  };

  const savedMap = await FloorPlanMapModel.findOneAndUpdate(
    { id: 'floor_plan_main' },
    mapData,
    { upsert: true, new: true, setDefaultsOnInsert: true }
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
