/** Admin — crée ou met à jour un article (protégée). */
const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120)

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const b = (await readBody(event)) || {}
  const title = String(b.title || '').trim()
  if (!title) throw createError({ statusCode: 400, statusMessage: 'Titre requis' })
  const slug = String(b.slug || '').trim() ? slugify(String(b.slug)) : slugify(title)
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug invalide' })

  const status: ArticleStatus =
    b.status === 'published' ? 'published' : b.status === 'scheduled' ? 'scheduled' : 'draft'

  // Programmé : la date est obligatoire et doit être valide (contrôle serveur,
  // pas seulement dans le formulaire).
  let publishedAt: string | undefined
  if (status === 'scheduled') {
    const d = b.publishedAt ? new Date(String(b.publishedAt)) : null
    if (!d || isNaN(d.getTime())) {
      throw createError({ statusCode: 400, statusMessage: 'Date de programmation invalide.' })
    }
    publishedAt = d.toISOString()
  }

  const id = await upsertArticle({
    id: b.id ? Number(b.id) : undefined,
    slug, title,
    excerpt: String(b.excerpt || ''),
    cover: String(b.cover || ''),
    body: String(b.body || ''),
    status,
    publishedAt
  })
  return { ok: true, id, slug, status }
})
