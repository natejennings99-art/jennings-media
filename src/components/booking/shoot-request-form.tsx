"use client";

import { useActionState, useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { requestShoot } from "@/app/book/request-actions";
import { track } from "@/lib/analytics";
import type { ActionResult } from "@/lib/types";

const field = "w-full border-0 border-b border-white/15 bg-transparent px-0 py-4 text-[17px] text-bone-50 placeholder:text-mist-600 transition-colors focus:border-accent-300 focus:ring-0 focus:outline-none aria-[invalid=true]:border-red-400";
const label = "label text-mist-400";

/** Short shoot request (name, phone, email, address, timing): the whole thing takes about 30 seconds. */
export function ShootRequestForm({ pkg }: { pkg?: string }) {
  const [startedAt] = useState(() => Date.now());
  const [state, action, pending] = useActionState<ActionResult<{ name: string }> | null, FormData>(async (prev, form) => {
    const res = await requestShoot(prev, form);
    if (res.ok) track("contact_submit", { form: "shoot_request" });
    return res;
  }, null);
  const err = (k: string) => (state && !state.ok ? state.fieldErrors?.[k] : undefined);

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8" role="status">
        <span className="grid size-14 place-items-center rounded-full bg-accent-300 text-ink-950">
          <Check className="size-7" strokeWidth={2.5} />
        </span>
        <p className="mt-6 font-display text-[clamp(2rem,5vw,3.25rem)] text-bone-50">Thanks, {state.data.name}.</p>
        <p className="mt-3 max-w-md text-[16px] leading-relaxed text-mist-300">We&rsquo;ll text or call to confirm your shoot within one business day.</p>
      </div>
    );
  }

  const input = (name: string, text: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className={label}>{text}</span>
      <input name={name} className={field} aria-invalid={Boolean(err(name))} {...props} />
      {err(name) && <span className="mt-2 block text-[13px] text-red-300">{err(name)}</span>}
    </label>
  );

  return (
    <form action={action} className="space-y-8" noValidate>
      <input type="hidden" name="startedAt" value={startedAt} />
      <input type="hidden" name="pkg" value={pkg ?? ""} />
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Leave empty <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="grid gap-8 sm:grid-cols-2">
        {input("name", "Your name", { autoComplete: "name", required: true })}
        {input("phone", "Mobile", { type: "tel", autoComplete: "tel", required: true })}
      </div>
      <div className="grid gap-8 sm:grid-cols-2">
        {input("email", "Email", { type: "email", autoComplete: "email", required: true })}
        {input("when", "Preferred date / time", { placeholder: "e.g. Thu morning" })}
      </div>
      {input("address", "Property address", { autoComplete: "street-address", required: true })}
      {input("notes", "Anything else? (optional)", { placeholder: "Twilight, drone, 3D tour, lockbox…" })}
      {state && !state.ok && !state.fieldErrors && <p className="text-[14px] text-red-300">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        data-cursor="cta"
        className="group inline-flex h-14 items-center gap-3 rounded-full bg-accent-300 pr-2 pl-7 text-[14px] font-semibold tracking-[0.04em] text-ink-950 uppercase transition-colors hover:bg-bone-50 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Request this shoot"}
        <span className="grid size-10 place-items-center rounded-full bg-ink-950 text-bone-50 transition-transform duration-500 group-hover:rotate-45">
          <ArrowUpRight className="size-4" />
        </span>
      </button>
    </form>
  );
}
