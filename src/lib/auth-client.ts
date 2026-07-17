// better-auth client for the Expo app. Session tokens are stored via
// expo-secure-store (native) — the expoClient plugin handles picking the
// right storage/transport per platform automatically.
//
// baseURL resolution: on web, the API route is always served from the same
// Metro dev server that served the page, so we use window.location.origin —
// this keeps sign-in/sign-up working whether the page was opened via
// localhost, a LAN IP (testing from a phone browser), or a tunnel URL,
// without EXPO_PUBLIC_SERVER_URL needing to be updated per network. Native
// has no "current origin" to read, so it falls back to the env var (must
// point at a host the device can actually reach — a LAN IP, not localhost).

import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';

const baseURL =
  process.env.EXPO_OS === 'web' && typeof window !== 'undefined'
    ? window.location.origin
    : (process.env.EXPO_PUBLIC_SERVER_URL ?? 'http://localhost:8081');

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
