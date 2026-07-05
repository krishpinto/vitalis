// Sarvam AI API wrappers — Saaras STT (Hinglish + diarization) and Bulbul TTS.
// All Sarvam network access lives here; screens never call the API directly.

import { ENV, hasSarvam } from './env';
import type { Speaker, Transcript, TranscriptLine } from '@/types/clinical';

const STT_ENDPOINT = 'https://api.sarvam.ai/speech-to-text';
const TTS_ENDPOINT = 'https://api.sarvam.ai/text-to-speech';

let lineCounter = 0;
function makeLine(speaker: Speaker, text: string, startTime?: number): TranscriptLine {
  return { id: `ln_${++lineCounter}`, speaker, text, startTime };
}

/**
 * Synthetic Hinglish consult script. Used to drive the live-transcript demo when
 * no Sarvam key is set. Synthetic data only — never a real patient.
 */
const DEMO_SCRIPT: { speaker: Speaker; text: string }[] = [
  { speaker: 'Doctor', text: 'Namaste, aaj kya problem ho rahi hai aapko?' },
  { speaker: 'Patient', text: 'Doctor sahab, teen din se bahut tez bukhar hai aur sar mein dard ho raha hai.' },
  { speaker: 'Patient', text: 'Body mein bahut pain hai, aankhon ke peeche bhi dard hota hai.' },
  { speaker: 'Doctor', text: 'Bukhar kitna high jaata hai? Kya aapne temperature check kiya?' },
  { speaker: 'Patient', text: 'Haan, kal raat ko 103 tha. Thand bhi lagti hai shivering ke saath.' },
  { speaker: 'Doctor', text: 'Koi rashes ya skin par red spots dikhe? Ulti ya loose motion?' },
  { speaker: 'Patient', text: 'Haath par thode red spots aaye hain. Do baar ulti bhi hui hai.' },
  { speaker: 'Doctor', text: 'Aap koi dawai le rahe ho abhi? Paracetamol liya?' },
  { speaker: 'Patient', text: 'Bas Crocin le raha hoon par bukhar wapas aa jaata hai.' },
  { speaker: 'Doctor', text: 'Theek hai, main aapko platelet count aur dengue test likhta hoon. Bleeding gums to nahi?' },
  { speaker: 'Patient', text: 'Nahi gums se blood nahi aaya, par bahut weakness lag rahi hai.' },
];

/** Number of synthetic lines available, so the live UI knows when the demo ends. */
export const DEMO_LINE_COUNT = DEMO_SCRIPT.length;

/** Return the Nth synthetic line (for the live demo playback), or null when done. */
export function demoLineAt(index: number): TranscriptLine | null {
  const entry = DEMO_SCRIPT[index];
  if (!entry) return null;
  return makeLine(entry.speaker, entry.text);
}

function demoTranscript(): Transcript {
  lineCounter = 0;
  return {
    isDemo: true,
    languageCode: 'hi-IN',
    lines: DEMO_SCRIPT.map((e, i) => makeLine(e.speaker, e.text, i * 5)),
  };
}

interface SarvamDiarizedEntry {
  speaker?: string;
  speaker_id?: string;
  transcript?: string;
  start_time_seconds?: number;
}

// Map a Sarvam speaker tag to a role. Sarvam returns generic ids like "SPEAKER_00",
// so by convention the first speaker (00) is the Doctor and the second the Patient.
function mapSpeaker(raw?: string): Speaker {
  if (!raw) return 'Unknown';
  const v = raw.toLowerCase();
  if (v.includes('doctor')) return 'Doctor';
  if (v.includes('patient')) return 'Patient';
  const num = v.match(/(\d+)/)?.[1];
  if (num === '0' || num === '00') return 'Doctor';
  if (num === '1' || num === '01') return 'Patient';
  return 'Unknown';
}

// Build the multipart file part with the *correct* name + MIME derived from the
// recording's real extension. RecordingPresets.HIGH_QUALITY yields .m4a — sending
// it labelled as .wav makes Sarvam reject/ignore the audio (the "no transcription" bug).
const MIME_BY_EXT: Record<string, string> = {
  m4a: 'audio/mp4',
  mp4: 'audio/mp4',
  aac: 'audio/aac',
  wav: 'audio/wav',
  mp3: 'audio/mpeg',
  caf: 'audio/x-caf',
  '3gp': 'audio/3gpp',
};

function fileMeta(uri: string) {
  const clean = uri.split('?')[0];
  const ext = (clean.split('.').pop() ?? 'm4a').toLowerCase();
  const type = MIME_BY_EXT[ext] ?? 'audio/mp4';
  return { name: `audio.${ext}`, type };
}

/**
 * Upload the recorded audio to a Sarvam STT endpoint via XMLHttpRequest.
 *
 * We use XHR rather than fetch() deliberately: React Native's newer fetch
 * implementation rejects the { uri, name, type } file-part shape with
 * "unsupported form data part implementation", whereas XHR's networking path
 * handles local file-URI parts natively.
 */
function sttUpload(audioUri: string): Promise<any> {
  const { name, type } = fileMeta(audioUri);
  return new Promise((resolve, reject) => {
    const form = new FormData();
    // The { uri, name, type } shape is what RN's native XHR upload expects.
    form.append('file', { uri: audioUri, name, type } as unknown as Blob);
    // saaras:v3 is the current model; "codemix" mode keeps Hindi+English (Hinglish)
    // in romanised form. NOTE: the sync REST endpoint does NOT support diarization
    // (that is Batch-API only), so no speaker labels come back here.
    form.append('model', 'saaras:v3');
    form.append('mode', 'codemix');
    form.append('language_code', 'unknown');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', STT_ENDPOINT);
    xhr.setRequestHeader('api-subscription-key', ENV.SARVAM_API_KEY);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error('Sarvam returned invalid JSON'));
        }
      } else {
        reject(new Error(`Sarvam STT failed (${xhr.status}): ${xhr.responseText}`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error contacting Sarvam'));
    xhr.send(form);
  });
}

/**
 * Transcribe a locally-recorded audio file with Sarvam Saaras (diarized).
 * Falls back to the synthetic demo transcript when no key is set.
 */
export async function transcribe(audioUri: string): Promise<Transcript> {
  if (!hasSarvam) {
    // Simulate a little latency so the recording UX feels real in the demo.
    await new Promise((r) => setTimeout(r, 1200));
    return demoTranscript();
  }

  const data = (await sttUpload(audioUri)) as {
    transcript?: string;
    language_code?: string;
    diarized_transcript?: { entries?: SarvamDiarizedEntry[] };
  };

  lineCounter = 0;
  const entries = data.diarized_transcript?.entries ?? [];
  const lines: TranscriptLine[] = entries.length
    ? entries.map((e) =>
        makeLine(mapSpeaker(e.speaker ?? e.speaker_id), e.transcript ?? '', e.start_time_seconds)
      )
    : // No diarization returned — fall back to a single Unknown block.
      [makeLine('Unknown', data.transcript ?? '')];

  return { lines, languageCode: data.language_code, isDemo: false };
}

/**
 * Transcribe a single short audio chunk for the live-transcript view and return the
 * plain text for that chunk (empty string for silence).
 *
 * The sync endpoint returns no speaker labels, so the caller assigns the speaker
 * (see the consult screen's turn heuristic). We approximate "live" transcription by
 * recording in short chunks and transcribing each as it closes; a production build
 * would use the Batch API (for real diarization) or a streaming STT.
 */
export async function transcribeChunk(audioUri: string): Promise<string> {
  if (!hasSarvam) return '';

  const data = (await sttUpload(audioUri)) as { transcript?: string };
  return (data.transcript ?? '').trim();
}

/**
 * Read out text via Sarvam Bulbul TTS. Returns base64 WAV audio, or null in demo
 * mode. Phase 5 — optional. (Wired in lib only; UI hookup comes later.)
 */
export async function synthesizeSpeech(
  text: string,
  languageCode = 'hi-IN'
): Promise<string | null> {
  if (!hasSarvam) return null;

  const res = await fetch(TTS_ENDPOINT, {
    method: 'POST',
    headers: {
      'api-subscription-key': ENV.SARVAM_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: [text],
      target_language_code: languageCode,
      model: 'bulbul:v2',
    }),
  });

  if (!res.ok) throw new Error(`Sarvam TTS failed (${res.status})`);
  const data = (await res.json()) as { audios?: string[] };
  return data.audios?.[0] ?? null;
}
