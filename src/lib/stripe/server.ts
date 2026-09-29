import "server-only";
import Stripe from "stripe";
import { serverEnv } from "@/lib/env";

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!serverEnv.stripeSecretKey) throw new Error("Stripe is not configured (STRIPE_SECRET_KEY).");
  client ??= new Stripe(serverEnv.stripeSecretKey, {
    appInfo: { name: "Jennings Media", url: "https://jenningsmedia.com" },
    maxNetworkRetries: 2,
  });
  return client;
}
