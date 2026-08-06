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
  '/mentions-legales', '/confidentialite',
  '/simulateurs', '/simulateurs/economies-et-roi', '/simulateurs/tco-flotte-electrique',
  '/simulateurs/bornes-camping-hotel'
])

/**
 * Anciennes sections supprimées → leur remplaçante.
 * La clé couvre la page ET ses sous-pages (/offre ⇒ /offre/quoi-que-ce-soit).
 */
const LEGACY: Record<string, string> = {
  '/offre': '/',
  // Les simulateurs sont passés sous une arborescence commune : un seul
  // simulateur ne justifiait pas de niveau, quatre si.
  '/simulateur-tco': '/simulateurs/tco-flotte-electrique',
  // Pointe directement sur la cible finale : une redirection qui en appelle une
  // autre dilue le référencement et rallonge le premier affichage.
  '/simulateur': '/simulateurs/economies-et-roi',
  // « transition » ne disait pas ce que la page calcule. Renommée le 06/08/2026 ;
  // l'ancienne adresse a été indexée, elle doit survivre indéfiniment.
  '/simulateurs/transition': '/simulateurs/economies-et-roi'
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
