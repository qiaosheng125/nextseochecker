# Vercel SEO Preflight SEO 文档

## 核心关键词

- `Next.js SEO checker`（Next.js SEO 检查器）

## 候选关键词

- `Vercel SEO audit`（Vercel SEO 审计）
- `Next.js indexing checker`（Next.js 收录检查器）
- `Next.js sitemap checker`（Next.js 站点地图检查器）
- `Next.js noindex checker`（Next.js noindex 检查器）
- `Google Search Console sitemap could not be read`（GSC 站点地图无法读取）
- `Vercel custom domain SEO`（Vercel 自定义域名 SEO）

## 搜索意图

用户不是想学习完整 SEO，而是遇到“新站能访问但 Google 不收录 / sitemap 报错 / noindex / canonical 混乱”这类技术问题。

首页必须承诺：

- 输入 URL。
- 快速检查。
- 告诉用户是否有影响收录的硬错误。

## Title

`Next.js SEO Checker for Vercel Sites`

## Description

`Check if your Next.js or Vercel site is ready for Google. Test canonical URLs, redirects, robots.txt, sitemap.xml, noindex tags, and basic metadata before submitting to Search Console.`

## H1

`Check if your Vercel site is ready for Google`

## 页面正文必须覆盖

- What this tool checks（这个工具检查什么）
- Why Vercel and Next.js sites fail indexing（为什么 Vercel/Next.js 站点会收录失败）
- Sitemap and robots basics（站点地图和 robots 基础）
- Canonical and redirects（规范链接和跳转）
- FAQ（常见问题）

## FAQ 草稿

### Does this guarantee Google indexing?

No. It only checks technical issues that may block indexing. Google may still decide not to index a page because of quality, duplication, or crawl priority.

### Is this only for Vercel?

It is built for Vercel and Next.js sites, but many checks also work for other public websites.

### Do I need Google Search Console access?

No. This tool checks public URLs only. It does not connect to your Search Console account.

### Why does my sitemap work in the browser but fail in GSC?

Google Search Console can lag or report temporary fetch issues. This tool checks whether your sitemap is publicly reachable and parseable, but it cannot read private GSC data.

## 竞品差异

不和 Aiso、SEOtest、FennecSEO 比“大而全”。

差异：

- 更适合新手。
- 聚焦上线前。
- 聚焦 Vercel / Next.js / Cloudflare / GSC 常见坑。
- 给 Codex prompt，让用户能直接修代码。
