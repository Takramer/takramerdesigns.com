// D1 and L2 (phase 2, item 3): every live moment as data. Each value is read from the code that runs
// it (public/site.js and src/styles/site.css, 6 November 2026), not from the plans. When a moment
// changes, change it here too: redesign-v3/lab/check-motion.mjs traces each one in the browser and
// fails when the site and this file disagree.
//
// ms: the active time on a desktop. token: the time is the --vt token, so it runs 350 ms under 900 px.
// ms null: no clock; the moment follows the scroll or the pointer.
// curve: a CSS easing, 'spring' (critically damped, settled to 98% in ms) or 'linear'.

export const CURVE = 'cubic-bezier(0.22, 1, 0.36, 1)'
// --vt in site.css: 300 ms on a desktop, 350 ms under 900 px (Thomas, 1 November).
export const TOKEN = { desktop: 300, phone: 350 }

export type Part = {
  id: string
  name: string
  where: string
  trigger: string
  ms: number | null
  token?: boolean
  delay?: number
  stagger?: number
  travel: string
  curve: string
  reduced: string
}

export const MOMENTS: Part[] = [
  { id: 'I1.intro', name: 'Cover intro', where: '/ at 900 px and up', trigger: 'page load, each card once its image decodes; a card not started 1 s after load shows still',
    ms: 600, stagger: 80, travel: 'image rises from 100% below its frame, the frame counters it, the image settles from 104% to 100%; caption fades in over 480 ms from 180 ms; the point drops 8 px in 240 ms last',
    curve: CURVE, reduced: 'no intro: the four cards show at once' },
  { id: 'I1.row', name: 'Cover focus row', where: '/ at 900 px and up', trigger: 'pointer slows under 0.5 px/ms or rests 90 ms over a card; keyboard focus at once',
    ms: 300, token: true, travel: 'spans in 24ths: the focused card 10, a neighbor 6 beside an end card or 5, a far card 4',
    curve: 'spring', reduced: 'no focus: four cards at 6 each' },
  { id: 'I1.drift', name: 'Cover drift', where: '/ at 900 px and up', trigger: 'scroll through the pinned stage',
    ms: null, travel: 'hold to 15%; the lead grows to as much as 20 columns by 85%; the other three drift one column apart each and drop (0.55 + 0.15 i) of the window, gone by 60%; the caption bar rises 16 px from 85%',
    curve: 'linear', reduced: 'no stage: a still row of four' },
  { id: 'I2', name: 'Page change', where: 'every page, Chrome and Safari (Firefox loads plainly)', trigger: 'a link press that leaves for a page on the site',
    ms: 300, token: true, travel: 'the pressed card\'s image and title grow into the case hero and title, or shrink back on the way home; the old page fades in 150 ms, the new in 180 ms from 90 ms',
    curve: CURVE, reduced: 'a 120 ms cross-fade on linear, nothing grows' },
  { id: 'I4.wheels', name: 'Figures roll in', where: 'case pages with figures', trigger: 'the figures row 60% in view, once',
    ms: 300, token: true, stagger: 60, travel: 'each digit rolls up its own wheel to its value, the right-hand digit first',
    curve: CURVE, reduced: 'numbers at rest' },
  { id: 'I4.proof', name: 'Figure opens its proof', where: 'case pages with figures', trigger: 'press on a figure',
    ms: 300, token: true, travel: 'the proof panel opens from no height to its own',
    curve: CURVE, reduced: 'opens at once' },
  { id: 'I6', name: 'Wall reflow', where: '/projects', trigger: 'press on a filter',
    ms: 300, token: true, travel: 'cards glide to their new places; a card that leaves shrinks to 94% and fades in 240 ms; one that arrives fades in over 240 ms from 60 ms',
    curve: CURVE, reduced: 'the wall changes at once' },
  { id: 'I7.case', name: 'Mark build', where: 'brand case pages with a mark', trigger: 'the mark 60% in view, once; then the slider scrubs it',
    ms: 2400, travel: 'anchors (0 to 15%), handles (15 to 30%), outline (30 to 70%), fill (70 to 90%), then the plain mark',
    curve: 'linear', reduced: 'the mark drawn; the slider still scrubs' },
  { id: 'I7.logos', name: 'Mark build on /logos', where: '/logos', trigger: 'each mark half in view, once; a press ends it',
    ms: 1400, stagger: 120, travel: 'outline, then the fill, the anchors on the way',
    curve: 'linear', reduced: 'the marks drawn' },
  { id: 'I8.glide', name: 'Light table move', where: '/one-offs table view, 900 px and up', trigger: 'pan buttons, zoom buttons, or focus bringing a piece into view',
    ms: 480, travel: 'the plane moves to its new place; a drag glides on after the release, a tenth slower each frame, and springs back from an edge in 400 ms',
    curve: CURVE, reduced: 'the grid view first; moves land at once, no glide' },
  { id: 'I8.viewer', name: 'Viewer opens', where: '/one-offs', trigger: 'press or Enter on a piece; Escape, Close or the stage closes it',
    ms: 300, token: true, travel: 'the piece grows from its tile and the paper fills in behind it; the bar and caption fade in over 240 ms from 60 ms; on close it shrinks home and they fade out in 120 ms',
    curve: CURVE, reduced: 'opens and closes at once' },
  { id: 'I9', name: 'Press check', where: '/one-offs viewer, print pieces', trigger: 'press on Press check; a second press puts the plates back',
    ms: 600, travel: 'the four plates slide from register into four quarters at 49%; their ink labels fade in over the token',
    curve: CURVE, reduced: 'the plates jump apart' },
  { id: 'I10', name: 'Specimen sheet', where: 'brand case pages, plain arrival only', trigger: 'page load; the sheet holds 900 ms',
    ms: 300, token: true, delay: 900, stagger: 80, travel: 'the four parts close on the centre at 60% and fade; the hero opens from its middle over 600 ms from 160 ms',
    curve: CURVE, reduced: 'no sheet: the hero' },
  { id: 'I13', name: 'Reading size', where: '/about', trigger: 'the slider, 100 to 200% in steps of 5',
    ms: 300, token: true, travel: 'the root size eases to the slider and the page reflows; the slider holds its place in the window',
    curve: 'spring', reduced: 'the size changes at once' },
  { id: 'I14.build', name: '404 plate builds', where: '/404', trigger: 'page load',
    ms: 1200, delay: 700, travel: 'points pop in 300 ms from 300 ms; the outline draws in 1200 ms from 700 ms; the tint fills in 600 ms from 1900 ms, when the point turns live',
    curve: 'cubic-bezier(0.65, 0, 0.35, 1)', reduced: 'the plate built at once' },
  { id: 'I14.home', name: 'Point goes home', where: '/404', trigger: 'a drag let go near home, a tap, Enter or Space',
    ms: 300, token: true, travel: 'the point runs home with the outline as a rubber band; then the numerals fill in 600 ms from 150 ms',
    curve: 'cubic-bezier(0.33, 1, 0.68, 1)', reduced: 'the point lands at once' },
  { id: 'I15', name: '400% lens', where: 'case images, a fine pointer at 900 px and up', trigger: 'the pointer over a case image; a scroll or leaving puts it away',
    ms: 120, travel: 'a 176 px lens follows the pointer at 4x and fades in',
    curve: CURVE, reduced: 'the lens shows without the fade' },
]

// Where the site already departs from one curve and one 300 ms token, so a reader of this file sees
// it without the code: I1.intro, I9, I10's hero 600 ms; I7 and I1.drift linear; I14.build on its own
// curve; I14.home an ease-out cubic written in script (1 - (1 - t)^3, which is the curve above).
