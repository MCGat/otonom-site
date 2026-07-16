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

    <div class="table-wrap">
      <table class="leads">
        <thead>
          <tr><th>Titre</th><th>Statut</th><th>Modifié le</th><th class="ta-r">Actions</th></tr>
        </thead>
        <tbody>
          <tr v-for="a in articles" :key="a.id">
            <td><NuxtLink :to="`/admin/blog/${a.id}`" class="lk">{{ a.title }}</NuxtLink><div class="art-slug">/blog/{{ a.slug }}</div></td>
            <td>
              <span class="badge" :class="badgeClass(a)">{{ statusLabel(a) }}</span>
              <div v-if="a.status === 'scheduled' && !isLive(a)" class="art-when">{{ formatDate(a.publishedAt) }}</div>
            </td>
            <td class="nowrap muted-c">{{ formatDate(a.updatedAt || a.createdAt) }}</td>
            <td class="ta-r nowrap">
              <NuxtLink :to="`/admin/blog/${a.id}`" class="art-action">Éditer</NuxtLink>
              <a v-if="isLive(a)" :href="`/blog/${a.slug}`" target="_blank" rel="noopener" class="art-action">Voir</a>
              <button type="button" class="art-action art-del" @click="remove(a)">Supprimer</button>
            </td>
          </tr>
          <tr v-if="!articles.length"><td colspan="4" class="empty">Aucun article. Clique « + Nouvel article » pour commencer.</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Blog — OTONOM Admin', robots: 'noindex, nofollow' })

interface ArticleRow { id: number; slug: string; title: string; status: string; createdAt?: string; updatedAt?: string; publishedAt?: string }

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
.table-wrap { border: 1px solid var(--line); border-radius: var(--radius); overflow-x: auto; }
.leads { width: 100%; border-collapse: collapse; font-size: 14px; }
.leads th, .leads td { text-align: left; padding: 14px 16px; border-bottom: 1px solid var(--line-soft); vertical-align: top; }
.leads thead th { font-family: var(--ff-mono); font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); background: var(--bg-1); }
.leads tbody tr:hover { background: var(--bg-1); }
.ta-r { text-align: right; }
.nowrap { white-space: nowrap; } .muted-c { color: var(--muted); }
.lk { color: var(--ink); font-family: var(--ff-display); font-size: 15px; }
.art-slug { font-family: var(--ff-mono); font-size: 11px; color: var(--muted-2); margin-top: 4px; }
.badge { font-family: var(--ff-mono); font-size: 11px; letter-spacing: .04em; border: 1px solid var(--line); border-radius: 999px; padding: 3px 10px; color: var(--muted); }
.badge--on { color: var(--ink); border-color: var(--ink); }
.badge--wait { color: var(--ink-soft); border-color: var(--ink-soft); border-style: dashed; }
.art-when { font-family: var(--ff-mono); font-size: 10.5px; color: var(--muted-2); margin-top: 5px; }
.art-action { font-family: var(--ff-mono); font-size: 12px; color: var(--muted); margin-left: 16px; background: none; border: 0; cursor: pointer; }
.art-action:hover { color: var(--ink); }
.art-del:hover { color: var(--ink); text-decoration: underline; }
.empty { text-align: center; color: var(--muted); padding: 40px 16px; }
</style>
