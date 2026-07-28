# Next Minds

Next.js site + **admin dashboard** for [Next Minds Infosys](https://www.nextmindsinfosys.com/) — IT training institute in Kathmandu, Nepal.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Sequelize** + PostgreSQL
- better-auth (email/password) with **ADMIN** role gate

## Setup

```bash
pnpm install
# ensure Postgres is running (next-mind-postgres on :5434)
pnpm db:sync
pnpm db:seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Admin: [http://localhost:3000/admin](http://localhost:3000/admin) (login required; `ADMIN` role only).

Set `ADMIN_EMAIL` / `ADMIN_PASSWORD` and `DATABASE_URL` in `.env`.

## Admin dashboard (`/admin`)

Admin-only. Manages:

- Courses (publish toggle)
- Enrollments
- Contact submissions
- Enterprise inquiries

Public forms (`/api/enroll`, `/api/contact`, `/api/enterprise-contact`) persist via Sequelize and email notify.

## Scripts

| Script | Purpose |
|--------|---------|
| `pnpm db:sync` | Apply `src/db/schema.sql` if tables missing |
| `pnpm db:seed` | Seed admin user + courses |
| `pnpm dev` | Dev server |
