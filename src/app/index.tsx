// Landing — full-bleed calm intro: product name, one-line value prop, one CTA.

import { useRouter } from 'expo-router';
import { AudioLines, FileSearch, Quote, Stethoscope } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { PrimaryButton, Rise, T } from '@/components/ui';
import { color, radius, space } from '@/theme';

const FEATURES = [
  { icon: AudioLines, text: 'Live Hinglish transcript, labelled by speaker' },
  { icon: FileSearch, text: 'Tiered differential draft, every claim cited' },
  { icon: Quote, text: 'Tap any suggestion to hear the patient say it' },
];

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Rise index={0}>
          <View style={styles.logo}>
            <Stethoscope size={30} color={color.accent} strokeWidth={1.8} />
          </View>
        </Rise>
        <Rise index={1}>
          <T variant="title" style={styles.title}>
            Second Opinion
          </T>
        </Rise>
        <Rise index={2}>
          <T variant="body" tone="secondary" style={styles.subtitle}>
            AI scribes write down what happened.{'\n'}We catch what didn't.
          </T>
        </Rise>
      </View>

      <View style={styles.features}>
        {FEATURES.map((f, i) => (
          <Rise key={i} index={3 + i}>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <f.icon size={18} color={color.accent} strokeWidth={2} />
              </View>
              <T variant="secondary" style={styles.featureText}>
                {f.text}
              </T>
            </View>
          </Rise>
        ))}
      </View>

      <View style={styles.bottom}>
        <PrimaryButton label="Get started" onPress={() => router.push('/patients')} />
        <T variant="caption" tone="faint" style={styles.footnote}>
          A draft for the doctor to review and sign off — never a diagnosis.
        </T>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bg,
    padding: space.xl,
    paddingBottom: space.xxl,
    justifyContent: 'center',
    gap: space.xxl,
  },
  hero: { gap: space.l, alignItems: 'flex-start' },
  logo: {
    width: 64,
    height: 64,
    borderRadius: radius.card,
    backgroundColor: color.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 34, lineHeight: 41 },
  subtitle: { fontSize: 18, lineHeight: 27 },
  features: { gap: space.l },
  feature: { flexDirection: 'row', gap: space.m, alignItems: 'center' },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.chip,
    backgroundColor: color.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1 },
  bottom: { gap: space.m },
  footnote: { textAlign: 'center' },
});
