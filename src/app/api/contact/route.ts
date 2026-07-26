import { NextRequest, after } from "next/server";
import { sendMail } from "@/lib/mailer";
import { ContactSubmission } from "@/db/models";
import { createId } from "@/db/id";
import { contactSchema, parseInput } from "@/lib/schemas";

export async function POST(request: NextRequest) {
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
          <tr><td><strong>Name</strong></td><td>${name}</td></tr>
          <tr><td><strong>Email</strong></td><td>${email}</td></tr>
          <tr><td><strong>Phone</strong></td><td>${phone || "—"}</td></tr>
          <tr><td><strong>Course Interest</strong></td><td>${courseInterest || "—"}</td></tr>
          <tr><td><strong>Message</strong></td><td style="white-space:pre-wrap">${message}</td></tr>
        </table>
      `,
    })
  );

  return Response.json({ success: true });
}
