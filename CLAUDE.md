@AGENTS.md

# Next Minds — IT Training Institute Website

## Project Overview
Next Minds is the marketing, enrollment, and admin platform for an IT training institute in Kathmandu, Nepal (nextmindsinfosys.com). It serves individual learners (course listings, enrollment) and organizations (enterprise training partnerships), and includes an authenticated admin dashboard for managing courses, categories, enrollments, and inquiries.

## Tech Stack
- **Framework:** Next.js 16.2.9 (App Router) — see AGENTS.md; read `node_modules/next/dist/docs/` before relying on training-data assumptions. Notable break: middleware lives in `src/proxy.ts`, not `middleware.ts`.
- **Runtime:** React 19.2.4
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 — PostCSS plugin approach, no `tailwind.config.js`
- **UI primitives:** Radix UI (avatar, dialog, dropdown-menu) wrapped in `src/components/ui/`, `class-variance-authority` + `tailwind-merge` (`cn()` in `src/lib/utils.ts`)
- **Icons:** lucide-react
- **Animation:** framer-motion
- **Forms/validation:** react-hook-form + `@hookform/resolvers` + Zod — schemas centralized in `src/lib/schemas.ts` and shared client/server
- **Rich text:** Tiptap (`src/components/admin/rich-text-editor.tsx`) storing markdown via `tiptap-markdown`; rendered with `react-markdown` + `remark-gfm`
- **Data table:** `@tanstack/react-table` (admin list pages)
- **Auth:** better-auth (email/password), backed directly by the `pg` pool — see Auth & Admin below
- **Database:** PostgreSQL via **Sequelize** (hand-written models in `src/db/models/`) — this is the live ORM; do not add Prisma usage (see Database below)
- **Email:** nodemailer via Gmail service (`src/lib/mailer.ts`)
- **Images:** `next/image`; `images.unsplash.com` is the only configured remote pattern

## Directory Structure
```
src/
  app/
    layout.tsx                       # Root layout — site metadata, body antialiasing
    globals.css                      # Tailwind v4 @import + base body styles
    proxy.ts                         # NOT middleware.ts — Next 16 rename. Guards /admin, /account, redirects logged-in users off /login
    api/
      auth/[...all]/route.ts         # better-auth catch-all handler
      contact/route.ts               # POST — ContactSubmission + email notify
      enroll/route.ts                # POST — Enrollment + email notify
      enterprise-contact/route.ts    # POST — EnterpriseInquiry + email notify
    (public)/                        # route group — public marketing site
      page.tsx                       # / → SiteLayout + HomePage
      courses/page.tsx               # /courses → CoursesListing
      courses/[courseId]/page.tsx    # /courses/:slug — dynamic, params is a Promise
      enterprise/page.tsx            # /enterprise
      login/, register/              # better-auth email/password forms
    (admin)/admin/                   # route group — authenticated dashboard, ADMIN role only
      layout.tsx                    # session + role gate (redirects to /login or /)
      page.tsx                      # dashboard home
      categories/, courses/, enrollments/, contacts/, enterprise-inquiries/
                                     # each: page.tsx + actions.ts (server actions) + dialog/form components
    about/, blog/, contact/, partners/, success-stories/, testimonials/
                                      # standalone public pages (no route group)
  components/
    SiteLayout.tsx        # Server: Navbar + <main> + Footer
    Navbar.tsx             # Client: fixed nav, course dropdown, mobile menu
    Footer.tsx              # Server: dark footer
    HomePage.tsx            # Client: all home page sections
    EnterprisePage.tsx      # Client: enterprise page content
    CoursesListing.tsx      # Client: /courses grid
    CoursePageContent.tsx   # Client: tabbed course detail view
    EnrollModal.tsx         # Client: enrollment form modal (react-hook-form + zod, hits /api/enroll)
    ui/                     # Radix-based primitives: button, card, dialog, dropdown-menu, avatar, badge, table, data-table*
    admin/                  # rich-text-editor, status-badge, status-select, confirm-delete-dialog
  data/                     # STATIC content for the public marketing site (not the DB-backed admin data)
    courses.ts              # re-exports v2-courses.json as Course[], + testimonials/success-stories/instructors, getCourseBySlug()
    v2-courses.json, testimonials.json, success-stories.json, instructors.json, blog.json, partners.json
  db/                       # Sequelize layer — source of truth for admin-managed data
    sequelize.ts            # Sequelize instance from DATABASE_URL (falls back to a placeholder so `next build` doesn't require it)
    index.ts                # associations + re-exports of all models
    schema.sql              # bootstrap DDL, applied by `db:sync` if tables are missing
    models/                 # User, Category, Course, Enrollment, ContactSubmission, EnterpriseInquiry, EmailJob (hand-written, Model.init at module scope)
    migrations/             # sequelize-cli migrations (see .sequelizerc — paths point here, not root)
    seed.ts, sync.ts, id.ts
  lib/
    auth.ts, auth-client.ts  # better-auth server config / React client
    schemas.ts               # Zod schemas — single source of truth for form + API validation
    mailer.ts, theme.ts, types.ts (Role, SubmissionStatus, EmailJobStatus enums), utils.ts (cn, slugify)
  generated/prisma/           # LEFTOVER from a prior Prisma setup — unused, do not import from or extend; Sequelize is the live ORM
public/
  next-minds-logo.png   # Site logo (used in Navbar and Footer)
config/config.json        # sequelize-cli DB config (dev/test/production)
docker-compose.yml         # local Postgres (next-mind-postgres, port 5434)
```

## Auth & Admin
- better-auth issues sessions against the `User`/`Session`/`Account`/`Verification` tables (schema in `src/db/schema.sql`, originally Prisma-shaped column names — kept for compatibility).
- `src/proxy.ts` redirects unauthenticated requests away from `/admin/*` and `/account/*`, and bounces logged-in users off `/login`.
- `src/app/(admin)/admin/layout.tsx` additionally checks `session.user.role !== "ADMIN"` and redirects to `/`. Both layers are needed — the proxy only checks for a session cookie, not role.
- Admin server actions (e.g. `admin/courses/actions.ts`) re-check `auth.api.getSession` + role themselves — never trust the layout gate alone from inside a `"use server"` action.
- Seed an admin user via `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars + `pnpm db:seed`.

## Database
- Sequelize is the live ORM. `src/db/sequelize.ts` builds the connection from `DATABASE_URL`; if unset it warns and falls back to a placeholder so `next build` still succeeds (queries fail at runtime instead).
- Models are hand-written TypeScript in `src/db/models/*.ts`, not `sequelize-cli model:generate` output. `.sequelizerc` points `migrations-path`/`seeders-path`/`models-path` at `src/db/`, not the root `migrations/`/`seeders/` directories (those are empty leftovers from initial `sequelize-cli init`).
- `src/generated/prisma/` is dead code from an earlier Prisma-based iteration. The Postgres schema comment ("compatible with previous Prisma migrations") explains the PascalCase table names, but there is no live `@prisma/client` usage — don't reintroduce it.
- Two separate "course" data sources exist and are not synchronized:
  - `src/data/v2-courses.json` (via `src/data/courses.ts`) — static content for the public marketing site (home, /courses, course detail, testimonials, success stories).
  - The Sequelize `Course`/`Category` tables — what the admin dashboard actually creates/edits/publishes.
  - Don't assume editing one affects the other.

## Conventions
- **"use client"** on every interactive component; page files, layouts, and SiteLayout stay as server components where possible
- **Imports:** always use the `@/` alias (maps to `src/`)
- **Dynamic params:** Next.js 16 makes `params` a `Promise` — always `await params` in async page components
- **Design tokens:** teal-500 → blue-600 gradient for all primary CTAs and icon backgrounds; `max-w-7xl mx-auto` for page containers; `rounded-full` for pill buttons
- **Forms:** validated with Zod schemas from `src/lib/schemas.ts` via `zodResolver`, submitted to real API routes/server actions — no more UI-only `console.log`/`alert` stubs. Server-side code must re-`parseInput` even if the client already validated.
- **Route groups:** `(public)` and `(admin)` split public marketing pages from the authenticated dashboard; a handful of public pages (about, blog, contact, partners, success-stories, testimonials) live directly under `app/` outside the group — follow the existing placement for a given page type rather than moving things between groups.
- **UI components:** before adding or editing a button, input, textarea, select, or form, check `.claude/skills/` for the `ui-components` skill (atoms/molecules/elements breakdown of `src/components/ui/` and existing form patterns) and the `design-system` skill (color/spacing/typography tokens). If a skill already covers the primitive you're about to build, use it instead of inventing a new styling convention.

## Development Commands
```bash
pnpm dev         # Dev server → http://localhost:3000
pnpm build       # Production build
pnpm start       # Serve production build
pnpm lint        # ESLint
pnpm db:sync     # Apply src/db/schema.sql if tables are missing
pnpm db:seed     # Seed admin user + courses (needs ADMIN_EMAIL/ADMIN_PASSWORD)
pnpm db:migrate  # Run sequelize-cli migrations (src/db/migrations)
```
Requires Postgres running locally (`docker compose up -d postgres`, port 5434 per `docker-compose.yml`/`.env.example`) plus `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` — see `.env.example` for the full list including SMTP vars for outbound mail.

## Adding a New (Static/Marketing) Course
1. Append an entry to `src/data/v2-courses.json` matching the `Course` interface in `src/data/courses.ts`
2. Confirm/add the slug to any static param generation in `src/app/(public)/courses/[courseId]/page.tsx`
3. It will automatically appear in `EnrollModal`'s course picker (`courses.map`) — no separate list to maintain there

## Adding/Managing a Course via the Admin Dashboard
Use `/admin/courses` (requires ADMIN role) — backed by `createCourse`/`updateCourse` etc. in `src/app/(admin)/admin/courses/actions.ts`, validated by `courseSchema` in `src/lib/schemas.ts`, persisted to the Sequelize `Course` table. This is independent of the static JSON course data above.

## Adding a New Public Page
1. Create `src/app/<route>/page.tsx` (or under `(public)/` if it belongs conceptually with the marketing site) — import `SiteLayout` and wrap the page content
2. Add a link to `Navbar.tsx` (desktop `navLinks` + mobile nav block) and `Footer.tsx` if needed

## Adding a New Admin Section
1. Create `src/app/(admin)/admin/<section>/page.tsx` + `actions.ts` (server actions, gated by `requireAdmin()`-style session+role check)
2. Add the entry to the nav array in `src/app/(admin)/admin/sidebar.tsx`
