# Spécification — Simulateur de TCO flotte électrique (recharge & infra incluses)

> **Statut : PROJET DE SPÉCIFICATION — à vérifier avant tout développement.**
> **Version 4.0 — juillet 2026.** Rédigée après recherche web (méthodologie TCO, barèmes fiscaux
> officiels, benchmark de 14 simulateurs existants, données de coûts marché), puis corrigée au fil
> de trois relectures croisées.
> **Structure du moteur figée — développement en cours.** La section 15 liste les valeurs par
> défaut restant à confirmer : elles sont toutes configurables et marquées provisoires.

### Ce qui a changé en v4

| # | Correction | Gravité |
|---|---|---|
| 1 | **Coût du capital corrigé** : `Prix × taux × D/2` supposait un capital tombant à zéro, alors qu'il reste la valeur résiduelle. Calculé mensuellement sur le capital réellement immobilisé | Erreur de calcul |
| 2 | **Le surloyer initial ne s'ajoute plus à une mensualité pleine** : deux champs distincts (loyer régulier, surloyer supplémentaire) | Erreur de calcul |
| 3 | **La courbe économique dépend du financement** — elle était écrite comme si tout était acheté | Méthodologie |
| 4 | **Bascules sécurisées** : première bascule *durable* jusqu'à la fin (le coût peut repasser au-dessus à la revente), vérification du changement de signe avant dichotomie, et « bascule non atteinte » assumé | Robustesse |
| 5 | **« Quote-part économique de l'infrastructure comprise »** au lieu de « infrastructure comprise », avec l'investissement total à décaisser affiché juste à côté | Honnêteté |
| 6 | Derniers libellés hérités nettoyés ; statuts fiscaux du §8.6 passés à « confirmé » | Cohérence |

### Ce qui avait changé en v3

| # | Correction | Gravité |
|---|---|---|
| 1 | **Doublons supprimés** : les sections 7.7 et 7.8 apparaissaient deux fois, dont une version périmée à deux bascules | Erreur d'édition |
| 2 | **L'impact fiscal comptait deux fois la non-déductibilité** : l'économie d'IS ne portant que sur la part déductible, retrancher en plus un « coût de l'amortissement non déductible » pénalisait le véhicule deux fois | Erreur de calcul |
| 3 | **Fraction de loyer non déductible ajoutée** (LLD, LOA, crédit-bail) — sans elle, la location paraît artificiellement plus avantageuse que l'achat | Omission fiscale |
| 4 | **TVA non récupérable étendue aux loyers** de véhicules de tourisme, pas seulement à l'achat | Omission fiscale |
| 5 | **Calcul mensuel** puis agrégé par année — une mise en service en cours d'année ne traverse pas des années pleines | Erreur de calcul |
| 6 | **Catégorie fiscale distincte de la catégorie commerciale** — un utilitaire ne reçoit pas mécaniquement les taxes d'un véhicule de tourisme | Omission fiscale |
| 7 | **Courbes économique et de trésorerie définies formule par formule**, sinon les deux bascules seraient identiques | Rigueur |
| 8 | **Deux tableaux de résultats** au lieu d'un, pour que la séparation opérationnel/fiscal se voie | Lisibilité |
| 9 | **Empreinte de fabrication rendue symétrique** — ne charger que la batterie était biaisé | Rigueur |
| 10 | Consentement commercial **séparé** de l'envoi du rapport, décoché par défaut | Conformité |
| 11 | Libellés v1 restants mis à jour (4 modes de financement, AC 11 kW, scénarios, trois bascules, datation par millésime) | Cohérence |

Cinq points supplémentaires de la checklist sont **résolus** (hybrides, taxe CO₂, malus CO₂, TVA
carburant, et la structure du barème par millésime) — voir §15.

### Ce qui avait changé en v2

Corrections issues de la première relecture croisée, toutes vérifiées :

| # | Correction | Gravité |
|---|---|---|
| 1 | **La valeur résiduelle était soustraite deux fois** (dans la dépréciation *et* dans le TCO général) | Erreur de calcul |
| 2 | **TCO économique et trésorerie séparés** — le point de bascule de trésorerie porte l'infrastructure entière au mois 0 | Méthodologie |
| 3 | **Quatre modes de financement distincts** (achat / crédit / LLD / LOA), plus la neutralisation des services inclus dans un loyer LLD | Méthodologie |
| 4 | **Impôt sur les sociétés isolé** dans un bloc « impact fiscal », au lieu d'être appliqué au seul amortissement non déductible | Cohérence |
| 5 | **Calcul année par année** avec configuration fiscale par millésime — les barèmes changent en cours de contrat | Erreur de calcul |
| 6 | **TVA non récupérable sur l'achat d'un VP** rendue explicite (≈ 20 % du prix, plus gros poste fiscal) | Omission |
| 7 | Trois **scénarios de sensibilité** au lieu d'une « fourchette », faisant varier aussi le coût d'infrastructure | Rigueur |
| 8 | **Taxe incitative** : plus aucun montant affiché sans les données de renouvellement de flotte | Risque |
| 9 | Champs essentiels **obligatoires**, plus de substitution silencieuse | Ergonomie |
| 10 | Deux modes de saisie, **profils de recharge**, ratio véhicules/point variable, ajout de l'**AC 11 kW** | Ergonomie |

Quatre points de la checklist bloquante ont par ailleurs été **résolus** (voir §15).

---

## 0. Résumé exécutif

Un simulateur qui calcule le **coût total de possession d'une flotte électrifiée sur 3 à 5 ans,
infrastructure de recharge comprise**, et le compare au coût de la même flotte restée thermique.

Il répond à la question que se pose réellement un DAF : *« Si j'électrifie 30 véhicules, combien
ça me coûte vraiment — bornes, raccordement et énergie compris — et à partir de quand je suis
gagnant ? »*

**Ce qui le distingue** : tous les simulateurs de TCO existants raisonnent **par véhicule** et
**ignorent l'infrastructure**. Or c'est précisément le poste qui surprend les entreprises et qui
relève du métier d'OTONOM. C'est notre angle, et il n'est occupé par personne (voir §1).

---

## 1. Positionnement et différenciateur

### Ce qu'a révélé le benchmark

14 outils passés en revue (loueurs, spécialistes recharge, télématique, calculateurs
internationaux). Constats :

| Constat | Conséquence pour nous |
|---|---|
| Le simulateur TCO le plus cité de la presse pro (Athlon) est **hors ligne** | Place vacante |
| Ni Arval ni Ayvens n'exposent de calculateur public (seulement un PDF annuel) | Place vacante |
| **Aucun outil français n'intègre le coût de l'infrastructure de recharge** dans le TCO | **Notre angle** |
| Aucun n'affiche de fourchette d'incertitude — un chiffre unique, faussement précis | Occasion de crédibilité |
| Le coût au kilomètre est rarement affiché | À intégrer |
| Le meilleur en ergonomie (ICCT) montre un **point de bascule kilométrique** | À reprendre |
| Le meilleur français (Mobelis) affiche **sa méthode et ses limites** | À reprendre |
| Le bon schéma de capture : **résultat gratuit d'abord**, email pour le livrable détaillé | À reprendre |

### Notre promesse

> Le seul simulateur qui chiffre le coût réel d'une flotte électrique **bornes et raccordement
> compris** — et qui vous dit à partir de quand vous êtes gagnant.

### Ce que le simulateur n'est PAS

- Pas un outil d'ingénierie électrique (il ne dimensionne pas une installation).
- Pas un comparateur de modèles de véhicules (on raisonne par **catégorie**, pas par modèle —
  c'est ce que font tous les outils B2B sérieux).
- Pas un devis. Il produit des **ordres de grandeur** destinés à déclencher un audit.

---

## 2. Nom, URL, place dans le site

| Élément | Valeur proposée |
|---|---|
| Nom affiché | **Simulateur de TCO flotte électrique** |
| Sous-titre / promesse | Recharge et infrastructure comprises |
| URL | `/simulateur-tco` |
| Clé technique du formulaire | `tco-flotte` (nouvelle ligne dans `form_settings`) |
| Titre SEO | Simulateur de TCO flotte électrique — OTONOM \| Recharge & infra comprises |
| Indexation | **À décider** (voir §16). Par défaut : désindexé comme l'autre simulateur. |

**Cohabitation avec l'existant** : le *Simulateur de transition* reste le diagnostic large
(mobilité + recharge + énergie, 10 leviers, score de maturité). Le *Simulateur de TCO flotte
électrique* est l'outil profond sur une seule question : le coût. Les deux se renvoient l'un à
l'autre.

---

## 3. À qui il s'adresse

| Persona | Ce qu'il vient chercher | Ce qu'on lui montre en premier |
|---|---|---|
| **DAF** (cible n°1) | Le coût complet, le ROI, l'impact trésorerie | Écart de TCO en € et en % |
| **Dirigeant** | Est-ce que je perds ou je gagne, et quand | Le point de bascule |
| **Services généraux** | Ce que coûte vraiment l'infrastructure | La part infra du TCO |
| **DRH** | (secondaire) l'effet avantage en nature | Renvoi vers le simulateur de transition |

---

## 4. Périmètre V1

### Inclus

- Flotte de véhicules légers : **VP** (citadine, compacte, berline/SUV) et **VUL**.
- Comparaison **électrique vs thermique** sur un périmètre strictement identique.
- 4 modes de financement : **achat comptant**, **crédit**, **LLD**, **LOA**.
- Durées : **36, 48, 60 mois**.
- **Infrastructure de recharge** : points de charge, génie civil, raccordement, supervision, EMS.
- **Mix de recharge** : sur site (HP/HC), domicile, public AC, public DC.
- Fiscalité : taxes annuelles, malus, amortissement non déductible, TVA, avantage en nature,
  taxe incitative, suramortissement.
- CO₂ évité.

### Exclu de la V1 (à assumer explicitement)

- Poids lourds et bus (fiscalité et infrastructure très différentes).
- Vélos, deux-roues, mobilités douces.
- Le rétrofit.
- La photovoltaïque et le stockage (déjà couverts par le simulateur de transition).
- Le coût conducteur (sinistralité, style de conduite) — non mesurable en saisie déclarative.
- Une base de données modèle par modèle.

---

## 5. Parcours utilisateur

Principe directeur issu du benchmark : **complexité en escalier**. On demande peu, on pré-remplit
tout, et on laisse ouvrir le capot à qui le veut.

```
┌─ ÉCRAN 1 ─ Le strict nécessaire (6 champs, tous pré-remplis)
│    → bouton « Calculer mon TCO »
│
├─ ÉCRAN 2 ─ Résultats GRATUITS et complets
│    → chiffre principal, comparaison, décomposition, point de bascule, graphiques
│    → chaque hypothèse est affichée et MODIFIABLE (panneaux dépliables)
│    → recalcul instantané à chaque modification
│
└─ ÉCRAN 3 ─ Livrable (gate email)
     → rapport détaillé imprimable + échéancier de trésorerie + hypothèses complètes
     → ou prise de rendez-vous pour un audit
```

**Règle absolue** : l'email n'est **jamais** demandé pour voir le résultat. Il l'est pour repartir
avec le document. C'est le schéma qui fonctionne chez les meilleurs, et c'est ce que fait déjà le
simulateur de transition.

---

## 6. Les entrées

### 6.1 Écran 1 — le strict nécessaire

**Deux modes de saisie**, choisis dès le départ :

| Mode | Principe |
|---|---|
| **Estimation rapide** | OTONOM applique ses valeurs de marché par catégorie de véhicule |
| **Avec mes données** | L'entreprise saisit ses prix d'achat ou ses loyers réels, thermique et électrique |

Ce choix est important : **l'écart de prix (ou de loyer) entre les deux motorisations est l'un des
tout premiers déterminants du TCO**. Le laisser entièrement à une valeur par défaut affaiblirait le
résultat, mais l'imposer en première question ferait fuir. Les deux modes règlent la tension.

| # | Champ | Type | Défaut | Notes |
|---|---|---|---|---|
| 1 | Nombre de véhicules à électrifier | nombre, 1–2000 | *obligatoire* | |
| 2 | Type de véhicules dominant | choix | *obligatoire* | citadine / compacte / berline-SUV / VUL |
| 3 | Kilométrage annuel moyen par véhicule | nombre, 5 000–80 000 | *obligatoire* | |
| 4 | Durée de détention | choix | 48 mois | 36 / 48 / 60 |
| 5 | Mode de financement | choix | LLD | achat / crédit / LLD / LOA |
| 6 | Profil de recharge | choix | Retour au dépôt | voir §6.2 B |
| 7 | Prix ou loyer, thermique et électrique | nombre | valeurs marché | **uniquement en mode « avec mes données »** |

**Profils de recharge** (remplacent la question trop vague « où rechargeront-ils ? ») — chaque
profil pilote une fenêtre de recharge, un nombre de véhicules par point, une puissance et un mix
énergétique :

- retour au dépôt chaque nuit
- stationnement sur site en journée
- recharge majoritairement au domicile
- flotte itinérante, recharge publique
- organisation mixte

Ces champs suffisent à produire un résultat complet. **Tout le reste est pré-rempli**, affiché et
modifiable à l'écran 2.

### 6.2 Écran 2 — hypothèses dépliables

Regroupées en 5 panneaux, repliés par défaut. Chaque champ affiche sa valeur par défaut et sa
provenance.

**A — La flotte**
- Répartition par catégorie (si flotte mixte) : % citadine / compacte / berline-SUV / VUL
- Prix d'acquisition moyen (TTC si véhicule de tourisme, HT si utilitaire)
- Ou, en location : **loyer mensuel régulier** + **surloyer initial** + ce que le loyer comprend
- Motorisation thermique de référence : gazole / essence
- Consommation thermique réelle (L/100 km)
- Consommation électrique réelle (kWh/100 km)
- Émissions CO₂ du thermique (g/km) — pilote les taxes et le malus
- Masse du véhicule (kg) — pilote le malus au poids

**B — La recharge** *(le cœur du différenciateur)*
- Répartition des recharges en % : **sur site HC / sur site HP / domicile / public AC / public DC**
  (doit totaliser 100 %)
- Prix de l'électricité sur site, heures creuses et heures pleines (€/kWh)
- Tarif de remboursement de la recharge à domicile (€/kWh)
- Prix moyen de la recharge publique AC et DC (€/kWh)
- Pertes de charge (%) — **poste que presque aucun simulateur ne modélise**

**C — L'infrastructure** *(le cœur du différenciateur)*
- Nombre de sites à équiper
- Nombre de points de charge : AC 7 kW / AC 11 kW / AC 22 kW / DC
- Complexité du génie civil : simple / moyenne / complexe
- Renforcement du raccordement nécessaire ? oui / non / **évité par le pilotage**
- Pilotage de charge (EMS) : oui / non
- Durée d'amortissement de l'infrastructure (défaut **8 ans**)
- Aides mobilisables sur l'infrastructure (€) — **à 0 par défaut, voir §15**

**D — Les coûts d'usage**
- Entretien annuel thermique / électrique (€/véhicule/an)
- Pneumatiques (€/véhicule/an, avec surcoût électrique)
- Assurance (€/véhicule/an, avec surcoût électrique)
- Valeur résiduelle en % du prix neuf, thermique et électrique
- Frais de gestion administrative (€/véhicule/an)

**E — L'entreprise et la fiscalité**
- Taille totale de la flotte (déclenche la taxe incitative au-delà de 100)
- Taux d'impôt sur les sociétés (défaut 25 %)
- Part de véhicules de fonction (déclenche l'avantage en nature)
- Taux de charges patronales (défaut 45 %)
- Assujetti à la TVA : oui / non

### 6.3 Règles de validation

- **Trois champs sont obligatoires** : nombre de véhicules, catégorie, kilométrage. On ne substitue
  **jamais** silencieusement une valeur par défaut à un champ essentiel laissé vide — un utilisateur
  croirait avoir calculé sa flotte alors que le moteur aurait tourné sur 20 véhicules fictifs.
- Tous les autres champs sont **pré-remplis et visibles** : l'utilisateur voit toujours la valeur
  employée. S'il en efface une, on la restaure en le signalant, on ne la remplace pas en silence.
- Les pourcentages de mix de recharge sont normalisés à 100 % automatiquement, avec un message.
- Bornes min/max sur chaque champ numérique, avec écrêtage doux.
- Un avertissement (non bloquant) si une saisie sort du plausible : par exemple moins de
  1 point de charge pour 4 véhicules rechargeant sur site.

---

## 7. Le moteur de calcul

### Conventions de calcul

**1. Le calcul est MENSUEL, agrégé ensuite par année.** C'est la seule architecture correcte : une
mise en service en cours d'année ne traverse pas des années pleines. Une simulation démarrant en
juillet 2026 sur 48 mois couvre 6 mois de 2026, 12 mois de 2027, 2028 et 2029, puis 6 mois de 2030
— cinq millésimes, mais **quatre années de coûts**. Compter cinq années pleines de taxes et
d'entretien serait une erreur de 25 %.

```
Pour chaque mois m de la simulation :
    1. déterminer le millésime fiscal du mois
    2. appliquer les barèmes de ce millésime
    3. proratiser les postes annuels (taxes, assurance, entretien) sur le mois
Puis agréger par année pour l'affichage.
```

Cette granularité sert aussi les courbes cumulées, les trois bascules, les changements de prix en
cours de contrat, les échéanciers de financement et les mises en service progressives.

La configuration fiscale est structurée **par millésime** :
```
TAX_CONFIG = { 2026: {…}, 2027: {…}, 2028: {…}, 2029: {…}, 2030: {…} }
```
La **date prévisionnelle de mise en service** est un paramètre (défaut : mois en cours). Un projet
démarrant en 2026 et le même en 2027 ne donnent pas le même résultat.

⚠️ Le barème de la **taxe annuelle CO₂** change chaque année jusqu'en 2027 (seuil abaissé, tarifs
marginaux relevés) : il doit impérativement être stocké par millésime, pas une fois pour toutes.

**2. Catégorie commerciale ≠ catégorie fiscale.** Le choix « citadine / compacte / berline-SUV /
VUL » sert à l'ergonomie ; il ne suffit pas à appliquer la fiscalité. Les taxes annuelles ne visent
que les **véhicules de tourisme taxables** — un utilitaire à deux places n'y est pas soumis, et
recevrait mécaniquement des taxes qu'il ne paie pas.

Chaque catégorie porte donc une propriété technique distincte :
```
fiscalCategory : 'tourisme' | 'utilitaire' | 'special'
```
qui pilote : l'application des taxes CO₂ et polluants, le champ du malus, la récupérabilité de la
TVA, et l'application du plafond d'amortissement.

**3. TVA.** Tous les calculs sont menés hors taxes, **et la TVA non récupérable est ajoutée comme
un coût**. Points critiques :
- La TVA sur l'**achat** d'un véhicule de tourisme n'est **pas récupérable**, quelle que soit la
  motorisation — environ 20 % du prix, le plus gros poste fiscal du modèle.
- La TVA sur la **location ou le crédit-bail** d'un véhicule de tourisme n'est **pas non plus
  récupérable** : un loyer de VP doit donc être porté en TTC, pas en HT.
- Sur un utilitaire, la TVA est récupérable dans les deux cas.

La saisie devient donc **« loyer mensuel facturé, hors services »**, accompagnée d'un indicateur
« TVA récupérable sur ce véhicule : oui / non », déduit automatiquement de `fiscalCategory` et
modifiable en paramètres avancés pour les cas particuliers.

**4. Impôt sur les sociétés.** Le chiffre affiché est un **TCO opérationnel avant impôt**. L'effet
fiscal est calculé et présenté **dans un bloc distinct** (§7.6), jamais fondu dans les postes
opérationnels. Appliquer l'IS à l'amortissement non déductible mais pas aux loyers, à l'entretien
ou à l'énergie produirait un chiffre incohérent, ni avant ni après impôt.

Notation : `N` = nombre de véhicules, `D` = durée en années, `K` = km/an/véhicule, `a` = année.

### 7.1 Structure générale

```
Coûts(a) = Détention(a) + Énergie(a) + Entretien(a) + Pneus(a) + Assurance(a)
         + Taxes(a) + Gestion(a) + Infrastructure(a)

TCO_opérationnel = Σ_a Coûts(a) − Valeur_Résiduelle_finale

Écart = TCO_thermique − TCO_électrique      (> 0 = l'électrique est gagnant)
```

> ⚠️ **La valeur résiduelle ne se soustrait qu'ICI, une seule fois.** Elle ne doit **jamais** être
> déduite à l'intérieur du poste Détention. Le poste Détention porte le **coût d'acquisition et de
> financement**, pas la dépréciation nette. Sans cette règle, la valeur résiduelle est comptée deux
> fois et le résultat est faussé de la valeur d'un parc entier.

Le scénario thermique porte une infrastructure nulle. C'est **volontaire et c'est le message** :
on montre honnêtement le surcoût d'infrastructure de l'électrique, et on prouve qu'il est absorbé.

### 7.2 Détention — quatre modes distincts

Les quatre modes ne partagent ni la même base ni les mêmes postes. Chacun a sa formule.

**Achat comptant**
```
Détention    = Prix_acquisition × N            (TTC si VP, HT si VUL)
VR_finale    = Prix_acquisition × taux_VR(motorisation, D) × N

Coût du capital, dans le moteur mensuel :
    Coût_capital(m) = Capital_encore_immobilisé(m) × taux_annuel / 12
    où Capital_encore_immobilisé décroît linéairement de Prix_acquisition vers VR_finale
```
> ⚠️ Ne pas écrire `Prix × taux × D / 2` : cette forme suppose que le capital immobilisé descend
> jusqu'à **zéro**, alors qu'il reste la valeur résiduelle. Le capital moyen est
> `(Prix_acquisition + VR_finale) / 2`, pas `Prix / 2`.

Le coût du capital est le poste que les entreprises payant comptant oublient systématiquement.
Il ne s'applique **qu'à l'achat comptant** et doit être **affiché séparément et désactivable**.

**Crédit**
```
Détention = (Apport + Σ_m Échéances(m)) × N
VR_finale = Prix_acquisition × taux_VR(motorisation, D) × N
```
Les intérêts sont déjà contenus dans les échéances : **ne pas les ajouter une seconde fois**, et ne
pas ajouter de coût du capital.

**LLD**
```
Détention = (Surloyer_initial + Loyer_mensuel × nb_mois + Frais_restitution_estimés) × N
VR_finale = 0        (le risque de revente est porté par le loueur — c'est la nature de la LLD)
```
> ⚠️ **Troisième piège de double comptage.** Le « premier loyer majoré » **remplace** le plus
> souvent la première mensualité, il ne s'y ajoute pas. On ne saisit donc pas « premier loyer + N
> mensualités » mais deux champs sans ambiguïté : le **loyer mensuel régulier** et le **surloyer
> initial supplémentaire** (0 par défaut).
> ⚠️ **Second risque de double comptage.** Un loyer LLD inclut fréquemment l'entretien, les
> pneumatiques, l'assistance, parfois l'assurance. Le formulaire doit demander **ce que le loyer
> comprend** (cases à cocher) et neutraliser les postes correspondants. Sans cette question, le TCO
> en LLD est surestimé de l'ordre de 15 à 25 %.

**LOA**
```
Détention = (Surloyer_initial + Loyer_mensuel × nb_mois) × N
Si l'option d'achat est exercée :
    Détention += Valeur_option × N
    VR_finale  = Prix_acquisition × taux_VR(motorisation, D) × N   (le véhicule devient un actif)
Sinon :
    VR_finale  = 0
```
Une LOA n'est pas représentable par « dépréciation + intérêts approximatifs » : elle se calcule
sur les loyers réellement payés, plus l'option si elle est levée.

**Valeur résiduelle**
```
VR = Prix_HT_net × taux_VR(motorisation, durée)
```
Poste le plus sensible du modèle : quelques points de VR déplacent le résultat final de façon
disproportionnée, puisqu'il se soustrait en bout de chaîne. D'où le traitement de l'incertitude
en §10.

### 7.3 Énergie — thermique

```
Litres_an          = K × conso_L_100 / 100
Coût_TTC(a)        = Litres_an × prix_L(a) × N
TVA_récupérable(a) = Coût_TTC(a) × (TVA/(1+TVA)) × taux_récup_carburant
Énergie_therm(a)   = Coût_TTC(a) − TVA_récupérable(a)
```
`taux_récup_carburant` : 80 % pour un VP, 100 % pour un VUL — règle confirmée, dérivée de
`fiscalCategory` (§15, point 9).

### 7.4 Énergie — électrique *(modèle de mix, différenciateur)*

```
kWh_batterie = K × conso_kWh_100 / 100
kWh_facturés = kWh_batterie × (1 + pertes_charge)

Coût_kWh_moyen = Σ  part_i × prix_i
   pour i ∈ { site_HC, site_HP, domicile, public_AC, public_DC }

Énergie_élec(a) = kWh_facturés × Coût_kWh_moyen(a) × N
TVA sur l'électricité : récupérable à 100 % → on raisonne directement en HT
```

Deux finesses que les autres simulateurs ratent :
1. **Les pertes de charge** (l'énergie facturée dépasse l'énergie stockée de 10 à 15 %).
2. **Le mix de recharge** : recharger 80 % sur site ou 80 % en DC public change le résultat du
   simple au double. C'est le premier levier d'optimisation d'OTONOM, il doit être visible.

### 7.5 Entretien, pneumatiques, assurance

```
Entretien(a) = coût_entretien(motorisation, âge_véhicule(a)) × N
Pneus(a)     = coût_pneus_km × K × N × (1 + surcoût_pneus_élec si électrique)
Assurance(a) = prime(motorisation) × N
```
L'électrique est **plus cher** en pneumatiques et en assurance. Le dire renforce la crédibilité
bien plus que de l'omettre.

Le coût d'entretien **croît avec l'âge du véhicule** : une courbe par année est plus juste qu'une
moyenne plate, et elle change le résultat sur les durées de 60 mois.

> ⚠️ En LLD, ces trois postes doivent être **neutralisés s'ils sont inclus dans le loyer**
> (voir §7.2).

### 7.6 Fiscalité — deux niveaux séparés

**Niveau A — les taxes réellement décaissées** (entrent dans le TCO opérationnel, calculées
année par année avec le barème du millésime) :

```
Taxes(a) = [taxe_CO2(g/km, a) + taxe_polluants(catégorie, a)] × N     (0 si 100 % électrique)
Malus_immatriculation = malus_CO2(g/km, a₀) + malus_poids(kg, a₀)     (une seule fois, à l'acquisition)
Charges_patronales_AEN(a) = AEN_retenu(a) × taux_charges × N_fonction
Taxe_incitative(a) = voir ci-dessous
```

**Niveau B — l'impact fiscal estimé** (bloc distinct, jamais fondu dans le TCO) :

```
Charges fiscalement déductibles(a) =
      loyers DÉDUCTIBLES (nets de la fraction non déductible, voir ci-dessous)
    + entretien + pneus + assurance + énergie + intérêts + taxes payées
    + amortissement DÉDUCTIBLE (plafonné selon les émissions)

Économie_IS(a)    = Charges fiscalement déductibles(a) × taux_IS
Impact_fiscal_net = Σ_a Économie_IS(a) + Avantage_suramortissement

TCO après impact fiscal = TCO opérationnel − Impact_fiscal_net
```

> ⚠️ **Ne jamais soustraire en plus un « coût de l'amortissement non déductible ».** Si l'économie
> d'impôt n'est calculée que sur la part déductible, la part non déductible est **déjà** exclue :
> la retrancher une seconde fois pénaliserait le véhicule deux fois. C'était l'erreur de la v2.

**À afficher séparément, à titre explicatif seulement** (jamais soustrait du résultat) :

```
Économie d'IS perdue à cause du plafond d'amortissement =
    Amortissement_théorique × part_non_déductible × taux_IS × N
    avec part_non_déductible = max(0, Prix_TTC − plafond(g/km)) / Prix_TTC
```
C'est un excellent argument commercial pour l'électrique — dont le plafond de 30 000 € est le plus
élevé — mais c'est une information, pas une ligne de coût.

**Fraction de loyer non déductible (LLD, LOA, crédit-bail)** — poste oublié en v2 :
```
Part_loyer_non_déductible(a) = Loyer_annuel × max(0, Prix_catalogue_TTC − plafond) / Prix_catalogue_TTC
```
La limitation liée au plafond d'amortissement ne concerne pas que les véhicules **achetés** : pour
une voiture particulière **louée ou en crédit-bail**, la fraction du loyer correspondant à la part
du prix dépassant le plafond n'est pas déductible non plus. Le bailleur est tenu de communiquer ce
montant ; à défaut, on l'estime à partir du prix catalogue. Sans ce poste, la LLD apparaît
artificiellement plus avantageuse que l'achat.

**Suramortissement** : applicable aux utilitaires électriques au-delà d'un tonnage, calculé sur le
**surcoût** par rapport à un équivalent thermique, et non sur le prix total (voir §15).

L'écran affiche donc : **TCO opérationnel**, puis **Impact fiscal estimé**, puis **TCO après
impact fiscal**. Trois chiffres lisibles, chacun défendable devant un expert-comptable.

**Avantage en nature** (module optionnel — ne concerne que les véhicules utilisables à titre privé,
donc il doit pouvoir être désactivé) :
```
AEN_brut  = base(mode_financement, âge_véhicule) × Prix_TTC
AEN_élec  = AEN_brut × (1 − abattement), l'abattement étant plafonné annuellement
Gain_AEN  = (AEN_thermique − AEN_élec) × taux_charges_patronales × N_fonction
```

**Taxe incitative** — la formule légale n'est **pas** calculable à partir de la seule taille de
flotte. Elle est le produit :
```
TAI(a) = tarif_unitaire(a) × écart_à_l'objectif(a) × taux_renouvellement_véhicules_très_émetteurs(a)
```
et dépend en outre de la durée annuelle d'affectation, des seuls véhicules récemment intégrés à la
flotte, de majorations selon la catégorie et l'empreinte environnementale, et des entrées/sorties
de parc en cours d'année.

**Décision** : la taxe incitative va dans un **panneau avancé**, activé seulement si l'utilisateur
déclare une flotte ≥ 100 véhicules, et demandant au minimum la taille de flotte taxable, le nombre
de véhicules à faibles émissions actuels, le nombre de thermiques renouvelés dans l'année et le
nombre d'électriques ajoutés. **Si ces données ne sont pas saisies, on n'affiche aucun montant** —
seulement : *« Votre entreprise peut être concernée par la taxe annuelle incitative. Son montant
exact nécessite vos données de renouvellement de flotte. »* Mieux vaut ne rien chiffrer qu'annoncer
un montant faux à un DAF.

### 7.7 Infrastructure *(le cœur)*

```
Invest_infra = Σ_type (nb_points_type × coût_point_type)
             + nb_sites × génie_civil(complexité)
             + renforcement_raccordement (0 si évité par le pilotage)
             + coût_EMS

Aides_infra  = 0 par défaut (voir §15), champ modifiable
Invest_net   = Invest_infra − Aides_infra

Quote-part imputée à la période analysée :
    Infra_économique = Invest_net × (D / durée_amortissement_infra)

Coûts récurrents :
    Récurrent(a) = supervision_par_point × nb_points
                 + maintenance_infra
                 + surcoût_abonnement_électrique

Infrastructure_économique = Infra_économique + Σ_a Récurrent(a)
```

**Le point méthodologique décisif** : on n'impute **pas** 100 % de l'infrastructure au premier
cycle de véhicules. Une borne dure 8 à 10 ans, les véhicules 4 ans. Imputer tout l'investissement
sur 4 ans est l'erreur qui fait conclure « l'électrique n'est pas rentable ».

### 7.8 Deux lectures à ne jamais confondre

C'est la distinction la plus importante de tout le modèle.

| | **TCO économique** | **Trésorerie réelle** |
|---|---|---|
| Infrastructure | quote-part `Invest × D / durée_amortissement` | **totalité décaissée au mois 0** |
| Sert à | comparer deux scénarios | savoir quand l'entreprise a récupéré son argent |
| Point de bascule | bascule économique | bascule de trésorerie, **généralement plus tardive** |

Annoncer une bascule à 25 mois sur la base de la quote-part, alors que l'entreprise n'a pas encore
récupéré les bornes réellement payées, serait trompeur — et un DAF le verrait immédiatement. Les
deux lectures sont affichées, distinctement nommées.

**Le deuxième cycle** se formule : *« TCO du cycle suivant, sans nouvel investissement
d'infrastructure »* — et non « infrastructure déjà amortie », qui serait comptablement faux au bout
de quatre ans sur un bien amorti en huit.

### 7.9 Point de bascule *(fonctionnalité clé, absente des outils français)*

Trois bascules — **et aucune n'est un simple premier croisement**.

```
Bascule kilométrique :
    1. vérifier qu'il existe un CHANGEMENT DE SIGNE de l'écart entre 5 000 et 80 000 km/an
    2. seulement alors, dichotomie sur K
    3. sinon → « pas de bascule dans la plage réaliste »

Bascule économique et bascule de trésorerie :
    le PREMIER mois à partir duquel le cumulé électrique reste inférieur au thermique
    JUSQU'À LA FIN de la période
```

> ⚠️ Le coût électrique peut passer sous le thermique **puis repasser au-dessus**, typiquement au
> moment de la revente (la valeur résiduelle du thermique est meilleure). Retenir le premier
> croisement afficherait une bascule qui ne tient pas. Le moteur balaie donc les mois **depuis la
> fin** et, s'il n'existe aucune bascule durable, affiche explicitement :
> **« Bascule non atteinte sur la période analysée »** — plutôt qu'un chiffre trompeur.

La bascule de trésorerie est **généralement** plus tardive que l'économique, mais ce n'est pas une
règle mathématique absolue : selon le financement et le poids de l'infrastructure, les deux peuvent
coïncider ou s'inverser.

**Définition des deux courbes cumulées** — c'est ce qui distingue vraiment les deux lectures :

```
Courbe ÉCONOMIQUE — la part « détention » DÉPEND DU FINANCEMENT :
    Achat          : dépréciation mensuelle + coût du capital du mois
    Crédit         : dépréciation mensuelle + intérêts du mois
    LLD            : coût total du contrat réparti sur sa durée,
                     APRÈS neutralisation des services inclus
    LOA sans option: surloyer + loyers répartis sur la durée
    LOA avec option: (surloyer + loyers + option − VR_finale) répartis sur la durée

    avec  Dépréciation_mensuelle = (Prix_acquisition − VR_estimée) / nb_mois
          Infra_mensuelle        = Invest_net / (durée_amortissement_infra × 12)

    Cumulé_éco(m) = Σ jusqu'à m (détention_éco + Infra_mens + coûts d'usage du mois)

Courbe de TRÉSORERIE (décaissements réels, mois m) :
    Mois 0     = Prix_acquisition (ou apport, ou surloyer + 1ᵉʳ loyer)
                 + TOTALITÉ de l'investissement infrastructure
    Mois > 0   = échéances + énergie + entretien + assurance + taxes du mois
    Mois final = − produit de revente encaissé   (les valeurs étant des coûts cumulés,
                                                  une recette se soustrait)
```

Sans cette distinction, la courbe économique ressemblerait à une courbe de trésorerie (tout le
prix au mois 0, la valeur résiduelle au dernier mois) et les deux bascules seraient identiques —
ce qui viderait la séparation de son sens.

Formulation en clair pour l'utilisateur : *« À partir de 14 000 km par an, votre flotte électrique
coûte moins cher que la même flotte thermique »* et *« Le surcoût initial est récupéré au bout de
31 mois »*.

### 7.10 CO₂

```
CO2_thermique  = Σ_a (Litres_an × facteur_carburant × N)
CO2_électrique = Σ_a (kWh_facturés × facteur_élec × N)
CO2_évité      = CO2_thermique − CO2_électrique
```
**Deux niveaux, symétriques.** Ajouter la seule empreinte de fabrication des batteries serait
méthodologiquement biaisé : cela chargerait l'électrique d'un poste de fabrication sans compter
celui du thermique. On affiche donc :

1. **Émissions d'usage** (formules ci-dessus) — la comparaison de base ;
2. **Estimation en cycle de vie**, en option, **uniquement si des données de fabrication
   comparables existent pour les deux motorisations**.

C'est l'objection n°1 qu'on nous opposera, autant y répondre nous-mêmes — mais honnêtement.
Affichage en tonnes, **jamais en vert**.

---

## 8. Les hypothèses par défaut

Toutes centralisées dans un objet unique `TCO_CONFIG`, daté, commenté, avec pour **chaque** valeur
une étiquette de nature et une source — comme le fait déjà `SIM_CONFIG`.

Étiquettes : `[BARÈME]` officiel · `[MARCHÉ]` ordre de grandeur · `[HYPOTHÈSE]` ratio de travail ·
`[À VÉRIFIER]` non confirmé.

### 8.1 Énergie

| Paramètre | Valeur proposée | Nature | Source |
|---|---|---|---|
| Gazole | 1,90 €/L TTC | `[MARCHÉ]` | relevés 2026 |
| Essence SP95-E10 | 1,90 €/L TTC | `[MARCHÉ]` | relevés 2026 |
| Électricité site, heures creuses | 0,158 €/kWh HT | `[MARCHÉ]` | tarif pro 2026 |
| Électricité site, heures pleines | 0,207 €/kWh HT | `[MARCHÉ]` | tarif pro 2026 |
| Remboursement domicile | 0,20 €/kWh | `[HYPOTHÈSE]` | pratique courante |
| Recharge publique AC | 0,40 €/kWh | `[MARCHÉ]` | fourchette 0,30–0,50 |
| Recharge publique DC | 0,58 €/kWh | `[MARCHÉ]` | fourchette 0,50–0,65 |
| Pertes de charge | 12 % | `[HYPOTHÈSE]` | écart batterie/compteur |

### 8.2 Consommations

| Catégorie | Thermique | Électrique | Nature |
|---|---|---|---|
| Citadine | 5,0 L/100 | 15,0 kWh/100 | `[MARCHÉ]` |
| Compacte | 5,5 L/100 | 17,0 kWh/100 | `[MARCHÉ]` |
| Berline / SUV | 6,5 L/100 | 20,0 kWh/100 | `[MARCHÉ]` |
| VUL | 7,0 L/100 | 22,0 kWh/100 | `[MARCHÉ]` `[À VÉRIFIER]` |

Consommations **réelles**, pas WLTP (l'écart constaté est de +15 à +25 %). Ce choix doit être
écrit à l'écran : c'est un gage de sérieux.

### 8.3 Coûts d'usage

| Paramètre | Thermique | Électrique | Nature |
|---|---|---|---|
| Entretien | 750 €/an | 380 €/an | `[MARCHÉ]` — écart ≈ −50 %, fourchettes larges |
| Pneumatiques | 0,015 €/km | 0,022 €/km | `[MARCHÉ]` — usure accrue sur électrique |
| Assurance | 720 €/an | 810 €/an | `[MARCHÉ]` — surcoût ≈ +12 % |
| Gestion administrative | 150 €/an | 150 €/an | `[HYPOTHÈSE]` |

### 8.4 Valeurs résiduelles (% du prix neuf HT)

| Durée | Thermique | Électrique | Nature |
|---|---|---|---|
| 36 mois | 50 % | 40 % | `[À VÉRIFIER]` |
| 48 mois | 42 % | 33 % | `[À VÉRIFIER]` |
| 60 mois | 34 % | 26 % | `[À VÉRIFIER]` |

**Poste le plus fragile et le plus déterminant du modèle.** Les recherches ne donnent pas de
série fiable à 36/48/60 mois. À faire valider par un loueur ou un professionnel de la revente
avant mise en production. En attendant : afficher les scénarios de sensibilité (§10).

### 8.5 Infrastructure

| Paramètre | Valeur | Nature |
|---|---|---|
| Point AC 7 kW | 1 400 € HT | `[MARCHÉ]` |
| Point AC 11 kW | 2 000 € HT | `[MARCHÉ]` |
| Point AC 22 kW | 2 800 € HT | `[MARCHÉ]` |
| Point DC 50 kW | 28 000 € HT | `[MARCHÉ]` — fourchette très large |
| Génie civil, complexité simple | 2 000 € HT / site | `[MARCHÉ]` |
| Génie civil, moyenne | 6 000 € HT / site | `[MARCHÉ]` |
| Génie civil, complexe | 15 000 € HT / site | `[MARCHÉ]` |
| Renforcement de raccordement | 12 000 € HT / site | `[HYPOTHÈSE]` |
| Pilotage EMS | 3 500 € HT / site | `[MARCHÉ]` |
| Supervision | 120 € HT / point / an | `[MARCHÉ]` |
| Maintenance infrastructure | 3 % de l'investissement / an | `[HYPOTHÈSE]` |
| Durée d'amortissement | 8 ans | `[HYPOTHÈSE]` |
| Ratio véhicules par point de charge | **dérivé du profil de recharge** | `[HYPOTHÈSE]` |

Le ratio de véhicules par point ne peut pas être une constante. Une flotte qui stationne douze
heures au dépôt avec pilotage de charge partage un point entre bien plus de véhicules qu'une flotte
en rotation. Le ratio est donc déduit du profil de recharge (§6.1), et reste modifiable :

| Profil | Ratio par défaut |
|---|---|
| Retour au dépôt chaque nuit, avec pilotage | 3,0 |
| Retour au dépôt, sans pilotage | 1,5 |
| Stationnement sur site en journée | 2,0 |
| Recharge majoritairement au domicile | 6,0 (points de site résiduels) |
| Flotte itinérante | 8,0 |

**Note technique** : une borne 22 kW ne garantit pas une recharge à 22 kW — la majorité des
véhicules plafonnent leur chargeur embarqué en courant alternatif à 7,4 ou 11 kW. Surdimensionner
en AC 22 kW est un gaspillage fréquent, d'où l'ajout de la catégorie 11 kW.

### 8.6 Fiscalité

| Paramètre | Valeur | Nature | Statut |
|---|---|---|---|
| Taxe polluants — électrique | 0 € | `[BARÈME]` | confirmé |
| Taxe polluants — thermique essence Euro 5/6 (hybride inclus) | 130 €/an | `[BARÈME]` | confirmé (§15.7) |
| Taxe polluants — diesel / non classé | 650 €/an (2026) | `[BARÈME]` | confirmé |
| Taxe CO₂ — barème par tranches WLTP | **par millésime** | `[BARÈME]` | structure confirmée, valeurs à saisir (§15.10) |
| Malus CO₂ — seuil de déclenchement | 108 g/km | `[BARÈME]` | confirmé |
| Malus CO₂ — plafond | 80 000 € | `[BARÈME]` | confirmé |
| Malus poids — seuil (thermique) | 1 500 kg ; **0 € si 100 % électrique** | `[BARÈME]` | confirmé (§15.2) |
| Amortissement — plafonds (WLTP) | 30 000 / 20 300 / 18 300 / 9 900 € | `[BARÈME]` | confirmé (§15.1) |
| TVA récupérable — électricité | 100 % | `[BARÈME]` | confirmé |
| TVA récupérable — carburant VP | 80 % | `[BARÈME]` | confirmé |
| AEN — abattement électrique forfaitaire | 70 %, plafond 4 641,60 €/an | `[BARÈME]` | confirmé (jusqu'au 31/12/2027) |
| AEN — base forfaitaire achat < 5 ans | 15 % du prix | `[BARÈME]` | confirmé |
| AEN — base forfaitaire en location | 50 % du coût global | `[BARÈME]` | confirmé |
| Taxe incitative — seuil de flotte | 100 véhicules | `[BARÈME]` | confirmé |
| Taxe incitative — quota 2026 | 18 % | `[BARÈME]` | confirmé |
| Taxe incitative — tarif unitaire 2026 | 4 000 € | `[BARÈME]` | confirmé ; formule §15.11 |
| Taux d'IS | 25 % | `[HYPOTHÈSE]` | |
| Charges patronales | 45 % | `[HYPOTHÈSE]` | |
| Taux d'actualisation du capital | 5 % | `[HYPOTHÈSE]` | |

### 8.7 CO₂

| Paramètre | Valeur | Source |
|---|---|---|
| Gazole | 3,07 kg CO₂e/L | ADEME, avec amont |
| Essence | 2,79 kg CO₂e/L | ADEME, avec amont |
| Électricité, mix France | 0,056 kg CO₂e/kWh | RTE / ADEME — varie fortement en pointe hivernale |
| Fabrication batterie | 40 kg CO₂e/kWh de capacité | fourchette 15 (LFP) à 55 (NMC) |

---

## 9. Les sorties

### 9.1 Bandeau principal — le chiffre qui frappe

Un seul chiffre dominant, en très grand, chiffres mono tabulaires :

> **Votre flotte électrique coûte 187 000 € de moins sur 4 ans**
> soit −14 % de TCO, **quote-part économique de l'infrastructure comprise**
>
> *Investissement total à décaisser : 84 000 €*

Et immédiatement en dessous, les **scénarios de sensibilité** (§10) et la mention « estimation
indicative ».

Si le résultat est défavorable, on l'affiche tel quel, sans euphémisme, avec le levier
d'amélioration principal identifié. **La crédibilité vaut plus qu'un faux résultat positif** — et
un TCO défavorable est un excellent motif d'audit.

### 9.2 Les indicateurs clés

| Indicateur | Forme |
|---|---|
| TCO opérationnel électrique / thermique | € sur la période |
| Écart | € et % |
| TCO par véhicule et par mois | € |
| Coût au kilomètre (PRK) | €/km, les deux scénarios |
| **Part de l'infrastructure dans le TCO** | % et €/véhicule |
| Bascule kilométrique | km/an |
| **Bascule économique** | mois |
| **Bascule de trésorerie** | mois — généralement plus tardive, c'est celle que regarde un DAF |
| **TCO du cycle suivant**, sans nouvel investissement d'infrastructure | € — argument fort |
| CO₂ évité | tonnes sur la période |

### 9.3 La décomposition — deux tableaux, jamais un seul

La séparation opérationnel / fiscal doit se voir à l'écran, sinon elle ne sert à rien.

**Tableau 1 — TCO opérationnel** (trois colonnes : thermique / électrique / écart) :
acquisition ou loyers · énergie · entretien · pneumatiques · assurance · taxes effectivement
payées · malus · charges patronales sur l'avantage en nature · taxe incitative *(si calculable)* ·
gestion · **infrastructure** · valeur résiduelle.

**Tableau 2 — Impact fiscal et social estimé** :
économie d'impôt sur les sociétés · fraction non déductible des loyers · suramortissement ·
et, à titre explicatif seulement, l'économie d'impôt perdue à cause du plafond d'amortissement.

Les écarts favorables et défavorables se distinguent par le signe et la graisse — **jamais par la
couleur** (règle de marque).

### 9.4 Les visualisations

Deux graphiques SVG sobres, noir et blanc, tracés à la main (aucune bibliothèque) :

1. **Courbe de coût cumulé** — deux lignes (thermique pleine, électrique pointillée) sur la durée,
   avec le point d'intersection marqué. C'est la représentation la plus parlante du point de
   bascule.
2. **Barres horizontales comparatives** par poste, une paire par poste.

Ce ne sont pas des « jauges » ni un tableau de bord : ce sont des graphes de données, en filets
1px, sans remplissage coloré. **À valider par le patron** (voir §16) au regard de la règle
« pas de faux dashboard ».

### 9.5 L'échéancier de trésorerie

Un tableau année par année : investissement, économies, cumul. Il montre que l'année 1 est
négative (l'infrastructure) et que le cumul bascule ensuite. C'est ce que veut voir un DAF, et
aucun simulateur concurrent ne le propose.

---

## 10. Le traitement de l'incertitude

**Le vrai différenciateur de crédibilité.** Aucun outil concurrent ne le fait : tous affichent un
chiffre unique, faussement précis, sur des hypothèses fragiles.

**Vocabulaire** : on parle de **scénarios de sensibilité**, pas de « fourchette d'incertitude ».
Aucune probabilité n'est attribuée à ces valeurs — les présenter comme un intervalle statistique
serait abusif.

Trois scénarios, calculés en rejouant le modèle complet :

| Scénario | Hypothèses |
|---|---|
| **Favorable** | énergie thermique haute, bonne valeur résiduelle électrique, infrastructure simple, prix véhicules serré |
| **Central** | hypothèses OTONOM par défaut |
| **Prudent** | part de recharge publique plus forte, valeur résiduelle basse, travaux complexes, prix véhicules haut |

Les **quatre** paramètres à faire varier :

| Paramètre | Amplitude |
|---|---|
| Prix ou loyer des véhicules | ±10 % |
| Valeur résiduelle | ∓8 points |
| Prix et **mix** de l'énergie | ±20 % sur le prix, mix décalé vers le public |
| **Coût de l'infrastructure** | ±30 % |

Faire varier uniquement la valeur résiduelle et l'énergie serait incohérent alors que la promesse
centrale d'OTONOM porte précisément sur l'infrastructure.

Rendu :

> **Écart de TCO : 187 000 € (scénario central)**
> de 121 000 € en scénario prudent à 249 000 € en scénario favorable

Et un encart « Ce qui pourrait changer ce résultat » listant les 3 hypothèses les plus
déterminantes, avec leur poids. C'est honnête, c'est premium, et c'est un argument d'audit :
*« ces écarts se resserrent avec vos données réelles »*.

---

## 11. La capture de lead

| Étape | Ce qui est donné | Ce qui est demandé |
|---|---|---|
| Résultats | Tout : chiffre principal, les deux décompositions, graphiques, **les trois bascules**, les **scénarios de sensibilité** | Rien |
| Livrable | Rapport imprimable, échéancier, hypothèses complètes | Nom, email professionnel, entreprise |
| Rendez-vous | Audit gratuit | idem + téléphone |

**Protection des données** — deux cases distinctes, jamais fondues en une seule :
- l'envoi du rapport demandé (finalité de la demande) ;
- l'accord, **facultatif et décoché par défaut**, pour recevoir des communications commerciales.

Avec une mention de confidentialité renvoyant à la politique du site.

- Envoi vers `POST /api/lead` avec `_form: 'tco-flotte'`, honeypot `_honey`, et `meta` contenant
  le résumé complet de la simulation (entrées + résultats).
- Nouvelle ligne dans `form_settings` pour router les destinataires indépendamment.
- L'email interne doit contenir **le résumé chiffré**, pas seulement les coordonnées : c'est ce
  qui permet au commercial de rappeler avec un angle.

---

## 12. Direction artistique et règles de marque

- **Noir et blanc strict.** Aucune couleur, **aucun vert**, y compris sur le CO₂ et les gains.
- Chiffres en **mono tabulaire**, filets 1px, espace négatif généreux.
- Interdits : jauge, faux tableau de bord, « temps réel », « cockpit », jargon en titre.
- Lexique : « un seul interlocuteur », « de A à Z », « optimisez », parler de **gains**.
- Tout chiffre fiscal **daté selon le millésime réellement appliqué** (le calcul étant mensuel et
  multi-millésimes, écrire « au 01/01/2026 » serait faux pour une simulation qui traverse 2027 à
  2030). Formulation en « jusqu'à », suivie du disclaimer « indicatif et non contractuel — à
  confirmer avec votre expert-comptable ». Le rapport liste les millésimes utilisés.
- Un bloc « Notre méthode » et un bloc « Les limites de ce simulateur » visibles sur la page,
  pas cachés en pied. Assumer les limites augmente la conversion.

---

## 13. Architecture technique

Calquée sur l'existant, qui fonctionne bien.

| Élément | Fichier |
|---|---|
| Moteur (fonctions pures, sans DOM) | `app/utils/tcoFlotte.ts` |
| Configuration datée | `TCO_CONFIG` dans ce même fichier |
| Page | `app/pages/simulateur-tco.vue` |
| Styles | bloc `.tco-*` dans `app/assets/css/main.css` + `@media print` |
| Lead | `POST /api/lead`, `_form: 'tco-flotte'` |
| Destinataires | nouvelle ligne dans `form_settings` (migration idempotente) |
| Indexation | pilotée par `page_settings` — **jamais** de `robots` en dur |

Principes :
- **Calcul 100 % côté client**, instantané, aucun appel serveur pour simuler.
- Moteur en fonctions pures → testable unitairement.
- **PDF = feuille CSS print + `window.print()`**, pas de bibliothèque.
- Aucune dépendance nouvelle.

**Tests unitaires recommandés** (le moteur est trop critique pour ne pas en avoir) : un jeu de
cas de référence calculés à la main, un test de cohérence (le TCO croît avec le kilométrage), un
test de non-régression sur le point de bascule.

---

## 14. Accessibilité, mobile, impression

- Tous les champs avec `<label>` explicite, navigation clavier complète.
- Tableaux larges : défilement horizontal interne avec indicateur (le mécanisme des articles
  existe déjà et fonctionne).
- Graphiques SVG accompagnés d'une alternative textuelle et du tableau de données.
- Mobile : une colonne, comparaison thermique/électrique empilée plutôt que côte à côte.
- Impression : mise en page dédiée, en-tête OTONOM, hypothèses en annexe, disclaimer daté.

---

## 15. ⚠️ Checklist de vérification — À FAIRE VALIDER

**C'est la section à donner en priorité pour vérification.** Chaque ligne doit être confirmée sur
une source officielle avant d'être codée. Les points 1 à 5 sont bloquants.

### ✅ Résolus par la relecture croisée (juillet 2026)

1. **Plafonds d'amortissement — contradiction levée.** Les deux découpages n'étaient pas des
   erreurs : ils correspondent à **deux régimes de mesure d'émissions différents**.
   - **WLTP** (véhicules neufs depuis mars 2020, notre cas) : < 20 g → 30 000 € · 20–49 g →
     20 300 € · 50–160 g → 18 300 € · > 160 g → 9 900 €
   - **NEDC** (véhicules antérieurs) : seuils à 20 / 60 / 155 g
   → **Décision V1 : régime WLTP uniquement**, avec mention explicite à l'écran. Le support des
   véhicules anciens viendra plus tard s'il est demandé. *(Un doute subsiste sur le seuil haut du
   régime NEDC — 155 ou 130 g selon les sources — sans conséquence pour la V1.)*

2. **Malus au poids des véhicules électriques — exonération confirmée.** La disposition prévoyant
   un abattement de 600 kg (au lieu de l'exonération) pour les électriques sans éco-score, à
   compter du 1ᵉʳ juillet 2026, a été **abrogée avant d'entrer en vigueur par la loi de finances
   pour 2026 (loi n° 2026-103 du 19 février 2026)**.
   → **Malus au poids = 0 € pour tout véhicule 100 % électrique**, quelle que soit sa masse.
   Pour les thermiques, seuil à 1 500 kg et barème marginal progressif.

3. **Aides sur l'infrastructure — 0 € par défaut confirmé.** Le barème ADVENIR actuel ne comporte
   plus d'aide générale pour une flotte légère installée sur un parking privé ordinaire
   d'entreprise (les aides subsistantes visent le collectif, les poids lourds, la voirie, les
   points ouverts au public).
   → Aide infrastructure à **0 € par défaut**, champ modifiable si un dispositif spécifique
   s'applique. **Ne jamais écrire automatiquement 1 000 € par borne.**
   → ⚠️ **Action sur l'existant** : le *Simulateur de transition* applique aujourd'hui
   `aideAdvenirParPoint: 1000` à tous les projets. **À corriger.**

4. **Bonus écologique pour les personnes morales — supprimé.** Depuis le 2 décembre 2024, aucune
   aide générale à l'acquisition d'un VP électrique par une société.
   → Aucune aide à l'achat affichée pour une entreprise. Les éventuels CEE ou dispositifs
   particuliers restent dans un champ séparé, désactivé par défaut.

5. **Avantage en nature — barèmes confirmés.** Pour un véhicule mis à disposition depuis le
   1ᵉʳ février 2025 : achat de moins de 5 ans 15 % (ou 20 % avec carburant) · location ou LOA 50 %
   du coût global (ou 67 % avec carburant) · électrique éligible à l'éco-score : abattement 70 %
   plafonné à 4 641,60 € en 2026 · électricité prise en charge par l'employeur exclue du calcul.
   → Module **optionnel** : il ne concerne que les véhicules utilisables à titre privé.

6. **Taxe polluants et taxe incitative — montants confirmés.** Polluants : 0 € électrique ·
   130 € catégorie 1 · 650 € les plus polluants. Taxe incitative : tarif unitaire 2 000 € (2025) →
   4 000 € (2026) → 5 000 € (2027 et au-delà) ; quotas 15 % · 18 % · 25 % · 30 % · 35 % · 48 %
   de 2025 à 2030. Formule = tarif × écart à l'objectif × taux de renouvellement des véhicules
   très émetteurs.

7. **Classement des hybrides dans la taxe polluants — règle établie.** Il ne faut créer aucune
   règle « hybride = X » : la catégorie dépend du **moteur thermique**, pas de l'hybridation.
   - électrique ou hydrogène exclusif → **catégorie E** (0 €)
   - moteur thermique **à allumage commandé** (essence) respectant Euro 5 ou Euro 6 →
     **catégorie 1** (130 €)
   - tous les autres → **catégorie des plus polluants** (650 €)
   Un hybride essence Euro 5/6 relève donc de la catégorie 1 ; un hybride **diesel** n'y entre pas
   du seul fait d'être hybride. Le moteur doit demander la motorisation thermique, pas seulement
   « hybride oui/non ».

8. **Taxe annuelle CO₂ et malus CO₂ — barèmes disponibles.** Le barème de la taxe annuelle CO₂ est
   publié par millésime, **avec une trajectoire qui durcit chaque année jusqu'en 2027** (seuil de
   déclenchement abaissé, tarifs marginaux relevés) : il doit être stocké par année, jamais figé.
   Malus CO₂ 2026 : seuil 108 g/km, plafond 80 000 €.

9. **TVA sur le carburant — règle confirmée.** Pour un véhicule **exclu** du droit à déduction (VP) :
   essence et gazole récupérables à **80 %**. Pour un véhicule **ouvrant droit** à déduction (VUL) :
   **100 %**. Électricité : **100 %** dans tous les cas. La règle découle donc de `fiscalCategory`,
   pas d'une table séparée.

### Restant à confirmer

Aucun de ces points n'empêche de démarrer le développement : ils portent sur des **valeurs par
défaut configurables**, pas sur la structure du moteur.

**Barèmes à saisir précisément**

10. **Barème détaillé de la taxe annuelle CO₂ par millésime** (2026 à 2030) — les tranches et
    tarifs marginaux exacts sont publiés, il faut les recopier sans erreur pour chaque année.
11. **Formule exacte de la taxe incitative** — en particulier la définition du « taux annuel de
    renouvellement des véhicules très émetteurs », les majorations par catégorie et le traitement
    des entrées/sorties de parc. Sans cela, on n'affiche **aucun montant** (§7.6).
12. **Suramortissement** des utilitaires électriques : seuils de tonnage, taux, et la règle du
    calcul sur le surcoût plutôt que sur le prix total.
13. **Montants CEE pour l'électrification des flottes** — sources très divergentes (525 € à
    9 700 €), plus une condition d'assemblage en Espace économique européen entrée en vigueur en
    2026. Ne rien afficher tant que ce n'est pas confirmé sur les fiches d'opérations
    standardisées officielles.

**Données de marché à obtenir**

14. **Valeurs résiduelles à 36 / 48 / 60 mois** — aucune série fiable trouvée. À obtenir auprès
    d'un loueur. **C'est le paramètre le plus déterminant du modèle**, et le seul que ni une
    recherche web ni une relecture IA ne peuvent trancher.
15. **Frais de restitution et de dépassement kilométrique en LLD**, et **fraction de loyer non
    déductible** — à demander au loueur, qui est légalement tenu de communiquer la seconde.
16. **Consommation des utilitaires** thermiques et électriques — donnée la plus faible du lot.
17. **Prime d'assurance flotte entreprise** — les chiffres trouvés sont des primes de particuliers,
    utilisées faute de mieux.
18. **Coût d'entretien** : la fourchette va du simple au triple selon les sources (250 à 1 100 €/an).
    L'écart de −50 % retenu est un point médian à discuter, ainsi que sa progression avec l'âge.
19. **Facteur d'émission de l'électricité** : 56 g CO₂e/kWh est la moyenne annuelle ; elle masque
    des pointes hivernales bien supérieures. Décider si on garde la moyenne.

---

## 16. Questions ouvertes à trancher

| # | Question | Recommandation |
|---|---|---|
| 1 | Les deux graphiques SVG sont-ils compatibles avec « pas de faux dashboard » ? | Oui à mon sens : filets 1px, aucun remplissage, aucune couleur. À valider. |
| 2 | Affiche-t-on le coût d'opportunité du capital en achat comptant ? | Oui, mais **désactivable** — tout le monde ne le reconnaît pas comme un coût. |
| 3 | La page doit-elle être indexée ? | Oui à terme : « simulateur TCO flotte électrique » est une requête à fort potentiel et personne ne l'occupe. Mais seulement une fois les chiffres validés. |
| 4 | Intègre-t-on l'empreinte de fabrication ? | Oui, mais **symétriquement** (les deux motorisations) et en option — charger la seule batterie serait biaisé. |
| 5 | Que se passe-t-il si le résultat est défavorable ? | On l'affiche honnêtement, avec le levier d'amélioration. C'est un motif d'audit. |
| 6 | Faut-il un mode « flotte mixte » (plusieurs catégories) dès la V1 ? | Oui, mais replié dans les hypothèses — l'écran 1 reste mono-catégorie. |
| 7 | Le simulateur de transition et celui-ci se renvoient-ils l'un à l'autre ? | Oui, en fin de résultats, dans les deux sens. |

---

## 17. Ce qu'il reste à faire

**La structure du moteur est désormais figée : le développement peut commencer.** Les points
restants portent sur des valeurs par défaut, toutes configurables et marquées provisoires. Elles
interdisent une promesse de précision contractuelle — pas la construction de l'outil.

**En parallèle du développement**
1. **Obtenir les valeurs résiduelles auprès d'un loueur** — seul point que ni la recherche web ni
   une relecture IA ne peuvent trancher, et le plus déterminant du modèle. À demander en même
   temps : les frais de restitution et la fraction de loyer non déductible.
2. Saisir les **barèmes par millésime** (section 15, points 10 à 13).
3. Trancher les **questions ouvertes** de la section 16.
4. Valider le **nom** et l'**URL**.

**Indépendant, et à faire vite**

5. **Corriger l'aide ADVENIR du simulateur de transition existant** (`aideAdvenirParPoint: 1000`) —
   point confirmé, c'est un chiffre faux en production aujourd'hui.

**Ordre de développement**

Le **moteur** d'abord : types, `TCO_CONFIG` et `TAX_CONFIG` par millésime, boucle mensuelle,
fonctions pures et tests unitaires. Puis l'écran de saisie, puis les résultats et les graphiques,
puis la feuille d'impression.

---

*Barèmes appliqués selon les millésimes traversés par la simulation, ordres de grandeur indicatifs
et non contractuels — à confirmer avec un expert-comptable. Ce document est une proposition de
spécification, pas un engagement.*
