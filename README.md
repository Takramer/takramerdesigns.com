# takramerdesigns.com

The code behind [www.takramerdesigns.com](https://www.takramerdesigns.com), the portfolio of Thomas Kramer, a brand and product designer who builds what he designs. Thomas designed the site and wrote it.

## What this repo is

This is the public copy of a private working repo. Each time Thomas publishes, a workflow replaces this repo with one commit that holds the site's current files. It keeps no history, so a file he removes is gone from here too.

## How it is built

- [Astro](https://astro.build), all static pages. One plain script, `public/site.js`, runs the motion and interaction; there is no client framework.
- Hosted on Cloudflare Pages. [Umami](https://umami.is) counts visits and clicks without cookies.
- Type: the Geist family, under the SIL Open Font License, and [Endless](https://www.behance.net/gallery/247864363/ENDLESS-Geometric-Sans-Serif-Free-Font), free for personal and commercial use. Its terms say nothing about handing out the file, so it is left out of this copy; a build from here sets Geist in its place.

Worth reading:

- `src/lib/marks.ts` reads every logo's SVG at build time and finds its anchor points, the squares a designer sees at 400%.
- `src/components/Draw.astro` draws a mark the way it was made: anchor points, then bezier handles, then the outline, then the fill.
- `src/pages/logos.astro` and the lens in `public/site.js` zoom any mark to 400% with its anchor points showing.

## Run it

Node 24 (see `.node-version`):

```bash
npm ci
npm run dev
npm run build
```

## Rights

The code is here to read. The work it shows (the marks, images, case studies and writing) belongs to Thomas Kramer and his clients, and none of it is licensed for reuse.
