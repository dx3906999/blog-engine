import { html, type LayoutFn } from '../../../src/theme/api.ts'
import { baseLayout } from './base.ts'

export const notFound: LayoutFn = (ctx) => {
  return baseLayout(
    ctx,
    html`<section class="scholar-404">
      <p class="scholar-kicker">404</p>
      <h1>${ctx.page.title}</h1>
      <p>${ctx.i18n.t('page.notFoundBody')}</p>
      <p><a href="${ctx.helpers.url(ctx.i18n.lang === ctx.site.defaultLang ? '/' : `/${ctx.i18n.lang}/`)}">${ctx.i18n.t('post.backHome')}</a></p>
    </section>`,
  )
}
