import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { INDUSTRY_PAGES } from "@/lib/content/industries";
import { CONTENT_TIERS, PRICE_PLACEHOLDER, tierPriceLabel } from "@/lib/content/offers";
import { CONTENT_PACKAGE_PRICE, RETAINERS } from "@/lib/content/plans";
import { CALL_PAGES } from "@/lib/content/call";
import { industryServiceSchema } from "@/components/seo/json-ld";

test("the five industry pages exist, each with its own title and description", () => {
  assert.deepEqual(INDUSTRY_PAGES.map((i) => i.slug).sort(), ["airbnb-hosts", "gyms", "realtors", "restaurants", "salons"]);
  assert.equal(new Set(INDUSTRY_PAGES.map((i) => i.seoTitle)).size, 5);
  assert.equal(new Set(INDUSTRY_PAGES.map((i) => i.description)).size, 5);
  for (const i of INDUSTRY_PAGES) {
    assert.ok(i.seoTitle.length <= 60, `${i.slug} title is ${i.seoTitle.length} characters`);
    assert.ok(i.description.length >= 70 && i.description.length <= 165, `${i.slug} description is ${i.description.length} characters`);
    assert.ok(i.gets.length >= 3, `${i.slug} says what they get`);
    assert.ok(CALL_PAGES.includes(`/industries/${i.slug}`), `${i.slug} carries the call form`);
  }
});

test("industry examples are our own files in public/media, never stock or remote images", () => {
  for (const i of INDUSTRY_PAGES)
    for (const e of i.examples) {
      assert.ok(e.src.startsWith("/media/") && !e.src.startsWith("/media/stock/"), `${i.slug}: ${e.src}`);
      assert.ok(existsSync(join(process.cwd(), "public", e.src)), `${e.src} is missing`);
    }
});

test("industry schema is a Service with no price in it", () => {
  for (const i of INDUSTRY_PAGES) {
    const s = industryServiceSchema(i);
    assert.equal(s["@type"], "Service");
    assert.ok(!("offers" in s));
    assert.ok(s.url.endsWith(`/industries/${i.slug}`));
  }
});

test("content tiers: three of them, and every price comes from plans.ts or is a placeholder", () => {
  assert.equal(CONTENT_TIERS.length, 3);
  const known = new Set([CONTENT_PACKAGE_PRICE, ...RETAINERS.map((r) => r.price)]);
  for (const t of CONTENT_TIERS) assert.ok(t.price === null || known.has(t.price), `${t.name} has a price that is not in plans.ts`);
  assert.equal(tierPriceLabel({ price: null }, true), PRICE_PLACEHOLDER);
  assert.equal(tierPriceLabel({ price: null }, false), "Quoted on your call");
  assert.equal(tierPriceLabel({ price: 1500 }, false), "$1,500");
});
