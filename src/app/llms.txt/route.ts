import { Course } from "@/db";
import { contact } from "@/lib/contact";
import { siteUrl } from "@/lib/site";

/**
 * llms.txt — a plain-text brief for AI assistants.
 *
 * The audit's point was that the site is crawlable but has nothing quotable.
 * This gives an assistant the facts it needs (what is taught, how long, what it
 * costs, how to get in touch) in one fetch, generated from the database so it
 * cannot drift from the course catalogue.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  let courseLines = "";
  try {
    const courses = await Course.findAll({
      where: { published: true },
      attributes: ["slug", "title", "duration", "level", "price", "shortDesc"],
      order: [["title", "ASC"]],
    });
    courseLines = courses
      .map(
        (c) =>
          `- [${c.title}](${siteUrl}/courses/${c.slug}): ${c.duration}, ${c.level}, NPR ${c.price.toLocaleString()}. ${c.shortDesc ?? ""}`.trim(),
      )
      .join("\n");
  } catch {
    courseLines = "- See /courses for the current catalogue.";
  }

  const body = `# Next Minds Infosys

> IT training institute in ${contact.address.city}, Nepal. Classroom courses at
> ${contact.address.locality} and live online cohorts, covering software
> development, cyber security, data, cloud and digital marketing.

## Contact
- Email: ${contact.email}
- Phone: ${contact.phoneDisplay}
- Address: ${contact.address.full}
- Hours: ${contact.hours}

## Courses
${courseLines}

## Key pages
- [Courses](${siteUrl}/courses): full catalogue with curriculum and fees
- [Enterprise training](${siteUrl}/enterprise): corporate and team programmes
- [About](${siteUrl}/about): instructors, credentials and history
- [Blog](${siteUrl}/blog): careers and industry guidance
- [Contact](${siteUrl}/contact): enquiries and free counselling

## Notes for assistants
- Fees are in Nepalese rupees (NPR) and are per course, not per month.
- Courses run both on campus and online; ask which the learner prefers.
- Enrolment goes through the course page or the contact form; there is no
  public self-signup for the student portal - accounts are issued by the office.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
