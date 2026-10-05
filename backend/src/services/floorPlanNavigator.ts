import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { IFloorPlanMap, IFloorPlanNode, IFloorPlanEdge, SpatialDirection, CompassDirection } from '../models/FloorPlanMap.js';

export interface INavigationStep {
  stepNumber: number;
  fromNodeId: string;
  fromNodeName: string;
  toNodeId: string;
  toNodeName: string;
  direction: SpatialDirection;
  compassDirection: CompassDirection;
  doorX: number;
  doorY: number;
  distance: number;
  instruction: string;
}

export interface INavigationResult {
  startNode: IFloorPlanNode;
  endNode: IFloorPlanNode;
  pathNodeIds: string[];
  pathEdgeIds: string[];
  steps: INavigationStep[];
  totalDistance: number;
  estimatedMinutes: number;
  instructionSummary: string;
  audioUrl?: string;
  lang: string;
}

interface InternalEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  direction: SpatialDirection;
  compassDirection: CompassDirection;
  doorX: number;
  doorY: number;
  distance: number;
  label: string;
  targetRoomName?: string;
}

const DIR_REVERSE_MAP: Record<SpatialDirection, SpatialDirection> = {
  left: 'right',
  right: 'left',
  up: 'down',
  down: 'up',
  front: 'back',
  back: 'front',
  northeast: 'southwest',
  southwest: 'northeast',
  northwest: 'southeast',
  southeast: 'northwest',
  center: 'center'
};

const COMPASS_REVERSE_MAP: Record<CompassDirection, CompassDirection> = {
  north: 'south',
  south: 'north',
  east: 'west',
  west: 'east',
  northeast: 'southwest',
  southwest: 'northeast',
  northwest: 'southeast',
  southeast: 'northwest'
};

export const STANDARD_MUSEUM_HUBS: IFloorPlanNode[] = [
  {
    id: 'node_cong_1',
    code: 'CONG-1',
    name: 'Cổng 1 (Nguyễn Bỉnh Khiêm)',
    period: 'Cổng chính vào bảo tàng',
    category: 'Cổng ra vào',
    x: 46.0,
    y: 87.0,
    width: 8.0,
    height: 6.0,
    isEntrance: true,
    colorTag: '#3B82F6'
  },
  {
    id: 'node_cong_2',
    code: 'CONG-2',
    name: 'Cổng 2 (Thảo Cầm Viên)',
    period: 'Cổng phụ Tây Bắc',
    category: 'Cổng ra vào',
    x: 9.0,
    y: 28.0,
    width: 12.0,
    height: 8.0,
    isEntrance: true,
    colorTag: '#3B82F6'
  },
  {
    id: 'node_sanh',
    code: 'SANH',
    name: 'Sảnh Bát Giác',
    period: 'Khu vực đón tiếp & Phân luồng',
    category: 'Sảnh trung tâm',
    x: 45.0,
    y: 62.0,
    width: 10.0,
    height: 9.0,
    isEntrance: false,
    colorTag: '#D4A86A'
  },
  {
    id: 'node_san_vuon',
    code: 'SAN-VUON',
    name: 'Sân vườn nội viện',
    period: 'Khuôn viên xanh & Hồ rối nước',
    category: 'Khuôn viên ngoài trời',
    x: 42.0,
    y: 21.0,
    width: 29.0,
    height: 18.0,
    isEntrance: false,
    colorTag: '#10B981'
  }
];

/**
 * Đảm bảo sơ đồ bảo tàng luôn có đầy đủ 4 điểm trung tâm/cổng ra vào
 * và các liên kết thông phòng thực tế giữa 18 phòng và các cổng/sảnh/sân vườn.
 */
export function ensureCompleteMuseumTopology(map: IFloorPlanMap | any): {
  nodes: IFloorPlanNode[];
  edges: IFloorPlanEdge[];
} {
  if (!map) return { nodes: [], edges: [] };

  const nodes: IFloorPlanNode[] = Array.isArray(map.nodes) ? [...map.nodes] : [];
  const edges: IFloorPlanEdge[] = Array.isArray(map.edges) ? [...map.edges] : [];

  // 1. Bổ sung các hub đặc biệt nếu chưa có
  STANDARD_MUSEUM_HUBS.forEach((hub) => {
    const existing = nodes.find(
      (n) =>
        n.id === hub.id ||
        n.code?.toUpperCase() === hub.code.toUpperCase() ||
        n.id.toLowerCase().replace(/[-_]/g, '') === hub.id.toLowerCase().replace(/[-_]/g, '')
    );
    if (!existing) {
      nodes.push(hub);
    }
  });

  // Helper tìm node theo mã phòng hoặc thứ tự
  const findNode = (key: string | number): IFloorPlanNode | undefined => {
    if (typeof key === 'string') {
      const match = nodes.find(
        (n) =>
          n.id === key ||
          n.code?.toUpperCase() === key.toUpperCase() ||
          n.id.toLowerCase().replace(/[-_]/g, '') === key.toLowerCase().replace(/[-_]/g, '')
      );
      if (match) return match;
    }
    const num = typeof key === 'number' ? key : parseInt(key, 10);
    if (!isNaN(num)) {
      const pad = String(num).padStart(2, '0');
      const byCodeOrId = nodes.find(
        (n) =>
          n.code === `P-${pad}` ||
          n.code === `P-${num}` ||
          n.id === `node_p_${pad}` ||
          n.id === `node_p_${num}` ||
          n.id === `node_${pad}` ||
          n.id === `node_${num}`
      );
      if (byCodeOrId) return byCodeOrId;
      if (num >= 1 && num <= 18 && nodes[num - 1]) {
        return nodes[num - 1];
      }
    }
    return undefined;
  };

  // 2. Mạng lưới các đường thông phòng kiến trúc
  const standardLinks: [string | number, string | number, string][] = [
    // Vòng quanh các gian trưng bày:
    [1, 2, 'Sang Phòng 2 (Thời dựng nước)'],
    [2, 3, 'Lên Phòng 3 (Thời Ngô - Đinh - Tiền Lê)'],
    [3, 4, 'Lên Phòng 4 (Thời Lý)'],
    [4, 5, 'Sang Phòng 5 (Thời Trần - Hồ)'],
    [5, 6, 'Lên Phòng 6 (Văn hóa Champa)'],
    [6, 7, 'Lên Phòng 7 (Văn hóa Óc Eo)'],
    [7, 8, 'Sang Phòng 8 (Điêu khắc đá Campuchia)'],
    [8, 9, 'Xuống Phòng 9 (Thời Lê - Mạc, Trịnh - Nguyễn)'],
    [9, 10, 'Xuống Phòng 10 (Thời Tây Sơn)'],
    [10, 11, 'Sang Phòng 11 (Súng Thần công)'],
    [10, 12, 'Xuống Phòng 12 (Thời Nguyễn)'],
    [12, 13, 'Sang Phòng 13 (Sưu tập Dương Hà)'],
    [13, 14, 'Xuống Phòng 14 (Thương mại hàng hải)'],
    [14, 15, 'Vào Phòng 15 (Cổ vật tàu đắm)'],
    [14, 16, 'Xuống Phòng 16 (Sưu tập Vương Hồng Sển)'],
    [16, 17, 'Sang Phòng 17 (Dân tộc phía Nam)'],
    [17, 1, 'Lối sang Phòng 1'],
    // Gian trung tâm (Phòng 18 - Phật giáo Châu Á):
    [5, 18, 'Vào Phòng 18 (Phật giáo Châu Á)'],
    [18, 12, 'Sang Phòng 12 (Thời Nguyễn)'],
    [18, 1, 'Xuống Phòng 1 (Thời Tiền Sử)'],
    [18, 17, 'Xuống Phòng 17 (Dân tộc phía Nam)'],
    // Cổng 1, Cổng 2, Sảnh, Sân Vườn:
    ['node_cong_1', 1, 'Vào Phòng 1 (Cổng chính Nguyễn Bỉnh Khiêm)'],
    ['node_cong_2', 6, 'Vào Phòng 6 (Cổng phụ Thảo Cầm Viên)'],
    ['node_sanh', 1, 'Sang Phòng 1'],
    ['node_sanh', 17, 'Sang Phòng 17'],
    ['node_sanh', 18, 'Lên Phòng 18 (Phật giáo Châu Á)'],
    ['node_sanh', 'node_cong_1', 'Lối ra Cổng 1'],
    ['node_san_vuon', 6, 'Vào Phòng 6 (Văn hóa Champa)'],
    ['node_san_vuon', 9, 'Vào Phòng 9 (Thời Lê - Mạc)'],
    ['node_san_vuon', 18, 'Xuống Phòng 18 (Phật giáo Châu Á)']
  ];

  const existingPairs = new Set<string>();
  edges.forEach((e) => existingPairs.add(`${e.fromNodeId}->${e.toNodeId}`));

  standardLinks.forEach(([fromKey, toKey, label], idx) => {
    const fromN = findNode(fromKey);
    const toN = findNode(toKey);
    if (!fromN || !toN) return;

    const pairKey = `${fromN.id}->${toN.id}`;
    if (!existingPairs.has(pairKey)) {
      existingPairs.add(pairKey);
      const computed = calculateDynamicDirection(fromN, toN);
      const dist = Math.round(
        Math.hypot(
          (toN.x + (toN.width || 14) / 2) - (fromN.x + (fromN.width || 14) / 2),
          (toN.y + (toN.height || 7.5) / 2) - (fromN.y + (fromN.height || 7.5) / 2)
        )
      );

      edges.push({
        id: `edge_auto_${fromN.id}_${toN.id}_${idx}`,
        fromNodeId: fromN.id,
        toNodeId: toN.id,
        direction: computed.direction,
        compassDirection: computed.compassDirection,
        doorX: Math.round((fromN.x + toN.x) / 2),
        doorY: Math.round((fromN.y + toN.y) / 2),
        label,
        distance: dist > 0 ? dist : 15,
        targetRoomName: toN.name
      });
    }

    const revPairKey = `${toN.id}->${fromN.id}`;
    if (!existingPairs.has(revPairKey)) {
      existingPairs.add(revPairKey);
      const revComputed = calculateDynamicDirection(toN, fromN);
      const dist = Math.round(
        Math.hypot(
          (fromN.x + (fromN.width || 14) / 2) - (toN.x + (toN.width || 14) / 2),
          (fromN.y + (fromN.height || 7.5) / 2) - (toN.y + (toN.height || 7.5) / 2)
        )
      );

      edges.push({
        id: `rev_edge_auto_${toN.id}_${fromN.id}_${idx}`,
        fromNodeId: toN.id,
        toNodeId: fromN.id,
        direction: revComputed.direction,
        compassDirection: revComputed.compassDirection,
        doorX: Math.round((fromN.x + toN.x) / 2),
        doorY: Math.round((fromN.y + toN.y) / 2),
        label: `Lối sang ${fromN.name}`,
        distance: dist > 0 ? dist : 15,
        targetRoomName: fromN.name,
        isReturn: true
      });
    }
  });

  map.nodes = nodes;
  map.edges = edges;
  return { nodes, edges };
}

/**
 * Xây dựng danh sách kề toàn diện cho bản đồ
 */
function buildAdjacencyList(nodes: IFloorPlanNode[], edges: IFloorPlanEdge[]): Map<string, InternalEdge[]> {
  const adj = new Map<string, InternalEdge[]>();
  nodes.forEach((n) => adj.set(n.id, []));

  const existingPairs = new Set<string>();

  edges.forEach((e) => {
    existingPairs.add(`${e.fromNodeId}->${e.toNodeId}`);
    const list = adj.get(e.fromNodeId) || [];
    list.push({
      id: e.id,
      fromNodeId: e.fromNodeId,
      toNodeId: e.toNodeId,
      direction: e.direction || 'front',
      compassDirection: e.compassDirection || 'north',
      doorX: e.doorX ?? 50,
      doorY: e.doorY ?? 50,
      distance: e.distance ?? 10,
      label: e.label || '',
      targetRoomName: e.targetRoomName
    });
    adj.set(e.fromNodeId, list);
  });

  // Tạo liên kết hai chiều cho các phòng có cửa thông nhưng cạnh ngược chưa được khai báo
  edges.forEach((e) => {
    const reverseKey = `${e.toNodeId}->${e.fromNodeId}`;
    if (!existingPairs.has(reverseKey)) {
      existingPairs.add(reverseKey);
      const list = adj.get(e.toNodeId) || [];
      const fromNode = nodes.find((n) => n.id === e.fromNodeId);
      list.push({
        id: `rev_${e.id}`,
        fromNodeId: e.toNodeId,
        toNodeId: e.fromNodeId,
        direction: DIR_REVERSE_MAP[e.direction] || 'front',
        compassDirection: COMPASS_REVERSE_MAP[e.compassDirection] || 'south',
        doorX: e.doorX ?? 50,
        doorY: e.doorY ?? 50,
        distance: e.distance ?? 10,
        label: fromNode ? `Lối sang ${fromNode.name}` : 'Lối quay lại',
        targetRoomName: fromNode ? fromNode.name : ''
      });
      adj.set(e.toNodeId, list);
    }
  });

  return adj;
}

export function resolveNodeId(nodes: IFloorPlanNode[], inputId: string): string | null {
  if (!inputId) return null;
  const direct = nodes.find((n) => n.id === inputId);
  if (direct) return direct.id;

  const byCode = nodes.find((n) => n.code?.toLowerCase() === inputId.toLowerCase());
  if (byCode) return byCode.id;

  const normalized = inputId.toLowerCase().replace(/[-_]/g, '');
  const byNorm = nodes.find((n) => {
    const nIdNorm = n.id.toLowerCase().replace(/[-_]/g, '');
    const nCodeNorm = (n.code || '').toLowerCase().replace(/[-_]/g, '');
    return nIdNorm === normalized || nCodeNorm === normalized;
  });
  if (byNorm) return byNorm.id;

  return null;
}

/**
 * Thuật toán Dijkstra tìm đường ngắn nhất tối ưu hình học trên sơ đồ mặt bằng
 */
export function findShortestPath(
  map: IFloorPlanMap,
  startNodeIdRaw: string,
  endNodeIdRaw: string
): { pathNodeIds: string[]; pathEdgeIds: string[]; rawSteps: InternalEdge[]; totalDistance: number } | null {
  // Chuẩn hóa và bổ sung toàn diện sơ đồ và các điểm kết nối
  const { nodes, edges } = ensureCompleteMuseumTopology(map);
  const startNodeId = resolveNodeId(nodes, startNodeIdRaw) || startNodeIdRaw;
  const endNodeId = resolveNodeId(nodes, endNodeIdRaw) || endNodeIdRaw;
  const adj = buildAdjacencyList(nodes, edges);

  const nodeMap = new Map<string, IFloorPlanNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  if (!adj.has(startNodeId) || !adj.has(endNodeId)) {
    return null;
  }

  if (startNodeId === endNodeId) {
    return {
      pathNodeIds: [startNodeId],
      pathEdgeIds: [],
      rawSteps: [],
      totalDistance: 0
    };
  }

  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const prevEdge = new Map<string, InternalEdge | null>();
  const visited = new Set<string>();

  nodes.forEach((n) => {
    distances.set(n.id, Infinity);
    previous.set(n.id, null);
    prevEdge.set(n.id, null);
  });
  distances.set(startNodeId, 0);

  // Priority Queue: ưu tiên quãng đường hình học thực tế ngắn nhất
  const queue: { id: string; dist: number }[] = [{ id: startNodeId, dist: 0 }];

  while (queue.length > 0) {
    queue.sort((a, b) => a.dist - b.dist);
    const { id: currId, dist: currDist } = queue.shift()!;

    if (currId === endNodeId) break;
    if (visited.has(currId)) continue;
    visited.add(currId);

    const neighbors = adj.get(currId) || [];
    for (const edge of neighbors) {
      if (visited.has(edge.toNodeId)) continue;

      // Trọng số cạnh = Khoảng cách hình học Euclid thực tế giữa 2 phòng + 3m chi phí qua cửa
      const currNode = nodeMap.get(currId);
      const nextNode = nodeMap.get(edge.toNodeId);
      let stepDistance = edge.distance > 0 ? edge.distance : 15;

      if (currNode && nextNode) {
        const cx1 = currNode.x + (currNode.width || 14) / 2;
        const cy1 = currNode.y + (currNode.height || 7.5) / 2;
        const cx2 = nextNode.x + (nextNode.width || 14) / 2;
        const cy2 = nextNode.y + (nextNode.height || 7.5) / 2;
        const geoDist = Math.hypot(cx2 - cx1, cy2 - cy1);
        stepDistance = Math.max(8, Math.round(geoDist));
      }

      // 3m hop penalty để hạn chế đi vòng qua nhiều phòng không cần thiết
      const weight = stepDistance + 3;
      const newDist = currDist + weight;

      if (newDist < (distances.get(edge.toNodeId) ?? Infinity)) {
        distances.set(edge.toNodeId, newDist);
        previous.set(edge.toNodeId, currId);
        prevEdge.set(edge.toNodeId, { ...edge, distance: stepDistance });
        queue.push({ id: edge.toNodeId, dist: newDist });
      }
    }
  }

  if (distances.get(endNodeId) === Infinity) {
    return null;
  }

  // Tái hiện đường đi
  const pathNodeIds: string[] = [];
  const pathEdgeIds: string[] = [];
  const rawSteps: InternalEdge[] = [];
  let curr: string | null = endNodeId;

  while (curr) {
    pathNodeIds.push(curr);
    const edge = prevEdge.get(curr);
    if (edge) {
      pathEdgeIds.push(edge.id);
      rawSteps.push(edge);
    }
    curr = previous.get(curr) || null;
  }

  pathNodeIds.reverse();
  pathEdgeIds.reverse();
  rawSteps.reverse();

  // Tính tổng quãng đường vật lý mét thực tế
  let totalDistanceMeters = 0;
  for (let i = 0; i < pathNodeIds.length - 1; i++) {
    const n1 = nodeMap.get(pathNodeIds[i]);
    const n2 = nodeMap.get(pathNodeIds[i + 1]);
    if (n1 && n2) {
      const cx1 = n1.x + (n1.width || 14) / 2;
      const cy1 = n1.y + (n1.height || 7.5) / 2;
      const cx2 = n2.x + (n2.width || 14) / 2;
      const cy2 = n2.y + (n2.height || 7.5) / 2;
      totalDistanceMeters += Math.max(8, Math.round(Math.hypot(cx2 - cx1, cy2 - cy1)));
    } else {
      totalDistanceMeters += 15;
    }
  }

  return {
    pathNodeIds,
    pathEdgeIds,
    rawSteps,
    totalDistance: Math.round(totalDistanceMeters)
  };
}

/**
 * Tính phương vị hình học 8 hướng chính xác từ vị trí phòng xuất phát sang phòng đích
 */
export function calculateDynamicDirection(
  fromNode: IFloorPlanNode,
  toNode: IFloorPlanNode
): {
  direction: 'left' | 'right' | 'up' | 'down' | 'northeast' | 'northwest' | 'southeast' | 'southwest';
  compassDirection: 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest';
} {
  const fromW = fromNode.width && fromNode.width > 0 ? fromNode.width : 14;
  const fromH = fromNode.height && fromNode.height > 0 ? fromNode.height : 7.5;
  const toW = toNode.width && toNode.width > 0 ? toNode.width : 14;
  const toH = toNode.height && toNode.height > 0 ? toNode.height : 7.5;

  const cx1 = fromNode.x + fromW / 2;
  const cy1 = fromNode.y + fromH / 2;
  const cx2 = toNode.x + toW / 2;
  const cy2 = toNode.y + toH / 2;

  const dx = cx2 - cx1;
  const dy = cy2 - cy1;
  const deg = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;

  if (deg >= 337.5 || deg < 22.5) {
    return { direction: 'right', compassDirection: 'east' };
  } else if (deg >= 22.5 && deg < 67.5) {
    return { direction: 'southeast', compassDirection: 'southeast' };
  } else if (deg >= 67.5 && deg < 112.5) {
    return { direction: 'down', compassDirection: 'south' };
  } else if (deg >= 112.5 && deg < 157.5) {
    return { direction: 'southwest', compassDirection: 'southwest' };
  } else if (deg >= 157.5 && deg < 202.5) {
    return { direction: 'left', compassDirection: 'west' };
  } else if (deg >= 202.5 && deg < 247.5) {
    return { direction: 'northwest', compassDirection: 'northwest' };
  } else if (deg >= 247.5 && deg < 292.5) {
    return { direction: 'up', compassDirection: 'north' };
  } else {
    return { direction: 'northeast', compassDirection: 'northeast' };
  }
}

/**
 * Sinh chỉ dẫn từng bước ngắn gọn, chuẩn ngữ pháp đa ngôn ngữ ăn khớp 100% với hình học bản đồ
 */
export function buildLocalizedInstructions(
  startNode: IFloorPlanNode,
  endNode: IFloorPlanNode,
  rawSteps: InternalEdge[],
  nodes: IFloorPlanNode[],
  lang: string = 'vi'
): { steps: INavigationStep[]; summary: string } {
  const nodeMap = new Map<string, IFloorPlanNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const cleanLang = (lang || 'vi').toLowerCase();
  const steps: INavigationStep[] = [];

  const dirPhrasesVi: Record<string, string> = {
    left: 'rẽ trái sang',
    right: 'rẽ phải sang',
    up: 'đi thẳng về phía trước sang',
    down: 'đi xuống phía dưới sang',
    front: 'đi thẳng về phía trước sang',
    back: 'quay trở lại',
    northeast: 'chếch lên bên phải sang',
    northwest: 'chếch lên bên trái sang',
    southeast: 'chếch xuống bên phải sang',
    southwest: 'chếch xuống bên trái sang',
    center: 'đi vào khu trung tâm'
  };

  const dirPhrasesEn: Record<string, string> = {
    left: 'turn left into',
    right: 'turn right into',
    up: 'proceed straight ahead to',
    down: 'head down to',
    front: 'proceed straight ahead to',
    back: 'turn back to',
    northeast: 'head northeast to',
    northwest: 'head northwest to',
    southeast: 'head southeast to',
    southwest: 'head southwest to',
    center: 'enter the central area of'
  };

  const dirPhrasesFr: Record<string, string> = {
    left: 'tournez à gauche vers',
    right: 'tournez à droite vers',
    up: 'avancez tout droit vers',
    down: 'descendez vers',
    front: 'avancez tout droit vers',
    back: 'faites demi-tour vers',
    northeast: 'dirigez-vous vers le nord-est vers',
    northwest: 'dirigez-vous vers le nord-ouest vers',
    southeast: 'dirigez-vous vers le sud-est vers',
    southwest: 'dirigez-vous vers le sud-ouest vers',
    center: 'entrez dans la zone centrale de'
  };

  const dirPhrasesZh: Record<string, string> = {
    left: '左转前往',
    right: '右转前往',
    up: '向前直行前往',
    down: '向下前往',
    front: '向前直行前往',
    back: '原路返回',
    northeast: '向右上方前往',
    northwest: '向左上方前往',
    southeast: '向右下方前往',
    southwest: '向左下方前往',
    center: '进入中心区域'
  };

  const dirPhrasesJa: Record<string, string> = {
    left: '左に曲がり、',
    right: '右に曲がり、',
    up: 'まっすぐ前へ進み、',
    down: '手前方向へ進み、',
    front: 'まっすぐ前へ進み、',
    back: '引き返し、',
    northeast: '右斜め上へ進み、',
    northwest: '左斜め上へ進み、',
    southeast: '右斜め下へ進み、',
    southwest: '左斜め下へ進み、',
    center: '中央エリアへ進み、'
  };

  for (let i = 0; i < rawSteps.length; i++) {
    const edge = rawSteps[i];
    const fromNode = nodeMap.get(edge.fromNodeId);
    const toNode = nodeMap.get(edge.toNodeId);
    const fromName = fromNode ? fromNode.name : edge.fromNodeId;
    const toName = toNode ? toNode.name : edge.toNodeId;

    // Tính toán hướng hình học thực địa nếu 2 node có tọa độ
    const computed = (fromNode && toNode) ? calculateDynamicDirection(fromNode, toNode) : null;
    const effectiveDir = computed?.direction || edge.direction || 'front';
    const effectiveComp = computed?.compassDirection || edge.compassDirection || 'north';

    let instruction = '';
    if (cleanLang === 'en') {
      const act = dirPhrasesEn[effectiveDir] || 'proceed to';
      instruction = `Step ${i + 1}: From ${fromName}, ${act} ${toName}.`;
    } else if (cleanLang === 'fr') {
      const act = dirPhrasesFr[effectiveDir] || 'dirigez-vous vers';
      instruction = `Étape ${i + 1}: Depuis ${fromName}, ${act} ${toName}.`;
    } else if (cleanLang === 'zh') {
      const act = dirPhrasesZh[effectiveDir] || '前往';
      instruction = `第${i + 1}步：从${fromName}出发，${act}${toName}。`;
    } else if (cleanLang === 'ja') {
      const act = dirPhrasesJa[effectiveDir] || '';
      instruction = `ステップ ${i + 1}：${fromName}から${act}${toName}へ進みます。`;
    } else {
      const act = dirPhrasesVi[effectiveDir] || 'đi sang';
      instruction = `Bước ${i + 1}: Từ ${fromName}, bạn ${act} ${toName}.`;
    }

    steps.push({
      stepNumber: i + 1,
      fromNodeId: edge.fromNodeId,
      fromNodeName: fromName,
      toNodeId: edge.toNodeId,
      toNodeName: toName,
      direction: effectiveDir,
      compassDirection: effectiveComp,
      doorX: edge.doorX,
      doorY: edge.doorY,
      distance: edge.distance,
      instruction
    });
  }

  // Tạo câu thuyết minh tóm tắt chuẩn mực cho Voice AI
  let summary = '';
  if (steps.length === 0) {
    summary = cleanLang === 'en'
      ? 'You are already at your desired destination.'
      : 'Quý khách đã ở đúng vị trí cần đến.';
  } else if (cleanLang === 'en') {
    if (steps.length === 1) {
      summary = `From ${startNode.name}, please ${dirPhrasesEn[steps[0].direction] || 'proceed to'} ${endNode.name}.`;
    } else if (steps.length === 2) {
      summary = `From ${startNode.name}, please ${dirPhrasesEn[steps[0].direction] || 'proceed to'} ${steps[0].toNodeName}, then ${dirPhrasesEn[steps[1].direction] || 'continue to'} ${endNode.name}.`;
    } else {
      summary = `From ${startNode.name}, please ${dirPhrasesEn[steps[0].direction] || 'proceed to'} ${steps[0].toNodeName}, continue through ${steps[1].toNodeName}, and follow the path to reach ${endNode.name}.`;
    }
  } else if (cleanLang === 'fr') {
    if (steps.length === 1) {
      summary = `Depuis ${startNode.name}, ${dirPhrasesFr[steps[0].direction] || 'dirigez-vous vers'} ${endNode.name}.`;
    } else {
      summary = `Depuis ${startNode.name}, ${dirPhrasesFr[steps[0].direction] || 'suivez le parcours vers'} ${steps[0].toNodeName} pour rejoindre ${endNode.name}.`;
    }
  } else if (cleanLang === 'zh') {
    if (steps.length === 1) {
      summary = `从${startNode.name}出发，${dirPhrasesZh[steps[0].direction] || '前往'}${endNode.name}。`;
    } else {
      summary = `从${startNode.name}出发，经${steps[0].toNodeName}，即可到达${endNode.name}。`;
    }
  } else if (cleanLang === 'ja') {
    if (steps.length === 1) {
      summary = `${startNode.name}から${dirPhrasesJa[steps[0].direction] || ''}${endNode.name}へお進みください。`;
    } else {
      summary = `${startNode.name}から${steps[0].toNodeName}を経て${endNode.name}へお進みください。`;
    }
  } else {
    // Tiếng Việt chuẩn mực, hoàn toàn khớp với hình học thực tế
    if (steps.length === 1) {
      summary = `Từ ${startNode.name}, bạn ${dirPhrasesVi[steps[0].direction] || 'đi sang'} ${endNode.name}.`;
    } else if (steps.length === 2) {
      summary = `Từ ${startNode.name}, bạn ${dirPhrasesVi[steps[0].direction] || 'đi sang'} ${steps[0].toNodeName}, sau đó ${dirPhrasesVi[steps[1].direction] || 'đi tiếp sang'} ${endNode.name} là đến nơi.`;
    } else {
      summary = `Từ ${startNode.name}, bạn ${dirPhrasesVi[steps[0].direction] || 'đi sang'} ${steps[0].toNodeName}, tiếp tục đi qua ${steps[1].toNodeName}, sau đó đi tiếp để đến ${endNode.name}.`;
    }
  }

  return { steps, summary };
}

/**
 * Sinh file âm thanh Voice AI cho câu chỉ dẫn dẫn đường qua Google TTS Stream
 */
export async function generateNavTtsAudio(text: string, lang: string = 'vi'): Promise<string> {
  try {
    const cleanLang = (lang || 'vi').toLowerCase();
    const langMap: Record<string, string> = {
      vi: 'vi-VN',
      en: 'en-US',
      fr: 'fr-FR',
      zh: 'zh-CN',
      ja: 'ja-JP'
    };
    const googleLang = langMap[cleanLang] || cleanLang;

    const audioDir = path.join(process.cwd(), 'public', 'uploads', 'audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    const hash = crypto.createHash('md5').update(`${cleanLang}_${text.trim()}`).digest('hex');
    const filename = `nav_voice_${cleanLang}_${hash}.mp3`;
    const filePath = path.join(audioDir, filename);
    const publicUrl = `/uploads/audio/${filename}`;

    // Nếu đã tồn tại file cache âm thanh của câu này, trả về ngay
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 500) {
      return publicUrl;
    }

    const endpoints = [
      `https://translate.google.com/translate_tts?ie=UTF-8&tl=${googleLang}&client=tw-ob&q=${encodeURIComponent(text)}`,
      `https://translate.googleapis.com/translate_tts?ie=UTF-8&tl=${googleLang}&client=gtx&q=${encodeURIComponent(text)}`,
      `https://translate.google.com.vn/translate_tts?ie=UTF-8&tl=${googleLang}&client=tw-ob&q=${encodeURIComponent(text)}`
    ];

    for (const ttsUrl of endpoints) {
      try {
        const fetchAudio = await fetch(ttsUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Referer': 'https://translate.google.com/'
          },
          signal: AbortSignal.timeout(5000)
        });
        if (fetchAudio.ok) {
          const arrayBuf = await fetchAudio.arrayBuffer();
          if (arrayBuf.byteLength > 100) {
            fs.writeFileSync(filePath, Buffer.from(arrayBuf));
            return publicUrl;
          }
        }
      } catch (err: any) {
        console.warn(`[NavVoiceTTS fallback (${googleLang})]:`, err.message);
      }
    }
    return '';
  } catch (err: any) {
    console.warn('[NavVoiceTTS Error]:', err.message);
    return '';
  }
}
