# OTONOM — Brief de reprise (pour Claude Code)

> Point d'entrée du projet. **Lis ce fichier en entier avant toute modification.**

## 🎯 Mission
Site d'**OTONOM** — orchestrateur de la transition mobilité, recharge & énergie des entreprises.
Objectif business : présence crédible + **génération de leads** (réserver un audit gratuit) + un simulateur d'économies/ROI.

**Migration en cours** : on passe du site statique (HTML/CSS/JS) à une app **Nuxt 4** (full-stack), pour supporter
un **back-office admin**, une **BDD des leads**, et le **routage configurable des emails par formulaire**.
La migration est terminée (Phases 0→3) ; reste la mise en ligne N0C (Phase 4, cf. `DEPLOY.md`).

## Règles de marque (NON négociables)
- **Noir & Blanc premium strict.** Aucune couleur saturée. **Jamais de vert écolo** (même pour le CO₂ ou les gains).
  Accent = blanc lumineux réservé aux CTA et chiffres clés. Espace négatif, filets 1px, chiffres en **mono tabulaire**.
- **Interdits** : faux dashboard SaaS, jauges colorées, « temps réel », le mot « cockpit », jargon technique en titre, stock-photos.
- **Lexique** : « un seul interlocuteur », « de A à Z », « on s'occupe de tout », « optimisez » ; parler de **gains**.
- Tout chiffre fiscal = **daté (01/01/2026)** + disclaimer « indicatif, à confirmer », formulé en « jusqu'à ».

## Ce qu'est OTONOM
Orchestrateur **A→Z** de la transition **mobilité + recharge + énergie** des entreprises. Il **conseille, coordonne**
tous les prestataires (installateurs, énergéticiens, financeurs, mainteneurs) et **optimise** le coût financier, fiscal
et énergétique. Bénéfice : **un seul interlocuteur, des résultats chiffrés, zéro complexité.** Une marque du groupe
**MC Groupe**. OTONOM **n'est PAS** un éditeur de logiciel, un installateur, ni un vendeur de bornes.

**Personas (4)** : Dirigeants (vision/ROI/délégation) · DAF (TCO, fiscalité, risque) · DRH (avantage en nature) ·
Services généraux (exploitation, recharge, supervision).

## Stack
- **Nuxt 4** (Vue 3, Vite) — SSR + routes serveur **Nitro**. TypeScript.
- **CSS simple + variables** (pas de SCSS/Tailwind) : design system dans `app/assets/css/main.css` (repris tel quel du statique).
- **BDD** : SQLite via `node:sqlite` (intégré à Node) — **tout l'accès data est isolé dans `server/utils/db.ts`**
  (pour basculer vers MySQL N0C plus tard, on ne change QUE ce fichier). Fichier local dans `data/` (gitignoré).
- **Email** : `nodemailer` (SMTP `no-reply@otonom.fr`), template DA dans `server/utils/mailer.ts`.
- Polices Google Fonts (Space Grotesk / Inter / Space Mono) chargées via `nuxt.config.ts`.
- ⚠️ Plus de cache-busting `?v=N` manuel : Vite gère le hachage des assets.

## Structure
```
app/
  app.vue                  Racine (NuxtLayout > NuxtPage)
  layouts/default.vue      Header + footer uniques (fini la duplication)
  components/OtonomLogo.vue Logo SVG réutilisable
  pages/                   Une page = une route (index.vue = accueil ; à compléter en Phase 1)
  assets/css/main.css      Design system (variables :root + composants) — DA OTONOM
server/
  api/lead.post.ts         POST /api/lead : valide → enregistre en BDD → envoie l'email
  utils/db.ts              SEULE couche BDD (leads + form_settings). node:sqlite.
  utils/mailer.ts          Email de lead stylisé (DA N&B), SMTP via runtimeConfig
public/                    Favicons, manifest, og-image, robots.txt
nuxt.config.ts             css, head (fonts/favicons), runtimeConfig (SMTP/BDD/destinataires)
.env.example               Modèle des variables serveur (copier en .env, jamais commité)
DEPLOY.md                  Runbook de mise en ligne PlanetHoster N0C (Node + MySQL)
```
(L'ancien site statique `legacy/` a été supprimé une fois le portage terminé.)

## Config serveur (runtimeConfig / env)
Surchargée en prod par des variables `NUXT_*` (jamais commitées ; voir `.env.example`) :
`NUXT_DB_FILE`, `NUXT_DEFAULT_RECIPIENTS`, `NUXT_SMTP_HOST/PORT/SECURE/USER/PASS/FROM/FROM_NAME`.
Serveur SMTP PlanetHoster : `node251-eu.n0c.com` (465 SSL). Boîte : `no-reply@otonom.fr`.

## Leads & formulaires
- Les formulaires (contact, simulateur) postent en JSON vers **`POST /api/lead`** avec un champ `_form`
  (`contact` | `simulateur`), un honeypot `_honey`, et éventuellement `meta` (résumé simulateur).
- Le lead est **toujours enregistré en BDD** (même si l'email échoue → aucun lead perdu), puis l'email part
  vers les **destinataires du formulaire** (table `form_settings`, repli sur `NUXT_DEFAULT_RECIPIENTS`).
- Destinataires par défaut : `e.barlet@mc-groupe.com, a.thomas@mc-groupe.com`.

## Démarrer en local
```bash
npm install
npm run dev          # http://localhost:3000
```
Copier `.env.example` → `.env` et remplir le SMTP pour tester l'envoi réel des emails.

## Feuille de route de la migration
- **Phase 0 — Fondations** ✅ Nuxt + DA + layout + accueil.
- **Phase 1 — Portage** ✅ toutes les pages + interactions (`.reveal`, count-up, schéma, frise, parallaxe, curseur).
- **Phase 2 — Backend** ✅ `/api/lead` → BDD leads + email + table destinataires.
- **Phase 3 — Admin** ✅ login (nuxt-auth-utils) + tableau des leads (filtre/tri par formulaire) + destinataires par formulaire.
- **Phase 4 — Mise en ligne** ⏳ app Node + MySQL sur **PlanetHoster N0C** → voir **`DEPLOY.md`** (actions dans le panneau N0C).

Le build de prod (`npm run build` → `.output/server/index.mjs`) est vérifié fonctionnel.

## À compléter
- Données légales dans `app/pages/mentions-legales.vue` + `app/pages/confidentialite.vue` (placeholders `[À COMPLÉTER]` :
  raison sociale, SIREN/RCS, adresse, capital, directeur de publication, hébergeur).
- **Recalibrer les coefficients du simulateur** (`SIM_CONFIG` dans `app/utils/simulateur.ts`) avec OTONOM (ROI un peu agressif).

## Rédaction d'articles de blog
**Avant de rédiger ou modifier un article, lire `REDACTION-ARTICLES.md`** (méthode SEO/GEO OTONOM : cocons
sémantiques, maillage interne, liens externes officiels dosés, vérification factuelle des chiffres, blocs de style,
checklist). Un article ne passe **jamais** en prod sans validation explicite du patron.

## Sources de contexte
- Notion « Otonom — Bump complet » (positionnement, personas, fiscalité, benchmark).
- Contact projet : Antoine — a.thomas@mc-groupe.com · Commercial : Grégory — gregory@otonom.fr / 06 68 28 09 08.
