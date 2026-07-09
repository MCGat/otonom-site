/** Public — un article publié par slug (pour /blog/[slug]). */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') || ''
  const article = await getArticleBySlug(slug, true)
  if (!article) throw createError({ statusCode: 404, statusMessage: 'Article introuvable' })
  return { article }
})
