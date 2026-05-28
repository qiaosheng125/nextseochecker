import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://www.nextseochecker.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Next.js SEO Checker for Vercel Sites",
    template: "%s | Vercel SEO Preflight"
  },
  description:
    "Check if your Next.js or Vercel site is ready for Google. Test redirects, canonical URLs, robots.txt, sitemap.xml, noindex tags, and basic metadata before submitting to Search Console.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Next.js SEO Checker for Vercel Sites",
    description:
      "Run a launch preflight check for Vercel and Next.js sites before submitting them to Google Search Console.",
    url: siteUrl,
    siteName: "Vercel SEO Preflight",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Vercel SEO Preflight checker preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Next.js SEO Checker for Vercel Sites",
    description:
      "Run a launch preflight check for Vercel and Next.js sites before submitting them to Google Search Console.",
    images: ["/opengraph-image"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
