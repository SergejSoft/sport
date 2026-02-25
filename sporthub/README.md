# SportHub

Group sport discovery and booking — find and book classes, individual training, bootcamps, and tournaments. MVP target ~200 MAU.

**Tech:** Next.js 14+ (App Router), TypeScript, tRPC, Prisma, Supabase (PostgreSQL + Auth), Tailwind, shadcn/ui. See [PROJECT_OVERVIEW.md](../PROJECT_OVERVIEW.md) in the repo root for locked choices and structure.

---

## Setup

1. **Clone and install**
   ```bash
   cd sporthub
   npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env.local`
   - Set `DATABASE_URL` in `.env.local` (Supabase → Project Settings → Database → **Connection string** → URI; use the pooler URI and replace the password placeholder)
   - Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` (Supabase → Project Settings → API; anon/publishable key only)

   `db:push`, `db:migrate`, and `db:studio` load variables from `.env.local` so Prisma can see `DATABASE_URL`.

3. **Database**
   ```bash
   npm run db:generate   # Generate Prisma client
   npm run db:push       # Push schema to DB (reads DATABASE_URL from .env.local)
   # Or: npm run db:migrate   # Create and run migrations
   ```

5. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

   If you see *"Unable to acquire lock at .../.next/dev/lock"* or *"Port 3000 is in use"*, another `next dev` is running. Stop it (close that terminal or `kill <PID>`), delete `sporthub/.next/dev/lock` if it still exists, then run `npm run dev` again.

6. **Platform admin (optional)**  
   To use Admin and Impersonation, mark an account as platform admin. After signing up and running the app once (so your Account row exists), run:
   ```bash
   npm run db:studio
   ```
   Open the `Account` table, find your row, and set `isPlatformAdmin` to `true`. Then visit `/admin` to list users and impersonate.

7. **Auth: forgot password and redirect URLs**  
   - **Forgot password:** Users can use "Forgot password?" on the login page. They enter their email; Supabase sends a reset link. After clicking, they land on `/update-password` to set a new password.
   - **Redirect URLs:** In **Supabase → Authentication → URL Configuration**, add your app URLs to **Redirect URLs** (e.g. `http://localhost:3000/**` for dev and `https://your-app.vercel.app/**` for production). Otherwise the reset link may not redirect back to your app.
   - **Admin:** Platform admins can open `/admin` to list users, impersonate, and use "Send reset" to trigger a password-reset email for a user. For "Send reset" to send email automatically, set `SUPABASE_SERVICE_ROLE_KEY` (Supabase → Project Settings → API → service_role) and optionally `RESEND_API_KEY` and `EMAIL_FROM`. Without Resend, the action still generates the reset link; you can send resets from **Supabase Dashboard → Authentication → Users** (link on the admin page).

---

## Phase 1 (Foundation) checklist

Use this to confirm the foundation matches the plan:

- [ ] **Accounts** — Supabase project created; Vercel project linked to repo when deploying; (optional) GitHub, Cloudflare, Resend
- [x] **Repo** — Next.js 14+ (App Router), TypeScript, Prisma, tRPC, Tailwind in `sporthub/`
- [x] **Schema** — Payment at venue, offerType, sportType, paymentStatus/price/paymentRequired, unclaimed-venue fields in `prisma/schema.prisma`
- [x] **DB** — `DATABASE_URL` set in `.env.local` and in Vercel; `npm run db:push` (or `db:migrate`) run once
- [x] **Auth** — Signup, login, logout (Supabase Auth); middleware refreshes session; tRPC context has effective user
- [x] **Impersonation** — Platform-admin-only; cookie `sporthub_impersonate`; audit log on start/stop; `/admin` lists users and Impersonate
- [x] **Layout** — Navbar (header with SportHub, Sign in/up or user + Admin + Log out), footer, responsive shell
- [ ] **Deploy** — Vercel env vars set (see below); redeploy after adding env
- [x] **Tests** — `npm run test` passes (env, DB connection, Supabase client). Changing or removing required env vars will make tests fail.

**Phase 1 note:** Dev server runs with `next dev --webpack` to avoid Turbopack module-resolution issues. You may see a deprecation warning: *"The 'middleware' file convention is deprecated. Please use 'proxy' instead."* — safe to ignore for now; migrate to the proxy convention when Next.js docs are updated.

---

## Deploying to Vercel

Set these in **Vercel → Project → Settings → Environment Variables** (Production, Preview, Development):

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | PostgreSQL URI — Supabase pooler (Transaction mode, port 6543) |
| `DIRECT_URL` | Yes | PostgreSQL direct URI — Supabase direct (Session mode, port 5432); used by Prisma for migrations |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/publishable key only |

If any are missing, the app will show a clear error asking you to set them in Vercel. After changing env vars, redeploy.

### Vercel setup (step-by-step)

1. **Push the repo to GitHub** (if not already): create a repo, push your local `New project` (or `sporthub`) code. The app must be deployable from Git.

2. **Create a Vercel project**
   - Go to [vercel.com](https://vercel.com) and sign in (GitHub recommended).
   - **Add New… → Project** and import your GitHub repository.
   - **Root Directory:** set to `sporthub` (the app lives in this subfolder). Leave other defaults and click **Deploy** once; the first deploy may fail until env vars are set — that’s OK.

3. **Set environment variables**
   - Open the project in Vercel → **Settings** → **Environment Variables**.
   - Add each variable for **Production**, **Preview**, and **Development** (or at least Production + Preview):

   | Name | Value (where to get it) |
   |------|-------------------------|
   | `DATABASE_URL` | Supabase → **Project Settings** → **Database** → **Connection string** → **URI** → choose **Transaction** (pooler, port 6543). Replace `[YOUR-PASSWORD]` with your database password. |
   | `DIRECT_URL` | Same Supabase page → **Connection string** → **URI** → choose **Session** (direct, port 5432). Same password. |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → **Project Settings** → **API** → **Project URL**. |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → **Project Settings** → **API** → **Project API keys** → **anon** / **public**. |

   Save each variable. **Redeploy** the project (Deployments → … on latest → Redeploy) so the build uses the new env.

4. **Confirm deployment**
   - Wait for the build to finish. Open the deployment URL.
   - You should see the SportHub home page. Sign up / sign in to confirm Supabase Auth and DB work in production.

5. **Optional:** Connect a custom domain in Vercel → **Settings** → **Domains**, and add the env vars to **Preview** if you use branch deployments.

---

## Scripts

| Script | Purpose |
|--------|--------|
| `npm run dev` | Start dev server |
| `npm run build` | Generate Prisma client + build Next.js |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to DB (dev) |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run test` | Run foundation tests (env, DB connection, Auth client) |
| `npm run test:watch` | Run tests in watch mode |

---

## Project structure

- `prisma/schema.prisma` — Database schema (Account, Organisation, Location, Class, Booking, etc.)
- `src/app/` — Next.js App Router (pages, layout, API routes)
- `src/app/api/trpc/[trpc]/` — tRPC API handler
- `src/server/` — tRPC routers and context
- `src/lib/` — Prisma client, tRPC client, shared utils
- `docs/AUTH_AND_USERS.md` — Auth and user management (flows, user types, Supabase config)
- `docs/GOOGLE_SIGNIN_SETUP.md` — How to enable “Sign in with Google” (Google Cloud + Supabase)
- `docs/AUTH_TEST_SCENARIOS.md` — Manual test scenarios to verify auth (sign up, sign in, forgot password, admin)

---

## README update habit

After any phase or major change (new env var, script, or deployment step), update this README so setup and run instructions stay accurate. See PROJECT_OVERVIEW.md §5.
