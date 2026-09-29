import { Wallet } from "lucide-react";
import { requireCustomer } from "@/lib/auth/session";
import { PageTitle } from "@/components/dashboard/shell";
import { EmptyState } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatMoney, titleCase } from "@/lib/utils";
import type { Payment } from "@/lib/types";

export const metadata = { title: "Payments" };

export default async function PaymentsPage() {
  const { supabase } = await requireCustomer("/dashboard/payments");
  const { data } = await supabase.from("payments").select("*, booking:bookings(order_number)").neq("status", "pending").order("created_at", { ascending: false });
  const payments = (data ?? []) as (Payment & { booking: { order_number: string } | null })[];
  return (
    <div>
      <PageTitle title="Payments" description="Receipts for every payment and refund." />
      {payments.length ? (
        <div className="surface divide-y divide-white/[0.05] overflow-hidden rounded-3xl">
          {payments.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm">
              <div>
                <p className="font-medium">
                  {titleCase(p.kind)} payment · {p.booking?.order_number}
                </p>
                <p className="text-[12.5px] text-mist-500">
                  {formatDate(p.paid_at ?? p.created_at)} · {p.provider === "stripe" ? "Card" : titleCase(p.method)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={p.status === "succeeded" ? "green" : p.status.includes("refund") ? "violet" : "neutral"}>{titleCase(p.status)}</Badge>
                <span className="w-24 text-right font-medium tabular-nums">{formatMoney(p.amount_cents - p.refunded_cents, p.currency, { exact: true })}</span>
                {p.receipt_url && (
                  <a href={p.receipt_url} target="_blank" rel="noreferrer" className="text-[13px] text-accent-200 hover:underline">
                    Receipt
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={<Wallet className="size-5" />} title="No payments yet" />
      )}
    </div>
  );
}
