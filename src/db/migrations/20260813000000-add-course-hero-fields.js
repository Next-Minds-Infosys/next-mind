"use strict";

/**
 * Hero fields the course-page design needs.
 *
 * - `h1`      the on-page headline, which is longer than the card title and
 *             different from the SEO title tag. "Digital Marketing" labels the
 *             card and the nav; "Digital Marketing Course in Nepal, 2.5 Months
 *             Practical Training" is the H1. Without this the H1 was being
 *             derived from metaTitle up to the first "|", which truncated it.
 * - `h1Accent` the trailing clause rendered in teal. Stored separately so the
 *             split point is editorial, not a guess at where to break.
 * - `nextBatch` free text ("September 2026"), shown in the hero fact strip and
 *             the sidebar badge. Free text rather than a date because intake
 *             months are announced before exact start dates are fixed.
 * - `syllabusUrl` target for the "Download Syllabus" button. The button only
 *             renders when this is set, so it is never a dead link.
 */
module.exports = {
  async up(q, S) {
    for (const [name, type] of [
      ["h1", S.STRING(200)],
      ["h1Accent", S.STRING(200)],
      ["nextBatch", S.STRING(80)],
      ["syllabusUrl", S.STRING(500)],
    ]) {
      await q.addColumn("Course", name, { type, allowNull: true });
    }
  },
  async down(q) {
    for (const name of ["h1", "h1Accent", "nextBatch", "syllabusUrl"]) {
      await q.removeColumn("Course", name);
    }
  },
};
