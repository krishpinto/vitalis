// Structured entity summary (Gemini Call #1 output) — a grid of labeled chips,
// not a JSON-ish dump.

import { Clock, Eye, History, Pill, Thermometer } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import { Card, Chip, T } from '@/components/ui';
import { View } from '@/tw';
import type { StructuredEntities } from '@/types/clinical';

function ChipGroup({ title, icon, items }: { title: string; icon: LucideIcon; items: string[] }) {
  if (!items.length) return null;
  return (
    <View className="gap-2">
      <T variant="caption" tone="secondary" className="font-semibold tracking-wide">
        {title.toUpperCase()}
      </T>
      <View className="flex-row flex-wrap gap-2">
        {items.map((item, i) => (
          <Chip key={i} label={item} icon={icon} tint="#1A1D1F" soft="#FAF9F6" className="py-2" />
        ))}
      </View>
    </View>
  );
}

export function EntityCard({ entities }: { entities: StructuredEntities }) {
  return (
    <Card className="gap-4">
      <ChipGroup title="Symptoms" icon={Thermometer} items={entities.symptoms} />
      <ChipGroup title="Duration" icon={Clock} items={entities.duration ? [entities.duration] : []} />
      <ChipGroup title="History" icon={History} items={entities.history} />
      <ChipGroup title="Medications" icon={Pill} items={entities.medications} />
      <ChipGroup title="Doctor observations" icon={Eye} items={entities.doctor_observations} />
    </Card>
  );
}
