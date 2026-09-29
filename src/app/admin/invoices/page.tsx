import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { PageTitle } from "@/components/dashboard/shell";
import { InvoiceBadge } from "@/components/ui/badge";
import { cn, formatCalendarDate, formatDate, formatMoney } from "@/lib/utils";

export const metadata = { title: "Invoices" };

export default async function AdminInvoicesPage({ searchParams }: PageProps<"/admin/invoices">) {
  const { status } = (await searchParams) as { status?: string };
  const { supabase } = await requireAdmin();
  let query = supabase.from("invoices").select("id, invoice_number, status, total_cents, amount_due_cents, due_date, issued_at, customer:customers(first_name, last_name), booking:bookings(order_number)").order("issued_at", { ascending: false }).limit(300);
  if (status && ["open", "paid", "void", "draft"].includes(status)) query = query.eq("status", status);
  const { data } = await query;
  const rows = (data ?? []) as unknown as { id: string; invoice_number: string; status: string; total_cents: number; amount_due_cents: number; due_date: string | null; issued_at: string; customer: { first_name: string; last_name: string }; booking: { order_number: string } | null }[];
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div>
      <PageTitle title="Invoices" />
      <div className="mb-5 flex gap-1.5">
        {["", "open", "paid", "void"].map((s) => (
          <Link key={s} href={`/admin/invoices${s ? `?status=${s}` : ""}`} className={cn("h-8 rounded-full px-3.5 text-[12.5px] leading-8", (status ?? "") === s ? "bg-bone-50 text-ink-950" : "border border-white/10 text-mist-400")}>
            {s ? s[0].toUpperCase() + s.slice(1) : "All"}
          </Link>
        ))}
      </div>
      <div className="surface overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-white/[0.07] text-left text-[11.5px] tracking-wide text-mist-500 uppercase">
            <tr>
              <th className="px-4 py-3 font-normal">Invoice</th>
              <th className="px-4 py-3 font-normal">Customer</th>
              <th className="px-4 py-3 font-normal">Issued</th>
              <th className="px-4 py-3 font-normal">Due</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 text-right font-normal">Total</th>
              <th className="px-4 py-3 text-right font-normal">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {rows.map((i) => (
              <tr key={i.id} className="hover:bg-white/[0.025]">
                <td className="px-4 py-3">
                  <Link href={`/admin/invoices/${i.id}`} className="font-mono text-[12.5px] text-accent-200 hover:underline">{i.invoice_number}</Link>
                  <p className="text-[11.5px] text-mist-600">{i.booking?.order_number}</p>
                </td>
                <td className="px-4 py-3">{i.customer.first_name} {i.customer.last_name}</td>
                <td className="px-4 py-3 text-mist-400">{formatDate(i.issued_at)}</td>
                <td className={cn("px-4 py-3", i.status === "open" && i.due_date && i.due_date < today && i.amount_due_cents > 0 ? "text-red-300" : "text-mist-400")}>{i.due_date ? formatCalendarDate(i.due_date, { month: "short", day: "numeric" }) : "—"}</td>
                <td className="px-4 py-3"><InvoiceBadge status={i.status} /></td>
                <td className="px-4 py-3 text-right tabular-nums">{formatMoney(i.total_cents, "usd", { exact: true })}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatMoney(i.amount_due_cents, "usd", { exact: true })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
