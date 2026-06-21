import { NextRequest } from "next/server";
import { sendMail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { fullName, email, phone, address, course, educationLevel, learningFormat, hasLaptop } = body;

  if (!fullName || !email || !course) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  await sendMail({
    subject: `New Enrollment: ${fullName} — ${course}`,
    replyTo: email,
    html: `
      <h2>New Course Enrollment</h2>
      <table cellpadding="8" style="border-collapse:collapse;width:100%;max-width:600px">
        <tr><td><strong>Full Name</strong></td><td>${fullName}</td></tr>
        <tr><td><strong>Email</strong></td><td>${email}</td></tr>
        <tr><td><strong>Phone</strong></td><td>+977 ${phone}</td></tr>
        <tr><td><strong>Address</strong></td><td>${address || "—"}</td></tr>
        <tr><td><strong>Course</strong></td><td>${course}</td></tr>
        <tr><td><strong>Education Level</strong></td><td>${educationLevel || "—"}</td></tr>
        <tr><td><strong>Learning Format</strong></td><td>${learningFormat}</td></tr>
        <tr><td><strong>Has Laptop</strong></td><td>${hasLaptop}</td></tr>
      </table>
    `,
  });

  return Response.json({ success: true });
}
