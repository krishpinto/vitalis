// Sign in — dark "MobileCode" theme, built on the hand-rolled kit in
// src/components/mc.tsx (no react-native-reusables). Scoped to the dark
// surfaces of the app. Standalone route: doesn't gate the rest yet.

import { Link, useRouter } from 'expo-router';
import { ChevronLeft, Eye, EyeOff, Lock, Mail, Stethoscope } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { MC, MCBackground, MCButton, MCField, MCIconButton, MCMark, MCScroll, MCText } from '@/components/mc';
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
    const { error: signInError } = await authClient.signIn.email({ email: email.trim(), password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message ?? 'Could not sign in. Check your email and password.');
      return;
    }
    router.replace('/home');
  }

  return (
    <MCBackground>
      <MCScroll className="gap-8">
        <View className="flex-row items-center pt-4">
          <MCIconButton
            icon={ChevronLeft}
            variant="ghost"
            size={40}
            accessibilityLabel="Back"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          />
        </View>

        <View className="flex-1 justify-center gap-8">
          <View className="items-center gap-4">
            <MCMark icon={Stethoscope} />
            <View className="items-center">
              <MCText variant="headline" className="text-center">
                Welcome back
              </MCText>
              <MCText variant="headline" className="text-center font-normal text-night-accent-2">
                Doctor
              </MCText>
            </View>
            <MCText variant="muted" className="text-center">
              Sign in to continue to your consults.
            </MCText>
          </View>

          <View className="gap-4">
            <MCField
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
            <MCField
              label="Password"
              icon={Lock}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              textContentType="password"
              trailing={
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Toggle password visibility">
                  {showPassword ? (
                    <EyeOff size={18} color={MC.muted} strokeWidth={2} />
                  ) : (
                    <Eye size={18} color={MC.muted} strokeWidth={2} />
                  )}
                </Pressable>
              }
            />
            {/* Visual only for now — no password-reset flow (email sending) is wired up yet. */}
            <MCText variant="link" className="-mt-1">
              Forgot password?
            </MCText>

            {error && (
              <View
                className="rounded-2xl border border-night-border px-4 py-3"
                style={{ backgroundColor: 'rgba(255,107,107,0.12)' }}>
                <MCText variant="muted" style={{ color: '#FF8B8B' }}>
                  {error}
                </MCText>
              </View>
            )}

            <MCButton onPress={submit} disabled={!canSubmit || loading} className="w-full">
              {loading ? <ActivityIndicator color={MC.inkDark} /> : <MCText className="text-[16px] font-semibold text-night-accent-ink">Sign in</MCText>}
            </MCButton>
          </View>
        </View>

        <View className="flex-row items-center justify-center gap-2 pb-2">
          <MCText variant="muted">Don&apos;t have an account?</MCText>
          <Link href="/sign-up">
            <MCText variant="link">Sign up</MCText>
          </Link>
        </View>
      </MCScroll>
    </MCBackground>
  );
}
