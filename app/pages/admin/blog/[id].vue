<template>
  <div class="editor">
    <div class="editor-head">
      <NuxtLink to="/admin/blog" class="back">← Articles</NuxtLink>
      <div class="editor-actions">
        <a v-if="isLive && !isNew" :href="`/blog/${form.slug}`" target="_blank" rel="noopener" class="ed-view">Voir ↗</a>
        <span class="ed-state" :class="`ed-state--${form.status}`">{{ stateLabel }}</span>
        <button type="button" class="btn btn--primary" :disabled="saving" @click="save()">{{ saveLabel }}</button>
      </div>
    </div>

    <div class="editor-grid">
      <div class="editor-main">
        <input v-model="form.title" class="ed-title" placeholder="Titre de l'article" @input="onTitle">

        <div class="ed-toolbar">
          <button type="button" title="Gras" @mousedown.prevent="cmd('bold')"><b>B</b></button>
          <button type="button" title="Italique" @mousedown.prevent="cmd('italic')"><i>I</i></button>
          <span class="ed-sep" />
          <button type="button" @mousedown.prevent="block('h2')">Titre</button>
          <button type="button" @mousedown.prevent="block('h3')">Sous-titre</button>
          <button type="button" @mousedown.prevent="block('p')">¶</button>
          <button type="button" @mousedown.prevent="cmd('insertUnorderedList')">• Liste</button>
          <button type="button" @mousedown.prevent="addLink">Lien</button>
          <span class="ed-sep" />
          <button type="button" @mousedown.prevent="insert('callout')">Callout</button>
          <button type="button" @mousedown.prevent="insert('table')">Tableau</button>
          <button type="button" @mousedown.prevent="insert('faq')">FAQ</button>
        </div>

        <div ref="bodyEl" class="article-body ed-body" contenteditable="true" @input="markDirty" />
      </div>

      <aside class="editor-side">
        <label class="ed-label">Statut</label>
        <select v-model="form.status" class="ed-input" @change="onStatus">
          <option value="draft">Brouillon</option>
          <option value="scheduled">Programmé</option>
          <option value="published">Publié</option>
        </select>
        <p class="ed-help">{{ statusHelp }}</p>

        <template v-if="form.status === 'scheduled'">
          <label class="ed-label" for="ed-when">Date de mise en ligne</label>
          <input id="ed-when" v-model="form.publishedAtLocal" type="datetime-local" class="ed-input" @input="markDirty">
          <p v-if="scheduleInfo" class="ed-help" :class="{ 'ed-help--warn': schedulePast }">{{ scheduleInfo }}</p>
        </template>

        <label class="ed-label">Slug (URL) <small>/blog/…</small></label>
        <input v-model="form.slug" class="ed-input" @input="onSlugInput">

        <label class="ed-label">Extrait (résumé de liste)</label>
        <textarea v-model="form.excerpt" class="ed-input" rows="3" @input="markDirty" />

        <label class="ed-label">Image de couverture (URL)</label>
        <input v-model="form.cover" class="ed-input" placeholder="/assets/img/… ou https://…" @input="markDirty">
        <img v-if="form.cover" :src="form.cover" alt="" class="ed-cover-prev">

        <p v-if="error" class="ed-error">{{ error }}</p>
        <p v-if="saved" class="ed-saved">Enregistré ✓</p>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Éditeur — OTONOM Admin', robots: 'noindex, nofollow' })

const route = useRoute()
const isNew = route.params.id === 'new'

type Status = 'draft' | 'scheduled' | 'published'

const form = reactive({
  id: null as number | null, title: '', slug: '', excerpt: '', cover: '',
  status: 'draft' as Status, body: '',
  publishedAtLocal: '' // valeur du champ datetime-local (heure locale, pas UTC)
})
const slugTouched = ref(false)
const dirty = ref(false)
const markDirty = () => { dirty.value = true }
const onSlugInput = () => { slugTouched.value = true; markDirty() }

/* Le champ datetime-local travaille en heure LOCALE alors qu'on stocke en ISO/UTC :
   il faut convertir dans les deux sens, sinon la date dérive du décalage horaire. */
const isoToLocalInput = (iso?: string | null) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}
const localInputToIso = (v: string) => {
  const d = new Date(v) // interprété en heure locale par le navigateur
  return isNaN(d.getTime()) ? '' : d.toISOString()
}

if (!isNew) {
  const { data } = await useFetch<{ article: any }>(`/api/admin/articles/${route.params.id}`)
  const a = data.value?.article
  if (a) {
    Object.assign(form, {
      id: a.id, title: a.title, slug: a.slug, excerpt: a.excerpt || '', cover: a.cover || '',
      status: (a.status || 'draft') as Status, body: a.body || '',
      publishedAtLocal: a.status === 'scheduled' ? isoToLocalInput(a.publishedAt) : ''
    })
    slugTouched.value = true
  }
}

/* ── Statut : libellés, aides et état « en ligne » ── */
const scheduleIso = computed(() => localInputToIso(form.publishedAtLocal))
const schedulePast = computed(() => !!scheduleIso.value && scheduleIso.value <= new Date().toISOString())

const isLive = computed(() =>
  form.status === 'published' || (form.status === 'scheduled' && schedulePast.value))

const stateLabel = computed(() =>
  form.status === 'published' ? 'En ligne'
    : form.status === 'scheduled' ? (schedulePast.value ? 'En ligne' : 'Programmé')
      : 'Brouillon · hors ligne')

const saveLabel = computed(() =>
  form.status === 'published' ? (form.id ? 'Mettre à jour' : 'Publier')
    : form.status === 'scheduled' ? 'Programmer'
      : 'Enregistrer le brouillon')

const statusHelp = computed(() =>
  form.status === 'published' ? 'Visible et indexable par Google (si le blog est indexé).'
    : form.status === 'scheduled' ? 'Invisible jusqu’à la date choisie, puis mis en ligne automatiquement.'
      : 'Invisible du public et de Google : l’URL renvoie une 404. Idéal pour écrire en amont.')

const scheduleInfo = computed(() => {
  if (!form.publishedAtLocal) return 'Choisissez une date : elle est obligatoire pour programmer.'
  if (!scheduleIso.value) return 'Date invalide.'
  if (schedulePast.value) return '⚠ Cette date est déjà passée : l’article sera mis en ligne immédiatement.'
  const d = new Date(scheduleIso.value)
  return `Mise en ligne le ${d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.`
})

function onStatus() {
  markDirty()
  // pré-remplit une date par défaut (demain 9 h) pour éviter un champ vide
  if (form.status === 'scheduled' && !form.publishedAtLocal) {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    d.setHours(9, 0, 0, 0)
    form.publishedAtLocal = isoToLocalInput(d.toISOString())
  }
}

const bodyEl = ref<HTMLElement | null>(null)
function warnUnload(e: BeforeUnloadEvent) { if (dirty.value) { e.preventDefault(); e.returnValue = '' } }
onMounted(() => {
  if (bodyEl.value) bodyEl.value.innerHTML = form.body || '<p>Commencez à écrire…</p>'
  window.addEventListener('beforeunload', warnUnload)
})
onBeforeUnmount(() => window.removeEventListener('beforeunload', warnUnload))
// Alerte en navigation interne (Nuxt/Vue Router)
onBeforeRouteLeave(() => {
  if (dirty.value && !confirm('Vous avez des modifications non enregistrées. Quitter sans enregistrer ?')) return false
})

const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120)
function onTitle() { markDirty(); if (!slugTouched.value) form.slug = slugify(form.title) }

const cmd = (c: string) => document.execCommand(c, false)
const block = (tag: string) => document.execCommand('formatBlock', false, tag)
function addLink() {
  const url = prompt('URL du lien :')
  if (url) document.execCommand('createLink', false, url)
}
const BLOCKS: Record<string, string> = {
  callout: '<div class="article-callout"><span class="callout-label">À retenir</span><p>Votre point clé ici.</p></div><p><br></p>',
  table: '<table><thead><tr><th>Colonne</th><th>Valeur</th></tr></thead><tbody><tr><td>Ligne 1</td><td>…</td></tr><tr><td>Ligne 2</td><td>…</td></tr></tbody></table><p><br></p>',
  faq: '<div class="article-faq"><details><summary>Votre question ?</summary><div class="faq-a">Votre réponse.</div></details><details><summary>Autre question ?</summary><div class="faq-a">Autre réponse.</div></details></div><p><br></p>'
}
function insert(type: string) {
  bodyEl.value?.focus()
  document.execCommand('insertHTML', false, BLOCKS[type])
}

const saving = ref(false)
const saved = ref(false)
const error = ref('')
async function save() {
  if (saving.value) return
  error.value = ''
  if (!form.title.trim()) { error.value = 'Le titre est requis.'; return }
  if (form.status === 'scheduled' && !scheduleIso.value) {
    error.value = 'Choisissez une date de mise en ligne valide pour programmer.'
    return
  }
  saving.value = true
  form.body = bodyEl.value?.innerHTML || ''
  try {
    const res = await $fetch<{ ok: boolean; id: number; slug: string }>('/api/admin/articles', {
      method: 'POST',
      body: {
        id: form.id, title: form.title, slug: form.slug, excerpt: form.excerpt,
        cover: form.cover, body: form.body, status: form.status,
        publishedAt: form.status === 'scheduled' ? scheduleIso.value : undefined
      }
    })
    form.id = res.id
    form.slug = res.slug
    dirty.value = false
    saved.value = true
    setTimeout(() => { saved.value = false }, 2200)
    if (isNew) await navigateTo(`/admin/blog/${res.id}`)
  } catch (e: any) {
    error.value = e?.statusMessage || 'Enregistrement impossible.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.editor-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 22px; flex-wrap: wrap; }
.back { font-family: var(--ff-mono); font-size: 13px; color: var(--muted); }
.back:hover { color: var(--ink); }
.editor-actions { display: flex; align-items: center; gap: 12px; }
.editor-actions .btn { padding: 10px 18px; font-size: 13.5px; }
.ed-view { font-family: var(--ff-mono); font-size: 12.5px; color: var(--muted); }
.ed-view:hover { color: var(--ink); }

/* état courant, lisible d'un coup d'œil à côté du bouton d'enregistrement */
.ed-state { font-family: var(--ff-mono); font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; border-radius: 999px; padding: 4px 11px; white-space: nowrap; border: 1px solid var(--line); color: var(--muted-2); }
.ed-state--published { background: var(--ink); color: var(--bg); border-color: var(--ink); }
.ed-state--scheduled { color: var(--ink); border-color: var(--ink-soft); }

.ed-help { font-size: 11.5px; line-height: 1.5; color: var(--muted-2); margin: 6px 0 0; }
.ed-help--warn { color: var(--ink-soft); }

.editor-grid { display: grid; grid-template-columns: 1fr 300px; gap: 30px; align-items: start; }
.ed-title { width: 100%; font-family: var(--ff-display); font-size: clamp(24px, 3vw, 34px); font-weight: 600; color: var(--ink); background: none; border: 0; border-bottom: 1px solid var(--line); padding: 6px 0 14px; letter-spacing: -.01em; }
.ed-title:focus { outline: none; border-color: var(--ink); }

.ed-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 18px 0; padding: 8px; border: 1px solid var(--line); border-radius: 10px; background: var(--bg-1); position: sticky; top: 132px; z-index: 5; }
.ed-toolbar button { font-family: var(--ff-mono); font-size: 12.5px; color: var(--ink-soft); background: none; border: 1px solid transparent; border-radius: 7px; padding: 6px 10px; cursor: pointer; }
.ed-toolbar button:hover { background: var(--bg-2); border-color: var(--line); color: var(--ink); }
.ed-sep { width: 1px; height: 20px; background: var(--line); margin: 0 4px; }

.ed-body { max-width: none; margin-top: 0; min-height: 320px; border: 1px solid var(--line); border-radius: var(--radius); padding: clamp(20px, 3vw, 34px); background: var(--bg-1); }
.ed-body:focus { outline: none; border-color: var(--ink-soft); }

.editor-side { display: grid; gap: 8px; border: 1px solid var(--line); border-radius: var(--radius); padding: 22px; background: var(--bg-1); position: sticky; top: 132px; }
.ed-label { font-family: var(--ff-mono); font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: var(--muted-2); margin-top: 14px; }
.ed-label:first-child { margin-top: 0; }
.ed-label small { text-transform: none; letter-spacing: 0; color: var(--muted-2); }
.ed-input { width: 100%; font-family: var(--ff-text); font-size: 14px; color: var(--ink); background: var(--bg-2); border: 1px solid var(--line); border-radius: 9px; padding: 10px 12px; }
.ed-input:focus { outline: none; border-color: var(--ink); }
textarea.ed-input { resize: vertical; }
.ed-cover-prev { width: 100%; border-radius: 9px; border: 1px solid var(--line-soft); margin-top: 6px; filter: grayscale(1); }
.ed-error { font-size: 13px; color: var(--ink-soft); border-left: 2px solid var(--ink); padding-left: 10px; }
.ed-saved { font-family: var(--ff-mono); font-size: 12px; color: var(--muted); }

@media (max-width: 860px) { .editor-grid { grid-template-columns: 1fr; } .editor-side { position: static; } }
</style>
