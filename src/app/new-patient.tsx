// New patient — single keyboard-safe form: name, age, sex segmented control,
// chief complaint.

import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { PrimaryButton, T } from '@/components/ui';
import { useConsult } from '@/lib/store';
import { color, font, radius, space } from '@/theme';
import type { Sex } from '@/types/clinical';

const SEXES: Sex[] = ['Male', 'Female', 'Other'];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <T variant="caption" tone="secondary" style={styles.label}>
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <T variant="title">New patient</T>
        <T variant="secondary" tone="secondary">
          Synthetic record — do not enter real patient data.
        </T>

        <Field label="Full name">
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Rahul Sharma"
            placeholderTextColor={color.inkFaint}
            autoFocus
          />
        </Field>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Age">
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="34"
                placeholderTextColor={color.inkFaint}
                keyboardType="number-pad"
                maxLength={3}
              />
            </Field>
          </View>
          <View style={{ flex: 2 }}>
            <Field label="Sex">
              <View style={styles.segment}>
                {SEXES.map((s) => {
                  const active = sex === s;
                  return (
                    <Pressable
                      key={s}
                      accessibilityRole="button"
                      style={({ pressed }) => [
                        styles.segmentItem,
                        active && styles.segmentItemActive,
                        pressed && styles.pressed,
                      ]}
                      onPress={() => setSex(s)}>
                      <T
                        variant="secondary"
                        tone={active ? 'onAccent' : 'secondary'}
                        style={active && styles.segmentTextActive}>
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
            style={[styles.input, styles.multiline]}
            value={complaint}
            onChangeText={setComplaint}
            placeholder="e.g. Fever & body ache · 3 days"
            placeholderTextColor={color.inkFaint}
            multiline
          />
        </Field>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="Save & start consult" onPress={save} disabled={!canSave} icon={ArrowRight} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.bg },
  scroll: { padding: space.xl, gap: space.l, paddingBottom: space.xl },
  field: { gap: space.s },
  label: { fontWeight: '600', letterSpacing: 0.6, marginLeft: space.xs },
  input: {
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.button,
    paddingHorizontal: space.l,
    paddingVertical: space.m,
    ...font.body,
    color: color.ink,
  },
  multiline: { minHeight: 72, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: space.m },
  segment: {
    flexDirection: 'row',
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.button,
    padding: space.xs,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: space.s,
    borderRadius: radius.button - space.xs,
    alignItems: 'center',
  },
  segmentItemActive: { backgroundColor: color.accent },
  segmentTextActive: { fontWeight: '600' },
  pressed: { transform: [{ scale: 0.98 }] },
  footer: {
    padding: space.l,
    backgroundColor: color.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.border,
  },
});
