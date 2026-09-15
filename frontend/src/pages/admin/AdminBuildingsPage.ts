import { MapConfigStore } from "../../data/mapData";
import { Icons } from "../../components/Icons";

export function renderAdminBuildingsPage(): string {
  const buildings = MapConfigStore.buildings;

  return `
    <div class="page-viewport" style="max-width: 1400px; padding: 1.5rem 2rem;">
      <!-- Breadcrumb & Header -->
      <div style="margin-bottom: 1.75rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
          <span style="font-size: 0.72rem; font-weight: 700; color: var(--color-primary); letter-spacing: 0.05em; text-transform: uppercase;">
            CỔNG QUẢN TRỊ ADMIN / TRANG QUẢN LÝ TÒA NHÀ KIẾN TRÚC
          </span>
          <span style="font-size: 0.75rem; color: var(--color-text-muted);">•</span>
          <span class="badge-pill" style="font-size: 0.7rem; padding: 1px 8px; background: rgba(56, 189, 248, 0.15); color: #0284c7; border-color: #38bdf8;">
            Building CMS Store
          </span>
        </div>
        <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--color-text-main); margin: 0 0 0.25rem 0;">
          Trang Quản Lý & Thêm Tòa Nhà Kiến Trúc Bảo Tàng
        </h1>
        <p style="font-size: 0.85rem; color: var(--color-text-muted); margin: 0;">
          Trang riêng biệt để Admin quản lý các Tòa Nhà, Tầng triển lãm và sơ đồ khối kiến trúc. Dữ liệu nạp tại đây tự động xuất hiện trên menu Select chọn Tòa Nhà ở trang Sơ Đồ Mặt Bằng 2.5D.
        </p>
      </div>

      <!-- Creation Form Card -->
      <div class="card" style="border-top: 4px solid var(--color-primary); margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <h3 style="font-size: 1.15rem; color: var(--color-primary); margin: 0; font-weight: 800;">
            🏢 Khởi Tạo Tòa Nhà Kiến Trúc Mới Vào CMS
          </h3>
          <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px; background: rgba(34, 197, 94, 0.15); color: #16A34A; border-color: #22C55E;">
            Building Store Active
          </span>
        </div>
        <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1.25rem;">
          Nhập mã tòa nhà (VD: TÒA D) và tên công trình. Tòa nhà mới sẽ được tự động tích hợp vào hệ thống sơ đồ tầng.
        </p>

        <form id="page-create-bldg-form" style="display: grid; grid-template-columns: 1fr 1fr 2fr 1.2fr; gap: 1.25rem; align-items: flex-end;">
          <div>
            <label style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-main); display: block; margin-bottom: 0.3rem;">
              Mã / Ký Hiệu Tòa Nhà:
            </label>
            <input type="text" id="pg-bldg-code-input" class="lang-select" style="width: 100%; padding: 0.7rem;" placeholder="VD: TÒA D" required />
          </div>

          <div>
            <label style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-main); display: block; margin-bottom: 0.3rem;">
              Tên Tòa Nhà Mới:
            </label>
            <input type="text" id="pg-bldg-name-input" class="lang-select" style="width: 100%; padding: 0.7rem;" placeholder="VD: Tòa D - Triển Lãm Đương Đại" required />
          </div>

          <div>
            <label style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-main); display: block; margin-bottom: 0.3rem;">
              Mô Tả Công Trình Kiến Trúc:
            </label>
            <input type="text" id="pg-bldg-desc-input" class="lang-select" style="width: 100%; padding: 0.7rem;" placeholder="Khối nhà triển lãm 2 tầng di sản..." />
          </div>

          <button type="submit" class="btn btn-primary" style="padding: 0.75rem; font-weight: 800; justify-content: center;">
            <span>🏢</span> Thêm Tòa Nhà Mới
          </button>
        </form>
      </div>

      <!-- Table of Buildings -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3 style="font-size: 1.15rem; color: var(--color-primary); margin: 0; font-weight: 800;">
            Danh Sách ${buildings.length} Tòa Nhà Trong Sơ Đồ Kiến Trúc
          </h3>
          <span class="badge-pill" style="font-size: 0.75rem; padding: 2px 10px;">
            Synchronized
          </span>
        </div>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
            <thead>
              <tr style="border-bottom: 1px solid var(--color-card-border); color: var(--color-text-muted);">
                <th style="padding: 0.75rem;">Mã Tòa</th>
                <th style="padding: 0.75rem;">Tên Tòa Nhà Kiến Trúc</th>
                <th style="padding: 0.75rem;">Số Tầng</th>
                <th style="padding: 0.75rem;">Mô Tả Công Trình</th>
                <th style="padding: 0.75rem; text-align: center;">Chuyển Sang Sơ Đồ</th>
              </tr>
            </thead>
            <tbody>
              ${buildings
                .map(
                  (b) => `
                <tr style="border-bottom: 1px solid var(--color-card-border);">
                  <td style="padding: 0.75rem; font-family: var(--font-family-mono); font-weight: 700; color: var(--color-primary);">${b.code}</td>
                  <td style="padding: 0.75rem; font-weight: 800; color: var(--color-text-main);">${b.name}</td>
                  <td style="padding: 0.75rem; font-weight: 700;">${b.floors.length} Tầng</td>
                  <td style="padding: 0.75rem; color: var(--color-text-muted);">${b.description}</td>
                  <td style="padding: 0.75rem; text-align: center;">
                    <a href="#admin-map" class="btn btn-secondary" style="font-size: 0.78rem; padding: 0.3rem 0.7rem; text-decoration: none;">
                      Sang Trang Sơ Đồ 2.5D →
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

export function initAdminBuildingsPage() {
  const createBldgForm = document.getElementById("page-create-bldg-form");
  if (createBldgForm) {
    createBldgForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const codeInput = document.getElementById("pg-bldg-code-input") as HTMLInputElement;
      const nameInput = document.getElementById("pg-bldg-name-input") as HTMLInputElement;
      const descInput = document.getElementById("pg-bldg-desc-input") as HTMLInputElement;

      if (nameInput && nameInput.value.trim()) {
        const newBldg = MapConfigStore.addBuilding(
          nameInput.value.trim(),
          codeInput?.value.trim().toUpperCase() || "TÒA MỚI",
          descInput?.value.trim() || "Tòa nhà mới bổ sung từ CMS."
        );
        alert(`🎉 Đã thêm thành công Tòa nhà mới: [${newBldg.code} - ${newBldg.name}] vào Kho CMS!`);
        window.location.hash = "#admin-map"; // Jump to map page immediately
      }
    });
  }
}
