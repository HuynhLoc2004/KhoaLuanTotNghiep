import assert from "node:assert/strict";
import test from "node:test";
import { renderPublicVoicePage } from "../src/index.js";
import type { VoiceScript } from "@hcmc-museum/contracts";

void test("renderPublicVoicePage renders full HTML document with header, voice player and footer", () => {
  const scripts: VoiceScript[] = [
    {
      id: "script-dong-son-vi",
      artifactId: "art-001",
      locale: "vi",
      title: "Trống Đồng Đông Sơn",
      text: "Trống đồng Đông Sơn là hiện vật tiêu biểu của văn hóa Đông Sơn.",
      status: "PUBLISHED",
      updatedAt: "2026-09-01T00:00:00.000Z",
    },
  ];

  const html = renderPublicVoicePage({ scripts });

  assert.ok(html.includes("<!DOCTYPE html>"));
  assert.ok(html.includes("Thuyết Minh Đa Ngôn Ngữ"));
  assert.ok(html.includes("voice-guide-widget"));
  assert.ok(html.includes("Trống Đồng Đông Sơn"));
  assert.ok(html.includes("Bảo tàng Lịch sử TP. Hồ Chí Minh"));
});

void test("renderPublicVoicePage falls back to default scripts when none are provided", () => {
  const html = renderPublicVoicePage();

  assert.ok(html.includes("Trống Đồng Đông Sơn"));
  assert.ok(html.includes("Dong Son Bronze Drum"));
});
