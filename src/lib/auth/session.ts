import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { features, serverEnv } from "@/lib/env";
import type { Customer } from "@/lib/types";

export interface Viewer {
  user: User;
  isAdmin: boolean;
  adminRole: "owner" | "admin" | "staff" | null;
  customer: Customer | null;
}

/**
 * The signed-in user (verified with Supabase Auth), their admin membership and
 * their CRM customer record. Memoised per request.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  if (!features.supabase) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let { data: admin } = await supabase.from("admins").select("role, is_active").eq("user_id", user.id).maybeSingle();

  // Optional bootstrap: verified emails in ADMIN_BOOTSTRAP_EMAILS become owners on first sign-in.
  const email = user.email?.toLowerCase();
  if (!admin && email && user.email_confirmed_at && serverEnv.adminBootstrapEmails.includes(email) && features.supabaseAdmin) {
    const svc = createAdminClient();
    await svc.from("users").upsert({ id: user.id, email }, { onConflict: "id", ignoreDuplicates: true });
    const { data } = await svc
      .from("admins")
      .upsert({ user_id: user.id, role: "owner", is_active: true }, { onConflict: "user_id" })
      .select("role, is_active")
      .single();
    admin = data;
  }

  const isAdmin = Boolean(admin?.is_active);
  let customer: Customer | null = null;
  if (!isAdmin) {
    const { data: customerId } = await supabase.rpc("claim_customer_profile");
    if (customerId) {
      const { data } = await supabase.from("customers").select("*").eq("id", customerId).maybeSingle();
      customer = (data as Customer | null) ?? null;
    }
  }

  return { user, isAdmin, adminRole: isAdmin ? (admin?.role as Viewer["adminRole"]) : null, customer };
});

export async function requireUser(next = "/dashboard") {
  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=${encodeURIComponent(next)}`);
  return viewer;
}

/** For customer pages. Admins are sent to their own dashboard. */
export async function requireCustomer(next = "/dashboard") {
  const viewer = await requireUser(next);
  if (viewer.isAdmin && !viewer.customer) redirect("/admin");
  const supabase = await createClient();
  return { viewer, customer: viewer.customer, supabase };
}

export async function requireAdmin(next = "/admin") {
  const viewer = await requireUser(next);
  if (!viewer.isAdmin) redirect("/dashboard");
  const supabase = await createClient();
  return { viewer, supabase };
}

export class AuthorizationError extends Error {
  constructor(message = "You don't have permission to do that.") {
    super(message);
  }
}

/** For Server Actions: throws instead of redirecting. */
export async function assertAdmin() {
  const viewer = await getViewer();
  if (!viewer?.isAdmin) throw new AuthorizationError();
  const supabase = await createClient();
  return { viewer, supabase };
}
