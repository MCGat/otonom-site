/**
 * OTONOM — Couche d'accès aux données (SEUL fichier qui touche la base).
 * Bi-moteur :
 *   • SQLite (node:sqlite) en local / si aucune config MySQL  → fichier data/otonom.db
 *   • MySQL (mysql2) dès que NUXT_MYSQL_HOST est défini        → PlanetHoster N0C
 * Les tables sont créées automatiquement au 1er accès (migration). Aucune SQL manuelle.
 */
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import mysql from 'mysql2/promise'
// node:sqlite est importé DYNAMIQUEMENT (branche SQLite uniquement) → compatible
// avec un Node < 22.5 en prod, où seul le chemin MySQL est utilisé.

export interface Lead {
  id?: number
  createdAt?: string
  formKey: string
  nom: string
  email: string
  entreprise?: string
  telephone?: string
  message?: string
  meta?: string
  ip?: string
  userAgent?: string
  isTest?: boolean
}

let engine: 'sqlite' | 'mysql' | null = null
let sqlite: any = null
let pool: mysql.Pool | null = null

/* ── SCHÉMA de la base « otonom » — toutes les tables ici.
   👉 Pour AJOUTER une table (ex. users) : ajoute une entrée { sqlite, mysql }
      ci-dessous, puis ses fonctions d'accès plus bas dans ce fichier. ────────── */
const SCHEMA: Array<{ sqlite: string; mysql?: string }> = [
  {
    sqlite: `CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL, form_key TEXT NOT NULL,
      nom TEXT NOT NULL, email TEXT NOT NULL,
      entreprise TEXT, telephone TEXT, message TEXT, meta TEXT, ip TEXT, user_agent TEXT
    )`,
    mysql: `CREATE TABLE IF NOT EXISTS leads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      created_at VARCHAR(40) NOT NULL, form_key VARCHAR(40) NOT NULL,
      nom VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL,
      entreprise VARCHAR(255), telephone VARCHAR(64), message TEXT, meta TEXT,
      ip VARCHAR(64), user_agent TEXT, INDEX idx_leads_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  },
  // index séparé en SQLite ; en MySQL il est déjà déclaré dans la table (mysql omis)
  { sqlite: `CREATE INDEX IF NOT EXISTS idx_leads_created ON leads (created_at)` },
  {
    sqlite: `CREATE TABLE IF NOT EXISTS form_settings (
      form_key TEXT PRIMARY KEY, label TEXT, recipients TEXT, updated_at TEXT
    )`,
    mysql: `CREATE TABLE IF NOT EXISTS form_settings (
      form_key VARCHAR(40) PRIMARY KEY, label VARCHAR(255), recipients TEXT, updated_at VARCHAR(40)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  },
  {
    sqlite: `CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL,
      excerpt TEXT, cover TEXT, body TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT, updated_at TEXT, published_at TEXT
    )`,
    mysql: `CREATE TABLE IF NOT EXISTS articles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(200) UNIQUE NOT NULL, title VARCHAR(300) NOT NULL,
      excerpt TEXT, cover VARCHAR(500), body MEDIUMTEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'draft',
      created_at VARCHAR(40), updated_at VARCHAR(40), published_at VARCHAR(40)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  },
  {
    // Indexation des pages : SEULE source de vérité pour le meta robots ET le sitemap.
    // Une ligne = une exception ; toute page absente est considérée indexable.
    sqlite: `CREATE TABLE IF NOT EXISTS page_settings (
      path TEXT PRIMARY KEY, indexed INTEGER NOT NULL DEFAULT 1, updated_at TEXT
    )`,
    mysql: `CREATE TABLE IF NOT EXISTS page_settings (
      path VARCHAR(190) PRIMARY KEY, indexed TINYINT NOT NULL DEFAULT 1, updated_at VARCHAR(40)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  }
]

// Verrou d'initialisation : sans lui, deux appels concurrents (ex. les seeds au
// démarrage, ou deux requêtes simultanées) peuvent repartir avant que la
// connexion et le schéma soient prêts — `engine` étant posé avant les await.
let readyPromise: Promise<void> | null = null

function ensureReady(): Promise<void> {
  if (!readyPromise) {
    readyPromise = initDb().catch((e) => {
      readyPromise = null // permet une nouvelle tentative au prochain appel
      throw e
    })
  }
  return readyPromise
}

async function initDb() {
  const cfg = useRuntimeConfig()
  const my = cfg.mysql

  // 1) Connexion : MySQL si configuré (prod N0C), sinon SQLite (local)
  if (my?.host) {
    engine = 'mysql'
    pool = mysql.createPool({
      host: my.host, port: Number(my.port) || 3306,
      user: my.user, password: my.password, database: my.database,
      waitForConnections: true, connectionLimit: 5, charset: 'utf8mb4'
    })
  } else {
    engine = 'sqlite'
    const { DatabaseSync } = await import('node:sqlite')  // import lazy : jamais chargé en prod MySQL
    const file = resolve(process.cwd(), cfg.dbFile || './data/otonom.db')
    mkdirSync(dirname(file), { recursive: true })
    sqlite = new DatabaseSync(file)
  }

  // 2) Migration : crée toutes les tables du schéma (idempotent)
  for (const t of SCHEMA) {
    const ddl = engine === 'mysql' ? t.mysql : t.sqlite
    if (!ddl) continue
    if (engine === 'mysql') await pool!.query(ddl)
    else sqlite!.exec(ddl)
  }

  // 2b) Migrations additives (colonnes ajoutées après la 1re mise en prod)
  await ensureColumn('form_settings', 'pages', 'TEXT')
  await ensureColumn('leads', 'is_test', 'INTEGER NOT NULL DEFAULT 0')

  // 3) Données par défaut
  await seedDefaults(cfg)
}

/** Ajoute une colonne si elle n'existe pas encore (idempotent, 2 moteurs). */
async function ensureColumn(table: string, column: string, ddl: string) {
  if (engine === 'mysql') {
    const rows = await all(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column])
    if (!rows.length) await pool!.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${ddl}`)
  } else {
    const cols = sqlite!.prepare(`PRAGMA table_info(${table})`).all() as any[]
    if (!cols.some((c) => c.name === column)) sqlite!.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddl}`)
  }
}

/** Requête d'écriture — renvoie l'id inséré si dispo. */
async function run(sql: string, args: unknown[] = []): Promise<number | null> {
  if (engine === 'mysql') {
    const [r] = await pool!.execute(sql, args)
    return (r as mysql.ResultSetHeader).insertId ?? null
  }
  const info = sqlite!.prepare(sql).run(...(args as any[]))
  return info.lastInsertRowid != null ? Number(info.lastInsertRowid) : null
}
async function all(sql: string, args: unknown[] = []): Promise<any[]> {
  if (engine === 'mysql') { const [rows] = await pool!.execute(sql, args); return rows as any[] }
  return sqlite!.prepare(sql).all(...(args as any[])) as any[]
}
async function get(sql: string, args: unknown[] = []): Promise<any> {
  if (engine === 'mysql') { const [rows] = await pool!.execute(sql, args); return (rows as any[])[0] }
  return sqlite!.prepare(sql).get(...(args as any[]))
}

/** Seed des réglages destinataires par défaut (idempotent). */
async function seedDefaults(cfg: any) {
  const def = cfg.defaultRecipients || ''
  const now = new Date().toISOString()
  const ins = engine === 'mysql'
    ? `INSERT IGNORE INTO form_settings (form_key, label, recipients, updated_at) VALUES (?, ?, ?, ?)`
    : `INSERT OR IGNORE INTO form_settings (form_key, label, recipients, updated_at) VALUES (?, ?, ?, ?)`
  await run(ins, ['contact', 'Formulaire de contact', def, now])
  await run(ins, ['simulateur', 'Simulateur (lead qualifié)', def, now])
  // Pages connues par défaut (uniquement si pas encore renseignées)
  await run(`UPDATE form_settings SET pages = ? WHERE form_key = ? AND (pages IS NULL OR pages = '')`, ['/contact', 'contact'])
  await run(`UPDATE form_settings SET pages = ? WHERE form_key = ? AND (pages IS NULL OR pages = '')`, ['/simulateur', 'simulateur'])
}

/** Insère un lead, renvoie son id. */
export async function insertLead(lead: Lead): Promise<number | null> {
  await ensureReady()
  return run(
    `INSERT INTO leads (created_at, form_key, nom, email, entreprise, telephone, message, meta, ip, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      lead.createdAt || new Date().toISOString(),
      lead.formKey, lead.nom, lead.email,
      lead.entreprise || null, lead.telephone || null,
      lead.message || null, lead.meta || null,
      lead.ip || null, lead.userAgent || null
    ]
  )
}

const mapLead = (r: any): Lead => ({
  id: r.id, createdAt: r.created_at, formKey: r.form_key, nom: r.nom, email: r.email,
  entreprise: r.entreprise, telephone: r.telephone, message: r.message, meta: r.meta,
  ip: r.ip, userAgent: r.user_agent, isTest: !!r.is_test
})

/** Marque (ou démarque) un lead comme test. */
export async function setLeadTest(id: number, isTest: boolean) {
  await ensureReady()
  await run(`UPDATE leads SET is_test = ? WHERE id = ?`, [isTest ? 1 : 0, id])
}

/** Liste les leads (les plus récents d'abord), filtrable par formulaire. */
export async function listLeads(opts: { form?: string; limit?: number } = {}): Promise<Lead[]> {
  await ensureReady()
  const limit = opts.limit ?? 500
  const rows = opts.form
    ? await all(`SELECT * FROM leads WHERE form_key = ? ORDER BY id DESC LIMIT ?`, [opts.form, limit])
    : await all(`SELECT * FROM leads ORDER BY id DESC LIMIT ?`, [limit])
  return rows.map(mapLead)
}

/** Réglages de tous les formulaires (pour l'admin). */
export async function listFormSettings() {
  await ensureReady()
  return all(`SELECT * FROM form_settings ORDER BY form_key`)
}

/** Formulaires + destinataires + nombre de leads (filtre & panneau réglages admin). */
export async function listForms() {
  await ensureReady()
  const settings = await all(`SELECT form_key, label, recipients, pages, updated_at FROM form_settings ORDER BY form_key`)
  const counts = await all(`SELECT form_key, COUNT(*) AS n FROM leads GROUP BY form_key`)
  const byKey: Record<string, number> = {}
  counts.forEach((c: any) => { byKey[c.form_key] = Number(c.n) })
  return settings.map((s: any) => ({
    formKey: s.form_key, label: s.label, recipients: s.recipients || '',
    pages: s.pages || '', updatedAt: s.updated_at, count: byKey[s.form_key] || 0
  }))
}

/** Destinataires d'un formulaire (repli sur les destinataires par défaut). */
export async function getRecipients(formKey: string): Promise<string> {
  await ensureReady()
  const row = await get(`SELECT recipients FROM form_settings WHERE form_key = ?`, [formKey])
  const cfg = useRuntimeConfig()
  return (row?.recipients && String(row.recipients).trim()) ? row.recipients : (cfg.defaultRecipients || '')
}

/** Enregistre un formulaire s'il n'existe pas encore (destinataires par défaut).
 *  Appelé à chaque lead → tout nouveau formulaire apparaît automatiquement dans l'admin. */
export async function ensureFormSettings(formKey: string, label?: string) {
  await ensureReady()
  const cfg = useRuntimeConfig()
  const now = new Date().toISOString()
  const sql = engine === 'mysql'
    ? `INSERT IGNORE INTO form_settings (form_key, label, recipients, updated_at) VALUES (?, ?, ?, ?)`
    : `INSERT OR IGNORE INTO form_settings (form_key, label, recipients, updated_at) VALUES (?, ?, ?, ?)`
  await run(sql, [formKey, label || formKey, cfg.defaultRecipients || '', now])
}

/** Modifie le nom (label) et les destinataires d'un formulaire (admin). */
export async function setFormSettings(formKey: string, label: string, recipients: string) {
  await ensureReady()
  const now = new Date().toISOString()
  if (engine === 'mysql') {
    await run(
      `INSERT INTO form_settings (form_key, label, recipients, updated_at) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE label = VALUES(label), recipients = VALUES(recipients), updated_at = VALUES(updated_at)`,
      [formKey, label || formKey, recipients, now])
  } else {
    await run(
      `INSERT INTO form_settings (form_key, label, recipients, updated_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(form_key) DO UPDATE SET label = excluded.label, recipients = excluded.recipients, updated_at = excluded.updated_at`,
      [formKey, label || formKey, recipients, now])
  }
}

/** Enregistre une page où le formulaire est utilisé (auto, à chaque lead). */
export async function recordFormPage(formKey: string, page: string) {
  await ensureReady()
  const clean = String(page || '').split('?')[0].split('#')[0].trim()
  if (!clean.startsWith('/')) return
  const row = await get(`SELECT pages FROM form_settings WHERE form_key = ?`, [formKey])
  const set = new Set(String(row?.pages || '').split(',').map((s) => s.trim()).filter(Boolean))
  if (set.has(clean)) return
  set.add(clean)
  await run(`UPDATE form_settings SET pages = ? WHERE form_key = ?`, [Array.from(set).join(','), formKey])
}

/* ══════════════════════════════════════════════════════════════════════════
   ARTICLES (blog) — corps stocké en HTML (stylé via les classes .article*)
   ══════════════════════════════════════════════════════════════════════════ */
export interface Article {
  id?: number
  slug: string
  title: string
  excerpt?: string
  cover?: string
  body?: string
  status?: ArticleStatus
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
}

export type ArticleStatus = 'draft' | 'scheduled' | 'published'

const mapArticle = (r: any): Article => ({
  id: r.id, slug: r.slug, title: r.title, excerpt: r.excerpt, cover: r.cover, body: r.body,
  status: r.status, createdAt: r.created_at, updatedAt: r.updated_at, publishedAt: r.published_at
})

/**
 * Condition « visible publiquement » : publié, OU programmé dont l'heure est passée.
 * Calculée à la lecture → aucune tâche de fond : un article programmé apparaît
 * tout seul le moment venu. (Les dates sont en ISO, comparables telles quelles.)
 */
const PUBLIC_COND = `(status = 'published' OR (status = 'scheduled' AND published_at IS NOT NULL AND published_at <= ?))`

/** Un article est-il en ligne maintenant ? (même règle que PUBLIC_COND, côté JS) */
export function isArticleLive(a: Article, now = new Date().toISOString()): boolean {
  if (a.status === 'published') return true
  return a.status === 'scheduled' && !!a.publishedAt && a.publishedAt <= now
}

/** Tous les articles (admin), plus récents d'abord. */
export async function listArticles(): Promise<Article[]> {
  await ensureReady()
  const rows = await all(`SELECT * FROM articles ORDER BY COALESCE(updated_at, created_at) DESC, id DESC`)
  return rows.map(mapArticle)
}

/** Articles visibles publiquement (liste /blog + sitemap). Exclut brouillons et programmés à venir. */
export async function listPublishedArticles(): Promise<Article[]> {
  await ensureReady()
  const rows = await all(
    `SELECT * FROM articles WHERE ${PUBLIC_COND} ORDER BY COALESCE(published_at, created_at) DESC, id DESC`,
    [new Date().toISOString()])
  return rows.map(mapArticle)
}

/** Un article par id (admin, tout statut). */
export async function getArticle(id: number): Promise<Article | null> {
  await ensureReady()
  const r = await get(`SELECT * FROM articles WHERE id = ?`, [id])
  return r ? mapArticle(r) : null
}

/** Un article par slug. publicOnly = seulement s'il est en ligne (sinon 404 → jamais indexable). */
export async function getArticleBySlug(slug: string, publicOnly = true): Promise<Article | null> {
  await ensureReady()
  const r = publicOnly
    ? await get(`SELECT * FROM articles WHERE slug = ? AND ${PUBLIC_COND}`, [slug, new Date().toISOString()])
    : await get(`SELECT * FROM articles WHERE slug = ?`, [slug])
  return r ? mapArticle(r) : null
}

/**
 * Crée ou met à jour un article. Renvoie l'id.
 *
 * Date de publication selon le statut :
 *  - brouillon  → aucune (l'article n'existe pas publiquement → 404 → jamais indexable)
 *  - programmé  → la date choisie (doit être valide)
 *  - publié     → la date d'origine si elle est déjà passée (on ne réécrit pas
 *                 l'historique), sinon maintenant. Ce garde-fou évite qu'un article
 *                 programmé plus tard puis « publié » reste invisible à cause de
 *                 sa date future.
 */
export async function upsertArticle(a: Article): Promise<number | null> {
  await ensureReady()
  const now = new Date().toISOString()
  const status: ArticleStatus =
    a.status === 'published' ? 'published' : a.status === 'scheduled' ? 'scheduled' : 'draft'

  const prev = a.id ? await get(`SELECT published_at FROM articles WHERE id = ?`, [a.id]) : null

  let publishedAt: string | null = null
  if (status === 'scheduled') {
    const d = a.publishedAt ? new Date(a.publishedAt) : null
    if (!d || isNaN(d.getTime())) throw new Error('Date de programmation invalide.')
    publishedAt = d.toISOString()
  } else if (status === 'published') {
    const prevAt: string | undefined = prev?.published_at
    publishedAt = prevAt && prevAt <= now ? prevAt : now
  }

  if (a.id) {
    await run(
      `UPDATE articles SET slug = ?, title = ?, excerpt = ?, cover = ?, body = ?, status = ?, updated_at = ?, published_at = ? WHERE id = ?`,
      [a.slug, a.title, a.excerpt || null, a.cover || null, a.body || null, status, now, publishedAt, a.id])
    return a.id
  }
  return run(
    `INSERT INTO articles (slug, title, excerpt, cover, body, status, created_at, updated_at, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [a.slug, a.title, a.excerpt || null, a.cover || null, a.body || null, status, now, now, publishedAt])
}

/** Supprime un article. */
export async function deleteArticle(id: number) {
  await ensureReady()
  await run(`DELETE FROM articles WHERE id = ?`, [id])
}

/* ══════════════════════════════════════════════════════════════════════════
   INDEXATION DES PAGES — source unique pour le meta robots et le sitemap.
   Convention : une page ABSENTE de la table est indexable. Seules les
   exceptions (non indexées) sont stockées.
   ══════════════════════════════════════════════════════════════════════════ */

/** Pages qu'on ne doit JAMAIS pouvoir désindexer depuis l'admin (garde-fou). */
export const LOCKED_INDEXED = new Set(['/', '/mentions-legales', '/confidentialite'])

/** Pages techniques, jamais indexables (non pilotables). */
export const ALWAYS_NOINDEX = ['/admin', '/merci']

/** Normalise un chemin : minuscule, sans query/hash, sans slash final. */
export function normalizePath(p: string): string {
  let s = String(p || '').split('?')[0].split('#')[0].trim().toLowerCase()
  if (!s.startsWith('/')) s = '/' + s
  if (s.length > 1) s = s.replace(/\/+$/, '')
  return s || '/'
}

/** true si le chemin relève d'une zone toujours non indexable (/admin, /merci…). */
export function isAlwaysNoindex(path: string): boolean {
  const p = normalizePath(path)
  return ALWAYS_NOINDEX.some((base) => p === base || p.startsWith(base + '/'))
}

/** Toutes les exceptions stockées : { '/simulateur': false, … } */
export async function listPageSettings(): Promise<Record<string, boolean>> {
  await ensureReady()
  const rows = await all(`SELECT path, indexed FROM page_settings`)
  const out: Record<string, boolean> = {}
  for (const r of rows) out[normalizePath(r.path)] = Number(r.indexed) === 1
  return out
}

/** Une page est-elle indexable ? (défaut : oui, sauf zone technique ou exception en base) */
export async function isPageIndexed(path: string): Promise<boolean> {
  const p = normalizePath(path)
  if (isAlwaysNoindex(p)) return false
  if (LOCKED_INDEXED.has(p)) return true
  const settings = await listPageSettings()
  return settings[p] !== false
}

/**
 * Règles compactes de non-indexation, pour le rendu (meta robots) et le sitemap.
 * Un préfixe couvre la page ET ses sous-pages (ex. /blog ⇒ /blog/mon-article).
 * Toute la logique métier vit ici : le client se contente d'appliquer les règles.
 */
export async function getNoindexRules(): Promise<{ prefixes: string[] }> {
  const settings = await listPageSettings()
  const prefixes = [...ALWAYS_NOINDEX]
  for (const [p, indexed] of Object.entries(settings)) {
    if (!indexed && !LOCKED_INDEXED.has(p)) prefixes.push(p)
  }
  return { prefixes }
}

/** Applique les règles à un chemin (même logique côté serveur et client). */
export function matchesNoindex(path: string, prefixes: string[]): boolean {
  const p = normalizePath(path)
  return prefixes.some((pre) => p === pre || p.startsWith(pre + '/'))
}

/** Définit l'indexation d'une page. Renvoie false si la page est verrouillée. */
export async function setPageIndexed(path: string, indexed: boolean): Promise<boolean> {
  const p = normalizePath(path)
  if (LOCKED_INDEXED.has(p) || isAlwaysNoindex(p)) return false // garde-fou serveur
  await ensureReady()
  const now = new Date().toISOString()
  const val = indexed ? 1 : 0
  if (engine === 'mysql') {
    await run(
      `INSERT INTO page_settings (path, indexed, updated_at) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE indexed = VALUES(indexed), updated_at = VALUES(updated_at)`,
      [p, val, now])
  } else {
    await run(
      `INSERT INTO page_settings (path, indexed, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(path) DO UPDATE SET indexed = excluded.indexed, updated_at = excluded.updated_at`,
      [p, val, now])
  }
  return true
}
