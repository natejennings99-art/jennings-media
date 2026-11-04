"use client";

import { useActionState, useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { submitJoin } from "@/app/(marketing)/join/actions";
import { AVAILABILITY_OPTIONS, DISCIPLINES, DISCIPLINE_LABELS } from "@/lib/content/creators";
import { track } from "@/lib/analytics";
import { BRAND } from "@/lib/brand";
import { LeadHandoff } from "@/components/agency/lead-handoff";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/lib/types";
import { Chip, field } from "./inquiry-form";

const smsHref = BRAND.phoneHref.replace(/^tel:/, "sms:");
const DRAFT_KEYS = ["name", "email", "phone", "discipline", "portfolio_url", "gear", "day_rate", "availability", "availability_notes", "notes"] as const;

/** Photographer / videographer application (/join). Saves to creator_applicants and emails Nate. */
export function JoinForm() {
  const [startedAt] = useState(() => Date.now());
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [state, action, pending] = useActionState<ActionResult<{ name: string; delivered?: boolean }> | null, FormData>(async (prev, form) => {
    setDraft(Object.fromEntries(DRAFT_KEYS.map((k) => [k, (k === "availability" ? form.getAll(k).join(", ") : String(form.get(k) ?? "")).slice(0, 1200)])));
    const res = await submitJoin(prev, form);
    if (res.ok) track("contact_submit", { form: "creator_application" });
    return res;
  }, null);
  const err = (k: string) => (state && !state.ok ? state.fieldErrors?.[k] : undefined);

  if (state?.ok) {
    return (
      <div className="flex min-h-[28rem] flex-col justify-center" role="status">
        <span className="grid size-20 animate-fade-up place-items-center rounded-full bg-accent-300 text-ink-950">
          <Check className="size-9" strokeWidth={2.5} />
        </span>
        <p className="mt-10 animate-fade-up font-display text-[clamp(2.5rem,6vw,5rem)] text-bone-50 [animation-delay:120ms]">Got it, {state.data.name}.</p>
        <p className="mt-4 max-w-md animate-fade-up text-[17px] leading-relaxed text-mist-300 [animation-delay:220ms]">
          Nate looks at every portfolio himself and replies within a few days. Want to say hi first?{" "}
          <a href={smsHref} className="text-bone-50 underline underline-offset-4 hover:text-accent-300">
            Text {BRAND.phone}
          </a>
          .
        </p>
        {state.data.delivered === false && (
          <LeadHandoff subject={`Creator application: ${draft.name}`} lines={DRAFT_KEYS.map((k) => draft[k] && `${k.replace(/_/g, " ")}: ${draft[k]}`)} />
        )}
        <ol className="mt-12 grid animate-fade-up gap-6 border-t border-white/10 pt-8 [animation-delay:320ms] sm:grid-cols-3">
          {["We look at your work", "A quick call", "A paid trial shoot"].map((s, i) => (
            <li key={s}>
              <p className="font-mono text-sm text-accent-300">0{i + 1}</p>
              <p className="mt-2 text-[15px] text-bone-100">{s}</p>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  const input = (f: { name: string; label: string; auto: string; type: string; placeholder?: string; required?: boolean; inputMode?: "numeric" | "tel" | "email" | "url"; prefix?: string }) => (
    <div key={f.name}>
      <label htmlFor={`j-${f.name}`} className="label text-mist-500">
        {f.label}
      </label>
      <div className="relative">
        {f.prefix && <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 text-[17px] text-mist-500">{f.prefix}</span>}
        <input
          id={`j-${f.name}`}
          name={f.name}
          type={f.type}
          inputMode={f.inputMode}
          autoComplete={f.auto}
          placeholder={f.placeholder}
          className={cn(field, f.prefix && "pl-5")}
          aria-invalid={Boolean(err(f.name))}
          required={f.required}
          min={f.type === "number" ? 0 : undefined}
          step={f.type === "number" ? 1 : undefined}
        />
      </div>
      {err(f.name) && <p className="mt-2 text-[13px] text-red-300">{err(f.name)}</p>}
    </div>
  );

  return (
    <form action={action} className="space-y-12" noValidate>
      <input type="hidden" name="startedAt" value={startedAt} />
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Leave empty <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-x-10 gap-y-2 sm:grid-cols-3">
        {input({ name: "name", label: "Your name", auto: "name", type: "text", required: true })}
        {input({ name: "email", label: "Email", auto: "email", type: "email", inputMode: "email", required: true })}
        {input({ name: "phone", label: "Mobile", auto: "tel", type: "tel", inputMode: "tel", required: true })}
      </div>

      <fieldset>
        <legend className="label mb-4 text-mist-500">What do you shoot?</legend>
        <div className="flex flex-wrap gap-2">
          {DISCIPLINES.map((d) => (
            <label key={d} className="relative cursor-pointer">
              <input type="radio" name="discipline" value={d} className="peer sr-only" />
              <span className="inline-flex h-11 items-center rounded-full border border-white/15 px-5 text-[14px] text-mist-300 transition-all duration-300 peer-checked:border-accent-300 peer-checked:bg-accent-300 peer-checked:text-ink-950 peer-focus-visible:ring-2 peer-focus-visible:ring-accent-300 hover:border-white/40 hover:text-bone-50">
                {DISCIPLINE_LABELS[d]}
              </span>
            </label>
          ))}
        </div>
        {err("discipline") && <p className="mt-2 text-[13px] text-red-300">{err("discipline")}</p>}
      </fieldset>

      {input({ name: "portfolio_url", label: "Link to your work", auto: "url", type: "url", inputMode: "url", placeholder: "Instagram, website, Vimeo, Drive…", required: true })}

      <div className="grid gap-x-10 gap-y-2 sm:grid-cols-[minmax(0,1fr)_200px]">
        <div>
          <label htmlFor="j-gear" className="label text-mist-500">
            Gear (optional)
          </label>
          <textarea id="j-gear" name="gear" rows={2} className={cn(field, "resize-none")} placeholder="Bodies, lenses, gimbal, drone, lighting…" aria-invalid={Boolean(err("gear"))} />
          {err("gear") && <p className="mt-2 text-[13px] text-red-300">{err("gear")}</p>}
        </div>
        {input({ name: "day_rate", label: "Day rate (USD)", auto: "off", type: "number", inputMode: "numeric", placeholder: "500", prefix: "$", required: true })}
      </div>

      <fieldset>
        <legend className="label mb-4 text-mist-500">When are you usually available?</legend>
        <div className="flex flex-wrap gap-2">
          {AVAILABILITY_OPTIONS.map((a) => (
            <Chip key={a} name="availability" value={a} type="checkbox" />
          ))}
        </div>
        <input name="availability_notes" type="text" autoComplete="off" className={cn(field, "mt-2")} placeholder="Anything else about your schedule (optional)" aria-invalid={Boolean(err("availability_notes"))} />
        {(err("availability") || err("availability_notes")) && <p className="mt-2 text-[13px] text-red-300">{err("availability") ?? err("availability_notes")}</p>}
      </fieldset>

      <div>
        <label htmlFor="j-notes" className="label text-mist-500">
          Anything else? (optional)
        </label>
        <textarea id="j-notes" name="notes" rows={3} className={cn(field, "resize-none")} placeholder="Where you're based, what you love shooting, who you've worked with…" aria-invalid={Boolean(err("notes"))} />
        {err("notes") && <p className="mt-2 text-[13px] text-red-300">{err("notes")}</p>}
      </div>

      {state && !state.ok && !state.fieldErrors && (
        <div className="space-y-3">
          <p className="text-[14px] text-red-300">{state.error}</p>
          {BRAND.email && (
            <a
              className="inline-block text-[14px] text-bone-50 underline underline-offset-4 hover:text-accent-300"
              href={`mailto:${BRAND.email}?subject=${encodeURIComponent(`Creator application — ${draft.name || "photographer/videographer"}`)}&body=${encodeURIComponent(DRAFT_KEYS.map((k) => `${k.replace(/_/g, " ")}: ${draft[k] ?? ""}`).join("\n"))}`}
            >
              Email this application to {BRAND.email} instead →
            </a>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        data-cursor="cta"
        className="group inline-flex h-16 items-center gap-4 rounded-full bg-accent-300 pr-2 pl-8 text-[15px] font-bold tracking-[0.08em] text-ink-950 uppercase transition-colors hover:bg-bone-50 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send my application"}
        <span className="grid size-12 place-items-center rounded-full bg-ink-950 text-bone-50 transition-transform duration-500 group-hover:rotate-45">
          <ArrowUpRight className="size-5" />
        </span>
      </button>
    </form>
  );
}
