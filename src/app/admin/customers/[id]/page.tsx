import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { getSettings } from "@/lib/data/public";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge, InvoiceBadge } from "@/components/ui/badge";
import { Stat } from "@/components/ui/misc";
import { CustomerNoteForm } from "@/components/admin/customer-note-form";
import { formatDate, formatDateTime, formatMoney, formatPhone } from "@/lib/utils";
import type { BookingStatus } from "@/lib/types";

export const metadata = { title: "Customer" };

export default async function CustomerPage({ params }: PageProps<"/admin/customers/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const settings = await getSettings();
  const [{ data: c }, { data: stats }, { data: bookings }, { data: properties }, { data: invoices }, { data: notes }, { data: referrals }] = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).maybeSingle(),
    supabase.from("customer_stats").select("*").eq("customer_id", id).maybeSingle(),
    supabase.from("bookings").select("id, order_number, status, total_cents, created_at, property:properties(address_line1)").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("properties").select("id, address_line1, city, square_feet").eq("customer_id", id),
    supabase.from("invoices").select("id, invoice_number, status, total_cents, amount_due_cents").eq("customer_id", id).order("issued_at", { ascending: false }),
    supabase.from("customer_notes").select("id, body, created_at").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("referrals").select("id, status, referred_email").eq("referrer_id", id),
  ]);
  if (!c) notFound();
  const tz = settings.timezone;
  return (
    <div className="space-y-6">
      <Link href="/admin/customers" className="inline-flex items-center gap-2 text-sm text-mist-400 hover:text-bone-50">
        <ArrowLeft className="size-4" /> Customers
      </Link>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-medium tracking-[-0.04em]">
            {c.first_name} {c.last_name}
          </h1>
          <p className="text-mist-400">{[c.company, c.brokerage].filter(Boolean).join(" · ") || "—"}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-mist-300">
            <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 hover:text-bone-50"><Mail className="size-4" /> {c.email}</a>
            {c.phone && <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 hover:text-bone-50"><Phone className="size-4" /> {formatPhone(c.phone)}</a>}
          </div>
        </div>
        <div className="text-right text-[12.5px] text-mist-500">
          Customer since {formatDate(c.created_at, tz)}
          <br />
          {c.user_id ? "Has a login" : "Guest (no login yet)"} · referral code <span className="font-mono text-accent-200">{c.referral_code}</span>
          <br />
          <span className="font-mono">{c.id}</span>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Bookings" value={stats?.bookings_count ?? 0} />
        <Stat label="Lifetime revenue" value={formatMoney(Number(stats?.lifetime_revenue_cents ?? 0))} />
        <Stat label="Last booking" value={stats?.last_booking_at ? formatDate(stats.last_booking_at, tz, { month: "short", day: "numeric" }) : "—"} />
        <Stat label="Next shoot" value={stats?.next_appointment_at ? formatDate(stats.next_appointment_at, tz, { month: "short", day: "numeric" }) : "—"} />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Bookings" />
          <CardBody className="divide-y divide-white/[0.06]">
            {((bookings ?? []) as unknown as { id: string; order_number: string; status: BookingStatus; total_cents: number; created_at: string; property: { address_line1: string } }[]).map((b) => (
              <Link key={b.id} href={`/admin/bookings/${b.id}`} className="flex items-center justify-between gap-3 py-3 text-sm hover:text-accent-100">
                <span>
                  <span className="font-mono text-[12px] text-mist-500">{b.order_number}</span> {b.property.address_line1}
                </span>
                <span className="flex items-center gap-3">
                  <StatusBadge status={b.status} />
                  <span className="w-20 text-right tabular-nums">{formatMoney(b.total_cents)}</span>
                </span>
              </Link>
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Notes" />
          <CardBody className="space-y-4">
            <CustomerNoteForm customerId={c.id} />
            {(notes ?? []).map((n) => (
              <div key={n.id} className="rounded-xl bg-white/[0.03] p-3 text-sm">
                <p className="whitespace-pre-wrap">{n.body}</p>
                <p className="mt-1 text-[11.5px] text-mist-500">{formatDateTime(n.created_at, tz)}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader title="Properties" />
          <CardBody className="space-y-2 text-sm">
            {(properties ?? []).map((p) => (
              <p key={p.id}>
                {p.address_line1}, {p.city} <span className="text-mist-500">{p.square_feet ? `· ${p.square_feet.toLocaleString()} sq ft` : ""}</span>
              </p>
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Invoices" />
          <CardBody className="space-y-2 text-sm">
            {(invoices ?? []).map((i) => (
              <Link key={i.id} href={`/admin/invoices/${i.id}`} className="flex items-center justify-between hover:text-accent-100">
                <span>{i.invoice_number}</span>
                <span className="flex items-center gap-2">
                  <InvoiceBadge status={i.status} /> {formatMoney(i.amount_due_cents, "usd", { exact: true })} due
                </span>
              </Link>
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Referrals" />
          <CardBody className="space-y-2 text-sm">
            {(referrals ?? []).length === 0 && <p className="text-mist-500">None yet.</p>}
            {(referrals ?? []).map((r) => (
              <p key={r.id} className="flex justify-between">
                <span>{r.referred_email}</span>
                <span className="text-mist-400">{r.status}</span>
              </p>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
