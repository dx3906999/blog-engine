import { html, type LayoutFn } from 'blog-engine/theme'
import { baseLayout } from './base.ts'
import { archiveList, articleList, pageHeader } from './components.ts'

export const archive: LayoutFn = (ctx) => {
  const isYear = ctx.posts !== undefined && ctx.posts.length > 0
  return baseLayout(
    ctx,
    html`${pageHeader(ctx)}
    ${isYear ? articleList(ctx, ctx.posts ?? [], { abstract: false }) : archiveList(ctx)}`,
  )
}
