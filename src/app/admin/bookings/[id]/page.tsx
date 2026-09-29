import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { getSettings } from "@/lib/data/public";
import { signMedia } from "@/lib/data/customer";
import { servicePrice, addOnUnitPrice } from "@/lib/pricing/engine";
import { features } from "@/lib/env";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge, PaymentBadge } from "@/components/ui/badge";
import { StatusTracker } from "@/components/dashboard/status-tracker";
import { CancelControl, LineItemsControl, NotesControl, PaymentsControl, ScheduleControl, StatusControl } from "@/components/admin/booking-controls";
import { MediaManager } from "@/components/admin/media-manager";
import { PROPERTY_TYPE_LABELS } from "@/lib/status";
import { formatCalendarDate, formatDateTime, formatMoney, formatPhone, fullAddress } from "@/lib/utils";
import type { AddOn, Appointment, Booking, BookingEvent, BookingLineItem, Customer, Invoice, MediaItem, Payment, Property, Service } from "@/lib/types";

export const metadata = { title: "Booking" };

type Detail = Booking & {
  customer: Customer; property: Property; items: BookingLineItem[]; appointments: Appointment[]; invoices: Invoice[];
  payments: Payment[]; media: MediaItem[]; events: BookingEvent[];
};

export default async function AdminBookingPage({ params }: PageProps<"/admin/bookings/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const [{ data }, settings, { data: photographers }, { data: services }, { data: addOns }] = await Promise.all([
    supabase
      .from("bookings")
      .select("*, customer:customers(*), property:properties(*), items:booking_services(*), appointments(*), invoices(*), payments(*), media(*), events:booking_events(*)")
      .eq("id", id)
      .maybeSingle(),
    getSettings(),
    supabase.from("photographers").select("id, name").eq("is_active", true).order("name"),
    supabase.from("services").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("add_ons").select("*").eq("is_active", true).order("sort_order"),
  ]);
  if (!data) notFound();
  const b = data as Detail;
  const tz = settings.timezone;
  const items = [...b.items].sort((x, y) => x.sort_order - y.sort_order);
  const appts = b.appointments.filter((a) => a.status !== "cancelled").sort((x, y) => x.starts_at.localeCompare(y.starts_at));
  const events = [...b.events].sort((x, y) => y.created_at.localeCompare(x.created_at));
  const media = await signMedia([...b.media].sort((x, y) => x.category.localeCompare(y.category) || x.sort_order - y.sort_order), 3600);
  const invoice = b.invoices.find((i) => i.status !== "void");
  const due = b.total_cents - b.amount_paid_cents;
  const sqft = b.property.square_feet;
  const svcMap = new Map(((services ?? []) as Service[]).map((s) => [s.id, s]));
  const catalog = [
    ...((services ?? []) as Service[]).map((s) => ({ id: s.id, kind: "service" as const, name: s.name, priceCents: servicePrice(s, sqft) })),
    ...((addOns ?? []) as AddOn[]).map((a) => ({ id: a.id, kind: "add_on" as const, name: a.name, priceCents: addOnUnitPrice({ ...a, trigger_service_ids: [] }, svcMap, sqft) })),
  ];
  const flags = b.metadata as { outside_service_area?: boolean; travel_message?: string };

  return (
    <div className="space-y-6">
      <Link href="/admin/bookings" className="inline-flex items-center gap-2 text-sm text-mist-400 hover:text-bone-50">
        <ArrowLeft className="size-4" /> Bookings
      </Link>
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-gold-200">{b.order_number}</span>
            <StatusBadge status={b.status} />
            <PaymentBadge status={b.payment_status} />
            <span className="text-[12px] text-mist-500">via {b.source} · {formatDateTime(b.created_at, tz)}</span>
          </div>
          <h1 className="mt-2 text-3xl font-medium tracking-[-0.04em]">{b.property.address_line1}</h1>
          <p className="flex items-center gap-2 text-mist-400">
            <MapPin className="size-4" /> {fullAddress(b.property)}
          </p>
          {flags?.outside_service_area && <p className="mt-2 text-sm text-amber-200">⚠ {flags.travel_message ?? "Outside standard service area"}</p>}
        </div>
        {b.status !== "cancelled" && <CancelControl bookingId={b.id} />}
      </div>

      <Card className="p-6">
        <StatusTracker status={b.status} />
        <div className="mt-6 border-t border-white/[0.07] pt-5">
          <StatusControl bookingId={b.id} status={b.status} />
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader title="Schedule" description={appts.length ? appts.map((a) => formatDateTime(a.starts_at, tz)).join(" · ") : b.preferred_date ? `Requested ${formatCalendarDate(b.preferred_date)} (${b.arrival_window ?? "flexible"})` : "Not scheduled"} />
            <CardBody>
              <ScheduleControl
                bookingId={b.id}
                appointment={appts[0] ? { id: appts[0].id, starts_at: appts[0].starts_at, ends_at: appts[0].ends_at, photographer_id: appts[0].photographer_id } : null}
                photographers={photographers ?? []}
                timezone={tz}
                defaultDuration={b.estimated_duration_minutes ?? settings.scheduling.default_duration_minutes}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Services & pricing" />
            <CardBody>
              <LineItemsControl bookingId={b.id} items={items} catalog={catalog} discountCents={b.discount_cents} travelFeeCents={b.travel_fee_cents} discountLabel={b.discount_label} />
              <dl className="mt-5 grid grid-cols-2 gap-2 border-t border-white/[0.07] pt-5 text-sm sm:grid-cols-5">
                {[
                  ["Subtotal", b.subtotal_cents],
                  ["Discount", -b.discount_cents],
                  ["Travel", b.travel_fee_cents],
                  ["Tax", b.tax_cents],
                  ["Total", b.total_cents],
                ].map(([k, v]) => (
                  <div key={k as string}>
                    <dt className="text-[12px] text-mist-500">{k}</dt>
                    <dd className="tabular-nums">{formatMoney(Number(v), "usd", { exact: true })}</dd>
                  </div>
                ))}
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Media delivery" description={b.status === "delivered" ? "Delivered — the client can download these files." : "Upload finished files, then deliver."} />
            <CardBody>
              <MediaManager bookingId={b.id} delivered={b.status === "delivered"} media={media.map((m) => ({ id: m.id, category: m.category, file_name: m.file_name, mime_type: m.mime_type, size_bytes: m.size_bytes, is_visible: m.is_visible, is_featured: m.is_featured, viewUrl: m.viewUrl, external_url: m.external_url }))} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Activity" />
            <CardBody className="space-y-5">
              <NotesControl bookingId={b.id} />
              <ol className="space-y-3 border-l border-white/10 pl-5">
                {events.map((e) => (
                  <li key={e.id} className="relative">
                    <span className={`absolute top-1.5 -left-[1.53rem] size-2.5 rounded-full border-2 border-ink-950 ${e.visibility === "internal" ? "bg-mist-500" : "bg-gold-300"}`} />
                    <p className="text-sm">
                      {e.message}
                      {e.visibility === "internal" && <span className="ml-2 text-[11px] text-mist-500">internal</span>}
                    </p>
                    <p className="text-[12px] text-mist-500">{formatDateTime(e.created_at, tz)}</p>
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Customer" action={<Link href={`/admin/customers/${b.customer.id}`} className="text-[13px] text-gold-200 hover:underline">Profile</Link>} />
            <CardBody className="space-y-2 text-sm">
              <p className="text-base font-medium">
                {b.customer.first_name} {b.customer.last_name}
              </p>
              {(b.customer.company || b.customer.brokerage) && <p className="text-mist-400">{[b.customer.company, b.customer.brokerage].filter(Boolean).join(" · ")}</p>}
              <a href={`mailto:${b.customer.email}`} className="flex items-center gap-2 text-mist-300 hover:text-bone-50">
                <Mail className="size-4" /> {b.customer.email}
              </a>
              {b.customer.phone && (
                <a href={`tel:${b.customer.phone}`} className="flex items-center gap-2 text-mist-300 hover:text-bone-50">
                  <Phone className="size-4" /> {formatPhone(b.customer.phone)}
                </a>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Property & access" />
            <CardBody className="space-y-2 text-sm text-mist-300">
              <p>{PROPERTY_TYPE_LABELS[b.property.property_type]} · {b.property.square_feet?.toLocaleString() ?? "—"} sq ft · {b.property.bedrooms ?? "—"} bd / {b.property.bathrooms ?? "—"} ba</p>
              <p>{b.occupancy ?? "—"} · {b.listing_status?.replace("_", " ") ?? "—"} {b.property.mls_number && `· MLS ${b.property.mls_number}`}</p>
              {b.access_instructions && <p className="rounded-xl bg-amber-400/10 p-3 text-amber-100">🔑 {b.access_instructions}</p>}
              {b.special_instructions && <p className="rounded-xl bg-white/[0.04] p-3">{b.special_instructions}</p>}
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress(b.property))}`} target="_blank" rel="noreferrer" className="inline-block text-gold-200 hover:underline">
                Open in Maps
              </a>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Payments" description={`Paid ${formatMoney(b.amount_paid_cents, "usd", { exact: true })} · due ${formatMoney(Math.max(0, due), "usd", { exact: true })}`} action={invoice && <Link href={`/admin/invoices/${invoice.id}`} className="text-[13px] text-gold-200 hover:underline">{invoice.invoice_number}</Link>} />
            <CardBody>
              <PaymentsControl bookingId={b.id} dueCents={due} stripeEnabled={features.stripe} payments={[...b.payments].filter((p) => p.status !== "pending" && p.status !== "cancelled").sort((x, y) => y.created_at.localeCompare(x.created_at))} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Links" />
            <CardBody className="space-y-2 text-sm">
              <Link href={`/p/${b.share_token}`} target="_blank" className="block text-gold-200 hover:underline">Property website</Link>
              <Link href={`/book/confirmation?id=${b.id}&t=${b.share_token}`} target="_blank" className="block text-gold-200 hover:underline">Customer confirmation page</Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
