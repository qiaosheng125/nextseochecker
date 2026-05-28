import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for Next SEO Checker, including public URL checks, Google Analytics, and Microsoft Clarity."
};

export default function PrivacyPage() {
  return (
    <main>
      <section className="content-page">
        <p className="eyebrow">Privacy</p>
        <h1>Privacy Policy</h1>
        <p>
          Next SEO Checker checks public webpages entered by users. Do not enter
          private dashboards, internal URLs, localhost addresses, or pages that
          require authentication.
        </p>
        <h2>What the tool processes</h2>
        <p>
          When you run a check, the service requests the submitted public URL
          and related public files such as robots.txt and sitemap.xml. The result
          is shown in your browser so you can review technical launch issues.
        </p>
        <h2>Analytics</h2>
        <p>
          This site uses Google Analytics 4 and Microsoft Clarity to understand
          basic usage, page interactions, and product issues. These tools may
          collect browser, device, interaction, and approximate location data
          according to their own policies.
        </p>
        <h2>Personal information</h2>
        <p>
          The tool does not ask for an account, password, payment details, or
          private credentials. If you contact the maintainer by email, your email
          address and message are used only to respond to that request.
        </p>
        <h2>Contact</h2>
        <p>
          Questions and non-sensitive feedback can be opened on{" "}
          <a href="https://github.com/qiaosheng125/nextseochecker/issues">
            GitHub Issues
          </a>.
        </p>
        <Link className="text-link" href="/">
          Back to checker
        </Link>
      </section>
    </main>
  );
}
