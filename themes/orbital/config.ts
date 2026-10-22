import type { ThemeContext } from '../../src/theme/api.ts'

export interface OrbitalConfig {
  accent: string
  showToc: boolean
  showReadingTime: boolean
  scanlines: boolean
}

export function getOrbitalConfig(ctx: ThemeContext): OrbitalConfig {
  return ctx.theme as OrbitalConfig
}
