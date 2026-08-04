import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { siteUrl } from "@/lib/site";
import { GTM_ID, analyticsEnabled } from "@/lib/analytics";

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
    images: [{ url: "/assets/logo-horizontal.png", width: 1959, height: 356 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Next Minds — IT Training in Kathmandu",
    description:
      "Industry-aligned IT training in Kathmandu — online and on campus at New Baneshwor.",
    images: ["/assets/logo-horizontal.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
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
