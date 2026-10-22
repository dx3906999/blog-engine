import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'
import { BuildError } from '../shared/errors.ts'
import type { Logger } from '../shared/logger.ts'
import type { Translator } from './api.ts'

type TranslationTree = Record<string, unknown>

export type Translations = Record<string, TranslationTree>

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function deepMerge(base: TranslationTree, override: TranslationTree): TranslationTree {
  const result: TranslationTree = { ...base }
  for (const [key, value] of Object.entries(override)) {
    const current = result[key]
    if (isPlainObject(current) && isPlainObject(value)) {
      result[key] = deepMerge(current, value)
    } else {
      result[key] = value
    }
  }
  return result
}

async function readYamlObject(file: string): Promise<TranslationTree | undefined> {
  let source: string
  try {
    source = await readFile(file, 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
    throw error
  }
  try {
    const parsed = parseYaml(source)
    if (parsed === null || parsed === undefined) return {}
    if (!isPlainObject(parsed)) {
      throw new BuildError('Translation file must contain a YAML mapping', {
        code: 'THEME',
        file,
      })
    }
    return parsed
  } catch (error) {
    if (error instanceof BuildError) throw error
    throw new BuildError(`Invalid translation YAML: ${(error as Error).message}`, {
      code: 'THEME',
      file,
      cause: error,
    })
  }
}

async function firstExistingFile(candidates: string[]): Promise<string | undefined> {
  for (const candidate of candidates) {
    try {
      await readFile(candidate)
      return candidate
    } catch {
      // Try the next extension.
    }
  }
  return undefined
}

export async function loadTranslations(
  themeDir: string,
  themeI18nPath: string,
  siteRoot: string,
  languages: string[],
  logger: Logger,
): Promise<Translations> {
  const translations: Translations = {}
  const themeI18nDir = path.resolve(themeDir, themeI18nPath)

  for (const lang of languages) {
    const themeFile = await firstExistingFile([
      path.join(themeI18nDir, `${lang}.yml`),
      path.join(themeI18nDir, `${lang}.yaml`),
    ])
    const themeValues = themeFile ? await readYamlObject(themeFile) : undefined
    if (!themeValues) {
      logger.warn(`theme is missing i18n/${lang}.yml; falling back to the key name`)
    }

    const siteFile = await firstExistingFile([
      path.join(siteRoot, 'i18n', `${lang}.yml`),
      path.join(siteRoot, 'i18n', `${lang}.yaml`),
    ])
    const siteValues = siteFile ? await readYamlObject(siteFile) : undefined

    translations[lang] = deepMerge(themeValues ?? {}, siteValues ?? {})
  }

  return translations
}

function lookup(tree: TranslationTree | undefined, key: string): unknown {
  if (!tree) return undefined
  let current: unknown = tree
  for (const part of key.split('.')) {
    if (!isPlainObject(current)) return undefined
    current = current[part]
  }
  return current
}

export function createTranslator(
  lang: string,
  defaultLang: string,
  translations: Translations,
  logger: Logger,
): Translator {
  const missing = new Set<string>()

  return (key, vars) => {
    let value = lookup(translations[lang], key)
    let usedFallback = false

    if (typeof value !== 'string') {
      value = lookup(translations[defaultLang], key)
      usedFallback = true
    }

    if (typeof value !== 'string') {
      if (!missing.has(key)) {
        missing.add(key)
        logger.warn(`missing i18n key "${key}" for ${lang}`)
      }
      return key
    }

    if (usedFallback && lang !== defaultLang && !missing.has(`fallback:${key}`)) {
      missing.add(`fallback:${key}`)
      logger.debug(`i18n key "${key}" fell back to ${defaultLang}`)
    }

    return value.replace(/\{(\w+)\}/g, (_, name: string) => {
      const replacement = vars?.[name]
      return replacement === undefined ? `{${name}}` : String(replacement)
    })
  }
}
