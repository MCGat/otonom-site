<template>
  <article v-if="article">
    <section class="article-hero">
      <div class="wrap article-hero-grid" :class="{ 'no-cover': !article.cover }">
        <div class="article-hero-text">
          <span class="kicker reveal">Blog</span>
          <div class="article-meta reveal">{{ formatDate(article.publishedAt || article.createdAt) }}</div>
          <h1 class="reveal">{{ article.title }}</h1>
          <p v-if="article.excerpt" class="lede reveal">{{ article.excerpt }}</p>
          <!-- Les tags ferment le hero : ils situent l'article, et chacun ramène
               au blog filtré sur ce sujet. -->
          <div v-if="tags.length" class="article-hero-tags reveal">
            <NuxtLink v-for="t in tags" :key="t" class="article-hero-tag" :to="{ path: '/blog', query: { sujet: t } }">{{ t }}</NuxtLink>
          </div>
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
      <ArticlesLies :slug="article.slug" :cocon="article.cocon" />
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
  ogType: 'article'
})

const formatDate = (iso?: string) => {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) } catch { return '' }
}

const tags = computed(() =>
  String(article.value?.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean))

/**
 * Le simulateur à pousser selon le cocon de l'article.
 *
 * Rendu par la page, jamais écrit dans le corps des articles : un seul endroit
 * à corriger si un simulateur change de nom ou d'adresse — le renommage de
 * /simulateurs/transition a montré ce que coûte l'inverse.
 */
const SIMULATEUR_PAR_COCON: Record<string, { url: string; titre: string; pitch: string; cta: string }> = {
  tourisme: {
    url: '/simulateurs/bornes-camping-hotel',
    titre: 'Combien de bornes pour votre camping ou votre hôtel ?',
    pitch: 'Votre capacité, votre occupation et votre puissance souscrite donnent le nombre de points de charge, le budget et les aides mobilisables.',
    cta: 'Calculer mon besoin'
  },
  tco: {
    url: '/simulateurs/tco-flotte-electrique',
    titre: 'Ce que coûterait vraiment votre flotte en électrique',
    pitch: "Le coût total de possession comparé au thermique, bornes et raccordement compris, avec le point de bascule et le coût au kilomètre.",
    cta: 'Calculer mon TCO'
  },
  fiscalite: {
    url: '/simulateurs/tco-flotte-electrique',
    titre: 'Ce que ces règles fiscales pèsent sur votre flotte',
    pitch: 'Les leviers fiscaux replacés dans le coût complet du véhicule : amortissement, taxes annuelles, avantage en nature et recharge.',
    cta: 'Calculer mon TCO'
  },
  flotte: {
    url: '/simulateurs/tco-flotte-electrique',
    titre: 'Ce que coûterait vraiment votre flotte en électrique',
    pitch: 'Le coût total de possession comparé au thermique, bornes et raccordement compris, avec le point de bascule et le coût au kilomètre.',
    cta: 'Calculer mon TCO'
  },
  recharge: {
    url: '/simulateurs/tco-flotte-electrique',
    titre: 'Chiffrez votre infrastructure de recharge',
    pitch: 'Points de charge, travaux et raccordement, replacés dans le coût complet de la flotte qu’ils desservent.',
    cta: 'Calculer mon TCO'
  }
}
/* Repli : le diagnostic large convient à tout article sans cocon dédié. */
const SIMULATEUR_DEFAUT = {
  url: '/simulateurs/economies-et-roi',
  titre: 'Combien votre transition peut-elle vous rapporter ?',
  pitch: 'Économies annuelles, investissement, aides mobilisables et retour sur investissement, en moins de cinq minutes.',
  cta: 'Estimer mes gains'
}
const simulateur = computed(() =>
  SIMULATEUR_PAR_COCON[String(article.value?.cocon || '')] || SIMULATEUR_DEFAUT)

const FLECHE = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'

function blocSimulateur(s: typeof SIMULATEUR_DEFAUT) {
  return '<aside class="article-simu">'
    + '<span class="article-simu-l">Simulateur gratuit</span>'
    + `<p class="article-simu-t">${s.titre}</p>`
    + `<p class="article-simu-p">${s.pitch}</p>`
    + `<a class="article-simu-cta" href="${s.url}">${s.cta}${FLECHE}</a>`
    + '<span class="article-simu-note">Calcul immédiat dans votre navigateur, sans engagement.</span>'
    + '</aside>'
}

/**
 * Insère le bloc juste APRÈS le TL;DR — le moment où le lecteur sait de quoi on
 * parle et n'a pas encore décroché. Sans TL;DR, il ouvre l'article.
 * On compte les <div> imbriqués plutôt que de chercher le premier </div> : le
 * jour où un TL;DR contiendra un bloc, la coupe tomberait au mauvais endroit.
 */
function insererApresTldr(html: string, bloc: string): string {
  const ouverture = html.indexOf('<div class="article-tldr"')
  if (ouverture === -1) return bloc + html
  let i = html.indexOf('>', ouverture) + 1
  let profondeur = 1
  while (i < html.length && profondeur > 0) {
    const suivantOuvrant = html.indexOf('<div', i)
    const suivantFermant = html.indexOf('</div>', i)
    if (suivantFermant === -1) return bloc + html
    if (suivantOuvrant !== -1 && suivantOuvrant < suivantFermant) {
      profondeur++
      i = suivantOuvrant + 4
    } else {
      profondeur--
      i = suivantFermant + 6
    }
  }
  return html.slice(0, i) + '\n' + bloc + html.slice(i)
}

// Sommaire : ajoute une ancre (id) à chaque <h2> du corps et extrait la liste
const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
function processBody(html: string) {
  const toc: { id: string; text: string }[] = []
  let out = (html || '').replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g, (m, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
    if (!text) return m
    const id = slugify(text)
    toc.push({ id, text })
    return /\bid=/.test(attrs) ? m : `<h2${attrs} id="${id}">${inner}</h2>`
  })
  // Enveloppe chaque tableau pour un défilement horizontal (évite le débordement sur mobile)
  out = out.replace(/<table\b[\s\S]*?<\/table>/g, (t) =>
    `<div class="table-x"><div class="table-x-scroll" tabindex="0" role="region" aria-label="Tableau (défilement horizontal)">${t}</div></div>`)
  return { html: out, toc }
}
const processed = computed(() =>
  processBody(insererApresTldr(article.value.body || '', blocSimulateur(simulateur.value))))
const processedHtml = computed(() => processed.value.html)
const toc = computed(() => processed.value.toc)

// Indicateurs de défilement des tableaux (fondu + pastille), pilotés selon la position
function setEnds(wrap: HTMLElement, sc: HTMLElement) {
  wrap.classList.toggle('at-end', sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 2)
  wrap.classList.toggle('at-start', sc.scrollLeft <= 2)
}
function updateTables() {
  document.querySelectorAll<HTMLElement>('.article-body .table-x').forEach((wrap) => {
    const sc = wrap.querySelector<HTMLElement>('.table-x-scroll')
    if (!sc) return
    wrap.classList.toggle('can-scroll', sc.scrollWidth - sc.clientWidth > 2)
    if (!sc.dataset.bound) {
      sc.dataset.bound = '1'
      sc.addEventListener('scroll', () => setEnds(wrap, sc), { passive: true })
    }
    setEnds(wrap, sc)
  })
}
onMounted(() => {
  updateTables()
  window.addEventListener('resize', updateTables, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('resize', updateTables))
</script>

<style scoped>
.article-back { max-width: 760px; margin: clamp(36px, 5vw, 56px) auto 0; }
</style>
