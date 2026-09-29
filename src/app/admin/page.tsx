import Link from "next/link";
import { AlertTriangle, ArrowUpRight, CalendarDays } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { getSettings } from "@/lib/data/public";
import { dayRangeUtc, todayYmd, addDaysYmd } from "@/lib/scheduling/tz";
import { PageTitle } from "@/components/dashboard/shell";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge, LeadBadge } from "@/components/ui/badge";
import { EmptyState, Stat } from "@/components/ui/misc";
import { formatDate, formatMoney, formatTime, formatDateTime } from "@/lib/utils";
import type { BookingStatus } from "@/lib/types";

export const metadata = { title: "Dashboard" };

type ApptRow = { id: string; starts_at: string; booking_id: string; photographer: { name: string; color: string } | null; booking: { order_number: string; status: BookingStatus; property: { address_line1: string; city: string } } };

export default async function AdminHome() {
  const { supabase } = await requireAdmin();
  const settings = await getSettings();
  const tz = settings.timezone;
  const today = todayYmd(tz);
  const monthStart = dayRangeUtc(`${today.slice(0, 7)}-01`, tz).start;
  const [y, m] = today.split("-").map(Number);
  const nextMonth = dayRangeUtc(`${m === 12 ? y + 1 : y}-${String(m === 12 ? 1 : m + 1).padStart(2, "0")}-01`, tz).start;
  const todayRange = dayRangeUtc(today, tz);
  const weekEnd = dayRangeUtc(addDaysYmd(today, 8), tz).start;

  const [metrics, revenue, appts, pending, invoices, leads, customers, samples] = await Promise.all([
    supabase.rpc("admin_dashboard_metrics", { p_from: monthStart.toISOString(), p_to: nextMonth.toISOString() }),
    supabase.rpc("admin_revenue_by_month", { p_months: 6, p_timezone: tz }),
    supabase
      .from("appointments")
      .select("id, starts_at, booking_id, photographer:photographers(name, color), booking:bookings(order_number, status, property:properties(address_line1, city))")
      .eq("status", "scheduled")
      .gte("starts_at", todayRange.start.toISOString())
      .lt("starts_at", weekEnd.toISOString())
      .order("starts_at"),
    supabase.from("bookings").select("id, order_number, status, updated_at, property:properties(address_line1)").in("status", ["shoot_completed", "editing", "ready_for_delivery"]).order("updated_at").limit(6),
    supabase.from("invoices").select("id, invoice_number, amount_due_cents, due_date, booking_id, customer:customers(first_name, last_name)").eq("status", "open").gt("amount_due_cents", 0).order("due_date").limit(6),
    supabase.from("contact_leads").select("id, name, reason, status, created_at").eq("status", "new").order("created_at", { ascending: false }).limit(5),
    supabase.from("customers").select("id, first_name, last_name, email, company, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("testimonials").select("id", { count: "exact", head: true }).eq("is_sample", true).eq("is_published", true),
  ]);
  const k = (metrics.data ?? {}) as Record<string, number>;
  const aov = k.bookings_count ? Math.round(k.booked_value_cents / k.bookings_count) : 0;
  const all = (appts.data ?? []) as unknown as ApptRow[];
  const todays = all.filter((a) => new Date(a.starts_at) < todayRange.end);
  const upcoming = all.filter((a) => new Date(a.starts_at) >= todayRange.end);

  return (
    <div className="space-y-8">
      <PageTitle title="Studio dashboard" description={new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeZone: tz }).format(new Date())} />
      {(samples.count ?? 0) > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            Sample testimonials/portfolio are still published. <Link href="/admin/testimonials" className="underline">Replace them</Link> before launch.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Revenue this month" value={formatMoney(k.revenue_cents ?? 0)} sub="Collected payments" />
        <Stat label="Bookings this month" value={k.bookings_count ?? 0} sub={`${formatMoney(k.booked_value_cents ?? 0)} booked`} />
        <Stat label="Average order" value={formatMoney(aov)} />
        <Stat label="Awaiting action" value={(k.requested_bookings ?? 0) + (k.pending_deliveries ?? 0)} sub={`${k.requested_bookings ?? 0} requests · ${k.pending_deliveries ?? 0} deliveries`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Revenue" description="Last 6 months, collected" />
          <CardBody>
            <RevenueChart data={(revenue.data ?? []) as { month: string; revenue_cents: number; bookings_count: number }[]} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Today's shoots" action={<Link href="/admin/calendar" className="text-[13px] text-gold-200 hover:underline">Calendar</Link>} />
          <CardBody className="space-y-3">
            {todays.length === 0 && <p className="text-sm text-mist-500">No shoots today.</p>}
            {todays.map((a) => (
              <Link key={a.id} href={`/admin/bookings/${a.booking_id}`} className="flex items-center gap-3 rounded-xl border border-white/[0.07] p-3 transition hover:border-white/20">
                <span className="w-16 font-mono text-[12px] text-gold-200">{formatTime(a.starts_at, tz)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{a.booking.property.address_line1}</span>
                  <span className="text-[12px] text-mist-500">{a.photographer?.name ?? "Unassigned"}</span>
                </span>
              </Link>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader title="Upcoming (7 days)" />
          <CardBody className="space-y-2">
            {upcoming.length === 0 && <EmptyState icon={<CalendarDays className="size-5" />} title="Nothing scheduled" className="py-8" />}
            {upcoming.slice(0, 8).map((a) => (
              <Link key={a.id} href={`/admin/bookings/${a.booking_id}`} className="flex items-center justify-between gap-3 py-1.5 text-sm hover:text-gold-100">
                <span className="truncate">{a.booking.property.address_line1}</span>
                <span className="shrink-0 text-[12px] text-mist-500">{formatDateTime(a.starts_at, tz)}</span>
              </Link>
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Pending deliveries" />
          <CardBody className="space-y-2">
            {(pending.data ?? []).length === 0 && <p className="text-sm text-mist-500">All caught up.</p>}
            {((pending.data ?? []) as unknown as { id: string; order_number: string; status: BookingStatus; property: { address_line1: string } }[]).map((b) => (
              <Link key={b.id} href={`/admin/bookings/${b.id}`} className="flex items-center justify-between gap-3 py-1.5 text-sm hover:text-gold-100">
                <span className="truncate">{b.property.address_line1}</span>
                <StatusBadge status={b.status} />
              </Link>
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Unpaid invoices" action={<span className="text-[13px] text-mist-400">{formatMoney(k.unpaid_invoices_cents ?? 0)}</span>} />
          <CardBody className="space-y-2">
            {(invoices.data ?? []).length === 0 && <p className="text-sm text-mist-500">Nothing outstanding.</p>}
            {((invoices.data ?? []) as unknown as { id: string; invoice_number: string; amount_due_cents: number; due_date: string | null; booking_id: string; customer: { first_name: string; last_name: string } }[]).map((i) => (
              <Link key={i.id} href={`/admin/invoices/${i.id}`} className="flex items-center justify-between gap-3 py-1.5 text-sm hover:text-gold-100">
                <span className="truncate">
                  {i.invoice_number} · {i.customer.first_name} {i.customer.last_name}
                </span>
                <span className="tabular-nums">{formatMoney(i.amount_due_cents, "usd", { exact: true })}</span>
              </Link>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="New leads" action={<Link href="/admin/leads" className="text-[13px] text-gold-200 hover:underline">All leads</Link>} />
          <CardBody className="space-y-2">
            {(leads.data ?? []).length === 0 && <p className="text-sm text-mist-500">No new inquiries.</p>}
            {(leads.data ?? []).map((l) => (
              <Link key={l.id} href={`/admin/leads?focus=${l.id}`} className="flex items-center justify-between gap-3 py-1.5 text-sm hover:text-gold-100">
                <span className="truncate">
                  {l.name} · <span className="text-mist-500">{String(l.reason).replace("_", " ")}</span>
                </span>
                <LeadBadge status={l.status} />
              </Link>
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Recent customers" action={<Link href="/admin/customers" className="text-[13px] text-gold-200 hover:underline">CRM</Link>} />
          <CardBody className="space-y-2">
            {(customers.data ?? []).map((c) => (
              <Link key={c.id} href={`/admin/customers/${c.id}`} className="flex items-center justify-between gap-3 py-1.5 text-sm hover:text-gold-100">
                <span className="truncate">
                  {c.first_name} {c.last_name} <span className="text-mist-500">· {c.company ?? c.email}</span>
                </span>
                <span className="flex items-center gap-1 text-[12px] text-mist-500">
                  {formatDate(c.created_at, tz)} <ArrowUpRight className="size-3" />
                </span>
              </Link>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
