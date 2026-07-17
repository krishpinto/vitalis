// better-auth server instance. No ORM — the built-in Kysely-backed adapter
// talks directly to Neon's serverless Pool (WebSocket-based, works from both
// a local Node dev server and an edge/Workers deploy later). Schema is
// applied via `npx @better-auth/cli@latest migrate`, not hand-written SQL.
//
// Served from app/api/auth/[...all]+api.ts. Consumed by src/lib/auth-client.ts.

import { expo } from '@better-auth/expo';
import { Pool } from '@neondatabase/serverless';
import { betterAuth } from 'better-auth';

export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL! }),
  emailAndPassword: {
    enabled: true,
  },
  // The Expo client sends its own scheme as the request origin on native.
  trustedOrigins: ['secondopinion://'],
  plugins: [expo()],
});

export type Session = typeof auth.$Infer.Session;
