import type { SearchContentType, SearchFacetCount, SearchResultItem } from "@hcmc-museum/contracts";

export function renderSearchBar(query = ""): string {
  return `
    <div id="search-bar-container" class="flex gap-3 mb-6 w-full">
      <div class="relative flex-1">
        <input
          id="search-input"
          type="text"
          value="${query}"
          placeholder="Nhập từ khóa di sản (ví dụ: Đông Sơn, Óc Eo, Trống Đồng, Vàng ròng...)"
          class="w-full bg-slate-900/90 border border-amber-500/30 rounded-2xl px-6 py-4 text-slate-100 text-base placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner"
        />
        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">Press Enter ↵</span>
      </div>
      <button
        id="search-btn"
        type="button"
        class="btn-cyber-gold px-8 py-4 rounded-2xl text-base font-bold flex items-center gap-2"
      >
        <span>🔍 Tìm kiếm</span>
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
  const allBg = isAll
    ? "bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
    : "bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-amber-500/40";

  const buttonsHtml = facets
    .map((f) => {
      const isActive = activeType === f.type;
      const bg = isActive
        ? "bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
        : "bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-amber-500/40";
      const label = typeLabels[f.type] || f.type;

      return `
        <button
          class="btn-facet-filter px-5 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all ${bg}"
          data-type="${f.type}"
          type="button"
        >
          ${label} (${String(f.count)})
        </button>
      `.trim();
    })
    .join("\n");

  return `
    <div id="search-facets-bar" class="flex flex-wrap items-center gap-3 mb-8">
      <button
        class="btn-facet-filter px-5 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all ${allBg}"
        data-type="all"
        type="button"
      >
        Tất cả
      </button>
      ${buttonsHtml}
    </div>
  `.trim();
}

export function renderSearchResultCard(item: SearchResultItem): string {
  const highlightsHtml = item.highlights
    .map(
      (h) =>
        `<span class="inline-block text-xs font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-md mr-2 mt-2">${h}</span>`,
    )
    .join("");

  return `
    <article class="glass-futuristic rounded-2xl p-6 group">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
          ${item.type}
        </span>
        ${item.code ? `<span class="text-xs font-mono text-slate-500">${item.code}</span>` : ""}
      </div>
      
      <h4 class="font-heading font-bold text-2xl text-slate-100 group-hover:text-amber-300 transition-colors mb-1">${item.title}</h4>
      ${item.subtitle ? `<p class="text-sm font-medium text-amber-400/90 mb-3">${item.subtitle}</p>` : ""}
      <p class="text-slate-300 text-sm leading-relaxed mb-4">${item.summary}</p>
      ${highlightsHtml !== "" ? `<div class="pt-3 border-t border-slate-800/80">${highlightsHtml}</div>` : ""}
    </article>
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
        <div class="glass-futuristic rounded-2xl p-12 text-center text-slate-400">
          <p class="text-xl font-heading text-slate-200 mb-2">Không tìm thấy kết quả phù hợp cho từ khóa "<span class="text-amber-400">${query}</span>"</p>
          <p class="text-sm text-slate-500">Gợi ý: Thử tìm từ khóa khác như "Đông Sơn", "Óc Eo", "Trống Đồng"...</p>
        </div>
      `.trim();

  return `
    <section id="search-discovery-section" class="max-w-5xl mx-auto space-y-8">
      <div class="border-b border-amber-500/20 pb-6 text-center">
        <span class="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">SEARCH & DISCOVERY — TÌM KIẾM VÀ KHÁM PHÁ DI SẢN</span>
        <h2 class="font-heading font-black text-3xl sm:text-5xl gradient-title-cyber mt-2">Tra Cứu Di Sản & Báu Vật</h2>
      </div>

      ${searchBarHtml}
      ${facetsHtml}

      <div id="search-results-container" class="space-y-6">
        ${resultsHtml}
      </div>
    </section>
  `.trim();
}
