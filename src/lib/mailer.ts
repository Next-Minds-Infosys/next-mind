import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail(options: { subject: string; html: string; replyTo?: string }) {
  await transporter.sendMail({
    from: `"Next Minds Website" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_TO,
    replyTo: options.replyTo,
    subject: options.subject,
    html: options.html,
  });
}
