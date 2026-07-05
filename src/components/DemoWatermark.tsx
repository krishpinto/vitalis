// Slim amber ribbon making it unmistakable that no real patient data is
// involved. Restyled per the design system — legible, not screaming. Stays
// until real-patient compliance work exists; never remove.

import { TriangleAlert } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { T } from './ui';
import { color, space } from '@/theme';

export function DemoWatermark() {
  return (
    <View style={styles.banner}>
      <TriangleAlert size={12} color={color.ribbonText} strokeWidth={2.2} />
      <T variant="caption" style={styles.text}>
        Demo — synthetic patients only · not for clinical use
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.s,
    backgroundColor: color.ribbonBg,
    paddingVertical: space.xs,
    paddingHorizontal: space.m,
  },
  text: {
    color: color.ribbonText,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
