# Vercel SEO Preflight 需求文档

## 项目信息

- 编号：002
- 项目名：Vercel SEO Preflight
- 核心关键词：`Next.js SEO checker`（Next.js SEO 检查器）
- 机会关键词：`Vercel SEO audit`（Vercel SEO 审计）、`Next.js indexing checker`（Next.js 收录检查器）
- 域名：待定
- 类型：工具站 / 练选题
- 当前阶段：需求定义

## 一句话目标

做一个给 Next.js / Vercel 新站使用的上线前 SEO 检查器，在提交 Google Search Console（谷歌搜索控制台）前发现会影响收录的低级技术错误。

## 用户

- 用 Next.js + Vercel 建站的新手。
- AI 编程用户。
- 独立开发者。
- 小 SaaS 创始人。
- 刚接 Cloudflare、刚提交 sitemap 的站长。

不是目标用户：

- 专业 SEO 团队。
- 大型网站。
- 需要关键词、外链、竞品分析的人。

## 核心场景

用户刚部署一个站，准备提交给 Google，但不确定：

- 是否有 `noindex`（禁止索引）。
- canonical（规范链接）是否错。
- sitemap.xml（站点地图）是否可读。
- robots.txt（机器人协议文件）是否挡住 Googlebot。
- www / non-www、http / https 是否统一。
- title / description / H1 是否缺失。

## MVP 范围

第一版只检查首页 + sitemap 前 10 个 URL。

检查项：

- HTTP status（HTTP 状态码）
- redirect chain（跳转链）
- canonical（规范链接）
- meta robots / `X-Robots-Tag`
- title / description / H1
- robots.txt
- sitemap.xml
- sitemap URL 与 canonical 域名一致性
- Open Graph 基础标签
- JSON-LD 基础解析和 FAQPage 过时提醒

## 不做

- 不做完整 SEO audit（SEO 审计）。
- 不做关键词研究。
- 不做外链分析。
- 不做性能分数。
- 不做登录。
- 不接 GSC API。
- 不做持续监控。
- 不承诺 Google 一定收录。

## 结果设计

结果分三类：

- Critical（严重）：提交 Google 前必须修。
- Warning（警告）：建议修。
- Passed（通过）：基础检查正常。

每条结果必须包含：

- 问题是什么。
- 为什么影响收录。
- 新手应该去哪里改。
- 可复制给 Codex 的修复提示。

## 首屏

首屏直接放工具：

- H1：`Check if your Vercel site is ready for Google`
- 输入框：Website URL
- 按钮：Run check
- 说明：`No signup. Checks public pages only. Built for Next.js and Vercel sites.`

## 验收标准

- 能检查 `https://www.playspeedcalc.net`。
- 能输出 Critical / Warning / Passed。
- sitemap 最多抽样 10 个 URL。
- 移动端不溢出。
- 没有登录、数据库、用户上传敏感信息。
- 结果能复制为 Codex prompt（Codex 修复提示）。
