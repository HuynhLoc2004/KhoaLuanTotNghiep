import express from "express";
import type { ThreeDModelConfig, ThreeDFloorPoi } from "@hcmc-museum/contracts";
import {
  renderWebShellPage,
  getSampleMuseumPagePayload,
  renderPublic3DExperiencePage,
  renderPublicSearchPage,
  renderPublicAiGuidePage,
  renderPublicProfilePage,
  renderLivingTimelinePage,
  renderPublicVoicePage,
  renderPublicRecognitionPage,
} from "./index.js";

const app = express();
app.use(express.static("public"));
const PORT = process.env.WEB_PORT ? parseInt(process.env.WEB_PORT, 10) : 3001;
const HOST = process.env.HOST ?? "0.0.0.0";
const portStr = String(PORT);

const sampleModelConfig: ThreeDModelConfig = {
  artifactCode: "ART-DS-001",
  title: "Trống Đồng Đông Sơn 3D Digital Twin",
  modelUrl: "https://cdn.hcmc-museum.gov.vn/3d/trong-dong.glb",
  cameraPreset: { position: [0, 2, 5], target: [0, 0, 0], fov: 45 },
  hotspots: [
    {
      id: "H01",
      title: "Hoa văn Ngôi sao 14 cánh",
      description: "Biểu tượng Mặt trời Lạc Việt linh thiêng",
      position: [0, 1.2, 0],
    },
  ],
  spatialDepthTheme: "emerald-gold-3d",
};

const samplePois: ThreeDFloorPoi[] = [
  {
    nodeId: "N01_ENTRANCE",
    label: "Cổng Vào Chính Bảo Tàng",
    floorLevel: 1,
    coordinates: [0, 0],
  },
  {
    nodeId: "N02_LOBBY",
    label: "Sảnh Trung Tâm & Quầy Lễ Tân",
    floorLevel: 1,
    coordinates: [10, 0],
  },
  {
    nodeId: "N03_PREHISTORIC_HALL",
    label: "Phòng Trưng Bày Tiền Sử & Trống Đồng",
    floorLevel: 1,
    coordinates: [25, -10],
  },
];

app.get("/", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(renderWebShellPage(getSampleMuseumPagePayload()).html);
});

app.get("/3d-experience", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(renderPublic3DExperiencePage(sampleModelConfig, samplePois));
});

app.get("/search", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(renderPublicSearchPage());
});

app.get("/ai-guide", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(renderPublicAiGuidePage());
});

app.get("/profile", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(renderPublicProfilePage());
});

app.get("/timeline", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(renderLivingTimelinePage());
});

app.get("/voice", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(renderPublicVoicePage());
});

app.get("/recognize", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(renderPublicRecognitionPage());
});

const server = app.listen(PORT, HOST, () => {
  console.log(`[WEB] HCMC Museum Public Web App running at http://localhost:${portStr}`);
  console.log(`[WEB] Trang chủ: http://localhost:${portStr}/`);
  console.log(`[WEB] Trải nghiệm 3D Digital Twin: http://localhost:${portStr}/3d-experience`);
  console.log(`[WEB] Tìm kiếm di sản: http://localhost:${portStr}/search`);
  console.log(`[WEB] AI Thuyết minh viên: http://localhost:${portStr}/ai-guide`);
  console.log(`[WEB] Trang cá nhân: http://localhost:${portStr}/profile`);
  console.log(`[WEB] Dòng thời gian sống: http://localhost:${portStr}/timeline`);
  console.log(`[WEB] Nhận diện hiện vật bằng ảnh: http://localhost:${portStr}/recognize`);
});

const handleShutdown = (signal: string): void => {
  console.log(`\n[WEB] Received ${signal}. Shutting down Web server gracefully...`);
  server.close(() => {
    process.exit(0);
  });
  setTimeout(() => {
    process.exit(0);
  }, 300).unref();
};

process.on("SIGINT", () => {
  handleShutdown("SIGINT");
});
process.on("SIGTERM", () => {
  handleShutdown("SIGTERM");
});
