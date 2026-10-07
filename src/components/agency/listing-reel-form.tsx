"use client";

import { useActionState, useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { submitListingReel } from "@/app/(marketing)/free-listing-reel/actions";
import { LISTING_AREAS, LISTING_TIMING } from "@/lib/content/listing-reel";
import { track } from "@/lib/analytics";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/lib/types";
import { Chip, field } from "./inquiry-form";

const smsHref = BRAND.phoneHref.replace(/^tel:/, "sms:");

export function ListingReelForm() {
  const [startedAt] = useState(() => Date.now());
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [state, action, pending] = useActionState<ActionResult<{ name: string }> | null, FormData>(async (prev, form) => {
    setDraft(Object.fromEntries(["name", "brokerage", "address", "area", "timing", "instagram", "email", "phone", "notes"].map((k) => [k, String(form.get(k) ?? "").slice(0, 1200)])));
    const res = await submitListingReel(prev, form);
    if (res.ok) track("contact_submit", { form: "listing_reel" });
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
          We&rsquo;ll text you within one business day to pick a time. Listing goes live soon?{" "}
          <a href={smsHref} className="text-bone-50 underline underline-offset-4 hover:text-accent-300">
            Text {BRAND.phone}
          </a>{" "}
          and we&rsquo;ll move fast.
        </p>
        <ol className="mt-12 grid animate-fade-up gap-6 border-t border-white/10 pt-8 [animation-delay:320ms] sm:grid-cols-3">
          {["We text to pick a time", "We film the listing", "Your reel within 48 hours"].map((s, i) => (
            <li key={s}>
              <p className="font-mono text-sm text-accent-300">0{i + 1}</p>
              <p className="mt-2 text-[15px] text-bone-100">{s}</p>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  const input = (f: { name: string; label: string; auto: string; type: string; placeholder?: string; required?: boolean }) => (
    <div key={f.name}>
      <label htmlFor={`l-${f.name}`} className="label text-mist-500">
        {f.label}
      </label>
      <input id={`l-${f.name}`} name={f.name} type={f.type} autoComplete={f.auto} placeholder={f.placeholder} className={field} aria-invalid={Boolean(err(f.name))} required={f.required} />
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

      <div className="grid gap-x-10 gap-y-2 sm:grid-cols-2">
        {input({ name: "name", label: "Your name", auto: "name", type: "text", required: true })}
        {input({ name: "brokerage", label: "Brokerage (optional)", auto: "organization", type: "text" })}
      </div>

      {input({ name: "address", label: "Listing address", auto: "street-address", type: "text", placeholder: "Street, city", required: true })}

      <fieldset>
        <legend className="label mb-4 text-mist-500">Area</legend>
        <div className="flex flex-wrap gap-2">
          {LISTING_AREAS.map((a) => (
            <Chip key={a} name="area" value={a} type="radio" />
          ))}
        </div>
        {err("area") && <p className="mt-2 text-[13px] text-red-300">{err("area")}</p>}
      </fieldset>

      <fieldset>
        <legend className="label mb-4 text-mist-500">When does it go live?</legend>
        <div className="flex flex-wrap gap-2">
          {LISTING_TIMING.map((t) => (
            <Chip key={t} name="timing" value={t} type="radio" />
          ))}
        </div>
      </fieldset>

      <div className="grid gap-x-10 gap-y-2 sm:grid-cols-3">
        {input({ name: "phone", label: "Mobile", auto: "tel", type: "tel" })}
        {input({ name: "email", label: "Email", auto: "email", type: "email" })}
        {input({ name: "instagram", label: "Instagram (optional)", auto: "off", type: "text", placeholder: "@you" })}
        <p className="text-[13px] text-mist-500 sm:col-span-3">Mobile or email — we usually text to schedule.</p>
      </div>

      <div>
        <label htmlFor="l-notes" className="label text-mist-500">
          Anything we should know? (optional)
        </label>
        <textarea id="l-notes" name="notes" rows={3} className={cn(field, "resize-none")} placeholder="Pool, water view, lockbox, a photo shoot already booked…" aria-invalid={Boolean(err("notes"))} />
        {err("notes") && <p className="mt-2 text-[13px] text-red-300">{err("notes")}</p>}
      </div>

      {state && !state.ok && !state.fieldErrors && (
        <div className="space-y-3">
          <p className="text-[14px] text-red-300">{state.error}</p>
          {BRAND.email && (
            <a
              className="inline-block text-[14px] text-bone-50 underline underline-offset-4 hover:text-accent-300"
              href={`mailto:${BRAND.email}?subject=${encodeURIComponent(`Free listing reel — ${draft.address || draft.name || "my listing"}`)}&body=${encodeURIComponent(
                [`Name: ${draft.name}`, `Brokerage: ${draft.brokerage}`, `Listing: ${draft.address}`, `Area: ${draft.area}`, `Goes live: ${draft.timing || "Not sure yet"}`, `Phone: ${draft.phone}`, `Email: ${draft.email}`, `Instagram: ${draft.instagram}`, "", draft.notes].join("\n")
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
