import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Next SEO Checker for bug reports, feedback, and launch preflight suggestions."
};

export default function ContactPage() {
  return (
    <main>
      <section className="content-page">
        <p className="eyebrow">Contact</p>
        <h1>Contact</h1>
        <p>
          For bug reports, false positives, feature suggestions, or indexing
          edge cases, open a GitHub issue for the project.
        </p>
        <p>
          GitHub Issues:{" "}
          <a href="https://github.com/qiaosheng125/nextseochecker/issues">
            github.com/qiaosheng125/nextseochecker/issues
          </a>
        </p>
        <p>
          When reporting an issue, include the tested URL, the check result, and
          what you expected the tool to show. Do not include passwords, private
          dashboards, secret URLs, or credentials.
        </p>
        <Link className="text-link" href="/">
          Back to checker
        </Link>
      </section>
    </main>
  );
}
