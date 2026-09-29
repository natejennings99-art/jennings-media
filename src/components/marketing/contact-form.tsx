"use client";

import { useActionState, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { submitContact } from "@/app/(marketing)/contact/actions";
import { track } from "@/lib/analytics";
import type { ActionResult } from "@/lib/types";

const REASONS = [
  { value: "booking", label: "Booking a shoot" },
  { value: "pricing", label: "Pricing question" },
  { value: "custom_quote", label: "Custom quote / large project" },
  { value: "partnership", label: "Brokerage or team partnership" },
  { value: "support", label: "Support with an existing order" },
  { value: "general", label: "Something else" },
];

export function ContactForm({ defaultReason = "general" }: { defaultReason?: string }) {
  const [startedAt] = useState(() => Date.now());
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(async (prev, form) => {
    const res = await submitContact(prev, form);
    if (res.ok) track("contact_submit");
    return res;
  }, null);
  const err = (k: string) => (state && !state.ok ? state.fieldErrors?.[k] : undefined);

  if (state?.ok) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center text-center">
        <CheckCircle2 className="size-12 text-emerald-300" strokeWidth={1.5} />
        <p className="mt-5 text-2xl font-medium tracking-[-0.03em]">Message received</p>
        <p className="mt-2 max-w-sm text-mist-400">Thanks for reaching out — we reply within one business day. Check your inbox for a confirmation.</p>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-5" noValidate>
      <input type="hidden" name="startedAt" value={startedAt} />
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="c-name" error={err("name")}>
          <Input id="c-name" name="name" autoComplete="name" required />
        </Field>
        <Field label="Company" optional htmlFor="c-company">
          <Input id="c-company" name="company" autoComplete="organization" />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" htmlFor="c-email" error={err("email")}>
          <Input id="c-email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Phone" optional htmlFor="c-phone">
          <Input id="c-phone" name="phone" type="tel" autoComplete="tel" />
        </Field>
      </div>
      <Field label="Reason for inquiry" htmlFor="c-reason">
        <Select id="c-reason" name="reason" defaultValue={defaultReason}>
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Message" htmlFor="c-message" error={err("message")}>
        <Textarea id="c-message" name="message" rows={5} required placeholder="Tell us about the property, timeline and what you need." />
      </Field>
      {state && !state.ok && !state.fieldErrors && <p className="text-sm text-red-300">{state.error}</p>}
      <Button type="submit" size="lg" loading={pending} className="w-full sm:w-auto">
        Send message {!pending && <ArrowRight className="size-4" />}
      </Button>
    </form>
  );
}
