# Vercel skills review of takramerdesigns.com v3, 12 November 2026

Read-only review of `takd/site` (Astro on Cloudflare Pages). Nothing in the source was changed. Line numbers are from the working tree on 12 November (main at e2ccefa, with uncommitted edits in `src/lib/usage.ts` and `src/pages/[demo].astro`, neither touched by these findings). Paths are relative to `takd/site/`.

The site is in good shape against these rules. Focus rings, 44 px targets, skip link, reduced motion, `<dialog>` focus return, alt text, `aria-live` on filters and viewers, image dimensions, lazy loading and the cross-document grow are all handled, most with a comment that names the rule. The five below are the gaps that are left. They are ranked by what a design hiring manager, recruiter, screen-reader user or low-vision reader would meet on a first visit.

## 1. Top 5 proposed changes

### 1. The footer and the Good Word globe move with no way to stop them

- **Where:** `src/components/foot/FootAscii.astro:195`, `:202`, `:238`. `src/components/foot/Flow.astro:162` with `src/components/foot/sky.ts:73-80`. `src/components/Weeks.astro:108`.
- **Skill and rule:** web-design-guidelines, Animation: "Autoplay motion >5 seconds alongside other content needs pause, stop, or hide controls" (WCAG 2.2.2, level A).
- **What is wrong:** The ASCII mark flips glyph clusters about six times a second (`Math.random() < 0.2` on a 30 fps tick), and a scan line passes every 6 to 11 seconds. Both run for as long as the footer is in view. The WebGL sky behind it drifts the whole time too. This footer is on every page, right under the Let's talk block, so a reader moving to the email link or the footer nav sits beside motion they cannot stop. Hovering or clicking only adds more. The globe on the Good Word case turns by itself at about 4 degrees a second until someone presses it or tabs into it, and nothing on screen says so. Reduced motion is handled in both places. The gap is for readers who have not set that preference. The clips already meet this rule with a Pause button (`public/site.js:230`), so this is the same standard applied to the two remaining loops. A local pause or a 5-second stop is not the site-wide motion switch that the phase-2 rules forbid.
- **Proposed fix:** Let the footer's idle motion run for 5 seconds after its entrance, then answer only to the pointer. Stop the sky's loop after the same 5 seconds and restart it on pointermove. Give the globe a Pause button with the clips' pattern.

```diff
 // FootAscii.astro
-    let g = gs[0], raf = 0, last = 0, n = 0, ...
+    let g = gs[0], raf = 0, last = 0, n = 0, calm = Infinity, ...
-      if (Math.random() < 0.2) { // a small cluster flips somewhere on the mark
+      if (t < calm && Math.random() < 0.2) { // idle flips for 5 s only (WCAG 2.2.2)
-      if (!scan && seen && t > nextScan) scan = t
+      if (!scan && seen && t > nextScan && t < calm) scan = t
-      ... { sweep = 0; nextScan = performance.now() + 4000; art.classList.add('fa-on') }
+      ... { sweep = 0; nextScan = performance.now() + 4000; calm = performance.now() + 5000; art.classList.add('fa-on') }
```

```astro
<!-- Weeks.astro, under .globe: the clips' button; its click sets touched = true -->
<button type="button" class="clip-btn globe-hold" aria-pressed="false"><span>Pause</span></button>
```

- **Effort:** About 45 minutes, plus a phone check. The loop in `sky.ts` takes a 5-second cap and a pointer restart. Optional: stop the footer's rAF while nothing is flipping, which also saves battery.
- **Overlap with phase 2:** None planned. When D1/L2 writes the motion spec as data, give each moment a "stops after" field so this rule stays covered.

### 2. Card links read a 200-character image description before the project name

- **Where:** `src/pages/index.astro:46` (cover row), `src/pages/index.astro:63` (More projects), `src/components/wall/Scrub.astro:33-36` (Work wall).
- **Skill and rule:** web-design-guidelines, Accessibility: "Images need `alt` (or `alt=""` if decorative)" and "Use semantic HTML before ARIA".
- **What is wrong:** Each card is one link that holds the image and then the caption. The image's alt comes first in the link's name, and the alts are long and precise. Nydex's, for example, opens "Nydex's landing page in the dark theme, in a browser window over a blurred street..." (`src/data/projects.ts:52`). A screen-reader user tabbing the home page or the Work wall hears a full sentence about a browser window before "Nydex". In a links list, all ten entries start that way. The case page hero (`src/pages/projects/[slug].astro:178`) is the right place for that description, and it already has it.
- **Proposed fix:** On the home cards, the image repeats the caption, so its alt can be empty. On the wall, keep the frame alts Thomas wrote and name the link from its caption.

```diff
- <img ... alt={p.alt} ... fetchpriority=...>      <!-- index.astro:46 and :63 -->
+ <img ... alt="" ... fetchpriority=...>
- <a class="card" ... aria-describedby="sc-hint">  <!-- Scrub.astro:33 -->
+ <a class="card" ... aria-labelledby={`cap-${p.slug}`} aria-describedby="sc-hint">
- <span class="cap">                                <!-- Scrub.astro:40 -->
+ <span class="cap" id={`cap-${p.slug}`}>
```

- **Effort:** 15 minutes. Check it with VoiceOver's rotor (links list) on home and /projects.
- **Overlap with phase 2:** R2, the five-person test, includes a screen-reader user. Fix this before that session so the test finds new problems, not this one.

### 3. Pinch zoom is blocked on the Work wall's images and in the phone menu

- **Where:** `src/components/wall/Scrub.astro:56` (`.scrub .fr { touch-action: pan-y }`), `src/styles/site.css:637` and `src/styles/glass.css:129` (phone menu, `touch-action: none`), `src/styles/site.css:449` (every glass control, `pan-y`).
- **Skill and rule:** web-design-guidelines, Anti-patterns: disabling zoom (`user-scalable=no`). These `touch-action` values do the same thing, one element at a time. Touch & Interaction rules apply too.
- **What is wrong:** On a phone the Work wall is one column of cards, so the frames fill most of the screen. A two-finger pinch that starts on a card does nothing, and the same is true of the open menu sheet. For the low-vision reader in R2, and for anyone squinting at a mockup, that is the page refusing to zoom. The site already gets this right elsewhere. The viewer stage uses `pan-y pinch-zoom` (`site.css:937`) and the light table uses `pinch-zoom` (`site.css:840`). These three spots were missed.
- **Proposed fix:** Add `pinch-zoom`. One-finger pans stay blocked, so the fix of 11 November (a finger wobble must not cancel a menu tap) still holds.

```diff
- .scrub .fr { ... touch-action: pan-y; }
+ .scrub .fr { ... touch-action: pan-y pinch-zoom; }
- .bar nav > ul, .bar .menu { touch-action: none; }
+ .bar nav > ul, .bar .menu { touch-action: pinch-zoom; }
- .bar ul.lq-menu { touch-action: none; }
+ .bar ul.lq-menu { touch-action: pinch-zoom; }
- .lq { isolation: isolate; touch-action: pan-y; ... }
+ .lq { isolation: isolate; touch-action: pan-y pinch-zoom; ... }
```

- **Effort:** 10 minutes to edit, 15 minutes on an iPhone. Pinch on a wall card and in the open menu. Then confirm a swipe still steps frames and a menu tap still opens its link (Liquid.astro's `pointercancel` path already rests the pill).
- **Overlap with phase 2:** R2's low-vision reader.

### 4. The home page fetches a larger lead image for a grow that no longer exists

- **Where:** `public/site.js:318` (the first-scroll `sizes` swap), `public/site.js:351-399` (the stage branch, where `p` is never set above 0), `src/pages/index.astro:52` (`.leadbar`), `src/styles/site.css:210-212`, `:618`, `:662`, `:977`, and the comment at `src/lib/img.ts:43-45`.
- **Skill and rule:** web-design-guidelines, Performance and Images. Load only what shows. No layout reads that serve nothing (render() reads two `getBoundingClientRect` per spring frame for the dead branch). The code's own `ponytail:` note at `site.js:398` already asks for this removal.
- **What is wrong:** The scroll grow was cut on 11 November, but the first scroll still switches the Grace One card to `80vw`. On a 1x desktop display, the screen most office hiring managers use, that throws away the 640 px file and downloads the 1500 px one for a card that never grows. At 1440 px the size goes from 605 to 1152 CSS px. The leftover `.leadbar` is also not hidden. `site.css:210` sets `display: none` and then `display: flex` in the same rule, so the box sits in the DOM at opacity 0.
- **Proposed fix:** Delete it.

```diff
- addEventListener('scroll', () => { lead.sizes = '(min-width: 1280px) 80vw, (min-width: 900px) 42vw, 100vw' }, { once: true, passive: true })
  // render(): keep the focus-row path, drop the stage branch, the leadbar writes and the rr/cr reads
- <p class="leadbar" aria-hidden="true">...</p>
```

- **Effort:** 20 minutes, then a hover pass over the row at 1280 and 1440 px.
- **Overlap with phase 2:** None. It follows from Thomas's 11 November cut.

### 5. A 35 KB script blocks first render on every page

- **Where:** `src/layouts/Base.astro:78` (`<script is:inline src="/site.js">`, no `defer`), `public/site.js` (1,151 lines, 35,782 bytes minified).
- **Skill and rule:** vercel-react-best-practices, `rendering-script-defer-async`: "Use defer or async on script tags". The rule is written for React but covers any script tag.
- **What is wrong:** Only about the first 125 lines need to run before first paint. That is the `js`/`motion`/`still`/`intro` classes, the `?f=` filter, and the `pageswap`/`pagereveal`/`pageshow` listeners for the grow. Everything else already waits for `DOMContentLoaded` through `ready()`. Still, the parser stops for the whole file on a recruiter's first visit, which usually comes cold from a phone link in LinkedIn or email. The file is cached for only 4 hours (`cache-control: max-age=14400, must-revalidate`, checked live), so later visits pay a revalidation round trip too.
- **Proposed fix:** Split it. Put the head-critical part in a small `/head.js`, kept where `site.js` is now, and load the rest with `defer`. The one coupling to handle: `pageshow` calls `menu()` and `pagereveal` calls `intro()`/`assemble()` (`site.js:97`, `:104`, `:119-122`). Have head.js record what happened, for example `html.dataset.reveal = 'plain' | 'grown'`, and have site.js act on it.

```diff
- <script is:inline src="/site.js"></script>
+ <script is:inline src="/head.js"></script>
+ <script is:inline defer src="/site.js"></script>
```

Add `dist/head.js` to the esbuild minify step in `package.json`'s `build` script.

- **Effort:** 1.5 to 2 hours. The split is mechanical. Most of the time goes to checking the grow and shrink-back in Chrome, Safari 26 and Firefox (the Firefox path at `site.js:118`), and a Back restore from bfcache.
- **Overlap with phase 2:** L3, the one gate script, should time this. Compare first paint before and after on the same slow-4G profile used for the 1.66 s LCP baseline.

## 2. Later

- `src/components/Contents.astro:23,31`: the scroll handler reads every heading's `getBoundingClientRect` on every scroll event, unthrottled. One IntersectionObserver does the same job (WIG Performance: batch reads).
- `src/components/Liquid.astro:125,133`: each glass button adds its own window-level `pointermove`, `pointerup` and `pointercancel` listeners. One shared set would do (react-best-practices `client-event-listeners`, by analogy).
- `src/components/Liquid.astro:355` with `src/styles/glass.css:261`: `menu()` builds a LiquidGlass clone of the nav at every width, but on desktop its knob is `display: none`. Build it on the first open under 900 px (`bundle-conditional`).
- `public/site.js:9`, `src/components/Liquid.astro:22`, `src/components/foot/sky.ts:72`, `src/components/wall/scrub.ts:3`, `src/components/foot/FootAscii.astro:166`: reduced motion is read once. If a reader turns it on mid-visit, nothing changes until the next page (WIG Animation).
- `src/styles/site.css:4-11`: every face uses `font-display: block`. Geist Medium (`:6`) is not preloaded, so medium-weight text stays invisible until it arrives. Endless can keep `block` for its fitted sizes. Geist and Geist Medium could use `swap`, since their fallback metrics are close (WIG Performance).
- `src/styles/site.css:191`: the home focus row animates each card's `width` every frame, which means layout on every frame. It is fine at four cards, but the L3 frame-timing trace should measure it (WIG: animate transform and opacity only).
- `astro.config.mjs:12`: `inlineStylesheets: 'always'` puts about 98 KB of CSS (about 20 KB gzipped) inside every HTML page, downloaded again on each navigation. Prerendering hides this on case pages. Measure `'auto'` against it before changing anything.
- `src/components/foot/Flow.astro:161`: the weather refresh runs every 5 minutes even while the footer is off screen. Gate it on the same in-view flag `loop()` uses.
- `src/components/home/ResultsDrawn.astro:136`, `src/styles/site.css:206`: `outline: none` on focus-visible. Both have a working replacement (the cell outline at `:134`, and the size plus title underline at `site.css:284`). No change needed. Listed so a future audit does not flag them again.
- Brand names (Nydex, Underline, TAKD, Endless) have no `translate="no"`, so Chrome's auto-translate can garble them for a recruiter reading in another language (WIG Locale). Low value.

## 3. Skills run and skipped

- **web-design-guidelines: ran.** The rules came from the current `vercel-labs/web-interface-guidelines` `command.md`, fetched today. Checked against `src/layouts/Base.astro`, `src/pages/index.astro`, `projects.astro`, `projects/[slug].astro`, `src/components/` (Bar, AskA, Frame, Contents, Liquid, Weeks, Acuity, ResultsDrawn, wall/Scrub and scrub.ts, foot/FootAscii, Flow and sky.ts), `src/styles/site.css`, `src/styles/glass.css`, `public/site.js` and `public/_headers`, plus the built `dist/` for heading order and script tags. Findings 1 to 4 and most of the Later list come from it. Dark-mode rules were skipped on purpose: the phase-2 rule is "never dark mode".
- **vercel-react-best-practices: ran, with almost nothing to apply.** The site has one React island, `src/components/Notes.tsx` (Agentation). It renders only on preview builds (`Base.astro:95`, `PUBLIC_NOTES === '1'`) with `client:only="react"`, so production ships no React. The built home, case and Work pages load no island script. No island uses `client:load`, and none needs to move to `client:visible` or `client:idle`. The Next.js, RSC and server rules do not apply. The general rules that do carry over to plain scripts gave finding 5 and two Later lines.
- **vercel-react-view-transitions: ran. Verdict: the current setup already fits; no change proposed.** The site already uses the native cross-document View Transition API. That covers `@view-transition { navigation: auto }` at `site.css:719`, the named `tkd-img`/`tkd-title` shared elements set in `pageswap`/`pagereveal` (`site.js:77-117`), and a same-document `startViewTransition` for the wall filters with `view-transition-class: wall` (`site.js:295-299`, `site.css:740-746`). It also has the skill's reduced-motion fallback (`site.css:982-984`). Of the skill's priority list, that is pattern 1 (shared element), 3 (list identity), 4 (enter and exit, done in WAAPI for the viewer) and 5 (route change). Astro's `<ClientRouter />` would be a step back. It replaces full navigations with fetch-and-swap, which bypasses the speculation-rules prerender (`Base.astro:43-46`) that makes the grow start from a page already drawn. It would also add a client router to every page. One option was considered and rejected: the skill's advice to use a directional slide instead of a fade on pages with a shared morph. The site's root fade already clears the old page before the new one arrives (`site.css:722-724`), and a slide would add travel that the one-moment-per-page rule does not allow.
- **vercel-optimize: skipped.** The site runs on Cloudflare Pages, not Vercel, so its Vercel-platform checks do not apply.
