import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, ExternalLink, Globe, Lock, MapPin, Receipt } from "lucide-react";
import { requireCustomer } from "@/lib/auth/session";
import { getCustomerBooking, nextAppointment, signMedia } from "@/lib/data/customer";
import { getSettings } from "@/lib/data/public";
import { StatusTracker } from "@/components/dashboard/status-tracker";
import { MediaGallery } from "@/components/dashboard/media-gallery";
import { BookingSelfService, CopyButton } from "@/components/dashboard/client-actions";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { StatusBadge, PaymentBadge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { BOOKING_STATUS_META, PROPERTY_TYPE_LABELS } from "@/lib/status";
import { env, features } from "@/lib/env";
import { formatCalendarDate, formatDate, formatDateTime, formatMoney, fullAddress } from "@/lib/utils";
import { payInvoice } from "@/app/dashboard/actions";

export default async function OrderDetailPage({ params }: PageProps<"/dashboard/orders/[id]">) {
  const { id } = await params;
  const { supabase } = await requireCustomer(`/dashboard/orders/${id}`);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [booking, settings] = await Promise.all([getCustomerBooking(supabase, id), getSettings()]);
  if (!booking) notFound();

  const appt = nextAppointment(booking);
  const invoice = booking.invoices.find((i) => i.status !== "void") ?? null;
  const media = booking.status === "delivered" ? await signMedia(booking.media) : [];
  const due = booking.total_cents - booking.amount_paid_cents;
  const shareUrl = `${env.siteUrl}/p/${booking.share_token}`;
  const canCancel = ["requested", "confirmed", "scheduled"].includes(booking.status) && (!appt || new Date(appt.starts_at).getTime() - Date.now() > 24 * 3600 * 1000);
  const p = booking.property;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/orders" className="inline-flex items-center gap-2 text-sm text-mist-400 hover:text-bone-50">
        <ArrowLeft className="size-4" /> All shoots
      </Link>

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[12px] text-mist-500">{booking.order_number}</span>
            <StatusBadge status={booking.status} />
            <PaymentBadge status={booking.payment_status} />
          </div>
          <h1 className="mt-3 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">{p.address_line1}</h1>
          <p className="mt-1 flex items-center gap-2 text-mist-400">
            <MapPin className="size-4" /> {p.city}, {p.state} {p.postal_code}
            {p.square_feet && <span>· {p.square_feet.toLocaleString()} sq ft</span>}
          </p>
        </div>
        <BookingSelfService bookingId={booking.id} canCancel={canCancel} />
      </div>

      <Card className="p-6 sm:p-8">
        <StatusTracker status={booking.status} />
        <p className="mt-6 text-sm text-mist-400">{BOOKING_STATUS_META[booking.status].description}</p>
      </Card>

      {booking.status === "delivered" && media.length > 0 ? (
        <Card>
          <CardHeader title="Your media" description={`Delivered ${formatDate(booking.delivered_at, settings.timezone)} · links refresh each visit`} />
          <CardBody>
            <MediaGallery media={media} zipName={`${booking.order_number}-${p.address_line1.replace(/[^a-z0-9]+/gi, "-")}`} shareUrl={shareUrl} />
          </CardBody>
        </Card>
      ) : (
        <Card className="flex items-center gap-4 p-6">
          <span className="grid size-11 place-items-center rounded-2xl bg-white/5 text-mist-400">
            <Lock className="size-5" />
          </span>
          <div>
            <p className="font-medium">Media will appear here once delivered</p>
            <p className="text-sm text-mist-400">We&rsquo;ll email you the moment it&rsquo;s ready — usually by the next morning.</p>
          </div>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Services ordered" />
          <CardBody>
            <ul className="divide-y divide-white/[0.06]">
              {booking.items.map((i) => (
                <li key={i.id} className="flex justify-between gap-4 py-3 text-[14.5px]">
                  <span className={i.included_in_package ? "pl-4 text-mist-400" : ""}>
                    {i.name}
                    {i.quantity > 1 && <span className="text-mist-500"> × {i.quantity}</span>}
                  </span>
                  <span className="tabular-nums text-mist-300">{i.included_in_package ? "Included" : formatMoney(i.total_cents, booking.currency, { exact: true })}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-white/[0.07] pt-4 text-sm">
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
              <div className="flex justify-between text-base font-medium">
                <dt>Total</dt>
                <dd>{formatMoney(booking.total_cents, booking.currency, { exact: true })}</dd>
              </div>
            </dl>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Appointment" />
            <CardBody className="space-y-3 text-sm">
              <p className="flex items-center gap-2.5">
                <CalendarDays className="size-4 text-gold-300" />
                {appt ? formatDateTime(appt.starts_at, settings.timezone) : booking.preferred_date ? `Requested for ${formatCalendarDate(booking.preferred_date)}` : "To be scheduled"}
              </p>
              {appt && (
                <p className="flex items-center gap-2.5 text-mist-400">
                  <Clock className="size-4" /> About {Math.round((new Date(appt.ends_at).getTime() - new Date(appt.starts_at).getTime()) / 60000)} minutes on site
                </p>
              )}
              <p className="text-mist-400">{PROPERTY_TYPE_LABELS[p.property_type] ?? p.property_type} · {booking.occupancy ?? "—"}</p>
              {appt && (
                <a href={`/api/booking/ics?id=${booking.id}&t=${booking.share_token}`} className="inline-block text-gold-200 hover:underline">
                  Add to calendar
                </a>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Invoice" action={invoice && <Link href={`/dashboard/invoices/${invoice.id}`} className="text-[13px] text-gold-200 hover:underline">View</Link>} />
            <CardBody className="space-y-3 text-sm">
              <div className="flex justify-between text-mist-400">
                <span>Paid</span>
                <span className="text-bone-100">{formatMoney(booking.amount_paid_cents, booking.currency, { exact: true })}</span>
              </div>
              <div className="flex justify-between text-mist-400">
                <span>Balance</span>
                <span className="text-bone-100">{formatMoney(Math.max(0, due), booking.currency, { exact: true })}</span>
              </div>
              {invoice && due > 0 && booking.status !== "cancelled" && features.stripe && (
                <form action={payInvoice.bind(null, invoice.id)}>
                  <button type="submit" className={buttonStyles({ className: "mt-2 w-full" })}>
                    <Receipt className="size-4" /> Pay {formatMoney(due, booking.currency, { exact: true })}
                  </button>
                </form>
              )}
            </CardBody>
          </Card>

          {booking.status === "delivered" && (
            <Card>
              <CardHeader title="Share & property website" />
              <CardBody className="space-y-3">
                <Link href={`/p/${booking.share_token}`} target="_blank" className={buttonStyles({ variant: "outline", className: "w-full" })}>
                  <Globe className="size-4" /> Open property website <ExternalLink className="size-3.5" />
                </Link>
                <div className="flex flex-wrap gap-2">
                  <CopyButton value={shareUrl} label="Branded link" />
                  <CopyButton value={`${shareUrl}?mls=1`} label="MLS (unbranded)" />
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {booking.events.length > 0 && (
        <Card>
          <CardHeader title="Activity" />
          <CardBody>
            <ol className="space-y-4 border-l border-white/10 pl-5">
              {booking.events.map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute top-1.5 -left-[1.53rem] size-2.5 rounded-full border-2 border-ink-950 bg-gold-300" />
                  <p className="text-sm text-bone-100">{e.message}</p>
                  <p className="text-[12px] text-mist-500">{formatDateTime(e.created_at, settings.timezone)}</p>
                </li>
              ))}
            </ol>
          </CardBody>
        </Card>
      )}
      <p className="text-[12px] text-mist-600">{fullAddress(p)}</p>
    </div>
  );
}
