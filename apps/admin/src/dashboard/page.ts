import { heritageTheme, renderAdminDashboardPage as renderDashboardContent } from "@hcmc-museum/ui";
import { renderAdminHeader, renderAdminSidebar } from "../shell/layout.js";
import type { DashboardSummaryResponse } from "@hcmc-museum/contracts";

export function renderAdminAnalyticsDashboardPage(summary?: DashboardSummaryResponse): string {
  const defaultSummary: DashboardSummaryResponse = summary ?? {
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
    ],
    trafficSeries: [
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

  const user = {
    name: "Huỳnh Tấn Lộc",
    role: "Quản trị viên Bảo tàng",
  };

  const sidebarHtml = renderAdminSidebar("analytics");
  const headerHtml = renderAdminHeader(user);
  const dashboardContentHtml = renderDashboardContent(defaultSummary);

  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Analytics Dashboard | Bảo tàng Lịch sử TP.HCM</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background-color: ${heritageTheme.colors.bgDark};
          color: ${heritageTheme.colors.textPrimary};
          font-family: ${heritageTheme.typography.fontFamilyBody};
          min-height: 100vh;
        }
      </style>
    </head>
    <body>
      <div id="admin-root" style="display: flex; min-height: 100vh;">
        ${sidebarHtml}
        <div style="flex: 1; display: flex; flex-direction: column;">
          ${headerHtml}
          <main id="admin-main-content" style="flex: 1; padding: 1.5rem;">
            ${dashboardContentHtml}
          </main>
        </div>
      </div>
    </body>
    </html>
  `.trim();
}
