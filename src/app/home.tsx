// Home — the doctor's daily entry point: greeting, two action tiles (start a
// consult / new patient), and recent consults derived from the patient store.
// Dashboard structure inspired by consumer-health apps, executed in
// clinical-calm tokens: no photos, no fake notifications, lucide only.

import { useRouter } from 'expo-router';
import { ChevronRight, Mic, Quote, Stethoscope, UserRoundPlus } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native';

import { Card, Chip, Rise, SectionHeader, T } from '@/components/ui';
import { useConsult } from '@/lib/store';
import { color, radius, space } from '@/theme';
import type { Patient } from '@/types/clinical';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function today() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function HomeScreen() {
  const router = useRouter();
  const patients = useConsult((s) => s.patients);
  const selectPatient = useConsult((s) => s.selectPatient);
  const reset = useConsult((s) => s.reset);

  const recent = patients.slice(0, 3);

  function openConsult(p: Patient) {
    selectPatient(p.id);
    reset();
    router.push('/consult');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Greeting header */}
      <Rise index={0}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <T variant="title" style={styles.greeting}>
              {greeting()}, Doctor
            </T>
            <T variant="secondary" tone="secondary">
              {today()}
            </T>
          </View>
          <View style={styles.avatar}>
            <Stethoscope size={20} color={color.accent} strokeWidth={2} />
          </View>
        </View>
      </Rise>

      {/* Action tiles — start consult is the dominant action */}
      <View style={styles.tiles}>
        <Rise index={1} style={{ flex: 1 }}>
          <Card onPress={() => router.push('/patients')} style={[styles.tile, styles.tilePrimary]}>
            <View style={[styles.tileIcon, styles.tileIconPrimary]}>
              <Mic size={20} color={color.onAccent} strokeWidth={2} />
            </View>
            <T variant="secondary" style={[styles.tileTitle, { color: color.onAccent }]}>
              Start a{'\n'}consult
            </T>
            <T variant="caption" style={{ color: color.onAccentSoft }}>
              Record & get a cited draft
            </T>
          </Card>
        </Rise>
        <Rise index={2} style={{ flex: 1 }}>
          <Card onPress={() => router.push('/new-patient')} style={styles.tile}>
            <View style={styles.tileIcon}>
              <UserRoundPlus size={20} color={color.accent} strokeWidth={2} />
            </View>
            <T variant="secondary" style={styles.tileTitle}>
              New{'\n'}patient
            </T>
            <T variant="caption" tone="secondary">
              Add a record, then consult
            </T>
          </Card>
        </Rise>
      </View>

      {/* Recent consults — from the patient store */}
      <SectionHeader
        title="Recent consults"
        trailing={
          <T variant="caption" tone="accent" style={styles.seeAll} onPress={() => router.push('/patients')}>
            See all
          </T>
        }
      />
      {recent.map((p, i) => (
        <Rise key={p.id} index={3 + i}>
          <Card onPress={() => openConsult(p)} style={styles.recentCard}>
            <View style={styles.recentAvatar}>
              <T variant="caption" style={styles.recentAvatarText}>
                {initials(p.name)}
              </T>
            </View>
            <View style={{ flex: 1 }}>
              <T variant="secondary" style={styles.recentName}>
                {p.name}
              </T>
              <T variant="caption" tone="secondary" numberOfLines={1}>
                {p.complaint ?? 'No chief complaint recorded'}
              </T>
            </View>
            <View style={styles.recentRight}>
              {p.lastVisit && <Chip label={p.lastVisit} tint={color.inkSecondary} soft={color.bg} />}
              <ChevronRight size={16} color={color.inkFaint} strokeWidth={2} />
            </View>
          </Card>
        </Rise>
      ))}

      {/* Quiet value-prop reminder */}
      <Rise index={6}>
        <View style={styles.banner}>
          <Quote size={16} color={color.accent} strokeWidth={2.2} />
          <T variant="caption" tone="secondary" style={{ flex: 1 }}>
            Every suggestion in a draft is cited — tap it to hear the patient say it.
          </T>
        </View>
      </Rise>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.bg },
  scroll: { padding: space.xl, gap: space.l, paddingBottom: space.xxl },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: space.l },
  greeting: { fontSize: 24, lineHeight: 32 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.chip,
    backgroundColor: color.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tiles: { flexDirection: 'row', gap: space.m },
  tile: { gap: space.s, minHeight: 140 },
  tilePrimary: { backgroundColor: color.accent },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.chip,
    backgroundColor: color.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.xs,
  },
  tileIconPrimary: { backgroundColor: color.heroChip },
  tileTitle: { fontWeight: '600', fontSize: 17, lineHeight: 23 },
  seeAll: { fontWeight: '600' },
  recentCard: { flexDirection: 'row', alignItems: 'center', gap: space.m },
  recentAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.chip,
    backgroundColor: color.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentAvatarText: { color: color.accent, fontWeight: '600' },
  recentName: { fontWeight: '600' },
  recentRight: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    backgroundColor: color.accentSoft,
    borderRadius: radius.card,
    padding: space.l,
  },
});
