// Protège les pages admin : redirige vers /admin/login si non connecté.
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession()
  if (!loggedIn.value) return navigateTo('/admin/login')
})
