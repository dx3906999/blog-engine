import { html, type LayoutFn } from 'blog-engine/theme'
import { baseLayout } from './base.ts'
import { pageHeader, tagCloud } from './components.ts'

export const tags: LayoutFn = (ctx) => {
  return baseLayout(ctx, html`${pageHeader(ctx)} ${tagCloud(ctx)}`)
}
