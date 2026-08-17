import { renderLivingTimeline2D, injectHeritageGlobalStyles, renderQrScannerModal } from "@hcmc-museum/ui";
import { renderHeader, renderFooter } from "../shell/layout.js";
import type { NarrativeJourney, ExplorationMode, RelatedArtifact } from "@hcmc-museum/contracts";

export interface TimelinePageOptions {
  journey?: NarrativeJourney | undefined;
  mode?: ExplorationMode | undefined;
  relatedArtifactsMap?: Record<string, RelatedArtifact[]> | undefined;
}

export function renderLivingTimelinePage(options: TimelinePageOptions = {}): string {
  const mode = options.mode ?? "FREE_EXPLORE";
  const journey: NarrativeJourney = options.journey ?? {
    id: "journey-dong-son-to-oc-eo",
    title: "Từ Văn Hóa Đông Sơn Đến Nền Văn Minh Óc Eo",
    theme: "Lịch sử cổ đại Việt Nam",
    status: "PUBLISHED",
    nodes: [
      {
        id: "node-ds-01",
        title: "Kỷ Nguyên Kim Khí & Trống Đồng Đông Sơn",
        period: "Thế kỷ V - I TCN",
        description: "Thời kỳ đỉnh cao của kỹ thuật đúc đồng thau miền Bắc Việt Nam.",
        artifactId: "art-dong-son-01",
        artifactCode: "ART-DS-001",
      },
      {
        id: "node-oe-02",
        title: "Nền Văn Minh Phù Nam - Óc Eo Sông Cửu Long",
        period: "Thế kỷ I - VII",
        description: "Văn hóa thương cảng cổ phát triển rực rỡ ở Nam Bộ.",
        artifactId: "art-oc-eo-02",
        artifactCode: "ART-OE-002",
      },
    ],
  };

  const relatedArtifactsMap = options.relatedArtifactsMap ?? {
    "ART-DS-001": [
      {
        artifactId: "art-oc-eo-02",
        code: "ART-OE-002",
        title: "Tượng Thần Vishnu Óc Eo",
        relationType: "RELATED_THEME",
        reason: "Cùng đại diện cho hai nền văn hóa cổ đại lớn trên lãnh thổ Việt Nam.",
      },
    ],
  };

  const headerHtml = renderHeader();
  const footerHtml = renderFooter();
  const timelineHtml = renderLivingTimeline2D(journey, mode, relatedArtifactsMap);

  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Dòng Thời Gian Sống | Bảo tàng Lịch sử TP.HCM</title>
      <meta name="description" content="Khám phá di sản bảo tàng theo dòng thời gian tương tác 2D và hành trình tường thuật lịch sử.">
      ${injectHeritageGlobalStyles()}
    </head>
    <body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans antialiased">
      ${headerHtml}
      <main id="timeline-main-content" class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 pb-20 md:pb-8">
        ${timelineHtml}
      </main>
      ${footerHtml}
      ${renderQrScannerModal()}
    </body>
    </html>
  `.trim();
}
