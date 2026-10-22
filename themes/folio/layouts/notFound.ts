import { html, type LayoutFn } from '../../../src/theme/api.ts'
import { baseLayout } from './base.ts'

export const notFound: LayoutFn = (ctx) => {
  return baseLayout(
    ctx,
    html`<header class="page-header">
      <p class="eyebrow">404</p>
      <h1>${ctx.page.title}</h1>
      <p>${ctx.i18n.t('page.notFoundBody')}</p>
      <p><a class="text-link" href="${ctx.helpers.url(ctx.i18n.lang === ctx.site.defaultLang ? '/' : `/${ctx.i18n.lang}/`)}">${ctx.i18n.t('post.backHome')}</a></p>
    </header>`,
  )
}
