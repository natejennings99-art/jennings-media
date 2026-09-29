import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DiscountSpec } from "@/lib/pricing/engine";
import type { BusinessSettings, PromoCode } from "@/lib/types";

export type DiscountResult =
  | { ok: true; spec: DiscountSpec; kind: "promo"; promo: PromoCode }
  | { ok: true; spec: DiscountSpec; kind: "referral"; referrerId: string; referrerName: string }
  | { ok: false; error: string };

async function priorBookings(db: SupabaseClient, email: string) {
  const { data: customer } = await db.from("customers").select("id").ilike("email", email).maybeSingle();
  if (!customer) return { customerId: null as string | null, count: 0 };
  const { count } = await db
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", customer.id)
    .neq("status", "cancelled");
  return { customerId: customer.id as string, count: count ?? 0 };
}

/** Validates a promo or referral code for a given customer email. */
export async function resolveDiscount(db: SupabaseClient, rawCode: string, email: string | null, settings: BusinessSettings): Promise<DiscountResult> {
  const code = rawCode.trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,40}$/.test(code)) return { ok: false, error: "That code isn't valid." };
  const normalizedEmail = email?.trim().toLowerCase() || null;

  const { data: promo } = await db.from("promo_codes").select("*").eq("code", code).maybeSingle();
  if (promo) {
    const p = promo as PromoCode;
    const now = Date.now();
    if (!p.is_active) return { ok: false, error: "This code is no longer active." };
    if (p.starts_at && new Date(p.starts_at).getTime() > now) return { ok: false, error: "This code isn't active yet." };
    if (p.expires_at && new Date(p.expires_at).getTime() <= now) return { ok: false, error: "This code has expired." };
    if (p.usage_limit !== null && p.usage_count >= p.usage_limit) return { ok: false, error: "This code has reached its usage limit." };
    if (p.customer_id || p.first_booking_only || p.per_customer_limit) {
      if (!normalizedEmail) return { ok: false, error: "Enter your email first so we can verify this code." };
      const { customerId, count } = await priorBookings(db, normalizedEmail);
      if (p.customer_id && p.customer_id !== customerId) return { ok: false, error: "This code belongs to a different account." };
      if (p.first_booking_only && count > 0) return { ok: false, error: "This code is for first-time clients." };
      if (p.per_customer_limit && customerId) {
        const { count: used } = await db
          .from("promo_redemptions")
          .select("id", { count: "exact", head: true })
          .eq("promo_code_id", p.id)
          .eq("customer_id", customerId);
        if ((used ?? 0) >= p.per_customer_limit) return { ok: false, error: "You've already used this code." };
      }
    }
    return {
      ok: true,
      kind: "promo",
      promo: p,
      spec: {
        label: p.code,
        type: p.discount_type,
        value: p.discount_value,
        maxCents: p.max_discount_cents,
        minSubtotalCents: p.min_subtotal_cents,
        promoCodeId: p.id,
      },
    };
  }

  const program = settings.referral_program;
  if (program.enabled) {
    const { data: referrer } = await db.from("customers").select("id, first_name, email").eq("referral_code", code).maybeSingle();
    if (referrer) {
      if (normalizedEmail && referrer.email.toLowerCase() === normalizedEmail) return { ok: false, error: "You can't use your own referral code." };
      if (normalizedEmail) {
        const { count } = await priorBookings(db, normalizedEmail);
        if (count > 0) return { ok: false, error: "Referral codes are for first-time clients." };
      }
      return {
        ok: true,
        kind: "referral",
        referrerId: referrer.id,
        referrerName: referrer.first_name || "a friend",
        spec: {
          label: `Referral from ${referrer.first_name || "a friend"}`,
          type: program.referee_discount_type,
          value: program.referee_discount_value,
          referralCustomerId: referrer.id,
        },
      };
    }
  }
  return { ok: false, error: "We couldn't find that code." };
}
