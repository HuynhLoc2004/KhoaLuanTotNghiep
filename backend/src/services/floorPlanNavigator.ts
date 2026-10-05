import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { IFloorPlanMap, IFloorPlanNode, IFloorPlanEdge, SpatialDirection, CompassDirection } from '../models/FloorPlanMap.js';

const execFileAsync = promisify(execFile);

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
  let edges: IFloorPlanEdge[] = Array.isArray(map.edges) ? [...map.edges] : [];

  // Lọc bỏ các liên kết xuyên sảnh phi thực tế giữa Phòng 1, Phòng 17 và Phòng 18 (phải đi qua Sảnh Bát Giác)
  const isInvalidShortcut = (fromId: string, toId: string) => {
    const f = (fromId || '').toLowerCase();
    const t = (toId || '').toLowerCase();
    const isP1 = f.includes('p_01') || f.includes('p-01') || f.endsWith('_1') || f === '1';
    const isP17 = f.includes('p_17') || f.includes('p-17') || f.endsWith('_17') || f === '17';
    const isP18 = f.includes('p_18') || f.includes('p-18') || f.endsWith('_18') || f === '18';

    const targetIsP1 = t.includes('p_01') || t.includes('p-01') || t.endsWith('_1') || t === '1';
    const targetIsP17 = t.includes('p_17') || t.includes('p-17') || t.endsWith('_17') || t === '17';
    const targetIsP18 = t.includes('p_18') || t.includes('p-18') || t.endsWith('_18') || t === '18';

    if ((isP1 && targetIsP17) || (isP17 && targetIsP1)) return true;
    if ((isP1 && targetIsP18) || (isP18 && targetIsP1)) return true;
    if ((isP17 && targetIsP18) || (isP18 && targetIsP17)) return true;
    return false;
  };

  edges = edges.filter((e) => !isInvalidShortcut(e.fromNodeId, e.toNodeId));

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
    // Gian trung tâm (Phòng 18 - Phật giáo Châu Á):
    [5, 18, 'Vào Phòng 18 (Phật giáo Châu Á)'],
    [18, 12, 'Sang Phòng 12 (Thời Nguyễn)'],
    // Cổng 1, Cổng 2, Sảnh, Sân Vườn:
    ['node_cong_1', 'node_sanh', 'Vào thẳng Sảnh Bát Giác (Khu vực đón tiếp)'],
    ['node_cong_2', 6, 'Vào Phòng 6 (Cổng phụ Thảo Cầm Viên)'],
    ['node_sanh', 1, 'Sang Phòng 1 (Thời Tiền Sử)'],
    ['node_sanh', 17, 'Sang Phòng 17 (Dân tộc phía Nam)'],
    ['node_sanh', 18, 'Lên Phòng 18 (Phật giáo Châu Á)'],
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

export function calculateRelativeTurn(
  prevNode: IFloorPlanNode | null,
  currNode: IFloorPlanNode,
  nextNode: IFloorPlanNode
): {
  action: 'straight' | 'slight_right' | 'right' | 'sharp_right' | 'slight_left' | 'left' | 'sharp_left' | 'uturn';
  direction: SpatialDirection;
  compassDirection: CompassDirection;
  phraseVi: string;
} {
  const c2x = currNode.x + (currNode.width || 14) / 2;
  const c2y = currNode.y + (currNode.height || 7.5) / 2;
  const c3x = nextNode.x + (nextNode.width || 14) / 2;
  const c3y = nextNode.y + (nextNode.height || 7.5) / 2;

  const dx2 = c3x - c2x;
  const dy2 = c3y - c2y;
  const heading2 = (Math.atan2(dy2, dx2) * 180) / Math.PI;

  const degMap = (heading2 + 360) % 360;
  let mapDir: SpatialDirection = 'front';
  let compDir: CompassDirection = 'north';

  if (degMap >= 337.5 || degMap < 22.5) {
    mapDir = 'right';
    compDir = 'east';
  } else if (degMap >= 22.5 && degMap < 67.5) {
    mapDir = 'southeast';
    compDir = 'southeast';
  } else if (degMap >= 67.5 && degMap < 112.5) {
    mapDir = 'down';
    compDir = 'south';
  } else if (degMap >= 112.5 && degMap < 157.5) {
    mapDir = 'southwest';
    compDir = 'southwest';
  } else if (degMap >= 157.5 && degMap < 202.5) {
    mapDir = 'left';
    compDir = 'west';
  } else if (degMap >= 202.5 && degMap < 247.5) {
    mapDir = 'northwest';
    compDir = 'northwest';
  } else if (degMap >= 247.5 && degMap < 292.5) {
    mapDir = 'up';
    compDir = 'north';
  } else {
    mapDir = 'northeast';
    compDir = 'northeast';
  }

  if (!prevNode) {
    if (mapDir === 'up') {
      return { action: 'straight', direction: mapDir, compassDirection: compDir, phraseVi: 'đi thẳng về phía trước sang' };
    } else if (mapDir === 'right') {
      return { action: 'right', direction: mapDir, compassDirection: compDir, phraseVi: 'rẽ phải sang' };
    } else if (mapDir === 'left') {
      return { action: 'left', direction: mapDir, compassDirection: compDir, phraseVi: 'rẽ trái sang' };
    } else if (mapDir === 'down') {
      return { action: 'straight', direction: mapDir, compassDirection: compDir, phraseVi: 'đi xuống phía dưới sang' };
    } else if (mapDir.includes('right')) {
      return { action: 'slight_right', direction: mapDir, compassDirection: compDir, phraseVi: 'chếch sang bên phải sang' };
    } else {
      return { action: 'slight_left', direction: mapDir, compassDirection: compDir, phraseVi: 'chếch sang bên trái sang' };
    }
  }

  const c1x = prevNode.x + (prevNode.width || 14) / 2;
  const c1y = prevNode.y + (prevNode.height || 7.5) / 2;
  const dx1 = c2x - c1x;
  const dy1 = c2y - c1y;
  const heading1 = (Math.atan2(dy1, dx1) * 180) / Math.PI;

  const delta = ((heading2 - heading1 + 180) % 360 + 360) % 360 - 180;

  if (Math.abs(delta) <= 35) {
    return { action: 'straight', direction: mapDir, compassDirection: compDir, phraseVi: 'tiếp tục đi thẳng sang' };
  } else if (delta > 35 && delta <= 65) {
    return { action: 'slight_right', direction: mapDir, compassDirection: compDir, phraseVi: 'chếch sang bên phải sang' };
  } else if (delta > 65 && delta <= 125) {
    return { action: 'right', direction: mapDir, compassDirection: compDir, phraseVi: 'rẽ phải sang' };
  } else if (delta > 125 && delta <= 165) {
    return { action: 'sharp_right', direction: mapDir, compassDirection: compDir, phraseVi: 'cua gắt sang bên phải sang' };
  } else if (delta >= -65 && delta < -35) {
    return { action: 'slight_left', direction: mapDir, compassDirection: compDir, phraseVi: 'chếch sang bên trái sang' };
  } else if (delta >= -125 && delta < -65) {
    return { action: 'left', direction: mapDir, compassDirection: compDir, phraseVi: 'rẽ trái sang' };
  } else if (delta >= -165 && delta < -125) {
    return { action: 'sharp_left', direction: mapDir, compassDirection: compDir, phraseVi: 'cua gắt sang bên trái sang' };
  } else {
    return { action: 'uturn', direction: mapDir, compassDirection: compDir, phraseVi: 'quay ngược đầu lại sang' };
  }
}

/**
 * Gọi mô-đun Python AI Navigation Worker thực thi trực tiếp
 */
export async function runPythonFloorPlanNavigator(
  startId: string,
  endId: string,
  lang: string = 'vi'
): Promise<any | null> {
  const candidatePaths = [
    path.join(process.cwd(), 'stitching_worker', 'floorplan_topology_analyzer.py'),
    path.join(process.cwd(), '..', 'stitching_worker', 'floorplan_topology_analyzer.py'),
    path.resolve(process.cwd(), '..', 'stitching_worker', 'floorplan_topology_analyzer.py')
  ];
  const pyScript = candidatePaths.find((p) => fs.existsSync(p));
  if (!pyScript) return null;

  try {
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const { stdout } = await execFileAsync(pythonCmd, [
      pyScript,
      '--start',
      startId,
      '--end',
      endId,
      '--lang',
      lang,
      '--json'
    ], { timeout: 10000, maxBuffer: 5 * 1024 * 1024 });

    const data = JSON.parse(stdout);
    if (data && data.pathNodeIds && data.pathNodeIds.length > 0) {
      return data;
    }
  } catch (err: any) {
    console.warn('[FloorPlanNavigator] Python worker exception:', err.message);
  }
  return null;
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
  const actionDetails: { action: string; phrase: string }[] = [];

  for (let i = 0; i < rawSteps.length; i++) {
    const edge = rawSteps[i];
    const fromNode = nodeMap.get(edge.fromNodeId);
    const toNode = nodeMap.get(edge.toNodeId);
    const prevNode = i > 0 ? nodeMap.get(rawSteps[i - 1].fromNodeId) || null : null;

    const fromName = fromNode ? fromNode.name : edge.fromNodeId;
    const toName = toNode ? toNode.name : edge.toNodeId;

    let action = 'straight';
    let effectiveDir: SpatialDirection = edge.direction || 'front';
    let effectiveComp: CompassDirection = edge.compassDirection || 'north';
    let phraseVi = 'đi sang';

    if (fromNode && toNode) {
      const turn = calculateRelativeTurn(prevNode, fromNode, toNode);
      action = turn.action;
      effectiveDir = turn.direction;
      effectiveComp = turn.compassDirection;
      phraseVi = turn.phraseVi;
    }

    actionDetails.push({ action, phrase: phraseVi });

    let instruction = '';
    if (cleanLang === 'en') {
      const actEnMap: Record<string, string> = {
        straight: 'proceed straight to',
        right: 'turn right into',
        left: 'turn left into',
        slight_right: 'bear right towards',
        slight_left: 'bear left towards',
        sharp_right: 'sharp right into',
        sharp_left: 'sharp left into',
        uturn: 'turn around towards'
      };
      instruction = `Step ${i + 1}: From ${fromName}, ${actEnMap[action] || 'proceed to'} ${toName}.`;
    } else {
      instruction = `Bước ${i + 1}: Từ ${fromName}, bạn ${phraseVi} ${toName}.`;
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

  // Tóm tắt thuyết minh Voice AI: mô tả đầy đủ mọi bước chuyển hướng, không bao giờ dùng "sau đó đi tiếp để đến..."
  let summary = '';
  const n = steps.length;

  if (n === 0) {
    summary = cleanLang === 'en' ? 'You are already at your destination.' : 'Quý khách đã ở đúng vị trí cần đến.';
  } else if (cleanLang === 'en') {
    if (n === 1) {
      summary = `From ${startNode.name}, please proceed to ${endNode.name}.`;
    } else if (n === 2) {
      summary = `From ${startNode.name}, please go to ${steps[0].toNodeName}, then head to ${endNode.name}.`;
    } else {
      const parts = steps.map((s) => `${s.toNodeName}`);
      summary = `From ${startNode.name}, head through ${parts.slice(0, -1).join(', ')}, and enter ${endNode.name} to arrive.`;
    }
  } else {
    // Tiếng Việt chuẩn mực di sản
    if (n === 1) {
      summary = `Từ ${startNode.name}, bạn ${actionDetails[0].phrase} ${endNode.name} là đến nơi.`;
    } else if (n === 2) {
      summary = `Từ ${startNode.name}, bạn ${actionDetails[0].phrase} ${steps[0].toNodeName}, sau đó ${actionDetails[1].phrase} ${endNode.name} là đến nơi.`;
    } else if (n === 3) {
      summary = `Từ ${startNode.name}, bạn ${actionDetails[0].phrase} ${steps[0].toNodeName}, tiếp tục ${actionDetails[1].phrase} ${steps[1].toNodeName}, rồi ${actionDetails[2].phrase} ${endNode.name} là đến nơi.`;
    } else {
      const clauses: string[] = [];
      let idx = 0;
      while (idx < n) {
        const curr = actionDetails[idx];
        if (curr.action === 'straight' && idx + 1 < n && actionDetails[idx + 1].action === 'straight') {
          clauses.push(`đi thẳng qua ${steps[idx].toNodeName} và ${steps[idx + 1].toNodeName}`);
          idx += 2;
        } else {
          clauses.push(`${curr.phrase} ${steps[idx].toNodeName}`);
          idx += 1;
        }
      }

      if (clauses.length >= 3) {
        const p1 = clauses[0];
        const pMid = clauses.slice(1, -1).join(', ');
        const pLast = clauses[clauses.length - 1];
        summary = `Từ ${startNode.name}, bạn ${p1}, sau đó ${pMid}, rồi ${pLast} là đến nơi.`;
      } else {
        summary = `Từ ${startNode.name}, bạn ` + clauses.join(', sau đó ') + ' là đến nơi.';
      }
    }
  }

  return { steps, summary };
}

/**
 * Chia một văn bản dài thành các đoạn nhỏ dưới 140 ký tự (theo dấu chấm, dấu phẩy hoặc khoảng trắng)
 * để đảm bảo Google Translate TTS không bao giờ bị lỗi 400 Bad Request
 */
function splitTextIntoTtsChunks(text: string, maxLen: number = 140): string[] {
  const clean = text.trim();
  if (clean.length <= maxLen) return [clean];

  const parts = clean.split(/([.,;!?]+|\s+sau đó\s+|\s+rồi\s+)/i);
  const chunks: string[] = [];
  let current = '';

  for (const part of parts) {
    if (!part) continue;
    if ((current + part).length <= maxLen) {
      current += part;
    } else {
      if (current.trim()) chunks.push(current.trim());
      if (part.length <= maxLen) {
        current = part;
      } else {
        const words = part.split(/\s+/);
        for (const w of words) {
          if ((current + ' ' + w).length <= maxLen) {
            current += (current ? ' ' : '') + w;
          } else {
            if (current.trim()) chunks.push(current.trim());
            current = w;
          }
        }
      }
    }
  }
  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks.length > 0 ? chunks : [clean.slice(0, maxLen)];
}

/**
 * Sinh file âm thanh Voice AI cho câu chỉ dẫn dẫn đường qua Google TTS Stream
 */
export async function generateNavTtsAudio(text: string, lang: string = 'vi'): Promise<string> {
  try {
    const cleanLang = (lang || 'vi').toLowerCase();
    const langMap: Record<string, string> = {
      vi: 'vi',
      en: 'en',
      fr: 'fr',
      zh: 'zh-CN',
      ja: 'ja'
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

    // Google Translate TTS giới hạn mỗi request dưới 150 ký tự, do đó chia nhỏ và ghép buffer MP3 lại
    const chunks = splitTextIntoTtsChunks(text, 140);
    const chunkBuffers: Buffer[] = [];

    for (const chunk of chunks) {
      if (!chunk.trim()) continue;
      const endpoints = [
        `https://translate.google.com/translate_tts?ie=UTF-8&tl=${googleLang}&client=tw-ob&q=${encodeURIComponent(chunk)}`,
        `https://translate.googleapis.com/translate_tts?ie=UTF-8&tl=${googleLang}&client=gtx&q=${encodeURIComponent(chunk)}`,
        `https://translate.google.com.vn/translate_tts?ie=UTF-8&tl=${googleLang}&client=tw-ob&q=${encodeURIComponent(chunk)}`
      ];

      let chunkOk = false;
      for (const ttsUrl of endpoints) {
        try {
          const fetchAudio = await fetch(ttsUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Referer': 'https://translate.google.com/'
            },
            signal: AbortSignal.timeout(6000)
          });
          if (fetchAudio.ok) {
            const arrayBuf = await fetchAudio.arrayBuffer();
            if (arrayBuf.byteLength > 100) {
              chunkBuffers.push(Buffer.from(arrayBuf));
              chunkOk = true;
              break;
            }
          }
        } catch (err: any) {
          // Thử endpoint tiếp theo
        }
      }
      if (!chunkOk) {
        console.warn(`[NavVoiceTTS Warning] Không tải được chunk: "${chunk.slice(0, 30)}..."`);
      }
    }

    if (chunkBuffers.length > 0) {
      const merged = Buffer.concat(chunkBuffers);
      fs.writeFileSync(filePath, merged);
      return publicUrl;
    }

    return '';
  } catch (err: any) {
    console.warn('[NavVoiceTTS Error]:', err.message);
    return '';
  }
}
