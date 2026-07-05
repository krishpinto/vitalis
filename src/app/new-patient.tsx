import { useRouter } from 'expo-router';
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

import { ThemedText } from '@/components/themed-text';
import { useConsult } from '@/lib/store';
import type { Sex } from '@/types/clinical';

const SEXES: Sex[] = ['Male', 'Female', 'Other'];

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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <ThemedText style={styles.heading}>New patient</ThemedText>
        <ThemedText style={styles.subheading}>Synthetic record — do not enter real patient data.</ThemedText>

        <View style={styles.field}>
          <ThemedText type="smallBold" style={styles.label}>
            FULL NAME
          </ThemedText>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Rahul Sharma"
            placeholderTextColor="#94A3B8"
            autoFocus
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <ThemedText type="smallBold" style={styles.label}>
              AGE
            </ThemedText>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="e.g. 34"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={3}
            />
          </View>

          <View style={[styles.field, { flex: 2 }]}>
            <ThemedText type="smallBold" style={styles.label}>
              SEX
            </ThemedText>
            <View style={styles.segment}>
              {SEXES.map((s) => {
                const active = sex === s;
                return (
                  <Pressable
                    key={s}
                    style={[styles.segmentItem, active && styles.segmentItemActive]}
                    onPress={() => setSex(s)}>
                    <ThemedText type="small" style={[styles.segmentText, active && styles.segmentTextActive]}>
                      {s}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.field}>
          <ThemedText type="smallBold" style={styles.label}>
            CHIEF COMPLAINT (OPTIONAL)
          </ThemedText>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={complaint}
            onChangeText={setComplaint}
            placeholder="e.g. Fever & body ache · 3 days"
            placeholderTextColor="#94A3B8"
            multiline
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.cta, !canSave && styles.ctaDisabled]}
          onPress={save}
          disabled={!canSave}
          accessibilityRole="button">
          <ThemedText type="smallBold" style={styles.ctaText}>
            Save & Start Consult →
          </ThemedText>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FC' },
  scroll: { padding: 20, gap: 18, paddingBottom: 24 },
  heading: { fontSize: 26, fontWeight: '800', color: '#0F172A' },
  subheading: { fontSize: 14, color: '#64748B' },
  field: { gap: 7 },
  label: { color: '#64748B', letterSpacing: 0.5, fontSize: 11, marginLeft: 2 },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EAF1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: '#0F172A',
  },
  multiline: { minHeight: 72, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  segment: {
    flexDirection: 'row',
    backgroundColor: '#EEF2F7',
    borderRadius: 12,
    padding: 3,
  },
  segmentItem: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  segmentItemActive: { backgroundColor: '#FFFFFF', shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 3, elevation: 1 },
  segmentText: { color: '#64748B' },
  segmentTextActive: { color: '#0F172A', fontWeight: '700' },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5EAF1',
  },
  cta: { backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  ctaDisabled: { backgroundColor: '#CBD5E1' },
  ctaText: { color: '#fff', fontSize: 16 },
});
