import { Router } from "express";
import {
  ThreeDModelConfigSchema,
  ThreeDRouteRequestSchema,
  type ThreeDModelConfig,
  type ThreeDRouteResponse,
} from "@hcmc-museum/contracts";

export const threeRouter: Router = Router();

// Sample Museum 3D Digital Twin Models
const SAMPLE_3D_MODELS: Record<string, ThreeDModelConfig> = {
  "ART-DS-001": {
    artifactCode: "ART-DS-001",
    title: "Trống Đồng Đông Sơn 3D Digital Twin",
    modelUrl: "https://cdn.hcmc-museum.gov.vn/3d/trong-dong.glb",
    thumbnailUrl: "https://cdn.hcmc-museum.gov.vn/images/trong-dong.jpg",
    cameraPreset: {
      position: [0, 1.8, 4.5],
      target: [0, 0, 0],
      fov: 45,
    },
    hotspots: [
      {
        id: "H01",
        title: "Hoa văn Ngôi sao 14 cánh",
        description: "Biểu tượng mặt trời và quyền lực của thủ lĩnh Lạc Việt.",
        position: [0, 1.2, 0],
      },
      {
        id: "H02",
        title: "Hình ảnh Thuyền Đua & Chim Lạc",
        description: "Tái hiện đời sống sông nước và tín ngưỡng phồn vinh.",
        position: [0.8, 0.5, 0.8],
      },
    ],
    spatialDepthTheme: "emerald-gold-3d",
  },
  "ART-CM-002": {
    artifactCode: "ART-CM-002",
    title: "Ấn Vàng Sắc Mệnh Chi Bảo 3D",
    modelUrl: "https://cdn.hcmc-museum.gov.vn/3d/an-vang.glb",
    thumbnailUrl: "https://cdn.hcmc-museum.gov.vn/images/an-vang.jpg",
    cameraPreset: {
      position: [0, 2.0, 3.8],
      target: [0, 0.2, 0],
      fov: 40,
    },
    hotspots: [
      {
        id: "H03",
        title: "Hình Tượng Rồng Đúc Nổi",
        description: "Chạm khắc tinh xảo rồng 5 móng thời Nguyễn.",
        position: [0, 0.9, 0],
      },
    ],
    spatialDepthTheme: "imperial-gold-3d",
  },
};

// Indoor Map Graph Definition for A* Routing
interface GraphNode {
  id: string;
  label: string;
  floorLevel: number;
  x: number;
  y: number;
  neighbors: { nodeId: string; distance: number }[];
}

const MUSEUM_MAP_GRAPH: Record<string, GraphNode> = {
  N01_ENTRANCE: {
    id: "N01_ENTRANCE",
    label: "Cổng Vào Chính Bảo Tàng",
    floorLevel: 1,
    x: 0,
    y: 0,
    neighbors: [{ nodeId: "N02_LOBBY", distance: 10 }],
  },
  N02_LOBBY: {
    id: "N02_LOBBY",
    label: "Sảnh Trung Tâm & Quầy Lễ Tân",
    floorLevel: 1,
    x: 10,
    y: 0,
    neighbors: [
      { nodeId: "N01_ENTRANCE", distance: 10 },
      { nodeId: "N03_PREHISTORIC_HALL", distance: 15 },
      { nodeId: "N04_ANCIENT_HALL", distance: 20 },
    ],
  },
  N03_PREHISTORIC_HALL: {
    id: "N03_PREHISTORIC_HALL",
    label: "Phòng Trưng Bày Tiền Sử & Trống Đồng",
    floorLevel: 1,
    x: 25,
    y: -10,
    neighbors: [
      { nodeId: "N02_LOBBY", distance: 15 },
      { nodeId: "N04_ANCIENT_HALL", distance: 12 },
    ],
  },
  N04_ANCIENT_HALL: {
    id: "N04_ANCIENT_HALL",
    label: "Phòng Triều Đại Phong Kiến & Ấn Vàng",
    floorLevel: 1,
    x: 30,
    y: 10,
    neighbors: [
      { nodeId: "N02_LOBBY", distance: 20 },
      { nodeId: "N03_PREHISTORIC_HALL", distance: 12 },
    ],
  },
};

// Simple A* / Dijkstra Graph Navigation Implementation
function calculateShortestPath(startId: string, targetId: string): ThreeDRouteResponse | null {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  for (const nodeId of Object.keys(MUSEUM_MAP_GRAPH)) {
    distances[nodeId] = Infinity;
    previous[nodeId] = null;
    unvisited.add(nodeId);
  }

  if (MUSEUM_MAP_GRAPH[startId]) {
    distances[startId] = 0;
  }

  while (unvisited.size > 0) {
    let currentId: string | null = null;
    let shortestDist = Infinity;

    for (const nodeId of unvisited) {
      if ((distances[nodeId] ?? Infinity) < shortestDist) {
        shortestDist = distances[nodeId] ?? Infinity;
        currentId = nodeId;
      }
    }

    if (!currentId || shortestDist === Infinity) {
      break;
    }

    if (currentId === targetId) {
      break;
    }

    unvisited.delete(currentId);
    const currentNode = MUSEUM_MAP_GRAPH[currentId];

    if (!currentNode) {
      continue;
    }

    for (const neighbor of currentNode.neighbors) {
      if (unvisited.has(neighbor.nodeId)) {
        const alt = (distances[currentId] ?? 0) + neighbor.distance;
        if (alt < (distances[neighbor.nodeId] ?? Infinity)) {
          distances[neighbor.nodeId] = alt;
          previous[neighbor.nodeId] = currentId;
        }
      }
    }
  }

  if (distances[targetId] === Infinity) {
    return null;
  }

  const path: string[] = [];
  let curr: string | null = targetId;
  while (curr) {
    path.unshift(curr);
    curr = previous[curr] ?? null;
  }

  const totalDistance = distances[targetId] ?? 0;
  const estimatedMinutes = Math.max(1, Math.round(totalDistance / 30));

  const stepsInstruction = path.map((nodeId, idx) => {
    const node = MUSEUM_MAP_GRAPH[nodeId];
    const name = node !== undefined ? node.label : nodeId;
    if (idx === 0) return `Xuất phát từ ${name}`;
    if (idx === path.length - 1) return `Đã đến điểm hẹn ${name}`;
    return `Di chuyển tiếp đến ${name}`;
  });

  return {
    pathNodeIds: path,
    totalDistanceMeters: totalDistance,
    estimatedMinutes,
    stepsInstruction,
  };
}

threeRouter.get("/scenes", (_req, res) => {
  res.status(200).json({
    scenes: [
      {
        id: "SCENE_MAIN_EXHIBIT",
        title: "Khu Trưng Bày Trung Tâm 3D",
        floorLevel: 1,
        defaultModelCode: "ART-DS-001",
      },
    ],
    pois: Object.values(MUSEUM_MAP_GRAPH).map((n) => ({
      nodeId: n.id,
      label: n.label,
      floorLevel: n.floorLevel,
      coordinates: [n.x, n.y] as [number, number],
    })),
  });
});

threeRouter.get("/models/:code", (req, res) => {
  const code = req.params.code;
  const modelConfig = SAMPLE_3D_MODELS[code];

  if (!modelConfig) {
    res.status(404).json({
      error: {
        code: "MODEL_NOT_FOUND",
        message: `3D model artifact code '${code}' not found`,
      },
    });
    return;
  }

  const parseResult = ThreeDModelConfigSchema.safeParse(modelConfig);
  if (!parseResult.success) {
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Invalid internal 3D model config schema",
      },
    });
    return;
  }

  res.status(200).json(parseResult.data);
});

threeRouter.post("/route/calculate", (req, res) => {
  const parseResult = ThreeDRouteRequestSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid A* 3D route calculation payload",
        details: parseResult.error.issues,
      },
    });
    return;
  }

  const { startNodeId, targetNodeId } = parseResult.data;
  const routeResult = calculateShortestPath(startNodeId, targetNodeId);

  if (!routeResult) {
    res.status(404).json({
      error: {
        code: "ROUTE_NOT_FOUND",
        message: `No accessible 3D route found between ${startNodeId} and ${targetNodeId}`,
      },
    });
    return;
  }

  res.status(200).json(routeResult);
});
