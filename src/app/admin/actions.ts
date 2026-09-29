"use server";

import { revalidatePath, updateTag } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import { createCheckoutForBooking, qualifyReferral } from "@/lib/booking/payments";
import { notifyBooking } from "@/lib/notifications";
import { getSettings, TAGS } from "@/lib/data/public";
import { clean } from "@/lib/booking/schema";
import { features } from "@/lib/env";
import { BOOKING_STATUSES, MEDIA_CATEGORIES, type ActionResult, type BookingLineItem, type BookingStatus } from "@/lib/types";
import { BOOKING_STATUS_META } from "@/lib/status";
import { formatMoney, slugify } from "@/lib/utils";

const uuid = z.uuid();
const ok = (): ActionResult => ({ ok: true });
const fail = (error: string): ActionResult => ({ ok: false, error });

async function guard<T>(fn: (ctx: Awaited<ReturnType<typeof assertAdmin>>) => Promise<T>): Promise<T | ActionResult> {
  try {
    return await fn(await assertAdmin());
  } catch (error) {
    console.error("[admin action]", error);
    return fail(error instanceof Error ? error.message : "Something went wrong.");
  }
}

function touch(bookingId?: string) {
  revalidatePath("/admin", "layout");
  if (bookingId) revalidatePath(`/dashboard/orders/${bookingId}`);
}

async function event(bookingId: string, actorId: string, type: string, message: string, visibility: "internal" | "customer" = "internal", meta: Record<string, unknown> = {}) {
  await createAdminClient().from("booking_events").insert({ booking_id: bookingId, actor_id: actorId, type, message, visibility, meta });
}

/* ------------------------------------------------------------ status */

export async function setBookingStatus(bookingId: string, status: BookingStatus, notify: boolean): Promise<ActionResult> {
  return guard(async ({ viewer, supabase }) => {
    if (!uuid.safeParse(bookingId).success || !BOOKING_STATUSES.includes(status)) return fail("Invalid request");
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { status };
    if (status === "confirmed") patch.confirmed_at = now;
    if (status === "shoot_completed") patch.completed_at = now;
    if (status === "delivered") patch.delivered_at = now;
    if (status === "cancelled") patch.cancelled_at = now;
    const { error } = await supabase.from("bookings").update(patch).eq("id", bookingId);
    if (error) return fail(error.message);
    if (status === "cancelled") await supabase.from("appointments").update({ status: "cancelled" }).eq("booking_id", bookingId).in("status", ["held", "scheduled"]);
    if (status === "shoot_completed") await supabase.from("appointments").update({ status: "completed" }).eq("booking_id", bookingId).eq("status", "scheduled");
    await event(bookingId, viewer.user.id, "status_change", `Status changed to ${BOOKING_STATUS_META[status].label}`, "customer", { status });
    const map: Partial<Record<BookingStatus, Parameters<typeof notifyBooking>[0]>> = {
      confirmed: "confirmed",
      shoot_completed: "shoot_completed",
      delivered: "media_ready",
      cancelled: "cancelled",
    };
    after(async () => {
      if (notify && map[status]) await notifyBooking(map[status]!, bookingId);
      if (status === "delivered") await qualifyReferral(bookingId, "delivered");
    });
    touch(bookingId);
    return ok();
  });
}

export async function cancelBooking(bookingId: string, reason: string, notify: boolean): Promise<ActionResult> {
  return guard(async ({ viewer, supabase }) => {
    const note = clean(500).safeParse(reason ?? "").data ?? "";
    await supabase.from("appointments").update({ status: "cancelled" }).eq("booking_id", bookingId).in("status", ["held", "scheduled"]);
    const { error } = await supabase.from("bookings").update({ status: "cancelled", cancelled_at: new Date().toISOString(), cancellation_reason: note || null }).eq("id", bookingId);
    if (error) return fail(error.message);
    await event(bookingId, viewer.user.id, "status_change", `Booking cancelled${note ? `: ${note}` : ""}`, "customer");
    if (notify) after(() => notifyBooking("cancelled", bookingId, { reason: note }));
    touch(bookingId);
    return ok();
  });
}

/* ---------------------------------------------------------- schedule */

const scheduleSchema = z.object({
  bookingId: z.uuid(),
  appointmentId: z.uuid().nullable(),
  startsAt: z.iso.datetime({ offset: true }),
  durationMinutes: z.coerce.number().int().min(15).max(600),
  photographerId: z.uuid().nullable(),
  notify: z.boolean(),
});

export async function saveAppointment(input: z.input<typeof scheduleSchema>): Promise<ActionResult> {
  return guard(async ({ viewer, supabase }) => {
    const parsed = scheduleSchema.safeParse(input);
    if (!parsed.success) return fail("Check the date and time.");
    const { bookingId, appointmentId, startsAt, durationMinutes, photographerId, notify } = parsed.data;
    const settings = await getSettings();
    const ends = new Date(new Date(startsAt).getTime() + durationMinutes * 60000).toISOString();
    const values = {
      booking_id: bookingId,
      starts_at: startsAt,
      ends_at: ends,
      photographer_id: photographerId,
      status: "scheduled",
      hold_expires_at: null,
      buffer_before_minutes: settings.scheduling.travel_buffer_minutes,
      buffer_after_minutes: settings.scheduling.travel_buffer_minutes,
    };
    const { error } = appointmentId
      ? await supabase.from("appointments").update(values).eq("id", appointmentId)
      : await supabase.from("appointments").insert(values);
    if (error) return fail(error.message.includes("no_overlap") ? "That photographer is already booked at this time." : error.message);
    const { data: booking } = await supabase.from("bookings").select("status").eq("id", bookingId).single();
    if (booking && ["requested", "confirmed"].includes(booking.status)) {
      await supabase.from("bookings").update({ status: photographerId ? "scheduled" : "confirmed", confirmed_at: new Date().toISOString() }).eq("id", bookingId);
    }
    const when = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: settings.timezone }).format(new Date(startsAt));
    await event(bookingId, viewer.user.id, "schedule", `Appointment ${appointmentId ? "moved to" : "set for"} ${when}`, "customer");
    if (notify) after(() => notifyBooking("changed", bookingId, { changes: [`Appointment: ${when}`] }));
    touch(bookingId);
    return ok();
  });
}

/** Drag-and-drop from the admin calendar. Keeps duration and crew. */
export async function moveAppointment(appointmentId: string, startsAt: string): Promise<ActionResult> {
  return guard(async ({ supabase }) => {
    const { data: appt } = await supabase.from("appointments").select("*").eq("id", appointmentId).single();
    if (!appt) return fail("Appointment not found");
    const duration = (new Date(appt.ends_at).getTime() - new Date(appt.starts_at).getTime()) / 60000;
    return saveAppointment({ bookingId: appt.booking_id, appointmentId, startsAt, durationMinutes: duration, photographerId: appt.photographer_id, notify: false });
  });
}

/* ------------------------------------------------------------ pricing */

async function recalc(bookingId: string) {
  const db = createAdminClient();
  const settings = await getSettings();
  const [{ data: booking }, { data: items }] = await Promise.all([
    db.from("bookings").select("*").eq("id", bookingId).single(),
    db.from("booking_services").select("*").eq("booking_id", bookingId).order("sort_order"),
  ]);
  if (!booking) return;
  const list = (items ?? []) as BookingLineItem[];
  const subtotal = list.reduce((s, i) => s + i.total_cents, 0);
  const discount = Math.min(booking.discount_cents, subtotal);
  const taxable = subtotal - discount + (settings.tax_travel_fee ? booking.travel_fee_cents : 0);
  const tax = Math.round((taxable * settings.tax_rate_bps) / 10000);
  const total = Math.max(0, subtotal - discount + booking.travel_fee_cents + tax);
  await db.from("bookings").update({ subtotal_cents: subtotal, discount_cents: discount, tax_cents: tax, total_cents: total }).eq("id", bookingId);
  await db
    .from("invoices")
    .update({
      subtotal_cents: subtotal,
      discount_cents: discount,
      travel_fee_cents: booking.travel_fee_cents,
      tax_cents: tax,
      total_cents: total,
      line_items: list.map((l) => ({ name: l.name, description: l.description, quantity: l.quantity, unit_price_cents: l.unit_price_cents, total_cents: l.total_cents, included: l.included_in_package })),
    })
    .eq("booking_id", bookingId)
    .in("status", ["draft", "open", "paid"]);
  await db.rpc("sync_booking_financials", { p_booking_id: bookingId });
}

const lineSchema = z.object({
  bookingId: z.uuid(),
  kind: z.enum(["service", "add_on", "fee"]),
  refId: z.uuid().nullable(),
  name: clean(120).pipe(z.string().min(1)),
  quantity: z.coerce.number().int().min(1).max(100),
  unitPriceCents: z.coerce.number().int().min(0).max(10_000_000),
});

export async function addLineItem(input: z.input<typeof lineSchema>): Promise<ActionResult> {
  return guard(async ({ viewer, supabase }) => {
    const parsed = lineSchema.safeParse(input);
    if (!parsed.success) return fail("Check the item details.");
    const l = parsed.data;
    const { count } = await supabase.from("booking_services").select("id", { count: "exact", head: true }).eq("booking_id", l.bookingId);
    const { error } = await supabase.from("booking_services").insert({
      booking_id: l.bookingId,
      item_type: l.kind,
      service_id: l.kind === "service" ? l.refId : null,
      add_on_id: l.kind === "add_on" ? l.refId : null,
      name: l.name,
      quantity: l.quantity,
      unit_price_cents: l.unitPriceCents,
      total_cents: l.unitPriceCents * l.quantity,
      sort_order: (count ?? 0) + 1,
    });
    if (error) return fail(error.message);
    await recalc(l.bookingId);
    await event(l.bookingId, viewer.user.id, "system", `Added ${l.name} (${formatMoney(l.unitPriceCents * l.quantity)})`);
    touch(l.bookingId);
    return ok();
  });
}

export async function removeLineItem(itemId: string): Promise<ActionResult> {
  return guard(async ({ viewer, supabase }) => {
    const { data: item } = await supabase.from("booking_services").select("booking_id, name").eq("id", itemId).single();
    if (!item) return fail("Item not found");
    await supabase.from("booking_services").delete().eq("id", itemId);
    await recalc(item.booking_id);
    await event(item.booking_id, viewer.user.id, "system", `Removed ${item.name}`);
    touch(item.booking_id);
    return ok();
  });
}

export async function setAdjustments(bookingId: string, discountCents: number, travelFeeCents: number, label: string): Promise<ActionResult> {
  return guard(async ({ viewer, supabase }) => {
    if (discountCents < 0 || travelFeeCents < 0) return fail("Amounts can't be negative.");
    await supabase
      .from("bookings")
      .update({ discount_cents: Math.round(discountCents), travel_fee_cents: Math.round(travelFeeCents), discount_label: clean(80).safeParse(label).data || (discountCents ? "Discount" : null) })
      .eq("id", bookingId);
    await recalc(bookingId);
    await event(bookingId, viewer.user.id, "system", `Adjusted discount to ${formatMoney(discountCents)} and travel fee to ${formatMoney(travelFeeCents)}`);
    touch(bookingId);
    return ok();
  });
}

/* ----------------------------------------------------------- payments */

export async function recordPayment(bookingId: string, amountCents: number, method: string, note: string): Promise<ActionResult> {
  return guard(async ({ viewer, supabase }) => {
    if (!Number.isFinite(amountCents) || amountCents <= 0) return fail("Enter an amount.");
    const methods = ["cash", "check", "ach", "zelle", "venmo", "other"];
    const { data: booking } = await supabase.from("bookings").select("customer_id, currency, invoices(id, status)").eq("id", bookingId).single();
    if (!booking) return fail("Booking not found");
    const invoice = (booking.invoices as { id: string; status: string }[]).find((i) => i.status !== "void");
    const { error } = await supabase.from("payments").insert({
      booking_id: bookingId,
      invoice_id: invoice?.id ?? null,
      customer_id: booking.customer_id,
      kind: "manual",
      method: methods.includes(method) ? method : "other",
      provider: "manual",
      status: "succeeded",
      amount_cents: Math.round(amountCents),
      currency: booking.currency,
      paid_at: new Date().toISOString(),
      notes: clean(300).safeParse(note ?? "").data || null,
      created_by: viewer.user.id,
    });
    if (error) return fail(error.message);
    await createAdminClient().rpc("sync_booking_financials", { p_booking_id: bookingId });
    await event(bookingId, viewer.user.id, "payment", `Payment of ${formatMoney(amountCents, booking.currency, { exact: true })} recorded (${method})`, "customer");
    after(async () => {
      await notifyBooking("payment_received", bookingId, { amountCents });
      await qualifyReferral(bookingId, "paid");
    });
    touch(bookingId);
    return ok();
  });
}

export async function createPaymentLink(bookingId: string, email: boolean): Promise<ActionResult<{ url: string }>> {
  const result = await guard(async ({ supabase }) => {
    if (!features.stripe) return fail("Connect Stripe to create payment links.");
    const { data: booking } = await supabase.from("bookings").select("total_cents, amount_paid_cents").eq("id", bookingId).single();
    const due = (booking?.total_cents ?? 0) - (booking?.amount_paid_cents ?? 0);
    if (due <= 0) return fail("Nothing is due on this booking.");
    const url = await createCheckoutForBooking({ bookingId, kind: "balance", amountCents: due, successPath: `/dashboard/orders/${bookingId}`, cancelPath: `/dashboard/orders/${bookingId}`, holdMinutes: 60 * 23 });
    if (email) after(() => notifyBooking("invoice_due", bookingId, { payUrl: url }));
    return { ok: true as const, data: { url } };
  });
  return result as ActionResult<{ url: string }>;
}

export async function refundPayment(paymentId: string, amountCents: number | null): Promise<ActionResult> {
  return guard(async ({ viewer, supabase }) => {
    const { data: payment } = await supabase.from("payments").select("*").eq("id", paymentId).single();
    if (!payment) return fail("Payment not found");
    const refundable = payment.amount_cents - payment.refunded_cents;
    const amount = Math.min(amountCents ?? refundable, refundable);
    if (amount <= 0) return fail("Nothing left to refund.");
    if (payment.provider === "stripe") {
      if (!payment.stripe_payment_intent_id) return fail("Missing Stripe payment reference.");
      await getStripe().refunds.create({ payment_intent: payment.stripe_payment_intent_id, amount });
    }
    const refunded = payment.refunded_cents + amount;
    await supabase.from("payments").update({ refunded_cents: refunded, status: refunded >= payment.amount_cents ? "refunded" : "partially_refunded" }).eq("id", paymentId);
    if (payment.booking_id) {
      await createAdminClient().rpc("sync_booking_financials", { p_booking_id: payment.booking_id });
      await event(payment.booking_id, viewer.user.id, "payment", `Refunded ${formatMoney(amount, payment.currency, { exact: true })}`, "customer");
      touch(payment.booking_id);
    }
    return ok();
  });
}

/* ---------------------------------------------------- notes & messages */

export async function addBookingNote(bookingId: string, text: string, toClient: boolean): Promise<ActionResult> {
  return guard(async ({ viewer }) => {
    const body = clean(3000).safeParse(text ?? "");
    if (!body.success || !body.data) return fail("Write something first.");
    await event(bookingId, viewer.user.id, toClient ? "message" : "note", body.data, toClient ? "customer" : "internal", { from: "studio" });
    if (toClient) after(() => notifyBooking("message", bookingId, { message: body.data }));
    touch(bookingId);
    return ok();
  });
}

/* --------------------------------------------------------------- media */

const MIME_OK = /^(image|video)\/|^application\/(pdf|zip)$/;

export async function createMediaUpload(bookingId: string, category: string, fileName: string, mime: string): Promise<ActionResult<{ path: string; token: string; signedUrl: string }>> {
  const result = await guard(async () => {
    if (!uuid.safeParse(bookingId).success || !(MEDIA_CATEGORIES as readonly string[]).includes(category)) return fail("Invalid upload");
    if (mime && !MIME_OK.test(mime)) return fail("Unsupported file type");
    const safe = fileName.replace(/[^\w.\-]+/g, "_").slice(-120);
    const path = `bookings/${bookingId}/${category}/${crypto.randomUUID().slice(0, 8)}-${safe}`;
    const { data, error } = await createAdminClient().storage.from("deliveries").createSignedUploadUrl(path);
    if (error || !data) return fail(error?.message ?? "Upload URL failed");
    return { ok: true as const, data: { path, token: data.token, signedUrl: data.signedUrl } };
  });
  return result as ActionResult<{ path: string; token: string; signedUrl: string }>;
}

export async function registerMedia(bookingId: string, item: { path: string; category: string; fileName: string; mime: string; size: number; width?: number | null; height?: number | null }): Promise<ActionResult> {
  return guard(async ({ viewer, supabase }) => {
    if (!item.path.startsWith(`bookings/${bookingId}/`)) return fail("Invalid path");
    const { count } = await supabase.from("media").select("id", { count: "exact", head: true }).eq("booking_id", bookingId).eq("category", item.category);
    const { error } = await supabase.from("media").insert({
      booking_id: bookingId,
      category: item.category,
      storage_path: item.path,
      file_name: item.fileName.slice(0, 200),
      mime_type: item.mime || null,
      size_bytes: item.size,
      width: item.width ?? null,
      height: item.height ?? null,
      sort_order: count ?? 0,
      uploaded_by: viewer.user.id,
    });
    if (error) return fail(error.message);
    touch(bookingId);
    return ok();
  });
}

export async function addExternalMedia(bookingId: string, category: string, url: string, title: string): Promise<ActionResult> {
  return guard(async ({ viewer, supabase }) => {
    const parsed = z.url({ protocol: /^https$/ }).safeParse(url);
    if (!parsed.success) return fail("Enter a valid https:// link.");
    const { error } = await supabase.from("media").insert({
      booking_id: bookingId,
      category: (MEDIA_CATEGORIES as readonly string[]).includes(category) ? category : "tours",
      external_url: parsed.data,
      file_name: clean(120).safeParse(title).data || new URL(parsed.data).hostname,
      title: clean(120).safeParse(title).data || null,
      uploaded_by: viewer.user.id,
    });
    if (error) return fail(error.message);
    touch(bookingId);
    return ok();
  });
}

export async function updateMedia(mediaId: string, patch: { is_visible?: boolean; is_featured?: boolean; title?: string | null }): Promise<ActionResult> {
  return guard(async ({ supabase }) => {
    const { data } = await supabase.from("media").update(patch).eq("id", mediaId).select("booking_id").single();
    if (data) touch(data.booking_id);
    return ok();
  });
}

export async function deleteMedia(mediaId: string): Promise<ActionResult> {
  return guard(async ({ supabase }) => {
    const { data: media } = await supabase.from("media").select("booking_id, storage_path").eq("id", mediaId).single();
    if (!media) return fail("Not found");
    if (media.storage_path) await createAdminClient().storage.from("deliveries").remove([media.storage_path]);
    await supabase.from("media").delete().eq("id", mediaId);
    touch(media.booking_id);
    return ok();
  });
}

/** Signed upload for public assets (portfolio, service imagery, hero video). */
export async function createPublicUpload(folder: string, fileName: string): Promise<ActionResult<{ path: string; token: string; publicUrl: string }>> {
  const result = await guard(async () => {
    const safeFolder = slugify(folder) || "uploads";
    const path = `${safeFolder}/${crypto.randomUUID().slice(0, 8)}-${fileName.replace(/[^\w.\-]+/g, "_").slice(-120)}`;
    const bucket = createAdminClient().storage.from("public-media");
    const { data, error } = await bucket.createSignedUploadUrl(path);
    if (error || !data) return fail(error?.message ?? "Upload URL failed");
    return { ok: true as const, data: { path, token: data.token, publicUrl: bucket.getPublicUrl(path).data.publicUrl } };
  });
  return result as ActionResult<{ path: string; token: string; publicUrl: string }>;
}

/* ------------------------------------------------------------- CRM & leads */

export async function addCustomerNote(customerId: string, text: string): Promise<ActionResult> {
  return guard(async ({ viewer, supabase }) => {
    const body = clean(3000).safeParse(text ?? "");
    if (!body.success || !body.data) return fail("Write a note first.");
    const { error } = await supabase.from("customer_notes").insert({ customer_id: customerId, body: body.data, author_id: viewer.user.id });
    if (error) return fail(error.message);
    revalidatePath(`/admin/customers/${customerId}`);
    return ok();
  });
}

export async function updateLead(leadId: string, status: string, notes: string | null): Promise<ActionResult> {
  return guard(async ({ supabase }) => {
    const statuses = ["new", "contacted", "qualified", "won", "lost", "spam"];
    if (!statuses.includes(status)) return fail("Invalid status");
    const { error } = await supabase.from("contact_leads").update({ status, admin_notes: notes === null ? undefined : clean(3000).safeParse(notes).data ?? null }).eq("id", leadId);
    if (error) return fail(error.message);
    revalidatePath("/admin/leads");
    return ok();
  });
}

/* ---------------------------------------------------------------- invoices */

export async function voidInvoice(invoiceId: string): Promise<ActionResult> {
  return guard(async ({ supabase }) => {
    const { error } = await supabase.from("invoices").update({ status: "void" }).eq("id", invoiceId);
    if (error) return fail(error.message);
    revalidatePath("/admin/invoices");
    return ok();
  });
}

export async function emailInvoice(bookingId: string): Promise<ActionResult> {
  return guard(async () => {
    after(() => notifyBooking("invoice_due", bookingId));
    return ok();
  });
}

/* ------------------------------------------------------------------ settings */

const MARKETING_SCHEMA = z.object({
  stats: z
    .array(z.object({ prefix: z.string().max(4).default(""), value: z.coerce.number().min(0).max(1e9), suffix: z.string().max(6).default(""), label: z.string().trim().min(1).max(80), decimals: z.coerce.number().int().min(0).max(2).optional() }))
    .max(4),
  stats_are_sample: z.boolean(),
  trust_line: z.string().trim().max(120),
  showreel_url: z.string().trim().max(500),
});

export async function saveSettings(patch: Record<string, unknown>): Promise<ActionResult> {
  return guard(async ({ supabase }) => {
    const allowed = new Set([
      "business_name", "legal_name", "tagline", "email", "phone", "address_line1", "address_line2", "city", "state", "postal_code",
      "latitude", "longitude", "timezone", "tax_rate_bps", "tax_label", "tax_travel_fee", "payment_options", "scheduling",
      "referral_program", "notifications", "analytics", "social_links", "service_area_policy", "hero_video_url", "hero_image_url", "marketing",
    ]);
    const clean = Object.fromEntries(Object.entries(patch).filter(([k]) => allowed.has(k)));
    if ("marketing" in clean) {
      const raw = clean.marketing as { stats?: { label?: unknown }[] };
      const m = MARKETING_SCHEMA.safeParse({ ...raw, stats: (raw.stats ?? []).filter((x) => String(x.label ?? "").trim()) });
      if (!m.success) return fail("Check the homepage stats — each needs a number and a label.");
      clean.marketing = m.data;
    }
    if (typeof clean.timezone === "string") {
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: clean.timezone });
      } catch {
        return fail("Unknown timezone");
      }
    }
    const { error } = await supabase.from("business_settings").upsert({ id: 1, ...clean });
    if (error) return fail(error.message);
    updateTag(TAGS.settings);
    revalidatePath("/", "layout");
    return ok();
  });
}
