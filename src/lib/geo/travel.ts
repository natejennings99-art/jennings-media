/**
 * Travel-fee calculation from configurable service areas. Nothing here assumes a
 * specific city — every market is defined in the service_areas table.
 */
import type { ServiceArea, ServiceAreaPolicy } from "@/lib/types";
import { haversineMiles, normalizeCity } from "./distance";

export interface TravelInput {
  city: string;
  state: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
}

export interface TravelResult {
  feeCents: number;
  areaId: string | null;
  areaName: string | null;
  distanceMiles: number | null;
  outsideArea: boolean;
  rejected: boolean;
  message: string;
}

function roadMiles(area: ServiceArea, input: TravelInput, factor: number) {
  if (input.latitude === null || input.longitude === null) return null;
  if (area.center_latitude === null || area.center_longitude === null) return null;
  return haversineMiles(area.center_latitude, area.center_longitude, input.latitude, input.longitude) * factor;
}

function feeFor(area: ServiceArea, miles: number | null) {
  const billable = miles === null ? 0 : Math.max(0, miles - Number(area.free_miles || 0));
  return area.travel_fee_cents + Math.round(billable * area.per_mile_cents);
}

export function calculateTravel(areas: ServiceArea[], policy: ServiceAreaPolicy, input: TravelInput): TravelResult {
  const factor = policy.road_distance_factor > 0 ? policy.road_distance_factor : 1.25;
  const active = areas.filter((a) => a.is_active).sort((a, b) => a.priority - b.priority);
  const zip = input.postalCode.trim().slice(0, 5);
  const city = normalizeCity(input.city);
  const state = input.state.trim().toUpperCase();

  const byZip = active.find((a) => a.postal_codes.includes(zip));
  const byCity = active.find(
    (a) => (!a.state || a.state.toUpperCase() === state) && a.cities.map(normalizeCity).includes(city)
  );
  const byRadius = active.find((a) => {
    const miles = roadMiles(a, input, 1);
    return miles !== null && a.radius_miles !== null && miles <= Number(a.radius_miles);
  });
  const match = byZip ?? byCity ?? byRadius;

  if (match) {
    const miles = roadMiles(match, input, factor);
    const fee = feeFor(match, miles);
    return {
      feeCents: fee,
      areaId: match.id,
      areaName: match.name,
      distanceMiles: miles === null ? null : Math.round(miles * 10) / 10,
      outsideArea: false,
      rejected: false,
      message: fee > 0 ? `Travel fee for ${match.name}` : `Inside ${match.name} — no travel fee`,
    };
  }

  if (policy.outside_area_policy === "reject") {
    return {
      feeCents: 0,
      areaId: null,
      areaName: null,
      distanceMiles: null,
      outsideArea: true,
      rejected: true,
      message: "This address is outside our service area. Contact us for a custom quote.",
    };
  }

  const primary = active.find((a) => a.kind === "primary") ?? active[0];
  const miles = primary ? roadMiles(primary, input, factor) : null;
  const mileage = primary && miles !== null ? Math.round(Math.max(0, miles - Number(primary.free_miles || 0)) * primary.per_mile_cents) : 0;
  return {
    feeCents: policy.outside_area_fee_cents + mileage,
    areaId: null,
    areaName: null,
    distanceMiles: miles === null ? null : Math.round(miles * 10) / 10,
    outsideArea: true,
    rejected: false,
    message: "Outside our standard service area — an extended travel fee applies.",
  };
}
