import { NextRequest } from "next/server";
import { sendMail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, orgName, email, phone, orgType, teamSize, trainingInterests } = body;

  if (!name || !email || !orgName) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  await sendMail({
    subject: `Enterprise Inquiry: ${orgName}`,
    replyTo: email,
    html: `
      <h2>New Enterprise Inquiry</h2>
      <table cellpadding="8" style="border-collapse:collapse;width:100%;max-width:600px">
        <tr><td><strong>Contact Name</strong></td><td>${name}</td></tr>
        <tr><td><strong>Organization</strong></td><td>${orgName}</td></tr>
        <tr><td><strong>Email</strong></td><td>${email}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${phone || "—"}</td></tr>
        <tr><td><strong>Organization Type</strong></td><td>${orgType || "—"}</td></tr>
        <tr><td><strong>Team Size</strong></td><td>${teamSize || "—"}</td></tr>
        <tr><td><strong>Training Interests</strong></td><td style="white-space:pre-wrap">${trainingInterests || "—"}</td></tr>
      </table>
    `,
  });

  return Response.json({ success: true });
}
