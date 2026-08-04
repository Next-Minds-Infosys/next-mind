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

  /**
   * Address and hours, in one place.
   *
   * The footer said "Sun-Fri: 9 AM - 6 PM" and the contact page said
   * "7 AM - 8 PM" - the same conflict that produced three different email
   * domains. Both now read from here. CONFIRM WHICH IS CORRECT: the contact
   * page's wider window is used below because it was the more recently edited
   * of the two.
   */
  hours: "Sun–Fri: 7 AM – 8 PM",
  /** Machine-readable form for opening-hours structured data. */
  hoursSpec: { days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "07:00", closes: "20:00" },

  address: {
    locality: "New Baneshwor",
    region: "Bagmati",
    city: "Kathmandu",
    country: "NP",
    full: "New Baneshwor, Kathmandu, Nepal",
  },
} as const;

export const mailtoHref = `mailto:${contact.email}`;
export const telHref = `tel:${contact.phoneE164}`;
