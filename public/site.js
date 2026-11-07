// takramerdesigns.com, v3. Ported from redesign-v3/lab/lab.js, where each number was measured
// (research/20). A classic script in <head>, so pageswap and pagereveal are heard before the first
// render; page work waits for the DOM.
(() => {
  const html = document.documentElement
  const kind = html.dataset.kind
  // Motion follows the system setting alone (Thomas, 5 November: no switch on the site). html.still
  // carries it to the CSS.
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  // I13: About's reading size, kept for the visit and set before the first frame.
  const rs0 = (() => { try { return +sessionStorage.getItem('rs') || 100 } catch { return 100 } })()
  if (html.dataset.page === 'about' && rs0 !== 100) html.style.fontSize = `${rs0}%`
  const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
  // The token in ms. The build's minifier writes 300ms as .3s, and parseFloat alone read that as
  // 0.3 ms, so every flight timed from it ended at once on the live site (found 6 November).
  const vtMs = () => { const v = getComputedStyle(html).getPropertyValue('--vt').trim(); return parseFloat(v) * (v.endsWith('ms') ? 1 : 1000) || 300 }
  html.classList.add('js') // a set on /one-offs folds to one tile only when the viewer can open it
  html.classList.toggle('still', reduce)
  if (!reduce) html.classList.add('motion')
  if (html.dataset.page === 'home' && !reduce) html.classList.add('intro')
  // The wall's filter rides in the URL (?f=brand) and is set before the first frame (07 5.3).
  const f0 = new URLSearchParams(location.search).get('f')
  if (html.dataset.page === 'projects' && ['brand', 'product', 'engineering'].includes(f0)) html.dataset.filter = f0
  const ready = (fn) => (document.readyState === 'loading' ? addEventListener('DOMContentLoaded', fn, { once: true }) : fn())

  console.log('%cLooking under the hood?\n%cThomas Kramer is open to brand design, product design and design engineering roles. Reach him at takramerdesigns@gmail.com. May the Force be with you.', 'font: 600 14px/1.6 sans-serif', 'font: 13px/1.6 sans-serif')

  // ---- N14: every link and button press, counted within the visit -----------------------------------
  // Umami (Base.astro) counts page views; this names each press by where it sits and what it says, so
  // no element needs its own tag. Umami keeps no cookie and no ID, so nothing joins two visits. Without
  // the script (script off, or blocked) window.umami is missing and this does nothing.
  document.addEventListener('click', (e) => {
    const el = e.target.closest?.('a[href], button')
    if (!el || !window.umami) return
    const where = el.closest('.bar') ? 'Menu' : el.closest('footer') ? 'Footer' : el.tagName === 'A' ? 'Link' : 'Button'
    const what = (el.dataset.ev || el.getAttribute('aria-label') || el.textContent).replace(/\s*\(opens[^)]*\)/, '').replace(/\s+/g, ' ').trim() || el.getAttribute('href') || '?'
    const to = el.tagName === 'A' ? el.getAttribute('href') : undefined
    window.umami.track(`${where}: ${what}`.slice(0, 50), { from: location.pathname, ...(to && { to }) })
  }, { capture: true, passive: true })

  // ---- The grow between pages (07 4.2) ----------------------------------------------------------
  // Only the pressed card carries the shared names: its image and its name. A case page names its
  // hero and title in CSS.
  const named = new Set()
  const setName = (el, n) => { if (el) { el.style.viewTransitionName = n; named.add(el) } }
  const clearNames = () => { named.forEach((el) => (el.style.viewTransitionName = '')); named.clear() }
  // On screen and not faded out: a faded part would come back at full strength in the snapshot.
  const seen = (el) => {
    if (!el) return false
    const r = el.getBoundingClientRect()
    if (!r.width || r.bottom <= 0 || r.top >= innerHeight) return false
    let o = 1
    for (let x = el; x && x !== html; x = x.parentElement) o *= +getComputedStyle(x).opacity
    return o > 0.9
  }
  const slugOf = (u) => { try { return new URL(u, location.href).pathname.match(/^\/projects\/([\w-]+?)(?:\.html)?$/)?.[1] ?? null } catch { return null } }
  // The home index keeps its preview frames outside the rows, in their own sticky column.
  const imgOf = (a) => a.querySelector('img') ?? document.querySelector(`[data-pv="${a.dataset.slug}"] img`)
  const grow = (a) => {
    const img = imgOf(a)
    if (!seen(img)) return
    setName(img, 'tkd-img')
    const n = a.querySelector('.n')
    if (seen(n)) setName(n, 'tkd-title')
  }
  // A named part off screen would fly in from outside the window; it fades with the page instead.
  const dropUnseen = () => { for (const el of document.querySelectorAll('.point, .hero img, .title .t')) if (!seen(el)) setName(el, 'none') }

  let pressed = null, pressedAt = 0
  addEventListener('click', (e) => {
    const a = e.target.closest?.('a[data-vt]')
    if (a) { pressed = a; pressedAt = performance.now(); sessionStorage.setItem('tkd-vt', a.dataset.vt) }
  }, true)

  addEventListener('pageswap', (e) => {
    // Safari before 26.2 has no navigation.activation, so the case says where the reader left.
    if (kind === 'case') sessionStorage.setItem('tkd-from', location.pathname)
    else sessionStorage.removeItem('tkd-from')
    const a = pressed && performance.now() - pressedAt < 3000 ? pressed : null
    pressed = null
    if (!e.viewTransition) return
    const to = e.activation?.entry?.url
    if (a && (!to || slugOf(to) === slugOf(a.href))) grow(a)
    dropUnseen()
  })

  // A page restored by Back still carries the names its pageswap gave; they would collide with the
  // shrink's (InvalidStateError; research/20, section 11). It also comes back with the menu shut.
  let restored = false
  addEventListener('pageshow', (e) => {
    restored = e.persisted
    if (!e.persisted) return
    clearNames()
    menu(false)
  })

  // Arriving from a case: the card the reader opened takes the names, if it is in view, so the hero
  // shrinks back into its place.
  addEventListener('pagereveal', (e) => {
    const vt = e.viewTransition
    if (!vt) { if (!restored) { ready(intro); ready(assemble) } return }
    html.classList.add('grown') // the hero came from a card: no sheet
    html.classList.remove('intro') // arriving by a grow: the row is already in place
    const act = window.navigation?.activation
    const from = slugOf((act ? act.from?.url : sessionStorage.getItem('tkd-from')) ?? '')
    if (from) {
      const key = sessionStorage.getItem('tkd-vt')
      const a = (key?.endsWith(':' + from) && document.querySelector(`[data-vt="${key}"]`)) || [...document.querySelectorAll(`a[data-slug="${from}"]`)].find((x) => seen(imgOf(x)))
      if (a) grow(a)
    }
    dropUnseen()
    vt.finished.finally(clearNames)
  })
  if (!('onpagereveal' in window)) { // Firefox loads each page plainly
    ready(intro)
    // Its pages have no grow, so the sheet shows only when the reader comes from another site.
    if (document.referrer.startsWith(location.origin)) html.classList.add('grown')
    else ready(assemble)
  }

  // The back arrow is Back itself when the page before is on this site (the Navigation API lists
  // this site's entries only), so the browser restores that page with its scroll and the hero
  // shrinks home. Otherwise it follows its link to /projects (research/20, section 11).
  // The arrow on One-offs and Logos does the same, but only when the page before is the wall itself.
  addEventListener('click', (e) => {
    const a = e.target.closest?.('.back, .up')
    const i = window.navigation?.currentEntry?.index
    if (!a || !(i > 0) || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return
    if (a.classList.contains('up') && new URL(navigation.entries()[i - 1].url).pathname.replace(/\.html$/, '') !== a.pathname) return
    e.preventDefault(); history.back()
  })

  // ---- The phone menu, a disclosure (research/20, section 14) -------------------------------------
  // The button opens the nav as a sheet over the page, and everything else goes inert. The button,
  // Escape or a link closes it, and focus goes back to the button.
  const menu = (open) => {
    const b = document.querySelector('.bar .menu')
    if (!b || html.classList.contains('menu-open') === open) return
    b.setAttribute('aria-expanded', String(open))
    b.querySelector('.sr').textContent = open ? 'Close' : 'Menu'
    html.classList.toggle('menu-open', open)
    if (open) html.classList.remove('bar-away')
    for (const el of document.body.children) if (!el.classList.contains('bar')) el.inert = open
    if (!open && document.activeElement?.closest('#nav')) b.focus()
  }
  addEventListener('click', (e) => {
    if (e.target.closest?.('.bar .menu')) menu(!html.classList.contains('menu-open'))
    else if (e.target.closest?.('#nav a')) menu(false)
  })
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && html.classList.contains('menu-open')) { menu(false); document.querySelector('.bar .menu').focus() } })
  matchMedia('(min-width: 900px)').addEventListener('change', (m) => { if (m.matches) menu(false) })

  // ---- The footer clock: Charlotte's hour and minute, 24 hours (Thomas, 6 November) ----------------
  ready(() => {
    const p = document.querySelector('.foot .clock'), t = p?.querySelector('time')
    if (!t) return
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    const tick = () => { const d = new Date(); t.textContent = fmt.format(d); setTimeout(tick, 60000 - (d.getTime() % 60000)) }
    tick(); p.hidden = false
  })

  // ---- Work's sheet in the bar ---------------------------------------------------------------------
  // It opens on a hover or a focus. Escape shuts it until the pointer or the focus leaves (WCAG
  // 1.4.13), and a Tab into its links opens it again.
  ready(() => {
    const sub = document.querySelector('.bar .has-sub')
    if (!sub) return
    // Work is a button (Thomas, 6 November): a press opens or shuts the sheet, and aria-expanded follows
    // it. Under 900 px the sheet always shows inside the menu.
    const btn = sub.querySelector('.nav-l'), wide = matchMedia('(min-width: 900px)')
    const sync = () => requestAnimationFrame(() => btn.setAttribute('aria-expanded', String(!wide.matches || shown())))
    const shown = () => sub.matches(':hover, :focus-within, .linger, .open') && !sub.classList.contains('shut')
    btn.addEventListener('click', () => { if (!wide.matches) return; const o = sub.classList.contains('open'); sub.classList.toggle('shut', o); sub.classList.toggle('open', !o); sync() })
    addEventListener('pointerdown', (e) => { if (!sub.contains(e.target)) { sub.classList.remove('open'); sync() } })
    ;['pointerenter', 'pointerleave', 'focusin', 'focusout'].forEach((t) => sub.addEventListener(t, sync))
    wide.addEventListener('change', sync); sync()
    addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || html.classList.contains('menu-open') || !sub.matches(':hover, :focus-within')) return
      if (sub.contains(document.activeElement)) btn.focus()
      sub.classList.add('shut'); sub.classList.remove('open'); sync()
    })
    // Round 11: the sheet stays 200 ms after the pointer leaves, so an overshoot past its edge or a
    // diagonal path to a link does not drop it (the usual fixed-timer guard; Rippling's useSafeArea
    // write-up uses the same 200 ms). Coming back within that time keeps it open.
    let linger = 0
    sub.addEventListener('pointerenter', () => { clearTimeout(linger); sub.classList.remove('linger') })
    sub.addEventListener('pointerleave', (e) => {
      sub.classList.remove('shut')
      if (e.pointerType !== 'mouse') return
      sub.classList.remove('open')
      sub.classList.add('linger'); linger = setTimeout(() => { sub.classList.remove('linger'); sync() }, 200)
    })
    sub.addEventListener('focusin', (e) => { if (e.target.closest('.sub')) sub.classList.remove('shut') })
    sub.addEventListener('focusout', (e) => { if (!sub.contains(e.relatedTarget)) sub.classList.remove('shut', 'open') })
  })

  ready(() => {
    bar()
    uncover()
    footMark()
    clips()
    filters()
    cover()
    draw()
    marksDraw()
    proofs()
    glass()
  })

  // ---- The bar slides away on the way down and returns on the way up, 240 ms (07 5.8) -------------
  function bar() {
    const b = document.querySelector('.bar')
    if (!b) return
    let y0 = scrollY
    addEventListener('scroll', () => {
      const y = scrollY, d = y - y0
      if (Math.abs(d) < 8 && y > 64) return
      y0 = y
      html.classList.toggle('bar-away', d > 0 && y > 64 && !html.classList.contains('menu-open') && !b.contains(document.activeElement))
    }, { passive: true })
    b.addEventListener('focusin', () => html.classList.remove('bar-away')) // it never hides what has focus
  }

  // ---- Plates uncover once as they come into view, 600 ms (07 rule 3) ----------------------------
  // Each waits for its own image; one still loading a second after it came into view appears
  // without moving, as the cover's cards do (research/20, section 6). A covered image sits clipped
  // inside its frame, where the browser's own lazy loading never sees it, so the script starts each
  // load as the frame comes within 1200 px of the window.
  function uncover() {
    const els = document.querySelectorAll('.uncover:not(.in)')
    if (!els.length) return
    if (!html.classList.contains('motion') || !('IntersectionObserver' in window)) return els.forEach((el) => el.classList.add('in'))
    const near = new IntersectionObserver((entries) => {
      for (const en of entries) if (en.isIntersecting) { near.unobserve(en.target); const im = en.target.querySelector('img'); if (im) im.loading = 'eager' }
    }, { rootMargin: '1200px 0px' })
    els.forEach((el) => near.observe(el))
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue
        const el = en.target, im = el.querySelector('img'), t0 = performance.now()
        io.unobserve(el)
        const go = () => { if (performance.now() - t0 > 1000) el.classList.add('still'); requestAnimationFrame(() => el.classList.add('in')) }
        const decoded = () => (im.decode ? im.decode().catch(() => {}) : Promise.resolve()).then(go)
        if (!im || (im.complete && im.naturalWidth)) go()
        else { im.addEventListener('load', decoded, { once: true }); im.addEventListener('error', go, { once: true }) }
      }
    }, { rootMargin: '0px 0px -8% 0px' })
    els.forEach((el) => io.observe(el))
  }

  // ---- The footer's mark inks in once, when most of it is in view, 840 ms (N7) --------------------
  // Until then it shows as an outline with its anchor points. A one-time trigger, like the plates.
  function footMark() {
    const el = document.querySelector('.foot-mark')
    if (!el) return
    loupe(el)
    if (!html.classList.contains('motion') || !('IntersectionObserver' in window)) return el.classList.add('in')
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { io.disconnect(); el.classList.add('in') } }, { threshold: 0.6 })
    io.observe(el)
  }

  // A 400% loupe follows a fine pointer over the mark (CSS shows it only for hover).
  function loupe(fa) {
    const lens = fa.querySelector('.loupe'), big = lens?.querySelector('svg')
    if (!big) return
    const R = 88 // half the loupe
    fa.addEventListener('pointermove', (e) => {
      const r = fa.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top
      lens.style.transform = `translate(${x - R}px, ${y - R}px)`
      big.style.width = `${r.width * 4}px`
      big.style.transform = `translate(${R - 4 * x}px, ${R - 4 * y}px)`
    })
  }

  // ---- Clips: a muted loop over its still, only while most of it is in view (round 4) -------------
  // Pause stops it for good and Play starts it again (WCAG 2.2.2). Under reduced motion nothing plays
  // until Play is pressed. The file loads only when its frame nears the window.
  function clips() {
    const els = document.querySelectorAll('.clip')
    if (!els.length || !('IntersectionObserver' in window)) return
    for (const el of els) {
      if (el.classList.contains('film')) { film(el); continue }
      const v = el.querySelector('video'), b = el.querySelector('.clip-btn')
      let held = reduce
      const label = () => { b.textContent = v.paused ? 'Play' : 'Pause'; b.setAttribute('aria-pressed', String(v.paused)) }
      const play = () => { v.preload = 'auto'; v.play().then(() => v.classList.add('on'), () => {}) }
      v.addEventListener('play', label); v.addEventListener('pause', label)
      b.addEventListener('click', () => { held = !v.paused; held ? v.pause() : play(); label() })
      new IntersectionObserver(([en]) => {
        if (en.isIntersecting) { if (!held) play() }
        else if (!v.paused) { v.pause(); b.textContent = 'Play' }
      }, { threshold: 0.5 }).observe(el)
      label()
    }
  }

  // A film (P3) shows its poster, which is its own first frame, until pressed; it plays muted on a
  // loop, and stops when pressed again or when it leaves the window. Under reduced motion the button
  // is hidden (CSS) and nothing here runs.
  function film(el) {
    if (reduce) return
    const v = el.querySelector('video'), b = el.querySelector('.clip-btn'), t = b.firstElementChild
    const label = () => { t.textContent = v.paused ? 'Play' : 'Pause'; b.setAttribute('aria-pressed', String(!v.paused)); el.classList.toggle('playing', !v.paused) }
    v.addEventListener('play', label); v.addEventListener('pause', label)
    b.addEventListener('click', () => {
      if (!v.paused) return v.pause()
      v.preload = 'auto'; v.play().then(() => v.classList.add('on'), () => {})
    })
    new IntersectionObserver(([en]) => { if (!en.isIntersecting && !v.paused) v.pause() }, { threshold: 0.25 }).observe(el)
  }

  // ---- /projects: the filters (07 5.3) -------------------------------------------------------------
  // The cards glide to their new places in the token's time; those that leave shrink and fade in
  // 240 ms. The filter is kept in the URL and announced.
  function filters() {
    const group = document.querySelector('.filters'), wall = document.querySelector('.wall')
    if (!group || !wall) return
    const buttons = [...group.querySelectorAll('button')], status = document.querySelector('[data-filter-status]')
    const mark = (f) => buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.f === f)))
    mark(html.dataset.filter || 'all')
    group.addEventListener('click', (e) => {
      const b = e.target.closest('button')
      if (!b || b.dataset.f === (html.dataset.filter || 'all')) return
      const f = b.dataset.f
      const apply = () => { if (f === 'all') delete html.dataset.filter; else html.dataset.filter = f; mark(f) }
      const u = new URL(location.href)
      if (f === 'all') u.searchParams.delete('f'); else u.searchParams.set('f', f)
      history.replaceState(history.state, '', u)
      status.textContent = b.dataset.msg
      if (reduce || !document.startViewTransition) return apply()
      const items = [...wall.children]
      items.forEach((li) => (li.style.viewTransitionName = 'w-' + li.querySelector('a').dataset.slug))
      html.classList.add('vt-filter')
      document.startViewTransition(apply).finished.finally(() => { items.forEach((li) => (li.style.viewTransitionName = '')); html.classList.remove('vt-filter') })
    })
  }

  // ---- The cover's focus row and stage (07 4.1; research/20, sections 1 to 5) ----------------------
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
  const lerp = (a, b, t) => a + (b - a) * t
  const phase = (p, a, b) => clamp((p - a) / (b - a))

  function cover() {
    const stage = document.querySelector('.stage'), row = stage?.querySelector('.row')
    if (!row) return
    const cards = [...row.querySelectorAll('.card')], role = stage.querySelector('.role'), leadbar = stage.querySelector('.leadbar'), box = stage.querySelector('.cover')
    // The lead loads at its first-view size; the stage grows it only on scroll, so the large file is
    // asked for on the first scroll. Not sooner: a source swapped in before any input counts as a new
    // largest paint (research/20, section 10).
    const lead = cards[0].querySelector('img')
    addEventListener('scroll', () => { lead.sizes = '(min-width: 900px) 80vw, 100vw' }, { once: true, passive: true })
    const wide = matchMedia('(min-width: 900px)')
    if (!wide.matches) return // one column: no focus row, no stage
    const hover = matchMedia('(hover: hover) and (pointer: fine)').matches
    let G = parseFloat(getComputedStyle(html).getPropertyValue('--g')) || 16

    // Spans in 24ths of the row: the focused card is always 10 and a far card always 4; a neighbor is
    // 6 beside an end card and 5 beside a middle one. Every state lands on the 24-column grid.
    // With motion off the four stand still at 6 each: no focus, no stage (Thomas, round 6).
    const spans = (f) => cards.map((_, i) => (reduce ? 6 : i === f ? 10 : Math.abs(i - f) === 1 ? (f === 0 || f === cards.length - 1 ? 6 : 5) : 4))

    // One critically damped spring per card, settled to 98% in the motion token's time (300 ms; 350
    // under 900 px). It reaches 98% at 5.83 / omega. A retarget keeps each card's velocity, so a pass
    // over the row never hitches; springs are linear, so the spans always sum to 24. The token reads
    // "300ms" in dev but ".3s" once minified; read as ms, ".3s" made the spring 1000 times too stiff,
    // so it blew up on its first frame and the row snapped (vtMs, above, reads it right).
    const settle = vtMs() / 1000
    const T = (2 * Math.PI * settle) / 5.83, K = (2 * Math.PI / T) ** 2, C = (4 * Math.PI) / T
    let focus = 0, target = spans(0), n = target.slice(), v = n.map(() => 0), raf = 0, last = 0, p = 0
    const commit = (f) => { if (f === focus || p > 0 || reduce) return; focus = f; target = spans(f); kick() }
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick) }
    const tick = (t) => {
      const dt = Math.min(0.032, last ? (t - last) / 1000 : 1 / 60)
      last = t
      let moving = false
      if (!reduce) { // reduced motion: the row changes size at once
        for (let s = 0, h = dt / 4; s < 4; s++) for (let i = 0; i < n.length; i++) { v[i] += (-K * (n[i] - target[i]) - C * v[i]) * h; n[i] += v[i] * h }
        moving = n.some((x, i) => Math.abs(x - target[i]) > 0.002 || Math.abs(v[i]) > 0.02)
        if (!moving) { n = target.slice(); v = v.map(() => 0) }
      } else n = target.slice()
      render()
      raf = moving ? requestAnimationFrame(tick) : 0
      if (!raf) last = 0
    }

    // The stage: hold for the first 15%, and in that hold the row eases home, so the stage always
    // grows the lead whatever was in focus; the lead grows to as much as 20 columns by 85%; then its
    // caption bar rises.
    const render = () => {
      if (!wide.matches) return unset()
      const home = spans(0), a = phase(p, 0, 0.15), t = phase(p, 0.15, 0.85)
      // Measured from the cover's top, where the window's top is while the cover is pinned, so once
      // the stage ends the grown lead leaves with the cover instead of staying pinned at 88 px.
      const rr = row.getBoundingClientRect(), cr = box.getBoundingClientRect(), u = (rr.width + G) / 24
      const out = n.map((x, i) => ({ n: lerp(x, home[i], a), o: 0, dy: 0, op: 1 }))
      if (t > 0) {
        const H = (10 * u - G) / 1.5
        const nT = Math.min(20, ((innerHeight - 64 - 24 - 96) * 1.5 + G) / u), hT = (nT * u - G) / 1.5
        out[0] = { n: lerp(home[0], nT, t), o: lerp(0, (24 - nT) / 2, t), dy: t * (88 - (rr.top - cr.top) - H + hT), op: 1 }
        // I1 (4 November): the other three drift apart as the lead grows; each drops at its own depth
        // and they spread a column apart.
        for (let i = 1; i < out.length; i++) Object.assign(out[i], { dx: t * i * u, dy: t * (0.55 + 0.15 * i) * innerHeight, op: 1 - phase(t, 0, 0.6) })
        const b = phase(p, 0.85, 1)
        leadbar.style.opacity = String(b)
        leadbar.style.transform = `translate(${rr.left - cr.left + ((24 - nT) / 2) * u}px, ${88 + hT + 20 + (1 - b) * 16}px)`
      } else leadbar.style.opacity = '0'
      for (let i = 1, o = out[0].o + out[0].n; i < out.length; i++) { out[i].o = o; o += out[i].n }
      out.forEach((s, i) => {
        const st = cards[i].style
        st.setProperty('--n', s.n.toFixed(4)); st.setProperty('--o', s.o.toFixed(4))
        st.setProperty('--dy', s.dy.toFixed(1) + 'px'); st.setProperty('--dx', (s.dx ?? 0).toFixed(1) + 'px'); st.setProperty('--op', s.op.toFixed(3))
      })
      cards[0].style.zIndex = t > 0 ? '2' : ''
      for (let i = 1; i < cards.length; i++) cards[i].style.visibility = out[i].op < 0.01 ? 'hidden' : ''
      cards[0].querySelector('.cap').style.opacity = String(1 - phase(p, 0.15, 0.22))
      role.style.transform = `translateY(${-48 * phase(p, 0.15, 0.5)}px)`
      role.style.opacity = String(1 - phase(p, 0.15, 0.45))
    }
    // The grown lead is capped by width as well as height, so in a window wide enough for the stage
    // but short of 1440 its caption bar ends well above the pinned cover's foot. Pull the next section
    // up by that empty paper, so More projects sits its usual 160 px under the caption bar (Thomas,
    // 4 November: too much space after the scroll at smaller desktop widths).
    const fit = () => {
      if (!wide.matches || reduce) return (stage.style.marginBottom = '')
      const rr = row.getBoundingClientRect(), u = (rr.width + G) / 24
      const nT = Math.min(20, ((innerHeight - 64 - 24 - 96) * 1.5 + G) / u), hT = (nT * u - G) / 1.5
      const slack = innerHeight - (88 + hT + 20 + leadbar.offsetHeight)
      stage.style.marginBottom = slack > 0 ? `${-Math.floor(slack)}px` : ''
    }
    fit()
    // Under 900 px the grid takes over: drop everything the stage wrote.
    const unset = () => {
      stage.style.marginBottom = ''
      cards.forEach((c) => { c.style.visibility = '' })
      cards.forEach((c) => { c.style.removeProperty('--dy'); c.style.removeProperty('--dx'); c.style.removeProperty('--op'); c.style.zIndex = ''; c.querySelector('.cap').style.opacity = '' })
      role.style.transform = role.style.opacity = leadbar.style.opacity = leadbar.style.transform = ''
    }
    wide.addEventListener('change', (m) => { if (m.matches) { fit(); kick() } else unset() })
    addEventListener('resize', () => { G = parseFloat(getComputedStyle(html).getPropertyValue('--g')) || 16; if (wide.matches) { fit(); kick() } })
    if (!reduce) addEventListener('scroll', () => { // reduced motion: no stage; the cover is a still row
      if (!wide.matches || reduce) return
      const r = stage.getBoundingClientRect(), span = r.height - innerHeight
      const np = span > 0 ? clamp(-r.top / span) : 0
      if (np > 0 && p === 0) { focus = 0; target = spans(0) } // the hold brings it home
      p = np
      kick()
    }, { passive: true })

    // Which card the pointer is over: whole columns, from the top of the row to the foot of the
    // captions, so a card that shrinks under the pointer cannot drop it into empty paper.
    const colAt = (x) => {
      const r = row.getBoundingClientRect(), u = (r.width + G) / 24
      let o = 0
      for (let i = 0; i < n.length; i++) { o += n[i]; if (x - r.left < o * u - G / 2) return i }
      return n.length - 1
    }
    // Speed-coupled focus (Gutwin, CHI 2002): a fast pass over the row changes nothing; the row
    // answers once the pointer slows below 0.5 px/ms, or rests for 90 ms (research/20, section 3).
    const SLOW = 0.5, REST = 90
    let vx = 0, lx = null, lt = 0, timer = 0
    if (hover) {
      row.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse' || !wide.matches) return
        if (lx !== null) vx = 0.6 * vx + 0.4 * (Math.abs(e.clientX - lx) / Math.max(1, e.timeStamp - lt))
        lx = e.clientX; lt = e.timeStamp
        const f = colAt(e.clientX)
        clearTimeout(timer)
        if (f === focus) return
        if (vx < SLOW) commit(f)
        else timer = setTimeout(() => commit(colAt(lx)), REST)
      })
      row.addEventListener('pointerleave', () => { lx = null; vx = 0; clearTimeout(timer) })
    }
    // Keyboard and switch users get the same focus, at once.
    cards.forEach((c, i) => c.addEventListener('focusin', () => wide.matches && commit(i)))
  }

  // ---- The intro: the four images uncover left to right, 600 ms each, 80 ms apart ------------------
  // Each card waits for its own image, never the slowest of the four. A card not moving a second
  // after the page shows appears without moving: an entrance that starts once the reader has begun
  // reading pulls the eye back (research/20, section 6).
  function intro() {
    if (!html.classList.contains('intro')) return
    const cards = [...document.querySelectorAll('.row .card')]
    if (!cards.length) return html.classList.remove('intro')
    const dur = 600, gap = 80
    const loaded = cards.map((c) => {
      const im = c.querySelector('img')
      return (im.complete ? Promise.resolve() : new Promise((r) => { im.addEventListener('load', r, { once: true }); im.addEventListener('error', r, { once: true }) })).then(() => im.decode?.().catch(() => {}))
    })
    const shown = (c) => c.classList.contains('in')
    const still = setTimeout(() => { cards.forEach((c) => c.classList.add('in')); html.classList.remove('intro') }, 1000)
    let prev = Promise.resolve(-Infinity) // when the card to the left starts to move
    cards.forEach((c, i) => {
      prev = Promise.all([prev, loaded[i]]).then(([left]) => {
        if (shown(c)) return left // past the deadline: already showing, still
        const at = performance.now(), delay = Math.max(0, left + gap - at)
        const o = { duration: dur, easing: EASE, delay, fill: 'backwards' }
        c.querySelector('.mover').animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], o)
        c.querySelector('.counter').animate([{ transform: 'translateY(-100%)' }, { transform: 'none' }], o)
        c.querySelector('img').animate([{ transform: 'scale(1.04)' }, { transform: 'none' }], o)
        c.querySelector('.cap').animate([{ opacity: 0 }, { opacity: 1 }], { ...o, duration: dur * 0.8, delay: delay + dur * 0.3 })
        c.classList.add('in')
        return at + delay
      })
    })
    prev.then((last) => {
      if (!html.classList.contains('intro')) return
      clearTimeout(still)
      // The point lands last, as the full stop of the cover.
      document.querySelector('.role .point')?.animate([{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: EASE, delay: Math.max(0, last + dur * 0.5 - performance.now()), fill: 'backwards' })
      html.classList.remove('intro')
    })
  }

  // ---- /logos: a mark zooms to 400% where it is pressed (10-copy 4.3) -----------------------------
  // The zoom is a CSS transform on the mark's group, in the token's time, and the view never leaves
  // the cell's frame. A drag moves the mark with the pointer; a press without a drag zooms back out,
  // as does Escape. Enter or Space zooms on the middle, and the arrow keys look around.
  ready(() => document.querySelectorAll('.lens').forEach((b) => {
    const svg = b.querySelector('svg'), g = b.querySelector('.zoom'), pct = b.querySelector('.pct')
    const { width: W, height: H } = svg.viewBox.baseVal
    let s = 1, tx = 0, ty = 0, down = null, moved = false
    const set = () => {
      tx = Math.min(0, Math.max(W * (1 - s), tx)); ty = Math.min(0, Math.max(H * (1 - s), ty))
      g.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`
    }
    const zoom = (on, x = W / 2, y = H / 2) => {
      s = on ? 4 : 1; tx = x * (1 - s); ty = y * (1 - s); set()
      b.classList.toggle('on', on); b.setAttribute('aria-pressed', on)
      pct.textContent = on ? `400% · ${b.dataset.n} anchor points` : '100%'
    }
    b.addEventListener('pointerdown', (e) => { if (!e.button) { down = [e.clientX, e.clientY, tx, ty]; moved = false } })
    b.addEventListener('pointermove', (e) => {
      if (!down || s === 1) return
      const dx = e.clientX - down[0], dy = e.clientY - down[1]
      if (!moved) { if (Math.hypot(dx, dy) < 4) return; moved = true; b.classList.add('drag'); b.setPointerCapture(e.pointerId) }
      const k = W / svg.getBoundingClientRect().width
      tx = down[2] + dx * k; ty = down[3] + dy * k; set()
    })
    const up = () => { down = null; b.classList.remove('drag') }
    b.addEventListener('pointerup', up)
    b.addEventListener('pointercancel', up)
    b.addEventListener('click', (e) => {
      if (moved) { moved = false; return }
      if (s > 1) return zoom(false)
      if (!e.detail) return zoom(true) // the keyboard
      const r = svg.getBoundingClientRect()
      zoom(true, ((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H)
    })
    b.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && s > 1) { e.preventDefault(); return zoom(false) }
      const d = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key]
      if (!d || s === 1) return
      e.preventDefault(); tx += (d[0] * W) / 8; ty += (d[1] * H) / 8; set()
    })
  }))

  // ---- /one-offs: the light table (07 5.6; 10-copy 4.2) --------------------------------------------
  // The list of pieces on a plane: drag it and it glides a little after the release. The routes
  // without a drag (WCAG 2.5.7) are the pan buttons and the focus, which brings each piece it reaches
  // into view. The Grid button turns it back into columns, the first view below 900 px and under
  // reduced motion, until the reader picks one. A plain wheel is left alone: it scrolls the page.
  // Zoom (review B): the + and - buttons, the + and - keys, ctrl+wheel (a trackpad pinch in Chrome and
  // Firefox) and the gesture events (Safari's pinch) scale the list between "everything in view" and
  // 100%, about the pointer or the plane's centre. Touch pinch stays the browser's page zoom.
  ready(() => {
    const board = document.querySelector('.board'), btn = document.querySelector('.view')
    if (!board || !btn) return
    const plane = board.querySelector('.plane'), list = board.querySelector('.pieces'), hint = board.querySelector('.hint')
    const wide = matchMedia('(min-width: 900px)')
    const on = () => board.dataset.view === 'table'
    const zin = board.querySelector('[data-zoom="1"]'), zout = board.querySelector('[data-zoom="-1"]'), zpct = board.querySelector('.zoom span')
    let x = 0, y = 0, s = 1, chosen = false, glide = 0, drag = null, moved = false
    // The list's real extent (its box is wider than its last row), and the scale that shows all of it.
    const extent = () => {
      let w = 0, h = 0
      for (const li of list.children) { w = Math.max(w, li.offsetLeft + li.offsetWidth); h = Math.max(h, li.offsetTop + li.offsetHeight) }
      return [w + 96, h + 96]
    }
    const fitAt = () => { const [w, h] = extent(); return Math.min(1, plane.clientWidth / w, plane.clientHeight / h) }
    // Place the list at scale ns; a list smaller than the plane sits in its middle. I8 (review round 6):
    // with soft set, a drag or a glide past an edge goes on at a third of the pull, up to about 120 px,
    // and the release springs it back (settle(), below).
    const room = (box, size) => (size >= box ? [box - size, 0] : [(box - size) / 2, (box - size) / 2])
    const bounds = () => { const [w, h] = extent(); return [room(plane.clientWidth, w * s), room(plane.clientHeight, h * s)] }
    const band = (v, lo, hi) => (v < lo ? lo - rub(lo - v) : v > hi ? hi + rub(v - hi) : v)
    const rub = (d) => (120 * d) / (d + 360)
    const put = (nx, ny, ease, ns = s, soft = false) => {
      const lo = fitAt()
      s = Math.max(lo, Math.min(1, ns))
      const [[x0, x1], [y0, y1]] = bounds()
      if (soft) { x = band(nx, x0, x1); y = band(ny, y0, y1) }
      else { x = Math.max(x0, Math.min(x1, nx)); y = Math.max(y0, Math.min(y1, ny)) }
      list.style.transition = ease && !reduce ? `transform 480ms ${EASE}` : ''
      list.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`
      zpct.textContent = `${Math.round(s * 100)}%`
      zin.setAttribute('aria-disabled', s >= 1)
      zout.setAttribute('aria-disabled', s <= lo + 0.001)
    }
    // Scale by k about a point in the plane (its middle unless a pointer says otherwise).
    const zoom = (k, cx = plane.clientWidth / 2, cy = plane.clientHeight / 2, ease) => {
      cancelAnimationFrame(glide)
      const ns = Math.max(fitAt(), Math.min(1, s * k)), r = ns / s
      put(cx - (cx - x) * r, cy - (cy - y) * r, ease, ns)
    }
    const view = (v) => {
      board.dataset.view = v
      btn.firstElementChild.textContent = v === 'table' ? 'Grid' : 'Table'
      btn.setAttribute('aria-label', v === 'table' ? 'Show as a grid' : 'Show as a table')
      cancelAnimationFrame(glide)
      if (v === 'table') put(x, y)
      else list.style.transform = list.style.transition = ''
    }
    btn.hidden = false
    btn.addEventListener('click', () => { chosen = true; view(on() ? 'grid' : 'table') })
    const auto = () => { if (!chosen) view(wide.matches && !reduce ? 'table' : 'grid') }
    wide.addEventListener('change', auto)
    auto()
    addEventListener('resize', () => { if (on()) put(x, y) })

    plane.addEventListener('pointerdown', (e) => {
      if (!on() || e.button) return
      cancelAnimationFrame(glide)
      drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, x, y, lx: e.clientX, ly: e.clientY, t: e.timeStamp, vx: 0, vy: 0 }
      moved = false
    })
    plane.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return
      const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy
      if (!moved && Math.hypot(dx, dy) < 6) return
      if (!moved) { moved = true; plane.setPointerCapture(e.pointerId); plane.classList.add('held'); hint.classList.add('gone') }
      const dt = Math.max(1, e.timeStamp - drag.t)
      drag.vx = 0.8 * ((e.clientX - drag.lx) / dt) + 0.2 * drag.vx
      drag.vy = 0.8 * ((e.clientY - drag.ly) / dt) + 0.2 * drag.vy
      drag.lx = e.clientX; drag.ly = e.clientY; drag.t = e.timeStamp
      put(drag.x + dx, drag.y + dy, false, s, true)
    })
    // Back inside the edges on a spring settled to 98% in about 400 ms, no bounce past the edge.
    const settle = () => {
      const [[x0, x1], [y0, y1]] = bounds(), tx = Math.max(x0, Math.min(x1, x)), ty = Math.max(y0, Math.min(y1, y))
      if (Math.abs(tx - x) < 0.5 && Math.abs(ty - y) < 0.5) return put(tx, ty)
      const w = 10 / 400 // critically damped: e^(-wt)(1 + wt) falls to 2% at t = 400 ms
      const ox = x - tx, oy = y - ty, t0 = performance.now()
      const step = (now) => {
        const t = now - t0, k = Math.exp(-w * t) * (1 + w * t)
        if (k < 0.004) return put(tx, ty)
        put(tx + ox * k, ty + oy * k, false, s, true)
        glide = requestAnimationFrame(step)
      }
      glide = requestAnimationFrame(step)
    }
    const end = (e) => {
      if (!drag || e.pointerId !== drag.id) return
      plane.classList.remove('held')
      // A hold before the release means the reader stopped: no glide. A glide runs at most about
      // 250 px: 1.5 px/ms, losing a tenth a frame.
      const held = e.timeStamp - drag.t > 80, k0 = held ? 0 : Math.min(1, 1.5 / (Math.hypot(drag.vx, drag.vy) || 1))
      let vx = drag.vx * k0, vy = drag.vy * k0
      drag = null
      if (!moved) return
      if (reduce) return put(x, y)
      // A glide that meets an edge loses speed fast and then springs back.
      let last = performance.now()
      const step = (now) => {
        const dt = now - last, [[x0, x1], [y0, y1]] = bounds(), out = x < x0 || x > x1 || y < y0 || y > y1
        const k = (out ? 0.6 : 0.9) ** (dt / 16.7)
        last = now; vx *= k; vy *= k
        put(x + vx * dt, y + vy * dt, false, s, true)
        if (Math.hypot(vx, vy) > 0.02) glide = requestAnimationFrame(step)
        else settle()
      }
      glide = requestAnimationFrame(step)
    }
    plane.addEventListener('pointerup', end)
    plane.addEventListener('pointercancel', end)
    // A drag that ends over a piece is not a press.
    plane.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false } }, true)
    plane.addEventListener('dragstart', (e) => e.preventDefault())

    board.querySelector('.zoom').addEventListener('click', (e) => {
      const b = e.target.closest('button')
      if (b && on()) zoom(b.dataset.zoom > 0 ? 1.5 : 1 / 1.5, undefined, undefined, true)
    })
    const at = (e) => { const r = plane.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] }
    // ctrl+wheel: a trackpad pinch in Chrome and Firefox. Only this one is caught; a plain wheel scrolls.
    plane.addEventListener('wheel', (e) => {
      if (!e.ctrlKey || !on()) return
      e.preventDefault()
      zoom(Math.exp(-Math.max(-30, Math.min(30, e.deltaY)) * 0.01), ...at(e))
    }, { passive: false })
    // Safari's pinch arrives as gesture events carrying the scale since the start. A touch screen keeps
    // its own page zoom.
    if (matchMedia('(pointer: fine)').matches) {
      let s0 = 1
      plane.addEventListener('gesturestart', (e) => { if (on()) { e.preventDefault(); s0 = s } })
      plane.addEventListener('gesturechange', (e) => { if (on()) { e.preventDefault(); zoom((s0 * e.scale) / s, ...at(e)) } })
      plane.addEventListener('gestureend', (e) => { if (on()) e.preventDefault() })
    }
    // + and - (the number pad's too) with the focus anywhere on the table; ctrl and cmd keep the browser's zoom.
    board.addEventListener('keydown', (e) => {
      if (!on() || e.ctrlKey || e.metaKey || e.altKey) return
      const k = { '+': 1.5, '=': 1.5, '-': 1 / 1.5, _: 1 / 1.5 }[e.key]
      if (k) { e.preventDefault(); zoom(k, undefined, undefined, true) }
    })
    board.querySelector('.pan').addEventListener('click', (e) => {
      const b = e.target.closest('button')
      if (!b || !on()) return
      const [dx, dy] = b.dataset.pan.split(',').map(Number)
      cancelAnimationFrame(glide)
      put(x - dx * plane.clientWidth * 0.6, y - dy * plane.clientHeight * 0.6, true)
    })
    // Bring a piece into view: the keyboard's focus, and the viewer when it puts a piece back.
    const reveal = (li, ease) => {
      if (!on()) return
      const p = plane.getBoundingClientRect(), r = li.getBoundingClientRect(), m = 48
      if (r.left >= p.left + m && r.right <= p.right - m && r.top >= p.top + m && r.bottom <= p.bottom - m) return
      cancelAnimationFrame(glide)
      put(x + p.left + p.width / 2 - (r.left + r.width / 2), y + p.top + p.height / 2 - (r.top + r.height / 2), ease)
    }
    // The piece itself, not its row: a set's row runs wider than the plane, so revealing the row left
    // six of Megapack's eleven pieces off screen under the focus (check-motion.mjs, 6 November).
    list.addEventListener('focusin', (e) => { if (e.target.matches(':focus-visible')) reveal(e.target, true) })
    list.addEventListener('reveal', (e) => reveal(e.target, false))

  })

  // ---- /one-offs: the viewer (07 5.6; 10-copy 4.2) -------------------------------------------------
  // A piece grows from its place in the columns, in the token's time, to the middle of the window at
  // no more than half its pixel width. Previous, Next, the arrow keys or a swipe move through them
  // all; Close, Escape or a press beside the piece puts it back where it came from. Until its file
  // arrives the piece shows its thumbnail, already in the cache. Opened on a set (N10), it steps
  // through that set only, and the count names it.
  ready(() => {
    const dlg = document.querySelector('dialog.viewer:not(.gw)') // Good Word's has its own script
    if (!dlg) return
    const tiles = [...document.querySelectorAll('.piece')]
    const stage = dlg.querySelector('.v-stage'), top = dlg.querySelector('.v-top'), cap = dlg.querySelector('.v-cap')
    const vt = vtMs
    // A set's later pieces are hidden in the columns; the viewer goes back to its first.
    const home = (i) => (tiles[i].getClientRects().length ? tiles[i] : tiles[i].closest('.set').querySelector('.piece'))
    const thumb = (i) => home(i).querySelector('img')
    const away = (from, to) => `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width})`
    // The page's own stops: each piece, and each set by its first piece.
    const covers = [...document.querySelectorAll('.pieces > li')].map((li) => li.querySelector('.piece'))
    let cur = 0, big = null, busy = false, sx = null, swiped = false, run = covers
    // ---- I9: press check (Thomas's pick, round 6: a) ----
    // A print piece splits into its four process plates, worked out in the browser from the piece
    // itself: K is what the brightest channel lacks, and C, M and Y share out the rest (the plain
    // conversion, with no press profile, so a guide to the idea rather than a proof). The plates sit in
    // register over the image, each multiplied on paper, so together they look like the piece again.
    // Then they slide apart into four quarters, each named with its ink cover; a second press slides
    // them back into register, a third apart again.
    const pb = dlg.querySelector('.v-press')
    let plates = null
    const INKS = [['Cyan', [0, 255, 255]], ['Magenta', [255, 0, 255]], ['Yellow', [255, 255, 0]], ['Black', [0, 0, 0]]]
    function unpress() {
      plates?.remove(); plates = null
      big?.classList.remove('pressed')
      pb.setAttribute('aria-pressed', 'false')
      pb.hidden = !tiles[cur] || !('print' in tiles[cur].dataset)
    }
    const press = async () => {
      if (plates) return pb.setAttribute('aria-pressed', String(plates.classList.toggle('apart')))
      const img = big
      await img.decode().catch(() => {})
      if (img !== big || !dlg.open) return
      const bw = img.offsetWidth, bh = img.offsetHeight, dpr = Math.min(2, devicePixelRatio || 1)
      const W = Math.round(bw * dpr), H = Math.round(bh * dpr)
      const cx = Object.assign(document.createElement('canvas'), { width: W, height: H }).getContext('2d', { willReadFrequently: true })
      cx.drawImage(img, 0, 0, W, H)
      const px = cx.getImageData(0, 0, W, H).data, N = W * H
      const ink = INKS.map(() => new Float32Array(N))
      for (let i = 0; i < N; i++) {
        const r = px[i * 4] / 255, g = px[i * 4 + 1] / 255, b = px[i * 4 + 2] / 255, k = 1 - Math.max(r, g, b), d = 1 - k || 1
        ink[0][i] = (1 - r - k) / d; ink[1][i] = (1 - g - k) / d; ink[2][i] = (1 - b - k) / d; ink[3][i] = k
      }
      const box = Object.assign(document.createElement('div'), { className: 'plates' })
      box.style.width = `${bw}px`; box.style.height = `${bh}px`
      box.setAttribute('aria-hidden', 'true')
      INKS.forEach(([name, rgb], j) => {
        const cv = Object.assign(document.createElement('canvas'), { width: W, height: H }), c = cv.getContext('2d'), a = ink[j]
        let sum = 0
        for (let i = 0; i < N; i++) sum += a[i]
        const out = c.createImageData(W, H), o = out.data
        for (let i = 0; i < N; i++) {
          const q = a[i]
          o[i * 4] = 255 - (255 - rgb[0]) * q; o[i * 4 + 1] = 255 - (255 - rgb[1]) * q; o[i * 4 + 2] = 255 - (255 - rgb[2]) * q; o[i * 4 + 3] = 255
        }
        c.putImageData(out, 0, 0)
        const pl = Object.assign(document.createElement('div'), { className: `sep p${j}` })
        pl.append(cv, Object.assign(document.createElement('span'), { className: 'pl-n', textContent: `${name} ${Math.round((sum / N) * 100)}%` }))
        box.append(pl)
      })
      stage.append(box)
      plates = box
      img.classList.add('pressed')
      pb.setAttribute('aria-pressed', 'true')
      requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add('apart')))
    }
    pb.addEventListener('click', press)
    const fit = () => {
      const a = tiles[cur], w = +a.dataset.w, h = +a.dataset.h, cs = getComputedStyle(stage)
      const room = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      const bw = Math.min(room, (stage.clientHeight * w) / h, w / 2)
      big.style.width = `${bw}px`; big.style.height = `${(bw * h) / w}px`; big.sizes = `${Math.ceil(bw)}px`
    }
    const show = (i) => {
      cur = i
      const k = run.indexOf(tiles[i])
      const a = tiles[cur], im = a.querySelector('img'), c = a.closest('li').querySelector(':scope > .pc')
      const n = document.createElement('img')
      n.className = 'v-img'; n.alt = im.alt; n.decoding = 'async'
      n.style.backgroundImage = `url("${im.currentSrc || im.src}")`
      big ? big.replaceWith(n) : stage.append(n)
      big = n; fit(); unpress()
      n.srcset = a.dataset.srcset; n.src = a.href
      dlg.querySelector('.v-i').textContent = String(k + 1).padStart(2, '0')
      cap.querySelector('.c').textContent = a.dataset.c ?? c.querySelector('.c').textContent
      cap.querySelector('.n').textContent = a.dataset.n ?? c.querySelector('.n').textContent
    }
    const open = (i) => {
      const set = tiles[i].closest('.set')
      run = set ? [...set.querySelectorAll('.piece')] : covers
      const sr = Object.assign(document.createElement('span'), { className: 'sr', textContent: ', ' })
      dlg.querySelector('.v-s').replaceChildren(...(set ? [set.querySelector('.pc .n').textContent, sr] : []))
      dlg.querySelector('.v-t').textContent = String(run.length).padStart(2, '0')
      dlg.showModal(); dlg.focus(); show(i) // the viewer itself takes focus, so no button wears a ring
      if (reduce) return
      big.animate([{ transform: away(big.getBoundingClientRect(), tiles[i].querySelector('img').getBoundingClientRect()) }, { transform: 'none' }], { duration: vt(), easing: EASE })
      if (window.CSSStartingStyleRule) return // the CSS fades the ground, top line and caption in (A4)
      const g = getComputedStyle(html).getPropertyValue('--paper').trim()
      dlg.animate([{ backgroundColor: `${g}00` }, { backgroundColor: g }], { duration: vt(), easing: EASE })
      for (const el of [top, cap]) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, delay: 60, fill: 'backwards' })
    }
    const close = () => {
      if (!dlg.open || busy) return
      unpress()
      const a = home(cur)
      const done = () => { dlg.close(); dlg.getAnimations({ subtree: true }).forEach((x) => x.cancel()); busy = false; a.focus({ preventScroll: true }) }
      a.dispatchEvent(new Event('reveal', { bubbles: true })) // on the light table, pan it into view
      a.scrollIntoView({ block: 'nearest' })
      if (reduce) return done()
      busy = true
      const go = big.animate([{ transform: 'none' }, { transform: away(big.getBoundingClientRect(), thumb(cur).getBoundingClientRect()) }], { duration: vt(), easing: EASE, fill: 'forwards' })
      const g = getComputedStyle(html).getPropertyValue('--paper').trim()
      dlg.animate([{ backgroundColor: g }, { backgroundColor: `${g}00` }], { duration: vt(), easing: EASE, fill: 'forwards' })
      for (const el of [top, cap]) el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' })
      go.finished.then(done)
    }
    tiles.forEach((a, i) => a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return // a new tab gets the file
      e.preventDefault(); open(i)
    }))
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); close() }) // Escape
    const step = (d) => show(tiles.indexOf(run[(run.indexOf(tiles[cur]) + d + run.length) % run.length]))
    dlg.addEventListener('click', (e) => {
      const b = e.target.closest('button')
      if (b?.dataset.go) step(+b.dataset.go)
      else if (b?.hasAttribute('data-close') || (e.target === stage && !swiped)) close()
      swiped = false
    })
    dlg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
    })
    addEventListener('resize', () => { if (dlg.open) { fit(); unpress() } })
    stage.addEventListener('pointerdown', (e) => { sx = e.pointerType === 'mouse' ? null : [e.clientX, e.clientY] })
    stage.addEventListener('pointercancel', () => { sx = null })
    stage.addEventListener('pointerup', (e) => {
      if (!sx) return
      const dx = e.clientX - sx[0], dy = e.clientY - sx[1]
      sx = null
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) { swiped = true; step(dx < 0 ? 1 : -1) }
    })
  })

  // ---- I7: a brand case's mark draws itself once, then scrubs (4 November) -------------------------
  // One number, --p from 0 to 1, drives the four stages in CSS: anchors, handles, outline, fill. It
  // plays over 2.4 s when most of the mark is in view, then the slider under it sets it.
  // One screen pixel in an SVG's own units, as --upx, for strokes that cannot be non-scaling.
  function upx(svgs) {
    const set = (v) => {
      const b = v.viewBox.baseVal, r = v.getBoundingClientRect()
      if (b && b.width && r.width) v.style.setProperty('--upx', (1 / Math.min(r.width / b.width, r.height / b.height)).toFixed(4))
    }
    const ro = 'ResizeObserver' in window ? new ResizeObserver((es) => es.forEach((e) => set(e.target))) : null
    svgs.forEach((v) => { set(v); ro?.observe(v) })
  }

  function draw() {
    upx(document.querySelectorAll('.draw-art svg'))
    const STAGES = [[0, 'Anchors'], [0.15, 'Handles'], [0.3, 'Outline'], [0.7, 'Fill']]
    document.querySelectorAll('.draw').forEach((fig) => {
      const r = fig.querySelector('input'), read = fig.querySelector('.draw-read .s')
      let raf = 0
      const stop = () => { cancelAnimationFrame(raf); raf = 0 }
      const set = (p) => {
        fig.style.setProperty('--p', p.toFixed(4))
        r.value = String(Math.round(p * 100))
        const n = STAGES.filter(([a]) => p >= a).pop()[1]
        r.setAttribute('aria-valuetext', n); read.textContent = n
      }
      r.addEventListener('input', () => { stop(); set(r.value / 100) })
      if (reduce || !('IntersectionObserver' in window)) return set(1)
      set(0)
      const io = new IntersectionObserver(([en]) => {
        if (!en.isIntersecting) return
        io.disconnect()
        const t0 = performance.now()
        const f = (t) => { const k = clamp((t - t0) / 2400); set(k); raf = k < 1 ? requestAnimationFrame(f) : 0 }
        raf = requestAnimationFrame(f)
      }, { threshold: 0.6 })
      io.observe(fig.querySelector('.draw-art'))
    })
  }

  // I7 on /logos: each mark draws once as its row comes into view, 1.4 s, 120 ms apart in the row.
  // The zoom still works mid-draw: a press ends the draw.
  function marksDraw() {
    const cells = [...document.querySelectorAll('.lens')]
    if (!cells.length || reduce || !('IntersectionObserver' in window)) return
    upx(cells.map((b) => b.querySelector('svg')))
    const run = (b, delay) => {
      b.classList.add('drawing'); b.style.setProperty('--p', '0')
      const t0 = performance.now() + delay
      const f = (t) => {
        const k = clamp((t - t0) / 1400)
        b.style.setProperty('--p', k.toFixed(4))
        if (k < 1 && b.classList.contains('drawing')) requestAnimationFrame(f)
        else { b.classList.remove('drawing'); b.style.removeProperty('--p') }
      }
      requestAnimationFrame(f)
      b.addEventListener('pointerdown', () => b.classList.remove('drawing'), { once: true })
    }
    cells.forEach((b) => { b.classList.add('drawing'); b.style.setProperty('--p', '0') })
    const io = new IntersectionObserver((es) => {
      let i = 0
      for (const en of es) if (en.isIntersecting) { io.unobserve(en.target); run(en.target, 120 * i++) }
    }, { threshold: 0.5 })
    cells.forEach((b) => io.observe(b))
  }

  // ---- I10: a brand case opens on its specimen sheet, which assembles into the hero ----------------
  // The sheet holds 900 ms to be read, then the parts close in on the center and the hero opens from
  // there (site.css). Once it has, the sheet goes and the hero is a plain image again.
  function assemble() {
    const f = document.querySelector('.hero[data-sheet]')
    if (!f || reduce || html.classList.contains('grown')) return
    setTimeout(() => {
      f.classList.add('go')
      setTimeout(() => { f.querySelector('.sheet')?.remove(); f.removeAttribute('data-sheet'); f.classList.remove('go') }, 800)
    }, 900)
  }

  // ---- I15: the 400% lens over case images (wave 2, 4 November) --------------------------------------
  // Thomas zooms to 400% to check his own work; the lens lets a reader do the same. On a fine pointer
  // at 900 px and up, a 176 px lens trails the pointer over a case image and shows it at 4x from the
  // largest file in its srcset, which loads on first use. Decorative: aria-hidden, and the image
  // itself is unchanged. A scroll or leaving the image puts it away.
  function glass() {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const imgs = document.querySelectorAll('.case .hero img, .gallery .frame:not(.clip) img')
    if (!imgs.length) return
    const R = 88, Z = 4
    const g = document.createElement('div')
    g.className = 'glass'; g.setAttribute('aria-hidden', 'true')
    g.innerHTML = '<span class="glass-z">400%</span>'
    document.body.append(g)
    const big = (img) => img.srcset.split(',').map((c) => c.trim().split(/\s+/)).sort((a, b) => parseInt(b[1]) - parseInt(a[1]))[0]?.[0] ?? img.currentSrc
    let on = null
    const off = () => { on = null; g.classList.remove('on') }
    const move = (e) => {
      const img = e.currentTarget, r = img.getBoundingClientRect()
      if (innerWidth < 900) return off()
      if (on !== img) { on = img; g.style.backgroundImage = `url("${big(img)}")` }
      const x = e.clientX - r.left, y = e.clientY - r.top
      g.style.transform = `translate(${e.clientX - R}px, ${e.clientY - R}px)`
      g.style.backgroundSize = `${r.width * Z}px ${r.height * Z}px`
      g.style.backgroundPosition = `${R - Z * x}px ${R - Z * y}px`
      g.classList.add('on')
    }
    imgs.forEach((img) => { img.addEventListener('pointermove', move); img.addEventListener('pointerleave', off) })
    addEventListener('scroll', off, { passive: true })
  }

  // ---- I4: case figures roll in on their wheels and open their proof (4 November) ----------------
  function proofs() {
    const figs = document.querySelector('.figures')
    if (!figs) return
    if (html.classList.contains('motion') && 'IntersectionObserver' in window) {
      figs.classList.add('wait')
      const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { io.disconnect(); requestAnimationFrame(() => figs.classList.remove('wait')) } }, { threshold: 0.6 })
      io.observe(figs)
    }
    const panelOf = (b) => document.getElementById(b.getAttribute('aria-controls'))
    figs.querySelectorAll('.fig-open').forEach((b) => {
      const panel = panelOf(b)
      b.addEventListener('click', () => {
        const on = b.getAttribute('aria-expanded') !== 'true'
        figs.querySelectorAll('.fig-open[aria-expanded="true"]').forEach((o) => { if (o !== b) { o.setAttribute('aria-expanded', 'false'); panelOf(o).hidden = true } })
        b.setAttribute('aria-expanded', String(on))
        panel.hidden = !on
        if (on && html.classList.contains('motion')) { panel.classList.add('opening'); requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.remove('opening'))) }
      })
    })
  }

  // ---- Round 8: a case's Figma prototype, loaded on the reader's press ------------------------------
  ready(() => document.querySelectorAll('.proto').forEach((sec) => {
    const stage = sec.querySelector('.proto-stage'), open = sec.querySelector('.proto-open')
    let frame = null
    const show = () => {
      frame = document.createElement('iframe')
      frame.title = `${sec.dataset.name} prototype, from Figma`
      frame.src = sec.dataset.embed
      frame.allowFullscreen = true
      stage.replaceChildren(frame)
      sec.classList.add('on')
    }
    sec.querySelector('.proto-load').addEventListener('click', show)
    sec.querySelectorAll('.proto-tabs button').forEach((b) => b.addEventListener('click', () => {
      sec.querySelectorAll('.proto-tabs button').forEach((o) => o.setAttribute('aria-pressed', String(o === b)))
      sec.dataset.embed = b.dataset.embed
      open.href = b.dataset.url
      if (frame) frame.src = b.dataset.embed
    }))
  }))

  // ---- I14: put the point back (round 6: Thomas's pick, c then b) ---------------------------------
  // The plate draws itself (CSS: points, outline, tint). Once the outline is done the orange point
  // becomes a button: drag it, and the 0's outline follows it as a rubber band; let go near its empty
  // square, or press it (Enter or a tap), and it snaps home in the token's time. Then the 0 is whole
  // and the numerals fill in ink. The page is still missing.
  ready(() => {
    const grab = document.querySelector('.nf-grab')
    if (!grab) return
    upx(document.querySelectorAll('.nf-plate svg'))
    const plate = grab.parentElement, svg = plate.querySelector('svg'), slip = svg.querySelector('.slip'), lost = svg.querySelector('.lost')
    const ZERO = grab.dataset.zero, HOME = grab.dataset.home.split(' ').map(Number)
    let p = grab.dataset.lost.split(' ').map(Number), drag = null, done = false
    const place = () => {
      const m = svg.getScreenCTM(), r = plate.getBoundingClientRect()
      if (!m) return
      const pt = new DOMPoint(p[0], p[1]).matrixTransform(m)
      grab.style.transform = `translate(${pt.x - r.left}px, ${pt.y - r.top}px)`
    }
    const set = (q) => {
      p = q
      slip.setAttribute('d', ZERO.replace(HOME.join(' '), `${q[0].toFixed(1)} ${q[1].toFixed(1)}`))
      lost.setAttribute('d', `M${q[0].toFixed(1)} ${q[1].toFixed(1)}h0`)
      place()
    }
    const home = () => {
      if (done) return
      done = true
      const from = p, t0 = performance.now(), T = reduce ? 0 : vtMs()
      const ease = (t) => 1 - (1 - t) ** 3
      const step = (now) => {
        const k = T ? Math.min(1, (now - t0) / T) : 1, e = ease(k)
        set([from[0] + (HOME[0] - from[0]) * e, from[1] + (HOME[1] - from[1]) * e])
        if (k < 1) return requestAnimationFrame(step)
        plate.classList.add('fixed'); grab.hidden = true
        document.querySelector('.nf-say').textContent = 'Back on its path. The page is still missing.'
        document.querySelector('.nf-try').remove()
      }
      requestAnimationFrame(step)
    }
    const toSvg = (e) => { const q = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse()); return [q.x, q.y] }
    grab.addEventListener('pointerdown', (e) => { if (e.button) return; grab.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY, moved: false } })
    grab.addEventListener('pointermove', (e) => {
      if (!drag || done) return
      if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 4) return
      drag.moved = true
      set(toSvg(e))
    })
    grab.addEventListener('pointerup', () => {
      if (!drag) return
      const moved = drag.moved
      drag = null
      // Close enough: within 60 units (about 12 px at the plate's desktop size) of the empty square.
      if (moved && Math.hypot(p[0] - HOME[0], p[1] - HOME[1]) > 60) return
      home()
    })
    grab.addEventListener('pointercancel', () => (drag = null))
    // A press without a drag: Enter, Space, or a tap that did not move.
    grab.addEventListener('click', (e) => { if (e.detail === 0) home() })
    // Live once the outline has drawn (700 + 1200 ms in the CSS), at once under reduced motion.
    setTimeout(() => { grab.hidden = false; plate.classList.add('live'); place() }, reduce ? 0 : 1900)
    addEventListener('resize', () => { upx([svg]); place() })
  })

  // ---- I13: reading size on About, a slider (Thomas's pick, round 6: b) --------------------------
  // The site sets every type size in rem, so one root size reflows the page the way the browser's own
  // text zoom does, from 100 to 200% in steps of 5. Images keep their size; text and the spaces set in
  // rem grow. Two things keep it smooth: the size eases toward the slider each frame (the token's time
  // to settle, so a drag never steps by 5 at once), and the slider holds its place in the window while
  // the page grows above it, so the text the reader is on does not jump away.
  // ponytail: pretext (chenglou/pretext) measures text without the DOM; nothing here needs a measure
  // ahead of the browser's own layout, so it stays out. Revisit if the page ever animates line by line.
  ready(() => {
    const box = document.querySelector('.rs')
    if (!box) return
    const range = box.querySelector('input'), out = box.querySelector('output')
    const T = vtMs() / 1000
    let cur = rs0, goal = rs0, vel = 0, raf = 0, last = 0
    // The browser's own scroll anchoring would correct the same growth a second time.
    html.style.overflowAnchor = 'none'
    const paint = (v) => {
      const y = box.getBoundingClientRect().top
      html.style.fontSize = Math.abs(v - 100) < 0.05 ? '' : `${v.toFixed(2)}%`
      const dy = box.getBoundingClientRect().top - y
      if (dy) scrollBy(0, dy)
    }
    // A critically damped spring that settles to 98% in T (5.83 / omega, as the cover's).
    const W = 5.83 / T
    const tick = (t) => {
      const dt = Math.min(0.064, last ? (t - last) / 1000 : 1 / 60) // Safari's reflow frames run 40 ms
      last = t
      // Four steps a frame, as the cover's: one step on Safari's long reflow frames settled 30% late.
      for (let s = 0, h = dt / 4; s < 4; s++) { vel += (-W * W * (cur - goal) - 2 * W * vel) * h; cur += vel * h }
      const done = Math.abs(cur - goal) < 0.1 && Math.abs(vel) < 0.5
      if (done) { cur = goal; vel = 0 }
      paint(cur)
      raf = done ? 0 : requestAnimationFrame(tick)
      if (!raf) last = 0
    }
    range.addEventListener('input', () => {
      goal = +range.value; out.textContent = `${goal}%`
      try { goal === 100 ? sessionStorage.removeItem('rs') : sessionStorage.setItem('rs', goal) } catch {}
      if (reduce) return paint((cur = goal))
      if (!raf) raf = requestAnimationFrame(tick)
    })
    range.value = rs0; out.textContent = `${rs0}%`
    box.hidden = false
  })
})()
