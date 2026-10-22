# 内容目录

- `zh/posts/`：中文文章，每篇一个目录，入口是 `index.md`
- `zh/pages/`：中文页面，例如 `about.md`
- `en/posts/`：英文文章，目录名和 `translationKey` 与中文对应
- `en/pages/`：英文页面

## 示例内容

以下目录是示例，可以整体删除：

```
zh/posts/how-this-site-works/
zh/posts/typography-notes/
en/posts/how-this-site-works/
en/posts/typography-notes/
```

删除后保留或改写 `zh/pages/about.md` 和 `en/pages/about.md`，再运行：

```bash
npm run build:all
```

## 文章结构

```
zh/posts/my-post/
  index.md
  cover.jpg
```

图片和文章放在同一目录，Markdown 里用相对路径：

```markdown
![封面](./cover.jpg)
```

frontmatter 的字段和规则见 [../docs/authoring.md](../docs/authoring.md)。
