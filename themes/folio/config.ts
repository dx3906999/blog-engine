import type { ThemeContext } from 'blog-engine/theme'

export interface FolioConfig {
  accent: string
  showToc: boolean
  showReadingTime: boolean
  width: 'narrow' | 'wide'
}

export function getFolioConfig(ctx: ThemeContext): FolioConfig {
  return ctx.theme as FolioConfig
}
