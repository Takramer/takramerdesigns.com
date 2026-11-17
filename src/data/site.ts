// Site-wide facts and copy. Copy comes from redesign-v3/synthesis/10-copy-v3.md; where it and
// questions/answers.md disagree, the answers win (10-copy, opening notes).

export const SITE = 'https://www.takramerdesigns.com'
export const EMAIL = 'takramerdesigns@gmail.com'
export const MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent('Hello from takramerdesigns.com')}`
export const RESUME_PDF = '/Thomas-Kramer-Brand-Product-Designer-Resume.pdf'

// Top bar, in this order (07 5.8). No resume page (Thomas, 1 November): the PDF is on About. Work
// drops down to the wall itself and the two pages that hang off it (Thomas, 1 and 2 November): Projects
// comes first, so nobody takes logos and one-offs for all of his work. Work is a button, not a link
// (Thomas, 6 November, after the reader test heard /projects twice under two names).
export const NAV: [string, string, [string, string][]?][] = [
  ['Work', '/projects', [['Projects', '/projects'], ['One-offs', '/one-offs'], ['Logos', '/logos']]],
  ['About', '/about'],
  ['Contact', '/contact'],
]

// The footer's list of pages.
export const PAGES: [string, string][] = [
  ['Work', '/projects'],
  ['One-offs', '/one-offs'],
  ['Logos', '/logos'],
  ['About', '/about'],
  ['Contact', '/contact'],
]

// Linked only from the footer's last line (Thomas, 2 November). The live site's URLs; its privacy page
// folds into the Terms of Service (Thomas, 3 November).
export const LEGAL: [string, string][] = [
  ['Terms of Service', '/terms-of-service'],
  ['Style guide', '/style'],
]

// Name, address and the handle /contact shows beside it.
export const SOCIAL: [string, string, string][] = [
  ['LinkedIn', 'https://www.linkedin.com/in/thomasakramer/', 'in/thomasakramer'],
  ['Instagram', 'https://www.instagram.com/takramerdesigns/', '@takramerdesigns'],
  ['X', 'https://x.com/takramerdesigns', '@takramerdesigns'],
  ['GitHub', 'https://github.com/Takramer', 'Takramer'],
]

// Experience, as on the resume (10-copy 3.4).
export const EXPERIENCE = [
  {
    where: 'TAKramer Designs',
    title: 'Brand and Product Designer (Freelance)',
    dates: 'Jan 2021 to present',
    line: 'Brand identities, logo systems and guidelines for 5+ clients, across 50+ print and digital assets.',
  },
  {
    where: 'University Recreation, UNC Charlotte',
    title: 'Graphic Designer',
    dates: 'Aug 2023 to May 2024',
    line: 'Visual direction for 2 week-long campus campaigns that together reached about 36,000 people and 250,000 impressions.',
  },
  {
    where: 'M28 Charlotte Campus Ministry',
    title: 'Graphic Designer',
    dates: 'Sep 2021 to May 2023',
    line: 'Infographics, campaigns and event ads that earned 80,000+ impressions each semester.',
  },
]

// Laid out as EXPERIENCE is, so each entry reads the same way on About: what and where, the dates on
// their own line under it, then the detail (Thomas, 7 November).
export const EDUCATION: { title: string; where: string; dates: string; line?: string }[] = [
  {
    where: 'UNC Charlotte',
    title: 'BFA, Graphic Design',
    dates: 'Aug 2021 to Dec 2025',
    line: 'Dean’s List, 5 semesters.',
  },
  {
    where: 'FINRA',
    title: 'Securities Industry Essentials (SIE) License',
    dates: 'Jun 2026',
  },
  {
    where: 'Central Piedmont Community College',
    title: 'Business and Finance Coursework',
    dates: 'Aug 2026 to Dec 2026',
  },
  {
    where: 'Anthropic',
    title: 'Claude Academy Certification',
    dates: 'Mar 2026 to May 2026',
    line: 'Eight courses: Claude 101, Claude Code 101, Claude Code in Action, AI Fluency, Model Context Protocol, agent skills, subagents and Claude Cowork.',
  },
]

// JSON-LD (10-copy 5). Every value matches visible text; no address (answers, round 1, 9).
export const PERSON = {
  '@type': 'Person',
  '@id': `${SITE}/#thomas`,
  name: 'Thomas Kramer',
  jobTitle: 'Brand and product designer',
  description: 'Brand and product designer who builds what he designs. Thomas Kramer designed and built Underline and Nydex, and has run TAKramer Designs since 2021.',
  url: SITE,
  email: `mailto:${EMAIL}`,
  alumniOf: 'University of North Carolina at Charlotte',
  // Skills and tools named on the case pages (roles and "Made with"), so an answer engine reads a
  // designer first. The usage panel's AI tools stay on the page; two remain here (AEO audit, 7 Nov).
  knowsAbout: ['Brand identity', 'Product design', 'Design systems', 'UX and UI design', 'Art direction', 'Campaign design', 'Front-end development', 'Accessibility (WCAG)', 'Figma', 'Adobe Illustrator', 'Adobe Photoshop', 'Adobe InDesign', 'React', 'Claude Code', 'AI tools'],
  // A city, not an address (the footer clock reads CLT).
  homeLocation: { '@type': 'City', name: 'Charlotte', containedInPlace: { '@type': 'State', name: 'North Carolina', containedInPlace: { '@type': 'Country', name: 'United States' } } },
  worksFor: { '@id': `${SITE}/#studio` },
  sameAs: SOCIAL.map(([, href]) => href),
}

// The studio named in Experience ("TAKramer Designs, Jan 2021 to present").
export const STUDIO = {
  '@type': 'Organization',
  '@id': `${SITE}/#studio`,
  name: 'TAKramer Designs',
  url: SITE,
  foundingDate: '2021',
  founder: { '@id': `${SITE}/#thomas` },
  areaServed: 'Charlotte, North Carolina',
}

export const WEBSITE = {
  '@type': 'WebSite',
  '@id': `${SITE}/#site`,
  name: 'TAKramer Designs',
  alternateName: 'Thomas Kramer',
  url: SITE,
  description: 'The portfolio of Thomas Kramer, brand and product designer, with 10 case studies, 15 logos and 66 one-off pieces.',
  author: { '@id': `${SITE}/#thomas` },
}
