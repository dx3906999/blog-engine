# 0001 主题 API 使用 TypeScript 函数

## 状态

已采纳。

## 背景

主题需要可替换，并且要能复用同一套路由、数据和 SEO。可选方案是自己实现模板语言（EJS/Liquid），或者用 TypeScript 函数。

## 决策

主题是 TypeScript 模块，布局是 `(ctx) => SafeHtml` 函数。核心提供自动转义的 `html`、`raw`、URL/日期/i18n/资源 helper。`theme.json` 声明 `apiVersion`。

## 后果

- 不实现模板语言，少一个运行时和一类解析错误。
- 主题有类型检查和真实测试，布局可以复用普通 import。
- 写主题需要懂 TypeScript；不接受 EJS 主题。
- 主题是本地可信代码，不提供远程安装沙箱。
