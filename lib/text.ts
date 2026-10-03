const MAX_CHUNKS = 6;

/** Normalise a guess (or stored term) for comparison. Display uses the original string. */
export function normaliseGuess(input: string): string {
  return input
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/[^\p{L}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Split a description into at most 6 chunks of roughly equal word count.
 * Prefer sentence packing when there are two or more sentences; otherwise split on words.
 */
export function chunkDescription(text: string): string[] {
  const collapsed = text.replace(/\s+/g, " ").trim();
  if (!collapsed) {
    return [];
  }

  const sentences = splitSentences(collapsed);
  if (sentences.length >= 2) {
    const k = Math.min(MAX_CHUNKS, sentences.length);
    return packContiguous(sentences, k, wordCount);
  }

  const words = collapsed.split(" ").filter(Boolean);
  const k = Math.min(MAX_CHUNKS, words.length);
  return packContiguous(words, k, () => 1);
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])(?:\s+|$)/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function wordCount(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}

/** Partition items in order into k groups whose weights are as even as possible. */
function packContiguous(
  items: string[],
  k: number,
  weight: (item: string) => number,
): string[] {
  const n = items.length;
  if (n === 0) {
    return [];
  }
  if (k <= 1) {
    return [items.join(" ")];
  }

  const weights = items.map(weight);
  const prefix: number[] = [0];
  for (const w of weights) {
    prefix.push(prefix[prefix.length - 1] + w);
  }
  const total = prefix[n];

  const bounds: number[] = [0];
  let start = 0;
  for (let c = 1; c < k; c++) {
    const ideal = (total * c) / k;
    const minI = start + 1;
    const maxI = n - (k - c);
    let best = minI;
    let bestDist = Infinity;
    for (let i = minI; i <= maxI; i++) {
      const dist = Math.abs(prefix[i] - ideal);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    bounds.push(best);
    start = best;
  }
  bounds.push(n);

  const chunks: string[] = [];
  for (let c = 0; c < k; c++) {
    chunks.push(items.slice(bounds[c], bounds[c + 1]).join(" "));
  }
  return chunks;
}
