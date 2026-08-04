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

    <div v-if="visibles.length" class="blog-grid">
      <NuxtLink v-for="a in visibles" :key="a.slug" class="blog-card" :to="`/blog/${a.slug}`">
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

    <p v-else-if="articles.length" class="muted btags-empty">
      Aucun article sur ce sujet pour le moment.
      <button type="button" class="btag-reset" @click="choisir('')">Voir tous les articles</button>
    </p>
    <p v-else class="muted">Les premiers articles arrivent bientôt.</p>
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

const choisir = (t: string) =>
  router.replace({ query: { ...route.query, sujet: t || undefined } })

const visibles = computed(() => {
  if (!tagActif.value) return articles.value
  const cle = tagActif.value.toLowerCase()
  return articles.value.filter((a) => tagsDe(a).some((t) => t.toLowerCase() === cle))
})

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
  font-family: var(--ff-mono); font-size: 11.5px; letter-spacing: .04em; color: var(--muted);
  background: none; border: 1px solid var(--line); border-radius: 999px; padding: 7px 15px; cursor: pointer;
  transition: color .18s ease, border-color .18s ease, background .18s ease;
}
.btag:hover { color: var(--ink); border-color: var(--ink-soft); }
.btag.is-on { background: var(--ink); color: var(--bg); border-color: var(--ink); }

.blog-card-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
.blog-card-tag { font-family: var(--ff-mono); font-size: 10px; letter-spacing: .05em; color: var(--muted-2); border: 1px solid var(--line-soft); border-radius: 999px; padding: 3px 9px; }

.btags-empty { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.btag-reset { font-family: var(--ff-mono); font-size: 12px; color: var(--ink); background: none; border: 0; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
</style>
