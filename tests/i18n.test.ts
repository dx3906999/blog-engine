import { describe, expect, it } from 'vitest'
import { Logger } from '../src/shared/logger.ts'
import { createTranslator, type Translations } from '../src/theme/i18n.ts'

const translations: Translations = {
  zh: {
    nav: { home: '首页' },
    greeting: '你好，{name}',
  },
  en: {
    nav: { home: 'Home' },
  },
}

describe('theme i18n', () => {
  it('interpolates variables', () => {
    const t = createTranslator('zh', 'zh', translations, new Logger('error'))
    expect(t('greeting', { name: '世界' })).toBe('你好，世界')
  })

  it('falls back to the default language', () => {
    const t = createTranslator('en', 'zh', translations, new Logger('error'))
    expect(t('greeting', { name: 'world' })).toBe('你好，world')
  })

  it('returns the key when nothing matches', () => {
    const t = createTranslator('en', 'zh', translations, new Logger('error'))
    expect(t('missing.key')).toBe('missing.key')
  })
})
