# Project: Ambient Clinical Second-Opinion Assistant (MVP / Investor Demo)

## What this is
A React Native (Expo) mobile app for doctors. It listens to a doctor-patient consult, transcribes it in Hinglish (Hindi-English code-mixed), lets the doctor attach photos and prior records, and generates a cited differential diagnosis as a second-opinion draft. This is a prototype for investor demo — scope is narrow, do not let it creep.

## Hard rules — read before writing any code
- Every diagnostic suggestion must cite: (1) the transcript line it came from, (2) which guideline statement it's based on. No ungrounded claims. This is the #1 credibility feature — do not cut it.
- All output is framed as a draft requiring doctor sign-off. Never present anything as a final diagnosis.
- Use synthetic/fake patient data only during development and demo. Never process real patient data.
- Do not add RAG, vector DB, or any retrieval pipeline — not in scope for this build. Guidelines go directly into the Gemini system prompt as a text block.

## Tech stack
- **Framework**: Expo (managed workflow)
- **Language**: TypeScript
- **STT**: Sarvam AI Saaras API — handles Hindi-English code-mixing + speaker diarization. Do not use Whisper or Google STT, they will fail on Hinglish.
- **LLM**: Gemini 1.5 Pro API (multimodal — handles text + images in one call)
- **TTS**: Sarvam AI Bulbul API (build last, cut if time-constrained)
- **Backend/storage**: Supabase (Postgres + auth + file storage)
- **Guidelines**: Plain text block in Gemini system prompt — no vector DB, no RAG

## Environment variables needed
```
SARVAM_API_KEY=
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

## Architecture (exactly this, nothing more)

```
[Mobile App]
    |
    |-- Audio capture (chunked, local buffer first)
    |       --> Sarvam STT API --> diarized transcript (Doctor / Patient labelled)
    |
    |-- Photo capture / prior records upload
    |       --> Supabase Storage --> returned as base64 for Gemini vision
    |
    v
[Gemini Call #1 — Structuring]
    Input:  raw diarized transcript
    Output: structured JSON
    {
      symptoms: [...],
      duration: "...",
      history: [...],
      medications: [...],
      doctor_observations: [...]
    }
    |
    v
[Gemini Call #2 — Reasoning]
    Input:
      - structured JSON from Call #1
      - base64 images (photos + record scans, if any)
      - guidelines text block in system prompt
    Output: differential diagnosis JSON
    {
      differentials: [
        {
          diagnosis: "...",
          tier: "most_likely" | "expanded" | "cant_miss",
          reasoning: "...",
          transcript_reference: "exact quote from transcript",
          guideline_reference: "exact quote from guideline text used"
        }
      ],
      suggested_workup: [...],
      red_flags: [...]
    }
    |
    v
[UI]
    - Transcript view (Doctor / Patient colour-coded)
    - Structured entity summary card
    - Differential list (3 tiers)
    - Each differential: tap to expand → shows transcript quote + guideline quote
    - Doctor can dismiss / accept each suggestion
    - TTS readback button (optional, last)
```

## Gemini system prompt structure (use this exact shape)
```
You are a clinical decision support assistant. You are NOT diagnosing the patient.
You are providing a structured second-opinion draft for a licensed doctor to review and decide upon.

GUIDELINES:
[paste guideline text block here — your medical co-founder provides this]

RULES:
- Every differential you suggest must cite a specific line from the transcript AND a specific line from the guidelines above.
- Output ONLY valid JSON matching the schema provided. No prose, no markdown, no explanation outside the JSON.
- If you cannot ground a suggestion in both the transcript and the guidelines, do not include it.
- Always include a cant_miss tier even if probability is low.
```

## Build order — do not reorder, each phase must be demoable before moving on

### Phase 1 — Audio + Transcript
- Expo audio recording (expo-av)
- Chunk audio locally, upload to Sarvam STT on stop
- Display diarized transcript (Doctor / Patient colour-coded)
- ✅ Done when: you can record Hinglish speech and see a labelled transcript

### Phase 2 — Structuring (Gemini Call #1)
- Send transcript to Gemini, get structured entity JSON back
- Display entity summary card in app
- ✅ Done when: structured JSON is correct on 5 test transcripts manually checked by your medical co-founder

### Phase 3 — Reasoning (Gemini Call #2)
- Build guideline text block with your medical co-founder (30-50 relevant excerpts, plain text)
- Send entities + guideline system prompt to Gemini
- Parse differential JSON, render in UI with evidence-tap feature
- ✅ Done when: tapping a differential shows the transcript quote and guideline quote it came from

### Phase 4 — Photo + Records
- Camera capture + file upload (expo-image-picker)
- Upload to Supabase Storage, convert to base64, pass into Gemini Call #2
- ✅ Done when: attaching a wound photo changes the differential output meaningfully

### Phase 5 — TTS (optional, cut if needed)
- Button to read out diagnosis summary via Sarvam Bulbul API
- ✅ Done when: tap button, hears Hindi or English readback of top differential

### Phase 6 — Demo polish
- Script the exact 4-minute demo flow
- Make that exact path bulletproof
- Add DEMO DATA watermark everywhere so it's clear no real patients are involved

## What NOT to build
- No RAG, no vector DB, no embeddings
- No fine-tuning
- No EMR / ABDM integration
- No real auth (mock login is fine for demo)
- No multi-specialty (pick ONE with your co-founder and go deep on it)
- No offline mode

## Folder structure
```
/app
  /(tabs)
    index.tsx          -- home / start consult
    consult.tsx        -- active recording screen
    review.tsx         -- transcript + entity summary
    diagnosis.tsx      -- differential + evidence-tap UI
  /components
    TranscriptView.tsx
    EntityCard.tsx
    DifferentialCard.tsx
    EvidenceModal.tsx
  /lib
    sarvam.ts          -- STT + TTS API calls
    gemini.ts          -- Call #1 and Call #2 wrappers
    supabase.ts        -- storage client
    guidelines.ts      -- exports the guideline text block as a const string
  /types
    clinical.ts        -- TypeScript types for all JSON schemas above
```

## Key implementation notes for Claude Code
- Audio: use `expo-av` for recording. Record in WAV or MP3 (check Sarvam's accepted formats first). Buffer locally before upload — do not stream to Sarvam mid-consult.
- Sarvam STT endpoint: `POST https://api.sarvam.ai/speech-to-text` with `model: saaras:v2` and `with_diarization: true`
- Gemini: use `@google/generative-ai` npm package. For Call #2 with images, use the `inlineData` format for base64 image parts.
- Parse Gemini output defensively — strip any markdown fences before JSON.parse(), wrap in try/catch, show a graceful error if JSON is malformed rather than crashing.
- All Gemini and Sarvam calls go through `/lib` — never call APIs directly from screen components.
