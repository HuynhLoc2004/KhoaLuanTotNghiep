import type { VoiceSynthesizeResponse } from "@hcmc-museum/contracts";

// Keyed strictly by the hash built from validated/typed fields in service.ts — never from a
// raw request object — so entries never leak across scripts/voices/speeds/locales.
export class VoiceTtsCache {
  private readonly store = new Map<string, VoiceSynthesizeResponse>();

  public has(cacheKey: string): boolean {
    return this.store.has(cacheKey);
  }

  public get(cacheKey: string): VoiceSynthesizeResponse | undefined {
    return this.store.get(cacheKey);
  }

  public set(cacheKey: string, value: VoiceSynthesizeResponse): void {
    this.store.set(cacheKey, value);
  }

  public size(): number {
    return this.store.size;
  }
}
