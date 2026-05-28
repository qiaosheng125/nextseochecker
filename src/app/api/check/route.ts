import { NextResponse } from "next/server";

export const runtime = "nodejs";

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

type SampledUrl = {
  url: string;
  status?: number;
  ok: boolean;
};

const USER_AGENT =
  "VercelSEOPreflight/0.1 (+https://vercel-seo-preflight.vercel.app)";
const FETCH_TIMEOUT_MS = 9000;
const MAX_BODY_CHARS = 700000;
const MAX_REDIRECTS = 5;
const SITEMAP_SAMPLE_LIMIT = 10;

function normalizeUrl(input: string): URL {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Enter a website URL.");

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withProtocol);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http and https URLs can be checked.");
  }
  url.hash = "";
  return url;
}

function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host === "0.0.0.0" ||
    host === "::1"
  ) {
    return true;
  }

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipv4) return false;

  const parts = ipv4.slice(1).map(Number);
  if (parts.some((part) => part < 0 || part > 255)) return true;
  const [a, b] = parts;
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254)
  );
}

function assertPublicUrl(url: URL) {
  if (isPrivateHost(url.hostname)) {
    throw new Error("Private, local, or internal network URLs are not allowed.");
  }
}

async function fetchWithTimeout(url: URL, init: RequestInit = {}) {
  assertPublicUrl(url);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,application/xhtml+xml,application/xml,text/plain,*/*",
        ...(init.headers ?? {})
      },
      cache: "no-store"
    });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchHtmlWithRedirects(startUrl: URL) {
  const chain: string[] = [startUrl.toString()];
  let current = startUrl;
  let response: Response | null = null;

  for (let step = 0; step <= MAX_REDIRECTS; step += 1) {
    response = await fetchWithTimeout(current, { redirect: "manual" });
    const location = response.headers.get("location");
    if (!location || response.status < 300 || response.status >= 400) break;

    const next = new URL(location, current);
    assertPublicUrl(next);
    chain.push(next.toString());
    current = next;
  }

  if (!response) throw new Error("No response received.");

  const contentType = response.headers.get("content-type") ?? "";
  const text = contentType.includes("text") || contentType.includes("html")
    ? (await response.text()).slice(0, MAX_BODY_CHARS)
    : "";

  return {
    finalUrl: current,
    response,
    html: text,
    redirectChain: chain
  };
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function stripTags(value: string): string {
  return decodeEntities(value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " "));
}

function extractTitle(html: string): string {
  return stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
}

function extractH1(html: string): string {
  return stripTags(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "");
}

function attrValue(tag: string, attr: string): string {
  const match = tag.match(new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, "i"));
  return decodeEntities(match?.[1] ?? "");
}

function findMeta(html: string, key: "name" | "property", value: string): string {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  const target = value.toLowerCase();
  for (const tag of tags) {
    if (attrValue(tag, key).toLowerCase() === target) {
      return attrValue(tag, "content");
    }
  }
  return "";
}

function findCanonical(html: string): string {
  const links = html.match(/<link\b[^>]*>/gi) ?? [];
  for (const link of links) {
    if (attrValue(link, "rel").toLowerCase().split(/\s+/).includes("canonical")) {
      return attrValue(link, "href");
    }
  }
  return "";
}

function parseJsonLd(html: string) {
  const scripts = html.match(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  ) ?? [];

  let invalid = 0;
  let hasFaqPage = false;
  for (const script of scripts) {
    const body = script
      .replace(/^<script\b[^>]*>/i, "")
      .replace(/<\/script>$/i, "")
      .trim();
    try {
      const parsed = JSON.parse(body);
      const values = Array.isArray(parsed) ? parsed : [parsed];
      hasFaqPage = values.some((item) => {
        const type = item?.["@type"];
        return type === "FAQPage" || (Array.isArray(type) && type.includes("FAQPage"));
      }) || hasFaqPage;
    } catch {
      invalid += 1;
    }
  }
  return {
    count: scripts.length,
    invalid,
    hasFaqPage
  };
}

function addCheck(checks: Check[], check: Check) {
  checks.push(check);
}

function makePrompt(issue: string, url: string) {
  return `Please fix this SEO preflight issue for ${url}: ${issue}. Check the Next.js metadata, redirects, robots.txt, sitemap.xml, and canonical URL configuration.`;
}

function sameHostname(a: URL, b: URL): boolean {
  return a.hostname.replace(/^www\./, "") === b.hostname.replace(/^www\./, "");
}

function robotsBlocksRoot(robotsText: string): boolean {
  const lines = robotsText
    .split(/\r?\n/)
    .map((line) => line.replace(/#.*/, "").trim())
    .filter(Boolean);

  let applies = false;
  let disallowRoot = false;

  for (const line of lines) {
    const [rawKey, ...rest] = line.split(":");
    const key = rawKey?.trim().toLowerCase();
    const value = rest.join(":").trim().toLowerCase();
    if (key === "user-agent") {
      applies = value === "*" || value === "googlebot";
    }
    if (applies && key === "disallow" && (value === "/" || value === "/*")) {
      disallowRoot = true;
    }
    if (applies && key === "allow" && value === "/") {
      disallowRoot = false;
    }
  }
  return disallowRoot;
}

function sitemapLocs(xml: string): string[] {
  const matches = xml.match(/<loc>\s*([\s\S]*?)\s*<\/loc>/gi) ?? [];
  return matches
    .map((match) => stripTags(match.replace(/<\/?loc>/gi, "")))
    .filter(Boolean)
    .slice(0, SITEMAP_SAMPLE_LIMIT);
}

async function fetchText(url: URL) {
  const response = await fetchWithTimeout(url, { redirect: "follow" });
  const text = (await response.text()).slice(0, MAX_BODY_CHARS);
  return { response, text };
}

async function sampleSitemapUrls(urls: string[]) {
  const sampled: SampledUrl[] = [];
  for (const url of urls) {
    try {
      const target = normalizeUrl(url);
      assertPublicUrl(target);
      const response = await fetchWithTimeout(target, {
        method: "GET",
        redirect: "follow"
      });
      sampled.push({
        url: target.toString(),
        status: response.status,
        ok: response.ok
      });
    } catch {
      sampled.push({ url, ok: false });
    }
  }
  return sampled;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: string };
    const inputUrl = normalizeUrl(body.url ?? "");
    assertPublicUrl(inputUrl);

    const checks: Check[] = [];
    const { finalUrl, response, html, redirectChain } = await fetchHtmlWithRedirects(inputUrl);
    const finalUrlString = finalUrl.toString();
    const xRobots = response.headers.get("x-robots-tag") ?? "";

    if (response.status === 200) {
      addCheck(checks, {
        id: "status",
        category: "Indexing",
        title: "Homepage returns 200",
        severity: "passed",
        message: "Google can request the homepage successfully.",
        detail: `Final status: ${response.status}`
      });
    } else {
      addCheck(checks, {
        id: "status",
        category: "Indexing",
        title: "Homepage does not return 200",
        severity: "critical",
        message: "Google may not index a homepage that redirects too far, errors, or returns an unexpected status.",
        detail: `Final status: ${response.status}`,
        fixPrompt: makePrompt("The homepage final HTTP status is not 200", finalUrlString)
      });
    }

    if (redirectChain.length > 2) {
      addCheck(checks, {
        id: "redirect-chain",
        category: "Redirects",
        title: "Redirect chain is longer than needed",
        severity: "warning",
        message: "A long redirect chain wastes crawl budget and makes canonical signals less clear.",
        detail: redirectChain.join(" -> "),
        fixPrompt: makePrompt("Reduce the redirect chain to a single canonical destination", finalUrlString)
      });
    } else {
      addCheck(checks, {
        id: "redirect-chain",
        category: "Redirects",
        title: "Redirect chain is short",
        severity: "passed",
        message: "The URL reaches its final page without excessive redirects.",
        detail: redirectChain.join(" -> ")
      });
    }

    const title = extractTitle(html);
    const description = findMeta(html, "name", "description");
    const h1 = extractH1(html);
    const robotsMeta = findMeta(html, "name", "robots");
    const canonicalRaw = findCanonical(html);
    const ogTitle = findMeta(html, "property", "og:title");
    const ogDescription = findMeta(html, "property", "og:description");
    const ogImage = findMeta(html, "property", "og:image");
    const jsonLd = parseJsonLd(html);

    const noindex = `${robotsMeta} ${xRobots}`.toLowerCase().includes("noindex");
    if (noindex) {
      addCheck(checks, {
        id: "noindex",
        category: "Indexing",
        title: "Noindex is present",
        severity: "critical",
        message: "A noindex directive tells search engines not to index this page.",
        detail: `meta robots: ${robotsMeta || "none"}; X-Robots-Tag: ${xRobots || "none"}`,
        fixPrompt: makePrompt("Remove noindex from meta robots or X-Robots-Tag", finalUrlString)
      });
    } else {
      addCheck(checks, {
        id: "noindex",
        category: "Indexing",
        title: "No noindex directive found",
        severity: "passed",
        message: "The homepage does not explicitly block indexing."
      });
    }

    if (!canonicalRaw) {
      addCheck(checks, {
        id: "canonical",
        category: "Canonical",
        title: "Canonical URL is missing",
        severity: "warning",
        message: "A canonical URL helps Google understand which URL is the preferred version.",
        fixPrompt: makePrompt("Add a canonical URL for the homepage", finalUrlString)
      });
    } else {
      const canonicalUrl = new URL(canonicalRaw, finalUrl);
      const canonicalSeverity = sameHostname(canonicalUrl, finalUrl) ? "passed" : "critical";
      addCheck(checks, {
        id: "canonical",
        category: "Canonical",
        title: canonicalSeverity === "passed" ? "Canonical URL matches this site" : "Canonical points to another host",
        severity: canonicalSeverity,
        message:
          canonicalSeverity === "passed"
            ? "The canonical URL points to the same site."
            : "A canonical URL on another host can tell Google to index a different site instead.",
        detail: canonicalUrl.toString(),
        fixPrompt:
          canonicalSeverity === "critical"
            ? makePrompt("Make the canonical URL point to the current production domain", finalUrlString)
            : undefined
      });
    }

    if (title && title.length >= 20) {
      addCheck(checks, {
        id: "title",
        category: "Metadata",
        title: "Title tag exists",
        severity: "passed",
        message: "The page has a usable title tag.",
        detail: title
      });
    } else {
      addCheck(checks, {
        id: "title",
        category: "Metadata",
        title: "Title tag is missing or too short",
        severity: "warning",
        message: "A weak title makes the page harder to understand in search results.",
        detail: title || "No title found",
        fixPrompt: makePrompt("Improve the homepage title tag", finalUrlString)
      });
    }

    if (description) {
      addCheck(checks, {
        id: "description",
        category: "Metadata",
        title: "Meta description exists",
        severity: "passed",
        message: "The page has a meta description.",
        detail: description
      });
    } else {
      addCheck(checks, {
        id: "description",
        category: "Metadata",
        title: "Meta description is missing",
        severity: "warning",
        message: "A missing description can reduce search result clarity.",
        fixPrompt: makePrompt("Add a clear meta description to the homepage", finalUrlString)
      });
    }

    if (h1) {
      addCheck(checks, {
        id: "h1",
        category: "Content",
        title: "H1 exists",
        severity: "passed",
        message: "The homepage has a main heading.",
        detail: h1
      });
    } else {
      addCheck(checks, {
        id: "h1",
        category: "Content",
        title: "H1 is missing",
        severity: "warning",
        message: "A missing H1 makes the page structure less clear.",
        fixPrompt: makePrompt("Add one clear H1 to the homepage", finalUrlString)
      });
    }

    const origin = new URL(finalUrl.origin);
    const robotsUrl = new URL("/robots.txt", origin);
    const sitemapUrl = new URL("/sitemap.xml", origin);
    let sitemapLocList: string[] = [];
    let sampledUrls: SampledUrl[] = [];

    try {
      const robots = await fetchText(robotsUrl);
      const blocks = robots.response.ok && robotsBlocksRoot(robots.text);
      if (blocks) {
        addCheck(checks, {
          id: "robots",
          category: "Crawling",
          title: "robots.txt blocks Googlebot",
          severity: "critical",
          message: "Googlebot appears to be blocked from crawling the homepage.",
          detail: robotsUrl.toString(),
          fixPrompt: makePrompt("Update robots.txt so Googlebot can crawl the homepage", finalUrlString)
        });
      } else {
        addCheck(checks, {
          id: "robots",
          category: "Crawling",
          title: "robots.txt does not block the homepage",
          severity: "passed",
          message: "No obvious root-level Googlebot block was found.",
          detail: robotsUrl.toString()
        });
      }

      if (!/sitemap\s*:/i.test(robots.text)) {
        addCheck(checks, {
          id: "robots-sitemap",
          category: "Crawling",
          title: "robots.txt does not mention sitemap.xml",
          severity: "warning",
          message: "Adding a Sitemap line helps crawlers discover your sitemap faster.",
          detail: robotsUrl.toString(),
          fixPrompt: makePrompt("Add a Sitemap line to robots.txt", finalUrlString)
        });
      } else {
        addCheck(checks, {
          id: "robots-sitemap",
          category: "Crawling",
          title: "robots.txt includes a sitemap hint",
          severity: "passed",
          message: "Crawlers can discover the sitemap from robots.txt."
        });
      }
    } catch {
      addCheck(checks, {
        id: "robots",
        category: "Crawling",
        title: "robots.txt could not be fetched",
        severity: "warning",
        message: "Missing robots.txt is not always fatal, but it is worth adding for launch clarity.",
        detail: robotsUrl.toString(),
        fixPrompt: makePrompt("Add a readable robots.txt file", finalUrlString)
      });
    }

    try {
      const sitemap = await fetchText(sitemapUrl);
      sitemapLocList = sitemap.response.ok ? sitemapLocs(sitemap.text) : [];
      if (!sitemap.response.ok || sitemapLocList.length === 0) {
        addCheck(checks, {
          id: "sitemap",
          category: "Sitemap",
          title: "sitemap.xml is missing or empty",
          severity: "critical",
          message: "A readable sitemap helps Google discover your public pages.",
          detail: sitemapUrl.toString(),
          fixPrompt: makePrompt("Create a valid sitemap.xml with public canonical URLs", finalUrlString)
        });
      } else {
        addCheck(checks, {
          id: "sitemap",
          category: "Sitemap",
          title: "sitemap.xml is readable",
          severity: "passed",
          message: `Found ${sitemapLocList.length} URL(s) in the first sample.`,
          detail: sitemapUrl.toString()
        });

        const mismatched = sitemapLocList.filter((loc) => {
          try {
            return !sameHostname(new URL(loc), finalUrl);
          } catch {
            return true;
          }
        });
        if (mismatched.length > 0) {
          addCheck(checks, {
            id: "sitemap-domain",
            category: "Sitemap",
            title: "Sitemap contains another host",
            severity: "warning",
            message: "Sitemap URLs should use the same canonical production domain.",
            detail: mismatched.slice(0, 3).join(", "),
            fixPrompt: makePrompt("Make sitemap URLs match the canonical production domain", finalUrlString)
          });
        } else {
          addCheck(checks, {
            id: "sitemap-domain",
            category: "Sitemap",
            title: "Sitemap URLs match this site",
            severity: "passed",
            message: "The sampled sitemap URLs use the same host."
          });
        }
      }
      sampledUrls = await sampleSitemapUrls(sitemapLocList);
    } catch {
      addCheck(checks, {
        id: "sitemap",
        category: "Sitemap",
        title: "sitemap.xml could not be fetched",
        severity: "critical",
        message: "Google Search Console submission is weaker without a readable sitemap.",
        detail: sitemapUrl.toString(),
        fixPrompt: makePrompt("Create and expose sitemap.xml at the production domain", finalUrlString)
      });
    }

    if (ogTitle && ogDescription && ogImage) {
      addCheck(checks, {
        id: "open-graph",
        category: "Social Preview",
        title: "Open Graph basics exist",
        severity: "passed",
        message: "The page has basic social preview metadata."
      });
    } else {
      addCheck(checks, {
        id: "open-graph",
        category: "Social Preview",
        title: "Open Graph metadata is incomplete",
        severity: "warning",
        message: "Missing Open Graph tags can make shared links look weak.",
        detail: `og:title ${ogTitle ? "ok" : "missing"}, og:description ${ogDescription ? "ok" : "missing"}, og:image ${ogImage ? "ok" : "missing"}`,
        fixPrompt: makePrompt("Add basic Open Graph title, description, and image metadata", finalUrlString)
      });
    }

    if (jsonLd.invalid > 0) {
      addCheck(checks, {
        id: "json-ld",
        category: "Structured Data",
        title: "Some JSON-LD is invalid",
        severity: "warning",
        message: "Invalid structured data can create noisy Search Console reports.",
        detail: `${jsonLd.invalid} invalid script(s) found.`,
        fixPrompt: makePrompt("Fix invalid JSON-LD structured data", finalUrlString)
      });
    } else {
      addCheck(checks, {
        id: "json-ld",
        category: "Structured Data",
        title: jsonLd.count > 0 ? "JSON-LD parses cleanly" : "No JSON-LD found",
        severity: "passed",
        message:
          jsonLd.count > 0
            ? "Structured data scripts were parsed successfully."
            : "No structured data found. This is fine for a simple tool page."
      });
    }

    if (jsonLd.hasFaqPage) {
      addCheck(checks, {
        id: "faqpage",
        category: "Structured Data",
        title: "FAQPage schema is present",
        severity: "warning",
        message: "FAQPage schema is not a strong rich-result strategy for most ordinary sites now.",
        fixPrompt: makePrompt("Review whether FAQPage schema is still necessary", finalUrlString)
      });
    }

    const summary = {
      critical: checks.filter((check) => check.severity === "critical").length,
      warning: checks.filter((check) => check.severity === "warning").length,
      passed: checks.filter((check) => check.severity === "passed").length
    };

    return NextResponse.json({
      inputUrl: inputUrl.toString(),
      finalUrl: finalUrlString,
      redirectChain,
      summary,
      checks,
      sampledUrls
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to check this URL."
      },
      { status: 400 }
    );
  }
}
