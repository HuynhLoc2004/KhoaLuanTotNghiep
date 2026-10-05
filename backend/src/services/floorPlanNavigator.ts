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

/**
 * Xây dựng danh sách kề toàn diện cho bản đồ
 */
function buildAdjacencyList(nodes: IFloorPlanNode[], edges: IFloorPlanEdge[]): Map<string, InternalEdge[]> {
  const adj = new Map<string, InternalEdge[]>();
  nodes.forEach((n) => adj.set(n.id, []));

  // Thêm các cạnh có sẵn và tự động bổ sung cạnh ngược nếu chưa có
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
 * Thuật toán Dijkstra tìm đường ngắn nhất trên đồ thị liên kết sơ đồ mặt bằng
 */
export function findShortestPath(
  map: IFloorPlanMap,
  startNodeIdRaw: string,
  endNodeIdRaw: string
): { pathNodeIds: string[]; pathEdgeIds: string[]; rawSteps: InternalEdge[]; totalDistance: number } | null {
  const nodes = map.nodes || [];
  const edges = map.edges || [];
  const startNodeId = resolveNodeId(nodes, startNodeIdRaw) || startNodeIdRaw;
  const endNodeId = resolveNodeId(nodes, endNodeIdRaw) || endNodeIdRaw;
  const adj = buildAdjacencyList(nodes, edges);

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

  // Simple Priority Queue
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

      const weight = edge.distance > 0 ? edge.distance : 10;
      const newDist = currDist + weight;

      if (newDist < (distances.get(edge.toNodeId) ?? Infinity)) {
        distances.set(edge.toNodeId, newDist);
        previous.set(edge.toNodeId, currId);
        prevEdge.set(edge.toNodeId, edge);
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

  return {
    pathNodeIds,
    pathEdgeIds,
    rawSteps,
    totalDistance: Math.round((distances.get(endNodeId) || 0) * 10) / 10
  };
}

/**
 * Sinh chỉ dẫn từng bước ngắn gọn, chuẩn ngữ pháp đa ngôn ngữ
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
    back: 'quay lại',
    northeast: 'chếch sang phải lên',
    northwest: 'chếch sang trái lên',
    southeast: 'chếch sang phải xuống',
    southwest: 'chếch sang trái xuống',
    center: 'đi vào khu trung tâm'
  };

  const dirPhrasesEn: Record<string, string> = {
    left: 'turn left into',
    right: 'turn right into',
    up: 'proceed straight to',
    down: 'head south to',
    front: 'proceed straight to',
    back: 'turn back to',
    northeast: 'turn northeast towards',
    northwest: 'turn northwest towards',
    southeast: 'turn southeast towards',
    southwest: 'turn southwest towards',
    center: 'enter the central area of'
  };

  for (let i = 0; i < rawSteps.length; i++) {
    const edge = rawSteps[i];
    const fromNode = nodeMap.get(edge.fromNodeId);
    const toNode = nodeMap.get(edge.toNodeId);
    const fromName = fromNode ? fromNode.name : edge.fromNodeId;
    const toName = toNode ? toNode.name : edge.toNodeId;

    let instruction = '';
    if (cleanLang === 'en') {
      const act = dirPhrasesEn[edge.direction] || 'proceed to';
      instruction = `Step ${i + 1}: From ${fromName}, ${act} ${toName}.`;
    } else if (cleanLang === 'fr') {
      instruction = `Étape ${i + 1}: Depuis ${fromName}, dirigez-vous vers ${toName}.`;
    } else if (cleanLang === 'zh') {
      instruction = `第${i + 1}步：从${fromName}出发，前往${toName}。`;
    } else if (cleanLang === 'ja') {
      instruction = `ステップ ${i + 1}：${fromName}から${toName}へ進みます。`;
    } else {
      const act = dirPhrasesVi[edge.direction] || 'đi sang';
      instruction = `Bước ${i + 1}: Từ ${fromName}, bạn ${act} ${toName}.`;
    }

    steps.push({
      stepNumber: i + 1,
      fromNodeId: edge.fromNodeId,
      fromNodeName: fromName,
      toNodeId: edge.toNodeId,
      toNodeName: toName,
      direction: edge.direction,
      compassDirection: edge.compassDirection,
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
      summary = `From ${startNode.name}, ${dirPhrasesEn[steps[0].direction] || 'proceed to'} ${steps[0].toNodeName}, then ${dirPhrasesEn[steps[1].direction] || 'continue to'} ${endNode.name}.`;
    } else {
      summary = `From ${startNode.name}, ${dirPhrasesEn[steps[0].direction] || 'proceed to'} ${steps[0].toNodeName}, pass through ${steps[1].toNodeName}, then continue to ${endNode.name}.`;
    }
  } else if (cleanLang === 'fr') {
    summary = `Depuis ${startNode.name}, suivez l'itinéraire fléché pour rejoindre ${endNode.name}.`;
  } else if (cleanLang === 'zh') {
    summary = `从${startNode.name}出发，按指示路线即可到达${endNode.name}。`;
  } else if (cleanLang === 'ja') {
    summary = `${startNode.name}から案内ルートに従い、${endNode.name}へお進みください。`;
  } else {
    // Tiếng Việt chuẩn mực, súc tích
    if (steps.length === 1) {
      summary = `Từ ${startNode.name}, bạn ${dirPhrasesVi[steps[0].direction] || 'đi sang'} ${endNode.name}.`;
    } else if (steps.length === 2) {
      summary = `Từ ${startNode.name}, bạn ${dirPhrasesVi[steps[0].direction] || 'đi sang'} ${steps[0].toNodeName}, sau đó ${dirPhrasesVi[steps[1].direction] || 'đi tiếp sang'} ${endNode.name} là đến nơi.`;
    } else {
      summary = `Từ ${startNode.name}, bạn ${dirPhrasesVi[steps[0].direction] || 'đi sang'} ${steps[0].toNodeName}, đi qua ${steps[1].toNodeName}, sau đó tiếp tục đi để đến ${endNode.name}.`;
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
