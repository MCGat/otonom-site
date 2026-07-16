/** Admin : réglages d'indexation + garde-fous, pour l'onglet « Pages ». */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  return {
    settings: await listPageSettings(),          // { '/simulateur': false, … }
    locked: Array.from(LOCKED_INDEXED),          // jamais désindexables
    alwaysNoindex: ALWAYS_NOINDEX                // zones techniques
  }
})
