# Sport Marketplace

Group sport discovery and booking — find and book classes, individual training, bootcamps, and tournaments. MVP target ~200 MAU.

**Tech:** Next.js 14+ (App Router), TypeScript, tRPC, Prisma, Supabase (PostgreSQL + Auth), Tailwind, shadcn/ui. See [PROJECT_OVERVIEW.md](../PROJECT_OVERVIEW.md) in the repo root for locked choices and structure.

---

## Setup

1. **Clone and install**
   ```bash
   cd sport-marketplace
   npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env.local`
   - Set `DATABASE_URL` (e.g. from [Supabase](https://supabase.com) → Project Settings → Database)

3. **Database**
   ```bash
   npm run db:generate   # Generate Prisma client
   npm run db:push       # Push schema to DB (no migrations yet)
   # Or: npm run db:migrate   # Create and run migrations
   ```

4. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

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

---

## Project structure

- `prisma/schema.prisma` — Database schema (Account, Organisation, Location, Class, Booking, etc.)
- `src/app/` — Next.js App Router (pages, layout, API routes)
- `src/app/api/trpc/[trpc]/` — tRPC API handler
- `src/server/` — tRPC routers and context
- `src/lib/` — Prisma client, tRPC client, shared utils

---

## README update habit

After any phase or major change (new env var, script, or deployment step), update this README so setup and run instructions stay accurate. See PROJECT_OVERVIEW.md §5.
