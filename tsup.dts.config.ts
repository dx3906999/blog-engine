import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    theme: 'src/theme/api.ts',
    config: 'src/core/config.ts',
  },
  format: ['esm'],
  target: 'node24',
  platform: 'node',
  dts: true,
  clean: false,
  splitting: false,
  sourcemap: false,
  treeshake: true,
  external: [/^[^./]/],
})
