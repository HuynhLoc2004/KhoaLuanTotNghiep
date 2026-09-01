// Deterministic, dependency-free hash used to key cached TTS renders — matches the feature
// spec's cache key: hash(normalizedText + voice + speed + locale + engineVersion).
export function stableHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}
