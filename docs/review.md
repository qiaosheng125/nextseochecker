# Vercel SEO Preflight 实践复盘

## 基本信息

- 编号：002
- 项目名：Vercel SEO Preflight
- 核心关键词：`Next.js SEO checker`（Next.js SEO 检查器）
- 域名：`nextseochecker.com`
- GitHub：`https://github.com/qiaosheng125/nextseochecker`
- 上线日期：2026-05-29
- 当前状态：已请求首页编入索引；进入 7 天观察期

## 开工前判断

- 为什么选这个词：待填
- Top 10 竞品结论：待填
- 用户最核心需求：待填
- 我们的 MVP：待填
- 暂时不做的功能：待填

## 上线数据

| 时间点 | GSC收录 | 曝光 | 点击 | GA访问 | Clarity观察 | 结论 |
|---|---:|---:|---:|---:|---|---|
| 上线当天 | 已请求首页编入索引 | - | - | 已检测到实时数据 | 已检测到 | 先不频繁改首页，进入观察期 |
| 7天 | - | - | - | - | - | - |
| 14天 | - | - | - | - | - | - |
| 30天 | - | - | - | - | - | - |

## 做对了什么

- 第二站开始时及时纠正 SOP：项目确定后优先买域名并接入 Cloudflare，避免 DNS 传播和注册局审核卡住上线。
- 在部署前把 canonical、robots.txt、sitemap.xml 的正式域名改为 `https://www.nextseochecker.com`，避免 SEO 信号指向临时 Vercel 域名。
- 工具增加“一键复制所有问题给 AI”的提示词按钮，让检查结果能直接变成 Codex / Claude / Gemini 的修复任务。
- 上线后立即用本站检查本站，13 项通过，说明 canonical、robots.txt、sitemap.xml、Open Graph、基础 metadata 等上线前信号正常。

## 做错了什么

- 第二站首版首页过于偏工具壳，静态内容偏薄。虽然 HTTP 200、robots、sitemap、canonical 都正常，但 GSC 仍提示软 404。修正方式：保留首屏工具，同时在首屏下方补充真实有用的 Vercel/Next.js 收录问题解释、常见原因、FAQ 和上线检查内容，并补齐 About、Contact、Privacy 页面和 sitemap 条目。

## 下次复用

- 项目从“准备开工”开始，第一时间列域名、买域名、接 Cloudflare，不再等代码写完。
- Vercel 绑定 Cloudflare 域名时，优先使用 `Auto configure`（自动配置）并授权，除非该域名已有复杂 DNS 或邮箱配置。
- GSC（谷歌搜索控制台）优先使用 Cloudflare 自动授权；Bing Webmaster（必应站长工具）优先从 GSC 导入。
- GA4（谷歌分析 4）不只接页面浏览，还要默认接核心事件：主按钮点击、成功、失败、复制结果/复制 AI 提示词。
- 新工具站首页不能只有工具表单。首屏可以是工具，但首屏下方必须有可索引正文：目标用户、使用场景、解决的问题、常见错误、FAQ。
- 每个新站默认补齐 About、Contact、Privacy，并加入 footer 和 sitemap。不要等 GSC 报软 404 后再补。
- 上线后先用本站或脚本做自检，再提交 GSC；如果 GSC 提示软 404，优先判断内容价值和页面可信度，不要只盯技术标签。
- 新站进入 7 天观察期后，不要频繁大改首页。只修明显 bug、不可访问、错误埋点和严重 SEO 问题。

## 流程优化结论

### 需要前置的动作

- 域名购买和 Cloudflare 接入必须前置到“项目准备开工”阶段。
- 首页可信内容、About、Contact、Privacy、FAQ、footer 链接必须在首次上线前完成。
- sitemap 首版就要包含所有公开基础页面，而不是只放首页。
- GA4 和 Clarity 应该作为默认站点模板的一部分，不要每次临时复制代码。

### 可以自动化的动作

- 生成新站基础文件：`layout.tsx`、`robots.ts`、`sitemap.ts`、`analytics.tsx`。
- 生成 About、Contact、Privacy、FAQ 初稿。
- 根据项目名和域名自动生成上线清单、复盘文档、GSC/Bing/GA/Clarity 接入清单。
- 自动检查线上站点：HTTP 200、canonical、robots、sitemap、OG 图、基础页面是否存在。
- 自动生成 GA4 事件埋点清单：主动作、成功、失败、复制、下载、分享。

### 必须人工判断的动作

- 域名是否值得买。
- 首页英文表达是否可信、自然、不像模板站。
- Contact 方式是否真实可达，不能写还没配置的假邮箱。
- GSC 软 404 是内容薄、页面像错误页，还是技术配置错误。
- 是否进入 7 天观察期，还是必须继续修。

### 第三站要直接采用的新默认

1. 项目确定后先买域名并接 Cloudflare。
2. 首版代码必须带 About、Contact、Privacy、FAQ、footer、sitemap 多页面。
3. 首版上线前必须用自己的 SEO 检查器检查自己。
4. GA4 默认带关键事件，Clarity 默认接入。
5. GSC 用 Cloudflare 自动授权，Bing 从 GSC 导入。
6. 请求索引后进入 7 天观察期，不频繁改首页。

## 知识库回流

- 已更新 `项目长期规则.md`：项目从候选进入准备开工后，必须优先查域名、买域名并接入 Cloudflare。
- 已更新 `痛点挖掘SOP.md`：准备开工阶段新增域名动作。
- 第二站验证 GSC 时，确认可以优先使用 Cloudflare 自动授权，减少手动 TXT 记录配置错误。
- 第二站接入 Bing Webmaster 时，确认可以优先从 GSC 导入，减少重复验证和重复提交 sitemap。
- 第二站 GA4 接入时，不只添加页面浏览代码，还增加了工具关键事件：运行检查、检查成功、检查失败、复制单条修复提示词、复制全部 AI 修复提示词。
