import assert from "node:assert/strict";
import { test } from "node:test";
import {
  VoiceScriptSchema,
  VoiceScriptUpsertRequestSchema,
  VoiceSynthesizeRequestSchema,
  VoiceSynthesizeResponseSchema,
  VoiceCommandRequestSchema,
  VoiceCommandResponseSchema,
  VoiceAdminConfigSchema,
  VoiceCostEstimateResponseSchema,
} from "../src/index.js";

void test("validates VoiceScriptSchema and VoiceScriptUpsertRequestSchema", () => {
  const script = VoiceScriptSchema.parse({
    id: "script-001",
    artifactId: "art-001",
    locale: "vi",
    title: "Trống Đồng Đông Sơn",
    text: "Trống đồng Đông Sơn là hiện vật tiêu biểu của văn hóa Đông Sơn.",
    status: "PUBLISHED",
    updatedAt: "2026-09-02T00:00:00.000Z",
  });
  assert.equal(script.status, "PUBLISHED");

  const upsert = VoiceScriptUpsertRequestSchema.parse({
    locale: "en",
    title: "Dong Son Bronze Drum",
    text: "The Dong Son bronze drum is a representative artifact.",
  });
  assert.equal(upsert.status, "DRAFT");
});

void test("validates VoiceSynthesizeRequestSchema defaults and VoiceSynthesizeResponseSchema", () => {
  const request = VoiceSynthesizeRequestSchema.parse({ text: "Xin chào quý khách" });
  assert.equal(request.locale, "vi");
  assert.equal(request.voiceId, "default");
  assert.equal(request.speed, 1);

  const response = VoiceSynthesizeResponseSchema.parse({
    cacheKey: "abcd1234",
    cached: false,
    engine: "web-speech-client",
    ssmlText: "Xin chào quý khách",
    plainText: "Xin chào quý khách",
    locale: "vi",
    voiceId: "default",
    speed: 1,
    estimatedDurationSeconds: 3,
    costEstimate: { engine: "web-speech-client", amount: 0, currency: "VND" },
  });
  assert.equal(response.costEstimate.amount, 0);
});

void test("validates VoiceCommandRequestSchema and VoiceCommandResponseSchema", () => {
  const request = VoiceCommandRequestSchema.parse({ transcript: "phát thuyết minh" });
  assert.equal(request.locale, "vi");

  const response = VoiceCommandResponseSchema.parse({
    intent: "PLAY",
    confidence: 0.9,
    message: "Đang phát thuyết minh",
  });
  assert.equal(response.intent, "PLAY");
});

void test("validates VoiceAdminConfigSchema and VoiceCostEstimateResponseSchema", () => {
  const config = VoiceAdminConfigSchema.parse({
    version: 1,
    glossary: [{ term: "Óc Eo", locale: "vi", pronunciation: "Óc Eo" }],
    cloudEngineEnabled: false,
    updatedAt: "2026-09-02T00:00:00.000Z",
  });
  assert.equal(config.glossary.length, 1);

  const estimate = VoiceCostEstimateResponseSchema.parse({
    engine: "web-speech-client",
    characterCount: 120,
    estimatedCost: 0,
    currency: "VND",
    scriptsAlreadyCached: 1,
    scriptsToGenerate: 2,
    note: "Web Speech API miễn phí, không phát sinh chi phí.",
  });
  assert.equal(estimate.estimatedCost, 0);
});
