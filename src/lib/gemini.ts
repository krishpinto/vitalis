// Gemini API wrappers — Call #1 (structuring) and Call #2 (reasoning).
// All Gemini network access lives here; screens never call the API directly.

import { GoogleGenerativeAI } from '@google/generative-ai';

import { checklistPromptBlock } from './checklist';
import { ENV, hasGemini } from './env';
import { GUIDELINES } from './guidelines';
import type {
  Attachment,
  DiagnosisResult,
  Speaker,
  StructuredEntities,
  Suggestion,
  Transcript,
  TranscriptLine,
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

HISTORY CHECKLIST (acute febrile illness — every item should have been covered in the consult):
${checklistPromptBlock()}

RULES:
- Every differential you suggest must cite a specific line from the transcript AND a specific line from the guidelines above.
- Output ONLY valid JSON matching the schema provided. No prose, no markdown, no explanation outside the JSON.
- If you cannot ground a suggestion in both the transcript and the guidelines, do not include it.
- Always include a cant_miss tier even if probability is low.
- "gaps": compare the consult against the HISTORY CHECKLIST. For each checklist item that was NOT covered in the consult, add one gap entry: what was missed, why it matters for dengue/typhoid/malaria specifically, and one exact question the doctor could ask. Include only genuinely uncovered items. Empty array if everything was covered.
- "alignment": you are a second assistant, not a teaching doctor. NEVER grade, score, or criticise the doctor. "agreement" must lead with where the doctor's direction already matched the guidelines (tests ordered, questions asked, advice given) — be specific. "additional_considerations" are framed strictly as "additionally consider ..." suggestions, never as corrections or omissions.

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
  "red_flags": string[],
  "gaps": [
    { "missedItem": string, "whyItMatters": string, "suggestedQuestion": string }
  ],
  "alignment": {
    "agreement": string,
    "additional_considerations": string[]
  }
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
    gaps: [
      {
        missedItem: 'Travel history',
        whyItMatters: 'Cannot rule out malaria — recent travel to an endemic area sharply changes its probability, and no travel history was asked.',
        suggestedQuestion: 'Pichhle kuch hafton mein aap kahin bahar gaye the — gaon ya kisi aur sheher?',
      },
      {
        missedItem: 'Urine output',
        whyItMatters: 'Reduced urine output is an early sign of dehydration or impending shock in dengue.',
        suggestedQuestion: 'Peshab pehle jitna hi ho raha hai, ya kam ho gaya hai?',
      },
    ],
    alignment: {
      agreement:
        'Ordering a platelet count and dengue test matches the guideline pathway for fever with petechiae, and screening for bleeding gums covered a key warning sign.',
      additional_considerations: [
        'Additionally consider a malaria smear in the same draw, given chills with rigors.',
        'Additionally consider advising a return visit at defervescence (day 4-6), when dengue shock risk peaks.',
      ],
    },
  };
}

/** Fill any fields the model omitted so screens never see undefined. */
function normalizeDiagnosis(raw: Partial<DiagnosisResult>): DiagnosisResult {
  return {
    differentials: raw.differentials ?? [],
    suggested_workup: raw.suggested_workup ?? [],
    red_flags: raw.red_flags ?? [],
    gaps: raw.gaps ?? [],
    alignment: raw.alignment ?? { agreement: '', additional_considerations: [] },
  };
}

export async function reasonDifferentials(
  entities: StructuredEntities,
  transcript: Transcript | null,
  attachments: Attachment[] = []
): Promise<DiagnosisResult> {
  if (!hasGemini) {
    await new Promise((r) => setTimeout(r, 1100));
    return demoDiagnosis();
  }

  const sections = [
    `${REASONING_SYSTEM}\n\nSTRUCTURED ENTITIES:\n${JSON.stringify(entities, null, 2)}`,
    transcript ? `FULL TRANSCRIPT (for exact citations and gap detection):\n${transcriptToText(transcript)}` : '',
  ].filter(Boolean);

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: sections.join('\n\n') },
    ...attachments.map((a) => ({ inlineData: { mimeType: a.mimeType, data: a.base64 } })),
  ];

  const res = await client().generateContent(parts);
  return normalizeDiagnosis(parseJson<Partial<DiagnosisResult>>(res.response.text()));
}

// ---------------------------------------------------------------------------
// Speaker role attribution (item 1, second half).
//
// The Sarvam batch pass yields acoustically-diarized segments, but its speaker
// ids ("0"/"1") reset per chunk file, so they cannot name who is the Doctor
// and who is the Patient across the whole consult. This lightweight call maps
// every segment to a global role using content plus the within-chunk speaker
// consistency hints.
// ---------------------------------------------------------------------------

const ROLE_PROMPT = `You are labelling speakers in a diarized doctor-patient consult transcript (Indian OPD, Hinglish).
Each line below is "index | chunk:speakerId | text". The speakerId is only consistent WITHIN a chunk: inside one chunk, lines sharing a speakerId are the same person; across chunks the ids reset and mean nothing.
Assign every line to "Doctor" or "Patient". The doctor asks questions, examines, prescribes; the patient describes symptoms and answers.
Output ONLY valid JSON, no markdown: { "roles": ["Doctor" | "Patient", ...] } with exactly one entry per input line, in order.`;

export async function attributeRoles(
  segments: { text: string; localSpeaker: string; chunkId: string }[]
): Promise<Speaker[] | null> {
  if (!hasGemini || segments.length === 0) return null;
  try {
    const body = segments
      .map((s, i) => `${i} | ${s.chunkId}:${s.localSpeaker || '?'} | ${s.text}`)
      .join('\n');
    const res = await client().generateContent(`${ROLE_PROMPT}\n\n${body}`);
    const parsed = parseJson<{ roles?: string[] }>(res.response.text());
    const roles = parsed.roles ?? [];
    if (roles.length !== segments.length) return null;
    return roles.map((r) => (r === 'Doctor' || r === 'Patient' ? r : 'Unknown'));
  } catch (err) {
    console.warn('[attributeRoles] failed:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Call #3 — in-consult suggestion cards (item 5). Lightweight, every ~25s.
// ---------------------------------------------------------------------------

const SUGGESTION_PROMPT = `You are a silent second assistant listening to an ongoing doctor-patient consult for acute febrile illness (dengue / typhoid / malaria).
Given the transcript so far and this history checklist:

${checklistPromptBlock()}

Suggest AT MOST 2 short questions the doctor has not yet asked that would most change the differential right now. Prefer checklist items not yet covered. Do not repeat anything already asked, and do not include any of the ALREADY SUGGESTED questions.
Output ONLY valid JSON, no markdown: { "suggestions": [ { "question": string, "rationale": string } ] }
"question" is phrased naturally for an Indian OPD (Hinglish is fine). "rationale" is one short clause (e.g. "rules out malaria"). Return an empty array if nothing is worth asking yet.`;

let suggestionCounter = 0;

/** Synthetic suggestion used in demo mode — mirrors the travel-history gap. */
function demoSuggestions(): Suggestion[] {
  return [
    {
      id: `sg_${++suggestionCounter}`,
      question: 'Recent travel? — "Pichhle kuch hafton mein kahin bahar gaye the?"',
      rationale: 'Rules out malaria — travel history not yet asked.',
    },
  ];
}

export async function suggestQuestions(
  lines: TranscriptLine[],
  alreadySuggested: string[]
): Promise<Suggestion[]> {
  if (!hasGemini) {
    await new Promise((r) => setTimeout(r, 600));
    return demoSuggestions();
  }

  const transcriptText = lines.map((l) => `${l.speaker}: ${l.text}`).join('\n');
  const prompt = `${SUGGESTION_PROMPT}\n\nALREADY SUGGESTED:\n${alreadySuggested.map((q) => `- ${q}`).join('\n') || '(none)'}\n\nTRANSCRIPT SO FAR:\n${transcriptText}`;

  const res = await client().generateContent(prompt);
  const parsed = parseJson<{ suggestions?: { question?: string; rationale?: string }[] }>(
    res.response.text()
  );
  return (parsed.suggestions ?? [])
    .filter((s) => s.question)
    .slice(0, 2)
    .map((s) => ({
      id: `sg_${++suggestionCounter}`,
      question: s.question!,
      rationale: s.rationale ?? '',
    }));
}
