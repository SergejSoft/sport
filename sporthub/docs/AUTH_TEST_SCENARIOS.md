# Auth test scenarios

Use these scenarios to verify that the auth process works end-to-end. Run them manually in the browser (and optionally in Supabase Dashboard). Ensure redirect URLs and env are set per `AUTH_AND_USERS.md`.

**Automated regression:** `npm run test` runs Vitest tests covering auth callback redirect safety (`next` sanitization, no external URLs), middleware OAuth error scope (no hijack of unrelated routes), admin self-demotion guard, and impersonation cookie parser (malformed/empty values). Fix any failing tests before relying on manual scenarios.

---

## Prerequisites

- App running: `npm run dev` (or use deployed URL).
- Supabase: Redirect URLs include `http://localhost:3000/**` (and production URL if testing deploy).
- At least one platform admin: set `Account.isPlatformAdmin = true` in DB (e.g. via `npm run db:studio`) for a known user.

---

## Scenario 1: Sign up and first sign in

**Goal:** New user can create an account and sign in.

| Step | Action | Expected result |
|------|--------|-----------------|
| 1 | Open `/signup`. | Sign up form with email and password. |
| 2 | Enter a new email and password (≥6 chars), submit. | Message like “Check your email to confirm…” or immediate success (depending on Supabase email confirmation). |
| 3 | If confirmation is required: open the confirmation link from email, then go to `/login`. | Login form. |
| 4 | Sign in with the same email and password. | Redirect to `/`, header shows email and “Log out”. |
| 5 | In DB (e.g. `db:studio`): open `Account` table. | One row with that email and matching Supabase user id. |

**Pass:** User is signed in and an `Account` row exists.

---

## Scenario 2: Sign in (existing user)

**Goal:** Existing user can sign in with email/password.

| Step | Action | Expected result |
|------|--------|-----------------|
| 1 | Sign out if needed (Log out in header). | Home with “Sign in” / “Sign up”. |
| 2 | Open `/login`, enter valid email and password, submit. | Redirect to `/`, header shows email. |
| 3 | Refresh the page. | Still signed in. |

**Pass:** Sign in and session persist after refresh.

---

## Scenario 3: Sign in (wrong password)

**Goal:** Invalid credentials show an error.

| Step | Action | Expected result |
|------|--------|-----------------|
| 1 | Open `/login`, enter valid email and wrong password, submit. | Error message on page (e.g. “Invalid login credentials”), no redirect. |

**Pass:** Error shown, user stays on login.

---

## Scenario 4: Forgot password (full flow)

**Goal:** User can request a reset and set a new password.

| Step | Action | Expected result |
|------|--------|-----------------|
| 1 | Sign out. Open `/login`, click “Forgot password?”. | Navigate to `/forgot-password`. |
| 2 | Enter the email of an existing user, submit. | Message “Check your email… we sent a password reset link to …”. |
| 3 | Open the reset link from the email (same inbox). | Redirect to your app, then to `/update-password` (set new password page). |
| 4 | Enter new password and confirm (≥6 chars), submit. | “Password updated” (or similar), then “Continue”. |
| 5 | Click Continue (or go to `/`). | Home; user is logged in. |
| 6 | Sign out, go to `/login`, sign in with **old** password. | Error (invalid credentials). |
| 7 | Sign in with **new** password. | Success, redirect to `/`. |

**Pass:** Reset email received, new password works, old password does not.

---

## Scenario 5: Update password (while logged in)

**Goal:** Logged-in user can change password from the header.

| Step | Action | Expected result |
|------|--------|-----------------|
| 1 | Sign in. Click “Password” in the header. | Navigate to `/update-password`. |
| 2 | Enter new password and confirm, submit. | “Password updated” then “Continue”. |
| 3 | Sign out, sign in with the new password. | Success. |

**Pass:** Password change works and new password is required for next sign in.

---

## Scenario 6: Admin — list users and impersonate

**Goal:** Platform admin can open admin and impersonate another user.

| Step | Action | Expected result |
|------|--------|-----------------|
| 1 | Sign in as a platform admin. | Header shows “Admin” link. |
| 2 | Open `/admin`. | Table of users (email, name, admin, actions). |
| 3 | Click “Impersonate” for another user (not yourself). | Redirect to `/`, banner “Impersonating &lt;email&gt;”, “Stop impersonating” visible. |
| 4 | Check header. | Shows impersonated user’s email. |
| 5 | Click “Stop impersonating”. | Banner gone, header shows admin’s email again. |

**Pass:** Impersonation starts and stops correctly.

---

## Scenario 7: Admin — send password reset

**Goal:** Admin can trigger a password reset for a user (link generated or email sent).

| Step | Action | Expected result |
|------|--------|-----------------|
| 1 | Sign in as platform admin, open `/admin`. | User list with “Send reset” per row. |
| 2 | Click “Send reset” for a test user. | Loading then a message: either “Reset email sent” (if Resend configured) or instructions to use Supabase Dashboard / set env. |
| 3 | If Resend is configured: check that user’s inbox. | Email with reset link. |
| 4 | If not: open “Manage in Supabase →”, find user, use “Send password recovery”. | Supabase sends the email; user can complete reset as in Scenario 4. |

**Pass:** Admin can trigger reset; either in-app email or Supabase Dashboard path works.

---

## Scenario 8: Auth callback error handling

**Goal:** Invalid or expired callback code does not crash; user sees an error.

| Step | Action | Expected result |
|------|--------|-----------------|
| 1 | Open `/auth/callback?code=invalid&next=/`. | Redirect to `/login?error=...` with an error message (e.g. “link has expired”). |
| 2 | Login page. | Error message visible. |

**Pass:** No 500; user lands on login with error.

---

## Scenario 9: Non-admin cannot access admin

**Goal:** Only platform admins can open `/admin`.

| Step | Action | Expected result |
|------|--------|-----------------|
| 1 | Sign in as a user who is **not** platform admin. | No “Admin” in header. |
| 2 | Manually open `/admin`. | Redirect to `/` (or login if not signed in). |

**Pass:** Non-admin cannot see or use admin.

---

## How to run the test suite (manual)

1. Start the app: `npm run dev` (or use production URL).
2. Run scenarios in order (1 → 9), or run only the ones you care about (e.g. 1, 2, 4, 6).
3. For each scenario, tick “Pass” only if all steps match the expected results.
4. After changing auth code or Supabase config, re-run at least 1, 2, 4, and 6.

---

## Automated tests (Vitest)

Run:

```bash
npm run test
```

This runs unit tests for auth-related logic (e.g. cookie parsing, Supabase client creation). Full E2E (browser) is not included; use the scenarios above for that.

---

*See also: `AUTH_AND_USERS.md` for flow details and Supabase configuration.*
