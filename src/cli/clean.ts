import { rm } from 'node:fs/promises'
import path from 'node:path'
import { Logger } from '../shared/logger.ts'

async function main(): Promise<void> {
  const logger = new Logger()
  const root = process.cwd()
  for (const dir of ['dist', '.dev-dist', '.build-tmp', '.cache']) {
    await rm(path.join(root, dir), { recursive: true, force: true })
    logger.info(`removed ${dir}/`)
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
