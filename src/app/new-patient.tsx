// New patient — single keyboard-safe form: name, age, sex segmented control,
// chief complaint.

import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { PrimaryButton, T } from '@/components/ui';
import { useConsult } from '@/lib/store';
import { Pressable, ScrollView, TextInput, View } from '@/tw';
import type { Sex } from '@/types/clinical';

const SEXES: Sex[] = ['Male', 'Female', 'Other'];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="gap-2">
      <T variant="caption" tone="secondary" className="font-semibold tracking-wide ml-1">
        {label.toUpperCase()}
      </T>
      {children}
    </View>
  );
}

export default function NewPatientScreen() {
  const router = useRouter();
  const addPatient = useConsult((s) => s.addPatient);
  const selectPatient = useConsult((s) => s.selectPatient);
  const reset = useConsult((s) => s.reset);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<Sex | undefined>(undefined);
  const [complaint, setComplaint] = useState('');

  const canSave = name.trim().length > 0;

  function save() {
    if (!canSave) return;
    const patient = addPatient({
      name: name.trim(),
      age: age.trim() || undefined,
      sex,
      complaint: complaint.trim() || undefined,
    });
    selectPatient(patient.id);
    reset();
    router.replace('/consult');
  }

  const inputClass = 'bg-card border border-border rounded-button px-4 py-3 text-body text-ink';

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#FAF9F6' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerClassName="p-6 gap-4 pb-6" keyboardShouldPersistTaps="handled">
        <T variant="title">New patient</T>
        <T variant="secondary" tone="secondary">
          Synthetic record — do not enter real patient data.
        </T>

        <Field label="Full name">
          <TextInput
            className={inputClass}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Rahul Sharma"
            placeholderTextColor="#9AA0AA"
            autoFocus
          />
        </Field>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Field label="Age">
              <TextInput
                className={inputClass}
                value={age}
                onChangeText={setAge}
                placeholder="34"
                placeholderTextColor="#9AA0AA"
                keyboardType="number-pad"
                maxLength={3}
              />
            </Field>
          </View>
          <View className="flex-[2]">
            <Field label="Sex">
              <View className="flex-row bg-card border border-border rounded-button p-1">
                {SEXES.map((s) => {
                  const active = sex === s;
                  return (
                    <Pressable
                      key={s}
                      accessibilityRole="button"
                      className={`flex-1 py-2 rounded-[8px] items-center ${active ? 'bg-accent' : ''}`}
                      style={({ pressed }) => pressed && { transform: [{ scale: 0.98 }] }}
                      onPress={() => setSex(s)}>
                      <T
                        variant="secondary"
                        tone={active ? 'onAccent' : 'secondary'}
                        className={active ? 'font-semibold' : ''}>
                        {s}
                      </T>
                    </Pressable>
                  );
                })}
              </View>
            </Field>
          </View>
        </View>

        <Field label="Chief complaint (optional)">
          <TextInput
            className={`${inputClass} min-h-[72px]`}
            style={{ textAlignVertical: 'top' }}
            value={complaint}
            onChangeText={setComplaint}
            placeholder="e.g. Fever & body ache · 3 days"
            placeholderTextColor="#9AA0AA"
            multiline
          />
        </Field>
      </ScrollView>

      <View className="p-4 bg-card border-t border-border">
        <PrimaryButton label="Save & start consult" onPress={save} disabled={!canSave} icon={ArrowRight} />
      </View>
    </KeyboardAvoidingView>
  );
}
