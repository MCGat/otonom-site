// Seed au démarrage du serveur : insère les articles de blog embarqués s'ils manquent.
// Idempotent — n'écrase aucun contenu existant (voir server/utils/seedArticles.ts).
export default defineNitroPlugin(() => {
  seedArticles().catch((e) => console.error('[seed] initialisation impossible', e))
})
