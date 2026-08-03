import { heritageTheme, type CmsBlock } from "@hcmc-museum/ui";
import { renderAdminSidebar, renderAdminHeader, type AdminUser } from "./layout.js";
import { renderCmsBlockFormEditor, renderLivePreviewPanel } from "../forms/cmsFormBuilder.js";

export interface AdminPageRenderOptions {
  user?: AdminUser | undefined;
  activeNav?: string | undefined;
  sampleBlock?: CmsBlock | undefined;
}

export function renderAdminShellPage(options: AdminPageRenderOptions = {}): string {
  const user = options.user || {
    name: "Trịnh Vĩ Thành",
    role: "Curator Admin",
  };
  const activeNav = options.activeNav || "cms-content";

  const defaultSampleBlock: CmsBlock = options.sampleBlock || {
    type: "hero",
    id: "hero-preview-01",
    title: "Hành Trình Khám Phá Di Sản Bảo Tàng Lịch Sử",
    subtitle:
      "Trải nghiệm Bảo tàng Lịch sử Thành phố Hồ Chí Minh qua không gian 3D tương tác và AI Guide",
    ctaText: "Khám Phá Bản Đồ 3D",
    ctaLink: "/map-3d",
  };

  const sidebarHtml = renderAdminSidebar(activeNav);
  const headerHtml = renderAdminHeader(user);
  const formHtml = renderCmsBlockFormEditor("hero", defaultSampleBlock);
  const previewHtml = renderLivePreviewPanel(defaultSampleBlock);

  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CMS Admin Portal | Bảo tàng Lịch sử TP.HCM</title>
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
          <main id="admin-main-content" style="flex: 1; padding: 2rem; display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start;">
            <div id="editor-column">
              ${formHtml}
            </div>
            <div id="preview-column">
              ${previewHtml}
            </div>
          </main>
        </div>
      </div>
    </body>
    </html>
  `.trim();
}
