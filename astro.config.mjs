// takramerdesigns.com, v3. Static pages on Cloudflare Pages; no client router, so the grow between
// pages is the browser's own cross-document view transition (redesign-v3/research/20).
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'

export default defineConfig({
  site: 'https://www.takramerdesigns.com',
  // Cloudflare Pages serves /projects/nydex.html at /projects/nydex, the live site's URLs.
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
  // Only for the Agentation island on preview builds (src/components/Notes.tsx).
  integrations: [react()],
})
