/** OTONOM admin — liste des leads (protégée), filtrable par formulaire via ?form=... */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const form = getQuery(event).form
  const leads = await listLeads({ form: form ? String(form) : undefined })
  return { leads }
})
