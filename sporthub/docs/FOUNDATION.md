# Foundation — Execution steps (aligned with plan)

This document maps **Phase 1 — Foundation** from the architecture plan to the codebase. Use it to verify alignment and keep the foundation stable.

---

## Plan reference (Phase 1)

From the holistic execution plan:

1. Create accounts: Supabase, Vercel, GitHub, Cloudflare, Resend (optional).
2. Init monorepo: Next.js 14+ (App Router), TypeScript, Prisma, tRPC, Tailwind, shadcn/ui.
3. Connect Supabase project; schema with payment at venue, offerType, sportType, paymentStatus/price/paymentRequired, unclaimed-venue fields.
4. Run initial migration.
5. Auth: signup, login, logout (Supabase Auth); middleware for JWT and effective user.
6. Impersonation: platform-admin-only, store in session (cookie), audit log.
7. CI/CD: GitHub → Vercel on push.
8. Basic layout: navbar, footer, responsive shell.

---

## Implementation map

| Plan step | Where it lives | How to verify |
|-----------|----------------|----------------|
| **Accounts** | Manual setup | Supabase + Vercel + GitHub linked; env vars set locally and in Vercel. |
| **Monorepo / stack** | `sporthub/` (Next.js, TypeScript, Prisma, tRPC, Tailwind) | `package.json`; shadcn added when building UI (Phase 2+). |
| **Schema** | `prisma/schema.prisma` | Account, Organisation, OrganisationMember, Location (paymentMethodsAtVenue, claimedAt/claimedById), Class (offerType, sportType, priceCents, paymentRequired), Booking (paymentStatus), AuditLog. |
| **Migration** | `npm run db:push` or `npm run db:migrate` | Run once with `DATABASE_URL` set; tables exist in DB. |
| **Auth** | Supabase Auth + app | `src/lib/supabase/` (client, server, middleware); `src/app/(auth)/login`, `signup`; `src/app/actions/auth.ts` (logout); `src/middleware.ts` refreshes session. tRPC `src/server/context.ts` has effective user (and real user for impersonation). |
| **Impersonation** | Cookie + audit | Cookie `sporthub_impersonate` set only by admin; `src/app/actions/impersonation.ts` (start/stop + AuditLog); `src/app/(dashboard)/admin/page.tsx`; context validates cookie (only uses if target account exists). |
| **CI/CD** | GitHub → Vercel | Repo connected in Vercel; deploy on push. |
| **Layout** | Header + footer | `src/components/header.tsx` (navbar, impersonation banner, Admin link); `src/components/footer.tsx`; both in `src/app/layout.tsx`. |

---

## Stability and reliability

- **Env** — `src/lib/env.ts` defines required vars; `src/lib/prisma.ts` calls `getDatabaseUrl()` before creating the client so a missing `DATABASE_URL` (e.g. on Vercel) throws a clear message pointing to .env.local and Vercel env settings.
- **Impersonation** — Context only uses the impersonation cookie if the target account exists in the DB (avoids stale/invalid cookies).
- **Single Prisma instance** — `src/lib/prisma.ts` uses a global singleton in dev to avoid connection exhaustion.

---

## Required env vars (foundation)

| Var | Used by | Where to set |
|-----|--------|--------------|
| `DATABASE_URL` | Prisma (all DB access) | `.env.local` (local); Vercel → Settings → Environment Variables |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase client (auth) | Same |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase client (auth) | Same (anon/publishable only) |

See `README.md` for setup and the Phase 1 checklist.

---

## Foundation tests

Run `npm run test` to verify:

- **Env** — `assertServerEnv()` and `getDatabaseUrl()` throw when required vars are missing; pass when set.
- **Database** — Prisma connects and can run a query; `Account` model exists (schema synced).
- **Auth** — Supabase client creation throws when `NEXT_PUBLIC_SUPABASE_*` are missing; returns a client when set.

Tests load `.env.local` via `tests/setup.ts`. If you remove or rename a required env var, the corresponding tests will fail, so env drift is detected automatically.
