# Security & experience audit — 2026-07-30

Evidence-based pass over the whole application. Every finding below was
reproduced, not inferred. Items marked **FIXED** were fixed and verified in this
pass; the rest need a decision or an environment change.

---

## 1. What is already sound

Worth stating plainly, because it narrows where to worry.

| Checked | Result |
| --- | --- |
| Secrets in git history | None. `.env` is ignored; only `.env.example` is tracked |
| Backdoors / auth bypasses | None. No hardcoded credentials, no `SKIP_AUTH`-style switches |
| SQL injection | All 4 raw queries use bound `replacements`; everything else is Sequelize |
| XSS sinks | Zero `dangerouslySetInnerHTML`; `react-markdown` without `rehype-raw`, so HTML in markdown is inert |
| Authorisation | 17/17 cross-role and cross-batch assertions passed (earlier pass) |
| Object storage | Bucket is private; every read goes through `/api/media` after an ownership check |
| Password storage | better-auth hashing; one-time passwords forced to change on first sign-in |
| Login brute force | better-auth's default limiter is active (observed 429s) |

---

## 2. Findings

### 2.1 Dependency vulnerabilities — HIGH, not fixed
`pnpm audit`: **16 vulnerabilities (9 high, 7 moderate)**. Installed `next` is
**16.2.9**; the fixes are in **16.2.11**.

The ones that matter here:

- **Middleware / Proxy bypass in App Router with Turbopack.** `src/proxy.ts` is
  the first auth gate. Server-side `requireRole` still holds, so this is not an
  instant compromise, but a defence layer is bypassable.
- **Unauthenticated disclosure of internal Server Function endpoints.** This is
  real and I used it during testing — action ids are enumerable from the build
  manifest and callable directly.
- SSRF in Server Actions, DoS in Server Actions, cache confusion on requests
  with bodies.
- Also flagged: `sharp` (libvips CVEs), `postcss` (path traversal, arbitrary
  file read), `brace-expansion` DoS — all transitive build-time.

**Action:** `pnpm up next@^16.2.11` then rebuild and re-run the route checks. I
did not do this unprompted: it moves the framework under every route on a tree
with a large amount of uncommitted work.

### 2.2 Open redirect on login — MEDIUM, **FIXED**
`/login?next=` was read from the query string and passed to `router.push()`
verbatim for admins. `?next=https://evil.example` produced a phishing link that
genuinely begins on your domain.

Now only same-site absolute paths are accepted. Verified: absolute URL,
protocol-relative `//host`, and backslash-escape all fall back to `/admin`;
`/admin/users` still works.

### 2.3 HTML injection into notification emails — MEDIUM, **FIXED**
`/api/contact`, `/api/enroll` and `/api/enterprise-contact` interpolated
visitor-supplied `name`, `email`, `phone`, `orgName` and `message` straight into
an HTML mail body. Anyone could put markup — a disguised link, hidden content —
into the mail your staff open. Not site XSS, but injection into a document you
render.

All interpolations now pass through `escapeHtml()` (`src/lib/escape.ts`).

### 2.4 No rate limiting on public write endpoints — MEDIUM, **FIXED**
The three public forms each insert a row **and** send an email, with no
throttle: a shell loop could fill the database and burn the SMTP quota.

Now 5 requests per minute per IP, checked before parsing, writing or mailing
(`src/lib/rate-limit.ts`). Verified: attempts 1–5 succeed, 6+ return 429.

*Caveat, stated honestly:* the counter is in-memory, so on serverless each
instance keeps its own. It raises the cost of abuse rather than eliminating it.
Move to Redis or a `RateLimit` table if volume justifies it.

### 2.5 Upload endpoint accepted any file type or size — MEDIUM, **FIXED**
`/api/uploads` signed a PUT for whatever `contentType` the client asked for. A
student could upload `text/html` as a "submission" and get it served back
through `/api/media` — stored XSS via your own storage. No size cap either.

Per-scope allowlist and size cap added. Verified: HTML and SVG submissions
rejected 415, PDF-as-lesson-video rejected 415, 26 MB material rejected 413;
MP4 lessons, PNG materials and PDF submissions still issue keys.

### 2.6 No security headers — MEDIUM, **FIXED**
`next.config.ts` sent none, so the site was framable (clickjacking), leaked full
referrer URLs cross-origin, and had no transport pinning.

Added `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`,
`Strict-Transport-Security`, and a **Report-Only** CSP. All verified present.

CSP is Report-Only deliberately: the marketing pages use inline `style={{...}}`
throughout and Next injects inline bootstrap scripts, so enforcing without
`'unsafe-inline'` would break the site. Watch the reports, then flip the header
name.

### 2.7 TLS certificate validation disabled on database connections — MEDIUM, open
Both `src/lib/auth.ts` and `src/db/sequelize.ts` set
`ssl: { rejectUnauthorized: false }`. Traffic is encrypted but the server
certificate is not verified, so the connection is open to an active
man-in-the-middle between the app and Neon.

This is the standard workaround for Neon's certificate chain and was my change.
The correct fix is to pin Neon's CA:

```ts
ssl: { ca: process.env.DATABASE_CA_CERT, rejectUnauthorized: true }
```

Needs the CA PEM in an env var. Left as-is rather than silently breaking
production connectivity.

### 2.8 Smaller items
- Password generator uses `b % alphabet.length` over 256 random bytes — a slight
  modulo bias with a 59-character alphabet. Negligible at 14 characters, but
  rejection sampling would be strictly correct.
- Presigned view URLs live 600s. Within that window the object is fetchable
  outside the player — already documented in `lms-expansion-plan.md` §2.
- `/api/media` sets no `Cache-Control`, so a signed redirect could be cached by
  an intermediary.

---

## 3. Experience & modernisation

### 3.1 Fixed in this pass
- **No error boundary.** An unhandled server error rendered Next's unstyled
  default page. Added `src/app/error.tsx` — branded, with a retry, showing only
  the `digest` (which maps to the server log without leaking the message).
- **No 404 page.** Added `src/app/not-found.tsx` with routes back into the site.
- **No loading state.** Every page is dynamic and queries Postgres, so
  navigation sat on a blank screen. Added `src/app/loading.tsx` — a skeleton that
  streams immediately.
- **Missing `alt`** on the mentor thumbnail in admin.

### 3.2 Open, ordered by value
1. **Metadata on 1 of 40 pages; no OpenGraph anywhere.** Course and blog pages
   share badly on social and rank worse than they should. `generateMetadata` per
   course/post is the single highest-value SEO change available.
2. **Privacy Policy and Terms are `href="#"`.** Legal pages that do not exist,
   linked from every page.
3. **No skip-to-content link**, and focus styles are inconsistent — keyboard and
   screen-reader users pay for it.
4. **Everything is `force-dynamic`.** Correct for admin and the portals, wasteful
   for `/about`, `/partners`, `/testimonials`, `/success-stories`, which are
   static content re-rendered per request.
5. **No empty-state guidance** in several admin tables beyond "No X yet".
6. **No audit log.** Who changed a grade, deleted a batch, or issued an invoice
   is unanswerable. For an institute handling fees, this is worth having.

---

## 4. Recommended order

1. `pnpm up next@^16.2.11` — closes 9 high-severity issues (**needs your go-ahead**)
2. Pin the database CA and re-enable certificate verification
3. `generateMetadata` for course and blog pages
4. Write Privacy and Terms, wire up the footer links
5. Make the static marketing pages static again
6. Audit log for grade / invoice / batch mutations
