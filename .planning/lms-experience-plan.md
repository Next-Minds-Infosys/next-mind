# Next Minds — learning platform experience plan

Assessment of the three portals against what a modern institute LMS is expected
to do, plus a phased function plan. Written 2026-07-30.

Companion to `lms-expansion-plan.md`, which covered the data model and the
video/file pipeline. This one is about what each role can actually *do*.

---

## 1. Where we are

### Admin — strong
Full CRUD across categories, courses, mentors, blog, batches, users, billing and
expenses. Roster management on the batch detail page.

**Gaps**
- Enrolling a student requires the account to already exist. `addStudentToBatch`
  looks up by email and refuses if there is no match, so the real workflow is
  two screens: create in Users, come back, type the email again.
- No visibility of a batch's progress or submission backlog.

### Instructor — thin but functional
Batch list, and a workspace to publish lessons/materials/assignments, grade
submissions and post announcements.

**Gaps**
- No navigation shell — pages are bare, there is no way back out except the
  browser button, and no sign-out.
- No grading queue across batches: ungraded work is only visible by opening each
  batch in turn.
- No roster view (who is in this batch, are they keeping up).

### Student — the weakest of the three
Dashboard is a flat list of batch cards. The batch page stacks four sections:
recorded lessons, files, assignments, messages.

**Gaps — this is the bulk of the work**
- No navigation shell, no sign-out, no profile.
- No sense of progress. Nothing records that a lesson was watched, so neither
  the student nor the instructor can see how far along anyone is.
- No deadline surface. Due dates exist on assignments but are only visible after
  opening the batch, so "what is due this week" cannot be answered.
- No grades view. Scores and feedback are written by the instructor but the
  student sees them only inline, per assignment, inside one batch.
- No payment visibility. Invoices exist and are managed by admin, but a student
  cannot see what they owe or what they have paid.

---

## 2. What a top-tier platform actually provides

Stripping out the things that do not apply to a Kathmandu classroom institute
(marketplace, certificates-as-product, social feeds), the features that matter:

| Capability | Why it matters | Status |
| --- | --- | --- |
| Persistent nav per role | Orientation, sign-out, one click to anywhere | ❌ |
| "What's due" across batches | The single most-used view in any LMS | ❌ |
| Progress tracking per lesson | Motivation for student, early-warning for staff | ❌ |
| Grades & feedback in one place | Students chase this constantly | ❌ |
| Profile & account self-service | Reduces admin support load | ❌ |
| Fee/payment transparency | Removes the most common front-desk question | ❌ |
| Content delivery (video, files) | Core | ✅ |
| Assignment submit + grade loop | Core | ✅ |
| Announcements & replies | Core | ✅ |
| Roster management | Core | ✅ (admin only) |

---

## 3. Function plan by role

### Student
1. **Shell** — sidebar/topbar: Dashboard, My Batches, Assignments, Grades,
   Payments, Profile. Sign-out.
2. **Dashboard** — four tiles (active batches, due this week, awaiting grade,
   outstanding balance), a deadline list ordered by due date, and batch cards
   showing a real completion percentage.
3. **Progress** — mark a lesson complete; percentage derived from
   `LessonProgress` rows over published lessons in the batch.
4. **Grades** — every graded submission across batches, with score, max and
   instructor feedback.
5. **Payments** — their own invoices: number, description, total, paid,
   outstanding, status. Read-only.
6. **Profile** — name, email, role, member since; change password.

### Instructor
1. **Shell** — same component, different links: Dashboard, My Batches, Grading.
2. **Dashboard** — batches taught, students, submissions awaiting grade.
3. **Grading queue** — ungraded submissions across all owned batches.
4. **Roster with progress** — per-student completion and submission count.

### Admin
1. **Create-and-enroll** — one action that creates the account (issuing the
   one-time password) *and* puts them in the batch, from the roster panel.
2. **Batch health** — roster size vs capacity, average progress, ungraded count.

---

## 4. Ordering

**Phase A (this pass)** — the student experience, since it is furthest behind,
plus the admin enrolment friction:
- `LessonProgress` model + migration
- shared portal shell for student and instructor
- student dashboard, grades, payments, profile
- mark-lesson-complete
- admin create-and-enroll

**Phase B** — instructor depth: grading queue across batches, roster with
progress, batch health on the admin side.

**Phase C** — attendance, certificates on completion, notification emails for
new material and approaching deadlines.

---

## 5. Deliberately not doing

- **Certificates** — needs a template and a signing authority decision.
- **Attendance** — the institute runs physical classes; needs a policy on how it
  is captured before building a screen for it.
- **Notifications** — SMTP is configured but unverified in production; sending
  deadline mail from an unproven sender risks the domain's reputation.
