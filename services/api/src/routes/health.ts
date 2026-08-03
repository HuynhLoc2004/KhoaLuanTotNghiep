import { Router } from "express";
import type { Request, Response } from "express";
import type { HealthStatusResponse } from "@hcmc-museum/contracts";

const startTime = Date.now();

export const healthRouter: Router = Router();

function getHealthStatus(): HealthStatusResponse {
  return {
    status: "ok",
    service: "@hcmc-museum/api",
    version: "0.0.0",
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
  };
}

healthRouter.get("/health", (_req: Request, res: Response) => {
  res.json(getHealthStatus());
});

healthRouter.get("/api/v1/health", (_req: Request, res: Response) => {
  res.json(getHealthStatus());
});
