import { renderHeader, renderFooter, renderMobileBottomNav } from "../shell/layout.js";
import {
  render3DModelViewer,
  render360RoomPanoramaViewer,
  injectHeritageGlobalStyles,
  renderQrScannerModal,
} from "@hcmc-museum/ui";
import type { ThreeDModelConfig, ThreeDFloorPoi, RoomPanoramaNode } from "@hcmc-museum/contracts";

export function renderPublic3DExperiencePage(
  config: ThreeDModelConfig,
  pois: ThreeDFloorPoi[] = [],
  roomNode?: RoomPanoramaNode,
): string {
  const headerHtml = renderHeader();
  const footerHtml = renderFooter();
  const mobileNavHtml = renderMobileBottomNav();
  const viewerHtml = render3DModelViewer(config, pois);

  const defaultRoomNode: RoomPanoramaNode = roomNode ?? {
    roomId: "ROOM_DONGSON_01",
    roomName: "Phòng Trưng Bày Văn Hóa Đông Sơn & Trống Đồng Linh Thiêng",
    floorLevel: 1,
    panoramaImageUrl:
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=2000&q=80",
    qrCodeToken: "QR_ROOM_DONGSON_01",
    angleViews: [
      {
        angleId: "ANG_01",
        angleLabel: "Góc 1: Cổng Vào Phòng Đông Sơn",
        imageUrl:
          "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=2000&q=80",
      },
      {
        angleId: "ANG_02",
        angleLabel: "Góc 2: Tủ Kính Bảo Vật Trống Đồng",
        imageUrl:
          "https://images.unsplash.com/photo-1572953109213-3be62398eb95?auto=format&fit=crop&w=2000&q=80",
      },
      {
        angleId: "ANG_03",
        angleLabel: "Góc 3: Vách Tường Di Sản Cổ Đại",
        imageUrl:
          "https://images.unsplash.com/photo-1544413647-7959955c7861?auto=format&fit=crop&w=2000&q=80",
      },
    ],
    navArrows: [
      {
        targetRoomId: "ROOM_OCEO_02",
        label: "Đi tiếp sang Phòng Văn Hóa Óc Eo",
        directionAngleDegrees: 0,
      },
      {
        targetRoomId: "ROOM_MAIN_HALL",
        label: "Trở về Sảnh Chính Bảo Tàng",
        directionAngleDegrees: 180,
      },
    ],
    hotspots: config.hotspots,
  };

  const roomPanoramaHtml = render360RoomPanoramaViewer(defaultRoomNode);

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${config.title} — Trải Nghiệm Không Gian 3D Bảo Tàng Lịch Sử TP.HCM</title>
  <meta name="description" content="Khám phá mô hình 3D Digital Twin di sản bảo tàng, xoay 360 độ và tham quan phòng 360 Google Street View." />
  ${injectHeritageGlobalStyles()}
</head>
<body class="bg-slate-950 text-slate-100 antialiased font-sans flex flex-col min-h-screen relative">
  ${headerHtml}

  <main class="min-h-screen container mx-auto px-4 py-6 sm:py-8 pb-20 md:pb-8">
    <div class="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
      <div>
        <h1 class="text-3xl font-bold text-amber-400 tracking-wide font-serif">${config.title}</h1>
        <p class="text-slate-400 text-sm mt-1">Mô phỏng 3D Digital Twin hiện vật di sản & Tham quan phòng 360° Virtual Street View</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">🌐 360° Room Panorama</span>
        <span class="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold">🏛️ Bảo tàng Lịch sử TP.HCM</span>
      </div>
    </div>

    <!-- 360 Room Panorama Virtual Street View Section -->
    ${roomPanoramaHtml}

    <!-- 3D Spatial Experience Viewer -->
    <div class="w-full">
      ${viewerHtml}
    </div>
  </main>

  ${footerHtml}
  ${mobileNavHtml}
  ${renderQrScannerModal()}
</body>
</html>
  `.trim();
}
