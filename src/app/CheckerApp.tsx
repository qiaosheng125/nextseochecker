"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

type Severity = "critical" | "warning" | "passed";

type Check = {
  id: string;
  category: string;
  title: string;
  severity: Severity;
  message: string;
  detail?: string;
  fixPrompt?: string;
};

type CheckResponse = {
  inputUrl: string;
  finalUrl: string;
  redirectChain: string[];
  summary: Record<Severity, number>;
  checks: Check[];
  sampledUrls: Array<{
    url: string;
    status?: number;
    ok: boolean;
  }>;
};

const exampleUrl = "https://www.nextseochecker.com";

const severityLabel: Record<Severity, string> = {
  critical: "Critical",
  warning: "Warning",
  passed: "Passed"
};

const severityText: Record<Severity, string> = {
  critical: "Fix before submitting to Google.",
  warning: "Worth improving before launch.",
  passed: "This signal looks fine."
};

function groupChecks(checks: Check[]) {
  return checks.reduce<Record<string, Check[]>>((groups, check) => {
    groups[check.category] = groups[check.category] ?? [];
    groups[check.category].push(check);
    return groups;
  }, {});
}

function verdict(summary: Record<Severity, number>) {
  if (summary.critical > 0) {
    return {
      title: "Fix the critical items first",
      text: "Do not submit this URL to Search Console yet. One or more technical signals can block indexing.",
      tone: "danger"
    };
  }

  if (summary.warning > 0) {
    return {
      title: "Launchable, but not clean yet",
      text: "The page is probably crawlable, but a few launch details are still weak.",
      tone: "warn"
    };
  }

  return {
    title: "Launch lights are green",
    text: "The core crawl and indexing signals look ready. Submit the sitemap and monitor Search Console.",
    tone: "good"
  };
}

function buildAllIssuesPrompt(result: CheckResponse) {
  const issues = result.checks.filter((check) => check.severity !== "passed");

  if (issues.length === 0) {
    return `Please review this site before launch: ${result.finalUrl}

The SEO preflight tool found no critical or warning items. Please still review the Next.js metadata, canonical URL, robots.txt, sitemap.xml, Open Graph image, and Search Console launch readiness.`;
  }

  const issueList = issues
    .map((check, index) => {
      return `${index + 1}. [${severityLabel[check.severity]}] ${check.title}
Category: ${check.category}
Problem: ${check.message}
Detail: ${check.detail ?? "No extra detail"}
Suggested fix task: ${check.fixPrompt ?? "Investigate and fix this issue."}`;
    })
    .join("\n\n");

  return `Please fix the SEO preflight issues for this website: ${result.finalUrl}

Context:
- This is a public website launch check.
- Prioritize Critical issues first, then Warning issues.
- Do not change unrelated UI or product behavior unless needed for the SEO fix.
- After fixing, explain which files changed and how to verify the result.

Issues:
${issueList}

Also verify:
- homepage returns 200
- canonical URL points to the production domain
- robots.txt allows Googlebot
- sitemap.xml is readable and uses canonical URLs
- no noindex directive is present
- title, meta description, H1, Open Graph, and JSON-LD are valid`;
}

function trackEvent(eventName: string, params: Record<string, string | number> = {}) {
  const gtag = (window as typeof window & {
    gtag?: (command: "event", name: string, params?: Record<string, string | number>) => void;
  }).gtag;

  gtag?.("event", eventName, params);
}

export default function Home() {
  const [url, setUrl] = useState(exampleUrl);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState("");
  const [copiedAll, setCopiedAll] = useState(false);

  const grouped = useMemo(() => (result ? groupChecks(result.checks) : {}), [result]);
  const currentVerdict = useMemo(
    () => (result ? verdict(result.summary) : null),
    [result]
  );

  async function runCheck(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setLoading(true);
    setError("");
    setCopiedId("");
    setCopiedAll(false);
    trackEvent("run_seo_check");

    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Check failed.");
      setResult(data);
      trackEvent("seo_check_success", {
        critical: data.summary?.critical ?? 0,
        warning: data.summary?.warning ?? 0,
        passed: data.summary?.passed ?? 0
      });
    } catch (caught) {
      setResult(null);
      setError(caught instanceof Error ? caught.message : "Check failed.");
      trackEvent("seo_check_error");
    } finally {
      setLoading(false);
    }
  }

  async function copyPrompt(check: Check) {
    if (!check.fixPrompt) return;
    await navigator.clipboard.writeText(check.fixPrompt);
    setCopiedId(check.id);
    setCopiedAll(false);
    trackEvent("copy_single_fix_prompt", {
      issue: check.id,
      severity: check.severity
    });
  }

  async function copyAllIssues() {
    if (!result) return;
    await navigator.clipboard.writeText(buildAllIssuesPrompt(result));
    setCopiedAll(true);
    setCopiedId("");
    trackEvent("copy_all_issues_prompt", {
      critical: result.summary.critical,
      warning: result.summary.warning
    });
  }

  return (
    <main>
      <section className="tool-shell">
        <div className="intro">
          <div>
            <p className="eyebrow">Vercel SEO Preflight</p>
            <h1>Check if your Vercel site is ready for Google</h1>
          </div>
          <p className="intro-copy">
            Test redirects, canonical URLs, robots.txt, sitemap.xml, noindex
            tags, and basic metadata before submitting a new Next.js site to
            Search Console.
          </p>
        </div>

        <form className="check-form" onSubmit={runCheck}>
          <label htmlFor="url">Website URL</label>
          <div className="input-row">
            <input
              id="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://www.example.com"
              spellCheck={false}
            />
            <button disabled={loading} type="submit">
              {loading ? "Checking..." : "Run check"}
            </button>
          </div>
          <div className="form-actions">
            <button
              className="ghost-button"
              type="button"
              onClick={() => setUrl(exampleUrl)}
            >
              Use sample
            </button>
            <span>No signup. Public pages only. Built for Vercel launches.</span>
          </div>
        </form>

        {error ? <div className="error-box">{error}</div> : null}

        {result && currentVerdict ? (
          <section className={`result-panel ${currentVerdict.tone}`}>
            <div className="result-head">
              <div>
                <p className="eyebrow">Result</p>
                <h2>{currentVerdict.title}</h2>
                <p>{currentVerdict.text}</p>
                <button className="copy-all-button" type="button" onClick={copyAllIssues}>
                  {copiedAll ? "Copied full AI prompt" : "Copy all issues for AI"}
                </button>
              </div>
              <div className="score-grid">
                {(["critical", "warning", "passed"] as Severity[]).map((item) => (
                  <div className={`score-card ${item}`} key={item}>
                    <span>{severityLabel[item]}</span>
                    <strong>{result.summary[item]}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="url-strip">
              <span>Final URL</span>
              <strong>{result.finalUrl}</strong>
            </div>

            <div className="checks">
              {Object.entries(grouped).map(([category, checks]) => (
                <section className="check-group" key={category}>
                  <h3>{category}</h3>
                  {checks.map((check) => (
                    <article className={`check-item ${check.severity}`} key={check.id}>
                      <div className="check-main">
                        <span className="status-dot">{severityLabel[check.severity]}</span>
                        <div>
                          <h4>{check.title}</h4>
                          <p>{check.message}</p>
                          {check.detail ? <code>{check.detail}</code> : null}
                        </div>
                      </div>
                      <div className="check-side">
                        <small>{severityText[check.severity]}</small>
                        {check.fixPrompt ? (
                          <button type="button" onClick={() => copyPrompt(check)}>
                            {copiedId === check.id ? "Copied" : "Copy fix prompt"}
                          </button>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </section>
              ))}
            </div>

            {result.sampledUrls.length > 0 ? (
              <section className="sample-panel">
                <h3>Sitemap sample</h3>
                <div className="sample-list">
                  {result.sampledUrls.map((item) => (
                    <div className="sample-row" key={item.url}>
                      <span className={item.ok ? "sample-ok" : "sample-bad"}>
                        {item.ok ? "OK" : "Check"}
                      </span>
                      <code>{item.url}</code>
                      <strong>{item.status ?? "--"}</strong>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </section>
        ) : (
          <ContentSections />
        )}
        <SiteFooter />
      </section>
    </main>
  );
}

function ContentSections() {
  return (
    <>
      <section className="empty-state">
        <div>
          <p className="eyebrow">What this catches</p>
          <h2>Small launch mistakes that quietly block indexing</h2>
        </div>
        <div className="mini-grid">
          <span>noindex left on production</span>
          <span>wrong canonical domain</span>
          <span>robots.txt blocking Googlebot</span>
          <span>missing or broken sitemap.xml</span>
          <span>weak title and description</span>
          <span>messy redirect chains</span>
        </div>
      </section>

      <section className="learning-section">
        <div className="section-heading">
          <p className="eyebrow">Launch preflight</p>
          <h2>Why a new Vercel site can stay out of Google</h2>
          <p>
            A new Next.js site can load perfectly in the browser and still fail
            Google indexing. The usual cause is not one dramatic SEO problem. It
            is a small technical signal that tells crawlers the page is not the
            preferred page, not ready to index, or not discoverable enough.
          </p>
        </div>
        <div className="info-grid">
          <article>
            <h3>Canonical confusion</h3>
            <p>
              If the production page says another host is canonical, Google may
              ignore the URL you submitted. This often happens when metadata
              still points to a temporary Vercel domain or an old domain.
            </p>
          </article>
          <article>
            <h3>Blocked crawling</h3>
            <p>
              A restrictive robots.txt file, a noindex meta tag, or an
              X-Robots-Tag header can make a page available to users but
              unavailable for search indexing.
            </p>
          </article>
          <article>
            <h3>Weak discovery signals</h3>
            <p>
              Google can find pages faster when sitemap.xml is readable,
              robots.txt references the sitemap, and all sitemap URLs use the
              final production domain.
            </p>
          </article>
          <article>
            <h3>Thin launch pages</h3>
            <p>
              A homepage with only a form, placeholder text, or very little
              visible context can be treated as low-value or soft-404-like even
              when it returns HTTP 200.
            </p>
          </article>
        </div>
      </section>

      <section className="learning-section">
        <div className="section-heading">
          <p className="eyebrow">Fix faster</p>
          <h2>Checks built for AI-assisted developers</h2>
          <p>
            The report is designed for people who build with Codex, Claude,
            Gemini, Cursor, or similar AI coding tools. Each issue includes a
            plain-English explanation and a copyable fix prompt, so the result
            can become a concrete engineering task instead of a vague SEO note.
          </p>
        </div>
        <div className="checklist-band">
          <div>
            <strong>Before Search Console submission</strong>
            <span>Confirm status 200, canonical URL, robots.txt, sitemap.xml, and noindex.</span>
          </div>
          <div>
            <strong>After deployment</strong>
            <span>Check the final domain, not the preview URL or the Vercel temporary URL.</span>
          </div>
          <div>
            <strong>When warnings appear</strong>
            <span>Copy all issues into your AI coding assistant and fix the technical blockers first.</span>
          </div>
        </div>
      </section>

      <section className="learning-section">
        <div className="section-heading">
          <p className="eyebrow">FAQ</p>
          <h2>Common questions before submitting a new site</h2>
        </div>
        <div className="faq-list">
          <article>
            <h3>Can this tool make Google index my page?</h3>
            <p>
              No. It cannot force indexing or guarantee rankings. It checks
              whether obvious technical blockers are present before you submit a
              URL or sitemap in Google Search Console.
            </p>
          </article>
          <article>
            <h3>Why check the final production domain?</h3>
            <p>
              Preview URLs and temporary Vercel domains can have different
              redirects, canonical URLs, robots.txt files, or sitemap URLs. The
              production domain is the URL Google will judge.
            </p>
          </article>
          <article>
            <h3>What should I fix first?</h3>
            <p>
              Fix Critical issues first, especially noindex directives, blocked
              robots.txt rules, non-200 responses, and canonical URLs pointing
              to another host. Then review warnings.
            </p>
          </article>
          <article>
            <h3>Why include AI fix prompts?</h3>
            <p>
              Many builders use Codex, Claude, Gemini, or Cursor to ship small
              sites. Copyable prompts turn SEO findings into concrete code
              tasks that an AI coding assistant can act on.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <strong>Next SEO Checker</strong>
        <span>Launch preflight checks for Next.js and Vercel sites.</span>
      </div>
      <nav aria-label="Footer navigation">
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/privacy">Privacy</Link>
      </nav>
    </footer>
  );
}
