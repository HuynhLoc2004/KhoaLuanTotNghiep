import type { VoiceCommandIntent, VoiceLocale } from "@hcmc-museum/contracts";

export interface InterpretedCommand {
  intent: VoiceCommandIntent;
  targetSlug?: string;
  confidence: number;
  message: string;
}

interface NavigationTarget {
  slug: string;
  keywords: string[];
}

const NAVIGATION_TARGETS: NavigationTarget[] = [
  { slug: "/", keywords: ["trang chủ", "home", "trang chu"] },
  { slug: "/search", keywords: ["tìm kiếm", "search", "tim kiem"] },
  { slug: "/timeline", keywords: ["dòng thời gian", "timeline", "dong thoi gian"] },
  { slug: "/ai-guide", keywords: ["trợ lý", "ai guide", "tro ly", "hỏi đáp"] },
  { slug: "/3d-experience", keywords: ["3d", "digital twin", "mô phỏng"] },
  { slug: "/voice", keywords: ["thuyết minh", "audio guide", "thuyet minh"] },
];

const PLAY_KEYWORDS = ["phát", "play", "nghe", "bắt đầu"];
const PAUSE_KEYWORDS = ["dừng", "tạm dừng", "pause"];
const STOP_KEYWORDS = ["dừng hẳn", "tắt", "stop", "thoát"];
const REPEAT_KEYWORDS = ["lặp lại", "nghe lại", "repeat", "nhắc lại"];
const NAVIGATE_TRIGGERS = ["đi đến", "mở", "go to", "navigate to", "chuyển đến"];

function normalize(text: string): string {
  return text.normalize("NFC").trim().toLowerCase();
}

function matchesAny(haystack: string, keywords: string[]): boolean {
  return keywords.some((keyword) => haystack.includes(keyword));
}

// Small deterministic keyword classifier for VN/EN voice commands captured client-side via
// the browser's SpeechRecognition API. Intentionally simple/explainable for an MVP; a real
// NLU model can replace this behind the same interpretCommand() call.
export function interpretCommand(rawTranscript: string, locale: VoiceLocale): InterpretedCommand {
  const transcript = normalize(rawTranscript);

  if (matchesAny(transcript, STOP_KEYWORDS)) {
    return { intent: "STOP", confidence: 0.9, message: buildMessage("STOP", locale) };
  }
  if (matchesAny(transcript, PAUSE_KEYWORDS)) {
    return { intent: "PAUSE", confidence: 0.9, message: buildMessage("PAUSE", locale) };
  }
  if (matchesAny(transcript, REPEAT_KEYWORDS)) {
    return { intent: "REPEAT", confidence: 0.85, message: buildMessage("REPEAT", locale) };
  }
  if (matchesAny(transcript, PLAY_KEYWORDS)) {
    return { intent: "PLAY", confidence: 0.85, message: buildMessage("PLAY", locale) };
  }

  const isNavigateTrigger = matchesAny(transcript, NAVIGATE_TRIGGERS);
  const target = NAVIGATION_TARGETS.find((entry) => matchesAny(transcript, entry.keywords));
  if (target) {
    return {
      intent: "NAVIGATE",
      targetSlug: target.slug,
      confidence: isNavigateTrigger ? 0.9 : 0.6,
      message: buildMessage("NAVIGATE", locale),
    };
  }

  return { intent: "UNKNOWN", confidence: 0.2, message: buildMessage("UNKNOWN", locale) };
}

function buildMessage(intent: VoiceCommandIntent, locale: VoiceLocale): string {
  const messages: Record<VoiceCommandIntent, Record<VoiceLocale, string>> = {
    PLAY: { vi: "Đang phát thuyết minh.", en: "Playing the audio guide." },
    PAUSE: { vi: "Đã tạm dừng.", en: "Paused." },
    STOP: { vi: "Đã dừng phát.", en: "Playback stopped." },
    REPEAT: { vi: "Đang phát lại từ đầu.", en: "Repeating from the start." },
    NAVIGATE: { vi: "Đang chuyển trang.", en: "Navigating." },
    UNKNOWN: {
      vi: "Xin lỗi, tôi chưa hiểu lệnh này.",
      en: "Sorry, I did not understand that command.",
    },
  };
  return messages[intent][locale];
}
