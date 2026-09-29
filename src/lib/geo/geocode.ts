import "server-only";
import { serverEnv } from "@/lib/env";

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  provider: "google" | "census";
}

export interface AddressInput {
  line1: string;
  city: string;
  state: string;
  postalCode: string;
}

const TIMEOUT_MS = 4500;

async function fetchJson(url: string) {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), cache: "force-cache" });
  if (!res.ok) throw new Error(`Geocoder responded ${res.status}`);
  return res.json();
}

/** Google Geocoding (when GOOGLE_MAPS_API_KEY is set). */
async function geocodeGoogle(address: string, key: string): Promise<GeocodeResult | null> {
  const data = await fetchJson(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${encodeURIComponent(key)}`
  );
  const hit = data?.results?.[0];
  if (!hit) return null;
  const component = (type: string, short = false) => {
    const c = hit.address_components?.find((x: { types: string[] }) => x.types.includes(type));
    return c ? (short ? c.short_name : c.long_name) : null;
  };
  return {
    latitude: hit.geometry.location.lat,
    longitude: hit.geometry.location.lng,
    city: component("locality") ?? component("sublocality") ?? null,
    state: component("administrative_area_level_1", true),
    postalCode: component("postal_code"),
    provider: "google",
  };
}

/** U.S. Census Bureau geocoder — free, no key, U.S. addresses only. */
async function geocodeCensus(address: string): Promise<GeocodeResult | null> {
  const data = await fetchJson(
    `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(address)}&benchmark=Public_AR_Current&format=json`
  );
  const match = data?.result?.addressMatches?.[0];
  if (!match) return null;
  return {
    latitude: match.coordinates.y,
    longitude: match.coordinates.x,
    city: match.addressComponents?.city ?? null,
    state: match.addressComponents?.state ?? null,
    postalCode: match.addressComponents?.zip ?? null,
    provider: "census",
  };
}

/** Best-effort geocoding. Never throws; returns null when the address can't be resolved. */
export async function geocodeAddress(input: AddressInput): Promise<GeocodeResult | null> {
  const address = `${input.line1}, ${input.city}, ${input.state} ${input.postalCode}`;
  try {
    const key = serverEnv.googleMapsApiKey;
    if (key) {
      const google = await geocodeGoogle(address, key);
      if (google) return google;
    }
    return await geocodeCensus(address);
  } catch (error) {
    console.warn("[geocode] failed", error instanceof Error ? error.message : error);
    return null;
  }
}
