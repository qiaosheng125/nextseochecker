# 检查规则

## Critical（严重）

- 首页最终状态码不是 200。
- 页面包含 `noindex`。
- `X-Robots-Tag` 包含 `noindex`。
- robots.txt 阻止 Googlebot 抓取 `/`。
- canonical 指向不同域名。
- sitemap.xml 不可访问或无法解析。

## Warning（警告）

- 存在多跳 redirect chain（跳转链）。
- http / https / www / non-www 最终 URL 不统一。
- canonical 缺失。
- title 缺失或过短。
- meta description 缺失。
- H1 缺失。
- robots.txt 缺少 sitemap 链接。
- sitemap URL 与 canonical 域名不一致。
- Open Graph 图片缺失。
- JSON-LD 无法解析。
- FAQPage schema 存在，但提醒 Google FAQ rich results 已不适合作为普通站策略。

## Passed（通过）

- 首页 200。
- 无 noindex。
- canonical 与最终 URL 一致。
- robots.txt 不阻止 Googlebot。
- sitemap 可读。
- title / description / H1 存在。

## 安全边界

- 禁止请求 localhost、127.0.0.1、10.0.0.0/8、172.16.0.0/12、192.168.0.0/16 等私有地址。
- 请求超时。
- 限制响应体大小。
- sitemap 只抽样前 10 个 URL。
