# SportHub — Project Overview

**Purpose:** Single source of truth for technology choices and implementation. All new work must align with this document. When in doubt, refer here.

**Target:** MVP, ~200 MAU. Free tier everywhere; upgrade when needed.

---

## 1. Technology selection (locked)

| Layer | Choice | Version / notes |
|-------|--------|------------------|
| **Runtime** | Node.js | 18+ LTS |
| **Framework** | Next.js | 14+ (App Router) |
| **Language** | TypeScript | Strict mode |
| **Database** | PostgreSQL (Supabase) | Prisma 5 ORM, migrations (schema url in schema.prisma) |
| **API** | tRPC | Type-safe procedures |
| **Auth** | Supabase Auth | JWT; app handles effective user + impersonation |
| **Styling** | Tailwind CSS | v4 or v3 |
| **Components** | shadcn/ui | Copy-paste, no vendor lock-in |
| **Email** | Resend | Transactional (booking confirmations, claim) |
| **Hosting** | Vercel | Frontend + serverless API |
| **DNS / CDN** | Cloudflare | Free plan |
| **Repo / CI** | GitHub | Auto-deploy to Vercel on push |
| **PWA** | next-pwa or similar | Manifest + service worker |

Do **not** introduce a different ORM, API style (REST/GraphQL), or UI library without updating this document first.

---

## 2. Project structure (monorepo)

Repo root contains this overview and the app in `sporthub/`:

```
(Repo root)
├── PROJECT_OVERVIEW.md          # This file — tech and structure lock
├── README.md                   # Points to app + README update habit
└── sporthub/                   # Next.js app
    ├── prisma/
    │   └── schema.prisma
    ├── src/
    │   ├── app/                # Next.js App Router
    │   │   ├── (public)/       # No auth: discovery, landing
    │   │   ├── (auth)/         # Login, signup
    │   │   ├── (dashboard)/    # Auth required: bookings, org, admin
    │   │   └── api/
    │   │       └── trpc/[trpc]/
    │   ├── server/
    │   │   ├── routers/
    │   │   ├── context.ts
    │   │   └── trpc.ts
    │   ├── components/
    │   ├── lib/
    │   └── types/
    ├── public/
    ├── README.md               # Setup + how to run (keep updated)
    └── package.json
```

---

## 3. Roles and domain (summary)

- **Platform admin** — Can impersonate any user; support and admin.
- **Club (Organisation)** — Owner, Admin, Coach, Staff (OrgRole). Owner/admin manage locations and members; coach/staff create classes.
- **Location** — Venue (address, timezone, payment methods at venue).
- **Class** — Bookable offering: offerType (CLASS | INDIVIDUAL_TRAINING | BOOTCAMP | TOURNAMENT), sportType (enum), datetime, capacity, optional price/paymentRequired.
- **Booking** — Participant ↔ Class; status confirmed/cancelled/waitlist; optional paymentStatus for Stripe later.
- **Unclaimed venue** — Location or row with no org; claim flow assigns owner.

First sport types: Padel, Beach Tennis, Beach Volleyball, Football Padel, Yoga, Mountain Biking, Hiking, Dance Classes, Brazilian Jiu-Jitsu, Boxing.

---

## 4. Execution phases (reference)

1. **Foundation** — Accounts, repo, schema, auth, impersonation, layout.
2. **Discovery** — Public listing and class detail, filters.
3. **Booking** — Book/cancel, My Bookings, email confirmations.
4. **Provider** — Org, locations, classes, members, dashboard.
5. **Claim flow** — Unclaimed venue, claim by email.
6. **Admin & polish** — Impersonation UI, PWA, Sentry, E2E.
7. **Stripe** — When needed.

---

## 5. README update habit

- **After any phase or major change:** Update `README.md` with current setup steps, env vars, and how to run.
- **Checklist:** New env var? → Add to README and `.env.example`. New script? → Document in README. New deployment step? → Add to README.
- This file (`PROJECT_OVERVIEW.md`) defines *what* we build; README documents *how* to run and contribute.

---

*Last updated: project init. Update this file when changing tech choices or structure.*
