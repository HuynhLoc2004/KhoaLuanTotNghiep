import assert from "node:assert/strict";
import { test } from "node:test";
import { renderVoiceScriptCard, renderVoicePlayerWidget } from "../src/index.js";

void test("renderVoiceScriptCard renders script title, locale badge and text", () => {
  const html = renderVoiceScriptCard({
    id: "script-001",
    locale: "vi",
    title: "Trống Đồng Đông Sơn",
    text: "Nội dung thuyết minh.",
    status: "PUBLISHED",
    updatedAt: "2026-09-02T00:00:00.000Z",
  });

  assert.ok(html.includes("voice-script-card"));
  assert.ok(html.includes('data-script-id="script-001"'));
  assert.ok(html.includes("Trống Đồng Đông Sơn"));
  assert.ok(html.includes("VI"));
});

void test("renderVoicePlayerWidget renders controls and script list", () => {
  const html = renderVoicePlayerWidget({
    scripts: [
      {
        id: "script-001",
        locale: "vi",
        title: "Trống Đồng Đông Sơn",
        text: "Nội dung thuyết minh.",
        status: "PUBLISHED",
        updatedAt: "2026-09-02T00:00:00.000Z",
      },
    ],
  });

  assert.ok(html.includes("voice-guide-widget"));
  assert.ok(html.includes("voice-mic-button"));
  assert.ok(html.includes("voice-play-button"));
  assert.ok(html.includes("voice-speed-select"));
  assert.ok(html.includes("Trống Đồng Đông Sơn"));
});
