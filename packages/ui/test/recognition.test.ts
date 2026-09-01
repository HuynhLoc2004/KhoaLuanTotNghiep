import assert from "node:assert/strict";
import { test } from "node:test";
import { renderRecognitionCandidateCard, renderRecognitionUploadWidget } from "../src/index.js";

void test("renderRecognitionCandidateCard renders title, confidence percent and zone badge", () => {
  const html = renderRecognitionCandidateCard({
    artifactId: "art-001",
    title: "Trống Đồng Đông Sơn",
    score: 0.9,
    confidence: 1,
    matchedZone: true,
  });

  assert.ok(html.includes("recognition-candidate-card"));
  assert.ok(html.includes('data-artifact-id="art-001"'));
  assert.ok(html.includes("Trống Đồng Đông Sơn"));
  assert.ok(html.includes("100%"));
  assert.ok(html.includes("Cùng khu vực"));
});

void test("renderRecognitionUploadWidget renders upload input and identify button", () => {
  const html = renderRecognitionUploadWidget();

  assert.ok(html.includes("recognition-guide-widget"));
  assert.ok(html.includes("recognition-upload-input"));
  assert.ok(html.includes("recognition-identify-button"));
  assert.ok(html.includes("recognition-results"));
});
