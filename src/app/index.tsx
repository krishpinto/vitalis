// Landing — full-bleed deep-teal hero (brand row, headline, inverse CTA) with
// fine wave line-art, and an off-white content sheet rising over it with the
// three feature cards. Structure inspired by consumer-health heroes, executed
// in clinical-calm tokens: one accent, no photos, lucide only.

import { useRouter } from 'expo-router';
import { AudioLines, FileSearch, Quote, Stethoscope } from 'lucide-react-native';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Card, PrimaryButton, Rise, T } from '@/components/ui';
import { View } from '@/tw';

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
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none" aria-hidden>
      {lines.map((_, i) => {
        const lift = i * (height / 9);
        return (
          <Path
            key={i}
            d={`M ${-width * 0.1} ${height * 1.05 - lift} Q ${width * 0.35} ${height * 0.55 - lift} ${width * 1.1} ${height * 0.75 - lift}`}
            stroke="rgba(255,255,255,0.10)"
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
    <View className="flex-1 bg-accent">
      {/* Hero — the only full-accent surface in the app */}
      <View className="bg-accent px-6 pt-6 pb-12" style={{ height: heroHeight }}>
        <WaveLines width={width} height={heroHeight} />

        <Rise index={0}>
          <View className="flex-row items-center gap-3">
            <View className="w-9 h-9 rounded-button bg-hero-chip items-center justify-center">
              <Stethoscope size={18} color="#FFFFFF" strokeWidth={2} />
            </View>
            <T variant="overline" className="tracking-[1.4px]" style={{ color: 'rgba(255,255,255,0.78)' }}>
              SECOND OPINION
            </T>
          </View>
        </Rise>

        <View className="flex-1 justify-end gap-6">
          <Rise index={1}>
            <T variant="title" className="text-[30px] leading-[39px]" style={{ color: 'rgba(255,255,255,0.78)' }}>
              AI scribes write down{'\n'}what happened.
            </T>
            <T variant="title" className="text-[30px] leading-[39px] text-on-accent">
              We catch what didn't.
            </T>
          </Rise>
          <Rise index={2}>
            <PrimaryButton
              label="Get started"
              onPress={() => router.push('/home')}
              variant="inverse"
              className="self-start px-8"
            />
          </Rise>
        </View>
      </View>

      {/* Content sheet rising over the hero */}
      <View className="flex-1 bg-bg rounded-t-[24px] -mt-[24px] px-6 pb-6 gap-3">
        <View className="self-center w-10 h-1 rounded-full bg-border-strong mt-3 mb-2" />
        {FEATURES.map((f, i) => (
          <Rise key={f.title} index={3 + i}>
            <Card className="flex-row items-center gap-4">
              <View className="w-10 h-10 rounded-full bg-accent-soft items-center justify-center">
                <f.icon size={18} color="#0F6E6B" strokeWidth={2} />
              </View>
              <View className="flex-1">
                <T variant="secondary" className="font-semibold">
                  {f.title}
                </T>
                <T variant="caption" tone="secondary">
                  {f.text}
                </T>
              </View>
            </Card>
          </Rise>
        ))}
        <View className="flex-1" />
        <T variant="caption" tone="faint" className="text-center">
          A draft for the doctor to review and sign off — never a diagnosis.
        </T>
      </View>
    </View>
  );
}
