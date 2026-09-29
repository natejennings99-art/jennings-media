import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { applyCheckoutSession } from "@/lib/booking/payments";
import { features, serverEnv } from "@/lib/env";
import { adminRecipients, brandOf, sendLogged } from "@/lib/notifications";
import { adminEvent } from "@/lib/email/templates";
import { getSettings } from "@/lib/data/public";
import { findPlan } from "@/lib/content/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook. Verifies the signature against the raw body, de-duplicates by
 * event id and applies payments idempotently.
 * Events: checkout.session.completed, checkout.session.async_payment_succeeded,
 * checkout.session.async_payment_failed, checkout.session.expired, charge.refunded
 */
/** Custom-amount payments from /pay aren't bookings — just tell the owner the money arrived. */
async function notifyAgencyPayment(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return;
  const settings = await getSettings();
  const amount = new Intl.NumberFormat("en-US", { style: "currency", currency: (session.currency ?? "usd").toUpperCase() }).format((session.amount_total ?? 0) / 100);
  const payer = session.customer_details?.email ?? session.customer_email ?? "";
  const kind = session.metadata?.kind;
  const plan = findPlan(session.metadata?.plan);
  const title = kind === "retainer" ? `New retainer — ${plan?.name ?? "plan"} (${amount}/mo)` : kind === "package" ? `Package purchased — ${plan?.name ?? "package"} (${amount})` : `Payment received — ${amount}`;
  await sendLogged(
    kind === "agency_payment" ? "admin_payment_received" : `admin_${kind}_purchased`,
    adminRecipients(settings),
    adminEvent(brandOf(settings), title, [`From: ${session.customer_details?.name ?? session.metadata?.name ?? ""} ${payer ? `<${payer}>` : ""}`, `For: ${plan?.name ?? session.metadata?.reference ?? ""}`], "https://dashboard.stripe.com/payments"),
    { replyTo: payer || undefined }
  );
}

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
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (["agency_payment", "retainer", "package"].includes(session.metadata?.kind ?? "")) await notifyAgencyPayment(session);
        else await applyCheckoutSession(session);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        if (sub.metadata?.kind === "retainer") {
          const settings = await getSettings();
          const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
          await sendLogged("admin_retainer_cancelled", adminRecipients(settings), adminEvent(brandOf(settings), `Retainer cancelled — ${findPlan(sub.metadata.plan)?.name ?? "plan"}`, [`Customer: ${customer}`], `https://dashboard.stripe.com/customers/${customer}`));
        }
        break;
      }
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
