// Supabase storage client. Used in Phase 4 to upload photos / prior-record scans.
// In demo mode (no Supabase keys) uploads are skipped and the local URI is used.

import 'react-native-url-polyfill/auto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { ENV, hasSupabase } from './env';

let _client: SupabaseClient | null = null;

export function supabase(): SupabaseClient | null {
  if (!hasSupabase) return null;
  if (!_client) {
    _client = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
  }
  return _client;
}

const BUCKET = 'consult-attachments';

/**
 * Upload a base64 image to Supabase Storage and return its public URL.
 * Returns null in demo mode so callers fall back to the local URI.
 */
export async function uploadAttachment(
  fileName: string,
  base64: string,
  mimeType: string
): Promise<string | null> {
  const client = supabase();
  if (!client) return null;

  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const { error } = await client.storage
    .from(BUCKET)
    .upload(fileName, bytes, { contentType: mimeType, upsert: true });
  if (error) throw error;

  return client.storage.from(BUCKET).getPublicUrl(fileName).data.publicUrl;
}
