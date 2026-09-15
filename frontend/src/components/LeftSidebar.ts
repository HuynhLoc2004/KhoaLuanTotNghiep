import { Icons } from "./Icons";
import { MuseumConfigStore, PendingApprovalStore } from "../data/museumConfig";
import { AuthState } from "../data/auth";
import { showToast } from "./Toast";
import { t } from "../data/i18n";

export function renderLeftSidebar(activeTab: string = "home", isAdminMode = false): string {
  const branding = MuseumConfigStore.branding;
  const features = MuseumConfigStore.features;
  const currentTheme = localStorage.getItem("museum_theme") || "light";
  const lang = MuseumConfigStore.currentLanguage;

  // DEDICATED ADMIN STUDIO SIDEBAR (CHỈ HIỂN THỊ NHỮNG TRANG MÀ USER ĐƯỢC PHÂN CÔNG)
  if (isAdminMode) {
    const isScan = activeTab === "admin-scan" || activeTab === "admin";
    const isArtifacts = activeTab === "admin-artifacts";
    const isRooms = activeTab === "admin-rooms";
    const isTour = activeTab === "admin-tour360";
    const isNodes = activeTab === "admin-nodes";
    const isBuildings = activeTab === "admin-buildings";
    const isMap = activeTab === "admin-map";
    const isAnalytics = activeTab === "admin-analytics";
    const isSettings = activeTab === "admin-settings";
    const isRoles = activeTab === "admin-roles";
    const isApprovals = activeTab === "admin-approvals";
    const pendingCount = PendingApprovalStore.pendingCount();

    // Permissions check for every individual page
    const canScan = AuthState.canAccessPage("admin-scan");
    const canArtifacts = AuthState.canAccessPage("admin-artifacts");
    const canRooms = AuthState.canAccessPage("admin-rooms");
    const canTour = AuthState.canAccessPage("admin-tour360");
    const canNodes = AuthState.canAccessPage("admin-nodes");
    const canBuildings = AuthState.canAccessPage("admin-buildings");
    const canMap = AuthState.canAccessPage("admin-map");
    const canAnalytics = AuthState.canAccessPage("admin-analytics");
    const canSettings = AuthState.canAccessPage("admin-settings");
    const canRoles = AuthState.canAccessPage("admin-roles");
    const canApprovals = AuthState.canAccessPage("admin-approvals");

    // Staff identity info
    const currentUser = AuthState.currentUser;
    const isSuper = currentUser?.role === "super_admin" || AuthState.admin.role === "super_admin";
    const staffName = currentUser ? currentUser.name : AuthState.admin.name;
    const staffEmail = currentUser ? currentUser.email : AuthState.admin.email;
    const allowedCount = isSuper ? 11 : (currentUser?.allowedPages?.length || 1);

    return `
      <aside class="app-sidebar admin-sidebar" id="main-sidebar">
        <!-- Admin Brand Header -->
        <a href="#admin" class="brand">
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
          <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); font-weight: 700; margin-bottom: 0.2rem; display: flex; justify-content: space-between;">
            <span>Tài Khoản Cán Bộ</span>
            <span style="color: #d4af37;">${isSuper ? 'TOÀN QUYỀN' : `${allowedCount} TRANG`}</span>
          </div>
          <div style="font-size: 0.9rem; font-weight: 800; color: var(--color-primary);">${staffName}</div>
          <div style="font-size: 0.74rem; color: var(--color-text-muted); margin-top: 0.1rem;">${staffEmail}</div>
        </div>

        <!-- Admin Workspaces Navigation (CHỈ RENDER NHỮNG TRANG MÀ USER ĐƯỢC PHÂN CÔNG) -->
        <nav class="sidebar-nav">
          <!-- Section 1: Gate & Visitor Operations -->
          ${canScan ? `
            <div class="nav-section-title">
              <span>Vận Hành Cổng</span>
              <span class="nav-section-badge">GATE_OPS</span>
            </div>
            <a href="#admin-scan" class="nav-item ${isScan ? 'active' : ''}">
              ${Icons.qr}
              <span>Soát Vé Cổng (&lt;100ms)</span>
            </a>
          ` : ''}

          <!-- Section 2: Heritage & Digital Catalog -->
          ${canArtifacts ? `
            <div class="nav-section-title">
              <span>Kho Hiện Vật & Di Sản</span>
              <span class="nav-section-badge">CMS</span>
            </div>
            <a href="#admin-artifacts" class="nav-item ${isArtifacts ? 'active' : ''}">
              ${Icons.cube}
              <span>Quản Lý Kho Hiện Vật</span>
            </a>
          ` : ''}

          <!-- Section 3: 3DGS & Virtual Tour Spaces -->
          ${(canRooms || canTour || canNodes) ? `
            <div class="nav-section-title">
              <span>Không Gian 3DGS & Tour</span>
              <span class="nav-section-badge">3DGS_TOUR</span>
            </div>
            ${canRooms ? `
              <a href="#admin-rooms" class="nav-item ${isRooms ? 'active' : ''}">
                ${Icons.museum}
                <span>Quản Lý Gian Sảnh 360°</span>
              </a>
            ` : ''}
            ${canTour ? `
              <a href="#admin-tour360" class="nav-item ${isTour ? 'active' : ''}">
                ${Icons.compass}
                <span>Ghim Cổ Vật Tour 360°</span>
              </a>
            ` : ''}
            ${canNodes ? `
              <a href="#admin-nodes" class="nav-item ${isNodes ? 'active' : ''}">
                ${Icons.filter}
                <span>Quản Lý Walk Nodes 360°</span>
              </a>
            ` : ''}
          ` : ''}

          <!-- Section 4: Architectural Map & Navigation -->
          ${(canBuildings || canMap) ? `
            <div class="nav-section-title">
              <span>Bản Đồ & Kiến Trúc</span>
              <span class="nav-section-badge">MAP_NAV</span>
            </div>
            ${canBuildings ? `
              <a href="#admin-buildings" class="nav-item ${isBuildings ? 'active' : ''}">
                ${Icons.filter}
                <span>Quản Lý Tòa Nhà Kiến Trúc</span>
              </a>
            ` : ''}
            ${canMap ? `
              <a href="#admin-map" class="nav-item ${isMap ? 'active' : ''}">
                ${Icons.map}
                <span>Sơ Đồ Mặt Bằng & Dẫn Đường</span>
              </a>
            ` : ''}
          ` : ''}

          <!-- Section 5: Analytics, System & Security RBAC -->
          ${(canAnalytics || canSettings || canRoles) ? `
            <div class="nav-section-title">
              <span>Quản Trị & System</span>
              <span class="nav-section-badge">SYS_ADMIN</span>
            </div>
            ${canAnalytics ? `
              <a href="#admin-analytics" class="nav-item ${isAnalytics ? 'active' : ''}">
                ${Icons.ticket}
                <span>Thống Kê Toàn Diện</span>
              </a>
            ` : ''}
            ${canSettings ? `
              <a href="#admin-settings" class="nav-item ${isSettings ? 'active' : ''}">
                ${Icons.filter}
                <span>Cấu Hình & Bật/Tắt Tính Năng</span>
              </a>
            ` : ''}
            ${canRoles ? `
              <a href="#admin-roles" class="nav-item ${isRoles ? 'active' : ''}">
                ${Icons.user}
                <span>Phân Quyền Vai Trò (RBAC)</span>
              </a>
            ` : ''}
          ` : ''}

          <!-- Section 6: Approval Workflow -->
          ${canApprovals ? `
            <div class="nav-section-title">
              <span>Phê Duyệt</span>
              <span class="nav-section-badge">APPROVAL</span>
            </div>
            <a href="#admin-approvals" class="nav-item ${isApprovals ? 'active' : ''}" style="position:relative;">
              ${Icons.shield}
              <span>Duyệt Yêu Cầu Thêm Mới</span>
              ${pendingCount > 0 ? `<span style="margin-left:auto;min-width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:#d97706;color:white;font-size:0.68rem;font-weight:900;padding:0 5px;">${pendingCount}</span>` : ""}
            </a>
          ` : ''}
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

  // PUBLIC VISITOR SIDEBAR
  const canEnterAdmin = AuthState.canAccessAdmin();
  const firstAdminPage = AuthState.getFirstAllowedPage();

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
          <span>${t("nav.home")}</span>
        </a>

        <a href="#tour360" class="nav-item ${activeTab === 'tour360' ? 'active' : ''}">
          ${Icons.compass}
          <span>${t("nav.tour360")}</span>
        </a>

        <a href="#map" class="nav-item ${activeTab === 'map' ? 'active' : ''}">
          ${Icons.map}
          <span>${t("nav.map")}</span>
        </a>

        <a href="#timeline" class="nav-item ${activeTab === 'timeline' ? 'active' : ''}">
          ${Icons.clock}
          <span>${t("nav.timeline")}</span>
        </a>

        ${(features.enable3D || features.enableVoiceAI) ? `
          <a href="#artifact" class="nav-item ${activeTab === 'artifact' ? 'active' : ''}">
            ${Icons.cube}
            <span>${t("nav.artifact")}</span>
          </a>
        ` : ''}

        ${features.enableQuiz ? `
          <a href="#quiz" class="nav-item ${activeTab === 'quiz' ? 'active' : ''}">
            ${Icons.quiz}
            <span>${t("nav.quiz")}</span>
          </a>
        ` : ''}

        ${features.enableTourBooking ? `
          <a href="#booking" class="nav-item ${activeTab === 'booking' ? 'active' : ''}">
            ${Icons.ticket}
            <span>${t("nav.booking")}</span>
          </a>
        ` : ''}

        <a href="#profile" class="nav-item ${activeTab === 'profile' ? 'active' : ''}">
          ${Icons.user}
          <span>${t("nav.profile")}</span>
        </a>
      </nav>

      <!-- Admin Shortcut Banner for Staff / Admin Accounts -->
      ${canEnterAdmin ? `
        <div style="margin: 0.8rem 0.5rem; padding: 0.8rem 0.9rem; background: linear-gradient(135deg, rgba(30, 58, 138, 0.25), rgba(2, 132, 199, 0.2)); border: 1px solid #0284c7; border-radius: var(--radius-sm);">
          <div style="font-size: 0.7rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; margin-bottom: 0.2rem;">
            QUYỀN QUẢN TRỊ NỘI BỘ
          </div>
          <div style="font-size: 0.78rem; color: var(--color-text-main); margin-bottom: 0.5rem; line-height: 1.4;">
            Tài khoản của bạn đã được cấp quyền quản lý Dashboard.
          </div>
          <a href="#${firstAdminPage}" class="btn btn-primary" style="width: 100%; padding: 0.5rem; font-size: 0.78rem; font-weight: 700; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 0.4rem; background: #0284c7;">
            ${Icons.shield}
            <span>${t("nav.adminShortcut")} →</span>
          </a>
        </div>
      ` : ''}

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
          <a href="#profile" style="color: inherit; text-decoration: none;">${t("nav.passportRank")}: <b>2/6 Tem</b></a>
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
      showToast("Đã đăng xuất khỏi cổng Quản trị Admin.", "info");
      window.location.hash = "#home";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }
}
