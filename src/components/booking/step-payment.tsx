"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { CreditCard, Lock, Receipt, Wallet } from "lucide-react";
import type { PaymentOption, PaymentSettings } from "@/lib/types";
import { cn, formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox, Input } from "@/components/ui/field";
import { checkPromoCode } from "@/app/book/actions";
import type { DiscountSpec } from "@/lib/pricing/engine";
import { StepHeader } from "./primitives";
import type { ServerQuoteResponse } from "./types";

const META: Record<PaymentOption, { title: string; icon: typeof CreditCard }> = {
  full: { title: "Pay in full", icon: CreditCard },
  deposit: { title: "Pay a deposit", icon: Wallet },
  later: { title: "Pay after the shoot", icon: Receipt },
};

export function StepPayment({
  options,
  option,
  onOption,
  server,
  loadingQuote,
  payment,
  promoCode,
  onPromoCode,
  discount,
  onDiscount,
  email,
  acceptTerms,
  onAcceptTerms,
  errors,
}: {
  options: PaymentOption[];
  option: PaymentOption;
  onOption: (o: PaymentOption) => void;
  server: ServerQuoteResponse | null;
  loadingQuote: boolean;
  payment: PaymentSettings;
  promoCode: string;
  onPromoCode: (v: string) => void;
  discount: DiscountSpec | null;
  onDiscount: (d: DiscountSpec | null) => void;
  email: string;
  acceptTerms: boolean;
  onAcceptTerms: (v: boolean) => void;
  errors: Record<string, string>;
}) {
  const [promoError, setPromoError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const total = server?.quote.totalCents ?? 0;
  const deposit = server?.quote.depositCents ?? 0;

  const describe = (o: PaymentOption) =>
    o === "full"
      ? `Charge ${formatMoney(total, "usd", { exact: true })} today`
      : o === "deposit"
        ? `${formatMoney(deposit, "usd", { exact: true })} today${payment.deposit_type === "percent" ? ` (${payment.deposit_value}%)` : ""}, balance before delivery`
        : payment.pay_later_note;

  const apply = () => {
    setPromoError(null);
    if (!promoCode.trim()) return;
    start(async () => {
      const res = await checkPromoCode(promoCode.trim(), email || null);
      if (res.ok) {
        onDiscount({ label: res.data.label, type: res.data.type, value: res.data.value, minSubtotalCents: res.data.minSubtotalCents, maxCents: res.data.maxCents });
      } else {
        onDiscount(null);
        setPromoError(res.error);
      }
    });
  };

  return (
    <div>
      <StepHeader eyebrow="Step 7 · Payment" title="Review and book" description="Secure checkout by Stripe. Card details never touch our servers." />

      <div className="grid gap-3">
        {options.map((o) => {
          const Icon = META[o].icon;
          const active = option === o;
          return (
            <button
              key={o}
              type="button"
              onClick={() => onOption(o)}
              aria-pressed={active}
              className={cn(
                "flex items-center gap-4 rounded-2xl border p-5 text-left transition-all duration-300",
                active ? "border-gold-300/70 bg-gold-300/[0.08] shadow-[0_0_0_4px_rgb(230_201_152/0.08)]" : "border-white/10 hover:border-white/25"
              )}
            >
              <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", active ? "bg-gold-300 text-ink-950" : "bg-white/[0.06] text-mist-300")}>
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-bone-50">{META[o].title}</span>
                <span className="block text-[13px] text-mist-400">{loadingQuote && o !== "later" ? "Calculating…" : describe(o)}</span>
              </span>
              <span className={cn("size-5 shrink-0 rounded-full border-2 transition", active ? "border-gold-300 bg-gold-300 shadow-[inset_0_0_0_3px_#07080a]" : "border-white/25")} />
            </button>
          );
        })}
        {errors.paymentOption && <p className="text-sm text-red-300">{errors.paymentOption}</p>}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 p-5">
        <p className="text-sm font-medium text-bone-100">Promo or referral code</p>
        <div className="mt-3 flex gap-2">
          <Input
            value={promoCode}
            onChange={(e) => {
              onPromoCode(e.target.value.toUpperCase());
              setPromoError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), apply())}
            placeholder="SPRING25"
            className="uppercase"
            aria-invalid={Boolean(promoError || errors.promoCode)}
          />
          <Button variant="outline" onClick={apply} loading={pending} className="h-12 shrink-0">
            Apply
          </Button>
        </div>
        {(promoError || errors.promoCode) && <p className="mt-2 text-sm text-red-300">{promoError || errors.promoCode}</p>}
        {discount && !promoError && (
          <p className="mt-2 flex items-center justify-between text-sm text-emerald-300">
            <span>✓ {discount.label} applied</span>
            <button type="button" className="text-mist-400 underline-offset-4 hover:underline" onClick={() => (onDiscount(null), onPromoCode(""))}>
              Remove
            </button>
          </p>
        )}
        {server?.quote.discountNote && <p className="mt-2 text-sm text-amber-200">{server.quote.discountNote}</p>}
      </div>

      <div className="mt-6">
        <Checkbox
          checked={acceptTerms}
          onChange={(e) => onAcceptTerms(e.target.checked)}
          label={
            <>
              I agree to the{" "}
              <Link href="/terms" target="_blank" className="text-gold-200 underline-offset-4 hover:underline">
                booking terms
              </Link>{" "}
              and 24-hour reschedule policy.
            </>
          }
        />
        {errors.acceptTerms && <p className="mt-2 text-sm text-red-300">{errors.acceptTerms}</p>}
      </div>

      <p className="mt-6 flex items-center gap-2 text-[12.5px] text-mist-500">
        <Lock className="size-3.5" /> 256-bit encrypted checkout · Apple Pay & Google Pay accepted
      </p>
    </div>
  );
}
