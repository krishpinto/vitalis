// Sign up — dark "night" theme, mirrors sign-in.tsx. See src/components/night-ui.tsx.

import { Link, useRouter } from 'expo-router';
import { ChevronLeft, Eye, EyeOff, Lock, Mail, Stethoscope, User } from 'lucide-react-native';
import { useState } from 'react';

import { NightButton, NightErrorBanner, NightField, NightIconButton, NightScroll, NightSky, NightText } from '@/components/night-ui';
import { authClient } from '@/lib/auth-client';
import { Pressable, View } from '@/tw';

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim().length > 0 && email.trim().length > 0 && password.length >= 8 && !loading;

  async function submit() {
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    const { error: signUpError } = await authClient.signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message ?? 'Could not create your account. Try a different email.');
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
            <NightText variant="title">Create your account</NightText>
            <NightText muted>Synthetic demo data only — do not use real patient information.</NightText>
          </View>

          <View className="gap-4">
            <NightField label="Name" icon={User} value={name} onChangeText={setName} placeholder="Dr. Rahul Sharma" textContentType="name" />
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
              placeholder="At least 8 characters"
              secureTextEntry={!showPassword}
              textContentType="newPassword"
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
            <NightButton label="Create account" onPress={submit} disabled={!canSubmit} loading={loading} />
          </View>
        </View>

        <View className="flex-row items-center justify-center gap-2 pb-2">
          <NightText muted variant="body" className="text-sm">
            Already have an account?
          </NightText>
          <Link href="/sign-in">
            <NightText variant="body" className="text-sm font-semibold">
              Sign in
            </NightText>
          </Link>
        </View>
      </NightScroll>
    </NightSky>
  );
}
