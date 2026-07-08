# Site OTONOM — App Nuxt

Site + simulateur d'**OTONOM**, orchestrateur de la transition mobilité, recharge et énergie des entreprises
(marque du groupe MC Groupe). Design **noir & blanc premium**.

Application **Nuxt 4** (Vue 3 + Vite, SSR + routes serveur Nitro), avec back-office admin et BDD des leads.

## Démarrer

```bash
npm install
npm run dev            # http://localhost:3000
```

Pour tester l'envoi réel des emails de lead, copier la config serveur et remplir le SMTP :

```bash
cp .env.example .env   # puis renseigner NUXT_SMTP_* (boîte no-reply@otonom.fr)
```

Scripts : `npm run dev` · `npm run build` · `npm run preview` · `npm run generate`.

## Structure

- `app/` — front : `layouts/default.vue` (header/footer uniques), `pages/` (routes), `assets/css/main.css` (design system), `components/`.
- `server/` — back : `api/lead.post.ts` (réception des leads), `utils/db.ts` (BDD, **seule couche data**), `utils/mailer.ts` (email DA).
- `public/` — favicons, manifest, image Open Graph, robots.txt.
- `nuxt.config.ts` — CSS global, `<head>` (polices/favicons), `runtimeConfig` (SMTP / BDD / destinataires).
- `data/` — base SQLite locale (gitignorée).

## Formulaires & leads

Les formulaires postent en JSON vers **`POST /api/lead`** (`_form` = `contact` | `simulateur`, honeypot `_honey`,
`meta` optionnel). Chaque lead est **enregistré en base** (jamais perdu), puis un email stylisé part vers les
destinataires configurés pour ce formulaire (table `form_settings`, repli sur `NUXT_DEFAULT_RECIPIENTS`).

## Base de données

SQLite via `node:sqlite` (intégré à Node, zéro dépendance). Tout l'accès est **isolé dans `server/utils/db.ts`** :
passer à MySQL (PlanetHoster N0C) plus tard ne touchera que ce fichier. Tables : `leads`, `form_settings`.

## Déploiement

Cible : **PlanetHoster N0C** (app Node.js + BDD MySQL). Build de prod : `npm run build` → `.output/server/index.mjs`.
Procédure complète (base MySQL, app Node, variables d'environnement, domaine) dans **[`DEPLOY.md`](DEPLOY.md)**.

## Contexte & règles de marque

Voir **CLAUDE.md** : positionnement OTONOM, personas, règles de marque (N&B strict, pas de vert, pas de dashboard),
config serveur et feuille de route.
