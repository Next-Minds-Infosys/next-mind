/**
 * Institute statistics — the single source of truth.
 *
 * These were hardcoded independently on the homepage, /about and every course
 * page, and had drifted into contradicting each other: 1,200+ students on the
 * homepage against 3,000+ graduates on /about, 85% placement against 82%, 50+
 * hiring partners against 200+. A visitor who reads two pages sees the site
 * disagree with itself, which is worse than any single number being modest.
 *
 * The values below take the *lower, defensible* figure wherever two existed,
 * because an overclaim that cannot be evidenced costs more than it earns.
 *
 * >>> CONFIRM THESE AGAINST YOUR REAL RECORDS BEFORE THEY GO LIVE. <<<
 * Nothing here is derived from the database; they are marketing claims and only
 * you know which are true.
 */
export const stats = {
  /** Total students taught since founding. */
  studentsTrained: "1,200+",
  /** Share of graduates placed. Use the figure you can evidence on request. */
  placementRate: "82%",
  /** Companies that have hired a graduate. */
  hiringPartners: "50+",
  /** Active teaching staff. */
  instructors: "12+",
  foundedYear: "2018",
} as const;

/**
 * Course-page trust strip.
 *
 * These sat on every course page as "500+ Placements" and "80+ Partners" next
 * to a per-course enrolment count of 165 — arithmetic that cannot be true and
 * that a sceptical reader will notice. They are institute-wide numbers, so they
 * are now labelled as such and reuse the same source values.
 */
export const courseTrustStrip = [
  { n: stats.placementRate, l: "Placement rate" },
  { n: stats.hiringPartners, l: "Hiring partners" },
  { n: stats.studentsTrained, l: "Students trained" },
] as const;
