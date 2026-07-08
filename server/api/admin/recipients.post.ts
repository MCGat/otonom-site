/** OTONOM admin — modifie les destinataires d'UN formulaire (protégée, indépendant par formulaire). */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const { formKey, recipients, label } = (await readBody(event)) || {}
  if (!formKey) throw createError({ statusCode: 400, statusMessage: 'formKey requis' })
  await setRecipients(String(formKey), String(recipients ?? ''), label ? String(label) : undefined)
  return { ok: true }
})
