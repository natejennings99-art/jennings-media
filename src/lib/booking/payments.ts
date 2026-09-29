import "server-only";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import { env } from "@/lib/env";
import { getSettings } from "@/lib/data/public";
import { notifyBooking, brandOf, sendLogged } from "@/lib/notifications";
import { referralReward } from "@/lib/email/templates";
import { formatMoney, fullAddress } from "@/lib/utils";

type PaymentKind = "full" | "deposit" | "balance";

const KIND_LABEL: Record<PaymentKind, string> = { full: "Payment in full", deposit: "Booking deposit", balance: "Balance payment" };

/** Creates a Stripe Checkout Session for a booking and records a pending payment. */
export async function createCheckoutForBooking(opts: {
  bookingId: string;
  kind: PaymentKind;
  amountCents: number;
  successPath: string;
  cancelPath: string;
  holdMinutes?: number;
}) {
  const db = createAdminClient();
  const { data: booking, error } = await db
    .from("bookings")
    .select("id, order_number, currency, customer:customers(id, email, stripe_customer_id), property:properties(address_line1, address_line2, city, state, postal_code), invoices(id, status)")
    .eq("id", opts.bookingId)
    .single();
  if (error || !booking) throw new Error("Booking not found");
  const customer = booking.customer as unknown as { id: string; email: string; stripe_customer_id: string | null };
  const property = booking.property as unknown as { address_line1: string; address_line2: string | null; city: string; state: string; postal_code: string };
  const invoice = (booking.invoices as { id: string; status: string }[]).find((i) => i.status !== "void") ?? null;

  const amount = Math.max(50, Math.round(opts.amountCents));
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: booking.id,
    ...(customer.stripe_customer_id ? { customer: customer.stripe_customer_id } : { customer_email: customer.email, customer_creation: "always" as const }),
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: booking.currency,
          unit_amount: amount,
          product_data: { name: `${KIND_LABEL[opts.kind]} · ${booking.order_number}`, description: fullAddress(property) },
        },
      },
    ],
    metadata: { booking_id: booking.id, invoice_id: invoice?.id ?? "", payment_kind: opts.kind },
    payment_intent_data: {
      description: `Jennings Media order ${booking.order_number}`,
      metadata: { booking_id: booking.id, invoice_id: invoice?.id ?? "", payment_kind: opts.kind },
    },
    success_url: `${env.siteUrl}${opts.successPath}${opts.successPath.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.siteUrl}${opts.cancelPath}`,
    expires_at: Math.floor(Date.now() / 1000) + Math.max(30, opts.holdMinutes ?? 60) * 60,
  });

  await db.from("payments").insert({
    booking_id: booking.id,
    invoice_id: invoice?.id ?? null,
    customer_id: customer.id,
    kind: opts.kind,
    method: "card",
    provider: "stripe",
    status: "pending",
    amount_cents: amount,
    currency: booking.currency,
    stripe_checkout_session_id: session.id,
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return session.url;
}

/**
 * Applies a completed Checkout Session. Idempotent and race-safe: only the caller
 * that flips the payment row to "succeeded" performs side effects. Called from
 * the webhook and from the confirmation page (so customers see "paid" instantly).
 */
export async function applyCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return { applied: false };
  const bookingId = session.metadata?.booking_id;
  if (!bookingId) return { applied: false };
  const db = createAdminClient();
  const kind = (session.metadata?.payment_kind as PaymentKind) || "full";
  const intentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

  let receiptUrl: string | null = null;
  if (intentId) {
    try {
      const intent = await getStripe().paymentIntents.retrieve(intentId, { expand: ["latest_charge"] });
      const charge = intent.latest_charge as Stripe.Charge | null;
      receiptUrl = charge?.receipt_url ?? null;
    } catch {
      /* receipt link is optional */
    }
  }

  const values = {
    status: "succeeded",
    amount_cents: session.amount_total ?? 0,
    paid_at: new Date().toISOString(),
    stripe_payment_intent_id: intentId,
    receipt_url: receiptUrl,
  };
  const { data: flipped } = await db
    .from("payments")
    .update(values)
    .eq("stripe_checkout_session_id", session.id)
    .neq("status", "succeeded")
    .select("id");

  if (!flipped?.length) {
    const { data: existing } = await db.from("payments").select("id").eq("stripe_checkout_session_id", session.id).maybeSingle();
    if (existing) return { applied: false };
    const { data: booking } = await db.from("bookings").select("customer_id").eq("id", bookingId).single();
    const { error } = await db.from("payments").insert({
      ...values,
      booking_id: bookingId,
      invoice_id: session.metadata?.invoice_id || null,
      customer_id: booking?.customer_id ?? null,
      kind,
      method: "card",
      provider: "stripe",
      currency: session.currency ?? "usd",
      stripe_checkout_session_id: session.id,
    });
    if (error) return { applied: false };
  }

  await db.rpc("sync_booking_financials", { p_booking_id: bookingId });

  const stripeCustomer = typeof session.customer === "string" ? session.customer : session.customer?.id;
  const { data: booking } = await db.from("bookings").select("id, status, customer_id").eq("id", bookingId).single();
  if (stripeCustomer && booking) {
    await db.from("customers").update({ stripe_customer_id: stripeCustomer }).eq("id", booking.customer_id).is("stripe_customer_id", null);
  }

  let confirmedNow = false;
  if (booking?.status === "requested") {
    await db.from("bookings").update({ status: "confirmed", confirmed_at: new Date().toISOString() }).eq("id", bookingId).eq("status", "requested");
    await db.from("appointments").update({ status: "scheduled", hold_expires_at: null }).eq("booking_id", bookingId).eq("status", "held");
    confirmedNow = true;
  }

  await db.from("booking_events").insert({
    booking_id: bookingId,
    type: "payment",
    visibility: "customer",
    message: `${KIND_LABEL[kind]} of ${formatMoney(session.amount_total ?? 0, session.currency ?? "usd", { exact: true })} received`,
    meta: { session_id: session.id },
  });

  if (confirmedNow) {
    await notifyBooking("confirmed", bookingId);
    await notifyBooking("received", bookingId, { adminOnly: true });
  }
  await notifyBooking("payment_received", bookingId, { amountCents: session.amount_total ?? 0, receiptUrl });
  await qualifyReferral(bookingId, "paid");
  return { applied: true };
}

/** Marks a pending referral as rewarded and issues the referrer a reward code. */
export async function qualifyReferral(bookingId: string, trigger: "paid" | "delivered") {
  const settings = await getSettings();
  const program = settings.referral_program;
  if (!program.enabled || program.qualify_on !== trigger || program.referrer_reward_cents <= 0) return;
  const db = createAdminClient();
  const { data: referral } = await db
    .from("referrals")
    .select("id, referrer_id, status, referrer:customers!referrals_referrer_id_fkey(id, first_name, email), referred:customers!referrals_referred_customer_id_fkey(first_name)")
    .eq("booking_id", bookingId)
    .eq("status", "pending")
    .maybeSingle();
  if (!referral) return;

  const referrer = referral.referrer as unknown as { id: string; first_name: string; email: string };
  const referred = referral.referred as unknown as { first_name: string } | null;
  const code = `THANKS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const { data: promo } = await db
    .from("promo_codes")
    .insert({
      code,
      description: `Referral reward for booking ${bookingId}`,
      discount_type: "fixed",
      discount_value: program.referrer_reward_cents,
      usage_limit: 1,
      customer_id: referrer.id,
      source: "referral_reward",
    })
    .select("id")
    .single();
  const { data: updated } = await db
    .from("referrals")
    .update({ status: "rewarded", qualified_at: new Date().toISOString(), rewarded_at: new Date().toISOString(), reward_cents: program.referrer_reward_cents, reward_promo_code_id: promo?.id ?? null })
    .eq("id", referral.id)
    .eq("status", "pending")
    .select("id");
  if (updated?.length && referrer.email) {
    await sendLogged(
      "referral_reward",
      referrer.email,
      referralReward(brandOf(settings), {
        name: referrer.first_name,
        code,
        amount: formatMoney(program.referrer_reward_cents),
        referredName: referred?.first_name || "Your referral",
      }),
      { customerId: referrer.id }
    );
  }
}

/**
 * Customer backed out of Stripe Checkout: cancel the unpaid booking, release the
 * held time slot and expire any open sessions so they can rebook the same time.
 */
export async function releaseAbandonedBooking(bookingId: string, token: string) {
  const db = createAdminClient();
  const { data: booking } = await db
    .from("bookings")
    .select("id, status, amount_paid_cents")
    .eq("id", bookingId)
    .eq("share_token", token)
    .maybeSingle();
  if (!booking || booking.status !== "requested" || booking.amount_paid_cents > 0) return false;

  const { data: pending } = await db.from("payments").select("id, stripe_checkout_session_id").eq("booking_id", bookingId).eq("status", "pending");
  for (const p of pending ?? []) {
    if (p.stripe_checkout_session_id) {
      try {
        await getStripe().checkout.sessions.expire(p.stripe_checkout_session_id);
      } catch {
        /* already expired or completed */
      }
    }
  }
  // Re-check: if a session completed in the meantime, keep the booking.
  const { data: fresh } = await db.from("bookings").select("amount_paid_cents").eq("id", bookingId).single();
  if ((fresh?.amount_paid_cents ?? 0) > 0) return false;

  await db.from("payments").update({ status: "cancelled" }).eq("booking_id", bookingId).eq("status", "pending");
  await db.from("appointments").update({ status: "cancelled" }).eq("booking_id", bookingId).in("status", ["held", "scheduled"]);
  await db
    .from("bookings")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString(), cancellation_reason: "Checkout cancelled by customer" })
    .eq("id", bookingId)
    .eq("status", "requested");
  await db.from("promo_redemptions").delete().eq("booking_id", bookingId);
  return true;
}
