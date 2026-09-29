import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { applyCheckoutSession } from "@/lib/booking/payments";
import { features, serverEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook. Verifies the signature against the raw body, de-duplicates by
 * event id and applies payments idempotently.
 * Events: checkout.session.completed, checkout.session.async_payment_succeeded,
 * checkout.session.async_payment_failed, checkout.session.expired, charge.refunded
 */
export async function POST(request: NextRequest) {
  if (!features.stripe || !serverEnv.stripeWebhookSecret || !features.supabaseAdmin) {
    return NextResponse.json({ error: "Stripe webhooks are not configured" }, { status: 503 });
  }
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature ?? "", serverEnv.stripeWebhookSecret);
  } catch (error) {
    console.warn("[stripe] invalid signature", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const db = createAdminClient();
  const { error: dupError } = await db.from("webhook_events").insert({ id: event.id, type: event.type });
  if (dupError) {
    if (dupError.code === "23505") return NextResponse.json({ received: true, duplicate: true });
    return NextResponse.json({ error: "Storage error" }, { status: 500 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await applyCheckoutSession(event.data.object as Stripe.Checkout.Session);
        break;
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await db.from("payments").update({ status: "failed" }).eq("stripe_checkout_session_id", session.id).eq("status", "pending");
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await db.from("payments").update({ status: "cancelled" }).eq("stripe_checkout_session_id", session.id).eq("status", "pending");
        await db.rpc("expire_stale_holds");
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const intent = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
        if (intent) {
          const { data: payment } = await db.from("payments").select("id, booking_id, amount_cents").eq("stripe_payment_intent_id", intent).maybeSingle();
          if (payment) {
            const refunded = Math.min(charge.amount_refunded, payment.amount_cents);
            await db
              .from("payments")
              .update({ refunded_cents: refunded, status: refunded >= payment.amount_cents ? "refunded" : "partially_refunded" })
              .eq("id", payment.id);
            if (payment.booking_id) await db.rpc("sync_booking_financials", { p_booking_id: payment.booking_id });
          }
        }
        break;
      }
      default:
        break;
    }
    await db.from("webhook_events").update({ processed_at: new Date().toISOString() }).eq("id", event.id);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`[stripe] ${event.type} failed`, error);
    // Allow Stripe to retry.
    await db.from("webhook_events").delete().eq("id", event.id);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
