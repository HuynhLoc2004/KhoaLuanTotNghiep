import type { RecognitionReference } from "./referenceStore.js";
import { cosineSimilarity } from "./descriptor.js";

// Calibrated against measured similarity values for this repo's placeholder descriptor
// (see "Plan revision" in docs/work/TASK-RECOGNITION-001.md): identical/near-identical
// byte uploads score >= 0.999; genuinely different content typically scores lower, but
// the descriptor saturates near 1.0 for any compressed-image-sized buffer, so thresholds
// are deliberately narrow and tuned to this specific descriptor, not a generic convention.
export const MATCH_THRESHOLD = 0.999;
export const LOW_CONFIDENCE_THRESHOLD = 0.9;

const VISUAL_WEIGHT = 0.75;
const ZONE_WEIGHT = 0.15;
// metadataMatch is always 0 for MVP — no metadata signal is available on the upload
// request yet, so the composite score can never exceed VISUAL_WEIGHT + ZONE_WEIGHT (0.9).
const METADATA_MATCH = 0;

export interface RankedCandidate {
  artifactId: string;
  title: string;
  score: number;
  confidence: number;
  matchedZone: boolean;
}

export function rankReferences(
  uploadedDescriptor: readonly number[],
  references: readonly RecognitionReference[],
  zoneHint: string | undefined,
): RankedCandidate[] {
  return references
    .map((reference) => {
      const confidence = cosineSimilarity(uploadedDescriptor, reference.descriptor);
      const matchedZone = zoneHint !== undefined && reference.zoneId === zoneHint;
      const zonePrior = matchedZone ? 1 : 0;
      const score = VISUAL_WEIGHT * confidence + ZONE_WEIGHT * zonePrior + 0.1 * METADATA_MATCH;
      return {
        artifactId: reference.artifactId,
        title: reference.title,
        score,
        confidence,
        matchedZone,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function classifyStatus(
  topConfidence: number | undefined,
): "MATCHED" | "LOW_CONFIDENCE" | "UNKNOWN" {
  if (topConfidence === undefined) {
    return "UNKNOWN";
  }
  if (topConfidence >= MATCH_THRESHOLD) {
    return "MATCHED";
  }
  if (topConfidence >= LOW_CONFIDENCE_THRESHOLD) {
    return "LOW_CONFIDENCE";
  }
  return "UNKNOWN";
}
