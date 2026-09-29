"use client";
import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/** Browser client — used for auth flows only; data access goes through the server. */
export function createClient() {
  return createBrowserClient(env.supabaseUrl, env.supabasePublishableKey);
}

export const supabaseConfigured = Boolean(env.supabaseUrl && env.supabasePublishableKey);
