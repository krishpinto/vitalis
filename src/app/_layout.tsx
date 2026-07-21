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

// The entry + auth surfaces (landing, home, sign-in, sign-up) use the dark
// "MobileCode" theme (see global.css night-* tokens + src/components/mc.tsx) —
// a deliberate, scoped exception to CLAUDE.md's light-only rule, decided for
// these screens only; the clinical flow (patients → consult → review →
// diagnosis) stays light. This outer shell paints the safe-area background
// per-route so the notch/status-bar strip matches whichever screen is showing.
// DARK_ROUTES drives the dark safe-area + light status bar; the DEMO ribbon is
// hidden on the auth screens only (they carry their own "synthetic data" copy).
const DARK_ROUTES = ['/', '/home', '/sign-in', '/sign-up'];
const AUTH_ROUTES = ['/sign-in', '/sign-up'];
const MC_BG = '#06060B';

export default function RootLayout() {
  const pathname = usePathname();
  const isDark = DARK_ROUTES.includes(pathname);
  const isAuth = AUTH_ROUTES.includes(pathname);
  const bg = isDark ? MC_BG : color.bg;

  return (
    <ThemeProvider value={ClinicalTheme}>
      <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top']}>
        {!isAuth && <DemoWatermark />}
        <Stack
          screenOptions={{
            headerShown: true,
            headerStyle: { backgroundColor: color.bg },
            headerTitleStyle: { color: color.ink, fontWeight: '600', fontSize: font.body.fontSize },
            headerTintColor: color.accent,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: color.bg },
          }}>
          <Stack.Screen name="index" options={{ headerShown: false, contentStyle: { backgroundColor: MC_BG } }} />
          <Stack.Screen name="home" options={{ headerShown: false, contentStyle: { backgroundColor: MC_BG } }} />
          <Stack.Screen name="patients" options={{ title: 'Patients' }} />
          <Stack.Screen name="new-patient" options={{ title: 'New patient' }} />
          <Stack.Screen name="consult" options={{ title: 'Live consult' }} />
          <Stack.Screen name="review" options={{ title: 'Review' }} />
          <Stack.Screen name="diagnosis" options={{ title: 'Differential draft' }} />
          <Stack.Screen name="sign-in" options={{ headerShown: false, contentStyle: { backgroundColor: MC_BG } }} />
          <Stack.Screen name="sign-up" options={{ headerShown: false, contentStyle: { backgroundColor: MC_BG } }} />
        </Stack>
      </SafeAreaView>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
