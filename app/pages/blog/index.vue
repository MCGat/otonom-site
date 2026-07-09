<template>
  <section class="page-intro section--light"><div class="wrap">
    <span class="kicker reveal">Blog</span>
    <h1 class="reveal">Analyses & repères sur la transition mobilité et énergie.</h1>
    <p class="lede reveal">Fiscalité, recharge, énergie, ROI : nos décryptages pour piloter votre transition avec des chiffres, pas des intuitions.</p>
  </div></section>

  <section class="section section--tight"><div class="wrap">
    <div v-if="articles.length" class="blog-grid">
      <NuxtLink v-for="a in articles" :key="a.slug" class="blog-card" :to="`/blog/${a.slug}`">
        <div v-if="a.cover" class="blog-card-cover"><img :src="a.cover" :alt="a.title" loading="lazy"></div>
        <div class="blog-card-body">
          <span class="blog-card-date">{{ formatDate(a.publishedAt || a.createdAt) }}</span>
          <h3>{{ a.title }}</h3>
          <p v-if="a.excerpt">{{ a.excerpt }}</p>
          <span class="blog-card-more">Lire l'article
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </span>
        </div>
      </NuxtLink>
    </div>
    <p v-else class="muted">Les premiers articles arrivent bientôt.</p>
  </div></section>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Blog — OTONOM | Transition mobilité, recharge & énergie',
  description: "Décryptages OTONOM sur la fiscalité du véhicule électrique, la recharge (IRVE), l'énergie et le ROI de la transition des entreprises.",
  robots: 'noindex, nofollow'
})

const { data } = await useFetch<{ articles: any[] }>('/api/articles')
const articles = computed(() => data.value?.articles || [])

const formatDate = (iso?: string) => {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) } catch { return '' }
}
</script>
