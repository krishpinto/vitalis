import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { TranscriptView } from '@/components/TranscriptView';
import { hasSarvam } from '@/lib/env';
import { demoLineAt, transcribeChunk } from '@/lib/sarvam';
import { useConsult } from '@/lib/store';
import type { Speaker, TranscriptLine } from '@/types/clinical';

type Phase = 'idle' | 'recording' | 'finishing';

// How often we close a chunk and send it for transcription (live approximation).
const CHUNK_MS = 7000;
// Pace of the synthetic-demo playback when no Sarvam key is configured.
const DEMO_MS = 2400;

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ConsultScreen() {
  const router = useRouter();
  const setTranscript = useConsult((s) => s.setTranscript);
  const activePatientId = useConsult((s) => s.activePatientId);
  const patients = useConsult((s) => s.patients);
  const patient = patients.find((p) => p.id === activePatientId) ?? null;
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const [phase, setPhase] = useState<Phase>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const [listening, setListening] = useState(false);
  const [sttError, setSttError] = useState<string | null>(null);

  const linesRef = useRef<TranscriptLine[]>([]);
  const turnRef = useRef(0);
  const seqRef = useRef(0);
  const recordingRef = useRef(false);
  const elapsedTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const demoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const demoIdx = useRef(0);
  const scrollRef = useRef<ScrollView>(null);

  // Pulsing red dot while recording.
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
  }, [lines]);

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
  // alternating Doctor → Patient per chunk. A rough heuristic that reads like a
  // chat; the review screen can re-diarize accurately with Gemini if needed.
  function addTurn(text: string) {
    const clean = text.trim();
    if (!clean) return;
    const speaker: Speaker = turnRef.current % 2 === 0 ? 'Doctor' : 'Patient';
    turnRef.current += 1;
    pushLines([{ id: `c_${++seqRef.current}`, speaker, text: clean }]);
  }

  async function start() {
    linesRef.current = [];
    turnRef.current = 0;
    seqRef.current = 0;
    demoIdx.current = 0;
    setSttError(null);
    setLines([]);
    setElapsed(0);
    setPhase('recording');
    elapsedTimer.current = setInterval(() => setElapsed((e) => e + 1), 1000);

    if (hasSarvam) {
      try {
        const perm = await requestRecordingPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Microphone needed', 'Please allow microphone access to record the consult.');
          clearAllTimers();
          setPhase('idle');
          return;
        }
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        recordingRef.current = true;
        await recorder.prepareToRecordAsync();
        recorder.record();
        scheduleChunk();
      } catch (err) {
        Alert.alert('Recording error', String(err));
        clearAllTimers();
        setPhase('idle');
      }
    } else {
      // Demo: reveal the synthetic consult line-by-line so it looks live.
      demoTimer.current = setInterval(() => {
        const line = demoLineAt(demoIdx.current++);
        if (line) pushLines([line]);
        else if (demoTimer.current) clearInterval(demoTimer.current);
      }, DEMO_MS);
    }
  }

  function scheduleChunk() {
    chunkTimer.current = setTimeout(async () => {
      if (!recordingRef.current) return;
      try {
        await recorder.stop();
        const uri = recorder.uri;
        // Restart immediately to keep capturing the conversation.
        await recorder.prepareToRecordAsync();
        recorder.record();
        if (uri) {
          setListening(true);
          transcribeChunk(uri)
            .then((text) => {
              addTurn(text);
              if (text) setSttError(null);
            })
            .catch((err) => {
              console.warn('[STT chunk]', err);
              setSttError(String(err));
            })
            .finally(() => setListening(false));
        }
      } catch {
        // Ignore a single dropped chunk; keep the loop alive.
      }
      if (recordingRef.current) scheduleChunk();
    }, CHUNK_MS);
  }

  async function stop() {
    setPhase('finishing');
    recordingRef.current = false;
    clearAllTimers();

    try {
      if (hasSarvam) {
        await recorder.stop();
        const uri = recorder.uri;
        if (uri) addTurn(await transcribeChunk(uri));
      }
    } catch (err) {
      console.warn('[STT final]', err);
      setSttError(String(err));
    }

    const finalLines = linesRef.current;
    if (finalLines.length === 0) {
      Alert.alert('No speech captured', 'Nothing was transcribed — please try recording again.');
      setPhase('idle');
      return;
    }

    setTranscript({ lines: finalLines, languageCode: 'hi-IN', isDemo: !hasSarvam });
    router.replace('/review');
  }

  const recording = phase === 'recording';

  return (
    <View style={styles.container}>
      {/* Status header */}
      <View style={styles.header}>
        {patient && (
          <View style={styles.patientRow}>
            <ThemedText type="smallBold" style={styles.patientName}>
              {patient.name}
            </ThemedText>
            <ThemedText type="small" style={styles.patientMeta}>
              {[patient.age && `${patient.age}y`, patient.sex].filter(Boolean).join(' · ')}
            </ThemedText>
          </View>
        )}
        <View style={styles.statusRow}>
          <Animated.View style={[styles.dot, { opacity: recording ? pulse : 1, backgroundColor: recording ? '#DC2626' : '#94A3B8' }]} />
          <ThemedText type="smallBold" style={styles.statusText}>
            {phase === 'finishing' ? 'Finishing…' : recording ? 'Recording' : 'Ready'}
          </ThemedText>
          <ThemedText style={styles.timer}>{fmt(elapsed)}</ThemedText>
        </View>
        <ThemedText type="small" style={styles.sub}>
          {listening
            ? 'Transcribing…'
            : recording
              ? 'Live transcript — Doctor & Patient'
              : hasSarvam
                ? 'Tap start to begin the consult'
                : 'Demo mode — synthetic consult'}
        </ThemedText>
      </View>

      {sttError && (
        <View style={styles.errorBanner}>
          <ThemedText type="small" style={styles.errorText} numberOfLines={2}>
            Transcription error: {sttError}
          </ThemedText>
        </View>
      )}

      {/* Live transcript */}
      <ScrollView ref={scrollRef} style={styles.chat} contentContainerStyle={styles.chatContent}>
        {lines.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyIcon}>🩺</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.emptyText}>
              The conversation will appear here, labelled by speaker, as you talk.
            </ThemedText>
          </View>
        ) : (
          <TranscriptView lines={lines} />
        )}
        {recording && listening && (
          <View style={styles.typingRow}>
            <ActivityIndicator size="small" color="#2563EB" />
            <ThemedText type="small" themeColor="textSecondary">
              transcribing latest…
            </ThemedText>
          </View>
        )}
      </ScrollView>

      {/* Controls */}
      <View style={styles.footer}>
        {phase === 'finishing' ? (
          <View style={[styles.btn, styles.finishing]}>
            <ActivityIndicator color="#fff" />
          </View>
        ) : (
          <Pressable
            style={[styles.btn, recording ? styles.stopBtn : styles.recordBtn]}
            onPress={recording ? stop : start}
            accessibilityRole="button">
            <ThemedText type="smallBold" style={styles.btnText}>
              {recording ? '■  Stop & Review' : '●  Start Recording'}
            </ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FC' },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5EAF1',
    gap: 4,
  },
  patientRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 6 },
  patientName: { fontSize: 16, color: '#0F172A' },
  patientMeta: { color: '#64748B' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 14, color: '#0F172A' },
  timer: { marginLeft: 'auto', fontSize: 16, fontWeight: '700', color: '#0F172A', fontVariant: ['tabular-nums'] },
  sub: { color: '#64748B' },
  errorBanner: { backgroundColor: '#FEF2F2', paddingHorizontal: 20, paddingVertical: 8 },
  errorText: { color: '#B91C1C' },
  chat: { flex: 1 },
  chatContent: { padding: 16, paddingBottom: 24, flexGrow: 1 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 44 },
  emptyText: { textAlign: 'center', lineHeight: 22 },
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingTop: 10 },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5EAF1',
  },
  btn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  recordBtn: { backgroundColor: '#DC2626' },
  stopBtn: { backgroundColor: '#0F172A' },
  finishing: { backgroundColor: '#0F172A' },
  btnText: { color: '#fff', fontSize: 16 },
});
