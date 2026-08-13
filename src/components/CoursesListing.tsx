"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  ChevronDown,
  Clock,
  Code2,
  Database,
  GraduationCap,
  Megaphone,
  Palette,
  Search,
  SearchX,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Workflow,
  X,
} from "lucide-react";
import type { PublicCourse } from "@/db/queries";
import EnrollModal from "@/components/EnrollModal";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const categoryIcons: Record<string, typeof GraduationCap> = {
  Development: Code2,
  Marketing: Megaphone,
  Security: ShieldCheck,
  DevOps: Workflow,
  Design: Palette,
  Data: Database,
};

function categoryIcon(category: string) {
  return categoryIcons[category] ?? GraduationCap;
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

export default function CoursesListing({ courses }: { courses: PublicCourse[] }) {
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
      <section className="nm-hero-panel px-6 py-20">
        <motion.div
          className="mx-auto max-w-7xl text-center"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={fadeUp}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-nm-teal/40 bg-nm-teal/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-nm-teal-ink"
          >
            Course Catalog
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="mb-4 font-display text-4xl font-bold text-white sm:text-5xl lg:text-6xl"
          >
            Find your path to a <span className="nm-gradient-text">future-proof IT career</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mx-auto max-w-xl text-lg text-white/65">
            {courses.length} industry-aligned tracks across {categories.length - 1} disciplines —
            online and on campus at New Baneshwor.
          </motion.p>
        </motion.div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12">
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

          <span className="ml-auto text-sm text-nm-muted">
            {filtered.length} course{filtered.length === 1 ? "" : "s"} found
          </span>
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
            key={`${category}-${level}-${duration}-${search}`}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {filtered.map((course) => {
              const Icon = categoryIcon(course.category);
              return (
                <motion.div key={course.id} variants={fadeUp}>
                  <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border border-nm-border bg-nm-card py-0 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                    <CardContent className="flex flex-1 flex-col p-5">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div
                          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3"
                          style={{
                            backgroundColor: `${course.color}15`,
                            borderColor: `${course.color}40`,
                          }}
                        >
                          <Icon className="h-6 w-6" style={{ color: course.color }} />
                        </div>
                        {course.badge && (
                          <span className="nm-gradient whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold text-white">
                            {course.badge}
                          </span>
                        )}
                      </div>

                      <span
                        className="mb-3 inline-block w-fit rounded-full border px-2.5 py-1 text-xs font-bold"
                        style={{
                          color: course.color,
                          borderColor: `${course.color}40`,
                          backgroundColor: `${course.color}10`,
                        }}
                      >
                        {course.category}
                      </span>

                      <h3 className="mb-2 font-display text-lg font-bold leading-snug text-nm-navy">
                        {course.title}
                      </h3>
                      <p className="mb-4 flex-1 text-sm leading-relaxed text-nm-muted">
                        {course.shortDesc}
                      </p>

                      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-nm-muted">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {course.duration}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <BarChart3 className="h-3.5 w-3.5" />
                          {course.level}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {course.students}
                        </span>
                      </div>

                      <div className="mb-1 flex flex-wrap gap-1.5">
                        {course.tools.slice(0, 4).map((tool) => (
                          <span
                            key={tool}
                            className="rounded-full border border-nm-border bg-nm-surface px-2.5 py-1 text-xs text-nm-muted"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter className="flex items-center justify-between border-t border-nm-border p-5 pt-4">
                      <div className="text-sm font-bold text-nm-navy">
                        NPR {course.price.toLocaleString()}
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/courses/${course.slug}`}
                          className="rounded-full border border-nm-border px-3.5 py-1.5 text-xs font-semibold text-nm-navy transition-colors hover:border-nm-teal hover:text-nm-teal-ink"
                        >
                          Details
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setPreselect(course.title);
                            setModalOpen(true);
                          }}
                          className="nm-gradient rounded-full px-3.5 py-1.5 text-xs font-bold text-white transition-shadow group-hover:shadow-md"
                        >
                          Enroll now
                        </button>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <EnrollModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        preSelectedCourse={preselect}
        courses={courses}
      />
    </div>
  );
}
