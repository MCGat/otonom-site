/** OTONOM admin — modifie le nom + les destinataires d'UN formulaire (protégée). */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const { formKey, label, recipients } = (await readBody(event)) || {}
  if (!formKey) throw createError({ statusCode: 400, statusMessage: 'formKey requis' })
  await setFormSettings(String(formKey), String(label ?? ''), String(recipients ?? ''))
  return { ok: true }
})
