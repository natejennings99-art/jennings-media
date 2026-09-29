"use client";

import { Building2, Castle, Home, Hotel, Landmark, Store, Trees, Warehouse, Building } from "lucide-react";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { ARRIVAL_WINDOWS, LISTING_STATUS_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/status";
import { cn } from "@/lib/utils";
import { Pill, StepHeader } from "./primitives";
import type { DraftProperty } from "./types";

const TYPE_ICONS: Record<string, typeof Home> = {
  single_family: Home,
  condo: Building2,
  townhome: Building,
  multi_family: Hotel,
  luxury: Castle,
  land: Trees,
  commercial: Store,
  rental: Warehouse,
  other: Landmark,
};

export function StepProperty({
  value,
  onChange,
  errors,
  minDate,
}: {
  value: DraftProperty;
  onChange: (patch: Partial<DraftProperty>) => void;
  errors: Record<string, string>;
  minDate: string;
}) {
  const err = (k: string) => errors[`property.${k}`];
  return (
    <div>
      <StepHeader eyebrow="Step 1 · Property" title="Tell us about the property" description="Square footage sets your pricing. Access details help your photographer arrive ready." />

      <div className="grid gap-5">
        <Field label="Property address" htmlFor="address_line1" error={err("address_line1")}>
          <Input id="address_line1" autoComplete="address-line1" placeholder="1234 Bayshore Blvd" value={value.address_line1} onChange={(e) => onChange({ address_line1: e.target.value })} aria-invalid={Boolean(err("address_line1"))} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-12">
          <Field label="Unit" optional htmlFor="address_line2" className="sm:col-span-3">
            <Input id="address_line2" autoComplete="address-line2" placeholder="Apt 4B" value={value.address_line2} onChange={(e) => onChange({ address_line2: e.target.value })} />
          </Field>
          <Field label="City" htmlFor="city" error={err("city")} className="sm:col-span-4">
            <Input id="city" autoComplete="address-level2" value={value.city} onChange={(e) => onChange({ city: e.target.value })} aria-invalid={Boolean(err("city"))} />
          </Field>
          <Field label="State" htmlFor="state" error={err("state")} className="sm:col-span-2">
            <Input id="state" autoComplete="address-level1" maxLength={2} placeholder="FL" value={value.state} onChange={(e) => onChange({ state: e.target.value.toUpperCase() })} aria-invalid={Boolean(err("state"))} />
          </Field>
          <Field label="ZIP" htmlFor="postal_code" error={err("postal_code")} className="sm:col-span-3">
            <Input id="postal_code" autoComplete="postal-code" inputMode="numeric" maxLength={10} value={value.postal_code} onChange={(e) => onChange({ postal_code: e.target.value })} aria-invalid={Boolean(err("postal_code"))} />
          </Field>
        </div>

        <div>
          <p className="mb-2.5 text-[13px] font-medium text-mist-300">Property type</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {Object.entries(PROPERTY_TYPE_LABELS).map(([key, label]) => {
              const Icon = TYPE_ICONS[key] ?? Home;
              const active = value.property_type === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onChange({ property_type: key })}
                  aria-pressed={active}
                  className={cn(
                    "flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-3 text-center text-[12px] leading-tight transition-all duration-200",
                    active ? "border-accent-300/70 bg-accent-300/[0.09] text-bone-50" : "border-white/10 text-mist-400 hover:border-white/25 hover:text-bone-100"
                  )}
                >
                  <Icon className={cn("size-5", active ? "text-accent-200" : "")} strokeWidth={1.6} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-5">
          <Field label="Square feet" htmlFor="sqft" error={err("square_feet")}>
            <Input id="sqft" inputMode="numeric" placeholder="2,400" value={value.square_feet} onChange={(e) => onChange({ square_feet: e.target.value.replace(/[^\d]/g, "") })} aria-invalid={Boolean(err("square_feet"))} />
          </Field>
          <Field label="Beds" htmlFor="beds">
            <Input id="beds" inputMode="decimal" placeholder="4" value={value.bedrooms} onChange={(e) => onChange({ bedrooms: e.target.value.replace(/[^\d.]/g, "") })} />
          </Field>
          <Field label="Baths" htmlFor="baths">
            <Input id="baths" inputMode="decimal" placeholder="3.5" value={value.bathrooms} onChange={(e) => onChange({ bathrooms: e.target.value.replace(/[^\d.]/g, "") })} />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Listing status" htmlFor="listing_status">
            <Select id="listing_status" value={value.listing_status} onChange={(e) => onChange({ listing_status: e.target.value })}>
              {Object.entries(LISTING_STATUS_LABELS).map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <div>
            <p className="mb-2 text-[13px] font-medium text-mist-300">Occupancy</p>
            <div className="grid grid-cols-2 gap-2">
              {(["occupied", "vacant"] as const).map((o) => (
                <Pill key={o} active={value.occupancy === o} onClick={() => onChange({ occupancy: o })}>
                  {o === "occupied" ? "Occupied" : "Vacant"}
                </Pill>
              ))}
            </div>
          </div>
        </div>

        <Field label="Lockbox / access information" optional htmlFor="access" hint="Lockbox code, gate code, where keys are, or who will be on site. Only visible to our team.">
          <Textarea id="access" rows={2} className="min-h-20" value={value.access_instructions} onChange={(e) => onChange({ access_instructions: e.target.value })} />
        </Field>
        <Field label="Special instructions" optional htmlFor="special">
          <Textarea id="special" rows={3} placeholder="Rooms to feature, things to avoid, pets on site…" value={value.special_instructions} onChange={(e) => onChange({ special_instructions: e.target.value })} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="MLS number" optional htmlFor="mls">
            <Input id="mls" value={value.mls_number} onChange={(e) => onChange({ mls_number: e.target.value })} />
          </Field>
          <Field label="Desired shoot date" optional htmlFor="preferred_date" hint="We'll open the calendar on this date.">
            <Input id="preferred_date" type="date" min={minDate} value={value.preferred_date} onChange={(e) => onChange({ preferred_date: e.target.value })} />
          </Field>
        </div>
        <div>
          <p className="mb-2.5 text-[13px] font-medium text-mist-300">Preferred arrival window</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ARRIVAL_WINDOWS.map((w) => (
              <button
                key={w.value}
                type="button"
                onClick={() => onChange({ arrival_window: w.value })}
                aria-pressed={value.arrival_window === w.value}
                className={cn(
                  "rounded-2xl border px-3 py-3 text-left transition-all",
                  value.arrival_window === w.value ? "border-accent-300/70 bg-accent-300/[0.09]" : "border-white/10 hover:border-white/25"
                )}
              >
                <span className="block text-sm text-bone-50">{w.label}</span>
                <span className="block text-[12px] text-mist-500">{w.hint}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
