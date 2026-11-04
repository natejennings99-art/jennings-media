"use client";

import { useActionState, useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { submitContentPackageCall } from "@/app/(marketing)/content-package/actions";
import { BEST_TIMES, CONTENT_PACKAGE } from "@/lib/content/content-package";
import { track } from "@/lib/analytics";
import { BRAND } from "@/lib/brand";
import { LeadHandoff } from "@/components/agency/lead-handoff";
import type { ActionResult } from "@/lib/types";
import { Chip, field } from "./inquiry-form";

const smsHref = BRAND.phoneHref.replace(/^tel:/, "sms:");
const KEYS = ["name", "business", "phone", "best_time", "email"] as const;

/** Four fields, one button: name, business, phone, best time to call. */
export function ContentPackageForm() {
  const [startedAt] = useState(() => Date.now());
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [state, action, pending] = useActionState<ActionResult<{ name: string; delivered?: boolean }> | null, FormData>(async (prev, form) => {
    setDraft(Object.fromEntries(KEYS.map((k) => [k, String(form.get(k) ?? "").slice(0, 300)])));
    const res = await submitContentPackageCall(prev, form);
    if (res.ok) track("contact_submit", { form: "content_package_call" });
    return res;
  }, null);
  const err = (k: string) => (state && !state.ok ? state.fieldErrors?.[k] : undefined);

  if (state?.ok) {
    return (
      <div className="flex min-h-[20rem] flex-col justify-center" role="status">
        <span className="grid size-16 animate-fade-up place-items-center rounded-full bg-accent-300 text-ink-950">
          <Check className="size-8" strokeWidth={2.5} />
        </span>
        <p className="mt-8 animate-fade-up font-display text-[clamp(2.25rem,5vw,4rem)] text-bone-50 [animation-delay:120ms]">Talk soon, {state.data.name}.</p>
        <p className="mt-4 max-w-md animate-fade-up text-[17px] leading-relaxed text-mist-300 [animation-delay:220ms]">
          Nate will call {draft.best_time ? draft.best_time.toLowerCase() : "soon"}, within one business day. Can&rsquo;t wait?{" "}
          <a href={smsHref} className="text-bone-50 underline underline-offset-4 hover:text-accent-300">
            Text {BRAND.phone}
          </a>
          .
        </p>
        {state.data.delivered === false && <LeadHandoff subject={`${CONTENT_PACKAGE.name}: ${draft.business || draft.name}`} lines={KEYS.map((k) => draft[k] && `${k.replace("_", " ")}: ${draft[k]}`)} />}
      </div>
    );
  }

  const input = (f: { name: string; label: string; auto: string; type: string; inputMode?: "tel" | "email"; placeholder?: string; required?: boolean }) => (
    <div key={f.name}>
      <label htmlFor={`cp-${f.name}`} className="label text-mist-500">
        {f.label}
      </label>
      <input id={`cp-${f.name}`} name={f.name} type={f.type} inputMode={f.inputMode} autoComplete={f.auto} placeholder={f.placeholder} className={field} aria-invalid={Boolean(err(f.name))} required={f.required} />
      {err(f.name) && <p className="mt-2 text-[13px] text-red-300">{err(f.name)}</p>}
    </div>
  );

  return (
    <form action={action} className="space-y-10" noValidate>
      <input type="hidden" name="startedAt" value={startedAt} />
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Leave empty <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-x-10 gap-y-2 sm:grid-cols-2">
        {input({ name: "name", label: "Your name", auto: "name", type: "text", required: true })}
        {input({ name: "business", label: "Business", auto: "organization", type: "text", placeholder: "Restaurant, gym, salon, shop…", required: true })}
        {input({ name: "phone", label: "Mobile", auto: "tel", type: "tel", inputMode: "tel", required: true })}
        {input({ name: "email", label: "Email (optional)", auto: "email", type: "email", inputMode: "email" })}
      </div>

      <fieldset>
        <legend className="label mb-4 text-mist-500">Best time to call</legend>
        <div className="flex flex-wrap gap-2">
          {BEST_TIMES.map((t) => (
            <Chip key={t} name="best_time" value={t} type="radio" />
          ))}
        </div>
        {err("best_time") && <p className="mt-2 text-[13px] text-red-300">{err("best_time")}</p>}
      </fieldset>

      {state && !state.ok && !state.fieldErrors && (
        <div className="space-y-3">
          <p className="text-[14px] text-red-300">{state.error}</p>
          <a href={smsHref} className="inline-block text-[14px] text-bone-50 underline underline-offset-4 hover:text-accent-300">
            Text {BRAND.phone} instead →
          </a>
        </div>
      )}

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
    </form>
  );
}
