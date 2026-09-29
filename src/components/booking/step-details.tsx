"use client";

import Link from "next/link";
import { Checkbox, Field, Input } from "@/components/ui/field";
import { Switch } from "@/components/ui/field";
import { StepHeader } from "./primitives";
import type { DraftCustomer } from "./types";

export function StepDetails({
  value,
  onChange,
  errors,
  signedIn,
}: {
  value: DraftCustomer;
  onChange: (patch: Partial<DraftCustomer>) => void;
  errors: Record<string, string>;
  signedIn: boolean;
}) {
  const err = (k: string) => errors[`customer.${k}`];
  return (
    <div>
      <StepHeader
        eyebrow="Step 6 · Your details"
        title="Who's booking?"
        description={
          signedIn ? (
            "We've filled in what we know — update anything that's changed."
          ) : (
            <>
              We&rsquo;ll send your confirmation and delivery links here.{" "}
              <Link href="/login?next=/book%3Fresume%3D1" className="text-gold-200 underline-offset-4 hover:underline">
                Have an account? Sign in
              </Link>
            </>
          )
        }
      />
      <div className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="First name" htmlFor="first_name" error={err("first_name")}>
            <Input id="first_name" autoComplete="given-name" value={value.first_name} onChange={(e) => onChange({ first_name: e.target.value })} aria-invalid={Boolean(err("first_name"))} />
          </Field>
          <Field label="Last name" htmlFor="last_name" error={err("last_name")}>
            <Input id="last_name" autoComplete="family-name" value={value.last_name} onChange={(e) => onChange({ last_name: e.target.value })} aria-invalid={Boolean(err("last_name"))} />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email" htmlFor="email" error={err("email")}>
            <Input id="email" type="email" autoComplete="email" inputMode="email" value={value.email} onChange={(e) => onChange({ email: e.target.value })} aria-invalid={Boolean(err("email"))} />
          </Field>
          <Field label="Mobile phone" htmlFor="phone" error={err("phone")}>
            <Input id="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="(813) 555-0100" value={value.phone} onChange={(e) => onChange({ phone: e.target.value })} aria-invalid={Boolean(err("phone"))} />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Company / team" optional htmlFor="company">
            <Input id="company" autoComplete="organization" value={value.company} onChange={(e) => onChange({ company: e.target.value })} />
          </Field>
          <Field label="Brokerage" optional htmlFor="brokerage">
            <Input id="brokerage" value={value.brokerage} onChange={(e) => onChange({ brokerage: e.target.value })} />
          </Field>
        </div>

        <div className="rounded-2xl border border-white/10 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-bone-100">Billing address</p>
              <p className="text-[13px] text-mist-500">Same as the property address</p>
            </div>
            <Switch checked={value.billing_same_as_property} onChange={(v) => onChange({ billing_same_as_property: v })} label="Billing address same as property" />
          </div>
          {!value.billing_same_as_property && (
            <div className="mt-5 grid gap-4 sm:grid-cols-12">
              <Field label="Street" htmlFor="b1" className="sm:col-span-12">
                <Input id="b1" autoComplete="billing address-line1" value={value.billing_line1} onChange={(e) => onChange({ billing_line1: e.target.value })} />
              </Field>
              <Field label="City" htmlFor="bc" className="sm:col-span-6">
                <Input id="bc" autoComplete="billing address-level2" value={value.billing_city} onChange={(e) => onChange({ billing_city: e.target.value })} />
              </Field>
              <Field label="State" htmlFor="bs" className="sm:col-span-2">
                <Input id="bs" maxLength={2} autoComplete="billing address-level1" value={value.billing_state} onChange={(e) => onChange({ billing_state: e.target.value.toUpperCase() })} />
              </Field>
              <Field label="ZIP" htmlFor="bz" className="sm:col-span-4">
                <Input id="bz" inputMode="numeric" autoComplete="billing postal-code" value={value.billing_postal_code} onChange={(e) => onChange({ billing_postal_code: e.target.value })} />
              </Field>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Checkbox label="Text me appointment reminders" description="Arrival and delivery updates by SMS. Reply STOP any time." checked={value.sms_opt_in} onChange={(e) => onChange({ sms_opt_in: e.target.checked })} />
          <Checkbox label="Send me tips and occasional offers" checked={value.marketing_opt_in} onChange={(e) => onChange({ marketing_opt_in: e.target.checked })} />
        </div>
      </div>
    </div>
  );
}
