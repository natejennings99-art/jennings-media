import { test } from "node:test";
import assert from "node:assert/strict";
import { CONTENT_PACKAGE, CONTENT_PACKAGE_FAQS } from "@/lib/content/content-package";
import { faqSchema } from "@/components/seo/json-ld";

test("content package FAQ quotes the package's own price", () => {
  assert.ok(CONTENT_PACKAGE_FAQS[0].a.includes(CONTENT_PACKAGE.priceLabel));
});

test("content package FAQ makes no claims we can't back up", () => {
  for (const f of CONTENT_PACKAGE_FAQS) {
    assert.ok(!/guarantee|contract|you own|followers|%/i.test(f.a), f.q);
  }
});

test("content package FAQ becomes a valid FAQPage", () => {
  const ld = faqSchema(CONTENT_PACKAGE_FAQS);
  assert.equal(ld["@type"], "FAQPage");
  assert.equal(ld.mainEntity.length, CONTENT_PACKAGE_FAQS.length);
});
