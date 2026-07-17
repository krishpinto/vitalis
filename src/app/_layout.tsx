import { DefaultTheme, Stack, ThemeProvider, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import '../global.css';

import { DemoWatermark } from '@/components/DemoWatermark';
import { color, font } from '@/theme';

// Locked light theme — "clinical calm". No dark mode for the clinical app.
const ClinicalTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: color.accent,
    background: color.bg,
    card: color.card,
    text: color.ink,
    border: color.border,
  },
};

// The auth flow (sign-in/sign-up) uses the separate "night" dark theme (see
// global.css + src/components/night-ui.tsx) — an explicit, scoped exception
// to CLAUDE.md's light-only rule. This outer shell paints the safe-area
// background per-route so the notch/status-bar strip matches whichever
// screen is showing instead of always being the light clinical background.
const NIGHT_ROUTES = ['/sign-in', '/sign-up'];

export default function RootLayout() {
  const pathname = usePathname();
  const isNight = NIGHT_ROUTES.includes(pathname);
  const bg = isNight ? '#07070C' : color.bg;

  return (
    <ThemeProvider value={ClinicalTheme}>
      <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top']}>
        {!isNight && <DemoWatermark />}
        <Stack
          screenOptions={{
            headerShown: true,
            headerStyle: { backgroundColor: color.bg },
            headerTitleStyle: { color: color.ink, fontWeight: '600', fontSize: font.body.fontSize },
            headerTintColor: color.accent,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: color.bg },
          }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="home" options={{ headerShown: false }} />
          <Stack.Screen name="patients" options={{ title: 'Patients' }} />
          <Stack.Screen name="new-patient" options={{ title: 'New patient' }} />
          <Stack.Screen name="consult" options={{ title: 'Live consult' }} />
          <Stack.Screen name="review" options={{ title: 'Review' }} />
          <Stack.Screen name="diagnosis" options={{ title: 'Differential draft' }} />
          <Stack.Screen name="sign-in" options={{ headerShown: false, contentStyle: { backgroundColor: '#07070C' } }} />
          <Stack.Screen name="sign-up" options={{ headerShown: false, contentStyle: { backgroundColor: '#07070C' } }} />
        </Stack>
      </SafeAreaView>
      <StatusBar style={isNight ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
