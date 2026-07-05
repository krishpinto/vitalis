// Global app state shared across the flow (landing → patients → consult → review →
// diagnosis). A small zustand store keeps screens decoupled from navigation.

import { create } from 'zustand';

import type {
  Attachment,
  AudioChunk,
  DiagnosisResult,
  FeedbackVote,
  Patient,
  StructuredEntities,
  Transcript,
} from '@/types/clinical';

// Synthetic seed patients — DEMO DATA ONLY, never real patients.
const SEED_PATIENTS: Patient[] = [
  { id: 'p_rahul', name: 'Rahul Sharma', age: '34', sex: 'Male', complaint: 'Fever & body ache · 3 days', lastVisit: 'Today', createdAt: Date.now() - 3 },
  { id: 'p_priya', name: 'Priya Verma', age: '28', sex: 'Female', complaint: 'Recurring headaches', lastVisit: '2 days ago', createdAt: Date.now() - 2 },
  { id: 'p_amit', name: 'Amit Patel', age: '45', sex: 'Male', complaint: 'Follow-up · hypertension', lastVisit: '12 Jun 2026', createdAt: Date.now() - 1 },
];

interface AppState {
  // Patients
  patients: Patient[];
  activePatientId: string | null;
  addPatient: (p: Omit<Patient, 'id' | 'createdAt'>) => Patient;
  selectPatient: (id: string) => void;
  getActivePatient: () => Patient | null;

  // Current consult
  transcript: Transcript | null;
  entities: StructuredEntities | null;
  diagnosis: DiagnosisResult | null;
  attachments: Attachment[];
  /** Recorded audio chunks for the current consult — the evidence audio. */
  chunks: AudioChunk[];
  /** Clinician feedback per differential index (item 6). Local-only for now. */
  feedback: Record<number, { vote: FeedbackVote; comment?: string }>;
  /** True while the post-consult batch diarization pass is re-attributing speakers. */
  refining: boolean;

  setTranscript: (t: Transcript | null) => void;
  setRefining: (refining: boolean) => void;
  setEntities: (e: StructuredEntities | null) => void;
  setDiagnosis: (d: DiagnosisResult | null) => void;
  setChunks: (c: AudioChunk[]) => void;
  setFeedback: (index: number, vote: FeedbackVote | null, comment?: string) => void;
  addAttachment: (a: Attachment) => void;
  removeAttachment: (id: string) => void;

  /** Wipe the current consult (keeps patients) to start fresh. */
  reset: () => void;
}

export const useConsult = create<AppState>((set, get) => ({
  patients: SEED_PATIENTS,
  activePatientId: null,

  addPatient: (input) => {
    const patient: Patient = {
      ...input,
      id: `p_${Date.now()}`,
      createdAt: Date.now(),
      lastVisit: input.lastVisit ?? 'Today',
    };
    set((s) => ({ patients: [patient, ...s.patients] }));
    return patient;
  },
  selectPatient: (id) => set({ activePatientId: id }),
  getActivePatient: () => {
    const { patients, activePatientId } = get();
    return patients.find((p) => p.id === activePatientId) ?? null;
  },

  transcript: null,
  entities: null,
  diagnosis: null,
  attachments: [],
  chunks: [],
  feedback: {},
  refining: false,

  setTranscript: (transcript) => set({ transcript }),
  setRefining: (refining) => set({ refining }),
  setEntities: (entities) => set({ entities }),
  setDiagnosis: (diagnosis) => set({ diagnosis }),
  setChunks: (chunks) => set({ chunks }),
  setFeedback: (index, vote, comment) =>
    set((s) => {
      const next = { ...s.feedback };
      if (vote === null) delete next[index];
      else next[index] = { vote, comment };
      return { feedback: next };
    }),
  addAttachment: (a) => set((s) => ({ attachments: [...s.attachments, a] })),
  removeAttachment: (id) => set((s) => ({ attachments: s.attachments.filter((x) => x.id !== id) })),

  reset: () =>
    set({ transcript: null, entities: null, diagnosis: null, attachments: [], chunks: [], feedback: {}, refining: false }),
}));
