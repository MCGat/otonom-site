// Réglages d'indexation initiaux — reprennent l'état actuel du site au moment
// où le pilotage est passé en base. Idempotent : n'écrit QUE si la page n'a pas
// déjà un réglage, donc ne réécrase jamais un choix fait depuis l'admin.
import { listPageSettings, setPageIndexed } from './db'

const DEFAULT_NOINDEX = ['/simulateur', '/blog', '/accueil-v2']

export async function seedPageSettings(): Promise<void> {
  try {
    const existing = await listPageSettings()
    for (const path of DEFAULT_NOINDEX) {
      if (path in existing) continue
      await setPageIndexed(path, false)
      console.log('[seed] page non indexée par défaut :', path)
    }
  } catch (e) {
    console.error('[seed] page_settings impossible', e)
  }
}
