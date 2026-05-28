# 实现计划

## 技术栈

- Next.js
- Vercel
- TypeScript
- 不接数据库
- 不登录

## 页面

- `/`：核心工具页
- `/robots.txt`
- `/sitemap.xml`

## API

`POST /api/check`

输入：

```json
{
  "url": "https://www.example.com"
}
```

输出：

```json
{
  "normalizedUrl": "https://www.example.com",
  "summary": {
    "critical": 0,
    "warning": 3,
    "passed": 12
  },
  "checks": []
}
```

## 核心模块

- URL 校验和规范化
- 安全 fetch
- HTML 解析
- robots.txt 解析
- sitemap.xml 解析
- redirect chain 检查
- canonical 检查
- noindex 检查
- metadata 检查
- Open Graph 基础检查
- JSON-LD 基础检查

## 第一版顺序

1. 页面和 URL 输入。
2. API 安全 fetch。
3. 首页 HTML 检查。
4. robots.txt 检查。
5. sitemap.xml 检查。
6. 结果分组。
7. Codex prompt 复制。
8. 移动端检查。

## 暂不实现

- 多 URL 批量检查。
- 登录保存历史。
- GSC API。
- AI 自动修复。
- 持续监控。
