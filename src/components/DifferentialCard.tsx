// A single differential diagnosis row with tier badge, evidence-tap, and the
// doctor's accept / dismiss controls.

import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import type { Differential, DifferentialTier } from '@/types/clinical';

export type DiffStatus = 'pending' | 'accepted' | 'dismissed';

const TIER_META: Record<DifferentialTier, { label: string; color: string; bg: string }> = {
  most_likely: { label: 'MOST LIKELY', color: '#065F46', bg: '#D1FAE5' },
  expanded: { label: 'EXPANDED', color: '#1E3A8A', bg: '#DBEAFE' },
  cant_miss: { label: "CAN'T MISS", color: '#991B1B', bg: '#FEE2E2' },
};

interface Props {
  differential: Differential;
  status: DiffStatus;
  onPressEvidence: () => void;
  onAccept: () => void;
  onDismiss: () => void;
}

export function DifferentialCard({ differential, status, onPressEvidence, onAccept, onDismiss }: Props) {
  const tier = TIER_META[differential.tier];
  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.card, status === 'dismissed' && styles.dimmed]}>
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: tier.bg }]}>
          <ThemedText type="smallBold" style={[styles.badgeText, { color: tier.color }]}>
            {tier.label}
          </ThemedText>
        </View>
        {status === 'accepted' && <ThemedText style={styles.statusAccepted}>✓ Accepted</ThemedText>}
        {status === 'dismissed' && <ThemedText style={styles.statusDismissed}>Dismissed</ThemedText>}
      </View>

      <ThemedText type="subtitle" style={styles.diagnosis}>
        {differential.diagnosis}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.reasoning}>
        {differential.reasoning}
      </ThemedText>

      <Pressable onPress={onPressEvidence} style={styles.evidenceBtn} hitSlop={6}>
        <ThemedText type="linkPrimary">🔍 Tap to see evidence</ThemedText>
      </Pressable>

      <View style={styles.actions}>
        <Pressable
          onPress={onDismiss}
          style={[styles.actionBtn, styles.dismissBtn]}
          accessibilityRole="button">
          <ThemedText type="smallBold" style={{ color: '#991B1B' }}>
            Dismiss
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={onAccept}
          style={[styles.actionBtn, styles.acceptBtn]}
          accessibilityRole="button">
          <ThemedText type="smallBold" style={{ color: '#fff' }}>
            Accept
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, gap: 8 },
  dimmed: { opacity: 0.5 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, letterSpacing: 0.5 },
  statusAccepted: { color: '#047857', fontWeight: '700', fontSize: 13 },
  statusDismissed: { color: '#991B1B', fontWeight: '700', fontSize: 13 },
  diagnosis: { fontSize: 22, lineHeight: 28 },
  reasoning: { fontSize: 14, lineHeight: 20 },
  evidenceBtn: { paddingVertical: 4 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  dismissBtn: { backgroundColor: '#FEE2E2' },
  acceptBtn: { backgroundColor: '#059669' },
});
