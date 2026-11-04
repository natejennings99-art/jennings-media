import "server-only";
import { after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { env, features } from "@/lib/env";
import { getSettings } from "@/lib/data/public";
import { adminRecipients, brandOf, sendLogged } from "@/lib/notifications";
import { clientIp, hashIp, rateLimit } from "@/lib/rate-limit";
import type { Brand, EmailContent } from "@/lib/email/templates";

/**
 * "Never lose a lead" plumbing shared by every public form.
 *
 * Order of operations for a submission:
 *   1. rate-limit per IP (memory, plus a DB count when connected)
 *   2. save to Supabase (service role) — if the insert fails, or there is no DB, the full
 *      lead is written to the server log as a "[lead] {...}" line (Render keeps those)
 *   3. email Nate after the response is sent; a failed/skipped email is logged loudly by
 *      sendLogged and never affects what the visitor sees
 */

export const RATE_LIMIT_MESSAGE = "You've sent a few messages already — we'll be in touch soon.";

export async function leadIp() {
  const ip = await clientIp();
  return { ip, ipHash: hashIp(ip) };
}

/** Memory limiter (per instance) + a DB-backed count per table so restarts don't reset it. */
export async function overLimit(key: string, ip: string, ipHash: string, table: "contact_leads" | "creator_applicants", limit = 5) {
  if (!rateLimit(`${key}:${ip}`, limit, 60 * 60 * 1000)) return true;
  if (!features.supabaseAdmin) return false;
  try {
    const { count } = await createAdminClient().from(table).select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gt("created_at", new Date(Date.now() - 3600_000).toISOString());
    return (count ?? 0) >= limit;
  } catch {
    return false;
  }
}

/** One line per lead, JSON after the "[lead]" tag so it can be grepped out of the Render logs. */
export function logLeadLine(source: string, payload: Record<string, unknown>) {
  console.log(`[lead] ${JSON.stringify({ at: new Date().toISOString(), source, ...payload })}`);
}

export interface ContactLeadRecord {
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  need: string;
  services: string[];
  budget: string | null;
  message: string;
  source_path: string;
}

/**
 * Inserts into contact_leads. Returns the new id, or null when there is no database or the
 * insert failed — in both cases the lead has been written to the log instead.
 */
export async function saveContactLead(record: ContactLeadRecord, ipHash: string): Promise<{ id: string | null; saved: boolean }> {
  if (!features.supabaseAdmin) {
    logLeadLine(record.source_path, { ...record, reason: "no database configured" });
    return { id: null, saved: false };
  }
  try {
    const db = createAdminClient();
    const existing = record.email ? (await db.from("customers").select("id").ilike("email", record.email).maybeSingle()).data : null;
    const { data, error } = await db
      .from("contact_leads")
      .insert({ ...record, reason: "project", customer_id: existing?.id ?? null, ip_hash: ipHash })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: data.id as string, saved: true };
  } catch (error) {
    console.error(`[lead] DATABASE INSERT FAILED for ${record.source_path} — lead preserved in the log line below:`, error instanceof Error ? error.message : error);
    logLeadLine(record.source_path, { ...record, reason: "database insert failed" });
    return { id: null, saved: false };
  }
}

/** Generic insert with the same log-on-failure guarantee, for tables other than contact_leads. */
export async function saveRow(table: string, row: Record<string, unknown>, source: string): Promise<{ id: string | null; saved: boolean }> {
  if (!features.supabaseAdmin) {
    logLeadLine(source, { ...row, reason: "no database configured" });
    return { id: null, saved: false };
  }
  try {
    const { data, error } = await createAdminClient().from(table).insert(row).select("id").single();
    if (error) throw new Error(error.message);
    return { id: data.id as string, saved: true };
  } catch (error) {
    console.error(`[lead] DATABASE INSERT FAILED for ${source} (${table}) — preserved in the log line below:`, error instanceof Error ? error.message : error);
    logLeadLine(source, { ...row, reason: "database insert failed" });
    return { id: null, saved: false };
  }
}

/**
 * Emails the admin inbox (and optionally the visitor) once the response has been sent.
 * Nothing here can throw into the request; failures are logged by sendLogged.
 */
export function notifyAfterResponse(
  template: string,
  build: (brand: Brand, settings: Awaited<ReturnType<typeof getSettings>>) => EmailContent,
  opts: { replyTo?: string | null; also?: { to: string; template: string; build: (brand: Brand, settings: Awaited<ReturnType<typeof getSettings>>) => EmailContent; replyTo?: string | null } } = {}
) {
  if (!features.email && process.env.NODE_ENV === "production") {
    console.error(`[email] RESEND_API_KEY is not set — "${template}" alert NOT emailed. The lead is in the database/log only.`);
  }
  after(async () => {
    try {
      const settings = await getSettings();
      const brand = brandOf(settings);
      await sendLogged(template, adminRecipients(settings), build(brand, settings), { replyTo: opts.replyTo ?? null });
      if (opts.also) await sendLogged(opts.also.template, opts.also.to, opts.also.build(brand, settings), { replyTo: opts.also.replyTo ?? settings.email });
    } catch (error) {
      console.error(`[email] "${template}" alert crashed:`, error);
    }
  });
}

export const adminLeadUrl = (id: string | null, fallback: string) => (id ? `${env.siteUrl}/admin/leads?focus=${id}` : fallback);
