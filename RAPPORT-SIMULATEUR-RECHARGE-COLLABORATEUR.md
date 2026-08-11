# Simulateur de remboursement de recharge à domicile — rapport complet

**Version 3 — GO production.** 11/08/2026.

Sept corrections depuis la v1, dont **un bug d'arbre confirmé par reproduction**,
**une incohérence fonctionnelle** entre le niveau de preuve affiché et le chiffre
calculé, et **une éligibilité en liste noire** qui ouvrait le dispositif à toute
valeur inattendue.

Ce document décrit exhaustivement ce qui est demandé, ce qui est calculé et ce qui est
affiché. Les listes des §2 et §5 sont **extraites du code**, pas rédigées de
mémoire.

Page : `/simulateurs/recharge-domicile-salarie`
Moteur : `app/utils/simulateurs/rechargeCollaborateur.ts` · **145 tests** automatisés.

---

## Ce que je te demande

Tu es relecteur factuel et juridique. Ce simulateur est **déjà développé**. Je
veux savoir où il se trompe.

Priorités :

1. **Les six règles de droit (§4)** — exactes au 11/08/2026 ? Le moteur en tire-t-il
   la bonne conséquence ?
2. **L'arbre de décision (§3)** — un cas réel peut-il tomber dans la mauvaise
   branche, ou dans aucune ?
3. **Le régime de la supervision (§6.2)** — l'ajout le plus récent, et le seul qui
   ne repose sur aucune doctrine explicite. C'est ma priorité de vérification.
4. **Le coût employeur (§7)** — les charges patronales sur la fraction réintégrée
   sont-elles correctement raisonnées ?
5. **Le calcul énergétique (§5)** — reste-t-il un double compte ?
6. **Ce que le simulateur refuse de dire (§10)** — prudence justifiée, ou
   excessive au point d'être inutile ?

Un employeur qui rembourse mal s'expose à un redressement URSSAF.

---

## 1. À quoi il sert

**Il qualifie une situation avant de la chiffrer.** Le calcul du coût est trivial
— kilomètres × consommation × prix. Le régime social, lui, dépend de huit
réponses enchaînées. Le simulateur désigne **laquelle des sept situations est
celle de l'utilisateur**, puis dit ce qu'elle autorise.

L'affichage a été inversé en cours de route : le **verdict** occupe la grande
place, les montants sont devenus des métriques secondaires.

**Hors périmètre, assumé :** le calcul de l'avantage en nature du véhicule (c'est
le simulateur de TCO), le conseil en paie, la mobilité internationale.

---

## 2. Tout ce qui est demandé

### Bloc 1 — À qui appartient le véhicule ?

| Question | Valeurs | Toujours posée ? |
| --- | --- | --- |
| Propriétaire du véhicule | l'entreprise / le salarié | oui |
| Motorisation | 100 % électrique / hybride rechargeable / autre | si entreprise |
| Usage privé autorisé ? | oui (fonction) / non (service) | si entreprise |
| Mis à disposition **à compter du** 1er février 2025 ? | oui / non / je ne sais pas | si VE de fonction |
| Éligible au score environnemental ? | oui / non / je ne sais pas | si mise à dispo après 02/2025 |
| Pour quels trajets ? | professionnel / domicile-travail / les deux | si salarié |
| Comment remboursez-vous ces déplacements ? | indemnités kilométriques / frais réels | si trajets professionnels |
| Puissance fiscale (CV) | nombre | si barème kilométrique |
| Abonnement de transports publics déjà pris en charge ? | oui / non / je ne sais pas | si domicile-travail |
| **Pourquoi le véhicule personnel est-il nécessaire ?** | non desservi par un transport collectif / hors périmètre d'un plan de mobilité obligatoire / horaires incompatibles / aucune de ces situations / je ne sais pas | si domicile-travail |

### Bloc 2 — Le véhicule et ses kilomètres

| Question | Valeurs |
| --- | --- |
| Catégorie | citadine 15 · compacte 17 · berline 20 · utilitaire 22 kWh/100 km |
| **Kilomètres par an** *(seul champ obligatoire)* | nombre |
| D'où vient la consommation ? | WLTP / relevé de borne / tableau de bord |
| Consommation réelle, si connue | kWh/100 km |

### Bloc 3 — Sa recharge à domicile

| Question | Valeurs |
| --- | --- |
| Part rechargée au domicile | 100 / 80 / 60 / 40 / 20 % |
| Son option tarifaire | heures pleines-creuses / base / prix saisi |
| Part réellement rechargée en heures creuses | 100 / 80 / 50 / 20 % |
| Prix du kWh | € TTC, si option « prix saisi » |

### Bloc 4 — Comment mesurez-vous ces kilowattheures ?

| Question | Valeurs |
| --- | --- |
| Mode de mesure | supervision / sous-compteur / estimation / aucune |
| **Kilowattheures relevés sur l'année** | nombre — si mesure réelle |
| **Qui souscrit la supervision ?** | abonnement rattaché à la borne du salarié / plateforme de flotte souscrite par l'entreprise |
| Supervision payée par l'employeur ? | oui / non / je ne sais pas |
| Abonnement de supervision | €/mois **par point de charge** |
| Charges patronales | %, défaut 42 |

### Bloc 5 — La borne au domicile *(facultatif, véhicule d'entreprise)*

| Question | Valeurs |
| --- | --- |
| Financée par l'employeur ? | oui / non / je ne sais pas |
| Achat et installation | € |
| Retirée à la fin du contrat ? | oui / non / je ne sais pas |
| Ancienneté à la fin du contrat | années |

---

## 3. L'arbre de décision

```
Propriétaire du véhicule ?
├── L'ENTREPRISE
│   ├── usage privé autorisé ? NON        → « véhicule de service »
│   ├── motorisation ≠ 100 % électrique   → « hors régime » (prudence)
│   ├── date INCONNUE                     → « hors régime » (prudence)
│   ├── à compter du 01/02/2025 ET éco-score ≠ oui → « hors régime »
│   └── sinon                             → « VE éligible » (favorable)
└── LE SALARIÉ
    ├── usage = les deux                  → « mixte » (aucun montant : à ventiler)
    ├── usage = domicile-travail          → prime de transport
    └── usage = professionnel
        ├── frais réels                   → « frais réels »
        └── sinon                         → « barème kilométrique »
```

**Prudence assumée :** un éco-score « je ne sais pas » sort du régime favorable,
au même titre qu'un « non ».

> **Bug corrigé le 11/08/2026.** Une date de mise à disposition **inconnue**
> retombait dans le cas favorable — la condition testée était « après 01/02/2025
> ET éco-score ≠ oui », donc un « je ne sais pas » sur la date la rendait fausse
> et court-circuitait le contrôle. Reproduit sur les neuf combinaisons, corrigé,
> et gelé par six tests. Le doute ne profite plus au verdict, dans aucun cas.

---

## 4. Les six règles de droit implémentées

Chacune est gelée par au moins un test.

| # | Règle | Source | Conséquence |
| --- | --- | --- | --- |
| 1 | Les dépenses retenues « ne tiennent pas compte des frais d'électricité engagés par l'employeur pour la recharge du véhicule » | Arrêté 25/02/2025, art. 3 | Remboursement des kWh **exonéré à 100 %**, sans plafond |
| 2 | Le plafond de 50 % des frais de borne s'applique **« hors frais d'électricité »** | Même arrêté, art. 4, 2° b) | Le plafond ne touche **jamais** l'électricité |
| 3 | Régime réservé aux véhicules « fonctionnant exclusivement au moyen de l'énergie électrique », plus l'éco-score depuis le 01/02/2025 | Art. 3, sections C et D | Hybride rechargeable et VE sans éco-score → prudence |
| 4 | Borne conservée : 50 % / 1 057,10 € ; **« plus de cinq ans »** : 75 % / 1 585,50 € | Art. 4, 2° a), valeurs 2026 | Comparaison **strictement** supérieure à 5 |
| 5 | La prime de transport **ne peut être cumulée** avec la prise en charge des transports publics | Code du travail, art. L. 3261-3 | Verdict « remboursement exclu », remboursement à 0 ; un abonnement **non vérifié** donne un verdict de prudence |
| 6 | Pour un véhicule personnel, la recharge est comprise dans le barème kilométrique, majoré de 20 % | BOFiP et impots.gouv.fr | Aucun remboursement séparé des kWh |

---

## 5. Le calcul énergétique

```
énergie au réseau (kWh/an)  = conso(100 km) × km_annuels / 100
énergie à domicile (kWh/an) = énergie au réseau × part_domicile
prix moyen                  = part_HC × prix_HC + (1 − part_HC) × prix_HP
coût salarié (€/an)         = énergie_domicile × prix moyen
```

**Aucun coefficient de pertes par défaut.** La consommation WLTP est mesurée
entre le réseau et le véhicule : elle contient déjà les pertes.

| Origine de la consommation | Traitement |
| --- | --- |
| Relevé de borne ou sous-compteur | aucun coefficient |
| Consommation homologuée WLTP | aucun coefficient |
| Consommation au tableau de bord | `/ 0,88` — mesurée côté batterie |

**Cas de référence** — compacte, 17 kWh/100 km, 15 000 km/an, 80 % à domicile,
100 % en heures creuses : 2 550 kWh au réseau, **2 040 kWh à domicile**,
**324 €/an** (27 €/mois). En base : 408 €/an. Écart : **84 €/an**.

### Le relevé fait autorité sur l'estimation

**Incohérence corrigée le 11/08/2026.** Le simulateur affichait « mesure réelle »
au-dessus d'un montant calculé depuis les kilomètres : le niveau de preuve
annoncé ne correspondait pas au chiffre produit.

Désormais, si le mode de mesure est **supervision** ou **sous-compteur**, le
formulaire demande les **kilowattheures réellement relevés**, et ils remplacent
l'estimation :

```
si relevé saisi  : kWh domicile = relevé          (aucun recalcul)
sinon            : kWh domicile = conso × km / 100 × part_domicile
```

Le simulateur répond donc à deux usages distincts : *« combien cela va-t-il
coûter ? »* et *« j'ai mes relevés, combien dois-je rembourser ? »*. Sans relevé
saisi, on retombe sur l'estimation — jamais sur un zéro silencieux.

> **Point ouvert, hors de ce simulateur :** notre simulateur de TCO, en
> production, applique 12 % de pertes à des consommations de même nature. S'il
> s'agit de valeurs WLTP, il surestime le coût énergétique d'environ 12 %.

---

## 6. La supervision

### 6.1 La qualité de la preuve

| Méthode | Niveau | Attribue une session à un véhicule ? |
| --- | --- | --- |
| Borne communicante et supervision | mesure | **Oui** |
| Sous-compteur dédié | mesure | Non |
| Estimation par les kilomètres | estimation documentée | Non |
| Aucune mesure | simulation | Non |

Un sous-compteur mesure **la borne**, pas **le véhicule**. Chez un salarié dont
le conjoint roule aussi en électrique, les kilowattheures ne sont pas séparables.
Le moteur affiche un avertissement explicite dans ce cas.

### 6.2 Le régime social de l'abonnement — à valider en priorité

**Ma lecture :** l'abonnement de supervision d'une borne au domicile relève des
« autres frais liés à l'utilisation d'une borne installée hors du lieu de travail
ou du coût d'un contrat de location » (art. 4, 2° b), donc **exclu dans la limite
de 50 % des dépenses réelles**.

Implémenté ainsi :

- **aucun plafond en euros** — les 1 057,10 € et 1 585,50 € visent l'achat et
  l'installation, pas les frais d'utilisation ;
- l'électricité reste exonérée **en totalité** ;
- un avertissement signale ce contraste.

Exemple : 8 €/mois → 96 €/an, dont **48 € exclus** et 48 € soumis.

**Nuance ajoutée le 11/08/2026 :** le moteur distingue désormais deux cas.

| Configuration | Traitement |
| --- | --- |
| Abonnement rattaché à la borne du salarié, remboursé au salarié | **50 %** des dépenses réelles, étiqueté « interprétation prudente de l'article 4, 2° b) » |
| Plateforme de flotte souscrite directement par l'entreprise | **Ni exonérée, ni réintégrée d'office** — renvoi au contrat |

Le texte vise les dépenses « que le salarié aurait dû engager ». Une plateforme
souscrite par l'entreprise pour piloter cinquante bornes ne correspond pas
évidemment à cette rédaction. Aucune doctrine ne tranche cette configuration :
le simulateur affiche le coût, signale l'incertitude, et ne décide pas.

**Trois questions que je te demande de trancher :**

1. Un contrat de supervision entre-t-il bien dans « autres frais liés à
   l'utilisation » ? Ou s'analyse-t-il comme un outil de l'employeur, et non un
   avantage consenti au salarié ?
2. Le texte vise les dépenses « que le salarié aurait dû engager ». Si
   l'employeur contracte directement auprès de l'opérateur, le plafond de 50 %
   s'applique-t-il encore ?
3. Si la borne est **retirée en fin de contrat**, l'achat est exonéré sans
   plafond. Les frais d'utilisation suivent-ils, ou restent-ils plafonnés ?
   **Le moteur retient la seconde lecture, la plus prudente.**

---

## 7. Le coût employeur

Ajouté en dernier, parce que les postes vivaient dans trois blocs séparés que
personne n'additionnait.

```
récurrent (par an, par salarié) = MONTANT VERSÉ AU SALARIÉ
                                + abonnement de supervision
                                + charges patronales × fraction réintégrée
ponctuel (première année)       = borne + charges patronales × part réintégrée
```

Le premier poste suit la branche, et son libellé aussi : « Électricité
remboursée » sur un véhicule d'entreprise, « Indemnités kilométriques » au
barème, « Frais réels remboursés », « Prime de transport ». Sur l'usage mixte,
sans versement chiffrable, le bloc affiche « Non chiffrable » plutôt qu'un zéro
qui se lirait « ça ne coûte rien ».

> **Bug corrigé le 11/08/2026, trouvé au deuxième audit externe.** Ce premier
> poste valait toujours le coût de recharge à domicile. Les deux coïncident sur
> les branches qui remboursent les kilowattheures — et le test existant ne
> couvrait que celles-là. Au barème, le bloc annonçait **277 €** quand
> l'employeur versait **6 815 €** d'indemnités. Prime exclue ou usage mixte, il
> affichait un coût alors qu'aucun versement n'a lieu : le chiffre masqué en haut
> de page réapparaissait plus bas. Les huit branches sont désormais vérifiées une
> par une, pas seulement le véhicule de fonction.

**Le raisonnement à vérifier :** la fraction réintégrée entre dans l'assiette,
donc elle supporte des charges patronales — elle coûte plus que son montant
facial. Le taux retenu, **42 %**, est une hypothèse. Le taux réel dépend du niveau de rémunération, des
allègements applicables et de la situation de l'employeur — l'ancien repère de
1,6 SMIC ne décrit plus le dispositif depuis la refonte de la réduction générale
dégressive, et il a été retiré. **42 % est un ordre de grandeur modifiable, pas
un calcul de paie.**

**Exemple complet** — VE éligible, supervision à 8 €/mois, borne de 1 500 €
conservée par le salarié après 2 ans :

| Poste | Montant |
| --- | --- |
| Électricité remboursée | 347 € |
| Abonnement de supervision | 96 € |
| Charges patronales sur la fraction réintégrée (42 %) | 20 € |
| **Coût récurrent, par an et par salarié** | **463 €** |
| Borne — dépense unique | 1 500 € |
| Charges sur la part réintégrée de la borne | 315 € |
| **Total la première année** | **2 278 €** |
| Borne étalée sur 8 ans | 188 €/an |

---

## 8. Tout ce qui est affiché

**Avant le formulaire de contact :** le verdict en grand, la branche retenue, la
phrase d'explication, puis trois métriques — coût mensuel pour le salarié,
remboursement annuel, part exonérée. Plus les avertissements éventuels.

**Après le formulaire :**

| Bloc | Contenu |
| --- | --- |
| Le montant à rembourser | remboursement annuel, part exonérée, part soumise, plafond applicable |
| Ce que ça vous coûte, tout compris | les sept lignes du §7 |
| La qualité de votre preuve | niveau, et attribution des sessions possible ou non |
| La supervision, et son régime propre | abonnement annuel, part exclue, part soumise, règle appliquée |
| La borne au domicile | prise en charge, part exclue, part soumise, règle appliquée |
| Le levier des heures creuses | économie annuelle d'une bascule complète |
| Si toute l'énergie était rechargée ainsi | domicile HC, domicile base, site, public AC, public DC — **base TTC ou HT indiquée** |
| Vos hypothèses | chaque ligne étiquetée **« réglementaire »** ou **« hypothèse OTONOM »** |

---

## 9. Paramètres

**Réglementaires — table datée par millésime**, le régime expirant le 31/12/2027
et les plafonds étant revalorisés chaque 1er janvier : plafonds de borne, taux
des frais d'utilisation, plafonds de prime de transport, barème kilométrique,
majoration électrique.

**Hypothèses OTONOM — modifiables, affichées comme telles :** tarifs réglementés
au 01/08/2026 (base 0,2001 · HP 0,2142 · HC 0,1589 €/kWh TTC), consommations
15/17/20/22 kWh/100 km, rendement de charge 0,88, supervision 8 €/mois par point,
charges patronales 42 %, amortissement de borne 8 ans, comparaisons site
0,158–0,207 €/kWh HT et public 0,40–0,58 €/kWh TTC.

---

## 10. Ce que le simulateur refuse de dire

- jamais « conforme URSSAF » à propos d'une méthode de mesure — aucune doctrine
  ne la fixe ;
- jamais « borne communicante obligatoire » ;
- jamais les 600 € de prime de transport sans leurs conditions d'éligibilité ni
  l'interdiction de cumul ;
- jamais un verdict favorable sur la seule mention « électrique ».

**Cette prudence est-elle justifiée, ou rend-elle le simulateur inutile sur
certains points ?**

---

## 11. Ce qui reste non vérifié

Le **régime de la supervision** (§6.2), qui repose sur ma lecture de l'article 4
et non sur une doctrine publiée. Le **taux de charges patronales** et le **prix
de marché d'un abonnement de supervision**, tous deux hypothèses non sourcées.

**N'est plus en attente :** le barème kilométrique. La majoration de 20 % pour
les véhicules 100 % électriques et l'inclusion des frais de recharge dans le
barème sont confirmées sur impots.gouv.fr et le BOFiP ; les coefficients ont été
recoupés indépendamment.

Hors périmètre assumé : recharge photovoltaïque au domicile, surcoût
d'abonnement électrique provoqué par la borne, copropriété, offres à
tarification dynamique, TVA sur l'électricité remboursée.

---

*Rapport de fonctionnement OTONOM, 11/08/2026. Aucune valeur contractuelle.*
