import type { ThreeDModelConfig, ThreeDHotspot, ThreeDFloorPoi } from "@hcmc-museum/contracts";

export function render3DHotspotOverlay(hotspots: ThreeDHotspot[]): string {
  if (hotspots.length === 0) {
    return "";
  }

  const hotspotItems = hotspots
    .map(
      (h) => `
      <div class="spatial-3d-hotspot-pin" style="transform: translate3d(${String(h.position[0] * 40)}px, ${String(h.position[1] * -30)}px, 0);" data-hotspot-id="${h.id}">
        <button class="spatial-hotspot-trigger-btn" aria-label="${h.title}">
          <span class="pulse-ring"></span>
          <span class="pin-icon">✨</span>
        </button>
        <div class="spatial-hotspot-card-glass">
          <h4 class="spatial-hotspot-title">${h.title}</h4>
          <p class="spatial-hotspot-desc">${h.description}</p>
        </div>
      </div>
    `,
    )
    .join("\n");

  return `
    <div class="spatial-3d-hotspots-container">
      ${hotspotItems}
    </div>
  `;
}

export function render3DOrbitControlsBar(): string {
  return `
    <div class="spatial-3d-controls-bar-glass">
      <button class="spatial-btn" data-action="rotate-left" title="Xoay trái 45°">↺ Xoay Trái</button>
      <button class="spatial-btn" data-action="rotate-right" title="Xoay phải 45°">↻ Xoay Phải</button>
      <button class="spatial-btn" data-action="zoom-in" title="Thu phóng vào">+</button>
      <button class="spatial-btn" data-action="zoom-out" title="Thu nhỏ">-</button>
      <button class="spatial-btn spatial-btn-highlight" data-action="reset-camera" title="Góc nhìn chuẩn">📷 Reset Camera</button>
      <button class="spatial-btn" data-action="toggle-fallback" title="Chuyển chế độ 2D/360°">🔄 Chế độ 2D / 360°</button>
    </div>
  `;
}

export function render3DFloorNavPanel(pois: ThreeDFloorPoi[]): string {
  const poiOptions = pois
    .map((p) => `<option value="${p.nodeId}">${p.label} (Tầng ${String(p.floorLevel)})</option>`)
    .join("\n");

  return `
    <div class="spatial-floor-nav-card-glass">
      <div class="spatial-card-header">
        <h3>📍 Dẫn Đường 3D Trong Bảo Tàng (A* Graph)</h3>
      </div>
      <div class="spatial-card-body">
        <div class="spatial-form-group">
          <label for="select-start-node">Vị trí bắt đầu:</label>
          <select id="select-start-node" class="spatial-select-dark">
            ${poiOptions}
          </select>
        </div>
        <div class="spatial-form-group">
          <label for="select-target-node">Điểm đến tham quan:</label>
          <select id="select-target-node" class="spatial-select-dark">
            ${poiOptions}
          </select>
        </div>
        <button id="btn-calculate-3d-route" class="spatial-btn-primary">🧭 Bắt Đầu Tính Lộ Trình 3D</button>
      </div>
      <div id="spatial-route-result-container" class="spatial-route-result hidden">
      </div>
    </div>
  `;
}

export function render3DModelViewer(config: ThreeDModelConfig, pois: ThreeDFloorPoi[]): string {
  const hotspotsHtml = render3DHotspotOverlay(config.hotspots);
  const controlsBarHtml = render3DOrbitControlsBar();
  const floorNavHtml = render3DFloorNavPanel(pois);

  return `
    <div class="spatial-3d-experience-container theme-${config.spatialDepthTheme}">
      <!-- 3D Canvas Scene Stage -->
      <div class="spatial-3d-stage">
        <div class="spatial-3d-canvas-viewport" id="webgl-3d-viewport" data-artifact-code="${config.artifactCode}" data-model-url="${config.modelUrl}">
          <!-- Simulated 3D Model Representation -->
          <div class="spatial-3d-model-mesh-glow">
            <div class="spatial-3d-artifact-badge">
              <span class="badge-icon">🏛️</span>
              <span class="badge-text">${config.title}</span>
            </div>
            <img src="${config.thumbnailUrl ?? "https://cdn.hcmc-museum.gov.vn/images/3d-placeholder.jpg"}" alt="${config.title}" class="spatial-3d-preview-image" />
          </div>

          <!-- Hotspots Overlay -->
          ${hotspotsHtml}
        </div>

        <!-- Floating Orbit Controls Bar -->
        ${controlsBarHtml}
      </div>

      <!-- Floor Plan & Indoor Routing Side Panel -->
      <div class="spatial-3d-side-panel">
        ${floorNavHtml}
      </div>
    </div>
  `;
}
