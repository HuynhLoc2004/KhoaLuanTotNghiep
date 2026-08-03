import { heritageTheme } from "@hcmc-museum/ui";

export interface AdminUser {
  name: string;
  role: string;
  avatarUrl?: string | undefined;
}

export function renderAdminSidebar(activeNav = "cms-content"): string {
  const navItems = [
    { id: "dashboard", label: "Tổng quan", icon: "📊", link: "/admin" },
    {
      id: "cms-content",
      label: "Quản lý CMS Content",
      icon: "📝",
      link: "/admin/content",
    },
    {
      id: "artifacts",
      label: "Quản lý Hiện vật",
      icon: "🏛️",
      link: "/admin/artifacts",
    },
    {
      id: "timeline",
      label: "Dòng thời gian sống",
      icon: "⏳",
      link: "/admin/timeline",
    },
    { id: "settings", label: "Cấu hình hệ thống", icon: "⚙️", link: "/admin/settings" },
  ];

  const navLinksHtml = navItems
    .map((item) => {
      const isActive = item.id === activeNav;
      const bg = isActive ? heritageTheme.colors.primaryRed : "transparent";
      const color = isActive ? heritageTheme.colors.accentGold : heritageTheme.colors.textSecondary;
      const border = isActive
        ? `border-left: 3px solid ${heritageTheme.colors.accentGold};`
        : "border-left: 3px solid transparent;";

      return `
        <a id="admin-nav-${item.id}" href="${item.link}" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; color: ${color}; background: ${bg}; ${border} text-decoration: none; font-weight: ${isActive ? "bold" : "normal"}; transition: ${heritageTheme.animations.transitionFast};">
          <span>${item.icon}</span>
          <span>${item.label}</span>
        </a>
      `.trim();
    })
    .join("\n");

  return `
    <aside id="admin-sidebar" style="width: 260px; background: ${heritageTheme.colors.bgCard}; border-right: 1px solid ${heritageTheme.colors.borderGlass}; display: flex; flex-direction: column; min-height: 100vh;">
      <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid ${heritageTheme.colors.borderGlass}; display: flex; align-items: center; gap: 0.75rem;">
        <div style="width: 32px; height: 32px; border-radius: 50%; background: ${heritageTheme.colors.primaryRed}; border: 1px solid ${heritageTheme.colors.accentGold}; display: flex; align-items: center; justify-content: center; font-weight: bold; color: ${heritageTheme.colors.accentGold}; font-size: 0.875rem;">CMS</div>
        <span style="font-family: ${heritageTheme.typography.fontFamilyHeading}; font-weight: bold; color: ${heritageTheme.colors.textPrimary}; font-size: 1rem;">CMS ADMIN PORTAL</span>
      </div>
      <nav id="sidebar-nav" style="padding-top: 1rem; flex: 1;">
        ${navLinksHtml}
      </nav>
      <div style="padding: 1rem 1.25rem; border-top: 1px solid ${heritageTheme.colors.borderGlass}; font-size: 0.75rem; color: ${heritageTheme.colors.textMuted};">
        HCMC Museum Digital v0.1.0
      </div>
    </aside>
  `.trim();
}

export function renderAdminHeader(
  user: AdminUser = { name: "Trịnh Vĩ Thành", role: "Curator Admin" },
): string {
  return `
    <header id="admin-header" style="height: 64px; background: ${heritageTheme.glassmorphism.background}; backdrop-filter: ${heritageTheme.glassmorphism.backdropFilter}; border-bottom: ${heritageTheme.glassmorphism.border}; padding: 0 1.5rem; display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <h2 id="page-title" style="font-family: ${heritageTheme.typography.fontFamilyHeading}; font-size: 1.25rem; color: ${heritageTheme.colors.textPrimary}; margin: 0;">Quản lý CMS & Biên tập Content Block</h2>
      </div>
      <div style="display: flex; align-items: center; gap: 1.25rem;">
        <span style="background: rgba(212, 175, 55, 0.15); color: ${heritageTheme.colors.accentGold}; padding: 0.25rem 0.625rem; border-radius: 1rem; font-size: 0.75rem; font-weight: bold; border: 1px solid ${heritageTheme.colors.accentGold};">Live Environment</span>
        <div style="display: flex; align-items: center; gap: 0.625rem;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: ${heritageTheme.colors.primaryRed}; color: ${heritageTheme.colors.textPrimary}; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.875rem;">${user.name.charAt(0)}</div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.875rem; font-weight: 600; color: ${heritageTheme.colors.textPrimary};">${user.name}</span>
            <span style="font-size: 0.75rem; color: ${heritageTheme.colors.textSecondary};">${user.role}</span>
          </div>
        </div>
      </div>
    </header>
  `.trim();
}
