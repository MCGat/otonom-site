/** OTONOM — sitemap.xml généré dynamiquement (routes publiques indexables). */
const BASE = 'https://otonom.fr'
const LASTMOD = '2026-07-08'

// NB : /simulateur et /blog (+ articles) sont volontairement EXCLUS du sitemap
// et passés en noindex — accessibles par URL directe uniquement, non indexés.
const ROUTES: Array<{ loc: string; priority: string; freq: string }> = [
  { loc: '/', priority: '1.0', freq: 'weekly' },
  { loc: '/expertises', priority: '0.8', freq: 'monthly' },
  { loc: '/methode', priority: '0.8', freq: 'monthly' },
  { loc: '/a-propos', priority: '0.6', freq: 'yearly' },
  { loc: '/contact', priority: '0.7', freq: 'yearly' },
  { loc: '/dirigeants', priority: '0.6', freq: 'yearly' },
  { loc: '/daf', priority: '0.6', freq: 'yearly' },
  { loc: '/drh', priority: '0.6', freq: 'yearly' },
  { loc: '/services-generaux', priority: '0.6', freq: 'yearly' },
  { loc: '/mentions-legales', priority: '0.2', freq: 'yearly' },
  { loc: '/confidentialite', priority: '0.2', freq: 'yearly' }
]

export default defineEventHandler(async (event) => {
  const all: Array<{ loc: string; priority: string; freq: string; lastmod: string }> =
    ROUTES.map((r) => ({ ...r, lastmod: LASTMOD }))
  // Articles de blog volontairement non listés (noindex, hors nav).

  const urls = all.map((r) =>
    `  <url>\n    <loc>${BASE}${r.loc}</loc>\n    <lastmod>${r.lastmod}</lastmod>\n    <changefreq>${r.freq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`
  ).join('\n')
  setHeader(event, 'content-type', 'application/xml; charset=UTF-8')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
})
