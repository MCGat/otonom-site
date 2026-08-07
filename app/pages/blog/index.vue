<template>
  <section class="page-intro section--light"><div class="wrap">
    <span class="kicker reveal">Blog</span>
    <h1 class="reveal">Analyses & repères sur la transition mobilité et énergie.</h1>
    <p class="lede reveal">Fiscalité, recharge, énergie, ROI : nos décryptages pour piloter votre transition avec des chiffres, pas des intuitions.</p>
  </div></section>

  <section class="section section--tight"><div class="wrap">
    <!-- Filtre par sujet : un tag à la fois, reflété dans l'URL pour être partageable. -->
    <nav v-if="tags.length" class="btags" aria-label="Filtrer par sujet">
      <button type="button" class="btag" :class="{ 'is-on': !tagActif }" @click="choisir('')">Tous les sujets</button>
      <button
        v-for="t in tags" :key="t" type="button"
        class="btag" :class="{ 'is-on': tagActif === t }"
        @click="choisir(t)">{{ t }}</button>
    </nav>

    <div v-if="affiches.length" class="blog-grid">
      <NuxtLink
        v-for="a in affiches" :key="a.slug" class="blog-card" :to="`/blog/${a.slug}`"
        @pointerenter="entrer" @pointerleave="sortir" @pointercancel="sortir">
        <div v-if="a.cover" class="blog-card-cover"><img :src="a.cover" :alt="a.title" loading="lazy"></div>
        <div class="blog-card-body">
          <span class="blog-card-date">{{ formatDate(a.publishedAt || a.createdAt) }}</span>
          <h3>{{ a.title }}</h3>
          <p v-if="a.excerpt">{{ a.excerpt }}</p>
          <div v-if="tagsDe(a).length" class="blog-card-tags">
            <span v-for="t in tagsDe(a)" :key="t" class="blog-card-tag">{{ t }}</span>
          </div>
          <span class="blog-card-more">Lire l'article
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </span>
        </div>
      </NuxtLink>
    </div>

    <nav v-if="nbPages > 1" class="bpage" aria-label="Pages d'articles">
      <button type="button" class="bpage-fl" :disabled="page <= 1" @click="allerPage(page - 1)" aria-label="Page précédente">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M15 6l-6 6 6 6" /></svg>
      </button>
      <button
        v-for="n in nbPages" :key="n" type="button"
        class="bpage-n" :class="{ 'is-on': n === page }"
        :aria-current="n === page ? 'page' : undefined"
        @click="allerPage(n)">{{ n }}</button>
      <button type="button" class="bpage-fl" :disabled="page >= nbPages" @click="allerPage(page + 1)" aria-label="Page suivante">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9 6l6 6-6 6" /></svg>
      </button>
      <span class="bpage-c">{{ visibles.length }} article{{ visibles.length > 1 ? 's' : '' }}</span>
    </nav>

    <p v-if="!visibles.length && articles.length" class="muted btags-empty">
      Aucun article sur ce sujet pour le moment.
      <button type="button" class="btag-reset" @click="choisir('')">Voir tous les articles</button>
    </p>
    <p v-if="!articles.length" class="muted">Les premiers articles arrivent bientôt.</p>
  </div></section>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const { data } = await useFetch<{ articles: any[] }>('/api/articles')
const articles = computed(() => data.value?.articles || [])

const tagsDe = (a: any): string[] => String(a?.tags || '').split(',').map((t) => t.trim()).filter(Boolean)

const tags = computed(() => {
  const set = new Set<string>()
  for (const a of articles.value) for (const t of tagsDe(a)) set.add(t)
  return [...set].sort((x, y) => x.localeCompare(y, 'fr'))
})

/* Le tag vit dans l'URL (?sujet=…) : partageable, et le bouton « précédent » marche.
   On le résout contre la liste réelle, ce qui neutralise une valeur inventée. */
const tagActif = computed(() => {
  const brut = String(route.query.sujet || '').trim().toLowerCase()
  return tags.value.find((t) => t.toLowerCase() === brut) || ''
})

/* Changer de sujet renvoie en page 1 : rester en page 3 d'une liste qui n'en a
   plus qu'une afficherait un écran vide. */
const choisir = (t: string) =>
  router.replace({ query: { ...route.query, sujet: t || undefined, page: undefined } })

const visibles = computed(() => {
  if (!tagActif.value) return articles.value
  const cle = tagActif.value.toLowerCase()
  return articles.value.filter((a) => tagsDe(a).some((t) => t.toLowerCase() === cle))
})

/* ── Pagination ── */
const PAR_PAGE = 6
const nbPages = computed(() => Math.max(1, Math.ceil(visibles.value.length / PAR_PAGE)))
/* La page vit dans l'URL et se borne à ce qui existe : ?page=99 retombe sur la dernière. */
const page = computed(() => {
  const n = Number.parseInt(String(route.query.page || '1'), 10)
  return Number.isFinite(n) ? Math.min(Math.max(1, n), nbPages.value) : 1
})
const affiches = computed(() => visibles.value.slice((page.value - 1) * PAR_PAGE, page.value * PAR_PAGE))

function allerPage(n: number) {
  const cible = Math.min(Math.max(1, n), nbPages.value)
  if (cible === page.value) return
  router.replace({ query: { ...route.query, page: cible === 1 ? undefined : cible } })
  if (import.meta.client) document.querySelector('.blog-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** Position du curseur dans la carte, en pixels. */
function poserOrigine(el: HTMLElement, e: PointerEvent) {
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}

/**
 * Entrée du curseur : l'inversion doit naître exactement sous lui.
 *
 * Le piège : `clip-path` interpole AUSSI le centre du cercle. Si on se contente
 * de changer l'origine au moment où la carte s'ouvre, le disque part de
 * l'ancien point et son centre glisse vers le nouveau en grandissant — on croit
 * alors que l'onde naît au mauvais endroit, ou au milieu de la carte quand
 * aucun point n'a encore été enregistré.
 *
 * On repose donc l'origine transition coupée (`is-fige`), on force le navigateur
 * à l'appliquer, puis seulement on ouvre. Le disque démarre là où il doit.
 */
function entrer(e: PointerEvent) {
  const el = e.currentTarget as HTMLElement | null
  // Le tactile déclenche un faux survol avant le clic : il n'ouvre rien ici.
  if (!el || e.pointerType === 'touch') return
  el.classList.add('is-fige')
  poserOrigine(el, e)
  void el.offsetWidth // force le recalcul avant de rallumer la transition
  el.classList.remove('is-fige')
  el.classList.add('is-inverse')
}

/** Sortie : l'onde se rétracte vers l'endroit qu'on quitte, pas vers le centre. */
function sortir(e: PointerEvent) {
  const el = e.currentTarget as HTMLElement | null
  if (!el) return
  poserOrigine(el, e)
  el.classList.remove('is-inverse')
}

useSeoMeta({
  title: () => tagActif.value
    ? `${tagActif.value} — Blog OTONOM | Transition mobilité, recharge & énergie`
    : 'Blog — OTONOM | Transition mobilité, recharge & énergie',
  description: "Décryptages OTONOM sur la fiscalité du véhicule électrique, la recharge (IRVE), l'énergie et le ROI de la transition des entreprises."
})
/* Une vue filtrée reste la même page aux yeux des moteurs : on renvoie au /blog nu. */
useHead({ link: [{ rel: 'canonical', href: 'https://otonom.fr/blog' }] })

const formatDate = (iso?: string) => {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) } catch { return '' }
}
</script>

<style scoped>
.btags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: clamp(26px, 3.5vw, 40px); }
.btag {
  font-family: var(--ff-mono); font-size: 11.5px; letter-spacing: .04em; color: var(--ink-soft);
  background: none; border: 1px solid rgba(255, 255, 255, .22); border-radius: 999px; padding: 7px 15px; cursor: pointer;
  transition: color .18s ease, border-color .18s ease, background .18s ease;
}
.btag:hover { color: var(--ink); border-color: var(--ink); }
.btag.is-on { background: var(--ink); color: var(--bg); border-color: var(--ink); }

.blog-card-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
.blog-card-tag {
  font-family: var(--ff-mono); font-size: 10.5px; letter-spacing: .06em;
  color: var(--ink); background: rgba(255, 255, 255, .07);
  border: 1px solid rgba(255, 255, 255, .22); border-radius: 999px; padding: 3px 10px;
}

/* ── Pagination ── */
.bpage { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: clamp(32px, 4vw, 48px); }
.bpage-n, .bpage-fl {
  font-family: var(--ff-mono); font-size: 13px; color: var(--ink-soft);
  background: none; border: 1px solid rgba(255, 255, 255, .22); border-radius: 10px;
  min-width: 40px; height: 40px; padding: 0 12px; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: color .18s ease, border-color .18s ease, background .18s ease;
}
.bpage-n:hover, .bpage-fl:not(:disabled):hover { color: var(--ink); border-color: var(--ink); }
.bpage-n.is-on { background: var(--ink); color: var(--bg); border-color: var(--ink); }
.bpage-fl svg { width: 16px; height: 16px; }
.bpage-fl:disabled { opacity: .3; cursor: default; }
.bpage-c { font-family: var(--ff-mono); font-size: 11.5px; color: var(--muted-2); margin-left: auto; }

.btags-empty { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.btag-reset { font-family: var(--ff-mono); font-size: 12px; color: var(--ink); background: none; border: 0; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
</style>
