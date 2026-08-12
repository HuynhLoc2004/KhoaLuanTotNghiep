import assert from "node:assert/strict";
import { test } from "node:test";
import {
  AuthRoleSchema,
  AuthTokenResponseSchema,
  KeycloakConfigResponseSchema,
  UserBookmarkItemSchema,
  UserHistoryItemSchema,
  UserProfileSchema,
} from "../src/auth/schemas.js";

void test("AuthRoleSchema validates valid roles", () => {
  assert.equal(AuthRoleSchema.parse("admin"), "admin");
  assert.equal(AuthRoleSchema.parse("visitor"), "visitor");
});

void test("UserProfileSchema parses user info with defaults", () => {
  const user = UserProfileSchema.parse({
    id: "user-101",
    username: "loc_huynh",
    email: "loc@hcmc-museum.vn",
  });
  assert.equal(user.id, "user-101");
  assert.equal(user.username, "loc_huynh");
  assert.deepEqual(user.roles, ["visitor"]);
  assert.equal(user.provider, "keycloak");
});

void test("AuthTokenResponseSchema validates token responses", () => {
  const tokenResp = AuthTokenResponseSchema.parse({
    accessToken: "mock-jwt-token-12345",
    user: {
      id: "usr-01",
      username: "keycloak_user",
      roles: ["member"],
    },
  });
  assert.equal(tokenResp.accessToken, "mock-jwt-token-12345");
  assert.equal(tokenResp.tokenType, "Bearer");
  assert.equal(tokenResp.user.roles[0], "member");
});

void test("UserBookmarkItemSchema & UserHistoryItemSchema validate items", () => {
  const bookmark = UserBookmarkItemSchema.parse({
    id: "bm-1",
    artifactId: "art-001",
    title: "Ấn Vàng Triều Nguyễn",
    createdAt: "2026-08-12T16:00:00Z",
  });
  assert.equal(bookmark.title, "Ấn Vàng Triều Nguyễn");

  const history = UserHistoryItemSchema.parse({
    id: "hist-1",
    action: "VIEW_ARTIFACT",
    targetId: "art-001",
    title: "Trống Đồng Đông Sơn",
    timestamp: "2026-08-12T16:05:00Z",
  });
  assert.equal(history.action, "VIEW_ARTIFACT");
});

void test("KeycloakConfigResponseSchema parses keycloak server config", () => {
  const config = KeycloakConfigResponseSchema.parse({
    realm: "hcmc-museum",
    clientId: "hcmc-museum-web",
    authServerUrl: "http://localhost:18080",
    enabled: true,
  });
  assert.equal(config.realm, "hcmc-museum");
  assert.equal(config.enabled, true);
});
