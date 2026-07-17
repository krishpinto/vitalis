// Dark "night" theme background/layout pieces — scoped to the auth flow
// only (sign-in/sign-up). Form controls (Button/Input/Label/Text) live in
// src/components/ui/*.tsx, ported from react-native-reusables. This file
// keeps only what has no RNR equivalent: the gradient/starfield background
// and the logo mark. Deliberately separate from src/components/ui.tsx (the
// light clinical kit) — CLAUDE.md locks the rest of the app to light-only,
// so these must never be reachable from a clinical screen.

import { Activity, Plus } from 'lucide-react-native';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { ScrollView, View } from '@/tw';

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
