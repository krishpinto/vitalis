// Sign in — dark "night" theme, scoped to the auth flow only. Form controls
// (Button/Input/Label/Text) are ported from react-native-reusables — see
// src/components/ui/*.tsx headers. NightSky/NightLogo stay bespoke (no RNR
// equivalent). Standalone route: doesn't gate the rest of the app yet.

import { Link, useRouter } from 'expo-router';
import { ChevronLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { NightLogo, NightScroll, NightSky } from '@/components/night-ui';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Text } from '@/components/ui/text';
import { authClient } from '@/lib/auth-client';
import { Pressable, View } from '@/tw';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  async function submit() {
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    const { error: signInError } = await authClient.signIn.email({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message ?? 'Could not sign in. Check your email and password.');
      return;
    }
    router.replace('/home');
  }

  return (
    <NightSky>
      <NightScroll>
        <View className="flex-row items-center justify-between pt-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            accessibilityLabel="Back"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
            <ChevronLeft size={18} color="#F5F5F8" strokeWidth={2.2} />
          </Button>
        </View>

        <View className="gap-8 flex-1 justify-center">
          <View className="gap-4 items-center">
            <NightLogo />
            <View className="items-center">
              <Text className="text-[28px] leading-[36px] font-semibold text-center">Welcome back</Text>
              <Text className="text-[28px] leading-[36px] font-semibold text-center text-night-accent-2">Doctor</Text>
            </View>
            <Text variant="muted" className="text-center">
              Sign in to continue to your consults.
            </Text>
          </View>

          <View className="gap-4">
            <FormField
              label="Email"
              icon={Mail}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
            />
            <FormField
              label="Password"
              icon={Lock}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              textContentType="password"
              trailing={
                <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Toggle password visibility">
                  {showPassword ? (
                    <EyeOff size={18} color="#9C9BBE" strokeWidth={2} />
                  ) : (
                    <Eye size={18} color="#9C9BBE" strokeWidth={2} />
                  )}
                </Pressable>
              }
            />
            {/* Visual only for now — no password-reset flow (email sending) is wired up yet. */}
            <Text className="text-sm font-semibold -mt-2 text-night-accent-2">Forgot password?</Text>
            {error && (
              <View className="rounded-2xl border border-night-border px-4 py-3" style={{ backgroundColor: 'rgba(255,107,107,0.12)' }}>
                <Text className="text-sm" style={{ color: '#FF6B6B' }}>
                  {error}
                </Text>
              </View>
            )}
            <Button onPress={submit} disabled={!canSubmit || loading}>
              {loading ? <ActivityIndicator color="#131129" /> : <Text>Sign in</Text>}
            </Button>
          </View>
        </View>

        <View className="flex-row items-center justify-center gap-2 pb-2">
          <Text variant="muted" className="text-sm">
            Don&apos;t have an account?
          </Text>
          <Link href="/sign-up">
            <Text className="text-sm font-semibold text-night-accent-2">Sign up</Text>
          </Link>
        </View>
      </NightScroll>
    </NightSky>
  );
}
