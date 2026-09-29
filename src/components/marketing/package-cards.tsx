"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import type { Package } from "@/lib/types";
import { packagePrice, sortTiers } from "@/lib/pricing/engine";
import { buttonStyles } from "@/components/ui/button";
import { cn, formatMoney } from "@/lib/utils";

const SIZE_STOPS = [1500, 2000, 2500, 3000, 3500, 4000, 5000, 6500];

export function PackageCards({ packages, interactive = false }: { packages: Package[]; interactive?: boolean }) {
  const [stop, setStop] = useState(2);
  const sqft = interactive ? SIZE_STOPS[stop] : null;

  return (
    <div>
      {interactive && (
        <div className="surface mx-auto mb-10 max-w-xl rounded-3xl p-5 sm:p-6">
          <div className="flex items-baseline justify-between">
            <label htmlFor="sqft" className="text-sm text-mist-300">
              Home size
            </label>
            <p className="text-2xl font-medium tracking-[-0.03em] tabular-nums text-bone-50">
              {stop === SIZE_STOPS.length - 1 ? "5,000+" : SIZE_STOPS[stop].toLocaleString()} <span className="text-sm text-mist-400">sq ft</span>
            </p>
          </div>
          <input
            id="sqft"
            type="range"
            min={0}
            max={SIZE_STOPS.length - 1}
            value={stop}
            onChange={(e) => setStop(Number(e.target.value))}
            className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-300"
          />
          <p className="mt-3 text-[13px] text-mist-500">Prices update live. Travel fees depend on location and are shown at checkout.</p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {packages.map((pkg) => {
          const price = sqft === null ? Math.min(...(pkg.price_tiers.length ? sortTiers(pkg.price_tiers).map((t) => t.price_cents) : [pkg.base_price_cents])) : packagePrice(pkg, sqft);
          return (
            <div
              key={pkg.id}
              className={cn(
                "relative flex flex-col rounded-[30px] p-7 sm:p-8",
                pkg.is_featured ? "shine-border bg-gradient-to-b from-accent-300/[0.11] to-white/[0.02] lg:-my-4 lg:py-12" : "surface"
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-medium tracking-[-0.035em] text-bone-50">{pkg.name}</h3>
                {pkg.badge && (
                  <span className={cn("rounded-full px-3 py-1 text-[11.5px] font-medium", pkg.is_featured ? "bg-accent-300 text-ink-950" : "border border-white/15 text-mist-300")}>
                    {pkg.badge}
                  </span>
                )}
              </div>
              <p className="mt-2 min-h-[3rem] text-[14.5px] leading-relaxed text-mist-400">{pkg.tagline}</p>
              <div className="mt-6 flex items-end gap-2">
                <span className="text-[13px] text-mist-500">{sqft === null ? "From" : ""}</span>
                <span key={price} className="animate-fade-in text-5xl font-medium tracking-[-0.05em] tabular-nums text-bone-50">
                  {formatMoney(price)}
                </span>
              </div>
              {pkg.turnaround_text && <p className="mt-2 text-[13px] text-accent-200/90">{pkg.turnaround_text}</p>}
              <ul className="mt-7 flex-1 space-y-3 border-t border-white/[0.07] pt-7">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[14.5px] text-bone-100">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent-300/15 text-accent-200">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/book?package=${pkg.slug}`}
                className={buttonStyles({ variant: pkg.is_featured ? "primary" : "outline", size: "lg", className: "mt-8 w-full" })}
              >
                Book {pkg.name}
                <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
