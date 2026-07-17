# CLAUDE.md — Second Opinion

## What this is
Ambient clinical second-opinion assistant for Indian OPDs. Records the
doctor–patient consult, transcribes Hinglish (Hindi–English code-mix) live,
and generates a cited, tiered differential-diagnosis draft the doctor reviews
and signs off. Always a draft — never a final diagnosis. The clinician is the
final authority in every flow.

Clinical scope: **acute febrile illness** (dengue / typhoid / malaria). One
vertical, deep. No multi-specialty work in this build.

Build goal: an MVP that **looks and feels like a finished medical product** —
demo-ready for incubation/investor pitches and doctor feedback pilots. Visual
quality is a first-class requirement, not polish at the end.

## Positioning
> AI scribes write down what happened. We catch what didn't.

Defensible order: (1) auditable linked audio evidence, (2) Hinglish code-mix →
structured English proforma, (3) gap detection, (4) deferential
second-assistant tone.

---

## Current state (honest, as built)

| Layer | Status |
|---|---|
| Expo SDK 56, RN 0.85, React 19, TS strict, Expo Router, zustand | ✅ |
| Styling: Tailwind v4 / NativeWind v5 / react-native-css (replaced StyleSheet) | ✅ |
| STT: Sarvam Saaras v3, `codemix`, 7s chunked batch | ✅ Real |
| LLM: Gemini 2.5 Flash — Call #1 structuring, Call #2 tiered DD + citations | ✅ Real |
| Screens: Landing → Patients → Consult → Review → Diagnosis | ✅ Functional |
| UI quality (item 0: tokens, shared kit, all screens restyled) | ✅ To spec |
| Speaker diarization (item 1: Sarvam Batch pass after stop + Gemini role attribution, swaps in on Review; live view keeps the alternating heuristic until it lands, and on any failure) | ✅ Real, safe fallback |
| Audio-linked evidence (item 2: tap line / differential → play chunk) | ✅ |
| Gap detection, alignment, suggestion cards, feedback (items 3–6) | ✅ |
| Photo input to Gemini Call #2 (item 7) | ✅ Wired |
| Vendor-call timeouts (structuring 30s / DD 60s / suggestions 15s / chunk STT 20s) → retryable error cards, never infinite spinners | ✅ |
| Backend / API layer (item 8) | ⚙️ Started — Expo Router API routes (`web.output: "server"`), not a separate server |
| Auth: better-auth (email/password) against Neon, via `app/api/auth/[...all]+api.ts` | ✅ Real — sign-up/sign-in verified end-to-end |
| Persistence (item 8) | ⚙️ Neon Postgres provisioned + auth tables live; clinical data (patients/consults/etc.) still in-memory only |
| Consent capture + retention policy (item 9) | ❌ Not built |
| Guidelines content | ⚠️ 8 placeholder excerpts, unverified |
| Supabase storage upload, TTS (Bulbul) | ⚙️ Coded, not wired |

Known flaw: keys ship in client via `EXPO_PUBLIC_*`. Fixed by item 8.

## Architecture rules (non-negotiable)
- All vendor calls isolated in `/src/lib`. Screens never call APIs directly.
- All LLM output typed (`/src/types/clinical.ts`), defensively parsed
  (strip markdown fences, try/catch). No untyped JSON reaches a screen.
- Every AI claim carries `transcript_reference` and, where applicable,
  `guideline_reference`. Uncited output is a bug.
- Gemini stays for this build. Model migration/fine-tuning is roadmap, not now.
- DEMO watermark stays until real-patient compliance work exists — restyle it
  (see design system) but never remove it.

---

## DESIGN SYSTEM — applies to every screen, every item. This is the spec.

The bar: a doctor should believe a funded team with a designer built this.
No default React Native look. No dashboard-template look.

### Direction: "clinical calm" — LIGHT theme only
Precision-instrument feel. Quiet, warm, trustworthy. Not startup-neon, not
hospital-sterile. **No dark theme, no dark mode toggle — light only.**

**Scoped exception: the auth flow (`sign-in.tsx`, `sign-up.tsx`) is dark.**
Explicit, deliberate call (not a drift) — matched to a reference screenshot,
tokens in `global.css` under `night-*`, components in
`src/components/night-ui.tsx`, fully separate from the light `ui.tsx` kit.
Every clinical screen (Landing onward, once past auth) stays light-only per
the rule above — this is not a precedent for dark-mode-ing the rest of the
app. Flag any drift outside `sign-in.tsx`/`sign-up.tsx` as a bug.

Glass accents (expo-blur), restricted to exactly three surfaces:
1. Consult sticky header — translucent + blur, chat scrolls beneath it
2. Evidence bottom sheet — blurred backdrop behind the sheet
3. In-consult suggestion cards — slight translucency (`rgba(255,255,255,0.85)`
   + blur) over the chat
Everywhere else: solid white cards on off-white. No blur on lists, buttons,
or full screens — blur is expensive on mid-range Android and stacked
translucency looks cheap. If a fourth glass surface appears, that's a bug.

### Tokens — Tailwind, not StyleSheet (no inline hex outside the two exceptions below)
Styling runs on **Tailwind v4 / NativeWind v5 / react-native-css**, not RN's
`StyleSheet.create`. Source of truth for every token is `src/global.css`'s
`@theme` block — colors, radius, and the type scale are custom Tailwind
theme keys (`bg-accent`, `rounded-card`, `text-title`, etc.), not JS constants.
Screens/components that need `className` support import `View`/`Text`/
`Pressable`/`ScrollView`/`TextInput` from **`@/tw`**, never straight from
`react-native` — those are the only primitives `react-native-css` can style
via `className` (see `src/tw/index.tsx`).

- Background: warm off-white `bg-bg` (`#FAF9F6`); cards `bg-card` (`#FFFFFF`)
- Ink: primary text `text-ink`; secondary `text-ink-secondary`
- Accent (one): deep teal `bg-accent` / `text-accent` (`#0F6E6B`) — actions, active states, links
- Tier colors (muted, not traffic-light): `text-tier-most-likely` teal /
  `text-tier-expanded` ochre / `text-tier-cant-miss` oxblood — used as thin
  left-border + small label chip, never full card fills
- Semantic: red-flag banner `bg-red-flag-bg` with `text-red-flag-text`
- Radius: cards `rounded-card` (16), buttons `rounded-button` (12), chips `rounded-full`
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 — this is Tailwind's default scale
  at multiples of 4 (`gap-1`…`gap-8`), so use the standard utilities directly;
  no arbitrary spacing values.
- Shadows: one subtle elevation only, `shadow-card` (y=2, blur=8, 6% opacity).
  No stacked heavy shadows.
- Type: `text-title` / `text-body` / `text-secondary` / `text-caption` /
  `text-overline` — each a paired Tailwind size+line-height token (28/17/15/13,
  line-height 1.4). Titles semibold, never black-weight.
- Icons: lucide-react-native only. No emoji anywhere in UI. Icon `color` props
  and React Navigation header options (`_layout.tsx`) are the two legitimate
  places raw hex/`src/theme/index.ts` constants still apply — Tailwind
  `className` doesn't reach non-JSX native config or icon props. `src/theme/
  index.ts`'s values must stay in sync with `global.css`'s `@theme` block.
- **Dynamic colors stay inline, never a template-literal className.** A prop
  like a tier's arbitrary hex (`Chip`'s `tint`/`soft`, `Card`'s `accent`) is
  passed as `style={{ color: tint }}`, not interpolated into a class string —
  Tailwind's static scanner can't generate a rule for a value it can't see as
  a literal. Static, finite-enum styling (a `variant` prop, a boolean `active`
  state) is fine as a conditional className because every branch is a
  complete literal string somewhere in the file.

### Motion
- Screen transitions: default stack slide, nothing custom.
- Micro only: pressed-state scale 0.98, card entrance fade+4px rise (150ms,
  staggered 40ms), recording indicator = soft opacity pulse (no bouncing).
- Nothing loops except the recording pulse.

### Component rules
- One `Card`, one `PrimaryButton`, one `Chip`, one `SectionHeader` component —
  reused everywhere. If a screen invents its own variant, that's a bug.
- Empty states designed (icon + one line + action), never blank.
- Loading = skeleton cards, never bare spinners.
- Error = inline card with retry, never Alert.alert.

### Per-screen redesign (part of the build, not optional)
- **Landing**: full-bleed calm intro, product name, one-line value prop,
  single CTA. Restyle DEMO watermark into a slim top ribbon (amber `#B7791F`
  on `#FDF6E9`) — legible, not screaming.
- **Patients**: list of patient cards (avatar-initials circle, name, age/sex,
  chief complaint line, last-consult timestamp). FAB for new patient.
- **New Patient**: form with floating labels, segmented control styled to
  token spec, single screen, keyboard-safe.
- **Consult**: chat bubbles — Doctor left (white card), Patient right (teal-
  tinted `#EAF4F3`), speaker chip on first bubble of each run, timestamps
  subtle. Sticky header: patient name + timer + pulsing record dot. Suggestion
  cards (item 5) slide in above input area, dismissible.
- **Review**: transcript continues chat styling; entity summary as a grid of
  labeled chips (symptoms / duration / history / meds / observations), not a
  JSON-ish dump. Primary CTA "Analyze".
- **Diagnosis**: tier sections with SectionHeaders; DifferentialCard = tier
  border + chip, diagnosis name, 2-line reasoning preview, evidence count
  badge, accept/dismiss as icon buttons. Red-flags banner pinned top.
  Suggested workup as checklist card. Evidence modal = bottom sheet: quote
  blocks with play buttons, guideline excerpt in bordered block with source
  label.

---

## Build items — locked order

### 0. Design foundation
- `/src/theme` tokens + the four shared components + skeleton/empty/error
  patterns. Restyle ALL existing screens to spec above.
- Accept: side-by-side before/after; no inline colors anywhere; every screen
  passes the "funded team built this" eyeball test.

### 1. Real speaker diarization
- Sarvam **Batch API** (sync has no diarization). Keep 7s chunks for live UI;
  on stop, run batch pass that re-attributes the full transcript.
- Accept: rehearsed 2-person Hinglish consult → ≥90% lines correctly attributed.

### 2. Audio-mapped linked evidence (THE demo feature)
- Persist chunks with `(chunkId, startMs, endMs)`; map every `TranscriptLine
  → (chunkId, offsetMs)`.
- Tap transcript line → play clip. Evidence bottom-sheet: play button per
  quote; show ALL contributing evidence per differential.
- Accept: tap a differential → hear the patient say the triggering symptom.

### 3. Gap detection (post-consult)
- Compare `StructuredEntities` vs hard-coded febrile-illness checklist
  (travel, rash, bleeding, urination, hydration, fever pattern, exposure).
- Type: `{ missedItem, whyItMatters, suggestedQuestion }[]`.
- Renders as "Not yet ruled out" section, styled to spec.
- Accept: consult omitting travel history → "Cannot rule out malaria — no
  travel history asked. Suggested: …"

### 4. Alignment layer (same Gemini call as item 3)
- Prompt rules verbatim: never grade the doctor; lead with agreement where
  direction matched guidelines; frame additions as "additionally consider…";
  second assistant, not teaching doctor.
- Renders as "Assessment alignment" section below gap detection.

### 5. Near-real-time suggestion cards
- Every 3–4 chunks (~25s), lightweight Gemini call: accumulated transcript +
  checklist → 0–2 suggested questions. Dismissible cards, deduped.
- Latency budget 2–3s. Explicitly NOT WebSocket streaming — roadmap.

### 6. Clinician feedback capture
- Thumbs up/down + optional comment per differential. Local now, syncs in 7.

### 7. Photo / prior-records input (already coded in gemini.ts)
- Wire expo-image-picker capture → Supabase storage → base64 inlineData into
  Call #2. Attachment thumbnails on Review screen.
- Accept: attaching a relevant image meaningfully changes the differential.

### 8. Backend proxy + persistence
- Thin API (Hono / Vercel functions) proxying Sarvam + Gemini; all
  `EXPO_PUBLIC_*` secrets removed from client.
- Supabase Postgres: patients, consults, transcript_lines, diagnoses,
  feedback + storage bucket for chunks/attachments. RLS on from day one.
- Accept: kill and reopen app → patients and past consults survive.

### 9. Ephemeral-audio policy (DPDP posture)
- Consent capture at consult start (persisted, timestamped). On sign-off:
  delete raw full audio, retain text + referenced evidence clips only.
- Document in `RETENTION.md` (one page — pitch asset).

---

## Pitch ledger — what can be SHOWN vs SAID

**SHOW (live in demo):** Hinglish live transcription · tiered cited
differentials · tap-to-hear linked evidence · red flags · suggested workup ·
gap detection · alignment · in-consult suggestion cards · photo input ·
polished UI throughout.

**SAY (roadmap slide, labeled as funded milestones — never imply live):**
true streaming STT (sub-second suggestions) · fine-tuned open-weight models
on clinician-validated Hinglish transcripts (the honest "own model" path —
requires MVP-generated data first) · ABDM / EMR (FHIR) export · prescription
generation · drug-interaction flagging · multi-specialty · TTS readback.

**NEVER (killed):** dedicated hardware device / mic arrays / jog dials /
e-ink · edge-offline processing / local LLMs · training an LLM from scratch ·
US-centric billing codes, prior-auth, trial matching.

Rule: if a panel says "show me that" about anything in SHOW, the app must
survive it. Anything that can't survive it moves to SAY before the pitch,
not after.

---

## Demo script (rehearsed only — never improvise the consult)
1. Landing → Patients → new patient (shows form polish)
2. Scripted ~90s Hinglish consult, two speakers — suggestion card appears mid-consult
3. Stop → Review (entity chips) → Analyze → Diagnosis
4. Tap top differential → bottom sheet → **play the audio clip** ← the moment
5. "Not yet ruled out" → the malaria / travel-history gap
6. Alignment section, feedback thumbs, photo attachment if time
7. Close: "N doctors begin structured feedback pilots [month]" — real number only

## Parallel workstream (non-blocking for items 0–9)
Verified guidelines: replace the 8 placeholder excerpts with NVBDCP/WHO
dengue-typhoid-malaria content, clinician-reviewed. Owned by the clinical
co-founder. Blocks real-doctor pilots, not this build.

## Repo
`github.com/krishpinto/SecondOpinion`, branch `main`. `.env` gitignored,
`.env.example` documents vars. Legacy MVP spec superseded by this file.