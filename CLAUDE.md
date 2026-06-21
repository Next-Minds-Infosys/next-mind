@AGENTS.md

# Next Minds — IT Training Institute Website

## Project Overview
Next Minds is a marketing and enrollment website for an IT training institute in Kathmandu, Nepal. It serves individual learners (course listings, enrollment) and organizations (enterprise training partnerships).

## Tech Stack
- **Framework:** Next.js 16.2.9 (App Router) — see AGENTS.md for breaking changes vs. earlier versions
- **Runtime:** React 19.2.4
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 — PostCSS plugin approach, no `tailwind.config.js`
- **Icons:** lucide-react
- **Images:** `next/image`; `images.unsplash.com` is the only configured remote pattern

## Directory Structure
```
src/
  app/
    layout.tsx                    # Root layout — site metadata, body antialiasing
    page.tsx                      # / → SiteLayout + HomePage
    globals.css                   # Tailwind v4 @import + base body styles
    courses/[courseId]/page.tsx   # /courses/:id — dynamic, params is a Promise
    enterprise/page.tsx           # /enterprise
  components/
    SiteLayout.tsx      # Server: Navbar + <main> + Footer
    Navbar.tsx          # Client: fixed nav, course dropdown, mobile menu
    Footer.tsx          # Server: dark footer
    HomePage.tsx        # Client: all home page sections
    EnterprisePage.tsx  # Client: enterprise page content
    CoursePageContent.tsx  # Client: tabbed course detail view
    EnrollModal.tsx     # Client: enrollment form modal
  data/
    courses.ts          # Course[] data, Course interface, getCourseById(), courseNavItems
public/
  next-minds-logo.png   # Site logo (used in Navbar and Footer)
```

## Conventions
- **"use client"** on every interactive component; page files and SiteLayout stay as server components
- **Imports:** always use the `@/` alias (maps to `src/`)
- **Dynamic params:** Next.js 16 makes `params` a `Promise` — always `await params` in async page components
- **Design tokens:** teal-500 → blue-600 gradient for all primary CTAs and icon backgrounds; `max-w-7xl mx-auto` for page containers; `rounded-full` for pill buttons
- **Forms:** currently UI-only — submit handlers `console.log` the data and show an `alert`; no backend API exists

## Course IDs
`mern-stack` · `python-django` · `ui-ux-design` · `flutter-development` · `digital-marketing` · `data-science-ai`

## Development Commands
```bash
npm run dev    # Dev server → http://localhost:3000
npm run build  # Production build
npm run start  # Serve production build
npm run lint   # ESLint
```

## Adding a New Course
1. Append a `Course` object to the `courses` array in `src/data/courses.ts`
2. Add the `courseId` to `generateStaticParams()` in `src/app/courses/[courseId]/page.tsx`
3. Add the course title to `courseOptions` in `src/components/EnrollModal.tsx`

## Adding a New Page
1. Create `src/app/<route>/page.tsx` — import `SiteLayout` and wrap the page content
2. Add a link to `Navbar.tsx` (desktop nav + mobile nav block) and `Footer.tsx` if needed
