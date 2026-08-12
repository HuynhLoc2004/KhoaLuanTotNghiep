import { heritageTheme, renderSearchPage } from "@hcmc-museum/ui";
import { renderHeader, renderFooter } from "../shell/layout.js";
import type {
  SearchContentType,
  SearchFacetCount,
  SearchResultItem,
} from "@hcmc-museum/contracts";

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
      summary: "Biểu tượng văn hóa đặc sắc của thời kỳ Đông Sơn rực rỡ với hoa văn mặt trời và chim lạc.",
      score: 0.98,
      highlights: ["Khớp tiêu đề: Trống Đồng Đông Sơn"],
    },
  ];
  const facets = options.facets ?? [
    { type: "artifact", count: 1 },
    { type: "exhibition", count: 1 },
    { type: "news", count: 1 },
    { type: "tour", count: 1 },
  ];

  const headerHtml = renderHeader();
  const searchContentHtml = renderSearchPage(query, items, facets, options.activeType);
  const footerHtml = renderFooter();

  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tìm Kiếm Di Sản | Bảo tàng Lịch sử TP.HCM</title>
      <meta name="description" content="Tìm kiếm hiện vật, triển lãm, tin tức và tour tham quan di sản Bảo tàng Lịch sử Thành phố Hồ Chí Minh.">
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
      <main id="search-main-content">
        ${searchContentHtml}
      </main>
      ${footerHtml}
    </body>
    </html>
  `.trim();
}
