import { html, type LayoutFn } from 'blog-engine/theme'
import { baseLayout } from './base.ts'
import { archiveList, pageHeader, postList } from './components.ts'

export const archive: LayoutFn = (ctx) => {
  const isYear = ctx.posts !== undefined && ctx.posts.length > 0
  return baseLayout(
    ctx,
    html`${pageHeader(ctx)}
    ${isYear ? postList(ctx, ctx.posts ?? []) : archiveList(ctx)}`,
  )
}
