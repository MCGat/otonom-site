# Spécification — Simulateur « Combien de bornes pour mon camping / hôtel ? »

> **Statut : proposition, à valider.** Document destiné à la vérification externe (ChatGPT)
> avant développement. Rédigé le 05/08/2026.
> Nom de travail : **Simulateur de dimensionnement IRVE tourisme**.
> URL cible : `/simulateurs/bornes-camping-hotel`.

---

## 1. La promesse en une phrase

Répondre à la seule question que se pose un gérant de camping ou d'hôtel — **« combien de
bornes, de quelle puissance, pour combien, et est-ce que ça se rembourse ? »** — avec un
calcul fondé sur sa capacité réelle, son taux d'occupation et sa puissance souscrite, pas
sur une règle de pouce commerciale.

---

## 2. Pourquoi ce simulateur, et ce qui le rend différent

Le marché raconte trois choses fausses à ce public. Elles constituent notre angle.

### 2.1 « Vous êtes obligé de vous équiper » — faux dans la grande majorité des cas

L'article **L113-14 du code de la construction et de l'habitation** écarte explicitement de
l'obligation les **parcs de stationnement appartenant à des PME** au sens de la
recommandation européenne **2003/361/CE**. Or l'immense majorité des campings et hôtels
français sont des PME.

L'obligation de l'article **L113-13** — au moins un point de recharge accessible PMR pour un
parc existant de **plus de 20 emplacements**, puis un point par tranche de 20 emplacements
supplémentaires, exigible au **1ᵉʳ janvier 2025** — ne les vise donc pas.

L'article **L113-12**, qui vise les bâtiments **neufs** et les **rénovations importantes**
(coût ≥ 25 % de la valeur du bâtiment) dotés de plus de **10 emplacements**, est tout aussi
neutralisé par l'exemption PME. Pour mémoire, en non résidentiel il impose : **une place sur
cinq pré-équipée**, **2 % des places accessibles PMR** (au moins une), **au moins un point de
recharge installé**, et **deux points au-delà de 200 places**.

Deux autres portes de sortie existent, applicables à tous : les travaux d'adaptation du
réseau **en amont** qui coûteraient plus cher que l'installation en aval, et le seuil des
**7 % du coût total de rénovation** (L113-14, 1°).

> **Ce que le simulateur doit dire :** « Vous n'y êtes probablement pas obligé. Vous perdez
> probablement des réservations. » C'est plus vrai, et plus vendeur, que de brandir une
> obligation inexistante.

**Conséquence sur le formulaire.** Affirmer « vous n'êtes pas obligé » exige de l'établir,
pas de le supposer. Cinq questions suffisent, et elles doivent être posées :

1. Possédez-vous les murs **et** le parking ?
2. Les occupez-vous vous-même ?
3. Êtes-vous une PME indépendante, ou appartenez-vous à un groupe dépassant les seuils
   européens (250 salariés, 50 M€ de chiffre d'affaires ou 43 M€ de bilan) ?
4. Le parking est-il existant, neuf, ou en rénovation importante ?
5. Combien compte-t-il de places ?

Sans ces réponses, le simulateur ne conclut rien sur le plan réglementaire — il le dit et
propose de faire vérifier.

### 2.1 bis — Vocabulaire : borne ≠ point de recharge

La réglementation compte des **points de recharge**, jamais des bornes. Une borne double
alimentant deux véhicules simultanément vaut **deux points de recharge**.

Le simulateur calcule donc en **points**, et traduit ensuite en **bornes** pour le devis
(une borne double coûte moins cher que deux bornes simples). La page peut s'intituler
« combien de bornes » — c'est la requête réelle des gérants — mais le résultat doit afficher
les deux : « **6 points de recharge, soit 3 bornes doubles** ». Confondre les deux, c'est
soit sous-dimensionner de moitié, soit doubler le budget.

### 2.2 « ADVENIR finance vos bornes » — le guichet est fermé

Le guichet **« point de recharge ouvert à tout public sur parking privé »**, celui qui
couvrait hôtels, restaurants et commerces, est **fermé depuis le 30 juin 2023** (source :
advenir.mobi). Il proposait 30 % du coût HT, plafonné à 1 000 € par point supervision
comprise.

Les guichets ADVENIR encore ouverts au 05/08/2026 sont : **immeuble collectif**, **poids
lourds et autocars**, **voirie publique**, **Corse et Outre-Mer**. Aucun ne couvre le
parking d'un camping ou d'un hôtel de métropole pour des véhicules légers.

Le simulateur doit donc afficher **zéro aide nationale par défaut**, et orienter vers les
dispositifs régionaux, qui existent mais varient. C'est un contre-pied total du discours
ambiant : c'est exactement ce qui le rendra crédible et citable.

⚠️ **[À CONFIRMER n° 1]** — Les conditions exactes du guichet **Corse et Outre-Mer** :
un camping corse ou ultramarin est-il éligible, pour quel type de parking, à quel taux et
quel plafond ? La page de détail n'a pas pu être lue.

### 2.3 « Dimensionnez sur 30 % de véhicules électriques » — erreur d'un facteur cinq

Les 27 à 30 % que l'on lit partout sont la part de l'électrique dans les **immatriculations
neuves**. Ce qui roule sur les routes, et donc ce qui entre dans un camping, c'est le
**parc en circulation** : **3,5 % de véhicules 100 % électriques et 2,0 % d'hybrides
rechargeables au 1ᵉʳ janvier 2026**, soit **5,5 %** (SDES).

Dimensionner sur 30 % au lieu de 5,5 % multiplie l'investissement par cinq. C'est l'erreur
la plus coûteuse du marché, et personne ne la relève.

Mais dimensionner sur 5,5 % serait tout aussi faux : **une borne s'amortit sur huit à dix
ans**. Il faut dimensionner sur le parc **projeté à l'horizon d'amortissement**, pas sur le
parc d'aujourd'hui. Le simulateur doit rendre cette projection visible et modifiable.

---

## 3. Ce que le simulateur calcule

### 3.1 Entrées

| Champ | Type | Défaut | Rôle |
|---|---|---|---|
| Type d'établissement | camping · hôtel · résidence de tourisme · chambres d'hôtes | camping | pilote les ratios |
| Capacité | nombre d'emplacements ou de chambres | 150 | base de tout le calcul |
| Places de stationnement | nombre | = capacité | contrainte physique |
| Taux d'occupation en haute saison | % | 80 % | véhicules réellement présents |
| Durée moyenne de séjour | nuits | 7 (camping) · 1,8 (hôtel) | **détermine le rythme des arrivées** |
| Part de clientèle étrangère | % | 25 % | corrige la part de véhicules électriques |
| Saisonnalité | annuel · saisonnier (nb de mois) | 5 mois | recettes et amortissement |
| Puissance souscrite | kVA | 250 | contrainte électrique |
| Pointe actuelle de l'établissement | kW ou « je ne sais pas » | 80 % du souscrit | marge disponible |
| Distance au tableau électrique | m | 60 | génie civil |
| Horizon de dimensionnement | 2026 → 2034 | 2030 | **projection du parc électrique** |
| Ambition de service | essentiel · confort · premium | confort | facteur de dimensionnement |
| **Usage visé** | clients seuls · ouvert aux visiteurs · salariés compris | clients seuls | **change le régime, voir §3.6** |
| **Tarification** | offerte · payante · incluse dans le séjour | payante | pilote les recettes |
| Propriétaire des murs et du parking | oui · non | oui | qualification réglementaire |
| Occupant du bâtiment | oui · non | oui | qualification réglementaire |
| PME indépendante ou groupe | PME · groupe · je ne sais pas | PME | **exemption L113-14** |
| État du parking | existant · neuf · rénovation importante | existant | L113-12 ou L113-13 |
| Localisation | code postal | — | métropole / Corse / Outre-Mer, aides régionales |
| Classement recherché | oui · non | non | critère Atout France, voir §3.7 |

**Tout champ technique doit proposer « je ne sais pas ».** Un directeur de camping ne
connaît ni sa puissance disponible, ni la part de véhicules électriques de sa clientèle.
Chaque « je ne sais pas » bascule sur une valeur par défaut **affichée comme telle**, jamais
masquée : c'est ce qui distingue une estimation honnête d'un chiffre sorti de nulle part.

### 3.2 Moteur — la demande

**Étape 1. Véhicules présents une nuit de haute saison**

```
vehicules_presents = capacite × occupation × vehicules_par_unite
```
`vehicules_par_unite` : 1,0 en camping (une famille, une voiture), 0,75 en hôtel,
1,1 en résidence de tourisme. **[À CONFIRMER n° 2]**

**Étape 2. Part de véhicules rechargeables parmi eux**

```
part_VE = part_parc(horizon) × correction_etrangere × correction_clientele
```
- `part_parc(2026)` = 5,5 % (3,5 % électriques + 2,0 % hybrides rechargeables, SDES).
- Trajectoire retenue : **+1,5 point de parc par an**, soit ~11 % en 2030 et ~17 % en 2034.
  **[À CONFIRMER n° 3]** — c'est l'hypothèse la plus structurante du modèle.
- `correction_etrangere` : les clientèles néerlandaise, allemande et belge sont plus
  électrifiées que la française. Coefficient 1,0 à 1,4 selon la part étrangère.
  **[À CONFIRMER n° 4]**
- `correction_clientele` : les propriétaires de véhicules électriques ont un revenu moyen
  supérieur, ce qui les sur-représente dans l'hôtellerie de gamme et sous-représente les
  campings d'entrée de gamme. Coefficient 0,8 à 1,3. **[À CONFIRMER n° 5]**

**Étape 3. Combien ont besoin de recharger cette nuit**

C'est ici que tous les outils du marché se trompent : **un client qui reste sept nuits ne
recharge pas sept fois.**

```
arrivees_par_nuit = capacite × occupation / duree_sejour
VE_arrivants     = arrivees_par_nuit × part_VE
VE_en_sejour     = (vehicules_presents − arrivees_par_nuit) × part_VE

sessions_par_nuit = VE_arrivants × 0,90 + VE_en_sejour × taux_appoint
```
- Un véhicule qui **arrive** a roulé : il veut charger. Taux retenu **0,90**.
- Un véhicule **déjà sur place** ne recharge que s'il a fait des excursions.
  `taux_appoint` = 0,25 en camping, 0,15 en hôtel de séjour. **[À CONFIRMER n° 6]**

C'est ce terme qui explique pourquoi **un hôtel a besoin de plus de bornes qu'un camping à
capacité égale** : à 1,8 nuit de séjour moyen, presque tout le parc se renouvelle chaque
nuit, alors qu'à 7 nuits, un septième seulement arrive.

**Étape 4. Du besoin aux points de charge**

```
points = arrondi_sup( sessions_par_nuit × facteur_pointe / rotations_par_nuit )
```
- `facteur_pointe` : les arrivées ne sont pas réparties uniformément — le samedi en camping,
  le début de semaine en hôtel d'affaires. Coefficient **1,4**. **[À CONFIRMER n° 7]**
- `rotations_par_nuit` = **1** en charge lente : le véhicule reste branché toute la nuit,
  personne ne vient le débrancher à 2 h du matin. C'est une contrainte d'usage, pas de
  puissance — et c'est pourquoi ajouter de la puissance ne réduit pas le nombre de points.
- En charge rapide de passage (option), `rotations_par_nuit` peut monter à 3 ou 4, mais
  l'investissement par point est dix fois supérieur.

Le résultat est rendu en **trois niveaux** : essentiel (× 0,7), confort (× 1,0),
premium (× 1,4), chacun avec sa conséquence en investissement.

**Et surtout, en deux temps.** Un chiffre unique est une mauvaise réponse à un marché qui
double tous les trois ans. Le pré-équipement — fourreaux, attente électrique, réservation de
puissance — coûte une fraction du point installé, et se pose une seule fois, pendant que la
tranchée est ouverte. La bonne restitution est donc :

> « Nous estimons votre besoin entre 6 et 8 points de recharge à l'horizon 2030.
> Installez-en **6 maintenant**, **pré-équipez 4 emplacements** de plus : la deuxième
> tranche vous coûtera alors le prix des bornes, pas celui du chantier. »

Le simulateur calcule donc `points_maintenant` (horizon court) et `points_pre_equipes`
(horizon long − horizon court), et chiffre le surcoût du pré-équipement séparément.

### 3.3 Moteur — la puissance

```
P_installee = points × puissance_unitaire
P_appelee_sans_pilotage = P_installee × simultaneite_soir
marge_disponible = P_souscrite × 0,93 − pointe_etablissement
```
- `puissance_unitaire` : **7,4 kW** en monophasé, **11 kW** en triphasé, 22 kW rarement
  justifié pour une charge de nuit. Une nuit de 12 h à 7,4 kW délivre ~85 kWh : bien plus
  que ce dont un client a besoin.
- `simultaneite_soir` = 0,9 sans pilotage : tout le monde se branche en rentrant.
- Le facteur **0,93** convertit la puissance apparente souscrite (kVA) en puissance active
  (kW) — même règle que dans notre simulateur de TCO.

**Le piège propre au camping :** sa pointe de consommation, c'est le soir de haute saison,
exactement quand les véhicules se branchent. La marge est minimale au pire moment. Le
simulateur doit comparer à la **pointe**, jamais à la moyenne.

Si `P_appelee > marge_disponible`, deux issues chiffrées et comparées :
1. **Pilotage de charge** : plafonne l'appel sous la marge, en répartissant sur la nuit.
   Une nuit de 12 h absorbe beaucoup : le pilotage suffit dans la plupart des cas.
2. **Renforcement du raccordement** : coûteux, long, à éviter quand c'est évitable.

**Le résultat s'affiche en puissance pilotée, jamais en somme des puissances maximales.**
Écrire « 8 points × 11 kW = 88 kW » est trompeur et fait fuir le gérant. La bonne
formulation, celle qui montre l'intérêt du pilotage :

> « **8 points de recharge de 11 kW, plafonnés dynamiquement à 44 kW** pour l'ensemble du
> parking. »

Deux précisions à faire figurer, parce qu'elles évitent une déception :
- **Tous les véhicules n'acceptent pas 22 kW en courant alternatif** — beaucoup plafonnent à
  7,4 ou 11 kW. Installer du 22 kW ne triple donc pas la vitesse pour tout le monde.
- Une nuit de 12 h à 7,4 kW délivre environ 85 kWh, bien plus qu'un client n'en a besoin.
  Sur un séjour, **la durée de stationnement remplace la puissance**.

**Étude de conception électrique obligatoire.** Dès **50 places** dans le parc de
stationnement, une étude de conception est requise avant travaux, et l'installation doit être
réalisée par un professionnel **qualifié IRVE** (décret n° 2021-546 du 4 mai 2021 et arrêté
du 27 octobre 2021). Beaucoup de campings dépassent ce seuil. Le simulateur doit l'annoncer
comme une étape du projet, et se présenter lui-même pour ce qu'il est : **une estimation
préalable, en aucun cas une étude électrique**. **[À CONFIRMER n° 12]** — vérifier le seuil
et les textes sur Légifrance, la source consultée étant secondaire.

### 3.6 Réservé aux clients ou ouvert au public : deux projets différents

C'est une bifurcation, pas une option. Le simulateur doit poser la question tôt et en tirer
les conséquences.

| | Réservé aux clients | Ouvert aux visiteurs extérieurs |
|---|---|---|
| Accès | badge, code, ou compris dans le séjour | libre, paiement à l'acte |
| Dimensionnement | sur la clientèle hébergée seule | + demande de passage, imprévisible |
| Contraintes | aucune particulière | itinérance, affichage des prix, interopérabilité |
| Recettes | marge sur les kWh des clients | + clientèle extérieure, mais concurrence des réseaux |
| Aides | aucune (voir §2.2) | c'était précisément le guichet ADVENIR fermé en 2023 |

Ouvrir au public transforme un service d'hébergeur en activité de recharge, avec ses
obligations propres. Le simulateur ne doit pas laisser croire que c'est le même projet.

### 3.7 Le classement touristique, un levier plus fort que l'obligation

La borne de recharge figure au **référentiel de classement d'Atout France** : critère
**n° 222** du tableau de classement des hôtels de tourisme, et critère **n° 125** de celui
des meublés de tourisme, l'un et l'autre à justifier lors de l'inspection.

C'est un argument bien plus mobilisateur qu'une obligation dont l'établissement est exempté :
il touche au classement en étoiles, donc au prix moyen et à la visibilité.

Le simulateur pose donc la question : **« Souhaitez-vous que l'installation contribue au
classement ou à son renouvellement ? »** — et, si oui, rappelle que la borne doit être
destinée à la clientèle de l'établissement : un point de recharge public dans la rue voisine
ne vaut pas le critère.

⚠️ **[À CONFIRMER n° 13]** — Le critère est-il **obligatoire** ou **optionnel à points** dans
le référentiel, et à partir de quelle catégorie d'étoiles ?
⚠️ **[À CONFIRMER n° 14]** — **Existe-t-il l'équivalent au référentiel de l'hôtellerie de
plein air ?** Je ne l'ai trouvé que pour l'hôtel et les meublés. C'est pourtant le camping
qui est notre cible principale : à vérifier avant d'écrire quoi que ce soit là-dessus.

### 3.4 Moteur — l'argent

**Investissement**
```
invest = points × cout_point + genie_civil(distance, nb_zones) + pilotage + renforcement
```

**Recettes** — le camping revend l'électricité :
```
kWh_annuels = sessions_par_nuit × kWh_par_session × nuits_exploitees × occupation_moyenne
marge_kWh   = prix_revente − prix_achat
recette     = kWh_annuels × marge_kWh
```
- `kWh_par_session` : 30 kWh pour un arrivant, 12 kWh pour un appoint. **[À CONFIRMER n° 8]**
- `prix_revente` : 0,35 à 0,50 €/kWh. `prix_achat` : le tarif professionnel du site.
- **Un établissement saisonnier n'exploite que 5 mois** : c'est ce qui allonge le retour sur
  investissement, et c'est précisément ce que les simulateurs génériques oublient.

**Le vrai retour sur investissement est ailleurs, et il faut le dire sans l'inventer.**
Les plateformes de réservation (Booking, Camping.fr, Huttopia) proposent un filtre
« borne de recharge » : un établissement non équipé **disparaît des résultats** pour cette
clientèle. Le gain se compte en nuitées non perdues, pas en kilowattheures vendus.

Le simulateur doit donc afficher **deux retours sur investissement** :
- le retour **par la vente d'électricité** seul, calculable et prudent ;
- le nombre de **nuitées supplémentaires par an** nécessaires pour rembourser le reste —
  une donnée que le gérant sait interpréter immédiatement, sans que nous ayons à inventer
  un taux de conversion.

C'est la présentation la plus honnête possible : nous ne prétendons pas connaître son
marché, nous lui donnons le seuil à franchir.

### 3.5 Sorties — quatre réponses distinctes, jamais fondues en une

C'est la structure qui donne sa valeur au simulateur : quatre questions différentes, quatre
réponses séparées.

**1. Votre minimum réglementaire**
Ce que la loi exige de vous — souvent **zéro**, exemption PME à l'appui, avec l'article cité.
Répond à « suis-je en infraction ? ».

**2. Votre besoin réel**
« Entre 6 et 8 points de recharge à l'horizon 2030 — 6 à installer, 4 emplacements à
pré-équiper », en trois niveaux de service. Répond à « de quoi ai-je besoin ? ».
Affiché en **points de recharge et en bornes**.

**3. Votre puissance**
« 6 points de 11 kW, plafonnés dynamiquement à 33 kW » — et le verdict : pilotage suffisant,
ou renforcement à prévoir. Répond à « mon installation tient-elle ? ».

**4. Vos aides**
« Aucune prime nationale identifiée pour ce cas en 2026 », avec l'explication du guichet
ADVENIR fermé, puis les pistes régionales **à faire vérifier**, jamais chiffrées. Répond à
« qui paie ? ».

**Puis le volet financier :** investissement détaillé, recette annuelle par la vente
d'électricité, retour sur investissement, et le **nombre de nuitées supplémentaires par an**
nécessaires pour rembourser le solde.

**Et un avertissement permanent :** ceci est une estimation préalable. Au-delà de 50 places,
une étude de conception électrique par un professionnel qualifié IRVE est obligatoire.

---

## 4. Hypothèses de coût à caler

| Poste | Valeur proposée | Statut |
|---|---|---|
| Point de charge 7,4 kW, pose comprise | 1 800 € HT | **[À CONFIRMER n° 9]** |
| Point de charge 11 kW, pose comprise | 2 400 € HT | **[À CONFIRMER n° 9]** |
| Borne double 2 × 11 kW | 3 900 € HT | **[À CONFIRMER n° 9]** |
| Charge rapide 50 kW DC | 30 000 € HT | **[À CONFIRMER n° 9]** |
| Génie civil, tranchée | 80 €/m HT | **[À CONFIRMER n° 9]** |
| Pilotage de charge | 3 500 € HT | repris du simulateur TCO |
| Supervision et paiement, par point et par an | 180 € HT | **[À CONFIRMER n° 9]** |
| Renforcement de raccordement | 12 000 € HT | repris du simulateur TCO |

Ces valeurs doivent être calées avec OTONOM avant mise en ligne. Le même défaut que sur le
simulateur de TCO — des hypothèses de marché non validées par l'exploitant — ne doit pas se
reproduire.

---

## 5. Cas de test à figer

| Cas | Attendu à vérifier |
|---|---|
| Camping 150 emplacements, 80 %, séjour 7 nuits, horizon 2030 | ~4 à 6 points |
| Hôtel 40 chambres, 70 %, séjour 1,8 nuit, horizon 2030 | **plus de points qu'un camping de 150 emplacements** — la contre-intuition à vérifier |
| Camping 60 emplacements, horizon 2026 | 1 à 2 points : ne pas sur-équiper un petit site |
| Même camping, horizon 2034 | doit croître nettement, sinon la projection ne sert à rien |
| Puissance souscrite très juste | doit basculer sur « pilotage indispensable » |
| Établissement saisonnier 5 mois vs annuel | le retour sur investissement doit environ doubler |

---

## 6. Cocon sémantique « Camping / CHR »

**Requête pilier : « combien de bornes camping »** — faible concurrence éditoriale, forte
intention transactionnelle, et aucune réponse chiffrée sérieuse en ligne aujourd'hui.

**H1 de la page** : « Combien de bornes de recharge pour mon camping ou mon hôtel ? »
**Title** : « Combien de bornes pour un camping ou un hôtel ? Simulateur — OTONOM »

| | Titre proposé | Requête visée |
|---|---|---|
| **Pilier** | Combien de bornes de recharge pour un camping ? La méthode de calcul | combien de bornes camping |
| S1 | Borne de recharge en camping : coût d'installation et rentabilité réelle | prix borne recharge camping |
| S2 | Un camping est-il obligé d'installer des bornes de recharge ? | obligation borne recharge camping |
| S3 | Quel prix facturer la recharge à ses clients ? | tarif recharge camping client |
| S4 | Bornes de recharge en hôtel : dimensionner selon le taux de rotation | borne recharge hôtel |
| S5 | Puissance souscrite d'un camping : éviter le renforcement de raccordement | puissance souscrite camping |
| S6 | 7,4, 11 ou 22 kW : quelle puissance pour un hébergement touristique ? | quelle puissance borne camping |
| S7 | Peut-on recharger une voiture sur la prise d'un emplacement de camping ? | recharger voiture prise camping |
| S8 | Recharge offerte ou payante en camping : ce que font les autres | borne gratuite ou payante camping |

**S7 mérite une attention particulière.** C'est une question que les clients posent
réellement aux gérants, et la réponse touche à la sécurité : une prise d'emplacement n'est
pas dimensionnée pour huit heures de charge à pleine intensité. C'est le genre d'article
qui se cite tout seul, et personne de sérieux ne l'a écrit.

S5 relie ce cocon à celui du TCO, via l'article existant sur la recharge pilotée : les deux
cocons partagent le nœud « puissance souscrite et pilotage », ce qui les renforce mutuellement
sans les faire se cannibaliser.

**Liens externes officiels visés** : Légifrance (L113-12 à L113-14), advenir.mobi (état des
guichets), SDES (parc en circulation), ADEME.

---

## 7. Points à confirmer — récapitulatif

| N° | Point | Pourquoi c'est important |
|---|---|---|
| 1 | Conditions du guichet ADVENIR Corse et Outre-Mer | seule aide nationale peut-être mobilisable |
| 2 | Véhicules par emplacement / par chambre | multiplie tout le calcul |
| 3 | Trajectoire du parc électrique 2026 → 2034 | hypothèse la plus structurante |
| 4 | Sur-électrification des clientèles NL / DE / BE | pertinent surtout en littoral |
| 5 | Effet du niveau de gamme sur la part de véhicules électriques | peut être supprimé si non étayé |
| 6 | Taux de recharge d'appoint en séjour | différencie camping et hôtel |
| 7 | Facteur de pointe des arrivées | le samedi du camping |
| 8 | Énergie moyenne par session | pilote toute la recette |
| 9 | Tous les coûts d'investissement | à caler avec OTONOM |
| ~~10~~ | ~~Critère « borne de recharge » au classement Atout France~~ | ✅ **Confirmé** : critère n° 222 (hôtels de tourisme), n° 125 (meublés), au référentiel officiel |
| 11 | Le classement « en éclairs » des campings est-il officiel ou un label privé ? | ne rien affirmer sans réponse |
| 12 | Seuil de 50 places déclenchant l'étude de conception obligatoire | source secondaire seulement (décret 2021-546 + arrêté 27/10/2021), à confirmer sur Légifrance |
| 13 | Le critère 222 est-il obligatoire ou optionnel à points, et dès quelle catégorie ? | change la force de l'argument commercial |
| 14 | **Équivalent au référentiel de l'hôtellerie de plein air ?** | le camping est notre cible principale et c'est le seul référentiel que je n'ai pas trouvé |

---

## 8. Retour de la relecture externe — ce qui a été intégré, et ce qui a été écarté

### Intégré
- Séparation en **quatre réponses distinctes** (§3.5) plutôt qu'un chiffre unique.
- **Questions de qualification réglementaire** (§2.1) : affirmer une exemption exige de l'établir.
- **Déploiement en deux temps** : installer maintenant, pré-équiper pour la suite (§3.2).
- **Verrou de vocabulaire** borne / point de recharge (§2.1 bis).
- **Étude de conception obligatoire à 50 places** et qualification IRVE (§3.3).
- **Réservé aux clients ou ouvert au public** traité comme une bifurcation (§3.6).
- **Classement Atout France** vérifié et intégré comme levier commercial (§3.7).
- Affichage en **puissance pilotée** plutôt qu'en somme des puissances maximales.
- **« Je ne sais pas »** sur tous les champs techniques.
- Trois articles ajoutés au cocon, dont la recharge sur prise d'emplacement.

### Écarté
- **Le renommage en « simulateur de stratégie IRVE touristique ».** La requête réelle des
  gérants est « combien de bornes camping ». On garde ce positionnement : un outil qui répond
  à la question posée, pas un concept qui la reformule.
- **Le chiffrage des aides régionales.** La relecture suggérait de maintenir une base par
  région : trop instable, trop risqué. On présélectionne et on fait vérifier par un conseiller.

### Ce que la relecture n'a pas vu, et qui reste notre différence
- **Le piège des 30 % contre 5,5 %** (§2.3) : dimensionner sur les immatriculations neuves
  au lieu du parc en circulation multiplie l'investissement par cinq. Aucune relecture ne l'a
  relevé, et c'est l'erreur la plus coûteuse du marché.
- **Arrivées contre présence** (§3.2, étape 3) : la relecture propose un simple « part des
  clients ayant besoin de recharger », qui est précisément le raccourci qui surestime. Le
  besoin naît des **arrivées**, pas de la présence — d'où le fait qu'un hôtel de 40 chambres
  ait besoin de plus de points qu'un camping de 150 emplacements.
- **La saisonnalité** : cinq mois d'exploitation doublent le retour sur investissement.
- **Le modèle de recettes**, absent de la relecture : marge sur les kilowattheures, puis
  seuil en nuitées supplémentaires plutôt qu'une prévision commerciale inventée.

---

## 9. Ce que ce simulateur ne fera pas

- Pas de devis : les coûts dépendent du site, de la distance au tableau, du sol.
- Pas de choix de matériel ni de marque : OTONOM n'est pas vendeur de bornes.
- Pas de promesse de fréquentation supplémentaire : nous donnons le seuil à atteindre,
  pas une prévision commerciale que nous ne savons pas faire.
- Pas de calcul de subvention régionale : elles varient trop, elles se vérifient au cas par cas.
