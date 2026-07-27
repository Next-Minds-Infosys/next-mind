import { Course } from "./models/course";
import { Category } from "./models/category";

import { courses } from "../data/courses";
import type { Course as StaticCourse } from "../data/courses";
import { auth } from "../lib/auth";
import { slugify } from "../lib/utils";
import { sequelize } from "./sequelize";
import { User } from ".";

/**
 * Skills, whoIsItFor, curriculum and faqs now have their own columns, so
 * contentMd no longer flattens them into markdown. It is reserved for
 * free-form prose written in the admin's rich-text editor; seed it with the
 * overview so the NOT NULL column has a sensible starting point.
 */
function toContentMd(course: StaticCourse): string {
  return course.description;
}

async function main() {
  await sequelize.authenticate();

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@admin.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Suraj@123";
  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env before seeding");
  }

  let admin = await User.findOne({ where: { email: adminEmail } });
  if (!admin) {
    const result = await auth.api.signUpEmail({
      body: { email: adminEmail, password: adminPassword, name: "Admin" },
    });
    await User.update({ role: "ADMIN", emailVerified: true }, { where: { id: result.user.id } });
    admin = await User.findByPk(result.user.id);
  } else if (admin.role !== "ADMIN") {
    await admin.update({ role: "ADMIN", emailVerified: true });
  }
  console.log(`Admin user ready: ${admin!.email}`);

  const categoryNames = Array.from(new Set(courses.map((c) => c.category)));
  const categoryIdByName = new Map<string, string>();
  for (const name of categoryNames) {
    const [category] = await Category.findOrCreate({
      where: { name },
      defaults: { name, slug: slugify(name) },
    });
    categoryIdByName.set(name, category.id);
    console.log(`Seeded category: ${name}`);
  }

  for (const course of courses) {
    const existing = await Course.findOne({ where: { slug: course.slug } });
    const payload = {
      categoryId: categoryIdByName.get(course.category)!,
      title: course.title,
      description: course.description,
      shortDesc: course.shortDesc,
      contentMd: toContentMd(course),
      tools: course.tools,
      whoIsItFor: course.whoIsItFor,
      skills: course.skills,
      // Stable ids per module so a future CourseModule table (or anchor links)
      // can reference them without renumbering.
      curriculum: course.curriculum.map((mod, i) => ({
        id: `${course.slug}-m${i + 1}`,
        title: mod.title,
        topics: mod.topics,
      })),
      faqs: course.faqs,
      badge: course.badge,
      color: course.color,
      students: course.students,
      duration: course.duration,
      level: course.level,
      price: course.price,
    };

    if (existing) {
      await existing.update(payload);
    } else {
      await Course.create({
        slug: course.slug,
        ...payload,
        createdById: admin!.id,
        published: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    console.log(`Seeded course: ${course.slug}`);
  }

  await sequelize.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
