import { AuthState } from "../data/auth";
import { Icons } from "./Icons";
import { ARTIFACTS_DATA } from "../data/artifacts";
import { t } from "../data/i18n";

export function renderTopBar(isAdminMode = false): string {
  if (isAdminMode) {
    return `
      <header class="app-topbar" style="border-bottom: 2px solid var(--color-primary);">
        <div class="topbar-left">
          <button class="menu-toggle-btn" id="menu-toggle" aria-label="Mở menu">☰</button>
          <span class="badge-pill" style="font-weight: 800; background: rgba(var(--color-primary-rgb), 0.15); color: var(--color-primary);">
            CỔNG QUẢN TRỊ NỘI BỘ (STAFF CMS)
          </span>
        </div>

        <div class="topbar-right">
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted);">
            Cán bộ: <b style="color: var(--color-primary);">${AuthState.admin.name}</b> (${AuthState.admin.roleTitle})
          </span>
          <a href="#home" class="btn btn-outline" style="padding: 0.4rem 0.9rem; font-size: 0.8rem;">
            ← Về Web Du Khách
          </a>
        </div>
      </header>
    `;
  }

  // Public Visitor Topbar
  const isLogged = AuthState.isVisitorLoggedIn;

  return `
    <header class="app-topbar">
      <div class="topbar-left">
        <button class="menu-toggle-btn" id="menu-toggle" aria-label="Mở menu điều hướng">
          ☰
        </button>

        <div class="search-box-wrapper">
          <div class="search-pill">
            <span style="color: var(--color-text-muted); display: flex; align-items: center;">${Icons.search}</span>
            <input type="text" id="global-search" placeholder="${t("topbar.searchPlaceholder")}" autocomplete="off" />
          </div>
          <div class="search-suggestions-dropdown" id="search-dropdown">
            <!-- Dynamically populated suggestions -->
          </div>
        </div>
      </div>

      <div class="topbar-right">
        <div class="badge-pill">
          <span class="pulse-dot"></span>
          <span>1,420 Khách Hôm Nay</span>
        </div>

        <!-- Visitor Auth Button / Badge -->
        ${isLogged ? `
          <a href="#profile" class="btn btn-outline" style="padding: 0.45rem 1rem; font-size: 0.82rem; font-weight: 700;">
            ${Icons.user}
            <span>${AuthState.visitor.name}</span>
          </a>
        ` : `
          <button id="open-visitor-auth-btn" class="btn btn-primary" style="padding: 0.45rem 1rem; font-size: 0.82rem;">
            ${Icons.user}
            <span>${t("nav.login")}</span>
          </button>
        `}

        <!-- Dedicated Link to Staff Admin Portal -->
        <a href="#admin-login" class="btn btn-outline" style="padding: 0.45rem 0.85rem; font-size: 0.8rem; border-color: var(--color-card-border);" title="Cổng dành cho Cán bộ Quản lý bảo tàng">
          ${Icons.shield}
          <span>Cán Bộ</span>
        </a>
      </div>
    </header>
  `;
}

export function initTopBarListeners(isAdminMode = false) {
  const menuBtn = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("main-sidebar");

  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (window.innerWidth <= 1024 && sidebar.classList.contains("open")) {
        const target = e.target as HTMLElement;
        if (!sidebar.contains(target) && !menuBtn.contains(target)) {
          sidebar.classList.remove("open");
        }
      }
    });
  }

  const openVisitorAuthBtn = document.getElementById("open-visitor-auth-btn");
  const visitorModal = document.getElementById("visitor-auth-modal");
  if (openVisitorAuthBtn && visitorModal) {
    openVisitorAuthBtn.addEventListener("click", () => {
      visitorModal.style.display = "flex";
    });
  }

  // Live Typeahead Search Dropdown
  const searchInput = document.getElementById("global-search") as HTMLInputElement;
  const searchDropdown = document.getElementById("search-dropdown");

  if (searchInput && searchDropdown) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) {
        searchDropdown.style.display = "none";
        return;
      }

      const matches = ARTIFACTS_DATA.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.era.toLowerCase().includes(q) ||
        a.placardText.toLowerCase().includes(q)
      ).slice(0, 4);

      if (matches.length === 0) {
        searchDropdown.innerHTML = `
          <div style="padding: 0.75rem 1rem; font-size: 0.82rem; color: var(--color-text-muted);">
            Không tìm thấy hiện vật phù hợp
          </div>
        `;
        searchDropdown.style.display = "flex";
        return;
      }

      searchDropdown.innerHTML = matches.map(m => `
        <div class="search-suggestion-item" data-id="${m.id}">
          <div>
            <div style="font-weight: 700; color: var(--color-primary);">${m.name}</div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted);">${m.era} • ${m.room}</div>
          </div>
          <span style="font-size: 0.75rem; font-weight: 600; color: var(--color-secondary);">Xem 3D →</span>
        </div>
      `).join('');
      searchDropdown.style.display = "flex";

      searchDropdown.querySelectorAll(".search-suggestion-item").forEach(item => {
        item.addEventListener("click", () => {
          const artId = item.getAttribute("data-id");
          searchDropdown.style.display = "none";
          searchInput.value = "";
          window.location.hash = `#artifact?id=${artId}`;
          window.dispatchEvent(new HashChangeEvent("hashchange"));
        });
      });
    });

    document.addEventListener("click", (e) => {
      if (!searchInput.contains(e.target as Node) && !searchDropdown.contains(e.target as Node)) {
        searchDropdown.style.display = "none";
      }
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && searchInput.value.trim()) {
        searchDropdown.style.display = "none";
        window.location.hash = "#artifact";
      }
    });
  }
}
