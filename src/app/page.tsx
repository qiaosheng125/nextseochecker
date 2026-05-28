"use client";

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

const exampleUrl = "https://www.playspeedcalc.net";

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

    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Check failed.");
      setResult(data);
    } catch (caught) {
      setResult(null);
      setError(caught instanceof Error ? caught.message : "Check failed.");
    } finally {
      setLoading(false);
    }
  }

  async function copyPrompt(check: Check) {
    if (!check.fixPrompt) return;
    await navigator.clipboard.writeText(check.fixPrompt);
    setCopiedId(check.id);
    setCopiedAll(false);
  }

  async function copyAllIssues() {
    if (!result) return;
    await navigator.clipboard.writeText(buildAllIssuesPrompt(result));
    setCopiedAll(true);
    setCopiedId("");
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
        )}
      </section>
    </main>
  );
}
