// Patients — list of patient cards with avatar initials, meta line, and a FAB
// for adding a new patient.

import { useRouter } from 'expo-router';
import { Plus, Users } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Card, EmptyState, Rise, SectionHeader, T } from '@/components/ui';
import { useConsult } from '@/lib/store';
import { color, radius, shadow, space } from '@/theme';
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

  function openConsult(p: Patient) {
    selectPatient(p.id);
    reset();
    router.push('/consult');
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <T variant="title">Patients</T>
        <T variant="secondary" tone="secondary">
          Choose a patient to start a consult.
        </T>

        <SectionHeader title="Recent" />

        {patients.length === 0 ? (
          <EmptyState
            icon={Users}
            text="No patients yet — add your first patient to begin."
            actionLabel="New patient"
            onAction={() => router.push('/new-patient')}
          />
        ) : (
          patients.map((p, i) => (
            <Rise key={p.id} index={i}>
              <Card onPress={() => openConsult(p)} style={styles.patientCard}>
                <View style={styles.avatar}>
                  <T variant="secondary" style={styles.avatarText}>
                    {initials(p.name)}
                  </T>
                </View>
                <View style={{ flex: 1 }}>
                  <T variant="body" style={styles.name}>
                    {p.name}
                  </T>
                  <T variant="caption" tone="secondary" numberOfLines={1}>
                    {[p.age && `${p.age}y`, p.sex, p.complaint].filter(Boolean).join(' · ')}
                  </T>
                </View>
                {p.lastVisit && (
                  <T variant="caption" tone="faint">
                    {p.lastVisit}
                  </T>
                )}
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
  patientCard: { flexDirection: 'row', alignItems: 'center', gap: space.l },
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
