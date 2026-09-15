import { Icons } from "../../components/Icons";
import { MuseumConfigStore } from "../../data/museumConfig";
import { showToast } from "../../components/Toast";

export function renderAdminNodesPage(): string {
  const rooms = MuseumConfigStore.rooms360;

  return `
    <div class="admin-page-container fade-in" style="padding: 1.5rem; max-width: 1400px; margin: 0 auto;">
      <!-- Page Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-primary); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.25rem;">
            Phân Hệ 3DGS & Tour Ảo [3DGS_TOUR]
          </div>
          <h1 style="font-size: 1.6rem; font-weight: 800; color: var(--color-text-main); margin: 0;">
            Quản Lý Điểm Quan Sát Bước Chân (Walk Node Anchors)
          </h1>
          <p style="font-size: 0.88rem; color: var(--color-text-muted); margin-top: 0.35rem; max-width: 800px;">
            Quản lý tập hợp các điểm dừng bước chân (Walk Nodes) trong các gian sảnh 3DGS 360°. Các điểm này làm neo để du khách di chuyển thực tế ảo và ghim các hotspot cổ vật.
          </p>
        </div>

        <div style="display: flex; gap: 0.6rem;">
          <a href="#admin-rooms" class="btn btn-secondary" style="text-decoration: none; font-size: 0.85rem; padding: 0.55rem 1rem;">
            ${Icons.museum}
            <span>Quản Lý Gian Sảnh 360°</span>
          </a>
          <a href="#admin-tour360" class="btn btn-primary" style="text-decoration: none; font-size: 0.85rem; padding: 0.55rem 1rem;">
            ${Icons.compass}
            <span>Ghim Cổ Vật Tour 360° →</span>
          </a>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 380px 1fr; gap: 1.5rem; align-items: start;">
        <!-- Left Column: Create Walk Node Form -->
        <div class="card" style="padding: 1.25rem; border: 1px solid var(--color-card-border);">
          <h2 style="font-size: 1.1rem; font-weight: 700; color: var(--color-primary); margin-top: 0; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            ${Icons.plus}
            <span>Thêm Điểm Bước Chân Mới</span>
          </h2>

          <form id="form-add-walk-node">
            <div class="form-group" style="margin-bottom: 1rem;">
              <label style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-main); display: block; margin-bottom: 0.4rem;">
                1. Chọn Gian Sảnh Trưng Bày 360°:
              </label>
              <select class="form-control" id="select-node-room" style="width: 100%; padding: 0.6rem; font-size: 0.85rem; border-radius: var(--radius-sm);">
                ${rooms.map((r) => `<option value="${r.id}">${r.name} (${r.nodes.length} Nút hiện có)</option>`).join("")}
              </select>
            </div>

            <div class="form-group" style="margin-bottom: 1rem;">
              <label style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-main); display: block; margin-bottom: 0.4rem;">
                2. Tên Điểm Quan Sát / Bước Chân:
              </label>
              <input type="text" class="form-control" id="input-node-name" placeholder="Ví dụ: Vị Trí Trước Tượng Phật Đồng Dương..." required style="width: 100%; padding: 0.6rem; font-size: 0.85rem; border-radius: var(--radius-sm);" />
            </div>

            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-main); display: block; margin-bottom: 0.4rem;">
                3. Tọa Độ Không Gian (Tự Động Tính Toán X, Z):
              </label>
              <div style="font-size: 0.78rem; color: var(--color-text-muted); background: rgba(var(--color-surface-rgb), 0.5); padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--color-card-border);">
                Hệ tọa độ bước chân tương đối trong không gian 3D. Tự động liên kết với nút trung tâm liền kề.
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.65rem; font-size: 0.88rem; font-weight: 700; justify-content: center;">
              ${Icons.plus}
              <span>Khởi Tạo Điểm Walk Node</span>
            </button>
          </form>
        </div>

        <!-- Right Column: List of Walk Nodes Grouped by Room -->
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          ${rooms
            .map(
              (room) => `
            <div class="card" style="padding: 1.25rem; border: 1px solid var(--color-card-border);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--color-card-border); padding-bottom: 0.75rem;">
                <div>
                  <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--color-primary); margin: 0;">
                    ${room.name}
                  </h3>
                  <div style="font-size: 0.78rem; color: var(--color-text-muted); margin-top: 0.2rem;">
                    ${room.eraTitle} • Tháp Panorama 360°
                  </div>
                </div>

                <span class="badge-pill" style="font-size: 0.75rem; padding: 3px 10px;">
                  ${room.nodes.length} Walk Nodes
                </span>
              </div>

              <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
                  <thead>
                    <tr style="border-bottom: 1px solid var(--color-card-border); color: var(--color-text-muted); font-size: 0.78rem; text-transform: uppercase;">
                      <th style="padding: 0.6rem;">STT</th>
                      <th style="padding: 0.6rem;">Mã Node</th>
                      <th style="padding: 0.6rem;">Tên Điểm Quan Sát</th>
                      <th style="padding: 0.6rem;">Tọa Độ (X, Y, Z)</th>
                      <th style="padding: 0.6rem; text-align: right;">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${
                      room.nodes.length === 0
                        ? `<tr><td colspan="5" style="padding: 1.5rem; text-align: center; color: var(--color-text-muted);">Chưa có điểm quan sát nào trong gian sảnh này.</td></tr>`
                        : room.nodes
                            .map(
                              (node, idx) => `
                        <tr style="border-bottom: 1px solid var(--color-card-border);">
                          <td style="padding: 0.65rem; font-weight: 700; color: var(--color-primary);">${idx + 1}</td>
                          <td style="padding: 0.65rem; font-family: var(--font-family-mono); font-size: 0.78rem; color: var(--color-text-muted);">${node.id}</td>
                          <td style="padding: 0.65rem; font-weight: 600; color: var(--color-text-main);">${node.name}</td>
                          <td style="padding: 0.65rem; font-family: var(--font-family-mono); font-size: 0.78rem;">
                            (${node.position.x}, ${node.position.y}, ${node.position.z})
                          </td>
                          <td style="padding: 0.65rem; text-align: right;">
                            <button class="btn btn-danger btn-delete-node" data-room-id="${room.id}" data-node-id="${node.id}" style="padding: 3px 8px; font-size: 0.75rem;">
                              ${Icons.trash}
                              <span>Xóa</span>
                            </button>
                          </td>
                        </tr>
                      `
                            )
                            .join("")
                    }
                  </tbody>
                </table>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
}

export function initAdminNodesListeners() {
  const form = document.getElementById("form-add-walk-node");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const roomId = (document.getElementById("select-node-room") as HTMLSelectElement).value;
      const nameInput = document.getElementById("input-node-name") as HTMLInputElement;
      const name = nameInput.value.trim();

      if (!name) return;

      const created = MuseumConfigStore.addWalkNode(roomId, name);
      if (created) {
        showToast(`Đã thêm điểm bước chân "${name}" thành công!`, "success");
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    });
  }

  document.querySelectorAll(".btn-delete-node").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const target = e.currentTarget as HTMLElement;
      const roomId = target.getAttribute("data-room-id");
      const nodeId = target.getAttribute("data-node-id");

      if (roomId && nodeId && confirm("Bạn có chắc chắn muốn xóa điểm Walk Node này không?")) {
        MuseumConfigStore.deleteWalkNode(roomId, nodeId);
        showToast("Đã xóa điểm Walk Node thành công!", "success");
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    });
  });
}
