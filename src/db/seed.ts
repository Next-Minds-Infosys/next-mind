import { Course } from "./models/course";

import { courses } from "../data/courses";
import type { Course as StaticCourse } from "../data/courses";
import { auth } from "../lib/auth";
import { sequelize } from "./sequelize";
import { User } from ".";

function toContentMd(course: StaticCourse): string {
  const sections: string[] = [course.detailedDescription, ""];

  sections.push("## What You'll Learn", "");
  for (const item of course.whatYouWillLearn) sections.push(`- ${item}`);
  sections.push("");

  sections.push("## Who Is This For", "");
  for (const item of course.whoIsThisFor) {
    sections.push(`**${item.title}** — ${item.description}`, "");
  }

  sections.push("## Curriculum", "");
  for (const item of course.curriculum) {
    sections.push(`${item.module}. ${item.title}`);
  }
  sections.push("");

  sections.push("## Skills You'll Gain", "");
  sections.push(course.skillsYouWillLearn.map((s) => `\`${s}\``).join(" · "), "");

  sections.push("## Highlights", "");
  for (const item of course.highlights) {
    sections.push(`**${item.title}** — ${item.description}`, "");
  }

  return sections.join("\n");
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
    await User.update(
      { role: "ADMIN", emailVerified: true },
      { where: { id: result.user.id } }
    );
    admin = await User.findByPk(result.user.id);
  } else if (admin.role !== "ADMIN") {
    await admin.update({ role: "ADMIN", emailVerified: true });
  }
  console.log(`Admin user ready: ${admin!.email}`);

  for (const course of courses) {
    const existing = await Course.findOne({ where: { slug: course.id } });
    const payload = {
      category: course.category,
      title: course.title,
      description: course.description,
      contentMd: toContentMd(course),
      tools: course.tools,
      duration: course.duration,
      level: course.level,
      price: course.price,
    };

    if (existing) {
      await existing.update(payload);
    } else {
      await Course.create({
        slug: course.id,
        ...payload,
        createdById: admin!.id,
        published: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    console.log(`Seeded course: ${course.id}`);
  }

  await sequelize.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});