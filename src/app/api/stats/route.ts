import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { features, serverEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { countByStage, sinceDays } from "@/lib/leads/stats";

export const dynamic = "force-dynamic";

const WINDOW_DAYS = 7;
const json = (body: Record<string, unknown>, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

function keyMatches(given: string, expected: string) {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Read-only counts for the weekly report. Requires `x-report-key: <REPORT_KEY>`.
 *
 *   leads_this_week               every row in contact_leads from the last 7 days
 *                                 (contact form, free reel offers, /content-package calls…)
 *   contact_submissions_this_week the subset that came through /contact
 *   creator_applicants_by_stage   /join applicants from the last 7 days, grouped by status
 */
export async function GET(request: Request) {
  const expected = serverEnv.reportKey;
  if (!expected) return json({ ok: false, error: "REPORT_KEY is not set on the server, so /api/stats is disabled." }, 503);
  if (!keyMatches(request.headers.get("x-report-key") ?? "", expected)) return json({ ok: false, error: "Missing or invalid x-report-key header." }, 401);
  if (!features.supabaseAdmin) {
    return json({ ok: false, error: "Database not configured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY. Until then leads only exist as [lead] lines in the server log." }, 503);
  }

  const since = sinceDays(WINDOW_DAYS);
  const db = createAdminClient();
  const [leads, contact, applicants] = await Promise.all([
    db.from("contact_leads").select("id", { count: "exact", head: true }).gte("created_at", since),
    db.from("contact_leads").select("id", { count: "exact", head: true }).gte("created_at", since).eq("source_path", "/contact"),
    db.from("creator_applicants").select("status").gte("created_at", since),
  ]);
  const failed = [leads.error, contact.error, applicants.error].find(Boolean);
  if (failed) {
    const hint = /creator_applicants/.test(failed.message) ? " Apply supabase/migrations/20261104000100_creator_applicants.sql." : "";
    return json({ ok: false, error: `Database query failed: ${failed.message}.${hint}` }, 503);
  }

  return json({
    ok: true,
    window_days: WINDOW_DAYS,
    since,
    generated_at: new Date().toISOString(),
    leads_this_week: leads.count ?? 0,
    contact_submissions_this_week: contact.count ?? 0,
    creator_applicants_by_stage: countByStage((applicants.data ?? []) as { status: string }[]),
  });
}
