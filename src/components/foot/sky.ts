// The footer's one source of state, for the gradient (Flow.astro) and the Charlotte block (Now.astro).
// Time, sun and moon are worked out from the current instant and Charlotte's fixed place; the weather
// comes only from this site's own /api/wx (functions/api/wx.js), which reads the airport's latest
// observation server-side. Nothing about the visitor is read or sent: no location, no time zone, no
// locale, no request to anyone but this origin.
// On the review page (/lab-foot) only, the address can pin the state: ?hour=0..23.99 (Charlotte's
// wall time today), ?phase=0..1 (the moon), ?wx=clear|cloudy|rain|storm|snow|fog|wind (a mock reading).
export type Kind = 'clear' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'fog' | 'wind'
export type Wx = { wx: Kind; tempF: number | null; windDeg: number | null; windMph: number | null; cloud: number; at: string }

const lab = document.documentElement.dataset.page === 'lab'
const q = new URLSearchParams(lab ? location.search : '')
const num = (k: string, lo: number, hi: number) => { const v = q.get(k); return v !== null && v !== '' && +v >= lo && +v <= hi ? +v : null }
const KINDS: Kind[] = ['clear', 'cloudy', 'rain', 'storm', 'snow', 'fog', 'wind']

// The lab's mock readings: a plausible November day for each condition. windDeg is where it blows from.
const MOCK: Record<Kind, [number, number, number, number]> = {
  clear: [61, 230, 5, 0.05], cloudy: [54, 200, 7, 0.85], rain: [50, 210, 11, 0.95], storm: [66, 250, 21, 1],
  snow: [30, 340, 6, 0.9], fog: [45, 90, 2, 0.7], wind: [55, 290, 26, 0.3],
}

// The reading, fetched once per page view at most and only when asked (the footer nearing view).
// Any failure, a 204 (no reading), or a dev server with no function: null, and the footer shows time,
// sun and moon alone.
let got: Promise<Wx | null> | undefined
export function weather(): Promise<Wx | null> {
  const k = q.get('wx') as Kind
  if (KINDS.includes(k)) { const [tempF, windDeg, windMph, cloud] = MOCK[k]; return Promise.resolve({ wx: k, tempF, windDeg, windMph, cloud, at: new Date().toISOString() }) }
  return (got ??= fetch('/api/wx', { signal: AbortSignal.timeout(4000), credentials: 'omit' })
    .then((r) => (r.status === 200 ? r.json() : null))
    .then((w) => (w && KINDS.includes(w.wx) && typeof w.cloud === 'number' ? (w as Wx) : null))
    .catch(() => null))
}

const R = Math.PI / 180, S = Math.sin, C = Math.cos
const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
const wall = (t: number) => { const [h, m] = fmt.format(t).split(':'); return +h + +m / 60 }
// The sun's elevation over Charlotte and its hour angle, from the Astronomical Almanac's low-precision
// sums (good to about a degree; ported from the cut city footer).
const sunAt = (ms: number) => {
  const d = ms / 864e5 - 10957.5, g = (357.529 + 0.9856 * d) * R
  const L = (280.459 + 0.98565 * d + 1.915 * S(g) + 0.02 * S(2 * g)) * R, ob = 23.439 * R
  const dec = Math.asin(S(ob) * S(L)), ra = Math.atan2(C(ob) * S(L), C(L))
  const H = (280.46 + 360.985647 * d - 80.843) * R - ra, la = 35.227 * R
  return [Math.asin(S(la) * S(dec) + C(la) * C(dec) * C(H)) / R, S(H)]
}

export type Sky = { t: number; sun: number; pm: boolean; phase: number; lit: number }
// One instant: the sun's height in degrees, whether it is past noon (sin H > 0: west of the meridian),
// the moon's phase (0 new, 0.5 full) from the synodic month, and its lit fraction.
export function sky(): Sky {
  const now = Date.now(), H = num('hour', 0, 23.999)
  const t = H === null ? now : now + (H - wall(now)) * 36e5
  const phase = num('phase', 0, 1) ?? ((((t - 947182440000) / 2551442877) % 1) + 1) % 1 // new moon 2000-01-06 18:14 UTC
  const [sun, h] = sunAt(t)
  return { t, sun, pm: h > 0, phase, lit: (1 - C(2 * Math.PI * phase)) / 2 }
}

// Point the footer's sun clock at the pinned moment, so the map agrees with ?hour=.
export const pin = (s: Sky) => { if (num('hour', 0, 23.999) !== null) document.querySelectorAll<HTMLElement>('.fa .sunclock').forEach((el) => (el.dataset.at = new Date(s.t).toISOString())) }

// Plain words for a reading.
export const say = (w: Wx) => ({
  name: { clear: 'Clear', cloudy: 'Cloudy', rain: 'Rain', storm: 'Storm', snow: 'Snow', fog: 'Fog', wind: 'Windy' }[w.wx],
  temp: w.tempF == null ? '' : `${Math.round(w.tempF)}°F`,
  wind: w.windMph == null || w.windDeg == null ? '' : `wind ${['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(w.windDeg / 45) % 8]} ${Math.round(w.windMph)} mph`,
})
export const moonName = (p: number) => p < 0.03 || p > 0.97 ? 'New moon' : p < 0.22 ? 'Waxing crescent' : p < 0.28 ? 'First quarter' : p < 0.47 ? 'Waxing gibbous' : p < 0.53 ? 'Full moon' : p < 0.72 ? 'Waning gibbous' : p < 0.78 ? 'Last quarter' : 'Waning crescent'

// Run frame(t) about 30 times a second while el is in view and the tab is showing. Under reduced
// motion frame runs once, for a still.
export const still = matchMedia('(prefers-reduced-motion: reduce)').matches
export function loop(el: Element, frame: (t: number) => void) {
  let raf = 0, last = 0, seen = false
  const go = (t: number) => { raf = requestAnimationFrame(go); if (t - last >= 32) frame((last = t)) }
  const run = () => {
    const on = seen && !document.hidden && !still
    if (on && !raf) raf = requestAnimationFrame(go)
    else if (!on && raf) { cancelAnimationFrame(raf); raf = 0 }
  }
  new IntersectionObserver(([e]) => { seen = e.isIntersecting; run() }).observe(el)
  document.addEventListener('visibilitychange', run)
  frame(performance.now())
}

// Call fn once, when el comes within 800 px of the window.
export const near = (el: Element, fn: () => void) => {
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); fn() } }, { rootMargin: '800px 0px' })
  io.observe(el)
}
