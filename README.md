# SportHub

Monorepo for the **SportHub** app: discover and book group sports, classes, bootcamps, and tournaments.

---

## Repository layout

| Path | Purpose |
|------|--------|
| ** [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) ** | **Single source of truth** — tech stack, structure, roles. All implementation must align with this. |
| ** [sporthub/](./sporthub/) ** | Next.js app (tRPC, Prisma, Tailwind). Run and deploy from here. |
| ** [sporthub/README.md](./sporthub/README.md) ** | Setup, scripts, and how to run the app. **Keep this updated** when you add env vars, scripts, or deployment steps. |

---

## Quick start

```bash
cd sporthub
cp .env.example .env.local
# Edit .env.local: set DATABASE_URL (e.g. Supabase)
npm install
npm run db:generate
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). See [sporthub/README.md](./sporthub/README.md) for full setup and scripts.

---

## README update habit

- **After any phase or major change:** Update [sporthub/README.md](./sporthub/README.md) with current setup, env vars, and run instructions.
- New env var → add to `.env.example` and document in README. New script → add to README. See PROJECT_OVERVIEW.md §5.
