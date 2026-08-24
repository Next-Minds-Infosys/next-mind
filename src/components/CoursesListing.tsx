"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Search,
  SearchX,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { CourseCard } from "@/db/queries";
import { CourseCardTile } from "@/components/CourseCardTile";
import { borderSoft, colors, ctaBody, ctaGradient, gradient, heroWash } from "@/lib/theme";
import EnrollModal from "@/components/EnrollModal";

/** "2.5 months" -> 2.5. Anything unparseable sorts last rather than as zero. */
function months(label: string) {
  const n = parseFloat(label);
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

export default function CoursesListing({ courses }: { courses: CourseCard[] }) {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(courses.map((c) => c.category)))],
    [courses],
  );
  const levels = useMemo(
    () => ["All Levels", ...Array.from(new Set(courses.map((c) => c.level)))],
    [courses],
  );
  const durations = useMemo(
    () => ["Any Duration", ...Array.from(new Set(courses.map((c) => c.duration)))],
    [courses],
  );

  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All Levels");
  const [duration, setDuration] = useState("Any Duration");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [refineOpen, setRefineOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [preselect, setPreselect] = useState("");

  const filtered = useMemo(
    () =>
      courses.filter((c) => {
        if (category !== "All" && c.category !== category) return false;
        if (level !== "All Levels" && c.level !== level) return false;
        if (duration !== "Any Duration" && c.duration !== duration) return false;
        if (
          search &&
          !c.title.toLowerCase().includes(search.toLowerCase()) &&
          !c.category.toLowerCase().includes(search.toLowerCase())
        )
          return false;
        return true;
      }),
    [courses, category, level, duration, search],
  );

  /**
   * Sorting is applied after filtering so the "N courses found" count above the
   * grid always matches what is rendered below it. "Most popular" leans on
   * enrolment, which is the only popularity signal the card data carries.
   */
  const visible = useMemo(() => {
    const out = [...filtered];
    if (sort === "price-low") out.sort((a, b) => a.price - b.price);
    else if (sort === "price-high") out.sort((a, b) => b.price - a.price);
    else if (sort === "duration") out.sort((a, b) => months(a.duration) - months(b.duration));
    else out.sort((a, b) => b.students - a.students);
    return out;
  }, [filtered, sort]);

  const refineCount = (level !== "All Levels" ? 1 : 0) + (duration !== "Any Duration" ? 1 : 0);
  const hasFilters = category !== "All" || refineCount > 0 || Boolean(search);

  const clearAll = () => {
    setCategory("All");
    setLevel("All Levels");
    setDuration("Any Duration");
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-white pt-16">
      <section className="px-6 py-16" style={{ background: heroWash }}>
        <motion.div
          className="mx-auto max-w-[1240px]"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={fadeUp}
            className="mb-2.5 text-[13px] font-bold uppercase tracking-[0.06em]"
            style={{ color: colors.tealInk }}
          >
            Course Catalog
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="font-display mb-3 max-w-[720px] font-extrabold tracking-[-0.8px]"
            style={{ fontSize: "clamp(28px,4.2vw,42px)", color: colors.navy }}
          >
            Find your path to a future-proof IT career
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="max-w-[560px] text-base"
            style={{ color: colors.body }}
          >
            {courses.length} industry-aligned tracks across {categories.length - 1} disciplines —
            online and on campus at New Baneshwor.
          </motion.p>
        </motion.div>
      </section>

      <div className="mx-auto max-w-[1240px] px-6 py-12">
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`flex-shrink-0 whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                  active
                    ? "nm-gradient text-white shadow-md shadow-nm-teal/20"
                    : "border border-nm-border bg-nm-surface text-nm-body hover:border-nm-teal/40 hover:text-nm-teal-ink"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nm-muted" />
            <input
              type="text"
              placeholder="Search courses…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-nm-border bg-nm-card py-2.5 pl-10 pr-4 text-sm text-nm-navy outline-none transition-colors focus:border-nm-teal"
            />
          </div>

          <button
            type="button"
            onClick={() => setRefineOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-nm-border bg-nm-card px-4 py-2.5 text-sm font-semibold text-nm-body transition-colors hover:border-nm-teal/40 hover:text-nm-teal-ink"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Refine
            {refineCount > 0 && (
              <span className="nm-gradient flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white">
                {refineCount}
              </span>
            )}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${refineOpen ? "rotate-180" : ""}`}
            />
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-nm-teal-ink transition-colors hover:bg-nm-light"
            >
              <X className="h-3.5 w-3.5" />
              Clear all
            </button>
          )}

          </div>

          <div
            className="mb-6 flex flex-wrap items-center justify-between gap-3.5 pb-5"
            style={{ borderBottom: `1px solid ${borderSoft}` }}
          >
            <div className="text-sm font-semibold" style={{ color: colors.muted }}>
              {filtered.length} course{filtered.length === 1 ? "" : "s"} found
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="course-sort"
                className="text-[13px] font-semibold"
                style={{ color: colors.mutedSoft }}
              >
                Sort by
              </label>
              <select
                id="course-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="cursor-pointer rounded-[9px] bg-white px-3 py-2.5 text-[13.5px] font-bold outline-none"
                style={{ border: `1px solid ${colors.border}`, color: colors.navy }}
              >
                <option value="popular">Most popular</option>
                <option value="price-low">Price: Low to high</option>
                <option value="price-high">Price: High to low</option>
                <option value="duration">Shortest duration</option>
              </select>
            </div>
          </div>

        <AnimatePresence initial={false}>
          {refineOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mb-2 flex flex-wrap gap-3 rounded-xl border border-nm-border bg-nm-surface p-4">
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="cursor-pointer rounded-xl border border-nm-border bg-nm-card px-4 py-2 text-sm text-nm-body outline-none transition-colors focus:border-nm-teal"
                >
                  {levels.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="cursor-pointer rounded-xl border border-nm-border bg-nm-card px-4 py-2 text-sm text-nm-body outline-none transition-colors focus:border-nm-teal"
                >
                  {durations.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <SearchX className="mx-auto mb-4 h-12 w-12 text-nm-muted" />
            <h3 className="mb-2 font-display text-xl font-bold text-nm-navy">No courses found</h3>
            <p className="mb-4 text-nm-muted">Try adjusting your filters or search term.</p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="rounded-full border-2 border-nm-teal px-5 py-2 text-sm font-semibold text-nm-teal-ink transition-colors hover:bg-nm-light"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <motion.div
            key={`${category}-${level}-${duration}-${search}-${sort}`}
            className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
              {visible.map((course) => (
                <motion.div key={course.id} variants={fadeUp} className="h-full">
                  <CourseCardTile
                    course={course}
                    action={
                      <>
                        <Link
                          href={`/courses/${course.slug}`}
                          className="rounded-[9px] px-4 py-2.5 text-[13.5px] font-bold transition-colors hover:bg-nm-surface"
                          style={{ border: `1px solid ${colors.border}`, color: colors.navy }}
                        >
                          Details
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setPreselect(course.id);
                            setModalOpen(true);
                          }}
                          className="rounded-[9px] px-4 py-2.5 text-[13.5px] font-bold text-white transition-transform active:scale-95"
                          style={{ background: gradient }}
                        >
                          Enroll
                        </button>
                      </>
                    }
                  />
                </motion.div>
              ))}
          </motion.div>
        )}
      </div>

      {/* Closing band, matching the homepage: the catalog ends on the same
          dark call to action rather than trailing off after the last card. */}
      <section className="px-6 py-[70px] text-white" style={{ background: ctaGradient }}>
        <div className="mx-auto max-w-[760px] text-center">
          <h2
            className="font-display mb-3.5 font-extrabold tracking-[-0.8px]"
            style={{ fontSize: "clamp(26px,4vw,38px)" }}
          >
            Not sure which course fits?
          </h2>
          <p className="mb-[30px] text-[15.5px]" style={{ color: ctaBody }}>
            Talk to a course advisor — free 30-minute counselling, no obligation.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-xl bg-white px-7 py-3.5 text-[15px] font-bold transition-transform active:scale-95"
            style={{ color: colors.navyDeep }}
          >
            Book Free Counselling
          </button>
        </div>
      </section>

      <EnrollModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        preSelectedCourse={preselect}
        courses={courses}
      />
    </div>
  );
}
