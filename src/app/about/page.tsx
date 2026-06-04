import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Next SEO Checker, a launch preflight tool for Vercel and Next.js sites.",
  alternates: {
    canonical: "/about"
  }
};

export default function AboutPage() {
  return (
    <main>
      <section className="content-page">
        <p className="eyebrow">About</p>
        <h1>About Next SEO Checker</h1>
        <p>
          Next SEO Checker is a launch preflight tool for developers shipping
          Next.js and Vercel websites. It checks common technical issues that
          can slow down or block search indexing before a site is submitted to
          Google Search Console.
        </p>
        <p>
          The tool focuses on practical launch signals: HTTP status, redirect
          chains, canonical URLs, noindex directives, robots.txt, sitemap.xml,
          basic metadata, Open Graph tags, and structured data parsing.
        </p>
        <p>
          It is not a full SEO audit, keyword research tool, backlink checker,
          or ranking guarantee. Its purpose is narrower: catch avoidable
          technical mistakes before a new production site is submitted for
          indexing.
        </p>
        <Link className="text-link" href="/">
          Run a preflight check
        </Link>
      </section>
    </main>
  );
}
