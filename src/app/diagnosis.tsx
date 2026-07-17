// Differential draft — red-flag banner pinned top, tier sections, "Not yet
// ruled out" gap detection, deferential assessment alignment, and the
// suggested-workup checklist. Every card opens its cited evidence.

import { useRouter } from 'expo-router';
import {
  CircleCheck,
  ClipboardList,
  FileQuestion,
  HeartHandshake,
  SearchX,
  TriangleAlert,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';

import { DifferentialCard, type DiffStatus } from '@/components/DifferentialCard';
import { EvidenceModal } from '@/components/EvidenceModal';
import { Card, EmptyState, PrimaryButton, Rise, SectionHeader, T } from '@/components/ui';
import { useConsult } from '@/lib/store';
import { ScrollView, View } from '@/tw';
import { tierMeta } from '@/theme';
import type { Differential, DifferentialTier } from '@/types/clinical';

const TIER_ORDER: DifferentialTier[] = ['most_likely', 'expanded', 'cant_miss'];

export default function DiagnosisScreen() {
  const router = useRouter();
  const diagnosis = useConsult((s) => s.diagnosis);
  const feedback = useConsult((s) => s.feedback);
  const setFeedback = useConsult((s) => s.setFeedback);

  const [statuses, setStatuses] = useState<Record<number, DiffStatus>>({});
  const [evidence, setEvidence] = useState<Differential | null>(null);

  // Keyed index so accept/dismiss and feedback map back to a stable differential.
  const indexed = useMemo(
    () => (diagnosis?.differentials ?? []).map((d, i) => ({ d, i })),
    [diagnosis]
  );

  if (!diagnosis) {
    return (
      <View className="flex-1 bg-bg justify-center">
        <EmptyState
          icon={FileQuestion}
          text="No differential draft yet — analyze a consult first."
          actionLabel="Back to patients"
          onAction={() => router.replace('/patients')}
        />
      </View>
    );
  }

  const setStatus = (i: number, s: DiffStatus) =>
    setStatuses((prev) => ({ ...prev, [i]: prev[i] === s ? 'pending' : s }));

  let riseIndex = 0;

  return (
    <View className="flex-1 bg-bg">
      {/* Red flags — pinned top */}
      {diagnosis.red_flags.length > 0 && (
        <View className="flex-row items-center gap-2 bg-red-flag-bg px-4 py-2">
          <TriangleAlert size={16} color="#8C3A32" strokeWidth={2.2} />
          <T variant="caption" tone="danger" className="flex-1 font-semibold" numberOfLines={2}>
            {diagnosis.red_flags.join('  ·  ')}
          </T>
        </View>
      )}

      <ScrollView contentContainerClassName="p-4 gap-4 pb-6">
        <T variant="caption" tone="faint">
          Second-opinion draft — every item is grounded in the consult and guidelines. Tap Evidence
          to hear the source. Requires doctor sign-off.
        </T>

        {TIER_ORDER.map((tierKey) => {
          const group = indexed.filter(({ d }) => d.tier === tierKey);
          if (!group.length) return null;
          return (
            <View key={tierKey} className="gap-3">
              <SectionHeader title={tierMeta[tierKey].label} />
              {group.map(({ d, i }) => (
                <Rise key={i} index={riseIndex++}>
                  <DifferentialCard
                    differential={d}
                    status={statuses[i] ?? 'pending'}
                    vote={feedback[i]?.vote}
                    onPressEvidence={() => setEvidence(d)}
                    onAccept={() => setStatus(i, 'accepted')}
                    onDismiss={() => setStatus(i, 'dismissed')}
                    onVote={(v) => setFeedback(i, feedback[i]?.vote === v ? null : v)}
                  />
                </Rise>
              ))}
            </View>
          );
        })}

        {/* Item 3 — gap detection */}
        {diagnosis.gaps.length > 0 && (
          <View className="gap-3">
            <SectionHeader title="Not yet ruled out" />
            {diagnosis.gaps.map((g, i) => (
              <Rise key={i} index={riseIndex++}>
                <Card accent="#8A6D1D" className="gap-2">
                  <View className="flex-row items-center gap-2">
                    <SearchX size={16} color="#8A6D1D" strokeWidth={2.2} />
                    <T variant="secondary" className="font-semibold">
                      {g.missedItem}
                    </T>
                  </View>
                  <T variant="secondary" tone="secondary">
                    {g.whyItMatters}
                  </T>
                  <View className="bg-bg rounded-button p-3 gap-1">
                    <T variant="caption" tone="secondary" className="font-semibold tracking-wide">
                      SUGGESTED QUESTION
                    </T>
                    <T variant="secondary" className="italic">
                      “{g.suggestedQuestion}”
                    </T>
                  </View>
                </Card>
              </Rise>
            ))}
          </View>
        )}

        {/* Item 4 — assessment alignment (deferential, never grading) */}
        {!!diagnosis.alignment.agreement && (
          <View className="gap-3">
            <SectionHeader title="Assessment alignment" />
            <Rise index={riseIndex++}>
              <Card className="gap-2">
                <View className="flex-row items-center gap-2">
                  <HeartHandshake size={16} color="#0F6E6B" strokeWidth={2.2} />
                  <T variant="secondary" className="font-semibold">
                    In agreement
                  </T>
                </View>
                <T variant="secondary" tone="secondary">
                  {diagnosis.alignment.agreement}
                </T>
                {diagnosis.alignment.additional_considerations.map((a, i) => (
                  <View key={i} className="flex-row gap-2 items-start">
                    <CircleCheck size={14} color="#0F6E6B" strokeWidth={2.2} style={{ marginTop: 4 }} />
                    <T variant="secondary" tone="secondary" className="flex-1">
                      {a}
                    </T>
                  </View>
                ))}
              </Card>
            </Rise>
          </View>
        )}

        {/* Suggested workup — checklist card */}
        {diagnosis.suggested_workup.length > 0 && (
          <View className="gap-3">
            <SectionHeader title="Suggested workup" />
            <Rise index={riseIndex++}>
              <Card className="gap-2">
                {diagnosis.suggested_workup.map((w, i) => (
                  <View key={i} className="flex-row gap-2 items-start">
                    <ClipboardList size={14} color="#5E6470" strokeWidth={2.2} style={{ marginTop: 4 }} />
                    <T variant="secondary" className="flex-1">
                      {w}
                    </T>
                  </View>
                ))}
              </Card>
            </Rise>
          </View>
        )}
      </ScrollView>

      <View className="p-4 bg-card border-t border-border">
        <PrimaryButton label="Finish & start new consult" onPress={() => router.replace('/home')} />
      </View>

      <EvidenceModal differential={evidence} visible={!!evidence} onClose={() => setEvidence(null)} />
    </View>
  );
}
