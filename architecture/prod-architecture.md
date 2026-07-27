# Prod architecture (proposed — funding pitch subset)

Scoped-down version of the full vision, chosen because the complete system can't be built before the funding pitch. This is the subset being costed out for the friend's funding ask. Not yet built — this document is the spec + token-cost model, not a status report.

## Pipeline

1. **Audio capture + silence trim** — raw consult audio goes through a VAD/silence-removal pass before anything else, cutting billed audio time.
2. **Chunked STT** — trimmed audio sent in pieces to a speech-to-text model (Sarvam Saaras, current vendor, unless swapped later).
3. **Gemini — structuring / live cards** — Gemini turns the transcript into a proforma and/or pushes suggestion cards to the doctor's screen during the consult. Context is kept cumulatively: each call resends the transcript-so-far, not just the new delta (see cost note below).
4. **Two parallel analysis engines, run independently on the same consult:**
   - **Weights engine** — the friend's own model, called via a paid LLM API (specific vendor/model TBD).
   - **Gemini engine** — Gemini call producing the tiered differential, grounded against a RAG corpus of verified medical sources.
5. **RAG grounding** — small (<50 doc) curated corpus of verified medical records / research papers, retrieved into the Gemini engine's context. Embedding/indexing is a one-time cost; retrieval adds recurring per-call context tokens.
6. **Final arbiter** — a separate Gemini call takes both engines' outputs, value-weighs them, and picks/synthesizes the one it judges most likely (default: favors the Gemini engine's output when in doubt).

Framing for doctors: this is a **testing product**, not used for real diagnosis at this stage.

## Token / cost model

Modeled for a 15-min avg consult, Hinglish transcript (~130 spoken words/min combined, ~1.5 tokens/word). Pricing as of Jul 2026: Gemini 2.5 Flash standard tier ($0.30/1M input, $2.50/1M output), Sarvam Saaras (₹30/hr standard, ₹45/hr with diarization).

| Stage | Input tokens | Output tokens | Cost |
|---|---|---|---|
| STT — live + diarization batch pass | — | — | ₹15.0 (~$0.18) |
| Live suggestion cards (36 calls/consult, cumulative context) | ~70,200 | ~2,880 | ~$0.028 |
| Weights engine (transcript + RAG context) | ~5,200 | ~900 | ~$0.0041 |
| Gemini engine (transcript + RAG context) | ~5,200 | ~900 | ~$0.0041 |
| Final arbiter | ~2,100 | ~300 | ~$0.0014 |
| **Total per consult** | | | **~$0.22 (₹18.3)** |

**STT is ~82% of per-consult cost, not LLM tokens** — at this volume the pitch is closer to "an audio-minutes product" than a "token cost" product.

Scaled to 20 doctors × 10 consults/day (200 consults/day):

| | Per day | Per month (30 days) |
|---|---|---|
| STT | ~₹3,000 (~$36) | ~₹90,000 (~$1,085) |
| LLM tokens | ~$7.5 | ~$226 |
| **Total** | **~$44 (₹3,624)** | **~$1,310 (₹108,720)** |

Total spend scales with consult *volume* (doctors × consults/day), not concurrency — concurrency only affects rate-limit/infra sizing, not the $ total.

### Open cost lever

The live-suggestion-card stage (cumulative context resent every ~25s) is ~1.5x the input tokens of every other stage combined. Two mitigations, not yet decided:
1. Gemini context caching ($0.03/1M cached-read vs $0.30/1M raw) — cache transcript-so-far, pay full price only for the new delta.
2. Sliding-window context (last N chunks only) instead of full history for the card-suggestion prompt.

### Unconfirmed assumptions to revisit

- Weights engine's actual model/vendor and pricing (currently modeled at Gemini-Flash-tier parity as a stand-in).
- Exact consult volume once the pilot doctor list is finalized (currently modeled at 20 doctors × 10 consults/day).
