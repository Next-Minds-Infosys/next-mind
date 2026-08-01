# Next Minds — Modern Redesign Plan

## 0. Current State (baseline, confirmed by codebase audit)

- Sections are plain `Card`/`Badge` grids on flat gradient-tinted backgrounds (`from-teal-50 via-blue-50 to-white`).
- Motion is limited to `fadeUp`/`stagger` scroll-reveals (framer-motion `useInView`) — no hover depth, no background motion, no parallax.
- Backgrounds are static: two blurred circles in the Hero only; every other section is flat white/gray.
- `globals.css` has zero custom keyframes/utilities — everything is inline Tailwind + framer-motion.
- Design tokens already in place and consistently used: `teal-500 → blue-600` gradient (70/57 usages), `max-w-7xl mx-auto` containers, `rounded-full` pills, `rounded-2xl` cards.
- Stack available to build with, no new runtime deps strictly required: `framer-motion@12`, `lucide-react`, Tailwind v4, CVA-based `ui/` primitives (`button.tsx`, `card.tsx`, `badge.tsx`).

**Goal:** keep the teal→blue brand identity (it's correct for the brand and heavily embedded), but give the site depth, motion, and a distinct visual signature — organic blob backgrounds, bento-style card layouts, generous asymmetric spacing, glassmorphism accents, and scroll-driven motion — so it reads as a 2026-modern SaaS/product site rather than a template.

## 1. Design References

Borrowing specific, nameable patterns — not a vague "make it modern":

| Reference pattern | Seen on sites like | What we take from it |
|---|---|---|
| Blurred gradient-mesh blobs behind hero/CTA sections | Stripe, Linear, Framer | Layered, slow-drifting blob shapes instead of static circles — gives every section a distinct "zone" without hard borders |
| Bento grid (uneven card sizes, one hero cell + smaller cells) | Vercel, Raycast, Linear pricing | Replace uniform 3/4-col grids (Why Choose Us, Partner Benefits, Sectors) with asymmetric bento layouts — visual hierarchy instead of repetition |
| Glassmorphic floating cards over imagery | Apple, Framer | Stats card already does this in Hero — extend to course cards, testimonial cards |
| Spotlight/glow-on-hover cards | Linear, Aceternity-style component libraries | Cursor-tracked radial gradient glow on card hover, replacing flat `hover:shadow` |
| Marquee logo/tech strips | Stripe, Vercel customer walls | Infinite-scroll strip of tool/tech badges and (if available) partner logos |
| Big word-by-word or line-by-line headline reveal | Linear, Framer marketing pages | Hero headline animates in per-word instead of appearing as a static fade block |
| Gradient-border cards (border is the accent, not the fill) | Linear, Raycast | Alternative card treatment for featured items (featured course, testimonial) |
| Noise/grain texture overlay on gradient sections | Stripe, Vercel | Subtle SVG noise over gradient blob backgrounds so they don't look like flat CSS gradients |

## 2. Design System Additions

All additions extend the existing system in `src/app/globals.css` and `src/components/ui/` — nothing here replaces the teal→blue tokens.

### 2.1 Color
- Keep `teal-500 → blue-600` as the primary CTA/accent gradient — do not change.
- Add one supporting accent for variety in blob backgrounds and secondary badges: **violet-500 / fuchsia-500** (used only in background blobs and small accent badges, never on primary CTAs, so brand gradient stays dominant).
- Add one **dark section** treatment (`bg-gray-950` or `bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950`) for at least one high-impact section per page (e.g. Enterprise hero, Home CTA-before-footer) to create contrast rhythm instead of an all-light-background site.

### 2.2 Typography
- Increase hero heading scale: `text-5xl md:text-7xl` (up from current `text-4xl md:text-5xl`-range), tighter `tracking-tight`.
- Standardize a "section eyebrow" pattern site-wide: small `rounded-full` gradient-bordered pill label above every section heading (e.g. "OUR COURSES", "WHY NEXT MINDS") — currently inconsistent/absent in places.

### 2.3 Spacing
- Increase inter-section vertical rhythm: `py-24 md:py-32` for major sections (currently mixed `py-16`/`py-20`).
- Add breathing room inside cards: bump card padding from `p-6` to `p-8` on feature/bento cards.

### 2.4 Blobs (new shared component)
Create `src/components/ui/blob-background.tsx`:
- Renders 2–3 absolutely-positioned blurred gradient blobs (`blur-3xl`, low opacity, `rounded-full` with irregular scale/skew via CSS, or actual organic SVG blob paths) inside a `overflow-hidden` relative wrapper.
- Blobs slowly drift/morph via a CSS keyframe (`@keyframes blob-drift` — translate + scale loop, `animation-duration` 8–12s, staggered `animation-delay`) added to `globals.css`. Pure CSS, no new dependency.
- Props: `variant="teal-blue" | "violet-teal" | "dark"` to reuse across light and dark sections.
- Used behind: Home hero, Home CTA/contact section, Enterprise hero, Course page hero.

### 2.5 Cards
- `src/components/ui/spotlight-card.tsx`: wraps `Card`, tracks `onMouseMove` to position a radial-gradient glow (`background: radial-gradient(circle at var(--x) var(--y), ...)`) — pure CSS custom properties updated via inline style on mousemove, no new dependency.
- `src/components/ui/bento-grid.tsx`: a `grid` wrapper + `BentoCard` that accepts a `span` prop (`col-span-1|2`, `row-span-1|2`) so grids can mix one large feature cell with smaller ones.
- Gradient-border variant: `p-[1px] bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl` wrapping an inner `bg-white rounded-[15px]` — for featured cards (featured course, single testimonial).

### 2.6 Motion (extend existing framer-motion usage, no new library)
- `src/components/ui/marquee.tsx`: CSS-animation infinite scroll strip (duplicate content + `@keyframes marquee` translateX loop), pause-on-hover.
- Word-by-word headline reveal: small `AnimatedHeadline` helper splitting text into `motion.span` words with staggered `initial/animate`.
- Magnetic button hover on primary CTAs (small `translate` toward cursor within a bounded range using `onMouseMove`).
- Keep existing `AnimatedSection`/`fadeUp`/`staggerContainer` — reuse everywhere, don't reinvent per page.

## 3. Shared Component Work (build once, reuse across all pages)

1. `src/components/ui/blob-background.tsx` — background blob layer (§2.4)
2. `src/components/ui/spotlight-card.tsx` — hover-glow card wrapper (§2.5)
3. `src/components/ui/bento-grid.tsx` + `BentoCard` — asymmetric grid primitives (§2.5)
4. `src/components/ui/marquee.tsx` — infinite scroll strip (§2.6)
5. `src/components/SectionEyebrow.tsx` — small gradient-pill label + heading + subtext pattern used above every section
6. `globals.css` additions: `@keyframes blob-drift`, `@keyframes marquee`, noise-texture utility class (inline SVG `background-image` data URI, low opacity)

Build these **first** — every page section below depends on them.

## 4. Page-by-Page Redesign

### 4.1 `src/components/HomePage.tsx`
- **Hero**: replace the two static blurred circles with `<BlobBackground variant="teal-blue" />`; headline becomes word-by-word animated reveal; add noise overlay; keep floating glassmorphic stats card but add subtle parallax (moves slightly opposite to scroll).
- **Courses grid**: switch from uniform 3-col `Card` grid to `BentoGrid` — first/featured course gets `span="2"` gradient-border treatment, rest are `SpotlightCard`.
- **Learning Journey (4-step)**: keep the numbered-step concept but lay out as a horizontal connected timeline on desktop (connecting line between numbered nodes) instead of 4 equal boxes — more visually distinct.
- **Why Choose Us**: convert flat 4-col icon grid → `BentoGrid` with one larger highlighted cell (e.g. "Career Support" spans 2 cols with a stat).
- **Contact/CTA**: wrap in dark-section variant with `<BlobBackground variant="dark" />` behind the contact form for a strong closing visual beat before the footer, replacing the current flat white background.
- Add a new **tech/tools marquee** strip between Courses and Learning Journey using `<Marquee>` of the tool badges already present in course data (`tools: string[]`) — currently this data is shown only inside cards, never as a standalone trust signal.

### 4.2 `src/components/EnterprisePage.tsx`
- **Hero**: switch to dark-section + `<BlobBackground variant="dark" />`, stats (500+/50+/95%) as glassmorphic floating cards over the dark background instead of plain text.
- **Sectors** (currently 4 stacked split-cards, all same layout): restructure as `BentoGrid` — vary which side the icon panel is on per row (already alternates? confirm and keep alternation) and let one sector (e.g. Corporate) span wider as the "flagship" cell.
- **Partner Benefits** (6-card grid): convert to `SpotlightCard` grid for hover depth.
- **Testimonial**: apply gradient-border card treatment — it's a single high-trust element, should look distinct from surrounding cards.
- **How We Work**: same horizontal-timeline treatment as Home's Learning Journey for visual consistency between the two "process" sections.

### 4.3 `src/components/CoursePageContent.tsx`
- **Sticky pill tab nav**: add a subtle glassmorphic background (`backdrop-blur-md bg-white/70`) so it reads as floating above content when scrolled, not just a flat bar.
- **Sidebar Card** (price/enroll): apply gradient-border treatment — it's the primary conversion element on the page and should stand out more than it currently does as a plain `Card`.
- **Curriculum module list**: keep numbered gradient tiles, but make each module row expandable (click to reveal module details) with a framer-motion height animation, instead of a static list — adds interactivity without adding scope (curriculum data already has the fields needed).
- **Why Us** (6-card grid): `SpotlightCard` treatment for consistency with other pages.
- **Closing CTA**: reuse the dark `BlobBackground` CTA pattern from Home for visual consistency across all three pages' closing sections.

### 4.4 `src/components/Navbar.tsx`
- Add scroll-based state: shrink height + increase blur/opacity of background once scrolled past hero (`useEffect` + scroll listener already common in this pattern — no new dep).
- Animate nav-link underline on hover (small `motion.span` underline that slides in) instead of plain `hover:text-teal-600`.
- Mobile menu: animate open/close with framer-motion height/opacity instead of the current manual show/hide.

### 4.5 `src/components/Footer.tsx`
- Add a subtle top-edge blob/gradient glow (`<BlobBackground variant="dark" />` at low opacity) so the footer doesn't feel like a flat, disconnected `bg-gray-900` block after an otherwise-animated page.
- Otherwise keep the existing 4-column structure — it's functionally fine, just needs the visual tie-in.

## 5. Build Order

1. `globals.css` keyframes + noise utility (§3.6)
2. Shared components: `BlobBackground` → `SpotlightCard` → `BentoGrid` → `Marquee` → `SectionEyebrow` (§3)
3. `HomePage.tsx` (highest-traffic page, validates all shared components in real use)
4. `Navbar.tsx` + `Footer.tsx` (visible on every page, do right after Home so the rest of the site doesn't look inconsistent while other pages are pending)
5. `EnterprisePage.tsx`
6. `CoursePageContent.tsx`
7. Final pass: check `AGENTS.md` for Next.js 16 API changes before touching scroll-listener/`useEffect` patterns in Navbar; run `npm run lint` and `npm run build`; visually verify each page in the browser at desktop + mobile widths.

## 6. Explicit Non-Goals

- No new npm dependencies (blob morphing, marquee, spotlight, and headline-reveal are all achievable with existing `framer-motion` + hand-rolled CSS keyframes — keeps bundle size and dependency surface unchanged).
- No copy/content rewrites — this is a visual/motion redesign of existing sections, not a messaging overhaul.
- No changes to form submit behavior (`console.log`/`alert`/existing API routes) — out of scope per current project conventions.
- Teal→blue brand gradient is not being replaced, only supplemented with a secondary violet/fuchsia accent for background blobs.
