import type { BusinessSettings, Customer, Invoice, Property } from "@/lib/types";
import { InvoiceBadge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/misc";
import { formatCalendarDate, formatDate, formatMoney, fullAddress } from "@/lib/utils";

/** Printable invoice (dark on screen, clean black-on-white when printed). */
export function InvoiceView({
  invoice,
  settings,
}: {
  invoice: Invoice & { customer: Customer; booking: { order_number: string; property: Property } | null };
  settings: BusinessSettings;
}) {
  const c = invoice.currency;
  return (
    <article className="surface rounded-3xl p-6 print:border-0 print:bg-white print:p-0 print:text-black sm:p-10">
      <div className="flex flex-col justify-between gap-6 sm:flex-row">
        <div>
          <Logo />
          <p className="mt-4 text-sm text-mist-400 print:text-gray-600">
            {settings.legal_name || settings.business_name}
            {settings.email && <><br />{settings.email}</>}
            {settings.phone && <><br />{settings.phone}</>}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-3xl font-medium tracking-[-0.03em]">Invoice</p>
          <p className="mt-1 font-mono text-sm text-mist-400">{invoice.invoice_number}</p>
          <div className="mt-2">
            <InvoiceBadge status={invoice.status} />
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 text-sm sm:grid-cols-3">
        <div>
          <p className="text-[12px] tracking-wide text-mist-500 uppercase">Billed to</p>
          <p className="mt-1.5">
            {invoice.customer.first_name} {invoice.customer.last_name}
            {invoice.customer.company && <><br />{invoice.customer.company}</>}
            <br />
            {invoice.customer.email}
          </p>
        </div>
        {invoice.booking && (
          <div>
            <p className="text-[12px] tracking-wide text-mist-500 uppercase">Property</p>
            <p className="mt-1.5">
              {fullAddress(invoice.booking.property)}
              <br />
              Order {invoice.booking.order_number}
            </p>
          </div>
        )}
        <div>
          <p className="text-[12px] tracking-wide text-mist-500 uppercase">Dates</p>
          <p className="mt-1.5">
            Issued {formatDate(invoice.issued_at, settings.timezone)}
            {invoice.due_date && <><br />Due {formatCalendarDate(invoice.due_date)}</>}
            {invoice.paid_at && <><br />Paid {formatDate(invoice.paid_at, settings.timezone)}</>}
          </p>
        </div>
      </div>

      <table className="mt-10 w-full text-sm">
        <thead className="border-b border-white/10 text-left text-[12px] tracking-wide text-mist-500 uppercase print:border-gray-300">
          <tr>
            <th className="py-3 font-normal">Item</th>
            <th className="py-3 text-right font-normal">Qty</th>
            <th className="py-3 text-right font-normal">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06] print:divide-gray-200">
          {invoice.line_items.map((l, i) => (
            <tr key={i}>
              <td className={l.included ? "py-3 pl-4 text-mist-400" : "py-3"}>
                {l.name}
                {l.description && !l.included && <span className="block text-[12px] text-mist-500">{l.description}</span>}
              </td>
              <td className="py-3 text-right tabular-nums">{l.quantity}</td>
              <td className="py-3 text-right tabular-nums">{l.included ? "Included" : formatMoney(l.total_cents, c, { exact: true })}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="mt-6 ml-auto max-w-xs space-y-2 text-sm">
        <div className="flex justify-between"><dt className="text-mist-400">Subtotal</dt><dd>{formatMoney(invoice.subtotal_cents, c, { exact: true })}</dd></div>
        {invoice.discount_cents > 0 && <div className="flex justify-between"><dt className="text-mist-400">Discount</dt><dd>−{formatMoney(invoice.discount_cents, c, { exact: true })}</dd></div>}
        {invoice.travel_fee_cents > 0 && <div className="flex justify-between"><dt className="text-mist-400">Travel fee</dt><dd>{formatMoney(invoice.travel_fee_cents, c, { exact: true })}</dd></div>}
        {invoice.tax_cents > 0 && <div className="flex justify-between"><dt className="text-mist-400">{settings.tax_label}</dt><dd>{formatMoney(invoice.tax_cents, c, { exact: true })}</dd></div>}
        <div className="flex justify-between border-t border-white/10 pt-2 text-base font-medium print:border-gray-300"><dt>Total</dt><dd>{formatMoney(invoice.total_cents, c, { exact: true })}</dd></div>
        <div className="flex justify-between"><dt className="text-mist-400">Paid</dt><dd>{formatMoney(invoice.amount_paid_cents, c, { exact: true })}</dd></div>
        <div className="flex justify-between text-lg font-medium text-accent-200 print:text-black"><dt>Amount due</dt><dd>{formatMoney(invoice.amount_due_cents, c, { exact: true })}</dd></div>
      </dl>
      {invoice.notes && <p className="mt-8 text-sm text-mist-400">{invoice.notes}</p>}
    </article>
  );
}
