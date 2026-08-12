import test from "node:test";
import assert from "node:assert/strict";
import {
  ExplorationModeSchema,
  NarrativeJourneySchema,
  RelatedArtifactSchema,
} from "../src/index.js";

void test("Living Timeline Contracts Test Suite", async (t) => {
  await t.test("ExplorationModeSchema accepts FREE_EXPLORE and GUIDED_JOURNEY", () => {
    assert.equal(ExplorationModeSchema.parse("FREE_EXPLORE"), "FREE_EXPLORE");
    assert.equal(ExplorationModeSchema.parse("GUIDED_JOURNEY"), "GUIDED_JOURNEY");
    assert.throws(() => ExplorationModeSchema.parse("INVALID_MODE"));
  });

  await t.test("NarrativeJourneySchema parses valid narrative journey", () => {
    const parsed = NarrativeJourneySchema.parse({
      id: "j-1",
      title: "Hành Trình Mẫu",
      theme: "Lịch sử",
      status: "PUBLISHED",
      nodes: [
        {
          id: "n-1",
          title: "Mốc 1",
          period: "Thế kỷ V TCN",
          description: "Mô tả",
        },
      ],
    });

    assert.equal(parsed.id, "j-1");
    assert.equal(parsed.nodes.length, 1);
  });

  await t.test("RelatedArtifactSchema parses valid related artifact link", () => {
    const related = RelatedArtifactSchema.parse({
      artifactId: "art-1",
      code: "ART-DS-001",
      title: "Trống Đồng Đông Sơn",
      relationType: "SAME_PERIOD",
      reason: "Cùng niên đại chế tác",
    });

    assert.equal(related.relationType, "SAME_PERIOD");
  });
});
