<template>
  <div class="editor">
    <div class="editor-head">
      <NuxtLink to="/admin/blog" class="back">← Articles</NuxtLink>
      <div class="editor-actions">
        <a v-if="isLive && !isNew" :href="`/blog/${form.slug}`" target="_blank" rel="noopener" class="ed-view">Voir ↗</a>
        <!-- Résumé du maillage, visible sans quitter le haut de page. -->
        <span class="ed-links" :class="{ 'is-bad': liensCasses.length }">
          {{ liensInternes.length }} int · {{ liensExternes.length }} ext<template v-if="liensCasses.length"> · {{ liensCasses.length }} cassé{{ liensCasses.length > 1 ? 's' : '' }}</template>
        </span>
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

        <div ref="bodyEl" class="article-body ed-body" contenteditable="true" @input="onBodyInput" />

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

        <label class="ed-label">Cocon sémantique</label>
        <select v-model="form.cocon" class="ed-input" @change="markDirty">
          <option value="">— Non classé —</option>
          <option v-for="c in COCONS" :key="c.cle" :value="c.cle">{{ c.label }}</option>
        </select>
        <p v-if="coconInconnu" class="ed-help">Cet article déclare le cocon <strong>{{ form.cocon }}</strong>, qui n'existe pas dans <code>app/utils/cocons.ts</code>. Il s'affiche « Non classé » et son bloc « articles liés » ignore son pilier. Ajoutez-y l'entrée plutôt que de reclasser l'article ici.</p>

        <label class="ed-label">Tags <small>séparés par des virgules</small></label>
        <input v-model="form.tags" class="ed-input" placeholder="fiscalité, flotte, recharge" @input="markDirty">
        <div v-if="tagsApercu.length" class="ed-tags">
          <span v-for="t in tagsApercu" :key="t" class="ed-tag">{{ t }}</span>
        </div>
        <p v-if="tagsConnus.length" class="ed-help">
          Déjà utilisés :
          <button v-for="t in tagsConnus" :key="t" type="button" class="ed-tag-add" @click="ajouterTag(t)">+ {{ t }}</button>
        </p>

        <label class="ed-label">Image de couverture (URL)</label>
        <input v-model="form.cover" class="ed-input" placeholder="/assets/img/… ou https://…" @input="markDirty">
        <img v-if="form.cover" :src="form.cover" alt="" class="ed-cover-prev">

        <p v-if="error" class="ed-error">{{ error }}</p>
        <p v-if="saved" class="ed-saved">Enregistré ✓</p>

        <!-- Inspecteur de liens : relu à chaque frappe. Il vit dans la colonne
             collante — sous le corps de l'article, il aurait été à des milliers
             de pixels du regard sur un texte de 2 000 mots. -->
        <div class="lk">
          <div class="ed-label lk-h">
            <span>Liens de l'article</span>
            <span class="lk-tot">{{ liens.length }}</span>
          </div>

          <p v-if="liensCasses.length" class="lk-alert">
            {{ liensCasses.length === 1 ? 'Un lien interne ne répond pas' : `${liensCasses.length} liens internes ne répondent pas` }} — publié tel quel, l'article enverrait le lecteur sur une 404.
          </p>

          <div class="lk-sec">
            <span class="lk-sec-h">Internes <b>{{ liensInternes.length }}</b></span>
            <ul v-if="liensInternes.length" class="lk-list">
              <li v-for="l in liensInternes" :key="l.href" class="lk-item" :class="`is-${l.etat}`">
                <a :href="l.href" target="_blank" rel="noopener" class="lk-href">{{ l.href }}<span v-if="l.n > 1" class="lk-x">×{{ l.n }}</span></a>
                <span class="lk-meta"><span class="lk-dot" />{{ l.note }}</span>
                <span class="lk-anchor">« {{ l.libelle }} »</span>
              </li>
            </ul>
            <p v-else class="lk-empty">Aucun. Un article isolé ne fait pas de cocon.</p>
          </div>

          <div class="lk-sec">
            <span class="lk-sec-h">Externes <b>{{ liensExternes.length }}</b></span>
            <ul v-if="liensExternes.length" class="lk-list">
              <li v-for="l in liensExternes" :key="l.href" class="lk-item">
                <a :href="l.href" target="_blank" rel="noopener" class="lk-href">{{ l.hote }}<span v-if="l.n > 1" class="lk-x">×{{ l.n }}</span></a>
                <span v-if="l.officiel" class="lk-off">Source officielle</span>
                <span class="lk-anchor">« {{ l.libelle }} »</span>
              </li>
            </ul>
            <p v-else class="lk-empty">Aucun. Une source officielle citée renforce la crédibilité.</p>
          </div>

          <div v-if="liensAutres.length" class="lk-sec">
            <span class="lk-sec-h">Autres <b>{{ liensAutres.length }}</b></span>
            <ul class="lk-list">
              <li v-for="l in liensAutres" :key="l.href" class="lk-item">
                <span class="lk-href">{{ l.href }}</span>
                <span class="lk-meta">{{ l.note }}</span>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Éditeur — OTONOM Admin', robots: 'noindex, nofollow' })

import { COCONS, labelCocon } from '~/utils/cocons'

const route = useRoute()
const router = useRouter()
const isNew = route.params.id === 'new'

type Status = 'draft' | 'scheduled' | 'published'

const form = reactive({
  id: null as number | null, title: '', slug: '', excerpt: '', cover: '',
  status: 'draft' as Status, body: '', tags: '', cocon: '',
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
      tags: a.tags || '', cocon: a.cocon || '',
      publishedAtLocal: a.status === 'scheduled' ? isoToLocalInput(a.publishedAt) : ''
    })
    slugTouched.value = true
  }
}

/* Tous les articles : sert au contrôle des liens internes /blog/… ET à proposer
   les tags déjà en usage (pour éviter « recharge » et « Recharge » côté filtres). */
const { data: tousData } = await useFetch<{ articles: any[] }>('/api/admin/articles')
const tous = computed(() => tousData.value?.articles || [])

const estEnLigne = (a: any) =>
  a.status === 'published' || (a.status === 'scheduled' && !!a.publishedAt && a.publishedAt <= new Date().toISOString())

/* ── Cocon & tags ── */
/* Clé stockée en base mais absente de COCONS : panne silencieuse, on la montre. */
const coconInconnu = computed(() => !!form.cocon && !labelCocon(form.cocon))
const tagsApercu = computed(() => form.tags.split(',').map((t) => t.trim()).filter(Boolean))

const tagsConnus = computed(() => {
  const set = new Set<string>()
  for (const a of tous.value) {
    for (const t of String(a.tags || '').split(',')) { const v = t.trim(); if (v) set.add(v) }
  }
  const deja = new Set(tagsApercu.value.map((t) => t.toLowerCase()))
  return [...set].filter((t) => !deja.has(t.toLowerCase())).sort((a, b) => a.localeCompare(b, 'fr'))
})

function ajouterTag(t: string) {
  form.tags = [...tagsApercu.value, t].join(', ')
  markDirty()
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
  scanLiens()
  window.addEventListener('beforeunload', warnUnload)
})
onBeforeUnmount(() => window.removeEventListener('beforeunload', warnUnload))
// Alerte en navigation interne (Nuxt/Vue Router)
onBeforeRouteLeave(() => {
  if (dirty.value && !confirm('Vous avez des modifications non enregistrées. Quitter sans enregistrer ?')) return false
})

const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120)
function onTitle() { markDirty(); if (!slugTouched.value) form.slug = slugify(form.title) }

/* ══ Inspecteur de liens ══════════════════════════════════════════════════
   Relit les <a> du contenu à chaque frappe. Les internes sont confrontés au
   routeur (la route existe-t-elle ?) et à la liste des articles (le billet
   visé est-il en ligne ?) : un lien vers un brouillon renverrait une 404. */
interface Lien {
  href: string; libelle: string; n: number
  genre: 'interne' | 'externe' | 'autre'
  etat: 'ok' | 'brouillon' | 'introuvable'
  note: string; hote?: string; officiel?: boolean
}

const liens = ref<Lien[]>([])
const DOMAINES_OFFICIELS = /(^|\.)(gouv\.fr|ademe\.fr|urssaf\.fr|service-public\.fr|europa\.eu)$/

function etatInterne(chemin: string): { etat: Lien['etat']; note: string } {
  const sansAncre = chemin.split('#')[0]!.split('?')[0]! || '/'
  const m = /^\/blog\/([^/]+)\/?$/.exec(sansAncre)
  if (m) {
    const a = tous.value.find((x) => x.slug === m[1])
    if (!a) return { etat: 'introuvable', note: 'Article inexistant' }
    if (!estEnLigne(a)) return { etat: 'brouillon', note: `« ${a.title} » — pas encore en ligne` }
    return { etat: 'ok', note: `« ${a.title} » — en ligne` }
  }
  try {
    if (router.resolve(sansAncre).matched.length) return { etat: 'ok', note: 'Page du site' }
  } catch { /* chemin non résolvable → traité comme introuvable */ }
  return { etat: 'introuvable', note: 'Aucune page à cette adresse' }
}

function analyser(href: string): Omit<Lien, 'libelle' | 'n'> {
  const h = href.trim()
  if (!h || h.startsWith('#')) return { href: h, genre: 'autre', etat: 'ok', note: 'Ancre interne à la page' }
  if (/^(mailto|tel):/i.test(h)) return { href: h, genre: 'autre', etat: 'ok', note: 'Contact direct' }

  // Une URL absolue vers otonom.fr est un lien interne déguisé : on le ramène au chemin.
  if (/^https?:\/\//i.test(h)) {
    let u: URL
    try { u = new URL(h) } catch { return { href: h, genre: 'autre', etat: 'introuvable', note: 'URL illisible' } }
    if (/(^|\.)otonom\.fr$/.test(u.hostname)) {
      const r = etatInterne(u.pathname + u.hash)
      return { href: u.pathname + u.search + u.hash, genre: 'interne', ...r }
    }
    return {
      href: h, genre: 'externe', etat: 'ok', hote: u.hostname.replace(/^www\./, ''),
      officiel: DOMAINES_OFFICIELS.test(u.hostname), note: 'Lien sortant'
    }
  }

  if (h.startsWith('/')) return { href: h, genre: 'interne', ...etatInterne(h) }
  return { href: h, genre: 'autre', etat: 'introuvable', note: 'Adresse relative — préférez un chemin absolu (/…)' }
}

function scanLiens() {
  const el = bodyEl.value
  if (!el) { liens.value = []; return }
  const par = new Map<string, Lien>()
  for (const a of Array.from(el.querySelectorAll('a[href]'))) {
    const base = analyser(a.getAttribute('href') || '')
    if (!base.href) continue
    const vu = par.get(base.href)
    if (vu) { vu.n++; continue }
    par.set(base.href, { ...base, libelle: (a.textContent || '').trim().slice(0, 70) || '(sans texte)', n: 1 })
  }
  liens.value = [...par.values()]
}

const liensInternes = computed(() => liens.value.filter((l) => l.genre === 'interne'))
const liensExternes = computed(() => liens.value.filter((l) => l.genre === 'externe'))
const liensAutres = computed(() => liens.value.filter((l) => l.genre === 'autre'))
const liensCasses = computed(() => liensInternes.value.filter((l) => l.etat !== 'ok'))

function onBodyInput() { markDirty(); scanLiens() }
/* La liste des articles arrive après le rendu : les états « brouillon » en dépendent. */
watch(tous, scanLiens)

const cmd = (c: string) => document.execCommand(c, false)
const block = (tag: string) => document.execCommand('formatBlock', false, tag)
function addLink() {
  const url = prompt('URL du lien :')
  if (url) { document.execCommand('createLink', false, url); onBodyInput() }
}
const BLOCKS: Record<string, string> = {
  callout: '<div class="article-callout"><span class="callout-label">À retenir</span><p>Votre point clé ici.</p></div><p><br></p>',
  table: '<table><thead><tr><th>Colonne</th><th>Valeur</th></tr></thead><tbody><tr><td>Ligne 1</td><td>…</td></tr><tr><td>Ligne 2</td><td>…</td></tr></tbody></table><p><br></p>',
  faq: '<div class="article-faq"><details><summary>Votre question ?</summary><div class="faq-a">Votre réponse.</div></details><details><summary>Autre question ?</summary><div class="faq-a">Autre réponse.</div></details></div><p><br></p>'
}
function insert(type: string) {
  bodyEl.value?.focus()
  document.execCommand('insertHTML', false, BLOCKS[type])
  onBodyInput()
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
        tags: form.tags, cocon: form.cocon,
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

.editor-grid { display: grid; grid-template-columns: 1fr 340px; gap: 30px; align-items: start; }
.ed-title { width: 100%; font-family: var(--ff-display); font-size: clamp(24px, 3vw, 34px); font-weight: 600; color: var(--ink); background: none; border: 0; border-bottom: 1px solid var(--line); padding: 6px 0 14px; letter-spacing: -.01em; }
.ed-title:focus { outline: none; border-color: var(--ink); }

.ed-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 18px 0; padding: 8px; border: 1px solid var(--line); border-radius: 10px; background: var(--bg-1); position: sticky; top: 132px; z-index: 5; }
.ed-toolbar button { font-family: var(--ff-mono); font-size: 12.5px; color: var(--ink-soft); background: none; border: 1px solid transparent; border-radius: 7px; padding: 6px 10px; cursor: pointer; }
.ed-toolbar button:hover { background: var(--bg-2); border-color: var(--line); color: var(--ink); }
.ed-sep { width: 1px; height: 20px; background: var(--line); margin: 0 4px; }

.ed-body { max-width: none; margin-top: 0; min-height: 320px; border: 1px solid var(--line); border-radius: var(--radius); padding: clamp(20px, 3vw, 34px); background: var(--bg-1); }
.ed-body:focus { outline: none; border-color: var(--ink-soft); }

/* La colonne défile sur elle-même : la liste de liens peut être longue sans
   pour autant casser le collage ni obliger à faire défiler tout l'article. */
.editor-side { display: grid; gap: 8px; align-content: start; border: 1px solid var(--line); border-radius: var(--radius); padding: 22px; background: var(--bg-1); position: sticky; top: 132px; max-height: calc(100vh - 156px); overflow-y: auto; }
.ed-label { font-family: var(--ff-mono); font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: var(--muted-2); margin-top: 14px; }
.ed-label:first-child { margin-top: 0; }
.ed-label small { text-transform: none; letter-spacing: 0; color: var(--muted-2); }
.ed-input { width: 100%; font-family: var(--ff-text); font-size: 14px; color: var(--ink); background: var(--bg-2); border: 1px solid var(--line); border-radius: 9px; padding: 10px 12px; }
.ed-input:focus { outline: none; border-color: var(--ink); }
textarea.ed-input { resize: vertical; }
.ed-cover-prev { width: 100%; border-radius: 9px; border: 1px solid var(--line-soft); margin-top: 6px; filter: grayscale(1); }
.ed-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.ed-tag { font-family: var(--ff-mono); font-size: 10.5px; color: var(--ink); border: 1px solid var(--line); border-radius: 999px; padding: 3px 9px; }
.ed-tag-add { font-family: var(--ff-mono); font-size: 10.5px; color: var(--muted-2); background: none; border: 0; padding: 2px 5px 2px 0; cursor: pointer; }
.ed-tag-add:hover { color: var(--ink); }

/* ── Inspecteur de liens (colonne latérale, donc compact) ── */
.ed-links { font-family: var(--ff-mono); font-size: 11px; letter-spacing: .04em; color: var(--muted-2); border: 1px solid var(--line); border-radius: 999px; padding: 4px 11px; white-space: nowrap; }
.ed-links.is-bad { color: var(--ink); border-color: var(--ink); }

.lk { margin-top: 22px; padding-top: 18px; border-top: 1px solid var(--line); }
.lk-h { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 0; }
.lk-tot { color: var(--ink); }

.lk-alert { font-size: 11.5px; line-height: 1.5; color: var(--ink); border-left: 2px solid var(--ink); padding-left: 9px; margin: 10px 0 0; }

.lk-sec { margin-top: 15px; }
.lk-sec-h { display: block; font-family: var(--ff-mono); font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: var(--muted-2); padding-bottom: 7px; border-bottom: 1px solid var(--line-soft); }
.lk-sec-h b { color: var(--ink); font-weight: 400; margin-left: 3px; }

.lk-list { list-style: none; margin: 0; padding: 0; }
.lk-item { display: grid; gap: 3px; padding: 9px 0; border-bottom: 1px solid var(--line-soft); }
.lk-item:last-child { border-bottom: 0; }
.lk-href { font-family: var(--ff-mono); font-size: 11.5px; color: var(--ink); word-break: break-all; line-height: 1.4; }
a.lk-href:hover { text-decoration: underline; text-underline-offset: 3px; }
.lk-x { font-family: var(--ff-mono); font-size: 9.5px; color: var(--muted-2); margin-left: 6px; }
.lk-off { justify-self: start; font-family: var(--ff-mono); font-size: 8.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); border: 1px solid var(--line); border-radius: 999px; padding: 2px 7px; }

.lk-meta { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--muted-2); line-height: 1.4; }
.lk-anchor { font-size: 11px; font-style: italic; color: var(--muted-2); opacity: .8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
/* Pastille d'état : pleine = OK, creuse = brouillon, barrée = introuvable.
   Aucune couleur — la forme suffit, et la DA l'impose. */
.lk-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ink); flex: none; opacity: .5; }
.is-brouillon .lk-dot { background: none; border: 1px solid var(--ink); opacity: .8; }
.is-brouillon .lk-meta, .is-introuvable .lk-meta { color: var(--ink-soft); }
.is-introuvable .lk-dot { background: none; border: 1px solid var(--ink); position: relative; opacity: 1; }
.is-introuvable .lk-dot::after { content: ''; position: absolute; inset: -2px auto -2px 2px; width: 1px; background: var(--ink); transform: rotate(45deg); }
.is-introuvable .lk-href { text-decoration: line-through; text-decoration-thickness: 1px; }

.lk-empty { font-size: 11.5px; color: var(--muted-2); line-height: 1.5; padding: 9px 0 0; }

.ed-error { font-size: 13px; color: var(--ink-soft); border-left: 2px solid var(--ink); padding-left: 10px; }
.ed-saved { font-family: var(--ff-mono); font-size: 12px; color: var(--muted); }

@media (max-width: 860px) { .editor-grid { grid-template-columns: 1fr; } .editor-side { position: static; max-height: none; overflow: visible; } }
</style>
