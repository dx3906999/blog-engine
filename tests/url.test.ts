import { describe, expect, it } from 'vitest'
import {
  absoluteUrl,
  joinLangPath,
  normalizeBase,
  paginationPath,
  postPath,
  stripBase,
  tagPath,
  withBase,
} from '../src/shared/url.ts'

describe('url helpers', () => {
  it('normalizes base paths', () => {
    expect(normalizeBase('/')).toBe('')
    expect(normalizeBase('/repo/')).toBe('/repo')
    expect(normalizeBase('repo')).toBe('/repo')
  })

  it('joins base paths', () => {
    expect(withBase('/repo', '/posts/a/')).toBe('/repo/posts/a/')
    expect(withBase('', '/posts/a/')).toBe('/posts/a/')
    expect(withBase('/repo', '/')).toBe('/repo/')
  })

  it('prefixes a language only when needed', () => {
    expect(joinLangPath('zh', 'zh', '/archives/')).toBe('/archives/')
    expect(joinLangPath('en', 'zh', '/archives/')).toBe('/en/archives/')
    expect(postPath('en', 'zh', 'hello')).toBe('/en/posts/hello/')
  })

  it('encodes tag segments', () => {
    expect(tagPath('zh', 'zh', '主题')).toBe('/tags/%E4%B8%BB%E9%A2%98/')
  })

  it('builds pagination and absolute URLs', () => {
    expect(paginationPath('zh', 'zh', 2)).toBe('/page/2/')
    expect(absoluteUrl('https://x.github.io', '/repo', '/posts/a/')).toBe(
      'https://x.github.io/repo/posts/a/',
    )
  })

  it('strips the base for filesystem paths', () => {
    expect(stripBase('/repo/posts/a/', '/repo')).toBe('/posts/a/')
    expect(stripBase('/posts/a/', '')).toBe('/posts/a/')
  })
})
