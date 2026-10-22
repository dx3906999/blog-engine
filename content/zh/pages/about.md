---
title: 关于
slug: about
translationKey: about
description: 关于这个博客和它的构建方式。
---

这里记录工程、排版和长期维护的笔记。文章尽量写具体的问题和可复用的做法，不写泛泛的经验总结。

站点由仓库里的静态生成器构建，内容用 Markdown 写，部署在 GitHub Pages。主题、语言、域名和作者信息都在 `site.config.ts` 里配置。

如果你想复用这套系统，可以从 GitHub Template 创建自己的仓库，运行 `npm run setup`，然后替换 `content/`。
