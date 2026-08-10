/**
 * OTONOM — Socle commun à TOUS les simulateurs.
 *
 * Ce fichier ne connaît aucun métier : il ne contient que ce que chaque simulateur
 * refait sinon dans son coin (formats, arrondis, bascules, scénarios de sensibilité,
 * envoi du lead). Un nouveau simulateur = un moteur + une page, et rien de tout ceci
 * à réécrire.
 *
 * Voir SPEC-SIMULATEUR-TCO.md pour la méthode.
 */

/* ── Types partagés ──────────────────────────────────────────────────────── */

/** Nature d'un chiffre affiché — sert à poser un tag honnête à côté du résultat. */
export type TagKind = 'calc' | 'hyp' | 'ind' | 'audit'

export const TAG_LABELS: Record<TagKind, string> = {
  calc: 'Calculé',
  hyp: 'Hypothèse',
  ind: 'Estimation indicative',
  audit: 'À affiner en audit'
}

/** Une ligne clé/valeur dans un tableau de résultats. */
export interface SimRow {
  label: string
  value: string
  /** Valeur du scénario comparé (affichage en 3 colonnes). */
  compare?: string
  /** Écart formaté, déjà signé. */
  delta?: string
  strong?: boolean
  /** Ligne informative, non comptée dans un total. */
  muted?: boolean
}

/** Un bloc de résultats (une carte). */
export interface SimBlock {
  n: string
  title: string
  tag: TagKind
  leadHtml?: string
  rows: SimRow[]
}

/** Un indicateur de synthèse. */
export interface SimMetric {
  label: string
  value: string
  hint?: string
}

/* ── Formats ─────────────────────────────────────────────────────────────── */

const nf0 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/**
 * Arrondi à un ordre de grandeur lisible. Un simulateur commercial n'affiche
 * jamais « 187 432 € » : la fausse précision décrédibilise plus qu'elle n'informe.
 */
export function ordre(v: number): number {
  const s = v < 0 ? -1 : 1
  const a = Math.abs(v)
  if (a >= 100000) return s * Math.round(a / 1000) * 1000
  if (a >= 10000) return s * Math.round(a / 500) * 500
  if (a >= 1000) return s * Math.round(a / 100) * 100
  if (a >= 100) return s * Math.round(a / 10) * 10
  return s * Math.round(a)
}

export const euros = (v: number): string => nf0.format(ordre(v)) + ' €'
export const eurosExact = (v: number): string => nf0.format(Math.round(v)) + ' €'
export const nombre = (v: number): string => nf0.format(Math.round(v))
export const tonnes = (v: number): string => nf1.format(v) + ' t'
export const pct = (v: number): string => nf0.format(Math.round(v * 100)) + ' %'

/** Écart signé, pour une colonne « différence ». */
export function ecart(v: number): string {
  if (Math.abs(v) < 1) return '—'
  return (v > 0 ? '+' : '−') + euros(Math.abs(v))
}

/** Durée en mois → « 2 ans et 7 mois ». */
export function dureeTexte(mois: number): string {
  if (mois <= 0) return '—'
  const a = Math.floor(mois / 12)
  const m = Math.round(mois % 12)
  if (a === 0) return `${m} mois`
  if (m === 0) return `${a} an${a > 1 ? 's' : ''}`
  return `${a} an${a > 1 ? 's' : ''} et ${m} mois`
}

/* ── Aides numériques ────────────────────────────────────────────────────── */

export const clamp = (v: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, v))

/** Lit un nombre potentiellement absent/invalide, avec repli. */
export const num = (v: number | undefined | null, def: number): number =>
  typeof v === 'number' && isFinite(v) ? v : def

/** Normalise un jeu de parts à 100 % (mix de recharge, répartition de flotte…). */
export function normaliserParts<T extends Record<string, number>>(parts: T): T {
  const total = Object.values(parts).reduce((s, v) => s + (isFinite(v) ? Math.max(0, v) : 0), 0)
  if (total <= 0) return parts
  const out = {} as T
  for (const k of Object.keys(parts) as (keyof T)[]) {
    out[k] = (Math.max(0, parts[k]) / total) as T[keyof T]
  }
  return out
}

/* ── Bascules (points de croisement) ─────────────────────────────────────── */

export interface Bascule {
  /** Index (mois) ou valeur (km) de la bascule. `null` = pas de bascule durable. */
  valeur: number | null
  atteinte: boolean
}

/**
 * Première bascule DURABLE : le premier rang à partir duquel `a` reste
 * strictement sous `b` jusqu'à la fin.
 *
 * On ne retient surtout pas le premier croisement : une courbe peut passer
 * dessous puis repasser au-dessus (typiquement au moment de la revente, la
 * valeur résiduelle du thermique étant meilleure). Afficher ce premier
 * croisement annoncerait une bascule qui ne tient pas.
 */
export function basculeDurable(a: number[], b: number[]): Bascule {
  const n = Math.min(a.length, b.length)
  if (!n) return { valeur: null, atteinte: false }
  if (a[n - 1]! >= b[n - 1]!) return { valeur: null, atteinte: false }
  // On remonte depuis la fin tant que a reste sous b.
  let i = n - 1
  while (i > 0 && a[i - 1]! < b[i - 1]!) i--
  return { valeur: i, atteinte: true }
}

/**
 * Recherche par dichotomie du point d'annulation de `f` sur [lo, hi].
 * Renvoie null s'il n'y a pas de changement de signe : sans cette
 * vérification, la dichotomie renverrait une borne, donc un chiffre faux.
 */
export function bissection(
  f: (x: number) => number,
  lo: number,
  hi: number,
  iterations = 40
): number | null {
  let flo = f(lo)
  let fhi = f(hi)
  if (!isFinite(flo) || !isFinite(fhi)) return null
  if (flo === 0) return lo
  if (fhi === 0) return hi
  if (flo > 0 === fhi > 0) return null
  for (let i = 0; i < iterations; i++) {
    const mid = (lo + hi) / 2
    const fmid = f(mid)
    if (fmid === 0) return mid
    if (flo > 0 === fmid > 0) { lo = mid; flo = fmid } else { hi = mid; fhi = fmid }
  }
  return (lo + hi) / 2
}

/* ── Scénarios de sensibilité ────────────────────────────────────────────── */

/**
 * On parle de SCÉNARIOS, pas de « fourchette d'incertitude » : aucune
 * probabilité n'est attribuée à ces valeurs, les présenter comme un
 * intervalle statistique serait abusif.
 */
export type ScenarioKey = 'prudent' | 'central' | 'favorable'

export const SCENARIO_LABELS: Record<ScenarioKey, string> = {
  prudent: 'Prudent',
  central: 'Central',
  favorable: 'Favorable'
}

export interface ScenarioSet<R> {
  prudent: R
  central: R
  favorable: R
}

/**
 * Rejoue un moteur complet sous les trois scénarios.
 * `deriver` construit l'entrée modifiée à partir de l'entrée centrale.
 */
export function jouerScenarios<I, R>(
  entree: I,
  calculer: (e: I) => R,
  deriver: (e: I, s: ScenarioKey) => I
): ScenarioSet<R> {
  return {
    prudent: calculer(deriver(entree, 'prudent')),
    central: calculer(entree),
    favorable: calculer(deriver(entree, 'favorable'))
  }
}

/* ── Lead ────────────────────────────────────────────────────────────────── */

export interface LeadContact {
  nom: string
  email: string
  entreprise?: string
  tel?: string
  /** Consentement commercial, distinct de l'envoi du rapport demandé. */
  optinCommercial?: boolean
  honey?: string
}

/**
 * Construit le corps envoyé à POST /api/lead.
 * `formKey` identifie le simulateur (une ligne par simulateur dans form_settings),
 * ce qui permet de router les destinataires indépendamment.
 */
export function corpsLead(
  formKey: string,
  contact: LeadContact,
  resume: string,
  meta: Record<string, unknown>
) {
  return {
    _form: formKey,
    _honey: contact.honey || '',
    nom: contact.nom,
    email: contact.email,
    entreprise: contact.entreprise || '',
    telephone: contact.tel || '',
    message: resume,
    meta: { ...meta, optinCommercial: !!contact.optinCommercial }
  }
}

/**
 * Amène l'utilisateur sur le premier champ fautif.
 *
 * Tous les formulaires du site sont en `novalidate` : le navigateur ne surligne
 * donc plus rien, et ne fait plus défiler jusqu'au champ. Un message seul —
 * « un champ doit être complété » — laisse l'utilisateur chercher lui-même,
 * parfois plusieurs écrans plus haut. On rétablit les deux gestes que la
 * validation native rendait : on montre, et on met le curseur dedans.
 *
 * `block: 'center'` plutôt que 'start' : un champ collé sous l'en-tête fixe
 * passerait derrière lui.
 */
export function focaliserChamp(id: string) {
  if (!import.meta.client) return
  /* `setTimeout` et non `requestAnimationFrame` : ce dernier est suspendu dans
     un onglet en arrière-plan, et le curseur ne serait jamais posé. Le délai nul
     suffit à laisser Vue peindre la classe d'erreur avant qu'on défile. */
  setTimeout(() => {
    const el = document.getElementById(id) as HTMLElement | null
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // `preventScroll` : le défilement doux ci-dessus fait déjà le travail,
    // sans lui le navigateur y superpose un saut brutal.
    try { (el as HTMLInputElement).focus({ preventScroll: true }) } catch { el.focus() }
  })
}

/** Validité d'une adresse email, au sens « ça peut partir ». */
export const estEmailValide = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim())
