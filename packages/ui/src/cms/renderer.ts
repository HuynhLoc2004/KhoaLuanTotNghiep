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
    ? `background-image: linear-gradient(180deg, rgba(3, 7, 18, 0.7) 0%, rgba(3, 7, 18, 0.98) 100%), url('${block.backgroundImageUrl}');`
    : `background: linear-gradient(135deg, rgba(159, 18, 57, 0.35) 0%, rgba(3, 7, 18, 0.98) 100%);`;

  const ctaHtml = block.ctaText
    ? `<a id="hero-cta-btn" href="${block.ctaLink ?? "/3d-experience"}" class="btn-cyber-gold px-8 py-4 rounded-xl text-base inline-flex items-center gap-3 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/50">
        <span>${block.ctaText}</span>
        <svg class="w-5 h-5 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
      </a>`
    : "";

  const html = `
    <section id="hero-${block.id}" class="cms-hero-section cinematic-scene relative overflow-hidden min-h-[90vh] flex flex-col justify-center items-center py-24 px-6 text-center border-b border-amber-500/20" style="${bgStyle} background-size: cover; background-position: center;">
      <!-- Dong Son Bronze Drum Rotating Motif Backdrop -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[750px] sm:h-[750px] opacity-15 pointer-events-none animate-spin-slow" data-scroll-speed="0.1">
        <svg viewBox="0 0 200 200" class="w-full h-full text-amber-400 stroke-current fill-none stroke-[0.8]">
          <circle cx="100" cy="100" r="95" stroke-dasharray="4 2"/>
          <circle cx="100" cy="100" r="80"/>
          <circle cx="100" cy="100" r="65" stroke-dasharray="8 4"/>
          <circle cx="100" cy="100" r="45"/>
          <polygon points="100,10 115,85 190,100 115,115 100,190 85,115 10,100 85,85" fill="rgba(245,158,11,0.15)"/>
        </svg>
      </div>

      <!-- Glowing Orbs & Background Parallax Layer -->
      <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" data-scroll-speed="0.3"></div>
      <div class="absolute -bottom-24 left-1/4 w-80 h-80 bg-rose-600/25 rounded-full blur-3xl pointer-events-none" data-scroll-speed="0.15"></div>

      <div class="max-w-5xl mx-auto relative z-10 space-y-6">
        <!-- Floating Cyber Royal Badge -->
        <div class="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500/10 border border-amber-400/50 backdrop-blur-md animate-float-3d shadow-lg shadow-amber-500/10" data-scroll-stagger="1">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
          <span class="text-xs font-serif font-bold text-amber-300 tracking-widest uppercase">Bảo Tàng Lịch Sử TP. Hồ Chí Minh — 3D Cyber Heritage</span>
        </div>

        <!-- Animated Hero Title -->
        <h1 class="font-heading font-black text-4xl sm:text-6xl md:text-7xl leading-tight gradient-title-cyber tracking-tight drop-shadow-2xl" data-scroll-stagger="2">
          ${block.title}
        </h1>

        <!-- Subtitle -->
        <p class="font-sans text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed" data-scroll-stagger="3">
          ${block.subtitle}
        </p>

        <!-- CTA Buttons Row -->
        <div class="pt-4 flex flex-wrap justify-center items-center gap-4" data-scroll-stagger="4">
          ${ctaHtml}
          <a href="/3d-experience" class="px-6 py-4 rounded-xl text-base font-semibold text-slate-200 border border-slate-700 bg-slate-900/80 hover:bg-slate-800 hover:border-amber-400/60 transition-all flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Khám phá Digital Twin 3D</span>
          </a>
        </div>

        <!-- Heritage Metrics Badges Row -->
        <div class="pt-8 flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs font-mono" data-scroll-stagger="5">
          <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-amber-500/30 text-amber-300 shadow-md">
            <span>🏛️ 10,000+ Bảo Vật</span>
          </div>
          <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-cyan-300 shadow-md">
            <span>🌐 Digital Twin 3D</span>
          </div>
          <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-emerald-300 shadow-md">
            <span>🤖 AI Guide Multilingual</span>
          </div>
          <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-rose-500/30 text-rose-300 shadow-md">
            <span>⏳ 4000 Năm Di Sản</span>
          </div>
        </div>
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
    ? `<p class="text-slate-400 text-center max-w-2xl mx-auto mb-12 text-base" data-scroll-stagger="2">${block.subtitle}</p>`
    : "";

  const cardsHtml = block.artifacts
    .map((art, idx) => {
      const badge3d = art.is3dAvailable
        ? `<span class="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1.5 animate-pulse">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> 3D Ready
           </span>`
        : `<span class="px-3 py-1 rounded-full text-xs font-mono text-slate-400 bg-slate-800/60 border border-slate-700">2D Media</span>`;

      return `
        <article id="artifact-card-${art.id}" class="glass-futuristic rounded-2xl p-6 flex flex-col justify-between group" data-scroll-stagger="${String(idx + 1)}">
          <div>
            <div class="flex justify-between items-center mb-4">
              <span class="text-xs font-mono font-semibold tracking-wider text-amber-400 uppercase bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">${art.category}</span>
              ${badge3d}
            </div>
            
            <h3 class="font-heading font-bold text-2xl text-slate-100 group-hover:text-amber-300 transition-colors mb-2">${art.name}</h3>
            <p class="text-amber-400/90 text-sm font-medium mb-3">Niên đại: ${art.period}</p>
          </div>
          
          <div class="pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <a href="/3d-experience" class="inline-flex items-center gap-2 text-sm font-bold text-amber-400 group-hover:text-amber-300 group-hover:translate-x-1 transition-all">
              <span>Khám phá hiện vật</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </a>
            ${art.is3dAvailable ? `<a href="/3d-experience" class="p-2 rounded-lg bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 transition-colors" title="Xoay 3D 360°"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg></a>` : ""}
          </div>
        </article>
      `;
    })
    .join("\n");

  const html = `
    <section id="artifact-grid-${block.id}" class="cinematic-scene py-20 px-6 max-w-7xl mx-auto">
      <div class="text-center mb-10">
        <h2 class="font-heading font-black text-3xl sm:text-4xl text-slate-100 mb-3" data-scroll-stagger="1">${block.title}</h2>
        ${subtitleHtml}
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        ${cardsHtml}
      </div>
    </section>
  `.trim();

  return {
    blockId: block.id,
    type: "artifact_grid",
    html,
    metadata: {
      title: block.title,
      itemsCount: block.artifacts.length,
    },
  };
}

export function renderTimelinePreviewBlock(block: CmsTimelinePreviewBlock): CmsRenderedBlock {
  const eventsHtml = block.events
    .map(
      (ev, idx) => `
      <div class="glass-futuristic rounded-xl p-5 border-amber-500/20 flex flex-col justify-between" data-scroll-stagger="${String(idx + 1)}">
        <div>
          <span class="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">${ev.year}</span>
          <h4 class="font-heading font-bold text-lg text-slate-100 mt-3 mb-1">${ev.title}</h4>
          <p class="text-xs text-slate-300 leading-relaxed">${ev.description}</p>
        </div>
      </div>
    `,
    )
    .join("\n");

  const html = `
    <section id="timeline-preview-${block.id}" class="cinematic-scene py-20 px-6 max-w-7xl mx-auto space-y-8">
      <div class="text-center border-b border-amber-500/20 pb-6">
        <span class="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase" data-scroll-stagger="1">Dòng Thời Gian Tương Tác</span>
        <h2 class="font-heading font-black text-3xl sm:text-4xl text-slate-100 mt-2" data-scroll-stagger="2">${block.title}</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${eventsHtml}
      </div>
    </section>
  `.trim();

  return {
    blockId: block.id,
    type: "timeline_preview",
    html,
    metadata: {
      title: block.title,
      eventsCount: block.events.length,
    },
  };
}

export function renderBannerBlock(block: CmsBannerBlock): CmsRenderedBlock {
  const html = `
    <div id="banner-${block.id}" class="cinematic-scene py-5 px-6 bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-cyan-500/20 border-y border-amber-500/30 text-center font-sans backdrop-blur-md">
      <div class="max-w-5xl mx-auto flex items-center justify-center gap-3">
        <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
        <span class="font-heading font-bold text-amber-300 text-sm">${block.title}:</span>
        <span class="text-slate-200 text-sm">${block.message}</span>
      </div>
    </div>
  `.trim();

  return {
    blockId: block.id,
    type: "banner",
    html,
    metadata: {
      title: block.title,
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
  }
}
