import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { getSettings } from "@/lib/data/public";
import { InvoiceView } from "@/components/dashboard/invoice-view";
import { PrintButton } from "@/components/dashboard/print-button";
import { InvoiceActions } from "@/components/admin/invoice-actions";
import type { Customer, Invoice, Property } from "@/lib/types";

export const metadata = { title: "Invoice" };

export default async function AdminInvoicePage({ params }: PageProps<"/admin/invoices/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("invoices").select("*, customer:customers(*), booking:bookings(order_number, property:properties(*))").eq("id", id).maybeSingle();
  if (!data) notFound();
  const invoice = data as Invoice & { customer: Customer; booking: { order_number: string; property: Property } | null };
  const settings = await getSettings();
  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/invoices" className="inline-flex items-center gap-2 text-sm text-mist-400 hover:text-bone-50">
          <ArrowLeft className="size-4" /> Invoices
        </Link>
        <div className="flex flex-wrap gap-2">
          {invoice.booking_id && <Link href={`/admin/bookings/${invoice.booking_id}`} className="h-9 rounded-full border border-white/15 px-4 text-[13px] leading-9">Open booking</Link>}
          <PrintButton />
          <InvoiceActions invoiceId={invoice.id} bookingId={invoice.booking_id} status={invoice.status} due={invoice.amount_due_cents} />
        </div>
      </div>
      <InvoiceView invoice={invoice} settings={settings} />
    </div>
  );
}
