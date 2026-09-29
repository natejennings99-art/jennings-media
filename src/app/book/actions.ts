"use server";

import { after } from "next/server";
import { bookingInputSchema, fieldErrors } from "@/lib/booking/schema";
import { createBooking } from "@/lib/booking/create";
import { resolveDiscount } from "@/lib/booking/discounts";
import { notifyBooking } from "@/lib/notifications";
import { getViewer } from "@/lib/auth/session";
import { getSettings } from "@/lib/data/public";
import { createAdminClient } from "@/lib/supabase/admin";
import { features } from "@/lib/env";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import type { ActionResult } from "@/lib/types";

export async function submitBooking(raw: unknown): Promise<ActionResult<{ redirectUrl: string; bookingId: string; orderNumber: string }>> {
  const parsed = bookingInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Please review the highlighted details.", fieldErrors: fieldErrors(parsed.error) };
  }
  if (parsed.data.website) return { ok: false, error: "Something went wrong. Please try again." };

  const ip = await clientIp();
  if (!rateLimit(`book:${ip}`, 8, 10 * 60 * 1000)) {
    return { ok: false, error: "Too many attempts. Please wait a few minutes and try again." };
  }

  try {
    const viewer = await getViewer();
    const result = await createBooking(parsed.data, viewer);
    if (!result.ok) {
      return { ok: false, error: result.error, fieldErrors: result.field ? { [result.field]: result.error } : undefined };
    }
    if (result.redirectUrl.startsWith("/")) {
      after(() => notifyBooking("received", result.bookingId));
    }
    return { ok: true, data: { redirectUrl: result.redirectUrl, bookingId: result.bookingId, orderNumber: result.orderNumber } };
  } catch (error) {
    console.error("[submitBooking]", error);
    return { ok: false, error: "We couldn't complete your booking. Please try again — you haven't been charged." };
  }
}

export async function checkPromoCode(code: string, email: string | null): Promise<ActionResult<{ label: string; type: "percent" | "fixed"; value: number; minSubtotalCents: number; maxCents: number | null }>> {
  const ip = await clientIp();
  if (!rateLimit(`promo:${ip}`, 20, 10 * 60 * 1000)) return { ok: false, error: "Too many attempts. Try again shortly." };
  if (!features.supabaseAdmin) return { ok: false, error: "Codes can't be applied until booking is connected." };
  const result = await resolveDiscount(createAdminClient(), String(code ?? "").slice(0, 40), email ? String(email).slice(0, 254) : null, await getSettings());
  if (!result.ok) return { ok: false, error: result.error };
  return {
    ok: true,
    data: {
      label: result.spec.label,
      type: result.spec.type,
      value: result.spec.value,
      minSubtotalCents: result.spec.minSubtotalCents ?? 0,
      maxCents: result.spec.maxCents ?? null,
    },
  };
}
