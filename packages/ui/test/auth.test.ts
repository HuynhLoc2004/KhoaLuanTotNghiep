import assert from "node:assert/strict";
import { test } from "node:test";
import {
  renderAuthHeaderBadge,
  renderAuthModal,
  renderUserProfileDrawer,
} from "../src/auth/renderer.js";

void test("renderAuthHeaderBadge renders Keycloak login button for guest", () => {
  const html = renderAuthHeaderBadge();
  assert.ok(html.includes('id="btn-auth-login"'));
  assert.ok(html.includes("Đăng Nhập Keycloak"));
});

void test("renderAuthHeaderBadge renders profile badge for authenticated user", () => {
  const html = renderAuthHeaderBadge({
    id: "usr-01",
    username: "loc_huynh",
    fullName: "Huỳnh Tấn Lộc",
    roles: ["admin"],
    provider: "keycloak",
  });
  assert.ok(html.includes("Huỳnh Tấn Lộc"));
  assert.ok(html.includes("ADMIN • KEYCLOAK"));
});

void test("renderAuthModal renders Keycloak SSO dialog", () => {
  const html = renderAuthModal();
  assert.ok(html.includes('id="auth-modal-overlay"'));
  assert.ok(html.includes("Keycloak IAM Server"));
  assert.ok(html.includes("Port 18080"));
});

void test("renderUserProfileDrawer renders user info, bookmarks and history", () => {
  const html = renderUserProfileDrawer(
    {
      id: "usr-01",
      username: "loc_huynh",
      fullName: "Huỳnh Tấn Lộc",
      email: "loc@hcmc-museum.vn",
      roles: ["member"],
      provider: "keycloak",
    },
    [
      {
        id: "bm-1",
        artifactId: "art-1",
        title: "Ấn Vàng Hoàng Đế",
        type: "artifact",
        createdAt: "2026-08-12T10:00:00Z",
      },
    ],
    [
      {
        id: "h-1",
        action: "VIEW_ARTIFACT",
        targetId: "art-1",
        title: "Ấn Vàng Hoàng Đế",
        timestamp: "2026-08-12T10:05:00Z",
      },
    ],
  );

  assert.ok(html.includes("Huỳnh Tấn Lộc"));
  assert.ok(html.includes("Ấn Vàng Hoàng Đế"));
  assert.ok(html.includes("VIEW_ARTIFACT"));
});
