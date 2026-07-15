// Anciennes URLs du site statique (ex. /a-propos.html) : encore indexées par
// Google et renvoyaient une 404. On les redirige en 301 (permanent) vers leur
// équivalent « propre » (/a-propos), ce qui transfère le référencement et envoie
// les visiteurs sur la bonne page. Repli sur l'accueil si aucun équivalent.
const KNOWN = new Set([
  '/', '/a-propos', '/expertises', '/methode', '/contact',
  '/dirigeants', '/daf', '/drh', '/services-generaux',
  '/mentions-legales', '/confidentialite', '/simulateur'
])

export default defineEventHandler((event) => {
  const { pathname } = getRequestURL(event)
  if (!pathname.toLowerCase().endsWith('.html')) return
  let target = pathname.slice(0, -5) // retire « .html »
  if (target === '/index') target = '/'
  if (!KNOWN.has(target)) target = '/' // pas d'équivalent connu → accueil
  return sendRedirect(event, target, 301)
})
