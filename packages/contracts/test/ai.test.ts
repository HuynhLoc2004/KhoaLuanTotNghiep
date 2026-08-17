import assert from "node:assert/strict";
import { test } from "node:test";
import {
  AiGuideAudioSpeakRequestSchema,
  AiGuideAudioSpeakResponseSchema,
  AiGuideQueryRequestSchema,
  AiGuideQueryResponseSchema,
} from "../src/index.js";

void test("validates AiGuideQueryRequestSchema correctly", () => {
  const validRequest = AiGuideQueryRequestSchema.parse({
    query: "Bống bống dầu là gì?",
    artifactId: "art-001",
    locale: "vi",
  });

  assert.equal(validRequest.query, "Bống bống dầu là gì?");
  assert.equal(validRequest.locale, "vi");
});

void test("validates AiGuideQueryResponseSchema correctly with sources and gating", () => {
  const validResponse = AiGuideQueryResponseSchema.parse({
    answer: "Bống bống dầu là một vật phẩm di sản văn hóa dân gian.",
    confidenceScore: 0.95,
    isGated: false,
    sources: [
      {
        title: "Tư liệu Bảo tàng Lịch sử TP.HCM",
        author: "Ban Nghiên cứu Di sản",
        sourceUrl: "https://hcmc-museum.gov.vn/docs/bong-bong-dau",
        snippet: "Trích dẫn tài liệu khảo cổ số 42...",
      },
    ],
    suggestedQuestions: ["Hiện vật này được tạo ra vào năm nào?", "Ai là người trao tặng?"],
    audioUrl: "/audio/ai-guide-001.mp3",
  });

  assert.equal(validResponse.confidenceScore, 0.95);
  assert.equal(validResponse.isGated, false);
  assert.equal(validResponse.sources.length, 1);
});

void test("validates AiGuideAudioSpeakRequestSchema & ResponseSchema", () => {
  const speakReq = AiGuideAudioSpeakRequestSchema.parse({
    text: "Xin chào quý khách đến với Bảo tàng Lịch sử TP.HCM",
    locale: "vi",
  });
  assert.equal(speakReq.locale, "vi");

  const speakRes = AiGuideAudioSpeakResponseSchema.parse({
    audioUrl: "/audio/speak-welcome.mp3",
    durationSeconds: 4.5,
    format: "audio/mp3",
  });
  assert.equal(speakRes.durationSeconds, 4.5);
});
