import assert from "node:assert/strict";
import { test } from "node:test";
import { renderPublicSearchPage } from "../src/search/page.js";

void test("renderPublicSearchPage renders full HTML document with header, search section and footer", () => {
  const html = renderPublicSearchPage({
    query: "Óc Eo",
    items: [
      {
        id: "art-oe-01",
        code: "ART-OE-002",
        type: "artifact",
        title: "Tượng Thần Vishnu Óc Eo",
        summary: "Điêu khắc đá",
        score: 0.9,
        highlights: [],
      },
    ],
  });

  assert.ok(html.includes("<!DOCTYPE html>"));
  assert.ok(html.includes("<title>Tìm Kiếm Di Sản | Bảo tàng Lịch sử TP.HCM</title>"));
  assert.ok(html.includes("Tượng Thần Vishnu Óc Eo"));
  assert.ok(html.includes("SEARCH & DISCOVERY"));
});
