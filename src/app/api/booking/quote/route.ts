import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCatalog, getServiceAreas, getSettings } from "@/lib/data/public";
import { quoteForAddress, allowedPaymentOptions } from "@/lib/booking/quote-server";
import { resolveDiscount, type DiscountResult } from "@/lib/booking/discounts";
import { selectionSchema } from "@/lib/booking/schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { features } from "@/lib/env";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  selection: selectionSchema,
  squareFeet: z.coerce.number().int().min(0).max(100000).nullable(),
  address: z.object({
    address_line1: z.string().min(1).max(160),
    city: z.string().min(1).max(80),
    state: z.string().min(2).max(2),
    postal_code: z.string().min(5).max(10),
  }),
  promoCode: z.string().max(40).nullable().optional(),
  email: z.string().max(254).nullable().optional(),
});

/** Authoritative quote: travel fee from the geocoded address, discount validation, tax. */
export async function POST(request: NextRequest) {
  if (!rateLimit(`quote:${await clientIp()}`, 60, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { selection, squareFeet, address, promoCode, email } = parsed.data;
  const [catalog, settings, areas] = await Promise.all([getCatalog(), getSettings(), getServiceAreas()]);

  let discount: DiscountResult | null = null;
  if (promoCode && features.supabaseAdmin) {
    discount = await resolveDiscount(createAdminClient(), promoCode, email ?? null, settings);
  }
  const { quote, travel } = await quoteForAddress({ catalog, settings, areas, selection, address, squareFeet, discount });

  return NextResponse.json(
    {
      quote,
      travel: { feeCents: travel.feeCents, message: travel.message, outsideArea: travel.outsideArea, rejected: travel.rejected, areaName: travel.areaName },
      discount: discount ? (discount.ok ? { ok: true, label: discount.spec.label } : { ok: false, error: discount.error }) : null,
      paymentOptions: allowedPaymentOptions(settings, features.stripe),
      taxLabel: settings.tax_label,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
