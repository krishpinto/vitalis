// Gemini API wrappers — Call #1 (structuring) and Call #2 (reasoning).
// All Gemini network access lives here; screens never call the API directly.

import { GoogleGenerativeAI } from '@google/generative-ai';

import { ENV, hasGemini } from './env';
import { GUIDELINES } from './guidelines';
import type {
  Attachment,
  DiagnosisResult,
  StructuredEntities,
  Transcript,
} from '@/types/clinical';

const MODEL = 'gemini-2.5-flash';

function client() {
  return new GoogleGenerativeAI(ENV.GEMINI_API_KEY).getGenerativeModel({ model: MODEL });
}

/** Strip markdown code fences and parse JSON defensively. Throws on malformed JSON. */
function parseJson<T>(raw: string): T {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  return JSON.parse(cleaned) as T;
}

function transcriptToText(t: Transcript): string {
  return t.lines.map((l) => `${l.speaker}: ${l.text}`).join('\n');
}

// ---------------------------------------------------------------------------
// Call #1 — Structuring
// ---------------------------------------------------------------------------

const STRUCTURING_PROMPT = `You extract structured clinical information from a diarized doctor-patient consult transcript.
Output ONLY valid JSON matching this schema, no prose, no markdown:
{
  "symptoms": string[],
  "duration": string,
  "history": string[],
  "medications": string[],
  "doctor_observations": string[]
}
If a field is unknown, use an empty array or empty string. Transcript:`;

function demoEntities(): StructuredEntities {
  return {
    symptoms: ['High fever (up to 103°F)', 'Severe headache', 'Retro-orbital pain', 'Body ache / myalgia', 'Vomiting (x2)', 'Red spots on hands', 'Weakness'],
    duration: '3 days',
    history: ['Fever recurs after antipyretic wears off', 'Chills with shivering'],
    medications: ['Paracetamol (Crocin)'],
    doctor_observations: ['Petechiae on hands', 'No bleeding gums reported', 'Ordered platelet count and dengue test'],
  };
}

export async function structureTranscript(transcript: Transcript): Promise<StructuredEntities> {
  if (!hasGemini) {
    await new Promise((r) => setTimeout(r, 900));
    return demoEntities();
  }
  const res = await client().generateContent(`${STRUCTURING_PROMPT}\n${transcriptToText(transcript)}`);
  return parseJson<StructuredEntities>(res.response.text());
}

// ---------------------------------------------------------------------------
// Call #2 — Reasoning
// ---------------------------------------------------------------------------

const REASONING_SYSTEM = `You are a clinical decision support assistant. You are NOT diagnosing the patient.
You are providing a structured second-opinion draft for a licensed doctor to review and decide upon.

GUIDELINES:
${GUIDELINES}

RULES:
- Every differential you suggest must cite a specific line from the transcript AND a specific line from the guidelines above.
- Output ONLY valid JSON matching the schema provided. No prose, no markdown, no explanation outside the JSON.
- If you cannot ground a suggestion in both the transcript and the guidelines, do not include it.
- Always include a cant_miss tier even if probability is low.

SCHEMA:
{
  "differentials": [
    {
      "diagnosis": string,
      "tier": "most_likely" | "expanded" | "cant_miss",
      "reasoning": string,
      "transcript_reference": string,
      "guideline_reference": string
    }
  ],
  "suggested_workup": string[],
  "red_flags": string[]
}`;

function demoDiagnosis(): DiagnosisResult {
  return {
    differentials: [
      {
        diagnosis: 'Dengue fever',
        tier: 'most_likely',
        reasoning: 'High-grade fever for 3 days with severe headache, retro-orbital pain, myalgia and petechiae on the hands strongly fits the dengue pattern.',
        transcript_reference: 'Haath par thode red spots aaye hain. Do baar ulti bhi hui hai.',
        guideline_reference: '[G1] Fever >38°C lasting 2-7 days with severe headache, retro-orbital pain, myalgia and a positive tourniquet test or petechiae is suggestive of dengue fever.',
      },
      {
        diagnosis: 'Enteric (typhoid) fever',
        tier: 'expanded',
        reasoning: 'Persistent fever with GI upset (vomiting) keeps typhoid on the differential, though duration is shorter than classic and no step-ladder pattern was described.',
        transcript_reference: 'teen din se bahut tez bukhar hai aur sar mein dard ho raha hai',
        guideline_reference: '[G4] Step-ladder fever for >1 week with relative bradycardia, abdominal discomfort and constipation or diarrhoea suggests enteric (typhoid) fever.',
      },
      {
        diagnosis: 'Malaria',
        tier: 'expanded',
        reasoning: 'Fever with chills and shivering warrants excluding malaria with a smear / rapid antigen test.',
        transcript_reference: 'Thand bhi lagti hai shivering ke saath.',
        guideline_reference: '[G5] Cyclical fever with chills and rigors requires a malaria smear / rapid antigen test to exclude malaria.',
      },
      {
        diagnosis: 'Severe dengue (warning-sign progression)',
        tier: 'cant_miss',
        reasoning: 'Persistent vomiting is a dengue warning sign; must not miss progression to severe dengue around defervescence.',
        transcript_reference: 'Do baar ulti bhi hui hai.',
        guideline_reference: '[G3] Warning signs for severe dengue: persistent vomiting, mucosal bleeding, abdominal pain, lethargy, and rapid platelet drop.',
      },
    ],
    suggested_workup: ['CBC with platelet count', 'Dengue NS1 antigen (day 1-5)', 'Malaria smear / rapid antigen test', 'Blood culture if fever persists >1 week'],
    red_flags: ['Persistent vomiting', 'Petechiae / risk of mucosal bleeding', 'Monitor for shock around day 4-6 defervescence'],
  };
}

export async function reasonDifferentials(
  entities: StructuredEntities,
  attachments: Attachment[] = []
): Promise<DiagnosisResult> {
  if (!hasGemini) {
    await new Promise((r) => setTimeout(r, 1100));
    return demoDiagnosis();
  }

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: `${REASONING_SYSTEM}\n\nSTRUCTURED ENTITIES:\n${JSON.stringify(entities, null, 2)}` },
    ...attachments.map((a) => ({ inlineData: { mimeType: a.mimeType, data: a.base64 } })),
  ];

  const res = await client().generateContent(parts);
  return parseJson<DiagnosisResult>(res.response.text());
}
