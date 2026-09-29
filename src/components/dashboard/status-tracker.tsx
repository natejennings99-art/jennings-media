import { Check, X } from "lucide-react";
import type { BookingStatus } from "@/lib/types";
import { BOOKING_STATUS_META, PROGRESS_STEPS, progressIndex } from "@/lib/status";
import { cn } from "@/lib/utils";

/** Visual order progress for customers (Requested → Delivered). */
export function StatusTracker({ status, compact = false }: { status: BookingStatus; compact?: boolean }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200">
        <X className="size-4" /> This order was cancelled.
      </div>
    );
  }
  const current = progressIndex(status);
  if (compact) {
    return (
      <div className="flex items-center gap-1" aria-label={`Progress: ${BOOKING_STATUS_META[status].label}`}>
        {PROGRESS_STEPS.map((s, i) => (
          <span key={s} className={cn("h-1 flex-1 rounded-full transition-colors", i <= current ? "bg-gold-300" : "bg-white/10")} />
        ))}
      </div>
    );
  }
  return (
    <ol className="grid gap-4 sm:grid-cols-7 sm:gap-2">
      {PROGRESS_STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="relative flex items-center gap-3 sm:flex-col sm:items-start sm:gap-3">
            {i < PROGRESS_STEPS.length - 1 && (
              <span className={cn("absolute top-3.5 left-7 hidden h-px w-[calc(100%-1.25rem)] sm:block", done ? "bg-gold-300/70" : "bg-white/10")} />
            )}
            <span
              className={cn(
                "relative z-10 grid size-7 shrink-0 place-items-center rounded-full border text-[11px] transition-all",
                done && "border-gold-300 bg-gold-300 text-ink-950",
                active && "border-gold-300 bg-ink-950 text-gold-200 shadow-[0_0_24px_rgb(230_201_152/0.45)]",
                !done && !active && "border-white/15 bg-ink-950 text-mist-600"
              )}
            >
              {done ? <Check className="size-3.5" strokeWidth={3} /> : active ? <span className="size-2 animate-pulse rounded-full bg-gold-300" /> : i + 1}
            </span>
            <span className={cn("text-[12.5px] leading-tight", active ? "font-medium text-bone-50" : done ? "text-mist-300" : "text-mist-600")}>
              {BOOKING_STATUS_META[s].label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
