// Self-check for functions/api/wx.js, no network: node scripts/wx-check.mjs
// The first sample is KCLT's real latest observation, fetched 11 November 2026 at 18:20 UTC and cut
// to the fields the function reads; the rest are edits of it.
import assert from 'node:assert/strict'
import { map, onRequest } from '../functions/api/wx.js'

const AT = '2026-11-11T18:20:00+00:00', NOW = Date.parse(AT) + 6e5
const KCLT = { properties: {
  timestamp: AT, textDescription: 'Clear', presentWeather: [],
  temperature: { unitCode: 'wmoUnit:degC', value: 22 },
  windDirection: { unitCode: 'wmoUnit:degree_(angle)', value: 230 },
  windSpeed: { unitCode: 'wmoUnit:km_h-1', value: 9.252 }, windGust: { unitCode: 'wmoUnit:km_h-1', value: null },
  cloudLayers: [{ base: { unitCode: 'wmoUnit:m', value: 3810 }, amount: 'CLR' }],
} }
const edit = (p) => ({ properties: { ...KCLT.properties, ...p } })

assert.deepEqual(map(KCLT, NOW), { wx: 'clear', tempF: 72, windDeg: 230, windMph: 5.7, cloud: 0, at: '2026-11-11T18:20:00.000Z' })
assert.equal(map(edit({ textDescription: 'Light Rain', presentWeather: [{ weather: 'rain', rawString: '-RA' }] }), NOW).wx, 'rain')
assert.equal(map(edit({ textDescription: 'Thunderstorms and Rain', presentWeather: [{ weather: 'thunderstorms', rawString: 'TSRA' }] }), NOW).wx, 'storm')
assert.equal(map(edit({ textDescription: 'Light Snow' }), NOW).wx, 'snow')
assert.equal(map(edit({ textDescription: 'Fog/Mist' }), NOW).wx, 'fog')
assert.equal(map(edit({ textDescription: 'Mostly Cloudy', cloudLayers: [{ amount: 'FEW' }, { amount: 'BKN' }] }), NOW).cloud, 0.75)
assert.equal(map(edit({ textDescription: 'Cloudy', cloudLayers: [{ amount: 'OVC' }] }), NOW).wx, 'cloudy')
assert.equal(map(edit({ textDescription: 'Partly Cloudy', cloudLayers: [{ amount: 'SCT' }] }), NOW).wx, 'clear')
const w = map(edit({ windSpeed: { unitCode: 'wmoUnit:m_s-1', value: 12 } }), NOW)
assert.equal(w.windMph, 26.8); assert.equal(w.wx, 'wind')
assert.equal(map(edit({ temperature: { unitCode: 'wmoUnit:degC', value: null }, windDirection: { value: null } }), NOW).tempF, null)
assert.equal(map(KCLT, Date.parse(AT) + 4 * 36e5), null, 'a reading over 3 hours old is not now')
assert.equal(map({}, NOW), null); assert.equal(map(null, NOW), null)

// The handler, with a fake edge cache and a fake NWS.
const store = new Map()
globalThis.caches = { default: { match: async (r) => store.get(r.url)?.clone(), put: async (r, res) => void store.set(r.url, res) } }
const pending = []
const ctx = (method = 'GET', url = 'https://www.takramerdesigns.com/api/wx?x=1') => ({ request: new Request(url, { method }), waitUntil: (p) => pending.push(p) })
const live = { ...KCLT.properties, timestamp: new Date().toISOString() }
let calls = 0, up = true, sentUA = ''
globalThis.fetch = async (u, o) => { calls++; sentUA = o.headers['User-Agent']; if (!up) throw new Error('down'); return new Response(JSON.stringify({ properties: live })) }

assert.equal((await onRequest(ctx('POST'))).status, 405)
let r = await onRequest(ctx())
assert.equal(r.status, 200); assert.equal(r.headers.get('Cache-Control'), 'public, max-age=1200'); assert.equal(r.headers.get('Set-Cookie'), null)
assert.equal((await r.json()).wx, 'clear')
assert.match(sentUA, /^takramerdesigns\.com weather \(https:\/\/www\.takramerdesigns\.com\/contact\)$/)
await Promise.all(pending)
r = await onRequest(ctx('GET', 'https://www.takramerdesigns.com/api/wx?other'))
assert.equal(r.status, 200); assert.equal(calls, 1, 'second call, any query string, comes from the cache')
store.delete('https://www.takramerdesigns.com/api/wx'); up = false
r = await onRequest(ctx())
assert.equal(r.status, 200); assert.equal(r.headers.get('Cache-Control'), 'public, max-age=300'); assert.equal((await r.json()).tempF, 72)
store.clear()
assert.equal((await onRequest(ctx())).status, 204)
console.log('wx-check: 26 assertions passed')
