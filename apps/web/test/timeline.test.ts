import test from "node:test";
import assert from "node:assert/strict";
import { renderLivingTimelinePage } from "../src/index.js";

test("Public Web Living Timeline Page Test Suite", async (t) => {
  await t.test(
    "renderLivingTimelinePage renders header, footer, 2D timeline nodes and mode switcher",
    () => {
      const html = renderLivingTimelinePage({ mode: "FREE_EXPLORE" });
      assert.ok(html.includes("<!DOCTYPE html>"));
      assert.ok(html.includes('<header id="app-header"'));
      assert.ok(html.includes('<footer id="app-footer"'));
      assert.ok(html.includes("LIVING TIMELINE — DÒNG THỜI GIAN SỐNG"));
      assert.ok(html.includes("timeline-mode-switcher"));
      assert.ok(html.includes("related-artifact-card"));
    },
  );
});
