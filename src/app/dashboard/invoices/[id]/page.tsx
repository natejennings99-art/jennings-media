import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireCustomer } from "@/lib/auth/session";
import { getSettings } from "@/lib/data/public";
import { InvoiceView } from "@/components/dashboard/invoice-view";
import { PrintButton } from "@/components/dashboard/print-button";
import { buttonStyles } from "@/components/ui/button";
import { features } from "@/lib/env";
import { formatMoney } from "@/lib/utils";
import { payInvoice } from "@/app/dashboard/actions";
import type { Customer, Invoice, Property } from "@/lib/types";

export default async function InvoicePage({ params, searchParams }: PageProps<"/dashboard/invoices/[id]">) {
  const { id } = await params;
  const { paid } = (await searchParams) as { paid?: string };
  const { supabase } = await requireCustomer(`/dashboard/invoices/${id}`);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { data } = await supabase.from("invoices").select("*, customer:customers(*), booking:bookings(order_number, property:properties(*))").eq("id", id).maybeSingle();
  if (!data) notFound();
  const invoice = data as Invoice & { customer: Customer; booking: { order_number: string; property: Property } | null };
  const settings = await getSettings();
  return (
    <div className="space-y-6">
      <div className="no-print flex items-center justify-between">
        <Link href="/dashboard/invoices" className="inline-flex items-center gap-2 text-sm text-mist-400 hover:text-bone-50">
          <ArrowLeft className="size-4" /> Invoices
        </Link>
        <div className="flex gap-2">
          <PrintButton />
          {invoice.status === "open" && invoice.amount_due_cents > 0 && features.stripe && invoice.booking_id && (
            <form action={payInvoice.bind(null, invoice.id)}>
              <button type="submit" className={buttonStyles({ size: "sm" })}>
                Pay {formatMoney(invoice.amount_due_cents, invoice.currency, { exact: true })}
              </button>
            </form>
          )}
        </div>
      </div>
      {paid && <p className="no-print rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">Thank you — your payment is processing. This page updates within a minute.</p>}
      <InvoiceView invoice={invoice} settings={settings} />
    </div>
  );
}
