// Patients — searchable list of patient cards (avatar initials, meta chips,
// per-card consult CTA) with a FAB for adding a new patient. Card structure
// inspired by consumer-health doctor lists, executed in clinical-calm tokens:
// no photos, one accent, everything on the card is real and tappable.

import { useRouter } from 'expo-router';
import { CalendarClock, Plus, Search, Users } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Card, Chip, EmptyState, PrimaryButton, Rise, SectionHeader, T } from '@/components/ui';
import { useConsult } from '@/lib/store';
import { color, font, radius, shadow, space } from '@/theme';
import type { Patient } from '@/types/clinical';

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function PatientsScreen() {
  const router = useRouter();
  const patients = useConsult((s) => s.patients);
  const selectPatient = useConsult((s) => s.selectPatient);
  const reset = useConsult((s) => s.reset);

  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const filtered = q
    ? patients.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.complaint ?? '').toLowerCase().includes(q)
      )
    : patients;

  function openConsult(p: Patient) {
    selectPatient(p.id);
    reset();
    router.push('/consult');
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Search */}
        <View style={styles.searchBox}>
          <Search size={16} color={color.inkFaint} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search patients or complaints"
            placeholderTextColor={color.inkFaint}
            returnKeyType="search"
          />
        </View>

        <SectionHeader title={q ? 'Results' : 'Recent'} />

        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            text={
              q
                ? `No patients match “${query.trim()}”.`
                : 'No patients yet — add your first patient to begin.'
            }
            actionLabel={q ? undefined : 'New patient'}
            onAction={q ? undefined : () => router.push('/new-patient')}
          />
        ) : (
          filtered.map((p, i) => (
            <Rise key={p.id} index={i}>
              <Card style={styles.patientCard}>
                <View style={styles.topRow}>
                  <View style={styles.avatar}>
                    <T variant="secondary" style={styles.avatarText}>
                      {initials(p.name)}
                    </T>
                  </View>
                  <View style={{ flex: 1 }}>
                    <T variant="body" style={styles.name}>
                      {p.name}
                    </T>
                    <T variant="caption" tone="secondary">
                      {[p.age && `${p.age} years`, p.sex].filter(Boolean).join(' · ') ||
                        'No details recorded'}
                    </T>
                  </View>
                  {p.lastVisit && (
                    <Chip
                      label={p.lastVisit}
                      icon={CalendarClock}
                      tint={color.inkSecondary}
                      soft={color.bg}
                    />
                  )}
                </View>

                {p.complaint && (
                  <View style={styles.chipRow}>
                    <Chip label={p.complaint} />
                  </View>
                )}

                <PrimaryButton
                  label="Start consult"
                  onPress={() => openConsult(p)}
                  style={styles.consultBtn}
                />
              </Card>
            </Rise>
          ))
        )}
      </ScrollView>

      {/* FAB — new patient */}
      <Pressable
        onPress={() => router.push('/new-patient')}
        accessibilityRole="button"
        accessibilityLabel="New patient"
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
        <Plus size={26} color={color.onAccent} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.bg },
  scroll: { padding: space.xl, gap: space.m, paddingBottom: 112 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s,
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.button,
    paddingHorizontal: space.l,
  },
  searchInput: {
    flex: 1,
    paddingVertical: space.m,
    ...font.secondary,
    color: color.ink,
  },
  patientCard: { gap: space.m },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: space.m },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.chip,
    backgroundColor: color.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: color.accent, fontWeight: '600' },
  name: { fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  consultBtn: { minHeight: 44, paddingVertical: space.m },
  fab: {
    position: 'absolute',
    right: space.xl,
    bottom: space.xxl,
    width: 56,
    height: 56,
    borderRadius: radius.chip,
    backgroundColor: color.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  fabPressed: { transform: [{ scale: 0.98 }] },
});
