# OTONOM — Chantiers à venir

> Ce qui est identifié, chiffré et pas encore fait. Tenu à jour au fil des sessions.
> Dernière mise à jour : **05/08/2026**.

---

## 1. Registre central des faits + script de contrôle

**Priorité : haute.** Le chantier qui rapporte le plus par rapport à son coût.

### Le problème

Le même chiffre officiel vit aujourd'hui dans cinq endroits qui s'ignorent : le moteur
(`app/utils/simulateurs/fiscalite.ts`), les corps d'articles (HTML en base), les pages de
simulateurs, les fichiers de spec, et les fiches de cocon. Rien ne les relie. Quand la loi
change, il faut se souvenir de tout modifier — et on ne s'en souvient jamais complètement.

**Toutes les divergences trouvées le 05/08/2026 viennent de là**, et aucune n'est une erreur
de raisonnement — ce sont des copies qui ont divergé :

| Divergence | Où |
|---|---|
| « 60 à 155 g » contre « 50 à 160 g » | article verdissement contre `PLAFONDS_AMORTISSEMENT` |
| « 4 000 € par véhicule manquant » | article contre la formule à 3 facteurs, correcte dans le moteur |
| 736 € contre 737 € par véhicule | deux articles du même cocon |
| 8 000 € contre 2 963 € d'écart | pilier TCO contre le moteur, sur un cas identique |
| 155 € contre 129 € de loyer non déductible | article financement, arithmétique irreproductible |
| 130/650 € sur toute l'année 2026 | articles **et** moteur, alors que la règle démarre le 01/03/2026 |

### Ce qu'il faut construire

**Étape 1 — le registre.** Un fichier versionné, chaque fait une seule fois, avec sa date
d'effet, sa source et sa date de vérification :

```yaml
taxe_polluants:
  2026-01-01: { categorie_1: 100, plus_polluants: 500 }
  2026-03-01: { categorie_1: 130, plus_polluants: 650 }
  2027-01-01: { categorie_1: 160, plus_polluants: 800 }
  source: https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053545036
  verifie_le: 2026-08-05
```

**Étape 2 — le script de contrôle.** C'est la partie qui a le plus de valeur, et elle ne
touche à rien : elle **détecte**, elle ne substitue pas. Les articles doivent rester
librement éditables dans l'admin.

1. **Scanner les articles** à la recherche des chiffres du registre, et signaler ceux qui ne
   correspondent plus. → aurait attrapé le 60-155 g et le 736/737.
2. **Rejouer le moteur** sur les cas de référence et comparer aux chiffres cités dans les
   articles. → aurait attrapé les 8 000 € du pilier et les 155 € du financement.
3. **Lister ce qui est périmé** : date de fin passée, ou dernière vérification trop ancienne.
   Utile chaque année sur le calendrier réel — loi de finances, 1ᵉʳ janvier, 1ᵉʳ mars,
   1ᵉʳ août pour l'énergie, mises à jour URSSAF/BOSS, ouverture ou fermeture d'un guichet.

**Étape 3, plus tard — brancher le moteur** sur le registre à la place des valeurs en dur.
Plus délicat : il ne faut rien casser dans les calculs déjà publiés. À faire avec
`test/tco.test.ts` comme filet, idéalement à la prochaine loi de finances.

### Ce que ça ne résout pas
Les hypothèses de marché — gazole, valeurs résiduelles, coûts de bornes. Elles entreraient au
registre pour être **datées et tracées**, mais aucun script ne peut dire qu'elles sont justes.

### Coût estimé
Étapes 1 et 2 : environ une demi-journée. Étape 3 : à part, avec les tests de référence.

---

## 2. Corrections du moteur identifiées et non faites

| Sujet | Détail | Impact |
|---|---|---|
| **Taxe polluants et dates** | `MILLESIMES[2026].taxePolluants` applique 130/650 € à toute l'année, alors que l'article L. 421-135 du CIBS entre en vigueur le **01/03/2026** (avant : 100/500 €). Nos simulations démarrant en juillet 2026, le scénario par défaut est juste — le défaut n'apparaît que sur une simulation démarrant avant mars. | faible, mais réel |
| **Majorations de la taxe incitative** | Les majorations de comptabilisation de **50 / 100 / 150 %** des véhicules à faibles émissions, en vigueur depuis le 01/03/2026, ne sont pas modélisées. | à mesurer |
| **Fraction de loyer non déductible** | `partNonDeductible` applique le ratio de dépassement du plafond au **loyer total**. La règle fiscale vise la part de loyer représentative de l'amortissement excédentaire pratiqué par le bailleur, que celui-ci doit communiquer. **Avis d'expert-comptable nécessaire.** Ne touche qu'un chiffre informatif (`isPerduPlafond`), jamais soustrait du TCO. | méthodologique |

---

## 3. Calibrage des hypothèses — décisions du patron

| Paramètre | Valeur actuelle | Constat | Où |
|---|---|---|---|
| **Prix du gazole** | 1,90 €/L | **2,229 €/L** relevé le 05/08/2026 sur 9 805 stations. L'erreur nous dessert : elle minore le coût du thermique, donc l'avantage de l'électrique. Recaler ferait bouger **tous** les chiffres déjà écrits dans le cocon TCO. | `TCO_CONFIG.energie` |
| **Aide ADVENIR** | 1 000 €/point | Le guichet parking privé d'entreprise est **fermé**. Valeur à mettre à zéro ou à conditionner. | `SIM_CONFIG.irve` |
| **Taxe incitative** | 4 000 €/véhicule | Le tarif est juste pour 2026, mais le simulateur de transition ne modélise pas la formule à trois facteurs comme le fait le simulateur de TCO. | `SIM_CONFIG.tai` |
| **Valeurs résiduelles** | 33 % / 42 % à 48 mois | Aucune source publique. À obtenir auprès d'un loueur. | `TCO_CONFIG.valeurResiduelle` |
| **Prix de l'électricité** | 0,158 / 0,207 €/kWh | Calés sur le Tarif Bleu professionnel, mais les tarifs réglementés ont bougé de **+2,5 % TTC au 01/08/2026**. | `TCO_CONFIG.energie` |
| **Coefficients du simulateur de transition** | — | ROI jugé un peu agressif, jamais recalibré avec OTONOM. | `app/utils/simulateur.ts` |

---

## 4. Contenu

- **Réviser le pilier** `tco-vehicule-electrique-entreprise` : nouveau titre et **liens descendants
  vers ses cinq satellites**. Il ne redescend aujourd'hui vers aucun d'eux.
- **Maillage croisé** : quatre articles n'ont **aucun lien entrant** (coût des bornes, TCO
  utilitaire, verdissement, obligations bornes).
- **Semer le cocon dans `server/utils/seedArticles.ts`** : les articles ne vivent qu'en base
  locale, qui est gitignorée. Sans passage par le seed, ils n'atteindront jamais la production.
  Publier **d'un seul tenant**, sinon les liens internes renvoient 404.
- **Longueur** : `cout-recharge-flotte-entreprise` (~3 400 mots) et `cout-bornes-recharge-flotte`
  (~3 900 mots) dépassent largement la fourchette de 1 200 à 2 000. À scinder ou à assumer.
- **Images** : aucune pour l'instant, décision du 05/08/2026. À reprendre en une passe.
- **Homogénéité des lignes de cadrage** : « au 01/01/2026 » pour le fiscal, « vérifié au
  05/08/2026 » pour le réglementaire. À fixer une fois pour tout le blog.

---

## 5. Nouveaux simulateurs

- **Bornes camping / hôtel** — spec rédigée, v2 avec retour externe intégré :
  `SPEC-SIMULATEUR-BORNES-CHR.md`. 14 points à confirmer, dont la trajectoire du parc
  électrique, tous les coûts, et l'existence d'un critère « borne » au référentiel de
  l'hôtellerie de plein air.
- **Coût et refacturation de la recharge d'un collaborateur** — annoncé « prochainement » sur
  `/simulateurs`, pas encore spécifié.

---

## 6. Site et exploitation

- **Données légales** : placeholders `[À COMPLÉTER]` dans `mentions-legales.vue` et
  `confidentialite.vue` — raison sociale, SIREN/RCS, adresse, capital, directeur de
  publication, hébergeur.
- **Indexation en production** : `page_settings` est propre à chaque base. Les bascules faites
  en local (`/blog` et `/simulateurs` indexables) **doivent être refaites dans l'admin en
  ligne**, et l'article fiscalité y est encore publié.
- **Métadonnées de confiance** sur les articles : auteur, `dateModified`, date de dernière
  vérification réglementaire, prochaine échéance de révision.
- Images Open Graph par page, polices auto-hébergées, sauvegardes de la base, analytique,
  et la performance de l'animation de fond du hero sous Windows.
