import assert from "node:assert/strict";
import { test } from "node:test";
import {
  renderAiGuideChatWidget,
  renderAiMessageBubble,
  renderAiSourceBadge,
} from "../src/index.js";

void test("renderAiSourceBadge renders source badge HTML correctly", () => {
  const html = renderAiSourceBadge({
    title: "Tư liệu Lịch sử Bảo tàng",
    author: "Ban Di sản",
    sourceUrl: "https://hcmc-museum.gov.vn/docs/heritage",
  });

  assert.ok(html.includes("ai-source-badge"));
  assert.ok(html.includes("Tư liệu Lịch sử Bảo tàng"));
  assert.ok(html.includes("Ban Di sản"));
});

void test("renderAiMessageBubble renders message bubble with sources and audio player", () => {
  const html = renderAiMessageBubble({
    id: "msg-001",
    sender: "ai",
    text: "Bống bống dầu là một hiện vật khảo cổ học.",
    timestamp: "10:30",
    sources: [
      {
        title: "Khảo cổ Nam Bộ",
        author: "Bảo tàng TP.HCM",
        sourceUrl: "https://hcmc-museum.gov.vn",
        snippet: "Trích dẫn...",
      },
    ],
    audioUrl: "/audio/test.mp3",
  });

  assert.ok(html.includes("ai-message-bubble"));
  assert.ok(html.includes("Bống bống dầu"));
  assert.ok(html.includes("ai-source-badge"));
  assert.ok(html.includes("btn-play-audio"));
});

void test("renderAiGuideChatWidget renders full chat widget container", () => {
  const html = renderAiGuideChatWidget([
    {
      id: "msg-001",
      sender: "user",
      text: "Xin chào AI Guide!",
      timestamp: "10:00",
    },
  ]);

  assert.ok(html.includes("ai-chat-widget"));
  assert.ok(html.includes("Trợ Lý AI Thuyết Minh Bảo Tàng"));
  assert.ok(html.includes("ai-input-text"));
});
