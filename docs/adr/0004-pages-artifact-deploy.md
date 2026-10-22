# 0004 使用 Pages artifact 部署

## 状态

已采纳。

## 背景

GitHub Pages 可以从分支发布，也可以用 Actions artifact 发布。分支发布容易产生构建产物提交和缓存问题。

## 决策

`deploy.yml` 在 Actions 中构建 `dist/`，用 `upload-pages-artifact` 和 `deploy-pages` 发布。`dist/` 不提交。部署只从 `main` 或手动触发，工作流拥有 `pages: write` 和 `id-token: write`。

## 后果

- 构建产物不进入 git，回滚用 Actions 历史或旧 commit。
- 需要仓库 Pages Source 设置为 GitHub Actions。
- `configure-pages` 自动提供 `origin` 和 `base_path`，项目页不需要手写仓库名。
- 部署后必须跑 smoke test，防止 base 或索引错误上线。
