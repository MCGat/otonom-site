/**
 * Tests de référence du simulateur « Remboursement de recharge à domicile ».
 *
 *   npm run test:recharge
 *
 * Ces tests figent des RÈGLES DE DROIT, pas des chiffres cosmétiques. Chacun
 * correspond à une erreur qui coûterait cher à un employeur :
 *   1. un hybride rechargeable n'est pas « exclusivement électrique » ;
 *   2. sans éco-score après le 01/02/2025, le régime favorable n'est pas acquis ;
 *   3. « plus de cinq ans » se compare STRICTEMENT ;
 *   4. la prime de transport ne se cumule pas avec les transports publics ;
 *   5. indemnités kilométriques et remboursement des kWh ne se cumulent pas ;
 *   6. une consommation WLTP ne reçoit AUCUN coefficient de pertes.
 */
import {
  calculerRecharge, determinerBranche, consoAuReseau, prixMoyenKwh,
  indemniteKilometrique, PARAMETRES, CONFIG, ANNEE_COURANTE,
  type EntreeRecharge
} from '../app/utils/simulateurs/rechargeCollaborateur'

let ok = 0, ko = 0
function t(nom: string, cond: boolean, detail = '') {
  if (cond) { ok++; console.log(`  ✓ ${nom}`) }
  else { ko++; console.log(`  ✗ ${nom} ${detail}`) }
}
const proche = (a: number, b: number, tol = 0.02) => Math.abs(a - b) <= Math.abs(b) * tol + 0.01

const BASE: EntreeRecharge = {
  proprietaire: 'entreprise', categorie: 'compacte', origineConso: 'wltp',
  kmAnnuels: 15000, motorisation: 'electrique', miseADispoApres2025: 'oui',
  ecoScore: 'oui', usagePrive: 'oui', partDomicile: 0.8, optionTarif: 'hp-hc',
  partHeuresCreuses: 1
}

console.log('\n=== ÉNERGIE : pas de double comptage des pertes ===')
{
  // La consommation WLTP est mesurée entre le réseau et le véhicule : elle
  // INCLUT déjà les pertes. Lui appliquer un rendement les compterait deux fois.
  t('WLTP : aucun coefficient appliqué', proche(consoAuReseau({ ...BASE, origineConso: 'wltp' }), 17))
  t('relevé de borne : aucun coefficient', proche(consoAuReseau({ ...BASE, origineConso: 'releve' }), 17))
  // Le tableau de bord, lui, mesure côté batterie : il faut remonter au réseau.
  t('tableau de bord : ramené au réseau', proche(consoAuReseau({ ...BASE, origineConso: 'tableau-de-bord' }), 17 / 0.88))
  t('le réseau est toujours ≥ la batterie',
    consoAuReseau({ ...BASE, origineConso: 'tableau-de-bord' }) > consoAuReseau({ ...BASE, origineConso: 'wltp' }))
}

console.log('\n=== CAS DE RÉFÉRENCE (spec §6) ===')
{
  const r = calculerRecharge(BASE)
  t('énergie annuelle = 17 × 150 = 2 550 kWh', proche(r.kWhAn, 2550))
  t('80 % au domicile = 2 040 kWh', proche(r.kWhDomicileAn, 2040))
  t('100 % en heures creuses → 0,1589 €/kWh', proche(r.prixMoyenKwh, 0.1589))
  t('coût annuel ≈ 324 €', proche(r.coutDomicileAn, 2040 * 0.1589))
  t('coût mensuel ≈ 27 €', proche(r.coutDomicileMois, 27, 0.05))
}

console.log('\n=== TARIFS : la grille du 01/08/2026 ===')
{
  t('base 0,2001 €', proche(CONFIG.tarifs.base, 0.2001, 0.001))
  t('heures pleines 0,2142 €', proche(CONFIG.tarifs.heuresPleines, 0.2142, 0.001))
  t('heures creuses 0,1589 €', proche(CONFIG.tarifs.heuresCreuses, 0.1589, 0.001))
  // On ne suppose pas 100 % d'heures creuses : la part est une donnée d'entrée.
  const mix = prixMoyenKwh({ ...BASE, partHeuresCreuses: 0.5 })
  t('mix 50/50 entre HP et HC', proche(mix, (0.1589 + 0.2142) / 2))
}

console.log('\n=== BRANCHE : le régime favorable a des conditions ===')
{
  t('VE éligible → branche favorable', determinerBranche(BASE) === 'entreprise-ve-eligible')
  // Un hybride rechargeable ne fonctionne PAS exclusivement à l'électricité.
  t('hybride rechargeable → hors régime',
    determinerBranche({ ...BASE, motorisation: 'hybride-rechargeable' }) === 'entreprise-hors-regime')
  // Après le 01/02/2025, l'éco-score conditionne le régime.
  t('VE sans éco-score après 02/2025 → hors régime',
    determinerBranche({ ...BASE, ecoScore: 'non' }) === 'entreprise-hors-regime')
  t('éco-score inconnu → hors régime (le doute ne profite pas au verdict)',
    determinerBranche({ ...BASE, ecoScore: 'inconnu' }) === 'entreprise-hors-regime')
  // Avant le 01/02/2025, l'éco-score n'est pas exigé.
  t('VE mis à dispo avant 02/2025 → régime acquis sans éco-score',
    determinerBranche({ ...BASE, miseADispoApres2025: 'non', ecoScore: 'inconnu' }) === 'entreprise-ve-eligible')
  t('sans usage privé → véhicule de service',
    determinerBranche({ ...BASE, usagePrive: 'non' }) === 'entreprise-service')
}

console.log('\n=== VERDICT : 100 % des kWh remboursables pour un VE éligible ===')
{
  const r = calculerRecharge(BASE)
  t('verdict favorable', r.verdict === 'favorable')
  t('intégralement exonéré', proche(r.remboursementExonereAn, r.coutDomicileAn))
  t('rien de soumis à cotisations', proche(r.remboursementSoumisAn, 0))
  // Le plafond de 50 % de l'article 4 ne vise QUE les frais de borne.
  t('aucun plafond appliqué à l’électricité', r.plafondApplique === null)

  const hors = calculerRecharge({ ...BASE, motorisation: 'hybride-rechargeable' })
  t('hors régime → verdict de prudence', hors.verdict === 'prudence')
  t('hors régime → rien d’exonéré d’office', proche(hors.remboursementExonereAn, 0))
}

console.log('\n=== BORNE : article 4, « plus de cinq ans » ===')
{
  const p = PARAMETRES[ANNEE_COURANTE]!
  const avecBorne = (ans: number, retiree: 'oui' | 'non') => calculerRecharge({
    ...BASE, borneFinanceeParEmployeur: 'oui', coutBorne: 2000,
    borneRetireeEnFinDeContrat: retiree, ancienneteBorneAns: ans
  }).borne!

  t('borne retirée → exonération totale', proche(avecBorne(2, 'oui').exonere, 2000))
  // 50 % de 2 000 = 1 000, sous le plafond de 1 057,10 €.
  t('conservée à 2 ans → 50 %, sous plafond', proche(avecBorne(2, 'non').exonere, 1000))
  // À CINQ ANS PILE, on reste dans la première branche : le texte dit « plus de cinq ans ».
  t('conservée à 5 ans pile → encore 50 %', proche(avecBorne(5, 'non').exonere, 1000))
  t('conservée à 6 ans → 75 %, plafonné à 1 585,50 €',
    proche(avecBorne(6, 'non').exonere, Math.min(2000 * 0.75, p.borne.ancienne.plafond)))
  // Le plafond mord au-delà de 2 114,20 € de dépense.
  const cher = calculerRecharge({
    ...BASE, borneFinanceeParEmployeur: 'oui', coutBorne: 4000,
    borneRetireeEnFinDeContrat: 'non', ancienneteBorneAns: 1
  }).borne!
  t('plafond 2026 à 1 057,10 € respecté', proche(cher.exonere, 1057.10))
  t('le reste est soumis', proche(cher.soumis, 4000 - 1057.10))
}

console.log('\n=== PRIME DE TRANSPORT : non-cumul avec les transports publics ===')
{
  const dt: EntreeRecharge = {
    ...BASE, proprietaire: 'salarie', usageSalarie: 'domicile-travail',
    contraintDUtiliserSonVehicule: 'oui', abonnementTransportPublic: 'non', kmAnnuels: 8000
  }
  const r = calculerRecharge(dt)
  t('branche domicile-travail', r.branche === 'perso-domicile-travail')
  t('plafond de 600 € appliqué', r.plafondApplique === 600)

  // L'article L. 3261-3 INTERDIT le cumul : ce n'est pas un plafond relevé à 900 €.
  const cumul = calculerRecharge({ ...dt, abonnementTransportPublic: 'oui' })
  t('abonnement transports publics → verdict exclu', cumul.verdict === 'exclu')
  t('abonnement transports publics → rien d’exonéré', proche(cumul.remboursementExonereAn, 0))
  t('abonnement transports publics → aucun remboursement au titre de la prime',
    proche(cumul.remboursementAn, 0))

  // Éligibilité non confirmée : on n'annonce pas un droit acquis.
  const doute = calculerRecharge({ ...dt, contraintDUtiliserSonVehicule: 'inconnu' })
  t('éligibilité non confirmée → prudence', doute.verdict === 'prudence')

  // Au-delà du plafond, l'excédent est soumis.
  const gros = calculerRecharge({ ...dt, kmAnnuels: 40000, partDomicile: 1, optionTarif: 'base' })
  t('au-delà de 600 €, l’exonération est plafonnée', proche(gros.remboursementExonereAn, 600))
  t('l’excédent est soumis', gros.remboursementSoumisAn > 0)
}

console.log('\n=== INDEMNITÉS KILOMÉTRIQUES : pas de cumul avec les kWh ===')
{
  const p = PARAMETRES[ANNEE_COURANTE]!
  // 5 CV, 15 000 km : (15000 × 0,357) + 1395 = 6 750, majoré de 20 % = 8 100.
  t('barème 5 CV / 15 000 km, majoration électrique',
    proche(indemniteKilometrique(15000, 5, true), (15000 * 0.357 + 1395) * 1.2))
  t('majoration électrique de 20 %',
    proche(indemniteKilometrique(15000, 5, true) / indemniteKilometrique(15000, 5, false), 1.2))
  // La catégorie « 7 CV et plus » existe : un 9 CV ne sort pas du barème.
  t('9 CV retombe sur la ligne « 7 CV et plus »',
    proche(indemniteKilometrique(10000, 9, false), indemniteKilometrique(10000, 7, false)))
  t('tranches croissantes avec le kilométrage',
    indemniteKilometrique(25000, 5, false) > indemniteKilometrique(15000, 5, false))

  const ik = calculerRecharge({
    ...BASE, proprietaire: 'salarie', usageSalarie: 'professionnel',
    modeRemboursement: 'kilometrique', puissanceFiscale: 5
  })
  t('remboursement = barème, pas les kWh', proche(ik.remboursementAn, indemniteKilometrique(15000, 5, true)))
  t('avertissement sur le non-cumul présent',
    ik.avertissements.some(a => /cumul/i.test(a)))
}

console.log('\n=== PREUVE : la méthode qualifie le remboursement ===')
{
  t('relevé → mesure', calculerRecharge({ ...BASE, origineConso: 'releve' }).preuve.niveau === 'mesure')
  t('WLTP → estimation documentée', calculerRecharge({ ...BASE, origineConso: 'wltp' }).preuve.niveau === 'estimation')
  t('tableau de bord → simulation', calculerRecharge({ ...BASE, origineConso: 'tableau-de-bord' }).preuve.niveau === 'simulation')
  // On n'écrit jamais « conforme URSSAF » : aucune doctrine ne fixe la méthode.
  const tousTextes = ['releve', 'wltp', 'tableau-de-bord']
    .map(o => calculerRecharge({ ...BASE, origineConso: o as any }).preuve.texte).join(' ')
  t('aucune promesse de conformité', !/conforme\s+URSSAF|obligatoire/i.test(tousTextes))
}

console.log('\n=== PARAMÈTRES DATÉS ===')
{
  const p = PARAMETRES[2026]!
  t('plafond borne jeune 2026 = 1 057,10 €', proche(p.borne.jeune.plafond, 1057.10, 0.0001))
  t('plafond borne ancienne 2026 = 1 585,50 €', proche(p.borne.ancienne.plafond, 1585.50, 0.0001))
  t('prime alimentation 600 €', p.primeTransport.plafondAlimentation === 600)
  t('sous-plafond carburant 300 €', p.primeTransport.plafondCarburant === 300)
  t('fin du régime au 31/12/2027', p.finRegime === '31/12/2027')
  // Un millésime inconnu ne doit pas faire planter le moteur.
  t('millésime inconnu → repli sur l’année courante',
    calculerRecharge({ ...BASE, annee: 2099 }).coutDomicileAn > 0)
}

console.log('\n=== GAIN HEURES CREUSES ===')
{
  const r = calculerRecharge({ ...BASE, optionTarif: 'base' })
  t('bascule en heures creuses chiffrée', r.gainHeuresCreusesAn > 0)
  t('gain = énergie domicile × écart de tarif',
    proche(r.gainHeuresCreusesAn, 2040 * (0.2001 - 0.1589)))
}

console.log(`\n=== TOTAL ${ok} réussis, ${ko} échoués ===\n`)
if (ko > 0) process.exit(1)
