// Sign up — dark "night" theme, mirrors sign-in.tsx. Form controls ported
// from react-native-reusables — see src/components/ui/*.tsx headers.

import { Link, useRouter } from 'expo-router';
import { ChevronLeft, Eye, EyeOff, Lock, Mail, User } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { NightLogo, NightScroll, NightSky } from '@/components/night-ui';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Text } from '@/components/ui/text';
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
              <Text className="text-[28px] leading-[36px] font-semibold text-center">Create your</Text>
              <Text className="text-[28px] leading-[36px] font-semibold text-center text-night-accent-2">account</Text>
            </View>
            <Text variant="muted" className="text-center">
              Synthetic demo data only — do not use real patient information.
            </Text>
          </View>

          <View className="gap-4">
            <FormField label="Name" icon={User} value={name} onChangeText={setName} placeholder="Dr. Rahul Sharma" textContentType="name" />
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
            {error && (
              <View className="rounded-2xl border border-night-border px-4 py-3" style={{ backgroundColor: 'rgba(255,107,107,0.12)' }}>
                <Text className="text-sm" style={{ color: '#FF6B6B' }}>
                  {error}
                </Text>
              </View>
            )}
            <Button onPress={submit} disabled={!canSubmit || loading}>
              {loading ? <ActivityIndicator color="#131129" /> : <Text>Create account</Text>}
            </Button>
          </View>
        </View>

        <View className="flex-row items-center justify-center gap-2 pb-2">
          <Text variant="muted" className="text-sm">
            Already have an account?
          </Text>
          <Link href="/sign-in">
            <Text className="text-sm font-semibold text-night-accent-2">Sign in</Text>
          </Link>
        </View>
      </NightScroll>
    </NightSky>
  );
}
