// Home — the doctor's daily entry point: greeting, two action tiles (start a
// consult / new patient), and recent consults derived from the patient store.
// Dashboard structure inspired by consumer-health apps, executed in
// clinical-calm tokens: no photos, no fake notifications, lucide only.

import { useRouter } from 'expo-router';
import { ChevronRight, Mic, Quote, Stethoscope, UserRoundPlus } from 'lucide-react-native';

import { Card, Chip, Rise, SectionHeader, T } from '@/components/ui';
import { useConsult } from '@/lib/store';
import { ScrollView, View } from '@/tw';
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
    <ScrollView className="flex-1 bg-bg" contentContainerClassName="p-6 gap-4 pb-8">
      {/* Greeting header */}
      <Rise index={0}>
        <View className="flex-row items-center gap-4">
          <View className="flex-1">
            <T variant="title" className="text-2xl leading-8">
              {greeting()}, Doctor
            </T>
            <T variant="secondary" tone="secondary">
              {today()}
            </T>
          </View>
          <View className="w-11 h-11 rounded-full bg-accent-soft items-center justify-center">
            <Stethoscope size={20} color="#0F6E6B" strokeWidth={2} />
          </View>
        </View>
      </Rise>

      {/* Action tiles — start consult is the dominant action */}
      <View className="flex-row gap-3">
        <Rise index={1} style={{ flex: 1 }}>
          <Card onPress={() => router.push('/patients')} className="gap-2 min-h-[140px] bg-accent">
            <View className="w-10 h-10 rounded-full bg-hero-chip items-center justify-center mb-1">
              <Mic size={20} color="#FFFFFF" strokeWidth={2} />
            </View>
            <T variant="secondary" className="font-semibold text-[17px] leading-[23px] text-on-accent">
              Start a{'\n'}consult
            </T>
            <T variant="caption" style={{ color: 'rgba(255,255,255,0.78)' }}>
              Record & get a cited draft
            </T>
          </Card>
        </Rise>
        <Rise index={2} style={{ flex: 1 }}>
          <Card onPress={() => router.push('/new-patient')} className="gap-2 min-h-[140px]">
            <View className="w-10 h-10 rounded-full bg-accent-soft items-center justify-center mb-1">
              <UserRoundPlus size={20} color="#0F6E6B" strokeWidth={2} />
            </View>
            <T variant="secondary" className="font-semibold text-[17px] leading-[23px]">
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
          <T variant="caption" tone="accent" className="font-semibold" onPress={() => router.push('/patients')}>
            See all
          </T>
        }
      />
      {recent.map((p, i) => (
        <Rise key={p.id} index={3 + i}>
          <Card onPress={() => openConsult(p)} className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-accent-soft items-center justify-center">
              <T variant="caption" className="font-semibold text-accent">
                {initials(p.name)}
              </T>
            </View>
            <View className="flex-1">
              <T variant="secondary" className="font-semibold">
                {p.name}
              </T>
              <T variant="caption" tone="secondary" numberOfLines={1}>
                {p.complaint ?? 'No chief complaint recorded'}
              </T>
            </View>
            <View className="flex-row items-center gap-2">
              {p.lastVisit && <Chip label={p.lastVisit} tint="#5E6470" soft="#FAF9F6" />}
              <ChevronRight size={16} color="#9AA0AA" strokeWidth={2} />
            </View>
          </Card>
        </Rise>
      ))}

      {/* Quiet value-prop reminder */}
      <Rise index={6}>
        <View className="flex-row items-center gap-3 bg-accent-soft rounded-card p-4">
          <Quote size={16} color="#0F6E6B" strokeWidth={2.2} />
          <T variant="caption" tone="secondary" className="flex-1">
            Every suggestion in a draft is cited — tap it to hear the patient say it.
          </T>
        </View>
      </Rise>
    </ScrollView>
  );
}
