import assert from "node:assert/strict";
import { test } from "node:test";
import {
  renderAdminDashboardPage,
  renderDashboardMetricsCards,
  renderDashboardTopArtifactsTable,
  renderDashboardTrafficChart,
} from "../src/dashboard/renderer.js";

void test("renderDashboardMetricsCards renders card titles and formatted values", () => {
  const html = renderDashboardMetricsCards({
    totalVisitors: 28450,
    activeExhibitions: 12,
    totalArtifacts: 3450,
    qrScansTotal: 9820,
    aiGuideQueriesCount: 4120,
    periodLabel: "Tháng 8 / 2026",
  });

  assert.equal(html.includes("Khách Tham Quan"), true);
  assert.equal(html.includes("Lượt Quét QR"), true);
  assert.equal(html.includes("Hỏi Đáp AI Guide"), true);
});

void test("renderDashboardTopArtifactsTable renders table with top items", () => {
  const html = renderDashboardTopArtifactsTable([
    {
      artifactId: "art-ds-01",
      code: "ART-DS-001",
      title: "Trống Đồng Đông Sơn",
      viewsCount: 5420,
      bookmarksCount: 1420,
      category: "Cổ vật Đông Sơn",
    },
  ]);

  assert.equal(html.includes("Trống Đồng Đông Sơn"), true);
  assert.equal(html.includes("ART-DS-001"), true);
  assert.equal(html.includes("Cổ vật Đông Sơn"), true);
});

void test("renderDashboardTrafficChart renders bar chart items", () => {
  const html = renderDashboardTrafficChart([
    {
      timestamp: "2026-08-12T00:00:00Z",
      visitorsCount: 2700,
      viewsCount: 6800,
    },
  ]);

  assert.equal(html.includes("6800"), true);
  assert.equal(html.includes("Biểu Đồ Thống Kê"), true);
});

void test("renderAdminDashboardPage renders full dashboard page HTML", () => {
  const html = renderAdminDashboardPage({
    metrics: {
      totalVisitors: 28450,
      activeExhibitions: 12,
      totalArtifacts: 3450,
      qrScansTotal: 9820,
      aiGuideQueriesCount: 4120,
      periodLabel: "Tháng 8 / 2026",
    },
    topArtifacts: [],
    trafficSeries: [],
    systemHealthStatus: "HEALTHY",
    lastUpdated: new Date().toISOString(),
  });

  assert.equal(html.includes("Bảng Điều Khiển & Phân Tích"), true);
  assert.equal(html.includes("System: HEALTHY"), true);
});
