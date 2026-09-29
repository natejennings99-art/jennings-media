#!/usr/bin/env node
/**
 * Verifies the Supabase migrations + seed against a real Postgres engine (PGlite,
 * in-process WASM) and exercises the Row Level Security model.
 *
 *   npm run db:verify
 *
 * No Docker or Supabase project required.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { btree_gist } from "@electric-sql/pglite/contrib/btree_gist";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const migrationsDir = join(root, "supabase", "migrations");

let failures = 0;
let passes = 0;
function check(name, condition, detail = "") {
  if (condition) {
    passes++;
    console.log(`  ✓ ${name}`);
  } else {
    failures++;
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const db = new PGlite({ extensions: { btree_gist } });

async function run(label, sql) {
  try {
    await db.exec(sql);
    console.log(`  ✓ ${label}`);
    passes++;
  } catch (error) {
    failures++;
    console.log(`  ✗ ${label}\n    ${error.message}`);
    throw error;
  }
}

async function as(role, sub, fn) {
  const claims = sub ? JSON.stringify({ sub, role }) : JSON.stringify({ role });
  await db.exec(`set role ${role}`);
  await db.query(`select set_config('request.jwt.claims', $1, false)`, [claims]);
  try {
    return await fn();
  } finally {
    await db.exec(`reset role`);
    await db.query(`select set_config('request.jwt.claims', '', false)`);
  }
}

async function rows(sql, params = []) {
  return (await db.query(sql, params)).rows;
}

async function throws(sql, params = []) {
  try {
    await db.query(sql, params);
    return null;
  } catch (error) {
    return error.message;
  }
}

console.log("\n▶ Applying schema");
await run("supabase stub (auth, storage, roles)", readFileSync(join(root, "scripts/db/supabase-stub.sql"), "utf8"));
for (const file of readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort()) {
  await run(file, readFileSync(join(migrationsDir, file), "utf8"));
}
const seedPath = join(root, "supabase", "seed.sql");
if (existsSync(seedPath)) {
  await run("seed.sql", readFileSync(seedPath, "utf8"));
}

console.log("\n▶ Seed content");
const [{ count: serviceCount }] = await rows(`select count(*)::int as count from public.services`);
const [{ count: packageCount }] = await rows(`select count(*)::int as count from public.packages`);
check("services seeded", serviceCount >= 10, `found ${serviceCount}`);
check("packages seeded", packageCount >= 3, `found ${packageCount}`);
const [settings] = await rows(`select * from public.business_settings where id = 1`);
check("business settings row exists", Boolean(settings));

console.log("\n▶ Fixtures");
const [alice] = await rows(
  `insert into auth.users (email, email_confirmed_at, raw_user_meta_data)
   values ('alice@example.com', now(), '{"full_name":"Alice Agent"}') returning id`
);
const [bob] = await rows(
  `insert into auth.users (email, email_confirmed_at) values ('bob@example.com', now()) returning id`
);
const [owner] = await rows(
  `insert into auth.users (email, email_confirmed_at) values ('owner@example.com', now()) returning id`
);
const [mallory] = await rows(
  `insert into auth.users (email) values ('guest@example.com') returning id`
);
check("auth trigger mirrors users", (await rows(`select 1 from public.users`)).length === 4);
await db.query(`select public.promote_to_admin('owner@example.com')`);
check("promote_to_admin", (await rows(`select 1 from public.admins`)).length === 1);

// Guest booking creates the customer before any login exists.
const [guestCustomer] = await rows(
  `insert into public.customers (email, first_name, last_name) values ('alice@example.com', 'Alice', 'Agent') returning id, referral_code`
);
check("referral code generated", /^ALICE-[A-F0-9]{4}$/.test(guestCustomer.referral_code), guestCustomer.referral_code);
const [bobCustomer] = await rows(
  `insert into public.customers (email, first_name, user_id) values ('bob@example.com', 'Bob', $1) returning id`,
  [bob.id]
);
// Unverified user with the same email as an existing customer can't claim it.
await rows(`insert into public.customers (email, first_name) values ('guest@example.com', 'Guest')`);

const [prop] = await rows(
  `insert into public.properties (customer_id, address_line1, city, state, postal_code, square_feet)
   values ($1, '1 Bay St', 'Tampa', 'FL', '33602', 2100) returning id`,
  [guestCustomer.id]
);
const [bobProp] = await rows(
  `insert into public.properties (customer_id, address_line1, city, state, postal_code)
   values ($1, '9 Gulf Blvd', 'Clearwater', 'FL', '33767') returning id`,
  [bobCustomer.id]
);
const [booking] = await rows(
  `insert into public.bookings (customer_id, property_id, total_cents, subtotal_cents, deposit_cents, payment_option)
   values ($1, $2, 45000, 45000, 13500, 'deposit') returning id, order_number, share_token`,
  [guestCustomer.id, prop.id]
);
check("order number assigned", /^JM-\d{4,}$/.test(booking.order_number), booking.order_number);
check("share token is 32 hex chars", /^[a-f0-9]{32}$/.test(booking.share_token));
const [bobBooking] = await rows(
  `insert into public.bookings (customer_id, property_id, total_cents) values ($1, $2, 25000) returning id`,
  [bobCustomer.id, bobProp.id]
);
const [invoice] = await rows(
  `insert into public.invoices (booking_id, customer_id, total_cents) values ($1, $2, 45000) returning id, invoice_number, amount_due_cents`,
  [booking.id, guestCustomer.id]
);
check("invoice number assigned", /^INV-\d{4,}$/.test(invoice.invoice_number), invoice.invoice_number);
check("amount_due generated", invoice.amount_due_cents === 45000);
await rows(
  `insert into public.media (booking_id, category, storage_path, file_name) values ($1, 'photos', 'b/1.jpg', '1.jpg')`,
  [booking.id]
);
await rows(
  `insert into public.booking_events (booking_id, type, visibility, message) values
   ($1, 'note', 'internal', 'Gate code is 1234'), ($1, 'message', 'customer', 'See you Tuesday!')`,
  [booking.id]
);

console.log("\n▶ Profile claiming");
const claimed = await as("authenticated", alice.id, () => rows(`select public.claim_customer_profile() as id`));
check("verified user claims guest customer record", claimed[0].id === guestCustomer.id);
const unverified = await as("authenticated", mallory.id, () =>
  rows(`select public.claim_customer_profile() as id`)
);
check("unverified email cannot claim an existing record", unverified[0].id === null);

console.log("\n▶ Row Level Security — anon");
await as("anon", null, async () => {
  check("anon reads active services", (await rows(`select id from public.services`)).length === serviceCount);
  check("anon cannot read bookings", (await rows(`select id from public.bookings`)).length === 0);
  check("anon cannot read customers", (await rows(`select id from public.customers`)).length === 0);
  check("anon cannot read settings", (await rows(`select id from public.business_settings`)).length === 0);
  const err = await throws(`insert into public.contact_leads (name, email, message) values ('x','x@y.z','hi')`);
  check("anon cannot insert leads directly", Boolean(err && /permission denied/.test(err)), err ?? "no error");
  const rpc = await throws(`select public.reserve_appointment(gen_random_uuid(), now(), now() + interval '1 hour', now(), now() + interval '1 day', 1, 4)`);
  check("anon cannot call reserve_appointment", Boolean(rpc && /permission denied/.test(rpc)), rpc ?? "no error");
});

console.log("\n▶ Row Level Security — customer");
await as("authenticated", alice.id, async () => {
  const ownBookings = await rows(`select id from public.bookings`);
  check("customer sees only own bookings", ownBookings.length === 1 && ownBookings[0].id === booking.id);
  check("customer sees own customer row only", (await rows(`select id from public.customers`)).length === 1);
  check("customer sees own invoice", (await rows(`select id from public.invoices`)).length === 1);
  check("customer cannot see undelivered media", (await rows(`select id from public.media`)).length === 0);
  const events = await rows(`select message from public.booking_events`);
  check("customer sees only customer-visible events", events.length === 1 && events[0].message.startsWith("See you"));
  check("customer cannot read admin notes table", (await rows(`select id from public.customer_notes`)).length === 0);
  const upd = await rows(`update public.bookings set total_cents = 1 where id = $1 returning id`, [booking.id]);
  check("customer cannot modify bookings", upd.length === 0);
  const ins = await throws(
    `insert into public.bookings (customer_id, property_id) values ($1, $2)`,
    [guestCustomer.id, prop.id]
  );
  check("customer cannot insert bookings", Boolean(ins), ins ?? "no error");
  const fav = await throws(
    `insert into public.customer_favorites (customer_id, service_id) select $1, id from public.services limit 1`,
    [guestCustomer.id]
  );
  check("customer can favorite a service", fav === null, fav ?? "");
  const foreignFav = await throws(
    `insert into public.customer_favorites (customer_id, service_id) select $1, id from public.services limit 1`,
    [bobCustomer.id]
  );
  check("customer cannot favorite for someone else", Boolean(foreignFav));
  const metricsErr = await throws(`select public.admin_dashboard_metrics(now() - interval '30 days', now() + interval '1 day')`);
  check("customers cannot call admin metrics", Boolean(metricsErr && /forbidden/.test(metricsErr)), metricsErr ?? "allowed");
});

await db.query(`update public.bookings set status = 'delivered' where id = $1`, [booking.id]);
await as("authenticated", alice.id, async () => {
  check("customer sees media after delivery", (await rows(`select id from public.media`)).length === 1);
});
await as("authenticated", bob.id, async () => {
  const visible = await rows(`select id from public.bookings`);
  check("second customer isolated", visible.length === 1 && visible[0].id === bobBooking.id);
  check("second customer cannot see first customer's media", (await rows(`select id from public.media`)).length === 0);
});

console.log("\n▶ Row Level Security — admin");
await as("authenticated", owner.id, async () => {
  check("admin sees all bookings", (await rows(`select id from public.bookings`)).length === 2);
  check("admin reads settings", (await rows(`select id from public.business_settings`)).length === 1);
  const upd = await rows(`update public.services set sort_order = sort_order returning id`);
  check("admin can edit catalog", upd.length === serviceCount);
  const metrics = await rows(`select public.admin_dashboard_metrics(now() - interval '30 days', now() + interval '1 day') as m`);
  check("admin metrics count bookings", Number(metrics[0].m.bookings_count) === 2, JSON.stringify(metrics[0].m));
  const stats = await rows(`select * from public.customer_stats where customer_id = $1`, [guestCustomer.id]);
  check("customer_stats view works", stats.length === 1 && Number(stats[0].bookings_count) === 1);
  const revenue = await rows(`select * from public.admin_revenue_by_month(6, 'America/New_York')`);
  check("revenue by month returns 6 rows", revenue.length === 6);
});

console.log("\n▶ Scheduling");
const day = "2030-03-12";
const dayStart = `${day}T04:00:00Z`;
const dayEnd = `2030-03-13T04:00:00Z`;
const reserve = (start, end, capacity = 1, maxPerDay = 3, bookingId = booking.id) =>
  db.query(
    `select public.reserve_appointment($1, $2, $3, $4, $5, $6, $7, 30) as id`,
    [bookingId, start, end, dayStart, dayEnd, capacity, maxPerDay]
  );
const first = await reserve(`${day}T14:00:00Z`, `${day}T15:30:00Z`).then(() => null, (e) => e.message);
check("first slot reserved", first === null, first ?? "");
const clash = await reserve(`${day}T15:00:00Z`, `${day}T16:00:00Z`).then(() => null, (e) => e.message);
check("overlapping slot rejected at capacity 1", clash === "slot_unavailable", clash ?? "accepted");
const buffered = await reserve(`${day}T15:45:00Z`, `${day}T16:30:00Z`).then(() => null, (e) => e.message);
check("travel buffer enforced", buffered === "slot_unavailable", buffered ?? "accepted");
const parallel = await reserve(`${day}T15:00:00Z`, `${day}T16:00:00Z`, 2).then(() => null, (e) => e.message);
check("second photographer capacity allows overlap", parallel === null, parallel ?? "");
await reserve(`${day}T19:00:00Z`, `${day}T20:00:00Z`, 3, 3, bobBooking.id);
const full = await reserve(`${day}T21:00:00Z`, `${day}T22:00:00Z`, 3, 3).then(() => null, (e) => e.message);
check("max shoots per day enforced", full === "day_full", full ?? "accepted");

const [ph] = await rows(`insert into public.photographers (name) values ('Sam') returning id`);
await rows(
  `insert into public.appointments (booking_id, photographer_id, starts_at, ends_at) values ($1, $2, '2030-04-01T14:00Z', '2030-04-01T15:00Z')`,
  [booking.id, ph.id]
);
const overlap = await throws(
  `insert into public.appointments (booking_id, photographer_id, starts_at, ends_at) values ($1, $2, '2030-04-01T14:30Z', '2030-04-01T15:30Z')`,
  [bobBooking.id, ph.id]
);
check("photographer double-booking blocked by constraint", Boolean(overlap && /appointments_photographer_no_overlap/.test(overlap)), overlap ?? "accepted");

await rows(
  `insert into public.appointments (booking_id, status, starts_at, ends_at, hold_expires_at)
   values ($1, 'held', '2030-05-01T14:00Z', '2030-05-01T15:00Z', now() - interval '1 minute')`,
  [bobBooking.id]
);
const [{ expire_stale_holds: expired }] = await rows(`select public.expire_stale_holds()`);
check("expired holds released", expired === 1, String(expired));

console.log("\n▶ Payments ledger");
await rows(
  `insert into public.payments (booking_id, invoice_id, customer_id, kind, status, amount_cents, paid_at)
   values ($1, $2, $3, 'deposit', 'succeeded', 13500, now())`,
  [booking.id, invoice.id, guestCustomer.id]
);
await rows(`select public.sync_booking_financials($1)`, [booking.id]);
let [b] = await rows(`select payment_status, amount_paid_cents from public.bookings where id = $1`, [booking.id]);
check("deposit marks booking deposit_paid", b.payment_status === "deposit_paid" && b.amount_paid_cents === 13500);
await rows(
  `insert into public.payments (booking_id, invoice_id, customer_id, kind, status, amount_cents, paid_at)
   values ($1, $2, $3, 'balance', 'succeeded', 31500, now())`,
  [booking.id, invoice.id, guestCustomer.id]
);
await rows(`select public.sync_booking_financials($1)`, [booking.id]);
[b] = await rows(`select payment_status from public.bookings where id = $1`, [booking.id]);
const [inv] = await rows(`select status, amount_due_cents, paid_at from public.invoices where id = $1`, [invoice.id]);
check("balance marks booking paid", b.payment_status === "paid");
check("invoice marked paid", inv.status === "paid" && inv.amount_due_cents === 0 && inv.paid_at !== null);

console.log("\n▶ Promo codes");
const [promo] = await rows(
  `insert into public.promo_codes (code, discount_type, discount_value, usage_limit) values ('spring25', 'percent', 25, 1) returning id, code`
);
check("promo code normalized to upper case", promo.code === "SPRING25");
const [{ consume_promo_code: c1 }] = await rows(`select public.consume_promo_code($1)`, [promo.id]);
const [{ consume_promo_code: c2 }] = await rows(`select public.consume_promo_code($1)`, [promo.id]);
check("usage limit enforced atomically", c1 === true && c2 === false);
const badPercent = await throws(`insert into public.promo_codes (code, discount_type, discount_value) values ('BAD', 'percent', 150)`);
check("percent discounts capped at 100", Boolean(badPercent));

console.log(`\n${failures === 0 ? "✅" : "❌"} ${passes} passed, ${failures} failed\n`);
await db.close();
process.exit(failures === 0 ? 0 : 1);
