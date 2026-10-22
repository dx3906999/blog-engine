import type { ThemeContext } from '../../src/theme/api.ts'

export interface FolioConfig {
  accent: string
  showToc: boolean
  showReadingTime: boolean
  width: 'narrow' | 'wide'
}

export function getFolioConfig(ctx: ThemeContext): FolioConfig {
  return ctx.theme as FolioConfig
}
