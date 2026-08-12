import { heritageTheme } from "../tokens/theme.js";
import type { SearchContentType, SearchFacetCount, SearchResultItem } from "@hcmc-museum/contracts";

export function renderSearchBar(query = ""): string {
  return `
    <div id="search-bar-container" style="display: flex; gap: 0.75rem; margin-bottom: 1.5rem; width: 100%;">
      <input
        id="search-input"
        type="text"
        value="${query}"
        placeholder="Nhập từ khóa tìm kiếm (ví dụ: Đông Sơn, Óc Eo, Áo dài...)"
        style="flex: 1; padding: 0.875rem 1.25rem; border-radius: 0.5rem; background: ${heritageTheme.colors.bgCard}; color: ${heritageTheme.colors.textPrimary}; border: 1px solid ${heritageTheme.colors.borderGlass}; font-size: 1rem; outline: none; transition: ${heritageTheme.animations.transitionFast};"
      />
      <button
        id="search-btn"
        type="button"
        style="padding: 0.875rem 1.75rem; border-radius: 0.5rem; background: ${heritageTheme.colors.primaryRed}; color: ${heritageTheme.colors.accentGold}; border: 1px solid ${heritageTheme.colors.accentGold}; font-weight: bold; font-size: 1rem; cursor: pointer;"
      >
        🔍 Tìm kiếm
      </button>
    </div>
  `.trim();
}

export function renderFacetFilters(
  facets: SearchFacetCount[] = [],
  activeType?: SearchContentType,
): string {
  const typeLabels: Record<SearchContentType, string> = {
    artifact: "🏛️ Hiện vật",
    exhibition: "🖼️ Triển lãm",
    news: "📰 Tin tức",
    tour: "🧭 Tour",
  };

  const isAll = !activeType;
  const allBg = isAll ? heritageTheme.colors.primaryRed : "transparent";
  const allColor = isAll ? heritageTheme.colors.accentGold : heritageTheme.colors.textSecondary;

  const buttonsHtml = facets
    .map((f) => {
      const isActive = activeType === f.type;
      const bg = isActive ? heritageTheme.colors.primaryRed : "transparent";
      const color = isActive ? heritageTheme.colors.accentGold : heritageTheme.colors.textSecondary;
      const label = typeLabels[f.type] || f.type;

      return `
        <button
          class="btn-facet-filter"
          data-type="${f.type}"
          type="button"
          style="padding: 0.5rem 1rem; border-radius: 1.5rem; background: ${bg}; color: ${color}; border: 1px solid ${heritageTheme.colors.borderGlass}; font-size: 0.875rem; font-weight: bold; cursor: pointer; transition: ${heritageTheme.animations.transitionFast};"
        >
          ${label} (${String(f.count)})
        </button>
      `.trim();
    })
    .join("\n");

  return `
    <div id="search-facets-bar" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem;">
      <button
        class="btn-facet-filter"
        data-type="all"
        type="button"
        style="padding: 0.5rem 1rem; border-radius: 1.5rem; background: ${allBg}; color: ${allColor}; border: 1px solid ${heritageTheme.colors.borderGlass}; font-size: 0.875rem; font-weight: bold; cursor: pointer; transition: ${heritageTheme.animations.transitionFast};"
      >
        Tất cả
      </button>
      ${buttonsHtml}
    </div>
  `.trim();
}

export function renderSearchResultCard(item: SearchResultItem): string {
  const badgeColors: Record<SearchContentType, string> = {
    artifact: "#D97706",
    exhibition: "#3B82F6",
    news: "#10B981",
    tour: "#8B5CF6",
  };

  const badgeColor = badgeColors[item.type] || heritageTheme.colors.accentGold;
  const highlightsHtml = item.highlights
    .map(
      (h) =>
        `<span style="display: inline-block; font-size: 0.75rem; background: rgba(217, 119, 6, 0.15); color: ${heritageTheme.colors.accentGold}; border: 1px solid ${heritageTheme.colors.accentGold}; padding: 0.15rem 0.5rem; border-radius: 0.25rem; margin-right: 0.375rem; margin-top: 0.375rem;">${h}</span>`,
    )
    .join("");

  return `
    <div class="search-result-card" style="background: ${heritageTheme.colors.bgCard}; border: 1px solid ${heritageTheme.colors.borderGlass}; border-radius: 0.5rem; padding: 1.25rem; margin-bottom: 1rem; transition: ${heritageTheme.animations.transitionFast};">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <span style="font-size: 0.75rem; font-weight: bold; padding: 0.2rem 0.6rem; border-radius: 0.25rem; background: rgba(255,255,255,0.05); color: ${badgeColor}; border: 1px solid ${badgeColor}; text-transform: uppercase;">
          ${item.type}
        </span>
        ${item.code ? `<span style="font-size: 0.75rem; color: ${heritageTheme.colors.textMuted};">${item.code}</span>` : ""}
      </div>
      <h4 style="font-family: ${heritageTheme.typography.fontFamilyHeading}; color: ${heritageTheme.colors.textPrimary}; font-size: 1.125rem; margin-bottom: 0.25rem;">${item.title}</h4>
      ${item.subtitle ? `<p style="font-size: 0.8125rem; color: ${heritageTheme.colors.accentGold}; margin-bottom: 0.5rem;">${item.subtitle}</p>` : ""}
      <p style="color: ${heritageTheme.colors.textSecondary}; font-size: 0.9375rem; line-height: 1.5; margin-bottom: 0.5rem;">${item.summary}</p>
      ${highlightsHtml !== "" ? `<div style="margin-top: 0.5rem;">${highlightsHtml}</div>` : ""}
    </div>
  `.trim();
}

export function renderSearchPage(
  query = "",
  items: SearchResultItem[] = [],
  facets: SearchFacetCount[] = [],
  activeType?: SearchContentType,
): string {
  const searchBarHtml = renderSearchBar(query);
  const facetsHtml = renderFacetFilters(facets, activeType);
  const resultsHtml =
    items.length > 0
      ? items.map(renderSearchResultCard).join("\n")
      : `
        <div style="background: ${heritageTheme.colors.bgCard}; border: 1px solid ${heritageTheme.colors.borderGlass}; border-radius: 0.5rem; padding: 2rem; text-align: center; color: ${heritageTheme.colors.textSecondary};">
          <p style="font-size: 1.125rem; margin-bottom: 0.5rem;">Không tìm thấy kết quả phù hợp cho từ khóa "<strong>${query}</strong>"</p>
          <p style="font-size: 0.875rem; color: ${heritageTheme.colors.textMuted};">Gợi ý: Thử tìm từ khóa khác như "Đông Sơn", "Óc Eo", "Triển lãm"...</p>
        </div>
      `.trim();

  return `
    <section id="search-discovery-section" style="background: ${heritageTheme.colors.bgDark}; border: 1px solid ${heritageTheme.colors.borderGlass}; border-radius: 0.75rem; padding: 2rem; margin: 1.5rem 0;">
      <div style="margin-bottom: 1.5rem; border-bottom: 1px solid ${heritageTheme.colors.borderGlass}; padding-bottom: 1rem;">
        <span style="color: ${heritageTheme.colors.accentGold}; font-size: 0.875rem; font-weight: bold; letter-spacing: 0.05em;">SEARCH & DISCOVERY — TÌM KIẾM VÀ KHÁM PHÁ DI SẢN</span>
        <h2 style="font-family: ${heritageTheme.typography.fontFamilyHeading}; color: ${heritageTheme.colors.textPrimary}; font-size: 1.5rem; margin-top: 0.25rem;">Khám Phá Hiện Vật & Triển Lãm</h2>
      </div>

      ${searchBarHtml}
      ${facetsHtml}

      <div id="search-results-container" style="margin-top: 1rem;">
        ${resultsHtml}
      </div>
    </section>
  `.trim();
}
