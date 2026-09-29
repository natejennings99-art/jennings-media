"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="animate-fade-up">
      <h1 className="text-3xl font-medium tracking-[-0.04em]">Reset your password</h1>
      <p className="mt-2 text-mist-400">We&rsquo;ll email you a secure link to choose a new one.</p>
      {sent ? (
        <p className="mt-8 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">If an account exists for {email}, a reset link is on its way.</p>
      ) : (
        <form
          className="mt-8 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!supabaseConfigured) return setError("Authentication isn't configured yet.");
            start(async () => {
              const { error } = await createClient().auth.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
              });
              if (error) setError(error.message);
              else setSent(true);
            });
          }}
        >
          <Field label="Email" htmlFor="email">
            <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <Button type="submit" size="lg" className="w-full" loading={pending}>
            Send reset link
          </Button>
        </form>
      )}
      <Link href="/login" className="mt-8 inline-block text-sm text-accent-200 hover:underline">
        ← Back to sign in
      </Link>
    </div>
  );
}
