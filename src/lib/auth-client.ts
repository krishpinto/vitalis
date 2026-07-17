// better-auth client for the Expo app. Session tokens are stored via
// expo-secure-store (native) — the expoClient plugin handles picking the
// right storage/transport per platform automatically.

import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_SERVER_URL ?? 'http://localhost:8081',
  plugins: [
    expoClient({
      scheme: 'secondopinion',
      storagePrefix: 'secondopinion',
      storage: SecureStore,
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
