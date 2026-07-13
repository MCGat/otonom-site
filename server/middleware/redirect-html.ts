// Anciennes URLs du site statique (ex. /a-propos.html) : elles sont encore
// indexées par Google et renvoyaient une 404. On les redirige toutes en 301
// (permanent) vers l'accueil → plus de 404 depuis Google, et l'index se met à jour.
export default defineEventHandler((event) => {
  const { pathname } = getRequestURL(event)
  if (pathname.toLowerCase().endsWith('.html')) {
    return sendRedirect(event, '/', 301)
  }
})
