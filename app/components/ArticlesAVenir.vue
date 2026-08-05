<template>
  <Teleport v-if="ouvert" to="body">
    <div class="av-fond" @click.self="fermer">
      <div ref="boite" class="av" role="dialog" aria-modal="true" aria-labelledby="av-t" tabindex="-1" @keydown.esc="fermer">
        <button type="button" class="av-x" aria-label="Fermer" @click="fermer">&times;</button>

        <span class="av-kicker">Bientôt disponible</span>
        <h2 id="av-t">Cet article arrive très prochainement.</h2>
        <p class="av-p">
          <template v-if="titre">«&nbsp;{{ titre }}&nbsp;» est en cours de rédaction.</template>
          <template v-else>Cet article est en cours de rédaction.</template>
          Il rejoindra le blog dès sa relecture terminée — le lien fonctionnera alors normalement.
        </p>

        <div class="av-actions">
          <NuxtLink to="/blog" class="btn btn--primary" @click="fermer">Voir les articles disponibles</NuxtLink>
          <button type="button" class="btn btn--ghost" @click="fermer">Fermer</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * Intercepte les clics vers un article de blog PAS ENCORE EN LIGNE et affiche
 * une explication au lieu d'une 404.
 *
 * Le contrôle se fait contre la liste réelle des articles publiés : le jour où
 * l'article passe en ligne, le lien redevient un lien normal sans qu'on touche
 * à quoi que ce soit. La liste n'est chargée que si la page contient au moins
 * un lien d'article — les pages qui n'en ont pas ne paient rien.
 */
const ouvert = ref(false)
const titre = ref('')
const boite = ref<HTMLElement | null>(null)
const publies = ref<Set<string> | null>(null)
let dernierFocus: HTMLElement | null = null

async function chargerPublies() {
  if (publies.value) return
  try {
    const r = await $fetch<{ articles: { slug: string }[] }>('/api/articles')
    publies.value = new Set((r?.articles || []).map((a) => a.slug))
  } catch {
    // En cas d'échec on ne bloque rien : le clic suit son cours normal.
    publies.value = null
  }
}

const slugDe = (href: string): string | null => {
  const m = /^\/blog\/([^/?#]+)\/?(?:[?#]|$)/.exec(href)
  return m ? m[1]! : null
}

function onClick(e: MouseEvent) {
  // On laisse passer les clics « ouvrir dans un nouvel onglet » : l'utilisateur
  // a demandé autre chose qu'une navigation, ce n'est pas à nous d'arbitrer.
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

  const a = (e.target as HTMLElement | null)?.closest?.('a[href]') as HTMLAnchorElement | null
  if (!a || a.target === '_blank') return

  const slug = slugDe(a.getAttribute('href') || '')
  // Tant que la liste n'est pas connue, on ne devine pas : le lien suit son cours.
  if (!slug || !publies.value || publies.value.has(slug)) return

  e.preventDefault()
  e.stopPropagation()
  dernierFocus = a
  titre.value = (a.textContent || '').trim().slice(0, 90)
  ouvert.value = true
}

function fermer() {
  ouvert.value = false
  dernierFocus?.focus?.()
  dernierFocus = null
}

/* Le verrou de défilement suit l'ouverture, y compris si la modale se ferme
   par une navigation plutôt que par le bouton. */
watch(ouvert, async (o) => {
  document.documentElement.style.overflow = o ? 'hidden' : ''
  if (o) { await nextTick(); boite.value?.focus() }
})

onMounted(async () => {
  // Capture : il faut passer AVANT le routeur, sinon la navigation a déjà eu lieu.
  document.addEventListener('click', onClick, true)
  if (document.querySelector('a[href^="/blog/"]')) await chargerPublies()
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onClick, true)
  document.documentElement.style.overflow = ''
})
</script>

<style scoped>
.av-fond {
  position: fixed; inset: 0; z-index: 200;
  display: flex; align-items: center; justify-content: center; padding: var(--pad);
  background: rgba(0, 0, 0, .62); backdrop-filter: blur(3px);
  animation: av-in .2s ease;
}
.av {
  position: relative; width: min(520px, 100%);
  background: var(--bg-1); border: 1px solid var(--line); border-radius: var(--radius);
  padding: clamp(28px, 4vw, 40px);
  animation: av-up .24s cubic-bezier(.4, 0, .2, 1);
}
.av:focus { outline: none; }

.av-x {
  position: absolute; top: 12px; right: 14px;
  font-size: 24px; line-height: 1; color: var(--muted-2);
  background: none; border: 0; padding: 6px 10px; cursor: pointer;
}
.av-x:hover { color: var(--ink); }

.av-kicker { font-family: var(--ff-mono); font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: var(--muted); }
.av h2 { font-size: clamp(21px, 2.6vw, 26px); line-height: 1.25; margin-top: 14px; }
.av-p { margin-top: 14px; font-size: 14.5px; line-height: 1.65; color: var(--muted); }

.av-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 26px; }
.av-actions .btn { padding: 11px 20px; font-size: 14px; }

@keyframes av-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes av-up { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }

@media (prefers-reduced-motion: reduce) {
  .av-fond, .av { animation: none; }
}
</style>
