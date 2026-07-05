// Design tokens — "clinical calm", LIGHT theme only. This is the single source
// of truth for color, spacing, radius, type and shadow. No inline hex anywhere
// else in the app; screens and components import from here.

import type { TextStyle, ViewStyle } from 'react-native';

import type { DifferentialTier } from '@/types/clinical';

export const color = {
  // Surfaces
  bg: '#FAF9F6',
  card: '#FFFFFF',
  // Translucent card surface — ONLY for the three sanctioned glass accents.
  glassCard: 'rgba(255,255,255,0.85)',
  glassHeader: 'rgba(250,249,246,0.72)',

  // Ink
  ink: '#1A1D1F',
  inkSecondary: '#5E6470',
  inkFaint: '#9AA0AA',

  // Accent (the only one)
  accent: '#0F6E6B',
  accentSoft: '#EAF4F3',

  // Tier colors — thin left borders + label chips only, never full fills
  tierMostLikely: '#0F6E6B',
  tierExpanded: '#8A6D1D',
  tierCantMiss: '#8C3A32',
  tierMostLikelySoft: '#EAF4F3',
  tierExpandedSoft: '#F7F1E1',
  tierCantMissSoft: '#FBEDEB',

  // Semantic
  redFlagBg: '#FBEDEB',
  redFlagText: '#8C3A32',
  recording: '#8C3A32',

  // Modal backdrop scrim (behind the evidence sheet's blur)
  scrim: 'rgba(26,29,31,0.35)',

  // DEMO ribbon
  ribbonBg: '#FDF6E9',
  ribbonText: '#B7791F',

  // Hairlines / borders
  border: '#ECEAE3',
  borderStrong: '#DDDAD1',

  // On-accent text
  onAccent: '#FFFFFF',

  // Disabled
  disabledBg: '#E4E2DC',
} as const;

export const radius = {
  card: 16,
  button: 12,
  chip: 999,
} as const;

/** Spacing scale 4/8/12/16/24/32 — no arbitrary values. */
export const space = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
} as const;

export const font = {
  title: { fontSize: 28, lineHeight: 39, fontWeight: '600' } as TextStyle,
  body: { fontSize: 17, lineHeight: 24 } as TextStyle,
  secondary: { fontSize: 15, lineHeight: 21 } as TextStyle,
  caption: { fontSize: 13, lineHeight: 18 } as TextStyle,
  /** Small uppercase section label. */
  overline: { fontSize: 13, lineHeight: 18, fontWeight: '600', letterSpacing: 0.6 } as TextStyle,
} as const;

/** The one sanctioned elevation. No stacked heavy shadows. */
export const shadow: ViewStyle = {
  shadowColor: '#1A1D1F',
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};

export const tierMeta: Record<
  DifferentialTier,
  { label: string; color: string; soft: string }
> = {
  most_likely: { label: 'Most likely', color: color.tierMostLikely, soft: color.tierMostLikelySoft },
  expanded: { label: 'Expanded', color: color.tierExpanded, soft: color.tierExpandedSoft },
  cant_miss: { label: "Can't miss", color: color.tierCantMiss, soft: color.tierCantMissSoft },
};
