// Persistent banner making it unmistakable that no real patient data is involved.
// Per CLAUDE.md Phase 6: "Add DEMO DATA watermark everywhere".

import { StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';

export function DemoWatermark() {
  return (
    <View style={styles.banner}>
      <ThemedText type="smallBold" style={styles.text}>
        ⚠︎ DEMO DATA — SYNTHETIC PATIENT · NOT FOR CLINICAL USE
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  text: {
    color: '#92400E',
    fontSize: 12,
    letterSpacing: 0.3,
  },
});
