# OTONOM — Guide de rédaction des articles de blog

> **Lis ce fichier en entier avant de rédiger ou de modifier un article.**
> Il complète le `CLAUDE.md` (règles de marque) et fixe la méthode SEO/GEO à suivre **à chaque fois**.
> Objectif : des articles crédibles, utiles, bien référencés (Google) **et** citables par les moteurs de réponse IA (GEO).

---

## 0. Rappel des règles de marque (non négociables)

Reprises du `CLAUDE.md`, elles priment sur tout le reste :

- **Noir & blanc premium strict.** Aucune couleur saturée. **Jamais de vert** (même pour le CO₂ ou les « gains »).
- **Tout chiffre fiscal / réglementaire** = **daté** (« au 01/01/2026 »), formulé en **« jusqu'à »**, suivi du **disclaimer** « indicatif et non contractuel — à confirmer avec votre expert-comptable ».
- **Lexique OTONOM** : « un seul interlocuteur », « de A à Z », « on s'occupe de tout », « optimisez », parler de **gains**.
- **Interdits** : faux dashboard, jauges colorées, « temps réel », « cockpit », jargon technique en titre, stock-photos, promesses non datées.
- OTONOM = **orchestrateur** A→Z de la transition mobilité + recharge + énergie. **PAS** un éditeur de logiciel, un installateur, ni un vendeur de bornes.

---

## 1. Vérification factuelle (OBLIGATOIRE)

Un article OTONOM ne publie **jamais** un chiffre fiscal, un plafond ou une échéance « de mémoire ».

1. **Recherche web** sur chaque donnée chiffrée (plafonds, taux, dates, barèmes) avant de l'écrire.
2. Privilégier les **sources officielles** (voir §5) ; recouper au moins 2 sources si la donnée est sensible.
3. **Dater** la donnée dans le texte + ajouter le **disclaimer** en pied d'article.
4. En cas de doute, écrire en fourchette prudente (« de l'ordre de… », « jusqu'à ~… ») plutôt qu'un chiffre faux.
5. Les barèmes fiscaux doivent idéalement recevoir **un dernier contrôle OTONOM** avant mise en prod.

---

## 2. Structure d'un article

| Élément | Règle |
|---|---|
| **Titre (H1 / `title`)** | 55–65 caractères, contient le mot-clé principal + l'intention (souvent « en entreprise » / « 2026 »). Un seul H1 (le champ titre ; ne pas remettre de `<h1>` dans le corps). |
| **Slug** | court, mots-clés, sans année si l'article a vocation à durer (sinon millésimé). Généré depuis le titre, épuré. |
| **Excerpt (meta description)** | 150–160 caractères, mots-clés en tête, donne envie de cliquer. Sert de résumé de liste **et** de meta description. |
| **Chapô** | 1 paragraphe d'intro avant le 1ᵉʳ `<h2>` : pose le sujet, annonce le plan, place le mot-clé. |
| **`<h2>` / `<h3>`** | Hiérarchie logique. Les `<h2>` alimentent **le sommaire automatique** (généré tout seul si ≥ 2 H2). Titres explicites et riches en mots-clés naturels. |
| **Longueur** | Article de fond : **1 200–2 000 mots**. Mieux vaut couvrir complètement un sujet que survoler. |
| **Corps** | Phrases courtes, une idée par paragraphe. Alterner texte / tableau / callout / FAQ pour le rythme. |
| **Conclusion + CTA** | Toujours finir vers l'action OTONOM (audit gratuit, simulateur). Un bloc CTA est déjà présent sous chaque article. |
| **Disclaimer** | `<hr>` + paragraphe daté (barèmes au 01/01/AAAA, indicatif, à confirmer). |

---

## 3. Cocons sémantiques

Un **cocon sémantique** = un ensemble de pages qui se répondent autour d'une même intention, avec un maillage interne hiérarchisé. On ne publie pas des articles isolés, on construit des grappes.

**Modèle à appliquer :**

- **Page pilier** (transversale, forte) : ex. `/expertises`, `/methode`, ou un article « chapeau » très complet sur un thème (ex. « Fiscalité du véhicule électrique en entreprise »).
- **Articles satellites** (précis, longue traîne) : chacun creuse **un** sous-sujet du pilier (ex. « L'avantage en nature du véhicule électrique », « Amortir une voiture électrique », « Récupérer la TVA sur la recharge »).
- **Maillage du cocon** :
  - chaque satellite **pointe vers le pilier** (lien remontant),
  - le pilier **pointe vers ses satellites** (liens descendants),
  - les satellites d'un même cocon **se lient entre eux** quand c'est pertinent,
  - **ne pas** lier deux cocons sans raison (on garde les grappes étanches).

Avant d'écrire, se demander : *de quel cocon cet article fait-il partie, quel est son pilier, quels satellites existent déjà ?* (Voir `/blog` pour l'existant.)

---

## 4. Maillage interne

- **3 à 6 liens internes** par article de fond, avec une **ancre descriptive** (jamais « cliquez ici »).
- Lier vers les pages utiles à l'intention du lecteur et au cocon.
- **Toujours** proposer au moins un lien vers **le simulateur** et/ou **le contact** (conversion = objectif business).

**Pages internes disponibles :**

| URL | Usage type |
|---|---|
| `/` | Accueil / présentation OTONOM |
| `/expertises` | Pilier — ce qu'OTONOM couvre |
| `/methode` | Pilier — la démarche A→Z |
| `/simulateur` | **Conversion** — estimer ses gains/ROI |
| `/contact` | **Conversion** — réserver un audit gratuit |
| `/dirigeants` `/daf` `/drh` `/services-generaux` | Pages persona (adapter le lien au rôle cité) |
| `/a-propos` | La marque, MC Groupe |
| `/blog` | Retour liste / autres articles du cocon |

*(Ne pas lier `/mentions-legales`, `/confidentialite`, `/merci` depuis un article.)*

---

## 5. Liens externes (peu, mais bien)

Un ou deux liens externes **de qualité** renforcent la confiance (E-E-A-T) et la citabilité GEO. **Trop de liens externes = fuite d'autorité** : rester sobre.

**Règles :**
- **2 à 4 liens externes maximum** par article, placés sur une **affirmation factuelle** (un chiffre, une règle de droit).
- **Uniquement des sources officielles / faisant autorité** (État, administrations, textes de loi). Jamais de blog concurrent, jamais de source commerciale.
- Ouvrir dans un nouvel onglet : `target="_blank" rel="noopener noreferrer"`.
- Équilibre : ~1 lien externe pour 400–600 mots, pas plus.

**Domaines officiels autorisés (liste blanche) :**

| Source | Domaine | Pour |
|---|---|---|
| Service-Public (Entreprendre) | `entreprendre.service-public.gouv.fr` | taxes, démarches, droit des sociétés |
| URSSAF | `urssaf.fr` | avantage en nature, cotisations |
| Impôts / BOFiP | `impots.gouv.fr`, `bofip.impots.gouv.fr` | barèmes fiscaux, amortissement, TVA |
| Légifrance | `legifrance.gouv.fr` | textes de loi, décrets, arrêtés |
| Ministère Transition écologique | `ecologie.gouv.fr` | fiscalité environnementale, mobilité |
| Économie / DGE | `economie.gouv.fr` | dispositifs, aides |
| ADEME | `ademe.fr` | énergie, recharge, données environnementales |

---

## 6. Optimisation GEO (être cité par les IA)

Les moteurs de réponse (ChatGPT, Perplexity, Google AI…) citent les contenus **structurés, factuels et auto-portants**. À faire systématiquement :

- **Affirmations auto-portantes** : chaque fait clé doit se comprendre **hors contexte** et contenir sa donnée datée (« Le plafond d'amortissement d'un véhicule électrique est de 30 000 € en 2026 »). C'est ce que l'IA extrait.
- **FAQ** en fin d'article : formuler les questions comme de **vraies requêtes** (« Quel est le plafond… », « La TVA est-elle récupérable… »). Excellent pour featured snippets **et** GEO.
- **Tableaux** comparatifs et **exemples chiffrés** : formats directement réutilisables par les LLM.
- **Clarté de l'entité OTONOM** : rappeler ce qu'est OTONOM et ce qu'elle fait (un seul interlocuteur, de A→Z) dans le corps et la FAQ.
- **Dates et sources** visibles : renforce la fiabilité perçue.

---

## 7. Blocs de style disponibles

Le corps est du HTML rendu sous `.article-body`. Utiliser **uniquement** ces blocs (déjà stylés N&B dans `app/assets/css/main.css`) :

- **Callout** « À retenir » :
  ```html
  <div class="article-callout"><span class="callout-label">À retenir</span><p>Le point clé.</p></div>
  ```
- **Tableau** (mono en-tête, 1ʳᵉ colonne accentuée) :
  ```html
  <table><thead><tr><th>Colonne</th><th>Valeur</th></tr></thead>
  <tbody><tr><td>Ligne</td><td>…</td></tr></tbody></table>
  ```
- **FAQ** (accordéon en cartes) :
  ```html
  <div class="article-faq">
    <details><summary>La question ?</summary><div class="faq-a">La réponse.</div></details>
  </div>
  ```
- Aussi : `<h2>`/`<h3>`, `<p>`, `<strong>`/`<em>`, `<ul>`/`<li>`, `<blockquote>`, `<hr>`, `<a>`.
- Le **sommaire** (liste des H2) est généré automatiquement — ne pas l'écrire à la main.
- Chiffres : les laisser en texte, la police mono tabulaire s'applique via le CSS.

---

## 8. Process technique

- Un article = une ligne dans la table `articles` (BDD, `server/utils/db.ts`). Corps stocké en **HTML**.
- Édition des textes possible dans **l'admin** (onglet **Blog** → éditeur visuel).
- Champs : `title`, `slug`, `excerpt`, `cover` (image en niveaux de gris), `body`, `status` (`draft`/`published`).
- Image de couverture : format paysage, **noir & blanc / désaturée** (le rendu applique un grayscale).
- **Ne jamais mettre un article en prod sans validation explicite du patron.** Push git uniquement sur demande.

---

## 9. Checklist avant publication

- [ ] Sujet rattaché à un **cocon** (pilier identifié, satellites liés).
- [ ] Titre 55–65 car. avec mot-clé + intention ; slug propre ; excerpt 150–160 car.
- [ ] Chapô + hiérarchie H2/H3 logique ; 1 200–2 000 mots.
- [ ] **Tous les chiffres vérifiés** (recherche web) + **datés** + disclaimer présent.
- [ ] 3–6 **liens internes** (ancres descriptives), dont simulateur/contact.
- [ ] 2–4 **liens externes** vers sources **officielles** uniquement (`target="_blank" rel="noopener noreferrer"`).
- [ ] Au moins un **tableau**, une **FAQ** (questions = requêtes), un **exemple chiffré** si le sujet s'y prête.
- [ ] Affirmations clés **auto-portantes** (GEO) ; entité OTONOM rappelée.
- [ ] Charte respectée : **N&B, aucun vert, « jusqu'à », lexique OTONOM**.
- [ ] CTA final vers l'audit gratuit.
- [ ] Reste en **brouillon / hors prod** tant que le patron n'a pas validé.
