"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { courses } from "@/data/courses";
import { colors, gradient, heroGradient } from "@/lib/theme";
import EnrollModal from "@/components/EnrollModal";

const categories = ["All", ...Array.from(new Set(courses.map((c) => c.category)))];
const levels = ["All Levels", "Beginner", "Intermediate", "Beginner to Advanced"];
const durations = [
  "Any Duration",
  "2 months",
  "3 months",
  "4 months",
  "5 months",
  "6 months",
];

export default function CoursesListing() {
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All Levels");
  const [duration, setDuration] = useState("Any Duration");
  const [search, setSearch] = useState("");
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
    [category, level, duration, search]
  );

  const hasFilters =
    category !== "All" ||
    level !== "All Levels" ||
    duration !== "Any Duration" ||
    Boolean(search);

  return (
    <div className="pt-16 min-h-screen" style={{ backgroundColor: colors.bg }}>
      <div
        className="py-16 px-6"
        style={{ background: heroGradient }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-4"
            style={{
              backgroundColor: `${colors.teal}25`,
              borderColor: `${colors.teal}40`,
              color: colors.teal,
            }}
          >
            All Programs
          </div>
          <h1
            className="font-display font-bold text-white mb-4"
            style={{ fontSize: "clamp(2rem,4vw,3.5rem)" }}
          >
            Find Your Path to a{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: `linear-gradient(135deg, ${colors.teal}, #4de8ff)` }}
            >
              Future-Proof IT Career
            </span>
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.65)" }}>
            {courses.length} industry-aligned courses. Both online and on-campus
            at New Baneshwor.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-6">
          <div className="relative max-w-md">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: colors.muted }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search courses…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                border: `1.5px solid ${colors.border}`,
                backgroundColor: colors.card,
                color: colors.navy,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.teal;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
              }}
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className="px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all"
              style={
                category === cat
                  ? { background: gradient, color: colors.navy, boxShadow: `0 4px 14px ${colors.teal}40` }
                  : {
                      backgroundColor: colors.surface,
                      color: colors.body,
                      border: `1px solid ${colors.border}`,
                    }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mb-8 items-center">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: colors.muted }}
          >
            Filter by:
          </span>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm appearance-none cursor-pointer outline-none transition-all"
            style={{
              border: `1.5px solid ${colors.border}`,
              backgroundColor: colors.card,
              color: colors.body,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.teal;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.border;
            }}
          >
            {levels.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm appearance-none cursor-pointer outline-none transition-all"
            style={{
              border: `1.5px solid ${colors.border}`,
              backgroundColor: colors.card,
              color: colors.body,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.teal;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.border;
            }}
          >
            {durations.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setCategory("All");
                setLevel("All Levels");
                setDuration("Any Duration");
                setSearch("");
              }}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: `${colors.teal}12`,
                color: colors.teal,
                border: `1px solid ${colors.teal}30`,
              }}
            >
              Clear Filters ✕
            </button>
          )}

          <span className="ml-auto text-sm" style={{ color: colors.muted }}>
            {filtered.length} course{filtered.length === 1 ? "" : "s"} found
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-display font-bold text-xl mb-2" style={{ color: colors.navy }}>
              No courses found
            </h3>
            <p style={{ color: colors.muted }}>Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((course) => (
              <div
                key={course.id}
                className="rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1.5 flex flex-col"
                style={{
                  backgroundColor: colors.card,
                  border: `1px solid ${colors.border}`,
                  boxShadow: "0 2px 8px rgba(13,45,82,0.05)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${course.color}50`;
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(13,45,82,0.10)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(13,45,82,0.05)";
                }}
              >
                <div className="h-1" style={{ backgroundColor: course.color }} />
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex gap-2 flex-wrap mb-3">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full border"
                      style={{
                        color: course.color,
                        borderColor: `${course.color}40`,
                        backgroundColor: `${course.color}10`,
                      }}
                    >
                      {course.category}
                    </span>
                    {course.badge && (
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: `${colors.teal}12`, color: colors.teal }}
                      >
                        {course.badge}
                      </span>
                    )}
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: `${colors.blue}10`, color: colors.blue }}
                    >
                      🤖 AI Enhanced
                    </span>
                  </div>

                  <h3
                    className="font-display font-bold text-base leading-snug mb-2"
                    style={{ color: colors.navy }}
                  >
                    {course.title}
                  </h3>
                  <p
                    className="text-xs leading-relaxed mb-4 flex-1"
                    style={{ color: colors.muted }}
                  >
                    {course.shortDesc}
                  </p>

                  <div className="flex gap-3 text-xs mb-4" style={{ color: colors.muted }}>
                    <span>⏱ {course.duration}</span>
                    <span>•</span>
                    <span>📊 {course.level}</span>
                  </div>

                  <div className="flex gap-1 flex-wrap mb-4">
                    {course.tools.slice(0, 4).map((tool) => (
                      <span
                        key={tool}
                        className="text-[10px] px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: colors.surface,
                          color: colors.muted,
                          border: `1px solid ${colors.border}`,
                        }}
                      >
                        {tool}
                      </span>
                    ))}
                  </div>

                  <div
                    className="flex items-center justify-between pt-4 border-t"
                    style={{ borderColor: colors.border }}
                  >
                    <div>
                      <div className="font-bold text-sm" style={{ color: colors.navy }}>
                        NPR {course.price.toLocaleString()}
                      </div>
                      <div className="text-xs" style={{ color: colors.muted }}>
                        {course.students} enrolled
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/courses/${course.slug}`}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                        style={{ border: `1px solid ${colors.border}`, color: colors.navy }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = colors.teal;
                          e.currentTarget.style.color = colors.teal;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = colors.border;
                          e.currentTarget.style.color = colors.navy;
                        }}
                      >
                        Details
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setPreselect(course.title);
                          setModalOpen(true);
                        }}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-all group-hover:shadow-md"
                        style={{ background: gradient }}
                      >
                        Enroll Now →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EnrollModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        preSelectedCourse={preselect}
      />
    </div>
  );
}
