import assert from "node:assert/strict";
import test from "node:test";
import { renderPublicRecognitionPage } from "../src/index.js";

void test("renderPublicRecognitionPage renders full HTML document with header, upload widget and footer", () => {
  const html = renderPublicRecognitionPage();

  assert.ok(html.includes("<!DOCTYPE html>"));
  assert.ok(html.includes("Nhận Diện Hiện Vật Bằng Ảnh"));
  assert.ok(html.includes("recognition-guide-widget"));
  assert.ok(html.includes("recognition-upload-input"));
  assert.ok(html.includes("Bảo tàng Lịch sử TP. Hồ Chí Minh"));
});
