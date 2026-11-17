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
