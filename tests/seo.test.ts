import { test } from "node:test";
import assert from "node:assert/strict";
import { localBusinessSchema, organizationSchema } from "@/components/seo/json-ld";
import { DEFAULT_SETTINGS } from "@/lib/content/defaults";
import { LOCATIONS } from "@/lib/content/seo";
import { BRAND } from "@/lib/brand";

test("organization schema keeps the brand phone and email when Admin settings are blank", () => {
  const org = organizationSchema({ ...DEFAULT_SETTINGS, phone: "", email: "" });
  assert.equal(org.telephone, BRAND.phone);
  if (BRAND.email) assert.equal(org.email, BRAND.email);
});

test("organization schema prefers the phone set in Admin", () => {
  assert.equal(organizationSchema({ ...DEFAULT_SETTINGS, phone: "+18135550100" }).telephone, "+18135550100");
});

test("every city page's LocalBusiness schema carries the phone number", () => {
  for (const l of LOCATIONS) assert.equal(localBusinessSchema(l).telephone, BRAND.phone, l.slug);
});
