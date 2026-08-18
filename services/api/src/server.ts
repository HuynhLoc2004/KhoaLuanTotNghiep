import { createApp } from "./app.js";

const app = createApp();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const HOST = process.env.HOST ?? "0.0.0.0";
const portStr = String(PORT);

const server = app.listen(PORT, HOST, () => {
  console.log(
    `[API] HCMC Museum Digital Experience API server running at http://localhost:${portStr}`,
  );
  console.log(`[API] Health check: http://localhost:${portStr}/api/v1/health`);
  console.log(`[API] 3D Scenes API: http://localhost:${portStr}/api/v1/3d/scenes`);
  console.log(`[API] Search API: http://localhost:${portStr}/api/v1/search`);
  console.log(`[API] Auth Config API: http://localhost:${portStr}/api/v1/auth/config`);
  console.log(`[API] AI Guide API: http://localhost:${portStr}/api/v1/ai/guide/query`);
});

const handleShutdown = (signal: string): void => {
  console.log(`\n[API] Received ${signal}. Shutting down API server gracefully...`);
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
