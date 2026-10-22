import { html, type LayoutFn } from '../../../src/theme/api.ts'
import { baseLayout } from './base.ts'
import { pageHeader, pagination, postList } from './components.ts'

export const tag: LayoutFn = (ctx) => {
  return baseLayout(
    ctx,
    html`${pageHeader(ctx, { count: ctx.tag?.count ?? 0 })}
    ${postList(ctx, ctx.posts ?? [])}
    ${pagination(ctx)}`,
  )
}
