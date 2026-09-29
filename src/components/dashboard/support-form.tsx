"use client";

import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/field";
import { submitSupport } from "@/app/dashboard/actions";
import { useFormResult } from "./client-actions";

export function SupportForm() {
  const [state, action, pending] = useFormResult(submitSupport, "Message sent — we'll be in touch soon");
  if (state?.ok) return <p className="text-emerald-200">Thanks! Your message is with our team. We&rsquo;ll reply by email.</p>;
  return (
    <form action={action} className="space-y-5">
      <Field label="How can we help?" htmlFor="message">
        <Textarea id="message" name="message" rows={6} required minLength={10} placeholder="Tell us about the order, the question or the issue…" />
      </Field>
      <Button type="submit" loading={pending}>
        Send message
      </Button>
    </form>
  );
}
