"use client";

import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input } from "@/components/ui/field";
import { updateProfile } from "@/app/dashboard/actions";
import { useFormResult } from "./client-actions";
import type { Customer } from "@/lib/types";

export function ProfileForm({ customer }: { customer: Customer }) {
  const [, action, pending] = useFormResult(updateProfile, "Profile saved");
  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name" htmlFor="first_name">
          <Input id="first_name" name="first_name" defaultValue={customer.first_name} required />
        </Field>
        <Field label="Last name" htmlFor="last_name">
          <Input id="last_name" name="last_name" defaultValue={customer.last_name} required />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone" htmlFor="phone">
          <Input id="phone" name="phone" type="tel" defaultValue={customer.phone ?? ""} required />
        </Field>
        <Field label="Company / team" optional htmlFor="company">
          <Input id="company" name="company" defaultValue={customer.company ?? ""} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Brokerage" optional htmlFor="brokerage">
          <Input id="brokerage" name="brokerage" defaultValue={customer.brokerage ?? ""} />
        </Field>
        <Field label="License number" optional htmlFor="license_number">
          <Input id="license_number" name="license_number" defaultValue={customer.license_number ?? ""} />
        </Field>
      </div>
      <div className="space-y-3">
        <Checkbox name="sms_opt_in" defaultChecked={customer.sms_opt_in} label="Text me appointment reminders" />
        <Checkbox name="marketing_opt_in" defaultChecked={customer.marketing_opt_in} label="Send me tips and occasional offers" />
      </div>
      <div>
        <Button type="submit" loading={pending}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
