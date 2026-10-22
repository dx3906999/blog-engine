import { html, type LayoutFn } from '../../../src/theme/api.ts'
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
