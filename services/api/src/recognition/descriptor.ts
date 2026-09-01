export const DESCRIPTOR_DIMENSIONS = 24;

// Deterministic placeholder visual descriptor (NOT a real CV/embedding model — see
// DEC-RECOGNITION-001 in docs/work/TASK-RECOGNITION-001.md). Splits the raw image bytes
// into fixed-size segments and takes the average byte value per segment, producing a
// coarse, reproducible profile of how byte values vary across the file. Two byte-identical
// uploads always produce an identical descriptor; unrelated uploads typically diverge.
export function computeDescriptor(
  bytes: Buffer,
  dimensions: number = DESCRIPTOR_DIMENSIONS,
): number[] {
  if (bytes.length === 0) {
    return new Array<number>(dimensions).fill(0);
  }

  const segmentSize = Math.max(1, Math.ceil(bytes.length / dimensions));
  const descriptor: number[] = [];

  for (let dimension = 0; dimension < dimensions; dimension += 1) {
    const start = dimension * segmentSize;
    const end = Math.min(start + segmentSize, bytes.length);
    if (start >= bytes.length) {
      descriptor.push(0);
      continue;
    }
    let sum = 0;
    for (let i = start; i < end; i += 1) {
      sum += bytes[i] ?? 0;
    }
    descriptor.push(sum / (end - start));
  }

  return descriptor;
}

export function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  const length = Math.min(a.length, b.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < length; i += 1) {
    const valueA = a[i] ?? 0;
    const valueB = b[i] ?? 0;
    dot += valueA * valueB;
    normA += valueA * valueA;
    normB += valueB * valueB;
  }
  if (normA === 0 || normB === 0) {
    return 0;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
