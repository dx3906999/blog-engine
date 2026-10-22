import { loadConfig } from '../core/config.ts'
import { formatError } from '../shared/errors.ts'
import { Logger } from '../shared/logger.ts'
import { parseArgs } from './args.ts'
import { startStaticServer } from './server.ts'

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const logger = new Logger()
  const loaded = await loadConfig({
    root: process.cwd(),
    base: args.options.get('--base'),
    production: false,
  })
  const port = Number(args.options.get('--port') ?? 4000)
  const server = await startStaticServer({
    root: 'dist',
    base: loaded.base,
    port,
    dev: false,
  })
  logger.info(`preview: ${server.url}`)
  const shutdown = async (): Promise<void> => {
    await server.close()
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((error: unknown) => {
  console.error(formatError(error))
  process.exit(1)
})
