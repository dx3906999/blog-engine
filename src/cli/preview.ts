import { loadConfig } from '../core/config.ts'
import { Logger } from '../shared/logger.ts'
import { parseArgs } from './args.ts'
import { startStaticServer } from './server.ts'

export async function runPreview(argv: string[] = process.argv.slice(2)): Promise<void> {
  const args = parseArgs(argv)
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
