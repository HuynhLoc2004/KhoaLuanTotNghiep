import { Icons } from "./Icons";
import { MuseumConfigStore } from "../data/museumConfig";
import { AuthState } from "../data/auth";

export function renderLeftSidebar(activeTab: string = "home", isAdminMode = false): string {
  const branding = MuseumConfigStore.branding;
  const features = MuseumConfigStore.features;
  const currentTheme = localStorage.getItem("museum_theme") || "light";
  const lang = MuseumConfigStore.currentLanguage;

  // Dedicated Admin Studio Sidebar
  if (isAdminMode) {
    const isScan = activeTab === "admin-scan" || activeTab === "admin";
    const isArtifacts = activeTab === "admin-artifacts";
    const isRooms = activeTab === "admin-rooms";
    const isTour = activeTab === "admin-tour360";
    const isBuildings = activeTab === "admin-buildings";
    const isMap = activeTab === "admin-map";
    const isAnalytics = activeTab === "admin-analytics";
    const isSettings = activeTab === "admin-settings";
    const isRoles = activeTab === "admin-roles";

    return `
      <aside class="app-sidebar admin-sidebar" id="main-sidebar">
        <!-- Admin Brand Header -->
        <a href="#admin-scan" class="brand">
          <div class="brand-icon" style="background: linear-gradient(135deg, #1e3a8a, #0284c7); color: white;">
            ${Icons.shield}
          </div>
          <div>
            <div class="brand-title" style="letter-spacing: 0.02em;">ADMIN STUDIO</div>
            <div class="brand-subtitle" style="color: var(--color-primary); font-weight: 700;">${branding.name}</div>
          </div>
        </a>

        <!-- Admin Identity Card -->
        <div style="margin: 0.75rem 0.5rem; padding: 0.75rem 0.9rem; background: var(--color-surface); border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
          <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); font-weight: 700; margin-bottom: 0.2rem;">
            Tài Khoản Cán Bộ
          </div>
          <div style="font-size: 0.9rem; font-weight: 800; color: var(--color-primary);">${AuthState.admin.name}</div>
          <div style="font-size: 0.76rem; color: var(--color-secondary); font-weight: 600;">${AuthState.admin.roleTitle}</div>
        </div>

        <!-- Admin Workspaces Navigation (Dedicated Pages) -->
        <nav class="sidebar-nav">
          <a href="#admin-scan" class="nav-item ${isScan ? 'active' : ''}">
            ${Icons.qr}
            <span>Soát Vé Cổng (&lt;100ms)</span>
          </a>
          
          <a href="#admin-artifacts" class="nav-item ${isArtifacts ? 'active' : ''}">
            ${Icons.cube}
            <span>Quản Lý Kho Hiện Vật</span>
          </a>

          <a href="#admin-rooms" class="nav-item ${isRooms ? 'active' : ''}">
            ${Icons.museum}
            <span>Quản Lý Gian Sảnh 360°</span>
          </a>

          <a href="#admin-tour360" class="nav-item ${isTour ? 'active' : ''}">
            ${Icons.compass}
            <span>Ghim Cổ Vật Tour 360°</span>
          </a>

          <a href="#admin-buildings" class="nav-item ${isBuildings ? 'active' : ''}">
            ${Icons.filter}
            <span>Quản Lý Tòa Nhà Kiến Trúc</span>
          </a>

          <a href="#admin-map" class="nav-item ${isMap ? 'active' : ''}">
            ${Icons.map}
            <span>Sơ Đồ Mặt Bằng & Dẫn Đường</span>
          </a>

          <a href="#admin-analytics" class="nav-item ${isAnalytics ? 'active' : ''}">
            ${Icons.ticket}
            <span>Thống Kê Toàn Diện</span>
          </a>

          <a href="#admin-settings" class="nav-item ${isSettings ? 'active' : ''}">
            ${Icons.filter}
            <span>Cấu Hình & Tắt/Bật Tính Năng</span>
          </a>

          <a href="#admin-roles" class="nav-item ${isRoles ? 'active' : ''}">
            ${Icons.user}
            <span>Phân Quyền Quản Trị (RBAC)</span>
          </a>
        </nav>

        <!-- Admin Footer Action -->
        <div class="sidebar-footer">
          <button class="btn btn-danger" id="btn-admin-logout" style="width: 100%; padding: 0.65rem; font-size: 0.85rem;">
            ${Icons.logout}
            <span>Đăng Xuất Admin</span>
          </button>
          
          <div style="text-align: center; margin-top: 0.5rem;">
            <a href="#home" style="font-size: 0.78rem; color: var(--color-text-muted); text-decoration: none; font-weight: 600;">
              ← Xem Giao Diện Du Khách
            </a>
          </div>
        </div>
      </aside>
    `;
  }

  // Public Client Visitor Sidebar (Dynamically adapts to Feature Toggles & Branding)
  return `
    <aside class="app-sidebar" id="main-sidebar">
      <a href="#home" class="brand">
        <div class="brand-icon">
          ${Icons.museum}
        </div>
        <div>
          <div class="brand-title">${branding.name}</div>
          <div class="brand-subtitle">${branding.subName}</div>
        </div>
      </a>

      <!-- Navigation Links for Public Visitors (Conditioned on Feature Toggles) -->
      <nav class="sidebar-nav">
        <a href="#home" class="nav-item ${activeTab === 'home' ? 'active' : ''}">
          ${Icons.museum}
          <span>Trang Chủ</span>
        </a>

        <a href="#tour360" class="nav-item ${activeTab === 'tour360' ? 'active' : ''}">
          ${Icons.compass}
          <span>Tour Ảo 360° Bước Đi</span>
        </a>

        <a href="#map" class="nav-item ${activeTab === 'map' ? 'active' : ''}">
          ${Icons.map}
          <span>Sơ Đồ Tầng & Dẫn Đường</span>
        </a>

        ${(features.enable3D || features.enableVoiceAI) ? `
          <a href="#artifact" class="nav-item ${activeTab === 'artifact' ? 'active' : ''}">
            ${Icons.cube}
            <span>Hiện Vật 3D & Giọng Đọc</span>
          </a>
        ` : ''}

        ${features.enableQuiz ? `
          <a href="#quiz" class="nav-item ${activeTab === 'quiz' ? 'active' : ''}">
            ${Icons.quiz}
            <span>Đố Vui & Sưu Tập Tem</span>
          </a>
        ` : ''}

        ${features.enableTourBooking ? `
          <a href="#booking" class="nav-item ${activeTab === 'booking' ? 'active' : ''}">
            ${Icons.ticket}
            <span>Đặt Lịch Tour Đoàn</span>
          </a>
        ` : ''}

        <a href="#profile" class="nav-item ${activeTab === 'profile' ? 'active' : ''}">
          ${Icons.user}
          <span>Hồ Sơ & Vé Điện Tử</span>
        </a>
      </nav>

      <!-- Live Broadcast Speaker Marquee (Conditioned on Feature Toggles) -->
      ${features.enableBroadcast ? `
        <div class="sidebar-broadcast">
          <div class="broadcast-header">
            <span class="pulse-dot"></span>
            <span>Thông Báo Trực Tiếp</span>
          </div>
          <div class="broadcast-body" id="broadcast-message">
            ${MuseumConfigStore.getActiveAnnouncement()}
          </div>
        </div>
      ` : ''}

      <!-- Footer Controls: Language, Theme, Passport Status -->
      <div class="sidebar-footer">
        <div class="lang-theme-row">
          <select class="lang-select" id="lang-select" aria-label="Chọn ngôn ngữ">
            ${MuseumConfigStore.getActiveLanguages().map(l => `
              <option value="${l.code}" ${lang === l.code ? 'selected' : ''}>${l.label}</option>
            `).join('')}
          </select>

          <button class="theme-toggle-btn" id="theme-toggle" title="Chuyển chế độ Sáng / Tối">
            ${currentTheme === 'dark' ? Icons.sun : Icons.moon}
          </button>
        </div>

        <div style="font-size: 0.78rem; color: var(--color-text-muted); display: flex; align-items: center; justify-content: space-between;">
          <a href="#profile" style="color: inherit; text-decoration: none;">Hộ chiếu: <b>2/6 Tem</b></a>
          <span class="badge-pill" style="padding: 2px 8px; font-size: 0.72rem;">Cấp 2</span>
        </div>
      </div>
    </aside>
  `;
}

export function initSidebarListeners(isAdminMode = false) {
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const html = document.documentElement;
      const current = html.getAttribute("data-theme") || "light";
      const next = current === "light" ? "dark" : "light";
      html.setAttribute("data-theme", next);
      themeToggle.innerHTML = next === "dark" ? Icons.sun : Icons.moon;
      localStorage.setItem("museum_theme", next);
    });
  }

  const langSelect = document.getElementById("lang-select") as HTMLSelectElement;
  if (langSelect) {
    langSelect.addEventListener("change", (e) => {
      const val = (e.target as HTMLSelectElement).value as any;
      MuseumConfigStore.setLanguage(val);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }

  const adminLogoutBtn = document.getElementById("btn-admin-logout");
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener("click", () => {
      AuthState.logoutAdmin();
      alert("Đã đăng xuất khỏi cổng Quản trị Admin.");
      window.location.hash = "#home";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }
}
