"use server";

import { redirect } from "next/navigation";
import type Stripe from "stripe";
import { env, features } from "@/lib/env";
import { getStripe } from "@/lib/stripe/server";
import { BRAND } from "@/lib/brand";
import { findPlan } from "@/lib/content/plans";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** Retainers → Stripe subscription checkout; packages → one-time checkout with an invoice. */
export async function checkoutPlan(form: FormData) {
  const plan = findPlan(String(form.get("plan") ?? ""));
  if (!plan) redirect("/plans?status=error");
  if (!features.stripe) redirect("/plans?status=unavailable");
  if (!rateLimit(`plans:${await clientIp()}`, 12, 60 * 60 * 1000)) redirect("/plans?status=error");

  const recurring = plan.interval === "month";
  const metadata = { kind: recurring ? "retainer" : "package", plan: plan.slug };
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: recurring ? "subscription" : "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: plan.price * 100,
          ...(recurring ? { recurring: { interval: "month" } } : {}),
          product_data: { name: `${BRAND.name} — ${plan.name}${recurring ? " retainer" : ""}`, description: plan.tagline },
        },
      },
    ],
    metadata,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    success_url: `${env.siteUrl}/plans?status=success&plan=${plan.slug}`,
    cancel_url: `${env.siteUrl}/plans?status=cancelled`,
  };
  if (recurring) params.subscription_data = { metadata };
  else {
    params.payment_intent_data = { metadata };
    params.customer_creation = "always";
    params.invoice_creation = { enabled: true };
  }

  let url: string | null = null;
  try {
    url = (await getStripe().checkout.sessions.create(params)).url;
  } catch (e) {
    console.error("[plans]", e instanceof Error ? e.message : e);
  }
  redirect(url ?? "/plans?status=error");
}
