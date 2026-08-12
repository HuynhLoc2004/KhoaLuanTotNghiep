import { Router, type Request, type Response } from "express";
import type { DashboardSummaryResponse } from "@hcmc-museum/contracts";

export const dashboardRouter: Router = Router();

// Sample pre-aggregated summary metrics for Museum Analytics MVP
authSummaryData();

function authSummaryData(): DashboardSummaryResponse {
  return {
    metrics: {
      totalVisitors: 28450,
      activeExhibitions: 12,
      totalArtifacts: 3450,
      qrScansTotal: 9820,
      aiGuideQueriesCount: 4120,
      periodLabel: "Tháng 8 / 2026",
    },
    topArtifacts: [
      {
        artifactId: "art-ds-01",
        code: "ART-DS-001",
        title: "Trống Đồng Đông Sơn",
        viewsCount: 5420,
        bookmarksCount: 1420,
        category: "Cổ vật Đông Sơn",
      },
      {
        artifactId: "art-nguyen-02",
        code: "ART-NG-002",
        title: "Ấn Vàng Triều Nguyễn",
        viewsCount: 4890,
        bookmarksCount: 1180,
        category: "Cổ vật Hoàng Cung",
      },
      {
        artifactId: "art-oe-03",
        code: "ART-OE-003",
        title: "Tượng Thần Óc Eo",
        viewsCount: 3950,
        bookmarksCount: 920,
        category: "Văn hóa Phù Nam",
      },
      {
        artifactId: "art-sm-04",
        code: "ART-SM-004",
        title: "Tranh Sơn Mài Cổ Nam Bộ",
        viewsCount: 3120,
        bookmarksCount: 740,
        category: "Mỹ thuật Mỹ nghệ",
      },
    ],
    trafficSeries: [
      {
        timestamp: "2026-08-06T00:00:00Z",
        visitorsCount: 3200,
        viewsCount: 8400,
      },
      {
        timestamp: "2026-08-07T00:00:00Z",
        visitorsCount: 3850,
        viewsCount: 9600,
      },
      {
        timestamp: "2026-08-08T00:00:00Z",
        visitorsCount: 4900,
        viewsCount: 12400,
      },
      {
        timestamp: "2026-08-09T00:00:00Z",
        visitorsCount: 5400,
        viewsCount: 13800,
      },
      {
        timestamp: "2026-08-10T00:00:00Z",
        visitorsCount: 4100,
        viewsCount: 10200,
      },
      {
        timestamp: "2026-08-11T00:00:00Z",
        visitorsCount: 4300,
        viewsCount: 10900,
      },
      {
        timestamp: "2026-08-12T00:00:00Z",
        visitorsCount: 2700,
        viewsCount: 6800,
      },
    ],
    systemHealthStatus: "HEALTHY",
    lastUpdated: new Date().toISOString(),
  };
}

// GET /api/v1/dashboard/summary
dashboardRouter.get("/summary", (_req: Request, res: Response) => {
  const summary = authSummaryData();
  return res.json(summary);
});

// GET /api/v1/dashboard/metrics
dashboardRouter.get("/metrics", (_req: Request, res: Response) => {
  const summary = authSummaryData();
  return res.json(summary.metrics);
});
