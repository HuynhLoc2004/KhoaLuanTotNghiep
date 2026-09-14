import { MuseumConfigStore, FeatureToggles } from "../../data/museumConfig";
import { Icons } from "../../components/Icons";

export function renderAdminSettingsPage(): string {
  const branding = MuseumConfigStore.branding;
  const features = MuseumConfigStore.features;
  const allLanguages = MuseumConfigStore.languages;

  return `
    <div class="page-viewport" style="max-width: 1400px; padding: 1.5rem 2rem;">
      <!-- Breadcrumb & Header -->
      <div style="margin-bottom: 1.75rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
          <span style="font-size: 0.72rem; font-weight: 700; color: var(--color-primary); letter-spacing: 0.05em; text-transform: uppercase;">
            CỔNG QUẢN TRỊ ADMIN / CẤU HÌNH HỆ THỐNG & NGÔN NGỮ
          </span>
          <span style="font-size: 0.75rem; color: var(--color-text-muted);">•</span>
          <span class="badge-pill" style="font-size: 0.7rem; padding: 1px 8px; background: rgba(56, 189, 248, 0.15); color: #0284c7; border-color: #38bdf8;">
            Multi-Museum CMS
          </span>
        </div>
        <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--color-text-main); margin: 0 0 0.25rem 0;">
          Cấu Hình Thương Hiệu, Tính Năng & Gói Ngôn Ngữ
        </h1>
        <p style="font-size: 0.85rem; color: var(--color-text-muted); margin: 0;">
          Tùy biến tên bảo tàng, biểu trưng, bật/tắt các module tính năng và quản lý danh mục ngôn ngữ hỗ trợ du khách quốc tế.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 2rem; margin-bottom: 2rem; align-items: start;">
        <!-- Left: Museum Branding Form -->
        <div class="card" style="border-top: 4px solid var(--color-primary);">
          <h3 style="font-size: 1.1rem; color: var(--color-primary); margin-bottom: 0.5rem;">
            1. Cấu Hình Thương Hiệu Bảo Tàng (Multi-Museum CMS)
          </h3>
          <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1.25rem;">
            Thay đổi tên hoặc khẩu hiệu tại đây sẽ tự động cập nhật ngay lập tức trên toàn bộ giao diện Web du khách.
          </p>

          <form id="branding-settings-form">
            <div style="margin-bottom: 0.85rem;">
              <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.3rem;">
                Tên Bảo Tàng:
              </label>
              <input type="text" id="setting-museum-name" class="lang-select" style="width: 100%; padding: 0.65rem;" value="${branding.name}" />
            </div>

            <div style="margin-bottom: 0.85rem;">
              <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.3rem;">
                Khẩu Hiệu / Tiêu Đề Phụ:
              </label>
              <input type="text" id="setting-museum-subname" class="lang-select" style="width: 100%; padding: 0.65rem;" value="${branding.subName}" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; margin-bottom: 0.85rem;">
              <div>
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.3rem;">
                  Đơn Vị Chủ Quản:
                </label>
                <input type="text" id="setting-museum-unit" class="lang-select" style="width: 100%; padding: 0.65rem;" value="${branding.unit}" />
              </div>
              <div>
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.3rem;">
                  Số Điện Thoại Hotline:
                </label>
                <input type="text" id="setting-museum-hotline" class="lang-select" style="width: 100%; padding: 0.65rem;" value="${branding.hotline}" />
              </div>
            </div>

            <div style="margin-bottom: 1.25rem;">
              <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.3rem;">
                Địa Chỉ Trụ Sở:
              </label>
              <input type="text" id="setting-museum-address" class="lang-select" style="width: 100%; padding: 0.65rem;" value="${branding.address}" />
            </div>

            <button type="button" class="btn btn-primary" id="btn-save-branding" style="width: 100%; padding: 0.75rem; justify-content: center;">
              ${Icons.check}
              <span>Lưu Thay Đổi & Cập Nhật Sang Web Du Khách</span>
            </button>
          </form>
        </div>

        <!-- Right: Feature Toggles & Language Packages -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <!-- Feature Flags -->
          <div class="card" style="border-top: 4px solid var(--color-secondary);">
            <h3 style="font-size: 1.1rem; color: var(--color-primary); margin-bottom: 0.4rem;">
              2. Công Tắc Bật / Tắt Tính Năng (Feature Flags)
            </h3>
            <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1rem;">
              Khi tắt một tính năng, tính năng đó sẽ tự động ẩn khỏi menu điều hướng của du khách.
            </p>

            <div style="display: flex; flex-direction: column; gap: 0.65rem;">
              ${[
                { key: 'enableTour360', label: 'Tour Ảo VR 360° Bước Đi', desc: 'Sảnh panorama và ghim cổ vật' },
                { key: 'enable3D', label: 'Mô Hình 3D WebGL Tương Tác', desc: 'Kéo xoay 360 độ hiện vật' },
                { key: 'enableVoiceAI', label: 'Voice AI Đọc Bảng Chú Thích', desc: 'Giọng đọc tự động đa ngôn ngữ' },
                { key: 'enableQuiz', label: 'Trò Chơi Đố Vui & Sổ Tem Số', desc: 'Mini-game thử thách kiến thức' },
                { key: 'enableTourBooking', label: 'Đặt Lịch Tour Theo Lớp & Đoàn', desc: 'Đăng ký ca giờ và cấp vé QR' },
                { key: 'enableBroadcast', label: 'Loa Phát Thanh Trực Tiếp', desc: 'Dòng tin phát thanh ở thanh bên' },
                { key: 'enablePassport', label: 'Hộ Chiếu & Hồ Sơ Du Khách', desc: 'Tích lũy tem và cấp bậc' }
              ].map(f => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.75rem; border-radius: var(--radius-sm); background: rgba(var(--color-surface-rgb), 0.25); border: 1px solid var(--color-card-border);">
                  <div>
                    <div style="font-weight: 700; color: var(--color-text-main); font-size: 0.82rem;">${f.label}</div>
                    <div style="font-size: 0.7rem; color: var(--color-text-muted);">${f.desc}</div>
                  </div>
                  <label style="position: relative; display: inline-block; width: 42px; height: 22px;">
                    <input type="checkbox" class="feature-toggle-checkbox" data-feature="${f.key}" ${(features as any)[f.key] ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;" />
                    <span style="position: absolute; cursor: pointer; inset: 0; background-color: ${(features as any)[f.key] ? 'var(--color-primary)' : '#CBD5E1'}; transition: .2s; border-radius: 22px;">
                      <span style="position: absolute; height: 16px; width: 16px; left: ${(features as any)[f.key] ? '22px' : '3px'}; bottom: 3px; background-color: white; transition: .2s; border-radius: 50%;"></span>
                    </span>
                  </label>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Language Packages -->
          <div class="card" style="border-top: 4px solid #0284c7;">
            <h3 style="font-size: 1.1rem; color: var(--color-primary); margin-bottom: 0.4rem;">
              3. Quản Lý Gói Ngôn Ngữ Hệ Thống
            </h3>
            <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1rem;">
              Bật/tắt các gói ngôn ngữ quốc tế. Danh sách chọn ngôn ngữ của Du khách sẽ tự cập nhật đồng bộ ngay tức khắc.
            </p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem;">
              ${allLanguages.map(l => `
                <label style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.75rem; background: rgba(var(--color-surface-rgb), 0.3); border: 1px solid var(--color-card-border); border-radius: var(--radius-sm); font-size: 0.8rem; font-weight: 600; cursor: pointer;">
                  <span>${l.label}</span>
                  <input type="checkbox" class="lang-toggle-cb" data-lang="${l.code}" ${l.active ? 'checked' : ''} />
                </label>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Emergency Broadcast Announcement -->
      <div class="card">
        <h3 style="font-size: 1.1rem; color: var(--color-primary); margin-bottom: 0.4rem;">
          4. Phát Thông Báo Trực Tiếp Đến Du Khách (Live Broadcast)
        </h3>
        <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1rem;">
          Thông báo này sẽ xuất hiện ngay lập tức tại hộp Loa Bảo Tàng trên màn hình du khách.
        </p>

        <div style="display: flex; gap: 0.75rem;">
          <input type="text" id="new-announcement-input" class="lang-select" style="flex: 1; padding: 0.75rem;" placeholder="Nhập nội dung thông báo phát thanh khẩn cấp..." />
          <button class="btn btn-primary" id="btn-publish-announcement" style="padding: 0.75rem 1.5rem; justify-content: center;">
            Phát Loa Ngay
          </button>
        </div>
      </div>
    </div>
  `;
}

export function initAdminSettingsPage() {
  const saveBrandingBtn = document.getElementById("btn-save-branding");
  if (saveBrandingBtn) {
    saveBrandingBtn.addEventListener("click", () => {
      const name = (document.getElementById("setting-museum-name") as HTMLInputElement)?.value;
      const subName = (document.getElementById("setting-museum-subname") as HTMLInputElement)?.value;
      const unit = (document.getElementById("setting-museum-unit") as HTMLInputElement)?.value;
      const address = (document.getElementById("setting-museum-address") as HTMLInputElement)?.value;
      const hotline = (document.getElementById("setting-museum-hotline") as HTMLInputElement)?.value;

      MuseumConfigStore.updateBranding({ name, subName, unit, address, hotline });
      alert("Đã lưu và cập nhật thông tin thương hiệu bảo tàng thành công!");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }

  const featureCheckboxes = document.querySelectorAll(".feature-toggle-checkbox");
  featureCheckboxes.forEach(cb => {
    cb.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      const key = target.getAttribute("data-feature") as keyof FeatureToggles;
      if (key) {
        MuseumConfigStore.toggleFeature(key, target.checked);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    });
  });

  const langCheckboxes = document.querySelectorAll(".lang-toggle-cb");
  langCheckboxes.forEach(cb => {
    cb.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      const langCode = target.getAttribute("data-lang");
      if (langCode) {
        MuseumConfigStore.toggleLanguageActive(langCode, target.checked);
      }
    });
  });

  const publishAnnBtn = document.getElementById("btn-publish-announcement");
  const annInput = document.getElementById("new-announcement-input") as HTMLInputElement;
  if (publishAnnBtn && annInput) {
    publishAnnBtn.addEventListener("click", () => {
      const val = annInput.value.trim();
      if (!val) {
        alert("Vui lòng nhập nội dung thông báo phát thanh!");
        return;
      }
      MuseumConfigStore.addAnnouncement(val);
      annInput.value = "";
      alert("Đã phát loa thông báo thành công đến toàn thể du khách!");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }
}
