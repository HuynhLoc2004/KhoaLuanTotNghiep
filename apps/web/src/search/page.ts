import { renderSearchPage, injectHeritageGlobalStyles } from "@hcmc-museum/ui";
import { renderHeader, renderFooter } from "../shell/layout.js";
import type { SearchContentType, SearchFacetCount, SearchResultItem } from "@hcmc-museum/contracts";

export interface SearchPageOptions {
  query?: string;
  items?: SearchResultItem[];
  facets?: SearchFacetCount[];
  activeType?: SearchContentType;
}

export function renderPublicSearchPage(options: SearchPageOptions = {}): string {
  const query = options.query ?? "";
  const items = options.items ?? [
    {
      id: "art-ds-01",
      code: "ART-DS-001",
      type: "artifact",
      title: "Trống Đồng Đông Sơn",
      subtitle: "Báu vật nghệ thuật đúc đồng cổ đại",
      summary:
        "Biểu tượng văn hóa đặc sắc của thời kỳ Đông Sơn rực rỡ với hoa văn mặt trời và chim lạc.",
      score: 0.98,
      highlights: ["Khớp tiêu đề: Trống Đồng Đông Sơn"],
    },
    {
      id: "art-av-02",
      code: "ART-AV-002",
      type: "artifact",
      title: "Ấn Vàng Sắc Mệnh Chi Bảo",
      subtitle: "Biểu trưng quyền lực triều Nguyễn",
      summary: "Ấn vàng đúc năm 1827 dưới triều vua Minh Mạng bằng vàng ròng.",
      score: 0.94,
      highlights: ["Khớp chất liệu: Vàng ròng"],
    },
  ];

  const facets = options.facets ?? [
    { type: "artifact", count: 12 },
    { type: "exhibition", count: 4 },
    { type: "news", count: 2 },
  ];

  const headerHtml = renderHeader();
  const footerHtml = renderFooter();
  const searchContentHtml = renderSearchPage(query, items, facets, options.activeType);

  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tìm Kiếm Di Sản | Bảo tàng Lịch sử TP.HCM</title>
      <meta name="description" content="Khám phá và tìm kiếm di sản lịch sử văn hóa Việt Nam">
      ${injectHeritageGlobalStyles()}
    </head>
    <body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans antialiased">
      ${headerHtml}
      <main id="search-main-content" class="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        ${searchContentHtml}
      </main>
      ${footerHtml}
    </body>
    </html>
  `.trim();
}
