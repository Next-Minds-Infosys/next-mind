import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
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
