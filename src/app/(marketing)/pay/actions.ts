"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { clean, optionalClean } from "@/lib/booking/schema";
import { env, features } from "@/lib/env";
import { getStripe } from "@/lib/stripe/server";
import { getSettings } from "@/lib/data/public";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { BRAND } from "@/lib/brand";
import type { ActionResult } from "@/lib/types";

const schema = z.object({
  name: clean(120).pipe(z.string().min(2, "Enter your name")),
  email: clean(254).transform((s) => s.toLowerCase()).pipe(z.email("Enter a valid email")),
  amount: z.coerce.number({ error: "Enter an amount" }).min(1, "The minimum is $1").max(50000, "For payments over $50,000, contact us"),
  reference: clean(140).pipe(z.string().min(2, "Tell us what this payment is for")),
  note: optionalClean(500),
});

/** Custom-amount payments (invoices, deposits, retainers) through Stripe Checkout. */
export async function startPayment(_: unknown, form: FormData): Promise<ActionResult<never>> {
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]));
    return { ok: false, error: "A few details need attention.", fieldErrors };
  }
  const settings = await getSettings();
  if (!features.stripe) return { ok: false, error: `Online payments aren't switched on yet — email ${settings.email || BRAND.email} and we'll send you a payment link.` };
  const ip = await clientIp();
  if (!rateLimit(`pay:${ip}`, 10, 60 * 60 * 1000)) return { ok: false, error: "Too many attempts — please try again in a little while." };

  const d = parsed.data;
  const meta = { kind: "agency_payment", name: d.name, reference: d.reference };
  let url: string | null = null;
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: d.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(d.amount * 100),
            product_data: { name: `${BRAND.name} — ${d.reference}`, ...(d.note ? { description: d.note } : {}) },
          },
        },
      ],
      payment_intent_data: { receipt_email: d.email, description: `${BRAND.name}: ${d.reference}`, metadata: meta },
      metadata: meta,
      success_url: `${env.siteUrl}/pay?status=paid`,
      cancel_url: `${env.siteUrl}/pay?status=cancelled`,
    });
    url = session.url;
  } catch (e) {
    console.error("[pay]", e instanceof Error ? e.message : e);
  }
  if (!url) return { ok: false, error: "We couldn't start checkout. Please try again." };
  redirect(url);
}
