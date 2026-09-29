import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { features } from "@/lib/env";
import { getCatalogStrict, getServiceAreas, getSettings } from "@/lib/data/public";
import { isSlotAvailable } from "@/lib/scheduling/availability";
import { dayRangeUtc, ymdOf } from "@/lib/scheduling/tz";
import type { Viewer } from "@/lib/auth/session";
import type { Customer, InvoiceLine } from "@/lib/types";
import { resolveDiscount, type DiscountResult } from "./discounts";
import { allowedPaymentOptions, quoteForAddress } from "./quote-server";
import { buildAvailabilityContext } from "./availability-server";
import { createCheckoutForBooking } from "./payments";
import type { BookingInput } from "./schema";

export type CreateBookingResult =
  | { ok: true; bookingId: string; orderNumber: string; redirectUrl: string; paid: boolean }
  | { ok: false; error: string; field?: string };

const fail = (error: string, field?: string): CreateBookingResult => ({ ok: false, error, field });

async function upsertCustomer(input: BookingInput, viewer: Viewer | null): Promise<Customer> {
  const db = createAdminClient();
  const c = input.customer;
  const billing = c.billing_same_as_property
    ? { line1: input.property.address_line1, city: input.property.city, state: input.property.state, postal_code: input.property.postal_code }
    : c.billing_address ?? null;
  const profile = {
    first_name: c.first_name,
    last_name: c.last_name,
    phone: c.phone,
    company: c.company,
    brokerage: c.brokerage,
    billing_address: billing,
    marketing_opt_in: c.marketing_opt_in,
    sms_opt_in: c.sms_opt_in,
  };

  // Signed-in customer booking with their own email: update their profile.
  if (viewer?.customer && viewer.customer.email.toLowerCase() === c.email) {
    const { data } = await db.from("customers").update(profile).eq("id", viewer.customer.id).select("*").single();
    return data as Customer;
  }

  const { data: existing } = await db.from("customers").select("*").ilike("email", c.email).maybeSingle();
  if (existing) {
    const current = existing as Customer;
    // Only fill blanks on records we can't verify ownership of.
    const patch = Object.fromEntries(
      Object.entries(profile).filter(([k, v]) => v !== null && v !== "" && !current[k as keyof Customer])
    );
    if (Object.keys(patch).length) await db.from("customers").update(patch).eq("id", current.id);
    return { ...current, ...patch } as Customer;
  }

  const { data, error } = await db
    .from("customers")
    .insert({ ...profile, email: c.email, user_id: viewer && viewer.user.email?.toLowerCase() === c.email ? viewer.user.id : null })
    .select("*")
    .single();
  if (error) throw new Error(`Could not save customer: ${error.message}`);
  return data as Customer;
}

async function upsertProperty(customerId: string, input: BookingInput, geo: { latitude: number; longitude: number } | null) {
  const db = createAdminClient();
  const p = input.property;
  const values = {
    customer_id: customerId,
    address_line1: p.address_line1,
    address_line2: p.address_line2,
    city: p.city,
    state: p.state,
    postal_code: p.postal_code,
    latitude: geo?.latitude ?? null,
    longitude: geo?.longitude ?? null,
    property_type: p.property_type,
    square_feet: p.square_feet,
    bedrooms: p.bedrooms ?? null,
    bathrooms: p.bathrooms ?? null,
    mls_number: p.mls_number,
    listing_status: p.listing_status ?? null,
  };
  const { data: existing } = await db
    .from("properties")
    .select("id")
    .eq("customer_id", customerId)
    .ilike("address_line1", p.address_line1)
    .eq("postal_code", p.postal_code)
    .maybeSingle();
  if (existing) {
    await db.from("properties").update(values).eq("id", existing.id);
    return existing.id as string;
  }
  const { data, error } = await db.from("properties").insert(values).select("id").single();
  if (error) throw new Error(`Could not save property: ${error.message}`);
  return data.id as string;
}

/**
 * Creates a booking end-to-end with authoritative server-side pricing and
 * availability checks. Returns where to send the customer next (Stripe Checkout
 * or the confirmation page).
 */
export async function createBooking(input: BookingInput, viewer: Viewer | null): Promise<CreateBookingResult> {
  if (!features.supabaseAdmin) {
    return fail("Online booking isn't connected yet. Please contact us to book — we'll get you on the calendar right away.");
  }
  const db = createAdminClient();
  const [catalog, settings, areas] = await Promise.all([getCatalogStrict(), getSettings(), getServiceAreas()]);

  // Discounts
  let discount: DiscountResult | null = null;
  if (input.promoCode) {
    discount = await resolveDiscount(db, input.promoCode, input.customer.email, settings);
    if (!discount.ok) return fail(discount.error, "promoCode");
  }

  // Pricing (with geocoded travel fee)
  const { quote, travel, geo } = await quoteForAddress({
    catalog,
    settings,
    areas,
    selection: input.selection,
    address: input.property,
    squareFeet: input.property.square_feet,
    discount,
  });
  if (travel.rejected) return fail(travel.message, "property.address_line1");
  if (quote.isEmpty) return fail("Choose at least one service.");
  if (discount?.ok && !quote.discountApplied && quote.discountNote) return fail(quote.discountNote, "promoCode");

  const stripeReady = features.stripe;
  const options = allowedPaymentOptions(settings, stripeReady);
  const paymentOption = quote.totalCents === 0 ? "later" : input.paymentOption;
  if (!options.includes(paymentOption)) return fail("That payment option isn't available.", "paymentOption");
  const payNow = paymentOption === "full" ? quote.totalCents : paymentOption === "deposit" ? quote.depositCents : 0;

  // Re-validate the chosen time against live availability
  let slot: { start: string; end: string } | null = null;
  let dayStart: Date | null = null;
  let dayEnd: Date | null = null;
  if (input.slotStart && quote.durationMinutes > 0) {
    const ymd = ymdOf(new Date(input.slotStart), settings.timezone);
    ({ start: dayStart, end: dayEnd } = dayRangeUtc(ymd, settings.timezone));
    const ctx = await buildAvailabilityContext({
      settings,
      durationMinutes: quote.durationMinutes,
      rules: quote.rules,
      latitude: geo?.latitude ?? null,
      longitude: geo?.longitude ?? null,
      fromIso: new Date(dayStart.getTime() - 86400000).toISOString(),
      toIso: new Date(dayEnd.getTime() + 86400000).toISOString(),
    });
    const available = isSlotAvailable(input.slotStart, ctx);
    if (!available) return fail("That time was just taken. Please choose another slot.", "slotStart");
    slot = { start: available.start, end: available.end };
  }

  const customer = await upsertCustomer(input, viewer);
  const propertyId = await upsertProperty(customer.id, input, geo ? { latitude: geo.latitude, longitude: geo.longitude } : null);

  const status = payNow > 0 || !slot ? "requested" : "confirmed";
  const flags = { outside_service_area: travel.outsideArea, travel_message: travel.message, geocoded: Boolean(geo) };

  const { data: booking, error: bookingError } = await db
    .from("bookings")
    .insert({
      customer_id: customer.id,
      property_id: propertyId,
      package_id: input.selection.packageId,
      status,
      source: "online",
      preferred_date: input.property.preferred_date ?? (slot ? ymdOf(new Date(slot.start), settings.timezone) : null),
      arrival_window: input.property.arrival_window ?? null,
      occupancy: input.property.occupancy,
      listing_status: input.property.listing_status ?? null,
      access_instructions: input.property.access_instructions,
      special_instructions: input.property.special_instructions,
      currency: settings.currency,
      subtotal_cents: quote.subtotalCents,
      discount_cents: quote.discountCents,
      travel_fee_cents: quote.travelFeeCents,
      tax_cents: quote.taxCents,
      total_cents: quote.totalCents,
      deposit_cents: paymentOption === "deposit" ? quote.depositCents : 0,
      payment_option: paymentOption,
      promo_code_id: discount?.ok && discount.kind === "promo" ? discount.promo.id : null,
      discount_label: quote.discountLabel,
      service_area_id: travel.areaId,
      travel_distance_miles: travel.distanceMiles,
      estimated_duration_minutes: quote.durationMinutes,
      website_enabled: quote.serviceIds.some((id) => catalog.services.find((s) => s.id === id)?.category === "web"),
      confirmed_at: status === "confirmed" ? new Date().toISOString() : null,
      metadata: flags,
    })
    .select("id, order_number, share_token")
    .single();
  if (bookingError || !booking) throw new Error(`Could not create booking: ${bookingError?.message}`);

  const rollback = async () => {
    await db.from("bookings").delete().eq("id", booking.id);
  };

  try {
    const { error: itemsError } = await db.from("booking_services").insert(
      quote.lines.map((l, i) => ({
        booking_id: booking.id,
        item_type: l.type,
        service_id: l.serviceId,
        package_id: l.packageId,
        add_on_id: l.addOnId,
        name: l.name,
        description: l.description,
        quantity: l.quantity,
        unit_price_cents: l.unitPriceCents,
        total_cents: l.totalCents,
        included_in_package: l.includedInPackage,
        sort_order: i,
      }))
    );
    if (itemsError) throw new Error(itemsError.message);

    if (slot && dayStart && dayEnd) {
      const photographers = await db.from("photographers").select("id", { count: "exact", head: true }).eq("is_active", true);
      const { error: reserveError } = await db.rpc("reserve_appointment", {
        p_booking_id: booking.id,
        p_starts_at: slot.start,
        p_ends_at: slot.end,
        p_day_start: dayStart.toISOString(),
        p_day_end: dayEnd.toISOString(),
        p_capacity: Math.max(1, photographers.count ?? 1),
        p_max_per_day: settings.scheduling.max_shoots_per_day,
        p_buffer_minutes: settings.scheduling.travel_buffer_minutes,
        p_kind: quote.rules.twilight ? "twilight" : "shoot",
        p_status: payNow > 0 ? "held" : "scheduled",
        p_hold_minutes: settings.scheduling.hold_minutes,
      });
      if (reserveError) {
        await rollback();
        return fail("That time was just taken. Please choose another slot.", "slotStart");
      }
    }

    const lines: InvoiceLine[] = quote.lines.map((l) => ({
      name: l.name,
      description: l.description,
      quantity: l.quantity,
      unit_price_cents: l.unitPriceCents,
      total_cents: l.totalCents,
      included: l.includedInPackage,
    }));
    const { error: invoiceError } = await db.from("invoices").insert({
      booking_id: booking.id,
      customer_id: customer.id,
      status: "open",
      currency: settings.currency,
      line_items: lines,
      subtotal_cents: quote.subtotalCents,
      discount_cents: quote.discountCents,
      travel_fee_cents: quote.travelFeeCents,
      tax_cents: quote.taxCents,
      total_cents: quote.totalCents,
      due_date: payNow > 0 ? ymdOf(new Date(), settings.timezone) : slot ? ymdOf(new Date(slot.start), settings.timezone) : null,
    });
    if (invoiceError) throw new Error(invoiceError.message);
  } catch (error) {
    await rollback();
    throw error;
  }

  // Discount bookkeeping
  if (discount?.ok && discount.kind === "promo" && quote.discountCents > 0) {
    await db.rpc("consume_promo_code", { p_promo_id: discount.promo.id });
    await db.from("promo_redemptions").insert({ promo_code_id: discount.promo.id, booking_id: booking.id, customer_id: customer.id, amount_cents: quote.discountCents });
  }
  if (discount?.ok && discount.kind === "referral" && discount.referrerId !== customer.id) {
    await db.from("referrals").upsert(
      {
        referrer_id: discount.referrerId,
        referred_customer_id: customer.id,
        referred_email: customer.email,
        booking_id: booking.id,
        referee_discount_cents: quote.discountCents,
      },
      { onConflict: "referred_customer_id", ignoreDuplicates: true }
    );
    await db.from("customers").update({ referred_by_id: discount.referrerId }).eq("id", customer.id).is("referred_by_id", null);
  }

  await db.from("booking_events").insert({
    booking_id: booking.id,
    type: "created",
    visibility: "customer",
    message: "Booking placed online",
    meta: { payment_option: paymentOption, total_cents: quote.totalCents, ...flags },
  });

  const confirmationPath = `/book/confirmation?id=${booking.id}&t=${booking.share_token}`;
  if (payNow > 0) {
    try {
      const url = await createCheckoutForBooking({
        bookingId: booking.id,
        kind: paymentOption === "deposit" ? "deposit" : "full",
        amountCents: payNow,
        successPath: confirmationPath,
        cancelPath: `/book?resume=1&cancelled=${booking.id}&t=${booking.share_token}`,
        holdMinutes: settings.scheduling.hold_minutes,
      });
      return { ok: true, bookingId: booking.id, orderNumber: booking.order_number, redirectUrl: url, paid: false };
    } catch (error) {
      console.error("[booking] checkout failed", error);
      await rollback();
      return fail("We couldn't start secure checkout. Please try again or choose another payment option.");
    }
  }

  return { ok: true, bookingId: booking.id, orderNumber: booking.order_number, redirectUrl: confirmationPath, paid: false };
}
