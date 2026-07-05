import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DemoWatermark } from '@/components/DemoWatermark';
import { color, font } from '@/theme';

// Locked light theme — "clinical calm". No dark mode.
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

export default function RootLayout() {
  return (
    <ThemeProvider value={ClinicalTheme}>
      <SafeAreaView style={{ flex: 1, backgroundColor: color.bg }} edges={['top']}>
        <DemoWatermark />
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
          <Stack.Screen name="patients" options={{ title: 'Patients' }} />
          <Stack.Screen name="new-patient" options={{ title: 'New patient' }} />
          <Stack.Screen name="consult" options={{ title: 'Live consult' }} />
          <Stack.Screen name="review" options={{ title: 'Review' }} />
          <Stack.Screen name="diagnosis" options={{ title: 'Differential draft' }} />
        </Stack>
      </SafeAreaView>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
