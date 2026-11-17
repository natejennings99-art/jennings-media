import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { REAL_ESTATE_PATH, RE_BOOK_CTA } from "@/lib/content/real-estate-cta";

const RE_PAGES = ["real-estate", "pricing", "locations/[city]", "listing-video-tampa", "drone-real-estate-tampa", "real-estate-photography-cost-tampa", "luxury-presence-alternative"];
const src = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

test("real estate end-of-page button books a shoot at /book, with the free reel as the second link", () => {
  assert.equal(RE_BOOK_CTA.href, "/book");
  assert.equal(RE_BOOK_CTA.label, "Book a shoot");
  assert.equal(RE_BOOK_CTA.secondary.href, "/free-listing-reel");
  for (const p of RE_PAGES) assert.match(src(`src/app/(marketing)/${p}/page.tsx`), /<FinalCta [^>]*\{\.\.\.RE_BOOK_CTA\}/, `${p} passes the /book button`);
  // Other pages keep the default /contact button.
  assert.doesNotMatch(src("src/app/(marketing)/page.tsx"), /RE_BOOK_CTA/);
  assert.match(src("src/components/agency/final-cta.tsx"), /href = "\/contact"/);
});

test("real estate path match: same list for the phone bar and the header", () => {
  for (const p of ["/real-estate", "/pricing", "/locations/tampa", "/listing-video-tampa", "/drone-real-estate-tampa", "/real-estate-photography-cost-tampa"]) assert.ok(REAL_ESTATE_PATH.test(p), p);
  for (const p of ["/", "/contact", "/services", "/real-estate-x", "/free-listing-reel"]) assert.ok(!REAL_ESTATE_PATH.test(p), p);
  for (const f of ["src/components/marketing/mobile-cta.tsx", "src/components/marketing/site-header.tsx"]) assert.match(src(f), /REAL_ESTATE_PATH\.test/, f);
});

test("request-mode booking copy promises no online checkout, dashboard or card payment", async () => {
  const { RE_FAQ, RE_FAQ_REQUEST, RE_STEPS_REQUEST, REQUEST_PAY_ANSWER, REQUEST_RESCHEDULE_ANSWER } = await import("@/lib/content/real-estate");
  const text = [...RE_STEPS_REQUEST.map((s) => `${s.title} ${s.text}`), REQUEST_PAY_ANSWER, REQUEST_RESCHEDULE_ANSWER, ...RE_FAQ_REQUEST.filter((f) => /booking|pay/i.test(f.q)).map((f) => f.a)].join(" ");
  assert.doesNotMatch(text, /dashboard|stripe|online|checkout|card|apple pay|google pay|deposit/i);
  assert.deepEqual(RE_FAQ_REQUEST.map((f) => f.q), RE_FAQ.map((f) => f.q), "same questions, so the FAQ schema matches the page");
  // Wording matches /book's "What happens next" in request mode.
  const soon = src("src/components/booking/booking-soon.tsx");
  for (const s of RE_STEPS_REQUEST) assert.ok(soon.includes(s.text), `step ${s.n} reuses /book wording`);
});

test("/book size calculator: exact prices for 1,500, 2,500 and 4,000 sq ft match the /pricing tiers", async () => {
  const { DEFAULT_PACKAGES, DEFAULT_SERVICES } = await import("@/lib/content/defaults");
  const { sortTiers, packagePrice, servicePrice, startingPrice } = await import("@/lib/pricing/engine");
  const { sqftPrices, parseSqft } = await import("@/components/booking/sqft-price");
  const packages = DEFAULT_PACKAGES.filter((p) => p.is_active).sort((a, b) => a.sort_order - b.sort_order);
  const photo = DEFAULT_SERVICES.find((s) => s.slug === "photography" && s.is_bookable);
  assert.ok(packages.length > 0 && photo, "default catalog has packages and photography");
  // The /pricing table lists sorted tiers ("≤2.5k sq ft · $X"); a home uses the first tier it fits under.
  const tableRow = (item: { base_price_cents: number; price_tiers: { max_sqft: number | null; price_cents: number }[] }, sqft: number) => {
    const tiers = sortTiers(item.price_tiers);
    if (!tiers.length) return item.base_price_cents;
    return (tiers.find((t) => t.max_sqft === null || sqft <= t.max_sqft) ?? tiers[tiers.length - 1]).price_cents;
  };
  for (const sqft of [1500, 2500, 4000]) {
    const got = sqftPrices(packages, photo, sqft);
    packages.forEach((p, i) => {
      assert.equal(got.packages[i].cents, tableRow(p, sqft), `${p.slug} at ${sqft}`);
      assert.equal(got.packages[i].cents, packagePrice(p, sqft));
    });
    assert.equal(got.photo, tableRow(photo!, sqft), `photography at ${sqft}`);
    assert.equal(got.photo, servicePrice(photo!, sqft));
  }
  // No size typed: the same "from" prices /book showed before.
  const none = sqftPrices(packages, photo, parseSqft(""));
  packages.forEach((p, i) => assert.equal(none.packages[i].cents, startingPrice(p)));
  assert.equal(parseSqft("2,400"), 2400);
  assert.equal(parseSqft("abc"), null);
});

test("/book request form: email optional, mobile required, size field and calculator links carry sqft", () => {
  const actions = src("src/app/book/request-actions.ts");
  assert.match(actions, /sqft: optionalClean\(10\)/);
  assert.match(actions, /s === "" \|\| z\.email\(\)/);
  assert.match(actions, /sqft: d\.sqft/, "size goes in the [lead] log line");
  assert.doesNotMatch(actions, /adminUrl: `mailto:\$\{d\.email\}`/, "no empty mailto when email is blank");
  const form = src("src/components/booking/shoot-request-form.tsx");
  assert.match(form, /"Email \(optional\)"/);
  assert.match(form, /"Mobile", \{[^}]*required: true/);
  assert.match(form, /name="sqft"/);
  assert.match(src("src/components/booking/sqft-price.tsx"), /&sqft=\$\{sqft\}/);
  assert.match(src("src/components/booking/booking-soon.tsx"), /id="request"/);
});
