# Simulateur de remboursement de recharge à domicile d'un salarié

**Version 2.1 — GO développement.** Rédigée le 07/08/2026, corrigée le 10/08/2026
après relecture externe et contre-vérification aux sources, puis le 11/08/2026
sur le non-cumul prime transport / transports publics (§3.5).

Cocon visé : **Collaborateurs**. Requête principale : **« coût recharge domicile
salarié »**.
Promesse affichée : *« Combien rembourser à un collaborateur qui recharge son
véhicule électrique chez lui ? »*

> Le nom retenu abandonne « refacturation » au profit de **remboursement** : c'est
> le mot que le DRH et le DAF emploient, et c'est le sens réel du flux — de
> l'employeur vers le salarié. « Refacturation » reste utilisable dans le contenu.

---

## 0. Ce qui a changé depuis la version 1

Quatorze corrections, dont quatre bloquantes. **Tout ce qui suit a été
recontrôlé aux sources primaires**, y compris les points où le relecteur avait
raison contre moi.

| Point | v1 | v2 |
| --- | --- | --- |
| Articulation art. 3 / art. 4 | Doute, à trancher | **Tranché** : « (hors frais d'électricité) » figure au 2° b) de l'art. 4 |
| Périmètre du régime | « véhicule électrique » | **Exclusivement électrique + éco-score** |
| Plafonds borne | 1 043,50 / 1 565,20 € (2025) | **1 057,10 / 1 585,50 €** (2026) |
| Ancienneté borne | « 5 ans et plus » | **« plus de cinq ans »** |
| Domicile-travail véhicule personnel | Absent | **Branche entière ajoutée** (prime transport) |
| Barème kilométrique | « ≤ 7 CV », tableau incomplet | **Faux** : la catégorie « 7 CV et plus » existe. Tableau complété |
| Tarifs EDF 01/08/2026 | HP 0,2065 / HC 0,1579 | **HP 0,2142 / HC 0,1589** |
| Pertes de recharge | +12 % systématique | **Double comptage** : la WLTP les inclut déjà |
| Comparaison domicile / site | TTC contre HT | Base économique commune |
| Prix publics | Présentés comme références | **Hypothèses OTONOM**, modifiables |

---

## 1. Ce que fait le simulateur — et ce qu'il ne fait pas

**Il fait :**
- le **coût réel** de la recharge à domicile, en euros par mois et par an ;
- le **montant à rembourser** au salarié, et son coût pour l'employeur ;
- le **traitement social** du remboursement selon la situation ;
- la **qualité de la preuve** selon la méthode de mesure retenue ;
- la comparaison avec une recharge sur site et en itinérance.

**Il ne fait pas :**
- il ne calcule **pas** l'avantage en nature du véhicule (c'est le simulateur de
  TCO) — introduire ici un second moteur d'AEN incomplet serait une faute ;
- il ne remplace ni un expert-comptable, ni un conseil en paie ;
- il ne traite ni la mobilité internationale, ni les régimes spéciaux.

---

## 2. Pourquoi, et pour qui

La recharge à domicile est le point aveugle de l'électrification des flottes.
Les trois pratiques observées sont toutes mauvaises : **ne rien rembourser**
(le salarié paie l'énergie de l'entreprise), **rembourser un forfait au doigt
mouillé** (fragile en contrôle), **rembourser la facture du foyer**
(l'entreprise paie le chauffage).

Personas : **DRH** (traitement social, équité), **DAF** (coût réel, risque de
redressement), **gestionnaire de flotte** (politique de recharge).

---

## 3. Cadre juridique — vérifié à la source

Texte de référence : **arrêté du 25 février 2025**
([Légifrance](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000051254024)).

### 3.1 L'électricité du véhicule n'est pas un avantage en nature — et c'est certain

L'article 3 dispose que les dépenses retenues **« ne tiennent pas compte des
frais d'électricité engagés par l'employeur pour la recharge du véhicule »**.

L'article 4, 2° b) plafonne à 50 % la prise en charge des frais liés à
l'utilisation d'une borne hors du lieu de travail — mais précise **entre
parenthèses : « (hors frais d'électricité) »**.

**Les deux textes séparent donc explicitement l'énergie du véhicule et les frais
de l'équipement.** Un employeur peut rembourser **100 % des kilowattheures**
consommés pour recharger un véhicule éligible, sans appliquer le plafond de 50 %,
qui ne vise que la borne.

C'est le résultat pédagogique n° 1 du simulateur.

### 3.2 Mais le régime favorable a des conditions strictes

Le texte vise les véhicules **« fonctionnant exclusivement au moyen de l'énergie
électrique »**. Pour une mise à disposition entre le **01/02/2025 et le
31/12/2027**, s'ajoute le respect de la condition du **c du 6° du I de l'article
D. 251-1 du code de l'énergie** — le score environnemental.

**Conséquences pour le moteur :**
- un **hybride rechargeable n'est pas** un véhicule fonctionnant exclusivement à
  l'électricité : il sort du régime ;
- un véhicule 100 % électrique **non éligible à l'éco-score** en sort aussi, pour
  les mises à disposition postérieures au 01/02/2025 ;
- le simulateur ne doit **jamais** rendre un verdict favorable automatique sur la
  seule mention « électrique ».

Le calcul complet de l'avantage en nature du véhicule reste **hors périmètre** :
il existe deux méthodes (dépenses réelles et forfait), avec des abattements et
plafonds distincts. Le simulateur se borne à dire que **l'électricité en est
exclue**, et renvoie au simulateur de TCO pour le reste.

### 3.3 Les bornes (article 4), valeurs 2026

Régime applicable **jusqu'au 31/12/2027**. Les plafonds sont **revalorisés chaque
1er janvier** (article 8) — d'où l'écart avec les montants figurant dans l'arrêté
initial.

| Situation | Traitement |
| --- | --- |
| Borne **sur le lieu de travail** | Avantage **nul**, y compris frais d'électricité, même en usage personnel |
| Borne **hors lieu de travail**, achat et installation, **retirée** en fin de contrat | Prise en charge **exclue** de l'assiette |
| Borne **hors lieu de travail**, **conservée**, **cinq ans ou moins** | Exclue à hauteur de **50 %** des dépenses réelles, plafond **1 057,10 €** |
| Borne **hors lieu de travail**, **conservée**, **plus de cinq ans** | Exclue à hauteur de **75 %**, plafond **1 585,50 €** |
| **Autres frais** liés à l'utilisation ou à la location de la borne, **hors électricité** | Exclus dans la limite de **50 %** des dépenses réelles |

> Le texte dit **« plus de cinq ans »** : à exactement cinq ans, on reste dans la
> première branche. Le moteur doit utiliser une comparaison stricte.

### 3.4 Véhicule personnel, déplacements professionnels

Deux modalités de remboursement des frais professionnels, **et il faut demander
laquelle l'entreprise applique** :

- **indemnités kilométriques** (allocation forfaitaire) ;
- **frais réels** sur justificatifs.

Pour un véhicule 100 % électrique, le barème est **majoré de 20 %**, et **la
recharge est réputée comprise** dans le barème au titre des frais de carburant.
**Aucun cumul** entre indemnités kilométriques et remboursement séparé des
kilowattheures : ce serait compter l'énergie deux fois.

Barème automobile 2026 — *valeurs à reconfirmer sur le BOFiP avant publication* :

| Puissance | ≤ 5 000 km | 5 001 à 20 000 km | > 20 000 km |
| --- | --- | --- | --- |
| 3 CV et moins | d × 0,529 | (d × 0,316) + 1 065 | d × 0,370 |
| 4 CV | d × 0,606 | (d × 0,340) + 1 330 | d × 0,407 |
| 5 CV | d × 0,636 | (d × 0,357) + 1 395 | d × 0,427 |
| 6 CV | d × 0,665 | (d × 0,374) + 1 457 | d × 0,447 |
| 7 CV et plus | d × 0,697 | (d × 0,394) + 1 515 | d × 0,470 |

Résultat **× 1,20** pour un véhicule 100 % électrique.

> La v1 affirmait que le barème « ne vaut que pour les véhicules de 7 CV ou
> moins ». **C'est faux** : la dernière ligne est précisément « 7 CV et plus ».

### 3.5 Véhicule personnel, trajet domicile-travail — la branche oubliée

C'est le cas qui correspond le mieux à la requête visée, et il manquait
entièrement.

L'employeur peut prendre en charge les **frais d'alimentation d'un véhicule
électrique, hybride rechargeable ou hydrogène** personnel utilisé pour les
trajets résidence ↔ lieu de travail — la **prime de transport**.

| Élément | Valeur |
| --- | --- |
| Plafond d'exonération, alimentation électrique | **600 €/an/salarié** |
| Sous-plafond propre aux **frais de carburant** | **300 €/an/salarié** |
| Plafond global en cumul avec le forfait mobilités durables | **600 €/an** |
| Cumul avec la prise en charge des transports publics | **Interdit** — voir ci-dessous |

**Le cumul avec les transports publics est exclu par la loi, pas plafonné.**
L'article **L. 3261-3 du code du travail** dispose que le bénéfice de cette prise
en charge **ne peut être cumulé avec celui prévu à l'article L. 3261-2**, qui vise
les abonnements de transports publics. Le plafond de 900 € parfois cité concerne
le cumul *forfait mobilités durables + transports publics* : c'est un autre
dispositif, et l'appliquer ici serait une erreur.

**Trois garde-fous supplémentaires, tous vérifiés :**

1. **L'éligibilité est restreinte.** L'article L. 3261-3 réserve la prise en
   charge aux salariés dont la résidence ou le lieu de travail se situe dans une
   commune non desservie par un transport collectif régulier ou par un transport
   organisé par l'employeur, ou hors du périmètre d'un plan de mobilité
   obligatoire — ou dont les **horaires particuliers** interdisent d'emprunter
   un transport collectif. Ce n'est pas un dispositif ouvert à tous.
2. **Pas de cumul avec les indemnités kilométriques** pour les mêmes trajets.
3. **Sont exclus** les salariés disposant d'un véhicule de l'entreprise dont
   l'énergie est déjà prise en charge — ce qui écarte précisément la population
   des branches « véhicule de l'entreprise ».

**Règle à implémenter dans le moteur**, avant tout verdict sur cette branche :

> *« Le salarié bénéficie-t-il déjà d'une prise en charge de son abonnement de
> transports publics pour ces trajets ? »*
> **Oui** → ne pas rendre le verdict « prime transport 600 € » ; le cumul est
> interdit. **Non** → poursuivre le test d'éligibilité (commune desservie,
> horaires particuliers).

Sur les justificatifs : aucune pièce de dépense n'est formellement exigée dans
cette limite, mais **l'employeur doit disposer des éléments justifiant la prise
en charge**, recueillis auprès des salariés. Ce n'est pas « aucun justificatif ».

---

## 4. L'arborescence du moteur

La v1 raisonnait en quatre situations. Ce n'était pas assez : le régime dépend
d'abord de **qui possède le véhicule**, puis de l'usage.

| Niveau 1 | Niveau 2 | Régime |
| --- | --- | --- |
| **Véhicule de l'entreprise** | 100 % électrique **éligible**, recharge au domicile | Électricité remboursable à 100 %, hors avantage en nature |
| Véhicule de l'entreprise | Borne financée au domicile | Article 4 — voir §3.3 |
| Véhicule de l'entreprise | Recharge sur le lieu de travail | Avantage nul, électricité comprise |
| Véhicule de l'entreprise | **Hybride rechargeable, ou VE hors éco-score** | **Branche de prudence** : régime favorable non acquis, renvoi vers un conseil |
| **Véhicule personnel** | Déplacement professionnel | Indemnités kilométriques **ou** frais réels — à demander |
| Véhicule personnel | Domicile-travail | Prime de transport, sous conditions d'éligibilité (§3.5) |
| Véhicule personnel | Les deux usages | **Calcul séparé**, pas de cumul sur les mêmes kilomètres |

S'ajoute une distinction à poser dès le formulaire : **véhicule de fonction**
(usage privé autorisé, mise à disposition permanente) ou **véhicule de service**
(usage professionnel seulement). L'article 3 vise le premier.

---

## 5. Hypothèses chiffrées

### 5.1 Prix de l'électricité au domicile

Tarif réglementé de vente, grille du **1er août 2026**, 6 kVA :

| Option | Prix TTC |
| --- | --- |
| Base | **0,2001 €/kWh** |
| Heures pleines | **0,2142 €/kWh** |
| Heures creuses | **0,1589 €/kWh** |
| Abonnement annuel (base, 6 kVA) | 190,32 € TTC |

**L'écart heures creuses / base est de 20,6 %.**

> **Ne pas supposer que la recharge a lieu en heures creuses.** Encore faut-il que
> le salarié ait souscrit l'option, connaisse ses plages — déterminées localement,
> et pas nécessairement nocturnes — et programme effectivement la charge.
> Le simulateur **demande** l'option tarifaire réelle et **la part réellement
> rechargée en heures creuses**. Il n'impose pas 100 %.

### 5.2 Consommation — la correction la plus importante

**La consommation homologuée WLTP est mesurée entre le réseau et le véhicule :
elle inclut déjà les pertes de recharge.** La consommation affichée au tableau de
bord, elle, ne les inclut pas.

Ajouter 12 % à une valeur WLTP revient donc à **compter les pertes deux fois**.

Le moteur doit demander **d'où vient le chiffre saisi** :

| Origine de la consommation | Traitement |
| --- | --- |
| Relevé de borne ou de sous-compteur (kWh réellement facturés) | **Aucun coefficient.** On tient la donnée réelle |
| Consommation homologuée WLTP | **Aucun coefficient** : les pertes y sont déjà |
| Consommation lue au tableau de bord (énergie batterie) | `kWh réseau = énergie batterie / rendement`, rendement affiché comme hypothèse |

Valeurs par défaut, reprises du moteur de TCO :

| Catégorie | Consommation |
| --- | --- |
| Citadine | 15 kWh/100 km |
| Compacte | 17 kWh/100 km |
| Berline | 20 kWh/100 km |
| Utilitaire léger | 22 kWh/100 km |

> ⚠️ **Action à porter au-delà de ce simulateur.** Notre moteur de TCO, **en
> production**, applique `pertesCharge: 0.12` à ces mêmes valeurs, avec le
> commentaire « l'énergie facturée dépasse l'énergie stockée » — formulation qui
> suppose une base « batterie ». Si ces consommations sont en réalité des valeurs
> WLTP, **le TCO surestime le coût énergétique de l'électrique d'environ 12 %**.
> À arbitrer pour les trois moteurs à la fois, en documentant la base retenue.
> Le moteur camping, lui, retient 10 % et 17,5 kWh/100 km : troisième variante.

### 5.3 Points de comparaison — hypothèses, pas références

Toutes ces valeurs sont des **hypothèses OTONOM**, affichées comme telles et
**modifiables**. Ce ne sont pas des tarifs nationaux.

| Mode | Hypothèse |
| --- | --- |
| Site entreprise, heures creuses | 0,158 €/kWh HT |
| Site entreprise, heures pleines | 0,207 €/kWh HT |
| Borne publique AC | 0,40 €/kWh |
| Borne publique DC rapide | 0,58 €/kWh |

> **Une comparaison n'a de sens que sur une base commune.** Le domicile est un
> prix TTC (le salarié ne récupère pas la TVA), le site entreprise un prix HT.
> La v1 les mettait dans le même tableau et concluait à l'égalité : c'était faux.
> Le simulateur **affiche les deux bases** et demande, pour un DAF, le coût moyen
> réel du kWh sur site.

---

## 6. Formules et cas de référence

```
énergie au réseau (kWh/an) = conso_réseau(100 km) × km_annuels / 100
énergie à domicile (kWh/an) = énergie au réseau × part_domicile
coût salarié (€/an) = énergie_domicile × (part_HC × prix_HC + (1 − part_HC) × prix_HP)
```

### Cas de référence

Compacte, **17 kWh/100 km en base WLTP** (donc sans coefficient supplémentaire),
15 000 km/an, 80 % rechargés à domicile :

```
énergie au réseau   = 17 × 150        = 2 550 kWh
part domicile 80 %  = 2 550 × 0,80    = 2 040 kWh
100 % en heures creuses (0,1589)      = 324 €/an, soit 27,00 €/mois
100 % en base (0,2001)                = 408 €/an, soit 34,00 €/mois
```

**Écart entre les deux options : 84 € par an et par véhicule.** Sur une flotte de
trente véhicules, environ 2 500 € — pour un réglage d'heures creuses.

> La v1 annonçait 366 € et 464 €. L'écart tient à la correction du double
> comptage des pertes, et accessoirement aux tarifs corrigés.

### Présentation des comparaisons

La v1 mélangeait deux registres : un coût calculé sur 80 % de recharge à domicile,
puis un tableau comparatif sur 100 %. Mathématiquement cohérent, mais illisible.

Le simulateur affiche **deux blocs distincts** :

1. **Votre situation réelle** — le mix saisi (par exemple 80 % domicile, 15 %
   site, 5 % public) et son coût total.
2. **Si tout était rechargé de cette façon** — le coût de chaque mode à 100 %,
   pour comparer à périmètre égal.

Sur ce cas et avec ces hypothèses, la recharge publique rapide revient à environ
**3,7 fois** la recharge à domicile. **C'est le résultat d'un scénario, pas une
vérité générale** : à afficher comme tel.

---

## 7. Ce que le simulateur affiche

**Gratuit, tout de suite :** le coût mensuel de la recharge à domicile, le montant
à rembourser, et le verdict social en une phrase.

**Après le formulaire :** le détail par mode et la comparaison ; le régime
applicable à la situation saisie ; l'effet d'un basculement en heures creuses ;
le coût et le régime d'une borne installée au domicile ; la **qualité de la
preuve** ; les hypothèses, affichées et modifiables ; et ce qu'il faut écrire
dans la politique de recharge.

### La qualité de la preuve — trois niveaux

Aucune doctrine nationale n'impose une méthode de mesure. Mais un remboursement
de frais professionnels doit correspondre à des **dépenses réelles et
justifiées**. Le simulateur qualifie donc la méthode retenue sans jamais écrire
« conforme URSSAF » ni « borne communicante obligatoire » :

- 🟢 **Mesure réelle** — relevé de borne ou sous-compteur dédié, au tarif
  correspondant ;
- 🟠 **Estimation documentée** — kilomètres professionnels × consommation ×
  tarif, méthode écrite et appliquée uniformément ;
- ⚪ **Simulation** — hypothèses moyennes OTONOM, pour cadrer un ordre de grandeur.

---

## 8. Points ouverts

Ceux de la v1 qui restent, et ceux ajoutés par la relecture.

1. **Le barème kilométrique 2026** : confirmer les dix-sept valeurs du §3.4 sur le
   BOFiP, et l'absence de revalorisation depuis 2024.
2. **La méthode de mesure** admise en contrôle : aucune doctrine trouvée. Reste un
   arbitrage de prudence.
3. **Le double comptage des pertes dans le moteur de TCO en production** (§5.2) —
   à trancher avant d'ajouter un troisième moteur.
4. **Recharge photovoltaïque au domicile** : comment valoriser un kilowattheure
   autoconsommé qui n'apparaît sur aucune facture ?
5. **Surcoût d'abonnement** provoqué par la borne (passage de 6 à 9 kVA) : qui le
   supporte, et sous quel régime ?
6. **Copropriété et opérateur de recharge** : abonnement fixe, kilowattheures et
   frais de service se traitent-ils identiquement ?
7. **Deux véhicules sur la même borne** : comment identifier les sessions ?
8. **Offres à tarification dynamique** (Tempo, offres de marché) : le simulateur
   ne gère que Base et HP/HC.
9. **TVA** : si nous affichons un « coût net employeur », il faut trancher le
   traitement de la TVA sur l'électricité remboursée.
10. **Versionnement réglementaire** : le régime expire le **31/12/2027** et les
    plafonds sont revalorisés chaque 1er janvier. **Les montants doivent vivre
    dans une table de paramètres datée, jamais en dur dans le moteur.**

---

## 9. Ce qui reste non vérifié

Le **barème kilométrique 2026** dans le détail (source secondaire concordante,
BOFiP non consulté) et le **plafond 2026 de l'abattement sur l'avantage en
nature** — sans conséquence ici, ce simulateur ne calculant pas l'avantage en
nature.

Tout le reste du §3 a été lu dans le texte de l'arrêté sur Légifrance, et les
tarifs du §5.1 relevés sur la grille du 1er août 2026.

---

*Document de travail OTONOM, v2 du 10/08/2026. Aucune valeur contractuelle.*
