import { heritageTheme } from "../tokens/theme.js";
import type {
  ExplorationMode,
  NarrativeJourney,
  NarrativeNode,
  RelatedArtifact,
} from "@hcmc-museum/contracts";

export function renderModeSwitcher(currentMode: ExplorationMode = "FREE_EXPLORE"): string {
  const isFree = currentMode === "FREE_EXPLORE";
  const isGuided = currentMode === "GUIDED_JOURNEY";

  const freeBtnBg = isFree ? heritageTheme.colors.primaryRed : "transparent";
  const freeBtnColor = isFree
    ? heritageTheme.colors.accentGold
    : heritageTheme.colors.textSecondary;

  const guidedBtnBg = isGuided ? heritageTheme.colors.primaryRed : "transparent";
  const guidedBtnColor = isGuided
    ? heritageTheme.colors.accentGold
    : heritageTheme.colors.textSecondary;

  return `
    <div id="timeline-mode-switcher" style="display: inline-flex; background: ${heritageTheme.colors.bgCard}; border: 1px solid ${heritageTheme.colors.borderGlass}; border-radius: 2rem; padding: 0.25rem; margin-bottom: 1.5rem;">
      <button id="btn-mode-free" type="button" style="padding: 0.5rem 1.25rem; border-radius: 1.5rem; background: ${freeBtnBg}; color: ${freeBtnColor}; border: none; font-weight: bold; cursor: pointer; transition: ${heritageTheme.animations.transitionFast};">
        🌐 Khám Phá Tự Do 2D (FREE_EXPLORE)
      </button>
      <button id="btn-mode-guided" type="button" style="padding: 0.5rem 1.25rem; border-radius: 1.5rem; background: ${guidedBtnBg}; color: ${guidedBtnColor}; border: none; font-weight: bold; cursor: pointer; transition: ${heritageTheme.animations.transitionFast};">
        🧭 Hành Trình Tường Thuật (GUIDED_JOURNEY)
      </button>
    </div>
  `.trim();
}

export function renderRelatedArtifactCard(related: RelatedArtifact): string {
  const badgeColors: Record<string, string> = {
    SAME_PERIOD: "#3B82F6",
    SAME_CULTURE: "#10B981",
    SAME_DYNASTY: "#8B5CF6",
    RELATED_THEME: heritageTheme.colors.accentGold,
  };

  const badgeColor = badgeColors[related.relationType] || heritageTheme.colors.accentGold;

  return `
    <div class="related-artifact-card" style="background: ${heritageTheme.colors.bgCard}; border: 1px solid ${heritageTheme.colors.borderGlass}; border-radius: 0.5rem; padding: 1rem; margin-top: 0.75rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <span style="font-size: 0.75rem; font-weight: bold; padding: 0.2rem 0.5rem; border-radius: 0.25rem; background: rgba(255,255,255,0.05); color: ${badgeColor}; border: 1px solid ${badgeColor};">
          🔗 ${related.relationType}
        </span>
        <span style="font-size: 0.75rem; color: ${heritageTheme.colors.textMuted};">${related.code}</span>
      </div>
      <h5 style="font-family: ${heritageTheme.typography.fontFamilyHeading}; color: ${heritageTheme.colors.textPrimary}; margin-bottom: 0.375rem;">${related.title}</h5>
      <p style="font-size: 0.8125rem; color: ${heritageTheme.colors.textSecondary}; line-height: 1.4; margin: 0;">
        <strong>Lý do kết nối:</strong> ${related.reason}
      </p>
    </div>
  `.trim();
}

export function renderLivingTimeline2D(
  journey: NarrativeJourney,
  mode: ExplorationMode = "FREE_EXPLORE",
  relatedArtifactsMap: Record<string, RelatedArtifact[]> = {},
): string {
  const modeSwitcherHtml = renderModeSwitcher(mode);

  const nodesHtml = journey.nodes
    .map((node: NarrativeNode, index: number) => {
      const relatedList = node.artifactCode ? relatedArtifactsMap[node.artifactCode] || [] : [];
      const relatedCardsHtml = relatedList.map(renderRelatedArtifactCard).join("\n");

      return `
        <div class="timeline-node" style="position: relative; padding-left: 2rem; padding-bottom: 2rem; border-left: 2px solid ${heritageTheme.colors.accentGold};">
          <div style="position: absolute; left: -9px; top: 0; width: 16px; height: 16px; border-radius: 50%; background: ${heritageTheme.colors.primaryRed}; border: 2px solid ${heritageTheme.colors.accentGold};"></div>
          <div style="background: ${heritageTheme.colors.bgCard}; border: 1px solid ${heritageTheme.colors.borderGlass}; border-radius: 0.5rem; padding: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="background: rgba(158, 27, 27, 0.3); color: ${heritageTheme.colors.accentGold}; padding: 0.2rem 0.6rem; border-radius: 1rem; font-size: 0.75rem; font-weight: bold; border: 1px solid ${heritageTheme.colors.accentGold};">
                Mốc #${index + 1} — ${node.period}
              </span>
              ${node.artifactCode ? `<span style="font-size:0.75rem; color:${heritageTheme.colors.textSecondary};">Artifact Code: ${node.artifactCode}</span>` : ""}
            </div>
            <h4 style="font-family: ${heritageTheme.typography.fontFamilyHeading}; color: ${heritageTheme.colors.textPrimary}; font-size: 1.125rem; margin-bottom: 0.5rem;">${node.title}</h4>
            <p style="color: ${heritageTheme.colors.textSecondary}; font-size: 0.9375rem; line-height: 1.5; margin-bottom: 0.75rem;">${node.description}</p>
            ${relatedCardsHtml}
          </div>
        </div>
      `.trim();
    })
    .join("\n");

  return `
    <section id="living-timeline-section" style="background: ${heritageTheme.colors.bgDark}; border: 1px solid ${heritageTheme.colors.borderGlass}; border-radius: 0.75rem; padding: 2rem; margin: 1.5rem 0;">
      <div style="margin-bottom: 1.5rem; border-bottom: 1px solid ${heritageTheme.colors.borderGlass}; padding-bottom: 1rem;">
        <span style="color: ${heritageTheme.colors.accentGold}; font-size: 0.875rem; font-weight: bold; letter-spacing: 0.05em;">LIVING TIMELINE — DÒNG THỜI GIAN SỐNG</span>
        <h2 style="font-family: ${heritageTheme.typography.fontFamilyHeading}; color: ${heritageTheme.colors.textPrimary}; font-size: 1.5rem; margin-top: 0.25rem;">${journey.title}</h2>
        <p style="color: ${heritageTheme.colors.textSecondary}; font-size: 0.9375rem; margin: 0.25rem 0 0 0;">Chủ đề: ${journey.theme}</p>
      </div>

      ${modeSwitcherHtml}

      <div id="timeline-nodes-container" style="margin-top: 1rem;">
        ${nodesHtml}
      </div>
    </section>
  `.trim();
}
