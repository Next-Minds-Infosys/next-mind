# Next Minds — LMS expansion plan

Audit + delivery plan for teacher/student portals, batch content delivery,
assignments, messaging, and a DB-backed blog.

---

## 1. Where the codebase actually is today

**Exists and works**
- `better-auth` email/password, `Role` enum already has `ADMIN | TEACHER | STUDENT`
  (the TEACHER value is migrated but nothing uses it yet)
- Admin panel: courses, categories, mentors, enrollments, contacts, enterprise inquiries
- Course content is structured (`whoIsItFor`, `skills`, `curriculum` JSONB, `faqs` JSONB)
- Public site is DB-backed; every route is `ƒ` dynamic
- zod schemas shared client/server; RHF on the three public forms

**Gaps blocking the request**
| Need | Status |
|---|---|
| Batch / cohort | no model at all |
| Student ↔ batch membership | `Enrollment.userId` exists but Enrollment is a *lead*, not a membership |
| Lessons / recorded video | nothing |
| File materials | nothing |
| Assignments + submissions | nothing |
| Messaging | nothing |
| Blog | static `src/data/blog.json`, no model, no admin CRUD |
| File storage | **no storage dependency at all** |
| Teacher/Student dashboards | do not exist |

**Risks found during the audit**
1. `config.json`'s `development` block hardcodes localhost and ignores `DATABASE_URL`
   — already caused a migration to silently hit the wrong database.
2. `schema.sql` and `migrations/` have drifted (schema.sql already contained
   Category/Mentor/TEACHER). A fresh DB needs manual `SequelizeMeta` seeding.
   **One source of truth is needed** — see §6.
3. `proxy.ts` only checks that a session cookie *exists*; role enforcement lives in
   the layout. That is fine for `/admin` but will not scale to three portals.
4. Email is sent **synchronously inside the request** in all three API routes. An
   `EmailJob` model exists but is unused.
5. No rate limiting on public POST routes.

---

## 2. The video requirement — read this first

The ask is "watch in-app only, no download, strict". **This cannot be fully
enforced.** Anything a browser can decode, a determined user can capture. What is
achievable, in ascending cost:

| Approach | Stops | Does not stop |
|---|---|---|
| Signed short-lived URLs (5–15 min) | link sharing, hotlinking, scraping | devtools capture, `yt-dlp` |
| HLS segmented + per-session token | casual downloads, whole-file grabs | scripted segment reassembly |
| **Commercial DRM** (Widevine/FairPlay) via Mux / Cloudflare Stream | all of the above, browser downloads | screen recording |
| Per-student visible watermark (name + ID burned in) | *sharing*, by attribution | nothing technically |

**Recommendation: Cloudflare Stream or Mux + signed playback tokens + watermark
overlay.** DRM raises the bar; the watermark is what actually deters redistribution,
because leaked footage identifies the leaker. Budget for ~$5–20/mo at this scale.

**Do not** store video in Postgres or on Vercel — no persistent filesystem, and a
~4.5 MB serverless body limit. All uploads must go **direct from browser to storage
via presigned URL**, never through a Next.js route handler.

---

## 3. New data model

```
Batch            id, courseId→Course, name, code, startDate, endDate,
                 schedule, mode(Physical|Online|Hybrid), teacherId→User,
                 capacity, status(UPCOMING|RUNNING|COMPLETED), createdAt

BatchStudent     id, batchId→Batch, userId→User, enrolledAt, status(ACTIVE|DROPPED)
                 UNIQUE(batchId, userId)

Lesson           id, batchId→Batch, title, description, orderIndex,
                 videoAssetId (provider id), videoDuration, publishedAt, createdById

Material         id, batchId→Batch, lessonId→Lesson (nullable), title,
                 storageKey, mimeType, sizeBytes, downloadable(bool), createdById

Assignment       id, batchId→Batch, title, briefMd, dueAt, maxScore,
                 attachmentKey (nullable), createdById

Submission       id, assignmentId→Assignment, userId→User, storageKey,
                 note, submittedAt, score, feedback, gradedById, gradedAt
                 UNIQUE(assignmentId, userId)

Message          id, batchId→Batch, authorId→User, body, parentId→Message (nullable),
                 createdAt              -- threaded: teacher posts, students reply

Post             id, slug UNIQUE, title, excerpt, contentMd, coverKey, category,
                 authorId→User, published, publishedAt   -- replaces blog.json
```

Indexes: `BatchStudent(userId)`, `Lesson(batchId, orderIndex)`,
`Submission(assignmentId)`, `Message(batchId, createdAt)`, `Post(published, publishedAt)`.

**Access rule, enforced server-side on every query:** a student may only read rows
whose `batchId` appears in their `BatchStudent`. A teacher only where
`Batch.teacherId = session.user.id`. Never trust a `batchId` from the client.

---

## 4. Routes

```
/teacher                     dashboard — my batches, pending submissions
/teacher/batches/[id]        roster, lessons, materials, assignments, messages
/teacher/batches/[id]/grade  submission queue

/student                     dashboard — my batches, next deadline
/student/batches/[id]        lessons (player), materials, messages
/student/assignments/[id]    brief, upload, feedback

/admin/blog                  post CRUD (TipTap already in place)
/admin/batches               create batch, assign teacher, manage roster
```

Add `/teacher` and `/student` to `proxy.ts` matcher, and give each route group a
layout that checks the role — mirroring `(admin)/admin/layout.tsx`.

---

## 5. Delivery phases

**Phase 1 — foundations (no user-visible portals yet)**
- [x] `Batch` + `BatchStudent` + `Post` migration, models, associations
- [x] Renamed TEACHER → INSTRUCTOR (enum value renamed in place; both DBs already
      had TEACHER applied, so it could not be edited into the earlier migration)
- [x] `src/lib/access.ts` — `requireRole`, `assertInstructorOwnsBatch`,
      `assertStudentInBatch`, `studentBatchIds`
- [x] `/account` role router, `(instructor)` + `(student)` groups with layout guards
- [x] Instructor and student dashboards reading only their own scoped rows
- [ ] **`/admin/users` — change a user's role.** Blocks everything: `role` is
      `input: false` and defaults to STUDENT, so today promotion needs raw SQL and
      no instructor can reach `/instructor` at all.
- [ ] `Mentor.userId` (nullable) linking the public profile to a login account
- [ ] `/admin/batches` CRUD — create batch, assign instructor, manage roster
- [ ] Blog → `Post` model, `/admin/blog` CRUD, public `/blog` reads the DB

**Phase 2 — content delivery**
- Storage provider wired (R2 or Vercel Blob) with presigned direct upload
- Lesson + Material models; teacher upload UI
- Video provider integration; student player with signed playback + watermark
- Student batch page reads lessons/materials

**Phase 3 — assignments**
- Assignment + Submission models
- Student upload + resubmit-before-due
- Teacher grading queue, score + feedback
- Deadline reminder emails (via the job queue from Phase 4)

**Phase 4 — messaging + backend hardening**
- Threaded Message model, teacher announcement → student reply
- Move email to the existing `EmailJob` table + a cron drain
- Rate limiting, audit log, notification emails

---

## 6. Backend work worth doing regardless

1. **Kill the schema.sql / migrations split.** Make migrations authoritative and
   reduce `schema.sql` to a bootstrap-only artifact (or delete it and let
   `db:migrate` build from empty). The current drift already cost a manual
   `SequelizeMeta` fixup on Neon.
2. **Make `config.json` read `DATABASE_URL` in every environment**, not just
   production — the hardcoded dev block is a live footgun.
3. **Async email.** `EmailJob` exists; use it. API routes should enqueue and return.
   Today a slow SMTP handshake blocks the user's form submission.
4. **Rate limit** `/api/contact`, `/api/enroll`, `/api/enterprise-contact` and the
   auth routes (Upstash Redis or an in-memory limiter to start).
5. **Connection pooling** — Neon's pooler URL is already in use; keep Sequelize
   `pool.max` low (serverless: 1–2) or connections will exhaust under load.
6. **`getSession` is called twice** on admin pages (layout + page). Hoist it.
7. **Soft-delete or restrict** course deletion once enrollments/batches reference it.
8. **Slug collisions** silently create `full-stack-development-2`. Surface a warning
   in the admin form instead.

---

## 7. Decisions — settled

| Question | Decision |
|---|---|
| Storage | **AWS S3** for video and files |
| Video delivery | Served from S3, **watch-only in the platform** |
| Accounts | **Students self-register** at `/register`; admin assigns them to a batch |
| Batch ↔ course | **One course per batch** |

### What "watch-only on S3" means in practice

S3 alone has no DRM and no streaming layer, so protection comes from keeping the
URL short-lived and never handing the file to the browser as a download:

- objects stay **private** (bucket blocks all public access); the player receives a
  **presigned GET valid ~10 minutes**, minted per request after the server has
  confirmed the viewer is in that batch
- presign with `ResponseContentDisposition=inline` so the browser plays rather than
  saves it
- `<video controlsList="nodownload" disablePictureInPicture>` and a
  `contextmenu` handler — cosmetic, but removes the obvious right-click path
- **burn a watermark** (student name + id) over the player

This is the weakest of the tiers in §2 and is **defeatable**: within the URL's
lifetime the file can be fetched with devtools or `curl`. It stops link sharing and
casual saving, not a determined user. Upgrade path if that becomes a problem:
put CloudFront in front of S3 with signed cookies, then HLS + segment encryption.

**Deferred consequence:** because there is no transcoding step, uploads must be
web-playable as-is — H.264/AAC MP4. A teacher uploading a `.mov` or HEVC file will
produce a video that silently fails in some browsers. Either constrain the upload
(validate codec client-side) or add MediaConvert later.
