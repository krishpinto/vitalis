// The shared component kit — the ONLY Card / PrimaryButton / Chip / SectionHeader
// in the app. Screens compose these; a screen inventing its own variant is a bug.

import type { LucideIcon } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { color, font, radius, shadow, space } from '@/theme';

// ---------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------

type Variant = 'title' | 'body' | 'secondary' | 'caption' | 'overline';

export function T({
  variant = 'body',
  tone = 'primary',
  style,
  children,
  ...rest
}: {
  variant?: Variant;
  tone?: 'primary' | 'secondary' | 'faint' | 'accent' | 'onAccent' | 'danger';
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
} & React.ComponentProps<typeof Text>) {
  const toneColor = {
    primary: color.ink,
    secondary: color.inkSecondary,
    faint: color.inkFaint,
    accent: color.accent,
    onAccent: color.onAccent,
    danger: color.redFlagText,
  }[tone];
  return (
    <Text {...rest} style={[font[variant], { color: toneColor }, style]}>
      {children}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

export function Card({
  children,
  style,
  onPress,
  accent,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  /** Optional thin left-border accent (tier colors). */
  accent?: string;
}) {
  const base: StyleProp<ViewStyle> = [
    styles.card,
    accent ? { borderLeftWidth: 3, borderLeftColor: accent } : null,
    style,
  ];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [base, pressed && styles.pressed]}>
      {children}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// PrimaryButton
// ---------------------------------------------------------------------------

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  icon: Icon,
  variant = 'solid',
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  variant?: 'solid' | 'quiet' | 'danger' | 'inverse';
  style?: StyleProp<ViewStyle>;
}) {
  const bg =
    variant === 'solid'
      ? color.accent
      : variant === 'danger'
        ? color.tierCantMiss
        : variant === 'inverse'
          ? color.card
          : color.accentSoft;
  const fg = variant === 'quiet' || variant === 'inverse' ? color.accent : color.onAccent;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: disabled ? color.disabledBg : bg },
        pressed && styles.pressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.buttonRow}>
          {Icon && <Icon size={18} color={disabled ? color.inkFaint : fg} strokeWidth={2.2} />}
          <T variant="secondary" style={{ color: disabled ? color.inkFaint : fg, fontWeight: '600' }}>
            {label}
          </T>
        </View>
      )}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Chip
// ---------------------------------------------------------------------------

export function Chip({
  label,
  tint = color.accent,
  soft = color.accentSoft,
  icon: Icon,
  style,
}: {
  label: string;
  /** Text/icon color. */
  tint?: string;
  /** Background. */
  soft?: string;
  icon?: LucideIcon;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.chip, { backgroundColor: soft }, style]}>
      {Icon && <Icon size={13} color={tint} strokeWidth={2.2} />}
      <T variant="caption" style={{ color: tint, fontWeight: '600' }}>
        {label}
      </T>
    </View>
  );
}

// ---------------------------------------------------------------------------
// SectionHeader
// ---------------------------------------------------------------------------

export function SectionHeader({
  title,
  trailing,
  style,
}: {
  title: string;
  trailing?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <T variant="overline" tone="secondary">
        {title.toUpperCase()}
      </T>
      {trailing}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton — static blocks (nothing loops except the recording pulse).
// ---------------------------------------------------------------------------

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <View style={[styles.card, { gap: space.m }]}>
      <View style={[styles.skeletonBar, { width: '45%' }]} />
      {Array.from({ length: lines }).map((_, i) => (
        <View key={i} style={[styles.skeletonBar, { width: i % 2 ? '90%' : '70%' }]} />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Empty state — icon + one line + optional action, never blank.
// ---------------------------------------------------------------------------

export function EmptyState({
  icon: Icon,
  text,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon size={26} color={color.accent} strokeWidth={1.8} />
      </View>
      <T variant="secondary" tone="secondary" style={{ textAlign: 'center' }}>
        {text}
      </T>
      {actionLabel && onAction && (
        <PrimaryButton label={actionLabel} onPress={onAction} variant="quiet" style={{ alignSelf: 'center' }} />
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Inline error card with retry — never Alert.alert.
// ---------------------------------------------------------------------------

export function ErrorCard({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View style={[styles.card, styles.errorCard]}>
      <T variant="secondary" tone="danger" style={{ flex: 1 }} numberOfLines={3}>
        {message}
      </T>
      {onRetry && (
        <Pressable onPress={onRetry} accessibilityRole="button" hitSlop={8}>
          <T variant="secondary" tone="danger" style={{ fontWeight: '600' }}>
            Retry
          </T>
        </Pressable>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Entrance — fade + 4px rise, 150ms, staggered 40ms per index. Runs once.
// ---------------------------------------------------------------------------

export function Rise({
  index = 0,
  children,
  style,
}: {
  index?: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 150,
      delay: index * 40,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [anim, index]);
  return (
    <Animated.View
      style={[
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [4, 0] }) }],
        },
        style,
      ]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.card,
    borderRadius: radius.card,
    padding: space.l,
    ...shadow,
  },
  pressed: { transform: [{ scale: 0.98 }] },
  button: {
    borderRadius: radius.button,
    paddingVertical: space.l,
    paddingHorizontal: space.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonRow: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    borderRadius: radius.chip,
    paddingHorizontal: space.m,
    paddingVertical: space.xs,
    alignSelf: 'flex-start',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.s,
  },
  skeletonBar: {
    height: 14,
    borderRadius: radius.button,
    backgroundColor: color.border,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.m,
    paddingHorizontal: space.xxl,
    paddingVertical: space.xxl,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.chip,
    backgroundColor: color.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.l,
    backgroundColor: color.redFlagBg,
  },
});
