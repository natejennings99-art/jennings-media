import "server-only";
import Stripe from "stripe";
import { env, serverEnv } from "@/lib/env";
import { BRAND } from "@/lib/brand";

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!serverEnv.stripeSecretKey) throw new Error("Stripe is not configured (STRIPE_SECRET_KEY).");
  client ??= new Stripe(serverEnv.stripeSecretKey, {
    appInfo: { name: BRAND.name, url: env.siteUrl },
    maxNetworkRetries: 2,
  });
  return client;
}
