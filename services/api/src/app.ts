import express from "express";
import type { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { correlationIdMiddleware } from "./middleware/correlationId.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { healthRouter } from "./routes/health.js";
import { timelineRouter } from "./routes/timeline.js";
import { searchRouter } from "./routes/search.js";
import { authRouter } from "./routes/auth.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { aiRouter } from "./routes/ai.js";
import { threeRouter } from "./routes/three.js";
import { voiceRouter } from "./routes/voice.js";

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(correlationIdMiddleware);

  app.use(healthRouter);
  app.use(timelineRouter);
  app.use(searchRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/dashboard", dashboardRouter);
  app.use("/api/v1/ai", aiRouter);
  app.use("/api/v1/3d", threeRouter);
  app.use("/api/v1/voice", voiceRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
