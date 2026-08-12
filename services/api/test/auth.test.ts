import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import { createApp } from "../src/app.js";
import type {
  AuthTokenResponse,
  KeycloakConfigResponse,
  UserProfile,
} from "@hcmc-museum/contracts";

let server: ReturnType<typeof app.listen>;
let baseUrl = "";
const app = createApp();

before(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address() as AddressInfo;
      baseUrl = `http://127.0.0.1:${String(addr.port)}`;
      resolve();
    });
  });
});

after(() => {
  server.close();
});

void test("GET /api/v1/auth/config returns Keycloak IAM configuration", async () => {
  const res = await fetch(`${baseUrl}/api/v1/auth/config`);
  assert.equal(res.status, 200);

  const data = (await res.json()) as KeycloakConfigResponse;
  assert.equal(data.realm, "hcmc-museum");
  assert.equal(data.clientId, "hcmc-museum-web");
  assert.equal(data.enabled, true);
});

void test("POST /api/v1/auth/login handles token exchange and profile creation", async () => {
  const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: "keycloak_test_token" }),
  });
  assert.equal(res.status, 200);

  const data = (await res.json()) as AuthTokenResponse;
  assert.equal(data.tokenType, "Bearer");
  assert.equal(data.user.username, "loc_huynh_kc");
  assert.equal(data.user.provider, "keycloak");
});

void test("GET /api/v1/auth/me returns current user profile", async () => {
  const res = await fetch(`${baseUrl}/api/v1/auth/me`, {
    headers: { Authorization: "Bearer keycloak_valid_token" },
  });
  assert.equal(res.status, 200);

  const data = (await res.json()) as { user: UserProfile };
  assert.equal(data.user.email, "huynhtanlocpp09@gmail.com");
  assert.equal(data.user.fullName, "Huỳnh Tấn Lộc");
});

void test("GET & POST /api/v1/auth/bookmarks manages saved artifacts", async () => {
  const getRes = await fetch(`${baseUrl}/api/v1/auth/bookmarks`);
  assert.equal(getRes.status, 200);
  const initialData = (await getRes.json()) as { total: number };
  const initialTotal = initialData.total;

  const postRes = await fetch(`${baseUrl}/api/v1/auth/bookmarks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      artifactId: "art-test-99",
      title: "Áo Dài Hoàng Cung Nguyễn",
      type: "artifact",
    }),
  });
  assert.equal(postRes.status, 201);

  const getRes2 = await fetch(`${baseUrl}/api/v1/auth/bookmarks`);
  const updatedData = (await getRes2.json()) as { total: number };
  assert.equal(updatedData.total, initialTotal + 1);
});

void test("GET & POST /api/v1/auth/history records browsing logs", async () => {
  const postRes = await fetch(`${baseUrl}/api/v1/auth/history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "VIEW_EXHIBITION",
      targetId: "exh-001",
      title: "Triển lãm Sơn Mài Việt Nam",
    }),
  });
  assert.equal(postRes.status, 201);

  const getRes = await fetch(`${baseUrl}/api/v1/auth/history`);
  assert.equal(getRes.status, 200);
});
