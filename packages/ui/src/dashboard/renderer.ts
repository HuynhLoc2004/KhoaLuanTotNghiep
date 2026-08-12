import type {
  DashboardOverviewMetric,
  DashboardPopularArtifact,
  DashboardSummaryResponse,
  DashboardTrafficSeries,
} from "@hcmc-museum/contracts";
import { heritageTheme } from "../tokens/theme.js";

export function renderDashboardMetricsCards(metrics: DashboardOverviewMetric): string {
  const cards = [
    {
      title: "Khách Tham Quan",
      value: metrics.totalVisitors.toLocaleString("vi-VN"),
      icon: "👥",
      subtitle: metrics.periodLabel,
      color: heritageTheme.colors.accentGold,
    },
    {
      title: "Hiện Vật Di Sản",
      value: metrics.totalArtifacts.toLocaleString("vi-VN"),
      icon: "🏛️",
      subtitle: `${String(metrics.activeExhibitions)} Triển lãm mở`,
      color: "#4CAF50",
    },
    {
      title: "Lượt Quét QR",
      value: metrics.qrScansTotal.toLocaleString("vi-VN"),
      icon: "📱",
      subtitle: "Tương tác vị trí",
      color: "#2196F3",
    },
    {
      title: "Hỏi Đáp AI Guide",
      value: metrics.aiGuideQueriesCount.toLocaleString("vi-VN"),
      icon: "🤖",
      subtitle: "Trợ lý thuyết minh",
      color: "#9C27B0",
    },
  ];

  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
      ${cards
        .map(
          (card) => `
        <div style="background: ${heritageTheme.colors.bgCard}; border: 1px solid ${heritageTheme.colors.borderGlass}; border-radius: 0.75rem; padding: 1.5rem; box-shadow: ${heritageTheme.glassmorphism.boxShadow}; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 0.875rem; color: ${heritageTheme.colors.textSecondary}; margin-bottom: 0.35rem;">${card.title}</div>
            <div style="font-family: ${heritageTheme.typography.fontFamilyHeading}; font-size: 1.75rem; font-weight: bold; color: ${card.color};">${card.value}</div>
            <div style="font-size: 0.75rem; color: ${heritageTheme.colors.textMuted}; margin-top: 0.25rem;">${card.subtitle}</div>
          </div>
          <div style="font-size: 2.25rem; opacity: 0.85;">${card.icon}</div>
        </div>
      `,
        )
        .join("")}
    </div>
  `.trim();
}

export function renderDashboardTopArtifactsTable(artifacts: DashboardPopularArtifact[]): string {
  return `
    <div style="background: ${heritageTheme.colors.bgCard}; border: 1px solid ${heritageTheme.colors.borderGlass}; border-radius: 0.75rem; padding: 1.5rem; box-shadow: ${heritageTheme.glassmorphism.boxShadow}; margin-bottom: 2rem;">
      <h3 style="font-family: ${heritageTheme.typography.fontFamilyHeading}; font-size: 1.25rem; color: ${heritageTheme.colors.accentGold}; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
        <span>🏆</span> Top Hiện Vật Xem Nhiều Nhất
      </h3>
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem;">
          <thead>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: ${heritageTheme.colors.textSecondary};">
              <th style="padding: 0.75rem 0.5rem;">Mã Số</th>
              <th style="padding: 0.75rem 0.5rem;">Tên Hiện Vật</th>
              <th style="padding: 0.75rem 0.5rem;">Danh Mục</th>
              <th style="padding: 0.75rem 0.5rem; text-align: right;">Lượt Xem</th>
              <th style="padding: 0.75rem 0.5rem; text-align: right;">Lượt Lưu ⭐</th>
            </tr>
          </thead>
          <tbody>
            ${artifacts
              .map(
                (item) => `
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); color: ${heritageTheme.colors.textPrimary};">
                <td style="padding: 0.75rem 0.5rem; font-family: monospace; color: ${heritageTheme.colors.accentGoldLight};">${item.code}</td>
                <td style="padding: 0.75rem 0.5rem; font-weight: 600;">${item.title}</td>
                <td style="padding: 0.75rem 0.5rem; color: ${heritageTheme.colors.textSecondary};">${item.category}</td>
                <td style="padding: 0.75rem 0.5rem; text-align: right; color: ${heritageTheme.colors.accentGold}; font-weight: bold;">${item.viewsCount.toLocaleString("vi-VN")}</td>
                <td style="padding: 0.75rem 0.5rem; text-align: right; color: #FFD700;">${item.bookmarksCount.toLocaleString("vi-VN")}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  `.trim();
}

export function renderDashboardTrafficChart(series: DashboardTrafficSeries[]): string {
  const maxViews = Math.max(...series.map((s) => s.viewsCount), 1);

  return `
    <div style="background: ${heritageTheme.colors.bgCard}; border: 1px solid ${heritageTheme.colors.borderGlass}; border-radius: 0.75rem; padding: 1.5rem; box-shadow: ${heritageTheme.glassmorphism.boxShadow};">
      <h3 style="font-family: ${heritageTheme.typography.fontFamilyHeading}; font-size: 1.25rem; color: ${heritageTheme.colors.accentGold}; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
        <span>📈</span> Biểu Đồ Thống Kê Lưu Lượng Tham Quan 7 Ngày
      </h3>
      <div style="display: flex; align-items: flex-end; gap: 1rem; height: 180px; padding-top: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
        ${series
          .map((item) => {
            const heightPercent = Math.round((item.viewsCount / maxViews) * 100);
            const dateStr = item.timestamp.split("T")[0] ?? item.timestamp;
            return `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; height: 100%; justify-content: flex-end;">
              <div style="font-size: 0.7rem; color: ${heritageTheme.colors.textMuted};">${String(item.viewsCount)}</div>
              <div style="width: 100%; max-width: 36px; background: linear-gradient(180deg, ${heritageTheme.colors.accentGold} 0%, ${heritageTheme.colors.primaryRed} 100%); height: ${String(heightPercent)}%; border-radius: 0.25rem 0.25rem 0 0; transition: height 0.3s ease;"></div>
              <div style="font-size: 0.75rem; color: ${heritageTheme.colors.textSecondary}; white-space: nowrap;">${dateStr.slice(5)}</div>
            </div>
          `;
          })
          .join("")}
      </div>
    </div>
  `.trim();
}

export function renderAdminDashboardPage(summary: DashboardSummaryResponse): string {
  const metricsHtml = renderDashboardMetricsCards(summary.metrics);
  const tableHtml = renderDashboardTopArtifactsTable(summary.topArtifacts);
  const chartHtml = renderDashboardTrafficChart(summary.trafficSeries);

  return `
    <div id="admin-dashboard-root" style="padding: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(212,175,55,0.2); padding-bottom: 1rem;">
        <div>
          <h1 style="font-family: ${heritageTheme.typography.fontFamilyHeading}; font-size: 1.75rem; color: ${heritageTheme.colors.accentGold}; margin-bottom: 0.25rem;">📊 Bảng Điều Khiển & Phân Tích Bảo Tàng</h1>
          <p style="color: ${heritageTheme.colors.textSecondary}; font-size: 0.875rem;">Theo dõi lượng truy cập, quét QR hiện vật và chỉ số sức khỏe hệ thống thời gian thực.</p>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="display: inline-block; padding: 0.35rem 0.75rem; background: rgba(76, 175, 80, 0.15); color: #4CAF50; border: 1px solid rgba(76, 175, 80, 0.3); border-radius: 9999px; font-size: 0.75rem; font-weight: bold;">
            ● System: ${summary.systemHealthStatus}
          </span>
        </div>
      </div>

      ${metricsHtml}
      ${chartHtml}
      <div style="margin-top: 2rem;">
        ${tableHtml}
      </div>
    </div>
  `.trim();
}
