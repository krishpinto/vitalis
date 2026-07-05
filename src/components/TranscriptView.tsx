// Diarized transcript as a clinical chat — Doctor left (white card), Patient
// right (teal-tinted). Speaker chip on the first bubble of each run. When a
// line is backed by a recorded audio chunk, tapping the bubble plays the clip.

import { Play, Square } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { T } from './ui';
import { onPlaybackChange, playClip } from '@/lib/audio';
import { chunkForLine } from '@/lib/evidence';
import { color, radius, shadow, space } from '@/theme';
import type { AudioChunk, Speaker, TranscriptLine } from '@/types/clinical';

const SPEAKER_META: Record<Speaker, { name: string; bubble: string }> = {
  Doctor: { name: 'Doctor', bubble: color.card },
  Patient: { name: 'Patient', bubble: color.accentSoft },
  Unknown: { name: 'Speaker', bubble: color.card },
};

function fmtTime(sec?: number) {
  if (sec === undefined) return null;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ChatBubble({
  line,
  showName,
  clipUri,
  playing,
}: {
  line: TranscriptLine;
  showName: boolean;
  /** Audio chunk URI backing this line, when available. */
  clipUri?: string;
  playing?: boolean;
}) {
  const meta = SPEAKER_META[line.speaker];
  const isPatient = line.speaker === 'Patient';
  const time = fmtTime(line.startTime);

  const bubble = (
    <View
      style={[
        styles.bubble,
        { backgroundColor: meta.bubble },
        isPatient ? styles.bubbleRight : styles.bubbleLeft,
      ]}>
      <View style={styles.bubbleInner}>
        {clipUri && (
          <View style={styles.playIcon}>
            {playing ? (
              <Square size={12} color={color.accent} fill={color.accent} strokeWidth={2} />
            ) : (
              <Play size={12} color={color.accent} fill={color.accent} strokeWidth={2} />
            )}
          </View>
        )}
        <T variant="secondary" style={styles.bubbleText}>
          {line.text}
        </T>
      </View>
    </View>
  );

  return (
    <View style={[styles.row, { alignItems: isPatient ? 'flex-end' : 'flex-start' }]}>
      {showName && (
        <View style={styles.nameRow}>
          <T variant="caption" tone="accent" style={styles.name}>
            {meta.name}
          </T>
          {time && (
            <T variant="caption" tone="faint">
              {time}
            </T>
          )}
        </View>
      )}
      {clipUri ? (
        <Pressable
          onPress={() => playClip(clipUri)}
          accessibilityRole="button"
          style={({ pressed }) => [styles.bubbleWrap, pressed && styles.pressed]}>
          {bubble}
        </Pressable>
      ) : (
        <View style={styles.bubbleWrap}>{bubble}</View>
      )}
    </View>
  );
}

export function TranscriptView({
  lines,
  chunks = [],
}: {
  lines: TranscriptLine[];
  chunks?: AudioChunk[];
}) {
  const [playingUri, setPlayingUri] = useState<string | null>(null);
  useEffect(() => onPlaybackChange(setPlayingUri), []);

  return (
    <View style={styles.container}>
      {lines.map((line, i) => {
        const clip = chunkForLine(line, chunks);
        return (
          <ChatBubble
            key={line.id}
            line={line}
            showName={lines[i - 1]?.speaker !== line.speaker}
            clipUri={clip?.uri}
            playing={!!clip && playingUri === clip.uri}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: space.s },
  row: { gap: space.xs },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space.s,
    paddingHorizontal: space.xs,
    marginTop: space.s,
  },
  name: { fontWeight: '600' },
  bubbleWrap: { maxWidth: '84%' },
  pressed: { transform: [{ scale: 0.98 }] },
  bubble: {
    paddingVertical: space.m,
    paddingHorizontal: space.l,
    borderRadius: radius.card,
    ...shadow,
  },
  bubbleLeft: { borderBottomLeftRadius: radius.button / 2 },
  bubbleRight: { borderBottomRightRadius: radius.button / 2 },
  bubbleInner: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  playIcon: {
    width: 22,
    height: 22,
    borderRadius: radius.chip,
    backgroundColor: color.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleText: { flexShrink: 1 },
});
