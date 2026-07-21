// Home — the doctor's daily entry point, re-cut in the dark "MobileCode"
// aesthetic (reference: greeting + large light headline + a composer pinned at
// the bottom with a "+" and a send button). Functionality is unchanged: the
// composer starts a consult (routes into patient pick), "+" adds a patient, and
// recent consults come from the patient store. Built on src/components/mc.tsx.

import { useRouter } from 'expo-router';
import { ChevronRight, Stethoscope, UserRound, UserRoundPlus } from 'lucide-react-native';
import { useState } from 'react';

import { MC, MCBackground, MCComposer, MCText } from '@/components/mc';
import { useConsult } from '@/lib/store';
import { Pressable, ScrollView, View } from '@/tw';
import type { Patient } from '@/types/clinical';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
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
  const [query, setQuery] = useState('');

  const recent = patients.slice(0, 3);

  function openConsult(p: Patient) {
    selectPatient(p.id);
    reset();
    router.push('/consult');
  }

  return (
    <MCBackground>
      <View className="flex-1">
        {/* Top bar */}
        <View className="flex-row items-center justify-between px-6 pt-4">
          <View className="h-9 w-9 items-center justify-center rounded-xl border border-night-border bg-night-surface">
            <Stethoscope size={18} color={MC.ink} strokeWidth={2} />
          </View>
          <MCText variant="eyebrow">Second Opinion</MCText>
          <View className="h-9 w-9" />
        </View>

        {/* Greeting + headline + recent consults (scrolls) */}
        <ScrollView className="flex-1" contentContainerClassName="px-6 pt-10 pb-4" keyboardShouldPersistTaps="handled">
          <View className="items-center gap-2">
            <MCText variant="greeting">{greeting()}, Doctor 👋</MCText>
            <MCText variant="headline" className="text-center">
              Who are we seeing today?
            </MCText>
          </View>

          {recent.length > 0 && (
            <View className="gap-3 pt-12">
              <MCText variant="eyebrow" className="ml-1">
                Recent consults
              </MCText>
              {recent.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => openConsult(p)}
                  className="flex-row items-center gap-3 rounded-3xl border border-night-border bg-night-surface p-4">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-night-surface-strong">
                    <MCText variant="muted" className="font-semibold text-night-text">
                      {initials(p.name)}
                    </MCText>
                  </View>
                  <View className="flex-1">
                    <MCText variant="body" className="font-semibold">
                      {p.name}
                    </MCText>
                    <MCText variant="muted" numberOfLines={1}>
                      {p.complaint ?? 'No chief complaint recorded'}
                    </MCText>
                  </View>
                  <ChevronRight size={16} color={MC.faint} strokeWidth={2} />
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Composer — pinned at the bottom, the signature block from the ref */}
        <View className="px-6 pb-6 pt-1">
          <MCComposer
            value={query}
            onChangeText={setQuery}
            onSubmit={() => router.push('/patients')}
            onPlus={() => router.push('/new-patient')}
            placeholder="Search a patient, or start a new consult…"
            pills={[
              { label: 'Patients', icon: UserRound, onPress: () => router.push('/patients') },
              { label: 'New patient', icon: UserRoundPlus, onPress: () => router.push('/new-patient') },
            ]}
          />
        </View>
      </View>
    </MCBackground>
  );
}
