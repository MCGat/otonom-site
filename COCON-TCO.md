# Cocon sémantique — TCO & coût d'une flotte électrique

> **Version 4 — objectif : passer devant, sur des affirmations défendables.** À valider avant rédaction.
> Rédaction article par article, après feu vert.
> Méthode de référence : `REDACTION-ARTICLES.md`.

---

## 0. Décision prise

**On vise les positions, sans se brider.** Aucun sujet n'est écarté au motif qu'une autre marque
du groupe l'occupe déjà. Si deux pages du groupe visent la même requête, celle qui répond le
mieux gagnera — et c'est celle-là qu'on écrit.

*Nuance technique, pour la jouer à notre avantage : deux sites du groupe peuvent parfaitement se
positionner sur une même requête s'ils apportent des réponses réellement distinctes. Google ne
regroupe des URL que lorsque les contenus sont dupliqués ou très proches. OTONOM doit donc porter
un angle **financier et décisionnel** clairement identifiable — c'est l'objet de la section 5.*

---

## 1. Le terrain réel

Les requêtes visées sont **occupées**, mais par des contenus généralistes. Relevé au 04/08/2026 :

| Requête | Qui occupe aujourd'hui | Leur faiblesse |
|---|---|---|
| coût recharge flotte entreprise | Beev, IZI by EDF, Idex, Ohm Énergie, Monabee | prix du kWh isolé, aucun lien avec le coût complet |
| TCO véhicule électrique entreprise | Freshmile, Mobelis, ChargeGuru, Evera, Verbaere | méthode générique, aucune donnée propre |
| TCO utilitaire électrique | Automobile Propre (étude Arval), Utilitaires.com, Mobelis | reprennent une étude tierce sans la discuter |
| coût installation borne entreprise | Qovoltis, Freshmile, Nexteneo, Drive-in Fleet | angle installateur, pas angle décision |

**Très peu détaillent l'infrastructure de recharge** — nombre de points, travaux, raccordement,
pilotage, durée d'amortissement — et aucun ne sépare **coût économique et trésorerie** ni ne
publie de cas défavorable. C'est là que se gagne la position.

*Formulation volontairement précise : l'étude TCO Scope d'Arval évoque des contraintes
d'infrastructure, mais sa méthodologie n'est pas publique. Dire « aucun ne l'intègre » serait
indéfendable ; décrire notre niveau de détail l'est parfaitement — et c'est plus fort.*

---

## 2. Architecture

```
   CONVERSION   /simulateurs/tco-flotte-electrique     ← l'outil (section SEO en place)
        ↕
   PILIER       /blog/tco-vehicule-electrique-entreprise
        │
        ├── S1  Valeur résiduelle
        ├── S2  Coût de recharge d'une flotte
        ├── S3  Financement : achat, crédit, LLD, LOA
        ├── S4  Coût d'infrastructure de recharge
        ├── S5  TCO d'un utilitaire électrique
        │
        └── nœud partagé : /blog/fiscalite-vehicule-electrique-2026  (déjà publié)
```

Pas de satellite « fiscalité » : l'article existant, publié et long de 1 327 mots, couvre déjà les
quatre leviers. En créer un second cannibaliserait notre propre page.

---

## 3. Pilier et simulateur : deux requêtes, pas une

| | Simulateur | Pilier |
|---|---|---|
| **URL** | `/simulateurs/tco-flotte-electrique` | `/blog/tco-vehicule-electrique-entreprise` |
| **Intention** | **calculer** | **comprendre** |
| **Périmètre** | la **flotte** | le **véhicule** |
| **Mot-clé** | simulateur TCO flotte électrique | TCO véhicule électrique entreprise |

**H1 du pilier** :
> TCO d'un véhicule électrique en entreprise : méthode de calcul et postes à intégrer

« Pour DAF » disparaît du H1 — trop étroit pour la requête — mais reste dans le chapô.

**À poser dans le chapô du pilier**, pour ouvrir naturellement vers le simulateur de flotte :
> Le TCO se calcule d'abord par véhicule, puis se consolide à l'échelle de la flotte, infrastructure
> de recharge comprise.

---

## 4. Les cinq satellites

### S1 — Valeur résiduelle

| | |
|---|---|
| **H1** | Valeur résiduelle d'un véhicule électrique : calcul et impact sur le TCO |
| **Slug** | `/blog/valeur-residuelle-vehicule-electrique` |
| **Mot-clé** | valeur résiduelle véhicule électrique |
| **Secondaires** | décote voiture électrique, valeur de revente flotte |
| **Angle** | Elle se soustrait en bout de calcul, ce qui lui donne un effet de levier disproportionné : quelques points d'écart déplacent le résultat de dizaines de milliers d'euros sur une flotte. |
| **Donnée maison** | l'écart entre nos scénarios prudent et favorable, qui isole précisément cette variable |
| **Liens** | pilier · S3 · simulateur |
| **Sources** | à obtenir chez un loueur — aucune source d'État sur ce sujet |

### S2 — Coût de recharge d'une flotte

| | |
|---|---|
| **H1** | Coût de recharge d'une flotte électrique : sur site, à domicile ou en public ? |
| **Slug** | `/blog/cout-recharge-flotte-entreprise` |
| **Mot-clé** | **coût recharge flotte entreprise** |
| **Secondaires** | prix kWh recharge entreprise, recharge sur site vs publique, coût au 100 km électrique |
| **Angle** | Les concurrents publient un prix du kWh. Nous publions **l'effet du mix sur le coût complet** : recharger 80 % sur site en heures creuses ou 80 % en borne publique rapide change le résultat du simple au double. Plus les pertes de charge, que personne ne compte, et la TVA récupérable à 100 % sur l'électricité contre 80 % sur le carburant d'un véhicule de tourisme. |
| **Donnée maison** | comparaison chiffrée des **cinq profils de recharge** du simulateur, avec l'écart de TCO qu'ils produisent à flotte identique |
| **Liens** | pilier · S4 · article pilotage de charge · simulateur |
| **Sources** | BOFiP (TVA) · ADEME · tarifs professionnels |

### S3 — Achat, crédit, LLD ou LOA

| | |
|---|---|
| **H1** | Achat, crédit, LLD ou LOA : quel financement pour une flotte électrique ? |
| **Slug** | `/blog/financement-flotte-electrique` |
| **Mot-clé** | financement flotte automobile entreprise |
| **Secondaires** | LLD ou achat véhicule société, LOA entreprise, crédit-bail véhicule |
| **Angle** | Les quatre modes ne se comparent pas sur le loyer mais sur le coût complet. Qui porte le risque de revente, ce que le loyer inclut réellement, l'effet sur le bilan, et le piège du double comptage quand l'entretien est déjà dans la mensualité. |
| **Donnée maison** | l'écart de TCO entre les quatre financements, à flotte identique |
| **Liens** | pilier · S1 · nœud fiscalité · simulateur |
| **Sources** | BOFiP (déductibilité des loyers, plafonds d'amortissement) |

### S4 — Coût d'infrastructure de recharge

| | |
|---|---|
| **H1** | Coût des bornes pour une flotte : matériel, travaux, raccordement et TCO |
| **Slug** | `/blog/cout-bornes-recharge-flotte` |
| **Mot-clé** | **coût installation borne recharge entreprise** |
| **Secondaires** | prix borne entreprise, budget IRVE flotte, raccordement électrique bornes |
| **Angle** | On donne les fourchettes de prix comme les autres — puis on va où personne ne va : **comment cet investissement s'impute au coût du véhicule**. Une borne dure huit à dix ans, un véhicule quatre. Quote-part, investissement total, et mois où l'entreprise l'a récupéré. |
| **Donnée maison** | décomposition d'un cas à 30 véhicules, et l'écart entre bascule économique et bascule de trésorerie |
| **Liens** | pilier · S2 · article pilotage de charge · `/services-generaux` · simulateur |
| **Sources** | Service-Public Entreprendre (obligations d'équipement) · ADEME |

### S5 — TCO d'un utilitaire électrique ⚠️ *sujet sensible, lire la section 6*

| | |
|---|---|
| **H1** | TCO d'un utilitaire électrique : à partir de quel kilométrage est-il rentable ? |
| **Slug** | `/blog/tco-utilitaire-electrique` |
| **Mot-clé** | TCO utilitaire électrique |
| **Secondaires** | VUL électrique entreprise, suramortissement utilitaire électrique, rentabilité fourgon électrique |
| **Angle** | Le cas contre-intuitif. Un **VUL classique**, non assimilé fiscalement à un véhicule de tourisme, échappe généralement aux taxes annuelles et au malus — l'électrique y perd donc ses deux principaux avantages fiscaux. Attention : certains N1 sont requalifiés selon leur carrosserie et leur configuration de sièges. Le suramortissement de l'article 39 decies A **peut réduire, voire inverser** l'écart, selon le PTAC (rubrique F.2), le surcoût par rapport à un équivalent thermique et le mode de financement — il ne bénéficie pas automatiquement au locataire. Le seuil se joue au kilo : citer la source officielle immédiatement à côté du chiffre. |
| **Donnée maison** | notre seuil de bascule kilométrique calculé, et l'effet chiffré du suramortissement |
| **Liens** | pilier · S3 · nœud fiscalité · simulateur |
| **Sources** | Légifrance ou BOFiP (art. 39 decies A) |

---

## 5. Comment on passe devant

Les incumbents sont généralistes. Quatre leviers concrets, par ordre d'efficacité :

**1. De la donnée de première main.** Nous avons un moteur calibré, 160 tests, des barèmes
officiels au gramme près. Les autres recopient des ordres de grandeur. Chaque article doit porter
**au moins un chiffre issu de notre simulateur**, présenté comme tel : « sur un cas de 30
compactes à 25 000 km/an, notre calcul donne… ». L'actif n'est pas le chiffre lui-même — un
concurrent pourrait l'approcher — mais **des résultats propriétaires, produits par une méthode
documentée, des hypothèses affichées et un moteur testable**.

**2. L'angle que personne ne prend.** L'infrastructure dans le TCO, l'écart entre coût économique
et trésorerie, les cas où l'électrique perd. Publier un résultat défavorable est
contre-intuitif mais c'est ce qui fait qu'un directeur financier vous croit sur le reste.

**3. Répondre plus complètement.** Là où un concurrent donne un prix du kWh, on donne le prix, le
mix, l'effet sur le coût complet, et le seuil à partir duquel ça bascule. Même requête, réponse
qui clôt le sujet.

**4. Le maillage et la fraîcheur.** Un maillage contextualisé aide Google à découvrir les pages,
à comprendre leurs relations et à repérer les ressources importantes du site. Et les barèmes
fiscaux changent chaque année : une page datée et tenue à jour vaut mieux qu'une page de 2024.

---

## 6. ⚠️ Un point à trancher avant d'écrire S5

L'**étude TCO Scope 2026 d'Arval**, largement reprise, conclut que les utilitaires électriques
sont désormais **moins chers** que les diesel : 29 084 € contre 31 888 €, avec une bascule entre
25 000 et 30 000 km/an.

**Notre simulateur conclut l'inverse** sur ce segment.

**Les deux résultats ne sont pas directement comparables**, et c'est le cœur du sujet. Arval
publie un TCO moyen après impôt, pondéré sur une sélection de 20 modèles d'utilitaires, sur
48 mois et 100 000 km. Nous affichons plusieurs lectures — un TCO opérationnel avant impôt, un
bloc fiscal séparé, une trésorerie distincte — et nous n'attribuons pas le suramortissement au
client en location longue durée. Périmètres, véhicules, financements et traitement fiscal
diffèrent.

**Notre résultat ne contredit donc pas nécessairement Arval.** L'article devra reconstruire les
deux méthodes avant de comparer les conclusions, dans cet ordre :

1. reproduire un cas proche de la méthodologie Arval (48 mois, 100 000 km) ;
2. comparer prix, consommations, valeurs résiduelles et kilométrages retenus ;
3. afficher notre résultat opérationnel ;
4. y ajouter l'impact fiscal admissible ;
5. expliquer l'écart qui subsiste.

Tant que ce rapprochement n'est pas fait, **S5 reste en attente**. Bien traité, c'est le meilleur
article du cocon : personne n'explique cet écart.

---

## 7. Renvois vers le simulateur (déjà en place)

Le simulateur doit recevoir des liens depuis les pages qui traitent le sujet, avec une ancre qui
formule le besoin du lecteur plutôt qu'un « cliquez ici ».

| Depuis | Ancre posée |
|---|---|
| `/blog/fiscalite-vehicule-electrique-2026` *(publié)* | « Calculez le TCO de votre flotte électrique → », après les quatre leviers fiscaux |
| `/blog/tco-vehicule-electrique-entreprise` *(pilier)* | encart « Passer au calcul », après la première section |
| chaque satellite à venir | au moins un renvoi, formulé selon le sujet de l'article |

**À faire quand le simulateur passera de « Prochainement » à disponible** : ajouter un renvoi
depuis `/daf`, `/dirigeants` et `/services-generaux`, qui sont les pages persona concernées.

---

## 8. Maillage

- Chaque satellite pointe vers le **pilier** et vers **un ou deux satellites voisins**.
- Le pilier pointe vers les cinq satellites une fois écrits.
- Chaque article renvoie vers le **simulateur** : c'est lui le point de conversion.
- Parcours visé : **article → simulateur → rapport ou audit**. Un lien `/contact` peut clore
  l'article sans remplacer l'appel vers le simulateur.
- On relie vers un autre cocon quand la page répond à la question suivante du lecteur.
- Ancres descriptives, jamais « cliquez ici ».

---

## 9. Sources externes

Citer **toutes les sources nécessaires** aux affirmations fiscales, financières et techniques, en
privilégiant les sources primaires. Ce qui compte : leur qualité, leur placement sur l'affirmation
concernée, et l'absence de chiffre non sourcé.

> `REDACTION-ARTICLES.md` §5 fixe aujourd'hui **2 à 4 liens externes maximum**. Cette limite n'a
> pas de fondement mesurable et, sur des sujets fiscaux, un sourcing dense renforce la
> crédibilité. **Modifier la méthode est votre décision** — dites-le-moi et je mets le fichier
> à jour.

Domaines : `entreprendre.service-public.gouv.fr`, `bofip.impots.gouv.fr`, `impots.gouv.fr`,
`urssaf.fr`, `legifrance.gouv.fr`, `ecologie.gouv.fr`, `ademe.fr`.

---

## 10. Ordre de rédaction

**Avant toute production** : lever le `noindex` sur `/blog`, vérifier l'entrée au sitemap, et
contrôler dans la Search Console que le contenu et les liens apparaissent dans le HTML rendu. Un
article parfait sur une page désindexée ne rapporte rien.

1. **Pilier** — le réviser : nouveau H1, liens descendants
2. **S2** — coût de recharge *(terrain le plus disputé, mais notre angle est le plus fort)*
3. **S4** — coût des bornes
4. **S3** — financement
5. **S5** — utilitaire électrique *(après arbitrage de la section 6)*
6. **S1** — valeur résiduelle, une fois les données obtenues

*Aucune affirmation de volume de recherche : nous n'avons pas d'outil pour le mesurer. L'ordre
repose sur l'intention commerciale et sur la solidité de notre angle.*

---

*Informations fiscales vérifiées le 4 août 2026. Chaque barème est daté individuellement dans les
articles et reste susceptible d'évoluer en cours d'année — une date réelle de vérification est
plus transparente qu'une date fixe au 1ᵉʳ janvier.*
