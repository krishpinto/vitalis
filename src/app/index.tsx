import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <ThemedText style={styles.logoMark}>🩺</ThemedText>
        </View>
        <View style={styles.badge}>
          <ThemedText type="smallBold" style={styles.badgeText}>
            CLINICAL DECISION SUPPORT
          </ThemedText>
        </View>
        <ThemedText style={styles.title}>Second Opinion</ThemedText>
        <ThemedText style={styles.subtitle}>
          Ambient consult transcription and a cited differential-diagnosis draft — for licensed
          doctors, on every patient.
        </ThemedText>
      </View>

      <View style={styles.features}>
        {[
          { icon: '🎙️', text: 'Live Hinglish transcript, labelled by speaker' },
          { icon: '🧠', text: 'Structured summary + cited differentials' },
          { icon: '✍️', text: 'Draft only — you review and sign off' },
        ].map((f, i) => (
          <View key={i} style={styles.feature}>
            <ThemedText style={styles.featureIcon}>{f.icon}</ThemedText>
            <ThemedText style={styles.featureText}>{f.text}</ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.bottom}>
        <Pressable style={styles.cta} onPress={() => router.push('/patients')} accessibilityRole="button">
          <ThemedText type="smallBold" style={styles.ctaText}>
            Get Started
          </ThemedText>
        </Pressable>
        <ThemedText type="small" style={styles.footnote}>
          Demo build · synthetic patients only
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 28, justifyContent: 'center', backgroundColor: '#F5F8FC' },
  hero: { gap: 14, alignItems: 'flex-start' },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#E0EDFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMark: { fontSize: 32 },
  badge: {
    backgroundColor: '#E0EDFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: { color: '#1D4ED8', fontSize: 11, letterSpacing: 0.6 },
  title: { fontSize: 36, lineHeight: 42, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 16, lineHeight: 24, color: '#475569' },
  features: { gap: 16 },
  feature: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  featureIcon: { fontSize: 22, width: 28, textAlign: 'center' },
  featureText: { flex: 1, fontSize: 15, color: '#1E293B', lineHeight: 21 },
  bottom: { gap: 12 },
  cta: {
    backgroundColor: '#2563EB',
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  ctaText: { color: '#fff', fontSize: 16 },
  footnote: { textAlign: 'center', color: '#94A3B8' },
});
