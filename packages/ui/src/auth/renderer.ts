import { heritageTheme } from "../tokens/theme.js";
import type { UserBookmarkItem, UserHistoryItem, UserProfile } from "@hcmc-museum/contracts";

export function renderAuthHeaderBadge(user?: UserProfile): string {
  if (!user || user.provider === "guest") {
    return `
      <button
        id="btn-auth-login"
        type="button"
        style="padding: 0.5rem 1rem; border-radius: 0.375rem; background: ${heritageTheme.colors.primaryRed}; color: ${heritageTheme.colors.accentGold}; border: 1px solid ${heritageTheme.colors.accentGold}; font-weight: bold; font-size: 0.875rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;"
      >
        <span style="font-size: 1rem;">🔐</span> Đăng Nhập Keycloak
      </button>
    `.trim();
  }

  const roleBadge = user.roles.includes("admin")
    ? "ADMIN"
    : user.roles.includes("editor")
      ? "EDITOR"
      : "MEMBER";

  return `
    <div id="user-header-profile" style="display: flex; align-items: center; gap: 0.75rem; background: rgba(255,255,255,0.05); padding: 0.375rem 0.75rem; border-radius: 2rem; border: 1px solid ${heritageTheme.colors.borderGlass};">
      <img
        src="${user.avatarUrl ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}"
        alt="${user.fullName ?? user.username}"
        style="width: 2rem; height: 2rem; border-radius: 50%; object-fit: cover; border: 1px solid ${heritageTheme.colors.accentGold};"
      />
      <div style="display: flex; flex-direction: column;">
        <span style="font-size: 0.8125rem; font-weight: bold; color: ${heritageTheme.colors.textPrimary};">${user.fullName ?? user.username}</span>
        <span style="font-size: 0.6875rem; color: ${heritageTheme.colors.accentGold}; font-weight: bold;">${roleBadge} • KEYCLOAK</span>
      </div>
    </div>
  `.trim();
}

export function renderAuthModal(): string {
  return `
    <div id="auth-modal-overlay" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(8px); z-index: 9999; justify-content: center; align-items: center;">
      <div style="background: ${heritageTheme.colors.bgCard}; border: 1px solid ${heritageTheme.colors.accentGold}; border-radius: 0.75rem; padding: 2rem; width: 100%; max-width: 420px; box-shadow: ${heritageTheme.glassmorphism.boxShadow}; text-align: center; color: ${heritageTheme.colors.textPrimary};">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🏛️</div>
        <h3 style="font-family: ${heritageTheme.typography.fontFamilyHeading}; font-size: 1.5rem; margin-bottom: 0.5rem; color: ${heritageTheme.colors.accentGold};">Đăng Nhập Khách Tham Quan</h3>
        <p style="color: ${heritageTheme.colors.textSecondary}; font-size: 0.875rem; margin-bottom: 1.5rem; line-height: 1.5;">
          Bảo tàng Lịch sử TP.HCM áp dụng hệ thống xác thực tập trung <strong>Keycloak IAM Server</strong> giúp bảo mật thông tin và lưu giữ lịch sử di sản cá nhân.
        </p>

        <button
          id="btn-keycloak-sso-submit"
          type="button"
          style="width: 100%; padding: 0.875rem; border-radius: 0.5rem; background: ${heritageTheme.colors.primaryRed}; color: ${heritageTheme.colors.accentGold}; border: 1px solid ${heritageTheme.colors.accentGold}; font-weight: bold; font-size: 1rem; cursor: pointer; margin-bottom: 1rem; display: flex; justify-content: center; align-items: center; gap: 0.5rem;"
        >
          🔐 Đăng nhập qua Keycloak SSO (Port 18080)
        </button>

        <button
          id="btn-guest-continue"
          type="button"
          style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; background: transparent; color: ${heritageTheme.colors.textSecondary}; border: 1px solid ${heritageTheme.colors.borderGlass}; font-size: 0.875rem; cursor: pointer;"
        >
          👤 Tiếp tục với tư cách Khách
        </button>
      </div>
    </div>
  `.trim();
}

export function renderUserProfileDrawer(
  user: UserProfile,
  bookmarks: UserBookmarkItem[] = [],
  history: UserHistoryItem[] = [],
): string {
  const bookmarkListHtml =
    bookmarks.length > 0
      ? bookmarks
          .map(
            (b) => `
            <div style="background: rgba(255,255,255,0.03); border: 1px solid ${heritageTheme.colors.borderGlass}; border-radius: 0.5rem; padding: 0.75rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: ${heritageTheme.colors.textPrimary}; font-size: 0.875rem;">${b.title}</strong>
                <div style="font-size: 0.75rem; color: ${heritageTheme.colors.accentGold};">${b.type}</div>
              </div>
              <span style="font-size: 0.75rem; color: ${heritageTheme.colors.textMuted};">${new Date(b.createdAt).toLocaleDateString("vi-VN")}</span>
            </div>
          `,
          )
          .join("")
      : `<p style="color: ${heritageTheme.colors.textMuted}; font-size: 0.875rem; text-align: center;">Chưa có hiện vật lưu trữ</p>`;

  const historyListHtml =
    history.length > 0
      ? history
          .map(
            (h) => `
            <div style="background: rgba(255,255,255,0.03); border: 1px solid ${heritageTheme.colors.borderGlass}; border-radius: 0.5rem; padding: 0.75rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-size: 0.75rem; font-weight: bold; color: ${heritageTheme.colors.accentGold}; margin-right: 0.5rem;">[${h.action}]</span>
                <strong style="color: ${heritageTheme.colors.textPrimary}; font-size: 0.875rem;">${h.title}</strong>
              </div>
              <span style="font-size: 0.75rem; color: ${heritageTheme.colors.textMuted};">${new Date(h.timestamp).toLocaleTimeString("vi-VN")}</span>
            </div>
          `,
          )
          .join("")
      : `<p style="color: ${heritageTheme.colors.textMuted}; font-size: 0.875rem; text-align: center;">Chưa có nhật ký tham quan</p>`;

  return `
    <div id="user-profile-panel" style="background: ${heritageTheme.colors.bgDark}; border: 1px solid ${heritageTheme.colors.borderGlass}; border-radius: 0.75rem; padding: 1.5rem; margin: 1.5rem 0; color: ${heritageTheme.colors.textPrimary};">
      <div style="display: flex; align-items: center; gap: 1rem; border-bottom: 1px solid ${heritageTheme.colors.borderGlass}; padding-bottom: 1rem; margin-bottom: 1.5rem;">
        <img
          src="${user.avatarUrl ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}"
          alt="${user.fullName ?? user.username}"
          style="width: 4rem; height: 4rem; border-radius: 50%; object-fit: cover; border: 2px solid ${heritageTheme.colors.accentGold};"
        />
        <div>
          <h3 style="font-family: ${heritageTheme.typography.fontFamilyHeading}; font-size: 1.25rem; margin-bottom: 0.25rem; color: ${heritageTheme.colors.textPrimary};">${user.fullName ?? user.username}</h3>
          <p style="color: ${heritageTheme.colors.textSecondary}; font-size: 0.875rem; margin-bottom: 0.25rem;">Email: ${user.email ?? "N/A"}</p>
          <span style="font-size: 0.75rem; font-weight: bold; padding: 0.2rem 0.6rem; border-radius: 0.25rem; background: ${heritageTheme.colors.primaryRed}; color: ${heritageTheme.colors.accentGold}; border: 1px solid ${heritageTheme.colors.accentGold};">
            XÁC THỰC: ${user.provider.toUpperCase()} IAM
          </span>
        </div>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-size: 1rem; color: ${heritageTheme.colors.accentGold}; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">⭐ Hiện Vật Đã Lưu (Bookmarks)</h4>
        ${bookmarkListHtml}
      </div>

      <div>
        <h4 style="font-size: 1rem; color: ${heritageTheme.colors.accentGold}; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">📜 Nhật Ký Tham Quan (History)</h4>
        ${historyListHtml}
      </div>
    </div>
  `.trim();
}
