// Réglages d'indexation initiaux — reprennent l'état actuel du site au moment
// où le pilotage est passé en base. Idempotent : n'écrit QUE si la page n'a pas
// déjà un réglage, donc ne réécrase jamais un choix fait depuis l'admin.
import { deletePageSetting, listPageSettings, setPageIndexed } from './db'

const DEFAULT_NOINDEX = ['/simulateurs', '/blog', '/accueil-v2']

/**
 * Pages dont l'URL a changé : leur ancien réglage n'a plus d'objet et
 * encombrerait la table. Les redirections 301 vivent, elles, dans
 * server/middleware/redirect-legacy.ts.
 */
const CHEMINS_OBSOLETES = ['/simulateur', '/simulateur-tco']

export async function seedPageSettings(): Promise<void> {
  try {
    const existing = await listPageSettings()
    for (const path of CHEMINS_OBSOLETES) {
      if (!(path in existing)) continue
      await deletePageSetting(path)
      console.log('[seed] réglage obsolète supprimé :', path)
    }
    for (const path of DEFAULT_NOINDEX) {
      if (path in existing) continue
      await setPageIndexed(path, false)
      console.log('[seed] page non indexée par défaut :', path)
    }
  } catch (e) {
    console.error('[seed] page_settings impossible', e)
  }
}
