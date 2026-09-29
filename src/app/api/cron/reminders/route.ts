import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { features, serverEnv } from "@/lib/env";
import { getSettings } from "@/lib/data/public";
import { notifyBooking } from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Scheduled job (Vercel Cron — see vercel.json). Sends shoot reminders, invoice
 * reminders and releases abandoned checkout holds. Protected by CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!serverEnv.cronSecret || auth !== `Bearer ${serverEnv.cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!features.supabaseAdmin) return NextResponse.json({ skipped: "Supabase not configured" });

  const db = createAdminClient();
  const settings = await getSettings();
  const now = Date.now();
  const horizon = new Date(now + Math.max(settings.notifications.reminder_hours_before, 12) * 3600 * 1000 * 1.5).toISOString();

  const { data: expired } = await db.rpc("expire_stale_holds");

  // Shoot reminders
  const { data: upcoming } = await db
    .from("appointments")
    .select("booking_id, starts_at, booking:bookings(status)")
    .eq("status", "scheduled")
    .gt("starts_at", new Date(now).toISOString())
    .lt("starts_at", horizon);
  let reminders = 0;
  for (const appt of upcoming ?? []) {
    const status = (appt.booking as unknown as { status: string } | null)?.status;
    if (!status || ["cancelled", "delivered"].includes(status)) continue;
    const { count } = await db
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("booking_id", appt.booking_id)
      .eq("template", "booking_reminder")
      .eq("status", "sent");
    if ((count ?? 0) > 0) continue;
    await notifyBooking("reminder", appt.booking_id);
    reminders++;
  }

  // Invoice reminders: open with a balance, past due, not reminded in 3 days.
  const today = new Date().toISOString().slice(0, 10);
  const { data: overdue } = await db
    .from("invoices")
    .select("id, booking_id, last_reminder_at")
    .eq("status", "open")
    .gt("amount_due_cents", 0)
    .lte("due_date", today)
    .or(`last_reminder_at.is.null,last_reminder_at.lt.${new Date(now - 3 * 86400000).toISOString()}`)
    .limit(50);
  let invoiceReminders = 0;
  for (const inv of overdue ?? []) {
    if (!inv.booking_id) continue;
    await notifyBooking("invoice_due", inv.booking_id);
    await db.from("invoices").update({ last_reminder_at: new Date().toISOString() }).eq("id", inv.id);
    invoiceReminders++;
  }

  return NextResponse.json({ ok: true, reminders, invoiceReminders, releasedHolds: expired ?? 0 });
}
