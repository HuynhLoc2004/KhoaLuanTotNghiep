import { renderFooter, renderHeader } from "../shell/layout.js";
import {
  heritageTheme,
  renderAuthHeaderBadge,
  renderAuthModal,
  renderUserProfileDrawer,
} from "@hcmc-museum/ui";
import type { UserBookmarkItem, UserHistoryItem, UserProfile } from "@hcmc-museum/contracts";

export interface PublicProfilePageProps {
  user?: UserProfile;
  bookmarks?: UserBookmarkItem[];
  history?: UserHistoryItem[];
}

export function renderPublicProfilePage(props: PublicProfilePageProps = {}): string {
  const defaultUser: UserProfile = props.user ?? {
    id: "usr-kc-001",
    username: "huynh_tan_loc",
    fullName: "Huỳnh Tấn Lộc",
    email: "huynhtanlocpp09@gmail.com",
    roles: ["member", "editor"],
    provider: "keycloak",
  };

  const headerHtml = renderHeader();
  const headerBadge = renderAuthHeaderBadge(defaultUser);
  const profileDrawer = renderUserProfileDrawer(
    defaultUser,
    props.bookmarks ?? [],
    props.history ?? [],
  );
  const authModal = renderAuthModal();
  const footerHtml = renderFooter();

  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hồ Sơ Khách Tham Quan | Bảo tàng Lịch sử TP.HCM</title>
      <meta name="description" content="Quản lý hồ sơ cá nhân, hiện vật đã lưu trữ và nhật ký tham quan Bảo tàng Lịch sử TP.HCM qua Keycloak IAM.">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background-color: ${heritageTheme.colors.bgDark};
          color: ${heritageTheme.colors.textPrimary};
          font-family: ${heritageTheme.typography.fontFamilyBody};
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        main { flex: 1; max-width: 1200px; margin: 0 auto; width: 100%; padding: 2rem 1.5rem; }
      </style>
    </head>
    <body>
      ${headerHtml}
      <main id="profile-main-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; background: rgba(255,255,255,0.03); padding: 1rem 1.5rem; border-radius: 0.5rem; border: 1px solid rgba(212,175,55,0.2);">
          <div>
            <h1 style="font-size: 1.5rem; color: ${heritageTheme.colors.accentGold}; margin-bottom: 0.25rem;">Hồ Sơ Khách Tham Quan & Lịch Sử Di Sản</h1>
            <p style="color: ${heritageTheme.colors.textSecondary}; font-size: 0.875rem;">Xác thực tập trung qua <strong>Keycloak IAM Server (Port 18080)</strong></p>
          </div>
          ${headerBadge}
        </div>

        ${profileDrawer}
        ${authModal}
      </main>
      ${footerHtml}
    </body>
    </html>
  `.trim();
}
