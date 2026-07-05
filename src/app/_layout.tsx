import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DemoWatermark } from '@/components/DemoWatermark';

// Locked light theme for a clean, clinical look.
const ClinicalTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2563EB',
    background: '#F5F8FC',
    card: '#FFFFFF',
    text: '#0F172A',
    border: '#E5EAF1',
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={ClinicalTheme}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F8FC' }} edges={['top']}>
        <DemoWatermark />
        <Stack
          screenOptions={{
            headerShown: true,
            headerStyle: { backgroundColor: '#FFFFFF' },
            headerTitleStyle: { color: '#0F172A', fontWeight: '700' },
            headerTintColor: '#2563EB',
            headerShadowVisible: false,
            contentStyle: { backgroundColor: '#F5F8FC' },
          }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="patients" options={{ title: 'Patients' }} />
          <Stack.Screen name="new-patient" options={{ title: 'New Patient' }} />
          <Stack.Screen name="consult" options={{ title: 'Live Consult' }} />
          <Stack.Screen name="review" options={{ title: 'Review' }} />
          <Stack.Screen name="diagnosis" options={{ title: 'Differential Draft' }} />
        </Stack>
      </SafeAreaView>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
