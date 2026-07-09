<template>
  <div class="dash">
    <header class="dash-head">
      <span class="kicker">Back-office</span>
      <h1>Tableau de bord</h1>
    </header>

    <!-- Destinataires par formulaire -->
    <section class="panel">
      <h2 class="panel-t">Destinataires des emails</h2>
      <p class="panel-sub">Qui reçoit les leads de chaque formulaire. Modifiable indépendamment. Plusieurs adresses = séparées par des virgules.</p>
      <div class="recip-grid">
        <div v-for="form in forms" :key="form.formKey" class="recip-card">
          <div class="recip-top">
            <span class="recip-key">{{ form.formKey }}</span>
            <span class="recip-count">{{ form.count }} lead{{ form.count > 1 ? 's' : '' }}</span>
          </div>

          <label :for="'n-' + form.formKey" class="recip-field-label">Nom du formulaire</label>
          <input :id="'n-' + form.formKey" v-model="drafts[form.formKey].label" type="text" class="recip-name" placeholder="Nom affiché">

          <label :for="'r-' + form.formKey" class="recip-field-label">Destinataires <small>(séparés par des virgules)</small></label>
          <textarea :id="'r-' + form.formKey" v-model="drafts[form.formKey].recipients" rows="2" placeholder="email@exemple.com, autre@exemple.com"></textarea>

          <div v-if="form.pages" class="recip-pages">
            <span class="recip-field-label">Utilisé sur</span>
            <span class="recip-pages-links">
              <a v-for="p in form.pages.split(',')" :key="p" :href="p" target="_blank" rel="noopener">{{ p }}</a>
            </span>
          </div>

          <div class="recip-actions">
            <button type="button" class="btn btn--primary recip-save" :disabled="savingKey === form.formKey || !isChanged(form)" @click="saveForm(form.formKey)">
              {{ savingKey === form.formKey ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
            <span v-if="savedKey === form.formKey" class="recip-ok">Enregistré ✓</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Leads -->
    <section class="panel">
      <div class="leads-head">
        <div>
          <h2 class="panel-t">Leads</h2>
          <p class="panel-sub">{{ sortedLeads.length }} résultat{{ sortedLeads.length > 1 ? 's' : '' }}{{ selectedForm ? ' · filtré' : '' }}.</p>
        </div>
        <div class="leads-actions">
          <label class="filter">
            <span>Formulaire</span>
            <select v-model="selectedForm">
              <option value="">Tous les formulaires</option>
              <option v-for="form in forms" :key="form.formKey" :value="form.formKey">{{ form.label || form.formKey }} ({{ form.count }})</option>
            </select>
          </label>
          <button type="button" class="btn btn--ghost leads-export" :disabled="!sortedLeads.length" @click="exportCsv">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
            Exporter en CSV
          </button>
        </div>
      </div>

      <div class="table-wrap">
        <table class="leads">
          <thead>
            <tr>
              <th class="sortable" @click="toggleSort('createdAt')">Date <SortCaret :active="sortKey === 'createdAt'" :dir="sortDir" /></th>
              <th class="sortable" @click="toggleSort('formKey')">Formulaire <SortCaret :active="sortKey === 'formKey'" :dir="sortDir" /></th>
              <th class="sortable" @click="toggleSort('nom')">Nom <SortCaret :active="sortKey === 'nom'" :dir="sortDir" /></th>
              <th>Entreprise</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lead in sortedLeads" :key="lead.id">
              <td class="nowrap muted-c">{{ formatDate(lead.createdAt) }}</td>
              <td><span class="badge">{{ labelFor(lead.formKey) }}</span></td>
              <td>{{ lead.nom }}</td>
              <td>{{ lead.entreprise || '—' }}</td>
              <td><a :href="'mailto:' + lead.email" class="lk">{{ lead.email }}</a></td>
              <td class="nowrap">{{ lead.telephone || '—' }}</td>
              <td class="msg" :title="lead.message || ''">{{ lead.message || '—' }}</td>
            </tr>
            <tr v-if="!sortedLeads.length"><td colspan="7" class="empty">Aucun lead pour l'instant.</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Tableau de bord — OTONOM Admin', robots: 'noindex, nofollow' })

interface FormRow { formKey: string; label: string; recipients: string; pages: string; count: number; updatedAt: string }
interface Lead { id: number; createdAt: string; formKey: string; nom: string; email: string; entreprise?: string; telephone?: string; message?: string }

const { data: formsData, refresh: refreshForms } = await useFetch<{ forms: FormRow[] }>('/api/admin/forms')
const forms = computed(() => formsData.value?.forms || [])

const selectedForm = ref('')
const { data: leadsData } = await useFetch<{ leads: Lead[] }>('/api/admin/leads', { query: { form: selectedForm } })
const leads = computed(() => leadsData.value?.leads || [])

// --- Réglages formulaire : brouillons éditables (nom + destinataires) ---
const drafts = reactive<Record<string, { label: string; recipients: string }>>({})
watch(forms, (fs) => {
  fs.forEach((f) => { if (drafts[f.formKey] === undefined) drafts[f.formKey] = { label: f.label || '', recipients: f.recipients } })
}, { immediate: true })
const savingKey = ref('')
const savedKey = ref('')
function isChanged(form: FormRow) {
  const d = drafts[form.formKey]
  return !!d && (d.label !== (form.label || '') || d.recipients !== form.recipients)
}
async function saveForm(formKey: string) {
  const d = drafts[formKey]
  savingKey.value = formKey
  try {
    await $fetch('/api/admin/recipients', { method: 'POST', body: { formKey, label: d.label, recipients: d.recipients } })
    savedKey.value = formKey
    setTimeout(() => { if (savedKey.value === formKey) savedKey.value = '' }, 2200)
    await refreshForms()
  } finally {
    savingKey.value = ''
  }
}

// --- Tri du tableau ---
const sortKey = ref<'createdAt' | 'formKey' | 'nom'>('createdAt')
const sortDir = ref<'asc' | 'desc'>('desc')
function toggleSort(k: typeof sortKey.value) {
  if (sortKey.value === k) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = k; sortDir.value = 'asc' }
}
const sortedLeads = computed(() => {
  const arr = [...leads.value]
  const k = sortKey.value
  arr.sort((a, b) => String(a[k] ?? '').localeCompare(String(b[k] ?? ''), 'fr', { numeric: true }))
  return sortDir.value === 'asc' ? arr : arr.reverse()
})

const labelFor = (key: string) => forms.value.find((f) => f.formKey === key)?.label || key
const formatDate = (iso: string) => {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) } catch { return iso }
}

// --- Export CSV (leads du formulaire filtré) ---
const csvCell = (v: unknown) => '"' + String(v ?? '').replace(/"/g, '""') + '"'
function exportCsv() {
  const rows = sortedLeads.value
  if (!rows.length) return
  const headers = ['Date', 'Formulaire', 'Nom', 'Email', 'Entreprise', 'Téléphone', 'Message', 'Détails']
  const lines = [headers.map(csvCell).join(';')]
  for (const l of rows) {
    lines.push([
      formatDate(l.createdAt), labelFor(l.formKey), l.nom, l.email,
      l.entreprise || '', l.telephone || '', l.message || '', l.meta || ''
    ].map(csvCell).join(';'))
  }
  const csv = '﻿' + lines.join('\r\n')   // BOM UTF-8 → accents corrects dans Excel
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `otonom-leads-${selectedForm.value || 'tous'}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.dash-head { margin-bottom: 8px; }
.dash-head .kicker { font-family: var(--ff-mono); font-size: 12px; letter-spacing: .2em; text-transform: uppercase; color: var(--muted); }
.dash-head h1 { font-size: clamp(26px, 4vw, 40px); margin-top: 12px; }

.panel { margin-top: clamp(30px, 5vw, 52px); }
.panel-t { font-size: 20px; }
.panel-sub { color: var(--muted); font-size: 14px; margin-top: 6px; max-width: 70ch; }

/* Destinataires */
.recip-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 18px; margin-top: 22px; }
.recip-card { border: 1px solid var(--line); border-radius: var(--radius); padding: 22px; background: var(--bg-1); }
.recip-top { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.recip-count { font-family: var(--ff-mono); font-size: 11px; letter-spacing: .06em; color: var(--muted-2); white-space: nowrap; }
.recip-key { font-family: var(--ff-mono); font-size: 11px; letter-spacing: .08em; color: var(--muted-2); }
.recip-field-label { display: block; font-family: var(--ff-mono); font-size: 11px; letter-spacing: .06em; color: var(--muted-2); margin: 16px 0 8px; }
.recip-field-label small { text-transform: none; letter-spacing: 0; }
.recip-name, .recip-card textarea { width: 100%; font-family: var(--ff-text); font-size: 14px; color: var(--ink); background: var(--bg-2); border: 1px solid var(--line); border-radius: 10px; padding: 11px 13px; }
.recip-card textarea { resize: vertical; min-height: 58px; }
.recip-name:focus, .recip-card textarea:focus { outline: none; border-color: var(--ink); }
.recip-pages-links { display: flex; flex-wrap: wrap; gap: 8px 14px; }
.recip-pages-links a { font-family: var(--ff-mono); font-size: 12.5px; color: var(--ink); border-bottom: 1px solid var(--line); }
.recip-pages-links a:hover { border-color: var(--ink); }
.recip-actions { display: flex; align-items: center; gap: 14px; margin-top: 14px; }
.recip-save { padding: 10px 18px; font-size: 13.5px; }
.recip-save:disabled { opacity: .45; }
.recip-ok { font-family: var(--ff-mono); font-size: 12px; color: var(--muted); }

/* Leads */
.leads-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; flex-wrap: wrap; margin-bottom: 20px; }
.leads-actions { display: flex; align-items: flex-end; gap: 14px; flex-wrap: wrap; }
.leads-export { padding: 10px 18px; font-size: 13.5px; white-space: nowrap; }
.leads-export:disabled { opacity: .45; cursor: not-allowed; }
.filter { display: grid; gap: 7px; }
.filter span { font-family: var(--ff-mono); font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
.filter select { font-family: var(--ff-text); font-size: 14px; color: var(--ink); background: var(--bg-2); border: 1px solid var(--line); border-radius: 10px; padding: 10px 34px 10px 13px; min-width: 240px; appearance: none; background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239a9aa1' stroke-width='2'><path d='M6 9l6 6 6-6'/></svg>"); background-repeat: no-repeat; background-position: right 12px center; }
.table-wrap { border: 1px solid var(--line); border-radius: var(--radius); overflow-x: auto; }
.leads { width: 100%; border-collapse: collapse; font-size: 14px; }
.leads th, .leads td { text-align: left; padding: 13px 16px; border-bottom: 1px solid var(--line-soft); vertical-align: top; }
.leads thead th { font-family: var(--ff-mono); font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); background: var(--bg-1); position: sticky; top: 0; }
.leads th.sortable { cursor: pointer; user-select: none; white-space: nowrap; }
.leads th.sortable:hover { color: var(--ink); }
.leads tbody tr:hover { background: var(--bg-1); }
.leads td { color: var(--ink-soft); }
.nowrap { white-space: nowrap; }
.muted-c { color: var(--muted); }
.badge { font-family: var(--ff-mono); font-size: 11px; letter-spacing: .04em; border: 1px solid var(--line); border-radius: 999px; padding: 3px 9px; color: var(--ink); white-space: nowrap; }
.lk { color: var(--ink); border-bottom: 1px solid var(--line); }
.lk:hover { border-color: var(--ink); }
.msg { max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--muted); }
.empty { text-align: center; color: var(--muted); padding: 40px 16px; }
</style>
