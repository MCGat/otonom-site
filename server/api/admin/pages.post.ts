/** Admin : bascule l'indexation d'une page. Le garde-fou est appliqué côté BDD. */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const body = await readBody<{ path?: string; indexed?: boolean }>(event)
  const path = String(body?.path || '').trim()
  if (!path.startsWith('/')) {
    throw createError({ statusCode: 400, statusMessage: 'Chemin invalide.' })
  }
  const ok = await setPageIndexed(path, body?.indexed !== false)
  if (!ok) {
    throw createError({ statusCode: 403, statusMessage: 'Cette page ne peut pas être désindexée.' })
  }
  return { ok: true, path: normalizePath(path), indexed: body?.indexed !== false }
})
