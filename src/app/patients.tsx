import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useConsult } from '@/lib/store';
import type { Patient } from '@/types/clinical';

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const AVATAR_COLORS = ['#2563EB', '#059669', '#7C3AED', '#DB2777', '#D97706', '#0891B2'];
function colorFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
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
        <ThemedText style={styles.heading}>Select a patient</ThemedText>
        <ThemedText style={styles.subheading}>Choose an existing patient or add a new one.</ThemedText>

        <Pressable style={styles.newBtn} onPress={() => router.push('/new-patient')} accessibilityRole="button">
          <View style={styles.plusCircle}>
            <ThemedText style={styles.plus}>＋</ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText type="smallBold" style={styles.newTitle}>
              New Patient
            </ThemedText>
            <ThemedText type="small" style={styles.newSub}>
              Start a fresh record
            </ThemedText>
          </View>
        </Pressable>

        <ThemedText type="smallBold" style={styles.sectionLabel}>
          RECENT PATIENTS
        </ThemedText>

        {patients.map((p) => (
          <Pressable key={p.id} style={styles.card} onPress={() => openConsult(p)} accessibilityRole="button">
            <View style={[styles.avatar, { backgroundColor: colorFor(p.id) }]}>
              <ThemedText style={styles.avatarText}>{initials(p.name)}</ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="smallBold" style={styles.name}>
                {p.name}
              </ThemedText>
              <ThemedText type="small" style={styles.meta}>
                {[p.age && `${p.age}y`, p.sex].filter(Boolean).join(' · ')}
                {p.complaint ? `  ·  ${p.complaint}` : ''}
              </ThemedText>
            </View>
            <View style={styles.right}>
              {p.lastVisit && (
                <ThemedText type="small" style={styles.visit}>
                  {p.lastVisit}
                </ThemedText>
              )}
              <ThemedText style={styles.chevron}>›</ThemedText>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FC' },
  scroll: { padding: 20, gap: 12, paddingBottom: 32 },
  heading: { fontSize: 26, fontWeight: '800', color: '#0F172A' },
  subheading: { fontSize: 15, color: '#64748B', marginBottom: 6 },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DBE7FA',
    padding: 16,
  },
  plusCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0EDFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: { fontSize: 24, color: '#2563EB', lineHeight: 26 },
  newTitle: { fontSize: 16, color: '#1D4ED8' },
  newSub: { color: '#64748B' },
  sectionLabel: { color: '#94A3B8', letterSpacing: 0.6, fontSize: 11, marginTop: 10, marginLeft: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5EAF1',
    padding: 14,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  name: { fontSize: 16, color: '#0F172A' },
  meta: { color: '#64748B', marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 2 },
  visit: { color: '#94A3B8' },
  chevron: { fontSize: 22, color: '#CBD5E1', lineHeight: 22 },
});
