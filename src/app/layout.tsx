import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { siteUrl } from "@/lib/site";
import { GTM_ID, analyticsEnabled } from "@/lib/analytics";
import { JsonLd } from "@/components/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/schema-org";

export const metadata: Metadata = {
  // Resolves relative OG/canonical URLs against the real domain instead of the
  // deployment host, and keeps them consistent with sitemap.xml.
  metadataBase: new URL(siteUrl),
  title: {
    default: "Next Minds — IT Training in Kathmandu",
    // Child pages set only their own name; the suffix is applied here so it
    // cannot drift between pages.
    template: "%s — Next Minds Infosys",
  },
  description:
    "Offering a range of IT training courses including Digital Marketing and Cyber Security, with interactive online and physical classes for students in Nepal and beyond.",
  applicationName: "Next Minds Infosys",
  openGraph: {
    type: "website",
    siteName: "Next Minds Infosys",
    locale: "en_NP",
    url: siteUrl,
    title: "Next Minds — IT Training in Kathmandu",
    description:
      "Industry-aligned IT training in Kathmandu — online and on campus at New Baneshwor.",
    images: [{ url: "/assets/og-default.png", width: 1200, height: 630, alt: "Next Minds Infosys — IT training in Kathmandu" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Next Minds — IT Training in Kathmandu",
    description:
      "Industry-aligned IT training in Kathmandu — online and on campus at New Baneshwor.",
    images: ["/assets/og-default.png"],
  },
  robots: { index: true, follow: true },
  // Google Search Console ownership. Next renders this as
  // <meta name="google-site-verification" content="..."> in <head>.
  // Not a secret - it only proves control of the domain - but it must stay put:
  // removing it un-verifies the property and Search Console stops reporting.
  verification: { google: "r5DKUG4dkUY38iO0J3VPTBQuuPSIREahJPKTV4auGV4" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/*
        Grammarly and similar extensions write data-* attributes onto <body>
        before React hydrates (data-gr-ext-installed, data-new-gr-c-s-check-loaded),
        which React reports as a hydration mismatch. It is not ours to fix and
        affects nothing, so the warning is suppressed at exactly this node -
        suppressHydrationWarning is one level deep, so real mismatches inside
        the tree are still reported.
      */}
      <body className="antialiased font-sans" suppressHydrationWarning>
        {/* Identity graph: every other schema on the site references these by @id. */}
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        {/*
          Google Tag Manager, using next/script rather than the
          @next/third-parties package so this adds no dependency.

          `afterInteractive` is the right strategy for GTM: it loads once the
          page is interactive, so the tag never blocks first paint, but still
          runs early enough to catch the pageview. The <noscript> iframe is the
          fallback GTM requires and must sit at the top of <body>.
        */}
        {analyticsEnabled && (
          <>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
                title="Google Tag Manager"
              />
            </noscript>
            <Script id="gtm-init" strategy="afterInteractive">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
            </Script>
          </>
        )}
        {children}
      </body>
    </html>
  );
}
