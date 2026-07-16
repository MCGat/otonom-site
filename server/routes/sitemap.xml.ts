/**
 * OTONOM — sitemap.xml généré dynamiquement.
 *
 * Le sitemap et le meta robots partagent la MÊME source de vérité (table
 * page_settings, pilotée depuis l'admin) : une page désindexée disparaît
 * automatiquement d'ici. Plus de divergence possible entre les deux.
 *
 * ROUTES = catalogue des pages publiques candidates (+ leurs priorités SEO).
 * Le filtre d'indexation, lui, vient de la base.
 */
const BASE = 'https://otonom.fr'
const LASTMOD = '2026-07-08'

const ROUTES: Array<{ loc: string; priority: string; freq: string }> = [
  { loc: '/', priority: '1.0', freq: 'weekly' },
  { loc: '/simulateur', priority: '0.9', freq: 'monthly' },
  { loc: '/blog', priority: '0.8', freq: 'weekly' },
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
  // Règles d'indexation (BDD). En cas d'échec : on n'expose que le strict minimum
  // plutôt que de risquer de lister une page volontairement désindexée.
  let prefixes: string[] = []
  let dbOk = true
  try {
    prefixes = (await getNoindexRules()).prefixes
  } catch {
    dbOk = false
  }

  const all: Array<{ loc: string; priority: string; freq: string; lastmod: string }> = []

  for (const r of ROUTES) {
    if (dbOk && matchesNoindex(r.loc, prefixes)) continue
    if (!dbOk && r.loc !== '/') continue // repli prudent
    all.push({ ...r, lastmod: LASTMOD })
  }

  // Articles publiés — uniquement si la section /blog est elle-même indexable
  if (dbOk && !matchesNoindex('/blog', prefixes)) {
    try {
      for (const a of await listPublishedArticles()) {
        all.push({
          loc: `/blog/${a.slug}`,
          priority: '0.6',
          freq: 'monthly',
          lastmod: (a.publishedAt || a.updatedAt || LASTMOD).slice(0, 10)
        })
      }
    } catch { /* base indisponible : on garde les pages statiques */ }
  }

  const urls = all.map((r) =>
    `  <url>\n    <loc>${BASE}${r.loc}</loc>\n    <lastmod>${r.lastmod}</lastmod>\n    <changefreq>${r.freq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`
  ).join('\n')
  setHeader(event, 'content-type', 'application/xml; charset=UTF-8')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
})
