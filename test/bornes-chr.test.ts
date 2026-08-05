/**
 * Tests de référence du simulateur « Combien de bornes pour mon camping / hôtel ? ».
 *
 *   npm run test:bornes
 *
 * Ces tests figent les quatre corrections de formule de la spec v3, celles qui
 * produisaient des chiffres plausibles mais faux :
 *   1. les arrivées se comptent en VÉHICULES, pas en unités d'hébergement ;
 *   2. le taux d'occupation n'entre qu'une fois dans les recettes ;
 *   3. l'énergie d'une arrivée et celle d'un appoint restent distinctes ;
 *   4. la puissance disponible ne suffit pas — l'ÉNERGIE nocturne est vérifiée.
 */
import { calculerBornes, partParc, qualifierPme, CONFIG, type BornesInput } from '../app/utils/simulateurs/bornesChr'

let ok = 0, ko = 0
function t(nom: string, cond: boolean, detail = '') {
  if (cond) { ok++; console.log(`  ✓ ${nom}`) }
  else { ko++; console.log(`  ✗ ${nom} ${detail}`) }
}
const proche = (a: number, b: number, tol = 0.02) => Math.abs(a - b) <= Math.abs(b) * tol + 0.01

const CAMPING: BornesInput = { type: 'camping', capacite: 150, occupationHaute: 0.8, dureeSejour: 7, horizonCourt: 2030 }
const HOTEL: BornesInput = { type: 'hotel', capacite: 40, occupationHaute: 0.7, dureeSejour: 1.8, horizonCourt: 2030 }

console.log('\n=== PARC RECHARGEABLE ===')
t('base 5,5 % en 2026 (parc en circulation, pas les immatriculations)', proche(partParc(2026), 0.055))
t('projection 2030 à 11,5 %', proche(partParc(2030), 0.115))
t('le parc ne redescend jamais', partParc(2028) >= partParc(2026))
t('plafonné, pas d’extrapolation absurde', partParc(2100) <= CONFIG.parc.plafond)

console.log('\n=== DEMANDE : arrivées en véhicules, pas en unités ===')
{
  const r = calculerBornes(CAMPING)
  t('véhicules présents = capacité × occupation × véh/unité', proche(r.vehiculesPresents, 120))
  // 120 véhicules / 7 nuits = 17,1 — et NON 150 × 0,8 / 7 = 17,1 par coïncidence ici.
  t('arrivées = véhicules présents / durée de séjour', proche(r.arriveesParNuit, 120 / 7))
}
{
  // L'hôtel démasque le bug : 0,75 véhicule par chambre. Sans la correction,
  // les arrivées seraient de 40 × 0,7 / 1,8 = 15,6 au lieu de 11,7.
  const r = calculerBornes(HOTEL)
  t('l’hôtel applique bien 0,75 véhicule par chambre', proche(r.vehiculesPresents, 21))
  t('arrivées hôtel = 11,7 et non 15,6', proche(r.arriveesParNuit, 21 / 1.8) && r.arriveesParNuit < 13)
}

console.log('\n=== ROTATION : à capacité égale, l’hôtel demande plus de sessions ===')
{
  const c = calculerBornes(CAMPING)
  const h = calculerBornes({ ...HOTEL, capacite: 150 })
  t('l’hôtel a MOINS de véhicules présents', h.vehiculesPresents < c.vehiculesPresents)
  t('mais PLUS de sessions par nuit', h.sessionsCourt > c.sessionsCourt)
  // Nuance à ne pas survendre : l'écart de sessions ne franchit pas toujours
  // un entier — à 150 contre 150 les deux tombent sur le même nombre de points.
  t('l’écart de sessions reste modéré (< 20 %)', h.sessionsCourt / c.sessionsCourt < 1.2)
}

console.log('\n=== POINTS DE RECHARGE ===')
{
  const r = calculerBornes(CAMPING)
  t('camping 150 emplacements en 2030 → 8 points', r.pointsCourt === 8, String(r.pointsCourt))
  t('essentiel < confort < premium', r.niveaux.essentiel < r.niveaux.confort && r.niveaux.confort < r.niveaux.premium)
  t('jamais zéro point', calculerBornes({ type: 'chambres-hotes', capacite: 2, horizonCourt: 2026 }).pointsCourt >= 1)
}
{
  const petit2026 = calculerBornes({ type: 'camping', capacite: 60, occupationHaute: 0.8, dureeSejour: 7, horizonCourt: 2026 })
  const petit2034 = calculerBornes({ type: 'camping', capacite: 60, occupationHaute: 0.8, dureeSejour: 7, horizonCourt: 2034 })
  t('petit camping en 2026 → 2 points, on ne sur-équipe pas', petit2026.pointsCourt === 2, String(petit2026.pointsCourt))
  t('le même en 2034 → 5 points, la projection sert à quelque chose', petit2034.pointsCourt === 5, String(petit2034.pointsCourt))
  t('l’horizon long fait croître le besoin', petit2034.pointsCourt > petit2026.pointsCourt)
}
{
  const r = calculerBornes({ ...CAMPING, horizonCourt: 2030, horizonLong: 2034 })
  t('déploiement en deux temps : pré-équipement = long − court', r.preEquiper === r.pointsLong - r.pointsCourt)
  t('pré-équiper coûte bien moins cher qu’installer', CONFIG.couts.preEquipement < CONFIG.couts.point[11]! / 3)
}

console.log('\n=== POINTS ≠ BORNES ===')
{
  const r = calculerBornes(CAMPING)
  t('une borne double vaut deux points', r.bornesDoubles * 2 + r.bornesSimples === r.pointsCourt)
}

console.log('\n=== PUISSANCE ET ÉNERGIE ===')
{
  const large = calculerBornes({ ...CAMPING, puissanceSouscrite: 400, pointeEtablissement: 100 })
  t('marge confortable → verdict confortable', large.verdictPuissance === 'confortable', large.verdictPuissance)
  t('aucun renforcement quand la marge est large', !large.renforcementNecessaire)

  const juste = calculerBornes({ ...CAMPING, puissanceSouscrite: 120, pointeEtablissement: 90 })
  t('marge serrée → pilotage contraint, pas confortable', juste.verdictPuissance !== 'confortable', juste.verdictPuissance)

  const etroit = calculerBornes({ ...CAMPING, puissanceSouscrite: 100, pointeEtablissement: 90 })
  t('énergie non livrable → verdict « insuffisant »', etroit.verdictPuissance === 'insuffisant', etroit.verdictPuissance)
  t('et le renforcement est chiffré', etroit.renforcementNecessaire && etroit.investRenforcement > 0)
}
{
  const r = calculerBornes({ ...CAMPING, puissanceSouscrite: 400, pointeEtablissement: 100 })
  // C'est LA correction n° 4 : le besoin énergétique existe indépendamment de la pointe.
  // Les kWh étant comptés AU COMPTEUR de la borne, le rendement de charge du
  // véhicule joue en aval et n'entre pas dans le dimensionnement.
  t('la puissance mini d’énergie découle des kWh de la nuit, sans rendement',
    proche(r.puissanceMiniEnergie, r.kWhNuit / CONFIG.nuit.fenetreH))
  t('le plafond de pilotage est calculé, pas choisi', r.plafondPilotage >= r.puissanceMiniEnergie)
  t('le plafond piloté reste sous la puissance installée', r.plafondPilotage <= r.puissanceInstallee)
}
{
  // Un plafond au-dessus de la marge serait une promesse intenable.
  const etroit = calculerBornes({ ...CAMPING, puissanceSouscrite: 100, pointeEtablissement: 90 })
  t('le plafond ne dépasse JAMAIS la marge disponible',
    etroit.plafondPilotage <= (etroit.margeDisponible ?? Infinity),
    `${etroit.plafondPilotage} > ${etroit.margeDisponible}`)
  t('et le verdict dit alors que l’énergie ne passe pas', etroit.verdictPuissance === 'insuffisant')
}

console.log('\n=== ÉNERGIE : arrivée et appoint restent distincts ===')
{
  const r = calculerBornes(CAMPING)
  const partVe = r.partVeCourt
  const arr = r.arriveesParNuit * partVe
  const sej = (r.vehiculesPresents - r.arriveesParNuit) * partVe
  const attendu = arr * CONFIG.tauxRechargeArrivee * CONFIG.energie.arrivee
    + sej * CONFIG.tauxAppoint.camping * CONFIG.energie.appoint
  t('kWh de la nuit = arrivées × 30 + appoints × 12', proche(r.kWhNuit, attendu))
  // Une moyenne unique donnerait un résultat sensiblement différent.
  const moyenneNaive = r.sessionsCourt * ((CONFIG.energie.arrivee + CONFIG.energie.appoint) / 2)
  t('une énergie moyenne unique donnerait un chiffre faux', !proche(r.kWhNuit, moyenneNaive, 0.05))
}

console.log('\n=== RECETTES : l’occupation ne compte qu’une fois ===')
{
  const r = calculerBornes({ ...CAMPING, saisonnier: true, moisOuverts: 5 })
  const nuits = Math.round(5 * 30.4)
  t('kWh annuels = kWh nuit × nuits × ratio d’occupation moyenne',
    proche(r.kWhAn, r.kWhNuit * nuits * CONFIG.saison.ratioOccupationMoyenne.saisonnier))
  // Le double comptage aurait divisé la recette par ~1,3.
  t('pas de second produit par l’occupation haute',
    r.kWhAn > r.kWhNuit * nuits * CONFIG.saison.ratioOccupationMoyenne.saisonnier * 0.85)

  const annuel = calculerBornes({ ...CAMPING, saisonnier: false })
  t('un établissement annuel vend plus que 5 mois d’ouverture', annuel.kWhAn > r.kWhAn)
  t('et son retour sur investissement est plus court',
    (annuel.retourAns ?? 99) < (r.retourAns ?? 99))
}

console.log('\n=== AIDES ===')
{
  const metro = calculerBornes(CAMPING)
  t('aucune aide nationale en métropole', metro.aideEstimee === 0)
  t('et la raison est explicite', /ADVENIR/.test(metro.aideCommentaire) && /fermé/.test(metro.aideCommentaire))

  const zni = calculerBornes({ ...CAMPING, zone: 'corse-om' })
  t('une aide subsiste en zone non interconnectée', zni.aideEstimee > 0)
  t('plafonnée par point en usage « clients »', zni.aideEstimee <= 900 * zni.pointsCourt)
  t('le pilotage EDF-SEI est signalé', /EDF-SEI/.test(zni.aideCommentaire))
}

console.log('\n=== RÉGLEMENTAIRE ===')
{
  // PME = moins de 250 personnes ET (CA ≤ 50 M€ OU bilan ≤ 43 M€)
  const base = { moins250: 'oui', caSup50M: 'non', bilanSup43M: 'non', groupeLie: 'non' } as const
  t('PME classique', qualifierPme({ ...CAMPING, ...base }) === 'pme')
  t('250 salariés pile → PAS une PME', qualifierPme({ ...CAMPING, ...base, moins250: 'non' }) === 'non-pme')
  t('sous 250 mais les DEUX plafonds dépassés → pas une PME',
    qualifierPme({ ...CAMPING, ...base, caSup50M: 'oui', bilanSup43M: 'oui' }) === 'non-pme')
  t('sous 250, un seul plafond dépassé → reste une PME',
    qualifierPme({ ...CAMPING, ...base, caSup50M: 'oui' }) === 'pme')
  t('sociétés liées → indéterminé, on ne tranche pas',
    qualifierPme({ ...CAMPING, ...base, groupeLie: 'oui' }) === 'indetermine')
  t('donnée manquante → indéterminé', qualifierPme({ ...CAMPING, ...base, moins250: 'inconnu' }) === 'indetermine')
}
{
  const pme = calculerBornes({ ...CAMPING, places: 95, proprietaire: 'oui', occupant: 'oui',
    moins250: 'oui', caSup50M: 'non', bilanSup43M: 'non', groupeLie: 'non' })
  t('PME propriétaire et occupante → aucune obligation', pme.minimumReglementaire === 0)
  t('et l’article est cité', /L113-14/.test(pme.texteReglementaire))

  const grande = calculerBornes({ ...CAMPING, places: 95, proprietaire: 'oui', occupant: 'oui',
    moins250: 'non', caSup50M: 'oui', bilanSup43M: 'oui', groupeLie: 'non', etatParking: 'existant' })
  t('non-PME, 95 places existantes → 4 points imposés', grande.minimumReglementaire === 4, String(grande.minimumReglementaire))

  const inconnu = calculerBornes({ ...CAMPING, places: 95, proprietaire: 'oui', occupant: 'oui', moins250: 'inconnu' })
  t('statut inconnu → on ne conclut pas', inconnu.minimumReglementaire === null)
  t('et on le dit', /vérifi/i.test(inconnu.texteReglementaire))

  const corse = calculerBornes({ ...CAMPING, zone: 'corse-om', places: 95 })
  t('Corse et Outre-mer : pas de calcul métropolitain', corse.minimumReglementaire === null)
}
{
  t('étude de conception obligatoire dès 50 places',
    calculerBornes({ ...CAMPING, places: 50 }).etudeConceptionObligatoire)
  t('pas en dessous', !calculerBornes({ ...CAMPING, places: 49 }).etudeConceptionObligatoire)
}

console.log('\n=== COHÉRENCE D’ENSEMBLE ===')
{
  const r = calculerBornes({ ...CAMPING, puissanceSouscrite: 250, pointeEtablissement: 150, distanceTableau: 60 })
  t('l’investissement est la somme de ses postes',
    r.investTotal === r.investPoints + r.investGenieCivil + r.investPilotage + r.investRenforcement + r.investPreEquipement)
  t('les hypothèses sont exposées', r.hypotheses.length >= 6)
  t('aucune valeur négative absurde', r.investTotal > 0 && r.kWhAn >= 0 && r.pointsCourt > 0)
  t('l’ouverture au public avertit qu’elle n’est pas dimensionnée',
    calculerBornes({ ...CAMPING, usage: 'ouvert' }).avertissements.some((a) => /visiteurs extérieurs/.test(a)))
}

console.log(`\n${ok} réussis, ${ko} échoués\n`)
if (ko > 0) process.exit(1)
