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
  return `<a href="${source.sourceUrl}" target="_blank" rel="noopener noreferrer" class="ai-source-badge" style="display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.25rem 0.6rem; background: rgba(212, 175, 55, 0.15); border: 1px solid rgba(212, 175, 55, 0.35); border-radius: 6px; color: #d4af37; font-size: 0.75rem; text-decoration: none; transition: all 0.2s ease;">
    <span>📜 ${source.title} (${source.author})</span>
  </a>`;
}

export function renderAiMessageBubble(message: AiChatMessage): string {
  const isUser = message.sender === "user";
  const bubbleStyle = isUser
    ? "align-self: flex-end; background: linear-gradient(135deg, #d4af37, #aa7c11); color: #0d0d0d; border-bottom-right-radius: 4px;"
    : "align-self: flex-start; background: rgba(255, 255, 255, 0.07); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.12); color: #f5f5f7; border-bottom-left-radius: 4px;";

  const sourcesHtml =
    message.sources && message.sources.length > 0
      ? `<div class="ai-sources-list" style="margin-top: 0.6rem; display: flex; flex-wrap: wrap; gap: 0.4rem;">
          ${message.sources.map((src) => renderAiSourceBadge(src)).join("")}
        </div>`
      : "";

  const audioHtml = message.audioUrl
    ? `<div class="ai-audio-player" style="margin-top: 0.5rem;">
        <button type="button" class="btn-play-audio" data-audio-url="${message.audioUrl}" style="padding: 0.25rem 0.6rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; color: #fff; font-size: 0.75rem; cursor: pointer; display: inline-flex; align-items: center; gap: 0.3rem;">
          🔊 Nghe thuyết minh
        </button>
      </div>`
    : "";

  return `<div class="ai-message-bubble" style="max-width: 85%; padding: 0.85rem 1.1rem; border-radius: 16px; margin-bottom: 0.8rem; font-size: 0.95rem; line-height: 1.5; ${bubbleStyle}">
    <div>${message.text}</div>
    ${sourcesHtml}
    ${audioHtml}
    <div style="font-size: 0.7rem; opacity: 0.6; margin-top: 0.4rem; text-align: right;">${message.timestamp}</div>
  </div>`;
}

export function renderAiGuideChatWidget(messages: AiChatMessage[]): string {
  const messagesListHtml = messages.map((msg) => renderAiMessageBubble(msg)).join("");

  return `<section class="ai-chat-widget" style="display: flex; flex-direction: column; height: 580px; max-width: 800px; margin: 0 auto; background: rgba(20, 20, 25, 0.85); backdrop-filter: blur(20px); border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
    <header style="padding: 1rem 1.25rem; background: rgba(255, 255, 255, 0.03); border-bottom: 1px solid rgba(255, 255, 255, 0.08); display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #d4af37, #8a640f); display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">🤖</div>
        <div>
          <h3 style="margin: 0; color: #fff; font-size: 1.05rem; font-weight: 600;">Trợ Lý AI Thuyết Minh Bảo Tàng</h3>
          <span style="font-size: 0.75rem; color: #d4af37; display: flex; align-items: center; gap: 0.3rem;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: #22c55e;"></span> Sẵn sàng giải đáp
          </span>
        </div>
      </div>
      <span style="font-size: 0.75rem; color: #888; background: rgba(255,255,255,0.05); padding: 0.2rem 0.5rem; border-radius: 4px;">RAG Heritage AI</span>
    </header>

    <div class="ai-messages-container" style="flex: 1; padding: 1.25rem; overflow-y: auto; display: flex; flex-direction: column;">
      ${messagesListHtml}
    </div>

    <footer style="padding: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.08); background: rgba(0,0,0,0.2);">
      <form id="ai-chat-form" style="display: flex; gap: 0.6rem;">
        <input type="text" id="ai-input-text" placeholder="Đặt câu hỏi về di sản, hiện vật hoặc lịch sử bảo tàng..." style="flex: 1; padding: 0.75rem 1rem; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 12px; color: #fff; font-size: 0.9rem; outline: none; transition: border-color 0.2s ease;" required />
        <button type="submit" style="padding: 0.75rem 1.4rem; background: linear-gradient(135deg, #d4af37, #aa7c11); border: none; border-radius: 12px; color: #0d0d0d; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: transform 0.15s ease;">Gửi 🚀</button>
      </form>
    </footer>
  </section>`;
}
