# Option B: Supply bootstrap (MVP spec)

**Participant → “Become organiser” request → Admin approval → Organiser can create classes. No instant public publishing by participants.**

This spec defines the supply bootstrap for SportHub MVP: roles and permissions, core user flows (empty state, become organiser, admin review, approved organiser), data model, backend/API design, UX navigation, rollout phases, and validation plan. It aligns with the existing stack (Next.js App Router, Supabase Auth, Prisma, tRPC) and with [USER_INTERACTION_AND_PERMISSIONS.md](USER_INTERACTION_AND_PERMISSIONS.md).

**Product intent:** Participant-first app, stronger supply creation, safe moderation in early stage. Participants cannot directly publish classes; organiser status and class visibility are gated by approval.

---

## 1. User roles and permissions

### 1.1 Roles (summary)

| Role | Definition |
|------|------------|
| **Participant** | Default after signup. Can discover PUBLISHED classes, book, manage profile, submit “Become organiser” and “Request a class”, subscribe to “Notify me”. Cannot create club, create class, or publish class. |
| **Organiser** | Owner / Admin / Coach / Staff in at least one Organisation. After approval: can create club (org), create/edit/delete class (DRAFT), and—per publish policy below—request publish or publish if allowed. |
| **Platform Admin** | `Account.isPlatformAdmin = true`. Can approve/reject organiser requests, (optionally) approve class publish, access admin panel, impersonate. |

### 1.2 Explicit rules

| Capability | Who | Rule |
|------------|-----|------|
| **Request organiser access** | Participant (logged in) | Any participant can submit one OrganiserApplication per account; duplicate pending requests blocked. |
| **Create club (Organisation)** | Platform Admin only (on approve), or Organiser after approval | Club is created when admin approves an OrganiserApplication: admin creates Organisation + OrganisationMember(OWNER) for applicant. No self-serve org creation before approval. |
| **Create class** | Organiser (OWNER/ADMIN/COACH of an org) | Only after the user has at least one approved organisation. Class is created in DRAFT. |
| **Edit / delete class** | Organiser (for own org’s classes) | Edit/delete allowed for DRAFT or PUBLISHED; delete sets status to CANCELLED or removes per policy. |
| **Publish class** | **Controlled in MVP:** Platform Admin only | Participant cannot publish. Organiser can create and save DRAFT only; only Platform Admin can set `Class.status` to PUBLISHED. (Alternative: organiser can “Submit for review” and admin approves publish—same net effect: no public publish without admin.) |
| **Approve / reject organiser requests** | Platform Admin only | Only `isPlatformAdmin` can approve (create org + OWNER) or reject OrganiserApplication. All actions audited. |

**Rule: participant cannot directly publish classes.** No role that a participant gets without going through “Become organiser” + admin approval can set a class to PUBLISHED. Publish is an explicit admin action (or admin-approved flow) in MVP.

---

## 2. Core user flows (screen-by-screen)

### 2.A Empty state when no offers

**When:** Discovery list (home or `/discover`) has zero PUBLISHED classes (optionally scoped by city/filter).

**Screen:**

- **Message:** “No classes in your area yet” (or “No classes match your filters” if filters applied).
- **CTAs:**
  1. **Request a class** — Opens “Request a class” flow (see 2.A.1).
  2. **Become an organiser** — Links to “Become organiser” flow (see 2.B).
  3. **Notify me** — Opens email/subscription for “when classes are added” (see 2.A.2).

**Entry points:** Discovery page empty state; optional short prompt in header/footer (“No classes yet? Request one or list your club.”).

**Success states:**

- “Request a class” submitted → “Thanks, we’ll use this to prioritise new classes.”
- “Become an organiser” submitted → “Request received; we’ll review shortly.”
- “Notify me” submitted → “We’ll email you when new classes are added.”

**Error states:** Validation errors on form; duplicate “Become organiser” pending → “You already have a pending request.” Generic error: “Something went wrong; please try again.”

**Next actions:** Show link to “My requests” (for organiser request status) or “Account” where relevant.

**2.A.1 Request a class (participant demand capture)**

- **Screen:** Form: sport type (optional), city/area (optional), short “What would you like?” (optional). Submit → create ClassRequest (or NotifySubscription with type=request_class).
- **Purpose:** Demand signal for admin/organisers; no immediate supply change. Optional for Phase 1.

**2.A.2 Notify me**

- **Screen:** Email (prefilled if logged in), optional city/sport. Submit → create NotifySubscription (e.g. type=new_classes, city/sport optional).
- **Purpose:** Re-engage when supply exists. Used in empty state and optionally elsewhere.

---

### 2.B Participant → Become organiser flow

**Entry:** “Become an organiser” / “List your club” in empty state, footer, or account/dashboard.

**Form fields (MVP):**

- Organisation name (required)
- Short description (required, max length)
- Contact email (prefilled from account)
- Optional: website, city (for discovery later)

**Submit:** Create `OrganiserApplication` with status `SUBMITTED`. One pending application per account; if one exists, show status instead of form.

**Status lifecycle:**

| Status | Meaning | What user sees |
|--------|---------|----------------|
| SUBMITTED | Request received | “Request received. We’ll review shortly.” + “View status” → “Pending review.” |
| IN_REVIEW | Admin is reviewing | “Your request is being reviewed.” (same UI as submitted for MVP) |
| APPROVED | Admin approved | “You’re approved! Set up your club and add your first class.” + CTA to organiser onboarding (create location, create class draft). |
| REJECTED | Admin rejected | “Your request wasn’t approved.” + optional reason if admin provided. Option to reapply later (new application). |

**Screens:**

1. **Form** — `/become-organiser` or modal. Submit → success message + redirect to “My requests” or status page.
2. **My requests** — List user’s OrganiserApplication(s) with status and date. Approved → show “Go to Your club” CTA.
3. **Approved landing** — After approval, redirect to organiser area: create/claim club (in MVP admin creates org on approve, so “Set up your club” = add location + first class draft).

**Error states:** Validation (name/description required); duplicate pending → “You already have a pending request. View status.”

---

### 2.C Admin review flow

**Entry:** Admin panel `/admin` → “Organiser requests” (new section or tab).

**Queue / list UI:**

- Table or list: applicant email, organisation name, description, submitted date, status (Submitted / In review / Approved / Rejected).
- Filter: Pending (SUBMITTED + IN_REVIEW), Approved, Rejected.
- Row actions: Approve, Reject.

**Approve:**

- Action: Create Organisation (name, description from application); create OrganisationMember(accountId=applicant, organisationId, role=OWNER); set OrganiserApplication.status = APPROVED, reviewedById = admin, reviewedAt = now.
- Audit: AuditLog entry (action=organiser_application_approved, accountId=admin, targetType=OrganiserApplication, targetId=id, metadata={ applicantId, organisationId }).
- Success: Toast “Approved”; list refreshes. Applicant sees APPROVED in “My requests” and can access organiser flow.

**Reject:**

- Action: Set OrganiserApplication.status = REJECTED, reviewedById, reviewedAt, optional rejectionReason (text).
- Audit: AuditLog (action=organiser_application_rejected, accountId=admin, targetId=id, metadata={ applicantId, reason? }).
- Success: Toast “Rejected”; list refreshes. Applicant sees REJECTED and optional reason.

**Audit requirements:** Every approve/reject records admin id, target application id, timestamp, and relevant metadata. Impersonation: if admin is impersonating, audit must record both real and effective actor.

---

### 2.D Approved organiser flow

**Create club:** In MVP, club (Organisation) is created by admin on approve. Organiser sees “Your club” with the approved org name and can add locations and classes.

**Create class (draft first):**

- Screen: Organiser dashboard → “Classes” → “New class”. Form: title, sport type, start/end time, location (from org’s locations), capacity, optional description, price. Submit → create Class with status **DRAFT**.
- Organiser can edit/delete draft. Draft is not visible in public discovery.

**Publish policy for MVP (chosen approach): Admin-approved publish**

- **Choice:** Only Platform Admin can set a class to PUBLISHED. Organiser cannot self-publish.
- **Justification:** At ~200 MAU and early supply bootstrap, quality and safety are higher with a single gate. Prevents accidental or low-quality public listings and keeps moderation burden explicit. Organisers still get full value from creating and managing drafts; admin review is a small, scalable step before classes go live.
- **Flow:** Organiser saves class as DRAFT and (optional) clicks “Submit for review” or admin periodically reviews “Draft classes” in admin and publishes. Either way: only admin can set status to PUBLISHED. Optional: “Request publish” button on draft → notifies admin or creates a simple “publish request” queue in admin.

**Alternative (documented but not chosen for MVP):** “Controlled publish” where organiser can publish but with rate limit (e.g. max 2 published per week) or post-publish review. Deferred to Phase 3 if needed.

**Screens (organiser):**

- “Your club” → Org name, “Locations”, “Classes”.
- “Classes” → List of classes (DRAFT + PUBLISHED); “New class”; edit/delete.
- “New class” / “Edit class” → Form; save as DRAFT; “Submit for review” (optional) or “Draft saved. An admin will review for publishing.”

**Success / error:** Draft saved → “Class saved as draft.” Validation errors → inline. No “Publish” button for organiser in MVP.

---

## 3. Data model proposal (MVP-focused)

Minimal Prisma additions. Existing: Account, Organisation, OrganisationMember, Location, Class, Booking, AuditLog.

### 3.1 OrganiserApplication

Purpose: “Become organiser” request and approval lifecycle.

```prisma
model OrganiserApplication {
  id              String    @id @default(uuid())
  accountId       String
  organisationName String
  description     String
  contactEmail    String
  website         String?
  city            String?
  status          OrganiserApplicationStatus @default(SUBMITTED)
  reviewedById    String?
  reviewedAt      DateTime?
  rejectionReason String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  account     Account  @relation(fields: [accountId], references: [id])
  reviewedBy  Account? @relation("ReviewedApplications", fields: [reviewedById], references: [id])

  @@index([accountId])
  @@index([status])
}

enum OrganiserApplicationStatus {
  SUBMITTED
  IN_REVIEW
  APPROVED
  REJECTED
}
```

- **Account** (existing model): add `organiserApplications OrganiserApplication[]` and `reviewedOrganiserApplications OrganiserApplication[] @relation("ReviewedApplications")` so applicants and reviewers are linked.

### 3.2 ClassRequest (optional for Phase 1)

Purpose: “Request a class” demand capture from participants.

```prisma
model ClassRequest {
  id        String   @id @default(uuid())
  accountId String?
  sportType String?
  city      String?
  note      String?
  createdAt DateTime @default(now())

  account Account? @relation(fields: [accountId], references: [id])
}
```

- **Account** relation: add `classRequests ClassRequest[]`. Optional: implement in Phase 1 only if empty-state “Request a class” is in scope.

### 3.3 NotifySubscription (optional for Phase 1)

Purpose: “Notify me when classes are added” (and optionally “request a class”).

```prisma
model NotifySubscription {
  id        String   @id @default(uuid())
  email     String
  accountId String?
  type      NotifySubscriptionType @default(NEW_CLASSES)
  city      String?
  sportType String?
  createdAt DateTime @default(now())

  account Account? @relation(fields: [accountId], references: [id])

  @@index([email, type])
}

enum NotifySubscriptionType {
  NEW_CLASSES
  REQUEST_CLASS
}
```

- **Account** relation: add `notifySubscriptions NotifySubscription[]`. Optional for Phase 1; can be Phase 2.

**Ownership and timestamps:** All models have createdAt; OrganiserApplication has reviewedAt and reviewedById for audit. AuditLog already exists for approve/reject and publish actions.

---

## 4. Backend / API design

### 4.1 tRPC procedures and server actions

| Flow | Procedure / action | Auth | Description |
|------|--------------------|------|-------------|
| List discovery (public) | `discovery.listClasses` | public | Already exists; only PUBLISHED. |
| Submit organiser application | `organiser.apply` or server action `submitOrganiserApplication` | protected | Validate fields; one pending per account; create OrganiserApplication(SUBMITTED). |
| List my applications | `organiser.getMyApplications` | protected | Return current user’s applications with status. |
| Admin: list applications | `admin.listOrganiserApplications` | admin | Filter by status; include applicant email/name. |
| Admin: approve | Server action `approveOrganiserApplication(id)` | admin | Create Organisation + OWNER membership; set application APPROVED; audit log. |
| Admin: reject | Server action `rejectOrganiserApplication(id, reason?)` | admin | Set REJECTED, rejectionReason; audit log. |
| Organiser: create class | `organiser.createClass` or action | organiser | Check user has org with OWNER/ADMIN/COACH; create Class(status=DRAFT). |
| Organiser: update class | `organiser.updateClass` | organiser | Same check; allow only DRAFT/CANCELLED/COMPLETED edits; do not allow setting PUBLISHED. |
| Admin: publish class | Server action `publishClass(classId)` | admin | Set Class.status = PUBLISHED; audit log. |
| Request a class (optional) | `classRequest.create` | public or protected | Create ClassRequest. |
| Notify me (optional) | `notifySubscription.create` | public or protected | Create NotifySubscription; dedupe by email+type if needed. |

### 4.2 Server-side authz checks

- **No client trust:** Every mutation and sensitive query checks server-side: session from Supabase, then getOrCreateAccount, then role (isPlatformAdmin or org membership for organiser). Never rely on client-sent “I am organiser” or “I am admin”.
- **Organiser procedures:** Resolve effective user’s OrganisationMember rows; allow action only if resource (class/org) belongs to one of those orgs. For create class: require at least one org with role OWNER, ADMIN, or COACH.
- **Publish:** Only in admin action or admin-only tRPC mutation; organiser procedures must never set status to PUBLISHED.

### 4.3 Validation and anti-abuse

- **Rate limit:** Submit organiser application: max 1 pending per account; optional rate limit (e.g. 3 applications per account per 30 days) to avoid spam.
- **Duplicates:** Before creating OrganiserApplication, check for existing SUBMITTED or IN_REVIEW for same accountId; return friendly error.
- **Moderation:** Admin review is human-in-the-loop; no auto-approve in MVP. Optional: store admin notes on application (metadata or field) for internal use.

---

## 5. UX navigation model

- **Participant (default):**  
  - Header: Logo, Discover, (My bookings if logged in), Account, Sign in/up or Log out.  
  - Footer: “Become an organiser”, optional “Request a class”.  
  - Empty discovery: CTAs as in 2.A (Request a class, Become organiser, Notify me).  
  - No “Your club” or “Admin” in nav.

- **Organiser (after approval):**  
  - Header: same as participant + “Your club” (or “Dashboard”) → Classes, Locations, (Settings later).  
  - Role badge: “Club owner” or “Organiser”.  
  - Onboarding prompt after first login post-approval: “Add your first location” and “Create your first class (draft).”

- **Platform Admin:**  
  - Header: same + “Admin” → Users, **Organiser requests**, (Draft classes / Publish queue if implemented).  
  - Role badge: “Admin”.

- **Role-aware CTAs:**  
  - “Become an organiser” visible only to participants (no organiser membership). If user has pending application, show “View request status” instead of “Become an organiser” on primary CTA.  
  - Organiser dashboard shows “New class” and draft list; no “Publish” button (admin only).

---

## 6. Rollout plan

### Phase 1: Empty-state + request capture

- **Scope:** Empty state on discovery with message and CTAs: “Request a class” (optional), “Become an organiser”, “Notify me” (optional). Backend: OrganiserApplication model and submit flow; optional ClassRequest / NotifySubscription.
- **Acceptance criteria:**  
  - When no PUBLISHED classes exist, user sees empty state with the three CTAs.  
  - “Become an organiser” form submits and creates OrganiserApplication(SUBMITTED); user sees success and can see “My requests” with status.  
  - Duplicate pending request is blocked with clear message.  
  - Optional: “Notify me” and “Request a class” create records and show success.

### Phase 2: Organiser approvals + club/class creation

- **Scope:** Admin queue for OrganiserApplication; approve (create Organisation + OWNER) and reject with reason. Approved organiser: “Your club” with org name; create Location; create Class (DRAFT only). No publish by organiser.
- **Acceptance criteria:**  
  - Admin sees list of applications; can Approve or Reject with optional reason.  
  - On Approve, Organisation and OrganisationMember(OWNER) are created; application status APPROVED; applicant sees approved and can access organiser area.  
  - Organiser can create a location and create a class (DRAFT). Draft does not appear in public discovery.  
  - All approve/reject and (later) publish actions are in AuditLog.

### Phase 3: Publish moderation tuning

- **Scope:** Admin UI to list DRAFT classes and set status to PUBLISHED (and optionally reject/archive). Optional: “Submit for review” from organiser and simple queue for admin.
- **Acceptance criteria:**  
  - Admin can see draft classes (all or per org) and publish them.  
  - Once PUBLISHED, class appears in discovery.  
  - Optional: organiser sees “Submitted for review” or “Published” state; no self-serve publish.  
  - Revisit rate limits or “controlled publish” (e.g. allow organiser publish with limit) only if product decision changes.

---

## 7. Validation plan (KPIs and events)

Track the following for product and moderation tuning:

| KPI / event | Description | Use |
|-------------|-------------|-----|
| **Empty-state exposure rate** | Count of discovery page loads where result set is 0 PUBLISHED classes (optionally by city/filter). | Measure how often users see empty state; prioritise areas for supply. |
| **Become-organiser conversion** | Count of OrganiserApplication created (SUBMITTED) per day/week; ratio of discovery visitors to applications. | Funnel from participant to supply intent. |
| **Approval-to-first-class time** | Time from OrganiserApplication.reviewedAt (APPROVED) to first Class created (any status) by that account. | Effectiveness of onboarding. |
| **Request-class demand** | Count of ClassRequest (or NotifySubscription type=REQUEST_CLASS) by city, sport, time. | Demand signals for organisers and admin. |
| **Classes published per approved organiser** | Count of PUBLISHED classes per account that has at least one approved OrganiserApplication. | Supply quality and engagement. |
| **Application approval/rejection rate** | Approved vs rejected over time. | Moderation balance and feedback. |

**Implementation:** Emit events from server actions (e.g. application submitted, approved, rejected; class created draft; class published) and aggregate in analytics or logs. MVP can use AuditLog plus simple admin dashboard queries; later integrate with analytics tool.

---

## Summary

- **Roles:** Participant (default), Organiser (after approval), Platform Admin. Explicit rules: only participant can request organiser access; only admin creates club on approve; only organiser creates class (DRAFT); only admin publishes class in MVP.
- **Flows:** Empty state (message + Request a class, Become organiser, Notify me); Become organiser (form → SUBMITTED/IN_REVIEW/APPROVED/REJECTED); Admin review (queue, approve/reject, audit); Approved organiser (create club via admin, create class as DRAFT, no self-publish).
- **Data:** OrganiserApplication (required); ClassRequest and NotifySubscription (optional Phase 1).
- **Backend:** tRPC + server actions with server-side authz; organiser procedures scoped to own orgs; publish only in admin; rate limit and duplicate checks on applications.
- **UX:** Participant nav minimal; organiser nav after approval; admin nav includes Organiser requests and publish flow.
- **Rollout:** Phase 1 empty-state + request capture; Phase 2 approvals + club/class creation (draft only); Phase 3 publish moderation.
- **Validation:** KPIs and events as above for empty-state exposure, become-organiser conversion, approval-to-first-class time, request-class demand, and classes published per approved organiser.

*Aligned with [USER_INTERACTION_AND_PERMISSIONS.md](USER_INTERACTION_AND_PERMISSIONS.md). No code implementation in this spec; implement in small commits with permission and status-transition tests and doc updates.*
