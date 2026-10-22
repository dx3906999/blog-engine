import { html, type LayoutFn } from 'blog-engine/theme'
import { baseLayout } from './base.ts'
import { pageHeader } from './components.ts'

export const search: LayoutFn = (ctx) => {
  return baseLayout(
    ctx,
    html`${pageHeader(ctx)}
    <div
      class="orbital-search"
      data-search
      data-index="${ctx.assets.searchIndex ?? ''}"
      data-lang="${ctx.i18n.lang}"
      data-loading="${ctx.i18n.t('search.loading')}"
      data-empty="${ctx.i18n.t('search.empty')}"
      data-error="${ctx.i18n.t('search.error')}"
      data-results="${ctx.i18n.t('search.results')}">
      <label class="kicker" for="search-input">${ctx.i18n.t('search.query')}</label>
      <div class="terminal-input">
        <span aria-hidden="true">&gt;</span>
        <input
          id="search-input"
          type="search"
          name="q"
          autocomplete="off"
          spellcheck="false"
          placeholder="${ctx.i18n.t('search.placeholder')}"
          data-search-input>
      </div>
      <p class="search-status" data-search-status aria-live="polite"></p>
      <ol class="search-results" data-search-results></ol>
    </div>
    <noscript><p>${ctx.i18n.t('search.noscript')}</p></noscript>
    ${
      ctx.assets.searchJs ? html`<script type="module" src="${ctx.assets.searchJs}"></script>` : ''
    }`,
  )
}
