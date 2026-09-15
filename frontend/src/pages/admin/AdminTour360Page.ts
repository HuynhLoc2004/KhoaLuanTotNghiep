import { MuseumConfigStore } from "../../data/museumConfig";
import { ArtifactsStore } from "../../data/artifacts";
import { Icons } from "../../components/Icons";
import { AdminCaptureModal } from "../../components/virtual-tour/AdminCaptureModal";

let selectedTourRoomId: string = "room-champa";

export function renderAdminTour360Page(): string {
  const rooms = MuseumConfigStore.rooms360;
  const activeRoom = rooms.find((r) => r.id === selectedTourRoomId) || rooms[0];
  const allArtifacts = ArtifactsStore.getAll();

  return `
    <div class="page-viewport" style="max-width: 1400px; padding: 1.5rem 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.75rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: var(--color-primary); letter-spacing: 0.05em; text-transform: uppercase;">
              CỔNG QUẢN TRỊ ADMIN / KHÔNG GIAN 3D GAUSSIAN SPLATTING & 360°
            </span>
            <span style="font-size: 0.75rem; color: var(--color-text-muted);">•</span>
            <span class="badge-pill" style="font-size: 0.7rem; padding: 1px 8px; background: rgba(56, 189, 248, 0.15); color: #0284c7; border-color: #38bdf8;">
              CMS Dynamic Engine
            </span>
          </div>
          <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--color-text-main); margin: 0 0 0.25rem 0;">
            Quản Lý Sảnh Tour Ảo 360° & Tái Tạo Không Gian 3DGS
          </h1>
          <p style="font-size: 0.85rem; color: var(--color-text-muted); margin: 0;">
            Quay video gian phòng trực tiếp bằng camera, tải lên ảnh chi tiết 8K và tự động chạy pipeline 3DGS lên server.
          </p>
        </div>

        <button id="btn-open-3dgs-studio" class="btn btn-primary" style="padding: 0.75rem 1.5rem; font-weight: 800; font-size: 0.9rem; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);">
          <span>📹</span> Bật Camera Quay Video & Tải Lên 3DGS Studio
        </button>
      </div>

      <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 1.5rem; margin-bottom: 2rem; align-items: start;">
        <!-- Left: Add Showcase Pin Form via Dynamic Selects -->
        <div class="card" style="border-top: 4px solid var(--color-primary);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <h3 style="font-size: 1.1rem; color: var(--color-primary); margin: 0;">
              Ghim Cổ Vật Vào Sảnh 360° (Dữ Liệu Động Từ CMS)
            </h3>
            <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px; background: rgba(34, 197, 94, 0.15); color: #16A34A; border-color: #22C55E;">
              Dynamic CMS Active
            </span>
          </div>
          <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1.25rem;">
            Dữ liệu gian phòng, cổ vật và điểm bước chân được nạp động từ Kho Dữ Liệu CMS Bảo Tàng. Admin có thể thêm mới bất kỳ lúc nào.
          </p>

          <form id="add-tour-pin-form">
            <!-- 1. Select Room -->
            <div style="margin-bottom: 0.85rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                <label style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-main);">
                  1. Chọn Gian Sảnh Trưng Bày:
                </label>
                <button type="button" id="btn-quick-add-room" style="background: none; border: none; font-size: 0.78rem; font-weight: 700; color: var(--color-primary); cursor: pointer;">
                  + Thêm Sảnh Mới
                </button>
              </div>
              <select id="admin-pin-room-select" class="lang-select" style="width: 100%; padding: 0.65rem; font-weight: 600;">
                ${rooms.map((r) => `<option value="${r.id}" ${r.id === activeRoom.id ? "selected" : ""}>${r.name} (${r.eraTitle})</option>`).join("")}
                <option value="__ADD_NEW_ROOM__" style="color: var(--color-primary); font-weight: 700;">➕ [Thêm Gian Sảnh 360° Mới Từ CMS...]</option>
              </select>
            </div>

            <!-- 2. Select Artifact -->
            <div style="margin-bottom: 0.85rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                <label style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-main);">
                  2. Chọn Hiện Vật Cần Ghim (Tải Động Từ Kho Dữ Liệu CMS):
                </label>
                <a href="#admin-artifacts" style="font-size: 0.78rem; font-weight: 700; color: var(--color-primary); text-decoration: none;">
                  + Thêm Hiện Vật Vào Kho
                </a>
              </div>
              <select id="admin-pin-artifact-select" class="lang-select" style="width: 100%; padding: 0.65rem; font-weight: 600;">
                ${allArtifacts.map((a) => `<option value="${a.id}" data-name="${a.name}" data-era="${a.era}">${a.name} • ${a.era} [${a.code}]</option>`).join("")}
                <option value="__ADD_NEW_ARTIFACT__" style="color: var(--color-primary); font-weight: 700;">➕ [Tạo Hiện Vật Mới & Ghim Ngay...]</option>
              </select>
            </div>

            <!-- 3. Select Walk Node Anchor -->
            <div style="margin-bottom: 1.25rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                <label style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-main);">
                  3. Chọn Điểm Quan Sát Gần Nhất (Walk Node Anchor):
                </label>
                <button type="button" id="btn-quick-add-node" style="background: none; border: none; font-size: 0.78rem; font-weight: 700; color: var(--color-primary); cursor: pointer;">
                  + Thêm Điểm Đứng
                </button>
              </div>
              <select id="admin-pin-node-select" class="lang-select" style="width: 100%; padding: 0.65rem; font-weight: 600;">
                ${activeRoom.nodes.map((n) => `<option value="${n.id}">${n.name} (Tọa độ X:${n.position.x}, Z:${n.position.z})</option>`).join("")}
                <option value="__ADD_NEW_NODE__" style="color: var(--color-primary); font-weight: 700;">➕ [Thêm Điểm Bước Chân Walk Node Mới...]</option>
              </select>
            </div>

            <button type="button" class="btn btn-primary" id="btn-add-tour-pin" style="width: 100%; padding: 0.75rem; justify-content: center; font-weight: 800;">
              ${Icons.check}
              <span>Thêm Điểm Ghim Cổ Vật Vào Sảnh 360°</span>
            </button>
          </form>
        </div>

        <!-- Right: Room Status & Walk Nodes -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
            <h3 style="font-size: 1.1rem; color: var(--color-primary); margin: 0;">
              ${activeRoom.name}
            </h3>
            <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px;">
              ${activeRoom.eraTitle}
            </span>
          </div>
          <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1rem;">
            ${activeRoom.description}
          </p>

          <div style="background: rgba(var(--color-surface-rgb), 0.3); border: 1px solid var(--color-card-border); border-radius: var(--radius-md); padding: 0.85rem; margin-bottom: 1.25rem;">
            <div style="font-size: 0.78rem; font-weight: 700; color: var(--color-primary); margin-bottom: 0.4rem; display: flex; justify-content: space-between;">
              <span>CÁC ĐIỂM ĐỨNG BƯỚC CHÂN (WALK NODES TỰ ĐỘNG):</span>
              <span style="color: var(--color-text-muted); font-size: 0.75rem;">${activeRoom.nodes.length} Nút</span>
            </div>
            ${activeRoom.nodes
              .map(
                (n, i) => `
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; padding: 0.35rem 0; border-bottom: 1px solid var(--color-card-border);">
                <span style="color: var(--color-text-main); font-weight: 600;">${i + 1}. ${n.name}</span>
                <span style="color: var(--color-text-muted); font-family: var(--font-family-mono); font-size: 0.75rem;">(${n.position.x}, ${n.position.z})</span>
              </div>
            `
              )
              .join("")}
          </div>

          <a href="#tour360" class="btn btn-secondary" style="width: 100%; justify-content: center; text-decoration: none; font-size: 0.85rem; padding: 0.65rem; font-weight: 700;">
            ${Icons.compass}
            <span>Xem Trực Tiếp Trải Nghiệm 360° Phía Du Khách →</span>
          </a>
        </div>
      </div>

      <!-- Active Showcase Pins Table -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3 style="font-size: 1.1rem; color: var(--color-primary); margin: 0;">
            Danh Sách Các Điểm Ghim Cổ Vật Trong Sảnh: ${activeRoom.name}
          </h3>
          <span class="badge-pill" style="font-size: 0.75rem; padding: 2px 10px;">
            ${activeRoom.showcases.length} Điểm ghim
          </span>
        </div>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
            <thead>
              <tr style="border-bottom: 1px solid var(--color-card-border); color: var(--color-text-muted);">
                <th style="padding: 0.75rem;">Mã Ghim</th>
                <th style="padding: 0.75rem;">Tên Hiện Vật</th>
                <th style="padding: 0.75rem;">Niên Đại</th>
                <th style="padding: 0.75rem;">Tọa Độ Không Gian 3D (X, Y, Z)</th>
                <th style="padding: 0.75rem;">Gần Điểm Bước Chân</th>
                <th style="padding: 0.75rem;">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              ${
                activeRoom.showcases.length === 0
                  ? `<tr><td colspan="6" style="padding: 2rem; text-align: center; color: var(--color-text-muted);">Chưa có điểm ghim nào trong sảnh này. Hãy ghim cổ vật ở bảng trên!</td></tr>`
                  : activeRoom.showcases
                      .map(
                        (pin) => `
                <tr style="border-bottom: 1px solid var(--color-card-border);">
                  <td style="padding: 0.75rem; font-family: var(--font-family-mono); color: var(--color-primary); font-weight: 700;">${pin.id}</td>
                  <td style="padding: 0.75rem; font-weight: 700; color: var(--color-text-main);">${pin.title}</td>
                  <td style="padding: 0.75rem; color: var(--color-text-muted);">${pin.era}</td>
                  <td style="padding: 0.75rem; font-family: var(--font-family-mono); font-size: 0.8rem;">(${Math.round(pin.position.x)}, ${Math.round(pin.position.y)}, ${Math.round(pin.position.z)})</td>
                  <td style="padding: 0.75rem; color: var(--color-secondary); font-weight: 600;">${pin.roomNodeId}</td>
                  <td style="padding: 0.75rem;">
                    <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px; background: rgba(34,197,94,0.15); color: #16A34A; border-color: #22C55E;">
                      Đang Phát Sáng 3D
                    </span>
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
    </div>
  `;
}

export function initAdminTour360Page() {
  const openStudioBtn = document.getElementById("btn-open-3dgs-studio");
  if (openStudioBtn) {
    openStudioBtn.addEventListener("click", () => {
      const captureModal = new AdminCaptureModal();
      captureModal.open();
    });
  }

  const addPinBtn = document.getElementById("btn-add-tour-pin");
  const pinRoomSelect = document.getElementById("admin-pin-room-select") as HTMLSelectElement;
  const pinArtifactSelect = document.getElementById("admin-pin-artifact-select") as HTMLSelectElement;
  const pinNodeSelect = document.getElementById("admin-pin-node-select") as HTMLSelectElement;

  const quickAddRoomBtn = document.getElementById("btn-quick-add-room");
  const quickAddNodeBtn = document.getElementById("btn-quick-add-node");

  // Helper: Prompt to add a new 360 Room dynamically
  const handleAddNewRoom = () => {
    const roomName = prompt("Nhập Tên Gian Sảnh 360° Mới (Ví dụ: Sảnh Cổ Vật Hoàng Cung Triều Nguyễn):");
    if (roomName && roomName.trim()) {
      const eraTitle = prompt("Nhập Niên Đại / Thời Kỳ (Ví dụ: Thế kỷ 19):") || "Thời Kỳ Lịch Sử";
      const newRoom = MuseumConfigStore.addRoom360(roomName.trim(), eraTitle, "Gian sảnh mới được khởi tạo từ CMS.");
      selectedTourRoomId = newRoom.id;
      alert(`🎉 Đã thêm thành công gian sảnh 360° mới: [${roomName.trim()}]!`);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    } else {
      pinRoomSelect.value = selectedTourRoomId;
    }
  };

  // Helper: Prompt to add a new Walk Node dynamically
  const handleAddNewNode = () => {
    const nodeName = prompt("Nhập Tên Điểm Đứng Bước Chân Mới (Ví dụ: Vị trí Tủ Kính Phía Đông):");
    if (nodeName && nodeName.trim()) {
      MuseumConfigStore.addWalkNode(selectedTourRoomId, nodeName.trim());
      alert(`🎉 Đã thêm thành công điểm bước chân mới: [${nodeName.trim()}]!`);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    } else {
      pinNodeSelect.selectedIndex = 0;
    }
  };

  // Helper: Prompt to add a new Artifact dynamically
  const handleAddNewArtifact = () => {
    const artName = prompt("Nhập Tên Hiện Vật Mới Để Ghim (Ví dụ: Kiếm Cổ Triều Nguyễn):");
    if (artName && artName.trim()) {
      const era = prompt("Nhập Niên Đại Hiện Vật (Ví dụ: Thế kỷ 19):") || "Cổ đại";
      const newArt = ArtifactsStore.addArtifact({ name: artName.trim(), era });
      alert(`🎉 Đã thêm hiện vật mới [${artName.trim()}] vào Kho CMS thành công!`);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    } else {
      pinArtifactSelect.selectedIndex = 0;
    }
  };

  if (quickAddRoomBtn) quickAddRoomBtn.addEventListener("click", handleAddNewRoom);
  if (quickAddNodeBtn) quickAddNodeBtn.addEventListener("click", handleAddNewNode);

  if (pinRoomSelect) {
    pinRoomSelect.addEventListener("change", (e) => {
      const val = (e.target as HTMLSelectElement).value;
      if (val === "__ADD_NEW_ROOM__") {
        handleAddNewRoom();
      } else {
        selectedTourRoomId = val;
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    });
  }

  if (pinArtifactSelect) {
    pinArtifactSelect.addEventListener("change", (e) => {
      const val = (e.target as HTMLSelectElement).value;
      if (val === "__ADD_NEW_ARTIFACT__") {
        handleAddNewArtifact();
      }
    });
  }

  if (pinNodeSelect) {
    pinNodeSelect.addEventListener("change", (e) => {
      const val = (e.target as HTMLSelectElement).value;
      if (val === "__ADD_NEW_NODE__") {
        handleAddNewNode();
      }
    });
  }

  if (addPinBtn && pinRoomSelect && pinArtifactSelect && pinNodeSelect) {
    addPinBtn.addEventListener("click", () => {
      const roomId = pinRoomSelect.value;
      const artifactId = pinArtifactSelect.value;
      const opt = pinArtifactSelect.options[pinArtifactSelect.selectedIndex];

      if (artifactId === "__ADD_NEW_ARTIFACT__" || roomId === "__ADD_NEW_ROOM__" || pinNodeSelect.value === "__ADD_NEW_NODE__") {
        alert("Vui lòng chọn một hiện vật và gian sảnh hợp lệ!");
        return;
      }

      const title = opt.getAttribute("data-name") || "Hiện vật mới";
      const era = opt.getAttribute("data-era") || "Niên đại cổ";
      const nodeId = pinNodeSelect.value;

      MuseumConfigStore.addShowcasePin(roomId, artifactId, title, era, nodeId);
      alert(`🎉 Đã ghim thành công [${title}] vào không gian 360°!`);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }
}
