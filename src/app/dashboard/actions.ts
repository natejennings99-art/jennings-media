"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { getViewer } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createCheckoutForBooking } from "@/lib/booking/payments";
import { clean, optionalClean, phoneSchema } from "@/lib/booking/schema";
import { notifyBooking, adminRecipients, brandOf, sendLogged } from "@/lib/notifications";
import { adminEvent, adminNewLead } from "@/lib/email/templates";
import { getSettings } from "@/lib/data/public";
import { env, features } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";
import type { ActionResult } from "@/lib/types";

async function customerOrThrow() {
  const viewer = await getViewer();
  if (!viewer?.customer) throw new Error("Please sign in again.");
  return viewer.customer;
}

const profileSchema = z.object({
  first_name: clean(60).pipe(z.string().min(1, "Required")),
  last_name: clean(60).pipe(z.string().min(1, "Required")),
  phone: phoneSchema,
  company: optionalClean(120),
  brokerage: optionalClean(120),
  license_number: optionalClean(60),
  marketing_opt_in: z.boolean(),
  sms_opt_in: z.boolean(),
});

export async function updateProfile(_: unknown, form: FormData): Promise<ActionResult> {
  const customer = await customerOrThrow();
  const parsed = profileSchema.safeParse({
    first_name: form.get("first_name"),
    last_name: form.get("last_name"),
    phone: form.get("phone"),
    company: form.get("company"),
    brokerage: form.get("brokerage"),
    license_number: form.get("license_number"),
    marketing_opt_in: form.get("marketing_opt_in") === "on",
    sms_opt_in: form.get("sms_opt_in") === "on",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check your details." };
  const { error } = await createAdminClient().from("customers").update(parsed.data).eq("id", customer.id);
  if (error) return { ok: false, error: "Couldn't save your profile." };
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function toggleFavorite(serviceId: string): Promise<ActionResult> {
  const customer = await customerOrThrow();
  if (!z.uuid().safeParse(serviceId).success) return { ok: false, error: "Invalid service" };
  const supabase = await createClient();
  const { data: existing } = await supabase.from("customer_favorites").select("service_id").eq("service_id", serviceId).maybeSingle();
  const result = existing
    ? await supabase.from("customer_favorites").delete().eq("customer_id", customer.id).eq("service_id", serviceId)
    : await supabase.from("customer_favorites").insert({ customer_id: customer.id, service_id: serviceId });
  if (result.error) return { ok: false, error: "Couldn't update favorites." };
  revalidatePath("/dashboard/favorites");
  return { ok: true };
}

/** Starts Stripe Checkout for the remaining balance of an invoice the customer owns. */
export async function payInvoice(invoiceId: string) {
  await customerOrThrow();
  if (!features.stripe) throw new Error("Online payments aren't enabled yet.");
  const supabase = await createClient();
  const { data: invoice } = await supabase.from("invoices").select("id, booking_id, amount_due_cents, status").eq("id", invoiceId).maybeSingle();
  if (!invoice || !invoice.booking_id || invoice.status !== "open" || invoice.amount_due_cents <= 0) throw new Error("This invoice can't be paid online.");
  const url = await createCheckoutForBooking({
    bookingId: invoice.booking_id,
    kind: "balance",
    amountCents: invoice.amount_due_cents,
    successPath: `/dashboard/invoices/${invoice.id}?paid=1`,
    cancelPath: `/dashboard/invoices/${invoice.id}`,
  });
  redirect(url);
}

/** Customer self-service cancellation (more than 24h before the appointment). */
export async function cancelMyBooking(bookingId: string, reason: string): Promise<ActionResult> {
  await customerOrThrow();
  const supabase = await createClient();
  const { data: booking } = await supabase.from("bookings").select("id, status, appointments(starts_at, status)").eq("id", bookingId).maybeSingle();
  if (!booking) return { ok: false, error: "Booking not found." };
  if (!["requested", "confirmed", "scheduled"].includes(booking.status)) return { ok: false, error: "This booking can no longer be cancelled online. Please contact us." };
  const appt = (booking.appointments as { starts_at: string; status: string }[]).find((a) => a.status !== "cancelled");
  if (appt && new Date(appt.starts_at).getTime() - Date.now() < 24 * 3600 * 1000) {
    return { ok: false, error: "Cancellations within 24 hours of the shoot must be made by phone or email." };
  }
  const db = createAdminClient();
  const note = clean(500).safeParse(reason ?? "").data ?? "";
  await db.from("appointments").update({ status: "cancelled" }).eq("booking_id", bookingId).in("status", ["held", "scheduled"]);
  await db.from("bookings").update({ status: "cancelled", cancelled_at: new Date().toISOString(), cancellation_reason: note || "Cancelled by client" }).eq("id", bookingId);
  await db.from("booking_events").insert({ booking_id: bookingId, type: "status_change", visibility: "customer", message: "Cancelled by client", meta: { reason: note } });
  after(() => notifyBooking("cancelled", bookingId, { reason: note || "Cancelled by client" }));
  revalidatePath(`/dashboard/orders/${bookingId}`);
  return { ok: true };
}

export async function requestChange(bookingId: string, message: string): Promise<ActionResult> {
  const customer = await customerOrThrow();
  const text = clean(1500).safeParse(message ?? "");
  if (!text.success || text.data.length < 5) return { ok: false, error: "Tell us what you'd like to change." };
  const supabase = await createClient();
  const { data: booking } = await supabase.from("bookings").select("id, order_number").eq("id", bookingId).maybeSingle();
  if (!booking) return { ok: false, error: "Booking not found." };
  const db = createAdminClient();
  await db.from("booking_events").insert({ booking_id: bookingId, type: "message", visibility: "customer", message: `Change request: ${text.data}`, meta: { from: "customer" } });
  const settings = await getSettings();
  after(() =>
    sendLogged(
      "admin_change_request",
      adminRecipients(settings),
      adminEvent(brandOf(settings), `Change request · ${booking.order_number}`, [`${customer.first_name} ${customer.last_name}: ${text.data}`], `${env.siteUrl}/admin/bookings/${bookingId}`),
      { bookingId }
    )
  );
  revalidatePath(`/dashboard/orders/${bookingId}`);
  return { ok: true };
}

export async function submitSupport(_: unknown, form: FormData): Promise<ActionResult> {
  const customer = await customerOrThrow();
  if (!rateLimit(`support:${customer.id}`, 5, 3600_000)) return { ok: false, error: "You've sent several messages — we'll be in touch soon." };
  const message = clean(3000).safeParse(form.get("message") ?? "");
  if (!message.success || message.data.length < 10) return { ok: false, error: "Please add a few more details." };
  const db = createAdminClient();
  const { data: lead } = await db
    .from("contact_leads")
    .insert({
      name: `${customer.first_name} ${customer.last_name}`.trim() || customer.email,
      email: customer.email,
      phone: customer.phone,
      company: customer.company,
      reason: "support",
      message: message.data,
      customer_id: customer.id,
      source_path: "/dashboard/support",
    })
    .select("id")
    .single();
  const settings = await getSettings();
  after(() =>
    sendLogged(
      "admin_new_lead",
      adminRecipients(settings),
      adminNewLead(brandOf(settings), { name: customer.first_name, email: customer.email, phone: customer.phone, reason: "support", message: message.data, adminUrl: `${env.siteUrl}/admin/leads?focus=${lead?.id ?? ""}` })
    )
  );
  return { ok: true };
}
