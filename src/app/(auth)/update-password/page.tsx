"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="animate-fade-up">
      <h1 className="text-3xl font-medium tracking-[-0.04em]">Choose a new password</h1>
      <form
        className="mt-8 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (password.length < 8) return setError("Use at least 8 characters.");
          start(async () => {
            const { error } = await createClient().auth.updateUser({ password });
            if (error) return setError(error.message);
            router.replace("/dashboard");
            router.refresh();
          });
        }}
      >
        <Field label="New password" htmlFor="password" hint="At least 8 characters.">
          <Input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {error && <p className="text-sm text-red-300">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={pending}>
          Update password
        </Button>
      </form>
    </div>
  );
}
