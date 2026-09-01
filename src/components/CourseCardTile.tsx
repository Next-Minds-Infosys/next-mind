"use client";

import Link from "next/link";
import type { CourseCard } from "@/db/queries";
import { borderSoft, colors } from "@/lib/theme";
import { npr } from "@/lib/utils";

/**
 * The card the design uses in three places - here, /courses and the related
 * list on a course page - so it lives on its own rather than being repeated.
 *
 * `action` is the only difference between contexts: the homepage offers just
 * "Details", the catalog adds a direct "Enroll".
 */
export function CourseCardTile({
  course,
  action,
}: {
  course: CourseCard;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="flex h-full flex-col rounded-[18px] bg-white p-6 transition-shadow hover:shadow-[0_10px_30px_-12px_rgba(22,39,63,0.18)]"
      style={{ border: `1px solid ${colors.border}` }}
    >
      <div className="mb-3.5 flex items-center justify-between gap-2">
        <span
          className="rounded-full px-2.5 py-[5px] text-[11.5px] font-extrabold uppercase tracking-[0.04em]"
          style={{ color: colors.tealInk, backgroundColor: colors.light }}
        >
          {course.category}
        </span>
        {course.badge && (
          <span
            className="rounded-full px-2.5 py-[5px] text-[11px] font-extrabold tracking-[0.03em]"
            style={{ color: "#7a3800", backgroundColor: "#ffe6c7" }}
          >
            {course.badge}
          </span>
        )}
      </div>

      <h3
        className="mb-2 text-[19px] font-extrabold tracking-[-0.3px]"
        style={{ color: colors.navy }}
      >
        {course.title}
      </h3>
      <p className="mb-4 flex-1 text-[13.5px] leading-[1.55]" style={{ color: colors.muted }}>
        {course.shortDesc}
      </p>

      {course.tools.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {course.tools.slice(0, 4).map((t) => (
            <span
              key={t}
              className="rounded-md px-2.5 py-1 text-[11.5px] font-semibold"
              style={{ color: colors.body, backgroundColor: "#f4f5f7" }}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mb-4 text-[12.5px]" style={{ color: colors.mutedSoft }}>
        {[course.duration, course.level, course.students > 0 && `${course.students} enrolled`]
          .filter(Boolean)
          .join(" · ")}
      </div>

      <div
        className="flex items-center justify-between gap-3 pt-4"
        style={{ borderTop: `1px solid ${borderSoft}` }}
      >
        <div className="text-[17px] font-extrabold" style={{ color: colors.navy }}>
          {npr(course.price)}
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {action ?? (
            <Link
              href={`/courses/${course.slug}`}
              className="rounded-[9px] px-4 py-2.5 text-[13.5px] font-bold transition-colors hover:bg-nm-surface"
              style={{ border: `1px solid ${colors.border}`, color: colors.navy }}
            >
              Details →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
