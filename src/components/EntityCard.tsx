// Structured entity summary (Gemini Call #1 output) — a grid of labeled chips,
// not a JSON-ish dump.

import { Clock, Eye, History, Pill, Thermometer } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Card, Chip, T } from '@/components/ui';
import { color, space } from '@/theme';
import type { StructuredEntities } from '@/types/clinical';

function ChipGroup({ title, icon, items }: { title: string; icon: LucideIcon; items: string[] }) {
  if (!items.length) return null;
  return (
    <View style={styles.group}>
      <T variant="caption" tone="secondary" style={styles.groupLabel}>
        {title.toUpperCase()}
      </T>
      <View style={styles.chips}>
        {items.map((item, i) => (
          <Chip key={i} label={item} icon={icon} tint={color.ink} soft={color.bg} style={styles.chip} />
        ))}
      </View>
    </View>
  );
}

export function EntityCard({ entities }: { entities: StructuredEntities }) {
  return (
    <Card style={styles.card}>
      <ChipGroup title="Symptoms" icon={Thermometer} items={entities.symptoms} />
      <ChipGroup title="Duration" icon={Clock} items={entities.duration ? [entities.duration] : []} />
      <ChipGroup title="History" icon={History} items={entities.history} />
      <ChipGroup title="Medications" icon={Pill} items={entities.medications} />
      <ChipGroup title="Doctor observations" icon={Eye} items={entities.doctor_observations} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.l },
  group: { gap: space.s },
  groupLabel: { fontWeight: '600', letterSpacing: 0.6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  chip: { paddingVertical: space.s },
});
