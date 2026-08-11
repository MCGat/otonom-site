<template>
  <div>
    <div class="blog-admin-head">
      <div>
        <span class="kicker">Blog</span>
        <h1>Articles</h1>
        <p class="panel-sub">{{ articles.length }} article{{ articles.length > 1 ? 's' : '' }}. Le contenu (callouts, tableaux, FAQ) est mis en forme à la publication ; ici tu peux modifier les textes.</p>
      </div>
      <NuxtLink to="/admin/blog/new" class="btn btn--primary">+ Nouvel article</NuxtLink>
    </div>

    <!-- Filtres : recherche libre, statut, cocon, puis les tags en pastilles. -->
    <div class="flt">
      <div class="flt-row">
        <input v-model="q" type="search" class="flt-input" placeholder="Rechercher un titre, un slug…">
        <select v-model="fStatut" class="flt-select">
          <option value="">Tous les statuts</option>
          <option value="published">Publié</option>
          <option value="scheduled">Programmé</option>
          <option value="draft">Brouillon</option>
        </select>
        <select v-model="fCocon" class="flt-select">
          <option value="">Tous les cocons</option>
          <option v-for="c in COCONS" :key="c.cle" :value="c.cle">{{ c.label }}</option>
          <option value="__none">— Non classé —</option>
        </select>
      </div>

      <div v-if="tousLesTags.length" class="flt-tags">
        <span class="flt-tags-l">Tags</span>
        <button
          v-for="t in tousLesTags" :key="t" type="button"
          class="flt-tag" :class="{ 'is-on': fTags.includes(t) }"
          @click="basculerTag(t)">{{ t }}</button>
        <button v-if="actif" type="button" class="flt-clear" @click="reinitialiser">Tout effacer</button>
      </div>
    </div>

    <p v-if="actif" class="flt-count">{{ filtres.length }} sur {{ articles.length }} article{{ articles.length > 1 ? 's' : '' }}.</p>

    <div class="table-wrap">
      <table class="leads">
        <thead>
          <tr>
            <th>
              <button type="button" class="th-sort" @click="trier('title')">Titre <span class="th-ar">{{ fleche('title') }}</span></button>
            </th>
            <th>
              <button type="button" class="th-sort" @click="trier('status')">Statut <span class="th-ar">{{ fleche('status') }}</span></button>
            </th>
            <th>Cocon & tags</th>
            <th>
              <button type="button" class="th-sort" @click="trier('date')">Modifié le <span class="th-ar">{{ fleche('date') }}</span></button>
            </th>
            <th class="ta-r">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in filtres" :key="a.id">
            <td><NuxtLink :to="`/admin/blog/${a.id}`" class="lk">{{ a.title }}</NuxtLink><div class="art-slug">/blog/{{ a.slug }}</div></td>
            <td>
              <span class="badge" :class="badgeClass(a)">{{ statusLabel(a) }}</span>
              <div v-if="a.status === 'scheduled' && !isLive(a)" class="art-when">{{ formatDate(a.publishedAt) }}</div>
            </td>
            <td>
              <span v-if="coconDe(a)" class="cocon" title="Cocon déclaré dans l’article">{{ coconDe(a)!.label }}</span>
              <span v-else class="cocon cocon--none">Non classé</span>
              <div v-if="tagsDe(a).length" class="art-tags">
                <button v-for="t in tagsDe(a)" :key="t" type="button" class="art-tag" @click="basculerTag(t)">{{ t }}</button>
              </div>
            </td>
            <td class="nowrap muted-c">{{ formatDate(a.updatedAt || a.createdAt) }}</td>
            <td class="ta-r nowrap">
              <NuxtLink :to="`/admin/blog/${a.id}`" class="art-action">Éditer</NuxtLink>
              <a v-if="isLive(a)" :href="`/blog/${a.slug}`" target="_blank" rel="noopener" class="art-action">Voir</a>
              <button type="button" class="art-action art-del" @click="remove(a)">Supprimer</button>
            </td>
          </tr>
          <tr v-if="!filtres.length">
            <td colspan="5" class="empty">
              <template v-if="articles.length">Aucun article ne correspond à ces filtres. <button type="button" class="flt-clear" @click="reinitialiser">Tout effacer</button></template>
              <template v-else>Aucun article. Clique « + Nouvel article » pour commencer.</template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { COCONS, coconDe as resoudreCocon } from '~/utils/cocons'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Blog — OTONOM Admin', robots: 'noindex, nofollow' })

interface ArticleRow {
  id: number; slug: string; title: string; status: string
  tags?: string; cocon?: string
  createdAt?: string; updatedAt?: string; publishedAt?: string
}

/* Même règle que le serveur : un article programmé dont l'heure est passée est en ligne. */
const isLive = (a: ArticleRow) =>
  a.status === 'published' || (a.status === 'scheduled' && !!a.publishedAt && a.publishedAt <= new Date().toISOString())

const statusLabel = (a: ArticleRow) =>
  a.status === 'published' ? 'Publié'
    : a.status === 'scheduled' ? (isLive(a) ? 'En ligne' : 'Programmé')
      : 'Brouillon'

const badgeClass = (a: ArticleRow) => ({
  'badge--on': isLive(a),
  'badge--wait': a.status === 'scheduled' && !isLive(a)
})
const { data, refresh } = await useFetch<{ articles: ArticleRow[] }>('/api/admin/articles')
const articles = computed(() => data.value?.articles || [])

/* ── Cocon & tags ── */
const coconDe = (a: ArticleRow) => resoudreCocon(a)
const tagsDe = (a: ArticleRow) => String(a.tags || '').split(',').map((t) => t.trim()).filter(Boolean)

const tousLesTags = computed(() => {
  const set = new Set<string>()
  for (const a of articles.value) for (const t of tagsDe(a)) set.add(t)
  return [...set].sort((x, y) => x.localeCompare(y, 'fr'))
})

/* ── Filtres & tri ── */
const q = ref('')
const fStatut = ref('')
const fCocon = ref('')
const fTags = ref<string[]>([])

const actif = computed(() => !!q.value.trim() || !!fStatut.value || !!fCocon.value || fTags.value.length > 0)

function basculerTag(t: string) {
  const i = fTags.value.indexOf(t)
  if (i >= 0) fTags.value.splice(i, 1)
  else fTags.value.push(t)
}
function reinitialiser() { q.value = ''; fStatut.value = ''; fCocon.value = ''; fTags.value = [] }

const sansAccent = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

type Cle = 'title' | 'status' | 'date'
const tri = ref<{ cle: Cle; asc: boolean }>({ cle: 'date', asc: false })
function trier(cle: Cle) {
  if (tri.value.cle === cle) tri.value = { cle, asc: !tri.value.asc }
  else tri.value = { cle, asc: cle === 'title' } // titre A→Z, le reste du plus récent au plus ancien
}
const fleche = (cle: Cle) => (tri.value.cle === cle ? (tri.value.asc ? '↑' : '↓') : '')

/* Ordre métier des statuts : ce qui est en ligne d'abord, les brouillons en bout. */
const RANG: Record<string, number> = { published: 0, scheduled: 1, draft: 2 }

const filtres = computed(() => {
  const terme = sansAccent(q.value.trim())
  let out = articles.value.filter((a) => {
    if (terme && !sansAccent(`${a.title} ${a.slug}`).includes(terme)) return false
    if (fStatut.value && a.status !== fStatut.value) return false
    if (fCocon.value) {
      const c = coconDe(a)
      if (fCocon.value === '__none' ? !!c : c?.cle !== fCocon.value) return false
    }
    if (fTags.value.length) {
      const mes = tagsDe(a).map((t) => t.toLowerCase())
      // ET logique : cumuler des tags restreint la sélection.
      if (!fTags.value.every((t) => mes.includes(t.toLowerCase()))) return false
    }
    return true
  })

  const { cle, asc } = tri.value
  const s = asc ? 1 : -1
  out = [...out].sort((a, b) => {
    if (cle === 'title') return s * a.title.localeCompare(b.title, 'fr')
    if (cle === 'status') {
      const d = (RANG[a.status] ?? 9) - (RANG[b.status] ?? 9)
      return d !== 0 ? s * d : a.title.localeCompare(b.title, 'fr')
    }
    return s * String(a.updatedAt || a.createdAt || '').localeCompare(String(b.updatedAt || b.createdAt || ''))
  })
  return out
})

async function remove(a: ArticleRow) {
  if (!confirm(`Supprimer définitivement « ${a.title} » ?`)) return
  await $fetch(`/api/admin/articles/${a.id}`, { method: 'DELETE' })
  await refresh()
}

const formatDate = (iso?: string) => {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) } catch { return iso }
}
</script>

<style scoped>
.blog-admin-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; flex-wrap: wrap; margin-bottom: 26px; }
.blog-admin-head .kicker { font-family: var(--ff-mono); font-size: 12px; letter-spacing: .2em; text-transform: uppercase; color: var(--muted); }
.blog-admin-head h1 { font-size: clamp(26px, 4vw, 38px); margin-top: 10px; }
.panel-sub { color: var(--muted); font-size: 14px; margin-top: 8px; max-width: 70ch; }

/* ── Filtres ── */
.flt { border: 1px solid var(--line); border-radius: var(--radius); padding: 14px 16px; background: var(--bg-1); margin-bottom: 14px; }
.flt-row { display: flex; gap: 10px; flex-wrap: wrap; }
.flt-input { flex: 1 1 240px; font-family: var(--ff-text); font-size: 13.5px; color: var(--ink); background: var(--bg-2); border: 1px solid var(--line); border-radius: 9px; padding: 9px 12px; }
.flt-select { font-family: var(--ff-text); font-size: 13.5px; color: var(--ink); background: var(--bg-2); border: 1px solid var(--line); border-radius: 9px; padding: 9px 12px; }
.flt-input:focus, .flt-select:focus { outline: none; border-color: var(--ink); }

.flt-tags { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--line-soft); }
.flt-tags-l { font-family: var(--ff-mono); font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: var(--muted-2); margin-right: 3px; }
.flt-tag { font-family: var(--ff-mono); font-size: 11px; color: var(--muted); background: none; border: 1px solid var(--line); border-radius: 999px; padding: 4px 11px; cursor: pointer; }
.flt-tag:hover { color: var(--ink); border-color: var(--ink-soft); }
.flt-tag.is-on { background: var(--ink); color: var(--bg); border-color: var(--ink); }
.flt-clear { font-family: var(--ff-mono); font-size: 11px; color: var(--muted-2); background: none; border: 0; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; margin-left: 4px; }
.flt-clear:hover { color: var(--ink); }
.flt-count { font-family: var(--ff-mono); font-size: 11.5px; color: var(--muted-2); margin-bottom: 12px; }

.table-wrap { border: 1px solid var(--line); border-radius: var(--radius); overflow-x: auto; }
.leads { width: 100%; border-collapse: collapse; font-size: 14px; }
.leads th, .leads td { text-align: left; padding: 14px 16px; border-bottom: 1px solid var(--line-soft); vertical-align: top; }
.leads thead th { font-family: var(--ff-mono); font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); background: var(--bg-1); }
.leads tbody tr:hover { background: var(--bg-1); }
.th-sort { font: inherit; letter-spacing: inherit; text-transform: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
.th-sort:hover { color: var(--ink); }
.th-ar { display: inline-block; width: 10px; color: var(--ink); }
.ta-r { text-align: right; }
.nowrap { white-space: nowrap; } .muted-c { color: var(--muted); }
.lk { color: var(--ink); font-family: var(--ff-display); font-size: 15px; }
.art-slug { font-family: var(--ff-mono); font-size: 11px; color: var(--muted-2); margin-top: 4px; }
.badge { font-family: var(--ff-mono); font-size: 11px; letter-spacing: .04em; border: 1px solid var(--line); border-radius: 999px; padding: 3px 10px; color: var(--muted); }
.badge--on { color: var(--ink); border-color: var(--ink); }
.badge--wait { color: var(--ink-soft); border-color: var(--ink-soft); border-style: dashed; }
.art-when { font-family: var(--ff-mono); font-size: 10.5px; color: var(--muted-2); margin-top: 5px; }

/* Cocon : plein s'il est déclaré, pointillé s'il n'y en a pas. */
.cocon { display: inline-block; font-family: var(--ff-mono); font-size: 10.5px; letter-spacing: .03em; color: var(--ink); border: 1px solid var(--ink-soft); border-radius: 6px; padding: 3px 9px; white-space: nowrap; }
.cocon--none { color: var(--muted-2); border-color: var(--line); border-style: dashed; }
.art-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 7px; }
.art-tag { font-family: var(--ff-mono); font-size: 10px; color: var(--muted-2); background: none; border: 1px solid var(--line-soft); border-radius: 999px; padding: 2px 8px; cursor: pointer; }
.art-tag:hover { color: var(--ink); border-color: var(--ink-soft); }

.art-action { font-family: var(--ff-mono); font-size: 12px; color: var(--muted); margin-left: 16px; background: none; border: 0; cursor: pointer; }
.art-action:hover { color: var(--ink); }
.art-del:hover { color: var(--ink); text-decoration: underline; }
.empty { text-align: center; color: var(--muted); padding: 40px 16px; }
</style>
