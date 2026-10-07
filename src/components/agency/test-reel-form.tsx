"use client";

import { useActionState, useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { submitTestReel } from "@/app/(marketing)/test-reel/actions";
import { FILM_EVENINGS, REEL_CITIES, VENUE_TYPES } from "@/lib/content/test-reel";
import { track } from "@/lib/analytics";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/lib/types";
import { Chip, field } from "./inquiry-form";

const smsHref = BRAND.phoneHref.replace(/^tel:/, "sms:");

export function TestReelForm() {
  const [startedAt] = useState(() => Date.now());
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [state, action, pending] = useActionState<ActionResult<{ name: string }> | null, FormData>(async (prev, form) => {
    setDraft(Object.fromEntries(["business", "venue", "city", "instagram", "name", "email", "phone", "evening", "notes"].map((k) => [k, String(form.get(k) ?? "").slice(0, 1200)])));
    const res = await submitTestReel(prev, form);
    if (res.ok) track("contact_submit", { form: "test_reel" });
    return res;
  }, null);
  const err = (k: string) => (state && !state.ok ? state.fieldErrors?.[k] : undefined);

  if (state?.ok) {
    return (
      <div className="flex min-h-[28rem] flex-col justify-center" role="status">
        <span className="grid size-20 animate-fade-up place-items-center rounded-full bg-accent-300 text-ink-950">
          <Check className="size-9" strokeWidth={2.5} />
        </span>
        <p className="mt-10 animate-fade-up font-display text-[clamp(2.5rem,6vw,5rem)] text-bone-50 [animation-delay:120ms]">You&rsquo;re on the list, {state.data.name}.</p>
        <p className="mt-4 max-w-md animate-fade-up text-[17px] leading-relaxed text-mist-300 [animation-delay:220ms]">
          We&rsquo;ll reach out within one business day to confirm an evening. Want to lock one in sooner?{" "}
          <a href={smsHref} className="text-bone-50 underline underline-offset-4 hover:text-accent-300">
            Text {BRAND.phone}
          </a>
          .
        </p>
        <ol className="mt-12 grid animate-fade-up gap-6 border-t border-white/10 pt-8 [animation-delay:320ms] sm:grid-cols-3">
          {["We confirm an evening", "We film at your venue", "Your reel within 48 hours"].map((s, i) => (
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
          { name: "business", label: "Business name", auto: "organization", type: "text", placeholder: "" },
          { name: "instagram", label: "Instagram handle", auto: "off", type: "text", placeholder: "@yourvenue" },
        ].map((f) => (
          <div key={f.name}>
            <label htmlFor={`t-${f.name}`} className="label text-mist-500">
              {f.label}
            </label>
            <input id={`t-${f.name}`} name={f.name} type={f.type} autoComplete={f.auto} placeholder={f.placeholder} className={field} aria-invalid={Boolean(err(f.name))} required={f.name === "business"} />
            {err(f.name) && <p className="mt-2 text-[13px] text-red-300">{err(f.name)}</p>}
          </div>
        ))}
      </div>

      <fieldset>
        <legend className="label mb-4 text-mist-500">Venue type</legend>
        <div className="flex flex-wrap gap-2">
          {VENUE_TYPES.map((v) => (
            <Chip key={v} name="venue" value={v} type="radio" />
          ))}
        </div>
        {err("venue") && <p className="mt-2 text-[13px] text-red-300">{err("venue")}</p>}
      </fieldset>

      <fieldset>
        <legend className="label mb-4 text-mist-500">City</legend>
        <div className="flex flex-wrap gap-2">
          {REEL_CITIES.map((c) => (
            <Chip key={c} name="city" value={c} type="radio" />
          ))}
        </div>
        {err("city") && <p className="mt-2 text-[13px] text-red-300">{err("city")}</p>}
      </fieldset>

      <div className="grid gap-x-10 gap-y-2 sm:grid-cols-3">
        {[
          { name: "name", label: "Your name (optional)", auto: "name", type: "text" },
          { name: "email", label: "Email", auto: "email", type: "email" },
          { name: "phone", label: "Phone", auto: "tel", type: "tel" },
        ].map((f) => (
          <div key={f.name}>
            <label htmlFor={`t-${f.name}`} className="label text-mist-500">
              {f.label}
            </label>
            <input id={`t-${f.name}`} name={f.name} type={f.type} autoComplete={f.auto} className={field} aria-invalid={Boolean(err(f.name))} />
            {err(f.name) && <p className="mt-2 text-[13px] text-red-300">{err(f.name)}</p>}
          </div>
        ))}
        <p className="text-[13px] text-mist-500 sm:col-span-3">Email or phone — whichever you actually check.</p>
      </div>

      <fieldset>
        <legend className="label mb-4 text-mist-500">Best evening to film</legend>
        <div className="flex flex-wrap gap-2">
          {FILM_EVENINGS.map((d) => (
            <Chip key={d} name="evening" value={d} type="radio" />
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="t-notes" className="label text-mist-500">
          Anything we should know? (optional)
        </label>
        <textarea id="t-notes" name="notes" rows={3} className={cn(field, "resize-none")} placeholder="Your best view, signature drink, an event night coming up…" aria-invalid={Boolean(err("notes"))} />
        {err("notes") && <p className="mt-2 text-[13px] text-red-300">{err("notes")}</p>}
      </div>

      {state && !state.ok && !state.fieldErrors && (
        <div className="space-y-3">
          <p className="text-[14px] text-red-300">{state.error}</p>
          {BRAND.email && (
            <a
              className="inline-block text-[14px] text-bone-50 underline underline-offset-4 hover:text-accent-300"
              href={`mailto:${BRAND.email}?subject=${encodeURIComponent(`Free test reel — ${draft.business || draft.name || "my venue"}`)}&body=${encodeURIComponent(
                [`Business: ${draft.business}`, `Venue type: ${draft.venue}`, `City: ${draft.city}`, `Instagram: ${draft.instagram}`, `Name: ${draft.name}`, `Email: ${draft.email}`, `Phone: ${draft.phone}`, `Best evening: ${draft.evening || "Flexible"}`, "", draft.notes].join("\n")
              )}`}
            >
              Email this request to {BRAND.email} instead →
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
        {pending ? "Sending…" : "Claim my free reel"}
        <span className="grid size-12 place-items-center rounded-full bg-ink-950 text-bone-50 transition-transform duration-500 group-hover:rotate-45">
          <ArrowUpRight className="size-5" />
        </span>
      </button>
    </form>
  );
}
