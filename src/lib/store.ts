// Global app state shared across the flow (landing → patients → consult → review →
// diagnosis). A small zustand store keeps screens decoupled from navigation.

import { create } from 'zustand';

import type {
  Attachment,
  DiagnosisResult,
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

  setTranscript: (t: Transcript | null) => void;
  setEntities: (e: StructuredEntities | null) => void;
  setDiagnosis: (d: DiagnosisResult | null) => void;
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

  setTranscript: (transcript) => set({ transcript }),
  setEntities: (entities) => set({ entities }),
  setDiagnosis: (diagnosis) => set({ diagnosis }),
  addAttachment: (a) => set((s) => ({ attachments: [...s.attachments, a] })),
  removeAttachment: (id) => set((s) => ({ attachments: s.attachments.filter((x) => x.id !== id) })),

  reset: () => set({ transcript: null, entities: null, diagnosis: null, attachments: [] }),
}));
