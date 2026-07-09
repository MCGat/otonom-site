/** Admin — liste de tous les articles (protégée). */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  // liste sans le corps (plus léger pour le tableau)
  const articles = (await listArticles()).map(({ body, ...a }) => a)
  return { articles }
})
