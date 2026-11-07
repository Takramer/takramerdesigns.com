import type { APIRoute } from 'astro'
import { SITE } from '../data/site'
import { PROJECTS } from '../data/projects'

// Every indexable page; the 404 stays out.
const paths = ['/', '/projects', '/one-offs', '/logos', '/about', '/contact', '/style', '/terms-of-service', '/projects/operationshero/deck', ...PROJECTS.map((p) => `/projects/${p.slug}`)]

export const GET: APIRoute = () =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((p) => `  <url><loc>${SITE}${p}</loc></url>`).join('\n')}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml' } },
  )
