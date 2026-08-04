import { contact } from "./contact";
import { siteUrl } from "./site";

/**
 * JSON-LD builders.
 *
 * The site had no structured data at all, so Google had nothing to build a rich
 * result from and AI search had nothing to cite. Everything here is derived
 * from real values already on the site - no invented ratings, no invented
 * counts. `aggregateRating` is deliberately absent: the homepage and /about
 * still quote different student and placement numbers, and publishing a rating
 * that contradicts the visible page is worse than publishing none.
 */

const ORG_ID = `${siteUrl}/#organization`;
const SITE_ID = `${siteUrl}/#website`;

/** Escapes `<` so a value can never break out of the script tag. */
export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["EducationalOrganization", "LocalBusiness"],
    "@id": ORG_ID,
    name: "Next Minds Infosys",
    alternateName: "Next Minds",
    url: siteUrl,
    logo: `${siteUrl}/assets/logo-horizontal.png`,
    image: `${siteUrl}/assets/logo-horizontal.png`,
    email: contact.email,
    telephone: contact.phoneE164,
    description:
      "IT training institute in Kathmandu offering courses in full stack development, cyber security, digital marketing, DevOps, QA engineering and data science — online and on campus.",
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.address.locality,
      addressLocality: contact.address.city,
      addressRegion: contact.address.region,
      addressCountry: contact.address.country,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: contact.hoursSpec.days,
        opens: contact.hoursSpec.opens,
        closes: contact.hoursSpec.closes,
      },
    ],
    areaServed: { "@type": "Country", name: "Nepal" },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "admissions",
        telephone: contact.phoneE164,
        email: contact.email,
        areaServed: "NP",
        availableLanguage: ["en", "ne"],
      },
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    url: siteUrl,
    name: "Next Minds Infosys",
    publisher: { "@id": ORG_ID },
  };
}

export interface CourseSchemaInput {
  slug: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  level: string;
  imageUrl: string | null;
  category: string;
}

/**
 * Course rich result. `offers` needs a real price and currency; `hasCourseInstance`
 * is what makes the mode and duration eligible to show.
 */
export function courseSchema(c: CourseSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${siteUrl}/courses/${c.slug}#course`,
    name: c.title,
    description: c.description.slice(0, 500),
    url: `${siteUrl}/courses/${c.slug}`,
    ...(c.imageUrl ? { image: `${siteUrl}${c.imageUrl}` } : {}),
    provider: { "@id": ORG_ID },
    educationalLevel: c.level,
    about: c.category,
    inLanguage: "en",
    offers: [
      {
        "@type": "Offer",
        category: "Paid",
        price: c.price,
        priceCurrency: "NPR",
        availability: "https://schema.org/InStock",
        url: `${siteUrl}/courses/${c.slug}`,
      },
    ],
    hasCourseInstance: [
      {
        "@type": "CourseInstance",
        // The institute runs both, so both are declared rather than guessing.
        courseMode: ["Onsite", "Online"],
        courseWorkload: c.duration,
        location: {
          "@type": "Place",
          name: "Next Minds Infosys",
          address: {
            "@type": "PostalAddress",
            streetAddress: contact.address.locality,
            addressLocality: contact.address.city,
            addressCountry: contact.address.country,
          },
        },
      },
    ],
  };
}

export interface ArticleSchemaInput {
  slug: string;
  title: string;
  excerpt: string;
  authorName: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
}

export function articleSchema(a: ArticleSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${siteUrl}/blog/${a.slug}#article`,
    headline: a.title.slice(0, 110),
    description: a.excerpt,
    url: `${siteUrl}/blog/${a.slug}`,
    datePublished: (a.publishedAt ?? a.updatedAt).toISOString(),
    dateModified: a.updatedAt.toISOString(),
    author: { "@type": a.authorName ? "Person" : "Organization", name: a.authorName ?? "Next Minds Infosys" },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}/blog/${a.slug}` },
  };
}

/** Trail for the breadcrumb rich result. Pass paths without the origin. */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${siteUrl}${t.path}`,
    })),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
