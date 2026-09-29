"use client";

import type { Catalog } from "@/lib/types";
import { addOnUnitPrice, relevantAddOns } from "@/lib/pricing/engine";
import { formatMoney } from "@/lib/utils";
import { ServiceIcon } from "@/components/ui/icon";
import { ChoiceCard, StepHeader, Stepper } from "./primitives";

export function StepAddOns({
  catalog,
  sqft,
  orderServiceIds,
  selected,
  onToggle,
  onQuantity,
}: {
  catalog: Catalog;
  sqft: number | null;
  orderServiceIds: string[];
  selected: Record<string, number>;
  onToggle: (id: string) => void;
  onQuantity: (id: string, qty: number) => void;
}) {
  const services = new Map(catalog.services.map((s) => [s.id, s]));
  const addOns = relevantAddOns(catalog, orderServiceIds);

  return (
    <div>
      <StepHeader eyebrow="Step 4 · Add-ons" title="Make it unforgettable" description="Hand-picked extras that pair with what you've booked. Totally optional." />
      {addOns.length === 0 ? (
        <p className="rounded-2xl border border-white/10 p-6 text-sm text-mist-400">No add-ons for this order — you&rsquo;re all set. Continue to scheduling.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addOns.map((a) => {
            const linked = a.service_id ? services.get(a.service_id) : undefined;
            const perUnit = (linked?.pricing_model ?? a.pricing_model) === "per_unit";
            const unitLabel = linked?.unit_label ?? a.unit_label;
            const isSelected = a.id in selected;
            const qty = selected[a.id] ?? 1;
            return (
              <ChoiceCard
                key={a.id}
                selected={isSelected}
                onClick={() => onToggle(a.id)}
                className="p-5"
                footer={isSelected && perUnit ? <Stepper value={qty} max={linked?.max_quantity ?? a.max_quantity ?? 20} onChange={(v) => onQuantity(a.id, v)} label={`${a.name} quantity`} /> : undefined}
              >
                <div className="flex items-start gap-3.5 pr-7">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-accent-200">
                    <ServiceIcon name={a.icon ?? linked?.icon} className="size-4.5" />
                  </span>
                  <span>
                    <span className="block font-medium text-bone-50">{a.name}</span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-mist-400">{a.description}</span>
                  </span>
                </div>
                <span className="mt-4 block text-[15px] font-medium">
                  +{formatMoney(addOnUnitPrice(a, services, sqft) * (isSelected && perUnit ? qty : 1))}
                  {perUnit && unitLabel && <span className="text-[12px] text-mist-500"> {isSelected ? `(${qty} × ${unitLabel})` : `/ ${unitLabel}`}</span>}
                </span>
              </ChoiceCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
