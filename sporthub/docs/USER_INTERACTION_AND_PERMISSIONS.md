# User interaction and permissions design

**SportHub — participant-first product strategy**

This document defines the complete user interaction and permissions flow for SportHub: roles, permission matrix, user journeys, role upgrade flows, impersonation rules, UX navigation, edge cases, data model additions, backend authorization, audit rules, and rollout plan. It is design/spec only; implementation follows in separate work.

**Context:** Next.js App Router, Supabase Auth, Prisma, tRPC. Existing concepts: Account, Organisation, OrganisationMember (OrgRole: OWNER, ADMIN, COACH, STAFF), Class, Booking, AuditLog. Existing capability: platform admin, impersonation, account/profile, auth flows.

**Assumptions (explicit):**

- Primary audience is class participants (~200 MAU target); secondary is organisers (club owners/staff); platform admin has full permissions and can impersonate all.
- Organisations are “clubs” or venues; one Organisation can have many Locations; Class is created by an OrganisationMember (organiser).
- Payment is out of scope for MVP (paymentRequired, priceCents, paymentStatus exist in schema but pay-at-venue or external payment is assumed for later).
- “Become organiser” is request-based with admin (or delegated) approval for MVP; no self-serve org creation without approval.

---

## 1. Principles

1. **Participant-first.** Default experience is for someone who wants to discover and join classes. Friction for signup, discovery, and booking must be minimal. Organiser and admin features stay secondary in IA and entry points.
2. **Least privilege.** Default role is Participant. Organiser and admin capabilities are explicitly granted; no escalation without approval or admin action.
3. **Server-side authority.** All permission checks are enforced on the server (tRPC procedures, server actions). Client role flags and UI visibility are derived from server state and must not be trusted for access control.
4. **Auditability.** Privileged actions (role changes, impersonation, approval/rejection, suspension) are recorded in AuditLog with real actor and, when applicable, effective (impersonated) actor.
5. **Clear role identity.** Users always see their effective role (Participant / Club owner / Admin) and, when impersonating, a persistent banner so they cannot confuse context.
6. **Graceful degradation.** Empty states, error states, and trust/safety messaging are specified so UX stays predictable and safe.

---

## 2. Roles

| Role | Definition | How assigned | Display label |
|------|------------|--------------|---------------|
| **Participant** | Default after signup. Can discover classes, view class details, book, cancel, manage own profile. | Every Account is a participant; no extra assignment. | “Participant” (or no badge in participant-first UI). |
| **Organiser Owner** | OWNER in at least one Organisation. Full control over that org: locations, classes, members, roles. | OrganisationMember.role = OWNER; granted after approval of “become organiser” request or by existing owner/admin. | “Club owner” (or “Organiser”). |
| **Organiser Admin** | ADMIN in at least one Organisation. Can manage classes and bookings for that org; role management may be restricted (see matrix). | OrganisationMember.role = ADMIN; invited by OWNER or ADMIN of that org. | “Club owner” or “Organiser” (same as owner in simple MVP). |
| **Organiser Coach** | COACH in at least one Organisation. Can create/run classes and manage attendance for that org; typically no org-level settings. | OrganisationMember.role = COACH; invited by OWNER/ADMIN. | “Coach” or “Staff”. |
| **Organiser Staff** | STAFF in at least one Organisation. Limited to assigned duties (e.g. check-in, view bookings). | OrganisationMember.role = STAFF; invited by OWNER/ADMIN. | “Staff”. |
| **Platform Admin** | Account.isPlatformAdmin = true. Full platform access: admin panel, user list, role management, impersonation, approve organiser requests, suspend/restore. | Set by another platform admin (or bootstrap). No self-serve. | “Admin”. |

**Priority for display:** If a user has multiple roles, show the highest: Admin > Club owner (Organiser) > Participant. Within “Club owner”, the UI can show “Owner” vs “Admin” vs “Coach” per org when in organiser context.

---

## 3. Permission Matrix

Legend: **Y** = allowed, **N** = not allowed, **O** = allowed only for objects the user owns or is member of (scoped). “Organiser” below means any of Owner/Admin/Coach/Staff in the relevant Organisation.

| Resource | Action | Participant | Organiser Owner | Organiser Admin | Organiser Coach | Organiser Staff | Platform Admin |
|----------|--------|-------------|-----------------|-----------------|-----------------|-----------------|-----------------|
| **Account / Profile** | view own | Y | Y | Y | Y | Y | Y |
| | edit own | Y | Y | Y | Y | Y | Y |
| | view other (minimal for display) | Y (e.g. class organiser name) | Y | Y | Y | Y | Y |
| | view other (full PII) | N | N | N | N | N | Y (admin panel) |
| | edit other | N | N | N | N | N | Y (admin only) |
| **Organisation** | view (public) | Y (name, description for discovery) | Y | Y | Y | Y | Y |
| | view (manage) | N | Y (own orgs) | Y (own orgs) | Y (own orgs) | Y (own orgs) | Y |
| | create | N | N (request only; after approval can “claim” or create) | N | N | N | Y (or via approval) |
| | edit | N | Y (own orgs) | O (if policy: admin can edit) | N | N | Y |
| | delete | N | O (own org; with safeguards) | N | N | N | Y |
| **Organisation membership** | view (list members) | N | Y (own orgs) | Y (own orgs) | Y (own orgs) | O (if allowed) | Y |
| | invite | N | Y (own orgs) | O (if policy) | N | N | Y |
| | assign role | N | Y (own orgs) | O (e.g. cannot assign OWNER) | N | N | Y |
| | remove member | N | Y (own orgs) | O (e.g. not OWNER) | N | N | Y |
| | leave | N | Y (with handover or dissolve rules) | Y | Y | Y | Y |
| **Class** | list (discovery, public) | Y | Y | Y | Y | Y | Y |
| | view (detail) | Y (PUBLISHED) | Y | Y | Y | Y | Y |
| | create | N | Y (own orgs) | O (if policy) | O (if policy) | N | Y |
| | edit | N | Y (own orgs) | O | O (own classes) | N | Y |
| | delete / cancel | N | Y (own orgs) | O | O (own classes) | N | Y |
| | publish / unpublish | N | Y | O | O | N | Y |
| **Booking** | create (join class) | Y (own) | Y | Y | Y | Y | Y |
| | view own | Y | Y | Y | Y | Y | Y |
| | view list (for a class) | N | Y (org classes) | Y | Y | O | Y |
| | cancel own | Y | Y | Y | Y | Y | Y |
| | cancel other | N | Y (org classes) | O | O | O | Y |
| | refund | N | O (if payment integrated) | O | N | N | Y |
| | waitlist | Y (if supported) | Y | Y | Y | Y | Y |
| **Audit log** | view | N | N | N | N | N | Y (admin) |
| | create (system) | N | N | N | N | N | N (server only) |
| **Admin panel** | access | N | N | N | N | N | Y |
| | user search | N | N | N | N | N | Y |
| | role management (platform admin) | N | N | N | N | N | Y |
| | approve organiser requests | N | N | N | N | N | Y |
| | suspend / restore account | N | N | N | N | N | Y |
| **Impersonation** | start | N | N | N | N | N | Y |
| | stop | N | N | N | N | N | Y (only if they started it) |

**Scoping note:** “Own orgs” = organisations where the user has an OrganisationMember row with the appropriate role. “Own classes” = classes whose organiser is the user’s OrganisationMember row (or org they can manage).

---

## 4. User Journeys

### 4.1 Participant

- **Signup / login**  
  Entry: “Sign up” or “Sign in” in header. Screens: `/signup`, `/login`. Success: redirect to `/` (or `?next=` safe path). Empty: no account yet. Errors: show message from `?error=`, invalid credentials, or “Check your email”.

- **Discover classes**  
  Entry: Home or “Discover” in nav. Screen: list of PUBLISHED classes (filters: sport, date, city). Success: list loads with class cards. Empty: “No classes match” + filters. Errors: generic retry.

- **Class details**  
  Entry: Click class card. Screen: class page (title, description, time, location, capacity, spots left). Success: see full details and “Join class” (or “Waitlist”). Errors: 404 or “Class no longer available”.

- **Join class**  
  Entry: “Join class” on class detail. Action: create Booking (CONFIRMED or WAITLIST). Success: confirmation screen/message; “My bookings” or “You’re in”. Errors: full, already booked, class cancelled.

- **Booking confirmation**  
  Entry: After join or from “My bookings”. Screen: booking summary, class details, “Cancel booking” if allowed. Success: clear confirmation. Empty: “You have no upcoming bookings”.

- **Cancel / waitlist**  
  Entry: “Cancel booking” on booking detail or list. Action: update Booking status. Success: “Booking cancelled”. Errors: past class, policy forbids. Waitlist: join waitlist; notify when spot opens (post-MVP).

- **Profile management**  
  Entry: “Account” in header. Screen: `/account` — view/edit name, surname, phone, gender; link to change password. Success: “Saved”. Errors: validation, save failure.

### 4.2 Organiser

- **Become organiser (entry)**  
  Entry: “Become an organiser” / “List your club” in footer or participant dashboard (non-intrusive). Screen: form (club name, description, contact, optional verification info). Submit → request created; status “submitted”. Success: “Request received; we’ll review shortly.” Errors: validation, duplicate request.

- **Create or claim club**  
  After approval: admin (or system) creates Organisation and adds user as OWNER, or links user to existing org. Entry: email/dashboard link or post-approval redirect. Screen: “Your club” / org dashboard placeholder. Success: user sees org and can add locations/classes. Empty: “Add your first location” / “Create your first class”.

- **Verification / approval states**  
  Request statuses: submitted → in_review → approved | rejected. Participant sees “Pending”, “Approved”, “Rejected” (with optional reason). No organiser capabilities until approved.

- **Create / edit / delete class**  
  Entry: Organiser dashboard → “Classes” → “New class” or edit existing. Screens: form (title, sport, start/end, location, capacity, status). Success: class saved (DRAFT or PUBLISHED). Errors: validation, location not in org. Delete/cancel: confirm; class status → CANCELLED or soft-delete per policy.

- **Manage bookings and attendance**  
  Entry: Class detail → “Bookings” or “Attendance”. Screen: list of bookings; actions: cancel booking, mark attended (if needed). Success: list reflects changes. Empty: “No bookings yet”.

- **Manage staff roles**  
  Entry: Org settings → “Team” / “Members”. Screen: list OrganisationMember; invite (email), assign role (ADMIN, COACH, STAFF), remove. Success: member added/updated. Errors: already member, invalid role.

### 4.3 Admin

- **User search**  
  Entry: `/admin` → search/filter by email or name. Screen: table of accounts with role, admin flag, actions. Success: list updates. Empty: “No users match”.

- **Role management**  
  Entry: `/admin` → “Make admin” / “Remove admin” (no self-demotion). Success: toast/refresh. Errors: “You cannot remove your own admin.”

- **Approve organiser requests**  
  Entry: `/admin` → “Organiser requests” (or queue). Screen: list of requests; actions: Approve, Reject (optional reason). Approve: create Organisation + OWNER membership or link to existing org; mark request approved. Success: requester becomes organiser. Reject: status rejected; optional email.

- **Impersonation**  
  Entry: `/admin` → “Impersonate” on a user. Action: set cookie, redirect to `/`. Persistent banner: “Impersonating &lt;email&gt;” + “Stop impersonating”. Stop: clear cookie, redirect. No hiding impersonation state.

- **Suspension / restore**  
  Entry: `/admin` → user row → “Suspend” / “Restore”. Action: set Account.status or equivalent; Supabase disable if needed. Success: user cannot log in (suspended) or can again (restore). Audit: log action with admin id.

**Trust/safety:** All admin actions are logged. Sensitive actions (suspend, role change, approve/reject) show a short confirmation where appropriate. Error states always show a clear message (e.g. “You cannot remove your own admin”) and never expose stack traces to the user.

---

## 5. Role upgrade flows

### 5.1 Participant → Organiser

- **CTA:** “Become an organiser” / “List your club” in footer or a low-friction place in participant UX (not blocking discovery).
- **Request form:** Fields: organisation name, short description, contact email (prefilled if logged in), optional verification (e.g. website, tax id for later). Submit → create `OrganiserRequest` (or equivalent) with status `SUBMITTED`.
- **Statuses:** `SUBMITTED` → `IN_REVIEW` → `APPROVED` | `REJECTED`. User sees status in “My requests” or via email.
- **Approval ownership:** Platform admin (or delegated reviewer) approves/rejects. MVP: admin only.
- **What unlocks:** Only after `APPROVED`: create Organisation (or attach to existing), add user as OrganisationMember with role OWNER. Then user sees organiser entry (dashboard, “Your club”, create class).
- **Assumption:** No self-serve org creation without an approval step for MVP (reduces abuse and keeps quality).

### 5.2 User → Platform Admin

- **No self-serve:** There is no public “Become admin” flow.
- **Grant:** Only an existing platform admin can set `Account.isPlatformAdmin = true` for another user (e.g. via `/admin` “Make admin”).
- **Bootstrap first admin:** One-time: set first admin via DB (Prisma Studio or migration/script) or a one-time secure script that creates an admin by email. Document in runbook; no UI for bootstrap.
- **Self-demotion:** Server enforces: admin cannot remove their own admin flag. If last admin, consider guardrails (e.g. require at least one admin; block demotion if that would leave zero admins).
- **Audit:** Every grant/revoke of platform admin is recorded in AuditLog (actor, target, action, timestamp).

---

## 6. Impersonation rules

- **Who:** Platform admin only. No organiser or participant impersonation.
- **Visibility:** When impersonating, a persistent banner is always visible (e.g. “Impersonating user@example.com” and “Stop impersonating”). It cannot be dismissed or hidden.
- **Audit:** All actions during impersonation record both the real actor (admin) and the effective actor (impersonated user) in AuditLog (`accountId` = real, `impersonatingId` = effective, or equivalent). Start/stop impersonation are explicit audit events.
- **Start/stop:** Start = set cookie (or session) with target account id and redirect to home. Stop = clear cookie, redirect. Only the admin who started can stop (single active impersonation per admin).
- **Restricted actions (optional for MVP):** Consider blocking during impersonation: “Remove admin” for the impersonated user, or “Delete account”. MVP can allow all actions and rely on audit; hardening can restrict sensitive mutations while impersonating.

---

## 7. UX navigation model

- **Participant (default):**  
  - Header: Logo, Discover (or Home), Sign in / Sign up; or if logged in: Discover, My bookings, Account, Log out.  
  - No “Admin” or “Your club” in main nav. Footer: “Become an organiser” (secondary).  
  - Role badge: none or subtle “Participant” in account dropdown only.  
  - Onboarding: optional “Complete your profile” prompt; no blocking.

- **Organiser:**  
  - Header: same as participant plus “Your club” (or “Dashboard”) that expands to org switcher if multiple orgs.  
  - “Your club”: Classes, Locations, Team, Settings.  
  - Role badge: “Club owner” or “Organiser” in header.  
  - Onboarding: “Add your first location”, “Create your first class” prompts when empty.

- **Platform admin:**  
  - Header: participant/organiser items plus “Admin” link to `/admin`.  
  - Role badge: “Admin”.  
  - Admin panel: Users, Organiser requests, Audit log (if exposed). No onboarding prompt needed.

- **When to show “Become an organiser”:** Footer link; optional short prompt after first booking (“Enjoying SportHub? List your club.”). Keep participant flow minimal; do not push organiser upsell on every page.

---

## 8. Edge cases and error states

- **Already booked:** User clicks “Join” on a class they already have a booking for → show “You’re already in this class” and link to “My bookings”.
- **Class full:** Show “Class full” and optional “Join waitlist” if supported.
- **Class cancelled:** Discovery and detail show “Cancelled”; “Join” disabled. Existing bookers see message and optional refund path.
- **Organiser request already submitted:** Show “You already have a pending request” and status; do not create duplicate.
- **Last owner leaving org:** Require transfer of ownership to another member or dissolution of org (define policy); block “Leave” until resolved.
- **Impersonation + admin action:** Banner always visible; audit captures both actors; optional block on “Remove admin” for impersonated account.
- **Session expired / 401:** Redirect to login with return URL; show “Session expired, please sign in again”.
- **403 Forbidden:** Show “You don’t have permission to do that” and link back to safe page (e.g. home or account).
- **Network / server errors:** Generic “Something went wrong; please try again” and retry or home link.

---

## 9. Data model additions (if needed)

MVP-focused; only what’s required for the above.

- **OrganiserRequest (or OrganiserApplication)**  
  - Fields: id, accountId, organisationName, description, contactEmail, status (SUBMITTED | IN_REVIEW | APPROVED | REJECTED), reviewedById, reviewedAt, rejectionReason?, createdAt, updatedAt.  
  - Purpose: “Become organiser” flow; admin approves and then creates Organisation + OWNER or links to existing org.

- **Account.status (optional for MVP)**  
  - Enum: ACTIVE | SUSPENDED. Default ACTIVE.  
  - Purpose: suspend/restore without deleting; can be enforced in middleware or server actions. If not in MVP, suspension can be “disable in Supabase” only.

- **AuditLog**  
  - Already has accountId, impersonatingId, action, targetType, targetId, metadata, createdAt. Ensure all role changes, impersonation start/stop, approval/rejection, suspend/restore write here. No schema change needed if current fields suffice.

- **Inviter/invited (optional)**  
  - For “invited by” on OrganisationMember: add invitedById to OrganisationMember if you want to track who invited whom. Can be post-MVP.

---

## 10. Backend authorization design (tRPC / server actions)

- **Where checks live:**  
  - **tRPC:** Use procedures: `publicProcedure` (no auth), `protectedProcedure` (authenticated), `adminProcedure` (platform admin). Add `organiserProcedure` that resolves effective user’s org memberships and injects allowed org ids; then per-mutation check “does this class/org belong to one of these?”.  
  - **Server actions:** Every action that mutates data or returns sensitive data must: (1) get session (Supabase getUser + getOrCreateAccount), (2) check role/membership server-side, (3) then proceed. Never trust client-sent “I am admin” or “I am owner of org X”.

- **Least privilege:** Default to deny. For each endpoint: list allowed roles; if user is not in that set, return 403. Participant-only endpoints (e.g. “my bookings”) use effective userId only.

- **Anti-escalation:**  
  - Only platform admins can set isPlatformAdmin.  
  - Only OWNER/ADMIN of an org can add/remove members or assign OWNER/ADMIN (OWNER may be the only one who can assign OWNER).  
  - OrganiserRequest approval only by platform admin (or delegated role stored and checked server-side).

- **Audit:** Middleware or helper that logs to AuditLog on: impersonation start/stop, platform admin grant/revoke, organiser request approve/reject, account suspend/restore, and optionally class publish/cancel and booking cancel by organiser.

---

## 11. Audit and security rules

- **Audit log coverage:**  
  - Impersonation: start, stop (actor = admin, target = impersonated account).  
  - Platform admin: grant, revoke (actor = admin, target = account).  
  - Organiser request: approve, reject (actor = admin, target = request id).  
  - Account: suspend, restore (actor = admin, target = account).  
  - Optionally: class publish/cancel, booking cancel by organiser (for dispute resolution).

- **Security rules:**  
  - All auth checks on server; no reliance on client role.  
  - Passwords and tokens only in server env; never log.  
  - Rate limit sensitive actions (e.g. login, password reset, request submit) if needed for MVP.  
  - Supabase RLS: if using Supabase for any direct client access, align RLS with the same permission matrix; for MVP many operations may go through tRPC/actions only.

---

## 12. Rollout plan (MVP → v2)

### MVP (must-have)

- **Scope:** Participant: signup, login, discover classes, class detail, join class, booking confirmation, cancel booking, profile. Organiser: “Become organiser” request form and status; after approval, create/edit class (DRAFT/PUBLISHED), view bookings for own classes; optional: invite one staff (COACH/STAFF). Admin: user list, search, make/remove admin (with self-demotion block), impersonation (with banner and audit), approve/reject organiser requests, optional suspend/restore.
- **Acceptance criteria:**  
  - Participant can complete signup → discover → join → cancel without dead ends.  
  - Organiser request creates a record; admin can approve and user becomes OWNER of an org and can create at least one class.  
  - Admin can impersonate and see persistent banner; all privileged actions logged.  
  - No permission check bypass (manual test + spot checks on tRPC/actions).

### Post-MVP hardening

- Rate limiting on auth and request endpoints.  
- Optional Account.status (ACTIVE/SUSPENDED) and enforce in auth flow.  
- Restrict sensitive actions during impersonation (e.g. block “Remove admin” for impersonated user).  
- Delegated reviewer role for organiser requests (optional).

### v2 enhancements

- Waitlist and notifications (email/in-app) for booking and waitlist.  
- Organiser: payments, refunds, advanced team roles (e.g. COACH can only manage own classes).  
- Participant: “My bookings” dashboard, reminders, repeat booking.  
- Audit log UI for admins (search, filter by action/actor).  
- Optional: verification badges for organisers, reviews/ratings.

---

*Document version: 1.0. Aligns with existing schema and `docs/AUTH_AND_USERS.md`. Implementation guidance is in §10 and §11; data model additions in §9.*
