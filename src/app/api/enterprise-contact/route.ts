import { NextRequest, after } from "next/server";
import { escapeHtml } from "@/lib/escape";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { sendMail } from "@/lib/mailer";
import { createId } from "@/db/id";
import { enterpriseContactSchema, parseInput } from "@/lib/schemas";
import { EnterpriseInquiry } from "@/db";

export async function POST(request: NextRequest) {
  // Unauthenticated write + outbound email: throttle before doing either.
  const limit = rateLimit(`enterprise:` + clientIp(request), 5);
  if (!limit.ok) {
    return Response.json(
      { error: "Too many submissions. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

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
          <tr><td><strong>Contact Name</strong></td><td>${escapeHtml(name)}</td></tr>
          <tr><td><strong>Organization</strong></td><td>${escapeHtml(orgName)}</td></tr>
          <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
          <tr><td><strong>Phone</strong></td><td>${escapeHtml(phone || "—")}</td></tr>
          <tr><td><strong>Organization Type</strong></td><td>${escapeHtml(orgType || "—")}</td></tr>
          <tr><td><strong>Team Size</strong></td><td>${escapeHtml(teamSize || "—")}</td></tr>
          <tr><td><strong>Training Interests</strong></td><td style="white-space:pre-wrap">${escapeHtml(trainingInterests || "—")}</td></tr>
        </table>
      `,
    }),
  );

  return Response.json({ success: true });
}
