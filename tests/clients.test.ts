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
