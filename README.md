# Next Minds

Next.js site + **admin dashboard** for [Next Minds Infosys](https://www.nextmindsinfosys.com/) — IT training institute in Kathmandu, Nepal.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Sequelize** + PostgreSQL
- better-auth (email/password) with role-gated portals — ADMIN, EDITOR, INSTRUCTOR, STUDENT

## Setup

```bash
pnpm install
# ensure Postgres is running (next-mind-postgres on :5434)
pnpm db:sync
pnpm db:seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Admin: [http://localhost:3000/admin](http://localhost:3000/admin) (login required).

Set `ADMIN_EMAIL` / `ADMIN_PASSWORD` and `DATABASE_URL` in `.env`.

## Portals

Four roles, each landing in their own portal after login — admin/editor at `/admin`, instructor at
`/instructor`, student at `/student`. See **[docs/ROLES.md](docs/ROLES.md)** for the full
breakdown of what each role can do.

Public forms (`/api/enroll`, `/api/contact`, `/api/enterprise-contact`) persist via Sequelize and
email notify; they show up in the admin dashboard as Enrollments/Contacts/Enterprise Inquiries.

## Scripts

| Script | Purpose |
|--------|---------|
| `pnpm db:sync` | Apply `src/db/schema.sql` if tables missing |
| `pnpm db:seed` | Seed admin user + courses |
| `pnpm dev` | Dev server |
