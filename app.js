// OTONOM — point d'entrée production (PlanetHoster N0C / Passenger).
// Charge le fichier .env situé À CÔTÉ de ce fichier, SANS dépendance externe,
// puis démarre le serveur Nitro compilé (.output).
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

try {
  const root = dirname(fileURLToPath(import.meta.url))
  const env = readFileSync(join(root, '.env'), 'utf8')
  for (const line of env.split(/\r?\n/)) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)$/)
    if (!m) continue
    let v = m[2].trim()
    if ((v[0] === '"' && v.at(-1) === '"') || (v[0] === "'" && v.at(-1) === "'")) v = v.slice(1, -1)
    if (process.env[m[1]] === undefined) process.env[m[1]] = v
  }
} catch { /* pas de .env : on utilise les variables système */ }

import('./.output/server/index.mjs')
