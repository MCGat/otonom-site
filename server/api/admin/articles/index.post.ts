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

  const id = await upsertArticle({
    id: b.id ? Number(b.id) : undefined,
    slug, title,
    excerpt: String(b.excerpt || ''),
    cover: String(b.cover || ''),
    body: String(b.body || ''),
    status: b.status === 'published' ? 'published' : 'draft'
  })
  return { ok: true, id, slug }
})
