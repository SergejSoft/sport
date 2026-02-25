# Environment variables

Local secrets and config live in **`.env.local`** (gitignored). Never commit real keys.

---

## Supabase Auth (required for login/signup)

| Variable | Purpose | Where to get it |
|----------|--------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL. The app uses it to talk to Supabase Auth (login, signup, session). | Supabase → Project Settings → API → **Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Anon (public) key** — safe to use in browser and in Next.js server code. Used for Auth and for public API access. | Supabase → Project Settings → API → **Project API keys** → `anon` / **publishable** key |

**Why “NEXT_PUBLIC_”?**  
Next.js exposes only env vars that start with `NEXT_PUBLIC_` to the browser. Auth needs to run on both server (middleware, tRPC, layout) and client (login/signup forms), so both vars are public. They are still **not** secret: the anon key is meant to be used in frontends and is restricted by Supabase Row Level Security and Auth rules.

**Do not use** the `service_role` or any secret key in the app — only in secure server-only scripts if you ever need to bypass RLS. Never put `service_role` in `.env.local` if that file could be sent to the client or committed.

---

## Database (for Prisma / backend data)

| Variable | Purpose |
|----------|--------|
| `DATABASE_URL` | PostgreSQL connection string for Prisma (migrations, queries). From Supabase: Project Settings → Database → **Connection string** (URI). |

Add this when you run `npm run db:push` or `npm run db:migrate`.

### DATABASE_URL must use the **pooler** on Vercel (and recommended locally)

The URL you copied (`db....supabase.co:5432`) is the **direct** connection. It does **not** work from Vercel (serverless) — you get "Can't reach database server". Use the **pooler** URL for `DATABASE_URL` instead.

1. Open **Supabase** → your project → **Project Settings** → **Database**.
2. Under **Connection string**, select **URI**.
3. Switch the mode to **Transaction** (or **Session** pooler). The URI will change to use **port 6543** and a host like `aws-0-xx.pooler.supabase.com` (not `db....supabase.co`).
4. Copy that **pooler** URI. Replace the password placeholder with your real database password.
5. Set that as **`DATABASE_URL`** in Vercel (and in `.env.local` if you want the same locally).
6. Keep the **direct** URI (port 5432, `db....supabase.co`) for **`DIRECT_URL`** only (used by Prisma for migrations). On Vercel you can set both; the app at runtime uses `DATABASE_URL` (pooler).

**Summary:** `DATABASE_URL` = pooler (6543) so the app can reach the DB from Vercel. `DIRECT_URL` = direct (5432) for migrations.

### If you see "Authentication failed" (P1000)

The database **password** in the URI is wrong or still a placeholder. Replace it with your real password (Supabase → Database → Reset database password if needed).

---

## Vercel (production)

**Checklist — set these in Vercel → Project → Settings → Environment variables** (for Production, and Preview if you use it):

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | **Must be the pooler** URL (port **6543**, host `...pooler.supabase.com`). The direct URL (`db....supabase.co:5432`) causes "Can't reach database server" at runtime. Supabase → Database → Connection string → **Transaction** → copy URI. |
| `DIRECT_URL` | Yes* | Prisma schema expects it. Use the **direct** URL (port 5432) or the same pooler URL; only needed for migrations. If build fails with "Environment variable not found: DIRECT_URL", add it. |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase → API → Project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase → API → anon key. |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Only if you use Admin "Send reset" from the app. |
| `RESEND_API_KEY`, `EMAIL_FROM` | No | Optional; for sending reset emails via Resend. |


### Applying schema changes on Vercel (run migration / db push)

When you add or change Prisma schema (e.g. new columns on `Account`), your **local** DB was updated with `npm run db:push`, but the **production** database (used by the app on Vercel) is a separate database. It still has the old schema until you apply the same changes there.

**Option A — One-time from your machine (recommended for quick updates)**  
1. In **Vercel** → your project → **Settings** → **Environment variables**, copy the value of **`DATABASE_URL`** (the pooler URL).  
2. From your machine, in the `sporthub` folder, run Prisma against that URL once (don’t commit this):  
   `DATABASE_URL="paste-pooler-url-here" npx prisma db push`  
3. Prisma will add any missing columns/tables to the production DB. After that, redeploy or just use the app; no code change needed.

**Option B — Run on every deploy**  
Add a step before the Next.js build so every Vercel deploy applies the current schema. In `package.json`, change the build script to:  
`"build": "prisma generate && prisma db push && next build --webpack"`  
Vercel injects `DATABASE_URL` during build, so `prisma db push` will run against production. Use this only if you’re comfortable applying schema changes automatically on each deploy (this project uses `db push`, not migration history).

---

## Summary

- **`.env.local`** = your local overrides; never committed (in `.gitignore`).
- **`.env.example`** = list of variable names and placeholders; safe to commit. Copy to `.env.local` and fill in real values.
