export interface ParsedArgs {
  flags: Set<string>
  options: Map<string, string>
  positionals: string[]
}

export function parseArgs(argv: string[]): ParsedArgs {
  const flags = new Set<string>()
  const options = new Map<string, string>()
  const positionals: string[] = []

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (!token) continue
    if (!token.startsWith('--')) {
      positionals.push(token)
      continue
    }
    const [rawName, inlineValue] = token.split('=', 2)
    if (!rawName) continue
    if (inlineValue !== undefined) {
      options.set(rawName, inlineValue)
      continue
    }
    const next = argv[i + 1]
    if (next && !next.startsWith('--')) {
      options.set(rawName, next)
      i += 1
    } else {
      flags.add(rawName)
    }
  }

  return { flags, options, positionals }
}
