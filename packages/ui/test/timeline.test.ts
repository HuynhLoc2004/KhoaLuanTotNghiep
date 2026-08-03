import test from "node:test";
import assert from "node:assert/strict";
import {
  renderModeSwitcher,
  renderRelatedArtifactCard,
  renderLivingTimeline2D,
} from "../src/index.js";
import type { NarrativeJourney, RelatedArtifact } from "@hcmc-museum/contracts";

void test("Living Timeline UI Components Test Suite", async (t) => {
  await t.test("renderModeSwitcher highlights active mode button", () => {
    const freeHtml = renderModeSwitcher("FREE_EXPLORE");
    assert.ok(freeHtml.includes("btn-mode-free"));
    assert.ok(freeHtml.includes("btn-mode-guided"));

    const guidedHtml = renderModeSwitcher("GUIDED_JOURNEY");
    assert.ok(guidedHtml.includes("btn-mode-guided"));
  });

  await t.test("renderRelatedArtifactCard renders relation badge and reason", () => {
    const related: RelatedArtifact = {
      artifactId: "art-2",
      code: "ART-OE-002",
      title: "Tượng Thần Vishnu Óc Eo",
      relationType: "SAME_CULTURE",
      reason: "Cùng đại diện nghệ thuật tạc tượng cổ",
    };

    const card = renderRelatedArtifactCard(related);
    assert.ok(card.includes("SAME_CULTURE"));
    assert.ok(card.includes("Tượng Thần Vishnu Óc Eo"));
    assert.ok(card.includes("Cùng đại diện nghệ thuật tạc tượng cổ"));
  });

  await t.test("renderLivingTimeline2D renders timeline nodes and journey header", () => {
    const journey: NarrativeJourney = {
      id: "j-test",
      title: "Hành Trình Thử Nghiệm",
      theme: "Di Sản Văn Hóa",
      status: "PUBLISHED",
      nodes: [
        {
          id: "node-1",
          title: "Khởi Đầu Văn Minh",
          period: "Thế kỷ V TCN",
          description: "Nền văn hóa cổ đại.",
          artifactCode: "ART-DS-001",
        },
      ],
    };

    const html = renderLivingTimeline2D(journey, "FREE_EXPLORE");
    assert.ok(html.includes("Hành Trình Thử Nghiệm"));
    assert.ok(html.includes("Khởi Đầu Văn Minh"));
    assert.ok(html.includes("timeline-mode-switcher"));
  });
});
