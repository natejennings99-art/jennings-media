"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, KeyRound, Mail, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";
import { BRAND } from "@/lib/brand";

type Mode = "signin" | "signup" | "link";

export function LoginForm({ next, initialEmail, configured, initialError }: { next: string; initialEmail: string; configured: boolean; initialError: string | null }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialEmail ? "link" : "signin");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initialError ? "That sign-in link is invalid or expired. Request a new one." : null);
  const [pending, start] = useTransition();

  const callback = (path: string) => `${window.location.origin}/auth/callback?next=${encodeURIComponent(path)}`;
  const done = () => {
    router.replace(next);
    router.refresh();
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const supabase = createClient();
    start(async () => {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) return setError(error.message === "Invalid login credentials" ? "Email or password is incorrect." : error.message);
        return done();
      }
      if (mode === "signup") {
        if (password.length < 8) return setError("Use at least 8 characters for your password.");
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim() }, emailRedirectTo: callback(next) },
        });
        if (error) return setError(error.message);
        track("sign_up");
        if (data.session) return done();
        return setMessage("Check your inbox to confirm your email, then you're in.");
      }
      if (!codeSent) {
        const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: callback(next), shouldCreateUser: true } });
        if (error) return setError(error.message);
        setCodeSent(true);
        return setMessage("We emailed you a sign-in link and a 6-digit code.");
      }
      const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
      if (error) return setError("That code is invalid or expired.");
      done();
    });
  }

  if (!configured) {
    return (
      <div>
        <h1 className="text-3xl font-medium tracking-[-0.04em]">Client login</h1>
        <p className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
          Authentication isn&rsquo;t connected yet. Add your Supabase keys to the environment (see README → Supabase setup) to enable sign-in.
        </p>
      </div>
    );
  }

  const tabs: { key: Mode; label: string; icon: typeof Mail }[] = [
    { key: "signin", label: "Password", icon: KeyRound },
    { key: "link", label: "Email link", icon: Sparkles },
  ];

  return (
    <div className="animate-fade-up">
      <h1 className="text-3xl font-medium tracking-[-0.04em] sm:text-4xl">{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
      <p className="mt-2 text-mist-400">{mode === "signup" ? "Track shoots, download media and pay invoices in one place." : "Sign in to your client dashboard."}</p>

      {mode !== "signup" && (
        <div className="mt-8 grid grid-cols-2 gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={mode === t.key}
              onClick={() => {
                setMode(t.key);
                setError(null);
                setMessage(null);
                setCodeSent(false);
              }}
              className={cn("flex h-10 items-center justify-center gap-2 rounded-full text-sm transition", mode === t.key ? "bg-bone-50 text-ink-950" : "text-mist-300 hover:text-bone-50")}
            >
              <t.icon className="size-4" /> {t.label}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="mt-8 space-y-5">
        {mode === "signup" && (
          <Field label="Full name" htmlFor="name">
            <Input id="name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
        )}
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={codeSent} />
        </Field>
        {mode !== "link" && (
          <Field
            label="Password"
            htmlFor="password"
            hint={
              mode === "signin" ? (
                <Link href="/forgot-password" className="text-accent-200 hover:underline">
                  Forgot password?
                </Link>
              ) : (
                "At least 8 characters."
              )
            }
          >
            <Input id="password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
        )}
        {mode === "link" && codeSent && (
          <Field label="6-digit code" htmlFor="code" hint="Or just tap the link in the email.">
            <Input id="code" inputMode="numeric" autoComplete="one-time-code" maxLength={10} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="font-mono tracking-[0.4em]" />
          </Field>
        )}

        {error && <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200" role="alert">{error}</p>}
        {message && <p className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{message}</p>}

        <Button type="submit" size="lg" className="w-full" loading={pending}>
          {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : codeSent ? "Verify code" : "Email me a sign-in link"}
          {!pending && <ArrowRight className="size-4" />}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-mist-400">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <button type="button" className="text-accent-200 hover:underline" onClick={() => setMode("signin")}>
              Sign in
            </button>
          </>
        ) : (
          <>
            New to {BRAND.name}?{" "}
            <button type="button" className="text-accent-200 hover:underline" onClick={() => setMode("signup")}>
              Create an account
            </button>
          </>
        )}
      </p>
    </div>
  );
}
