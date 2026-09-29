"use client";

import { CalendarDays, MapPin, Tag } from "lucide-react";
import type { Quote } from "@/lib/pricing/engine";
import { cn, formatMoney } from "@/lib/utils";
import type { DraftProperty, DraftSlot, ServerQuoteResponse } from "./types";

export function OrderSummary({
  quote,
  server,
  property,
  slot,
  timezone,
  className,
  compact,
}: {
  quote: Quote;
  server: ServerQuoteResponse | null;
  property: DraftProperty;
  slot: DraftSlot | null;
  timezone: string;
  className?: string;
  compact?: boolean;
}) {
  const totals = server?.quote ?? null;
  const paidLines = quote.lines.filter((l) => !l.includedInPackage);
  const included = quote.lines.filter((l) => l.includedInPackage);
  const discountCents = totals?.discountCents ?? quote.discountCents;
  const total = totals?.totalCents ?? quote.totalCents;

  return (
    <div className={cn("surface rounded-3xl p-5 sm:p-6", className)}>
      {!compact && <p className="eyebrow mb-4">Your order</p>}
      {(property.address_line1 || slot) && (
        <div className="mb-5 space-y-2 border-b border-white/[0.07] pb-5 text-[13.5px]">
          {property.address_line1 && (
            <p className="flex gap-2.5 text-mist-300">
              <MapPin className="mt-0.5 size-4 shrink-0 text-mist-500" />
              <span>
                {property.address_line1}
                {property.city && `, ${property.city}`}
                {property.square_feet && <span className="text-mist-500"> · {Number(property.square_feet).toLocaleString()} sq ft</span>}
              </span>
            </p>
          )}
          {slot && (
            <p className="flex gap-2.5 text-mist-300">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-mist-500" />
              {new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: timezone }).format(new Date(slot.start))}
            </p>
          )}
        </div>
      )}

      {quote.isEmpty ? (
        <p className="text-sm text-mist-500">Select services to see your price.</p>
      ) : (
        <ul className="space-y-3 text-[14px]">
          {paidLines.map((l) => (
            <li key={l.key} className="flex justify-between gap-4">
              <span className="text-bone-100">
                {l.name}
                {l.description && l.type !== "package" && <span className="block text-[12px] text-mist-500">{l.description}</span>}
                {l.type === "package" && included.length > 0 && <span className="block text-[12px] text-mist-500">{included.map((i) => i.name).join(" · ")}</span>}
              </span>
              <span className="tabular-nums text-bone-50">{formatMoney(l.totalCents, "usd", { exact: l.totalCents % 100 !== 0 })}</span>
            </li>
          ))}
        </ul>
      )}

      {!quote.isEmpty && (
        <dl className="mt-5 space-y-2 border-t border-white/[0.07] pt-5 text-[13.5px]">
          <div className="flex justify-between text-mist-400">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{formatMoney(totals?.subtotalCents ?? quote.subtotalCents, "usd", { exact: true })}</dd>
          </div>
          {discountCents > 0 && (
            <div className="flex justify-between text-emerald-300">
              <dt className="flex items-center gap-1.5">
                <Tag className="size-3.5" /> {totals?.discountLabel ?? quote.discountLabel ?? "Discount"}
              </dt>
              <dd className="tabular-nums">−{formatMoney(discountCents, "usd", { exact: true })}</dd>
            </div>
          )}
          <div className="flex justify-between text-mist-400">
            <dt>Travel fee</dt>
            <dd className="tabular-nums">{server ? (server.travel.feeCents ? formatMoney(server.travel.feeCents, "usd", { exact: true }) : "Free") : "At checkout"}</dd>
          </div>
          {(totals?.taxCents ?? 0) > 0 && (
            <div className="flex justify-between text-mist-400">
              <dt>{server?.taxLabel ?? "Tax"}</dt>
              <dd className="tabular-nums">{formatMoney(totals!.taxCents, "usd", { exact: true })}</dd>
            </div>
          )}
          <div className="flex items-baseline justify-between pt-2 text-bone-50">
            <dt className="font-medium">Total</dt>
            <dd className="text-2xl font-medium tracking-[-0.03em] tabular-nums">{formatMoney(total, "usd", { exact: true })}</dd>
          </div>
          {server?.travel.outsideArea && <p className="pt-1 text-[12px] text-amber-200/90">{server.travel.message}</p>}
        </dl>
      )}
    </div>
  );
}
