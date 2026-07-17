// Live consult — records in 7s chunks, transcribes each chunk as it closes,
// persists every chunk (id, startMs, endMs, uri) so transcript lines stay
// linked to playable audio evidence, and surfaces in-consult suggestion cards.

import { BlurView } from 'expo-blur';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { useRouter } from 'expo-router';
import { Lightbulb, MessagesSquare, Mic, Square, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, type ScrollView as RNScrollView } from 'react-native';

import { TranscriptView } from '@/components/TranscriptView';
import { EmptyState, ErrorCard, PrimaryButton, Rise, T } from '@/components/ui';
import { hasSarvam } from '@/lib/env';
import { suggestQuestions } from '@/lib/gemini';
import { refineTranscript } from '@/lib/refine';
import { DEMO_LINE_COUNT, demoLineAt, transcribeChunk } from '@/lib/sarvam';
import { useConsult } from '@/lib/store';
import { Pressable, ScrollView, View } from '@/tw';
import type { AudioChunk, Speaker, Suggestion, TranscriptLine } from '@/types/clinical';

type Phase = 'idle' | 'recording' | 'finishing';

// How often we close a chunk and send it for transcription (live approximation).
const CHUNK_MS = 7000;
// Run the suggestion pass every N completed chunks (~21s).
const SUGGEST_EVERY_CHUNKS = 3;
// Pace of the synthetic-demo playback when no Sarvam key is configured.
const DEMO_MS = 2400;
const HEADER_HEIGHT = 96;

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ConsultScreen() {
  const router = useRouter();
  const setTranscript = useConsult((s) => s.setTranscript);
  const setChunks = useConsult((s) => s.setChunks);
  const activePatientId = useConsult((s) => s.activePatientId);
  const patients = useConsult((s) => s.patients);
  const patient = patients.find((p) => p.id === activePatientId) ?? null;
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const [phase, setPhase] = useState<Phase>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const [listening, setListening] = useState(false);
  const [sttError, setSttError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const linesRef = useRef<TranscriptLine[]>([]);
  const chunksRef = useRef<AudioChunk[]>([]);
  const turnRef = useRef(0);
  const seqRef = useRef(0);
  const chunkSeqRef = useRef(0);
  const suggestedRef = useRef<string[]>([]);
  const suggestBusyRef = useRef(false);
  const recordingRef = useRef(false);
  const recordStartRef = useRef(0);
  const chunkStartRef = useRef(0);
  const elapsedTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const demoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const demoIdx = useRef(0);
  const scrollRef = useRef<RNScrollView>(null);

  // Recording indicator — soft opacity pulse, the only looping animation.
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (phase !== 'recording') return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.3, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [phase, pulse]);

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(t);
  }, [lines, suggestions]);

  function clearAllTimers() {
    if (elapsedTimer.current) clearInterval(elapsedTimer.current);
    if (chunkTimer.current) clearTimeout(chunkTimer.current);
    if (demoTimer.current) clearInterval(demoTimer.current);
  }

  function pushLines(newLines: TranscriptLine[]) {
    if (!newLines.length) return;
    linesRef.current = [...linesRef.current, ...newLines];
    setLines(linesRef.current);
  }

  // The sync STT endpoint returns no speaker labels, so we assign turns by
  // alternating Doctor → Patient per chunk. Batch-API diarization is roadmap.
  function addTurn(text: string, chunkId?: string, startSec?: number) {
    const clean = text.trim();
    if (!clean) return;
    const speaker: Speaker = turnRef.current % 2 === 0 ? 'Doctor' : 'Patient';
    turnRef.current += 1;
    pushLines([{ id: `c_${++seqRef.current}`, speaker, text: clean, chunkId, startTime: startSec }]);
  }

  function showSuggestions(next: Suggestion[]) {
    const fresh = next.filter((n) => !suggestedRef.current.includes(n.question));
    if (!fresh.length) return;
    suggestedRef.current = [...suggestedRef.current, ...fresh.map((f) => f.question)];
    // Keep at most 2 visible; newest win.
    setSuggestions((prev) => [...fresh, ...prev].slice(0, 2));
  }

  function maybeSuggest() {
    if (suggestBusyRef.current || !recordingRef.current) return;
    if (linesRef.current.length < 3) return;
    suggestBusyRef.current = true;
    suggestQuestions(linesRef.current, suggestedRef.current)
      .then((s) => {
        if (recordingRef.current) showSuggestions(s);
      })
      .catch((err) => console.warn('[suggest]', err))
      .finally(() => {
        suggestBusyRef.current = false;
      });
  }

  async function start() {
    linesRef.current = [];
    chunksRef.current = [];
    suggestedRef.current = [];
    turnRef.current = 0;
    seqRef.current = 0;
    chunkSeqRef.current = 0;
    demoIdx.current = 0;
    setSttError(null);
    setLines([]);
    setSuggestions([]);
    setElapsed(0);
    setPhase('recording');
    recordStartRef.current = Date.now();
    elapsedTimer.current = setInterval(() => setElapsed((e) => e + 1), 1000);

    if (hasSarvam) {
      try {
        const perm = await requestRecordingPermissionsAsync();
        if (!perm.granted) {
          setSttError('Microphone access is needed to record the consult. Allow it in Settings, then retry.');
          clearAllTimers();
          setPhase('idle');
          return;
        }
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        recordingRef.current = true;
        await recorder.prepareToRecordAsync();
        recorder.record();
        chunkStartRef.current = 0;
        scheduleChunk();
      } catch (err) {
        setSttError(String(err));
        clearAllTimers();
        setPhase('idle');
      }
    } else {
      // Demo: reveal the synthetic consult line-by-line so it looks live.
      demoTimer.current = setInterval(() => {
        const line = demoLineAt(demoIdx.current++);
        if (line) {
          pushLines([{ ...line, startTime: (demoIdx.current - 1) * (DEMO_MS / 1000) }]);
          // Mid-consult, surface the scripted travel-history suggestion.
          if (demoIdx.current === Math.floor(DEMO_LINE_COUNT / 2)) maybeSuggest();
        } else if (demoTimer.current) clearInterval(demoTimer.current);
      }, DEMO_MS);
      recordingRef.current = true;
    }
  }

  /** Stop the current recorder file, register it as a chunk, transcribe it. */
  async function closeChunk(restart: boolean) {
    await recorder.stop();
    const uri = recorder.uri;
    const nowMs = Date.now() - recordStartRef.current;
    if (restart) {
      await recorder.prepareToRecordAsync();
      recorder.record();
    }
    if (!uri) return;

    const chunk: AudioChunk = {
      id: `ch_${++chunkSeqRef.current}`,
      uri,
      startMs: chunkStartRef.current,
      endMs: nowMs,
    };
    chunkStartRef.current = nowMs;
    chunksRef.current = [...chunksRef.current, chunk];

    setListening(true);
    try {
      const text = await transcribeChunk(uri);
      addTurn(text, chunk.id, chunk.startMs / 1000);
      if (text) setSttError(null);
      if (chunkSeqRef.current % SUGGEST_EVERY_CHUNKS === 0) maybeSuggest();
    } finally {
      setListening(false);
    }
  }

  function scheduleChunk() {
    chunkTimer.current = setTimeout(async () => {
      if (!recordingRef.current) return;
      try {
        await closeChunk(true);
      } catch (err) {
        console.warn('[STT chunk]', err);
        setSttError(String(err));
      }
      if (recordingRef.current) scheduleChunk();
    }, CHUNK_MS);
  }

  async function stop() {
    setPhase('finishing');
    const wasLive = hasSarvam && recordingRef.current;
    recordingRef.current = false;
    clearAllTimers();

    try {
      if (wasLive) await closeChunk(false);
    } catch (err) {
      console.warn('[STT final]', err);
      setSttError(String(err));
    }

    const finalLines = linesRef.current;
    if (finalLines.length === 0) {
      setSttError('Nothing was transcribed — please try recording again.');
      setPhase('idle');
      return;
    }

    setChunks(chunksRef.current);
    setTranscript({ lines: finalLines, languageCode: 'hi-IN', isDemo: !hasSarvam });
    router.replace('/review');

    // Item 1 — background batch-diarization pass. Review shows the live
    // heuristic transcript immediately; when the batch job lands, speaker
    // labels are swapped in place. On any failure the heuristic stays.
    if (hasSarvam && chunksRef.current.length) {
      const { setRefining, setTranscript: swap } = useConsult.getState();
      setRefining(true);
      refineTranscript(chunksRef.current, 'hi-IN')
        .then((refined) => {
          if (refined) swap(refined);
        })
        .catch((err) => console.warn('[refine]', err))
        .finally(() => useConsult.getState().setRefining(false));
    }
  }

  const recording = phase === 'recording';

  return (
    <View className="flex-1 bg-bg">
      {/* Chat scrolls beneath the glass header */}
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        // pt-28 = 112px = HEADER_HEIGHT (96) + 16 — kept as a static utility
        // since Tailwind's JIT scanner can't resolve a template-interpolated
        // arbitrary value; if HEADER_HEIGHT changes, update this too.
        contentContainerClassName="px-4 pb-6 gap-3 flex-grow pt-28">
        {sttError &&
          (recording ? (
            // Transient mid-consult hiccup — the next 7s chunk retries on its
            // own, so keep it quiet instead of alarming the room.
            <T variant="caption" tone="faint" className="pl-2">
              connection hiccup — retrying with the next chunk…
            </T>
          ) : (
            <ErrorCard message={sttError} onRetry={start} />
          ))}
        {lines.length === 0 && !sttError ? (
          <View className="flex-1 justify-center">
            <EmptyState
              icon={MessagesSquare}
              text={
                recording
                  ? 'Listening — the conversation will appear here, labelled by speaker.'
                  : 'Start recording and the consult will appear here, labelled by speaker.'
              }
            />
          </View>
        ) : (
          <TranscriptView lines={lines} chunks={chunksRef.current} />
        )}
        {recording && listening && (
          <T variant="caption" tone="faint" className="pl-2">
            transcribing latest…
          </T>
        )}
      </ScrollView>

      {/* Glass surface #1 — consult sticky header */}
      <BlurView intensity={40} tint="light" style={styles.header}>
        <View className="flex-row items-center gap-4">
          <View className="flex-1">
            <T variant="secondary" className="font-semibold" numberOfLines={1}>
              {patient?.name ?? 'Consult'}
            </T>
            <T variant="caption" tone="secondary">
              {patient
                ? [patient.age && `${patient.age}y`, patient.sex].filter(Boolean).join(' · ')
                : hasSarvam
                  ? 'Live consult'
                  : 'Demo mode — synthetic consult'}
            </T>
          </View>
          <View className="flex-row items-center gap-2">
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: recording ? pulse : 1,
                  backgroundColor: recording ? '#8C3A32' : '#9AA0AA',
                },
              ]}
            />
            <T variant="body" className="font-semibold" style={{ fontVariant: ['tabular-nums'] }}>
              {fmt(elapsed)}
            </T>
          </View>
        </View>
        <T variant="caption" tone="faint">
          {phase === 'finishing' ? 'Finishing…' : recording ? 'Recording — Doctor & Patient' : 'Ready'}
        </T>
      </BlurView>

      {/* Glass surface #3 — in-consult suggestion cards, above the input area */}
      {suggestions.length > 0 && (
        <View className="px-4 pb-2 gap-2" pointerEvents="box-none">
          {suggestions.map((s, i) => (
            <Rise key={s.id} index={i}>
              <BlurView intensity={24} tint="light" style={styles.suggestCard}>
                <View className="w-8 h-8 rounded-full bg-accent-soft items-center justify-center">
                  <Lightbulb size={16} color="#0F6E6B" strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <T variant="secondary" className="font-semibold">
                    {s.question}
                  </T>
                  {!!s.rationale && (
                    <T variant="caption" tone="secondary">
                      {s.rationale}
                    </T>
                  )}
                </View>
                <Pressable
                  onPress={() => setSuggestions((prev) => prev.filter((x) => x.id !== s.id))}
                  hitSlop={8}
                  accessibilityRole="button">
                  <X size={16} color="#9AA0AA" strokeWidth={2} />
                </Pressable>
              </BlurView>
            </Rise>
          ))}
        </View>
      )}

      {/* Controls */}
      <View className="p-4 bg-card border-t border-border">
        {phase === 'finishing' ? (
          <PrimaryButton label="Finishing…" onPress={() => {}} loading />
        ) : recording ? (
          <PrimaryButton label="Stop & review" onPress={stop} icon={Square} variant="danger" />
        ) : (
          <PrimaryButton label="Start recording" onPress={start} icon={Mic} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 4,
    backgroundColor: 'rgba(250,249,246,0.72)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ECEAE3',
    overflow: 'hidden',
  },
  dot: { width: 10, height: 10, borderRadius: 999 },
  suggestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ECEAE3',
    shadowColor: '#1A1D1F',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
