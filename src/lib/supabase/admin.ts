import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, serverEnv } from "@/lib/env";

let cached: SupabaseClient | null = null;

/**
 * Service-role client. Bypasses RLS — only use on the server after your own
 * authorization checks (guest bookings, webhooks, cron, notifications).
 */
export function createAdminClient(): SupabaseClient {
  if (!env.supabaseUrl || !serverEnv.supabaseSecretKey) {
    throw new Error("Supabase service credentials are not configured (SUPABASE_SECRET_KEY).");
  }
  if (!cached) {
    cached = createClient(env.supabaseUrl, serverEnv.supabaseSecretKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return cached;
}
