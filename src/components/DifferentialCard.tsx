// A single differential — tier left-border + chip, diagnosis name, 2-line
// reasoning preview, evidence count badge, accept/dismiss icon buttons, and
// clinician feedback thumbs (item 6).

import { Check, Quote, ThumbsDown, ThumbsUp, X } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Chip, T } from '@/components/ui';
import { color, radius, space, tierMeta } from '@/theme';
import type { Differential, FeedbackVote } from '@/types/clinical';

export type DiffStatus = 'pending' | 'accepted' | 'dismissed';

interface Props {
  differential: Differential;
  status: DiffStatus;
  vote?: FeedbackVote;
  onPressEvidence: () => void;
  onAccept: () => void;
  onDismiss: () => void;
  onVote: (v: FeedbackVote) => void;
}

function IconButton({
  icon: Icon,
  active,
  activeColor,
  onPress,
  label,
}: {
  icon: typeof Check;
  active: boolean;
  activeColor: string;
  onPress: () => void;
  label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.iconBtn,
        active && { backgroundColor: activeColor, borderColor: activeColor },
        pressed && styles.pressed,
      ]}>
      <Icon size={16} color={active ? color.onAccent : color.inkSecondary} strokeWidth={2.2} />
    </Pressable>
  );
}

export function DifferentialCard({
  differential,
  status,
  vote,
  onPressEvidence,
  onAccept,
  onDismiss,
  onVote,
}: Props) {
  const tier = tierMeta[differential.tier];
  const evidenceCount = [differential.transcript_reference, differential.guideline_reference].filter(Boolean).length;

  return (
    <Card accent={tier.color} style={[styles.card, status === 'dismissed' && styles.dimmed]}>
      <View style={styles.headerRow}>
        <Chip label={tier.label} tint={tier.color} soft={tier.soft} />
        <View style={styles.actions}>
          <IconButton icon={X} label="Dismiss" active={status === 'dismissed'} activeColor={color.tierCantMiss} onPress={onDismiss} />
          <IconButton icon={Check} label="Accept" active={status === 'accepted'} activeColor={color.accent} onPress={onAccept} />
        </View>
      </View>

      <T variant="body" style={styles.diagnosis}>
        {differential.diagnosis}
      </T>
      <T variant="secondary" tone="secondary" numberOfLines={2}>
        {differential.reasoning}
      </T>

      <View style={styles.footerRow}>
        <Pressable
          onPress={onPressEvidence}
          hitSlop={6}
          accessibilityRole="button"
          style={({ pressed }) => [styles.evidenceBtn, pressed && styles.pressed]}>
          <Quote size={13} color={color.accent} strokeWidth={2.2} />
          <T variant="caption" tone="accent" style={{ fontWeight: '600' }}>
            Evidence · {evidenceCount}
          </T>
        </Pressable>
        <View style={styles.thumbs}>
          <IconButton icon={ThumbsUp} label="Helpful" active={vote === 'up'} activeColor={color.accent} onPress={() => onVote('up')} />
          <IconButton icon={ThumbsDown} label="Not helpful" active={vote === 'down'} activeColor={color.tierCantMiss} onPress={() => onVote('down')} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.s },
  dimmed: { opacity: 0.45 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actions: { flexDirection: 'row', gap: space.s },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { transform: [{ scale: 0.98 }] },
  diagnosis: { fontWeight: '600', fontSize: 19, lineHeight: 25 },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.xs,
  },
  evidenceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: color.accentSoft,
    borderRadius: radius.chip,
    paddingHorizontal: space.m,
    paddingVertical: space.xs,
  },
  thumbs: { flexDirection: 'row', gap: space.s },
});
