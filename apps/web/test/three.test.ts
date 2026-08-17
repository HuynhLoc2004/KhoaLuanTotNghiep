import assert from "node:assert/strict";
import test from "node:test";
import { renderPublic3DExperiencePage } from "../src/index.js";
import type { ThreeDModelConfig, ThreeDFloorPoi } from "@hcmc-museum/contracts";

void test("renderPublic3DExperiencePage renders full HTML document with header, 3D viewer and footer", () => {
  const config: ThreeDModelConfig = {
    artifactCode: "ART-DS-001",
    title: "Trống Đồng Đông Sơn 3D Digital Twin",
    modelUrl: "https://cdn.hcmc-museum.gov.vn/3d/trong-dong.glb",
    cameraPreset: { position: [0, 2, 5], target: [0, 0, 0], fov: 45 },
    hotspots: [
      {
        id: "H01",
        title: "Hoa văn Ngôi sao 14 cánh",
        description: "Mặt trời Lạc Việt",
        position: [0, 1.2, 0],
      },
    ],
    spatialDepthTheme: "emerald-gold-3d",
  };

  const pois: ThreeDFloorPoi[] = [
    { nodeId: "N01", label: "Cổng Vào", floorLevel: 1, coordinates: [0, 0] },
  ];

  const html = renderPublic3DExperiencePage(config, pois);

  assert.ok(html.includes("<!DOCTYPE html>"));
  assert.ok(html.includes("Trống Đồng Đông Sơn 3D Digital Twin"));
  assert.ok(html.includes("spatial-3d-experience-container"));
  assert.ok(html.includes("Hoa văn Ngôi sao 14 cánh"));
  assert.ok(html.includes("Bảo Tàng Lịch Sử TP.HCM"));
});
