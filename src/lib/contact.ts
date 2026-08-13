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
    street: "Balbhadra Marg",
    locality: "New Baneshwor",
    region: "Bagmati",
    city: "Kathmandu",
    postalCode: "44703",
    country: "NP",
    full: "Balbhadra Marg, New Baneshwor, Kathmandu 44703, Nepal",
  },

  /**
   * The verified Google Business Profile, and the coordinates behind it.
   *
   * Taken from the business listing itself (maps.app.goo.gl/6BPGgAcrXHZ8DMuJ7),
   * not geocoded from the address string - so the pin, the `geo` in structured
   * data and the directions link all agree. `place` is the short share link:
   * stable, and the one to hand out anywhere a URL has to be typed or printed.
   */
  maps: {
    lat: 27.6944856,
    lng: 85.3377256,
    place: "https://maps.app.goo.gl/6BPGgAcrXHZ8DMuJ7",
  },
} as const;

/** Opens turn-by-turn directions - the Maps app on mobile, the web app elsewhere. */
export const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${contact.maps.lat},${contact.maps.lng}`;

/**
 * Keyless Maps embed. The Embed API proper needs a billing-enabled key; this
 * older `output=embed` form does not, which keeps the contact page working
 * without adding a key to the client bundle.
 */
export const mapEmbedHref = `https://maps.google.com/maps?q=${contact.maps.lat},${contact.maps.lng}&z=16&hl=en&output=embed`;

export const mailtoHref = `mailto:${contact.email}`;
export const telHref = `tel:${contact.phoneE164}`;
