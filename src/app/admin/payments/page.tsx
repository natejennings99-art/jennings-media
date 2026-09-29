import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { getSettings } from "@/lib/data/public";
import { PageTitle } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/ui/misc";
import { formatDateTime, formatMoney, titleCase } from "@/lib/utils";

export const metadata = { title: "Payments" };

export default async function AdminPaymentsPage() {
  const { supabase } = await requireAdmin();
  const settings = await getSettings();
  const { data } = await supabase.from("payments").select("*, booking:bookings(id, order_number), customer:customers(first_name, last_name)").neq("status", "pending").order("created_at", { ascending: false }).limit(300);
  const rows = (data ?? []) as unknown as { id: string; amount_cents: number; refunded_cents: number; status: string; provider: string; method: string; kind: string; paid_at: string | null; created_at: string; receipt_url: string | null; booking: { id: string; order_number: string } | null; customer: { first_name: string; last_name: string } | null }[];
  const ok = rows.filter((r) => ["succeeded", "partially_refunded", "refunded"].includes(r.status));
  return (
    <div className="space-y-6">
      <PageTitle title="Payments" description="Card payments, manual payments and refunds. Refund from the booking page." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Collected" value={formatMoney(ok.reduce((s, r) => s + r.amount_cents, 0))} />
        <Stat label="Refunded" value={formatMoney(ok.reduce((s, r) => s + r.refunded_cents, 0))} />
        <Stat label="Net" value={formatMoney(ok.reduce((s, r) => s + r.amount_cents - r.refunded_cents, 0))} />
      </div>
      <div className="surface overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-white/[0.07] text-left text-[11.5px] tracking-wide text-mist-500 uppercase">
            <tr>
              <th className="px-4 py-3 font-normal">Date</th>
              <th className="px-4 py-3 font-normal">Order</th>
              <th className="px-4 py-3 font-normal">Customer</th>
              <th className="px-4 py-3 font-normal">Method</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 text-right font-normal">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {rows.map((p) => (
              <tr key={p.id} className="hover:bg-white/[0.025]">
                <td className="px-4 py-3 text-mist-400">{formatDateTime(p.paid_at ?? p.created_at, settings.timezone)}</td>
                <td className="px-4 py-3">{p.booking ? <Link href={`/admin/bookings/${p.booking.id}`} className="font-mono text-[12.5px] text-gold-200 hover:underline">{p.booking.order_number}</Link> : "—"}</td>
                <td className="px-4 py-3">{p.customer ? `${p.customer.first_name} ${p.customer.last_name}` : "—"}</td>
                <td className="px-4 py-3 text-mist-300">{p.provider === "stripe" ? "Stripe card" : titleCase(p.method)} · {p.kind}</td>
                <td className="px-4 py-3"><Badge tone={p.status === "succeeded" ? "green" : p.status.includes("refund") ? "violet" : p.status === "failed" ? "red" : "neutral"}>{titleCase(p.status)}</Badge></td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatMoney(p.amount_cents, "usd", { exact: true })}
                  {p.refunded_cents > 0 && <p className="text-[11.5px] text-violet-300">−{formatMoney(p.refunded_cents, "usd", { exact: true })}</p>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
