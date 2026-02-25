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

### If you see "Authentication failed" (P1000)

The database **password** in `DATABASE_URL` is wrong or still a placeholder.

1. Open **Supabase** → your project → **Project Settings** → **Database**.
2. Under **Connection string**, pick **URI** and copy the string. It looks like:
   - **Direct:** `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
   - **Pooler:** `postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-xx.pooler.supabase.com:6543/postgres`
3. Replace `[YOUR-PASSWORD]` with your **database password**. If you don’t know it: on the same Database settings page, use **Reset database password**, set a new one, then use that in the URI.
4. Put the final URI in `.env.local` as `DATABASE_URL="..."` (no spaces around `=`).
5. Run `npm run db:push` again.

---

## Summary

- **`.env.local`** = your local overrides; never committed (in `.gitignore`).
- **`.env.example`** = list of variable names and placeholders; safe to commit. Copy to `.env.local` and fill in real values.
