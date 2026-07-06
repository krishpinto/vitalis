// Landing — full-bleed deep-teal hero (brand row, headline, inverse CTA) with
// fine wave line-art, and an off-white content sheet rising over it with the
// three feature cards. Structure inspired by consumer-health heroes, executed
// in clinical-calm tokens: one accent, no photos, lucide only.

import { useRouter } from 'expo-router';
import { AudioLines, FileSearch, Quote, Stethoscope } from 'lucide-react-native';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Card, PrimaryButton, Rise, T } from '@/components/ui';
import { color, radius, space } from '@/theme';

const FEATURES = [
  {
    icon: AudioLines,
    title: 'Hears the consult',
    text: 'Live Hinglish transcript, labelled by speaker.',
  },
  {
    icon: FileSearch,
    title: 'Drafts the differential',
    text: 'Tiered second-opinion draft — every claim cited.',
  },
  {
    icon: Quote,
    title: 'Proves its sources',
    text: 'Tap any suggestion to hear the patient say it.',
  },
];

/** Fine concentric wave lines over the hero — quiet texture, never a photo. */
function WaveLines({ width, height }: { width: number; height: number }) {
  const lines = Array.from({ length: 6 });
  return (
    <Svg
      width={width}
      height={height}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      aria-hidden>
      {lines.map((_, i) => {
        const lift = i * (height / 9);
        return (
          <Path
            key={i}
            d={`M ${-width * 0.1} ${height * 1.05 - lift} Q ${width * 0.35} ${height * 0.55 - lift} ${width * 1.1} ${height * 0.75 - lift}`}
            stroke={color.heroLine}
            strokeWidth={1}
            fill="none"
          />
        );
      })}
    </Svg>
  );
}

export default function LandingScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const heroHeight = Math.max(height * 0.46, 340);

  return (
    <View style={styles.container}>
      {/* Hero — the only full-accent surface in the app */}
      <View style={[styles.hero, { height: heroHeight }]}>
        <WaveLines width={width} height={heroHeight} />

        <Rise index={0}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Stethoscope size={18} color={color.onAccent} strokeWidth={2} />
            </View>
            <T variant="overline" style={styles.brandName}>
              SECOND OPINION
            </T>
          </View>
        </Rise>

        <View style={styles.heroBody}>
          <Rise index={1}>
            <T variant="title" style={styles.headline}>
              AI scribes write down{'\n'}what happened.
            </T>
            <T variant="title" style={[styles.headline, styles.headlineAccent]}>
              We catch what didn't.
            </T>
          </Rise>
          <Rise index={2}>
            <PrimaryButton
              label="Start a consult"
              onPress={() => router.push('/patients')}
              variant="inverse"
              style={styles.cta}
            />
          </Rise>
        </View>
      </View>

      {/* Content sheet rising over the hero */}
      <View style={styles.sheet}>
        <View style={styles.grabber} />
        {FEATURES.map((f, i) => (
          <Rise key={f.title} index={3 + i}>
            <Card style={styles.feature}>
              <View style={styles.featureIcon}>
                <f.icon size={18} color={color.accent} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <T variant="secondary" style={styles.featureTitle}>
                  {f.title}
                </T>
                <T variant="caption" tone="secondary">
                  {f.text}
                </T>
              </View>
            </Card>
          </Rise>
        ))}
        <View style={{ flex: 1 }} />
        <T variant="caption" tone="faint" style={styles.footnote}>
          A draft for the doctor to review and sign off — never a diagnosis.
        </T>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.accent },
  hero: {
    backgroundColor: color.accent,
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
    // Room for the sheet's rounded top to overlap without covering the CTA.
    paddingBottom: space.xxl + space.l,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: space.m },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: radius.button,
    backgroundColor: color.heroChip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { color: color.onAccentSoft, letterSpacing: 1.4 },
  heroBody: { flex: 1, justifyContent: 'flex-end', gap: space.xl },
  headline: { color: color.onAccentSoft, fontSize: 30, lineHeight: 39 },
  headlineAccent: { color: color.onAccent },
  cta: { alignSelf: 'flex-start', paddingHorizontal: space.xxl },
  sheet: {
    flex: 1,
    backgroundColor: color.bg,
    borderTopLeftRadius: radius.card + space.s,
    borderTopRightRadius: radius.card + space.s,
    marginTop: -(radius.card + space.s),
    paddingHorizontal: space.xl,
    paddingBottom: space.xl,
    gap: space.m,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.chip,
    backgroundColor: color.borderStrong,
    marginTop: space.m,
    marginBottom: space.s,
  },
  feature: { flexDirection: 'row', alignItems: 'center', gap: space.l },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.chip,
    backgroundColor: color.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: { fontWeight: '600' },
  footnote: { textAlign: 'center' },
});
