// Dark "night" theme kit — scoped to the auth flow only (sign-in/sign-up).
// Deliberately separate from src/components/ui.tsx: CLAUDE.md locks the rest
// of the app to the light "clinical calm" theme, so these components must
// never be reachable from a clinical screen. See global.css's night-* tokens.

import { Activity, Plus, type LucideIcon } from 'lucide-react-native';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { cn } from '@/lib/cn';
import { Pressable, ScrollView, Text, TextInput, View } from '@/tw';

// ---------------------------------------------------------------------------
// NightSky — full-bleed gradient + starfield background
// ---------------------------------------------------------------------------

function seededStars(count: number, seed: number) {
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return Array.from({ length: count }, () => ({
    cx: rand() * 100,
    cy: rand() * 50, // confined to the top half, where the gradient lives
    size: rand() * 0.8 + 0.6, // small square "pixel" stars
    opacity: rand() * 0.55 + 0.2,
  }));
}

// Gradient finishes by the halfway point, then holds flat — only the top
// half of the screen is ever tinted, the rest is the plain base color.
const gradient =
  'linear-gradient(to bottom, #241F54 0%, #131129 30%, #07070C 50%, #07070C 100%)';

export function NightSky({ children }: { children: React.ReactNode }) {
  const stars = useMemo(() => seededStars(80, 7), []);
  return (
    <View className="flex-1" style={{ backgroundColor: '#07070C' }}>
      <View
        className="absolute inset-0"
        style={{
          [process.env.EXPO_OS === 'web' ? 'backgroundImage' : 'experimental_backgroundImage']: gradient,
        } as Record<string, string>}
      />
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
        {stars.map((s, i) => (
          <Rect
            key={i}
            x={`${s.cx}%`}
            y={`${s.cy}%`}
            width={s.size}
            height={s.size}
            fill="#FFFFFF"
            opacity={s.opacity}
          />
        ))}
      </Svg>
      {children}
    </View>
  );
}

// ---------------------------------------------------------------------------
// NightLogo — glowing badge mark: cross + heartbeat pulse, centered use.
// Colors stay within the existing night palette (white + the night-accent-2
// violet) — no new hue introduced, just a composed mark.
// ---------------------------------------------------------------------------

export function NightLogo({ size = 88 }: { size?: number }) {
  return (
    <View
      className="items-center justify-center rounded-[28px] bg-night-surface-strong border border-night-border self-center"
      style={{
        width: size,
        height: size,
        boxShadow: `0 0 ${Math.round(size * 0.65)}px ${Math.round(size * 0.1)}px rgba(139,133,255,0.35)`,
      }}>
      <Plus size={size * 0.5} color="#F5F5F8" strokeWidth={2.6} />
      <Activity size={size * 0.56} color="#8B85FF" strokeWidth={2} style={{ position: 'absolute' }} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// NightScroll — the standard scaffold every auth screen starts with
// ---------------------------------------------------------------------------

export function NightScroll({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="flex-grow px-6 pb-8 gap-8"
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// NightText
// ---------------------------------------------------------------------------

type NightVariant = 'title' | 'body' | 'label';
const nightVariantClass: Record<NightVariant, string> = {
  title: 'text-[28px] leading-[36px] font-semibold',
  body: 'text-base leading-6',
  label: 'text-xs font-semibold tracking-wide',
};

export function NightText({
  variant = 'body',
  muted,
  className = '',
  children,
  ...rest
}: {
  variant?: NightVariant;
  muted?: boolean;
  className?: string;
  children?: React.ReactNode;
} & React.ComponentProps<typeof Text>) {
  return (
    <Text
      {...rest}
      className={cn(nightVariantClass[variant], muted ? 'text-night-text-muted' : 'text-night-text', className)}>
      {children}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// NightField — labeled input with a leading icon and optional trailing action
// ---------------------------------------------------------------------------

export function NightField({
  label,
  icon: Icon,
  trailing,
  ...inputProps
}: {
  label: string;
  icon: LucideIcon;
  trailing?: React.ReactNode;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View className="gap-2">
      <NightText variant="label" muted className="ml-1 uppercase">
        {label}
      </NightText>
      <View className="flex-row items-center gap-3 rounded-2xl border border-night-border bg-night-surface px-4">
        <Icon size={18} color="#9C9BBE" strokeWidth={2} />
        <TextInput
          {...inputProps}
          className="flex-1 py-4 text-base text-night-text"
          placeholderTextColor="#6E6D8C"
        />
        {trailing}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// NightButton — the one white pill CTA
// ---------------------------------------------------------------------------

export function NightButton({
  label,
  onPress,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      className={cn(
        'rounded-2xl py-4 items-center justify-center min-h-[56px] bg-night-accent',
        disabled && 'opacity-40'
      )}
      style={({ pressed }) => pressed && { transform: [{ scale: 0.98 }] }}>
      {loading ? (
        <ActivityIndicator color="#131129" />
      ) : (
        <Text className="text-base font-semibold text-night-accent-ink">{label}</Text>
      )}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// NightErrorBanner
// ---------------------------------------------------------------------------

export function NightErrorBanner({ message }: { message: string }) {
  return (
    <View className="rounded-2xl border border-night-border px-4 py-3" style={{ backgroundColor: 'rgba(255,107,107,0.12)' }}>
      <Text className="text-sm" style={{ color: '#FF6B6B' }}>
        {message}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// NightIconButton — circular translucent icon button (back/close)
// ---------------------------------------------------------------------------

export function NightIconButton({ icon: Icon, onPress, label }: { icon: LucideIcon; onPress: () => void; label: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      className="w-10 h-10 rounded-full items-center justify-center bg-night-surface border border-night-border"
      style={({ pressed }) => pressed && { transform: [{ scale: 0.98 }] }}>
      <Icon size={18} color="#F5F5F8" strokeWidth={2.2} />
    </Pressable>
  );
}
