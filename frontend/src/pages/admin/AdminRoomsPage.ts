import { MuseumConfigStore, PendingApprovalStore } from "../../data/museumConfig";
import { AuthState } from "../../data/auth";
import { Icons } from "../../components/Icons";
import { showToast } from "../../components/Toast";


export function renderAdminRoomsPage(): string {
  const rooms = MuseumConfigStore.rooms360;

  return `
    <div class="page-viewport" style="max-width: 1400px; padding: 1.5rem 2rem;">
      <!-- Breadcrumb & Header -->
      <div style="margin-bottom: 1.75rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
          <span style="font-size: 0.72rem; font-weight: 700; color: var(--color-primary); letter-spacing: 0.05em; text-transform: uppercase;">
            CỔNG QUẢN TRỊ ADMIN / CMS TRANG QUẢN LÝ GIAN SẢNH 360°
          </span>
          <span style="font-size: 0.75rem; color: var(--color-text-muted);">•</span>
          <span class="badge-pill" style="font-size: 0.7rem; padding: 1px 8px; background: rgba(56, 189, 248, 0.15); color: #0284c7; border-color: #38bdf8;">
            Room CMS Store
          </span>
        </div>
        <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--color-text-main); margin: 0 0 0.25rem 0;">
          Trang Quản Lý & Thêm Mới Gian Sảnh Tour Ảo 360°
        </h1>
        <p style="font-size: 0.85rem; color: var(--color-text-muted); margin: 0;">
          Trang riêng biệt để Admin khởi tạo các Gian Sảnh 360° mới và quản lý danh sách góc quay bước chân (Walk Nodes). Dữ liệu sau khi nạp sẽ tự động cung cấp cho tất cả các menu Select trên hệ thống.
        </p>
      </div>

      <!-- Creation Forms Row -->
      <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 1.5rem; margin-bottom: 2rem; align-items: start;">
        <!-- Left: Form Create 360 Room -->
        <div class="card" style="border-top: 4px solid var(--color-primary);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <h3 style="font-size: 1.15rem; color: var(--color-primary); margin: 0; font-weight: 800;">
              ➕ Khởi Tạo Gian Sảnh Tour 360° Mới
            </h3>
            <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px; background: rgba(34, 197, 94, 0.15); color: #16A34A; border-color: #22C55E;">
              CMS Active
            </span>
          </div>
          <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1.25rem;">
            Nhập thông tin gian phòng trưng bày 360° mới. Hệ thống sẽ lưu vào cơ sở dữ liệu và nạp lên các trang Ghim Cổ Vật và Bản Đồ.
          </p>

          <form id="page-create-room-form">
            <div style="margin-bottom: 0.85rem;">
              <label style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-main); display: block; margin-bottom: 0.3rem;">
                Tên Gian Sảnh Trưng Bày Mới:
              </label>
              <input type="text" id="pg-room-name-input" class="lang-select" style="width: 100%; padding: 0.7rem; font-weight: 600;" placeholder="VD: Sảnh Cổ Vật Hoàng Cung Triều Nguyễn" required />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 0.85rem;">
              <div>
                <label style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-main); display: block; margin-bottom: 0.3rem;">
                  Niên Đại / Thời Kỳ Triển Lãm:
                </label>
                <input type="text" id="pg-room-era-input" class="lang-select" style="width: 100%; padding: 0.7rem; font-weight: 600;" placeholder="VD: Thế kỷ 19" required />
              </div>
              <div>
                <label style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-main); display: block; margin-bottom: 0.3rem;">
                  Chủ Đề Panorama 360°:
                </label>
                <select id="pg-room-theme-input" class="lang-select" style="width: 100%; padding: 0.7rem; font-weight: 600;">
                  <option value="champa">Kiến trúc Champa & Sa Thạch</option>
                  <option value="oc-eo">Văn hóa Óc Eo & Phù Nam Phương Nam</option>
                  <option value="dong-son">Văn minh Đông Sơn & Tiền Sử</option>
                </select>
              </div>
            </div>

            <div style="margin-bottom: 1.25rem;">
              <label style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-main); display: block; margin-bottom: 0.3rem;">
                Mô Tả Gian Phòng Triển Lãm:
              </label>
              <input type="text" id="pg-room-desc-input" class="lang-select" style="width: 100%; padding: 0.7rem; font-weight: 600;" placeholder="Không gian trưng bày các di vật quý giá thế kỷ 19..." />
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.8rem; justify-content: center; font-weight: 800;">
              ${Icons.check}
              <span>Thêm Gian Sảnh 360° Mới Vào Kho CMS</span>
            </button>
          </form>
        </div>

        <!-- Right: Form Add Walk Node -->
        <div class="card" style="border-top: 4px solid var(--color-secondary);">
          <h3 style="font-size: 1.15rem; color: var(--color-primary); margin-bottom: 0.4rem; font-weight: 800;">
            📍 Thêm Điểm Bước Chân (Walk Node)
          </h3>
          <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1.25rem;">
            Thêm vị trí nút bước chân mới vào gian sảnh để người dùng di chuyển 360°.
          </p>

          <form id="page-create-node-form">
            <div style="margin-bottom: 0.85rem;">
              <label style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-main); display: block; margin-bottom: 0.3rem;">
                Tên Điểm Bước Chân Mới:
              </label>
              <input type="text" id="pg-node-name-input" class="lang-select" style="width: 100%; padding: 0.7rem; font-weight: 600;" placeholder="VD: Vị trí Tủ Kính Phía Đông" required />
            </div>

            <div style="margin-bottom: 1.25rem;">
              <label style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-main); display: block; margin-bottom: 0.3rem;">
                Áp Dụng Cho Gian Sảnh 360°:
              </label>
              <select id="pg-node-room-select" class="lang-select" style="width: 100%; padding: 0.7rem; font-weight: 600;">
                ${rooms.map((r) => `<option value="${r.id}">${r.name} (${r.eraTitle})</option>`).join("")}
              </select>
            </div>

            <button type="submit" class="btn btn-secondary" style="width: 100%; padding: 0.8rem; justify-content: center; font-weight: 800;">
              <span>📍</span> Thêm Điểm Bước Chân Mới
            </button>
          </form>
        </div>
      </div>

      <!-- Table of All 360 Rooms -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3 style="font-size: 1.15rem; color: var(--color-primary); margin: 0; font-weight: 800;">
            Danh Sách ${rooms.length} Gian Sảnh 360° Trong Cơ Sở Dữ Liệu
          </h3>
          <span class="badge-pill" style="font-size: 0.75rem; padding: 2px 10px;">
            CMS Store Synchronized
          </span>
        </div>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
            <thead>
              <tr style="border-bottom: 1px solid var(--color-card-border); color: var(--color-text-muted);">
                <th style="padding: 0.75rem;">Mã Sảnh ID</th>
                <th style="padding: 0.75rem;">Tên Gian Sảnh</th>
                <th style="padding: 0.75rem;">Thời Kỳ Triển Lãm</th>
                <th style="padding: 0.75rem;">Số Điểm Bước Chân</th>
                <th style="padding: 0.75rem;">Số Điểm Ghim Cổ Vật</th>
                <th style="padding: 0.75rem; text-align: center;">Chuyển Trang Ghim</th>
              </tr>
            </thead>
            <tbody>
              ${rooms
                .map(
                  (r) => `
                <tr style="border-bottom: 1px solid var(--color-card-border);">
                  <td style="padding: 0.75rem; font-family: var(--font-family-mono); font-weight: 700; color: var(--color-primary);">${r.id}</td>
                  <td style="padding: 0.75rem; font-weight: 800; color: var(--color-text-main);">${r.name}</td>
                  <td style="padding: 0.75rem; color: var(--color-text-muted);">${r.eraTitle}</td>
                  <td style="padding: 0.75rem; font-weight: 700;">${r.nodes.length} Nút</td>
                  <td style="padding: 0.75rem; font-weight: 700; color: #16A34A;">${r.showcases.length} Ghim</td>
                  <td style="padding: 0.75rem; text-align: center;">
                    <a href="#admin-tour360" class="btn btn-secondary" style="font-size: 0.78rem; padding: 0.3rem 0.7rem; text-decoration: none;">
                      Sang Trang Ghim Cổ Vật →
                    </a>
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

export function initAdminRoomsPage() {
  const createRoomForm = document.getElementById("page-create-room-form");
  if (createRoomForm) {
    createRoomForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("pg-room-name-input") as HTMLInputElement;
      const eraInput = document.getElementById("pg-room-era-input") as HTMLInputElement;
      const descInput = document.getElementById("pg-room-desc-input") as HTMLInputElement;

      if (nameInput && nameInput.value.trim()) {
        const name = nameInput.value.trim();
        const eraTitle = eraInput?.value.trim() || "Thời Kỳ Lịch Sử";
        const description = descInput?.value.trim() || "Gian sảnh mới được khởi tạo từ CMS.";

        if (AuthState.canApprove()) {
          // Director — save directly
          const newRoom = MuseumConfigStore.addRoom360(name, eraTitle, description);
          showToast(`🎉 Đã thêm gian sảnh 360°: [${newRoom.name}]`, "success");
          window.location.hash = "#admin-tour360";
        } else {
          // Staff — submit for approval
          PendingApprovalStore.submit(
            "ADD_ROOM360",
            `Thêm gian sảnh: ${name} (${eraTitle})`,
            AuthState.admin.name,
            { name, eraTitle, description }
          );
          showToast(`⏳ Yêu cầu thêm gian sảnh "${name}" đã gửi — chờ Giám Đốc phê duyệt.`, "warning", 5000);
          window.dispatchEvent(new HashChangeEvent("hashchange"));
        }
      }
    });
  }

  const createNodeForm = document.getElementById("page-create-node-form");
  const nodeRoomSelect = document.getElementById("pg-node-room-select") as HTMLSelectElement;
  if (createNodeForm && nodeRoomSelect) {
    createNodeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nodeInput = document.getElementById("pg-node-name-input") as HTMLInputElement;
      const targetRoomId = nodeRoomSelect.value;

      if (nodeInput && nodeInput.value.trim() && targetRoomId) {
        const nodeName = nodeInput.value.trim();
        if (AuthState.canApprove()) {
          MuseumConfigStore.addWalkNode(targetRoomId, nodeName);
          showToast(`🎉 Đã thêm điểm bước chân [${nodeName}]!`, "success");
          window.dispatchEvent(new HashChangeEvent("hashchange"));
        } else {
          PendingApprovalStore.submit(
            "ADD_WALK_NODE",
            `Thêm walk node: ${nodeName}`,
            AuthState.admin.name,
            { roomId: targetRoomId, name: nodeName }
          );
          showToast(`⏳ Yêu cầu thêm Walk Node "${nodeName}" đã gửi — chờ Giám Đốc phê duyệt.`, "warning", 5000);
          window.dispatchEvent(new HashChangeEvent("hashchange"));
        }
      }
    });
  }
}
