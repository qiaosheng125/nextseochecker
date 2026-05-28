# Vercel SEO Preflight 实践复盘

## 基本信息

- 编号：002
- 项目名：Vercel SEO Preflight
- 核心关键词：`Next.js SEO checker`（Next.js SEO 检查器）
- 域名：`nextseochecker.com`
- GitHub：`https://github.com/qiaosheng125/nextseochecker`
- 上线日期：2026-05-29
- 当前状态：Vercel 已部署；正式域名和 HTTPS 已配置；GSC 和 Bing 已接入并提交 sitemap；GA4 和 Clarity 已检测到数据；本站自检 13 项通过；GSC 提示软 404，已补强首页静态内容，待重新测试

## 开工前判断

- 为什么选这个词：待填
- Top 10 竞品结论：待填
- 用户最核心需求：待填
- 我们的 MVP：待填
- 暂时不做的功能：待填

## 上线数据

| 时间点 | GSC收录 | 曝光 | 点击 | GA访问 | Clarity观察 | 结论 |
|---|---:|---:|---:|---:|---|---|
| 7天 | - | - | - | - | - | - |
| 14天 | - | - | - | - | - | - |
| 30天 | - | - | - | - | - | - |

## 做对了什么

- 第二站开始时及时纠正 SOP：项目确定后优先买域名并接入 Cloudflare，避免 DNS 传播和注册局审核卡住上线。
- 在部署前把 canonical、robots.txt、sitemap.xml 的正式域名改为 `https://www.nextseochecker.com`，避免 SEO 信号指向临时 Vercel 域名。
- 工具增加“一键复制所有问题给 AI”的提示词按钮，让检查结果能直接变成 Codex / Claude / Gemini 的修复任务。
- 上线后立即用本站检查本站，13 项通过，说明 canonical、robots.txt、sitemap.xml、Open Graph、基础 metadata 等上线前信号正常。

## 做错了什么

- 第二站首版首页过于偏工具壳，静态内容偏薄。虽然 HTTP 200、robots、sitemap、canonical 都正常，但 GSC 仍提示软 404。修正方式：保留首屏工具，同时在首屏下方补充真实有用的 Vercel/Next.js 收录问题解释、常见原因和上线检查内容。

## 下次复用

- 待填

## 知识库回流

- 已更新 `项目长期规则.md`：项目从候选进入准备开工后，必须优先查域名、买域名并接入 Cloudflare。
- 已更新 `痛点挖掘SOP.md`：准备开工阶段新增域名动作。
- 第二站验证 GSC 时，确认可以优先使用 Cloudflare 自动授权，减少手动 TXT 记录配置错误。
- 第二站接入 Bing Webmaster 时，确认可以优先从 GSC 导入，减少重复验证和重复提交 sitemap。
- 第二站 GA4 接入时，不只添加页面浏览代码，还增加了工具关键事件：运行检查、检查成功、检查失败、复制单条修复提示词、复制全部 AI 修复提示词。
