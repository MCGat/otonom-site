/**
 * Redirections des anciennes URLs (301 permanent) — TOUTES centralisées ici.
 *
 * Objectif : ne jamais renvoyer une 404 à un visiteur venant de Google ou d'un
 * ancien lien, et transférer le référencement vers la page qui remplace l'ancienne.
 */

/** Pages « propres » existantes — cibles possibles d'une redirection .html */
const KNOWN = new Set([
  '/', '/a-propos', '/expertises', '/methode', '/contact',
  '/dirigeants', '/daf', '/drh', '/services-generaux',
  '/mentions-legales', '/confidentialite', '/simulateur'
])

/**
 * Anciennes sections supprimées → leur remplaçante.
 * La clé couvre la page ET ses sous-pages (/offre ⇒ /offre/quoi-que-ce-soit).
 */
const LEGACY: Record<string, string> = {
  '/offre': '/'
}

/** Minuscule + sans slash final (le query/hash n'est pas dans pathname). */
function clean(p: string): string {
  const s = p.toLowerCase()
  return s.length > 1 ? s.replace(/\/+$/, '') || '/' : s || '/'
}

export default defineEventHandler((event) => {
  const path = clean(getRequestURL(event).pathname)

  // 1) Anciennes sections supprimées (ex. /offre/ → /)
  for (const [from, to] of Object.entries(LEGACY)) {
    if (path === from || path.startsWith(from + '/')) {
      return sendRedirect(event, to, 301)
    }
  }

  // 2) Anciennes pages .html du site statique → leur équivalent propre
  if (!path.endsWith('.html')) return
  let target = path.slice(0, -5)
  if (target === '/index') target = '/'
  if (!KNOWN.has(target)) target = '/' // pas d'équivalent connu → accueil
  return sendRedirect(event, target, 301)
})
