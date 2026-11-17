// Every image ships in widths and the browser picks one by its size on screen (research/20,
// section 10). Astro writes WebP, which has no progressive mode, so nothing flashes on Back
// (research/17), and hashes the file names, so the cache can keep them for a year (public/_headers).
import { getImage } from 'astro:assets'
import type { ImageMetadata } from 'astro'

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/**/*.{jpg,png}', { eager: true })

export const source = (path: string): ImageMetadata => {
  const m = files[`../assets/${path}`]
  if (!m) throw new Error(`No image at src/assets/${path}`)
  return m.default
}

export interface Pic { src: string; srcset: string; width: number; height: number; at: Record<number, string> }

export async function pic(path: string, widths: number[]): Promise<Pic> {
  const s = source(path)
  const ws = [...new Set(widths.map((w) => Math.min(w, s.width)))] // never upscale
  const top = Math.max(...ws)
  const r = await getImage({ src: s, widths: ws, width: top, format: 'webp', quality: 80 })
  const at = Object.fromEntries(r.srcSet.values.map((v) => [parseInt(v.descriptor ?? '0'), v.url]))
  return { src: r.src, srcset: r.srcSet.attribute, width: top, height: Math.round((top * s.height) / s.width), at }
}

// Thumbnails, 3:2: the cover, the wall, the home grid and the case hero all use
// them, so the grow between pages is a plain scale (07 4.2).
export const THUMB = [640, 1000, 1500]
export const thumb = (path: string) => pic(path, THUMB)
// The hero adds a 1920 file for a 2x screen; its 640 and 1000 files are the wall's.
export const hero = (path: string) => pic(path, [...THUMB, 1920])
// Link previews: one 1200 px JPEG, the format every service reads.
export const og = async (path: string) => (await getImage({ src: source(path), width: Math.min(1200, source(path).width), format: 'jpg', quality: 82 })).src
// Screens and posters in the galleries.
export const plate = (path: string) => pic(path, [800, 1400, 2000, 2880])

// Until its own file arrives, the case hero shows the thumbnail the reader just saw, from the cache
// (research/20, section 7): 640 at 1x and 1000 at 2x, what the wall's sizes pick.
export const standIn = (t: Pic) => `background-image: image-set(url("${t.at[640]}") 1x, url("${t.at[1000] ?? t.at[640]}") 2x)`

export const SIZES = {
  wall: '(min-width: 900px) 25vw, (min-width: 600px) 50vw, 100vw',
  // The lead loads at the size it first shows; site.js switches it to 80vw on the first scroll,
  // when the stage grows it to 20 of 24 columns. Loading the large file up front moved the largest
  // paint from 1.66 s to 2.74 s on slow 4G (research/20, section 10).
  cover: '(min-width: 900px) 42vw, 100vw',
  hero: '(min-width: 900px) 64vw, 100vw',
  work: '(min-width: 900px) 33vw, (min-width: 600px) 50vw, 100vw',
  preview: '(min-width: 900px) 36vw, 100vw',
  full: '(min-width: 900px) 84vw, 100vw',
  piece: '(min-width: 1280px) 25vw, (min-width: 900px) 33vw, 50vw',
}
