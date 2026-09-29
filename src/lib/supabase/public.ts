import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

let cached: SupabaseClient | null = null;

/** Cookie-less anonymous client for public, cacheable marketing content. */
export function createPublicClient(): SupabaseClient {
  if (!cached) {
    cached = createClient(env.supabaseUrl, env.supabasePublishableKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return cached;
}
