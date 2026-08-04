import { jsonLd } from "@/lib/schema-org";

/**
 * Renders JSON-LD. Server component, so the markup is in the initial HTML where
 * crawlers and AI agents see it without executing anything.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Content is built server-side from our own data and `<` is escaped in
      // jsonLd(), so it cannot break out of the tag.
      dangerouslySetInnerHTML={{ __html: jsonLd(data) }}
    />
  );
}
