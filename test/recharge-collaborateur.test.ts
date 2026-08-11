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
  t('date inconnue → hors régime (le doute ne profite pas au verdict)',
    determinerBranche({ ...BASE, miseADispoApres2025: 'inconnu', ecoScore: 'oui' }) === 'entreprise-hors-regime')
  t('sans usage privé → véhicule de service',
    determinerBranche({ ...BASE, usagePrive: 'non' }) === 'entreprise-service')
}

console.log('\n=== LE DOUTE NE PROFITE JAMAIS AU VERDICT ===')
{
  // Bug corrigé le 11/08/2026 : une date de mise à disposition INCONNUE
  // retombait dans le cas favorable, contre notre propre principe.
  for (const eco of ['oui', 'non', 'inconnu'] as const) {
    t(`date inconnue + éco-score ${eco} → hors régime`,
      determinerBranche({ ...BASE, miseADispoApres2025: 'inconnu', ecoScore: eco }) === 'entreprise-hors-regime')
  }
  // Avant le 01/02/2025, l'éco-score n'est pas exigé : le régime reste acquis.
  for (const eco of ['oui', 'non', 'inconnu'] as const) {
    t(`date antérieure + éco-score ${eco} → régime acquis`,
      determinerBranche({ ...BASE, miseADispoApres2025: 'non', ecoScore: eco }) === 'entreprise-ve-eligible')
  }
  t('seul « oui + éco-score oui » reste favorable',
    determinerBranche({ ...BASE, miseADispoApres2025: 'oui', ecoScore: 'oui' }) === 'entreprise-ve-eligible')
}

console.log('\n=== MESURE RÉELLE : le relevé fait autorité sur l\'estimation ===')
{
  // Afficher « mesure réelle » au-dessus d'un chiffre calculé depuis les
  // kilomètres était incohérent. Un relevé saisi remplace l'estimation.
  const estime = calculerRecharge({ ...BASE, mesureDomicile: 'estimation' })
  t('sans relevé : estimation kilométrique', proche(estime.kWhDomicileAn, 2040))

  const releve = calculerRecharge({ ...BASE, mesureDomicile: 'supervision', kWhMesuresAn: 1500 })
  t('relevé de supervision retenu tel quel', proche(releve.kWhDomicileAn, 1500))
  t('le coût suit le relevé', proche(releve.coutDomicileAn, 1500 * 0.1589))
  t('l\'énergie totale est déduite du relevé', proche(releve.kWhAn, 1500 / 0.8))

  const sc = calculerRecharge({ ...BASE, mesureDomicile: 'sous-compteur', kWhMesuresAn: 1800 })
  t('sous-compteur aussi', proche(sc.kWhDomicileAn, 1800))

  // Sans saisie, on retombe sur l'estimation : pas de zéro silencieux.
  const vide = calculerRecharge({ ...BASE, mesureDomicile: 'supervision' })
  t('mesure déclarée mais non saisie → estimation', proche(vide.kWhDomicileAn, 2040))
  // Une estimation ne doit JAMAIS consommer un relevé saisi par erreur.
  const ignore = calculerRecharge({ ...BASE, mesureDomicile: 'estimation', kWhMesuresAn: 999 })
  t('en mode estimation, le relevé est ignoré', proche(ignore.kWhDomicileAn, 2040))
}

console.log('\n=== PRIME DE TRANSPORT : la raison légale, pas l\'appréciation ===')
{
  const dt: EntreeRecharge = { ...BASE, proprietaire: 'salarie', usageSalarie: 'domicile-travail',
    abonnementTransportPublic: 'non', kmAnnuels: 8000 }
  // Les TROIS situations de L. 3261-3 ouvrent le dispositif, et elles seules.
  t('non desservi → encadré',
    calculerRecharge({ ...dt, raisonVehiculePersonnel: 'non-desservi' }).verdict === 'encadre')
  t('hors plan de mobilité obligatoire → encadré',
    calculerRecharge({ ...dt, raisonVehiculePersonnel: 'hors-plan-mobilite' }).verdict === 'encadre')
  // Liste blanche : une valeur inattendue ne doit PAS ouvrir le dispositif.
  t('valeur inconnue du moteur → prudence, pas éligibilité',
    calculerRecharge({ ...dt, raisonVehiculePersonnel: 'pas-de-transport' as any }).verdict === 'prudence')
  t('horaires incompatibles → encadré',
    calculerRecharge({ ...dt, raisonVehiculePersonnel: 'horaires' }).verdict === 'encadre')
  // « Aucune de ces situations » n'est pas une réserve : c'est une inéligibilité.
  const non = calculerRecharge({ ...dt, raisonVehiculePersonnel: 'aucune' })
  t('aucune situation légale → dispositif fermé', non.verdict === 'exclu')
  t('aucune situation légale → rien d\'exonéré', proche(non.remboursementExonereAn, 0))
  t('la commodité n\'est pas un critère', /confort|commodité/i.test(non.texteVerdict))
  t('raison inconnue → prudence',
    calculerRecharge({ ...dt, raisonVehiculePersonnel: 'inconnu' }).verdict === 'prudence')
}

console.log('\n=== SUPERVISION : abonnement salarié ou plateforme employeur ===')
{
  const base = { ...BASE, mesureDomicile: 'supervision' as const,
    supervisionPayeeParEmployeur: 'oui' as const, coutSupervisionMois: 8 }
  const salarie = calculerRecharge({ ...base, typeSupervision: 'abonnement-salarie' })
  t('abonnement du salarié → 50 %', proche(salarie.supervision!.exonere, 48))
  // On n'annonce pas une certitude URSSAF là où il n'y a qu'une lecture du texte.
  t('le 50 % est étiqueté comme une interprétation',
    /interprétation prudente/i.test(salarie.supervision!.regle))

  // Une plateforme de flotte n'est pas une dépense « que le salarié aurait dû
  // engager » : on ne l'exonère pas d'office, on ne la réintègre pas non plus.
  const flotte = calculerRecharge({ ...base, typeSupervision: 'plateforme-employeur' })
  t('plateforme employeur → ni exonérée ni réintégrée d\'office',
    flotte.supervision!.exonere === 0 && flotte.supervision!.soumis === 0)
  t('plateforme employeur → renvoi au contrat', /vérifier/i.test(flotte.supervision!.regle))
  t('plateforme employeur → avertissement', flotte.avertissements.some(a => /doctrine/i.test(a)))
  t('le coût reste affiché', proche(flotte.supervision!.coutAn, 96))
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
    raisonVehiculePersonnel: 'non-desservi', abonnementTransportPublic: 'non', kmAnnuels: 8000
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
  const doute = calculerRecharge({ ...dt, raisonVehiculePersonnel: 'inconnu' })
  t('éligibilité non confirmée → prudence', doute.verdict === 'prudence')

  // Au-delà du plafond, l'excédent est soumis.
  const gros = calculerRecharge({ ...dt, kmAnnuels: 40000, partDomicile: 1, optionTarif: 'base' })
  t('au-delà de 600 €, l’exonération est plafonnée', proche(gros.remboursementExonereAn, 600))
  t('l’excédent est soumis', gros.remboursementSoumisAn > 0)
}

console.log('\n=== TRANSPORTS PUBLICS : le doute ne profite pas au verdict ===')
{
  /* Symétrique de la date de mise à disposition : « je ne sais pas » ne doit pas
     ouvrir un droit. Le cumul est INTERDIT, pas plafonné — tant que l'abonnement
     n'est pas écarté, le versement reste conditionnel. */
  const dt: EntreeRecharge = {
    ...BASE, proprietaire: 'salarie', usageSalarie: 'domicile-travail',
    raisonVehiculePersonnel: 'non-desservi', kmAnnuels: 8000
  }
  const sur = calculerRecharge({ ...dt, abonnementTransportPublic: 'non' })
  t('abonnement écarté → verdict encadré', sur.verdict === 'encadre')

  const doute = calculerRecharge({ ...dt, abonnementTransportPublic: 'inconnu' })
  t('abonnement inconnu → prudence', doute.verdict === 'prudence')
  t('abonnement inconnu → le doute est écrit',
    doute.avertissements.some(a => /L\. 3261-3/.test(a) && /non vérifiée/.test(a)))
  t('abonnement inconnu → le montant reste affiché', doute.montantChiffrable)

  // L'exclusion reste plus forte que le doute.
  const exclu = calculerRecharge({ ...dt, abonnementTransportPublic: 'oui' })
  t('abonnement confirmé → exclu, pas prudence', exclu.verdict === 'exclu')
}

console.log('\n=== USAGE MIXTE : aucun montant plutôt qu’un faux montant ===')
{
  /* La branche laissait passer le coût de recharge domicile en le présentant
     comme intégralement exonéré : ni ventilation des kilomètres, ni indemnité
     kilométrique, ni vérification de l'abonnement de transports publics. */
  const mixte: EntreeRecharge = {
    ...BASE, proprietaire: 'salarie', usageSalarie: 'les-deux',
    modeRemboursement: 'kilometrique', puissanceFiscale: 5,
    raisonVehiculePersonnel: 'non-desservi', abonnementTransportPublic: 'non',
    kmAnnuels: 15000, partDomicile: 0.8
  }
  const r = calculerRecharge(mixte)
  t('branche mixte', r.branche === 'perso-mixte')
  t('aucun montant chiffrable', r.montantChiffrable === false)
  t('verdict de prudence', r.verdict === 'prudence')
  t('aucun remboursement annoncé', proche(r.remboursementAn, 0))
  t('aucune exonération annoncée', proche(r.remboursementExonereAn, 0))
  t('aucun plafond annoncé', r.plafondApplique === null)
  t('le coût domicile reste calculé et affiché', r.coutDomicileAn > 0)
  t('la marche à suivre est donnée',
    r.avertissements.some(a => /une fois par usage/.test(a)))

  // Toutes les autres branches restent chiffrables.
  const dt = calculerRecharge({ ...mixte, usageSalarie: 'domicile-travail' })
  const pro = calculerRecharge({ ...mixte, usageSalarie: 'professionnel' })
  t('domicile-travail reste chiffrable', dt.montantChiffrable && dt.remboursementAn > 0)
  t('professionnel reste chiffrable', pro.montantChiffrable && pro.remboursementAn > 0)
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

console.log('\n=== SUPERVISION : exonérée de moitié, pas en totalité ===')
{
  const p = PARAMETRES[ANNEE_COURANTE]!
  const avec = calculerRecharge({ ...BASE, mesureDomicile: 'supervision',
    supervisionPayeeParEmployeur: 'oui', coutSupervisionMois: 8 })
  t('supervision chiffrée', avec.supervision !== null)
  t('coût annuel = 12 mois', proche(avec.supervision!.coutAn, 96))
  // 50 % des dépenses réelles — et AUCUN plafond en euros : les 1 057,10 € et
  // 1 585,50 € visent l'achat et l'installation, pas les frais d'utilisation.
  t('exonérée à 50 %', proche(avec.supervision!.exonere, 48))
  t('le reste est soumis', proche(avec.supervision!.soumis, 48))
  const cher = calculerRecharge({ ...BASE, mesureDomicile: 'supervision',
    supervisionPayeeParEmployeur: 'oui', coutSupervisionMois: 400 })
  t('aucun plafond en euros sur les frais d\'utilisation',
    proche(cher.supervision!.exonere, 400 * 12 * 0.5))
  t('le plafond borne ne fuit pas ici', cher.supervision!.exonere > p.borne.jeune.plafond)

  // L'électricité, elle, reste exonérée en totalité : c'est tout le contraste.
  t('électricité toujours exonérée à 100 %', proche(avec.remboursementExonereAn, avec.coutDomicileAn))
  t('avertissement sur le contraste présent',
    avec.avertissements.some(a => /hors frais d.électricité/i.test(a)))

  const nonPayee = calculerRecharge({ ...BASE, mesureDomicile: 'supervision',
    supervisionPayeeParEmployeur: 'non' })
  t('supervision non prise en charge → rien à traiter', nonPayee.supervision === null)
}

console.log('\n=== COÛT EMPLOYEUR : la fraction réintégrée coûte plus que son montant ===')
{
  const sup = calculerRecharge({ ...BASE, mesureDomicile: 'supervision',
    supervisionPayeeParEmployeur: 'oui', coutSupervisionMois: 8 })
  const c = sup.coutEmployeur
  t('électricité reportée', proche(c.electriciteAn, sup.coutDomicileAn))
  t('supervision reportée', proche(c.supervisionAn, 96))
  // 48 € réintégrés × 42 % = 20,16 € de charges patronales.
  t('charges sur la fraction réintégrée', proche(c.chargesRecurrentesAn, 48 * 0.42))
  t('total récurrent = somme des trois',
    proche(c.totalRecurrentAn, c.electriciteAn + c.supervisionAn + c.chargesRecurrentesAn))
  t('le total dépasse le seul remboursement', c.totalRecurrentAn > sup.remboursementAn)

  // Sans rien de réintégré, aucune charge : le VE éligible sans supervision.
  const net = calculerRecharge({ ...BASE })
  t('rien de réintégré → aucune charge', proche(net.coutEmployeur.chargesRecurrentesAn, 0))
  t('total récurrent = électricité seule', proche(net.coutEmployeur.totalRecurrentAn, net.coutDomicileAn))

  // La borne est PONCTUELLE : elle ne pollue pas le récurrent.
  const avecBorne = calculerRecharge({ ...BASE, borneFinanceeParEmployeur: 'oui',
    coutBorne: 2000, borneRetireeEnFinDeContrat: 'non', ancienneteBorneAns: 2 })
  const b = avecBorne.coutEmployeur
  t('la borne ne gonfle pas le récurrent', proche(b.totalRecurrentAn, avecBorne.coutDomicileAn))
  t('la borne apparaît en dépense unique', proche(b.borneUnique, 2000))
  t('charges sur la part réintégrée de la borne', proche(b.chargesBorneUnique, 1000 * 0.42))
  t('première année = récurrent + ponctuel',
    proche(b.totalPremiereAnnee, b.totalRecurrentAn + b.borneUnique + b.chargesBorneUnique))
  t('quote-part annualisée sur 8 ans', proche(b.borneAnnualisee, 250))

  // Le taux est une hypothèse : il doit être surchargeable.
  const perso = calculerRecharge({ ...BASE, mesureDomicile: 'supervision',
    supervisionPayeeParEmployeur: 'oui', tauxChargesPatronales: 0.30 })
  t('taux de charges surchargeable', proche(perso.coutEmployeur.chargesRecurrentesAn, 48 * 0.30))
  t('taux reporté dans le résultat', proche(perso.coutEmployeur.tauxCharges, 0.30))
  t('avertissement sur les charges présent',
    sup.avertissements.some(a => /charges patronales/i.test(a)))
}

console.log('\n=== ATTRIBUTION DES SESSIONS ===')
{
  // Un sous-compteur mesure la BORNE ; seule la supervision rattache au véhicule.
  t('supervision → attribution possible',
    calculerRecharge({ ...BASE, mesureDomicile: 'supervision' }).attributionSessions === true)
  t('sous-compteur → attribution impossible',
    calculerRecharge({ ...BASE, mesureDomicile: 'sous-compteur' }).attributionSessions === false)
  t('sous-compteur → le lecteur est prévenu',
    calculerRecharge({ ...BASE, mesureDomicile: 'sous-compteur' })
      .avertissements.some(a => /second véhicule/i.test(a)))
}

console.log('\n=== PREUVE : la méthode qualifie le remboursement ===')
{
  t('supervision → mesure', calculerRecharge({ ...BASE, mesureDomicile: 'supervision' }).preuve.niveau === 'mesure')
  t('sous-compteur → mesure', calculerRecharge({ ...BASE, mesureDomicile: 'sous-compteur' }).preuve.niveau === 'mesure')
  t('estimation → estimation documentée', calculerRecharge({ ...BASE, mesureDomicile: 'estimation' }).preuve.niveau === 'estimation')
  t('aucune mesure → simulation', calculerRecharge({ ...BASE, mesureDomicile: 'aucune' }).preuve.niveau === 'simulation')
  t('défaut prudent : estimation', calculerRecharge({ ...BASE }).preuve.niveau === 'estimation')
  // On n'écrit jamais « conforme URSSAF » : aucune doctrine ne fixe la méthode.
  const tousTextes = ['supervision', 'sous-compteur', 'estimation', 'aucune']
    .map(o => calculerRecharge({ ...BASE, mesureDomicile: o as any }).preuve.texte).join(' ')
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
