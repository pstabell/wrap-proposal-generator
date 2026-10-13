import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// SEO 2026-10-13: the tool's home page stays indexable (it was indexed and ranking); the product page on
// agenient.com is the long-form description and is linked from the footer. /api/ is disallowed in robots.ts.
const TITLE = "WRAP Insurance Proposal Generator | Free for Agents";
const DESCRIPTION =
  "Free insurance proposal generator for high-net-worth agents. Upload dec pages and carrier quotes, compare expiring vs. renewal premiums, and export a branded Word proposal.";

export const metadata: Metadata = {
  metadataBase: new URL("https://wrap.metropointtech.com"),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "WRAP Proposal Generator",
    title: TITLE,
    description: DESCRIPTION,
    url: "https://wrap.metropointtech.com/",
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Script src="/lead-gate.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
