// Patients — searchable list of patient cards (avatar initials, meta chips,
// per-card consult CTA) with a FAB for adding a new patient. Card structure
// inspired by consumer-health doctor lists, executed in clinical-calm tokens:
// no photos, one accent, everything on the card is real and tappable.

import { useRouter } from 'expo-router';
import { CalendarClock, Plus, Search, Users } from 'lucide-react-native';
import { useState } from 'react';

import { Card, Chip, EmptyState, PrimaryButton, Rise, SectionHeader, T } from '@/components/ui';
import { useConsult } from '@/lib/store';
import { Pressable, ScrollView, TextInput, View } from '@/tw';
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
    <View className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="p-6 gap-3 pb-28" keyboardShouldPersistTaps="handled">
        {/* Search */}
        <View className="flex-row items-center gap-2 bg-card border border-border rounded-button px-4">
          <Search size={16} color="#9AA0AA" strokeWidth={2} />
          <TextInput
            className="flex-1 py-3 text-secondary text-ink"
            value={query}
            onChangeText={setQuery}
            placeholder="Search patients or complaints"
            placeholderTextColor="#9AA0AA"
            returnKeyType="search"
          />
        </View>

        <SectionHeader title={q ? 'Results' : 'Recent'} />

        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            text={
              q
                ? `No patients match "${query.trim()}".`
                : 'No patients yet — add your first patient to begin.'
            }
            actionLabel={q ? undefined : 'New patient'}
            onAction={q ? undefined : () => router.push('/new-patient')}
          />
        ) : (
          filtered.map((p, i) => (
            <Rise key={p.id} index={i}>
              <Card className="gap-3">
                <View className="flex-row items-center gap-3">
                  <View className="w-11 h-11 rounded-full bg-accent-soft items-center justify-center">
                    <T variant="secondary" className="text-accent font-semibold">
                      {initials(p.name)}
                    </T>
                  </View>
                  <View className="flex-1">
                    <T variant="body" className="font-semibold">
                      {p.name}
                    </T>
                    <T variant="caption" tone="secondary">
                      {[p.age && `${p.age} years`, p.sex].filter(Boolean).join(' · ') ||
                        'No details recorded'}
                    </T>
                  </View>
                  {p.lastVisit && (
                    <Chip label={p.lastVisit} icon={CalendarClock} tint="#5E6470" soft="#FAF9F6" />
                  )}
                </View>

                {p.complaint && (
                  <View className="flex-row flex-wrap gap-2">
                    <Chip label={p.complaint} />
                  </View>
                )}

                <PrimaryButton
                  label="Start consult"
                  onPress={() => openConsult(p)}
                  className="min-h-[44px] py-3"
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
        className="absolute right-6 bottom-8 w-14 h-14 rounded-full bg-accent items-center justify-center shadow-card"
        style={({ pressed }) => pressed && { transform: [{ scale: 0.98 }] }}>
        <Plus size={26} color="#FFFFFF" strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}
