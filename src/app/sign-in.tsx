// Sign in — dark "night" theme, scoped to the auth flow only (see
// src/components/night-ui.tsx). Standalone route: doesn't gate the rest of
// the app yet, just a working screen against the real better-auth backend.

import { Link, useRouter } from 'expo-router';
import { ChevronLeft, Eye, EyeOff, Lock, Mail, Stethoscope } from 'lucide-react-native';
import { useState } from 'react';

import { NightButton, NightErrorBanner, NightField, NightIconButton, NightScroll, NightSky, NightText } from '@/components/night-ui';
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
          <NightIconButton icon={ChevronLeft} label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
        </View>

        <View className="gap-8 flex-1 justify-center">
          <View className="gap-3">
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-xl items-center justify-center bg-night-surface border border-night-border">
                <Stethoscope size={16} color="#F5F5F8" strokeWidth={2} />
              </View>
              <NightText variant="label" className="tracking-[1.4px]">
                SECOND OPINION
              </NightText>
            </View>
            <NightText variant="title">Welcome back</NightText>
            <NightText muted>Sign in to continue to your consults.</NightText>
          </View>

          <View className="gap-4">
            <NightField
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
            <NightField
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
            {error && <NightErrorBanner message={error} />}
            <NightButton label="Sign in" onPress={submit} disabled={!canSubmit} loading={loading} />
          </View>
        </View>

        <View className="flex-row items-center justify-center gap-2 pb-2">
          <NightText muted variant="body" className="text-sm">
            Don&apos;t have an account?
          </NightText>
          <Link href="/sign-up">
            <NightText variant="body" className="text-sm font-semibold">
              Create one
            </NightText>
          </Link>
        </View>
      </NightScroll>
    </NightSky>
  );
}
