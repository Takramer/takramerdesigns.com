// The palette as the stylesheet sets it, read from site.css at build time, with every figure the
// style guide prints computed here: WCAG 2 contrast, OKLCH, and the rule a CSS selector carries.
import css from '../../styles/site.css?raw'

const root = css.match(/:root\s*{([^}]*)}/)![1]
export const token = (name: string) => root.match(new RegExp(`--${name}:\\s*([^;]+);`))![1].trim()

const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
export const luminance = (hex: string) => { const [r, g, b] = rgb(hex).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b }
export const contrast = (a: string, b: string) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }
// WCAG 2 at body size: AAA from 7, AA from 4.5; below that it passes only for large type (3) or not at all.
export const grade = (r: number) => (r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA large' : 'Fails')
// Printed to one decimal, rounded down, so a ratio never reads as passing when it does not.
export const ratio = (r: number) => `${(Math.floor(r * 10) / 10).toFixed(1)}:1`

export function oklch(hex: string) {
  const [r, g, b] = rgb(hex).map(lin)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const C = Math.hypot(A, B), H = ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360
  return { L, C, H, text: `${(L * 100).toFixed(1)}% ${C.toFixed(3)} ${C < 0.005 ? '0' : H.toFixed(0)}` }
}
export const rgbText = (hex: string) => rgb(hex).map((c) => Math.round(c * 255)).join(' ')

// The declarations of the first rule whose selector list is exactly `sel`, as the stylesheet writes them.
export function rule(sel: string, source = css) {
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const m = source.match(new RegExp(`(?:^|[}\\n])\\s*${esc}\\s*{([^}]*)}`))
  if (!m) throw new Error(`style guide: no rule for ${sel} in site.css`)
  return Object.fromEntries(m[1].split(';').map((d) => d.split(/:(.*)/s).map((s) => s.trim())).filter((d) => d[0] && d[1] != null))
}
export { css }
