// A single differential — tier left-border + chip, diagnosis name, 2-line
// reasoning preview, evidence count badge, accept/dismiss icon buttons, and
// clinician feedback thumbs (item 6).

import { Check, Quote, ThumbsDown, ThumbsUp, X } from 'lucide-react-native';

import { Card, Chip, T } from '@/components/ui';
import { Pressable, View } from '@/tw';
import { tierMeta } from '@/theme';
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
      className="w-8 h-8 rounded-full border border-border bg-card items-center justify-center"
      style={({ pressed }) => [
        active && { backgroundColor: activeColor, borderColor: activeColor },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}>
      <Icon size={16} color={active ? '#FFFFFF' : '#5E6470'} strokeWidth={2.2} />
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
  const evidenceCount = [differential.transcript_reference, differential.guideline_reference].filter(
    Boolean
  ).length;

  return (
    <Card accent={tier.color} className={`gap-2 ${status === 'dismissed' ? 'opacity-45' : ''}`}>
      <View className="flex-row justify-between items-center">
        <Chip label={tier.label} tint={tier.color} soft={tier.soft} />
        <View className="flex-row gap-2">
          <IconButton icon={X} label="Dismiss" active={status === 'dismissed'} activeColor="#8C3A32" onPress={onDismiss} />
          <IconButton icon={Check} label="Accept" active={status === 'accepted'} activeColor="#0F6E6B" onPress={onAccept} />
        </View>
      </View>

      <T variant="body" className="font-semibold text-[19px] leading-[25px]">
        {differential.diagnosis}
      </T>
      <T variant="secondary" tone="secondary" numberOfLines={2}>
        {differential.reasoning}
      </T>

      <View className="flex-row justify-between items-center mt-1">
        <Pressable
          onPress={onPressEvidence}
          hitSlop={6}
          accessibilityRole="button"
          className="flex-row items-center gap-1 bg-accent-soft rounded-full px-3 py-1"
          style={({ pressed }) => pressed && { transform: [{ scale: 0.98 }] }}>
          <Quote size={13} color="#0F6E6B" strokeWidth={2.2} />
          <T variant="caption" tone="accent" className="font-semibold">
            Evidence · {evidenceCount}
          </T>
        </Pressable>
        <View className="flex-row gap-2">
          <IconButton icon={ThumbsUp} label="Helpful" active={vote === 'up'} activeColor="#0F6E6B" onPress={() => onVote('up')} />
          <IconButton icon={ThumbsDown} label="Not helpful" active={vote === 'down'} activeColor="#8C3A32" onPress={() => onVote('down')} />
        </View>
      </View>
    </Card>
  );
}
