# Account management

## User type in the UI

- **Header:** Logged-in users see `email (UserType)` — e.g. `user@example.com (Admin)` or `(Participant)`. This makes it clear who they are and simplifies debugging.
- **User types:** Admin (platform admin), Club owner (has org OWNER/ADMIN), Participant (default).

## Account page (`/account`)

- **Who:** Any logged-in user.
- **What:** View and edit their own PII (all optional):
  - Name
  - Surname
  - Phone number
  - Gender (Male / Female / Other / Prefer not to say)
- Email is read-only (managed by Supabase Auth).
- Link to “Change password” (`/update-password`) is on the same page.

## Admin user list (`/admin`)

- Admins see all accounts with: Email, Name (name + surname), Phone, Role, Admin toggle, Actions (Send reset, Impersonate).
- PII columns help with support and debugging.

## Database

- **Account** (Prisma): `name`, `surname`, `phone`, `gender` are optional. Run `npm run db:push` (or migrations) after pulling schema changes.

## Suggested next steps (step-by-step)

1. **Discovery & booking** — List classes/activities, filters, book/cancel (Phase 2).
2. **Organisations/clubs** — Onboarding for club owners, manage locations and classes.
3. **Notifications** — Email or in-app for booking confirmations and reminders.
4. **Profile visibility** — Optional “display name” (e.g. name + first letter of surname) for other participants.
5. **Avatar** — Already in schema (`avatarUrl`); allow upload or sync from Google.
6. **Audit log** — Use existing `AuditLog` for sensitive actions (role changes, impersonation, PII updates).
