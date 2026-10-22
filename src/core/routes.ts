import { isoDate } from '../shared/date.ts'
import {
  archivePath,
  homePath,
  paginationPath,
  searchPath,
  stripBase,
  tagPaginationPath,
  tagsPath,
} from '../shared/url.ts'
import type { LoadedConfig } from './config.ts'
import type {
  Alternate,
  ArchiveGroup,
  ContentSet,
  PageItem,
  PageKind,
  Pagination,
  Post,
  TagView,
  TocEntry,
} from './types.ts'

export interface RenderTask {
  kind: PageKind
  lang: string
  urlPath: string
  outFile: string
  title?: string
  titleKey?: string
  titleParams?: Record<string, string | number>
  description?: string
  descriptionKey?: string
  posts?: Post[]
  post?: Post
  pageItem?: PageItem
  tag?: TagView
  tags?: TagView[]
  archives?: ArchiveGroup[]
  pagination?: Pagination
  toc?: TocEntry[]
  alternates: Alternate[]
  lastmod?: string
  noindex?: boolean
}

export function outFileForUrl(urlPath: string, base: string): string {
  const relative = stripBase(urlPath, base).replace(/^\/+/, '')
  let decoded = relative
  try {
    decoded = decodeURIComponent(relative)
  } catch {
    // Keep the original path if it is not valid percent-encoding.
  }
  if (!decoded) return 'index.html'
  if (urlPath.endsWith('/')) return `${decoded}index.html`
  return decoded
}

function sectionAlternates(
  languages: string[],
  loaded: LoadedConfig,
  urlFor: (lang: string) => string,
  titleFor: (lang: string) => string,
): Alternate[] {
  return languages.map((lang) => ({
    lang,
    label: loaded.config.locales.entries[lang]?.label ?? lang,
    url: urlFor(lang),
    title: titleFor(lang),
  }))
}

function buildPagination(
  current: number,
  total: number,
  urlFor: (page: number) => string,
): Pagination {
  return {
    current,
    total,
    prevUrl: current > 1 ? urlFor(current - 1) : undefined,
    nextUrl: current < total ? urlFor(current + 1) : undefined,
    pages: Array.from({ length: total }, (_, index) => ({
      n: index + 1,
      url: urlFor(index + 1),
    })),
  }
}

function tagAlternates(
  tagName: string,
  loaded: LoadedConfig,
  content: ContentSet,
  languages: string[],
): Alternate[] {
  const defaultLang = loaded.config.locales.default
  return languages.map((lang) => {
    const tag = content.tagsByLang[lang]?.find((entry) => entry.name === tagName)
    return {
      lang,
      label: loaded.config.locales.entries[lang]?.label ?? lang,
      url: tag ? tag.url : tagsPath(lang, defaultLang),
      title: tag?.name ?? loaded.config.locales.entries[lang]?.title ?? lang,
    }
  })
}

function archiveAlternates(
  year: number | undefined,
  loaded: LoadedConfig,
  languages: string[],
): Alternate[] {
  const defaultLang = loaded.config.locales.default
  return languages.map((lang) => ({
    lang,
    label: loaded.config.locales.entries[lang]?.label ?? lang,
    url: archivePath(lang, defaultLang, year),
    title: year ? String(year) : (loaded.config.locales.entries[lang]?.title ?? lang),
  }))
}

export function buildTasks(loaded: LoadedConfig, content: ContentSet): RenderTask[] {
  const config = loaded.config
  const defaultLang = config.locales.default
  const languages = Object.keys(config.locales.entries)
  const perPage = config.pagination.perPage
  const timezone = config.site.timezone
  const tasks: RenderTask[] = []

  for (const lang of languages) {
    const locale = config.locales.entries[lang]
    if (!locale) continue
    const posts = content.postsByLang[lang] ?? []
    const pages = content.pagesByLang[lang] ?? []
    const tags = content.tagsByLang[lang] ?? []
    const archives = content.archivesByLang[lang] ?? []

    const homeAlternates = sectionAlternates(
      languages,
      loaded,
      (code) => homePath(code, defaultLang),
      (code) => config.locales.entries[code]?.title ?? code,
    )
    const homeTotal = Math.max(1, Math.ceil(posts.length / perPage))
    for (let page = 1; page <= homeTotal; page += 1) {
      const pagePosts = posts.slice((page - 1) * perPage, page * perPage)
      const urlPath = paginationPath(lang, defaultLang, page)
      tasks.push({
        kind: 'index',
        lang,
        urlPath,
        outFile: outFileForUrl(urlPath, loaded.base),
        title: locale.title,
        description: locale.description,
        posts: pagePosts,
        pagination: buildPagination(page, homeTotal, (n) => paginationPath(lang, defaultLang, n)),
        alternates: page === 1 ? homeAlternates : [],
        lastmod: pagePosts[0] ? isoDate(new Date(pagePosts[0].timestamp), timezone) : undefined,
        noindex: page > 1,
      })
    }

    for (const post of posts) {
      tasks.push({
        kind: 'post',
        lang,
        urlPath: post.url,
        outFile: outFileForUrl(post.url, loaded.base),
        title: post.title,
        description: post.summary,
        post,
        toc: post.toc,
        alternates: post.alternates,
        lastmod: isoDate(new Date(post.timestamp), timezone),
      })
    }

    const tagsIndexUrl = tagsPath(lang, defaultLang)
    tasks.push({
      kind: 'tags',
      lang,
      urlPath: tagsIndexUrl,
      outFile: outFileForUrl(tagsIndexUrl, loaded.base),
      titleKey: 'page.tags',
      description: locale.description,
      tags,
      alternates: sectionAlternates(
        languages,
        loaded,
        (code) => tagsPath(code, defaultLang),
        (code) => config.locales.entries[code]?.title ?? code,
      ),
    })

    for (const tag of tags) {
      const tagPosts = posts.filter((post) => post.tags.includes(tag.name))
      const alternates = tagAlternates(tag.name, loaded, content, languages)
      const total = Math.max(1, Math.ceil(tagPosts.length / perPage))
      for (let page = 1; page <= total; page += 1) {
        const urlPath = tagPaginationPath(lang, defaultLang, tag.slug, page)
        const pagePosts = tagPosts.slice((page - 1) * perPage, page * perPage)
        tasks.push({
          kind: 'tag',
          lang,
          urlPath,
          outFile: outFileForUrl(urlPath, loaded.base),
          title: tag.name,
          description: locale.description,
          tag,
          posts: pagePosts,
          pagination: buildPagination(page, total, (n) =>
            tagPaginationPath(lang, defaultLang, tag.slug, n),
          ),
          alternates: page === 1 ? alternates : [],
          lastmod: pagePosts[0] ? isoDate(new Date(pagePosts[0].timestamp), timezone) : undefined,
          noindex: page > 1,
        })
      }
    }

    const archiveUrl = archivePath(lang, defaultLang)
    tasks.push({
      kind: 'archive',
      lang,
      urlPath: archiveUrl,
      outFile: outFileForUrl(archiveUrl, loaded.base),
      titleKey: 'page.archives',
      description: locale.description,
      archives,
      alternates: archiveAlternates(undefined, loaded, languages),
      lastmod: posts[0] ? isoDate(new Date(posts[0].timestamp), timezone) : undefined,
    })

    for (const group of archives) {
      const urlPath = archivePath(lang, defaultLang, group.year)
      tasks.push({
        kind: 'archive',
        lang,
        urlPath,
        outFile: outFileForUrl(urlPath, loaded.base),
        title: String(group.year),
        description: locale.description,
        archives: [group],
        posts: group.posts,
        alternates: archiveAlternates(group.year, loaded, languages),
        lastmod: group.posts[0] ? isoDate(new Date(group.posts[0].timestamp), timezone) : undefined,
      })
    }

    if (config.features.search) {
      const urlPath = searchPath(lang, defaultLang)
      tasks.push({
        kind: 'search',
        lang,
        urlPath,
        outFile: outFileForUrl(urlPath, loaded.base),
        titleKey: 'page.search',
        description: locale.description,
        alternates: sectionAlternates(
          languages,
          loaded,
          (code) => searchPath(code, defaultLang),
          (code) => config.locales.entries[code]?.title ?? code,
        ),
        noindex: true,
      })
    }

    for (const page of pages) {
      tasks.push({
        kind: 'page',
        lang,
        urlPath: page.url,
        outFile: outFileForUrl(page.url, loaded.base),
        title: page.title,
        description: page.summary,
        pageItem: page,
        toc: page.toc,
        alternates: page.alternates,
      })
    }
  }

  const defaultLocale = config.locales.entries[defaultLang]
  if (defaultLocale) {
    tasks.push({
      kind: 'notFound',
      lang: defaultLang,
      urlPath: '/404.html',
      outFile: '404.html',
      titleKey: 'page.notFound',
      description: defaultLocale.description,
      alternates: [],
      noindex: true,
    })
  }

  return tasks
}
