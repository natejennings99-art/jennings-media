import "server-only";
import { buildQuote, type Quote } from "@/lib/pricing/engine";
import { calculateTravel, type TravelResult } from "@/lib/geo/travel";
import { geocodeAddress, type GeocodeResult } from "@/lib/geo/geocode";
import type { BusinessSettings, Catalog, PaymentOption, ServiceArea } from "@/lib/types";
import type { DiscountResult } from "./discounts";
import type { SelectionInput } from "./schema";

export interface ServerQuote {
  quote: Quote;
  travel: TravelResult;
  geo: GeocodeResult | null;
  discount: DiscountResult | null;
}

export async function quoteForAddress(opts: {
  catalog: Catalog;
  settings: BusinessSettings;
  areas: ServiceArea[];
  selection: SelectionInput;
  address: { address_line1: string; city: string; state: string; postal_code: string };
  squareFeet: number | null;
  discount?: DiscountResult | null;
  geocode?: boolean;
}): Promise<ServerQuote> {
  const geo = opts.geocode === false ? null : await geocodeAddress({
    line1: opts.address.address_line1,
    city: opts.address.city,
    state: opts.address.state,
    postalCode: opts.address.postal_code,
  });
  const travel = calculateTravel(opts.areas, opts.settings.service_area_policy, {
    city: geo?.city ?? opts.address.city,
    state: geo?.state ?? opts.address.state,
    postalCode: geo?.postalCode ?? opts.address.postal_code,
    latitude: geo?.latitude ?? null,
    longitude: geo?.longitude ?? null,
  });
  const quote = buildQuote({
    catalog: opts.catalog,
    squareFeet: opts.squareFeet,
    packageId: opts.selection.packageId,
    serviceIds: opts.selection.serviceIds,
    serviceQuantities: opts.selection.serviceQuantities,
    addOns: opts.selection.addOns,
    travelFeeCents: travel.rejected ? 0 : travel.feeCents,
    discount: opts.discount && opts.discount.ok ? opts.discount.spec : null,
    taxRateBps: opts.settings.tax_rate_bps,
    taxTravelFee: opts.settings.tax_travel_fee,
    payment: opts.settings.payment_options,
    defaultDurationMinutes: opts.settings.scheduling.default_duration_minutes,
  });
  return { quote, travel, geo, discount: opts.discount ?? null };
}

export function allowedPaymentOptions(settings: BusinessSettings, stripeReady: boolean): PaymentOption[] {
  const p = settings.payment_options;
  const options: PaymentOption[] = [];
  if (stripeReady && p.allow_full) options.push("full");
  if (stripeReady && p.allow_deposit) options.push("deposit");
  if (p.allow_pay_later || !stripeReady) options.push("later");
  return options;
}
