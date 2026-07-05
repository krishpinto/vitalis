// Diarized transcript rendered as a clean, clinical chat — Doctor on the left,
// Patient on the right. Used both live (during recording) and on the review screen.

import { StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';
import type { Speaker, TranscriptLine } from '@/types/clinical';

const SPEAKER_STYLE: Record<
  Speaker,
  { name: string; accent: string; bubble: string; text: string; avatarBg: string; initial: string }
> = {
  Doctor: { name: 'Doctor', accent: '#1D4ED8', bubble: '#EAF2FF', text: '#12285B', avatarBg: '#2563EB', initial: 'D' },
  Patient: { name: 'Patient', accent: '#047857', bubble: '#E7F8F0', text: '#0A4A38', avatarBg: '#059669', initial: 'P' },
  Unknown: { name: 'Speaker', accent: '#64748B', bubble: '#F1F5F9', text: '#334155', avatarBg: '#94A3B8', initial: '•' },
};

function Avatar({ speaker }: { speaker: Speaker }) {
  const s = SPEAKER_STYLE[speaker];
  return (
    <View style={[styles.avatar, { backgroundColor: s.avatarBg }]}>
      <ThemedText style={styles.avatarText}>{s.initial}</ThemedText>
    </View>
  );
}

export function ChatBubble({ line, showName }: { line: TranscriptLine; showName: boolean }) {
  const s = SPEAKER_STYLE[line.speaker];
  const isPatient = line.speaker === 'Patient';
  return (
    <View style={[styles.row, isPatient ? styles.rowRight : styles.rowLeft]}>
      {!isPatient && <Avatar speaker={line.speaker} />}
      <View style={[styles.stack, { alignItems: isPatient ? 'flex-end' : 'flex-start' }]}>
        {showName && (
          <ThemedText type="smallBold" style={[styles.name, { color: s.accent }]}>
            {s.name}
          </ThemedText>
        )}
        <View
          style={[
            styles.bubble,
            { backgroundColor: s.bubble },
            isPatient ? styles.bubbleRight : styles.bubbleLeft,
          ]}>
          <ThemedText style={[styles.bubbleText, { color: s.text }]}>{line.text}</ThemedText>
        </View>
      </View>
      {isPatient && <Avatar speaker={line.speaker} />}
    </View>
  );
}

export function TranscriptView({ lines }: { lines: TranscriptLine[] }) {
  return (
    <View style={styles.container}>
      {lines.map((line, i) => (
        <ChatBubble key={line.id} line={line} showName={lines[i - 1]?.speaker !== line.speaker} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },
  stack: { maxWidth: '82%', gap: 3 },
  name: { fontSize: 12, paddingHorizontal: 2 },
  avatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  bubbleLeft: { borderBottomLeftRadius: 5 },
  bubbleRight: { borderBottomRightRadius: 5 },
  bubbleText: { fontSize: 15, lineHeight: 21 },
});
