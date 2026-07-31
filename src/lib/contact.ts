/**
 * Real contact details, in one place.
 *
 * These were previously hand-typed at each call site, which is how the site
 * ended up advertising three different domains (nextmindsinfosys.com,
 * nextminds.com.np, nextminds.edu.np) and several `9XXXXXXXXX` placeholders.
 */
export const contact = {
  email: "info@nextmindsinfosys.com",

  /** National format, for display. */
  phoneDisplay: "+977-9716500918",
  /** E.164, for tel: and wa.me links - no spaces, dashes or leading zero. */
  phoneE164: "+9779716500918",
  whatsapp: "https://wa.me/9779716500918",
} as const;

export const mailtoHref = `mailto:${contact.email}`;
export const telHref = `tel:${contact.phoneE164}`;
