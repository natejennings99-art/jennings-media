import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { features } from "@/lib/env";
import { safeNext } from "@/lib/auth/redirect";

export const metadata: Metadata = { title: "Sign in", robots: { index: false }, alternates: { canonical: "/login" } };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeNext(typeof params.next === "string" ? params.next : null);
  const email = typeof params.email === "string" ? params.email : "";
  const error = typeof params.error === "string" ? params.error : null;
  return <LoginForm next={next} initialEmail={email} configured={features.supabase} initialError={error} />;
}
