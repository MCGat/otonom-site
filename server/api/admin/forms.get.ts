/** OTONOM admin — formulaires + destinataires + nombre de leads (protégée). */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  return { forms: await listForms() }
})
