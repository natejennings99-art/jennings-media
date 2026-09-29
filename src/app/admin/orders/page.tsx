import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { getSettings } from "@/lib/data/public";
import { PageTitle } from "@/components/dashboard/shell";
import { PaymentBadge, StatusBadge } from "@/components/ui/badge";
import { Stat } from "@/components/ui/misc";
import { formatDate, formatMoney } from "@/lib/utils";
import type { BookingStatus, PaymentStatus } from "@/lib/types";

export const metadata = { title: "Orders" };

export default async function OrdersPage() {
  const { supabase } = await requireAdmin();
  const settings = await getSettings();
  const { data } = await supabase.from("bookings").select("id, order_number, status, payment_status, payment_option, subtotal_cents, discount_cents, travel_fee_cents, tax_cents, total_cents, amount_paid_cents, created_at, customer:customers(first_name, last_name)").order("created_at", { ascending: false }).limit(300);
  const rows = (data ?? []) as unknown as { id: string; order_number: string; status: BookingStatus; payment_status: PaymentStatus; payment_option: string; subtotal_cents: number; discount_cents: number; travel_fee_cents: number; tax_cents: number; total_cents: number; amount_paid_cents: number; created_at: string; customer: { first_name: string; last_name: string } }[];
  const active = rows.filter((r) => r.status !== "cancelled");
  const booked = active.reduce((s, r) => s + r.total_cents, 0);
  const collected = rows.reduce((s, r) => s + r.amount_paid_cents, 0);
  return (
    <div className="space-y-6">
      <PageTitle title="Orders" description="Financial view of every booking." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Booked value" value={formatMoney(booked)} sub={`${active.length} orders`} />
        <Stat label="Collected" value={formatMoney(collected)} />
        <Stat label="Outstanding" value={formatMoney(Math.max(0, booked - active.reduce((s, r) => s + r.amount_paid_cents, 0)))} />
      </div>
      <div className="surface overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[880px] text-sm">
          <thead className="border-b border-white/[0.07] text-left text-[11.5px] tracking-wide text-mist-500 uppercase">
            <tr>
              <th className="px-4 py-3 font-normal">Order</th>
              <th className="px-4 py-3 font-normal">Customer</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 text-right font-normal">Subtotal</th>
              <th className="px-4 py-3 text-right font-normal">Disc.</th>
              <th className="px-4 py-3 text-right font-normal">Travel</th>
              <th className="px-4 py-3 text-right font-normal">Total</th>
              <th className="px-4 py-3 text-right font-normal">Paid</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-white/[0.025]">
                <td className="px-4 py-3">
                  <Link href={`/admin/bookings/${r.id}`} className="font-mono text-[12.5px] text-gold-200 hover:underline">{r.order_number}</Link>
                  <p className="text-[11.5px] text-mist-600">{formatDate(r.created_at, settings.timezone)} · {r.payment_option}</p>
                </td>
                <td className="px-4 py-3">{r.customer.first_name} {r.customer.last_name}</td>
                <td className="px-4 py-3"><div className="flex flex-col items-start gap-1"><StatusBadge status={r.status} /><PaymentBadge status={r.payment_status} /></div></td>
                <td className="px-4 py-3 text-right tabular-nums">{formatMoney(r.subtotal_cents)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-mist-400">{r.discount_cents ? `−${formatMoney(r.discount_cents)}` : "—"}</td>
                <td className="px-4 py-3 text-right tabular-nums text-mist-400">{r.travel_fee_cents ? formatMoney(r.travel_fee_cents) : "—"}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatMoney(r.total_cents, "usd", { exact: true })}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatMoney(r.amount_paid_cents, "usd", { exact: true })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
