import type { Metadata } from "next";
import "./globals.css";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  // Resolves relative OG/canonical URLs against the real domain instead of the
  // deployment host, and keeps them consistent with sitemap.xml.
  metadataBase: new URL(siteUrl),
  title: "Next Minds — IT Training in Kathmandu",
  description:
    "Offering a range of IT training courses including Digital Marketing and Cyber Security, with interactive online and physical classes for students in Nepal and beyond.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
