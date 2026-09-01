import type { VoiceGlossaryTerm, VoiceLocale } from "@hcmc-museum/contracts";

// Admin-curated pronunciation overrides for proper nouns/terms (spec: "kiểm duyệt thuật ngữ,
// tên riêng, niên đại và cách đọc"). Applied before text reaches any TTS engine.
export class VoiceGlossaryStore {
  private terms: VoiceGlossaryTerm[];

  constructor(initial: VoiceGlossaryTerm[] = []) {
    this.terms = [...initial];
  }

  public getAll(): VoiceGlossaryTerm[] {
    return [...this.terms];
  }

  public replaceAll(terms: VoiceGlossaryTerm[]): void {
    this.terms = [...terms];
  }

  public getForLocale(locale: VoiceLocale): VoiceGlossaryTerm[] {
    return this.terms.filter((entry) => entry.locale === locale);
  }

  // Substitutes each glossary term with its curated pronunciation, longest term first so a
  // shorter term is never matched inside a longer one it is a substring of.
  public applyPronunciation(text: string, locale: VoiceLocale): string {
    const applicable = this.getForLocale(locale).sort((a, b) => b.term.length - a.term.length);
    let result = text;
    for (const entry of applicable) {
      if (entry.term === entry.pronunciation) {
        continue;
      }
      result = result.split(entry.term).join(entry.pronunciation);
    }
    return result;
  }

  // Well-formed SSML wrapping the same substitutions, kept for a future engine that consumes
  // SSML directly; the default browser engine only speaks applyPronunciation's plain text.
  public buildSsml(text: string, locale: VoiceLocale): string {
    const applicable = this.getForLocale(locale).sort((a, b) => b.term.length - a.term.length);
    let result = escapeSsmlText(text);
    for (const entry of applicable) {
      const escapedTerm = escapeSsmlText(entry.term);
      const escapedPronunciation = escapeSsmlText(entry.pronunciation);
      result = result
        .split(escapedTerm)
        .join(`<sub alias="${escapedPronunciation}">${escapedTerm}</sub>`);
    }
    return `<speak>${result}</speak>`;
  }
}

function escapeSsmlText(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
