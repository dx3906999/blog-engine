import { createHash } from 'node:crypto'
import { readdir, readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { buildSite } from '../src/core/build.ts'
import { loadConfig } from '../src/core/config.ts'
import { Logger } from '../src/shared/logger.ts'

async function walk(dir: string, prefix = ''): Promise<string[]> {
  const entries = await readdir(path.join(dir, prefix), { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      files.push(...(await walk(dir, relative)))
    } else if (entry.isFile()) {
      files.push(relative)
    }
  }
  return files.sort()
}

async function hashes(dir: string): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  for (const file of await walk(dir)) {
    const buffer = await readFile(path.join(dir, file))
    map.set(file, createHash('sha256').update(buffer).digest('hex'))
  }
  return map
}

async function main(): Promise<void> {
  const root = process.cwd()
  const logger = new Logger('warn')
  const loaded = await loadConfig({ root, production: false })
  const dirs = ['.determinism/a', '.determinism/b']
  await rm(path.join(root, '.determinism'), { recursive: true, force: true })

  for (const dir of dirs) {
    await buildSite(loaded, {
      outDir: dir,
      atomic: false,
      includeDrafts: false,
      includeFuture: false,
      logger,
    })
  }

  const [a, b] = await Promise.all(dirs.map((dir) => hashes(path.join(root, dir))))
  const files = new Set([...(a?.keys() ?? []), ...(b?.keys() ?? [])])
  const differences: string[] = []
  for (const file of files) {
    if (a?.get(file) !== b?.get(file)) differences.push(file)
  }

  await rm(path.join(root, '.determinism'), { recursive: true, force: true })

  if (differences.length > 0) {
    console.error(`deterministic check failed: ${differences.length} different file(s)`)
    for (const file of differences) console.error(`  ${file}`)
    process.exit(1)
  }
  console.log(`deterministic check: ${a?.size ?? 0} files identical across two builds`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
