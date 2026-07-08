/**
 * OTONOM — Réception des leads (contact + simulateur).
 * 1) valide  2) ENREGISTRE en BDD (le lead n'est jamais perdu)
 * 3) résout les destinataires du formulaire  4) envoie l'email (best effort).
 */
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
const clean = (v: unknown) => String(v ?? '').replace(/[\r\n]+/g, ' ').trim()

export default defineEventHandler(async (event) => {
  const body = await readBody(event) || {}

  // Pot de miel anti-spam : on fait comme si tout allait bien
  if (body._honey) return { ok: true }

  const nom = clean(body.Nom ?? body.nom)
  const email = clean(body.Email ?? body.email)
  const entreprise = clean(body.Entreprise ?? body.entreprise)
  const telephone = clean(body['Téléphone'] ?? body.telephone)
  const formKey = clean(body._form ?? body.formKey) || 'contact'
  const message = String(body.Message ?? body.message ?? '').trim()
  // Métadonnées libres (ex. résumé du simulateur)
  const meta = body.meta ? (typeof body.meta === 'string' ? body.meta : JSON.stringify(body.meta)) : null

  if (!nom || !email || !isEmail(email)) {
    setResponseStatus(event, 400)
    return { ok: false, error: 'invalid' }
  }

  const lead = {
    formKey, nom, email, entreprise, telephone, message,
    meta: meta || undefined,
    ip: getRequestIP(event, { xForwardedFor: true }) || undefined,
    userAgent: getRequestHeader(event, 'user-agent') || undefined
  }

  // 1) Enregistrement (prioritaire : on ne perd jamais un lead)
  let id: number | null = null
  try {
    id = await insertLead(lead)
  } catch (e) {
    console.error('OTONOM lead: échec enregistrement BDD', e)
    setResponseStatus(event, 500)
    return { ok: false, error: 'store' }
  }

  // 2) Email (best effort — l'échec n'empêche pas la capture)
  let emailed = false
  try {
    await ensureFormSettings(formKey)                 // enregistre le formulaire s'il est nouveau
    emailed = await sendLeadEmail(lead, await getRecipients(formKey))
  } catch (e) {
    console.error('OTONOM lead: échec envoi email', e)
  }

  return { ok: true, id, emailed }
})
