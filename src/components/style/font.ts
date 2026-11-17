// Reads a WOFF2 file at build time: its vertical metrics and the characters it maps, so the style
// guide prints what the font files say, not what someone typed. Only the untransformed tables are read
// (head, hhea, OS/2, cmap); glyf and loca are skipped, so no glyph is decoded.
import { readFileSync } from 'node:fs'
import { brotliDecompressSync } from 'node:zlib'

const TAGS = ['cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm', 'glyf', 'loca', 'prep', 'CFF ', 'VORG', 'EBDT', 'EBLC', 'gasp', 'hdmx', 'kern', 'LTSH', 'PCLT', 'VDMX', 'vhea', 'vmtx', 'BASE', 'GDEF', 'GPOS', 'GSUB', 'EBSC', 'JSTF', 'MATH', 'CBDT', 'CBLC', 'COLR', 'CPAL', 'SVG ', 'sbix', 'acnt', 'avar', 'bdat', 'bloc', 'bsln', 'cvar', 'fdsc', 'feat', 'fmtx', 'fvar', 'gvar', 'hsty', 'just', 'lcar', 'mort', 'morx', 'opbd', 'prop', 'trak', 'Zapf', 'Silf', 'Glat', 'Gloc', 'Feat', 'Sill']

export type Metrics = { upm: number; xHeight: number; capHeight: number; ascender: number; descender: number; chars: number[] }

export function readFont(file: string): Metrics {
  const b = readFileSync(new URL(`../../../public/fonts/${file}`, import.meta.url))
  if (b.toString('latin1', 0, 4) !== 'wOF2') throw new Error(`${file} is not WOFF2`)
  const n = b.readUInt16BE(12), compressed = b.readUInt32BE(20)
  let p = 48
  const base128 = () => { let v = 0; for (let i = 0; i < 5; i++) { const c = b[p++]; v = v * 128 + (c & 127); if (!(c & 128)) return v } return v }
  const dir: { tag: string; len: number }[] = []
  for (let i = 0; i < n; i++) {
    const flags = b[p++], k = flags & 63
    const tag = k === 63 ? b.toString('latin1', p, (p += 4)) : TAGS[k]
    const orig = base128(), version = flags >> 6
    // glyf and loca are transformed unless version 3; every other table is transformed only if version is not 0.
    const transformed = tag === 'glyf' || tag === 'loca' ? version !== 3 : version !== 0
    dir.push({ tag, len: transformed ? base128() : orig })
  }
  const data = brotliDecompressSync(b.subarray(p, p + compressed))
  const t: Record<string, Buffer> = {}
  let o = 0
  for (const d of dir) { t[d.tag] = data.subarray(o, o + d.len); o += d.len }
  const os2 = t['OS/2']
  return {
    upm: t.head.readUInt16BE(18),
    ascender: os2.readInt16BE(68), descender: os2.readInt16BE(70),
    xHeight: os2.readUInt16BE(0) >= 2 ? os2.readInt16BE(86) : 0,
    capHeight: os2.readUInt16BE(0) >= 2 ? os2.readInt16BE(88) : 0,
    chars: cmap(t.cmap),
  }
}

// The characters a font maps, from its Unicode cmap subtable (format 4 or 12).
function cmap(c: Buffer): number[] {
  const n = c.readUInt16BE(2)
  const out = new Set<number>()
  for (let i = 0; i < n; i++) {
    const off = c.readUInt32BE(4 + i * 8 + 4), f = c.readUInt16BE(off)
    if (f === 4) {
      const segs = c.readUInt16BE(off + 6) / 2, ends = off + 14, starts = ends + segs * 2 + 2, deltas = starts + segs * 2, ranges = deltas + segs * 2
      for (let s = 0; s < segs; s++) {
        const end = c.readUInt16BE(ends + s * 2), start = c.readUInt16BE(starts + s * 2)
        const delta = c.readInt16BE(deltas + s * 2), ro = c.readUInt16BE(ranges + s * 2)
        for (let ch = start; ch <= end && ch !== 0xffff; ch++) {
          const g = ro ? c.readUInt16BE(ranges + s * 2 + ro + (ch - start) * 2) : (ch + delta) & 0xffff
          if (g) out.add(ch)
        }
      }
    } else if (f === 12) {
      const groups = c.readUInt32BE(off + 12)
      for (let g = 0; g < groups; g++) { const s = c.readUInt32BE(off + 16 + g * 12), e = c.readUInt32BE(off + 20 + g * 12); for (let ch = s; ch <= e; ch++) out.add(ch) }
    }
  }
  return [...out].sort((a, b) => a - b)
}
