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
    line: 'Visual direction for 2 week-long campus campaigns that together reached about 36,000 people and 250,000+ impressions.',
  },
  {
    where: 'M28 Charlotte Campus Ministry',
    title: 'Graphic Designer',
    dates: 'Sep 2021 to May 2023',
    line: 'Infographics, campaigns and event ads that earned 80,000+ impressions each semester.',
  },
]

export const EDUCATION = [
  ['Education', 'BFA, Graphic Design, UNC Charlotte, August 2021 to December 2025. Dean’s List, 5 semesters.'],
  ['License', 'Securities Industry Essentials (SIE), FINRA, June 2026.'],
  ['Coursework', 'Business and finance coursework, Central Piedmont Community College, August to December 2026.'],
  ['Certification', 'Anthropic Academy: Claude Code and AI Fluency, May 2026.'],
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
  // The AI tools named in the usage panel on Home and About (search finds "AI"; the page says SI).
  knowsAbout: ['Brand design', 'Product design', 'AI tools', 'Claude Code', 'Muse', 'Grok', 'Cursor', 'Framer Agent', 'Comet', 'Claude Duet', 'Google Gemini', 'Gemini Notebook', 'OpenAI Codex', 'ChatGPT'],
  sameAs: SOCIAL.map(([, href]) => href),
}

export const WEBSITE = {
  '@type': 'WebSite',
  '@id': `${SITE}/#site`,
  name: 'TAKramer Designs',
  alternateName: 'Thomas Kramer',
  url: SITE,
  description: 'The portfolio of Thomas Kramer, brand and product designer, with 10 case studies, 15 logos and 45 one-off pieces.',
  author: { '@id': `${SITE}/#thomas` },
}
