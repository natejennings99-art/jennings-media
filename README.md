# Jennings Media

Premium real estate media platform: marketing site, online booking with live pricing and scheduling, Stripe payments, client dashboard with media delivery, and a full studio admin.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Supabase (Postgres, Auth, Storage, RLS) · Stripe Checkout · Resend · Vercel

---

## Contents

1. [Features](#features)
2. [Project structure](#project-structure)
3. [Local development](#local-development)
4. [Environment variables](#environment-variables)
5. [Supabase setup](#supabase-setup)
6. [Stripe setup](#stripe-setup)
7. [Email setup (Resend)](#email-setup-resend)
8. [Deployment (Vercel)](#deployment-vercel)
9. [Testing](#testing)
10. [Architecture notes](#architecture-notes)
11. [Before launch checklist](#before-launch-checklist)

---

## Features

**Public site** — cinematic homepage (Ken Burns hero, before/after edit slider, bento services grid, scroll-driven "how it works", filterable masonry portfolio with lightbox, testimonial marquees, FAQ), services + service detail pages, pricing with a live home-size slider, portfolio + project pages, about, contact, legal pages. SEO: metadata, canonical URLs, OpenGraph image, JSON-LD (`ProfessionalService`/LocalBusiness, `Service`, `FAQPage`, breadcrumbs), `sitemap.xml`, `robots.txt`.

**Booking app** (`/book`) — 7 steps with a live price summary and progress bar, saved automatically to the browser:
property → services → packages (automatic "this package saves you $X" recommendations) → context-aware add-ons → calendar with real availability (working hours, blocked dates, crew capacity, travel buffers, max shoots/day, daylight-only drone rules, sunset-timed twilight) → details → payment (pay in full / deposit / pay after shoot, promo & referral codes, tax, automatic travel fee from service zones) → confirmation (order number, emails, add-to-calendar).

**Client dashboard** (`/dashboard`) — overview, shoots with visual status tracker, property project pages (services, invoice, activity, media gallery with individual downloads, **download-all zip**, share links, branded + MLS-unbranded property website at `/p/[token]`), media downloads, invoices (printable, pay online), payments, properties, favorite services, referral program, account settings, support.

**Admin** (`/admin`) — KPIs & revenue chart, bookings (status workflow, reschedule, assign photographer, edit line items, discounts/fees, manual payments, Stripe payment links, refunds, notes, client messages, cancel, media upload & delivery), calendar (month/week/day, drag-and-drop), customer CRM, properties, orders, media, services, packages, pricing & add-ons, invoices, payments, discount codes, portfolio, testimonials, contact leads, settings (business, scheduling, payments & tax, notifications, referrals, integrations, service areas & travel zones, team, blocked dates).

**Notifications** — booking received/confirmed/reminder/shoot completed/media ready/payment received/invoice due/changed/cancelled + admin alerts, all logged in `notifications`. SMS channel (Twilio) is built in but dormant until configured.

---

## Project structure

```
supabase/
  migrations/            SQL schema, business functions, RLS, storage (apply in order)
  seed.sql               generated from src/lib/content/defaults.ts
scripts/db/              PGlite migration + RLS test harness, seed generator
tests/                   unit tests (pricing, scheduling, travel)
src/
  proxy.ts               session refresh + optimistic auth redirects (Next 16 "proxy")
  app/
    (marketing)/         public site: home, services, pricing, portfolio, about, contact, legal
    (auth)/              login (password / magic link / 6-digit code), forgot & update password
    auth/                callback, confirm (token hash), signout routes
    book/                booking wizard, server actions, confirmation
    dashboard/           client portal
    admin/               studio admin (+ actions.ts, resources.ts)
    p/[token]/           property website / share page
    api/                 booking availability & quote, Stripe webhook, cron, ICS, health
    sitemap.ts robots.ts manifest.ts opengraph-image.tsx icon.svg
  components/
    ui/ marketing/ motion/ booking/ dashboard/ admin/ seo/ analytics/
  lib/
    pricing/engine.ts          pure pricing, discounts, deposits, package recommendations
    scheduling/                availability engine, timezone math, sunset calculation
    geo/                       geocoding (Google or free U.S. Census), travel-fee zones
    booking/                   validation, discounts/referrals, creation, payments, checkout
    notifications/ email/      dispatcher, templates, Resend sender, Twilio SMS channel
    supabase/                  server / browser / public / service-role clients
    data/                      cached public data (with offline fallback) + customer queries
    content/                   default catalog & copy (edit freely)
```

---

## Local development

Requirements: **Node.js 20.9+** (22 or 24 LTS recommended).

```bash
npm install
cp .env.example .env.local     # fill in what you have — everything is optional locally
npm run dev                    # http://localhost:3000
```

Without Supabase keys the marketing site and the booking wizard still run on built-in default content (booking submission explains that the backend isn't connected). Emails are written to `.outbox/*.html` when `RESEND_API_KEY` is empty.

Useful scripts:

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | Generate route types + `tsc` |
| `npm run lint` | ESLint (Next + React Compiler rules) |
| `npm test` | Unit tests for pricing, scheduling, travel |
| `npm run db:verify` | Apply all migrations + seed in PGlite and run 57 RLS/business-logic checks |
| `npm run db:seed:generate` | Regenerate `supabase/seed.sql` from `src/lib/content/defaults.ts` |

---

## Environment variables

See [`.env.example`](.env.example). Summary:

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical URL (e.g. `https://jenningsmedia.com`) |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | Publishable/anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY` also accepted) |
| `SUPABASE_SECRET_KEY` | yes | Service-role key — server only (`SUPABASE_SERVICE_ROLE_KEY` also accepted) |
| `ADMIN_BOOTSTRAP_EMAILS` | recommended | Verified emails auto-promoted to owner admin on first sign-in |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | for payments | Without them only "pay after shoot" is offered |
| `RESEND_API_KEY` / `EMAIL_FROM` | for email | Verified sending domain required by Resend |
| `ADMIN_NOTIFICATION_EMAILS` | recommended | Booking/lead alerts |
| `CRON_SECRET` | for reminders | Protects `/api/cron/reminders` |
| `GOOGLE_MAPS_API_KEY` | optional | More accurate geocoding for travel fees |
| `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_GOOGLE_ADS_BOOKING_LABEL` | optional | Or set in Admin → Settings |
| `TWILIO_*` | optional | Enables SMS reminders |
| `SHOW_SAMPLE_CONTENT` | optional | Show sample portfolio/testimonials in production |

Secrets never reach the browser: only `NEXT_PUBLIC_*` values are bundled, and all service-role / Stripe / Resend usage lives in `server-only` modules.

---

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com) and copy the URL, publishable key and secret key into `.env.local`.
2. Apply the database, in order — either with the CLI (`supabase link` then `supabase db push`) or by pasting each file into **SQL Editor**:
   1. `supabase/migrations/20260929000100_core_schema.sql`
   2. `supabase/migrations/20260929000200_functions.sql`
   3. `supabase/migrations/20260929000300_security.sql`
   4. `supabase/migrations/20260929000400_storage.sql`
   5. `supabase/seed.sql` (catalog, packages, add-ons, settings, example service areas, **sample** portfolio/testimonials)
3. **Auth → URL Configuration:** set Site URL to your domain and add `http://localhost:3000/**` and `https://YOUR-DOMAIN/**` to Redirect URLs.
4. **Auth → Email templates** (recommended for cross-device magic links): change the Magic Link / Confirm signup link to
   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard`
   and include `{{ .Token }}` so customers can also type the 6-digit code. Recovery template: `…&type=recovery&next=/update-password`.
   Configure a custom SMTP (e.g. Resend SMTP) for production-grade deliverability.
5. **Create your admin:** sign up at `/login` with an email listed in `ADMIN_BOOTSTRAP_EMAILS` (or run `select public.promote_to_admin('you@example.com');` in the SQL editor after signing up).
6. Open `/admin/settings` and fill in business details, timezone, working hours, service areas and notification emails.

Storage buckets (created by the migration): `deliveries` (private — client media, served via short-lived signed URLs) and `public-media` (portfolio, service images, hero video). Uploads go directly from the browser to Storage with signed upload URLs, so large files never pass through a serverless function. For videos over 50 MB raise the bucket/project upload limit (Supabase Pro) or add Vimeo/YouTube links as external media.

---

## Stripe setup

1. Copy the secret and publishable keys (test mode first).
2. Create a webhook endpoint → `https://YOUR-DOMAIN/api/stripe/webhook` with events:
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`. Put the signing secret in `STRIPE_WEBHOOK_SECRET`.
3. Local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook` and use card `4242 4242 4242 4242`.
4. Payment options (full / deposit % or $ / pay later) are configured in **Admin → Settings → Payments**. Checkout supports cards, Apple Pay, Google Pay and Link automatically.

The confirmation page also verifies the Checkout Session directly, so customers see "Paid" instantly even if the webhook is delayed; both paths are idempotent.

---

## Email setup (Resend)

1. Add and verify your sending domain in Resend; set `RESEND_API_KEY` and `EMAIL_FROM`.
2. Templates live in `src/lib/email/templates.ts` (plain TypeScript, inline-styled, escaped). Preview any template locally: leave `RESEND_API_KEY` empty and open the generated files in `.outbox/`.

---

## Deployment (Vercel)

1. Push the repo to GitHub and import it in Vercel (framework preset: Next.js).
2. Add all environment variables for Production (and Preview if you use it). Set `NEXT_PUBLIC_SITE_URL` to the production domain.
3. Deploy, then add the domain in Vercel and update Supabase Auth URLs + the Stripe webhook URL.
4. `vercel.json` schedules `/api/cron/reminders` daily (13:00 UTC ≈ 9 AM Eastern). On Vercel Pro you can run it hourly. Set `CRON_SECRET`.
5. Smoke test: `/api/health` shows which integrations are configured.

---

## Testing

```bash
npm test            # pricing, package recommendations, add-on relevance, DST/timezones, sunset, availability, travel fees
npm run db:verify   # migrations + seed + RLS (anon / customer / admin isolation), slot reservation races, payments ledger, promo limits
npm run typecheck && npm run lint && npm run build
```

End-to-end with real services: set Stripe test keys, run `stripe listen`, book at `/book` choosing "Pay in full", complete Checkout, then verify the booking in `/admin/bookings`, upload media, mark delivered and download it from `/dashboard`.

---

## Architecture notes

- **Security model.** Every table has RLS. Anonymous users can read only published marketing content; customers can read only their own rows (via `current_customer_id()` / `owns_booking()` security-definer helpers that avoid policy recursion); admins get full access through `is_admin()`. Customer writes go through validated Server Actions; guest bookings, webhooks and cron use the service-role key on the server only. Private media is served with signed URLs after an ownership check. Server Actions have built-in origin checks; inputs are validated with zod and stripped of control characters; emails escape all interpolated values; security headers + CSP are set in `next.config.ts`.
- **Money** is always integer cents. The pricing engine (`lib/pricing/engine.ts`) is shared by the booking UI (instant previews) and the server (authoritative totals).
- **Scheduling** runs in the business timezone from settings. The server re-validates the chosen slot, and `reserve_appointment()` re-checks capacity inside a transaction-scoped advisory lock; a Postgres exclusion constraint prevents double-booking a photographer. Paid bookings hold the slot until Checkout completes; abandoned holds are released by the webhook, the cancel URL and the cron job.
- **Guest → account linking.** Customers can book without an account. When they sign in with a *verified* email, `claim_customer_profile()` attaches their existing bookings.
- **Multi-market ready.** No city is hard-coded: service areas (cities, ZIPs, radius, flat + per-mile fees, market label) and the business timezone are data.
- **Caching.** Marketing pages are statically generated with ISR (5 min) and refreshed instantly by admin edits (`updateTag`). If Supabase is unreachable they fall back to built-in defaults.

### Extending

The data model and module boundaries leave room for: a photographer mobile app (photographers + RLS policies already exist), automatic delivery pipelines / AI editing & virtual staging (media table + storage), MLS integrations, Google Calendar sync (`appointments.external_calendar_id`), QuickBooks/Zapier/CRM webhooks (booking_events + notifications tables are natural triggers), SMS (channel implemented), agent subscriptions, brokerage/team accounts, franchise markets (`service_areas.market`) and white-label property websites (`/p/[token]`).

---

## Before launch checklist

- [ ] Replace sample portfolio + testimonials (they're flagged `is_sample` and hidden in production by default).
- [ ] Replace placeholder photography (`src/lib/content/images.ts`, Unsplash) with your own, or upload via Admin.
- [ ] Set business email/phone/address, timezone, working hours and service areas in Admin → Settings (defaults assume Tampa Bay, FL).
- [ ] Review prices (Admin → Services / Packages / Pricing), tax rate and deposit rules.
- [ ] Have the Terms and Privacy pages reviewed by an attorney.
- [ ] Verify claims in copy (e.g. "FAA Part 107 licensed", turnaround times) match your operation — `src/lib/content/site.ts`.
- [ ] Configure Resend domain, Stripe live keys + webhook, Supabase SMTP and email templates.
