<template>
  <section v-if="choisis.length" class="lies">
    <header class="lies-h">
      <div>
        <span class="kicker">{{ modeCocon ? 'Dans le même dossier' : 'À lire ensuite' }}</span>
        <h2>{{ titre }}</h2>
      </div>
      <div v-if="defilable" class="lies-nav">
        <button type="button" aria-label="Précédent" @click="glisser(-1)">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <button type="button" aria-label="Suivant" @click="glisser(1)">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>
    </header>

    <ul ref="piste" class="lies-piste" :class="{ 'is-grille': !defilable }">
      <li v-for="a in choisis" :key="a.slug">
        <NuxtLink :to="`/blog/${a.slug}`" class="lies-c">
          <span class="lies-date">{{ formatDate(a.publishedAt || a.createdAt) }}</span>
          <h3>{{ a.title }}</h3>
          <p v-if="a.excerpt">{{ a.excerpt }}</p>
          <span class="lies-more">Lire l'article
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
/**
 * Articles à lire ensuite, en bas d'un article.
 *
 * Règle : si le cocon de l'article courant compte assez d'autres articles EN LIGNE,
 * on propose le dossier — c'est le plus pertinent pour le lecteur et ça renforce le
 * maillage interne. Sinon on retombe sur les derniers parus, qui valent toujours
 * mieux qu'une section vide. Au-delà de trois, la piste défile.
 */
import { COCONS, labelCocon } from '~/utils/cocons'

const props = defineProps<{ slug: string; cocon?: string }>()

/** En dessous de ce nombre, un cocon ne fait pas une rubrique crédible. */
const MINI_COCON = 3
const MAXI = 6

const { data } = await useFetch<{ articles: any[] }>('/api/articles', { key: 'articles-lies' })

const autres = computed(() => (data.value?.articles || []).filter((a) => a.slug !== props.slug))

const duCocon = computed(() => {
  if (!props.cocon) return []
  const l = autres.value.filter((a) => a.cocon === props.cocon)
  // Le pilier d'abord : c'est la page qui distribue, elle mérite la première place.
  return [...l].sort((a, b) => Number(b.slug === pilier.value) - Number(a.slug === pilier.value))
})

const pilier = computed(() => COCONS.find((c) => c.cle === props.cocon)?.pilier || '')

const modeCocon = computed(() => duCocon.value.length >= MINI_COCON)

const choisis = computed(() =>
  (modeCocon.value ? duCocon.value : autres.value).slice(0, modeCocon.value ? MAXI : 3))

const titre = computed(() =>
  modeCocon.value ? (labelCocon(props.cocon) || 'Sur le même sujet') : 'Les derniers articles')

const defilable = computed(() => choisis.value.length > 3)

const piste = ref<HTMLElement | null>(null)
function glisser(sens: number) {
  const el = piste.value
  if (!el) return
  el.scrollBy({ left: sens * (el.clientWidth * 0.8), behavior: 'smooth' })
}

const formatDate = (iso?: string) => {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) } catch { return '' }
}
</script>

<style scoped>
.lies { max-width: 760px; margin: clamp(48px, 6vw, 72px) auto 0; padding-top: clamp(32px, 4vw, 44px); border-top: 1px solid var(--line); }
.lies-h { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 24px; }
.lies-h h2 { font-size: clamp(20px, 2.4vw, 26px); line-height: 1.25; margin-top: 10px; }

.lies-nav { display: flex; gap: 8px; flex: none; }
.lies-nav button {
  width: 38px; height: 38px; border-radius: 10px; cursor: pointer;
  background: none; border: 1px solid var(--line); color: var(--ink-soft);
  display: inline-flex; align-items: center; justify-content: center;
  transition: color .18s ease, border-color .18s ease;
}
.lies-nav button:hover { color: var(--ink); border-color: var(--ink); }
.lies-nav svg { width: 17px; height: 17px; }

.lies-piste { list-style: none; margin: 0; padding: 0 0 6px; display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; }
.lies-piste::-webkit-scrollbar { display: none; }
.lies-piste > li { flex: 0 0 clamp(240px, 74%, 300px); scroll-snap-align: start; }
/* Trois articles ou moins : pas de défilement, une grille qui remplit la largeur. */
.lies-piste.is-grille { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); overflow: visible; }
.lies-piste.is-grille > li { flex: initial; }

.lies-c { display: flex; flex-direction: column; height: 100%; border: 1px solid var(--line); border-radius: var(--radius); padding: 20px; background: var(--bg-1); transition: border-color .2s ease, transform .2s ease; }
.lies-c:hover { border-color: var(--ink); transform: translateY(-2px); }
.lies-date { font-family: var(--ff-mono); font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--ink); }
.lies-c h3 { font-size: 16px; line-height: 1.3; margin-top: 12px; }
.lies-c p { font-size: 13.5px; line-height: 1.55; color: var(--muted); margin-top: 10px; display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.lies-more { margin-top: auto; padding-top: 16px; font-family: var(--ff-mono); font-size: 11.5px; color: var(--ink); display: inline-flex; align-items: center; gap: 7px; }
.lies-more svg { width: 13px; height: 13px; }

@media (max-width: 560px) { .lies-h { flex-direction: column; align-items: flex-start; } }
</style>
