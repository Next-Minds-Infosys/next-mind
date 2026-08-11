"use strict";

/**
 * Per-course SEO overrides.
 *
 * The course page derived its <title> from Course.title, so a hand-written
 * title tag ("Advanced SEO Course in Nepal | NPR 20,000 | Next Minds") had
 * nowhere to live. Post already has the equivalent columns; this brings Course
 * in line so marketing copy and the on-page heading can differ.
 */
module.exports = {
  async up(q, S) {
    for (const [name, type] of [
      ["metaTitle", S.STRING(200)],
      ["metaDescription", S.TEXT],
      ["ogTitle", S.STRING(200)],
      ["ogDescription", S.TEXT],
      ["ogImageAlt", S.STRING(300)],
      ["focusKeyword", S.STRING(160)],
    ]) {
      await q.addColumn("Course", name, { type, allowNull: true });
    }
  },
  async down(q) {
    for (const name of [
      "metaTitle", "metaDescription", "ogTitle", "ogDescription", "ogImageAlt", "focusKeyword",
    ]) {
      await q.removeColumn("Course", name);
    }
  },
};
