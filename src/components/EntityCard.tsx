// Structured entity summary card (Gemini Call #1 output).

import { StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import type { StructuredEntities } from '@/types/clinical';

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.heading}>
        {title.toUpperCase()}
      </ThemedText>
      {items.map((item, i) => (
        <ThemedText key={i} style={styles.item}>
          • {item}
        </ThemedText>
      ))}
    </View>
  );
}

export function EntityCard({ entities }: { entities: StructuredEntities }) {
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <Section title="Symptoms" items={entities.symptoms} />
      <Section title="Duration" items={entities.duration ? [entities.duration] : []} />
      <Section title="History" items={entities.history} />
      <Section title="Medications" items={entities.medications} />
      <Section title="Doctor observations" items={entities.doctor_observations} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, gap: 14 },
  section: { gap: 4 },
  heading: { letterSpacing: 0.5, fontSize: 11 },
  item: { fontSize: 15, lineHeight: 21 },
});
