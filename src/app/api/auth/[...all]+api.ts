// Catches every /api/auth/* request (sign-up, sign-in, session, sign-out,
// etc.) and hands it to better-auth. Requires app.json's web.output to be
// "server" — a static export has no server to run this on.

import { auth } from '@/lib/auth';

export const GET = (request: Request) => auth.handler(request);
export const POST = (request: Request) => auth.handler(request);
