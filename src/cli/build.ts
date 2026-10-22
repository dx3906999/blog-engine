import path from 'node:path'
import { buildSite } from '../core/build.ts'
import { loadConfig } from '../core/config.ts'
import { formatError } from '../shared/errors.ts'
import { Logger } from '../shared/logger.ts'
import { parseArgs } from './args.ts'

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const logger = new Logger(args.flags.has('--verbose') ? 'debug' : 'info')
  const root = process.cwd()
  const dev = args.flags.has('--dev')
  const production =
    !dev && (process.env.SITE_ENV === 'production' || args.flags.has('--production'))

  const loaded = await loadConfig({
    root,
    base: args.options.get('--base'),
    theme: args.options.get('--theme'),
    production,
  })

  const result = await buildSite(loaded, {
    outDir: args.options.get('--out') ?? 'dist',
    atomic: !dev,
    includeDrafts: dev || args.flags.has('--drafts'),
    includeFuture: dev || args.flags.has('--future'),
    logger,
  })

  const relative = path.relative(root, result.outDir) || result.outDir
  logger.info(
    `built ${result.posts} posts, ${result.pages} pages, ${result.tasks.length} routes in ${result.durationMs}ms -> ${relative}`,
  )
}

main().catch((error: unknown) => {
  console.error(formatError(error))
  process.exit(1)
})
