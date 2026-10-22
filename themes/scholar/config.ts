import type { ThemeContext } from '../../src/theme/api.ts'

export interface ScholarConfig {
  accent: string
  showToc: boolean
  showReadingTime: boolean
}

export function getScholarConfig(ctx: ThemeContext): ScholarConfig {
  return ctx.theme as ScholarConfig
}
