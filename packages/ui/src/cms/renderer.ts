import { heritageTheme } from "../tokens/theme.js";
import type {
  CmsBlock,
  CmsRenderedBlock,
  CmsHeroBlock,
  CmsArtifactGridBlock,
  CmsTimelinePreviewBlock,
  CmsBannerBlock,
} from "./types.js";

export function renderHeroBlock(block: CmsHeroBlock): CmsRenderedBlock {
  const bgStyle = block.backgroundImageUrl
    ? `background-image: linear-gradient(rgba(18, 18, 18, 0.75), rgba(18, 18, 18, 0.9)), url('${block.backgroundImageUrl}');`
    : `background: linear-gradient(135deg, ${heritageTheme.colors.primaryRedDark}, ${heritageTheme.colors.bgDark});`;

  const ctaHtml = block.ctaText
    ? `<a id="hero-cta-btn" href="${block.ctaLink ?? "#"}" class="btn-primary" style="display:inline-block; margin-top:1.5rem; padding:0.75rem 1.75rem; background-color:${heritageTheme.colors.accentGold}; color:#121212; font-weight:bold; border-radius:0.375rem; text-decoration:none; transition:${heritageTheme.animations.transitionFast};">${block.ctaText}</a>`
    : "";

  const html = `
    <section id="hero-${block.id}" class="cms-hero-section" style="${bgStyle} padding: 5rem 1.5rem; text-align: center; color: ${heritageTheme.colors.textPrimary}; border-bottom: 2px solid ${heritageTheme.colors.accentGold};">
      <div class="container" style="max-width: 1200px; margin: 0 auto;">
        <h1 style="font-family: ${heritageTheme.typography.fontFamilyHeading}; font-size: ${heritageTheme.typography.sizes.h1}; margin-bottom: 1rem; color: ${heritageTheme.colors.textPrimary}; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">${block.title}</h1>
        <p style="font-family: ${heritageTheme.typography.fontFamilyBody}; font-size: ${heritageTheme.typography.sizes.lg}; color: ${heritageTheme.colors.textSecondary}; max-width: 700px; margin: 0 auto;">${block.subtitle}</p>
        ${ctaHtml}
      </div>
    </section>
  `.trim();

  return {
    blockId: block.id,
    type: "hero",
    html,
    metadata: {
      title: block.title,
      hasCta: Boolean(block.ctaText),
    },
  };
}

export function renderArtifactGridBlock(block: CmsArtifactGridBlock): CmsRenderedBlock {
  const subtitleHtml = block.subtitle
    ? `<p style="color: ${heritageTheme.colors.textSecondary}; text-align: center; margin-bottom: 2rem;">${block.subtitle}</p>`
    : "";

  const cardsHtml = block.artifacts
    .map((art) => {
      const badge3d = art.is3dAvailable
        ? `<span class="badge-3d" style="background-color:${heritageTheme.colors.accentGold}; color:#121212; padding:0.2rem 0.5rem; border-radius:0.25rem; font-size:0.75rem; font-weight:bold;">3D Ready</span>`
        : `<span class="badge-2d" style="background-color:${heritageTheme.colors.bgGlass}; color:${heritageTheme.colors.textMuted}; padding:0.2rem 0.5rem; border-radius:0.25rem; font-size:0.75rem;">2D Media</span>`;

      return `
        <article id="artifact-card-${art.id}" class="artifact-card" style="background: ${heritageTheme.glassmorphism.background}; backdrop-filter: ${heritageTheme.glassmorphism.backdropFilter}; border: ${heritageTheme.glassmorphism.border}; border-radius: 0.5rem; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; transition: ${heritageTheme.animations.transitionNormal};">
          <div>
            <div style="display:flex; justify-between; align-items:center; margin-bottom:0.75rem;">
              <span style="color:${heritageTheme.colors.bronze}; font-size:${heritageTheme.typography.sizes.xs}; font-weight:600; text-transform:uppercase;">${art.category}</span>
              ${badge3d}
            </div>
            <h3 style="font-family:${heritageTheme.typography.fontFamilyHeading}; font-size:${heritageTheme.typography.sizes.xl}; color:${heritageTheme.colors.textPrimary}; margin-bottom:0.5rem;">${art.name}</h3>
            <p style="color:${heritageTheme.colors.accentGold}; font-size:${heritageTheme.typography.sizes.sm}; margin-bottom:1rem;">Niên đại: ${art.period}</p>
          </div>
          <button id="view-artifact-${art.id}" style="width:100%; padding:0.5rem; background:transparent; border:1px solid ${heritageTheme.colors.accentGold}; color:${heritageTheme.colors.accentGold}; border-radius:0.25rem; cursor:pointer; font-weight:bold;">Khám phá hiện vật</button>
        </article>
      `.trim();
    })
    .join("\n");

  const html = `
    <section id="artifact-grid-${block.id}" class="cms-artifact-grid" style="padding: 4rem 1.5rem; background-color: ${heritageTheme.colors.bgDark};">
      <div style="max-width: 1200px; margin: 0 auto;">
        <h2 style="font-family: ${heritageTheme.typography.fontFamilyHeading}; font-size: ${heritageTheme.typography.sizes.h2}; color: ${heritageTheme.colors.textPrimary}; text-align: center; margin-bottom: 0.5rem;">${block.title}</h2>
        ${subtitleHtml}
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
          ${cardsHtml}
        </div>
      </div>
    </section>
  `.trim();

  return {
    blockId: block.id,
    type: "artifact_grid",
    html,
    metadata: {
      count: block.artifacts.length,
    },
  };
}

export function renderTimelinePreviewBlock(block: CmsTimelinePreviewBlock): CmsRenderedBlock {
  const eventsHtml = block.events
    .map((ev, idx) =>
      `
      <div id="timeline-event-${String(idx)}" style="position:relative; padding-left:2rem; border-left:2px solid ${heritageTheme.colors.accentGold}; margin-bottom:1.5rem;">
        <div style="position:absolute; left:-7px; top:0; width:12px; height:12px; border-radius:50%; background:${heritageTheme.colors.accentGold};"></div>
        <span style="font-weight:bold; color:${heritageTheme.colors.accentGold}; font-size:${heritageTheme.typography.sizes.sm};">${ev.year}</span>
        <h4 style="font-family:${heritageTheme.typography.fontFamilyHeading}; color:${heritageTheme.colors.textPrimary}; margin:0.25rem 0;">${ev.title}</h4>
        <p style="color:${heritageTheme.colors.textSecondary}; font-size:${heritageTheme.typography.sizes.sm}; margin:0;">${ev.description}</p>
      </div>
    `.trim(),
    )
    .join("\n");

  const html = `
    <section id="timeline-${block.id}" class="cms-timeline-preview" style="padding: 4rem 1.5rem; background: ${heritageTheme.colors.bgCard};">
      <div style="max-width: 900px; margin: 0 auto;">
        <h2 style="font-family: ${heritageTheme.typography.fontFamilyHeading}; font-size: ${heritageTheme.typography.sizes.h2}; color: ${heritageTheme.colors.textPrimary}; margin-bottom: 2rem; text-align: center;">${block.title}</h2>
        <div>
          ${eventsHtml}
        </div>
      </div>
    </section>
  `.trim();

  return {
    blockId: block.id,
    type: "timeline_preview",
    html,
    metadata: {
      eventCount: block.events.length,
    },
  };
}

export function renderBannerBlock(block: CmsBannerBlock): CmsRenderedBlock {
  const borderColor =
    block.variant === "warning"
      ? "#E65100"
      : block.variant === "announcement"
        ? heritageTheme.colors.accentGold
        : "#0288D1";

  const html = `
    <aside id="banner-${block.id}" style="margin: 1.5rem auto; max-width: 1200px; padding: 1rem 1.5rem; background: ${heritageTheme.glassmorphism.background}; border-left: 4px solid ${borderColor}; border-radius: 0.25rem; color: ${heritageTheme.colors.textPrimary};">
      <strong style="color: ${heritageTheme.colors.accentGold};">${block.title}:</strong> ${block.message}
    </aside>
  `.trim();

  return {
    blockId: block.id,
    type: "banner",
    html,
    metadata: {
      variant: block.variant,
    },
  };
}

export function renderCmsBlock(block: CmsBlock): CmsRenderedBlock {
  switch (block.type) {
    case "hero":
      return renderHeroBlock(block);
    case "artifact_grid":
      return renderArtifactGridBlock(block);
    case "timeline_preview":
      return renderTimelinePreviewBlock(block);
    case "banner":
      return renderBannerBlock(block);
    default: {
      const _exhaustiveCheck: never = block;
      throw new Error(`Unknown CMS block type: ${JSON.stringify(_exhaustiveCheck)}`);
    }
  }
}
