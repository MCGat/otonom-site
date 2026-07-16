# Site OTONOM — App Nuxt

Site + simulateur d'**OTONOM**, orchestrateur de la transition mobilité, recharge et énergie des entreprises
(marque du groupe MC Groupe). Design **noir & blanc premium**.

Application **Nuxt 4** (Vue 3 + Vite, SSR + routes serveur Nitro), avec simulateur d'économies/ROI,
back-office admin (leads + blog) et BDD.

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

- `app/` — front : `layouts/` (`default.vue` header/footer uniques, `admin.vue` back-office à onglets), `pages/` (routes, dont `blog/` et `admin/`), `assets/css/main.css` (design system), `components/`.
- `server/` — back : `api/lead.post.ts` (réception des leads), `api/articles/` + `api/admin/` (blog public/admin), `utils/db.ts` (BDD, **seule couche data**), `utils/mailer.ts` (email DA).
- `public/` — favicons, manifest, image Open Graph, robots.txt.
- `nuxt.config.ts` — CSS global, `<head>` (polices/favicons), `runtimeConfig` (SMTP / BDD / destinataires).
- `data/` — base SQLite locale (gitignorée).

## Formulaires & leads

Les formulaires postent en JSON vers **`POST /api/lead`** (`_form` = `contact` | `simulateur`, honeypot `_honey`,
`meta` optionnel). Chaque lead est **enregistré en base** (jamais perdu), puis un email stylisé part vers les
destinataires configurés pour ce formulaire (table `form_settings`, repli sur `NUXT_DEFAULT_RECIPIENTS`).

## Base de données

SQLite via `node:sqlite` (intégré à Node, zéro dépendance). Tout l'accès est **isolé dans `server/utils/db.ts`** :
passer à MySQL (PlanetHoster N0C) plus tard ne touchera que ce fichier. Tables : `leads`, `form_settings`,
`articles`, `page_settings`.

## Indexation des pages

Pilotée depuis l'admin (onglet **Pages & indexation**), pas dans le code. La table **`page_settings`** est la
**seule source de vérité** : elle alimente à la fois le `meta robots` (posé dans `app/app.vue` au rendu serveur)
et le **sitemap** — une page désindexée en sort donc automatiquement. Une page absente de la table est indexable.
L'accueil et les pages légales sont **verrouillées** (non désindexables), `/admin` et `/merci` jamais indexables.
⚠️ Ne pas remettre de `robots` en dur dans une page (voir `CLAUDE.md`).

## Admin & blog

Back-office protégé (login via `nuxt-auth-utils`, `NUXT_ADMIN_PASSWORD` / `NUXT_SESSION_PASSWORD`) sous `/admin`,
avec onglets **Formulaires & leads** (filtre/tri, export CSV, destinataires par formulaire, marquage « test ») et
**Blog** (liste + éditeur visuel des articles). Les articles sont rendus sur `/blog` et `/blog/[slug]`.

**Avant de rédiger ou modifier un article, lire [`REDACTION-ARTICLES.md`](REDACTION-ARTICLES.md)** (méthode
SEO/GEO : cocons sémantiques, maillage interne, liens externes officiels, vérification factuelle, blocs de style).
Un article ne passe **jamais** en prod sans validation explicite.

## Déploiement

Cible : **PlanetHoster N0C** (app Node.js + BDD MySQL). Build de prod : `npm run build` → `.output/server/index.mjs`.
Procédure complète (base MySQL, app Node, variables d'environnement, domaine) dans **[`DEPLOY.md`](DEPLOY.md)**.

## Contexte & règles de marque

Voir **CLAUDE.md** : positionnement OTONOM, personas, règles de marque (N&B strict, pas de vert, pas de dashboard),
config serveur et feuille de route.
