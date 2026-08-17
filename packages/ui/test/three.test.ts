import assert from "node:assert/strict";
import test from "node:test";
import {
  render3DHotspotOverlay,
  render3DOrbitControlsBar,
  render3DFloorNavPanel,
  render3DModelViewer,
} from "../src/index.js";
import type { ThreeDModelConfig, ThreeDFloorPoi } from "@hcmc-museum/contracts";

void test("render3DHotspotOverlay renders pins and glassmorphism cards", () => {
  const hotspots = [
    {
      id: "H01",
      title: "Hoa văn Ngôi sao",
      description: "Mặt trời rực rỡ",
      position: [0, 1, 0] as [number, number, number],
    },
  ];

  const html = render3DHotspotOverlay(hotspots);
  assert.ok(html.includes("spatial-3d-hotspot-pin"));
  assert.ok(html.includes("Hoa văn Ngôi sao"));
});

void test("render3DOrbitControlsBar renders control buttons", () => {
  const html = render3DOrbitControlsBar();
  assert.ok(html.includes("spatial-3d-controls-bar-glass"));
  assert.ok(html.includes("rotate-left"));
  assert.ok(html.includes("reset-camera"));
});

void test("render3DFloorNavPanel renders select options and calculate button", () => {
  const pois: ThreeDFloorPoi[] = [
    { nodeId: "N01", label: "Cổng Vào", floorLevel: 1, coordinates: [0, 0] },
    { nodeId: "N02", label: "Sảnh Chính", floorLevel: 1, coordinates: [10, 0] },
  ];

  const html = render3DFloorNavPanel(pois);
  assert.ok(html.includes("select-start-node"));
  assert.ok(html.includes("btn-calculate-3d-route"));
  assert.ok(html.includes("Cổng Vào (Tầng 1)"));
});

void test("render3DModelViewer renders full 3D experience container", () => {
  const config: ThreeDModelConfig = {
    artifactCode: "ART-DS-001",
    title: "Trống Đồng 3D",
    modelUrl: "https://cdn.hcmc-museum.gov.vn/3d/trong-dong.glb",
    cameraPreset: { position: [0, 1, 3], target: [0, 0, 0], fov: 45 },
    hotspots: [],
    spatialDepthTheme: "emerald-gold-3d",
  };

  const pois: ThreeDFloorPoi[] = [
    { nodeId: "N01", label: "Cổng Vào", floorLevel: 1, coordinates: [0, 0] },
  ];

  const html = render3DModelViewer(config, pois);
  assert.ok(html.includes("spatial-3d-experience-container"));
  assert.ok(html.includes("webgl-3d-viewport"));
  assert.ok(html.includes("Trống Đồng 3D"));
});
