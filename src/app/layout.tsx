import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next Minds",
  description:
    "Offers IT training courses through physical and online classes, enabling learners across Nepal to enhance their skills and advance their careers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
