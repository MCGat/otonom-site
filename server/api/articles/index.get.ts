/** Public — liste des articles publiés (pour /blog). */
export default defineEventHandler(async () => {
  const articles = await listPublishedArticles()
  // on n'expose pas le corps complet dans la liste (plus léger)
  return { articles: articles.map(({ body, ...a }) => a) }
})
