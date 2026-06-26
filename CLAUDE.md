# OTONOM — Brief de reprise (pour Claude Code)

> Point d'entrée du projet. **Lis ce fichier en entier avant toute modification.**

## 🎯 Mission (par où commencer)
Tu reprends le **site vitrine statique d'OTONOM**. Objectif business : présence en ligne crédible +
**génération de leads** (réserver un audit gratuit). Le socle (10 pages) est déjà en place et fonctionnel.
Ta mission : **finaliser, fiabiliser, puis faire évoluer** le site en respectant scrupuleusement la marque.

**Avant de coder :**
1. Lis ce fichier, puis `../OTONOM_Dossier_Strategie_Web.md` (stratégie, copy, chiffres) et `../OTONOM_Brief_Claude_Design.md` (DA).
2. Respecte les **règles de marque** ci-dessous (N&B strict, orchestrateur, pas de vert, pas de cockpit).
3. Travaille par petites étapes, garde le site **statique et sans build** tant que les simulateurs/hero 3D ne sont pas demandés.

## ✅ Feuille de route priorisée
**P1 — Finaliser (rapide, pour mise en prod / validation Dir)**
- [~] **Mentions légales, SIREN, adresse** : pages créées avec footer légal sur toutes les pages. ⏳ **Reste à fournir** les données d'entreprise (placeholders `[À COMPLÉTER]` balisés dans `mentions-legales.html` + `confidentialite.html` : raison sociale, forme juridique, capital, SIREN/RCS, TVA, siège, directeur de publication, hébergeur).
- [x] ~~Calendly~~ → décision : on garde le **formulaire FormSubmit classique** tant qu'il n'y a pas de Calendly. (Domaine final branché : `_next` → `https://otonom.fr/merci.html`.)
- [ ] Confirmer l'**activation FormSubmit** (action humaine : 1er envoi réel → cliquer le mail de validation reçu à a.thomas@mc-groupe.com).
- [x] **Favicon** (favicon.svg/.ico + PNG 16/32/48/180/192/512, `site.webmanifest`), **Open Graph/Twitter** (image `assets/img/og-image.png` 1200×630), `sitemap.xml`, `robots.txt`. Domaine prod = `https://otonom.fr`.
- [x] Pages **mentions légales** + **politique de confidentialité** (RGPD) créées au gabarit du site, liées au footer et au consentement du formulaire.
- [x] Revue **accessibilité** : skip-link + `#main`, `:focus-visible` visibles (WCAG), `aria-hidden` sur SVG décoratifs, `lang`, labels formulaire, `aria-current`. ⏳ Reste : audit fin des contrastes `--muted-2` (petits textes secondaires) si viser AA strict.

**P2 — Évolution lead-gen (cf. dossier stratégie §6)**
- [ ] **3 simulateurs** (calcul 100% client, résultat avant capture email, config fiscale datée `fiscal-config`) :
      AEN thermique vs électrique (DRH) · TCO + fiscalité (DAF) · Audit recharge/supervision (Services généraux).
- [ ] **Hero 3D « explorez votre site »** (Three.js, îlot client + fallback statique) — pièce maîtresse du dossier.
- [ ] **8 pages SEO** (TCO VE, fiscalité VE 2026, AEN, ROI borne, smart charging, supervision, autoconsommation, ESG).

**P3 — Industrialisation**
- [ ] Envisager une migration **Astro + Tailwind + TypeScript** si le volume de pages/simulateurs le justifie.
- [ ] Déploiement continu (GitHub → Vercel/Netlify).

---

## Ce qu'est OTONOM
Orchestrateur **A→Z** de la transition **mobilité + recharge + énergie** des entreprises.
Il **conseille, coordonne** tous les prestataires (installateurs, énergéticiens, financeurs, mainteneurs)
et **optimise** le coût financier, fiscal et énergétique. Bénéfice : **un seul interlocuteur, des résultats
chiffrés, zéro complexité.** Une marque du groupe **MC Groupe**. But du site : **réserver un audit gratuit**.
OTONOM **n'est PAS** un éditeur de logiciel, un installateur, ni un vendeur de bornes.

## Règles de marque (NON négociables)
- **Noir & Blanc premium strict.** Aucune couleur saturée. **Jamais de vert écolo.** Accent = blanc lumineux
  réservé aux CTA et chiffres clés. Espace négatif, filets 1px, chiffres en mono tabulaire.
- **Interdits** : faux dashboard SaaS, « temps réel », le mot « cockpit », jargon technique en titre, stock-photos.
- **Lexique** : « un seul interlocuteur », « de A à Z », « on s'occupe de tout », « optimisez » ; parler de **gains**.
- Tout chiffre fiscal = **daté (01/01/2026)** + disclaimer « indicatif, à confirmer », formulé en « jusqu'à ».

## Personas (4)
Dirigeants (vision/ROI/délégation) · DAF (TCO, fiscalité, risque) · DRH (avantage en nature) · Services généraux (exploitation, recharge, supervision).

## Stack actuelle
Site **statique** : HTML + CSS + JS vanilla. **Aucun framework**, aucune étape de build.
Polices Google Fonts (Space Grotesk / Inter / Space Mono). Logo SVG inline (`assets/img/`).
Cache des assets versionné via `?v=N` sur les liens CSS/JS → **incrémenter à chaque changement de style**
(évite le cache navigateur ; ne jamais oublier sinon les modifs CSS ne s'affichent pas).

## Structure
```
index.html            Accueil (hero, orchestration, 3 piliers, pour qui, méthode, CTA)
expertises.html       Leviers : ex-TVS/TAI, AEN 70%, amortissement 30 000 €, TCO, IRVE/recharge, énergie
methode.html          Méthode A→Z (5 étapes)
a-propos.html         Réassurance + rattachement MC Groupe
contact.html          Formulaire (FormSubmit) + coordonnées
merci.html            Confirmation post-formulaire
dirigeants/daf/drh/services-generaux.html   Pages personas
assets/css/styles.css Design system (variables CSS en :root)
assets/js/app.js      Nav mobile, reveal au scroll (gate .js), count-up
assets/img/           Logos SVG (blanc / noir)
```

## Design system (voir :root dans styles.css)
Fonds `--bg #08080a` / `--bg-1` / `--bg-2`. Texte `--ink`, `--muted`. Filets `--line`.
Composants : `.btn--primary/.btn--ghost`, `.statbar/.stat`, `.grid .card`, `.tile`, `.steps .step`,
`.levers .lever`, `.persona`, `.cta-block`, `.form/.field/.form-panel`, `.reveal` (animations gated par `.js`
→ sans JS, le contenu reste visible : ne jamais masquer du contenu sans cette garde).

## Formulaire de contact (important)
`contact.html` poste vers **FormSubmit** : action `https://formsubmit.co/a.thomas@mc-groupe.com`,
copie (`_cc`) `gregory@otonom.fr`, honeypot anti-spam, redirection `_next` → `merci.html`.
⚠️ Activation unique au 1er envoi (mail de validation). Adapter `_next` si le domaine final change.

## Sources de contexte (à lire au besoin)
- Notion « Otonom — Bump complet » (positionnement, personas, fiscalité, benchmark).
- `../OTONOM_Dossier_Strategie_Web.md` (copy, chiffres fiscaux datés, hero 3D, specs des 3 simulateurs).
- `../OTONOM_Brief_Claude_Design.md` (direction artistique détaillée).
- Contact projet : Antoine — a.thomas@mc-groupe.com · Commercial : Grégory — gregory@otonom.fr / 06 68 28 09 08.

## Déploiement
Statique → GitHub puis **Vercel** ou **Netlify** (aucun build, racine = ce dossier) : chaque `git push` met le site à jour.
Alternative : GitHub Pages (branche `main`, racine).
