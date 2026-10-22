import { html, type LayoutFn } from 'blog-engine/theme'
import { getOrbitalConfig } from '../config.ts'
import { baseLayout } from './base.ts'

export const page: LayoutFn = (ctx) => {
  const page = ctx.pageItem
  if (!page) return baseLayout(ctx, html`<p>${ctx.seo.description}</p>`)
  const config = getOrbitalConfig(ctx)
  const hasToc = config.showToc && ctx.tocHtml.value.length > 0
  return baseLayout(
    ctx,
    html`<article
      class="orbital-post orbital-page"
      data-pagefind-body
      data-pagefind-filter="lang:${ctx.i18n.lang}"
      data-pagefind-meta="title:${page.title}">
      <header class="orbital-post-header">
        <p class="kicker">${ctx.i18n.t('page.pageLabel')}</p>
        <h1>${page.title}</h1>
      </header>
      ${
        hasToc
          ? html`<section class="orbital-toc">
            <p class="kicker">${ctx.i18n.t('toc.title')}</p>
            ${ctx.tocHtml}
          </section>`
          : ''
      }
      <div class="orbital-body">
        ${page.html}
      </div>
    </article>`,
  )
}
