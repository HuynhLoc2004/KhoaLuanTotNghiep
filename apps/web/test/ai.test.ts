import assert from "node:assert/strict";
import { test } from "node:test";
import { renderPublicAiGuidePage } from "../src/index.js";

void test("renderPublicAiGuidePage renders full HTML document with header, chat widget and footer", () => {
  const html = renderPublicAiGuidePage();

  assert.ok(html.includes("<!DOCTYPE html>"));
  assert.ok(html.includes("Trợ Lý Thuyết Minh Viên AI"));
  assert.ok(html.includes("ai-chat-widget"));
  assert.ok(html.includes("Bảo tàng Lịch sử TP.HCM"));
});
