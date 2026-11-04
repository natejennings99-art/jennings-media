# Running, deploying and rolling back

Plain-English runbook for jennings-media.com. The README has the full reference; this is the short version you reach for at 11pm.

## Run it on your laptop

```bash
npm install
cp .env.example .env.local      # optional: paste in the keys you have
npm run dev                     # http://localhost:3000
```

- Node 22 (see `.node-version`). Without any keys the site still runs: forms log leads to the terminal as `[lead] {...}` lines and emails are written to `.outbox/*.html` instead of being sent.
- Before you push: `npm run typecheck && npm run lint && npm test` (and `npm run db:verify` if you touched anything under `supabase/`).

## Deploy (Render)

There is nothing to click. **Every push to `main` on GitHub deploys automatically** to the Render web service `jennings-media` (build `npm ci --include=dev && npm run build`, start `npm start`, health check `/api/health`).

1. `git push origin main`
2. Watch it at https://dashboard.render.com → `jennings-media` → **Events** / **Logs**. A deploy takes a few minutes; the old version keeps serving until the new one passes the health check.
3. Check https://jennings-media.com/api/health afterwards. It lists which integrations are switched on (`supabase`, `supabaseAdmin`, `stripe`, `email`).

Environment variables live in Render → `jennings-media` → **Environment** (never in the repo). Changing one triggers a redeploy. The important ones:

| Variable | What breaks without it |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical links, sitemap, share images (set to `https://jennings-media.com`) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` | Leads, applicants and bookings are not saved to the database (they still reach the server log and email) |
| `RESEND_API_KEY` (+ `EMAIL_FROM`) | No lead/booking emails to natejennings99@gmail.com |
| `REPORT_KEY` | `GET /api/stats` (weekly numbers) returns 503 |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Online payment is hidden; "pay after the shoot" only |

## Roll back (undo a bad deploy)

Fastest, no git needed:

1. Render dashboard → `jennings-media` → **Events**.
2. Find the last deploy that was good, open it (or use the ⋯ menu) and click **Rollback to this deploy** / **Redeploy**. Render rebuilds that exact commit and swaps it in once it's healthy. Takes a few minutes.

Permanent fix, so the next push doesn't bring the bug back:

```bash
git revert <bad-commit-sha>     # makes a new commit that undoes it
git push origin main            # auto-deploys the revert
```

`git log --oneline` shows the recent commits with their SHAs. Avoid `git push --force` on `main`; a revert is safer and keeps history intact.

## Database changes (Supabase)

Migrations are SQL files in `supabase/migrations/`, applied **in filename order**. Render does not run them; apply them yourself once per project:

- Supabase CLI: `supabase link` then `supabase db push`, or
- Supabase dashboard → **SQL Editor** → paste the file → Run.

Each file is safe to run once. The newest one, `20261104000100_creator_applicants.sql`, creates the table behind `/join` and Admin → Creators; until it is applied, `/join` still works (applications go to the log and email) but the admin page and `/api/stats` report that the table is missing.

## Things to check after any deploy

- https://jennings-media.com/ loads
- https://jennings-media.com/api/health is `{"ok":true,...}`
- Submit the contact form once and confirm the email arrives (or, without Resend, that a `[lead]` line shows in Render → Logs)
