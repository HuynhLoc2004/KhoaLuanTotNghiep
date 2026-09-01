import { computeDescriptor } from "./descriptor.js";

export interface RecognitionReference {
  artifactId: string;
  title: string;
  zoneId: string | undefined;
  descriptor: number[];
  updatedAt: string;
}

export interface RecognitionReferenceUpsertInput {
  artifactId: string;
  title: string;
  imageBytes: Buffer;
  zoneId?: string | undefined;
}

// Deterministic synthetic reference bytes so unit tests can exercise the matcher without
// real photo fixtures. Admin curators replace these via upsert() with real reference
// photos (Admin Invariant: content is curated via Admin Portal, never hardcoded for
// visitors) — these two rows only seed the in-memory store, same pattern already used by
// Voice's VoiceScriptStore and AI Guide's knowledge base in this codebase baseline.
function seedImageBytes(multiplier: number, offset: number, length = 2048): Buffer {
  const bytes = Buffer.alloc(length);
  for (let i = 0; i < length; i += 1) {
    bytes[i] = (i * multiplier + offset) % 256;
  }
  return bytes;
}

const SEED_REFERENCES: RecognitionReferenceUpsertInput[] = [
  {
    artifactId: "art-001",
    title: "Trống Đồng Đông Sơn",
    imageBytes: seedImageBytes(7, 0),
    zoneId: "zone-a",
  },
  {
    artifactId: "art-002",
    title: "Tượng Thần Vishnu Óc Eo",
    imageBytes: seedImageBytes(13, 50),
    zoneId: "zone-b",
  },
];

export class RecognitionReferenceStore {
  private readonly references = new Map<string, RecognitionReference>();

  constructor(initial: RecognitionReferenceUpsertInput[] = SEED_REFERENCES) {
    initial.forEach((input) => this.upsert(input));
  }

  public getAll(): RecognitionReference[] {
    return Array.from(this.references.values());
  }

  public upsert(input: RecognitionReferenceUpsertInput): RecognitionReference {
    const reference: RecognitionReference = {
      artifactId: input.artifactId,
      title: input.title,
      zoneId: input.zoneId,
      descriptor: computeDescriptor(input.imageBytes),
      updatedAt: new Date().toISOString(),
    };
    this.references.set(input.artifactId, reference);
    return reference;
  }
}

export { seedImageBytes };
