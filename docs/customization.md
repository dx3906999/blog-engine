# 配置与复用

这个仓库按“引擎 + 站点实例”组织。引擎代码和主题不包含作者名、GitHub 用户名、仓库名或域名；这些都在 `site.config.ts`。

## 作为模板使用

1. 在 GitHub 上点击 **Use this template**，创建自己的仓库。
2. 克隆后运行：

```bash
npm ci
npm run setup
npm run dev
```

3. 替换 `content/` 下的示例内容。
4. 在 `site.config.ts` 选择主题，或运行 `npm run setup` 重写配置。
5. 把 `templates/deploy.yml` 复制到博客仓库的 `.github/workflows/deploy.yml`。
6. 推送 `main`，在仓库 Settings → Pages 选择 **GitHub Actions**。

`site.config.ts` 是提交进仓库的。`npm run setup` 覆盖前会生成 `site.config.ts.bak`。

## 非交互配置

```bash
npm run setup -- --yes --force \
  --name "Your Name" \
  --email "you@example.com" \
  --github "https://github.com/you" \
  --title-zh "你的博客" \
  --description-zh "一句话说明" \
  --tagline-zh "更短的副标题" \
  --title-en "Your Blog" \
  --description-en "One sentence" \
  --tagline-en "A shorter subtitle" \
  --url "https://example.com" \
  --theme folio \
  --repo-owner you \
  --repo-name your-blog
```

可选 `--domain blog.example.com`。不传 `--force` 时不会覆盖已有 `site.config.ts`。

## 配置字段

| 字段 | 说明 |
| --- | --- |
| `identity.author` | 作者姓名、邮箱、主页、头像 |
| `identity.social` | 页脚/主题可用的社交链接 |
| `identity.repository` | 可选的 GitHub owner/name，用于页脚源码链接 |
| `locales.default` | 默认语言，必须存在于 `locales.entries` |
| `locales.entries.<lang>` | 该语言的 label、title、description、tagline |
| `site.url` | 生产 origin；CI 由 `SITE_URL` 覆盖 |
| `site.base` | 站点根路径；CI 由 `SITE_BASE` 覆盖 |
| `site.customDomain` | 自定义域名；设置后生成 `dist/CNAME` |
| `site.timezone` | 日期展示时区，默认 `Asia/Shanghai` |
| `site.license` | 页脚展示的代码/内容许可证 |
| `theme.name` | `folio` / `orbital` / `scholar` |
| `theme.config` | 主题自己的配置 |
| `nav` | 导航项，path 与语言无关 |
| `pagination.perPage` | 每页文章数 |
| `features.search` | 是否生成搜索页和索引 |
| `features.math` | 是否启用 KaTeX |
| `markdown.allowHtml` | 是否允许原始 HTML（默认 false，开启时 sanitize） |

主题配置由主题的 zod schema 校验。比如：

```ts
theme: {
  name: 'orbital',
  config: { accent: '#d99a4e', scanlines: true },
}
```

## 增加语言

1. 在 `site.config.ts` 的 `locales.entries` 增加语言代码和文案。
2. 创建 `content/<lang>/posts/` 和 `content/<lang>/pages/`。
3. 在每套主题的 `i18n/<lang>.yml` 补齐文案（主题一致性测试会检查）。
4. 保持 `translationKey` 一致，构建会自动生成 alternates、hreflang 和语言切换器。

默认语言保持在 `site.root`，其他语言自动加 `/<lang>/` 前缀。不要创建 `content/zh/` 之外的默认语言副本。

## 站点路径

- 用户页/组织页 `https://user.github.io`：`site.base: '/'`
- 项目页 `https://user.github.io/repo`：CI 自动注入 `SITE_BASE=/repo`；本地模拟用 `npm run dev -- --base=/repo/`。Windows Git Bash 需要加 `MSYS_NO_PATHCONV=1`，否则 `/repo/` 会被转换成 Windows 路径。
- 自定义域名：`site.base: '/'`，`site.url` 是域名 origin

所有内部链接都经过 helper。主题里不要写死 `/assets/...` 或 `/posts/...`。

## 换主题

修改 `site.config.ts`：

```ts
theme: { name: 'scholar', config: {} }
```

或者临时预览：

```bash
npm run dev -- --theme=scholar
```

主题名必须在 `themes/` 下存在。新增主题见 [theming.md](theming.md)。

## 删除示例内容

示例文章在：

```
content/zh/posts/how-this-site-works/
content/zh/posts/typography-notes/
content/en/posts/how-this-site-works/
content/en/posts/typography-notes/
```

删除这些目录后，保留或改写 `content/zh/pages/about.md` 和 `content/en/pages/about.md`，再运行 `npm run build:all`。

## 仓库改名

项目页的 URL 会随仓库名变化。长期发布建议先绑定自定义域名，或在改名后保留旧路径的静态重定向页。GitHub Pages 没有服务端重定向。
