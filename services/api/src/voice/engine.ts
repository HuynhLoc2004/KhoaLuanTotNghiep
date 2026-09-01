import type { VoiceCostEstimate, VoiceEngine, VoiceLocale } from "@hcmc-museum/contracts";

export interface TtsSynthesisResult {
  estimatedDurationSeconds: number;
  costEstimate: VoiceCostEstimate;
}

// Pluggable so a real cloud TTS provider can be added later behind the same interface
// without changing the route/service layer — mirrors the spec's engine-swap requirement.
export interface TtsEngine {
  readonly id: VoiceEngine;
  estimate(plainText: string, locale: VoiceLocale, speed: number): TtsSynthesisResult;
}

const AVERAGE_CHARACTERS_PER_SECOND = 15;

// Default engine: synthesis happens client-side via the browser's Web Speech API
// (SpeechSynthesis), so there is no backend audio file, no API key and no per-character
// cost. The backend only prepares the pronunciation-corrected text/SSML and cache metadata.
export class WebSpeechClientEngine implements TtsEngine {
  public readonly id: VoiceEngine = "web-speech-client";

  public estimate(plainText: string, _locale: VoiceLocale, speed: number): TtsSynthesisResult {
    const baseSeconds = Math.max(2, Math.round(plainText.length / AVERAGE_CHARACTERS_PER_SECOND));
    const estimatedDurationSeconds = Math.max(1, Math.round(baseSeconds / speed));
    return {
      estimatedDurationSeconds,
      costEstimate: { engine: this.id, amount: 0, currency: "VND" },
    };
  }
}
