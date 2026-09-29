import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCatalog, getSettings } from "@/lib/data/public";
import { buildQuote } from "@/lib/pricing/engine";
import { getAvailabilityRange } from "@/lib/scheduling/availability";
import { addDaysYmd, dayRangeUtc, isYmd, todayYmd } from "@/lib/scheduling/tz";
import { geocodeAddress } from "@/lib/geo/geocode";
import { buildAvailabilityContext } from "@/lib/booking/availability-server";
import { selectionSchema } from "@/lib/booking/schema";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  selection: selectionSchema,
  squareFeet: z.coerce.number().int().min(0).max(100000).nullable(),
  address: z.object({ line1: z.string().max(160), city: z.string().max(80), state: z.string().max(2), postalCode: z.string().max(10) }).partial().optional(),
  from: z.string().refine(isYmd),
  days: z.number().int().min(1).max(62),
});

export async function POST(request: NextRequest) {
  if (!rateLimit(`avail:${await clientIp()}`, 90, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { selection, squareFeet, address, days } = parsed.data;

  const [catalog, settings] = await Promise.all([getCatalog(), getSettings()]);
  const quote = buildQuote({ catalog, squareFeet, ...selection, defaultDurationMinutes: settings.scheduling.default_duration_minutes });
  if (quote.durationMinutes === 0) {
    return NextResponse.json({ onSite: false, days: [], durationMinutes: 0, rules: quote.rules, timezone: settings.timezone });
  }

  const geo =
    address?.line1 && address.city && address.state && address.postalCode
      ? await geocodeAddress({ line1: address.line1, city: address.city, state: address.state, postalCode: address.postalCode })
      : null;

  const today = todayYmd(settings.timezone);
  const from = parsed.data.from < today ? today : parsed.data.from;
  const fromIso = dayRangeUtc(from, settings.timezone).start.toISOString();
  const toIso = dayRangeUtc(addDaysYmd(from, days), settings.timezone).start.toISOString();
  const ctx = await buildAvailabilityContext({
    settings,
    durationMinutes: quote.durationMinutes,
    rules: quote.rules,
    latitude: geo?.latitude ?? null,
    longitude: geo?.longitude ?? null,
    fromIso,
    toIso,
  });

  return NextResponse.json(
    {
      onSite: true,
      timezone: settings.timezone,
      durationMinutes: quote.durationMinutes,
      rules: quote.rules,
      days: getAvailabilityRange(from, days, ctx),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
