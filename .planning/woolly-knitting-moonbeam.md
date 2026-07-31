# Add Category model with Category → Course → Enrollment relations, plus admin Categories CRUD

## Context

The admin dashboard (`src/app/(admin)/admin/*`) is backed by hand-written Sequelize models in `src/db/models/*` (not Prisma, despite the compatibility comments — the project migrated off Prisma; see `.sequelizerc` and the "sequelize setup" commit). Today `Course.category` is a free-text string column with no real entity behind it, so there's no way to manage categories, count courses per category, or guarantee a course's category is one of a known set. `Enrollment` already belongs to `Course` (`src/db/models/index.ts` / `src/db/index.ts`), so once `Course` belongs to a real `Category`, enrollments are transitively tied to categories for free.

This plan introduces a `Category` model, makes `Course` belong to it via `categoryId` (replacing the free-text `category` column), and adds a full CRUD "Categories" section to the admin dashboard, matching the existing admin UI conventions (Card/Table/Badge/Button components, server actions gated on `session.user.role === "ADMIN"`).

Scope note: the **public** marketing site (`CoursesListing.tsx`, `src/data/v2-courses.json`) is static marketing data unrelated to the DB — it is out of scope. This plan only touches the Sequelize-backed admin/DB layer.

## Data model changes

**New file `src/db/models/category.ts`** — modeled on `src/db/models/course.ts`:
- `id` (UUID, PK), `name` (STRING, unique, required), `slug` (STRING, unique, required), `description` (STRING, nullable), `createdAt`/`updatedAt`.
- `declare courses?: Course[]` for the reverse association typing.

**`src/db/models/course.ts`** — replace the `category: string` field with `categoryId: string` (UUID, `allowNull: false`). Update `CourseAttributes`/`CourseCreation`/class fields accordingly, add `declare category?: import("./category").Category`.

**`src/db/models/index.ts`** — add `export { Category } from "./category"`.

**`src/db/index.ts`** (the barrel that wires associations, imported as `@/db`) — add:
```ts
Category.hasMany(Course, { foreignKey: "categoryId", as: "courses" });
Course.belongsTo(Category, { foreignKey: "categoryId", as: "category" });
```
and export `Category` alongside `User, Course, Enrollment`.

**`src/db/schema.sql`** (the fresh-install bootstrap run by `src/db/sync.ts`) — add a `Category` table (id/name/slug/description/timestamps, unique indexes on name and slug), change `Course.category` → `Course.categoryId TEXT NOT NULL` with an FK to `Category(id)` (`ON DELETE RESTRICT`), drop the old `category` column.

**New migration `src/db/migrations/<timestamp>-add-category.js`** (plain CommonJS, per `.sequelizerc`'s `migrations-path`, since `db:migrate` runs via `sequelize-cli` without ts-node) for any DB that already has the old schema applied via `db:sync`:
1. Create `Category` table.
2. Add `Course.categoryId` (nullable at first).
3. Backfill: insert one `Category` row per distinct existing `Course.category` value (slug = kebab-cased name), then `UPDATE "Course" SET "categoryId" = ...` joined by name.
4. Alter `categoryId` to `NOT NULL`, add the FK constraint.
5. Drop the old `category` column.
- `down()` reverses this best-effort (re-add `category TEXT`, backfill from the joined `Category.name`, drop `categoryId`/FK, drop `Category` table).

**`src/db/seed.ts`** — before the course loop, collect the distinct `course.category` values from `src/data/courses.ts`, `findOrCreate` a `Category` per name (slug = kebab-case), build a `name → id` map, and use `categoryId: categoryMap.get(course.category)!` in the course payload instead of `category: course.category`.

## Admin UI changes

**New `src/app/(admin)/admin/categories/` section**, following the existing list-page pattern (`admin/courses/page.tsx`, `admin/enrollments/page.tsx`) plus a create/edit form styled like `register-form.tsx` (the only existing form in the codebase — `inputClass`, `Card`, `Button`):

- `page.tsx` — server component. `Category.findAll({ include: [{ model: Course, as: "courses", include: [{ model: Enrollment, as: "enrollments", attributes: ["id"] }] }] })`; render a table with Name, Slug, Course count (`category.courses.length`), Enrollment count (sum of `course.enrollments.length` across its courses), and Edit/Delete actions. "New Category" button linking to `/admin/categories/new`.
- `actions.ts` — `"use server"` actions, each starting with the same `auth.api.getSession` + `role === "ADMIN"` guard used everywhere else:
  - `createCategory({ name, description })` — trims/validates name non-empty, derives slug, checks uniqueness, creates, `revalidatePath("/admin/categories")`.
  - `updateCategory(id, { name, description })` — same validation, re-derives slug.
  - `deleteCategory(id)` — blocks with `{ error: "..." }` if `Course.count({ where: { categoryId: id } }) > 0`; otherwise destroys.
- `category-form.tsx` — client component (`"use client"`), reused by both new/edit pages via props (`initial?: { id, name, description }`, calls `createCategory` or `updateCategory`), mirrors the state/error/loading pattern in `register-form.tsx`.
- `new/page.tsx` and `[id]/edit/page.tsx` — thin server pages rendering `<CategoryForm .../>` (edit page loads the category via `Category.findByPk`, calls `notFound()` if missing).
- `delete-button.tsx` — small client component (confirm dialog + `useTransition`, same shape as `publish-toggle.tsx`) calling `deleteCategory`, showing the returned error inline if blocked.

**`src/app/(admin)/admin/sidebar.tsx`** — add a `Categories` nav entry (`Tags` icon from `lucide-react`) between "Dashboard" and "Courses".

**`src/app/(admin)/admin/page.tsx`** — add a `Category.count()` stat card ("Categories", `Tags` icon) to the existing stats grid, linking to `/admin/categories`.

**`src/app/(admin)/admin/courses/page.tsx`** — update the `Course.findAll` include to also pull `{ model: Category, as: "category", attributes: ["id", "name"] }`; render `course.category?.name` instead of the old `course.category` string; pass `courses`/all-categories list into a new `CategorySelect` client component (mirroring `status-select.tsx`) so an admin can reassign a course's category inline from a dropdown.

**`src/app/(admin)/admin/courses/actions.ts`** — add `updateCourseCategory(courseId, categoryId)`, same auth-guard/`revalidatePath` shape as `toggleCoursePublished`.

## Files touched (summary)
- `src/db/models/category.ts` (new)
- `src/db/models/course.ts`, `src/db/models/index.ts`, `src/db/index.ts`
- `src/db/schema.sql`, `src/db/migrations/<ts>-add-category.js` (new), `src/db/seed.ts`
- `src/app/(admin)/admin/categories/{page.tsx,actions.ts,category-form.tsx,delete-button.tsx,new/page.tsx,[id]/edit/page.tsx}` (new)
- `src/app/(admin)/admin/sidebar.tsx`, `admin/page.tsx`, `admin/courses/page.tsx`, `admin/courses/actions.ts`, new `admin/courses/category-select.tsx`

## Verification
- `npx tsc --noEmit` (or `npm run build`) to catch type errors from the `Course.category` → `categoryId`/association change across all touched files.
- `npm run lint`.
- If a local Postgres dev DB is already set up: run `npm run db:migrate` to apply the new migration (I'll confirm with you before running this against your DB), then `npm run db:seed` to backfill categories from the static course data, then `npm run dev` and click through `/admin/categories` (create/edit/delete) and `/admin/courses` (category shown + reassignable) in the browser.
