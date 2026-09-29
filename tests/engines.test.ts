import { test } from "node:test";
import assert from "node:assert/strict";
import { buildQuote, recommendPackages, relevantAddOns, priceForSqft } from "@/lib/pricing/engine";
import { getDayAvailability, type AvailabilityContext } from "@/lib/scheduling/availability";
import { sunsetUtc } from "@/lib/scheduling/sun";
import { zonedTimeToUtc, ymdOf, hmOf } from "@/lib/scheduling/tz";
import { calculateTravel } from "@/lib/geo/travel";
import { DEFAULT_ADD_ONS, DEFAULT_PACKAGES, DEFAULT_SERVICES, DEFAULT_SERVICE_AREAS, DEFAULT_SETTINGS } from "@/lib/content/defaults";

const catalog = { services: DEFAULT_SERVICES, packages: DEFAULT_PACKAGES, addOns: DEFAULT_ADD_ONS };
const svc = (slug: string) => DEFAULT_SERVICES.find((s) => s.slug === slug)!;
const pkg = (slug: string) => DEFAULT_PACKAGES.find((p) => p.slug === slug)!;

test("sqft tiers pick the right band", () => {
  const tiers = svc("photography").price_tiers;
  assert.equal(priceForSqft(0, tiers, 1200), 17500);
  assert.equal(priceForSqft(0, tiers, 2500), 19900);
  assert.equal(priceForSqft(0, tiers, 2501), 23900);
  assert.equal(priceForSqft(0, tiers, 9000), 34900);
  assert.equal(priceForSqft(0, tiers, null), 17500);
});

test("a la carte quote with discount, travel and tax", () => {
  const q = buildQuote({
    catalog, squareFeet: 2100, packageId: null,
    serviceIds: [svc("photography").id, svc("floor-plans").id], addOns: [],
    travelFeeCents: 3500, taxRateBps: 700, taxTravelFee: false,
    discount: { label: "SPRING10", type: "percent", value: 10 },
    payment: { deposit_type: "percent", deposit_value: 30 },
  });
  assert.equal(q.subtotalCents, 19900 + 11900);
  assert.equal(q.discountCents, 3180);
  assert.equal(q.taxCents, Math.round((31800 - 3180) * 0.07));
  assert.equal(q.totalCents, 31800 - 3180 + 3500 + q.taxCents);
  assert.equal(q.depositCents, Math.round(q.totalCents * 0.3));
  assert.ok(q.durationMinutes >= 95);
});

test("package folds in included services and dedupes linked add-ons", () => {
  const q = buildQuote({
    catalog, squareFeet: 3000, packageId: pkg("pro").id,
    serviceIds: [svc("photography").id, svc("cinematic-video").id],
    addOns: [{ id: DEFAULT_ADD_ONS.find((a) => a.slug === "drone-photos")!.id, quantity: 1 }, { id: DEFAULT_ADD_ONS.find((a) => a.slug === "rush-delivery")!.id, quantity: 1 }],
  });
  const paid = q.lines.filter((l) => l.totalCents > 0).map((l) => l.name);
  assert.deepEqual(paid, ["Pro package", "Cinematic Property Video", "Rush Delivery"]);
  assert.equal(q.subtotalCents, 51500 + 42500 + 7500);
  assert.ok(q.rules.daylight_only, "drone in package makes it daylight-only");
});

test("recommends the cheaper package", () => {
  const recs = recommendPackages(catalog, { serviceIds: ["photography", "drone-photography", "floor-plans", "property-website"].map((s) => svc(s).id) }, 2000);
  assert.equal(recs[0].package.slug, "pro");
  assert.equal(recs[0].kind, "saves");
  assert.ok(recs[0].savingsCents > 0);
});

test("recommends upgrading a package when a bigger one is cheaper", () => {
  const recs = recommendPackages(catalog, { serviceIds: [svc("cinematic-video").id], packageId: pkg("pro").id }, 2850);
  assert.equal(recs[0].package.slug, "signature");
  assert.equal(recs[0].savingsCents, 51500 + 42500 - 75000);
});

test("add-ons are relevant to selections", () => {
  const ids = relevantAddOns(catalog, [svc("photography").id]).map((a) => a.slug);
  assert.ok(ids.includes("drone-photos") && ids.includes("twilight-shoot") && ids.includes("rush-delivery"));
  assert.ok(!ids.includes("drone-video"));
  const withDrone = relevantAddOns(catalog, [svc("photography").id, svc("drone-photography").id]).map((a) => a.slug);
  assert.ok(!withDrone.includes("drone-photos"), "hides add-ons already in the order");
});

test("timezone conversion handles DST", () => {
  assert.equal(zonedTimeToUtc("2030-01-15", "09:00", "America/New_York").toISOString(), "2030-01-15T14:00:00.000Z");
  assert.equal(zonedTimeToUtc("2030-07-15", "09:00", "America/New_York").toISOString(), "2030-07-15T13:00:00.000Z");
  const d = new Date("2030-07-15T13:00:00Z");
  assert.equal(ymdOf(d, "America/New_York"), "2030-07-15");
  assert.equal(hmOf(d, "America/New_York"), "09:00");
});

test("sunset in Tampa is plausible", () => {
  const summer = sunsetUtc("2030-06-21", 27.95, -82.46)!;
  const winter = sunsetUtc("2030-12-21", 27.95, -82.46)!;
  assert.equal(hmOf(summer, "America/New_York").slice(0, 2), "20"); // ~8:25 PM EDT
  assert.equal(hmOf(winter, "America/New_York").slice(0, 2), "17"); // ~5:40 PM EST
});

const baseCtx = (over: Partial<AvailabilityContext> = {}): AvailabilityContext => ({
  settings: DEFAULT_SETTINGS.scheduling,
  timeZone: "America/New_York",
  durationMinutes: 90,
  rules: { daylight_only: false, twilight: false, min_notice_hours: 0, skills: [] },
  appointments: [],
  blocks: [],
  photographers: [],
  latitude: 27.95,
  longitude: -82.46,
  now: new Date("2030-03-01T12:00:00Z"),
  ...over,
});

test("availability: weekday slots, buffers and capacity", () => {
  const day = getDayAvailability("2030-03-12", baseCtx()); // Tuesday
  assert.equal(day.slots[0].label, "8:00 AM");
  assert.equal(day.slots.at(-1)!.label, "4:30 PM");
  const busy = getDayAvailability("2030-03-12", baseCtx({
    appointments: [{ starts_at: "2030-03-12T14:00:00Z", ends_at: "2030-03-12T15:30:00Z", status: "scheduled", hold_expires_at: null, buffer_before_minutes: 30, buffer_after_minutes: 30, photographer_id: null }],
  }));
  const labels = busy.slots.map((s) => s.label);
  assert.ok(!labels.includes("10:00 AM") && !labels.includes("11:30 AM") && labels.includes("12:00 PM"));
  assert.ok(!labels.includes("8:30 AM"), "8:30 + 90min overlaps 9:30 buffer start");
  assert.equal(getDayAvailability("2030-03-10", baseCtx()).closedReason, "closed"); // Sunday
  assert.equal(getDayAvailability("2030-02-01", baseCtx()).closedReason, "past");
});

test("availability: twilight and daylight rules", () => {
  const twilight = getDayAvailability("2030-06-18", baseCtx({ now: new Date("2030-06-01T12:00:00Z"), rules: { daylight_only: false, twilight: true, min_notice_hours: 0, skills: [] } }));
  assert.equal(twilight.slots.length, 1);
  assert.equal(twilight.slots[0].kind, "twilight");
  const daylight = getDayAvailability("2030-12-17", baseCtx({ now: new Date("2030-12-01T12:00:00Z"), durationMinutes: 60, rules: { daylight_only: true, twilight: false, min_notice_hours: 0, skills: [] } }));
  assert.ok(daylight.slots.length > 0);
  const last = new Date(daylight.slots.at(-1)!.end).getTime();
  assert.ok(last <= new Date(daylight.sunset!).getTime());
});

test("travel fee by city, radius and outside area", () => {
  const policy = DEFAULT_SETTINGS.service_area_policy;
  const core = calculateTravel(DEFAULT_SERVICE_AREAS, policy, { city: "St. Petersburg", state: "FL", postalCode: "33701", latitude: null, longitude: null });
  assert.equal(core.feeCents, 0);
  assert.equal(core.outsideArea, false);
  const zone = calculateTravel(DEFAULT_SERVICE_AREAS, policy, { city: "Sarasota", state: "FL", postalCode: "34236", latitude: 27.3364, longitude: -82.5307 });
  assert.ok(zone.feeCents > 3500, `zone fee ${zone.feeCents}`);
  const far = calculateTravel(DEFAULT_SERVICE_AREAS, policy, { city: "Orlando", state: "FL", postalCode: "32801", latitude: 28.5384, longitude: -81.3789 });
  assert.equal(far.outsideArea, true);
  assert.ok(far.feeCents >= policy.outside_area_fee_cents);
});
