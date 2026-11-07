// N16: Thomas's Claude Code tokens and GitHub contributions, counts only. The build reads the public
// raw URL of the gist that a launchd job on his Mac rewrites every 3 hours (TAKD2/usage-feed). That
// gist already carries the GitHub calendar, so Cloudflare's build needs no token. If the gist cannot
// be reached, the build uses src/data/usage.json, a trimmed copy committed with the code.
// ponytail: the snapshot is refreshed by hand; it only matters on a build with no network.
import snapshot from '../data/usage.json'

export const FEED = 'https://gist.githubusercontent.com/Takramer/4606f2fd132eb4c9cbcf94319fa5b567/raw/usage.json'
// The feed stops while the Mac sleeps; past this age the page asks the gist again.
export const STALE = 4 * 3600e3
const TZ = 'America/New_York'
const WEEKS = 53

export type Usage = {
  generatedAt: string
  since: string
  tokens: number
  claude: Record<string, [tokens: number, messages: number]>
  contributions: number
  github: Record<string, number>
}

const ISO = /^\d{4}-\d\d-\d\d$/
const n = (v: unknown) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : 0)

// The gist's shape in, counts out: no model names, sessions or other detail leave this function.
export function trim(raw: any): Usage | null {
  const c = raw?.claude
  const g = raw?.github
  const tokens = n(c?.ranges?.all?.tokens)
  if (!tokens || !Array.isArray(c.days) || !Date.parse(raw.generatedAt)) return null
  const rows = (a: any) => (Array.isArray(a) ? a.filter((r) => ISO.test(r?.d)) : [])
  return {
    generatedAt: String(raw.generatedAt),
    since: ISO.test(c.since) ? c.since : '',
    tokens,
    claude: Object.fromEntries(rows(c.days).map((r) => [r.d, [n(r.t), n(r.m)]])),
    contributions: n(g?.total),
    github: Object.fromEntries(rows(g?.days).map((r) => [r.d, n(r.c)])),
  }
}

let cached: Promise<Usage> | undefined
// One request per build, shared by every page that shows the panel.
export function load(): Promise<Usage> {
  return (cached ??= fetch(FEED, { signal: AbortSignal.timeout(8000) })
    .then((r) => (r.ok ? r.json() : null))
    .then((j) => trim(j) ?? (snapshot as Usage))
    .catch(() => snapshot as Usage))
}

// Dates as ISO strings; arithmetic at noon UTC so no time zone can shift a day.
const at = (iso: string) => new Date(`${iso}T12:00:00Z`)
export const add = (iso: string, d: number) => new Date(at(iso).getTime() + d * 864e5).toISOString().slice(0, 10)
export const etDay = (t: number) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(t)
const long = (iso: string, year = false) => at(iso).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', ...(year && { year: 'numeric' }) })
const short = (iso: string) => at(iso).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short' })
const int = (v: number) => v.toLocaleString('en-US')
const spoken = (v: number) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'long', maximumSignificantDigits: 3 }).format(v)

// The trailing 53 weeks, Sunday to Saturday, as one run of 371 days; the last week holds today
// (its later days stay blank). A month's mark sits on the day that is its 1st.
export function days(today: string) {
  const start = add(today, -at(today).getUTCDay() - 7 * (WEEKS - 1))
  const all = Array.from({ length: WEEKS * 7 }, (_, i) => add(start, i))
  const months = all.flatMap((d, i) => (d.endsWith('-01') ? [{ col: i + 1, name: short(d) }] : []))
  return { start, all, months }
}

// A square's side, 0 to 1: the square root of the day's share of the busiest day, so a quiet day
// still shows beside a 676-million-token one.
const root = (max: number) => (v: number) => (v > 0 && max > 0 ? Math.max(0.04, Math.round(Math.sqrt(v / max) * 100) / 100) : 0)

const busiest = (rows: [string, number][]) => rows.reduce<[string, number] | null>((b, r) => (!b || r[1] > b[1] ? r : b), null)

export function view(u: Usage, today = etDay(Date.parse(u.generatedAt))) {
  const claudeDays = Object.keys(u.claude).sort()
  const ghDays = Object.keys(u.github).sort()
  const since = u.since || claudeDays[0] || today
  const cl = root(Math.max(0, ...Object.values(u.claude).map((d) => d[0])))
  const gh = root(Math.max(0, ...Object.values(u.github)))
  const active = claudeDays.filter((d) => u.claude[d][0] + u.claude[d][1] > 0)
  const cPeak = busiest(claudeDays.map((d) => [d, u.claude[d][0]]))
  const gPeak = busiest(ghDays.map((d) => [d, u.github[d]]))
  const when = new Date(u.generatedAt)
  return {
    today,
    total: int(u.tokens),
    since: long(since, true),
    updated: `Updated ${when.toLocaleString('en-US', { timeZone: TZ, dateStyle: 'long', timeStyle: 'short' }).replace(' at ', ', ')} ET`,
    claudeSummary:
      `Thomas used Claude Code on ${active.length} days since ${long(since, true)}.` + (cPeak?.[1] ? ` On his busiest day, ${long(cPeak[0])}, he used ${spoken(cPeak[1])} tokens.` : ''),
    githubSummary:
      `Thomas made ${int(u.contributions)} contributions on GitHub in the last year` + (gPeak?.[1] ? `, ${int(gPeak[1])} of them on ${long(gPeak[0])}, his busiest day.` : '.'),
    // Tick lengths; null is a day the feed does not cover (before it starts, or still to come). A day
    // with messages but no token count (gaps in Claude Code's own stats) still gets a stub.
    claude: (d: string): number | null => (d > today || d < since ? null : u.claude[d] ? cl(u.claude[d][0]) || (u.claude[d][1] ? 0.04 : 0) : 0),
    github: (d: string): number | null => (d > today || d < (ghDays[0] ?? today) ? null : gh(u.github[d] ?? 0)),
    // The table under the charts: each month in the window, newest first, with both counts.
    months: (all: string[]) =>
      [...new Set(all.filter((d) => d <= today).map((d) => d.slice(0, 7)))].reverse().map((m) => {
        const tok = claudeDays.reduce((t, d) => (d.startsWith(m) ? t + u.claude[d][0] : t), 0)
        const con = ghDays.reduce((t, d) => (d.startsWith(m) ? t + u.github[d] : t), 0)
        const name = at(`${m}-01`).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', year: 'numeric' })
        return [name, m < since.slice(0, 7) ? 'Not tracked' : int(tok), int(con)]
      }),
  }
}
