import { MuseumConfigStore, FeatureToggles, LanguagePackage } from "../../data/museumConfig";
import { Icons } from "../../components/Icons";
import { showToast } from "../../components/Toast";
import { WORLD_LANGUAGES_CATALOG, WorldLanguageItem } from "../../data/worldLanguages";

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

          <!-- Language Packages Management -->
          <div class="card" style="border-top: 4px solid #0284c7;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
              <h3 style="font-size: 1.1rem; color: var(--color-primary); margin: 0;">
                3. Quản Lý Gói Ngôn Ngữ Hệ Thống (Toàn Cầu)
              </h3>
              <span class="badge-pill" style="font-size: 0.72rem; background: #e0f2fe; color: #0369a1;">
                ISO 639-1 / BCP 47
              </span>
            </div>
            <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1rem;">
              Admin có thể thêm bất kỳ ngôn ngữ nào trên thế giới và bật/tắt kích hoạt. Chỉ các ngôn ngữ được tích chọn mới hiển thị ở giao diện Du khách (Client).
            </p>

            <!-- Search & Add World Language (like Google Translate) -->
            <div style="position: relative; margin-bottom: 1.25rem;">
              <div style="display: flex; gap: 0.5rem;">
                <div style="flex: 1; position: relative;">
                  <input 
                    type="text" 
                    id="admin-lang-search-input" 
                    class="lang-select" 
                    style="width: 100%; padding: 0.65rem 0.85rem; font-size: 0.85rem;" 
                    placeholder="Tìm theo mã (th, ru, it, zh-TW...) hoặc tên (Tiếng Thái, Russian, French...)" 
                    autocomplete="off"
                  />
                </div>
              </div>

              <!-- Search Results Dropdown -->
              <div id="admin-lang-search-results" style="display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: var(--color-surface); border: 1px solid var(--color-card-border); border-radius: var(--radius-sm); max-height: 220px; overflow-y: auto; z-index: 50; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
                <!-- Populated dynamically via JS -->
              </div>
            </div>

            <!-- List of Configured Languages -->
            <div style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 320px; overflow-y: auto; padding-right: 4px;">
              ${allLanguages.map(l => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0.85rem; background: rgba(var(--color-surface-rgb), 0.35); border: 1px solid var(--color-card-border); border-radius: var(--radius-sm); font-size: 0.82rem;">
                  <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <span style="font-size: 1.2rem;">${l.flag || '🌐'}</span>
                    <div>
                      <span style="font-weight: 700; color: var(--color-text-main);">${l.label}</span>
                      <div style="font-size: 0.72rem; color: var(--color-text-muted);">Voice: <code>${l.speechCode}</code> ${l.customAdded ? '• <span style="color:#0284c7;">Tự thêm</span>' : ''}</div>
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer; font-size: 0.76rem; font-weight: 600; color: ${l.active ? 'var(--color-primary)' : 'var(--color-text-muted)'};">
                      <span>${l.active ? 'Đang Bật' : 'Đã Tắt'}</span>
                      <input type="checkbox" class="lang-toggle-cb" data-lang="${l.code}" ${l.active ? 'checked' : ''} />
                    </label>

                    ${l.customAdded ? `
                      <button class="btn-delete-lang" data-lang="${l.code}" title="Xóa ngôn ngữ này" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 2px 6px; font-size: 0.85rem;">
                        ✕
                      </button>
                    ` : ''}
                  </div>
                </div>
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
      showToast("Đã lưu và cập nhật thông tin thương hiệu bảo tàng thành công!", "success");
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

  // Toggle active/inactive for languages
  const langCheckboxes = document.querySelectorAll(".lang-toggle-cb");
  langCheckboxes.forEach(cb => {
    cb.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      const langCode = target.getAttribute("data-lang");
      if (langCode) {
        MuseumConfigStore.toggleLanguageActive(langCode, target.checked);
        showToast(
          target.checked 
            ? `Đã kích hoạt ngôn ngữ [${langCode.toUpperCase()}]. Du khách có thể chọn ngôn ngữ này.` 
            : `Đã vô hiệu hóa [${langCode.toUpperCase()}]. Ngôn ngữ này đã bị ẩn khỏi thanh chọn của Du khách.`,
          "info"
        );
      }
    });
  });

  // Search & Add World Languages (like Google Translate search)
  const langSearchInput = document.getElementById("admin-lang-search-input") as HTMLInputElement;
  const langSearchResults = document.getElementById("admin-lang-search-results");

  if (langSearchInput && langSearchResults) {
    langSearchInput.addEventListener("input", () => {
      const q = langSearchInput.value.trim().toLowerCase();
      if (!q) {
        langSearchResults.style.display = "none";
        langSearchResults.innerHTML = "";
        return;
      }

      const existingCodes = MuseumConfigStore.languages.map(l => l.code.toLowerCase());
      const matches = WORLD_LANGUAGES_CATALOG.filter(w => 
        w.code.toLowerCase().includes(q) ||
        w.name.toLowerCase().includes(q) ||
        w.nativeName.toLowerCase().includes(q)
      );

      if (matches.length === 0) {
        langSearchResults.innerHTML = `
          <div style="padding: 0.75rem 1rem; font-size: 0.8rem; color: var(--color-text-muted);">
            Không tìm thấy ngôn ngữ phù hợp với "${q}".
          </div>
        `;
        langSearchResults.style.display = "block";
        return;
      }

      langSearchResults.innerHTML = matches.slice(0, 10).map(m => {
        const isAdded = existingCodes.includes(m.code.toLowerCase());
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0.85rem; border-bottom: 1px solid var(--color-card-border); font-size: 0.82rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span>${m.flag}</span>
              <div>
                <span style="font-weight: 700;">${m.name}</span> (${m.nativeName})
                <span class="badge-pill" style="padding: 1px 6px; font-size: 0.7rem;">${m.code.toUpperCase()}</span>
              </div>
            </div>
            ${isAdded ? `
              <span style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: 600;">Đã có trong hệ thống</span>
            ` : `
              <button class="btn btn-primary btn-add-world-lang" data-code="${m.code}" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;">
                + Thêm Ngôn Ngữ
              </button>
            `}
          </div>
        `;
      }).join("");

      langSearchResults.style.display = "block";

      // Add click listeners to Add buttons
      langSearchResults.querySelectorAll(".btn-add-world-lang").forEach(btn => {
        btn.addEventListener("click", async (ev) => {
          ev.stopPropagation();
          const code = btn.getAttribute("data-code");
          if (!code) return;

          const langItem = WORLD_LANGUAGES_CATALOG.find(w => w.code === code);
          if (!langItem) return;

          // Dispatch to server API
          try {
            await fetch("http://localhost:3000/api/v1/languages", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code: langItem.code })
            });
          } catch (_) {}

          // Add to frontend store
          const newPkg: LanguagePackage = {
            code: langItem.code,
            label: `${langItem.code.toUpperCase()} - ${langItem.nativeName}`,
            speechCode: langItem.speechCode,
            active: true,
            name: langItem.name,
            nativeName: langItem.nativeName,
            flag: langItem.flag,
            customAdded: true
          };

          MuseumConfigStore.addLanguagePackage(newPkg);
          showToast(`Đã thêm ngôn ngữ [${langItem.name} - ${langItem.nativeName}] vào hệ thống thành công!`, "success");
          
          langSearchInput.value = "";
          langSearchResults.style.display = "none";
          window.dispatchEvent(new HashChangeEvent("hashchange"));
        });
      });
    });

    // Close dropdown on outer click
    document.addEventListener("click", (e) => {
      if (!langSearchInput.contains(e.target as Node) && !langSearchResults.contains(e.target as Node)) {
        langSearchResults.style.display = "none";
      }
    });
  }

  // Delete custom language buttons
  const deleteLangBtns = document.querySelectorAll(".btn-delete-lang");
  deleteLangBtns.forEach(btn => {
    btn.addEventListener("click", async () => {
      const code = btn.getAttribute("data-lang");
      if (!code) return;

      try {
        await fetch(`http://localhost:3000/api/v1/languages/${code}`, {
          method: "DELETE"
        });
      } catch (_) {}

      MuseumConfigStore.removeLanguagePackage(code);
      showToast(`Đã gỡ bỏ ngôn ngữ [${code.toUpperCase()}] khỏi hệ thống.`, "info");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  });

  const publishAnnBtn = document.getElementById("btn-publish-announcement");
  const annInput = document.getElementById("new-announcement-input") as HTMLInputElement;
  if (publishAnnBtn && annInput) {
    publishAnnBtn.addEventListener("click", () => {
      const val = annInput.value.trim();
      if (!val) {
        showToast("Vui lòng nhập nội dung thông báo phát thanh!", "warning");
        return;
      }
      MuseumConfigStore.addAnnouncement(val);
      annInput.value = "";
      showToast("Đã phát loa thông báo thành công đến toàn thể du khách!", "success");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }
}
