import { html, type LayoutFn } from 'blog-engine/theme'
import { baseLayout } from './base.ts'
import { pagination, postList } from './components.ts'

export const index: LayoutFn = (ctx) => {
  const current = ctx.pagination?.current ?? 1
  return baseLayout(
    ctx,
    html`<section class="orbital-intro">
      <p class="kicker">${ctx.i18n.t('page.indexLabel')}</p>
      <h1>${ctx.site.title}</h1>
      <p class="orbital-intro-text">${ctx.site.tagline || ctx.site.description}</p>
      ${current > 1 ? html`<p class="kicker">${ctx.i18n.t('page.pageOf', { n: current })}</p>` : ''}
    </section>
    ${postList(ctx, ctx.posts ?? [])}
    ${pagination(ctx)}`,
  )
}
