<template>
  <article v-if="article">
    <section class="article-hero">
      <div class="wrap article-hero-grid" :class="{ 'no-cover': !article.cover }">
        <div class="article-hero-text">
          <span class="kicker reveal">Blog</span>
          <div class="article-meta reveal">{{ formatDate(article.publishedAt || article.createdAt) }}</div>
          <h1 class="reveal">{{ article.title }}</h1>
          <p v-if="article.excerpt" class="lede reveal">{{ article.excerpt }}</p>
        </div>
        <div v-if="article.cover" class="article-hero-cover reveal"><img :src="article.cover" :alt="article.title"></div>
      </div>
    </section>

    <section class="section section--light"><div class="wrap">
      <nav v-if="toc.length > 1" class="article-toc" aria-label="Sommaire">
        <span class="article-toc-label">Sommaire</span>
        <ol>
          <li v-for="t in toc" :key="t.id"><a :href="`#${t.id}`">{{ t.text }}</a></li>
        </ol>
      </nav>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="article-body" v-html="processedHtml"></div>
      <div class="article-back"><NuxtLink class="btn btn--ghost" to="/blog">← Tous les articles</NuxtLink></div>
    </div></section>

    <section class="section"><div class="wrap"><div class="cta-block reveal">
      <h2>Envie d'appliquer ça à votre flotte ?</h2>
      <p class="lede">Un diagnostic gratuit, chiffré et sans engagement.</p>
      <div class="hero-cta"><NuxtLink class="btn btn--primary btn--lg" to="/contact">Réserver mon audit gratuit
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6" /></svg></NuxtLink></div>
    </div></div></section>
  </article>
</template>

<script setup lang="ts">
const route = useRoute()
const { data, error } = await useFetch<{ article: any }>(`/api/articles/${route.params.slug}`)
if (error.value || !data.value?.article) {
  throw createError({ statusCode: 404, statusMessage: 'Article introuvable', fatal: true })
}
const article = computed(() => data.value!.article)

useSeoMeta({
  title: () => `${article.value.title} — OTONOM`,
  description: () => article.value.excerpt || '',
  ogTitle: () => article.value.title,
  ogDescription: () => article.value.excerpt || '',
  ogImage: () => article.value.cover || undefined,
  ogType: 'article',
  robots: 'noindex, nofollow'
})

const formatDate = (iso?: string) => {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) } catch { return '' }
}

// Sommaire : ajoute une ancre (id) à chaque <h2> du corps et extrait la liste
const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
function processBody(html: string) {
  const toc: { id: string; text: string }[] = []
  const out = (html || '').replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g, (m, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
    if (!text) return m
    const id = slugify(text)
    toc.push({ id, text })
    return /\bid=/.test(attrs) ? m : `<h2${attrs} id="${id}">${inner}</h2>`
  })
  return { html: out, toc }
}
const processed = computed(() => processBody(article.value.body || ''))
const processedHtml = computed(() => processed.value.html)
const toc = computed(() => processed.value.toc)
</script>

<style scoped>
.article-back { max-width: 760px; margin: clamp(36px, 5vw, 56px) auto 0; }
</style>
