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
  }
  // Exemple future table :
  // { sqlite: `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT,
  //     email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT, created_at TEXT)`,
  //   mysql:  `CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY,
  //     email VARCHAR(255) UNIQUE NOT NULL, password_hash TEXT NOT NULL, role VARCHAR(40),
  //     created_at VARCHAR(40)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4` },
]

async function ensureReady() {
  if (engine) return
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
  entreprise: r.entreprise, telephone: r.telephone, message: r.message, meta: r.meta, ip: r.ip, userAgent: r.user_agent
})

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
