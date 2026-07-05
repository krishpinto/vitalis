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
import { Animated, Easing, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { TranscriptView } from '@/components/TranscriptView';
import { EmptyState, ErrorCard, PrimaryButton, Rise, T } from '@/components/ui';
import { hasSarvam } from '@/lib/env';
import { suggestQuestions } from '@/lib/gemini';
import { refineTranscript } from '@/lib/refine';
import { DEMO_LINE_COUNT, demoLineAt, transcribeChunk } from '@/lib/sarvam';
import { useConsult } from '@/lib/store';
import { color, radius, shadow, space } from '@/theme';
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
  const scrollRef = useRef<ScrollView>(null);

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
    <View style={styles.container}>
      {/* Chat scrolls beneath the glass header */}
      <ScrollView
        ref={scrollRef}
        style={styles.chat}
        contentContainerStyle={[styles.chatContent, { paddingTop: HEADER_HEIGHT + space.l }]}>
        {sttError && <ErrorCard message={sttError} onRetry={recording ? undefined : start} />}
        {lines.length === 0 && !sttError ? (
          <View style={styles.emptyWrap}>
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
          <T variant="caption" tone="faint" style={styles.listeningNote}>
            transcribing latest…
          </T>
        )}
      </ScrollView>

      {/* Glass surface #1 — consult sticky header */}
      <BlurView intensity={40} tint="light" style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <T variant="secondary" style={styles.patientName} numberOfLines={1}>
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
          <View style={styles.statusRow}>
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: recording ? pulse : 1,
                  backgroundColor: recording ? color.recording : color.inkFaint,
                },
              ]}
            />
            <T variant="body" style={styles.timer}>
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
        <View style={styles.suggestWrap} pointerEvents="box-none">
          {suggestions.map((s, i) => (
            <Rise key={s.id} index={i}>
              <BlurView intensity={24} tint="light" style={styles.suggestCard}>
                <View style={styles.suggestIcon}>
                  <Lightbulb size={16} color={color.accent} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <T variant="secondary" style={styles.suggestQuestion}>
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
                  <X size={16} color={color.inkFaint} strokeWidth={2} />
                </Pressable>
              </BlurView>
            </Rise>
          ))}
        </View>
      )}

      {/* Controls */}
      <View style={styles.footer}>
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
  container: { flex: 1, backgroundColor: color.bg },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    paddingHorizontal: space.xl,
    paddingTop: space.l,
    gap: space.xs,
    backgroundColor: color.glassHeader,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.border,
    overflow: 'hidden',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: space.l },
  patientName: { fontWeight: '600' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  dot: { width: 10, height: 10, borderRadius: radius.chip },
  timer: { fontVariant: ['tabular-nums'], fontWeight: '600' },
  chat: { flex: 1 },
  chatContent: { paddingHorizontal: space.l, paddingBottom: space.xl, gap: space.m, flexGrow: 1 },
  emptyWrap: { flex: 1, justifyContent: 'center' },
  listeningNote: { paddingLeft: space.s },
  suggestWrap: { paddingHorizontal: space.l, paddingBottom: space.s, gap: space.s },
  suggestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    backgroundColor: color.glassCard,
    borderRadius: radius.card,
    padding: space.l,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.border,
    ...shadow,
  },
  suggestIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.chip,
    backgroundColor: color.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestQuestion: { fontWeight: '600' },
  footer: {
    padding: space.l,
    backgroundColor: color.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.border,
  },
});
