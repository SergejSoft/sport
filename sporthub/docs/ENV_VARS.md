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

### If you see "prepared statement already exists" (42P05) on Vercel

When using the **pooler** (Transaction mode), Prisma’s prepared statements conflict with connection reuse and can trigger PostgreSQL error `42P05` (`prepared statement "s3" already exists`). **Fix:** append `?pgbouncer=true` to your **pooler** `DATABASE_URL` so Prisma does not use prepared statements.

Example pooler URL with the param:
`postgresql://postgres.xxxxx:PASSWORD@aws-0-xx.pooler.supabase.com:6543/postgres?pgbouncer=true`

Set that full string (with your password) as `DATABASE_URL` in Vercel. Do **not** add `pgbouncer=true` to `DIRECT_URL` (direct connection).

### If you see "Authentication failed" (P1000)

The database **password** in the URI is wrong or still a placeholder. Replace it with your real password (Supabase → Database → Reset database password if needed).

---

## Vercel (production)

**Checklist — set these in Vercel → Project → Settings → Environment variables** (for Production, and Preview if you use it):

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | **Must be the pooler** URL (port **6543**) and **must end with** `?pgbouncer=true` to avoid error "prepared statement already exists" (42P05). Example: `...pooler.supabase.com:6543/postgres?pgbouncer=true`. Supabase → Database → Connection string → **Transaction** → copy URI, then add `?pgbouncer=true` if not present. |
| `DIRECT_URL` | Yes* | Prisma schema expects it. Use the **direct** URL (port 5432) or the same pooler URL; only needed for migrations. If build fails with "Environment variable not found: DIRECT_URL", add it. |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase → API → Project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase → API → anon key. |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Only if you use Admin "Send reset" from the app. |
| `APP_ORIGIN` | No | Server-only. Base URL for password-reset redirect (e.g. `https://your-app.vercel.app`). Defaults to `https://${VERCEL_URL}` on Vercel, else `http://localhost:3000`. Set in non-standard deployments so reset links point to the correct domain. |
| `RESEND_API_KEY`, `EMAIL_FROM` | No | Optional; for sending reset emails via Resend. |


### Migration-first: production uses migrations, not db push

- **Local dev:** Use `npm run db:push` for quick schema sync, or `npm run db:migrate` to create and apply migrations. Both read from `.env.local`.
- **Production / Preview:** Use **migrations only**. Do not use `db:push` in production — it does not create migration history and can drift from other environments.

**Apply migrations to production (one-time or on each deploy):**

1. Set **`DATABASE_URL`** and **`DIRECT_URL`** in Vercel to your production Supabase URIs (pooler and direct).
2. From your machine (or CI), run against production once:
   ```bash
   cd sporthub
   DATABASE_URL="<production-pooler-uri>" DIRECT_URL="<production-direct-uri>" npx prisma migrate deploy
   ```
   Or use `npm run db:migrate:deploy` after setting those env vars in the shell (e.g. in a deploy script or Vercel build: `npm run db:migrate:deploy` with Vercel env injected).
3. When you add new migrations locally (`npm run db:migrate`), commit the new files under `prisma/migrations/`, then run `prisma migrate deploy` against production (same command as above) so production stays in sync.

**Why migration-first:** Migrations are versioned and reproducible; `db:push` is dev-only and can diverge between local and production if used for both.

**Existing DB created with `db:push`:** If production already has the schema (from a previous `db:push`), run `npx prisma migrate resolve --applied 20260225000000_init` once against that DB so the initial migration is marked applied; then use `migrate deploy` for any future migrations.

---

## Summary

- **`.env.local`** = your local overrides; never committed (in `.gitignore`).
- **`.env.example`** = list of variable names and placeholders; safe to commit. Copy to `.env.local` and fill in real values.
