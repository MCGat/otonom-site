# Cocon sémantique « Collaborateurs »

Architecture éditoriale du cocon adossé au simulateur
**/simulateurs/recharge-domicile-salarie**. Rédigé le 11/08/2026.

Intention transverse : **un salarié utilise un véhicule électrique et recharge
chez lui. Qui paie quoi, combien, et comment le justifier ?**
Personas : **DRH** (traitement social, équité), **DAF** (coût, risque de
redressement), **gestionnaire de flotte** (politique de recharge).

---

## 1. La frontière avec l'existant — le point à ne pas rater

Deux articles déjà en ligne touchent au sujet. **Ils ne doivent pas être
cannibalisés**, ils doivent devenir des portes d'entrée.

| Article existant | Ce qu'il couvre | Frontière |
| --- | --- | --- |
| `cout-recharge-flotte-entreprise` (cocon TCO) | Le €/kWh d'une **flotte**, l'effet du mix, la TVA. Une section effleure le coût social du domicile. | Il raisonne **flotte et budget énergie**, pour un DAF. Le cocon Collaborateurs raisonne **un salarié et sa paie**. |
| `avantage-en-nature-vehicule-electrique` (cocon fiscalité) | Le **calcul** de l'avantage en nature, abattement de 70 %, plafond 2026. | Il calcule l'avantage du **véhicule**. Le cocon Collaborateurs traite **l'électricité**, qui en est justement exclue. |

**Règle de non-cannibalisation :** aucun article du cocon ne recalcule
l'avantage en nature du véhicule, et aucun ne refait le €/kWh d'une flotte. Les
deux articles existants reçoivent un lien entrant depuis le pilier ; c'est la
seule porosité admise entre cocons, et elle est justifiée par l'intention du
lecteur.

---

## 2. Les huit articles

### PILIER — `cout-recharge-domicile-salarie`

**Titre** : Recharge à domicile d'un salarié : coût réel et remboursement
**Requête** : *coût recharge domicile salarié*
**Angle** : le calcul complet — kilowattheures, tarif, heures creuses — puis
l'aiguillage vers le régime applicable. C'est la page qui répond à la question
telle qu'elle se pose, et qui distribue vers les sept satellites.

### Satellites

| # | Slug | Titre | Requête visée |
| --- | --- | --- | --- |
| 1 | `qui-paie-recharge-vehicule-fonction` | Véhicule de fonction électrique : qui paie la recharge ? | qui paie la recharge d'un véhicule de fonction |
| 2 | `remboursement-recharge-domicile-urssaf` | Rembourser la recharge à domicile : les règles URSSAF 2026 | remboursement recharge domicile salarié urssaf |
| 3 | `borne-recharge-domicile-salarie` | Borne au domicile du salarié : qui paie et quel régime ? | borne de recharge domicile salarié employeur |
| 4 | `justificatif-remboursement-recharge-domicile` | Justifier le remboursement de recharge à domicile d'un salarié | justificatif remboursement recharge domicile |
| 5 | `indemnite-kilometrique-vehicule-electrique` | Indemnités kilométriques et véhicule électrique en 2026 | indemnité kilométrique véhicule électrique 2026 |
| 6 | `prime-transport-vehicule-electrique` | Prime de transport et véhicule électrique : 600 € en 2026 | prime transport véhicule électrique domicile travail |
| 7 | `politique-recharge-collaborateurs` | Politique de recharge : le document qui évite les litiges | politique de recharge entreprise collaborateurs |

---

## 3. Le maillage

**Descendant** — le pilier pointe vers les sept satellites, chacun sur l'ancre
qui correspond à sa requête.

**Remontant** — chaque satellite pointe vers le pilier, une fois, sur une ancre
descriptive.

**Latéral** — les paires qui se répondent naturellement :

- 1 ↔ 2 (qui paie → à quelles conditions sociales)
- 2 ↔ 4 (le régime → comment le prouver)
- 3 ↔ 2 (la borne → le régime de l'électricité, distinct)
- 5 ↔ 6 (véhicule personnel : déplacement professionnel vs domicile-travail)
- 7 ← tous (la politique de recharge est l'aboutissement)

**Sortant, hors cocon** — uniquement depuis le pilier, et seulement deux :
`avantage-en-nature-vehicule-electrique` et `cout-recharge-flotte-entreprise`.

**Conversion** — chaque article porte le bloc simulateur automatique sous le
TL;DR (rendu par la page, cocon `collaborateurs`), plus un lien contextuel vers
`/simulateurs/recharge-domicile-salarie` et un vers `/drh` ou `/daf` selon le
persona dominant.

---

## 4. Les faits de référence, communs à tout le cocon

Un chiffre ne doit jamais varier d'un article à l'autre. Ceux-ci font foi.

| Fait | Valeur | Nature |
| --- | --- | --- |
| Tarif réglementé, base, 6 kVA, au 01/08/2026 | 0,2001 €/kWh TTC | officiel |
| Heures pleines / heures creuses | 0,2142 / 0,1589 €/kWh TTC | officiel |
| Écart heures creuses / base | 20,6 % | calculé |
| Abattement AEN véhicule électrique, forfait | 70 %, plafond 4 641,60 €/an (2026) | officiel |
| Borne conservée, cinq ans ou moins | 50 % des dépenses, plafond 1 057,10 € | officiel 2026 |
| Borne conservée, plus de cinq ans | 75 %, plafond 1 585,50 € | officiel 2026 |
| Prime de transport, alimentation électrique | 600 €/an/salarié | officiel |
| Sous-plafond carburant thermique | 300 €/an/salarié | officiel |
| Majoration kilométrique véhicule électrique | + 20 % | officiel |
| Fin du régime dérogatoire | 31/12/2027 | officiel |
| Cas de référence : compacte, 17 kWh/100 km, 15 000 km, 80 % à domicile | 2 040 kWh/an à domicile | calcul OTONOM |
| Coût annuel du cas de référence | 324 € en heures creuses, 408 € en base | calcul OTONOM |
| Écart annuel entre les deux options | 84 € par véhicule | calcul OTONOM |

**Deux règles de droit structurantes, à formuler à l'identique partout :**

1. L'arrêté du 25 février 2025 exclut les frais d'électricité du calcul de
   l'avantage en nature (art. 3), et son article 4 précise **« hors frais
   d'électricité »** à propos du plafond de 50 %. Ce plafond ne vise que la borne.
2. Le régime favorable suppose un véhicule fonctionnant **exclusivement** à
   l'électricité, **plus** une condition d'éco-score pour toute mise à
   disposition postérieure au 01/02/2025.

---

## 5. Ce qu'on n'écrit pas

- Aucun article ne dit « conforme URSSAF » à propos d'une méthode de mesure :
  aucune doctrine ne la fixe.
- Aucun article n'affirme qu'une borne communicante est obligatoire.
- Aucun article ne présente les 600 € de prime de transport sans ses conditions
  d'éligibilité ni l'interdiction de cumul avec les transports publics.
- Aucun article ne recalcule l'avantage en nature du véhicule.

---

*Plan de cocon OTONOM, 11/08/2026. Les articles sont rédigés en brouillon et ne
passent en production qu'après validation.*
