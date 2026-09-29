"use client";

import type { Catalog } from "@/lib/types";
import { servicePrice, packageServiceIds } from "@/lib/pricing/engine";
import { formatMoney } from "@/lib/utils";
import { ServiceIcon } from "@/components/ui/icon";
import { ChoiceCard, StepHeader, Stepper } from "./primitives";

export function StepServices({
  catalog,
  sqft,
  selected,
  quantities,
  packageId,
  onToggle,
  onQuantity,
}: {
  catalog: Catalog;
  sqft: number | null;
  selected: string[];
  quantities: Record<string, number>;
  packageId: string | null;
  onToggle: (id: string) => void;
  onQuantity: (id: string, qty: number) => void;
}) {
  const pkg = catalog.packages.find((p) => p.id === packageId) ?? null;
  const included = new Set(packageServiceIds(pkg));
  const services = catalog.services.filter((s) => s.is_bookable);

  return (
    <div>
      <StepHeader
        eyebrow="Step 2 · Services"
        title="What should we capture?"
        description={pkg ? `The ${pkg.name} package is selected — add anything else you need.` : "Pick as many as you like. Prices reflect your home's size — we'll check for package savings next."}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {services.map((s) => {
          const inPackage = included.has(s.id);
          const isSelected = inPackage || selected.includes(s.id);
          const perUnit = s.pricing_model === "per_unit";
          const qty = quantities[s.id] ?? 1;
          return (
            <ChoiceCard
              key={s.id}
              selected={isSelected}
              onClick={() => !inPackage && onToggle(s.id)}
              disabled={inPackage}
              className="p-5"
              footer={perUnit && isSelected && !inPackage ? <Stepper value={qty} max={s.max_quantity ?? 20} onChange={(v) => onQuantity(s.id, v)} label={`${s.name} quantity`} /> : undefined}
            >
              <div className="flex items-start gap-3.5 pr-7">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-accent-200">
                  <ServiceIcon name={s.icon} className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-medium text-bone-50">{s.name}</span>
                  <span className="mt-1 line-clamp-2 block text-[13px] leading-snug text-mist-400">{s.tagline}</span>
                </span>
              </div>
              <span className="mt-4 block text-[15px] font-medium text-bone-100">
                {inPackage ? (
                  <span className="text-accent-200">Included in {pkg?.name}</span>
                ) : (
                  <>
                    {formatMoney(servicePrice(s, sqft) * (perUnit && isSelected ? qty : 1))}
                    {perUnit && s.unit_label && <span className="text-[12px] text-mist-500"> {isSelected ? `(${qty} × ${s.unit_label})` : `/ ${s.unit_label}`}</span>}
                  </>
                )}
              </span>
            </ChoiceCard>
          );
        })}
      </div>
    </div>
  );
}
