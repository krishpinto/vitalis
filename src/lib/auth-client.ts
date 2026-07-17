// better-auth client for the Expo app. Session tokens are stored via
// expo-secure-store (native) — the expoClient plugin handles picking the
// right storage/transport per platform automatically.
//
// baseURL resolution — never a fixed "localhost", since that only ever
// resolves to the device it's read on:
// - web: the API route is always served from the same Metro dev server that
//   served the page, so window.location.origin keeps working whether it was
//   opened via localhost, a LAN IP (phone browser), or a tunnel URL.
// - native dev (Expo Go / dev client): Constants.expoConfig?.hostUri is the
//   LAN address Metro reports the device actually connected through —
//   localhost on a physical phone means the phone itself, not the dev
//   machine, so this must be used instead.
// - native standalone/production build: no Metro/hostUri, falls back to
//   EXPO_PUBLIC_SERVER_URL, which must be the real deployed API domain.

import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/react';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

function resolveBaseURL(): string {
  if (process.env.EXPO_OS === 'web') {
    return typeof window !== 'undefined' ? window.location.origin : (process.env.EXPO_PUBLIC_SERVER_URL ?? 'http://localhost:8081');
  }
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) return `http://${hostUri}`;
  return process.env.EXPO_PUBLIC_SERVER_URL ?? 'http://localhost:8081';
}

const baseURL = resolveBaseURL();

export const authClient = createAuthClient({
  baseURL,
  plugins: [
    expoClient({
      scheme: 'secondopinion',
      storagePrefix: 'secondopinion',
      storage: SecureStore,
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
