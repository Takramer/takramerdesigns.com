// The marks on /logos, read from their SVG files at build time (10-copy 4.3). Every shape becomes
// path data, and the end of every segment is an anchor point: the squares a designer sees at 400%.
const files = import.meta.glob<string>('../assets/marks/*.svg', { query: '?raw', import: 'default', eager: true })

export interface Mark { box: string; shift: string; paths: string[]; anchors: string; handles: string; count: number; x?: [number, number] }

// Numbers as Illustrator writes them: "5.53.88" is 5.53, then .88.
const TOKEN = /[MLHVCSQTAZ]|[-+]?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?/gi
const ARGS: Record<string, number> = { M: 2, L: 2, T: 2, H: 1, V: 1, C: 6, S: 4, Q: 4 }
const isCmd = (t?: string) => !!t && /^[a-z]$/i.test(t)

// The end of every segment, in absolute coordinates, and the bezier handles: a line from each
// control point to the anchor it pulls (I7, 4 November).
function ends(d: string, hs: string[] = []): [number, number][] {
  const t = d.match(TOKEN) ?? []
  const out: [number, number][] = []
  let x = 0, y = 0, sx = 0, sy = 0, cmd = 'M', i = 0
  while (i < t.length) {
    if (isCmd(t[i])) cmd = t[i++]
    const C = cmd.toUpperCase(), rel = cmd !== C
    if (C === 'Z') {
      x = sx; y = sy
      if (i < t.length && !isCmd(t[i])) throw new Error(`marks.ts: numbers after Z in "${d.slice(0, 40)}"`)
      continue
    }
    // ponytail: arc flags can run together ("0110"), which TOKEN reads as one number. No mark has an
    // arc yet; parse the flags one character at a time when one does.
    const n = ARGS[C]
    if (!n) throw new Error(`marks.ts: no parser for "${cmd}"`)
    const v = t.slice(i, i + n).map(Number)
    i += n
    const px = x, py = y, ax = (k: number) => (rel ? px + v[k] : v[k]), ay = (k: number) => (rel ? py + v[k] : v[k])
    if (C === 'H') x = rel ? x + v[0] : v[0]
    else if (C === 'V') y = rel ? y + v[0] : v[0]
    else { x = rel ? x + v[n - 2] : v[n - 2]; y = rel ? y + v[n - 1] : v[n - 1] }
    if (C === 'C') hs.push(`M${r2(px)} ${r2(py)}L${r2(ax(0))} ${r2(ay(1))}M${r2(x)} ${r2(y)}L${r2(ax(2))} ${r2(ay(3))}`)
    else if (C === 'S' || C === 'Q') hs.push(`M${r2(x)} ${r2(y)}L${r2(ax(0))} ${r2(ay(1))}`)
    if (C === 'M') { sx = x; sy = y; cmd = rel ? 'l' : 'L' } // pairs after a move are lines
    out.push([x, y])
  }
  return out
}

const attr = (s: string, k: string) => s.match(new RegExp(`\\s${k}="([^"]*)"`))?.[1]
const r2 = (n: number) => +n.toFixed(2)

// A path's contours, one path each, so a drawn outline closes every contour at the same moment (the
// case pages' draw). A relative move starts from where the path stood, so it becomes absolute; the
// pairs after it stay relative lines.
export function contours(d: string): string[] {
  const out: string[] = []
  let prev = ''
  for (const part of d.match(/[Mm][^Mm]*/g) ?? [d]) {
    if (part[0] === 'M' || !prev) out.push('M' + part.slice(1))
    else {
      const [cx, cy] = /[Zz]\s*$/.test(prev) ? ends(out.at(-1)!)[0] : ends(prev).at(-1)!
      const [, dx, dy, ...rest] = part.match(TOKEN)!
      out.push(`M${r2(cx + +dx)} ${r2(cy + +dy)}${rest.length && !isCmd(rest[0]) ? ' l' : ''} ${rest.join(' ')}`)
    }
    prev += part
  }
  return out
}

// Each mark covers the same share of its 3:2 cell, a fifth by its box, so a wordmark and a seal read
// at about the same weight; none runs past 72% of the cell's width or 62% of its height. The view
// box is the cell, with the mark in the middle.
export function mark(slug: string): Mark {
  const svg = files[`../assets/marks/${slug}.svg`]
  if (!svg) throw new Error(`No mark at src/assets/marks/${slug}.svg`)
  const { view: [vx, vy, w, h], paths, anchors, handles, count } = shapes(svg)
  const share = Math.min(Math.sqrt((0.2 / 1.5) * (w / h)), 0.72, (0.62 / 1.5) * (w / h))
  const bw = w / share, bh = bw / 1.5
  return { box: `0 0 ${r2(bw)} ${r2(bh)}`, shift: `translate(${r2(bw / 2 - vx - w / 2)} ${r2(bh / 2 - vy - h / 2)})`, paths, anchors, handles, count, x: [r2(vx), r2(vx + w)] }
}

// I7: a mark cropped close, a tenth of its size clear on each side, for the drawn plate on a case.
export function close(slug: string): Mark {
  const svg = files[`../assets/marks/${slug}.svg`]
  if (!svg) throw new Error(`No mark at src/assets/marks/${slug}.svg`)
  const { view: [vx, vy, w, h], paths, anchors, handles, count } = shapes(svg)
  const o = Math.max(w, h) * 0.1
  return { box: `${r2(vx - o)} ${r2(vy - o)} ${r2(w + 2 * o)} ${r2(h + 2 * o)}`, shift: '', paths, anchors, handles, count }
}

// Any SVG drawn in ink: its view box, its shapes as path data and its anchor points. The footer
// draws the TAKD mark with it (N7).
export function shapes(svg: string) {
  const view = attr(svg, 'viewBox')!.split(/[\s,]+/).map(Number)
  const none = new Set([...svg.matchAll(/\.([\w-]+)\s*\{[^}]*fill:\s*none/g)].map((m) => m[1])) // guides, not ink
  const paths: string[] = []
  for (const [, tag, a] of svg.matchAll(/<(path|polygon|rect)\b([^>]*)>/g)) {
    if (attr(a, 'class')?.split(/\s+/).some((c) => none.has(c))) continue
    if (tag === 'path') paths.push(attr(a, 'd')!)
    else if (tag === 'polygon') paths.push(`M${attr(a, 'points')!.trim()}Z`)
    else {
      const [x, y, rw, rh] = ['x', 'y', 'width', 'height'].map((k) => Number(attr(a, k) ?? 0))
      paths.push(`M${x} ${y}h${rw}v${rh}h${-rw}Z`)
    }
  }
  const seen = new Set<string>(), hs: string[] = []
  for (const d of paths) for (const [x, y] of ends(d, hs)) seen.add(`${r2(x)} ${r2(y)}`)
  return { view, paths, anchors: [...seen].map((p) => `M${p}h0`).join(''), handles: hs.join(''), count: seen.size }
}
