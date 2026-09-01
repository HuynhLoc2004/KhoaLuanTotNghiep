import type { VoiceLocale, VoiceScript, VoiceScriptUpsertRequest } from "@hcmc-museum/contracts";

// Admin-managed multilingual scripts (Admin Invariant: content is curated via Admin Portal,
// never hardcoded in Web/UI components). In-memory store, same pattern already established by
// the AI Guide knowledge base and Auth bookmarks/history in this codebase baseline.
const SEED_SCRIPTS: VoiceScript[] = [
  {
    id: "script-dong-son-vi",
    artifactId: "art-001",
    locale: "vi",
    title: "Trống Đồng Đông Sơn",
    text: "Trống đồng Đông Sơn là hiện vật tiêu biểu của văn hóa Đông Sơn, được đúc bằng kỹ thuật hợp kim đồng thau tinh xảo, thể hiện đời sống tín ngưỡng và nghệ thuật của cư dân Việt cổ.",
    status: "PUBLISHED",
    updatedAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "script-dong-son-en",
    artifactId: "art-001",
    locale: "en",
    title: "Dong Son Bronze Drum",
    text: "The Dong Son bronze drum is a representative artifact of the Dong Son culture, cast with refined bronze-alloy techniques that reflect the spiritual life and artistry of the ancient Vietnamese people.",
    status: "PUBLISHED",
    updatedAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "script-oc-eo-vi",
    artifactId: "art-002",
    locale: "vi",
    title: "Tượng Thần Vishnu Óc Eo",
    text: "Tượng thần Vishnu Óc Eo minh chứng cho sự giao thoa văn hóa Ấn Độ giáo trong nền văn minh Óc Eo tại đồng bằng sông Cửu Long.",
    status: "DRAFT",
    updatedAt: "2026-09-01T00:00:00.000Z",
  },
];

export class VoiceScriptStore {
  private readonly scripts = new Map<string, VoiceScript>();

  constructor(initial: VoiceScript[] = SEED_SCRIPTS) {
    initial.forEach((script) => this.scripts.set(script.id, { ...script }));
  }

  public getAll(): VoiceScript[] {
    return Array.from(this.scripts.values());
  }

  public getPublished(locale?: VoiceLocale, artifactId?: string): VoiceScript[] {
    return this.getAll()
      .filter((script) => script.status === "PUBLISHED")
      .filter((script) => !locale || script.locale === locale)
      .filter((script) => !artifactId || script.artifactId === artifactId);
  }

  public getById(id: string): VoiceScript | undefined {
    return this.scripts.get(id);
  }

  public upsert(input: VoiceScriptUpsertRequest): VoiceScript {
    const id = input.id ?? `script-${Date.now().toString(36)}`;
    const script: VoiceScript = {
      id,
      locale: input.locale,
      title: input.title,
      text: input.text,
      status: input.status,
      updatedAt: new Date().toISOString(),
    };
    if (input.artifactId !== undefined) {
      script.artifactId = input.artifactId;
    }
    this.scripts.set(id, script);
    return script;
  }
}
