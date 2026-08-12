import assert from "node:assert/strict";
import { test } from "node:test";
import {
  renderFacetFilters,
  renderSearchBar,
  renderSearchPage,
  renderSearchResultCard,
} from "../src/search/renderer.js";

test("renderSearchBar renders search input and search button", () => {
  const html = renderSearchBar("Đông Sơn");
  assert.ok(html.includes('id="search-input"'));
  assert.ok(html.includes('value="Đông Sơn"'));
  assert.ok(html.includes("🔍 Tìm kiếm"));
});

test("renderFacetFilters renders content type facet pills", () => {
  const html = renderFacetFilters(
    [
      { type: "artifact", count: 5 },
      { type: "exhibition", count: 2 },
    ],
    "artifact",
  );

  assert.ok(html.includes("Tất cả"));
  assert.ok(html.includes("🏛️ Hiện vật (5)"));
  assert.ok(html.includes("🖼️ Triển lãm (2)"));
});

test("renderSearchResultCard renders result item details and highlights", () => {
  const html = renderSearchResultCard({
    id: "art-1",
    code: "ART-001",
    type: "artifact",
    title: "Trống Đồng Đông Sơn",
    subtitle: "Thời kỳ Đông Sơn",
    summary: "Báu vật nghệ thuật đúc đồng cổ đại",
    score: 0.95,
    highlights: ["Khớp tiêu đề: Trống Đồng"],
  });

  assert.ok(html.includes("ART-001"));
  assert.ok(html.includes("Trống Đồng Đông Sơn"));
  assert.ok(html.includes("Khớp tiêu đề: Trống Đồng"));
});

test("renderSearchPage renders full search discovery layout", () => {
  const html = renderSearchPage("Đông Sơn", [
    {
      id: "art-1",
      code: "ART-001",
      type: "artifact",
      title: "Trống Đồng Đông Sơn",
      summary: "Đặc sắc",
      score: 0.9,
      highlights: [],
    },
  ]);

  assert.ok(html.includes("SEARCH & DISCOVERY — TÌM KIẾM VÀ KHÁM PHÁ DI SẢN"));
  assert.ok(html.includes("Trống Đồng Đông Sơn"));
});
