import assert from "node:assert/strict";
import { test } from "node:test";
import { renderPublicProfilePage } from "../src/auth/page.js";

void test("renderPublicProfilePage renders profile HTML with Keycloak badge and history", () => {
  const html = renderPublicProfilePage({
    user: {
      id: "usr-01",
      username: "loc_huynh",
      fullName: "Huỳnh Tấn Lộc",
      email: "loc@hcmc-museum.vn",
      roles: ["admin"],
      provider: "keycloak",
    },
  });

  assert.ok(html.includes("<!DOCTYPE html>"));
  assert.ok(html.includes("<title>Hồ Sơ Khách Tham Quan | Bảo tàng Lịch sử TP.HCM</title>"));
  assert.ok(html.includes("Huỳnh Tấn Lộc"));
  assert.ok(html.includes("Keycloak IAM Server"));
});
