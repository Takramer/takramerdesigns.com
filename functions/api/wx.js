// GET /api/wx: Charlotte's weather now, for the footer's gradient and its "Charlotte now" line.
// A Cloudflare Pages Function. It reads the latest observation from Charlotte Douglas airport (KCLT)
// on the National Weather Service API, keeps six fields, and caches the answer at the edge for
// 20 minutes, so a busy day costs NWS about 72 requests per edge location. It reads nothing from the
// caller (no IP, no headers, no cookies), sets no cookie and logs nothing.
//
// NWS terms (https://www.weather.gov/documentation/services-web-api):
//   "All of the information presented via the API is intended to be open data, free to use for
//   any purpose."
//   "A User Agent is required to identify your application. This string can be anything, and the
//   more unique to your application the less likely it will be affected by a security event. If you
//   include contact information (website or email), we can contact you if your string is associated
//   to a security event."
// So the User-Agent names the site and its contact page, not an email address.
//
// Answers: 200 { wx, tempF, windDeg, windMph, cloud, at } (Fahrenheit and mph only, 11 November); 204 when NWS fails and no reading from the
// last three hours is cached; 405 for anything but GET. Checked by scripts/wx-check.mjs.
// ponytail: caches.default only stores on a custom domain; on *.pages.dev every call reaches NWS.

const SRC = 'https://api.weather.gov/stations/KCLT/observations/latest'
const UA = 'takramerdesigns.com weather (https://www.takramerdesigns.com/contact)'
const FRESH = 1200 // 20 minutes
const LAST = 10800 // a reading older than 3 hours is no longer "now"

const COVER = { SKC: 0, CLR: 0, FEW: 0.2, SCT: 0.45, BKN: 0.75, OVC: 1, VV: 1 }
const kph = (q) => q && typeof q.value === 'number' ? (q.unitCode?.endsWith('m_s-1') ? q.value * 3.6 : q.value) : null
const r1 = (v) => v === null ? null : Math.round(v * 10) / 10

// An NWS observation (GeoJSON) to the footer's six fields, or null when it is unusable.
export function map(o, now = Date.now()) {
  const p = o?.properties
  if (!p || !p.timestamp || now - Date.parse(p.timestamp) > LAST * 1000) return null
  const cloud = Math.max(0, ...(p.cloudLayers ?? []).map((l) => COVER[l.amount] ?? 0))
  const wind = kph(p.windSpeed), gust = kph(p.windGust)
  const said = [p.textDescription, ...(p.presentWeather ?? []).map((w) => `${w.weather ?? ''} ${w.rawString ?? ''}`)].join(' ').toLowerCase()
  const wx = /thunder|\bts/.test(said) ? 'storm'
    : /snow|sleet|ice pellets|graupel/.test(said) ? 'snow'
    : /rain|drizzle|shower/.test(said) ? 'rain'
    : /fog|mist|haze|smoke/.test(said) ? 'fog'
    : (wind ?? 0) >= 40 || (gust ?? 0) >= 55 ? 'wind'
    : cloud >= 0.7 || /overcast|mostly cloudy/.test(said) ? 'cloudy'
    : 'clear'
  const t = p.temperature
  return {
    wx,
    tempF: t && typeof t.value === 'number' ? Math.round(t.unitCode?.endsWith('degF') ? t.value : t.value * 1.8 + 32) : null,
    windDeg: typeof p.windDirection?.value === 'number' ? Math.round(p.windDirection.value) : null,
    windMph: wind === null ? null : r1(wind / 1.609344),
    cloud,
    at: new Date(p.timestamp).toISOString(),
  }
}

const json = (body, age) => new Response(JSON.stringify(body), {
  headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${age}` },
})

export async function onRequest({ request, waitUntil }) {
  if (request.method !== 'GET') return new Response(null, { status: 405, headers: { Allow: 'GET' } })
  const cache = caches.default, origin = new URL(request.url).origin
  // Fixed keys, so a query string can neither miss the cache nor fill it.
  const key = new Request(`${origin}/api/wx`), last = new Request(`${origin}/api/wx/last`)
  const hit = await cache.match(key)
  if (hit) return hit
  let wx = null
  try {
    const r = await fetch(SRC, { headers: { 'User-Agent': UA, Accept: 'application/geo+json' }, signal: AbortSignal.timeout(5000) })
    if (r.ok) wx = map(await r.json())
  } catch { /* NWS down or slow: fall through to the last good reading */ }
  if (wx) {
    const res = json(wx, FRESH)
    waitUntil(Promise.all([cache.put(key, res.clone()), cache.put(last, json(wx, LAST))]))
    return res
  }
  const prev = await (await cache.match(last))?.json()
  if (prev && Date.now() - Date.parse(prev.at) <= LAST * 1000) return json(prev, 300)
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } })
}
