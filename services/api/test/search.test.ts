import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/index.js";
import { removeVietnameseTones } from "../src/routes/search.js";
import type { SearchResponse, SearchSuggestResponse } from "@hcmc-museum/contracts";

void test("removeVietnameseTones strips diacritics and converts to lowercase", () => {
  assert.equal(removeVietnameseTones("Đông Sơn"), "dong son");
  assert.equal(removeVietnameseTones("Tượng Thần Óc Eo"), "tuong than oc eo");
  assert.equal(removeVietnameseTones("Áo dài"), "ao dai");
});

void test("Search REST API Route Test Suite", async (t) => {
  const app = createApp();
  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  const baseUrl = `http://localhost:${String(port)}`;

  t.after(() => {
    server.close();
  });

  await t.test("GET /api/v1/search returns all items when query is empty", async () => {
    const res = await fetch(`${baseUrl}/api/v1/search`);
    assert.equal(res.status, 200);

    const json = (await res.json()) as SearchResponse;
    assert.equal(typeof json.total, "number");
    assert.ok(json.total > 0);
    assert.ok(Array.isArray(json.items));
    assert.ok(Array.isArray(json.facets));
  });

  await t.test("GET /api/v1/search performs Vietnamese unaccent search matching", async () => {
    const res = await fetch(`${baseUrl}/api/v1/search?q=dong%20son`);
    assert.equal(res.status, 200);

    const json = (await res.json()) as SearchResponse;
    assert.ok(json.total >= 1);
    const found = json.items.some((item) => item.title.includes("Đông Sơn"));
    assert.ok(found, "Expected to find Đông Sơn artifact from unaccent query 'dong son'");
  });

  await t.test("GET /api/v1/search filters by content types", async () => {
    const res = await fetch(`${baseUrl}/api/v1/search?types=artifact`);
    assert.equal(res.status, 200);

    const json = (await res.json()) as SearchResponse;
    assert.ok(json.items.every((item) => item.type === "artifact"));
  });

  await t.test("GET /api/v1/search/suggest returns instant autocomplete suggestions", async () => {
    const res = await fetch(`${baseUrl}/api/v1/search/suggest?q=dong`);
    assert.equal(res.status, 200);

    const json = (await res.json()) as SearchSuggestResponse;
    assert.ok(Array.isArray(json.suggestions));
    assert.ok(json.suggestions.length > 0);
    assert.ok(json.suggestions[0]?.toLowerCase().includes("đông"));
  });
});
