interface Manifest {
  defaultLang: string
  languages: string[]
}

function join(base: string, relative: string): string {
  return new URL(relative, base.endsWith('/') ? base : `${base}/`).toString()
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function retryFetch(url: string, attempts = 8): Promise<Response> {
  let lastError: unknown
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { redirect: 'follow' })
      if (response.status < 500) return response
      lastError = new Error(`${url} returned ${response.status}`)
    } catch (error) {
      lastError = error
    }
    await sleep(5000)
  }
  throw lastError
}

async function main(): Promise<void> {
  const base = process.env.BASE_URL
  if (!base) throw new Error('BASE_URL is required')
  const rootUrl = base.endsWith('/') ? base : `${base}/`
  const errors: string[] = []

  const manifestResponse = await retryFetch(join(rootUrl, 'build-manifest.json'))
  if (!manifestResponse.ok)
    throw new Error(`build-manifest.json returned ${manifestResponse.status}`)
  const manifest = (await manifestResponse.json()) as Manifest

  for (const lang of manifest.languages) {
    const relative = lang === manifest.defaultLang ? '' : `${lang}/`
    const response = await retryFetch(join(rootUrl, relative))
    if (response.status !== 200) {
      errors.push(`/${relative} returned ${response.status}`)
      continue
    }
    const html = await response.text()
    if (!html.includes(`lang="${lang}"`)) errors.push(`/${relative} is missing lang="${lang}"`)
  }

  for (const file of [
    'atom.xml',
    'sitemap.xml',
    'robots.txt',
    '404.html',
    'pagefind/pagefind.js',
  ]) {
    const response = await retryFetch(join(rootUrl, file))
    if (response.status !== 200) errors.push(`/${file} returned ${response.status}`)
  }

  const sitemap = await (await retryFetch(join(rootUrl, 'sitemap.xml'))).text()
  const loc = sitemap.match(/<loc>(.*?)<\/loc>/)?.[1]
  if (!loc) {
    errors.push('sitemap.xml has no loc')
  } else {
    const response = await retryFetch(loc)
    if (response.status !== 200) errors.push(`${loc} returned ${response.status}`)
  }

  const missing = await retryFetch(join(rootUrl, `__missing-${Date.now()}/`))
  if (missing.status !== 404) errors.push(`missing path returned ${missing.status}, expected 404`)

  if (errors.length > 0) {
    console.error('smoke test failed')
    for (const error of errors) console.error(`  ${error}`)
    process.exit(1)
  }
  console.log(`smoke test: ${rootUrl}`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
