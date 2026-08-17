import assert from "node:assert/strict";
import test from "node:test";
import {
  ThreeDModelConfigSchema,
  ThreeDRouteRequestSchema,
  ThreeDRouteResponseSchema,
} from "../src/index.js";

void test("ThreeDModelConfigSchema validates model config with hotspots", () => {
  const validPayload = {
    artifactCode: "ART-DS-001",
    title: "Trống Đồng Đông Sơn 3D Digital Twin",
    modelUrl: "https://cdn.hcmc-museum.gov.vn/3d/trong-dong.glb",
    cameraPreset: {
      position: [0, 2, 5] as [number, number, number],
      target: [0, 0, 0] as [number, number, number],
      fov: 45,
    },
    hotspots: [
      {
        id: "H01",
        title: "Hoa văn Ngôi sao 14 cánh",
        description: "Biểu tượng mặt trời và quyền lực của thủ lĩnh Lạc Việt",
        position: [0, 1.2, 0] as [number, number, number],
      },
    ],
    spatialDepthTheme: "emerald-gold-3d",
  };

  const parsed = ThreeDModelConfigSchema.parse(validPayload);
  assert.equal(parsed.artifactCode, "ART-DS-001");
  assert.equal(parsed.hotspots.length, 1);
});

void test("ThreeDRouteRequestSchema and ResponseSchema validate A* route calculation", () => {
  const requestPayload = {
    startNodeId: "N01_ENTRANCE",
    targetNodeId: "N08_ANCIENT_HALL",
    wheelchairAccessible: true,
  };

  const parsedRequest = ThreeDRouteRequestSchema.parse(requestPayload);
  assert.equal(parsedRequest.startNodeId, "N01_ENTRANCE");

  const responsePayload = {
    pathNodeIds: ["N01_ENTRANCE", "N04_HALLWAY", "N08_ANCIENT_HALL"],
    totalDistanceMeters: 45,
    estimatedMinutes: 2,
    stepsInstruction: ["Đi thẳng 15m qua sảnh chính", "Rẽ trái tại lối vào khu di sản cổ vật"],
  };

  const parsedResponse = ThreeDRouteResponseSchema.parse(responsePayload);
  assert.equal(parsedResponse.pathNodeIds.length, 3);
  assert.equal(parsedResponse.totalDistanceMeters, 45);
});
