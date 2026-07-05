import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { DifferentialCard, type DiffStatus } from '@/components/DifferentialCard';
import { EvidenceModal } from '@/components/EvidenceModal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useConsult } from '@/lib/store';
import type { Differential } from '@/types/clinical';

const TIER_ORDER: Array<{ key: Differential['tier']; label: string }> = [
  { key: 'most_likely', label: 'Most likely' },
  { key: 'expanded', label: 'Expanded differential' },
  { key: 'cant_miss', label: "Can't-miss" },
];

export default function DiagnosisScreen() {
  const router = useRouter();
  const diagnosis = useConsult((s) => s.diagnosis);

  const [statuses, setStatuses] = useState<Record<number, DiffStatus>>({});
  const [evidence, setEvidence] = useState<Differential | null>(null);

  // Keyed index so accept/dismiss maps back to a stable differential.
  const indexed = useMemo(
    () => (diagnosis?.differentials ?? []).map((d, i) => ({ d, i })),
    [diagnosis]
  );

  if (!diagnosis) {
    return (
      <ThemedView style={styles.empty}>
        <ThemedText themeColor="textSecondary">No differential yet.</ThemedText>
      </ThemedView>
    );
  }

  const setStatus = (i: number, s: DiffStatus) =>
    setStatuses((prev) => ({ ...prev, [i]: prev[i] === s ? 'pending' : s }));

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.banner}>
          Second-opinion draft. Every item is grounded in the transcript and guidelines — tap a card
          for evidence. Requires doctor sign-off.
        </ThemedText>

        {TIER_ORDER.map(({ key, label }) => {
          const group = indexed.filter(({ d }) => d.tier === key);
          if (!group.length) return null;
          return (
            <View key={key} style={styles.tierGroup}>
              <ThemedText type="subtitle" style={styles.tierLabel}>
                {label}
              </ThemedText>
              {group.map(({ d, i }) => (
                <DifferentialCard
                  key={i}
                  differential={d}
                  status={statuses[i] ?? 'pending'}
                  onPressEvidence={() => setEvidence(d)}
                  onAccept={() => setStatus(i, 'accepted')}
                  onDismiss={() => setStatus(i, 'dismissed')}
                />
              ))}
            </View>
          );
        })}

        <View style={styles.listCard}>
          <ThemedText type="smallBold" style={styles.listHeading}>
            SUGGESTED WORKUP
          </ThemedText>
          {diagnosis.suggested_workup.map((w, i) => (
            <ThemedText key={i} style={styles.listItem}>
              • {w}
            </ThemedText>
          ))}
        </View>

        <View style={[styles.listCard, styles.redCard]}>
          <ThemedText type="smallBold" style={[styles.listHeading, { color: '#991B1B' }]}>
            RED FLAGS
          </ThemedText>
          {diagnosis.red_flags.map((r, i) => (
            <ThemedText key={i} style={[styles.listItem, { color: '#991B1B' }]}>
              • {r}
            </ThemedText>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.doneBtn} onPress={() => router.replace('/')}>
          <ThemedText type="smallBold" style={{ color: '#fff' }}>
            Finish & start new consult
          </ThemedText>
        </Pressable>
      </View>

      <EvidenceModal differential={evidence} visible={!!evidence} onClose={() => setEvidence(null)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  scroll: { padding: 20, gap: 16, paddingBottom: 24 },
  banner: { lineHeight: 18 },
  tierGroup: { gap: 12 },
  tierLabel: { fontSize: 20 },
  listCard: { backgroundColor: '#F0F0F3', borderRadius: 16, padding: 16, gap: 6 },
  redCard: { backgroundColor: '#FEE2E2' },
  listHeading: { fontSize: 11, letterSpacing: 0.5, color: '#374151' },
  listItem: { fontSize: 15, lineHeight: 21 },
  footer: { padding: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E5E7EB' },
  doneBtn: { backgroundColor: '#059669', paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
});
