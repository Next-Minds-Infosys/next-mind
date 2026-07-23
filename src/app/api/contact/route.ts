import { NextRequest } from "next/server";
import { sendMail } from "@/lib/mailer";
import { ContactSubmission } from "@/db/models";
import { createId } from "@/db/id";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, phone, courseInterest, message } = body;

  if (!name || !email || !message) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  await ContactSubmission.create({
    id: createId(),
    name,
    email,
    phone: phone || null,
    courseInterest: courseInterest || null,
    message,
    createdAt: new Date(),
  });

  await sendMail({
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
  });

  return Response.json({ success: true });
}
