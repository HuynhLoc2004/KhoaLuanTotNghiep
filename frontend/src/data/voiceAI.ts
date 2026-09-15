/**
 * Smart Multilingual Voice AI Engine
 * Integrates with Web Speech API SpeechSynthesis.
 * Automatically synchronizes with system language and resolves appropriate BCP 47 codes and voices.
 */

import { i18n } from "./i18n";

export interface VoiceOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

// BCP 47 SpeechSynthesis Language Mapping
export const SPEECH_LANG_MAP: Record<string, string> = {
  vi: "vi-VN",
  en: "en-US",
  fr: "fr-FR",
  ja: "ja-JP",
  ko: "ko-KR",
  zh: "zh-CN",
  "zh-TW": "zh-TW",
  es: "es-ES",
  de: "de-DE",
  ru: "ru-RU",
  th: "th-TH",
  it: "it-IT",
  pt: "pt-PT",
  id: "id-ID",
  ms: "ms-MY",
  hi: "hi-IN",
  ar: "ar-SA",
  tr: "tr-TR",
  nl: "nl-NL",
  pl: "pl-PL",
  sv: "sv-SE",
  da: "da-DK",
  fi: "fi-FI",
  no: "no-NO",
  cs: "cs-CZ",
  el: "el-GR",
  hu: "hu-HU",
  ro: "ro-RO",
  uk: "uk-UA",
  he: "he-IL"
};

class VoiceAIEngine {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private speaking: boolean = false;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
  }

  public getSpeechCode(langCode?: string): string {
    const code = (langCode || i18n.getLanguage()).toLowerCase();
    return SPEECH_LANG_MAP[code] || `${code}-${code.toUpperCase()}`;
  }

  public isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  public isSpeaking(): boolean {
    return this.speaking && (typeof window !== "undefined" && window.speechSynthesis.speaking);
  }

  public stop() {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
      this.speaking = false;
      this.currentUtterance = null;
    }
  }

  public pause() {
    if (this.isSupported() && this.speaking) {
      window.speechSynthesis.pause();
    }
  }

  public resume() {
    if (this.isSupported()) {
      window.speechSynthesis.resume();
    }
  }

  public speak(text: string, langCode?: string, options: VoiceOptions = {}) {
    if (!this.isSupported()) {
      console.warn("[VoiceAI] Web Speech API is not supported in this browser environment.");
      options.onError?.(new Error("Web Speech API not supported"));
      return;
    }

    // Stop any ongoing speech
    this.stop();

    const targetLang = (langCode || i18n.getLanguage()).toLowerCase();
    const speechCode = this.getSpeechCode(targetLang);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechCode;
    utterance.rate = options.rate ?? 0.95;
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 1.0;

    // Pick best matching voice
    if (this.voices.length === 0) {
      this.loadVoices();
    }
    const matchingVoice = this.voices.find(v => v.lang.toLowerCase() === speechCode.toLowerCase()) 
      || this.voices.find(v => v.lang.toLowerCase().startsWith(targetLang));

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      this.speaking = true;
      options.onStart?.();
    };

    utterance.onend = () => {
      this.speaking = false;
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.speaking = false;
      this.currentUtterance = null;
      options.onError?.(e);
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }
}

export const VoiceAI = new VoiceAIEngine();
