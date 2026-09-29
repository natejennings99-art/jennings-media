import Link from "next/link";
import { Receipt } from "lucide-react";
import { requireCustomer } from "@/lib/auth/session";
import { PageTitle } from "@/components/dashboard/shell";
import { EmptyState } from "@/components/ui/misc";
import { InvoiceBadge } from "@/components/ui/badge";
import { formatCalendarDate, formatDate, formatMoney } from "@/lib/utils";
import type { Invoice } from "@/lib/types";

export const metadata = { title: "Invoices" };

export default async function InvoicesPage() {
  const { supabase } = await requireCustomer("/dashboard/invoices");
  const { data } = await supabase.from("invoices").select("*, booking:bookings(order_number, property:properties(address_line1))").order("issued_at", { ascending: false });
  const invoices = (data ?? []) as (Invoice & { booking: { order_number: string; property: { address_line1: string } } | null })[];
  return (
    <div>
      <PageTitle title="Invoices" description="Open balances and paid invoices." />
      {invoices.length ? (
        <div className="surface overflow-hidden rounded-3xl">
          <table className="w-full text-sm">
            <thead className="border-b border-white/[0.07] text-left text-[12px] tracking-wide text-mist-500 uppercase">
              <tr>
                <th className="px-5 py-3.5 font-normal">Invoice</th>
                <th className="hidden px-5 py-3.5 font-normal sm:table-cell">Property</th>
                <th className="hidden px-5 py-3.5 font-normal md:table-cell">Issued</th>
                <th className="px-5 py-3.5 font-normal">Status</th>
                <th className="px-5 py-3.5 text-right font-normal">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {invoices.map((i) => (
                <tr key={i.id} className="transition hover:bg-white/[0.02]">
                  <td className="px-5 py-4">
                    <Link href={`/dashboard/invoices/${i.id}`} className="font-medium text-bone-50 hover:text-gold-100">
                      {i.invoice_number}
                    </Link>
                    <p className="text-[12px] text-mist-500">{formatMoney(i.total_cents, i.currency, { exact: true })}</p>
                  </td>
                  <td className="hidden px-5 py-4 text-mist-300 sm:table-cell">{i.booking?.property.address_line1}</td>
                  <td className="hidden px-5 py-4 text-mist-400 md:table-cell">{formatDate(i.issued_at)}</td>
                  <td className="px-5 py-4">
                    <InvoiceBadge status={i.status} />
                  </td>
                  <td className="px-5 py-4 text-right tabular-nums">
                    {formatMoney(i.amount_due_cents, i.currency, { exact: true })}
                    {i.due_date && i.amount_due_cents > 0 && <p className="text-[12px] text-mist-500">by {formatCalendarDate(i.due_date, { month: "short", day: "numeric" })}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={<Receipt className="size-5" />} title="No invoices yet" />
      )}
    </div>
  );
}
