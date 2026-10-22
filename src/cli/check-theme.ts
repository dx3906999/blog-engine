import { access, readdir, readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { load } from 'cheerio'
import { buildSite } from '../core/build.ts'
import { loadConfig } from '../core/config.ts'
import { Logger } from '../shared/logger.ts'
import { listThemeNames, resolveThemeDir } from '../theme/loader.ts'

async function exists(file: string): Promise<boolean> {
  try {
    await access(file)
    return true
  } catch {
    return false
  }
}

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

export async function runCheckTheme(argv: string[] = process.argv.slice(2)): Promise<void> {
  const root = process.cwd()
  const requested = argv.filter((arg) => !arg.startsWith('--'))
  const themes = requested.length > 0 ? requested : await listThemeNames(root)
  const logger = new Logger('warn')
  const errors: string[] = []

  for (const theme of themes) {
    const themeDir = await resolveThemeDir(root, theme)
    if (!themeDir) {
      errors.push(`${theme}: theme directory not found`)
      continue
    }
    const manifestFile = path.join(themeDir, 'theme.json')
    if (!(await exists(manifestFile))) {
      errors.push(`${theme}: missing theme.json`)
      continue
    }

    const outDir = path.join(root, '.theme-check', theme)
    try {
      const loaded = await loadConfig({ root, theme, production: false })
      const result = await buildSite(loaded, {
        outDir: path.relative(root, outDir),
        atomic: false,
        includeDrafts: false,
        includeFuture: false,
        logger,
      })

      const required = [
        'index.html',
        '404.html',
        'sitemap.xml',
        'atom.xml',
        'robots.txt',
        '.nojekyll',
      ]
      for (const file of required) {
        if (!(await exists(path.join(outDir, file)))) {
          errors.push(`${theme}: missing ${file}`)
        }
      }

      const languages = Object.keys(loaded.config.locales.entries)
      if (languages.length > 1) {
        for (const lang of languages) {
          if (lang === loaded.config.locales.default) continue
          if (!(await exists(path.join(outDir, lang, 'index.html')))) {
            errors.push(`${theme}: missing ${lang}/index.html`)
          }
        }
      }

      const htmlFiles = await walk(outDir)
      if (htmlFiles.length === 0) errors.push(`${theme}: no HTML output`)

      for (const file of htmlFiles) {
        const relative = path.relative(outDir, file)
        const $ = load(await readFile(file, 'utf8'))
        if (!$('html').attr('lang')) errors.push(`${theme}/${relative}: missing html[lang]`)
        if (!$('title').text().trim()) errors.push(`${theme}/${relative}: missing title`)
        if (!$('link[rel="canonical"]').attr('href')) {
          errors.push(`${theme}/${relative}: missing canonical`)
        }
        if ($('main').length !== 1) {
          errors.push(`${theme}/${relative}: expected one main element`)
        }
        if ($('h1').length !== 1) {
          errors.push(`${theme}/${relative}: expected one h1`)
        }
        if ($('link[rel="stylesheet"]').length === 0) {
          errors.push(`${theme}/${relative}: no stylesheet`)
        }
        const source = await readFile(file, 'utf8')
        if (source.includes('[object Object]')) {
          errors.push(`${theme}/${relative}: contains [object Object]`)
        }
        if (/(?:>undefined<|="undefined")/.test(source)) {
          errors.push(`${theme}/${relative}: contains undefined output`)
        }
        if (
          languages.length > 1 &&
          relative !== '404.html' &&
          $('link[rel="alternate"][hreflang]').length < 2
        ) {
          errors.push(`${theme}/${relative}: missing hreflang alternates`)
        }
      }

      if (result.tasks.length === 0) errors.push(`${theme}: no routes rendered`)
    } catch (error) {
      errors.push(`${theme}: ${(error as Error).message}`)
    }
  }

  await rm(path.join(root, '.theme-check'), { recursive: true, force: true })

  if (errors.length > 0) {
    console.error(`theme check failed: ${errors.length} issue(s)`)
    for (const error of errors) console.error(`  ${error}`)
    process.exit(1)
  }
  console.log(`theme check: ${themes.join(', ')}`)
}
