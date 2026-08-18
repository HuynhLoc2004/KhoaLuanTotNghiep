import type {
  ThreeDModelConfig,
  ThreeDHotspot,
  ThreeDFloorPoi,
  RoomPanoramaNode,
} from "@hcmc-museum/contracts";

export function render3DHotspotOverlay(hotspots: ThreeDHotspot[]): string {
  if (hotspots.length === 0) {
    return "";
  }

  const hotspotItems = hotspots
    .map(
      (h) => `
      <div class="spatial-3d-hotspot-pin absolute group" style="transform: translate3d(${String(h.position[0] * 40)}px, ${String(h.position[1] * -30)}px, 0);" data-hotspot-id="${h.id}">
        <button class="w-10 h-10 rounded-full bg-amber-400/20 border-2 border-amber-400 text-amber-300 flex items-center justify-center font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse hover:scale-125 transition-transform" aria-label="${h.title}">
          ✨
        </button>
        <div class="hidden group-hover:block absolute bottom-12 left-1/2 -translate-x-1/2 w-64 p-4 rounded-xl glass-futuristic border-amber-400/60 z-30 shadow-2xl">
          <h4 class="font-heading font-bold text-amber-300 text-sm mb-1">${h.title}</h4>
          <p class="text-slate-300 text-xs leading-relaxed">${h.description}</p>
        </div>
      </div>
    `,
    )
    .join("\n");

  return `
    <div class="absolute inset-0 pointer-events-auto flex items-center justify-center">
      ${hotspotItems}
    </div>
  `;
}

export function render3DOrbitControlsBar(): string {
  return `
    <div class="spatial-3d-controls-bar-glass flex flex-wrap items-center justify-center gap-3 p-3 rounded-2xl glass-futuristic border-amber-500/30 shadow-2xl">
      <button class="btn-trigger-qr-scanner px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse hover:scale-105 transition-transform" title="Quét mã QR di sản">📷 Quét Mã QR</button>
      <button class="px-4 py-2 rounded-lg bg-slate-900/90 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-mono font-bold transition-all" data-action="rotate-left" title="Xoay trái 45°">↺ Xoay Trái</button>
      <button class="px-4 py-2 rounded-lg bg-slate-900/90 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-mono font-bold transition-all" data-action="rotate-right" title="Xoay phải 45°">↻ Xoay Phải</button>
      <button class="px-3 py-2 rounded-lg bg-slate-900/90 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 text-sm font-bold transition-all" data-action="zoom-in" title="Thu phóng vào">+</button>
      <button class="px-3 py-2 rounded-lg bg-slate-900/90 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 text-sm font-bold transition-all" data-action="zoom-out" title="Thu nhỏ">-</button>
      <button class="px-4 py-2 rounded-lg btn-cyber-gold text-xs font-bold transition-all" data-action="reset-camera" title="Góc nhìn chuẩn">🎯 Reset Camera</button>
      <button class="px-4 py-2 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/80 text-xs font-mono font-bold transition-all" data-action="toggle-fallback" title="Chuyển chế độ 2D/360°">🔄 Chế độ 2D / 360°</button>
    </div>
  `;
}

export function render3DFloorNavPanel(pois: ThreeDFloorPoi[]): string {
  const poiOptions = pois
    .map(
      (p) =>
        `<option value="${p.nodeId}" class="bg-slate-900 text-slate-100">${p.label} (Tầng ${String(p.floorLevel)})</option>`,
    )
    .join("\n");

  return `
    <div class="glass-futuristic rounded-2xl p-6 space-y-6">
      <div class="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div class="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
        </div>
        <div>
          <h3 class="font-heading font-bold text-lg text-slate-100">Dẫn Đường 3D Trong Bảo Tàng</h3>
          <p class="text-xs text-amber-400 font-mono">Thuật toán A* Graph Indoor Routing</p>
        </div>
      </div>

      <div class="space-y-4">
        <div>
          <label for="select-start-node" class="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">Vị trí bắt đầu:</label>
          <select id="select-start-node" class="w-full bg-slate-900/90 border border-amber-500/30 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-amber-400">
            ${poiOptions}
          </select>
        </div>

        <div>
          <label for="select-target-node" class="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">Điểm đến tham quan:</label>
          <select id="select-target-node" class="w-full bg-slate-900/90 border border-amber-500/30 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-amber-400">
            ${poiOptions}
          </select>
        </div>

        <button id="btn-calculate-3d-route" class="w-full btn-cyber-gold py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
          <span>🧭 Bắt Đầu Tính Lộ Trình 3D</span>
        </button>
      </div>

      <div id="spatial-route-result-container" class="hidden p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-emerald-300 text-xs font-mono leading-relaxed">
      </div>
    </div>
  `;
}

export function render3DModelViewer(config: ThreeDModelConfig, pois: ThreeDFloorPoi[]): string {
  const hotspotsHtml = render3DHotspotOverlay(config.hotspots);
  const controlsBarHtml = render3DOrbitControlsBar();
  const floorNavHtml = render3DFloorNavPanel(pois);

  return `
    <div class="spatial-3d-experience-container grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <!-- 3D Canvas Scene Stage -->
      <div class="lg:col-span-2 space-y-6">
        <div class="glass-futuristic rounded-3xl p-6 relative overflow-hidden border-2 border-amber-500/30 min-h-[500px] flex flex-col justify-between" id="webgl-3d-viewport" data-artifact-code="${config.artifactCode}" data-model-url="${config.modelUrl}">
          
          <!-- Top Holographic Title Badge -->
          <div class="flex items-center justify-between z-20">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 border border-amber-400/40 shadow-lg">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              <span class="font-heading font-bold text-amber-300 text-sm">${config.title}</span>
            </div>
            <div class="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              60 FPS PBR Render
            </div>
          </div>

          <!-- Central 3D Model Representation Stage -->
          <div class="my-auto text-center relative py-12">
            <div class="w-64 h-64 mx-auto rounded-full bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-cyan-500/20 blur-2xl absolute inset-0 m-auto animate-pulse-glow"></div>
            <img src="${config.thumbnailUrl ?? "https://cdn.hcmc-museum.gov.vn/images/3d-placeholder.jpg"}" alt="${config.title}" class="relative z-10 w-72 h-72 mx-auto object-contain drop-shadow-[0_20px_40px_rgba(245,158,11,0.35)] animate-float-3d" />
          </div>

          <!-- Hotspots Overlay -->
          ${hotspotsHtml}

          <!-- Floating Orbit Controls Bar -->
          <div class="z-20 pt-4">
            ${controlsBarHtml}
          </div>
        </div>
      </div>

      <!-- Floor Plan & Indoor Routing Side Panel -->
      <div class="lg:col-span-1">
        ${floorNavHtml}
      </div>
    </div>
  `;
}

/* High-Definition Zero-Distortion Interactive Room Walkthrough Engine (100% Sharp Real Proportions, 0% Stretch, 0% Dizziness) */
export function render360RoomPanoramaViewer(roomNode: RoomPanoramaNode): string {
  const anglesHtml =
    roomNode.angleViews.length > 0
      ? roomNode.angleViews
          .map(
            (angle, idx) => `
          <button class="btn-switch-room-angle px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${idx === 0 ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/30" : "bg-slate-900/90 text-slate-300 border border-slate-700 hover:border-amber-400/60"}" data-angle-index="${String(idx)}">
            📍 ${angle.angleLabel}
          </button>
        `,
          )
          .join("\n")
      : "";

  const navArrowsHtml = roomNode.navArrows
    .map(
      (arrow) => `
      <button class="btn-room-nav-arrow px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(245,158,11,0.8)] border-2 border-amber-300 inline-flex items-center gap-2 whitespace-nowrap transition-transform hover:scale-105 active:scale-95 cursor-pointer" data-target-room="${arrow.targetRoomId}">
        <svg class="w-4 h-4 text-slate-950 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
        <span>${arrow.label}</span>
      </button>
    `,
    )
    .join("\n");

  const slidesHtml = roomNode.angleViews
    .map(
      (angle, idx) => `
      <div class="room-angle-slide relative w-full h-full flex-shrink-0 flex items-center justify-center p-2 sm:p-4 bg-slate-950 overflow-hidden transition-opacity duration-300" data-slide-index="${String(idx)}">
        <!-- Dual-Layer Ambient Blurred Background (Fills All Side Bars Naturally) -->
        <img src="${angle.imageUrl}" alt="" class="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 select-none pointer-events-none" />
        
        <!-- Main Crisp Image Layer -->
        <img src="${angle.imageUrl}" alt="${angle.angleLabel}" class="relative z-10 max-w-full max-h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.95)] rounded-2xl select-none pointer-events-none border border-amber-500/20" />
        
        <!-- Bottom Viewpoint Badge -->
        <div class="absolute bottom-16 left-6 z-20 px-4 py-2 rounded-xl bg-slate-950/90 border border-amber-400/50 text-amber-300 text-xs font-mono font-bold shadow-2xl backdrop-blur-md">
          📍 ${angle.angleLabel}
        </div>
      </div>
    `,
    )
    .join("\n");

  const dotsHtml = roomNode.angleViews
    .map(
      (_, idx) => `
      <span class="room-angle-dot w-3 h-3 rounded-full transition-all cursor-pointer ${idx === 0 ? "bg-amber-400 scale-125 shadow-[0_0_12px_rgba(245,158,11,0.9)]" : "bg-slate-700 hover:bg-slate-500"}" data-dot-index="${String(idx)}"></span>
    `,
    )
    .join("\n");

  return `
    <!-- High-Definition Zero-Distortion Interactive Room Walkthrough Card -->
    <div id="room-360-streetview-card" class="glass-futuristic rounded-3xl p-6 relative overflow-hidden border-2 border-amber-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.9)] my-8">
      
      <!-- Top Info Bar -->
      <div class="flex flex-wrap justify-between items-center mb-4 gap-3 z-20 relative">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/50 text-amber-400">
            🏛️
          </div>
          <div>
            <h3 class="font-heading font-black text-lg sm:text-xl text-slate-100">${roomNode.roomName}</h3>
            <p class="text-xs font-mono text-amber-400">Không Gian Trực Quan Thật 100% — Tỉ Lệ Chuẩn Sắc Nét (Tầng ${String(roomNode.floorLevel)})</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
            🔑 Mã QR Căn Phòng: ${roomNode.qrCodeToken}
          </span>
        </div>
      </div>

      <!-- Viewpoint Selector Buttons Bar -->
      ${
        anglesHtml
          ? `<div class="flex flex-wrap items-center gap-2 mb-4 p-3 rounded-2xl bg-slate-900/90 border border-amber-500/30 z-20 relative">
        <span class="text-xs font-mono font-bold text-amber-400 mr-2 flex items-center gap-1.5">
          <span>📷</span> Các điểm tham quan trong phòng:
        </span>
        ${anglesHtml}
      </div>`
          : ""
      }

      <!-- Interactive Room Stage Area (0% Stretch, 0% Dizziness) -->
      <div id="room-360-viewport" class="relative w-full h-[520px] sm:h-[640px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center group" data-room-id="${roomNode.roomId}">
        
        <!-- Smooth Room Track Stage -->
        <div id="room-filmstrip-track" class="relative w-full h-full flex transition-transform duration-500 ease-out" style="transform: translateX(0%); width: 100%;">
          ${slidesHtml}
        </div>

        <!-- Left / Right Navigation Stepping Arrows -->
        <button id="btn-prev-room-angle" class="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-slate-950/85 border border-amber-400/50 text-amber-400 hover:bg-amber-400 hover:text-slate-950 flex items-center justify-center text-xl font-bold shadow-2xl transition-all hover:scale-110 cursor-pointer" title="Góc phòng trước">
          ❮
        </button>
        <button id="btn-next-room-angle" class="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-slate-950/85 border border-amber-400/50 text-amber-400 hover:bg-amber-400 hover:text-slate-950 flex items-center justify-center text-xl font-bold shadow-2xl transition-all hover:scale-110 cursor-pointer" title="Góc phòng tiếp theo">
          ❯
        </button>

        <!-- Dots Indicator Bar -->
        <div class="absolute top-4 right-4 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/85 border border-amber-500/30 backdrop-blur-md">
          ${dotsHtml}
        </div>

        <!-- Directional Floor Navigation Arrows -->
        <div class="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-wrap justify-center items-center gap-3 z-30 max-w-full px-4">
          ${navArrowsHtml}
        </div>

        <!-- Hint Overlay -->
        <div class="absolute top-4 left-4 z-30 px-3.5 py-2 rounded-xl bg-slate-950/90 border border-amber-500/40 text-xs font-mono text-slate-200 flex items-center gap-2.5 shadow-xl pointer-events-none">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>👈 Vuốt/Kéo rê hoặc bấm mũi tên ❮ ❯ để bước chuyển góc phòng | 100% Sắc Nét Chuẩn Tỉ Lệ</span>
        </div>
      </div>

      <!-- Bottom Interactive Toolbar -->
      <div class="mt-4 flex flex-wrap justify-between items-center gap-3">
        <button class="btn-trigger-qr-scanner btn-cyber-gold px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
          <svg class="w-4 h-4 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
          <span>📷 Quét Mã QR Căn Phòng Khác</span>
        </button>

        <p class="text-xs font-mono text-slate-400">© Mô phỏng không gian thực tế Bảo tàng Lịch sử TP. Hồ Chí Minh</p>
      </div>
    </div>

    <!-- Script Room Interactive Walkthrough Engine -->
    <script>
      (function() {
        const initWalkthroughViewer = () => {
          const track = document.getElementById('room-filmstrip-track');
          const prevBtn = document.getElementById('btn-prev-room-angle');
          const nextBtn = document.getElementById('btn-next-room-angle');
          const angleBtns = document.querySelectorAll('.btn-switch-room-angle');
          const dots = document.querySelectorAll('.room-angle-dot');
          const totalSlides = ${String(roomNode.angleViews.length)};
          
          if (!track || totalSlides === 0) return;

          let currentIndex = 0;

          function goToSlide(idx) {
            if (idx < 0) idx = totalSlides - 1;
            if (idx >= totalSlides) idx = 0;
            currentIndex = idx;

            track.style.transform = "translateX(" + (-currentIndex * 100) + "%)";

            angleBtns.forEach((b, i) => {
              if (i === currentIndex) {
                b.classList.remove('bg-slate-900/90', 'text-slate-300', 'border', 'border-slate-700');
                b.classList.add('bg-gradient-to-r', 'from-amber-400', 'to-amber-500', 'text-slate-950', 'shadow-lg');
              } else {
                b.classList.remove('bg-gradient-to-r', 'from-amber-400', 'to-amber-500', 'text-slate-950', 'shadow-lg');
                b.classList.add('bg-slate-900/90', 'text-slate-300', 'border', 'border-slate-700');
              }
            });

            dots.forEach((d, i) => {
              if (i === currentIndex) {
                d.classList.remove('bg-slate-700');
                d.classList.add('bg-amber-400', 'scale-125', 'shadow-[0_0_12px_rgba(245,158,11,0.9)]');
              } else {
                d.classList.remove('bg-amber-400', 'scale-125', 'shadow-[0_0_12px_rgba(245,158,11,0.9)]');
                d.classList.add('bg-slate-700');
              }
            });
          }

          if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
          if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

          angleBtns.forEach((btn) => {
            btn.addEventListener('click', (e) => {
              const idxStr = e.currentTarget.getAttribute('data-angle-index');
              if (idxStr !== null) goToSlide(parseInt(idxStr, 10));
            });
          });

          dots.forEach((dot) => {
            dot.addEventListener('click', (e) => {
              const idxStr = e.currentTarget.getAttribute('data-dot-index');
              if (idxStr !== null) goToSlide(parseInt(idxStr, 10));
            });
          });

          // Swipe Touch Support
          let touchStartX = 0;
          track.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) touchStartX = e.touches[0].clientX;
          }, { passive: true });

          track.addEventListener('touchend', (e) => {
            if (e.changedTouches.length === 1) {
              const touchEndX = e.changedTouches[0].clientX;
              const diff = touchStartX - touchEndX;
              if (diff > 40) goToSlide(currentIndex + 1);
              else if (diff < -40) goToSlide(currentIndex - 1);
            }
          }, { passive: true });
        };

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initWalkthroughViewer);
        } else {
          initWalkthroughViewer();
        }
      })();
    </script>
  `.trim();
}
