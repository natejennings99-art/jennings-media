# Jennings Media: settings still to do

Checked 2026-11-06 against the live site. <https://jennings-media.com/api/health>
reports:

```
supabase: false   supabaseAdmin: false   stripe: false   email: false
```

`/api/stats` returns 503, which means `REPORT_KEY` isn't set.

**Where every value goes:** Render → service **jennings-media** →
**Environment** → **+ Add Environment Variable**. Type the key exactly as
written, paste the value, and after the batch click **Save, rebuild, and
deploy**. Values that start with `NEXT_PUBLIC_` are built into the pages, so
they only take effect after that rebuild.

Never put keys or passwords in the code, a chat, an email or a text. They only
ever go into Render.

## Status, most important first

| # | Setting | Live status | What's off without it |
|---|---|---|---|
| 1 | Supabase (+ the `creator_applicants` migration) | **Off** | Leads, /join applicants and bookings aren't saved, only logged. Admin is empty. `/api/stats` can't count anything. |
| 2 | Resend (email) | **Off** | No lead, booking or applicant email reaches you |
| 3 | Stripe | **Off** | Online payment is hidden; customers can only pay after the shoot |
| 4 | Google Search Console | **Not verified** (I can't see it from here, but the verification file is live) | Google isn't sent the sitemap, and you can't see search data |
| 5 | `NEXT_PUBLIC_SITE_URL` | **Set**: canonical links and the sitemap already use `https://jennings-media.com` | Nothing to do |
| 6 | `REPORT_KEY` (report link to Tampa Maids) | **Off** | See "Link the two sites" at the bottom |

---

## 1. Supabase (database) and the creator_applicants migration

Because `supabase` is false, the database isn't connected at all. Either the
project was never created, or its keys never went into Render. Work out which
case you're in first:

- Go to <https://supabase.com/dashboard/projects>. If there's **no project** for
  Jennings Media, follow **A**.
- If there **is** a project, open it → **Table Editor**. If you see tables like
  `contact_leads` and `bookings` but **not** `creator_applicants`, follow **B**.
  If you see no tables at all, follow **A** from step 3.

### A. New project (about 20 minutes)

1. <https://supabase.com/dashboard/projects> → **New project**. Name it
   `jennings-media`, set a database password (store it in your password
   manager, not anywhere else), choose region **East US (North Virginia)**, and
   pick the **Free** plan. Click **Create new project** and wait about 2
   minutes.
2. Go to **Project Settings** (gear icon) → **API Keys**, and copy these into
   Render:

   | Render key | Where it is in Supabase |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → **Data API** → Project URL (`https://xxxx.supabase.co`) |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | API Keys → **Publishable key** (`sb_publishable_…`) |
   | `SUPABASE_SECRET_KEY` | API Keys → **Secret keys** → Reveal (`sb_secret_…`) |
   | `ADMIN_BOOTSTRAP_EMAILS` | `natejennings99@gmail.com` |

3. Apply the database. In the left sidebar click **SQL Editor** → **New
   query**. For **each file below, in this order**: open it on GitHub
   (<https://github.com/natejennings99-art/jennings-media/tree/main/supabase>),
   click **Raw**, select all and copy, paste into the editor, and click
   **Run**. Wait for "Success. No rows returned" before starting the next
   file.
   1. `migrations/20260929000100_core_schema.sql`
   2. `migrations/20260929000200_functions.sql`
   3. `migrations/20260929000300_security.sql`
   4. `migrations/20260929000400_storage.sql`
   5. `migrations/20260929000500_agency.sql`
   6. `migrations/20261104000100_creator_applicants.sql`
   7. `seed.sql`
4. **Authentication** → **URL Configuration**: set **Site URL** to
   `https://jennings-media.com`. Under **Redirect URLs** add
   `https://jennings-media.com/**` and `http://localhost:3000/**`.
5. In Render, click **Save, rebuild, and deploy**. Then sign in at
   <https://jennings-media.com/login> with natejennings99@gmail.com. Because
   that email is in `ADMIN_BOOTSTRAP_EMAILS`, it becomes the owner admin.

### B. Project exists, only the new table is missing (2 minutes)

1. Supabase → your project → **SQL Editor** → **New query**.
2. Open
   <https://github.com/natejennings99-art/jennings-media/blob/main/supabase/migrations/20261104000100_creator_applicants.sql>
   → **Raw**, select all and copy, paste into the editor, and click **Run**.
3. Expect "Success. No rows returned". **Run it once only.** A second run
   fails with `policy "Admins have full access" ... already exists`. That
   error is harmless and means it was already applied.
4. To check: open **Table Editor** and confirm `creator_applicants` is in the
   list. Or, from the repo on your Mac, run `npm run db:verify`.

(Alternative with the CLI: `npx supabase login`, then
`npx supabase link --project-ref <ref from the project URL>`, then
`npx supabase db push`. This applies every migration that's missing.)

## 2. Resend (email)

The domain's DNS is at **Wix** (its nameservers are `wixdns.net`), so the DNS
records go in Wix, not GoDaddy.

1. Sign up at <https://resend.com/signup>.
2. **Domains** → **Add Domain** → `jennings-media.com`, region **us-east-1**.
3. Resend shows 3 or 4 records (a TXT record for DKIM, plus an MX and a TXT
   record on `send` for SPF). Open Wix → **Domains** → `jennings-media.com` →
   **⋯** → **Manage DNS Records**. Add each record with **Host** and **Value**
   copied exactly from Resend, then save.
4. Back in Resend, click **Verify DNS Records**. It can take from a few
   minutes to a few hours.
5. Go to **API Keys** → **Create API Key**, name it `jennings-media render`,
   choose **Sending access**, and copy the key (`re_…`). Resend shows it once.
6. Add these in Render:

   | Key | Value |
   |---|---|
   | `RESEND_API_KEY` | the `re_…` key |
   | `EMAIL_FROM` | `Jennings Media <bookings@jennings-media.com>` |
   | `ADMIN_NOTIFICATION_EMAILS` | `natejennings99@gmail.com` |

7. **Check:** after the deploy, send the contact form once. The email should
   arrive, and `/api/health` should show `"email":true`.

## 3. Stripe (online payment)

1. Sign up at <https://dashboard.stripe.com/register>. If you already have a
   Stripe account for Tampa Maids, use the account switcher → **New account**
   to keep the two businesses apart.
2. **Developers** → **API keys** → copy **Publishable key** (`pk_live_…`) and
   **Secret key** → Reveal (`sk_live_…`). To test first, turn on **Test mode**
   and use the `pk_test_` / `sk_test_` keys.
3. **Developers** → **Webhooks** → **Add endpoint**:
   - Endpoint URL: `https://jennings-media.com/api/stripe/webhook`
   - Events: `checkout.session.completed`,
     `checkout.session.async_payment_succeeded`,
     `checkout.session.async_payment_failed`, `checkout.session.expired`,
     `customer.subscription.deleted`, `charge.refunded`
   - Save, then **Signing secret** → Reveal (`whsec_…`).
4. Add these in Render:

   | Key | Value |
   |---|---|
   | `STRIPE_SECRET_KEY` | `sk_…` |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_…` |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_…` |

5. **Optional:** for the retainer self-service link, go to Stripe → **Settings**
   → **Billing** → **Customer portal** → **Activate**, copy the login link, and
   add it in Render as `NEXT_PUBLIC_STRIPE_PORTAL_URL`.

## 4. Google Search Console

The verification file is already live at
<https://jennings-media.com/google0a435e2cb66b5592.html>, so no DNS is needed.

1. Go to <https://search.google.com/search-console>, signed in as
   natejennings99@gmail.com.
2. Open the property dropdown (top left) → **+ Add property** → choose the
   **URL prefix** box (not "Domain") → `https://jennings-media.com/` →
   **Continue**.
3. Under **HTML file**, Google should show the same file name,
   `google0a435e2cb66b5592.html`. Click **Verify**. If it asks for a
   *different* file name, you're signed in to another Google account. Either
   switch accounts, or use the **HTML tag** method: copy the `content="…"` value
   into Render as `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, rebuild, then click
   Verify.
4. In the left menu, open **Sitemaps** → enter `sitemap.xml` → **Submit**.
5. Repeat steps 2–4 for `https://tampamaidscleaning.com/`, which serves the
   same verification file and is also unverified.

## 5. NEXT_PUBLIC_SITE_URL

Already set: the live canonical tags and sitemap use
`https://jennings-media.com`. If it's ever missing, the site falls back to the
`onrender.com` address in canonicals and share images. The value is
`https://jennings-media.com` (no trailing slash).

## Also optional

- `CRON_SECRET` plus a Render **Cron Job** that calls
  `https://jennings-media.com/api/cron/reminders` daily with
  `Authorization: Bearer <CRON_SECRET>`. This sends booking reminders and
  needs Supabase first.
- Analytics: `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`. These can also
  be set in Admin → Settings → Integrations once Supabase is on.
