import {
  renderCmsBlock,
  injectHeritageGlobalStyles,
  renderQrScannerModal,
  type CmsPagePayload,
} from "@hcmc-museum/ui";
import { renderHeader, renderFooter, renderMobileBottomNav } from "./layout.js";

export interface RenderedWebPage {
  title: string;
  metaDescription: string;
  html: string;
  renderedBlocksCount: number;
}

export function renderWebShellPage(pagePayload: CmsPagePayload): RenderedWebPage {
  const metaDescription =
    pagePayload.metaDescription ?? "Nền tảng bảo tàng số Bảo tàng Lịch sử Thành phố Hồ Chí Minh";

  const headerHtml = renderHeader();
  const footerHtml = renderFooter();
  const mobileNavHtml = renderMobileBottomNav();

  const blocksHtml = pagePayload.blocks.map((block) => renderCmsBlock(block).html).join("\n");

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${pagePayload.title} | Bảo tàng Lịch sử TP.HCM</title>
      <meta name="description" content="${metaDescription}">
      ${injectHeritageGlobalStyles()}
    </head>
    <body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans antialiased relative">
      ${headerHtml}
      <main id="app-content" class="flex-1 pb-16 md:pb-0">
        ${blocksHtml}
      </main>
      ${footerHtml}
      ${mobileNavHtml}
      ${renderQrScannerModal()}
    </body>
    </html>
  `.trim();

  return {
    title: pagePayload.title,
    metaDescription,
    html: fullHtml,
    renderedBlocksCount: pagePayload.blocks.length,
  };
}

export function getSampleMuseumPagePayload(): CmsPagePayload {
  return {
    pageId: "page-home-001",
    slug: "trang-chu",
    title: "Trang chủ Trải nghiệm Bảo tàng Số",
    metaDescription: "Khám phá di sản lịch sử Việt Nam qua nền tảng số hóa 3D và AI Guide",
    blocks: [
      {
        type: "banner",
        id: "banner-01",
        title: "Thông báo triển lãm",
        message: "Chào mừng quý khách đến với không gian trải nghiệm bảo tàng số 3D trực tuyến.",
        variant: "announcement",
      },
      {
        type: "hero",
        id: "hero-01",
        title: "Hành Trình Khám Phá Di Sản Lịch Sử",
        subtitle:
          "Trải nghiệm Bảo tàng Lịch sử Thành phố Hồ Chí Minh qua không gian 3D tương tác, AI Tour Guide và Dòng thời gian sống.",
        ctaText: "Khám Phá Bản Đồ 3D",
        ctaLink: "/map-3d",
      },
      {
        type: "artifact_grid",
        id: "artifacts-01",
        title: "Bảo Vật Quốc Gia & Hiện Vật Tiêu Biểu",
        subtitle: "Những hiện vật quý giá được lưu giữ tại Bảo tàng Lịch sử TP. Hồ Chí Minh",
        artifacts: [
          {
            id: "art-01",
            name: "Tượng Phật Lợi Mỹ",
            period: "Thế kỷ IV - VI (Văn hóa Óc Eo)",
            category: "Bảo vật Quốc gia",
            is3dAvailable: true,
          },
          {
            id: "art-02",
            name: "Tượng Thần Vishnu",
            period: "Thế kỷ VI - VII",
            category: "Bảo vật Quốc gia",
            is3dAvailable: true,
          },
          {
            id: "art-03",
            name: "Trống đồng Đông Sơn",
            period: "Thế kỷ II - I TCN",
            category: "Khảo cổ học",
            is3dAvailable: false,
          },
        ],
      },
      {
        type: "timeline_preview",
        id: "timeline-01",
        title: "Dòng Thời Gian Lịch Sử Tiến Trình Vĩnh Cửu",
        events: [
          {
            year: "Văn hóa Óc Eo",
            title: "Nền văn minh Phù Nam cổ đại",
            description: "Thời kỳ phát triển rực rỡ của thương cảng Óc Eo tại Nam Bộ.",
          },
          {
            year: "Thế kỷ XVII - XVIII",
            title: "Khai phá vùng đất Nam Bộ",
            description: "Quá trình khẩn hoành và lập chiêu bạ hành chính tại Gia Định.",
          },
          {
            year: "Năm 1929",
            title: "Thành lập Bảo tàng Blanchard de la Brosse",
            description: "Tiền thân của Bảo tàng Lịch sử Thành phố Hồ Chí Minh ngày nay.",
          },
        ],
      },
    ],
  };
}
