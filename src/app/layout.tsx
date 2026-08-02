import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";
import { siteUrl } from "@/lib/site";

const GTM_ID = "GTM-59LSJGH8";

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
      <GoogleTagManager gtmId={GTM_ID} />
      <body className="antialiased font-sans">
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
