import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { EntityCard } from '@/components/EntityCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TranscriptView } from '@/components/TranscriptView';
import { structureTranscript } from '@/lib/gemini';
import { reasonDifferentials } from '@/lib/gemini';
import { useConsult } from '@/lib/store';

export default function ReviewScreen() {
  const router = useRouter();
  const { transcript, entities, setEntities, setDiagnosis, attachments } = useConsult();

  const [structuring, setStructuring] = useState(false);
  const [reasoning, setReasoning] = useState(false);

  if (!transcript) {
    return (
      <ThemedView style={styles.empty}>
        <ThemedText themeColor="textSecondary">No transcript yet. Record a consult first.</ThemedText>
      </ThemedView>
    );
  }

  async function analyze() {
    setStructuring(true);
    try {
      setEntities(await structureTranscript(transcript!));
    } catch (err) {
      Alert.alert('Structuring failed', String(err));
    } finally {
      setStructuring(false);
    }
  }

  async function generateDifferential() {
    if (!entities) return;
    setReasoning(true);
    try {
      setDiagnosis(await reasonDifferentials(entities, attachments));
      router.push('/diagnosis');
    } catch (err) {
      Alert.alert('Reasoning failed', String(err));
    } finally {
      setReasoning(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={styles.h2}>
            Transcript
          </ThemedText>
          {transcript.isDemo && (
            <ThemedText type="small" themeColor="textSecondary">
              synthetic
            </ThemedText>
          )}
        </View>
        <TranscriptView lines={transcript.lines} />

        {entities && (
          <>
            <ThemedText type="subtitle" style={styles.h2}>
              Structured summary
            </ThemedText>
            <EntityCard entities={entities} />
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {!entities ? (
          <Pressable style={styles.cta} onPress={analyze} disabled={structuring}>
            {structuring ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText type="smallBold" style={styles.ctaText}>
                Analyze transcript →
              </ThemedText>
            )}
          </Pressable>
        ) : (
          <Pressable style={styles.cta} onPress={generateDifferential} disabled={reasoning}>
            {reasoning ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText type="smallBold" style={styles.ctaText}>
                Generate differential draft →
              </ThemedText>
            )}
          </Pressable>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  scroll: { padding: 20, gap: 14, paddingBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  h2: { fontSize: 22 },
  footer: { padding: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E5E7EB' },
  cta: { backgroundColor: '#2563EB', paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  ctaText: { color: '#fff', fontSize: 16 },
});
