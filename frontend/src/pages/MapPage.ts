import { MapConfigStore, Building, FloorLevel, MapRoom, WayfindingRoute, WAYFINDING_ROUTES } from "../data/mapData";
import { ARTIFACTS_DATA } from "../data/artifacts";
import { Icons } from "../components/Icons";

let currentViewMode: "campus" | "floor" = "floor";
let selectedBuildingId = "bldg-main";
let selectedFloorLevel = 1;
let selectedRouteId: string | null = "route-fast-30";
let inspectingRoomId: string | null = "room-dong-son";

export function renderMapPage(): string {
  const currentBuilding = MapConfigStore.getCurrentBuilding();
  const currentFloor = MapConfigStore.getCurrentFloor();
  const activeRoute = WAYFINDING_ROUTES.find(r => r.id === selectedRouteId) || null;
  const inspectingRoom = (inspectingRoomId ? MapConfigStore.getRoomById(inspectingRoomId) : null) || null;

  return `
    <div class="page-container" style="max-width: 1400px; padding: 1.5rem 2rem;">
      <!-- Top Title & Controls Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
            <span class="badge-pill" style="background: rgba(56, 189, 248, 0.15); color: #0284c7; border-color: #38bdf8; font-size: 0.75rem;">
              HỆ THỐNG ĐỊNH VỊ & ĐIỀU HƯỚNG BẢO TÀNG SỐ
            </span>
            <span style="font-size: 0.8rem; color: var(--color-text-muted);">
              Cập nhật mật độ luồng khách thời gian thực
            </span>
          </div>
          <h1 style="font-size: 1.8rem; font-weight: 800; color: var(--color-text-main); margin: 0;">
            Sơ Đồ Tầng & Dẫn Đường Tham Quan Thông Minh
          </h1>
          <p style="font-size: 0.88rem; color: var(--color-text-muted); margin: 0.35rem 0 0 0;">
            Lập lộ trình tối ưu theo thời gian, theo dõi mật độ phòng sảnh và chuyển tiếp tức thì vào Tour Ảo 360°.
          </p>
        </div>

        <!-- Level & Campus View Switcher Buttons -->
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
          <button class="chip ${currentViewMode === 'campus' ? 'active' : ''}" id="btn-view-campus">
            ${Icons.museum}
            <span>Toàn Cảnh Khuôn Viên (3 Tòa)</span>
          </button>
          
          <div style="width: 1px; height: 24px; background: var(--color-card-border);"></div>

          <button class="chip ${currentViewMode === 'floor' && selectedFloorLevel === 1 ? 'active' : ''}" data-level="1">
            <span>Tầng 1 (Đông Sơn & Tiền Sử)</span>
          </button>
          <button class="chip ${currentViewMode === 'floor' && selectedFloorLevel === 2 ? 'active' : ''}" data-level="2">
            <span>Tầng 2 (Champa & Óc Eo)</span>
          </button>
          <button class="chip ${currentViewMode === 'floor' && selectedFloorLevel === 3 ? 'active' : ''}" data-level="3">
            <span>Tầng 3 (Cổ Vật Triều Nguyễn)</span>
          </button>
        </div>
      </div>

      <!-- Smart Wayfinding Route Selector Bar -->
      <div style="background: rgba(var(--color-surface-rgb), 0.4); border: 1px solid var(--color-card-border); border-radius: var(--radius-lg); padding: 1rem 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="color: var(--color-primary); display: flex; align-items: center;">
            ${Icons.compass}
          </div>
          <div>
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase;">
              Gợi Ý Lộ Trình Tham Quan Tối Ưu (Smart Wayfinding):
            </div>
            <div style="font-size: 0.9rem; font-weight: 800; color: var(--color-text-main);">
              ${activeRoute ? activeRoute.title : 'Chế độ tham quan tự do'}
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          ${WAYFINDING_ROUTES.map(r => `
            <button class="btn ${selectedRouteId === r.id ? 'btn-primary' : 'btn-secondary'} route-preset-btn" data-route-id="${r.id}" style="font-size: 0.8rem; padding: 0.45rem 0.85rem;">
              ${r.badge}
            </button>
          `).join('')}
          <button class="btn btn-secondary route-preset-btn" data-route-id="none" style="font-size: 0.8rem; padding: 0.45rem 0.85rem;">
            Tắt Dẫn Đường
          </button>
        </div>
      </div>

      <!-- Main Interactive Blueprint Workspace -->
      ${currentViewMode === 'campus' ? renderCampusOverview() : renderFloorBlueprint(currentFloor, activeRoute, inspectingRoom)}
    </div>
  `;
}

// -------------------------------------------------------------
// VIEW 1: CAMPUS OVERVIEW (3 BUILDINGS 2.5D PERSPECTIVE)
// -------------------------------------------------------------
function renderCampusOverview(): string {
  const buildings = MapConfigStore.buildings;

  return `
    <div style="margin-bottom: 2rem;">
      <div style="margin-bottom: 1.25rem; font-size: 0.88rem; color: var(--color-text-muted);">
        Bấm vào một tòa nhà hoặc tầng cụ thể dưới đây để <b>Bay vào xem Sơ đồ mặt bằng kiến trúc chi tiết</b>:
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.5rem;">
        ${buildings.map(b => `
          <div class="card campus-building-card" data-bldg-id="${b.id}" style="border-top: 4px solid var(--color-primary); cursor: pointer; transition: all 0.25s ease; position: relative; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
              <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px; background: rgba(180,83,9,0.15); color: var(--color-primary); border-color: var(--color-primary);">
                ${b.code}
              </span>
              <span style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: 600;">
                ${b.floors.length} Tầng trưng bày
              </span>
            </div>

            <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--color-text-main); margin: 0 0 0.4rem 0;">
              ${b.name}
            </h3>
            <p style="font-size: 0.82rem; color: var(--color-text-muted); line-height: 1.5; margin-bottom: 1.25rem;">
              ${b.description}
            </p>

            <!-- Floor Badges -->
            <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.25rem;">
              ${b.floors.map(fl => `
                <button class="btn btn-secondary enter-floor-btn" data-bldg="${b.id}" data-level="${fl.level}" style="width: 100%; justify-content: space-between; font-size: 0.82rem; padding: 0.5rem 0.85rem; text-align: left;">
                  <span style="font-weight: 700;">${fl.name}</span>
                  <span style="font-size: 0.72rem; color: var(--color-secondary);">${fl.rooms.length} Gian phòng →</span>
                </button>
              `).join('')}
            </div>

            <button class="btn btn-primary enter-building-btn" data-bldg="${b.id}" style="width: 100%; font-size: 0.85rem; padding: 0.65rem; justify-content: center;">
              ${Icons.arrowRight}
              <span>Bay Vào Mặt Bằng Tòa Nhà Này</span>
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// VIEW 2: FLOOR BLUEPRINT (INTERACTIVE SVG MAP + ROOM CARD)
// -------------------------------------------------------------
function renderFloorBlueprint(floor: FloorLevel, activeRoute: WayfindingRoute | null, inspectingRoom: MapRoom | null): string {
  const currentBuilding = MapConfigStore.getCurrentBuilding();

  return `
    <div style="display: grid; grid-template-columns: 1fr 380px; gap: 1.5rem; margin-bottom: 2rem; align-items: start;">
      <!-- Left: Interactive SVG Architectural Blueprint -->
      <div class="card" style="padding: 1.5rem; position: relative; background: #0b1120; border: 1px solid rgba(56, 189, 248, 0.2); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg);">
        <!-- Blueprint Top Info -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.75rem;">
          <div>
            <div style="font-size: 0.75rem; color: #38bdf8; font-weight: 700; text-transform: uppercase;">
              ${currentBuilding.name} • ${floor.name}
            </div>
            <div style="font-size: 0.8rem; color: #94a3b8;">
              ${floor.subName}
            </div>
          </div>
          <!-- Legend -->
          <div style="display: flex; gap: 0.75rem; font-size: 0.72rem; align-items: center;">
            <span style="display: flex; align-items: center; gap: 4px; color: #22c55e;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e;"></span> Vắng (&lt;20)</span>
            <span style="display: flex; align-items: center; gap: 4px; color: #f59e0b;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #f59e0b;"></span> Vừa (20-40)</span>
            <span style="display: flex; align-items: center; gap: 4px; color: #ef4444;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444;"></span> Đông (&gt;50)</span>
          </div>
        </div>

        <!-- SVG Map Rendering -->
        <div style="width: 100%; height: 480px; position: relative; overflow: hidden; border-radius: var(--radius-md); background: #020617; border: 1px solid rgba(255,255,255,0.05);">
          <svg id="floor-blueprint-svg" viewBox="0 0 700 500" style="width: 100%; height: 100%; display: block;">
            <defs>
              <!-- Grid Pattern -->
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.04)" stroke-width="1" />
              </pattern>

              <!-- Neon Glow Filter -->
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <!-- Background Grid -->
            <rect width="700" height="500" fill="url(#grid)" />

            <!-- Outer Building Walls Outline -->
            <rect x="30" y="40" width="640" height="430" rx="16" fill="rgba(15, 23, 42, 0.6)" stroke="#1e293b" stroke-width="6" />

            <!-- Entrance Gate Indicator -->
            <rect x="290" y="460" width="100" height="15" fill="#10b981" rx="4" filter="url(#glow)" />
            <text x="340" y="490" text-anchor="middle" fill="#10b981" font-size="11" font-weight="700">CỔNG VÀO CHÍNH A1</text>

            <!-- Rooms on this Floor -->
            ${floor.rooms.map(room => {
              const isSelected = inspectingRoom?.id === room.id;
              let densityColor = "#22c55e";
              if (room.density === "medium") densityColor = "#f59e0b";
              if (room.density === "high") densityColor = "#ef4444";

              return `
                <g class="map-room-group" data-room-id="${room.id}" style="cursor: pointer;">
                  <!-- Room Floor Rect -->
                  <rect 
                    x="${room.rect.x}" 
                    y="${room.rect.y}" 
                    width="${room.rect.w}" 
                    height="${room.rect.h}" 
                    rx="8" 
                    fill="${isSelected ? 'rgba(56, 189, 248, 0.18)' : 'rgba(30, 41, 59, 0.7)'}" 
                    stroke="${isSelected ? '#38bdf8' : room.color}" 
                    stroke-width="${isSelected ? '3' : '1.5'}" 
                    stroke-dasharray="${isSelected ? 'none' : 'none'}"
                    filter="${isSelected ? 'url(#glow)' : 'none'}"
                    style="transition: all 0.2s ease;"
                  />

                  <!-- Room Header Bar -->
                  <rect 
                    x="${room.rect.x}" 
                    y="${room.rect.y}" 
                    width="${room.rect.w}" 
                    height="28" 
                    rx="6" 
                    fill="${room.color}" 
                    opacity="0.25" 
                  />

                  <!-- Room Title Text -->
                  <text 
                    x="${room.rect.x + 12}" 
                    y="${room.rect.y + 19}" 
                    fill="#f8fafc" 
                    font-size="12" 
                    font-weight="800"
                  >
                    ${room.name}
                  </text>

                  <!-- Room Area Info -->
                  <text 
                    x="${room.rect.x + 12}" 
                    y="${room.rect.y + 45}" 
                    fill="#94a3b8" 
                    font-size="10" 
                    font-weight="600"
                  >
                    Diện tích: ${room.areaM2}m²
                  </text>

                  <!-- Density Badge Inside Room -->
                  <rect 
                    x="${room.rect.x + 12}" 
                    y="${room.rect.y + room.rect.h - 32}" 
                    width="110" 
                    height="20" 
                    rx="10" 
                    fill="rgba(0,0,0,0.5)" 
                    stroke="${densityColor}" 
                    stroke-width="1"
                  />
                  <circle 
                    cx="${room.rect.x + 22}" 
                    cy="${room.rect.y + room.rect.h - 22}" 
                    r="4" 
                    fill="${densityColor}" 
                  />
                  <text 
                    x="${room.rect.x + 32}" 
                    y="${room.rect.y + room.rect.h - 18}" 
                    fill="#f8fafc" 
                    font-size="10" 
                    font-weight="700"
                  >
                    ${room.currentVisitors} khách (${room.density.toUpperCase()})
                  </text>

                  <!-- 360 Available Badge -->
                  ${room.tour360RoomId ? `
                    <rect 
                      x="${room.rect.x + room.rect.w - 68}" 
                      y="${room.rect.y + room.rect.h - 32}" 
                      width="58" 
                      height="20" 
                      rx="10" 
                      fill="rgba(2, 132, 199, 0.4)" 
                      stroke="#38bdf8" 
                      stroke-width="1"
                    />
                    <text 
                      x="${room.rect.x + room.rect.w - 39}" 
                      y="${room.rect.y + room.rect.h - 18}" 
                      fill="#38bdf8" 
                      font-size="9" 
                      font-weight="800"
                      text-anchor="middle"
                    >
                      360° VR
                    </text>
                  ` : ''}
                </g>
              `;
            }).join('')}

            <!-- Wayfinding Route Path (Animated Glowing Line) -->
            ${activeRoute && activeRoute.waypoints.length > 1 ? `
              <g id="wayfinding-layer">
                <!-- Glowing Underpath -->
                <polyline 
                  points="${activeRoute.waypoints.map(p => `${p.x},${p.y}`).join(' ')}" 
                  fill="none" 
                  stroke="#38bdf8" 
                  stroke-width="6" 
                  stroke-opacity="0.3" 
                  filter="url(#glow)"
                />

                <!-- Animated Dotted Line -->
                <polyline 
                  points="${activeRoute.waypoints.map(p => `${p.x},${p.y}`).join(' ')}" 
                  fill="none" 
                  stroke="#38bdf8" 
                  stroke-width="3" 
                  stroke-dasharray="8 6" 
                  class="animated-waypoint-path"
                />

                <!-- Waypoint Stops -->
                ${activeRoute.waypoints.map((pt, idx) => `
                  <circle cx="${pt.x}" cy="${pt.y}" r="7" fill="#38bdf8" stroke="#ffffff" stroke-width="2" />
                  <text x="${pt.x}" y="${pt.y - 12}" text-anchor="middle" fill="#f8fafc" font-size="10" font-weight="800" filter="url(#glow)">
                    ${idx === 0 ? 'CỔNG VÀO' : `CHẶNG ${idx}`}
                  </text>
                `).join('')}
              </g>
            ` : ''}
          </svg>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem; font-size: 0.78rem; color: #94a3b8;">
          <div>💡 <i>Mẹo: Bấm trực tiếp vào từng phòng trên sơ đồ để xem bảo vật và mật độ khách.</i></div>
          <div>Thuật toán tìm đường: <b>A* Wayfinding Path</b></div>
        </div>
      </div>

      <!-- Right: Room Inspection Details & Fly-Into 360 Bridge -->
      <div>
        ${inspectingRoom ? renderRoomInspector(inspectingRoom) : `
          <div class="card" style="text-align: center; padding: 2rem;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem; color: var(--color-primary);">${Icons.location}</div>
            <h3 style="font-size: 1.1rem; color: var(--color-text-main); margin-bottom: 0.5rem;">Chưa Chọn Phòng</h3>
            <p style="font-size: 0.82rem; color: var(--color-text-muted);">
              Vui lòng click vào một gian phòng trên bản đồ mặt bằng để xem thông tin chi tiết và cổ vật trưng bày.
            </p>
          </div>
        `}

        <!-- Route Itinerary Step Drawer -->
        ${activeRoute ? `
          <div class="card" style="margin-top: 1.25rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-primary); text-transform: uppercase; margin-bottom: 0.35rem;">
              Lộ Trình Đang Chọn: ${activeRoute.badge}
            </div>
            <p style="font-size: 0.8rem; color: var(--color-text-muted); line-height: 1.4; margin-bottom: 0.75rem;">
              ${activeRoute.description}
            </p>

            <div style="display: flex; flex-direction: column; gap: 0.4rem;">
              ${activeRoute.waypoints.filter(w => w.label).map((w, idx) => `
                <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem;">
                  <span style="width: 20px; height: 20px; border-radius: 50%; background: rgba(56, 189, 248, 0.2); color: #0284c7; border: 1px solid #38bdf8; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.7rem;">
                    ${idx + 1}
                  </span>
                  <span style="font-weight: 600; color: var(--color-text-main);">${w.label}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// ROOM INSPECTOR CARD WITH "FLY TO 360°" BUTTON
// -------------------------------------------------------------
function renderRoomInspector(room: MapRoom): string {
  const featuredArtifacts = ARTIFACTS_DATA.filter(a => room.featuredArtifactIds.includes(a.id));

  let densityBadgeColor = "#22c55e";
  let densityText = "Thông Thoáng (Khuyến khích vào)";
  if (room.density === "medium") {
    densityBadgeColor = "#f59e0b";
    densityText = "Lượng Khách Vừa Phải";
  } else if (room.density === "high") {
    densityBadgeColor = "#ef4444";
    densityText = "Đang Đông Đúc (Cân nhắc chuyển phòng)";
  }

  return `
    <div class="card" style="border-top: 4px solid ${room.color}; box-shadow: var(--shadow-lg);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
        <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px; background: rgba(56, 189, 248, 0.15); color: #0284c7; border-color: #38bdf8;">
          TẦNG ${room.floorLevel} • DIỆN TÍCH ${room.areaM2}M²
        </span>
        <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px; background: ${densityBadgeColor}22; color: ${densityBadgeColor}; border-color: ${densityBadgeColor};">
          ${room.currentVisitors} / ${room.maxCapacity} Khách
        </span>
      </div>

      <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--color-text-main); margin: 0 0 0.35rem 0;">
        ${room.name}
      </h3>
      <p style="font-size: 0.82rem; color: var(--color-text-muted); line-height: 1.5; margin-bottom: 1rem;">
        ${room.theme}
      </p>

      <!-- Density Progress Bar -->
      <div style="background: rgba(var(--color-surface-rgb), 0.4); border: 1px solid var(--color-card-border); border-radius: var(--radius-md); padding: 0.75rem; margin-bottom: 1.25rem;">
        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.35rem;">
          <span>Tình trạng phân luồng:</span>
          <span style="color: ${densityBadgeColor};">${densityText}</span>
        </div>
        <div style="height: 6px; background: rgba(0,0,0,0.2); border-radius: 3px; overflow: hidden;">
          <div style="width: ${Math.min(100, (room.currentVisitors / room.maxCapacity) * 100)}%; height: 100%; background: ${densityBadgeColor};"></div>
        </div>
      </div>

      <!-- Featured Artifacts in this Room -->
      <div style="margin-bottom: 1.25rem;">
        <div style="font-size: 0.78rem; font-weight: 700; color: var(--color-text-muted); margin-bottom: 0.5rem; text-transform: uppercase;">
          Bảo Vật Tiêu Biểu Trong Phòng:
        </div>
        ${featuredArtifacts.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${featuredArtifacts.map(art => `
              <div style="display: flex; align-items: center; gap: 0.65rem; padding: 0.45rem; border-radius: var(--radius-sm); background: rgba(var(--color-surface-rgb), 0.3); border: 1px solid var(--color-card-border);">
                <img src="${art.thumbnail}" alt="" style="width: 42px; height: 42px; object-fit: cover; border-radius: var(--radius-xs);" />
                <div style="flex: 1;">
                  <div style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-main);">${art.name}</div>
                  <div style="font-size: 0.72rem; color: var(--color-text-muted);">${art.era}</div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div style="font-size: 0.78rem; color: var(--color-text-muted); font-style: italic;">
            Đang cập nhật danh mục trưng bày số cho phòng này.
          </div>
        `}
      </div>

      <!-- FLY DIRECTLY TO 360° TOUR ACTION BUTTON -->
      ${room.tour360RoomId ? `
        <button class="btn btn-primary btn-fly-to-360" data-room-360="${room.tour360RoomId}" style="width: 100%; justify-content: center; font-size: 0.9rem; padding: 0.75rem; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);">
          ${Icons.compass}
          <span>🚀 Bay Vào Bước Đi Sảnh 360° Ngay</span>
        </button>
      ` : `
        <div style="font-size: 0.78rem; color: var(--color-text-muted); text-align: center;">
          Sảnh này đang chuẩn bị dữ liệu Photosphere 360°.
        </div>
      `}
    </div>
  `;
}

// -------------------------------------------------------------
// EVENT LISTENERS & WAYFINDING LOGIC
// -------------------------------------------------------------
export function initMapPageLogic() {
  // Campus View Button
  const btnCampus = document.getElementById("btn-view-campus");
  if (btnCampus) {
    btnCampus.addEventListener("click", () => {
      currentViewMode = "campus";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }

  // Floor Level Buttons
  const levelBtns = document.querySelectorAll("[data-level]");
  levelBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const lvl = parseInt(btn.getAttribute("data-level") || "1", 10);
      currentViewMode = "floor";
      selectedFloorLevel = lvl;
      MapConfigStore.selectedFloorLevel = lvl;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  });

  // Enter Floor Buttons from Campus Cards
  const enterFloorBtns = document.querySelectorAll(".enter-floor-btn");
  enterFloorBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const bldgId = btn.getAttribute("data-bldg") || "bldg-main";
      const lvl = parseInt(btn.getAttribute("data-level") || "1", 10);
      selectedBuildingId = bldgId;
      selectedFloorLevel = lvl;
      currentViewMode = "floor";
      MapConfigStore.selectedBuildingId = bldgId;
      MapConfigStore.selectedFloorLevel = lvl;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  });

  // Enter Building Buttons
  const enterBldgBtns = document.querySelectorAll(".enter-building-btn");
  enterBldgBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const bldgId = btn.getAttribute("data-bldg") || "bldg-main";
      selectedBuildingId = bldgId;
      selectedFloorLevel = 1;
      currentViewMode = "floor";
      MapConfigStore.selectedBuildingId = bldgId;
      MapConfigStore.selectedFloorLevel = 1;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  });

  // Route Preset Buttons
  const routeBtns = document.querySelectorAll(".route-preset-btn");
  routeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const rId = btn.getAttribute("data-route-id");
      selectedRouteId = rId === "none" ? null : rId;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  });

  // Click Room on SVG Blueprint to Inspect
  const roomGroups = document.querySelectorAll(".map-room-group");
  roomGroups.forEach(grp => {
    grp.addEventListener("click", () => {
      const rId = grp.getAttribute("data-room-id");
      if (rId) {
        inspectingRoomId = rId;
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    });
  });

  // Fly to 360° Tour Button
  const flyBtns = document.querySelectorAll(".btn-fly-to-360");
  flyBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const room360Id = btn.getAttribute("data-room-360") || "room-champa";
      window.location.hash = `#tour360`;
    });
  });
}
