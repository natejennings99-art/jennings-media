import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarPlus, CheckCircle2, Clock, Download, Mail, MapPin } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { features } from "@/lib/env";
import { getStripe } from "@/lib/stripe/server";
import { applyCheckoutSession } from "@/lib/booking/payments";
import { getSettings } from "@/lib/data/public";
import { getViewer } from "@/lib/auth/session";
import { formatDateTime, formatMoney, fullAddress, formatCalendarDate } from "@/lib/utils";
import { buttonStyles } from "@/components/ui/button";
import { StatusBadge, PaymentBadge } from "@/components/ui/badge";
import { ConversionTracker } from "@/components/booking/conversion-tracker";
import type { Appointment, Booking, BookingLineItem, Customer, Property } from "@/lib/types";

export const metadata: Metadata = { title: "Booking confirmed", robots: { index: false } };

type Row = Booking & { customer: Customer; property: Property; items: BookingLineItem[]; appointments: Appointment[] };

async function load(id: string, token: string) {
  const { data } = await createAdminClient()
    .from("bookings")
    .select("*, customer:customers(*), property:properties(*), items:booking_services(*), appointments(*)")
    .eq("id", id)
    .eq("share_token", token)
    .maybeSingle();
  return data as Row | null;
}

export default async function ConfirmationPage({ searchParams }: PageProps<"/book/confirmation">) {
  const params = await searchParams;
  const id = typeof params.id === "string" ? params.id : "";
  const token = typeof params.t === "string" ? params.t : "";
  const sessionId = typeof params.session_id === "string" ? params.session_id : null;
  if (!features.supabaseAdmin || !/^[0-9a-f-]{36}$/.test(id) || !/^[a-f0-9]{32}$/.test(token)) notFound();

  let booking = await load(id, token);
  if (!booking) notFound();

  // Apply the payment immediately instead of waiting for the webhook.
  if (sessionId && features.stripe && booking.payment_status !== "paid") {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      if (session.metadata?.booking_id === booking.id) {
        await applyCheckoutSession(session);
        booking = (await load(id, token)) ?? booking;
      }
    } catch (error) {
      console.error("[confirmation] session check failed", error);
    }
  }

  const [settings, viewer] = await Promise.all([getSettings(), getViewer()]);
  const appt = (booking.appointments ?? []).filter((a) => a.status !== "cancelled").sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0];
  const items = (booking.items ?? []).sort((a, b) => a.sort_order - b.sort_order);
  const confirmed = booking.status !== "requested" && booking.status !== "cancelled";
  const due = booking.total_cents - booking.amount_paid_cents;
  const dashboardHref = `/dashboard/orders/${booking.id}`;
  const accountHref = viewer ? dashboardHref : `/login?email=${encodeURIComponent(booking.customer.email)}&next=${encodeURIComponent(dashboardHref)}`;

  return (
    <div className="container-page pt-28 pb-24 sm:pt-32">
      <ConversionTracker orderId={booking.order_number} valueCents={booking.total_cents} />
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <div className="mx-auto grid size-20 animate-fade-up place-items-center rounded-full bg-emerald-400/10 ring-1 ring-emerald-400/30">
            <CheckCircle2 className="size-10 text-emerald-300" strokeWidth={1.5} />
          </div>
          <h1 className="mt-7 animate-fade-up text-4xl font-medium tracking-[-0.045em] [animation-delay:100ms] sm:text-5xl">
            {booking.status === "cancelled" ? "This booking was cancelled" : confirmed ? "You're booked!" : "Request received!"}
          </h1>
          <p className="mx-auto mt-4 max-w-lg animate-fade-up text-mist-300 [animation-delay:180ms]">
            {confirmed
              ? `We've sent a confirmation to ${booking.customer.email}. Your photographer will arrive ready to create something beautiful.`
              : `We've emailed ${booking.customer.email}. ${appt ? "We'll confirm your appointment shortly." : "We'll reach out within one business day to schedule."}`}
          </p>
          <div className="mt-6 flex animate-fade-up items-center justify-center gap-2 [animation-delay:240ms]">
            <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[12px] text-mist-300">Order {booking.order_number}</span>
            <StatusBadge status={booking.status} />
            <PaymentBadge status={booking.payment_status} />
          </div>
        </div>

        <div className="surface mt-12 animate-fade-up rounded-[28px] p-6 [animation-delay:320ms] sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-accent-300" />
              <div>
                <p className="text-[12px] tracking-[0.12em] text-mist-500 uppercase">Property</p>
                <p className="mt-1 text-bone-100">{fullAddress(booking.property)}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock className="mt-0.5 size-5 shrink-0 text-accent-300" />
              <div>
                <p className="text-[12px] tracking-[0.12em] text-mist-500 uppercase">Appointment</p>
                <p className="mt-1 text-bone-100">
                  {appt ? formatDateTime(appt.starts_at, settings.timezone) : booking.preferred_date ? `Requested for ${formatCalendarDate(booking.preferred_date)}` : "We'll contact you to schedule"}
                </p>
              </div>
            </div>
          </div>

          <ul className="mt-8 divide-y divide-white/[0.06] border-y border-white/[0.06]">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4 py-3 text-[14.5px]">
                <span className={i.included_in_package ? "pl-4 text-mist-400" : "text-bone-100"}>
                  {i.name}
                  {i.quantity > 1 && ` × ${i.quantity}`}
                </span>
                <span className="tabular-nums text-mist-300">{i.included_in_package ? "Included" : formatMoney(i.total_cents, booking.currency, { exact: true })}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 text-[14px]">
            {booking.discount_cents > 0 && (
              <div className="flex justify-between text-emerald-300">
                <dt>{booking.discount_label ?? "Discount"}</dt>
                <dd>−{formatMoney(booking.discount_cents, booking.currency, { exact: true })}</dd>
              </div>
            )}
            {booking.travel_fee_cents > 0 && (
              <div className="flex justify-between text-mist-400">
                <dt>Travel fee</dt>
                <dd>{formatMoney(booking.travel_fee_cents, booking.currency, { exact: true })}</dd>
              </div>
            )}
            {booking.tax_cents > 0 && (
              <div className="flex justify-between text-mist-400">
                <dt>{settings.tax_label}</dt>
                <dd>{formatMoney(booking.tax_cents, booking.currency, { exact: true })}</dd>
              </div>
            )}
            <div className="flex justify-between text-lg font-medium">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatMoney(booking.total_cents, booking.currency, { exact: true })}</dd>
            </div>
            <div className="flex justify-between text-mist-400">
              <dt>Paid</dt>
              <dd className="tabular-nums">{formatMoney(booking.amount_paid_cents, booking.currency, { exact: true })}</dd>
            </div>
            {due > 0 && booking.status !== "cancelled" && (
              <div className="flex justify-between text-accent-200">
                <dt>Balance due before delivery</dt>
                <dd className="tabular-nums">{formatMoney(due, booking.currency, { exact: true })}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {appt && (
            <a href={`/api/booking/ics?id=${booking.id}&t=${token}`} className={buttonStyles({ variant: "secondary", size: "lg" })}>
              <CalendarPlus className="size-4" /> Add to calendar
            </a>
          )}
          <Link href={accountHref} className={buttonStyles({ size: "lg", className: appt ? "sm:col-span-2" : "sm:col-span-3" })}>
            {viewer ? "Open your dashboard" : "Track this order in your dashboard"} <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Mail, title: "Check your inbox", body: "Confirmation, prep checklist and reminders are on their way." },
            { icon: Clock, title: "Prep the property", body: "Lights on, blinds open, counters clear, cars out of the driveway." },
            { icon: Download, title: "Get your media", body: "Photos arrive in your dashboard by the next morning." },
          ].map((s) => (
            <div key={s.title} className="surface rounded-2xl p-5">
              <s.icon className="size-5 text-accent-300" />
              <p className="mt-3 font-medium">{s.title}</p>
              <p className="mt-1 text-[13.5px] text-mist-400">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
