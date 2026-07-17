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
  // The web client is always served by this same server (localhost, a LAN
  // IP for phone testing, a tunnel, or the prod domain), so "trusted" here
  // just means "matches the host that received the request" — computed per
  // request instead of a fixed list, so it isn't tied to one hostname/port.
  // The Expo client additionally sends its own scheme as the origin on native.
  trustedOrigins: async (request?: Request) => {
    if (!request) return ['secondopinion://'];
    const url = new URL(request.url);
    return [`${url.protocol}//${url.host}`, 'secondopinion://'];
  },
  plugins: [expo()],
});

export type Session = typeof auth.$Infer.Session;
