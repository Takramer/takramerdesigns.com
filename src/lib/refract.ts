// Live liquid glass: the rim of a control bends the page that is really under it, as it scrolls.
//
// The method is the one worked out in kube.io's "Liquid Glass in the Browser" and used by the 2026
// crop of libraries (nordify/css-liquid-glass, quickLiquid, better-liquid-glass-css): the glass is a
// rounded slab with a convex bezel; Snell's law (n = 1.5) gives how far a ray moves sideways at each
// distance from the edge; that goes into the red and green channels of a small picture, and an SVG
// feDisplacementMap, run as a backdrop-filter, moves the backdrop by it. Nothing is cloned, so it
// works over a film, a scrolling page or a dragged table.
//
// Only Chromium runs an SVG filter as a backdrop-filter (Chrome, Edge, Arc, Android). Safari and
// Firefox keep the stylesheet's material: blur, saturation, rim light and shadow, which is also what
// Apple's own pages show there. The stylesheet reads the filter from --gl-lens.

export const LIVE =
  typeof CSS !== 'undefined' && /Chrom(e|ium)\//.test(navigator.userAgent) && CSS.supports('backdrop-filter', 'url(#a)')

// How far a ray moves sideways, by its distance from the edge (0 at the edge, 1 where the bezel ends),
// for a bezel shaped like a squircle's shoulder: steep at the edge, flat where it meets the top.
const N = 256
const BEND = (() => {
  const p = new Float32Array(N)
  let max = 0
  for (let i = 0; i < N; i++) {
    const u = 1 - (i + 0.5) / N
    const f = Math.pow(1 - u ** 4, 0.25), slope = Math.pow(1 - u ** 4, -0.75) * u ** 3
    const a = Math.atan(slope), b = Math.asin(Math.sin(a) / 1.5)
    p[i] = (f + 0.5) * Math.tan(a - b)
    if (p[i] > max) max = p[i]
  }
  for (let i = 0; i < N; i++) p[i] /= max
  return p
})()

function map(w: number, h: number, r: number, bezel: number) {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const cx = c.getContext('2d')!, img = cx.createImageData(w, h), d = img.data
  const hw = w / 2, hh = h / 2
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const px = i + 0.5 - hw, py = j + 0.5 - hh
    const qx = Math.abs(px) - (hw - r), qy = Math.abs(py) - (hh - r)
    let dist: number, nx: number, ny: number
    if (qx > 0 && qy > 0) { const l = Math.hypot(qx, qy); dist = r - l; nx = (qx / l) * Math.sign(px); ny = (qy / l) * Math.sign(py) }
    else if (qx > qy) { dist = hw - Math.abs(px); nx = Math.sign(px); ny = 0 }
    else { dist = hh - Math.abs(py); nx = 0; ny = Math.sign(py) }
    // A convex rim shows what lies further in, so every sample is taken toward the middle.
    const m = dist >= 0 && dist < bezel ? BEND[Math.min(N - 1, Math.floor((dist / bezel) * N))] : 0
    const o = (j * w + i) * 4
    d[o] = 128 - nx * m * 127; d[o + 1] = 128 - ny * m * 127; d[o + 2] = 128; d[o + 3] = 255
  }
  cx.putImageData(img, 0, 0)
  return c.toDataURL()
}

const NS = 'http://www.w3.org/2000/svg'
let defs: SVGSVGElement | null = null
let uid = 0

/** Give an element's glass a refracting rim. `bezel`: its width in px; `scale`: the most a ray moves. */
export function refract(el: HTMLElement, { bezel = 14, scale = 22 } = {}) {
  if (!LIVE) return
  if (!defs) {
    defs = document.createElementNS(NS, 'svg')
    defs.setAttribute('aria-hidden', 'true')
    defs.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden'
    document.body.append(defs)
  }
  const id = `gl-${++uid}`
  const f = document.createElementNS(NS, 'filter')
  f.id = id
  f.setAttribute('filterUnits', 'userSpaceOnUse'); f.setAttribute('primitiveUnits', 'userSpaceOnUse')
  f.setAttribute('color-interpolation-filters', 'sRGB'); f.setAttribute('x', '0'); f.setAttribute('y', '0')
  const im = document.createElementNS(NS, 'feImage'), dm = document.createElementNS(NS, 'feDisplacementMap')
  im.setAttribute('x', '0'); im.setAttribute('y', '0'); im.setAttribute('preserveAspectRatio', 'none'); im.setAttribute('result', 'm')
  dm.setAttribute('in', 'SourceGraphic'); dm.setAttribute('in2', 'm'); dm.setAttribute('xChannelSelector', 'R'); dm.setAttribute('yChannelSelector', 'G')
  f.append(im, dm); defs.append(f)
  let key = ''
  const build = () => {
    const w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight)
    if (!w || !h || w * h > 1.2e6) return
    const r = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, w / 2, h / 2)
    const b = Math.min(bezel, w / 2, h / 2)
    if (key === (key = `${w},${h},${r}`)) return
    for (const n of [f, im]) { n.setAttribute('width', String(w)); n.setAttribute('height', String(h)) }
    im.setAttribute('href', map(w, h, r, b))
    dm.setAttribute('scale', String(Math.min(scale, b * 2)))
    el.style.setProperty('--gl-lens', `url(#${id})`)
  }
  new ResizeObserver(build).observe(el)
  build()
}
