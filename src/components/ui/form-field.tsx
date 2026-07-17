// A Label + icon-affixed Input composition — not part of react-native-
// reusables itself (their Input has no built-in icon slot), built from its
// primitives the way any shadcn-style app composes its own form fields.
// Scoped to the dark auth flow (sign-in.tsx/sign-up.tsx).

import type { LucideIcon } from 'lucide-react-native';

import { Input } from './input';
import { Label } from './label';
import { View } from '@/tw';

export function FormField({
  label,
  icon: Icon,
  trailing,
  ...inputProps
}: {
  label: string;
  icon: LucideIcon;
  trailing?: React.ReactNode;
} & React.ComponentProps<typeof Input>) {
  return (
    <View className="gap-2">
      <Label className="ml-1">{label}</Label>
      <View className="flex-row items-center gap-3 rounded-2xl border border-night-border bg-night-surface px-4">
        <Icon size={18} color="#9C9BBE" strokeWidth={2} />
        <Input {...inputProps} className="flex-1 border-0 bg-transparent px-0" />
        {trailing}
      </View>
    </View>
  );
}
