import "./styles/theme.css";

import { AuthState } from "./data/auth";
import { MuseumConfigStore } from "./data/museumConfig";
import { Icons } from "./components/Icons";
import { renderLeftSidebar, initSidebarListeners } from "./components/LeftSidebar";
import { renderTopBar, initTopBarListeners } from "./components/TopBar";
import { renderVisitorAuthModal, initVisitorAuthListeners } from "./components/VisitorAuthModal";
import { renderHomePage, initHomePage3D } from "./pages/HomePage";
import { renderTour360Page, initTour360Page } from "./pages/Tour360Page";
import { renderMapPage, initMapPageLogic } from "./pages/MapPage";
import { renderTimelinePage, initTimelinePageLogic } from "./pages/TimelinePage";
import { renderArtifactPage, initArtifactPageLogic } from "./pages/ArtifactPage";
import { renderQuizPage, initQuizListeners } from "./pages/QuizPage";
import { renderBookingPage, initBookingListeners } from "./pages/BookingPage";
import { renderUserProfilePage, initUserProfileListeners } from "./pages/UserProfilePage";
import { renderAdminLoginPage, initAdminLoginListeners } from "./pages/AdminLoginPage";
import {
  renderAdminScanPage, initAdminScanPage,
  renderAdminArtifactsPage, initAdminArtifactsPage,
  renderAdminRoomsPage, initAdminRoomsPage,
  renderAdminTour360Page, initAdminTour360Page,
  renderAdminNodesPage, initAdminNodesListeners,
  renderAdminBuildingsPage, initAdminBuildingsPage,
  renderAdminMapPage, initAdminMapPage,
  renderAdminAnalyticsPage, initAdminAnalyticsPage,
  renderAdminSettingsPage, initAdminSettingsPage,
  renderAdminRolesPage, initAdminRolesPage,
  renderAdminApprovalsPage, initAdminApprovalsPage
} from "./pages/admin";
import { initToastContainer, showToast } from "./components/Toast";

const app = document.getElementById("app") as HTMLElement;

// Initialize global toast notification container
initToastContainer();

// Initialize user session from localStorage
AuthState.init();

const VALID_TABS = [
  "home", "tour360", "map", "timeline", "artifact", "quiz", "booking", "profile",
  "admin-login", "admin", "admin-scan", "admin-artifacts", "admin-rooms", "admin-tour360", "admin-nodes",
  "admin-buildings", "admin-map", "admin-analytics", "admin-settings", "admin-roles", "admin-approvals"
];

function getActiveTab(): string {
  const hash = window.location.hash.replace("#", "") || "home";
  const cleanHash = hash.split("?")[0];
  if (VALID_TABS.includes(cleanHash)) {
    return cleanHash;
  }
  return "home";
}

function renderApp() {
  const tab = getActiveTab();

  // Route: Admin Login (Dedicated Full-Screen Page)
  if (tab === "admin-login") {
    app.innerHTML = renderAdminLoginPage();
    initAdminLoginListeners();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  // Dedicated Admin Studio Routes (Protected by Granular Dynamic RBAC: 1 Page = 1 Role)
  if (tab.startsWith("admin")) {
    if (!AuthState.canAccessAdmin()) {
      showToast("Bạn không có quyền truy cập Cổng Quản Trị. Vui lòng đăng nhập tài khoản cán bộ!", "warning");
      window.location.hash = "#admin-login";
      return;
    }

    // Default #admin entry point -> redirects to first allowed page
    let activeAdminTab = tab;
    if (tab === "admin") {
      activeAdminTab = AuthState.getFirstAllowedPage();
      if (activeAdminTab === "home") {
        window.location.hash = "#home";
        return;
      }
    } else {
      // Check if user has permission to access this specific page
      if (!AuthState.canAccessPage(tab)) {
        const fallback = AuthState.getFirstAllowedPage();
        showToast(`Bạn không có quyền truy cập trang này. Đang chuyển về trang được phân công...`, "warning");
        window.location.hash = `#${fallback}`;
        return;
      }
    }

    let pageContent = "";
    let initFn = () => { };

    if (activeAdminTab === "admin-scan") {
      pageContent = renderAdminScanPage();
      initFn = initAdminScanPage;
    } else if (activeAdminTab === "admin-artifacts") {
      pageContent = renderAdminArtifactsPage();
      initFn = initAdminArtifactsPage;
    } else if (activeAdminTab === "admin-rooms") {
      pageContent = renderAdminRoomsPage();
      initFn = initAdminRoomsPage;
    } else if (activeAdminTab === "admin-tour360") {
      pageContent = renderAdminTour360Page();
      initFn = initAdminTour360Page;
    } else if (activeAdminTab === "admin-nodes") {
      pageContent = renderAdminNodesPage();
      initFn = initAdminNodesListeners;
    } else if (activeAdminTab === "admin-buildings") {
      pageContent = renderAdminBuildingsPage();
      initFn = initAdminBuildingsPage;
    } else if (activeAdminTab === "admin-map") {
      pageContent = renderAdminMapPage();
      initFn = initAdminMapPage;
    } else if (activeAdminTab === "admin-analytics") {
      pageContent = renderAdminAnalyticsPage();
      initFn = initAdminAnalyticsPage;
    } else if (activeAdminTab === "admin-settings") {
      pageContent = renderAdminSettingsPage();
      initFn = initAdminSettingsPage;
    } else if (activeAdminTab === "admin-roles") {
      pageContent = renderAdminRolesPage();
      initFn = initAdminRolesPage;
    } else if (activeAdminTab === "admin-approvals") {
      pageContent = renderAdminApprovalsPage();
      initFn = initAdminApprovalsPage;
    }

    app.innerHTML = `
      <div class="app-container">
        ${renderLeftSidebar(activeAdminTab, true)}
        <div class="app-main">
          ${renderTopBar(true)}
          <main id="main-content">
            ${pageContent}
          </main>
        </div>
      </div>
    `;

    initSidebarListeners(true);
    initTopBarListeners(true);
    setTimeout(() => initFn(), 50);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  // Public Client Routes (Home, Tour360, Map, Timeline, Artifact, Quiz, Booking, Profile)
  const features = MuseumConfigStore.features;
  if (tab === "tour360" && features.enableTour360 === false) {
    window.location.hash = "#home";
    return;
  }
  if (tab === "quiz" && !features.enableQuiz) {
    window.location.hash = "#home";
    return;
  }
  if (tab === "booking" && !features.enableTourBooking) {
    window.location.hash = "#home";
    return;
  }

  let pageContent = "";
  if (tab === "home") {
    pageContent = renderHomePage();
  } else if (tab === "tour360") {
    pageContent = renderTour360Page();
  } else if (tab === "map") {
    pageContent = renderMapPage();
  } else if (tab === "timeline") {
    pageContent = renderTimelinePage();
  } else if (tab === "artifact") {
    pageContent = renderArtifactPage();
  } else if (tab === "quiz") {
    pageContent = renderQuizPage();
  } else if (tab === "booking") {
    pageContent = renderBookingPage();
  } else if (tab === "profile") {
    pageContent = renderUserProfilePage();
  }

  app.innerHTML = `
    <div class="app-container">
      ${renderLeftSidebar(tab, false)}
      
      <div class="app-main">
        ${renderTopBar(false)}
        <main id="main-content">
          ${pageContent}
        </main>
      </div>
    </div>
    ${renderVisitorAuthModal()}
  `;

  // Init client listeners
  initSidebarListeners(false);
  initTopBarListeners(false);
  initVisitorAuthListeners();

  if (tab === "home") {
    setTimeout(() => initHomePage3D(), 50);
  } else if (tab === "tour360") {
    setTimeout(() => initTour360Page(), 50);
  } else if (tab === "map") {
    setTimeout(() => initMapPageLogic(), 50);
  } else if (tab === "timeline") {
    setTimeout(() => initTimelinePageLogic(), 50);
  } else if (tab === "artifact") {
    setTimeout(() => initArtifactPageLogic(), 50);
  } else if (tab === "quiz") {
    setTimeout(() => initQuizListeners(), 50);
  } else if (tab === "booking") {
    setTimeout(() => initBookingListeners(), 50);
  } else if (tab === "profile") {
    setTimeout(() => initUserProfileListeners(), 50);
  }

  // Restore theme
  const savedTheme = localStorage.getItem("museum_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) themeBtn.innerHTML = savedTheme === "dark" ? Icons.sun : Icons.moon;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Router & Language Event Listeners
window.addEventListener("hashchange", renderApp);
window.addEventListener("DOMContentLoaded", renderApp);
window.addEventListener("museum:language-changed", () => renderApp());
window.addEventListener("museum:config-updated", () => renderApp());

renderApp();
