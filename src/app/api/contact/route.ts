import { NextRequest, after } from "next/server";
import { escapeHtml } from "@/lib/escape";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { sendMail } from "@/lib/mailer";
import { ContactSubmission } from "@/db";
import { createId } from "@/db/id";
import { contactSchema, parseInput } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  // Unauthenticated write + outbound email: throttle before doing either.
  const limit = rateLimit(`contact:` + clientIp(request), 5);
  if (!limit.ok) {
    return Response.json(
      { error: "Too many submissions. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const parsed = parseInput(contactSchema, await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });

  const { name, email, phone, courseInterest, message } = parsed.data;

  await ContactSubmission.create({
    id: createId(),
    name,
    email,
    phone: phone || null,
    courseInterest: courseInterest || null,
    message,
    createdAt: new Date(),
  });

  after(() =>
    sendMail({
      subject: `Contact Form: ${name}`,
      replyTo: email,
      html: `
        <h2>New Contact Form Submission</h2>
        <table cellpadding="8" style="border-collapse:collapse;width:100%;max-width:600px">
          <tr><td><strong>Name</strong></td><td>${escapeHtml(name)}</td></tr>
          <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
          <tr><td><strong>Phone</strong></td><td>${escapeHtml(phone || "—")}</td></tr>
          <tr><td><strong>Course Interest</strong></td><td>${escapeHtml(courseInterest || "—")}</td></tr>
          <tr><td><strong>Message</strong></td><td style="white-space:pre-wrap">${escapeHtml(message)}</td></tr>
        </table>
      `,
    }),
  );

  return Response.json({ success: true });
}
