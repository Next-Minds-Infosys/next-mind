import { config } from "dotenv";
config({ path: ".env" });

import { courses } from "../src/data/courses";
import type { Course as StaticCourse } from "../src/data/courses";

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
  const { prisma } = await import("../src/lib/db");
  const { auth } = await import("../src/lib/auth");

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local before seeding");
  }

  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    // Goes through better-auth's own sign-up flow so the Account row (scrypt-hashed
    // password) is created in the shape better-auth expects for later sign-ins.
    const result = await auth.api.signUpEmail({
      body: { email: adminEmail, password: adminPassword, name: "Admin" },
    });
    admin = await prisma.user.update({
      where: { id: result.user.id },
      data: { role: "ADMIN", emailVerified: true },
    });
  }
  console.log(`Admin user ready: ${admin.email}`);

  for (const course of courses) {
    await prisma.course.upsert({
      where: { slug: course.id },
      update: {
        category: course.category,
        title: course.title,
        description: course.description,
        contentMd: toContentMd(course),
        tools: course.tools,
        duration: course.duration,
        level: course.level,
        price: course.price,
      },
      create: {
        slug: course.id,
        category: course.category,
        title: course.title,
        description: course.description,
        contentMd: toContentMd(course),
        tools: course.tools,
        duration: course.duration,
        level: course.level,
        price: course.price,
        createdById: admin.id,
      },
    });
    console.log(`Seeded course: ${course.id}`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
