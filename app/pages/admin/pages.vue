<template>
  <div>
    <div class="pg-head">
      <div>
        <span class="kicker">Pages &amp; indexation</span>
        <h1>Toutes les pages du site</h1>
        <p class="panel-sub">
          Une page <strong>indexée</strong> peut apparaître dans Google et figure dans le
          <a href="/sitemap.xml" target="_blank" rel="noopener">sitemap</a>. Une page
          <strong>non indexée</strong> reste accessible par son URL, mais est exclue de Google et du sitemap.
          Les changements sont <strong>immédiats</strong>, sans mise en ligne.
        </p>
      </div>
      <div class="pg-count">
        <div><b class="tabnum">{{ stats.indexed }}</b><span>indexées</span></div>
        <div><b class="tabnum">{{ stats.noindex }}</b><span>non indexées</span></div>
      </div>
    </div>

    <p v-if="error" class="pg-error">{{ error }}</p>

    <section v-for="grp in groups" :key="grp.key" class="pg-group">
      <div class="pg-group-head">
        <h2>{{ grp.label }}</h2>
        <span class="pg-group-n tabnum">{{ grp.rows.length }}</span>
      </div>
      <p v-if="grp.note" class="pg-group-note">{{ grp.note }}</p>

      <ul class="pg-list">
        <li v-for="row in grp.rows" :key="row.path" class="pg-row" :class="{ 'is-off': !row.indexed }">
          <span class="pg-dot" aria-hidden="true" />
          <div class="pg-id">
            <span class="pg-name">{{ row.name }}</span>
            <a class="pg-url" :href="row.path" target="_blank" rel="noopener">{{ row.path }} ↗</a>
          </div>

          <span class="pg-badge" :class="row.indexed ? 'pg-badge--on' : 'pg-badge--off'">
            {{ row.indexed ? 'Indexée' : 'Non indexée' }}
          </span>

          <span class="pg-sitemap" :title="row.indexed ? 'Présente dans le sitemap' : 'Exclue du sitemap'">
            {{ row.inSitemap ? 'sitemap ✓' : 'sitemap —' }}
          </span>

          <button
            v-if="!row.locked"
            type="button"
            class="pg-switch"
            role="switch"
            :aria-checked="row.indexed"
            :aria-label="`Indexation de ${row.name}`"
            :disabled="busy === row.path"
            @click="toggle(row)"
          ><span class="pg-knob" /></button>
          <span v-else class="pg-lock" :title="row.lockReason">🔒 {{ row.lockShort }}</span>
        </li>
      </ul>
    </section>

    <!-- Ce que voient réellement les moteurs : sortie live, mise à jour à chaque bascule -->
    <section class="pg-files">
      <div class="pg-group-head">
        <h2>Ce que voient les moteurs</h2>
        <span class="pg-group-n tabnum">{{ fileTab === 'sitemap' ? sitemapCount + ' URL' : robotsLines + ' lignes' }}</span>
      </div>
      <p class="pg-group-note">
        Contenu réel servi en ce moment. Le sitemap se régénère automatiquement à chaque bascule ci-dessus.
      </p>

      <div class="pg-filebar">
        <div class="pg-ftabs">
          <button type="button" :class="{ active: fileTab === 'sitemap' }" @click="fileTab = 'sitemap'">sitemap.xml</button>
          <button type="button" :class="{ active: fileTab === 'robots' }" @click="fileTab = 'robots'">robots.txt</button>
        </div>
        <div class="pg-factions">
          <button type="button" class="pg-flink" :disabled="filesBusy" @click="loadFiles">
            {{ filesBusy ? 'Chargement…' : 'Rafraîchir' }}
          </button>
          <a class="pg-flink" :href="fileTab === 'sitemap' ? '/sitemap.xml' : '/robots.txt'" target="_blank" rel="noopener">Ouvrir ↗</a>
        </div>
      </div>

      <pre class="pg-code"><code>{{ fileTab === 'sitemap' ? sitemapTxt : robotsTxt }}</code></pre>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Pages & indexation — OTONOM Admin', robots: 'noindex, nofollow' })

interface Row {
  path: string; name: string; indexed: boolean; inSitemap: boolean
  locked: boolean; lockReason?: string; lockShort?: string
}

const { data, refresh } = await useFetch<{
  settings: Record<string, boolean>; locked: string[]; alwaysNoindex: string[]
}>('/api/admin/pages')

const busy = ref('')
const error = ref('')

// Noms lisibles + regroupement. Toute page inconnue atterrit dans « Autres ».
const NAMES: Record<string, string> = {
  '/': 'Accueil', '/expertises': 'Expertises', '/methode': 'Méthode',
  '/a-propos': 'À propos', '/contact': 'Contact', '/simulateur': 'Simulateur',
  '/blog': 'Blog (liste des articles)', '/dirigeants': 'Dirigeants', '/daf': 'DAF',
  '/drh': 'DRH', '/services-generaux': 'Services généraux',
  '/mentions-legales': 'Mentions légales', '/confidentialite': 'Politique de confidentialité',
  '/accueil-v2': 'Accueil V2 (travail)', '/merci': 'Merci (après envoi)'
}
const GROUPS: Array<{ key: string; label: string; paths: string[]; note?: string }> = [
  { key: 'main', label: 'Pages principales', paths: ['/', '/expertises', '/methode', '/a-propos', '/contact'] },
  { key: 'persona', label: 'Pages personas', paths: ['/dirigeants', '/daf', '/drh', '/services-generaux'] },
  { key: 'tools', label: 'Outils', paths: ['/simulateur'] },
  { key: 'content', label: 'Contenu', paths: ['/blog'], note: 'Désindexer le blog désindexe aussi tous ses articles. Le statut brouillon/publié de chaque article se gère dans l’onglet Blog.' },
  { key: 'legal', label: 'Pages légales', paths: ['/mentions-legales', '/confidentialite'] }
]

// Liste auto-détectée depuis le routeur : une nouvelle page apparaît ici toute seule.
const router = useRouter()
const routePaths = computed(() => {
  const seen = new Set<string>()
  for (const r of router.getRoutes()) {
    const p = r.path
    if (!p.startsWith('/')) continue
    if (p.includes(':') || p.includes('*')) continue        // routes dynamiques (articles)
    if (p.startsWith('/admin')) continue                     // zone technique
    seen.add(p.length > 1 ? p.replace(/\/+$/, '') : '/')
  }
  return Array.from(seen)
})

function makeRow(path: string): Row {
  const settings = data.value?.settings || {}
  const locked = (data.value?.locked || []).includes(path)
  const always = (data.value?.alwaysNoindex || []).some((b) => path === b || path.startsWith(b + '/'))
  const indexed = always ? false : locked ? true : settings[path] !== false
  return {
    path,
    name: NAMES[path] || path.replace('/', '').replace(/-/g, ' ') || path,
    indexed,
    inSitemap: indexed,
    locked: locked || always,
    lockReason: always
      ? 'Page technique : jamais indexable.'
      : 'Page critique : ne peut pas être désindexée depuis l’admin (sécurité SEO).',
    lockShort: always ? 'technique' : 'verrouillée'
  }
}

const groups = computed(() => {
  const known = new Set(GROUPS.flatMap((g) => g.paths))
  const out = GROUPS.map((g) => ({
    ...g,
    rows: g.paths.filter((p) => routePaths.value.includes(p)).map(makeRow)
  })).filter((g) => g.rows.length)

  const others = routePaths.value.filter((p) => !known.has(p)).sort()
  if (others.length) {
    out.push({
      key: 'other', label: 'Autres pages',
      paths: others,
      note: 'Pages détectées automatiquement (pages de travail, utilitaires…).',
      rows: others.map(makeRow)
    })
  }
  return out
})

const stats = computed(() => {
  const rows = groups.value.flatMap((g) => g.rows)
  return { indexed: rows.filter((r) => r.indexed).length, noindex: rows.filter((r) => !r.indexed).length }
})

async function toggle(row: Row) {
  if (row.locked || busy.value) return
  const next = !row.indexed
  if (!next && !confirm(`Désindexer « ${row.name} » ?\n\nElle sortira de Google (progressivement) et du sitemap. Elle restera accessible par son URL.`)) return
  busy.value = row.path
  error.value = ''
  try {
    await $fetch('/api/admin/pages', { method: 'POST', body: { path: row.path, indexed: next } })
    await refresh()
    await loadFiles() // le sitemap ci-dessous reflète aussitôt la bascule
  } catch (e: any) {
    error.value = e?.statusMessage || 'Modification impossible.'
  } finally {
    busy.value = ''
  }
}

/* ── Sortie réelle servie aux moteurs (sitemap + robots.txt) ── */
const fileTab = ref<'sitemap' | 'robots'>('sitemap')
const sitemapTxt = ref('')
const robotsTxt = ref('')
const filesBusy = ref(false)
const sitemapCount = computed(() => (sitemapTxt.value.match(/<loc>/g) || []).length)
const robotsLines = computed(() => robotsTxt.value.split('\n').filter((l) => l.trim()).length)

async function loadFiles() {
  filesBusy.value = true
  // paramètre anti-cache : on veut la sortie réellement servie à l'instant T
  const bust = `?_=${Date.now()}`
  try {
    sitemapTxt.value = await $fetch<string>(`/sitemap.xml${bust}`, { responseType: 'text' })
  } catch {
    sitemapTxt.value = '— Impossible de charger le sitemap.'
  }
  try {
    robotsTxt.value = await $fetch<string>(`/robots.txt${bust}`, { responseType: 'text' })
  } catch {
    robotsTxt.value = '— Impossible de charger robots.txt.'
  }
  filesBusy.value = false
}
onMounted(loadFiles)
</script>

<style scoped>
.pg-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap; margin-bottom: 30px; }
.pg-head .kicker { font-family: var(--ff-mono); font-size: 12px; letter-spacing: .2em; text-transform: uppercase; color: var(--muted); }
.pg-head h1 { font-size: clamp(26px, 4vw, 38px); margin-top: 10px; }
.panel-sub { color: var(--muted); font-size: 14px; margin-top: 10px; max-width: 74ch; line-height: 1.6; }
.panel-sub a { color: var(--ink); text-decoration: underline; text-underline-offset: 2px; }
.panel-sub strong { color: var(--ink-soft); }

.pg-count { display: flex; gap: 26px; }
.pg-count div { display: flex; flex-direction: column; gap: 3px; }
.pg-count b { font-family: var(--ff-mono); font-size: 28px; color: var(--ink); line-height: 1; }
.pg-count span { font-family: var(--ff-mono); font-size: 10.5px; letter-spacing: .12em; text-transform: uppercase; color: var(--muted-2); }

.pg-error { border-left: 2px solid var(--ink); padding-left: 12px; font-size: 13.5px; color: var(--ink-soft); margin-bottom: 20px; }

.pg-group { margin-bottom: 34px; }
.pg-group-head { display: flex; align-items: baseline; gap: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--line); }
.pg-group-head h2 { font-size: 15px; font-family: var(--ff-mono); font-weight: 400; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
.pg-group-n { font-family: var(--ff-mono); font-size: 12px; color: var(--muted-2); }
.pg-group-note { font-size: 12.5px; color: var(--muted-2); margin-top: 10px; line-height: 1.55; max-width: 80ch; }

.pg-list { list-style: none; margin: 0; padding: 0; }
.pg-row { display: grid; grid-template-columns: 8px minmax(0, 1fr) 116px 92px 46px; align-items: center; gap: 16px; padding: 15px 4px; border-bottom: 1px solid var(--line-soft); }
.pg-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--ink); }
.pg-row.is-off .pg-dot { background: none; border: 1px solid var(--muted-2); }

.pg-id { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.pg-name { font-size: 14.5px; color: var(--ink); }
.pg-row.is-off .pg-name { color: var(--muted); }
.pg-url { font-family: var(--ff-mono); font-size: 11.5px; color: var(--muted-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pg-url:hover { color: var(--ink); }

.pg-badge { justify-self: start; font-family: var(--ff-mono); font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; border-radius: 999px; padding: 4px 11px; white-space: nowrap; }
.pg-badge--on { background: var(--ink); color: var(--bg); }
.pg-badge--off { color: var(--muted-2); border: 1px solid var(--line); }

.pg-sitemap { font-family: var(--ff-mono); font-size: 11px; color: var(--muted-2); white-space: nowrap; }

.pg-switch { position: relative; width: 42px; height: 24px; border-radius: 999px; border: 1px solid var(--line); background: var(--bg-2); cursor: pointer; padding: 0; transition: background .2s ease, border-color .2s ease; justify-self: end; }
.pg-switch[aria-checked="true"] { background: var(--ink); border-color: var(--ink); }
.pg-switch:disabled { opacity: .5; cursor: wait; }
.pg-switch:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
.pg-knob { position: absolute; top: 50%; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: var(--muted); transform: translateY(-50%); transition: left .2s cubic-bezier(.2, .8, .3, 1), background .2s ease; }
.pg-switch[aria-checked="true"] .pg-knob { left: 21px; background: var(--bg); }

.pg-lock { justify-self: end; font-family: var(--ff-mono); font-size: 10px; color: var(--muted-2); white-space: nowrap; }

/* ── Sortie moteurs (sitemap / robots) ── */
.pg-files { margin-top: 46px; }
.pg-filebar { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin: 18px 0 0; }
.pg-ftabs { display: flex; gap: 4px; border: 1px solid var(--line); border-radius: 999px; padding: 3px; }
.pg-ftabs button { font-family: var(--ff-mono); font-size: 11.5px; letter-spacing: .06em; color: var(--muted); background: none; border: 0; border-radius: 999px; padding: 6px 14px; cursor: pointer; transition: background .2s ease, color .2s ease; }
.pg-ftabs button:hover { color: var(--ink); }
.pg-ftabs button.active { background: var(--ink); color: var(--bg); }
.pg-factions { display: flex; align-items: center; gap: 16px; }
.pg-flink { font-family: var(--ff-mono); font-size: 11.5px; color: var(--muted); background: none; border: 0; padding: 0; cursor: pointer; }
.pg-flink:hover { color: var(--ink); }
.pg-flink:disabled { opacity: .5; cursor: wait; }

.pg-code { margin: 12px 0 0; max-height: 380px; overflow: auto; background: var(--bg-1); border: 1px solid var(--line); border-radius: var(--radius); padding: 18px 20px; font-family: var(--ff-mono); font-size: 12px; line-height: 1.65; color: var(--ink-soft); white-space: pre; tab-size: 2; }
.pg-code code { font: inherit; color: inherit; }

@media (max-width: 780px) {
  .pg-row { grid-template-columns: 8px minmax(0, 1fr) auto; row-gap: 10px; }
  .pg-sitemap { grid-column: 2; }
  .pg-badge { grid-column: 2; }
}
</style>
