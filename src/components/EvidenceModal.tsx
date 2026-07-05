// Evidence bottom sheet — THE demo feature. Shows the exact transcript quote
// (with a play button that plays the recorded audio clip it came from) and the
// guideline excerpt in a bordered block with source label. Blurred backdrop
// (glass surface #2).

import { BlurView } from 'expo-blur';
import { BookOpen, Play, Square } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { PrimaryButton, T } from '@/components/ui';
import { onPlaybackChange, playClip, stopClip } from '@/lib/audio';
import { chunkForLine, findLineForQuote } from '@/lib/evidence';
import { useConsult } from '@/lib/store';
import { color, radius, space, tierMeta } from '@/theme';
import type { Differential } from '@/types/clinical';

interface Props {
  differential: Differential | null;
  visible: boolean;
  onClose: () => void;
}

function QuoteBlock({
  label,
  quote,
  clipUri,
  playing,
}: {
  label: string;
  quote: string;
  clipUri?: string;
  playing?: boolean;
}) {
  return (
    <View style={styles.quoteBlock}>
      <View style={styles.quoteLabelRow}>
        <BookOpen size={13} color={color.inkSecondary} strokeWidth={2.2} />
        <T variant="caption" tone="secondary" style={styles.quoteLabel}>
          {label.toUpperCase()}
        </T>
      </View>
      <View style={styles.quoteBox}>
        {clipUri && (
          <Pressable
            onPress={() => playClip(clipUri)}
            accessibilityRole="button"
            accessibilityLabel="Play audio clip"
            style={({ pressed }) => [styles.playBtn, pressed && styles.pressed]}>
            {playing ? (
              <Square size={16} color={color.onAccent} fill={color.onAccent} strokeWidth={2} />
            ) : (
              <Play size={16} color={color.onAccent} fill={color.onAccent} strokeWidth={2} />
            )}
          </Pressable>
        )}
        <T variant="secondary" style={styles.quoteText}>
          “{quote}”
        </T>
      </View>
    </View>
  );
}

export function EvidenceModal({ differential, visible, onClose }: Props) {
  const transcript = useConsult((s) => s.transcript);
  const chunks = useConsult((s) => s.chunks);
  const [playingUri, setPlayingUri] = useState<string | null>(null);
  useEffect(() => onPlaybackChange(setPlayingUri), []);

  // Resolve the transcript quote back to its line and recorded audio chunk.
  const line = differential
    ? findLineForQuote(differential.transcript_reference, transcript?.lines ?? [])
    : null;
  const clip = chunkForLine(line, chunks);

  function close() {
    stopClip();
    onClose();
  }

  const tier = differential ? tierMeta[differential.tier] : null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <BlurView intensity={16} tint="dark" style={styles.backdropBlur}>
        <Pressable style={styles.backdrop} onPress={close}>
          <Pressable style={styles.sheetWrap} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              {differential && (
                <ScrollView contentContainerStyle={styles.content}>
                  {tier && (
                    <T variant="caption" style={[styles.tierLabel, { color: tier.color }]}>
                      {tier.label.toUpperCase()}
                    </T>
                  )}
                  <T variant="title" style={styles.title}>
                    {differential.diagnosis}
                  </T>
                  <T variant="secondary" tone="secondary">
                    {differential.reasoning}
                  </T>

                  <QuoteBlock
                    label="From this consult — tap to hear"
                    quote={differential.transcript_reference}
                    clipUri={clip?.uri}
                    playing={!!clip && playingUri === clip.uri}
                  />
                  <QuoteBlock label="Clinical guideline" quote={differential.guideline_reference} />

                  <T variant="caption" tone="faint">
                    Draft for licensed-doctor review. Not a diagnosis.
                  </T>
                </ScrollView>
              )}
              <PrimaryButton label="Close" onPress={close} variant="quiet" />
            </View>
          </Pressable>
        </Pressable>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdropBlur: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: color.scrim, justifyContent: 'flex-end' },
  sheetWrap: { width: '100%' },
  sheet: {
    backgroundColor: color.card,
    borderTopLeftRadius: radius.card + space.s,
    borderTopRightRadius: radius.card + space.s,
    padding: space.xl,
    paddingTop: space.m,
    maxHeight: '85%',
    gap: space.l,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.chip,
    backgroundColor: color.borderStrong,
  },
  content: { gap: space.m, paddingBottom: space.s },
  tierLabel: { fontWeight: '600', letterSpacing: 0.6 },
  title: { fontSize: 24, lineHeight: 31 },
  quoteBlock: { gap: space.s, marginTop: space.s },
  quoteLabelRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  quoteLabel: { fontWeight: '600', letterSpacing: 0.6 },
  quoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    borderLeftWidth: 3,
    borderLeftColor: color.accent,
    backgroundColor: color.bg,
    borderRadius: radius.button,
    padding: space.l,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.chip,
    backgroundColor: color.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { transform: [{ scale: 0.98 }] },
  quoteText: { flex: 1, fontStyle: 'italic' },
});
