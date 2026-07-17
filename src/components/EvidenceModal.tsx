// Evidence bottom sheet — THE demo feature. Shows the exact transcript quote
// (with a play button that plays the recorded audio clip it came from) and the
// guideline excerpt in a bordered block with source label. Blurred backdrop
// (glass surface #2).

import { BlurView } from 'expo-blur';
import { BookOpen, Play, Square } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet } from 'react-native';

import { PrimaryButton, T } from '@/components/ui';
import { onPlaybackChange, playClip, stopClip } from '@/lib/audio';
import { chunkForLine, findLineForQuote } from '@/lib/evidence';
import { useConsult } from '@/lib/store';
import { Pressable, ScrollView, View } from '@/tw';
import { tierMeta } from '@/theme';
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
    <View className="gap-2 mt-2">
      <View className="flex-row items-center gap-1">
        <BookOpen size={13} color="#5E6470" strokeWidth={2.2} />
        <T variant="caption" tone="secondary" className="font-semibold tracking-wide">
          {label.toUpperCase()}
        </T>
      </View>
      <View className="flex-row items-center gap-3 border-l-[3px] border-l-accent bg-bg rounded-button p-4">
        {clipUri && (
          <Pressable
            onPress={() => playClip(clipUri)}
            accessibilityRole="button"
            accessibilityLabel="Play audio clip"
            className="w-10 h-10 rounded-full bg-accent items-center justify-center"
            style={({ pressed }) => pressed && { transform: [{ scale: 0.98 }] }}>
            {playing ? (
              <Square size={16} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2} />
            ) : (
              <Play size={16} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2} />
            )}
          </Pressable>
        )}
        <T variant="secondary" className="flex-1 italic">
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
        <Pressable className="flex-1 justify-end" style={styles.backdrop} onPress={close}>
          <Pressable className="w-full" onPress={(e) => e.stopPropagation()}>
            <View className="bg-card rounded-t-[24px] px-6 pt-3 pb-6 max-h-[85%] gap-4">
              <View className="self-center w-10 h-1 rounded-full bg-border-strong" />
              {differential && (
                <ScrollView contentContainerClassName="gap-3 pb-2">
                  {tier && (
                    <T variant="caption" className="font-semibold tracking-wide" style={{ color: tier.color }}>
                      {tier.label.toUpperCase()}
                    </T>
                  )}
                  <T variant="title" className="text-2xl leading-[31px]">
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
  backdrop: { backgroundColor: 'rgba(26,29,31,0.35)' },
});
