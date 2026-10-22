import { html, type LayoutFn } from '../../../src/theme/api.ts'
import { baseLayout } from './base.ts'
import { pageHeader, tagCloud } from './components.ts'

export const tags: LayoutFn = (ctx) => {
  return baseLayout(ctx, html`${pageHeader(ctx)} ${tagCloud(ctx)}`)
}
