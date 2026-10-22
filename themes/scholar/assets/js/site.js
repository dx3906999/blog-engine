const root = document.documentElement
const storageKey = 'scholar-theme'
const toggle = document.querySelector('[data-theme-toggle]')

function syncToggle() {
  if (!(toggle instanceof HTMLButtonElement)) return
  toggle.setAttribute('aria-pressed', root.dataset.theme === 'dark' ? 'true' : 'false')
}

if (toggle instanceof HTMLButtonElement) {
  syncToggle()
  toggle.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark'
    root.dataset.theme = next
    try {
      localStorage.setItem(storageKey, next)
    } catch {
      // The toggle still works for this page when storage is blocked.
    }
    syncToggle()
  })
}

const tocLinks = Array.from(document.querySelectorAll('.toc a[href^="#"]'))
if (tocLinks.length > 0) {
  const headingToLink = new Map()
  for (const link of tocLinks) {
    const href = link.getAttribute('href')
    if (!href) continue
    let id = href.slice(1)
    try {
      id = decodeURIComponent(id)
    } catch {
      // Keep the raw fragment.
    }
    const heading = document.getElementById(id)
    if (heading) headingToLink.set(heading, link)
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const active = headingToLink.get(entry.target)
        if (!active) continue
        for (const link of tocLinks) link.classList.remove('is-active')
        active.classList.add('is-active')
      }
    },
    { rootMargin: '0px 0px -70% 0px', threshold: 0 },
  )

  for (const heading of headingToLink.keys()) observer.observe(heading)
}
