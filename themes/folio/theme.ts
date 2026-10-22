import { defineTheme } from 'blog-engine/theme'
import { z } from 'zod'
import { archive } from './layouts/archive.ts'
import { index } from './layouts/index.ts'
import { notFound } from './layouts/notFound.ts'
import { page } from './layouts/page.ts'
import { post } from './layouts/post.ts'
import { search } from './layouts/search.ts'
import { tag } from './layouts/tag.ts'
import { tags } from './layouts/tags.ts'

export default defineTheme({
  config: z.object({
    accent: z.string().default('#8a2f2f'),
    showToc: z.boolean().default(true),
    showReadingTime: z.boolean().default(true),
    width: z.enum(['narrow', 'wide']).default('narrow'),
  }),
  layouts: {
    index,
    post,
    page,
    archive,
    tag,
    tags,
    search,
    notFound,
  },
})
