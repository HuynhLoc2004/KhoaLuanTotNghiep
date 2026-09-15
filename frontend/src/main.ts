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
  renderAdminRolesPage, initAdminRolesPage
} from "./pages/admin";

const app = document.getElementById("app") as HTMLElement;

// Check saved auth state
if (localStorage.getItem("museum_visitor_auth") === "true") {
  AuthState.isVisitorLoggedIn = true;
}
if (localStorage.getItem("museum_admin_auth") === "true") {
  AuthState.isAdminLoggedIn = true;
}

const VALID_TABS = [
  "home", "tour360", "map", "artifact", "quiz", "booking", "profile",
  "admin-login", "admin", "admin-scan", "admin-artifacts", "admin-rooms", "admin-tour360", "admin-nodes",
  "admin-buildings", "admin-map", "admin-analytics", "admin-settings", "admin-roles"
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

  // Dedicated Admin Studio Routes (Protected by Admin Auth)
  if (tab.startsWith("admin")) {
    if (!AuthState.isAdminLoggedIn) {
      window.location.hash = "#admin-login";
      return;
    }

    let pageContent = "";
    let initFn = () => {};
    let activeAdminTab = tab;

    if (tab === "admin" || tab === "admin-scan") {
      activeAdminTab = "admin-scan";
      pageContent = renderAdminScanPage();
      initFn = initAdminScanPage;
    } else if (tab === "admin-artifacts") {
      pageContent = renderAdminArtifactsPage();
      initFn = initAdminArtifactsPage;
    } else if (tab === "admin-rooms") {
      pageContent = renderAdminRoomsPage();
      initFn = initAdminRoomsPage;
    } else if (tab === "admin-tour360") {
      pageContent = renderAdminTour360Page();
      initFn = initAdminTour360Page;
    } else if (tab === "admin-nodes") {
      pageContent = renderAdminNodesPage();
      initFn = initAdminNodesListeners;
    } else if (tab === "admin-buildings") {
      pageContent = renderAdminBuildingsPage();
      initFn = initAdminBuildingsPage;
    } else if (tab === "admin-map") {
      pageContent = renderAdminMapPage();
      initFn = initAdminMapPage;
    } else if (tab === "admin-analytics") {
      pageContent = renderAdminAnalyticsPage();
      initFn = initAdminAnalyticsPage;
    } else if (tab === "admin-settings") {
      pageContent = renderAdminSettingsPage();
      initFn = initAdminSettingsPage;
    } else if (tab === "admin-roles") {
      pageContent = renderAdminRolesPage();
      initFn = initAdminRolesPage;
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

  // Public Client Routes (Home, Artifact, Quiz, Booking, Profile)
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

window.addEventListener("hashchange", renderApp);
window.addEventListener("museum:config-updated", renderApp);
window.addEventListener("museum:language-changed", renderApp);
window.addEventListener("DOMContentLoaded", renderApp);

renderApp();
