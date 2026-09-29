import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { features, env, serverEnv } from "@/lib/env";
import { getSettings } from "@/lib/data/public";
import { sendEmail, type SendResult } from "@/lib/email/send";
import * as T from "@/lib/email/templates";
import { sendSms } from "./sms";
import { BOOKING_STATUS_META } from "@/lib/status";
import { formatDateTime, formatMoney, fullAddress, formatCalendarDate } from "@/lib/utils";
import type { Appointment, Booking, BookingLineItem, BusinessSettings, Customer, Invoice, Property } from "@/lib/types";

export type BookingNotification =
  | "received"
  | "confirmed"
  | "reminder"
  | "shoot_completed"
  | "media_ready"
  | "payment_received"
  | "invoice_due"
  | "changed"
  | "cancelled"
  | "message";

export interface BookingContext {
  booking: Booking;
  customer: Customer;
  property: Property;
  items: BookingLineItem[];
  appointments: Appointment[];
  invoice: Invoice | null;
  settings: BusinessSettings;
}

export async function loadBookingContext(bookingId: string): Promise<BookingContext | null> {
  const db = createAdminClient();
  const { data } = await db
    .from("bookings")
    .select("*, customer:customers(*), property:properties(*), items:booking_services(*), appointments(*), invoices(*)")
    .eq("id", bookingId)
    .maybeSingle();
  if (!data) return null;
  const { customer, property, items, appointments, invoices, ...booking } = data as Booking & {
    customer: Customer;
    property: Property;
    items: BookingLineItem[];
    appointments: Appointment[];
    invoices: Invoice[];
  };
  return {
    booking: booking as Booking,
    customer,
    property,
    items: [...(items ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    appointments: (appointments ?? []).filter((a) => a.status !== "cancelled").sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
    invoice: (invoices ?? []).find((i) => i.status !== "void") ?? null,
    settings: await getSettings(),
  };
}

export function brandOf(settings: BusinessSettings): T.Brand {
  return { name: settings.business_name, email: settings.email, phone: settings.phone, siteUrl: env.siteUrl };
}

export function appointmentLabel(ctx: Pick<BookingContext, "appointments" | "booking" | "settings">) {
  const appt = ctx.appointments[0];
  if (appt) return formatDateTime(appt.starts_at, ctx.settings.timezone);
  if (ctx.booking.preferred_date) return `${formatCalendarDate(ctx.booking.preferred_date)} (requested)`;
  return null;
}

const PAYMENT_LABEL: Record<string, string> = {
  full: "Paid in full at booking",
  deposit: "Deposit at booking, balance before delivery",
  later: "Pay after the shoot",
};

export function emailData(ctx: BookingContext): T.BookingEmailData {
  const { booking, customer, property, settings } = ctx;
  const c = settings.currency;
  return {
    brand: brandOf(settings),
    customerName: customer.first_name || "there",
    orderNumber: booking.order_number,
    address: fullAddress(property),
    when: appointmentLabel(ctx),
    services: ctx.items.filter((i) => i.item_type !== "fee").map((i) => i.name),
    total: formatMoney(booking.total_cents, c, { exact: true }),
    paid: formatMoney(booking.amount_paid_cents, c, { exact: true }),
    due: formatMoney(Math.max(0, booking.total_cents - booking.amount_paid_cents), c, { exact: true }),
    paymentLabel: PAYMENT_LABEL[booking.payment_option] ?? booking.payment_option,
    dashboardUrl: `${env.siteUrl}/dashboard/orders/${booking.id}`,
    statusLabel: BOOKING_STATUS_META[booking.status]?.label ?? booking.status,
  };
}

export function adminRecipients(settings: BusinessSettings) {
  return [...new Set([...settings.notifications.admin_emails, ...serverEnv.adminNotificationEmails].map((e) => e.trim()).filter(Boolean))];
}

async function log(entry: {
  channel: "email" | "sms";
  template: string;
  recipient: string;
  subject?: string;
  bookingId?: string | null;
  customerId?: string | null;
  result: SendResult | { status: "sent" | "failed" | "skipped"; id?: string; error?: string };
  provider: string;
}) {
  try {
    await createAdminClient()
      .from("notifications")
      .insert({
        channel: entry.channel,
        template: entry.template,
        recipient: entry.recipient,
        subject: entry.subject ?? null,
        booking_id: entry.bookingId ?? null,
        customer_id: entry.customerId ?? null,
        status: entry.result.status,
        provider: entry.provider,
        provider_message_id: entry.result.id ?? null,
        error: entry.result.error ?? null,
        sent_at: entry.result.status === "sent" ? new Date().toISOString() : null,
      });
  } catch (error) {
    console.error("[notifications] failed to log", error);
  }
}

export async function sendLogged(
  template: string,
  to: string | string[],
  content: T.EmailContent,
  meta: { bookingId?: string | null; customerId?: string | null; replyTo?: string | null } = {}
) {
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean);
  if (!recipients.length) return;
  const result = await sendEmail(recipients, content, { replyTo: meta.replyTo, tags: { template } });
  await log({
    channel: "email",
    template,
    recipient: recipients.join(", "),
    subject: content.subject,
    bookingId: meta.bookingId,
    customerId: meta.customerId,
    result,
    provider: result.provider,
  });
  return result;
}

async function maybeSms(ctx: BookingContext, template: string, body: string) {
  if (!ctx.settings.notifications.sms_enabled || !ctx.customer.sms_opt_in || !ctx.customer.phone) return;
  const result = await sendSms(ctx.customer.phone, body);
  await log({ channel: "sms", template, recipient: ctx.customer.phone, bookingId: ctx.booking.id, customerId: ctx.customer.id, result, provider: "twilio" });
}

/**
 * Sends the customer (and, where relevant, admin) notifications for a booking event.
 * Never throws — notification failures must not break the business flow.
 */
export async function notifyBooking(
  event: BookingNotification,
  bookingId: string,
  extra: { changes?: string[]; reason?: string | null; amountCents?: number; receiptUrl?: string | null; message?: string; payUrl?: string; adminOnly?: boolean } = {}
) {
  if (!features.supabaseAdmin) return;
  try {
    const ctx = await loadBookingContext(bookingId);
    if (!ctx) return;
    const d = emailData(ctx);
    const to = ctx.customer.email;
    const meta = { bookingId, customerId: ctx.customer.id, replyTo: ctx.settings.notifications.reply_to || ctx.settings.email };
    const admins = adminRecipients(ctx.settings);
    const adminUrl = `${env.siteUrl}/admin/bookings/${bookingId}`;
    const due = ctx.booking.total_cents - ctx.booking.amount_paid_cents;

    switch (event) {
      case "received": {
        const note = ctx.booking.status === "requested" ? "We'll confirm your appointment shortly." : "Your appointment is locked in.";
        if (!extra.adminOnly) await sendLogged("booking_received", to, T.bookingReceived({ ...d, note }), meta);
        const flags = [
          ctx.booking.metadata?.outside_service_area ? "⚠ Outside the standard service area" : "",
          ctx.appointments.length === 0 ? "⚠ No time slot reserved — schedule manually" : "",
        ].filter(Boolean);
        await sendLogged(
          "admin_new_booking",
          admins,
          T.adminNewBooking({ ...d, customerName: `${ctx.customer.first_name} ${ctx.customer.last_name}`.trim(), customerEmail: ctx.customer.email, customerPhone: ctx.customer.phone, adminUrl, flags }),
          { bookingId }
        );
        break;
      }
      case "confirmed":
        await sendLogged("booking_confirmed", to, T.bookingConfirmed(d), meta);
        await maybeSms(ctx, "booking_confirmed", `${ctx.settings.business_name}: your shoot at ${ctx.property.address_line1} is confirmed${d.when ? ` for ${d.when}` : ""}.`);
        break;
      case "reminder":
        await sendLogged("booking_reminder", to, T.bookingReminder(d), meta);
        await maybeSms(ctx, "booking_reminder", `Reminder from ${ctx.settings.business_name}: shoot at ${ctx.property.address_line1}${d.when ? ` ${d.when}` : ""}. Lights on, blinds open!`);
        break;
      case "shoot_completed":
        await sendLogged("shoot_completed", to, T.shootCompleted(d), meta);
        break;
      case "media_ready":
        await sendLogged("media_ready", to, T.mediaReady({ ...d, balanceDue: due > 0 }), meta);
        await maybeSms(ctx, "media_ready", `${ctx.settings.business_name}: your media for ${ctx.property.address_line1} is ready! ${d.dashboardUrl}`);
        break;
      case "payment_received": {
        const amount = formatMoney(extra.amountCents ?? 0, ctx.settings.currency, { exact: true });
        await sendLogged("payment_received", to, T.paymentReceived({ ...d, amount, receiptUrl: extra.receiptUrl }), meta);
        await sendLogged("admin_payment", admins, T.adminEvent(d.brand, `Payment received: ${amount}`, [`${d.orderNumber} · ${d.address}`, `Balance: ${d.due}`], adminUrl), { bookingId });
        break;
      }
      case "invoice_due":
        if (!ctx.invoice) return;
        await sendLogged(
          "invoice_due",
          to,
          T.invoiceDue({
            ...d,
            invoiceNumber: ctx.invoice.invoice_number,
            payUrl: extra.payUrl ?? `${env.siteUrl}/dashboard/invoices/${ctx.invoice.id}`,
            dueDate: ctx.invoice.due_date ? formatCalendarDate(ctx.invoice.due_date) : null,
          }),
          meta
        );
        break;
      case "changed":
        await sendLogged("booking_changed", to, T.bookingChanged({ ...d, changes: extra.changes ?? ["Booking details updated"] }), meta);
        break;
      case "cancelled":
        await sendLogged("booking_cancelled", to, T.bookingCancelled({ ...d, reason: extra.reason }), meta);
        await sendLogged("admin_cancelled", admins, T.adminEvent(d.brand, `Booking cancelled: ${d.orderNumber}`, [d.address, extra.reason ?? ""], adminUrl), { bookingId });
        break;
      case "message":
        if (extra.message) await sendLogged("client_message", to, T.clientMessage({ ...d, message: extra.message }), meta);
        break;
    }
  } catch (error) {
    console.error(`[notifications] ${event} failed for ${bookingId}`, error);
  }
}
