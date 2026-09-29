"use client";

import { Check, Sparkles, TrendingDown } from "lucide-react";
import type { Catalog } from "@/lib/types";
import { packagePrice, recommendPackages } from "@/lib/pricing/engine";
import { cn, formatMoney } from "@/lib/utils";
import { StepHeader } from "./primitives";

export function StepPackage({
  catalog,
  sqft,
  serviceIds,
  quantities,
  packageId,
  onChoose,
}: {
  catalog: Catalog;
  sqft: number | null;
  serviceIds: string[];
  quantities: Record<string, number>;
  packageId: string | null;
  onChoose: (id: string | null) => void;
}) {
  const recs = recommendPackages(catalog, { serviceIds, serviceQuantities: quantities }, sqft);
  const best = recs[0];
  const names = new Map(catalog.services.map((s) => [s.id, s.name]));
  const selected = new Set(serviceIds);

  return (
    <div>
      <StepHeader eyebrow="Step 3 · Package" title="Bundle and save" description="Packages combine our most-requested services at a lower price. Keep your picks à la carte or switch to a package — your choice." />

      {best && (
        <div className={cn("mb-6 flex items-start gap-4 rounded-2xl border p-5", best.kind === "saves" ? "border-emerald-400/30 bg-emerald-400/[0.07]" : "border-gold-300/30 bg-gold-300/[0.07]")}>
          <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", best.kind === "saves" ? "bg-emerald-400/15 text-emerald-300" : "bg-gold-300/15 text-gold-200")}>
            {best.kind === "saves" ? <TrendingDown className="size-5" /> : <Sparkles className="size-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-bone-50">
              {best.kind === "saves"
                ? `The ${best.package.name} package saves you ${formatMoney(best.savingsCents)}`
                : `For ${formatMoney(-best.savingsCents)} more, upgrade to ${best.package.name}`}
            </p>
            <p className="mt-1 text-[13.5px] text-mist-300">
              {best.coversAll ? "It includes everything you picked" : "It covers most of what you picked"}
              {best.bonusServiceIds.length > 0 && <> — plus {best.bonusServiceIds.map((id) => names.get(id)).filter(Boolean).join(", ")}</>}.
            </p>
          </div>
          {packageId !== best.package.id && (
            <button type="button" onClick={() => onChoose(best.package.id)} className="hidden h-10 shrink-0 rounded-full bg-bone-50 px-4 text-sm font-medium text-ink-950 transition hover:bg-white sm:block">
              Switch
            </button>
          )}
        </div>
      )}

      <div className="grid gap-3">
        <button
          type="button"
          onClick={() => onChoose(null)}
          aria-pressed={packageId === null}
          className={cn(
            "flex items-center justify-between rounded-2xl border p-5 text-left transition-all",
            packageId === null ? "border-gold-300/70 bg-gold-300/[0.08]" : "border-white/10 hover:border-white/25"
          )}
        >
          <div>
            <p className="font-medium text-bone-50">Keep individual services</p>
            <p className="mt-0.5 text-[13px] text-mist-400">
              {serviceIds.length ? `${serviceIds.length} service${serviceIds.length === 1 ? "" : "s"} selected` : "No services selected yet"}
            </p>
          </div>
          {best && <span className="text-lg font-medium tabular-nums text-bone-100">{formatMoney(best.alaCarteCents)}</span>}
        </button>

        {catalog.packages.map((pkg) => {
          const price = packagePrice(pkg, sqft);
          const rec = recs.find((r) => r.package.id === pkg.id);
          const active = packageId === pkg.id;
          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => onChoose(pkg.id)}
              aria-pressed={active}
              className={cn(
                "rounded-2xl border p-5 text-left transition-all duration-300",
                active ? "border-gold-300/70 bg-gold-300/[0.08] shadow-[0_0_0_4px_rgb(230_201_152/0.08)]" : "border-white/10 hover:border-white/25"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 text-lg font-medium text-bone-50">
                    {pkg.name}
                    {pkg.badge && <span className="rounded-full bg-gold-300/15 px-2 py-0.5 text-[11px] font-medium text-gold-200">{pkg.badge}</span>}
                  </p>
                  <p className="mt-0.5 text-[13px] text-mist-400">{pkg.tagline}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-medium tabular-nums">{formatMoney(price)}</p>
                  {rec && rec.kind === "saves" && <p className="text-[12px] text-emerald-300">Save {formatMoney(rec.savingsCents)}</p>}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {pkg.services.map((ps) => (
                  <span
                    key={ps.service_id}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px]",
                      selected.has(ps.service_id) ? "bg-gold-300/15 text-gold-100" : "bg-white/[0.06] text-mist-300"
                    )}
                  >
                    <Check className="size-3" /> {names.get(ps.service_id)}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
