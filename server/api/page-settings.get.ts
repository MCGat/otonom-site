/**
 * Règles publiques de non-indexation, consommées au rendu (SSR) par app.vue
 * pour poser le meta robots. Info non sensible (déjà publique dans le HTML).
 */
export default defineEventHandler(async (event) => {
  try {
    const rules = await getNoindexRules()
    setHeader(event, 'cache-control', 'public, max-age=60')
    return rules
  } catch {
    // BDD indisponible : on n'invente rien, aucune règle → pages indexables
    return { prefixes: [] as string[] }
  }
})
