"use client";

import type { ReactNode } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function StepHeader({ eyebrow, title, description }: { eyebrow: string; title: ReactNode; description?: ReactNode }) {
  return (
    <div className="mb-8">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-3 text-3xl font-medium tracking-[-0.04em] text-bone-50 sm:text-[2.6rem] sm:leading-[1.05]">{title}</h1>
      {description && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-mist-400">{description}</p>}
    </div>
  );
}

export function ChoiceCard({
  selected,
  onClick,
  children,
  footer,
  className,
  disabled,
  ariaLabel,
}: {
  selected: boolean;
  onClick?: () => void;
  children: ReactNode;
  /** Rendered outside the clickable area (e.g. quantity controls). */
  footer?: ReactNode;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border transition-all duration-300 ease-(--ease-expo)",
        selected
          ? "border-gold-300/70 bg-gold-300/[0.08] shadow-[0_0_0_4px_rgb(230_201_152/0.08)]"
          : "border-white/10 bg-white/[0.025] hover:border-white/25 hover:bg-white/[0.045]"
      )}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={selected}
        aria-label={ariaLabel}
        className={cn("block w-full rounded-2xl p-4 text-left disabled:cursor-default", className)}
      >
        <span
          className={cn(
            "absolute top-3.5 right-3.5 grid size-5 place-items-center rounded-full border transition-all duration-300",
            selected ? "scale-100 border-gold-300 bg-gold-300 text-ink-950" : "scale-90 border-white/20 text-transparent"
          )}
          aria-hidden
        >
          <Check className="size-3" strokeWidth={3} />
        </span>
        {children}
      </button>
      {footer && <div className="flex items-center justify-end px-5 pb-4">{footer}</div>}
    </div>
  );
}

export function Stepper({ value, min = 1, max = 20, onChange, label }: { value: number; min?: number; max?: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="inline-flex items-center rounded-full border border-white/10 bg-ink-900" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="grid size-9 place-items-center rounded-full text-mist-300 hover:text-bone-50 disabled:opacity-30" disabled={value <= min} aria-label={`Decrease ${label}`}>
        <Minus className="size-3.5" />
      </button>
      <span className="w-7 text-center text-sm tabular-nums">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className="grid size-9 place-items-center rounded-full text-mist-300 hover:text-bone-50 disabled:opacity-30" disabled={value >= max} aria-label={`Increase ${label}`}>
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

export function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-11 rounded-full border px-4 text-sm transition-all duration-200",
        active ? "border-bone-50 bg-bone-50 text-ink-950" : "border-white/10 text-mist-300 hover:border-white/25 hover:text-bone-50"
      )}
    >
      {children}
    </button>
  );
}
