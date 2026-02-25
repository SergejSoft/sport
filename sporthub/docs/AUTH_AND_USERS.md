# Auth and user management

This document describes how authentication and user management work in SportHub, how to configure Supabase, and how to verify the flows.

---

## 1. Overview

- **Auth provider:** Supabase Auth (email/password and Google OAuth; JWT in cookies).
- **App model:** Each Supabase user is mirrored as an `Account` row in our DB (Prisma). `Account.id` = Supabase `user.id` for 1:1 linking.
- **Session:** Supabase SSR client reads/writes cookies; middleware refreshes the session on each request.
- **User types:** **Admin** (platform admin), **Club owner** (OWNER/ADMIN of at least one organisation), **Participant** (default; can book). See §6.
- **Admin:** Platform admins can use `/admin` to list users, set/remove platform admin, impersonate, and send password-reset emails.

---

## 2. User-facing flows

### 2.1 Sign up

1. User goes to **Sign up** → `/signup`.
2. Enters email and password (min 6 characters).
3. App calls `supabase.auth.signUp({ email, password })`.
4. Supabase may send a confirmation email (depending on project settings). User sees: “Check your email to confirm your account, then sign in.”
5. On first **sign in** after confirmation, the app creates an `Account` row via `getOrCreateAccount(user)` (used in layout/Header and tRPC context).

### 2.2 Sign in

1. User goes to **Sign in** → `/login`.
2. Enters email and password.
3. App calls `supabase.auth.signInWithPassword({ email, password })`.
4. On success, redirect to `/` and `router.refresh()` so server components see the session.
5. If the callback returns with an error (e.g. invalid magic-link code), user is redirected to `/login?error=...` and the message is shown on the login page.

### 2.3 Forgot password (self-service)

1. User on `/login` clicks **Forgot password?** → `/forgot-password`.
2. Enters email and submits.
3. App calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/callback?next=/update-password` })`.
4. Supabase sends the password-reset email (template configurable in Supabase Dashboard).
5. User sees: “Check your email… Click the link to set a new password.”
6. User clicks the link in the email. Supabase redirects to our app with a `code` in the URL.
7. **Auth callback** (`/auth/callback`): app calls `exchangeCodeForSession(code)` and redirects to `next` (here `/update-password`).
8. User lands on **Set new password** → `/update-password`, enters new password and confirm.
9. App calls `supabase.auth.updateUser({ password })`. On success, user sees “Password updated” and can continue.

### 2.4 Change password (logged in)

1. Logged-in user clicks **Password** in the header → `/update-password`.
2. Same as “Set new password” above: enter new password, confirm, submit → `updateUser({ password })`.

### 2.5 Sign in with Google

1. User on `/login` or `/signup` clicks **Continue with Google**.
2. App calls `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: origin + '/auth/callback' } })` and redirects to Google.
3. User signs in with Google; Google redirects to Supabase, then Supabase redirects to our `/auth/callback` with a `code`.
4. Auth callback exchanges the code for a session and redirects to `/`. First-time Google users get an `Account` row on the next layout load (same as email signup).
5. **Setup:** Configure Google OAuth in Google Cloud Console and enable the Google provider in Supabase. See `docs/GOOGLE_SIGNIN_SETUP.md`.

---

## 3. Admin flows

### 3.1 Admin page (`/admin`)

- **Access:** Only if the current user’s `Account.isPlatformAdmin` is true; otherwise redirect to `/`.
- **List:** All `Account` rows (email, name, admin flag, created).
- **Impersonate:** Button per user (except self). Sets cookie `sporthub_impersonate=<accountId>`. tRPC and layout use this as the “effective” user until **Stop impersonating**.
- **Role column:** Each user is shown as **Admin**, **Club owner**, or **Participant** (see §6).
- **Admin toggle:** “Make admin” / “Remove admin” to set `Account.isPlatformAdmin` (only for other users; you cannot remove your own admin).
- **Send reset:** Button per user. Calls server action that uses `SUPABASE_SERVICE_ROLE_KEY` to generate a recovery link. If `RESEND_API_KEY` and `EMAIL_FROM` are set, the app sends the reset email via Resend; otherwise the action returns a message (e.g. use Supabase Dashboard to send reset).
- **Manage in Supabase →:** Link to Supabase Dashboard → Authentication → Users for this project.

### 3.2 Impersonation

- **Start:** Admin submits form with `accountId` → server action sets httpOnly cookie `sporthub_impersonate=<id>` and redirects to `/`.
- **Context:** `createContext` (tRPC) and Header read the cookie; if valid and admin, `userId` becomes the impersonated account’s id.
- **Stop:** “Stop impersonating” submits an action that clears the cookie and redirects.

---

## 4. User types and how they are managed

| Type | Meaning | How it is set | Where it appears |
|------|--------|----------------|------------------|
| **Admin** | Platform administrator. Can access `/admin`, impersonate, send reset, and toggle admin for others. | `Account.isPlatformAdmin = true`. Set in DB (e.g. Prisma Studio) or by another admin via **Make admin** on `/admin`. | Header badge “Admin”; admin table Role column; Admin link in nav. |
| **Club owner** | User is OWNER or ADMIN of at least one Organisation (club). Can manage that club’s locations and classes (Phase 4). | Add an `OrganisationMember` row with `role: OWNER` or `role: ADMIN`. Managed when we build the provider/org dashboard. | Header badge “Club owner”; admin table Role column. |
| **Participant** | Default. Can discover and book classes. | No special flag; everyone is a participant. | No badge in header; admin table shows “Participant” for users who are not Admin or Club owner. |

- **Priority:** If a user is both Admin and Club owner, the UI shows **Admin** (e.g. in header and Role column we use a single label: Admin > Club owner > Participant).
- **Managing Admin:** Use **Make admin** / **Remove admin** on `/admin` (platform admins only). You cannot remove your own admin flag.
- **Managing Club owner:** Today, add or edit `OrganisationMember` rows in the DB (e.g. Prisma Studio). Later, the provider dashboard will let owners invite members and assign roles.

---

## 5. Supabase configuration

### 5.1 Redirect URLs

In **Supabase Dashboard → Authentication → URL Configuration → Redirect URLs**, add:

- Development: `http://localhost:3000/**`
- Production: `https://<your-vercel-domain>/**`

Without these, magic links and password-reset links may not redirect back to your app correctly.

### 5.2 Email templates

Under **Authentication → Email Templates** you can edit:

- **Confirm signup** (if email confirmation is enabled)
- **Reset password** (used for “Forgot password” and admin “Send reset” when Supabase sends the email)

The link in the template uses the redirect URL you pass; our app handles `/auth/callback` and `/update-password`.

### 5.3 User management in Dashboard

**Authentication → Users:**

- View, search, disable, delete users.
- Per user: **Send password recovery** sends Supabase’s built-in reset email (same flow as our “Send reset” when Resend is not used).

### 5.4 Service role key (optional, for admin “Send reset”)

- **Project Settings → API → service_role** (secret).
- Set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` and in Vercel (server-only). Never expose in the client.
- Required for the in-app “Send reset” button to generate the recovery link; optional if you only send resets from the Supabase Dashboard.

---

## 6. Environment variables (auth-related)

| Variable | Required | Used for |
|----------|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (client and server). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Anon key (client and server). |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Admin “Send reset” (generate link). Server-only. |
| `RESEND_API_KEY` | Optional | Sending reset email from app when admin clicks “Send reset”. |
| `EMAIL_FROM` | Optional | From address when using Resend for reset emails. |

---

## 7. Running the auth tests

- **Automated:** `npm run test` runs Vitest tests, including auth-related unit tests (e.g. cookie parser, client creation). See `tests/auth-flows.test.ts` and `tests/auth.test.ts`.
- **Manual:** Follow `docs/AUTH_TEST_SCENARIOS.md` to run end-to-end flows (sign up, sign in, forgot password, update password, admin list/impersonate/send reset) in the browser and in Supabase Dashboard.

---

*Last updated: with forgot-password, update-password, and admin send-reset flows.*
