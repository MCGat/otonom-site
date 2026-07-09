/** OTONOM admin — marque/démarque un lead comme "test" (protégée). */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const { id, test } = (await readBody(event)) || {}
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id requis' })
  await setLeadTest(Number(id), !!test)
  return { ok: true }
})
