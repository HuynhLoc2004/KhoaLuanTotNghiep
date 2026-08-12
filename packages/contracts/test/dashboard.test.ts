import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DashboardOverviewMetricSchema,
  DashboardPopularArtifactSchema,
  DashboardSummaryResponseSchema,
  DashboardTrafficSeriesSchema,
} from "../src/dashboard/schemas.js";

void test("DashboardOverviewMetricSchema parses metric object correctly", () => {
  const metric = {
    totalVisitors: 15420,
    activeExhibitions: 8,
    totalArtifacts: 1250,
    qrScansTotal: 4890,
    aiGuideQueriesCount: 2310,
    periodLabel: "Tháng 8 / 2026",
  };

  const parsed = DashboardOverviewMetricSchema.parse(metric);
  assert.equal(parsed.totalVisitors, 15420);
  assert.equal(parsed.qrScansTotal, 4890);
});

void test("DashboardPopularArtifactSchema & DashboardTrafficSeriesSchema validate items", () => {
  const artifact = {
    artifactId: "art-ds-01",
    code: "ART-DS-001",
    title: "Trống Đồng Đông Sơn",
    viewsCount: 3420,
    bookmarksCount: 890,
    category: "Cổ vật",
  };
  const parsedArtifact = DashboardPopularArtifactSchema.parse(artifact);
  assert.equal(parsedArtifact.title, "Trống Đồng Đông Sơn");

  const series = {
    timestamp: "2026-08-12T10:00:00Z",
    visitorsCount: 450,
    viewsCount: 1200,
  };
  const parsedSeries = DashboardTrafficSeriesSchema.parse(series);
  assert.equal(parsedSeries.visitorsCount, 450);
});

void test("DashboardSummaryResponseSchema validates full summary payload", () => {
  const payload = {
    metrics: {
      totalVisitors: 15420,
      activeExhibitions: 8,
      totalArtifacts: 1250,
      qrScansTotal: 4890,
      aiGuideQueriesCount: 2310,
      periodLabel: "Tháng 8 / 2026",
    },
    topArtifacts: [
      {
        artifactId: "art-ds-01",
        code: "ART-DS-001",
        title: "Trống Đồng Đông Sơn",
        viewsCount: 3420,
        bookmarksCount: 890,
        category: "Cổ vật",
      },
    ],
    trafficSeries: [
      {
        timestamp: "2026-08-12T10:00:00Z",
        visitorsCount: 450,
        viewsCount: 1200,
      },
    ],
    systemHealthStatus: "HEALTHY",
    lastUpdated: new Date().toISOString(),
  };

  const parsed = DashboardSummaryResponseSchema.parse(payload);
  assert.equal(parsed.systemHealthStatus, "HEALTHY");
  assert.equal(parsed.topArtifacts.length, 1);
});
