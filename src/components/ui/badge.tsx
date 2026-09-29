import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BOOKING_STATUS_META, INVOICE_STATUS_META, LEAD_STATUS_META, PAYMENT_STATUS_META, type Tone } from "@/lib/status";
import type { BookingStatus, PaymentStatus } from "@/lib/types";

const tones: Record<Tone, string> = {
  neutral: "border-white/10 bg-white/[0.06] text-mist-300",
  gold: "border-gold-300/25 bg-gold-300/10 text-gold-200",
  green: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  amber: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  red: "border-red-400/25 bg-red-400/10 text-red-200",
  blue: "border-sky-400/25 bg-sky-400/10 text-sky-200",
  violet: "border-violet-400/25 bg-violet-400/10 text-violet-200",
};

const dots: Record<Tone, string> = {
  neutral: "bg-mist-400",
  gold: "bg-gold-300",
  green: "bg-emerald-400",
  amber: "bg-amber-400",
  red: "bg-red-400",
  blue: "bg-sky-400",
  violet: "bg-violet-400",
};

export function Badge({ tone = "neutral", dot, className, children }: { tone?: Tone; dot?: boolean; className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-[11.5px] font-medium tracking-wide whitespace-nowrap", tones[tone], className)}>
      {dot && <span className={cn("size-1.5 rounded-full", dots[tone])} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  const meta = BOOKING_STATUS_META[status] ?? BOOKING_STATUS_META.requested;
  return (
    <Badge tone={meta.tone} dot className={className}>
      {meta.label}
    </Badge>
  );
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const meta = PAYMENT_STATUS_META[status] ?? PAYMENT_STATUS_META.unpaid;
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export function InvoiceBadge({ status }: { status: string }) {
  const meta = INVOICE_STATUS_META[status] ?? INVOICE_STATUS_META.open;
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export function LeadBadge({ status }: { status: string }) {
  const meta = LEAD_STATUS_META[status] ?? LEAD_STATUS_META.new;
  return <Badge tone={meta.tone} dot>{meta.label}</Badge>;
}
