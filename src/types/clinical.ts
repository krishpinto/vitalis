// TypeScript types for all clinical JSON schemas used across the app.
// These mirror the Gemini Call #1 / Call #2 output shapes defined in CLAUDE.md.

/** A patient record. Synthetic/demo data only — never real patient data. */
export type Sex = 'Male' | 'Female' | 'Other';

export interface Patient {
  id: string;
  name: string;
  age?: string;
  sex?: Sex;
  /** Chief complaint or short summary shown on the patient card. */
  complaint?: string;
  /** Human-readable last-visit label, e.g. "Today", "12 Jun 2026". */
  lastVisit?: string;
  createdAt: number;
}

/** A single diarized utterance from the Sarvam STT response. */
export type Speaker = 'Doctor' | 'Patient' | 'Unknown';

export interface TranscriptLine {
  /** Stable id so UI can reference/highlight a specific line. */
  id: string;
  speaker: Speaker;
  text: string;
  /** Seconds from start of recording, if the STT provides timing. */
  startTime?: number;
  endTime?: number;
}

export interface Transcript {
  lines: TranscriptLine[];
  /** Full language code reported by STT, e.g. "hi-IN". */
  languageCode?: string;
  /** True when produced by the local demo fallback rather than a live API call. */
  isDemo?: boolean;
}

// ---------------------------------------------------------------------------
// Gemini Call #1 — Structuring
// ---------------------------------------------------------------------------

export interface StructuredEntities {
  symptoms: string[];
  duration: string;
  history: string[];
  medications: string[];
  doctor_observations: string[];
}

// ---------------------------------------------------------------------------
// Gemini Call #2 — Reasoning
// ---------------------------------------------------------------------------

export type DifferentialTier = 'most_likely' | 'expanded' | 'cant_miss';

export interface Differential {
  diagnosis: string;
  tier: DifferentialTier;
  reasoning: string;
  /** Exact quote from the transcript that grounds this suggestion. */
  transcript_reference: string;
  /** Exact quote from the guideline text block that grounds this suggestion. */
  guideline_reference: string;
}

export interface DiagnosisResult {
  differentials: Differential[];
  suggested_workup: string[];
  red_flags: string[];
}

/** A photo or scanned record attached to the consult, prepared for Gemini vision. */
export interface Attachment {
  id: string;
  /** Local URI for preview in the app. */
  uri: string;
  /** MIME type, e.g. "image/jpeg". */
  mimeType: string;
  /** Base64-encoded image data (no data: prefix) for Gemini inlineData. */
  base64: string;
}
