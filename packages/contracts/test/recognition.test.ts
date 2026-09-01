import assert from "node:assert/strict";
import { test } from "node:test";
import {
  RecognitionIdentifyRequestSchema,
  RecognitionIdentifyResponseSchema,
  RecognitionFeedbackRequestSchema,
  RecognitionReferenceUpsertRequestSchema,
} from "../src/index.js";

void test("RecognitionIdentifyRequestSchema requires a non-empty imageBase64", () => {
  assert.equal(RecognitionIdentifyRequestSchema.safeParse({ imageBase64: "abc" }).success, true);
  assert.equal(RecognitionIdentifyRequestSchema.safeParse({ imageBase64: "" }).success, false);
  assert.equal(RecognitionIdentifyRequestSchema.safeParse({}).success, false);
});

void test("RecognitionIdentifyRequestSchema accepts an optional zoneHint", () => {
  const result = RecognitionIdentifyRequestSchema.safeParse({
    imageBase64: "abc",
    zoneHint: "zone-a",
  });
  assert.equal(result.success, true);
});

void test("RecognitionIdentifyResponseSchema validates status/candidates shape", () => {
  const result = RecognitionIdentifyResponseSchema.safeParse({
    status: "MATCHED",
    candidates: [
      { artifactId: "art-001", title: "Trống Đồng", score: 0.9, confidence: 1, matchedZone: false },
    ],
    matchThreshold: 0.999,
    lowConfidenceThreshold: 0.9,
  });
  assert.equal(result.success, true);
});

void test("RecognitionIdentifyResponseSchema rejects an out-of-range confidence", () => {
  const result = RecognitionIdentifyResponseSchema.safeParse({
    status: "MATCHED",
    candidates: [
      {
        artifactId: "art-001",
        title: "Trống Đồng",
        score: 0.9,
        confidence: 1.5,
        matchedZone: false,
      },
    ],
    matchThreshold: 0.999,
    lowConfidenceThreshold: 0.9,
  });
  assert.equal(result.success, false);
});

void test("RecognitionFeedbackRequestSchema requires artifactId and confirmed", () => {
  assert.equal(
    RecognitionFeedbackRequestSchema.safeParse({ artifactId: "art-001", confirmed: true }).success,
    true,
  );
  assert.equal(RecognitionFeedbackRequestSchema.safeParse({ confirmed: true }).success, false);
});

void test("RecognitionReferenceUpsertRequestSchema requires artifactId/title/imageBase64", () => {
  const result = RecognitionReferenceUpsertRequestSchema.safeParse({
    artifactId: "art-003",
    title: "Hiện vật mới",
    imageBase64: "abc",
  });
  assert.equal(result.success, true);
  assert.equal(
    RecognitionReferenceUpsertRequestSchema.safeParse({ artifactId: "art-003" }).success,
    false,
  );
});
