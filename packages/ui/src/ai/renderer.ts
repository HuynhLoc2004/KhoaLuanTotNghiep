import type { AiGuideQueryResponse } from "@hcmc-museum/contracts";

export interface AiChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  sources?: AiGuideQueryResponse["sources"];
  suggestedQuestions?: string[];
  isGated?: boolean;
  audioUrl?: string;
}

export function renderAiSourceBadge(source: {
  title: string;
  author: string;
  sourceUrl: string;
}): string {
  return `<a href="${source.sourceUrl}" target="_blank" rel="noopener noreferrer" class="ai-source-badge inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs font-mono hover:bg-amber-500/20 hover:border-amber-400 transition-all">
    <span>📜 ${source.title} (${source.author})</span>
  </a>`;
}

export function renderAiMessageBubble(message: AiChatMessage): string {
  const isUser = message.sender === "user";
  const bubbleStyle = isUser
    ? "ml-auto bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-medium rounded-2xl rounded-br-none shadow-lg shadow-amber-500/20"
    : "mr-auto glass-futuristic border-amber-500/30 text-slate-100 rounded-2xl rounded-bl-none shadow-xl";

  const sourcesHtml =
    message.sources && message.sources.length > 0
      ? `<div class="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
          ${message.sources.map((src) => renderAiSourceBadge(src)).join("")}
        </div>`
      : "";

  const audioHtml = message.audioUrl
    ? `<div class="mt-3">
        <button type="button" class="btn-play-audio px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/40 rounded-lg text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-500/30 transition-all flex items-center gap-2" data-audio-url="${message.audioUrl}">
          <span>🔊 Nghe Thuyết Minh AI</span>
        </button>
      </div>`
    : "";

  return `<div class="ai-message-bubble max-w-[85%] p-4 rounded-2xl mb-4 text-sm leading-relaxed ${bubbleStyle}">
    <div>${message.text}</div>
    ${sourcesHtml}
    ${audioHtml}
    <div class="text-[10px] opacity-60 mt-2 text-right font-mono">${message.timestamp}</div>
  </div>`;
}

export function renderAiGuideChatWidget(messages: AiChatMessage[]): string {
  const messagesListHtml = messages.map((msg) => renderAiMessageBubble(msg)).join("");

  return `<section class="ai-chat-widget glass-futuristic rounded-3xl max-w-4xl mx-auto overflow-hidden border-2 border-amber-500/30 shadow-2xl flex flex-col h-[650px]">
    <header class="p-4 bg-slate-900/90 border-b border-amber-500/20 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-rose-600 p-[1px] shadow-lg shadow-amber-500/30 animate-float-3d">
          <div class="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-xl">🤖</div>
        </div>
        <div>
          <h3 class="font-heading font-bold text-slate-100 text-base">Trợ Lý AI Thuyết Minh Bảo Tàng</h3>
          <p class="text-xs text-amber-400 font-mono flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>RAG Heritage Intelligence System</span>
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">Cấp Độ Kiểm Định 100%</span>
      </div>
    </header>

    <div id="ai-chat-messages-scroll" class="flex-1 p-6 overflow-y-auto space-y-4">
      ${messagesListHtml}
    </div>

    <footer class="p-4 bg-slate-900/90 border-t border-amber-500/20 space-y-3">
      <div id="ai-suggested-questions" class="flex flex-wrap gap-2">
        <button class="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 hover:border-amber-400/60 hover:text-amber-300 text-xs transition-all">✨ Trống Đồng Đông Sơn được đúc khi nào?</button>
        <button class="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 hover:border-amber-400/60 hover:text-amber-300 text-xs transition-all">✨ Ý nghĩa Ấn Vàng Sắc Mệnh Chi Bảo?</button>
      </div>
      <form id="ai-chat-form" class="flex gap-3">
        <input type="text" id="ai-chat-input" class="ai-input-text flex-1 bg-slate-950 border border-amber-500/30 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-amber-400" placeholder="Hỏi AI về bất kỳ di sản hoặc triều đại lịch sử..." />
        <button type="submit" class="btn-cyber-gold px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
          <span>Gửi</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </button>
      </form>
    </footer>
  </section>`;
}
