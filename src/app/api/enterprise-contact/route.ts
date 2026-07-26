import { NextRequest, after } from "next/server";
import { sendMail } from "@/lib/mailer";
import { createId } from "@/db/id";
import { enterpriseContactSchema, parseInput } from "@/lib/schemas";
import { EnterpriseInquiry } from "@/db/models/entrise-query";
// import { EnterpriseInquiry, createId } from "@/db";

export async function POST(request: NextRequest) {
  const parsed = parseInput(enterpriseContactSchema, await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });

  const { name, orgName, email, phone, orgType, teamSize, trainingInterests } = parsed.data;

  await EnterpriseInquiry.create({
    id: createId(),
    name,
    orgName,
    email,
    phone: phone || null,
    orgType: orgType || null,
    teamSize: teamSize || null,
    trainingInterests: trainingInterests || null,
    createdAt: new Date(),
  });

  after(() =>
    sendMail({
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
    })
  );

  return Response.json({ success: true });
}
