import { renderFooter, renderHeader } from "../shell/layout.js";
import {
  renderAuthHeaderBadge,
  renderAuthModal,
  renderUserProfileDrawer,
  injectHeritageGlobalStyles,
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

  const defaultBookmarks: UserBookmarkItem[] = props.bookmarks ?? [
    {
      id: "bm-01",
      artifactId: "art-ds-01",
      title: "Trống Đồng Đông Sơn",
      type: "artifact",
      createdAt: "2026-08-12T10:00:00Z",
    },
  ];

  const defaultHistory: UserHistoryItem[] = props.history ?? [
    {
      id: "hist-01",
      action: "VIEW_3D",
      targetId: "ART-DS-001",
      title: "Trải Nghiệm Không Gian 3D Trống Đồng",
      timestamp: "2026-08-17T09:00:00Z",
    },
  ];

  const headerHtml = renderHeader();
  const footerHtml = renderFooter();
  const headerBadge = renderAuthHeaderBadge(defaultUser);
  const profileDrawer = renderUserProfileDrawer(defaultUser, defaultBookmarks, defaultHistory);
  const authModal = renderAuthModal();

  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Trang cá nhân & Lịch sử di sản | Bảo tàng Lịch sử TP.HCM</title>
      <meta name="description" content="Trang cá nhân người dùng tích hợp Keycloak IAM, quản lý bookmarks và lịch sử truy cập di sản.">
      ${injectHeritageGlobalStyles()}
    </head>
    <body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans antialiased">
      ${headerHtml}
      <main id="profile-main-content" class="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div class="flex justify-between items-center mb-6 bg-slate-900/60 p-6 rounded-xl border border-amber-500/20 backdrop-blur-md">
          <div>
            <h1 class="text-2xl font-bold font-heading text-amber-400 mb-1">Hồ Sơ Khách Tham Quan & Lịch Sử Di Sản</h1>
            <p class="text-slate-400 text-sm">Xác thực tập trung qua <strong class="text-amber-300">Keycloak IAM Server (Port 18080)</strong></p>
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
