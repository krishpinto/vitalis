// Central access point for environment configuration.
//
// Expo only exposes env vars to client code when they are prefixed with
// EXPO_PUBLIC_. For this investor demo we read keys directly on the device.
// NOTE: shipping API keys in a mobile client is insecure — fine for a synthetic
// -data demo, but a real build must proxy these through a backend.

export const ENV = {
  SARVAM_API_KEY: process.env.EXPO_PUBLIC_SARVAM_API_KEY ?? '',
  GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '',
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
} as const;

/** When a key is missing we fall back to local synthetic demo data. */
export const hasSarvam = ENV.SARVAM_API_KEY.length > 0;
export const hasGemini = ENV.GEMINI_API_KEY.length > 0;
export const hasSupabase = ENV.SUPABASE_URL.length > 0 && ENV.SUPABASE_ANON_KEY.length > 0;

/** Global flag — everything in this build is synthetic/demo data. */
export const DEMO_MODE = true;
