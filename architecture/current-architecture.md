# Current architecture (as built)

MVP flow for Second Opinion, per `CLAUDE.md`. Single vertical: acute febrile illness (dengue / typhoid / malaria).

## Pipeline

1. **Audio capture** — consult recorded on-device, 7s chunks for live UI.
2. **STT — live** — Sarvam Saaras v3, `codemix` mode, chunked batch calls. Real, working.
3. **STT — diarization pass** — on stop, a Sarvam Batch API pass re-attributes the full transcript by speaker (sync API has no diarization). Swaps in on the Review screen; live view keeps an alternating-speaker heuristic until the batch pass lands, and on any batch failure.
4. **Gemini Call #1 — structuring** — turns raw transcript into `StructuredEntities` (symptoms, duration, history, meds, observations).
5. **Gemini Call #2 — tiered differential** — produces tiered DD (most likely / expanded / can't-miss) with citations, red flags, suggested workup. Takes structured entities + optional photo input (`inlineData`).
6. **Gap detection + alignment** — same Gemini call as #2: compares structured entities against a hard-coded febrile-illness checklist (travel, rash, bleeding, urination, hydration, fever pattern, exposure) → "not yet ruled out" items; alignment framing never grades the doctor, leads with agreement.
7. **Near-real-time suggestion cards** — every 3–4 chunks (~25s) during the consult, a lightweight Gemini call on the accumulated transcript + checklist → 0–2 suggested questions, dismissible, deduped. Not streaming — polling-style, latency budget 2–3s.
8. **Audio-linked evidence** — every `TranscriptLine` maps to `(chunkId, offsetMs)`; tap a line or a differential's citation → play the underlying audio clip.
9. **Clinician feedback** — thumbs up/down + comment per differential, stored locally.

## Screens

Landing → Patients → Consult → Review → Diagnosis, all restyled to the "clinical calm" design system (light theme; entry/auth surfaces are the one deliberate dark exception).

## Storage / backend

- Auth: better-auth (email/password) against Neon Postgres, via Expo Router API routes (`app/api/auth/[...all]+api.ts`). Real, verified end-to-end.
- Clinical data (patients, consults, transcript lines, diagnoses, feedback) is **still in-memory only** — does not survive app restart.
- Photo input is wired into Gemini Call #2 but the Supabase storage upload + TTS (Bulbul) integrations are coded, not wired.
- **Known flaw:** `EXPO_PUBLIC_*` env vars ship vendor keys (Sarvam, Gemini) in the client bundle. No backend proxy yet — everything calls Sarvam/Gemini directly from the app.

## Reliability

Vendor-call timeouts (structuring 30s / DD 60s / suggestions 15s / chunk STT 20s) surface as retryable error cards — never an infinite spinner.

## Not built yet

- Backend proxy removing client-side vendor keys.
- Persistent clinical-data storage (Supabase/Postgres tables beyond auth).
- Consent capture + ephemeral-audio retention policy (DPDP posture).
- Verified guideline content (currently 8 placeholder excerpts, unverified — owned by the clinical co-founder, parallel workstream).

See `docs/VITALIS_HANDOFF_CONTEXT.md` and `docs/architecture-map.html` for the fuller narrative history behind these decisions.
