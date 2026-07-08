/** OTONOM admin — connexion. Vérifie le mot de passe (env) et ouvre la session. */
import { timingSafeEqual } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const { password } = (await readBody(event)) || {}
  const expected = useRuntimeConfig().adminPassword
  if (!expected) throw createError({ statusCode: 500, statusMessage: 'Admin non configuré (NUXT_ADMIN_PASSWORD manquant)' })

  const a = Buffer.from(String(password ?? ''))
  const b = Buffer.from(String(expected))
  const ok = a.length === b.length && timingSafeEqual(a, b)
  if (!ok) throw createError({ statusCode: 401, statusMessage: 'Mot de passe incorrect' })

  await setUserSession(event, { user: { admin: true }, loggedInAt: Date.now() })
  return { ok: true }
})
