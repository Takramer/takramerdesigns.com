// The ten projects, in the live site's order (07 decision 8). Slugs are the live URLs.
// Copy: synthesis/10-copy-v3.md, sections 1.1 to 2.5 and 5. Images: src/assets.

export type Tag = 'brand' | 'product' | 'engineering'
// video: a short muted clip in public/ that plays over the still while in view (round 4). Only for
// what a still can't show, such as a component that moves. film: the clip waits on its poster (the
// film's first frame) until pressed, as for the P3 case films of real use (6 November).
export interface Shot { src: string; alt: string; label?: string; video?: string; film?: boolean }
// A sheet lays its crops out at one scale, each as wide as its source in CSS px (the -2x or -3x at the
// end of the file name), on a 1px ink rule: a component sheet, not a row of screens (N21).
export interface Plate { caption: string; shots: Shot[]; sheet?: boolean }
export interface Project {
  slug: string
  num: string
  name: string
  line: string // the index's four-word outcome
  claim: string // one claim everywhere: cover, home section, case page
  result?: string // home's More projects row, only where the case measured one (research/26, R1)
  thumb: string
  alt: string
  tags: Tag[]
  facts: [role: string, year: string, made: string, client: string]
  title: string // under 60 characters
  description: string // under 155
  lede: string
  // Round 7 (a product designer's note, 5 November): why the work was needed, and what it changed.
  // Sources: the old site's Problem and Outcome paragraphs (research/02a), the vault's Nydex and
  // Underline pages, and this file's stories. No new figures.
  problem: string
  impact: string
  credit?: string
  // Links under the facts (6 November): the live site, the full deck. Prototypes add their own.
  links?: [text: string, href: string][]
  // A figure can open its proof (I4, 4 November): the pages, the components or the test names.
  figures?: [value: string, caption: string, proof?: 'pages' | 'components' | 'tests'][]
  outcomes?: string[]
  gallery?: Plate[]
  story?: { h: string; p: string[] }[] // short sections drawn from the archive site (research/22)
  // Figma prototypes, from the old site's CMS (_extract/cms-backup-2026-10-29.json). Each file is
  // shared "anyone with the link"; the case page loads one only when the reader asks.
  prototypes?: [label: string, url: string][]
}

export const PROJECTS: Project[] = [
  {
    slug: 'nydex',
    num: '01',
    name: 'Nydex',
    line: 'Trading workstation, built solo',
    claim: '300+ automated tests, built solo.',
    thumb: 'thumbs/nydex.jpg',
    alt: 'Nydex’s landing page in a browser window over a blurred street: the headline A workstation for rule-based trading, above a scanner table',
    tags: ['product', 'engineering'],
    facts: ['Product design and front-end build, solo', '2026', 'Figma, React, Vite, Supabase, Claude Code', 'Rule-based traders'],
    links: [['Open Nydex', 'https://nydex-platform.vercel.app']],
    title: 'Nydex: trading workstation, built solo | TAKramer Designs',
    description: 'Nydex is a workstation for rule-based trading that Thomas Kramer designed and built solo, backed by more than 300 automated tests.',
    lede: 'Nydex is a workstation for rule-based trading that works with a trader’s own brokerage account; it is not a broker and gives no advice. Thomas designed and built it solo, on a token-based design system with no UI framework.',
    problem: 'Rule-based traders lose more to workflow than to missing data. Settings get lost between tests, a setup lives in screenshots and notes, and the tax cost of a strategy shows up only at year end. Most web trading screens add to it: indicator panels pile up and readouts run into each other, so the hierarchy breaks just when the data gets dense.',
    impact: 'A trader sets a strategy up once and Nydex keeps it. The same rules scan the watchlist, run against history, trade on paper and estimate the tax, in one place. Live prices tick without moving the layout, and 300+ automated tests check every change before it ships.',
    credit: 'Thomas wrote the specs and reviewed each change; he built Nydex with Claude Code.',
    figures: [['0', 'layout shift'], ['300+', 'automated tests', 'tests']],
    outcomes: [
      'Systematized the interface on design tokens, with no UI framework.',
      'Engineered a 650 ms scan to run in a Web Worker, off the main thread.',
      'Calibrated price columns to tabular numerals, so live ticks never shift the layout sideways.',
      'Audited the interface against Nielsen’s heuristics (27/40) and fixed all 3 P1 findings.',
    ],
    gallery: [
      { caption: 'Landing page', shots: [{ src: 'nydex/mock/n-landing.png', alt: 'Nydex landing page with the headline A workstation for rule-based trading and a scanner preview, on a MacBook' }, { src: 'nydex/mock/n-phone.png', alt: 'Nydex landing page on a phone: the headline, a Create free account button and the scanner preview' }] },
      { caption: 'In use: a scan in the app’s preview mode, with sample prices', shots: [{ src: 'nydex/clips/film.png', video: '/clips/nydex-film.mp4', film: true, alt: 'A 12 second silent film of the Nydex Scanner Config, marked Preview, fake prices: the pointer sets the minimum score to 2 or more and presses Run Scan, setup cards fill the Results, and the view keeps only the long setups' }] },
      { caption: 'Workflow: scan and backtest', shots: [{ src: 'nydex/mock/n-scan-backtest.png', alt: 'Nydex workflow section showing the Scan and Backtest stages with sample cards, on a MacBook' }] },
      { caption: 'Workflow: execute and account for it', shots: [{ src: 'nydex/mock/n-execute-tax.png', alt: 'Nydex workflow section showing paper positions and a tax estimate card, on a MacBook' }] },
      { caption: 'Scanner config', shots: [{ src: 'nydex/mock/n-config.png', alt: 'Nydex Scanner Config view with strategy tabs, threshold sliders and a ten-ticker watchlist, on a MacBook' }] },
      { caption: 'Strategy library', shots: [{ src: 'nydex/mock/n-library.png', alt: 'Nydex Strategy Library view describing the VWAP Confluence strategy and its thresholds, on a MacBook' }] },
    ],
  },
  {
    slug: 'underline',
    num: '02',
    name: 'Underline',
    line: 'SEC filings made readable',
    claim: 'Blocking errors in 12 briefs fell from 61 to 0.',
    thumb: 'thumbs/underline.jpg',
    alt: 'Underline’s home page in light mode, in a browser window over a blurred city skyline: the headline Read the quarter, not the headline, a brief generator and The Top Five',
    tags: ['product', 'engineering'],
    facts: ['Product design and front-end build, solo', '2026', 'Figma, React, Supabase, Vercel, Claude Code', 'Investors who read SEC filings'],
    links: [['Open Underline', 'https://underline-report.vercel.app']],
    title: 'Underline: SEC filings made readable | TAKramer Designs',
    description: 'Underline turns SEC filings into research briefs. Thomas Kramer designed and built it solo; blocking errors in 12 briefs fell from 61 to 0.',
    lede: 'Underline turns SEC 10-Q and 10-K filings into research briefs. Thomas designed and built it solo, with a check of every figure against its source filing. He tested it twice on the same six companies, 12 briefs a run, before and after he rebuilt the data layer.',
    problem: 'An investor who follows 10 to 30 stocks can read a 10-Q, but rarely has the hour and a half it takes to dig one out of EDGAR before knowing whether the quarter matters. AI summaries are faster, and they will state a figure that no filing contains.',
    impact: 'A brief now sets out the quarter with every figure traced to the filing it came from, and marks the text a model wrote apart from the numbers. On the same six companies, blocking errors in 12 briefs fell from 61 to 0, so a reader can take a figure at its word without opening EDGAR to check.',
    credit: 'Thomas wrote the specs and reviewed each change; he built Underline with Claude Code.',
    figures: [['61 to 0', 'blocking errors in 12 briefs, before and after the data rebuild']],
    outcomes: [
      'Consolidated 9 API calls into 1; data now loads in about 450 ms cold and 75 ms warm.',
      'Calibrated light and dark themes so every text and surface pair passes an automated WCAG AA contrast check.',
      'Audited the interface against Nielsen’s heuristics; its score rose from 31/40 to 34/40.',
      'Constructed two design systems in four weeks; the second, Issue, replaced Ink & Paper.',
    ],
    gallery: [
      { caption: 'Today screen', shots: [{ src: 'underline/mock/u-today.png', alt: 'Underline home screen with the headline Read the quarter, not the headline, and a brief generator, on a MacBook' }, { src: 'underline/mock/u-phone.png', alt: 'Underline Today screen on a phone: the headline, the brief generator and the quarter’s performance' }] },
      { caption: 'In use: asking for Tesla’s Q3 2026 brief', shots: [{ src: 'underline/clips/film.png', video: '/clips/underline-film.mp4', film: true, alt: 'A 12 second silent film of Underline’s Today screen: the pointer types TSLA, presses Generate brief, the four working steps show, then Tesla’s Q3 2026 brief opens with a C minus grade and scrolls to The signal and Red flags' }] },
      { caption: 'Earnings brief', shots: [{ src: 'underline/mock/u-brief-01.png', alt: 'Underline’s Tesla Q3 2026 earnings brief, on a MacBook: a C minus grade, 62 out of 100, the headline Tesla, Inc., five sub-scores, and key figures with a signal paragraph below' }] },
      { caption: 'Key financials', shots: [{ src: 'underline/mock/u-brief-03.png', alt: 'Underline’s Tesla brief, on a MacBook, Key financials section: diluted EPS of $0.22, down 43.6%, free cash flow, cash and revenue, with margins and a percentile ranking against other companies' }] },
      { caption: 'Scorecard', shots: [{ src: 'underline/mock/u-brief-05.png', alt: 'Underline’s Tesla brief, on a MacBook, Scorecard section: letter grades and scores for revenue quality, margin trajectory, balance sheet, management credibility and forward visibility, above a six-quarter hindsight table' }] },
      { caption: 'Top five', shots: [{ src: 'underline/mock/u-top-five.png', alt: 'Underline Top five cards for NVDA, AAPL, GOOGL, MSFT and AMZN above the reporting calendar, on a MacBook' }] },
      { caption: 'Earnings calendar', shots: [{ src: 'underline/mock/u-calendar.png', alt: 'Underline earnings calendar listing the companies that report each day of the week, on a MacBook' }] },
      { caption: 'Dark theme', shots: [{ src: 'underline/mock/u-dark.png', alt: 'Underline home screen in its dark theme, on a MacBook' }] },
    ],
  },
  {
    slug: 'grace-one-church',
    num: '03',
    name: 'Grace One Church',
    line: '16 pages, 36 components',
    claim: '16 pages share one set of 36 components.',
    thumb: 'thumbs/grace-one-church.jpg',
    alt: 'Grace One Church’s home page on a desktop display: the church building under the words Welcome to Grace One Church, and a Worship with us button',
    tags: ['brand', 'product'],
    facts: ['Creative direction, site design and Framer build', '2025 to 2026', 'Figma, Framer, Claude Code', 'Grace One Church, English Ministry'],
    title: 'Grace One Church: 16 pages, 36 components | TAKramer Designs',
    description: 'Thomas Kramer redesigned Grace One Church’s English Ministry website around first-time visitors and built it in Framer: 16 pages, 36 components.',
    lede: 'Thomas redesigned Grace One Church’s English Ministry website around first-time visitors and built it in Framer. Every page ends on the same two steps: plan a visit or send the connect form.',
    problem: 'The English Ministry site worked like a bulletin board. Service times and ministries were there, but scattered, out of date and written for insiders. The main connect form sat on its own page as a Google Form, so a first-time visitor who found the church by search had no clear next step, and most attention fell away after the first screen.',
    impact: 'A newcomer can now confirm the service time and place, find the ministry for their age group, and plan a visit or send the connect form from any page, in one pass. Members reach the weekly schedule and Life Groups with less searching, and the copy and calls to action can change after handoff as ministry priorities do.',
    story: [
      { h: 'The brief', p: [
        'Grace One Church’s English Ministry site had the basics: service times, ministries and contact details. Visitors still had to work hard to learn who the church is, what worship is like and how to take a next step. Weak copy, unclear hierarchy and few calls to action meant most attention fell away after the first screen.',
        'Thomas gave the site one main job: to be a clear, trustworthy front door that turns a search into a visit, a connect form, a group or a reason to come back. Its second job is to give members quick access to schedules, ministries and resources.',
      ] },
      { h: 'Diagnosis', p: [
        'Thomas found that the old site worked like a bulletin board. The facts were there, but scattered, out of date, thin and written for insiders. Legacy navigation and overlapping sections made simple questions hard to answer: who this church is, what worship is like and what it offers someone at a given stage of life.',
        'The paths to act were weak. The main call to connect sat on its own page, inside a Google Form, so interest stalled before it became a visit or a lead. The type, spacing and grid did not reflect a warm, multicultural, multigenerational church, and they made the age-based ministries slow to scan.',
      ] },
      { h: 'Process', p: [
        'Thomas treated the redesign as two problems at once: structure and visual language. He tested structure and hierarchy in Figma before he built anything in Framer.',
        'He rebuilt the home page as one sequence: welcome, worship, weekly rhythm, ministries and connection. He set a simple grid, repeated section structures and card modules, so a visitor can scan any page the same way. He tuned type and color to give the main actions, Plan Your Visit and Connect, the most weight.',
      ] },
      { h: 'Outcome', p: [
        'The home page now walks a visitor through a welcome, worship details, the weekly rhythm, the ministries and a call to connect. The copy speaks to first-time guests and families, not only to long-time members. Navigation, hero and footer repeat the same actions, and a new Plan Your Visit page points toward an in-person visit.',
        'A newcomer can confirm the service time and place, get a sense of worship and preaching, see ministries for babies, kids, students, young adults and families, then send the connect form or plan a visit in one pass. Members reach the weekly rhythm, Life Groups, age-based ministries and ways to serve with less searching.',
      ] },
      { h: 'After handoff', p: [
        'Thomas built the site so its copy, layout and calls to action can change after handoff, guided by ministry priorities, analytics and newcomers’ stories of how they found the church.',
      ] },
    ],
    credit: 'The logo belongs to the church; the rest of the creative direction is Thomas’s.',
    links: [['Visit the new site', 'https://graceonechurch.framer.website']],
    figures: [['16', 'pages', 'pages'], ['36', 'components', 'components']],
    outcomes: [
      'Architected the home page as one sequence: welcome, worship, weekly rhythm, ministries and connection.',
      'Standardized spacing on an 8-point scale in place of 11 ad hoc values, with 44 px touch targets.',
      'Calibrated mobile body text from 12 px to a 16 px floor.',
      'Consolidated feedback from 5 stakeholders into one change table.',
    ],
    gallery: [
      { caption: 'Home page', shots: [{ src: 'grace-one/mock/g-home.png', alt: 'Grace One Church home page with the worship team on stage, the Sunday service time and a Plan your visit button, on a MacBook' }, { src: 'grace-one/mock/g-phone.png', alt: 'Grace One Church home page on a phone: Welcome to Grace One, the Sunday service time and a Plan your visit button' }] },
      { caption: 'Our ministries on the home page', sheet: true, shots: [
        { src: 'grace-one/components/ministries-2x.png', label: 'Desktop, 1440 px', alt: 'Grace One Church’s Our ministries section on a desktop: eight cards in two rows, from GO Kids to Need help?, each with an arrow and a colored edge along the bottom' },
      ] },
      { caption: 'Your first Sunday on the home page: four step cards that stack over each other as the visitor scrolls', sheet: true, shots: [
        { src: 'grace-one/clips/first-sunday.png', video: '/clips/grace-one-first-sunday.mp4', label: 'Steps 01 to 04, scrolled', alt: 'A clip of the Your first Sunday section scrolling: four step cards, each a photo beside a numbered step, stack over each other: 01 Park, 02 Walk in, 03 Find your class and 04 Find a seat, then a line that says See you soon with a Plan your visit button' },
      ] },
      { caption: 'Sections from the Worship and Give pages', sheet: true, shots: [
        { src: 'grace-one/components/sunday-morning-2x.png', label: 'Your Sunday morning', alt: 'Your Sunday morning section: four times in large serif numerals from 9:15 a.m. to 11:00 a.m., each with its buttons on one line and a short note on Sunday School, worship or the livestream' },
        { src: 'grace-one/components/ways-to-give-2x.png', label: 'Three simple ways to give', alt: 'Three simple ways to give section: Online, By text and By check cards side by side, each with its own button or address' },
      ] },
      { caption: 'Questions on the Worship page, beliefs on the About page', sheet: true, shots: [
        { src: 'grace-one/components/good-to-know-2x.png', label: 'Good to know', alt: 'Good to know section: five questions in a ruled list, the first two open to show their answers about kids during worship and the English service, and an email link for other questions' },
        { src: 'grace-one/components/beliefs-2x.png', label: 'Our beliefs', alt: 'Our beliefs section: eight beliefs in a ruled list, The Bible and God open to show the statement and its scripture references in brown, the rest closed with a plus' },
      ] },
      { caption: 'The home page’s theme panel and the GO Kids programs', sheet: true, shots: [
        { src: 'grace-one/components/verse-and-vision-2x.png', label: 'Our 2026 theme', alt: 'A dark blue panel with the church’s 2026 theme, Holy to the Lord, and a passage from Exodus 28:36 to 38 in large serif type' },
        { src: 'grace-one/components/our-programs-2x.png', label: 'Our programs', alt: 'Our programs section on the GO Kids page: six cards in two rows, from Little ones to Friday program, each with its ages or day in red and a Details link' },
      ] },
      { caption: 'The weekly schedule on the home page: a code override underlines today’s day, New York time', sheet: true, shots: [
        { src: 'grace-one/components/schedule-2x.png', label: 'Weekly schedule', alt: 'Grace One Church’s weekly schedule: Sunday to Saturday in serif type, each day’s times, events and places, with the ministry name in its own color and an arrow; Wednesday is underlined as today' },
      ] },
      { caption: 'The missions page’s globe, a code component that spins and marks where the church’s missionaries serve', sheet: true, shots: [
        { src: 'grace-one/clips/globe.png', video: '/clips/grace-one-globe.mp4', label: 'Our missionaries', alt: 'A clip of the Our missionaries section: a short paragraph beside a dark blue globe that turns from Africa to East Asia, its labelled markers such as Egypt, Thailand and Singapore moving with it' },
      ] },
      { caption: 'Annual events on the Events page, and leader cards on the About page with photo or initials, role, email and an About fold-out', sheet: true, shots: [
        { src: 'grace-one/components/event-cards-2x.png', label: 'Annual events', alt: 'Three event cards from the Events page: Chinese New Year, CRC and Fall Festival, each with its season in color, a short description and, for two, a button' },
        { src: 'grace-one/components/staff-2x.png', label: 'Pastors and staff', alt: 'Five leader cards in a row: Rev. Bill Smith, Adam Shao, Anne-Marie Wilson shown by her initials, Rickie Zheng and Yanyan Yang, each with a role, an email link and an About fold-out' },
      ] },
      { caption: 'The footer on a desktop, and the menu and footer on a phone', sheet: true, shots: [
        { src: 'grace-one/components/footer-2x.png', label: 'We’ll save you a seat', alt: 'Grace One Church’s footer on a desktop: We’ll save you a seat with the service time, address and two buttons, four link columns, the logo, social icons and a newsletter sign-up' },
        { src: 'grace-one/components/menu-3x.png', label: 'Menu, phone', alt: 'The phone menu open: Worship, Ministries, About, Give and 中文事工 in large serif type, Plan your visit and Connect buttons, then the service time and address' },
        { src: 'grace-one/components/footer-3x.png', label: 'Footer, phone', alt: 'The footer on a phone: the same visit details and buttons, the link columns two across, the logo, social icons and the newsletter sign-up' },
      ] },
    ],
  },
  {
    slug: 'praxis',
    num: '04',
    name: 'Praxis',
    line: 'Gen Z finance app',
    claim: 'Budget, loans and every account in one app.',
    thumb: 'thumbs/praxis.jpg',
    alt: 'Praxis site on a laptop: the headline Budget As Easy As Pie, a budget pie chart and recent transactions',
    tags: ['product'],
    facts: ['Product design, creative direction', '2024', 'Figma', 'Class project, UNC Charlotte'],
    title: 'Praxis: Gen Z finance app | TAKramer Designs',
    description: 'Praxis is a Gen Z finance app and marketing site that Thomas Kramer designed and prototyped in Figma for a class project.',
    lede: 'Praxis is a Gen Z finance app and marketing site that Thomas Kramer designed and prototyped in Figma for a class project.',
    prototypes: [
      ['App', 'https://www.figma.com/proto/NjZuxqXeMG89kduUX8mheJ/Praxis_App?node-id=16-39&viewport=653%2C-560%2C0.31&t=CBmIPUwMk9cxcLVP-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=16%3A39&show-proto-sidebar=1&page-id=0%3A1'],
      ['Website', 'https://www.figma.com/proto/ZYuFAxuQDD9IFtthToap0L/Praxis_Web?node-id=42-506&viewport=-348%2C483%2C0.12&t=t529wrgz9euOjxEa-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=42%3A506&page-id=0%3A1'],
    ],
    problem: 'Many people in Gen Z start tracking their own money with accounts spread across a bank, student loans and a brokerage, and no one view of the whole. To keep a first-time user coming back, every feature had to make sense at a glance, with the number that matters shown boldly.',
    impact: 'Praxis stayed a class prototype. Thomas delivered a brand direction, a phone app and a marketing site in Figma, and the app put budgeting, student loans and every linked account in one place.',
    story: [
      { h: 'The brief', p: [
        'Praxis is a finance app for Gen Z, with a site to introduce it, made for a class at UNC Charlotte. Thomas aimed to put a young person’s whole financial picture in one app, so they could learn about money, track it and build on it.',
      ] },
      { h: 'Ideas', p: [
        'The app opens on a starter checklist, with deeper tips for anyone who wants to go further. The budget shows as a pie whose slices update in real time as the user spends, beside a list of recent transactions.',
        'A loans view shows each student loan’s balance, the interest it has built up, its daily interest and its due date. Users can link bank, savings, credit card, brokerage and retirement accounts, so every balance sits in one hub.',
        'Monthly trends and averages show patterns in spending and income, and an AI summary recaps the user’s position and suggests changes.',
      ] },
      { h: 'The site', p: [
        'Thomas designed a SaaS-style marketing site to explain the app to new users, with clear landing-page copy about what Praxis does.',
      ] },
    ],
    figures: [['5', 'account types in one hub: bank, savings, credit card, brokerage and retirement']],
    // App from Thomas's 3x Figma phone exports (round 11, the five screens he chose); site from the 1728 HiFi export cut into sections (round 10).
    gallery: [
      {
        caption: 'The app: start, budget and categories',
        shots: [
          { src: 'praxis/mock/p-01-start.png', alt: 'Praxis start screen: the Praxis mark over a purple gradient, the line Financial Freedom Tomorrow, and Sign Up and Log In buttons, on a phone', label: 'Start' },
          { src: 'praxis/mock/p-02-budget.png', alt: 'Praxis October budget: a ring chart of $1,746 spent of $2,050 above recent transactions, on sample data, on a phone', label: 'Budget' },
          { src: 'praxis/mock/p-03-categories.png', alt: 'Praxis categories: progress bars for rent, meals out, wants, grocery, shopping and miscellaneous, on sample data, on a phone', label: 'Categories' },
        ],
      },
      {
        caption: 'Profile insights and Discover',
        shots: [
          { src: 'praxis/mock/p-05-profile-insights.png', alt: 'Praxis profile: total and monthly spend, budget bars, the top category and an insight on spending, on sample data, on a phone', label: 'Insights' },
          { src: 'praxis/mock/p-06-discover.png', alt: 'Praxis Discover screen: a basics checklist and habits for a first-time user, on a phone', label: 'Discover' },
        ],
      },
      { caption: 'The site: It’s Time To Start Adulting', shots: [{ src: 'praxis/mock/p-site-01-hero.png', alt: 'Praxis site hero on a laptop: It’s Time To Start Adulting, master your money today for financial freedom tomorrow' }] },
      { caption: 'Budget As Easy As Pie', shots: [{ src: 'praxis/mock/p-site-02-budget.png', alt: 'Praxis site budget section on a laptop: the budget pie and a list of recent transactions' }] },
      { caption: 'Student loans, day by day', shots: [{ src: 'praxis/mock/p-site-03-loans.png', alt: 'Praxis site loans section on a laptop: two student loan cards with balance, interest accrued, daily interest and the payment start date' }] },
      { caption: 'Every account in one hub', shots: [{ src: 'praxis/mock/p-site-04-accounts.png', alt: 'Praxis site accounts section on a laptop: banking, savings, credit card and brokerage cards with their balances' }] },
      { caption: 'X-Ray Analysis: trends, statistics and an AI summary', shots: [{ src: 'praxis/mock/p-site-05-x-ray.png', alt: 'Praxis site X-Ray Analysis section on a laptop: cards for monthly trends, August statistics and an AI insight' }] },
    ],
  },
  {
    slug: 'healthy-campus-week',
    num: '05',
    name: 'Healthy Campus Week',
    line: 'A hand-drawn wellness week',
    claim: '5 themed days, one hand-drawn icon set.',
    thumb: 'thumbs/healthy-campus-week.jpg',
    alt: 'Healthy Campus Week, Sep 18 to 22, in a browser window: hand-drawn icons for Green Living, Free Eats, Half Day Cycle, Mindful Living and Green Eats',
    tags: ['brand'],
    facts: ['Art direction, illustration, campaign design', '2023', 'Procreate, Linearity Curve, Illustrator', 'University Recreation, UNC Charlotte'],
    title: 'Healthy Campus Week: hand-drawn campaign | TAKramer Designs',
    description: 'Healthy Campus Week 2023 for University Recreation at UNC Charlotte: five themed days and one hand-drawn icon set, art directed by Thomas Kramer.',
    lede: 'Thomas art directed Healthy Campus Week 2023 for University Recreation at UNC Charlotte. He drew the icons by hand and set five themed days across digital signage, Instagram stories, email and a web banner.',
    problem: 'University Recreation needed one identity for five days with five different subjects: sustainability, the campus food pantry, a cycling challenge, counseling and healthy eating. UNC Charlotte’s brand guidelines usually keep campus work formal, and a week meant to invite students in had to feel friendly.',
    impact: 'The hand-drawn set tied five unrelated days into one week with one look, on signage, stories, email and the web, and the brand guide let other designers extend it. The week reached about 36,000 people, with 125,000+ impressions.',
    story: [
      { h: 'The brief', p: [
        'Healthy Campus Week is NIRSA’s national wellness week. In 2023, University Recreation at UNC Charlotte used it to push students to eat better, move more and keep up wellness routines.',
        'Thomas turned the multi-day program into one campaign: event graphics, daily schedule visuals and student-facing pieces for promotion across campus.',
      ] },
      { h: 'Five themed days', p: [
        'Each day had its own theme. Monday, Green Living, centered on a sustainability event where students made micro-green habitats. Tuesday, Free Eats, promoted the Jamil Niner Food Pantry for students facing food insecurity. Wednesday, Half-Day Cycle, was NIRSA’s largest physical activity challenge.',
        'Thursday, Mindful Living, promoted Counseling and Psychological Services (CAPS). Friday, Green Eats, focused on healthy eating and a cleaner, more balanced diet.',
      ] },
    ],
    figures: [['5', 'themed days'], ['125,000+', 'impressions']],
    outcomes: [
      'Constructed one hand-drawn icon set for the week’s five themed days.',
      'Standardized one grid for type and schedule across boards, signage, stories and screens.',
      'Systematized the look in a brand guide so other designers could extend it.',
    ],
    gallery: [
      { caption: 'All week, lobby screen', shots: [{ src: 'hcw/mock/hcw-week-tv.png', alt: 'Healthy Campus Week all-week schedule, Sep 18 to 22, on a 16:9 screen' }] },
      { caption: 'Half-Day Cycle, lobby screen', shots: [{ src: 'hcw/mock/hcw-wed-tv.png', alt: 'Half-Day Cycle graphic for Wednesday, Sep 20, on a 16:9 screen: Keep the wheels turning, 8 AM to 8 PM in the UREC lobby' }] },
      {
        caption: 'Daily stories, Monday to Friday',
        shots: [
          { src: 'hcw/mock/hcw-story-1.png', alt: 'Healthy Campus Week Instagram story for Monday, Green Living, on a phone', label: 'Monday' },
          { src: 'hcw/mock/hcw-story-2.png', alt: 'Healthy Campus Week Instagram story for Tuesday, Free Eats, on a phone', label: 'Tuesday' },
          { src: 'hcw/mock/hcw-story-3.png', alt: 'Healthy Campus Week Instagram story for Wednesday, Half-Day Cycle, on a phone', label: 'Wednesday' },
          { src: 'hcw/mock/hcw-story-4.png', alt: 'Healthy Campus Week Instagram story for Thursday, Mindful Living, on a phone', label: 'Thursday' },
          { src: 'hcw/mock/hcw-story-5.png', alt: 'Healthy Campus Week Instagram story for Friday, Green Eats, on a phone', label: 'Friday' },
        ],
      },
      { caption: 'Web banner', shots: [{ src: 'hcw/05-hcw-week-4-banner-6000x2160.png', alt: 'Healthy Campus Week web banner with the full set of event illustrations' }] },
    ],
  },
  {
    slug: 'good-word',
    num: '06',
    name: 'Good Word',
    line: 'Weekly devotionals, steady growth',
    claim: '54 consecutive weeks, with reach and engagement growing steadily.',
    result: '54 weeks in a row, with reach and engagement growing.',
    thumb: 'thumbs/good-word.jpg',
    alt: 'Three Good Word Instagram posts on phones: The Armor of God, No Greater Love and What God Gives',
    tags: ['brand'],
    facts: ['Art direction', '2025 to 2026', 'Illustrator, Photoshop, Meta Ads', 'Good Word by Will Carpenter'],
    links: [['Visit the Good Word site', 'https://goodword.carrd.co']],
    title: 'Good Word: weekly devotionals | TAKramer Designs',
    description: 'Thomas Kramer designed every slide and post of Good Word, a weekly Instagram devotional, for 54 consecutive weeks. Reach and engagement grew steadily.',
    lede: 'Thomas Kramer designed every slide and post of Good Word, a weekly Instagram devotional.',
    problem: 'William Carpenter writes a seminary-level reflection each week. The ideas are dense, and a broad audience scrolling social media rarely stays for them.',
    impact: 'Good Word has posted every week for 54 consecutive weeks, in a look readers can pick out in a feed. Meta ads carried the posts to thousands of readers, reach and engagement have grown steadily, and the engagement data now points the format toward short-form video.',
    figures: [['54', 'consecutive weeks posted']],
    story: [
      { h: 'The brief', p: [
        'William Carpenter, an M.Div student, writes a weekly reflection rooted in scripture. Seminary-level writing carries a lot of meaning, but it is dense, and a broad audience scrolling social media rarely stays for it.',
        'Thomas’s task was to turn each reflection into short, visual posts without thinning the doctrine or losing William’s voice.',
      ] },
      { h: 'The system', p: [
        'Each week Thomas distills the message into a short arc and splits it slide by slide into an Instagram carousel. He pairs each theme with imagery, texture and type chosen for the tone of the passage.',
        'He set firm editorial rules: clear wording, capitals for divine pronouns (He, His, Him) and scripture references kept exactly as written. The structure still leaves room to vary the layout, because the history and context of each passage give him material to work with.',
      ] },
      { h: 'The weekly routine', p: [
        'Good Word has published every week for 54 consecutive weeks. A recurring set of type, color and image motifs marks each post as part of the series.',
        'Thomas and William edit together each week to tighten the language and the flow while keeping William’s voice. Engagement data now guides a move from still posts toward short-form video.',
      ] },
      { h: 'Outcome', p: [
        'The steady format has given the message a brand of its own, and the visual approach makes hard scripture easier for lay readers to follow without cutting its substance. With Meta ads, the posts have reached thousands of readers.',
        'The method repeats: pair a subject expert with strict editorial and design rules, and keep going long enough for the format itself to become familiar.',
      ] },
    ],
  },
  {
    slug: 'operationshero',
    num: '07',
    name: 'OperationsHERO',
    line: 'Six wings, six features',
    claim: '6 wing sections, one for each product feature, pitched to the company’s CMO.',
    thumb: 'thumbs/operationshero.jpg',
    alt: 'OperationsHERO mailers with the headline An earthquake has fractured the Colosseum! over a brick-built Colosseum',
    tags: ['brand'],
    facts: ['Brand identity, advertising, packaging', '2024', 'Illustrator, BrickLink Studio, Photoshop', 'Class project, UNC Charlotte'],
    links: [['See the full pitch deck', '/projects/operationshero/deck']],
    title: 'OperationsHERO: six wings, six features | TAKramer Designs',
    description: 'In a class project, Thomas Kramer rebranded OperationsHERO and split the logo’s wings into six sections, one for each product feature.',
    lede: 'In a class project, Thomas Kramer rebranded OperationsHERO.',
    problem: 'OperationsHERO makes maintenance software for schools. Its team averages 25 years in the field, and the product launched in 2021. The product had moved on and the brand had not: mixed type, mismatched icons and a logo with no clear tie to what the company does.',
    impact: 'Thomas pitched the refresh to the company’s Chief Marketing Officer. The logo keeps the old wings but splits them into six sections, one for each product feature, so the mark now explains what the company sells. The pitch carried new type and color, LEGO-style posters and a branded mailer.',
    figures: [['6', 'wing sections, one for each product feature']],
    story: [
      { h: 'Audience', p: [
        'OperationsHERO builds maintenance software for schools. Its buyers are school administrators, officials and the technicians who do the work. Most sales happen at conventions and by word of mouth, so graphics were never the main sales tool.',
        'Thomas also aimed the refresh at students, the people who use the building and never see who keeps it running.',
      ] },
      { h: 'Goal', p: [
        'The company was founded in the Cary and Raleigh area in the early 1990s and launched OperationsHERO in 2021. The product had moved on and the identity had not: the website used many type families, the icons did not match and the logo did not explain the company.',
        'Thomas set out to give it a current logo, color and type, plus an ad and a gift that could go in front of a real client.',
      ] },
      { h: 'The mark', p: [
        'The old wings were hard to read and had no link to the work. Thomas kept them, refreshed the strokes and split them into six sections, one for each core feature: work, inventory, planning, events, automation and energy. They also nod to North Carolina, first in flight.',
        'The head of a socket wrench forms a hexagon that reads as a nut, a nod to the work. The outer ring is the O and a slanted H carries the name. The circle can stand on its own when there is no room for the wings.',
      ] },
      { h: 'Type and color', p: [
        'Thomas replaced the website’s many type families with one, Acumin Variable, whose width, weight and slant change inside a single family. He lightened the sky blue, moved the dark blue to navy, adjusted the orange and added an off-white, with the mobile app in mind.',
        'He redrew the icon set with an active state for each of the six features, then built three patterns from the system: the icons, circuit-board traces and the logo’s hexagons.',
      ] },
      { h: 'Advertising', p: [
        'The posters speak to two readers. Children get a toy and a "Hey!", and administrators get a repair they already understand.',
        'Thomas modeled them on early-2000s LEGO commercials, which name the problem and then show the fix. A Colosseum set, famous for its damage and constant repair, carries the maintenance story.',
      ] },
      { h: 'Packaging', p: [
        'A branded mailer shows what a client could leave with. Every face carries the brand, and the inside uses the new icon pattern with a line that asks the reader to act. The gift is a hard hat marked with the logo and a field of hexagons.',
      ] },
    ],
    gallery: [
      { caption: 'The logo suite', shots: [{ src: 'operationshero/07-operationshero-logo-suite-2880x1920.png', alt: 'OperationsHERO logo suite: the winged H mark in navy, light blue and orange, with the wordmark, type and colors' }] },
      { caption: 'Wings, wrench and O-H', shots: [{ src: 'operationshero/07-operationshero-deck-07-components-2880x1620.png', alt: 'OperationsHERO pitch deck, Components: the mark broken into its wings, its socket-wrench head and the O and slanted H' }] },
      {
        caption: 'The ad pair',
        shots: [
          { src: 'operationshero/07-operationshero-magazine-ad-2588x3338.jpg', alt: 'OperationsHERO magazine ad: a brick-built Colosseum under the headline An earthquake has fractured the Colosseum!, a minifigure soldier calling Hey! and the line Easily schedule repairs with OperationsHero', label: 'Magazine' },
          { src: 'operationshero/07-operationshero-web-ad-2048x2048.jpg', alt: 'OperationsHERO square web ad: The Colosseum fell apart! Quickly order new pieces with OperationsHero, over the brick-built Colosseum and a minifigure calling Hey!', label: 'Web' },
        ],
      },
      { caption: 'Icon set', shots: [{ src: 'operationshero/07-operationshero-deck-10-icon-set-2880x1620.png', alt: 'OperationsHERO pitch deck, Refreshed Icon Set: the six core features in outline and active states, with tool icons' }] },
      { caption: 'Patterns', shots: [{ src: 'operationshero/07-operationshero-deck-08-patterns-2880x1620.png', alt: 'OperationsHERO pitch deck, Patterns: an icon pattern, circuit-board traces and a hexagon grid' }] },
      { caption: 'Mailer and hard hat', shots: [{ src: 'operationshero/07-operationshero-deck-09-packaging-2880x1620.png', alt: 'OperationsHERO pitch deck, Packaging and Gift: an orange and navy mailer box lined with the icon pattern, and an orange hard hat with the logo' }] },
    ],
  },
  {
    slug: 'love-your-body-week',
    num: '08',
    name: 'Love Your Body Week',
    line: 'A campus body-positivity campaign',
    claim: '28 print and digital pieces in one look, from a phone story to a 24 by 36 A-frame.',
    result: 'Reached about 36,000 people, with 125,000+ impressions.',
    thumb: 'thumbs/love-your-body-week.jpg',
    alt: 'Love Your Body Week schedule in a browser window: a cycling class, gentle yoga and a brunch, beside a student portrait',
    tags: ['brand'],
    facts: ['Art direction, campaign design', '2024', 'Illustrator, InDesign, Photoshop', 'University Recreation, UNC Charlotte'],
    title: 'Love Your Body Week: a campus campaign | TAKramer Designs',
    description: 'Love Your Body Week 2024, a campus body-positivity campaign that Thomas Kramer art directed for University Recreation at UNC Charlotte.',
    lede: 'Love Your Body Week 2024 was a campus body-positivity campaign that Thomas Kramer art directed for University Recreation at UNC Charlotte.',
    problem: 'University Recreation needed Love Your Body Week to reach students in print and on screens, from a phone story to a 24 by 36 A-frame, inside tighter color and budget limits than one format would set.',
    impact: 'The 28 pieces held one look, built from reusable assets, so a student met the same campaign on a story, a poster or a web ad. The week reached about 36,000 people, with 125,000+ impressions.',
    figures: [['28', 'print and digital pieces'], ['125,000+', 'impressions']],
    story: [
      { h: 'The brief', p: [
        'UNC Charlotte’s Health and Wellbeing Unit held Love Your Body Week from February 19 to 23, 2024, to promote a positive body image and overall wellbeing. The Center for Wellness Promotion and University Recreation hosted the events.',
        'Thomas built a campaign system for the week through art direction, print pieces and digital assets, so the week would feel approachable and be easy to recognize.',
      ] },
      { h: 'Print and digital', p: [
        'The campaign used both print and digital pieces. Working in both added constraints, such as color and budget, that a single format would not have.',
      ] },
      { h: 'The week', p: [
        'Instagram Stories carried the schedule to students. Tuesday offered a cycling class with a low barrier to entry. Wednesday held Fueling Self-Love, a seminar on body positivity. Thursday was a guided gentle yoga class built on deep stretches and relaxation. Friday closed with an interactive brunch demo of healthier swaps for sugary morning meals.',
      ] },
    ],
    // From Thomas's final exports on the T7 (Freelance/UREC/LYBW_LoveYourBodyWeek), round 9.
    gallery: [
      { caption: 'Lobby screen', shots: [{ src: 'lybw/mock/lybw-sign.png', alt: 'Love Your Body Week schedule on a 16:9 screen: a cycling class, Fueling Self Love, gentle yoga and a brunch, February 20 to 23, beside a student portrait' }] },
      {
        caption: 'Instagram stories, Tuesday to Friday',
        shots: [
          { src: 'lybw/mock/lybw-story-1.png', alt: 'Love Your Body Week story for the cycling class, a student on a spin bike, on a phone', label: 'Tuesday' },
          { src: 'lybw/mock/lybw-story-2.png', alt: 'Love Your Body Week story for Fueling Self-Love, a student in sunglasses, on a phone', label: 'Wednesday' },
          { src: 'lybw/mock/lybw-story-3.png', alt: 'Love Your Body Week story for gentle yoga, a student in a stretch, on a phone', label: 'Thursday' },
          { src: 'lybw/mock/lybw-story-4.png', alt: 'Love Your Body Week story for the Friday brunch, a student holding flowers, on a phone', label: 'Friday' },
        ],
      },
      {
        caption: 'Print, from a handbill to a 24 by 36 A-frame',
        shots: [
          { src: 'lybw/08-lybw-print-aframe-1601x2400.png', alt: 'Love Your Body Week 24 by 36 inch A-frame sign with the week’s schedule', label: 'A-frame' },
          { src: 'lybw/08-lybw-print-11x17-1553x2400.png', alt: 'Love Your Body Week 11 by 17 inch poster with the week’s schedule', label: '11 x 17' },
          { src: 'lybw/08-lybw-print-handbill-front-1855x2400.png', alt: 'Love Your Body Week handbill front: the four events with their times and places', label: 'Handbill' },
          { src: 'lybw/08-lybw-print-handbill-back-1855x2400.png', alt: 'Love Your Body Week handbill back: a QR code over the gradient', label: 'Back' },
        ],
      },
      {
        caption: 'Instagram posts',
        shots: [
          { src: 'lybw/08-lybw-post-1-1081x1081.png', alt: 'Love Your Body Week square post: Spin', label: 'Spin' },
          { src: 'lybw/08-lybw-post-2-1081x1081.png', alt: 'Love Your Body Week square post: Fuel', label: 'Fuel' },
          { src: 'lybw/08-lybw-post-3-1081x1081.png', alt: 'Love Your Body Week square post: Relax', label: 'Relax' },
          { src: 'lybw/08-lybw-post-4-1081x1081.png', alt: 'Love Your Body Week square post for the Friday brunch', label: 'Brunch' },
        ],
      },
      { caption: 'Web banner', shots: [{ src: 'lybw/08-lybw-web-banner-3001x1001.png', alt: 'Love Your Body Week web banner: the LYBW wordmark and a student portrait over the gradient' }] },
    ],
  },
  {
    slug: 'lumen',
    num: '09',
    name: 'Lumen',
    line: 'Home energy app prototype',
    claim: 'Thomas designed the onboarding and feature set, tested with the client and outside users.',
    thumb: 'thumbs/lumen.jpg',
    alt: 'Three Lumen app screens on phones: a home energy summary by room, a Learn article and a living room usage chart',
    tags: ['product'],
    facts: ['Product design, UX and UI (team project)', '2024', 'Figma', 'Class project, UNC Charlotte'],
    title: 'Lumen: home energy app prototype | TAKramer Designs',
    description: 'Lumen is a home energy app from a team class project. Thomas Kramer designed its onboarding and feature set.',
    lede: 'Lumen is a home energy app from a team class project.',
    prototypes: [['App', 'https://www.figma.com/proto/JdXgG3DfY6zipNEJJsJNVM/Lumen?node-id=92-723&viewport=188%2C429%2C0.07&t=4WGxQXTx9BrJfotm-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=92%3A723&page-id=0%3A1']],
    problem: 'Home energy data usually arrives as kilowatt-hours on a bill, with no tie to the rooms or habits behind it. Lumen’s mission was to make that data, and its carbon cost, feel approachable instead of technical.',
    impact: 'Client stakeholders and outside users tested the prototype, and their feedback shaped the onboarding and features Thomas designed. The team handed over the app with a report on personas, journeys, architecture and branding.',
    story: [
      { h: 'The brief', p: [
        'Lumen is a home energy app, made for a class at UNC Charlotte. It turns complex utility data into a calm interface where people can view, manage and learn about the power their home uses, with the focus on their own carbon impact.',
      ] },
      { h: 'Ideas', p: [
        'Users can set reminders to stop wasting energy, set goals to use less and learn how to change their habits at home. Thomas kept the setup of the home short and simple.',
      ] },
      { h: 'Goals', p: [
        'The Goals screen sets a target against last month’s numbers. In the sample, the user’s goal is to cut the energy bill by 20% over the next three months: $210 now against a goal of $168, and 842 kWh against 498. A link under the goal asks How can I do this? and leads to tips.',
        'Further down, a chart tracks daily use and another sets the household against the average home, so the user can see whether a habit is paying off.',
      ] },
    ],
    figures: [['4', 'app sections: House, Reminders, Goals and Learn']],
    gallery: [
      {
        caption: 'Setup, from the splash screen to the home summary',
        shots: [
          { src: 'lumen/mock/l-01-splash.png', alt: 'Lumen splash screen: a hanging light bulb over the name Lumen and a Setup Your Home button, on a phone', label: 'Splash' },
          { src: 'lumen/mock/l-04-house-set-up.png', alt: 'Lumen home setup screen counting the items added in each room, on a phone', label: 'Home setup' },
          { src: 'lumen/mock/l-09-home-3.png', alt: 'Lumen home summary with energy use for each room, 600 kWh in all, on sample data, on a phone', label: 'Home summary' },
        ],
      },
      {
        caption: 'In the app: a room, goals and Learn',
        shots: [
          { src: 'lumen/mock/l-06-living-room.png', alt: 'Lumen living room screen: 300 kWh and 134 lbs of CO2, split across a TV, a fan, the outlets and a light, with a chart 3% below last month, on sample data, on a phone', label: 'Living room' },
          { src: 'lumen/mock/l-08-goals.png', alt: 'Lumen Goals screen: a goal to cut the energy bill by 20% over three months, $210 now against a $168 goal and 842 kWh against 498 kWh, on sample data, on a phone', label: 'Goals' },
          { src: 'lumen/mock/l-10-learn.png', alt: 'Lumen Learn screen with an article card from the Environmental Protection Agency, on a phone', label: 'Learn' },
          { src: 'lumen/mock/l-11-article.png', alt: 'Lumen Learn article from the Environmental Protection Agency: 10 Steps to Reduce Your Carbon Footprint at Home, on a phone', label: 'Article' },
        ],
      },
    ],
  },
  {
    slug: 'the-flavor-scroll',
    num: '10',
    name: 'The Flavor Scroll',
    line: 'Thesis brand for restaurants',
    claim: '3 products and a public exhibition, to help Asian-owned restaurants reach younger diners.',
    thumb: 'thumbs/the-flavor-scroll.jpg',
    alt: 'The Flavor Scroll site in a browser: the headline Discover Vibrant Flavors Across Charlotte, restaurant cards and a map',
    tags: ['brand', 'product'],
    facts: ['Brand identity, product design, creative direction', '2025', 'Figma, Illustrator', 'BFA thesis, UNC Charlotte'],
    title: 'The Flavor Scroll: a thesis brand | TAKramer Designs',
    description: 'The Flavor Scroll is Thomas Kramer’s BFA thesis: a brand that helps Asian-owned restaurants reach younger diners.',
    lede: 'The Flavor Scroll is Thomas Kramer’s BFA thesis at UNC Charlotte.',
    prototypes: [['Website', 'https://www.figma.com/proto/fooQTGSFLK1RXjl4t9X7Ib/The-Flavor-Scroll?node-id=3-123&viewport=-1449%2C396%2C0.42&t=ReyRJ7ZYeLJ1E878-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=30%3A237&page-id=0%3A1']],
    problem: 'Asians are about 7% of Charlotte’s people, yet Asian restaurants make up nearly 35% of its restaurants, and many family-run spots barely show up online. Owners tend to see advertising as a cost with no clear return, so they rely on word of mouth and walk-ins, and younger diners never hear about them.',
    impact: 'The thesis gave lesser-known Asian-owned restaurants three ways to reach younger diners: a site with a map and a Feeling Lucky pick, a rewards program that tells each owner’s story on a printed scroll, and posters for whole neighborhoods and single restaurants. Thomas showed all three at a public exhibition.',
    figures: [['35%', 'of Charlotte’s restaurants are Asian, though Asians are about 7% of its people']],
    story: [
      // Research from Thomas's Drive (spring 2025 Design Research final, fall 2025 interview notes and
      // design statement), read 5 November.
      { h: 'Research', p: [
        'In a spring 2025 design research class, Thomas weighed three Charlotte problems: getting around the city with a physical disability, Asian restaurants after COVID-19, and young couples worried about the cost of having children. He chose the restaurants. His sources included CLT Asian Eats, a Facebook group that points diners to immigrant-owned spots, and the city’s Open for Business program for small firms the pandemic hurt.',
        'That fall he interviewed owners, starting with Raymond Lau, who opened Open Rice six years ago after 20 years in the trade. Lau said prices and staffing were still hard but improving, that his Yelp ads worked less well than they once did, and that being found online mattered most. The gap was being seen, not recovering, so Thomas narrowed the thesis to lesser-known Asian-owned restaurants.',
      ] },
      { h: 'The brand', p: [
        'He built the brand on China red, yellow and matcha green, with Sinerva for the logotype and Sukhumvit Set for text. The food photos came from diners and were edited to bring out each dish.',
      ] },
      { h: 'Three products', p: [
        'The website has map and grid views, filters and a Feeling Lucky envelope that picks a random restaurant; each restaurant gets a page with its location, photos, menu and story. The rewards program earns owners stickers, features on the site and printed scrolls that tell their story, and gives diners discounts. The posters cover whole neighborhoods and single restaurants.',
      ] },
    ],
    // The website from Thomas's 1440 Figma exports on a MacBook (round 9; the prototype embed overlapped cards and map), then print.
    gallery: [
      { caption: 'Home', shots: [{ src: 'the-flavor-scroll/mock/tfs-01-home.png', alt: 'The Flavor Scroll home page on a laptop: Discover Vibrant Flavors Across Charlotte, a Feeling Lucky button, restaurant cards and a map' }] },
      { caption: 'Restaurant map', shots: [{ src: 'the-flavor-scroll/mock/tfs-02-map.png', alt: 'The Flavor Scroll restaurant cards beside a Charlotte map, on a laptop' }] },
      { caption: 'Restaurant page', shots: [{ src: 'the-flavor-scroll/mock/tfs-03-restaurant.png', alt: 'The Flavor Scroll page for KPOT Korean BBQ and Hot Pot in Matthews, with Menu, Gallery and Map tabs and its story, on a laptop' }] },
      { caption: 'Feeling Lucky', shots: [{ src: 'the-flavor-scroll/mock/tfs-04-feeling-lucky.png', alt: 'The Flavor Scroll Feeling Lucky page: a red envelope to open for a random restaurant, on a laptop' }] },
      { caption: 'Owner dashboard', shots: [{ src: 'the-flavor-scroll/mock/tfs-05-owner-dashboard.png', alt: 'The Flavor Scroll owner dashboard for Open Rice on a laptop: a week of views and diners, rewards progress and ratings' }] },
      { caption: 'Visits and loyalty', shots: [{ src: 'the-flavor-scroll/mock/tfs-06-visits.png', alt: 'The Flavor Scroll visits page on a laptop: restaurants with visit counts and rewards, above a loyalty bar' }] },
      { caption: 'Posters', shots: [{ src: 'the-flavor-scroll/05-posters.png', alt: 'Three Flavor Scroll posters: Discover Eastern Flavors Through Charlotte, Support Local and Eat Local' }] },
      { caption: 'Area guides', shots: [{ src: 'the-flavor-scroll/06-area-guides.png', alt: 'Flavor Scroll print guides: Best Spots in Matthews, Best Spots in Pineville and a feature on Chokh Di Noodle House' }] },
    ],
  },
]

export const BY: Record<string, Project> = Object.fromEntries(PROJECTS.map((p) => [p.slug, p]))

// The cover leads with Grace One, then Underline, Nydex and Healthy Campus Week, with no number
// (lab picks, 31 October). The home page's index below it lists the other six, so no project shows
// twice on the page (Thomas, 4 November).
export const COVER = ['grace-one-church', 'underline', 'nydex', 'healthy-campus-week']
export const FEATURED = PROJECTS.filter((p) => !COVER.includes(p.slug))

export const FILTERS: [Tag | 'all', string, string][] = [
  ['all', 'All', 'Showing all 10 projects.'],
  ['brand', 'Brand', 'Showing 6 brand projects.'],
  ['product', 'Product', 'Showing 6 product projects.'],
  ['engineering', 'Engineering', 'Showing 2 engineering projects.'],
]

// Grace One's pages, as the home section shows them: four first screens at a laptop's 1440 x 900,
// captured from the live site on 1 November (Thomas: a laptop ratio, and fewer of them), each in Apple's
// MacBook bezel since 6 November (src/assets/grace-one/mock, made by redesign-v3/lab/ps/frame.jsx).
export const GRACE_PAGES: [file: string, label: string][] = [
  ['home', 'Home'], ['worship', 'Worship'], ['go-kids', 'GO Kids'], ['bylaws', 'Bylaws'],
]

export const NYDEX_PANELS: [file: string, label: string][] = [
  ['01-nydex-layer-1-scanner-3x-1602x579.png', 'Scanner'],
  ['01-nydex-layer-2-backtest-3x-1602x624.png', 'Backtest'],
  ['01-nydex-layer-3-execute-positions-3x-1602x678.png', 'Execute'],
  ['01-nydex-layer-4-tax-estimate-3x-1602x684.png', 'Tax estimate'],
]

// The all-week poster in the four shapes it was made in (07 5.1; 10-copy 1.2).
export const HCW_SHAPES: [file: string, label: string, alt: string][] = [
  ['05-hcw-week-1-tv-16x9-3840x2160.png', 'TV 16:9', 'Healthy Campus Week all-week schedule, Sep 18 to 22, as a TV screen'],
  ['05-hcw-week-2-board-4x3-2880x2160.png', 'Board 4:3', 'Healthy Campus Week all-week schedule, Sep 18 to 22, as a 4:3 board'],
  ['05-hcw-week-3-square-2160x2160.png', 'Square post', 'Healthy Campus Week all-week schedule, Sep 18 to 22, as a square post'],
  ['05-hcw-week-4-banner-6000x2160.png', 'Banner', 'Healthy Campus Week all-week schedule, Sep 18 to 22, as a web banner'],
]
