import { heritageTheme, renderLivingTimeline2D } from "@hcmc-museum/ui";
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
        title: "Thương Cảng Cổ & Văn Hóa Óc Eo",
        period: "Thế kỷ II - VII",
        description: "Nền văn minh sông nước Phù Nam với nghệ thuật tạc tượng đá tinh xảo.",
        artifactId: "art-oc-eo-01",
        artifactCode: "ART-OE-002",
      },
    ],
  };

  const relatedMap: Record<string, RelatedArtifact[]> = options.relatedArtifactsMap ?? {
    "ART-DS-001": [
      {
        artifactId: "art-oc-eo-01",
        code: "ART-OE-002",
        title: "Tượng Thần Vishnu Óc Eo",
        relationType: "RELATED_THEME",
        reason: "Cùng đại diện cho hai nền văn hóa cổ đại lớn trên lãnh thổ Việt Nam.",
      },
    ],
  };

  const headerHtml = renderHeader();
  const timelineHtml = renderLivingTimeline2D(journey, mode, relatedMap);
  const footerHtml = renderFooter();

  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Dòng Thời Gian Sống | Bảo tàng Lịch sử TP.HCM</title>
      <meta name="description" content="Khám phá di sản bảo tàng theo dòng thời gian tương tác 2D và hành trình tường thuật lịch sử.">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background-color: ${heritageTheme.colors.bgDark};
          color: ${heritageTheme.colors.textPrimary};
          font-family: ${heritageTheme.typography.fontFamilyBody};
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        main { flex: 1; max-width: 1200px; margin: 0 auto; width: 100%; padding: 2rem 1.5rem; }
      </style>
    </head>
    <body>
      ${headerHtml}
      <main id="timeline-main-content">
        ${timelineHtml}
      </main>
      ${footerHtml}
    </body>
    </html>
  `.trim();
}
