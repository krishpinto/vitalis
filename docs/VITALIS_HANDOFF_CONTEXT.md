# VITALIS — Complete Project Context & Handoff Document

> **Purpose:** Full context transfer so a new team member can work on Vitalis with zero prior knowledge. Compiled July 17, 2026 from every conversation, document, and decision made so far. Read top to bottom once; then use it as a reference.
>
> **Where things stand right now (July 17, 2026):** The team pitch to the three helpers happened the evening of **July 15**. The investor/grant pitch is **Sunday, July 19** (target: ₹5–6 lakh grant). Case-study research is due in stages through **Saturday noon**. Everything below feeds those two events and the MVP build after.

---

## 1. What Vitalis Is

An ambient clinical documentation + decision-support product, **India-first**, for individual doctors in OPD (outpatient) settings. The app:

1. **Listens** to the doctor–patient conversation in real time during the consult (ambient — no typing).
2. **Transcribes** it with speaker diarization (who said what).
3. **Builds a structured clinical proforma** automatically — *adaptive*: the template changes based on the presenting complaint (chest pain → cardiac template, abdominal pain → GI template, etc.).
4. **Suggests a ranked differential diagnosis (DDx)** on top of the structured proforma — live during the consult (including suggested follow-up questions while the patient is still in the room) AND as a post-consult structured summary.

**Positioning, locked in:** this is **clinician-facing decision support, NOT autonomous diagnosis**. The DDx is shown only to the doctor, never the patient; the doctor is the final decision-maker on everything. This is simultaneously the safety choice, the regulatory choice (keeps us out of CDSCO SaMD diagnostic-device territory), and the honest pitch framing.

**Scoped product in one paragraph:** a real-time clinical reasoning layer for individual Indian doctors in OPD settings — transcribes the consult, builds an adaptive proforma, surfaces traceable severity-ranked differentials live plus a structured post-consult summary — standalone at first, designed from day one to push structured output into existing EMR/HMS systems via API as the B2B expansion, DPDP/ABDM-compliant.

**One-sentence close used in pitches:** *"We're not asking anyone to trust a black box with a diagnosis — we're handing the doctor back their own reasoning, organized and cross-checked, with them as the final word every time."*

---

## 2. The People

### Founders
- **Krish Pinto** — co-founder, 50/50. Final-year B.Tech CS, FCRIT Mumbai. Technical lead: owns architecture, prototype, pipeline, UI, research orchestration. Full-stack background (Next.js 14, TypeScript, App Router, AI-assisted tooling). Won a major hackathon with an on-device Android scam-detection system (relevant precedent: on-device inference for a privacy-sensitive task). Referred to as **"Person 1"** in `vitalis_full_context.md`.
- **Girik** — co-founder, 50/50. Brings contacts and does pitch intros/openings; secured the MAMC MIC / SMR meeting and the Sunday investor meeting. His chat history is summarized in `Vitalis_Chat_Context_Summary.md`.

### The planned core team (from the original 3-person plan)
- **Person 2 — Clinical lead:** MBBS student, research scholar, experienced in medical research/manuscripts. Owns: DDx framework, clinical validation, roleplay sample consults, regulatory/trust framing, plays the doctor in the live demo.
- **Person 3 — Data science lead:** data scientist at CVS in Chicago (Person 2's brother), part-time (evenings/weekends, ~5–8 hrs/week realistic). Owns: scoring formalism (turning the clinical framework into precise math), calibration against sample consults, eval summary for the pitch.
- **Dependency chain:** Person 2's DDx framework must reach Person 3 by day 2–3 of week 1. Person 2's roleplay recordings + pre-written sealed ground truth must exist early in week 2 for Person 3's calibration and Krish's UI testing.

### Sprint contributors (onboarded July 15, working through Sunday July 19)
- **Ethan** — full stack. Assigned: Sunday demo capture path (WS server on Railway + Deepgram streaming + live transcript screen) + case studies of **EkaScribe** (top priority) and **Glass Health**.
- **Amaanvi** — ML. Assigned: pull published clinical scoring rules (HEART, Wells, TIMI) for chest pain and draft the template weights table, every weight citing its paper + case studies of **Freed** and **Heidi Health**.
- **Rishab** — ML. Assigned: knowledge base — first 100–200 chunks from StatPearls + WHO/ICMR STGs for chest pain so RAG has something to cite + case studies of **Sunoh.ai**, **UpToDate** (lighter, as citation benchmark), and a broad sweep for any other India/Asia ambient scribe.
- **Krish:** templates, extractor prompts, scoring engine code, integration.

### Others
- **Hackathon team (separate from all of the above):** Sara, Zunaira, Archi — built the hackathon prototype (clinical-criteria verification for insurance claim denials in breast cancer care).
- **Doctor advisor:** a doctor who attends many foundations/incubators; reviewed the concept via handwritten notes (see §10). Also flagged EkaCare as a competitor. Budgeted an honorarium for template design, weight sign-offs, and pilot supervision.

### Sprint contributor terms (agreed July 15)
Each contributor receives **2% of whatever grant lands** (at ₹6L, ₹12,000 each) as a freelance fixed fee for research + prototype help through Sunday July 19. Equity is not part of this arrangement. If the grant lands, paid roles are formalized first; equity becomes a real conversation at the seed round for those still building.

---

## 3. Timeline & Key Dates

| Date | Event |
|---|---|
| July 15, 2026 (8:30 PM) | Team pitch to Ethan, Amaanvi, Rishab — architecture walkthrough, terms, research assignments |
| Wed July 16, 9 PM | Check-in: snapshot + feature inventory done for each person's first product |
| Thu July 17, 9 PM | First case-study product complete including live test |
| Fri July 18, 9 PM | Second product complete; full drafts in shared folder |
| Sat July 18, 12 noon | Case studies locked; afternoon: compile pack + comparison table |
| **Sunday July 19** | **Investor/grant pitch — ₹5–6L target** |
| End of July 2026 | Investor demo (the original 3-week MVP deadline) |
| Nov 2026 / May 2027 | DPDP Act soft / hard enforcement deadlines (market timing argument) |

### The 3-week MVP plan (for the end-of-July demo)
- **Week 1 — core loop, batch, one template (chest pain):** STT via managed API (Deepgram/AssemblyAI — built-in diarization) → LLM extraction into structured proforma schema → DDx layer. Test on 2–3 rough recordings. Person 2 hands DDx framework to Person 3 by day 2–3, records first roleplay consults day 6–7.
- **Week 2 — pseudo-real-time + UI + calibration:** chunked processing, doctor-facing UI (proforma panel filling in live + ranked DDx list with traceable fields), Person 3 tunes scoring against ground truth, full integration test end of week.
- **Week 3 — harden only, no new features:** accent testing, backup recorded demo video (live-audio demos fail — always have a fallback), eval summary, then 3-pass rehearsal: (1) dry-run mechanics, (2) full performance run with roles, (3) adversarial run. Day 7 = buffer.
- **Rule:** if behind, cut UI polish before cutting core-loop correctness.
- **Demo strategy:** do NOT build true real-time streaming for the demo. Batch pipeline first, then chunked pseudo-real-time (process audio every few seconds, update UI incrementally — looks live, dramatically easier). Be honest with investors that true streaming is the post-funding roadmap.
- **Demo roles:** Person 2 plays doctor (clinically credible), fields clinical/regulatory questions. Krish drives the laptop, narrates architecture, fields technical questions. 4–6 minute demo segment; rehearse the handoff to the backup video so it doesn't look like damage control.
- **Sunday-demo build note:** Sunday's demo is the **BATCH pipeline** — recorded audio uploaded over plain HTTP. The WebSocket path is pseudo-realtime-phase work; don't spend the sprint days on it.

---

## 4. The Two USP Threads (how they merged)

The project has two research lineages that merged into one pitch:

**Thread A (Girik's chats — `Vitalis_Chat_Context_Summary.md`):** the **denial-resistant claims documentation** angle. Backed by the hackathon prototype (clinical-criteria verification for breast cancer claim denials, built by Sara/Zunaira/Archi) and India claims-denial data. Ranked USPs from that thread: (1) **Denial-Resistant Note Structuring** — notes structured around what a specific payer requires *before* submission (validated for ONE case only — breast cancer — framed honestly as "built to generalize"); (2) Evidence-Linking / Audit Trail; (3) In-Visit Prompting; (4) Adaptive Templates. Explicit non-claims: real-time transcription is table stakes, not a USP; no WHO-"compliance" claims without certification ("designed to track evolving clinical guidelines" instead); no "better judgement" phrasing (liability risk — reframed as "flags what a rushed clinician might miss").

**Thread B (Krish's chats — `vitalis_full_context.md`):** the **live, traceable, severity-ranked DDx reasoning layer** angle, with chest pain as the first vertical slice. This is the thread the architecture, scoring engine, and Sunday pitch are built on.

**Primary USP as pitched now:** traceable, severity-aware differential reasoning. *"The only ambient clinical tool that shows its work — every differential traceable to the exact words that suggested it, ranked the way real triage logic actually works, built for how Indian consults actually sound."*

Supporting angles: (a) real-time **during** the consult vs post-hoc — catch the missed red-flag question while the patient is still in the room; (b) adaptive proforma vs fixed templates; (c) India-first STT — Indian accents + Hindi-English code-switching mid-sentence, unaddressed by incumbents.

**Market-split framing:** the market split into tools that **document** (Doximity, Freed — commoditized, price war) and tools that **reason** (Glass Health). Vitalis is in the reasoning tier with sharper traceability + real-time + India.

**Avoid:** "AI that diagnoses patients" framing — regulatory red flag, reads naive to clinically literate investors. **Tactic:** raise Glass Health / Freed / EkaScribe YOURSELF before the investor does.

**One-sentence answer to "what do you do that Freed/EkaScribe don't":** *"They document what was said — we reason about it, live: a cited, severity-ranked differential on the doctor's screen during the consult, built India-first for Hinglish and DPDP."*

---

## 5. Why Chest Pain First

Chest pain is NOT the product — it's the proof-of-concept template for the adaptive-proforma architecture. Chosen because: (a) clean, well-established differential (5–6 conditions cover most presentations); (b) genuine "can't-miss" dangerous tier alongside benign causes — exactly where severity-weighted ranking visibly beats naive keyword matching; (c) universally understood by demo audiences; (d) high-volume OPD/ER complaint = credible wedge. Post-demo roadmap: generalize template selection to more complaints (adding a vertical = writing more registry rows with clinical advisors, not re-engineering).

---

## 6. The Architecture (v1.0 — the 22-block map)

Rendered in `architecture-map.html` (dark flowchart) and `architecture-doc.html`. Summary of every block:

**Capture row:**
1. **DPDP Consent** — one-tap per-consult patient consent captured before any recording; stored as a column on the consult row with timestamp. Patient refuses → consult proceeds without Vitalis. (Recording without consent = DPDP violation, penalties up to ₹250 crore.)
2. **Next.js PWA** — the doctor's app; browser mic via Web Audio API at 16kHz; client chops audio into ~1s frames queued in a local ring buffer (survives Wi-Fi drops — frames flush on reconnect). One codebase for phone + laptop; no app store friction.
3. **Silero VAD** — ~2MB MIT-licensed voice-activity-detection model running in-browser (ONNX). A **gate, not a filter**: silence never leaves the device → we don't stream or pay to transcribe silence. <1ms per frame.
4. **WS Gateway** — plain **`ws` npm package** on a custom Node server (Railway/Render/EC2 **Mumbai**). Deliberately dumb: authenticate, tag with consult ID, forward frames to STT, survive reconnects. NOT Next.js API routes — serverless can't hold long-lived connections at all (that's *why* it's a custom Node server). Not Socket.IO/Pusher — wrong shape for one-directional binary audio. Scale path: split into its own thin Node service — ops decision, not architecture change.
5. **Streaming STT + Diarization** — managed API at MVP (**Deepgram / AssemblyAI / Sarvam**, benchmarked on our own recordings; ~300ms latency; word-level timestamps + diarization built in). Only **final** (not interim) segments feed downstream. Diarization outputs speaker 0/1 via voiceprint clustering — it does NOT know who's the doctor. Raw audio **deleted post-transcription** (Freed-style data-minimal default — privacy + liability win). Phase-2 swap target: self-hosted **AI4Bharat-class** models (IndicConformer/IndicWhisper) on Mumbai servers. (Vakyansh = dormant, don't build on it; Bhashini = govt hosted API, name-drop only; Sarvam = commercial hosted but Indian company → best managed option for the DPDP story.)
6. **Role Resolver** — turns speaker 0/1 into doctor/patient with **no trained model**. Primary: voice enrollment — doctor reads one sentence at signup → stored voiceprint → cosine similarity against speaker clusters (a measurement, not a guess). Backup: weighted heuristics voting per turn — question density, clinical vocabulary, first-person symptom language ("*mujhe* dard hai" → patient), conversation structure. Roles lock within ~3–4 exchanges; doctor can flip with one tap. Third voices (relatives) → labeled "other," never treated as patient history unless reassigned.
7. **Rolling Transcript Window** — every 3–5s cycle processes only the last ~60–90s of finalized transcript + current form state ("what changed?"), not the whole consult. Full transcript still stored.

**Reasoning row (narrate with the running example — 52-year-old man, pressure on chest radiating to left arm while climbing stairs, sweating):**
8. **Complaint Classifier** — one cheap constrained LLM call on the first ~60s → `{complaint: "chest_pain", confidence: 0.97}` from a **fixed label list** (can't invent templates). Low confidence → general template; mid-consult contradiction → re-classify, proforma migrates.
9. **Template Registry** — a filing cabinet: DB table of versioned JSON schemas (fields, types, feature weights). Zero intelligence, pure lookup. The *adaptive* part is genuine IP; the registry makes adding vertical #2…#10 a content problem, not engineering.
10. **Extractor (LLM)** — the clerk, **the most misunderstood block**: not a diagnostician, not connected to RAG. Receives transcript window + template schema + current form state → returns **only changed fields (diffs)** as JSON, temperature 0, structured-output mode. Hard rules: never infer what wasn't said, never fill a field without its quoted transcript span, never comment. Diffs mean the UI doesn't jump, backtracking corrects fields instead of duplicating, and calls are cheaper. Why an LLM at all: "someone sitting on my chest" → `character: pressure` — mapping messy language into a fixed schema is the one job LLMs do reliably; judgement is exactly what's never asked of it.
11. **Proforma State** — the filled form; each field = value + transcript span + timestamp + confidence; small state machine merges diffs. Field-level provenance falls out of the schema for free — "tap a field, see the exact words." The **ONLY input to reasoning — never the raw transcript**.
12. **Severity Constants** — fixed clinical danger multipliers (dissection ≈2.0×, ACS ≈1.8×, GERD 1.0×) in a **versioned DB table**: author, citation, changed only through clinical review — never invented per-call by any model.
13. **Scoring Engine** — pure deterministic math, no model call, <50ms: for each candidate condition, weighted sum of matched proforma features (high/med/low weights, NOT raw count) × severity constant, normalized. Same form in → same ranking out, forever. Lineage: DXplain (Mass General, since **1987**), Isabel, Internist-1/QMR. **The key worked example:** naive matching — musculoskeletal pain 4/4 features = 0.9 beats early aortic dissection 2/5 = 0.5 → clinically backwards, potentially fatal. With severity: 0.9×1.0 = 0.9 vs 0.5×2.0 = 1.0 → the killer stays above the fold. That's real triage logic.
14. **Red-Flag Screen** — a **fixed list of can't-miss conditions scored on every pass regardless of evidence** (chest pain: ACS, dissection, PE, tension pneumothorax, tamponade). Thin evidence → shown as `insufficient_data` with a reason that doubles as a live prompt ("you haven't asked about recent immobilization" — the strongest live-demo moment the product has). NOT "score too high → red flag" — it's the guarantee killers never silently drop off. *"The ranked list shows what's likely; the red-flag screen guarantees what's lethal stays visible. Different lists."*
15. **RAG Citation Layer** — runs AFTER ranking, never instead of it. Clinical reference content chunked + embedded into `kb_chunks` (pgvector in Postgres); per ranked differential, similarity search attaches the best **quoted passage + source** — never generated text. KB sources (all ~free): **StatPearls** (NCBI Bookshelf, attribution), **WHO + ICMR Standard Treatment Guidelines** (the India-first credibility layer), **SNOMED CT** (free in India via NRCeS national license), **ICD-10/11**, **UMLS** (free NLM license). "Acquiring a KB" = licensing + ingestion, not authorship. MVP KB: 100–200 hand-curated chunks for the 9 chest-pain conditions — a day of ingestion.
16. **DDx Payload** — the output contract: ranked differentials + supporting AND **contradicting** fields + red-flag statuses + `missing_fields_that_would_help`. Three deliberate choices: contradicting evidence shown (doctors trust systems that argue against themselves), red flags always present even as insufficient_data, missing-fields = live coaching for better history-taking. Full JSON schema in §7 below.

**Output row:**
17. **Doctor UI** — glanceable side panel; proforma fills quietly; ranked DDx the doctor pins/dismisses; gap prompts. Hard rules: ≤6s utterance-to-screen · doctor-only, patient never sees it · **nothing ever auto-inserted into the record** (regulatory positioning enforced by design, not disclaimer). "The UI's job is to be ignorable."
18. **Post-Consult Job** — async final summary + note via **pg-boss** (job queue inside Postgres — jobs are rows, transactional claims, built-in retries; no Redis).
19. **EMR Push Adapter** — the B2B path: transforms final proforma + note into **FHIR**-shaped resources (Encounter/Observation/Condition), pushes into existing EMR, every push logged in `emr_push_log`. Demo against **OpenMRS / OpenEMR / Bahmni** (open-source; Bahmni is Indian, deployed in real Indian hospitals) → prove EMR integration with zero hospital partnerships. "We are a layer, not an EMR." (Contrast: Freed's Chrome-extension overlay that breaks on EMR updates.)
20. **Postgres (one engine)** — one managed Postgres in **ap-south-1 (Mumbai)**, Drizzle ORM, doing triple duty: relational tables + vectors (pgvector) + queue (pg-boss). Tables: `consults`, `transcript_segments`, `proforma_fields` (span+timestamp), `differentials` (+citation refs), `severity_constants` (versioned), `kb_chunks`, `emr_push_log`. One backup story, one compliance surface, data residency from day one. "Choosing Pinecone at our scale is résumé-driven architecture."
21. **Eval Harness** — roleplay consults recorded; expected proforma + top-3 differentials written and **SEALED before** the pipeline ever runs on the audio (can't grade generously). Every pipeline change replays the set; regressions block release. "We don't grade our own homework. The answer key is written before the test."
22. **Swap Path** — the deployment spectrum answering every privacy/cost/scale question: LLM: **Gemini API (now)** → self-hosted MedGemma/Meditron on vLLM, Mumbai (post-funding) → on-device quantized (strictest tier, extraction-only). STT: managed Deepgram/AssemblyAI/Sarvam (now) → self-hosted AI4Bharat-class (post-funding). Because the LLM only extracts into a schema and STT sits behind an interface, every rung is a **config change, not a rebuild**. "Privacy isn't a feature we'll add later. It's why the endpoints are config."

**The one-line separation of concerns:** *The extractor fills the form. The scoring engine ranks the conditions. The RAG attaches the receipts. The LLM never ranks, and the math never guesses.*

**The recommended composition (where the novelty lives):** LLM does extraction ONLY → deterministic weighted scoring engine (DXplain/Isabel lineage) ranks → RAG citation layer grounds each differential. Every piece exists in production somewhere; **the composition is ours**.

---

## 7. The Chest-Pain DDx Framework (the clinical spec)

### Tier 1 — Red flags (always screened, high severity multiplier)
| Condition | Severity | Key supporting fields (weight) |
|---|---|---|
| Acute coronary syndrome | 1.8× | crushing/pressure (high), exertional (high), radiation to left arm/jaw (high), diaphoresis (med), risk factors: smoking/DM/HTN/FHx (med) |
| Aortic dissection | 2.0× | sudden onset (high), tearing/ripping (high), radiation to back/scapulae (high), unequal pulses/BP (high), connective tissue dz or uncontrolled HTN (med) |
| Pulmonary embolism | 1.8× | pleuritic (high), dyspnea (high), immobilization/surgery/malignancy/OCP (high), tachycardia (med), sudden onset (med) |
| Tension pneumothorax | 1.9× | sudden onset (high), pleuritic/sharp (high), dyspnea (high), unilateral/trauma hx (high) |
| Cardiac tamponade / pericarditis | 1.5× | pleuritic (high), positional — worse lying flat, better sitting forward (high), recent viral illness (med), dyspnea (med) |

### Tier 2 — Common/benign
| Condition | Severity | Key supporting fields |
|---|---|---|
| GERD | 1.0× | burning (high), postprandial (high), worse lying down (med), relieved by antacids (high) |
| Musculoskeletal/costochondritis | 1.0× | reproducible on palpation (high), sharp/localized (med), recent strain (med), no systemic sx (med, as absence) |
| Anxiety/panic | 1.1× | stress/panic association (med), no exertional pattern (med), young + no risk factors (low), normal exam (med) |
| Pneumonia/pleuritis (non-PE) | 1.3× | fever (high), productive cough (high), pleuritic (med), unilateral crackles (high) |

### Core fields to elicit
Onset (sudden/gradual) · Character (crushing/tearing/pleuritic/burning/stabbing) · Radiation (arm-jaw / back / none) · Relation to exertion · Relation to position/respiration · Relation to meals · Associated symptoms (diaphoresis, dyspnea, syncope, palpitations, fever, cough) · Risk factors (smoking, DM, HTN, FHx, immobilization, malignancy, OCP, trauma, connective tissue dz) · Reproducibility on palpation (strong negative predictor for cardiac).

### Scoring formalism
- `rank_score = feature_match_score × severity_multiplier`, normalized across the differential set.
- `feature_match_score` = weighted sum (high/med/low weights), NOT raw count.
- Severity multipliers are FIXED clinical constants (auditable), set by clinical review against real frameworks (HEART-score lineage) — never invented per-call by the LLM.
- Why: pure feature-counting ranks well-matched benign conditions above dangerous under-determined ones — clinically backwards. This is a core investor talking point.

### DDx output schema
```json
{
  "differentials": [
    {
      "condition": "Acute coronary syndrome",
      "tier": "red_flag",
      "rank_score": 0.82,
      "supporting_fields": [
        {"field": "character", "value": "crushing/pressure", "weight": "high"},
        {"field": "radiation", "value": "left arm", "weight": "high"}
      ],
      "contradicting_fields": [
        {"field": "reproducible_on_palpation", "value": "not tested", "weight": "n/a"}
      ],
      "reasoning_note": "Exertional pressure with radiation and diaphoresis + cardiac risk factors"
    }
  ],
  "red_flags_screened": [
    {"condition": "Aortic dissection", "status": "ruled_lower", "reason": "no tearing quality, no back radiation"},
    {"condition": "Pulmonary embolism", "status": "insufficient_data", "reason": "no data on immobilization or dyspnea yet"}
  ],
  "missing_fields_that_would_help": ["onset_speed", "pleuritic_component"]
}
```
System-prompt rules: never include a differential ungrounded in ≥1 field; never infer un-elicited values; DDx runs on the STRUCTURED PROFORMA, not raw transcript. Open design decision (leaning yes): show insufficient_data differentials flagged in the ranked list rather than hiding them.

---

## 8. Where the Weights Come From (the "won't you need datasets?" answer)

**The datasets already exist — medicine published them decades ago.** We don't train weights; we transcribe **published, peer-reviewed clinical decision rules** doctors already use on paper, doctor-advisor-approved, versioned in the DB with citations. Full detail with sources in `SCORING_RULES_EVIDENCE.md` (shareable):

- **HEART score** (chest pain, Neth Heart J 2008) — History/ECG/Age/Risk factors/Troponin, 0–2 points each; validated thresholds (0–3 ≈1.7% event risk → discharge; 7–10 ≈50% → early invasive).
- **Wells score** (PE, Thromb Haemost 2000) — e.g. DVT signs +3, HR>100 +1.5, hemoptysis +1. Derived on thousands of patients, validated 25 years.
- **CURB-65** (pneumonia, Thorax 2003), **Centor/McIsaac** (strep — even has a *negative* weight: age ≥45 = −1), **Alvarado** (appendicitis, 1986), **TIMI** (UA/NSTEMI, JAMA 2000).

Pipeline: pick complaint → pull published rules → doctor advisor reviews for OPD setting → encode into template JSON (feature→weight, condition→severity, citation per weight, versioned row) → eval harness verifies implementation ranks the way the published rule says.

**The line:** *"Medicine already ran the study. We don't train weights — we license them from decades of published, validated clinical research. Clinical knowledge engineering, not machine learning. DXplain has worked this way since 1987."*

---

## 9. Competitive Landscape (researched July 2026, with sources)

### Global tiers
- **Enterprise / Epic-heavy:** Nuance DAX Copilot (Microsoft, ~33% share), **Abridge** (#1 KLAS, $550M raised across two 2025 rounds, **$5.3B valuation**, Contextual Reasoning Engine, 28+ languages, expanding into revenue-cycle), **Ambience Healthcare** ($243M Series C 2025, $345M total, $1.25B valuation, 5-yr Cleveland Clinic exclusive), Augmedix Go, **Epic native AI Charting** (Feb 2026, free for Epic customers — structural threat to standalone scribes), athenaAmbient (free for athenahealth customers).
- **Mid-market/voice-first:** Suki (since 2017, two-way EHR), DeepScribe (specialty care), Nabla (multilingual/telehealth).
- **Budget/small-practice:** **Freed**, Heidi Health (usable free tier), Twofold ($49/mo), DeepCura, OrbDoc, PatientNotes, Tali, Sunoh.ai — plus ~100 lookalike scribes.

### Deep-dives done
- **Freed (getfreed.ai):** documentation ONLY, deliberately narrow ("a scribe and only a scribe"). $39–119/mo, 26k+ clinicians, 32M visits. Architecture (CEO-disclosed): fine-tuned open-source Whisper for clinical vocab + "hundreds of targeted AI tasks" as modular pipeline stages + learns from clinician edits + 20+ in-house clinicians auditing. No EHR API — Chrome-extension "EHR Push" overlay. Deletes audio after note generation. Cloud-only, no on-prem (explicitly wrong when "PHI can't leave the building" — our self-hosted roadmap hits that gap). US-only, English-only notes. AI assistant reviews PAST notes only — explicitly no real-time decision support. **Lessons:** documentation-only is now a price war; the modular small-tasks design is worth copying (debuggable, swappable vs one mega-prompt).
- **Glass Health:** THE closest architectural peer. Note + three-tier DDx + evidence-grounded A&P + clinical Q&A in ONE workflow; real-time insights incl. suggested history questions. Free Lite; Pro $90/mo; EHR integrations (Epic, eClinicalWorks, athenahealth, Elation) on Max. US/Western-focused. **Differentiation:** real-time-during-consult emphasis, complaint-adaptive proforma, field-level traceability (sharper than citation-level), severity-weighted ranking, India-first speech.
- **Doximity (Scribe + Ask):** US-only, free for verified US clinicians; Scribe and Ask are separate tools with a manual bridge — NOT one pipeline. Its free launch = the commoditization moment for pure documentation.

### India-native (corrected an earlier overclaim — "nobody does India-first" is FALSE as stated)
- **EkaScribe (Eka Care)** — most serious direct competitor. $19.5M raised (Hummingbird, 3one4, Mirae). ABDM-compliant, 20+ languages incl. Hindi/regional/Hinglish, thousands of clinicians, own LLM ("Parrotlet"). **Top-priority teardown (Ethan's assignment).** Differentiation must rest on the reasoning layer, not the India angle alone.
- **HealthOrbit AI** — India-registered (Chandigarh), sells mostly UK/NHS. Has AI coding/billing with a **denial-tracking dashboard** — but *retrospective* (after submission), not preventive. Vitalis's hackathon prototype checks criteria *before* the note is finalized — a real but **narrower** claim.
- **Sunoh.ai** — not India-native but trusted in Indian clinics for reliability in noisy OPD.
- Also on radar: UpToDate (citation benchmark, not competitor), Indian HMS players (Practo, Apollo, etc.).

**Honest differentiation line:** none of the three India players verify claims against payer criteria before submission, and none do live, traceable, severity-ranked reasoning during the consult. That claim is exactly what this week's case studies stress-test — *"if EkaScribe does live reasoning, I want to know Thursday, not Sunday."*

### Case-study process (full detail in `RESEARCH_ASSIGNMENTS.md`)
Every product gets the same 6-part teardown: Snapshot → Feature inventory (**sign up for the free trial and use it**, screenshots) → Live test (run a 3-min mock consult through it, save output) → Architecture signals (blogs, CEO interviews, job postings) → Where it stops (the gaps — written like you're trying to prove Vitalis is a bad idea; finding a problem with our claim is a win) → Verdict vs Vitalis. Every claim needs a source link or screenshot. One doc per product: `CaseStudy_<Product>.md`.

---

## 10. Market Data & Doctor-Advisor Input

### Global
- Market-size estimates vary wildly ($1.2B → $37.2B for "2025" depending on scope) — citing the biggest number without defining scope is a credibility red flag. Slide-ready figure used: **ambient clinical documentation ~$2.0B (2025) → $18.6B (2034)**.
- North America dominates (44–70% share); APAC fastest-growing; category shifting from transcription into coding/decision support.
- Enterprise reality check: Ambience + Abridge funding (above) means "nobody does decision-support + coding" is false at the enterprise level — the honest claim: **"nobody's brought it to the budget/small-clinic tier."**

### India
- **DPDP Act:** soft enforcement through Nov 2026, hard May 2027; penalties up to ₹250 crore, stackable. Only **9.9%** of Indian healthcare orgs have started compliance work → compliance-first is a differentiator.
- **ABDM** becoming the de facto consent/interoperability layer.
- **Claims-denial data (evidence for the denial-resistant USP):** 1 in 12 claims rejected nationally (IRDAI); ₹26,000 crore disallowed in a recent year, +19.1% YoY; standalone health insurers 64.71% settlement vs 88.71% private. Caveat: much is *policy-structure* rejection, not documentation quality — so the claim is strongest for the clinical-criteria-verification piece.
- **Sizing (kept deliberately separate):** narrow (GenAI clinical documentation): $0.03B in 2026. Broad (AI in healthcare, India): $4.77B by 2034 at 29.56% CAGR (IMARC); North India largest regional share 33.8% (relevant: MAMC is Delhi). Framing: "small today, growing fast — early-mover timing."
- Market slide: India $0.29B → $4.77B (2025–2034).

### Doctor-advisor scope decisions (handwritten notes, synthesized)
- **B2B vs B2C:** MVP is **B2C-shaped** (single doctor, standalone, phone/laptop — Freed proved the wedge), with the EMR-integration API designed in from day one as the B2B path. Investor line: "start with individual clinicians, scale into hospitals through integration, not replacement."
- **"Existing EMR ↔ API ↔ Our System"** — the biggest scope gift: we are NOT building an EMR/HMS, no patient-record custody, no pharmacy/pathology/admin modules.
- Free/open EMRs to develop and demo against: OpenMRS, OpenEMR, **Bahmni**.
- **Compliance:** architect for India (DPDP + ABDM), data-residency first-class. HIPAA/FDA only if expanding later — don't architect for four jurisdictions.
- **OPD vs IPD:** demo = OPD. IPD (ward rounds, multi-day) is a different workflow — roadmap only.

---

## 11. The Big Strategic Answers (anticipated questions & agreed answers)

Developed in depth for pitch preparation — these questions recur with developers, investors, and clinicians alike.

1. **"Why won't ChatGPT give the same answer?"** (the single most common question, from both developers and investors.) ChatGPT is an answer; Vitalis is the system that gets the right question asked, gives the same answer every time, and proves where every word came from. Four legs: (a) infrastructure-vs-demo — by that logic Stripe and Postgres shouldn't exist; the value is guarantees: determinism, provenance, integration, failure handling; (b) non-determinism is disqualifying in a medical tool — hosted models get silently updated ("your ranking function changed because OpenAI shipped on a Tuesday"); (c) no provenance — ChatGPT's "why" is generated after the fact; ours is tappable quotes + table rows; (d) **who types the input?** Our input is 15 min of messy Hinglish two-speaker audio — the pipeline that turns THAT into a clean structured case IS the product, with ChatGPT-class models as one swappable box. Market receipt: "If 'just ask ChatGPT' were the product, Abridge wouldn't be worth $5.3B and doctors wouldn't pay Glass $90/month — they've all had ChatGPT for years."

2. **The determinism speech** (fact-checked numbers): 95% accuracy chained 10 steps = **60%** (NOT 50% — 50% happens at fourteen steps); at twenty, one-in-three. Published GPT-4 diagnostic accuracy on open-ended DDx from vignettes: **~55–63% top-1** (60% top-1/83% top-10 complex vignettes; 55% top-1 with labs, npj Digital Medicine 2025). The 90%+ numbers people remember are multiple-choice USMLE-style exams — a recognition task. Trap answers: temp-0 removes sampling dice, not drift, and auditability is the real point; and yes our pipeline has an LLM — probability is allowed in exactly ONE place (extraction), where every output carries its quote and the eval harness measures it. "We didn't eliminate the dice — we cornered them in the one room with a window."

3. **"Are YOU promising 100%?"** Deny the premise: nothing in the clinic is 100% — not the ECG, not troponin, not the doctor. Medicine runs on **known error behavior**. Four properties: reproducible (wrong the same way every time → fixable once), visible (work shown, contradicting evidence shown), measurable and STAYS measured (sealed ground truth; ChatGPT's accuracy expires with every silent update), fails toward caution (red flags never dropped). **"We don't promise to always be right — we promise to never be wrong invisibly."**

4. **"Is Claude itself rule-based?"** (a common developer challenge.) No — neural nets won language, which is why there's an LLM in the pipeline doing the language work. But Anthropic wraps its own frontier model in deterministic scaffolding everywhere "probably right" isn't good enough. Counter-questions: is the drug-interaction checker in every hospital EMR rule-based or ML? (Rules. All of them.) Is your income-tax computation a neural net? Why does flight-control software run certified deterministic code? We're an **LLM + deterministic-scoring hybrid** — the same shape every serious AI product ships in 2026. On the dataset question: "Datasets are for learning UNKNOWN functions. Triage logic is published."

5. **"Why not train your own model — that's the moat."** Abridge is worth $5.3B and trained nothing (Freed's Whisper fine-tune is an STT adaptation, not a foundation model). Our moat: deterministic scoring engine + curated KB — *auditable*, which is what sells to doctors and regulators. Direct answer settled early: **do NOT train a model — not MVP, not production.** Spectrum: managed API w/ BAA → self-hosted open weights → on-device quantized. Fine-tune open weights only years later if proprietary labeled data accumulates.

6. **"Go fully on-device — medical data can't touch third parties."** Two ideas getting merged: self-hosted (our Mumbai servers — real, Phase 2) vs on-device (streaming diarized Hinglish STT on a mid-range Android is beyond anyone's production reality in 2026). "API = data leak" is the amateur version — enterprise zero-data-retention terms are how Abridge ships to HIPAA hospitals; the professional drivers for self-hosting are DPDP residency, hospital procurement, and margin. Counterweight to volunteer: worse on-device transcription feeding a clinical engine is a *patient-safety* problem — privacy vs quality is a measured tradeoff, hence STT is benchmarked and swappable. Cite "ASR Under the Stethoscope" (2025) on ASR bias in Indian clinical speech.

7. **Cost/pricing (Q9):** ~₹10–15 per 15-min consult at managed-API prices; Indian OPD consults average 3–7 min and VAD strips silence → realistic **₹3–7/consult**. Self-hosting in Phase 2 cuts inference cost 5–10×. Pricing: don't commit — reference points: Freed $99/mo US, EkaScribe freemium; India lands ~₹1–3k/month/doctor; nailing it is part of the case-study work.

8. **Liability (Q10):** (a) category — clinical decision *support*, same legal category as UpToDate/DXplain, doctor holds the pen, nothing auto-inserted; (b) design — every suggestion arrives with evidence, contradicting evidence, and a citation: a 5-second job to disagree with us; (c) failure direction — red flags can't silently disappear; we fail toward caution, visibly.

---

## 12. Grant Ask & Budget (Sunday's number)

Full doc: `VITALIS_GRANT_BUDGET.md` (shareable; last revised July 16 — **treat the file on disk as the final version**, it went through several rounds of edits). Headline:

- **Ask: ₹5.5 lakh** (₹6L variant expands pilot 3→5 clinics). **Runway: 6 months** — from working MVP to a 3-clinic pilot with real usage data.
- Why the number is small: the architecture is deliberately **capital-light** — no model training (zero GPU cost), free-licensed knowledge base (SNOMED via NRCeS, UMLS, StatPearls, WHO/ICMR ≈ ₹0), one Postgres doing everything. The grant funds **validation**, not infrastructure.
- Breakdown (₹): founder/contract engineering 1,90,000 · sprint helpers 36,000 · clinical advisory 50,000 · AI inference APIs 60,000 (~4,000 pilot consults at ₹8–12/consult) · cloud infra 30,000 (Mumbai, ₹5k/mo) · 3-clinic pilot 45,000 · compliance & legal 60,000 · KB buffer 10,000 · tools/domain 14,000 · contingency 55,000 → **5,50,000**.
- Milestones: M1–2 working MVP → M3 first clinic deployment + eval baseline → M4–5 3-clinic pilot, ~4,000 consults, Bahmni EMR-push demo → M6 pilot report = **the evidence pack for a seed raise**.
- Fixed burn ≈ ₹45–50k/month. NOT spending on: GPU training, data licensing, office, market salaries, paid marketing.

---

## 13. MAMC MIC & SMR (Girik's Delhi track — separate from the Sunday grant pitch)

- **MAMC MIC** (Medical Innovation Centre, Maulana Azad Medical College, Delhi): inaugurated Dec 2025 under the National Mission on Cyber-Physical Systems. Medtech/digital-health incubation, device validation, training, industry-academia. **Not a grant-disbursing body** — too new, no mature funding processes.
- **SMR (Squad Medicine and Research):** student-driven research/mentorship nonprofit (5 yrs, 1,000+ students mentored), founded by Dr. Tarun Kumar Suvvari. **Not a funding body.**
- **Strategy decided: do NOT ask them for a grant.** Ask MAMC MIC for: incubation/cohort consideration, clinical pilot access (2,800-bed teaching hospital, 7,200 daily outpatients), mentorship, and an explicit "soft commitment for later." Ask SMR for: a joint clinical validation study ("does denial-resistant documentation reduce claim rejection rates"), distributed pilot testers from their physician-researcher network, co-authorship/dissemination.
- Opening framing: *"We're not here asking for funding — we're here because we think you're the right partner to help us validate this properly."*

---

## 14. Pitch Decks Built

1. **`Vitalis_Pitch_Deck.pptx`** (from Girik's thread; built with pptxgenjs, navy/teal "Teal Trust" palette — navy `0A2540`, teal `028090`, mint `02C39A`; icons via react-icons + sharp). **15 slides** for the tech-recruiting audience: Title → Hook (Freed/Ambience/Abridge framing + stat chips) → Problem → Global market ($2.0B→$18.6B chart) → India market ($0.29B→$4.77B + North-India donut) → India competitive landscape (EkaScribe/HealthOrbit/Sunoh + honest differentiation) → What Vitalis does → USPs ranked (denial-resistant headline + 3 supporting + explicit non-claims footnote) → Global tiers comparison (budget vs Vitalis-wedge vs enterprise) → What's built (hackathon prototype, Sara/Zunaira/Archi) → What's NOT built (honest gap slide — "this is where you come in") → Validation path (MAMC MIC + SMR, labeled "relationship-building, not funded") → Why this, why now → Ask/Offer (**equity/scope numbers were never filled in**) → Close. Original file was at `/mnt/user-data/outputs/Vitalis_Pitch_Deck.pptx` (a claude.ai sandbox path — re-download from that chat if needed).
2. **10-slide investor deck** (from Krish's thread; PPTX, teal health-tech theme): Title → Problem → Solution (Listen/Structure/Reason) → Pipeline → USP (3 cards) → Trust & Safety → Market (1.3M+ Indian doctors, $1B+ category, 0 India-first reasoning tools) → Team (roles not names) → Roadmap → Ask (placeholder — now fillable with the ₹5.5L budget). A doctor-facing lighter deck was offered but never built.
3. Also produced earlier: swimlane work-division diagrams (Person 1/2/3 × weeks 1–3), roadmap flowchart (Build MVP → Demo → Iterate → Shortlist incubators → Apply & pitch → Onboard; incubator research should START during weeks 2–3 in parallel), and two spoken pitch scripts (doctor version: trust/workflow-led; investor version: defensibility/market-gap-led).

---

## 15. Roleplay Consult / Eval Plan (Person 2)

4–6 consults, 3–5 min each, phone audio in a normal room (real acoustic conditions). Vary along: clean vs messy history (backtracking/contradictions), classic vs ambiguous presentation, single vs overlapping complaints, 2–3 different voices for accent variation, one with interruptions/cross-talk. Beat sheets, not verbatim scripts (chief complaint phrasing, 4–5 HPI details — some upfront, some only when asked, 1–2 risk factors). **Ground truth (expected proforma + top 2–3 differentials) written and SEALED before running pipeline output.** Earlier scenarios leaned cardiac-heavy — add GERD/musculoskeletal/anxiety-leaning ones.

---

## 16. Regulatory & Compliance Summary

- **DPDP Act** — per-consult patient consent captured before recording (consent is a DB column, not a bolt-on popup); data residency in Mumbai (ap-south-1) from day one; raw audio deleted post-transcription.
- **ABDM** — alignment is the B2B credibility marker; ABDM is becoming India's consent/interoperability layer.
- **CDSCO / SaMD** — doctor-only display + nothing auto-inserted keeps Vitalis decision support, not a diagnostic device. Enforced by design, not disclaimer.
- **FHIR** — the EMR push adapter emits FHIR-shaped resources.
- US HIPAA/FDA — only if expanding later; do not architect for it now.

---

## 17. Working Conventions

- Architecture decisions are validated against **documented production patterns** — systems already shipped by Abridge, Freed, Glass Health, DXplain, and similar — rather than invented designs. Any proposed change should cite a real precedent.
- Diagrams are maintained as dark-theme flowchart HTML files (annotated boxes, labeled arrows) that open locally in VS Code or a browser.
- Project documents live in the shared `vitalisScribe` folder — one document per topic, updated in place rather than duplicated.

---

## 18. File Inventory (the `vitalisScribe` folder)

| File | What it is | Shareable? |
|---|---|---|
| `vitalis_full_context.md` | Krish's chat-thread handoff: product definition, team, 3-week plan, DDx framework, architecture patterns, competitors, USP, doctor-advisor scope | Yes |
| `Vitalis_Chat_Context_Summary.md` | Girik's chat-thread handoff: Freed research, market numbers, India denial data, MAMC MIC/SMR strategy, recruiting pitch, USP corrections, 15-slide deck | Yes |
| `architecture-map.html` | The v1.0 block diagram (22 blocks, dark flowchart, legend, DB tables) | Yes — the screen-share artifact |
| `architecture-doc.html` | The long-form architecture document accompanying the map | Yes |
| `SCORING_RULES_EVIDENCE.md` | Published clinical scoring rules (HEART, Wells, CURB-65, Centor, Alvarado, TIMI) with citations | Yes — built to be shown |
| `VITALIS_GRANT_BUDGET.md` | The ₹5.5L grant ask + budget + milestones | Yes |
| `RESEARCH_ASSIGNMENTS.md` | Competitor case-study sprint plan, template, assignments, deadlines | Yes (team) |
| `VITALIS_HANDOFF_CONTEXT.md` | This document | Yes — team onboarding |

---

## 19. Decisions Locked In (don't re-litigate)

1. Clinician-facing decision support, never autonomous diagnosis; doctor-only display; nothing auto-inserted.
2. No model training — ever, at this stage. Managed APIs now (Gemini for LLM; Deepgram/AssemblyAI/Sarvam for STT), self-hosted open weights (MedGemma/Meditron, AI4Bharat) Phase 2, on-device only as the far end of the swap path.
3. LLM extracts only; deterministic engine ranks; RAG cites after ranking. Never mix these.
4. Weights come from published clinical rules, doctor-approved, versioned with citations — no datasets, no learned weights.
5. Batch pipeline → chunked pseudo-real-time for demos; true streaming is post-funding. Be honest about it.
6. Chest pain is the first vertical, not the product.
7. B2C-shaped MVP (individual doctor), EMR push adapter designed in from day one as the B2B path. We are a layer, not an EMR.
8. India-first: DPDP + ABDM, Mumbai data residency, delete raw audio post-transcription.
9. One Postgres (relational + pgvector + pg-boss). No Pinecone/Redis until a measured bottleneck exists.
10. Helpers: 2% of grant each, freelance through Sunday, no equity until post-grant/seed.
11. Sealed-ground-truth eval harness gates every release.
12. Honest claims only: "nobody in the budget tier does live traceable reasoning" (not "nobody does India-first" — EkaScribe exists); denial-resistance validated for one case (breast cancer) only.

## 20. Open Threads / TODOs (as of July 17)

1. **Sunday July 19 pitch** — the main event. Compile the case-study pack Saturday afternoon + extract the comparison table.
2. **EkaScribe deep-dive** (Ethan, due Thu/Fri) — the make-or-break competitor teardown; verify they don't do live reasoning.
3. Fill the investor-deck **ask slide** with the ₹5.5L number and the milestone table from the budget doc.
4. **Incubator shortlist** for India health-tech (application windows are fixed dates — research should already be running in parallel).
5. Person 2: finalize DDx spec handoff for Person 3; record roleplay consults with sealed ground truth.
6. Decide: insufficient_data differentials shown-flagged vs hidden (leaning shown-flagged).
7. Doctor-facing lighter pitch deck (offered, never built).
8. Severity multipliers sanity-checked against HEART-score-style frameworks by Person 2 before demo day.
9. **Equity % / time commitment for a technical co-founder-level recruit** — flagged repeatedly in Girik's thread, still unresolved.
10. Outcomes of the July 15 meeting and the MAMC MIC/SMR meeting are **not recorded** in any doc — get a verbal debrief from Krish/Girik.
11. STT benchmarking (Deepgram vs AssemblyAI vs Sarvam) on our own recorded consults — planned, not yet run.
12. Read StatPearls license terms properly pre-launch; sign UMLS/NLM agreement; NRCeS SNOMED registration.

---

## 21. Glossary (quick reference)

DDx = differential diagnosis (ranked list of conditions) · Proforma = structured clinical form (adaptive per complaint) · SOAP note = Subjective/Objective/Assessment/Plan note format · STT = speech-to-text · Diarization = splitting audio by speaker · VAD = voice activity detection (Silero = the OSS model we use) · EMR/EHR = electronic medical record · HMS = hospital management system · OpenMRS/OpenEMR/Bahmni = open-source EMRs (Bahmni = Indian) · FHIR = health-data exchange standard (say "fire") · ABDM = Ayushman Bharat Digital Mission · DPDP = India's data-protection act · RAG = retrieval-augmented generation · pgvector = Postgres vector extension · SNOMED CT/ICD-10/UMLS = medical terminology systems · StatPearls/WHO STG/ICMR STG = open clinical reference content · CDSCO/SaMD = India's device regulator / software-as-medical-device · OPD/IPD = outpatient/inpatient · BAA/ZDR = business associate agreement / zero data retention · vLLM = open-weight model server · Drizzle = TypeScript ORM · DXplain/Isabel = deterministic diagnostic-support lineage (DXplain since 1987) · Triage = sorting by danger, not arrival order · HEART/Wells/CURB-65/Centor/Alvarado/TIMI = published clinical scoring rules · WS = WebSocket · AI4Bharat = IIT-Madras open Indic ASR (Phase-2 STT target) · Sarvam/Vakyansh/Bhashini = Indian speech AI (commercial hosted / dormant OSS / govt API) · pg-boss = Postgres-native job queue.

---

## 22. MVP Demo Build Plan (revised July 17, 2026)

The build now targets a **grant-demo application**, not the production system. The production architecture (§6) remains what we pitch and what the grant funds; the demo build is a working preview of it, intentionally simplified. Stack decision: **React Native with Expo** (dev build, not Expo Go — needed for reliable audio recording) instead of the earlier Next.js PWA plan.

### Consult lifecycle (state machine, drives all screens)
`created → consented → recording → processing → review → finalized` — one `status` column on the consult row.

### Screen flow
1. **Sign up / onboarding** — account + doctor's consent to terms + voice-enrollment sentence (stored voiceprint).
2. **Dashboard with guided tour** — first launch runs a coach-marks walkthrough (screen dims, each element highlights in sequence with a one-line caption; `react-native-copilot` / `rn-tourguide`). A "replay tour" option in settings so the walkthrough can be triggered live for an audience.
3. **Patients page** — search + add patient (name, age, sex, phone). Consults always start from a patient.
4. **Patient profile** — demographics, timeline of previous consultations, and a generated **"Previous context" card** (two-line summary of the last visit) for the revisit-continuity story. Carries a disabled **"EMR Sync — OpenMRS / Bahmni integration"** badge: the talking point is that patient management is not our product — open-source EMRs already exist and we integrate via API ("we're a layer, not an EMR"). **Start Consultation** button lives here.
5. **Per-consult patient consent** → recording screen.
6. **Live consult screen** — the demo centerpiece: ranked DDx list pinned on top (full differential, live), below it a **persistent insight feed** of cards (not transient toasts), three types: 🔴 red-flag ("Possible signs of ACS — chest pressure, left-arm radiation"), 🟡 gap prompt ("PE not assessable — ask about recent immobilization"), ⚪ rank update ("ACS moved to #1"). Transcript as a thin ticker; proforma one tap away.
7. **Review screen** — editable proforma with tap-to-quote, DDx with citations, transcript tab (speaker labels flippable) → finalize → summary/note + the disabled EMR-push button.

### Simplified demo pipeline
- **No** Deepgram/WebSocket gateway/VAD/separate scoring engine in this build. Every ~10 seconds the accumulated audio goes to a **single Gemini multimodal call** (Gemini accepts raw audio) with one prompt returning `{transcript_with_speakers, proforma, ddx[], insights[]}`. The severity-multiplier table and red-flag list are embedded in the prompt so output matches the production design's behavior and schema.
- **Scripted replay mode** as fallback: for the rehearsed consult, the full JSON timeline is pre-generated once and replayed against the recording timer — zero API dependency on stage. Live mode covers "try it on me" requests; replay mode covers connectivity/latency failures.
- Local storage: SQLite/AsyncStorage for patients and consults; chunked upload is a timer + `fetch`, no streaming infrastructure.

Positioning sentence for the demo: *"This is a working preview running on the API tier — the grant funds the production pipeline on the architecture map."*

---

*End of handoff. Pair this doc with a read of `architecture-map.html` (the visual) and `SCORING_RULES_EVIDENCE.md` (the clinical evidence), and you have the entire project state as of July 17, 2026.*
