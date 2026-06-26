# Site OTONOM

Site vitrine statique d'**OTONOM** — orchestrateur de la transition mobilité, recharge et énergie des entreprises. Une marque du groupe MC Groupe.

Design noir & blanc premium, sans framework (HTML + CSS + JS vanilla, aucune étape de build).

## Démarrer en local

Aucune installation. Ouvrez `index.html` dans un navigateur, ou servez le dossier :

```bash
python3 -m http.server 8000   # puis http://localhost:8000
```

## Structure

- **Pages** : `index`, `expertises`, `methode`, `a-propos`, `contact`, `merci`, pages personas (`dirigeants`, `daf`, `drh`, `services-generaux`), pages légales (`mentions-legales`, `confidentialite`).
- `assets/css/styles.css` — design system (variables CSS dans `:root`). Versionné via `?v=N` sur les liens CSS/JS : **incrémenter à chaque changement de style**.
- `assets/js/app.js` — interactions légères (nav mobile, reveal au scroll, count-up).
- `assets/img/` — logos SVG + favicons + image Open Graph.
- `favicon.svg` / `favicon.ico`, `site.webmanifest`, `robots.txt`, `sitemap.xml`.

## SEO & social

Chaque page porte : `<title>` + meta description, lien canonique vers `https://otonom.fr/…`, balises Open Graph + Twitter Card, favicons multi-formats. Image de partage : `assets/img/og-image.png` (1200×630).

## Contexte & règles de marque

Voir **CLAUDE.md** (brief de reprise détaillé) : positionnement, personas, règles de marque (N&B strict), feuille de route.

## Déploiement

Statique : **GitHub Pages**, **Netlify** ou **Vercel** (racine = ce dossier, aucun build). Chaque `git push` met le site à jour.

## À compléter

- Données légales dans `mentions-legales.html` et `confidentialite.html` (placeholders `[À COMPLÉTER]` : raison sociale, SIREN/RCS, adresse, capital, directeur de publication, hébergeur).
- Activation FormSubmit (cliquer le mail de validation reçu au 1er envoi du formulaire de contact).
