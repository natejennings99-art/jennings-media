"use client";

import { useActionState, useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { submitInquiry } from "@/app/(marketing)/contact/actions";
import { BUDGETS, INQUIRY_SERVICES, NEEDS } from "@/lib/content/agency";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/lib/types";

const field = "w-full border-0 border-b border-white/15 bg-transparent px-0 py-4 text-[17px] text-bone-50 placeholder:text-mist-600 transition-colors focus:border-accent-300 focus:ring-0 focus:outline-none aria-[invalid=true]:border-red-400";

function Chip({ name, value, type, defaultChecked }: { name: string; value: string; type: "radio" | "checkbox"; defaultChecked?: boolean }) {
  return (
    <label className="relative cursor-pointer">
      <input type={type} name={name} value={value} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="inline-flex h-11 items-center rounded-full border border-white/15 px-5 text-[14px] text-mist-300 transition-all duration-300 peer-checked:border-accent-300 peer-checked:bg-accent-300 peer-checked:text-ink-950 peer-focus-visible:ring-2 peer-focus-visible:ring-accent-300 hover:border-white/40 hover:text-bone-50">
        {value}
      </span>
    </label>
  );
}

export function InquiryForm() {
  const [startedAt] = useState(() => Date.now());
  const [state, action, pending] = useActionState<ActionResult<{ name: string }> | null, FormData>(async (prev, form) => {
    const res = await submitInquiry(prev, form);
    if (res.ok) track("contact_submit", { form: "project_inquiry" });
    return res;
  }, null);
  const err = (k: string) => (state && !state.ok ? state.fieldErrors?.[k] : undefined);

  if (state?.ok) {
    return (
      <div className="flex min-h-[32rem] flex-col justify-center" role="status">
        <span className="grid size-20 animate-fade-up place-items-center rounded-full bg-accent-300 text-ink-950">
          <Check className="size-9" strokeWidth={2.5} />
        </span>
        <p className="mt-10 animate-fade-up font-display text-[clamp(2.5rem,6vw,5rem)] text-bone-50 [animation-delay:120ms]">Thanks, {state.data.name}.</p>
        <p className="mt-4 max-w-md animate-fade-up text-[17px] leading-relaxed text-mist-300 [animation-delay:220ms]">
          Your brief is with our strategy team. Expect a reply within one business day — usually with a few sharp questions and times for a 30-minute call.
        </p>
        <ol className="mt-12 grid animate-fade-up gap-6 border-t border-white/10 pt-8 [animation-delay:320ms] sm:grid-cols-3">
          {["We review your brief", "30-minute discovery call", "Proposal within a week"].map((s, i) => (
            <li key={s}>
              <p className="font-mono text-sm text-accent-300">0{i + 1}</p>
              <p className="mt-2 text-[15px] text-bone-100">{s}</p>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-12" noValidate>
      <input type="hidden" name="startedAt" value={startedAt} />
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Leave empty <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-x-10 gap-y-2 sm:grid-cols-2">
        {[
          { name: "name", label: "Your name", auto: "name", type: "text" },
          { name: "company", label: "Company", auto: "organization", type: "text" },
          { name: "email", label: "Email", auto: "email", type: "email" },
          { name: "phone", label: "Phone (optional)", auto: "tel", type: "tel" },
        ].map((f) => (
          <div key={f.name}>
            <label htmlFor={`i-${f.name}`} className="label text-mist-500">
              {f.label}
            </label>
            <input id={`i-${f.name}`} name={f.name} type={f.type} autoComplete={f.auto} className={field} aria-invalid={Boolean(err(f.name))} required={f.name === "name" || f.name === "email"} />
            {err(f.name) && <p className="mt-2 text-[13px] text-red-300">{err(f.name)}</p>}
          </div>
        ))}
      </div>

      <fieldset>
        <legend className="label mb-4 text-mist-500">What do you need?</legend>
        <div className="flex flex-wrap gap-2">
          {NEEDS.map((n) => (
            <Chip key={n} name="need" value={n} type="radio" />
          ))}
        </div>
        {err("need") && <p className="mt-2 text-[13px] text-red-300">{err("need")}</p>}
      </fieldset>

      <fieldset>
        <legend className="label mb-4 text-mist-500">Services (choose any)</legend>
        <div className="flex flex-wrap gap-2">
          {INQUIRY_SERVICES.map((s) => (
            <Chip key={s} name="services" value={s} type="checkbox" />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label mb-4 text-mist-500">Estimated monthly marketing budget</legend>
        <div className="flex flex-wrap gap-2">
          {BUDGETS.map((b) => (
            <Chip key={b} name="budget" value={b} type="radio" />
          ))}
        </div>
        {err("budget") && <p className="mt-2 text-[13px] text-red-300">{err("budget")}</p>}
      </fieldset>

      <div>
        <label htmlFor="i-message" className="label text-mist-500">
          Tell us about the project
        </label>
        <textarea id="i-message" name="message" rows={4} className={cn(field, "resize-none")} placeholder="Goals, timeline, what's working, what isn't…" aria-invalid={Boolean(err("message"))} />
        {err("message") && <p className="mt-2 text-[13px] text-red-300">{err("message")}</p>}
      </div>

      {state && !state.ok && !state.fieldErrors && <p className="text-[14px] text-red-300">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        data-cursor="cta"
        className="group inline-flex h-16 items-center gap-4 rounded-full bg-accent-300 pr-2 pl-8 text-[15px] font-bold tracking-[0.08em] text-ink-950 uppercase transition-colors hover:bg-bone-50 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Let's talk"}
        <span className="grid size-12 place-items-center rounded-full bg-ink-950 text-bone-50 transition-transform duration-500 group-hover:rotate-45">
          <ArrowUpRight className="size-5" />
        </span>
      </button>
    </form>
  );
}
