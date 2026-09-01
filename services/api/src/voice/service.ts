import type {
  VoiceAdminConfig,
  VoiceCommandResponse,
  VoiceCostEstimateResponse,
  VoiceLocale,
  VoiceScript,
  VoiceScriptListResponse,
  VoiceScriptUpsertRequest,
  VoiceSynthesizeRequest,
  VoiceSynthesizeResponse,
} from "@hcmc-museum/contracts";
import { VoiceScriptStore } from "./scriptStore.js";
import { VoiceAdminConfigStore } from "./adminConfig.js";
import type { VoiceAdminConfigPatch } from "./adminConfig.js";
import { WebSpeechClientEngine } from "./engine.js";
import type { TtsEngine } from "./engine.js";
import { VoiceTtsCache } from "./cache.js";
import { stableHash } from "./hash.js";
import { interpretCommand } from "./commandInterpreter.js";

const ENGINE_VERSION = "v1";

export class VoiceService {
  private readonly scripts: VoiceScriptStore;
  public readonly adminConfig: VoiceAdminConfigStore;
  private readonly cache: VoiceTtsCache;
  private readonly engine: TtsEngine;

  constructor() {
    this.scripts = new VoiceScriptStore();
    this.adminConfig = new VoiceAdminConfigStore();
    this.cache = new VoiceTtsCache();
    this.engine = new WebSpeechClientEngine();
  }

  public listPublishedScripts(locale?: VoiceLocale, artifactId?: string): VoiceScriptListResponse {
    const items = this.scripts.getPublished(locale, artifactId);
    return { items, total: items.length };
  }

  public listAllScripts(): VoiceScriptListResponse {
    const items = this.scripts.getAll();
    return { items, total: items.length };
  }

  public upsertScript(input: VoiceScriptUpsertRequest): VoiceScript {
    return this.scripts.upsert(input);
  }

  public synthesize(request: VoiceSynthesizeRequest): VoiceSynthesizeResponse {
    const sourceText = this.resolveSourceText(request);
    const glossary = this.adminConfig.glossary;
    const plainText = glossary.applyPronunciation(sourceText, request.locale);
    const ssmlText = glossary.buildSsml(sourceText, request.locale);

    const cacheKey = stableHash(
      [plainText, request.voiceId, String(request.speed), request.locale, ENGINE_VERSION].join(
        "::",
      ),
    );

    const cached = this.cache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    const synthesis = this.engine.estimate(plainText, request.locale, request.speed);
    const response: VoiceSynthesizeResponse = {
      cacheKey,
      cached: false,
      engine: this.engine.id,
      ssmlText,
      plainText,
      locale: request.locale,
      voiceId: request.voiceId,
      speed: request.speed,
      estimatedDurationSeconds: synthesis.estimatedDurationSeconds,
      costEstimate: synthesis.costEstimate,
    };
    this.cache.set(cacheKey, response);
    return response;
  }

  private resolveSourceText(request: VoiceSynthesizeRequest): string {
    if (request.scriptId) {
      const script = this.scripts.getById(request.scriptId);
      if (script) {
        return script.text;
      }
    }
    return request.text ?? "";
  }

  public interpretVoiceCommand(transcript: string, locale: VoiceLocale): VoiceCommandResponse {
    const result = interpretCommand(transcript, locale);
    const response: VoiceCommandResponse = {
      intent: result.intent,
      confidence: result.confidence,
      message: result.message,
    };
    if (result.targetSlug !== undefined) {
      response.targetSlug = result.targetSlug;
    }
    return response;
  }

  public getAdminConfig(): VoiceAdminConfig {
    return this.adminConfig.getConfig();
  }

  public updateAdminConfig(patch: VoiceAdminConfigPatch): VoiceAdminConfig {
    return this.adminConfig.update(patch);
  }

  public estimateCost(scriptIds: string[]): VoiceCostEstimateResponse {
    let characterCount = 0;
    let scriptsAlreadyCached = 0;
    let scriptsToGenerate = 0;

    for (const scriptId of scriptIds) {
      const script = this.scripts.getById(scriptId);
      if (!script) {
        continue;
      }
      const plainText = this.adminConfig.glossary.applyPronunciation(script.text, script.locale);
      characterCount += plainText.length;
      const cacheKey = stableHash(
        [plainText, "default", "1", script.locale, ENGINE_VERSION].join("::"),
      );
      if (this.cache.has(cacheKey)) {
        scriptsAlreadyCached += 1;
      } else {
        scriptsToGenerate += 1;
      }
    }

    return {
      engine: this.engine.id,
      characterCount,
      estimatedCost: 0,
      currency: "VND",
      scriptsAlreadyCached,
      scriptsToGenerate,
      note: "Web Speech API (engine mặc định) miễn phí — không phát sinh chi phí; ước tính sẽ khác 0 nếu bật cloud engine.",
    };
  }
}

export const voiceService = new VoiceService();
