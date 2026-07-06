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
import { ScrollView, StyleSheet, View } from 'react-native';

import { DifferentialCard, type DiffStatus } from '@/components/DifferentialCard';
import { EvidenceModal } from '@/components/EvidenceModal';
import { Card, EmptyState, PrimaryButton, Rise, SectionHeader, T } from '@/components/ui';
import { useConsult } from '@/lib/store';
import { color, radius, space, tierMeta } from '@/theme';
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
      <View style={styles.emptyScreen}>
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
    <View style={styles.container}>
      {/* Red flags — pinned top */}
      {diagnosis.red_flags.length > 0 && (
        <View style={styles.redBanner}>
          <TriangleAlert size={16} color={color.redFlagText} strokeWidth={2.2} />
          <T variant="caption" tone="danger" style={styles.redBannerText} numberOfLines={2}>
            {diagnosis.red_flags.join('  ·  ')}
          </T>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scroll}>
        <T variant="caption" tone="faint">
          Second-opinion draft — every item is grounded in the consult and guidelines. Tap Evidence
          to hear the source. Requires doctor sign-off.
        </T>

        {TIER_ORDER.map((tierKey) => {
          const group = indexed.filter(({ d }) => d.tier === tierKey);
          if (!group.length) return null;
          return (
            <View key={tierKey} style={styles.tierGroup}>
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
          <View style={styles.tierGroup}>
            <SectionHeader title="Not yet ruled out" />
            {diagnosis.gaps.map((g, i) => (
              <Rise key={i} index={riseIndex++}>
                <Card accent={color.tierExpanded} style={styles.gapCard}>
                  <View style={styles.gapHeader}>
                    <SearchX size={16} color={color.tierExpanded} strokeWidth={2.2} />
                    <T variant="secondary" style={styles.gapTitle}>
                      {g.missedItem}
                    </T>
                  </View>
                  <T variant="secondary" tone="secondary">
                    {g.whyItMatters}
                  </T>
                  <View style={styles.gapQuestion}>
                    <T variant="caption" tone="secondary" style={styles.gapQuestionLabel}>
                      SUGGESTED QUESTION
                    </T>
                    <T variant="secondary" style={{ fontStyle: 'italic' }}>
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
          <View style={styles.tierGroup}>
            <SectionHeader title="Assessment alignment" />
            <Rise index={riseIndex++}>
              <Card style={styles.gapCard}>
                <View style={styles.gapHeader}>
                  <HeartHandshake size={16} color={color.accent} strokeWidth={2.2} />
                  <T variant="secondary" style={styles.gapTitle}>
                    In agreement
                  </T>
                </View>
                <T variant="secondary" tone="secondary">
                  {diagnosis.alignment.agreement}
                </T>
                {diagnosis.alignment.additional_considerations.map((a, i) => (
                  <View key={i} style={styles.considerRow}>
                    <CircleCheck size={14} color={color.accent} strokeWidth={2.2} style={styles.considerIcon} />
                    <T variant="secondary" tone="secondary" style={{ flex: 1 }}>
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
          <View style={styles.tierGroup}>
            <SectionHeader title="Suggested workup" />
            <Rise index={riseIndex++}>
              <Card style={styles.gapCard}>
                {diagnosis.suggested_workup.map((w, i) => (
                  <View key={i} style={styles.considerRow}>
                    <ClipboardList size={14} color={color.inkSecondary} strokeWidth={2.2} style={styles.considerIcon} />
                    <T variant="secondary" style={{ flex: 1 }}>
                      {w}
                    </T>
                  </View>
                ))}
              </Card>
            </Rise>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="Finish & start new consult" onPress={() => router.replace('/home')} />
      </View>

      <EvidenceModal differential={evidence} visible={!!evidence} onClose={() => setEvidence(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.bg },
  emptyScreen: { flex: 1, backgroundColor: color.bg, justifyContent: 'center' },
  redBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s,
    backgroundColor: color.redFlagBg,
    paddingHorizontal: space.l,
    paddingVertical: space.s,
  },
  redBannerText: { flex: 1, fontWeight: '600' },
  scroll: { padding: space.l, gap: space.l, paddingBottom: space.xl },
  tierGroup: { gap: space.m },
  gapCard: { gap: space.s },
  gapHeader: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  gapTitle: { fontWeight: '600' },
  gapQuestion: {
    backgroundColor: color.bg,
    borderRadius: radius.button,
    padding: space.m,
    gap: space.xs,
  },
  gapQuestionLabel: { fontWeight: '600', letterSpacing: 0.6 },
  considerRow: { flexDirection: 'row', gap: space.s, alignItems: 'flex-start' },
  considerIcon: { marginTop: space.xs },
  footer: {
    padding: space.l,
    backgroundColor: color.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.border,
  },
});
