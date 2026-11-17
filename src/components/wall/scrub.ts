// The Work wall's frames (Scrub.astro): a card holds a .fr of stacked images and a .rule of segments.
// Frames after the first carry data-srcset and load only when primed, at the card's size.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const imgs = (g: Element) => [...g.querySelectorAll<HTMLImageElement>('.fr img')]

// Priming also fetches the cover file the case page's hero stands on while its own loads (img.ts,
// standIn), so the hero grows from the card with a picture in it: 640 at 1x, 1000 at 2x.
export const prime = (g: Element) => {
  const pre = (g as HTMLElement).dataset.pre?.split(' ')
  if (pre) { new Image().src = pre[devicePixelRatio > 1 ? 1 : 0]; delete (g as HTMLElement).dataset.pre }
  const w = Math.round(g.querySelector('.fr')!.clientWidth) || innerWidth
  g.querySelectorAll<HTMLImageElement>('img[data-srcset]').forEach((im) => { im.sizes = w + 'px'; im.srcset = im.dataset.srcset!; delete im.dataset.srcset })
}
const at = (g: HTMLElement) => +(g.dataset.i ?? 0)

// A frame shows once its file has loaded; until then the one before stays.
const show = (g: HTMLElement, i: number) => {
  const ims = imgs(g)
  i = Math.max(0, Math.min(ims.length - 1, i))
  g.dataset.i = String(i)
  g.querySelectorAll('.rule i').forEach((s, k) => s.classList.toggle('on', k === i))
  const im = ims[i], go = () => { if (at(g) === i) ims.forEach((x) => { x.classList.toggle('on', x === im); x.toggleAttribute('aria-hidden', x !== im) }) }
  im.complete && im.naturalWidth ? go() : im.addEventListener('load', go, { once: true })
}

export function wire(root: HTMLElement) {
  let sx = 0, moved = false
  const find = (e: Event) => {
    const a = (e.target as Element).closest?.<HTMLElement>('a[data-slug]')
    return a && root.contains(a) ? a : null
  }
  root.addEventListener('pointerdown', (e) => { sx = e.clientX; moved = false })
  root.addEventListener('pointerover', (e) => { const g = find(e); if (g) prime(g) })
  root.addEventListener('focusin', (e) => { const g = find(e); if (g) prime(g) })
  root.addEventListener('pointermove', (e) => {
    const g = find(e)
    if (!g) return
    const n = imgs(g).length
    if (e.pointerType === 'mouse') {
      if (reduce) return
      const r = g.getBoundingClientRect()
      const i = Math.floor(((e.clientX - r.left) / r.width) * n)
      if (i !== at(g)) show(g, i)
    } else if (e.buttons || e.pointerType === 'touch') {
      // A swipe steps a frame for each 48 px; the page still scrolls up and down (touch-action: pan-y).
      const dx = e.clientX - sx
      if (Math.abs(dx) > 48) { show(g, at(g) - Math.sign(dx)); sx = e.clientX; moved = true }
    }
  })
  root.addEventListener('pointerout', (e) => {
    const g = find(e)
    if (g && e.pointerType === 'mouse' && !g.contains(e.relatedTarget as Node)) show(g, 0)
  })
  root.addEventListener('keydown', (e) => {
    const g = find(e), d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!g || !d) return
    e.preventDefault()
    prime(g); show(g, at(g) + d)
  })
  root.addEventListener('click', (e) => {
    const g = find(e)
    if (!g) return
    if (moved) { e.preventDefault(); moved = false; return }
    // Opening: back to the first frame at once. Its box is the one the case page's hero grows from,
    // and no other frame is left behind in the page's fading snapshot.
    g.classList.add('snap'); show(g, 0)
  })
}
