import { createApp } from "./app.js";

const app = createApp();
const PORT = process.env["PORT"] ? parseInt(process.env["PORT"], 10) : 3000;
const HOST = process.env["HOST"] || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`[API] HCMC Museum Digital Experience API server running at http://localhost:${PORT}`);
  console.log(`[API] Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`[API] 3D Scenes API: http://localhost:${PORT}/api/v1/3d/scenes`);
  console.log(`[API] Search API: http://localhost:${PORT}/api/v1/search`);
  console.log(`[API] Auth Config API: http://localhost:${PORT}/api/v1/auth/config`);
  console.log(`[API] AI Guide API: http://localhost:${PORT}/api/v1/ai/guide/query`);
});
