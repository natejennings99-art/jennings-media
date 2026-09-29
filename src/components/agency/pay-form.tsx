"use client";

import { useActionState, useState } from "react";
import { ArrowUpRight, Lock } from "lucide-react";
import { startPayment } from "@/app/(marketing)/pay/actions";
import { cn } from "@/lib/utils";

const field = "mt-2 w-full rounded-md border border-white/10 bg-white/[0.03] px-4 py-3.5 text-[16px] text-bone-50 placeholder:text-mist-600 transition focus:border-accent-300 focus:outline-none";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label text-mist-400">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-[13px] text-accent-200">{error}</span>}
    </label>
  );
}

export function PayForm({ enabled, email, cancelled }: { enabled: boolean; email: string; cancelled: boolean }) {
  const [state, action, pending] = useActionState(startPayment, null);
  const [amount, setAmount] = useState("");
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={action} className="space-y-6">
      {cancelled && <p className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 text-[14px] text-mist-300">Checkout was cancelled — nothing was charged.</p>}
      {!enabled && (
        <p className="rounded-md border border-accent-300/30 bg-accent-300/10 px-4 py-3 text-[14px] text-bone-100">
          Online payments are being switched on. Until then, email <a className="underline" href={`mailto:${email}`}>{email}</a> for a payment link.
        </p>
      )}
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Your name" error={errors.name}>
          <input name="name" required autoComplete="name" className={field} />
        </Field>
        <Field label="Email for your receipt" error={errors.email}>
          <input name="email" type="email" required autoComplete="email" className={field} />
        </Field>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Amount (USD)" error={errors.amount}>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-4 mt-1 -translate-y-1/2 text-mist-400">$</span>
            <input name="amount" inputMode="decimal" required placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} className={cn(field, "pl-8 tabular-nums")} />
          </div>
        </Field>
        <Field label="What's it for?" error={errors.reference}>
          <input name="reference" required placeholder="Invoice #, project or deposit" className={field} />
        </Field>
      </div>
      <Field label="Note (optional)" error={errors.note}>
        <textarea name="note" rows={3} className={field} />
      </Field>
      {state && !state.ok && <p className="text-[14px] text-accent-200" role="alert">{state.error}</p>}
      <div className="flex flex-wrap items-center gap-5">
        <button
          type="submit"
          disabled={pending || !enabled}
          data-cursor="cta"
          className="group inline-flex h-14 items-center gap-3 rounded-full bg-accent-300 pr-2 pl-7 text-[14px] font-semibold tracking-[0.04em] text-ink-950 uppercase transition-colors hover:bg-bone-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Opening checkout…" : "Continue to secure checkout"}
          <span className="grid size-10 place-items-center rounded-full bg-ink-950 text-bone-50 transition-transform duration-500 group-hover:rotate-45">
            <ArrowUpRight className="size-4" />
          </span>
        </button>
        <span className="flex items-center gap-2 text-[13px] text-mist-500">
          <Lock className="size-3.5" /> Card, Apple Pay & Google Pay via Stripe
        </span>
      </div>
    </form>
  );
}
