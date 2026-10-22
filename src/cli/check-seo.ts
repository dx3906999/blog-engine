import { access, readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { load } from 'cheerio'
import { XMLParser } from 'fast-xml-parser'
import { decodePath, stripBase } from '../shared/url.ts'

interface Manifest {
  base: string
  url: string
}

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })

async function walk(dir: string, result: string[] = []): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'pagefind') continue
      await walk(full, result)
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      result.push(full)
    }
  }
  return result
}

async function exists(file: string): Promise<boolean> {
  try {
    await access(file)
    return true
  } catch {
    return false
  }
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

function fileForUrl(root: string, manifest: Manifest, loc: string): string | undefined {
  let url: URL
  try {
    url = new URL(loc)
  } catch {
    return undefined
  }
  let pathname = decodePath(stripBase(url.pathname, manifest.base))
  if (pathname === '/' || pathname === '') pathname = '/index.html'
  else if (pathname.endsWith('/')) pathname = `${pathname}index.html`
  return path.join(root, pathname.replace(/^\/+/, ''))
}

export async function runCheckSeo(): Promise<void> {
  const root = path.resolve('dist')
  const manifest = JSON.parse(
    await readFile(path.join(root, 'build-manifest.json'), 'utf8'),
  ) as Manifest & { languages: string[]; defaultLang: string }
  const originPrefix = `${manifest.url}${manifest.base === '/' ? '' : manifest.base}`
  const files = await walk(root)
  const errors: string[] = []

  for (const file of files) {
    const relative = path.relative(root, file)
    const source = await readFile(file, 'utf8')
    const $ = load(source)

    const lang = $('html').attr('lang')
    if (!lang) errors.push(`${relative}: missing html[lang]`)

    const title = $('title').text().trim()
    if (!title) errors.push(`${relative}: missing title`)

    const description = $('meta[name="description"]').attr('content')?.trim() ?? ''
    if (!description) errors.push(`${relative}: missing meta description`)
    if (description.length > 200) {
      errors.push(`${relative}: meta description is ${description.length} characters`)
    }

    if ($('h1').length !== 1) {
      errors.push(`${relative}: expected exactly one h1, found ${$('h1').length}`)
    }
    if ($('main').length !== 1) {
      errors.push(`${relative}: expected exactly one main element, found ${$('main').length}`)
    }

    const canonical = $('link[rel="canonical"]').attr('href')?.trim() ?? ''
    if (!canonical) {
      errors.push(`${relative}: missing canonical`)
    } else {
      try {
        const url = new URL(canonical)
        if (!canonical.startsWith(originPrefix)) {
          errors.push(`${relative}: canonical does not start with ${originPrefix}`)
        }
        if (url.origin !== new URL(manifest.url).origin) {
          errors.push(`${relative}: canonical origin differs from site.url`)
        }
      } catch {
        errors.push(`${relative}: canonical is not an absolute URL`)
      }
    }

    const alternates = $('link[rel="alternate"][hreflang]')
    if (alternates.length > 0) {
      const hasDefault = alternates
        .toArray()
        .some((element) => $(element).attr('hreflang') === 'x-default')
      if (!hasDefault) errors.push(`${relative}: hreflang alternates without x-default`)
    }

    for (const property of ['og:title', 'og:description', 'og:type', 'og:url']) {
      if (!$(`meta[property="${property}"]`).attr('content')) {
        errors.push(`${relative}: missing ${property}`)
      }
    }

    let jsonLdCount = 0
    $('script[type="application/ld+json"]').each((_, element) => {
      jsonLdCount += 1
      const text = $(element).text().trim()
      try {
        JSON.parse(text)
      } catch {
        errors.push(`${relative}: invalid JSON-LD`)
      }
    })
    if (jsonLdCount === 0) errors.push(`${relative}: missing JSON-LD`)

    if (source.includes('undefined') && /(?:>undefined<|="undefined")/.test(source)) {
      errors.push(`${relative}: contains undefined output`)
    }
    if (source.includes('[object Object]')) {
      errors.push(`${relative}: contains [object Object]`)
    }
  }

  const sitemapXml = await readFile(path.join(root, 'sitemap.xml'), 'utf8')
  const sitemap = parser.parse(sitemapXml)
  const urls = asArray(sitemap.urlset?.url)
  if (urls.length === 0) errors.push('sitemap.xml has no urls')

  for (const entry of urls) {
    const loc = typeof entry?.loc === 'string' ? entry.loc : ''
    if (!loc) {
      errors.push('sitemap.xml has a url without loc')
      continue
    }
    const parsed = new URL(loc)
    const relativePath = decodePath(stripBase(parsed.pathname, manifest.base))
    if (relativePath === '/zh' || relativePath.startsWith('/zh/')) {
      errors.push(`sitemap.xml contains a /zh/ URL: ${loc}`)
    }
    const target = fileForUrl(root, manifest, loc)
    if (!target || !(await exists(target))) {
      errors.push(`sitemap.xml points to a missing file: ${loc}`)
    }
    const links = asArray(entry['xhtml:link'])
    if (links.length > 0) {
      const hasDefault = links.some((link) => link?.['@_hreflang'] === 'x-default')
      if (!hasDefault) errors.push(`sitemap entry lacks x-default: ${loc}`)
    }
  }

  const atomFiles = manifest.languages.map((lang) =>
    lang === manifest.defaultLang ? 'atom.xml' : `${lang}/atom.xml`,
  )
  for (const atomFile of atomFiles) {
    const atomPath = path.join(root, atomFile)
    if (!(await exists(atomPath))) continue
    const atom = parser.parse(await readFile(atomPath, 'utf8'))
    if (!atom.feed?.title) errors.push(`${atomFile}: missing feed title`)
    for (const entry of asArray(atom.feed?.entry)) {
      if (!entry?.title || !entry?.id || !entry?.updated) {
        errors.push(`${atomFile}: entry is missing title, id, or updated`)
      }
    }
  }

  const robots = await readFile(path.join(root, 'robots.txt'), 'utf8')
  if (!robots.includes('Sitemap:')) errors.push('robots.txt is missing Sitemap:')
  if (!(await exists(path.join(root, '.nojekyll')))) errors.push('missing .nojekyll')
  if (!(await exists(path.join(root, '404.html')))) errors.push('missing 404.html')

  if (errors.length > 0) {
    console.error(`seo check failed: ${errors.length} issue(s) across ${files.length} pages`)
    for (const error of errors) console.error(`  ${error}`)
    process.exit(1)
  }
  console.log(`seo check: ${files.length} pages, ${urls.length} sitemap urls`)
}
