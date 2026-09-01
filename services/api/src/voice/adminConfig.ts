import type { VoiceAdminConfig, VoiceGlossaryTerm } from "@hcmc-museum/contracts";
import { VoiceGlossaryStore } from "./glossary.js";

const DEFAULT_GLOSSARY: VoiceGlossaryTerm[] = [
  { term: "Óc Eo", locale: "vi", pronunciation: "Óc Eo" },
  { term: "Đông Sơn", locale: "vi", pronunciation: "Đông Sơn" },
];

export interface VoiceAdminConfigPatch {
  glossary?: VoiceGlossaryTerm[] | undefined;
  cloudEngineEnabled?: boolean | undefined;
}

// Admin manages glossary/engine settings here; the synthesize pipeline reads it at request
// time, so a change takes effect immediately without a redeploy.
export class VoiceAdminConfigStore {
  private version = 1;
  private cloudEngineEnabled = false;
  private updatedAt = "2026-09-01T00:00:00.000Z";
  public readonly glossary: VoiceGlossaryStore;

  constructor(initialGlossary: VoiceGlossaryTerm[] = DEFAULT_GLOSSARY) {
    this.glossary = new VoiceGlossaryStore(initialGlossary);
  }

  public getConfig(): VoiceAdminConfig {
    return {
      version: this.version,
      glossary: this.glossary.getAll(),
      cloudEngineEnabled: this.cloudEngineEnabled,
      updatedAt: this.updatedAt,
    };
  }

  public update(patch: VoiceAdminConfigPatch): VoiceAdminConfig {
    if (patch.glossary !== undefined) {
      this.glossary.replaceAll(patch.glossary);
    }
    if (patch.cloudEngineEnabled !== undefined) {
      this.cloudEngineEnabled = patch.cloudEngineEnabled;
    }
    this.version += 1;
    this.updatedAt = new Date().toISOString();
    return this.getConfig();
  }
}
