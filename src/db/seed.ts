import { Course } from "./models/course";
import { Category } from "./models/category";

import { courses } from "../data/courses";
import type { Course as StaticCourse } from "../data/courses";
import { auth } from "../lib/auth";
import { slugify } from "../lib/utils";
import { sequelize } from "./sequelize";
import { User, Batch, BatchStudent } from ".";

/**
 * Skills, whoIsItFor, curriculum and faqs now have their own columns, so
 * contentMd no longer flattens them into markdown. It is reserved for
 * free-form prose written in the admin's rich-text editor; seed it with the
 * overview so the NOT NULL column has a sensible starting point.
 */
function toContentMd(course: StaticCourse): string {
  return course.description;
}

/**
 * Shared by admin/instructor/student seeding: sign up through better-auth
 * (so a real Account/password hash exists, not just a User row), then force
 * the role and mark it verified. mustChangePassword stays false here since
 * these are dev/test logins, not admin-issued accounts for real people.
 */
async function ensureUser(email: string, password: string, name: string, role: "ADMIN" | "INSTRUCTOR" | "STUDENT") {
  let user = await User.findOne({ where: { email } });
  if (!user) {
    const result = await auth.api.signUpEmail({ body: { email, password, name } });
    await User.update({ role, emailVerified: true }, { where: { id: result.user.id } });
    user = await User.findByPk(result.user.id);
  } else if (user.role !== role) {
    await user.update({ role, emailVerified: true });
  }
  return user!;
}

async function main() {
  await sequelize.authenticate();

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@admin.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Suraj@123";
  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env before seeding");
  }

  const admin = await ensureUser(adminEmail, adminPassword, "Admin", "ADMIN");
  console.log(`Admin user ready: ${admin.email}`);

  const instructorEmail = process.env.INSTRUCTOR_EMAIL ?? "instructor@nextmindsinfosys.com";
  const instructorPassword = process.env.INSTRUCTOR_PASSWORD ?? "Instructor@123";
  const instructor = await ensureUser(instructorEmail, instructorPassword, "Test Instructor", "INSTRUCTOR");
  console.log(`Instructor user ready: ${instructor.email} / ${instructorPassword}`);

  const studentEmail = process.env.STUDENT_EMAIL ?? "student@nextmindsinfosys.com";
  const studentPassword = process.env.STUDENT_PASSWORD ?? "Student@123";
  const student = await ensureUser(studentEmail, studentPassword, "Test Student", "STUDENT");
  console.log(`Student user ready: ${student.email} / ${studentPassword}`);

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

  // Give the seeded instructor/student a batch to log into instead of an
  // empty dashboard - the first seeded course, one running batch, one
  // enrollment.
  const firstCourse = await Course.findOne({ where: { slug: courses[0].slug } });
  if (firstCourse) {
    const [batch] = await Batch.findOrCreate({
      where: { code: "TEST-BATCH-01" },
      defaults: {
        courseId: firstCourse.id,
        instructorId: instructor.id,
        name: `${firstCourse.title} - Test Batch`,
        code: "TEST-BATCH-01",
        mode: "Online",
        capacity: 30,
        status: "RUNNING",
      },
    });
    if (batch.instructorId !== instructor.id) {
      await batch.update({ instructorId: instructor.id });
    }
    await BatchStudent.findOrCreate({
      where: { batchId: batch.id, userId: student.id },
      defaults: { batchId: batch.id, userId: student.id, status: "ACTIVE" },
    });
    console.log(`Seeded batch: ${batch.code} (instructor: ${instructor.email}, student: ${student.email})`);
  }

  await sequelize.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
