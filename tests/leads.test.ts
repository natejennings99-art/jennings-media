import { test } from "node:test";
import assert from "node:assert/strict";
import { contactSchema, contentPackageSchema, creatorSchema, fieldErrorsOf, looksLikeBot } from "@/lib/leads/schemas";
import { NEEDS, BUDGETS } from "@/lib/content/agency";

test("contact form accepts a real inquiry and normalises the email", () => {
  const r = contactSchema.safeParse({ name: "Ada Lovelace", email: "ADA@Example.com", need: NEEDS[0], budget: BUDGETS[0], services: [], message: "We open a second location in March." });
  assert.ok(r.success);
  assert.equal(r.data.email, "ada@example.com");
  assert.equal(r.data.company, null);
});

test("contact form reports per-field errors", () => {
  const r = contactSchema.safeParse({ name: "A", email: "nope", need: "?", budget: "?", services: [], message: "short" });
  assert.ok(!r.success);
  const errors = fieldErrorsOf(r.error);
  for (const k of ["name", "email", "need", "budget", "message"]) assert.ok(errors[k], `expected an error for ${k}`);
});

test("bot heuristics: honeypot or an instant submit", () => {
  assert.equal(looksLikeBot({ website: "http://spam" }), true);
  assert.equal(looksLikeBot({ startedAt: Date.now() - 500 }), true);
  assert.equal(looksLikeBot({ startedAt: Date.now() - 10_000 }), false);
  assert.equal(looksLikeBot({}), false);
});

test("/join requires a real portfolio URL and a numeric day rate", () => {
  const base = { name: "Sam Shooter", email: "sam@example.com", phone: "(813) 555-0100", discipline: "both", gear: "R5, 24-70", day_rate: "650", availability: ["Weekends"], notes: "" };
  const ok = creatorSchema.safeParse({ ...base, portfolio_url: "instagram.com/samshoots" });
  assert.ok(ok.success);
  assert.equal(ok.data.portfolio_url, "https://instagram.com/samshoots");
  assert.equal(ok.data.day_rate, 650);
  assert.equal(ok.data.notes, null);

  const bad = creatorSchema.safeParse({ ...base, portfolio_url: "not a link", day_rate: "lots", discipline: "drone" });
  assert.ok(!bad.success);
  const errors = fieldErrorsOf(bad.error);
  assert.ok(errors.portfolio_url);
  assert.ok(errors.day_rate);
  assert.ok(errors.discipline);
});

test("/join rejects a short phone number", () => {
  const r = creatorSchema.safeParse({ name: "Sam", email: "sam@example.com", phone: "12345", discipline: "photo", portfolio_url: "https://sam.photo", day_rate: 400, availability: [] });
  assert.ok(!r.success);
  assert.ok(fieldErrorsOf(r.error).phone);
});

test("/content-package call request needs name, business, phone and a time", () => {
  const ok = contentPackageSchema.safeParse({ name: "Maria", business: "Maria's Kitchen", phone: "813-555-0100", best_time: "Morning", email: "" });
  assert.ok(ok.success);
  assert.equal(ok.data.email, null);
  const bad = contentPackageSchema.safeParse({ name: "", business: "", phone: "", best_time: "Whenever" });
  assert.ok(!bad.success);
  const errors = fieldErrorsOf(bad.error);
  for (const k of ["name", "business", "phone", "best_time"]) assert.ok(errors[k], `expected an error for ${k}`);
});
