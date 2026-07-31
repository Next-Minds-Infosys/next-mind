import { NextRequest, after } from "next/server";
import { escapeHtml } from "@/lib/escape";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { sendMail } from "@/lib/mailer";
import { Course, Enrollment } from "@/db";
import { createId } from "@/db/id";
import { enrollSchema, parseInput } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  // Unauthenticated write + outbound email: throttle before doing either.
  const limit = rateLimit(`enroll:` + clientIp(request), 5);
  if (!limit.ok) {
    return Response.json(
      { error: "Too many submissions. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const parsed = parseInput(enrollSchema, await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });

  const { fullName, email, phone, address, course, educationLevel, learningFormat, hasLaptop } =
    parsed.data;

  const courseRow =
    (await Course.findOne({ where: { slug: course } })) ??
    (await Course.findOne({ where: { title: course } }));

  if (!courseRow) {
    return Response.json({ error: "Course not found" }, { status: 404 });
  }

  await Enrollment.create({
    id: createId(),
    fullName,
    email,
    phone: phone ? `+977 ${phone}` : "",
    address: address || null,
    courseId: courseRow.id,
    educationLevel: educationLevel || null,
    learningFormat,
    hasLaptop,
    createdAt: new Date(),
  });

  after(() =>
    sendMail({
      subject: `New Enrollment: ${fullName} — ${courseRow.title}`,
      replyTo: email,
      html: `
        <h2>New Course Enrollment</h2>
        <table cellpadding="8" style="border-collapse:collapse;width:100%;max-width:600px">
          <tr><td><strong>Full Name</strong></td><td>${escapeHtml(fullName)}</td></tr>
          <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
          <tr><td><strong>Phone</strong></td><td>+977 ${escapeHtml(phone)}</td></tr>
          <tr><td><strong>Address</strong></td><td>${escapeHtml(address || "—")}</td></tr>
          <tr><td><strong>Course</strong></td><td>${escapeHtml(courseRow.title)}</td></tr>
          <tr><td><strong>Education Level</strong></td><td>${escapeHtml(educationLevel || "—")}</td></tr>
          <tr><td><strong>Learning Format</strong></td><td>${escapeHtml(learningFormat)}</td></tr>
          <tr><td><strong>Has Laptop</strong></td><td>${escapeHtml(hasLaptop)}</td></tr>
        </table>
      `,
    }),
  );

  return Response.json({ success: true });
}
