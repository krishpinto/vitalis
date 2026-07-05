// Post-consult transcript refinement (item 1) — orchestrates the Sarvam
// Batch-API diarization pass and the Gemini role-attribution pass into a
// re-attributed transcript. Runs in the background after the consult stops;
// the live heuristic transcript stays if any stage is unavailable.

import { attributeRoles } from './gemini';
import { diarizeChunks } from './sarvam';
import type { AudioChunk, Transcript } from '@/types/clinical';

/**
 * Re-attribute the consult transcript with real diarization.
 * Returns the refined transcript, or null when refinement isn't possible
 * (demo mode, batch failure, role attribution failure).
 */
export async function refineTranscript(
  chunks: AudioChunk[],
  languageCode?: string
): Promise<Transcript | null> {
  const segments = await diarizeChunks(chunks);
  if (!segments) return null;

  // Roles come from Gemini (batch speaker ids are chunk-local). If the role
  // pass fails, fall back to first-speaker-is-Doctor within each chunk —
  // still better segmentation than the live alternating heuristic.
  const roles = await attributeRoles(segments);
  const fallbackRole = (chunkId: string, localSpeaker: string) => {
    const firstInChunk = segments.find((s) => s.chunkId === chunkId);
    return localSpeaker === firstInChunk?.localSpeaker ? 'Doctor' : 'Patient';
  };

  return {
    languageCode,
    isDemo: false,
    lines: segments.map((s, i) => ({
      id: `r_${i + 1}`,
      speaker: roles?.[i] ?? fallbackRole(s.chunkId, s.localSpeaker),
      text: s.text,
      startTime: s.startSec,
      chunkId: s.chunkId,
    })),
  };
}
