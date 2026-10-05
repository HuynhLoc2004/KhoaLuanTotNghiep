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
