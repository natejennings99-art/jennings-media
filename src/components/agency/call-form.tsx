"use client";

import { useActionState, useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { submitCall } from "@/app/(marketing)/book-a-call/actions";
import { BEST_TIMES, CALL, CALL_TOPICS } from "@/lib/content/call";
import { track } from "@/lib/analytics";
import { BRAND } from "@/lib/brand";
import { LeadHandoff } from "@/components/agency/lead-handoff";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/lib/types";
import { Chip, field } from "./inquiry-form";

const smsHref = BRAND.phoneHref.replace(/^tel:/, "sms:");
const KEYS = ["name", "business", "phone", "email", "best_time", "topic", "note"] as const;

/**
 * "Book a call": name, phone and a good time; everything else is optional.
 * `page` is the path the form sits on, so the lead is saved with where it came from.
 */
export function CallForm({ page = CALL.path, businessPlaceholder = "Restaurant, gym, salon, shop…" }: { page?: string; businessPlaceholder?: string }) {
  const [startedAt] = useState(() => Date.now());
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [state, action, pending] = useActionState<ActionResult<{ name: string; delivered?: boolean }> | null, FormData>(async (prev, form) => {
    setDraft(Object.fromEntries(KEYS.map((k) => [k, String(form.get(k) ?? "").slice(0, 1000)])));
    const res = await submitCall(prev, form);
    if (res.ok) track("contact_submit", { form: "book_a_call", page });
    return res;
  }, null);
  const err = (k: string) => (state && !state.ok ? state.fieldErrors?.[k] : undefined);

  if (state?.ok) {
    return (
      <div className="flex min-h-[20rem] flex-col justify-center" role="status">
        <span className="grid size-16 animate-fade-up place-items-center rounded-full bg-accent-300 text-ink-950">
          <Check className="size-8" strokeWidth={2.5} />
        </span>
        <p className="mt-8 animate-fade-up font-display text-[clamp(2.25rem,5vw,4rem)] break-words text-bone-50 [animation-delay:120ms]">Talk soon, {state.data.name}.</p>
        <p className="mt-4 max-w-md animate-fade-up text-[17px] leading-relaxed text-mist-300 [animation-delay:220ms]">
          Nate will call {draft.best_time ? `in the ${draft.best_time.toLowerCase()}` : "soon"}, within one business day. Can&rsquo;t wait?{" "}
          <a href={smsHref} className="whitespace-nowrap text-bone-50 underline underline-offset-4 hover:text-accent-300">
            Text {BRAND.phone}
          </a>
          .
        </p>
        {state.data.delivered === false && <LeadHandoff subject={`${CALL.name}: ${draft.business || draft.name}`} lines={KEYS.map((k) => draft[k] && `${k.replace("_", " ")}: ${draft[k]}`)} />}
      </div>
    );
  }

  const input = (f: { name: string; label: string; auto: string; type: string; inputMode?: "tel" | "email"; placeholder?: string; required?: boolean }) => (
    <div key={f.name}>
      <label htmlFor={`call-${f.name}`} className="label text-mist-500">
        {f.label}
      </label>
      <input
        id={`call-${f.name}`}
        name={f.name}
        type={f.type}
        inputMode={f.inputMode}
        autoComplete={f.auto}
        placeholder={f.placeholder}
        defaultValue={draft[f.name]}
        className={field}
        aria-invalid={Boolean(err(f.name))}
        aria-describedby={err(f.name) ? `call-${f.name}-error` : undefined}
        required={f.required}
      />
      {err(f.name) && (
        <p id={`call-${f.name}-error`} className="mt-2 text-[13px] text-red-300">
          {err(f.name)}
        </p>
      )}
    </div>
  );

  return (
    <form action={action} className="space-y-10" noValidate>
      <input type="hidden" name="startedAt" value={startedAt} />
      <input type="hidden" name="page" value={page} />
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Leave empty <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-x-10 gap-y-2 sm:grid-cols-2">
        {input({ name: "name", label: "Your name", auto: "name", type: "text", required: true })}
        {input({ name: "phone", label: "Mobile", auto: "tel", type: "tel", inputMode: "tel", required: true })}
        {input({ name: "business", label: "Business (optional)", auto: "organization", type: "text", placeholder: businessPlaceholder })}
        {input({ name: "email", label: "Email (optional)", auto: "email", type: "email", inputMode: "email" })}
      </div>

      <fieldset>
        <legend className="label mb-4 text-mist-500">Best time to call</legend>
        <div className="flex flex-wrap gap-2">
          {BEST_TIMES.map((t) => (
            <Chip key={t} name="best_time" value={t} type="radio" defaultChecked={draft.best_time === t} />
          ))}
        </div>
        {err("best_time") && <p className="mt-2 text-[13px] text-red-300">{err("best_time")}</p>}
      </fieldset>

      <fieldset>
        <legend className="label mb-4 text-mist-500">What do you need? (optional)</legend>
        <div className="flex flex-wrap gap-2">
          {CALL_TOPICS.map((t) => (
            <Chip key={t} name="topic" value={t} type="radio" defaultChecked={draft.topic === t} />
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="call-note" className="label text-mist-500">
          Anything we should know? (optional)
        </label>
        <textarea id="call-note" name="note" rows={2} maxLength={1000} defaultValue={draft.note} className={cn(field, "resize-none")} aria-invalid={Boolean(err("note"))} />
        {err("note") && <p className="mt-2 text-[13px] text-red-300">{err("note")}</p>}
      </div>

      {state && !state.ok && !state.fieldErrors && (
        <div className="space-y-3">
          <p className="text-[14px] text-red-300">{state.error}</p>
          <a href={smsHref} className="inline-block text-[14px] text-bone-50 underline underline-offset-4 hover:text-accent-300">
            Text {BRAND.phone} instead →
          </a>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          data-cursor="cta"
          className="group inline-flex h-16 w-full items-center justify-between gap-4 rounded-full bg-accent-300 pr-2 pl-8 text-[15px] font-bold tracking-[0.08em] text-ink-950 uppercase transition-colors hover:bg-bone-50 disabled:opacity-60 sm:w-auto sm:justify-start"
        >
          {pending ? "Sending…" : "Book a call"}
          <span className="grid size-12 place-items-center rounded-full bg-ink-950 text-bone-50 transition-transform duration-500 group-hover:rotate-45">
            <ArrowUpRight className="size-5" />
          </span>
        </button>
        <p className="mt-4 text-[13px] leading-relaxed text-mist-500">Free. 15 minutes. No pressure to buy anything.</p>
      </div>
    </form>
  );
}
