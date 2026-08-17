import { renderHeader, renderFooter } from "../shell/layout.js";
import { render3DModelViewer, injectHeritageGlobalStyles, renderQrScannerModal } from "@hcmc-museum/ui";
import type { ThreeDModelConfig, ThreeDFloorPoi } from "@hcmc-museum/contracts";

export function renderPublic3DExperiencePage(
  config: ThreeDModelConfig,
  pois: ThreeDFloorPoi[],
): string {
  const headerHtml = renderHeader();
  const footerHtml = renderFooter();
  const viewerHtml = render3DModelViewer(config, pois);

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${config.title} — Trải Nghiệm Không Gian 3D Bảo Tàng Lịch Sử TP.HCM</title>
  <meta name="description" content="Khám phá mô hình 3D Digital Twin di sản bảo tàng, xoay 360 độ và dẫn đường 3D A* trong bảo tàng." />
  ${injectHeritageGlobalStyles()}
</head>
<body class="bg-slate-950 text-slate-100 antialiased font-sans flex flex-col min-h-screen">
  ${headerHtml}

  <main class="min-h-screen container mx-auto px-4 py-6 sm:py-8 pb-20 md:pb-8">
    <div class="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
      <div>
        <h1 class="text-3xl font-bold text-amber-400 tracking-wide font-serif">${config.title}</h1>
        <p class="text-slate-300 text-sm mt-1">Mô phỏng 3D Digital Twin hiện vật di sản & Dẫn đường không gian 3D bảo tàng</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-3 py-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-full text-xs font-semibold">
          ✨ 3D Spatial Depth Mode
        </span>
        <span class="px-3 py-1 bg-amber-950/80 border border-amber-500/40 text-amber-300 rounded-full text-xs font-semibold">
          🏛️ Bảo tàng Lịch sử TP.HCM
        </span>
      </div>
    </div>

    <!-- 3D Spatial Experience Viewer -->
    <div class="w-full">
      ${viewerHtml}
    </div>
  </main>

  ${footerHtml}
  ${renderQrScannerModal()}
</body>
</html>
  `.trim();
}
