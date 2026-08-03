import test from "node:test";
import assert from "node:assert/strict";
import {
  heritageTheme,
  renderCmsBlock,
  renderHeroBlock,
  renderArtifactGridBlock,
  renderTimelinePreviewBlock,
  renderBannerBlock,
  type CmsHeroBlock,
  type CmsArtifactGridBlock,
  type CmsTimelinePreviewBlock,
  type CmsBannerBlock,
} from "../src/index.js";

void test("UI Design System & CMS Renderer Test Suite", async (t) => {
  await t.test("Heritage Theme tokens are exported correctly", () => {
    assert.equal(heritageTheme.name, "Heritage Modern Dark");
    assert.equal(heritageTheme.colors.primaryRed, "#9E1B1B");
    assert.equal(heritageTheme.colors.accentGold, "#D4AF37");
    assert.ok(heritageTheme.glassmorphism.backdropFilter);
  });

  await t.test("renderHeroBlock renders correct HTML structure and CTA", () => {
    const hero: CmsHeroBlock = {
      type: "hero",
      id: "test-hero-1",
      title: "Tiêu đề Hero",
      subtitle: "Mô tả phụ",
      ctaText: "Khám phá ngay",
      ctaLink: "/explore",
    };
    const rendered = renderHeroBlock(hero);
    assert.equal(rendered.type, "hero");
    assert.equal(rendered.blockId, "test-hero-1");
    assert.ok(rendered.html.includes("Tiêu đề Hero"));
    assert.ok(rendered.html.includes("hero-cta-btn"));
    assert.ok(rendered.html.includes("/explore"));
  });

  await t.test("renderArtifactGridBlock renders grid with 3D ready badge", () => {
    const grid: CmsArtifactGridBlock = {
      type: "artifact_grid",
      id: "grid-1",
      title: "Hiện vật tiêu biểu",
      artifacts: [
        {
          id: "art-1",
          name: "Trống đồng",
          period: "Đông Sơn",
          category: "Cổ vật",
          is3dAvailable: true,
        },
      ],
    };
    const rendered = renderArtifactGridBlock(grid);
    assert.equal(rendered.type, "artifact_grid");
    assert.ok(rendered.html.includes("Trống đồng"));
    assert.ok(rendered.html.includes("3D Ready"));
    assert.ok(rendered.html.includes("artifact-card-art-1"));
  });

  await t.test("renderTimelinePreviewBlock renders timeline events", () => {
    const timeline: CmsTimelinePreviewBlock = {
      type: "timeline_preview",
      id: "time-1",
      title: "Lịch sử bảo tàng",
      events: [
        {
          year: "1929",
          title: "Khởi công",
          description: "Xây dựng bảo tàng",
        },
      ],
    };
    const rendered = renderTimelinePreviewBlock(timeline);
    assert.equal(rendered.type, "timeline_preview");
    assert.ok(rendered.html.includes("1929"));
    assert.ok(rendered.html.includes("Khởi công"));
  });

  await t.test("renderBannerBlock renders alert variant banner", () => {
    const banner: CmsBannerBlock = {
      type: "banner",
      id: "ban-1",
      title: "Lưu ý",
      message: "Bảo tàng mở cửa từ 8:00 - 17:00",
      variant: "info",
    };
    const rendered = renderBannerBlock(banner);
    assert.equal(rendered.type, "banner");
    assert.ok(rendered.html.includes("Bảo tàng mở cửa từ 8:00 - 17:00"));
  });

  await t.test("renderCmsBlock dispatches all block types correctly", () => {
    const hero: CmsHeroBlock = {
      type: "hero",
      id: "hero-disp",
      title: "Hero title",
      subtitle: "Hero subtitle",
    };
    const result = renderCmsBlock(hero);
    assert.equal(result.type, "hero");
    assert.ok(result.html.includes("Hero title"));
  });
});
