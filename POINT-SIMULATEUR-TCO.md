# Simulateur de TCO flotte électrique — point v2 et nouvelles interrogations

> Document destiné à une relecture critique, **deuxième tour**.
> Les 6 corrections bloquantes du tour précédent sont **appliquées et vérifiées**.
> Un audit des valeurs a été mené (section 3) : il a révélé 3 anomalies, dont 2 corrigées.
> **Les nouvelles questions sont en section 4.**
>
> État : 137 tests automatisés passent, le build de production passe.

---

## 1. Les 6 corrections bloquantes : faites et vérifiées

### 1.1 Barème du malus — vous aviez raison

Le barème officiel a été relevé sur `service-public.gouv.fr` et intégré. **14 valeurs de contrôle
vérifiées, 14 exactes** :

| g/km | Officiel | Moteur |
|---|---|---|
| 108 | 50 € | 50 € ✓ |
| 120 | 310 € | 310 € ✓ |
| **128** | **818 €** | **818 €** ✓ |
| 140 | 2 205 € | 2 205 € ✓ |
| 160 | 8 770 € | 8 770 € ✓ |
| 190 | 76 800 € | 76 800 € ✓ |

L'ancienne table par points d'ancrage donnait 1 450 € à 128 g/km, soit **77 % de trop**.
35 points du barème réel sont désormais chargés (le barème officiel en compte 90, un par gramme) ;
l'interpolation entre ces points est fidèle à quelques euros sur la plage utile aux flottes.

### 1.2 Loyer financier — le biais était réel et important

Remplacé par la formule d'annuité recommandée :

```
loyer = (P − VR / (1+i)^n) × i / (1 − (1+i)^−n)   puis marge de services
```

Vérifiée contre un calcul fait à la main (48 000 € / 48 mois / 6,5 % → 1 275 €/mois, écart < 5 €).

| Compacte, 48 mois | Ancien (1,9 %/mois) | Loyer financier |
|---|---|---|
| Électrique (revente 33 %) | 608 € | **634 €** |
| Thermique (revente 42 %) | 494 € | **467 €** |

L'écart entre les deux passe de 23 % à 36 %. Paramètres exposés et configurables :
**taux financier du loueur 6,5 %/an**, **marge de services 12 %**.

### 1.3 Ce que contient l'offre de location

Trois questions ajoutées quand l'utilisateur saisit son propre loyer : **HT ou TTC**,
**malus inclus**, **taxes annuelles incluses** — en plus des services (entretien, pneus, assurance)
déjà demandés.

Règle du malus retenue :
- loyer **reconstruit par nous** → le malus n'y est pas, on l'ajoute ;
- offre réelle **déclarée avec malus inclus** → non recompté ;
- offre réelle **déclarée sans** → ajouté ;
- **achat ou crédit** → toujours ajouté.

### 1.4 Cycle suivant

Porte désormais la **quote-part résiduelle** d'amortissement, plus zéro. Constat intéressant :
sur 48 mois avec un amortissement d'infrastructure à 8 ans, le cycle 2 porte exactement la même
quote-part que le cycle 1 — **il est donc économiquement identique**, seule la trésorerie change.
Sur 60 mois, il devient effectivement moins cher. L'indicateur s'appelle maintenant
« Cycle suivant, sans nouveau décaissement d'infrastructure ».

### 1.5 Produit de cession isolé

Nouvelle colonne dans l'échéancier. Plus aucune ligne de coût négatif — vérifié par test sur
toutes les lignes de tous les modes de financement.

### 1.6 Fiscalité de cession

Le bloc s'appelle « **Impact fiscal estimé — hors fiscalité de cession** », avec une phrase qui
précise que la plus ou moins-value de revente, ajustée des amortissements non déductibles, n'est
pas modélisée et demande une validation comptable.

### 1.7 Les 5 points non bloquants

- Coût du capital laissé **linéaire** (conservé) ;
- scénarios négatifs **affichés tels quels** (conservé) ;
- progression d'entretien de 12 %/an **supprimée** — coût moyen constant assumé comme hypothèse ;
- avantage en nature **sorti du TCO** vers un module « Impact employeur des véhicules de fonction ».
  Vérifié par test : une flotte de service et une flotte de fonction ont désormais **le même TCO** ;
- asymétrie des valeurs de revente conservée, à **étiqueter comme stress test** (voir §4.5).

---

## 2. Effet cumulé sur le résultat

Cas type : 30 compactes, 25 000 km/an, 48 mois, retour au dépôt.

| Étape | Écart | % |
|---|---|---|
| Avant les corrections | 171 000 € | 11 % |
| Après malus officiel | 127 500 € | 8 % |
| Après loyer financier | 60 900 € | 4 % |
| **État actuel (LLD)** | **51 000 €** | **3 %** |
| **État actuel (achat)** | **88 900 €** | **6 %** |

Scénarios en LLD : **prudent −176 000 €** (surcoût), central +51 000 €, favorable +237 000 €.

Le résultat est devenu nettement plus prudent. C'est voulu, et à mon sens c'est ce qui le rend
défendable.

---

## 3. Audit des valeurs — 3 anomalies trouvées

J'ai passé le moteur sur une batterie de cas et confronté les sorties aux repères de marché.

### 3.1 Ce qui tient la route

**Coût au kilomètre**, comparé au TCO Scope Arval 2025 (référence : VP thermique 0,476 €/km,
VP électrique 0,423 €/km) :

| Catégorie | Électrique | Thermique |
|---|---|---|
| Citadine | 0,393 | 0,409 |
| Compacte | 0,489 | 0,505 |
| Berline / SUV | 0,643 | 0,742 |

Même ordre de grandeur, légèrement au-dessus — cohérent puisque nous incluons l'infrastructure.

**Décomposition mensuelle** (compacte électrique, LLD) : loyer 768 € TTC (**640 € HT**, dans la
fourchette de marché 550–750 €), énergie 78 €, assurance 68 €, pneumatiques 46 €, entretien 32 €,
infrastructure 15 €, gestion 13 € → **1 018 €/mois de TCO complet**.

**Bascule kilométrique : 15 900 km/an.** En dessous, l'électrique coûte plus cher ; au-dessus, il
gagne, et l'écart croît régulièrement (−3 % à 8 000 km, +12 % à 60 000 km). Le chiffre me paraît
plausible et c'est un excellent argument commercial.

**Infrastructure par véhicule** : décroît de 2 580 € (5 véhicules) à 656 € (200 véhicules).

**Profil itinérant** : l'électrique **perd 93 700 €**. Le simulateur ne conclut donc pas
systématiquement en faveur de l'électrique — c'est sain.

### 3.2 Anomalie corrigée — le profil « mixte » achetait une borne rapide

Le profil « organisation mixte » avait 5 % de recharge rapide dans ses paramètres. Sur 12 points,
l'arrondi lui attribuait **1 borne DC à 28 000 €**, ce qui le rendait plus cher qu'un profil à
15 points. Une flotte en organisation mixte n'a pas besoin d'une borne rapide par défaut :
part DC ramenée à 0, la recharge rapide restant réservée au profil itinérant.

Avant : 12 points → 58 700 €. Après : 12 points → **32 100 €**.

### 3.3 Anomalie vérifiée et saine — le cycle suivant

Contrôlé sur 36, 48 et 60 mois : le cycle suivant n'est jamais plus cher que le cycle actuel.

### 3.4 Anomalie non corrigée — l'utilitaire électrique sort perdant

C'est le point qui m'inquiète le plus. Sur un utilitaire léger :

| Poste | Thermique | Électrique |
|---|---|---|
| Loyers | 656 800 € | 951 300 € |
| Énergie | 332 500 € | 144 700 € |
| Taxes annuelles | **0 €** | **0 €** |
| Malus | **0 €** | **0 €** |
| **Écart** | | **−116 200 € (−9 %)** |

Mécanique : un utilitaire relève de la catégorie fiscale « utilitaire », donc **ni taxes annuelles
ni malus** — l'électrique y perd d'un coup ses deux principaux avantages fiscaux, tout en gardant
son surcoût d'acquisition et sa revente plus faible.

**Mais le suramortissement des utilitaires électriques (art. 39 decies A) n'est pas modélisé**, et
il joue précisément dans l'autre sens. Le résultat affiché est donc probablement trop défavorable.

En attendant, la page affiche un encart : *« Ce calcul est prudent. Le suramortissement des
utilitaires électriques n'est pas modélisé. »*

---

## 4. Nouvelles interrogations

### 4.1 Le suramortissement des utilitaires — combien ça change ? ⚠️ *prioritaire*

Le dispositif de l'article 39 decies A prévoit des taux de 20 % à 60 % selon le tonnage, calculés
depuis 2025 sur le **surcoût** par rapport à un équivalent thermique, et prorogé jusqu'en 2030.

**Questions** : quel est le seuil de tonnage exact, et porte-t-il sur le PTAC ou la masse à vide ?
Un utilitaire léger classique (3,5 t de PTAC) est-il éligible ? Et l'ordre de grandeur
suffirait-il à inverser les −9 % constatés ?

Tant que ce n'est pas tranché, le simulateur donne un résultat que je crois faussement négatif sur
tout un segment.

### 4.2 L'indicateur « par véhicule et par mois » prête-t-il à confusion ?

Il affiche **1 018 €/mois**, alors que le loyer seul est de 640 € HT. Un utilisateur qui compare ce
chiffre à un devis de loueur va croire que nous sommes 60 % trop chers, alors que nous incluons
énergie, assurance, pneumatiques, entretien et infrastructure.

**Question** : faut-il le renommer « coût complet par véhicule et par mois », voire afficher les
deux lignes (« dont loyer ») ?

### 4.3 Le taux financier du loueur

J'ai retenu **6,5 %/an + 12 % de marge de services**. C'est ce qui produit un loyer de 640 € HT
pour une compacte électrique de 32 000 € sur 48 mois, ce qui semble cohérent avec le marché.

**Question** : ces deux paramètres sont-ils dans le bon ordre de grandeur, ou faut-il les
décomposer autrement (taux financier seul + services facturés au réel) ?

### 4.4 La bascule à 15 900 km/an est-elle défendable ?

C'est un chiffre commercialement très parlant. Il découle mécaniquement de nos hypothèses.

**Question** : ce seuil correspond-il à ce qu'on observe sur le terrain, ou révèle-t-il un biais
dans les hypothèses d'énergie ou d'entretien ?

### 4.5 Comment étiqueter l'asymétrie des scénarios ?

Les valeurs de revente varient de ∓8 points sur l'électrique et ∓4 sur le thermique. Vous
recommandiez de l'étiqueter « hypothèse de stress OTONOM, non prédictive ».

**Question** : cette mention doit-elle apparaître directement sous les trois scénarios, ou dans le
bloc « limites » ? Et faut-il exposer les six valeurs (prudent/central/favorable × élec/therm)
comme champs modifiables, ou est-ce trop ?

### 4.6 Un utilitaire échappe-t-il vraiment à tout ?

Je considère qu'un utilitaire ne paie **ni taxe annuelle CO₂, ni taxe polluants, ni malus**, au
motif que ces taxes visent les véhicules de tourisme.

**Question** : est-ce exact pour un utilitaire léger classique ? Le cas des véhicules N1 à
5 places au moins, parfois requalifiés en véhicules de tourisme, est-il à traiter ?

---

## 5. Ce qui reste provisoire

| Valeur | Statut | Criticité |
|---|---|---|
| **Valeurs de revente** | aucune série fiable | **la plus déterminante** — saisissable dans l'interface |
| **Taux financier du loueur** (6,5 % + 12 %) | hypothèse | **forte** — nouveau paramètre sensible |
| **Suramortissement utilitaires** | non modélisé | **forte sur le segment VUL** |
| Millésimes fiscaux 2027-2030 | reconduits, non publiés | forte sur 48-60 mois |
| Fiscalité de cession | non modélisée | moyenne, surtout à 36 mois |
| Frais de restitution (350 €) | ordre de grandeur | faible |
| Consommation des utilitaires | donnée la plus faible | moyenne |
| Prime d'assurance flotte | mesurée sur des primes de particuliers | moyenne |
| Coût d'entretien | fourchettes sources de 1 à 3 | moyenne |
| Coûts d'infrastructure | très dépendants du site | moyenne |

Le **malus est désormais sorti de cette liste** : barème officiel, 14/14 valeurs exactes.

---

## 6. Priorités si le temps de relecture est limité

1. **§4.1** — le suramortissement des utilitaires : le simulateur est-il faussement négatif sur
   tout un segment ?
2. **§4.3** — le taux financier du loueur est-il calibré correctement ? C'est lui qui pilote
   désormais le poste le plus lourd du TCO.
3. **§4.2** — faut-il renommer l'indicateur mensuel pour éviter la comparaison à un loyer ?

---

*Barèmes appliqués selon les millésimes traversés par la simulation. Ordres de grandeur indicatifs
et non contractuels.*
