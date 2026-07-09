/** Admin — un article par id (protégée, tout statut). */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = Number(getRouterParam(event, 'id'))
  const article = await getArticle(id)
  if (!article) throw createError({ statusCode: 404, statusMessage: 'Article introuvable' })
  return { article }
})
