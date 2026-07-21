// Landing — dark "MobileCode" hero: near-black starfield sky, an eyebrow
// brand row, a large light-weight headline, the primary CTA, and three quiet
// feature rows in dark surfaces. Built on src/components/mc.tsx.

import { Link, useRouter } from 'expo-router';
import { AudioLines, FileSearch, Quote, Stethoscope } from 'lucide-react-native';

import { MC, MCBackground, MCButton, MCScroll, MCText } from '@/components/mc';
import { View } from '@/tw';

const FEATURES = [
  { icon: AudioLines, title: 'Hears the consult', text: 'Live Hinglish transcript, labelled by speaker.' },
  { icon: FileSearch, title: 'Drafts the differential', text: 'Tiered second-opinion draft — every claim cited.' },
  { icon: Quote, title: 'Proves its sources', text: 'Tap any suggestion to hear the patient say it.' },
];

export default function LandingScreen() {
  const router = useRouter();

  return (
    <MCBackground>
      <MCScroll className="gap-10">
        {/* Brand row */}
        <View className="flex-row items-center gap-3 pt-6">
          <View className="h-9 w-9 items-center justify-center rounded-xl border border-night-border bg-night-surface">
            <Stethoscope size={18} color={MC.ink} strokeWidth={2} />
          </View>
          <MCText variant="eyebrow">Second Opinion</MCText>
        </View>

        {/* Hero headline */}
        <View className="gap-6 pt-6">
          <View>
            <MCText variant="headline" className="text-night-text-muted">
              AI scribes write down{'\n'}what happened.
            </MCText>
            <MCText variant="headline" className="font-normal">
              We catch what didn&apos;t.
            </MCText>
          </View>
          <View className="gap-4">
            <MCButton label="Get started" className="self-start px-8" onPress={() => router.push('/home')} />
            <Link href="/sign-in">
              <MCText variant="muted">
                Already have an account? <MCText variant="link">Sign in</MCText>
              </MCText>
            </Link>
          </View>
        </View>

        {/* Feature rows */}
        <View className="gap-3 pt-2">
          {FEATURES.map((f) => (
            <View
              key={f.title}
              className="flex-row items-center gap-4 rounded-3xl border border-night-border bg-night-surface p-4">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-night-surface-strong">
                <f.icon size={18} color={MC.accent} strokeWidth={2} />
              </View>
              <View className="flex-1">
                <MCText variant="body" className="font-semibold">
                  {f.title}
                </MCText>
                <MCText variant="muted">{f.text}</MCText>
              </View>
            </View>
          ))}
        </View>

        <View className="flex-1" />
        <MCText variant="faint" className="pb-2 text-center">
          A draft for the doctor to review and sign off — never a diagnosis.
        </MCText>
      </MCScroll>
    </MCBackground>
  );
}
