import type { VoiceScript } from "@hcmc-museum/contracts";

export function renderVoiceScriptCard(script: VoiceScript): string {
  return `<button
    type="button"
    class="voice-script-card w-full text-left glass-futuristic rounded-2xl p-4 mb-3 border-amber-500/30 hover:border-amber-400/60 transition-all"
    data-script-id="${script.id}"
    data-locale="${script.locale}"
  >
    <div class="flex items-center justify-between gap-3">
      <h4 class="font-heading font-bold text-slate-100 text-sm">${script.title}</h4>
      <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">${script.locale.toUpperCase()}</span>
    </div>
    <p class="text-slate-400 text-xs mt-2 line-clamp-2">${script.text}</p>
  </button>`;
}

export interface VoicePlayerWidgetOptions {
  scripts: VoiceScript[];
}

// Player UI only prepares controls/transcript; the browser's Web Speech API does the actual
// TTS/STT work client-side (see the inline <script> wired up by the page that renders this).
export function renderVoicePlayerWidget(options: VoicePlayerWidgetOptions): string {
  const scriptsHtml = options.scripts.map((script) => renderVoiceScriptCard(script)).join("");

  return `<section id="voice-guide-widget" class="glass-futuristic rounded-3xl max-w-4xl mx-auto overflow-hidden border-2 border-amber-500/30 shadow-2xl">
    <header class="p-4 bg-slate-900/90 border-b border-amber-500/20 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-600 p-[1px] shadow-lg animate-float-3d">
          <div class="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-xl">🔊</div>
        </div>
        <div>
          <h3 class="font-heading font-bold text-slate-100 text-base">Thuyết Minh Đa Ngôn Ngữ</h3>
          <p class="text-xs text-cyan-400 font-mono">Web Speech API — phát trực tiếp trên trình duyệt</p>
        </div>
      </div>
      <button
        type="button"
        id="voice-mic-button"
        class="voice-mic-button w-11 h-11 rounded-full bg-slate-800/80 border border-slate-700 hover:border-amber-400/60 flex items-center justify-center text-lg transition-all"
        aria-label="Ra lệnh bằng giọng nói"
        title="Ra lệnh bằng giọng nói"
      >🎙️</button>
    </header>

    <div id="voice-script-list" class="p-4 max-h-64 overflow-y-auto">
      ${scriptsHtml}
    </div>

    <footer class="p-4 bg-slate-900/90 border-t border-amber-500/20 space-y-3">
      <div id="voice-transcript" class="text-slate-300 text-sm min-h-[3rem] leading-relaxed" aria-live="polite">
        Chọn một hiện vật ở trên để nghe thuyết minh. Toàn bộ nội dung luôn hiển thị dạng văn bản.
      </div>
      <div class="flex items-center gap-3">
        <button type="button" id="voice-play-button" class="btn-cyber-gold px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2" disabled>
          <span>▶️ Phát</span>
        </button>
        <button type="button" id="voice-pause-button" class="px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-800/80 border border-slate-700 text-slate-300 hover:border-amber-400/60 transition-all" disabled>⏸️ Tạm dừng</button>
        <button type="button" id="voice-repeat-button" class="px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-800/80 border border-slate-700 text-slate-300 hover:border-amber-400/60 transition-all" disabled>🔁 Nghe lại</button>
        <label class="ml-auto flex items-center gap-2 text-xs text-slate-400 font-mono">
          Tốc độ
          <select id="voice-speed-select" class="bg-slate-950 border border-amber-500/30 rounded-lg px-2 py-1 text-slate-100">
            <option value="0.75">0.75x</option>
            <option value="1" selected>1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
          </select>
        </label>
      </div>
      <p id="voice-unsupported-notice" class="hidden text-xs text-rose-400">Trình duyệt của quý khách không hỗ trợ Web Speech API; vui lòng đọc nội dung văn bản ở trên.</p>
    </footer>
  </section>`;
}
