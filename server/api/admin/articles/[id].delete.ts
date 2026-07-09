/** Admin — supprime un article (protégée). */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = Number(getRouterParam(event, 'id'))
  await deleteArticle(id)
  return { ok: true }
})
