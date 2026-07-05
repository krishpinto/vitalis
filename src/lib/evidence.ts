// Maps an AI citation (transcript_reference quote) back to the transcript line —
// and therefore to the audio chunk — that produced it. Token-overlap matching,
// because the model may lightly paraphrase or trim the quote.

import type { AudioChunk, TranscriptLine } from '@/types/clinical';

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

/**
 * Find the transcript line best matching a quoted reference.
 * Returns null when nothing overlaps meaningfully (uncited output is a bug,
 * but the UI must not crash on it).
 */
export function findLineForQuote(
  quote: string,
  lines: TranscriptLine[]
): TranscriptLine | null {
  const quoteTokens = new Set(tokens(quote));
  if (!quoteTokens.size) return null;

  let best: TranscriptLine | null = null;
  let bestScore = 0;
  for (const line of lines) {
    const lineTokens = tokens(line.text);
    if (!lineTokens.length) continue;
    const hits = lineTokens.filter((t) => quoteTokens.has(t)).length;
    const score = hits / Math.max(quoteTokens.size, 1);
    if (score > bestScore) {
      bestScore = score;
      best = line;
    }
  }
  // Require at least a third of the quote's tokens to appear in the line.
  return bestScore >= 0.34 ? best : null;
}

/** Resolve the audio chunk for a transcript line, if its recording persists. */
export function chunkForLine(
  line: TranscriptLine | null,
  chunks: AudioChunk[]
): AudioChunk | null {
  if (!line?.chunkId) return null;
  return chunks.find((c) => c.id === line.chunkId) ?? null;
}
