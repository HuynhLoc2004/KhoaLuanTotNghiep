import type {
  ExplorationMode,
  NarrativeJourney,
  NarrativeNode,
  RelatedArtifact,
} from "@hcmc-museum/contracts";

export function renderModeSwitcher(
  currentMode: ExplorationMode = "FREE_EXPLORE",
): string {
  const isFree = currentMode === "FREE_EXPLORE";
  const isGuided = currentMode === "GUIDED_JOURNEY";

  const freeBtnBg = isFree
    ? "bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
    : "bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-amber-500/40";

  const guidedBtnBg = isGuided
    ? "bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
    : "bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-amber-500/40";

  return `
    <div id="timeline-mode-switcher" class="inline-flex bg-slate-900/80 p-1.5 rounded-2xl border border-amber-500/30 shadow-xl mb-8">
      <button id="btn-mode-free" type="button" class="px-6 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all ${freeBtnBg}">
        🌐 Khám Phá Tự Do 2D
      </button>
      <button id="btn-mode-guided" type="button" class="px-6 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all ${guidedBtnBg}">
        🧭 Hành Trình Tường Thuật
      </button>
    </div>
  `.trim();
}

export function renderRelatedArtifactCard(related: RelatedArtifact): string {
  return `
    <div class="related-artifact-card mt-4 p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
          🔗 ${related.relationType}
        </span>
        <span class="text-xs font-mono text-slate-500">${related.code}</span>
      </div>
      <h5 class="font-heading font-bold text-slate-100 text-base">${related.title}</h5>
      <p class="text-xs text-slate-300 leading-relaxed">
        <strong class="text-amber-400 font-medium">Kết nối di sản:</strong> ${related.reason}
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
      const relatedList = node.artifactCode
        ? relatedArtifactsMap[node.artifactCode] ?? []
        : [];
      const relatedCardsHtml = relatedList
        .map(renderRelatedArtifactCard)
        .join("\n");

      return `
        <div class="relative pl-8 pb-12 border-l-2 border-amber-500/40 last:border-l-0 group">
          <!-- Animated Pulsing Spine Node Dot -->
          <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-amber-400 border-2 border-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.8)] animate-pulse"></div>

          <div class="glass-futuristic rounded-2xl p-6 transition-all duration-300">
            <div class="flex flex-wrap justify-between items-center mb-3 gap-2">
              <span class="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Mốc #${String(index + 1)} — ${node.period}
              </span>
              ${node.artifactCode ? `<span class="text-xs font-mono text-slate-500">Mã di sản: ${node.artifactCode}</span>` : ""}
            </div>

            <h4 class="font-heading font-bold text-2xl text-slate-100 group-hover:text-amber-300 transition-colors mb-2">${node.title}</h4>
            <p class="text-slate-300 text-sm leading-relaxed mb-4">${node.description}</p>
            ${relatedCardsHtml}
          </div>
        </div>
      `.trim();
    })
    .join("\n");

  return `
    <section id="living-timeline-section" class="max-w-5xl mx-auto space-y-8">
      <div class="border-b border-amber-500/20 pb-6 text-center">
        <span class="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">LIVING TIMELINE — DÒNG THỜI GIAN SỐNG</span>
        <h2 class="font-heading font-black text-3xl sm:text-5xl gradient-title-cyber mt-2">${journey.title}</h2>
        <p class="text-slate-400 text-base mt-2">Chủ đề tham quan: <span class="text-amber-300 font-medium">${journey.theme}</span></p>
      </div>

      <div class="text-center">
        ${modeSwitcherHtml}
      </div>

      <div id="timeline-nodes-container" class="pt-4">
        ${nodesHtml}
      </div>
    </section>
  `.trim();
}
