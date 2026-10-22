import type { ThemeContext } from 'blog-engine/theme'

export interface ScholarConfig {
  accent: string
  showToc: boolean
  showReadingTime: boolean
}

export function getScholarConfig(ctx: ThemeContext): ScholarConfig {
  return ctx.theme as ScholarConfig
}
