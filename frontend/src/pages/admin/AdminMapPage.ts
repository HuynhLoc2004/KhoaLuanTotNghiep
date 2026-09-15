import { MapConfigStore } from "../../data/mapData";
import { MuseumConfigStore } from "../../data/museumConfig";
import { Icons } from "../../components/Icons";

export function renderAdminMapPage(): string {
  const buildings = MapConfigStore.buildings;
  const rooms360 = MuseumConfigStore.rooms360;

  return `
    <div class="page-viewport" style="max-width: 1400px; padding: 1.5rem 2rem;">
      <!-- Breadcrumb & Header -->
      <div style="margin-bottom: 1.75rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
          <span style="font-size: 0.72rem; font-weight: 700; color: var(--color-primary); letter-spacing: 0.05em; text-transform: uppercase;">
            CỔNG QUẢN TRỊ ADMIN / SƠ ĐỒ MẶT BẰNG & DẪN ĐƯỜNG 2.5D
          </span>
          <span style="font-size: 0.75rem; color: var(--color-text-muted);">•</span>
          <span class="badge-pill" style="font-size: 0.7rem; padding: 1px 8px; background: rgba(56, 189, 248, 0.15); color: #0284c7; border-color: #38bdf8;">
            Dynamic Map CMS
          </span>
        </div>
        <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--color-text-main); margin: 0 0 0.25rem 0;">
          Quản Lý Sơ Đồ Kiến Trúc & Cầu Nối Phân Luồng 2.5D
        </h1>
        <p style="font-size: 0.85rem; color: var(--color-text-muted); margin: 0;">
          Tải lên bản vẽ mặt bằng CAD/ảnh chụp, quét AI bóc tách ranh giới phòng triển lãm và gán liên kết bước chân bay vào sảnh 360°.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 1.5rem; margin-bottom: 2rem; align-items: start;">
        <!-- Left: Blueprint Upload & AI Scan Simulation -->
        <div class="card" style="border-top: 4px solid var(--color-primary);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <h3 style="font-size: 1.1rem; color: var(--color-primary); margin: 0;">
              Tải Lên Sơ Đồ Kiến Trúc & Quét Phân Tích AI
            </h3>
            <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px; background: rgba(56, 189, 248, 0.15); color: #0284c7; border-color: #38bdf8;">
              AI Blueprint Scanner
            </span>
          </div>
          <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1.25rem;">
            Admin tải ảnh chụp bản vẽ mặt bằng bảo tàng (JPG, PNG, DWG). AI sẽ tự động phân tích các phân vùng, lối đi và nhận diện ranh giới phòng sảnh.
          </p>

          <!-- Dropzone -->
          <div id="blueprint-dropzone" style="border: 2px dashed rgba(56, 189, 248, 0.4); border-radius: var(--radius-lg); padding: 2rem 1.5rem; text-align: center; background: rgba(var(--color-surface-rgb), 0.3); margin-bottom: 1.25rem; cursor: pointer;">
            <div style="color: #38bdf8; font-size: 2.5rem; margin-bottom: 0.5rem; display: flex; justify-content: center;">
              ${Icons.map}
            </div>
            <div style="font-weight: 700; color: var(--color-text-main); font-size: 0.95rem; margin-bottom: 0.25rem;">
              Kéo thả file sơ đồ mặt bằng vào đây hoặc <span style="color: #38bdf8; text-decoration: underline;">Chọn từ máy tính</span>
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted);">
              Đã nạp sẵn: <code>SO_DO_MAT_BANG_BAO_TANG_TOA_A_2026.PNG</code> (Bản vẽ CAD 4K)
            </div>
          </div>

          <!-- AI Trigger Button -->
          <button class="btn btn-secondary" id="btn-scan-blueprint-ai" style="width: 100%; padding: 0.75rem; justify-content: center; font-size: 0.88rem; font-weight: 700;">
            ${Icons.compass}
            <span id="scan-blueprint-label">Kích Hoạt AI Quét Nhận Diện Ranh Giới Tòa Nhà & Phòng</span>
          </button>

          <!-- AI Scan Results Box -->
          <div id="ai-blueprint-results" style="display: none; margin-top: 1.25rem; padding: 1rem; border-radius: var(--radius-md); background: rgba(34, 197, 94, 0.08); border: 1px solid #22c55e;">
            <div style="font-size: 0.8rem; font-weight: 800; color: #16a34a; margin-bottom: 0.4rem;">
              ✓ KẾT QUẢ PHÂN TÍCH AI (ĐỘ CHÍNH XÁC 99.2%):
            </div>
            <div style="font-size: 0.8rem; color: var(--color-text-main); line-height: 1.5;">
              • Nhận diện: <b>${buildings.length} Tòa nhà</b>.<br/>
              • Nhận diện: <b>7 Gian phòng triển lãm</b>, 3 Cầu thang bộ, 2 Thang máy, 4 Cửa thoát hiểm.<br/>
              • Tọa độ và ranh giới đã được tự động liên kết với Bản Đồ Tầng 2.5D cho Du khách.
            </div>
          </div>
        </div>

        <!-- Right: Dynamic Select-Based Room & 360 Bridge Mapping Form -->
        <div class="card" style="border-top: 4px solid var(--color-secondary);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <h3 style="font-size: 1.1rem; color: var(--color-primary); margin: 0;">
              Thiết Lập Phòng & Cầu Nối Bay Vào Sảnh 360°
            </h3>
            <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px; background: rgba(34, 197, 94, 0.15); color: #16A34A; border-color: #22C55E;">
              Dynamic CMS Active
            </span>
          </div>
          <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1.25rem;">
            Dữ liệu Tòa nhà, Tầng và Cầu nối Sảnh 360° được nạp động từ CMS. Bạn có thể tạo thêm Tòa nhà mới hoặc Sảnh 360° mới bất cứ lúc nào.
          </p>

          <form id="map-room-config-form">
            <!-- 1. Select Building -->
            <div style="margin-bottom: 0.85rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                <label style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-main);">
                  1. Chọn Tòa Nhà Kiến Trúc (Building):
                </label>
                <button type="button" id="btn-quick-add-bldg" style="background: none; border: none; font-size: 0.78rem; font-weight: 700; color: var(--color-primary); cursor: pointer;">
                  + Thêm Tòa Nhà Mới
                </button>
              </div>
              <select id="admin-map-bldg-select" class="lang-select" style="width: 100%; padding: 0.65rem; font-weight: 600;">
                ${buildings.map((b) => `<option value="${b.id}">${b.code} - ${b.name}</option>`).join("")}
                <option value="__ADD_NEW_BLDG__" style="color: var(--color-primary); font-weight: 700;">➕ [Thêm Tòa Nhà Kiến Trúc Mới Từ CMS...]</option>
              </select>
            </div>

            <!-- 2. Select Floor -->
            <div style="margin-bottom: 0.85rem;">
              <label style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-main); display: block; margin-bottom: 0.3rem;">
                2. Chọn Tầng Trưng Bày (Floor Level):
              </label>
              <select id="admin-map-floor-select" class="lang-select" style="width: 100%; padding: 0.65rem; font-weight: 600;">
                <option value="1">Tầng 1 - Sảnh Tiền Sử & Đông Sơn</option>
                <option value="2">Tầng 2 - Nghệ Thuật Champa & Óc Eo</option>
                <option value="3">Tầng 3 - Cổ Vật Triều Nguyễn & Gốm Cổ</option>
                <option value="4">Tầng 4 - Kho Mở Bảo Tồn & Nghiên Cứu</option>
              </select>
            </div>

            <!-- 3. Room Name -->
            <div style="margin-bottom: 0.85rem;">
              <label style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-main); display: block; margin-bottom: 0.3rem;">
                3. Tên Gian Phòng / Khu Trưng Bày Mới:
              </label>
              <input type="text" id="admin-map-room-name" class="lang-select" style="width: 100%; padding: 0.65rem; font-weight: 600;" placeholder="VD: Sảnh Điêu Khắc Sa Thạch Mỹ Sơn" value="Gian Cổ Vật Mới Bổ Sung" />
            </div>

            <!-- 4. Link to 360 Tour Hall (Dynamic Select) -->
            <div style="margin-bottom: 0.85rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                <label style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-main);">
                  4. Cầu Nối Bay Vào Sảnh Tour 360° (CMS Dynamic):
                </label>
                <a href="#admin-tour360" style="font-size: 0.78rem; font-weight: 700; color: var(--color-primary); text-decoration: none;">
                  + Thêm Sảnh Tour 360°
                </a>
              </div>
              <select id="admin-map-tour-select" class="lang-select" style="width: 100%; padding: 0.65rem; font-weight: 600;">
                ${rooms360.map((r) => `<option value="${r.id}">✓ Bay sang: ${r.name} (${r.eraTitle})</option>`).join("")}
                <option value="none">Chưa liên kết 360°</option>
                <option value="__ADD_NEW_360_ROOM__" style="color: var(--color-primary); font-weight: 700;">➕ [Tạo Sảnh Tour 360° Mới Để Liên Kết...]</option>
              </select>
            </div>

            <!-- 5. Max Capacity -->
            <div style="margin-bottom: 1.25rem;">
              <label style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-main); display: block; margin-bottom: 0.3rem;">
                5. Ngưỡng Cảnh Báo Phân Luồng (Sức chứa tối đa):
              </label>
              <input type="number" id="admin-map-capacity" class="lang-select" style="width: 100%; padding: 0.65rem; font-weight: 600;" value="60" />
            </div>

            <button type="button" class="btn btn-primary" id="btn-save-map-room" style="width: 100%; padding: 0.75rem; justify-content: center; font-weight: 800;">
              ${Icons.check}
              <span>Lưu Gian Phòng & Cập Nhật Lên Sơ Đồ 2.5D</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Mapped Rooms Table -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3 style="font-size: 1.1rem; color: var(--color-primary); margin: 0;">
            Danh Sách Các Gian Phòng Đang Hoạt Động & Mật Độ Khách Thực Tế
          </h3>
          <span class="badge-pill" style="font-size: 0.75rem; padding: 2px 10px;">
            Đồng bộ thời gian thực
          </span>
        </div>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
            <thead>
              <tr style="border-bottom: 1px solid var(--color-card-border); color: var(--color-text-muted);">
                <th style="padding: 0.75rem;">Tòa Nhà & Tầng</th>
                <th style="padding: 0.75rem;">Tên Gian Phòng</th>
                <th style="padding: 0.75rem;">Chủ Đề Trưng Bày</th>
                <th style="padding: 0.75rem;">Mật Độ Khách Hiện Tại</th>
                <th style="padding: 0.75rem;">Cầu Nối Tour 360°</th>
                <th style="padding: 0.75rem;">Thử Nghiệm Tải</th>
              </tr>
            </thead>
            <tbody>
              ${buildings
                .flatMap((b) =>
                  b.floors.flatMap((f) =>
                    f.rooms.map(
                      (r) => `
                <tr style="border-bottom: 1px solid var(--color-card-border);">
                  <td style="padding: 0.75rem; font-weight: 700; color: var(--color-primary);">${b.code} - Tầng ${f.level}</td>
                  <td style="padding: 0.75rem; font-weight: 800; color: var(--color-text-main);">${r.name}</td>
                  <td style="padding: 0.75rem; color: var(--color-text-muted); font-size: 0.8rem;">${r.theme}</td>
                  <td style="padding: 0.75rem;">
                    <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px; background: ${
                      r.density === "low" ? "rgba(34,197,94,0.15)" : r.density === "medium" ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)"
                    }; color: ${r.density === "low" ? "#16a34a" : r.density === "medium" ? "#d97706" : "#dc2626"}; border-color: ${
                        r.density === "low" ? "#22c55e" : r.density === "medium" ? "#f59e0b" : "#ef4444"
                      };">
                      ${r.currentVisitors} / ${r.maxCapacity} Khách (${r.density.toUpperCase()})
                    </span>
                  </td>
                  <td style="padding: 0.75rem;">
                    ${
                      r.tour360RoomId
                        ? `
                      <span style="color: #0284c7; font-weight: 700; font-size: 0.8rem;">✓ ${r.tour360RoomId}</span>
                    `
                        : `
                      <span style="color: var(--color-text-muted); font-size: 0.8rem;">Chưa có</span>
                    `
                    }
                  </td>
                  <td style="padding: 0.75rem;">
                    <button class="btn btn-secondary sim-density-btn" data-room-id="${r.id}" style="font-size: 0.75rem; padding: 0.3rem 0.6rem;">
                      +10 Khách
                    </button>
                  </td>
                </tr>
              `
                    )
                  )
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

export function initAdminMapPage() {
  const scanAiBtn = document.getElementById("btn-scan-blueprint-ai");
  const aiResultsBox = document.getElementById("ai-blueprint-results");
  if (scanAiBtn && aiResultsBox) {
    scanAiBtn.addEventListener("click", () => {
      scanAiBtn.textContent = "AI Đang Quét Bản Vẽ Kiến Trúc CAD...";
      setTimeout(() => {
        aiResultsBox.style.display = "block";
        scanAiBtn.textContent = "✓ Đã Quét Xong & Liên Kết Sơ Đồ 2.5D";
      }, 500);
    });
  }

  const saveMapRoomBtn = document.getElementById("btn-save-map-room");
  const mapBldgSelect = document.getElementById("admin-map-bldg-select") as HTMLSelectElement;
  const mapFloorSelect = document.getElementById("admin-map-floor-select") as HTMLSelectElement;
  const mapRoomNameInput = document.getElementById("admin-map-room-name") as HTMLInputElement;
  const mapTourSelect = document.getElementById("admin-map-tour-select") as HTMLSelectElement;
  const mapCapInput = document.getElementById("admin-map-capacity") as HTMLInputElement;

  const quickAddBldgBtn = document.getElementById("btn-quick-add-bldg");

  // Prompt: Add a new Building dynamically
  const handleAddNewBuilding = () => {
    const bldgName = prompt("Nhập Tên Tòa Nhà Kiến Trúc Mới (Ví dụ: Tòa D - Khu Triển Lãm Đương Đại):");
    if (bldgName && bldgName.trim()) {
      const code = prompt("Nhập Ký Hiệu Tòa Nhà (Ví dụ: TÒA D):") || "TÒA D";
      const newBldg = MapConfigStore.addBuilding(bldgName.trim(), code, "Tòa nhà mới bổ sung từ CMS.");
      alert(`🎉 Đã thêm thành công Tòa nhà mới: [${code} - ${bldgName.trim()}]!`);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    } else {
      mapBldgSelect.selectedIndex = 0;
    }
  };

  // Prompt: Add a new 360 Tour Room dynamically
  const handleAddNew360Room = () => {
    const roomName = prompt("Nhập Tên Sảnh Tour 360° Mới Để Cầu Nối Bay Vào:");
    if (roomName && roomName.trim()) {
      const newRoom = MuseumConfigStore.addRoom360(roomName.trim(), "Thời Kỳ Lịch Sử", "Sảnh 360° mới khởi tạo từ Map CMS.");
      alert(`🎉 Đã tạo thành công Sảnh Tour 360° mới: [${roomName.trim()}]!`);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    } else {
      mapTourSelect.selectedIndex = 0;
    }
  };

  if (quickAddBldgBtn) quickAddBldgBtn.addEventListener("click", handleAddNewBuilding);

  if (mapBldgSelect) {
    mapBldgSelect.addEventListener("change", (e) => {
      const val = (e.target as HTMLSelectElement).value;
      if (val === "__ADD_NEW_BLDG__") {
        handleAddNewBuilding();
      }
    });
  }

  if (mapTourSelect) {
    mapTourSelect.addEventListener("change", (e) => {
      const val = (e.target as HTMLSelectElement).value;
      if (val === "__ADD_NEW_360_ROOM__") {
        handleAddNew360Room();
      }
    });
  }

  if (saveMapRoomBtn && mapBldgSelect && mapFloorSelect && mapRoomNameInput && mapTourSelect) {
    saveMapRoomBtn.addEventListener("click", () => {
      const bldgId = mapBldgSelect.value;
      const floorLvl = parseInt(mapFloorSelect.value, 10);
      const roomName = mapRoomNameInput.value.trim();
      const tourId = mapTourSelect.value === "none" ? "" : mapTourSelect.value;
      const cap = parseInt(mapCapInput?.value || "60", 10);

      if (bldgId === "__ADD_NEW_BLDG__" || tourId === "__ADD_NEW_360_ROOM__") {
        alert("Vui lòng chọn hoặc thêm Tòa nhà và Sảnh 360° hợp lệ!");
        return;
      }

      if (!roomName) {
        alert("Vui lòng nhập tên gian phòng!");
        return;
      }

      MapConfigStore.addRoom(bldgId, floorLvl, roomName, "Không gian khảo cổ học & di sản số", tourId, cap);
      alert(`🎉 Đã thêm gian phòng: [${roomName}] vào sơ đồ Tầng ${floorLvl} thành công!`);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }

  const simDensityBtns = document.querySelectorAll(".sim-density-btn");
  simDensityBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const rId = btn.getAttribute("data-room-id");
      if (rId) {
        const room = MapConfigStore.getRoomById(rId);
        if (room) {
          const newCount = (room.currentVisitors + 10) % (room.maxCapacity + 15);
          MapConfigStore.updateRoomDensity(rId, newCount);
          window.dispatchEvent(new HashChangeEvent("hashchange"));
        }
      }
    });
  });
}
