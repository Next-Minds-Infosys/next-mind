/**
 * HTML-escape untrusted text before putting it in an email body.
 *
 * The notification mails interpolate visitor-supplied name/email/phone/message
 * straight into an HTML template. Anyone submitting the contact form could put
 * markup - including a link or a hidden payload - into the mail your staff open.
 * Not an XSS on the site, but it is injection into a document you render.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
