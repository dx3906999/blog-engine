import { html, type LayoutFn } from 'blog-engine/theme'
import { baseLayout } from './base.ts'
import { articleList, pageHeader, pagination } from './components.ts'

export const tag: LayoutFn = (ctx) => {
  return baseLayout(
    ctx,
    html`${pageHeader(ctx, { count: ctx.tag?.count ?? 0 })}
    ${articleList(ctx, ctx.posts ?? [])}
    ${pagination(ctx)}`,
  )
}
