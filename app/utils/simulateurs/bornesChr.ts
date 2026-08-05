/**
 * Simulateur « Combien de bornes pour mon camping / hôtel ? »
 *
 * Spécification : SPEC-SIMULATEUR-BORNES-CHR.md (v3, validée pour développement).
 * Les quatre corrections de formule de la deuxième relecture sont intégrées :
 *  1. les arrivées se comptent en VÉHICULES, pas en unités d'hébergement ;
 *  2. le taux d'occupation n'est appliqué qu'une fois dans les recettes ;
 *  3. l'énergie d'une arrivée et celle d'un appoint restent distinctes ;
 *  4. la puissance ne suffit pas — l'ÉNERGIE livrable dans la nuit est vérifiée.
 *
 * Toutes les hypothèses vivent dans CONFIG : aucune valeur en dur dans le calcul.
 */
import { clamp, num } from './core'

/* ── Types ───────────────────────────────────────────────────────────────── */

export type TypeEtab = 'camping' | 'hotel' | 'residence' | 'chambres-hotes'
export type Ambition = 'essentiel' | 'confort' | 'premium'
export type Usage = 'clients' | 'ouvert'
export type EtatParking = 'existant' | 'neuf' | 'renovation'
export type Zone = 'metropole' | 'corse-om'
export type Triple = 'oui' | 'non' | 'inconnu'

export const LABELS_ETAB: Record<TypeEtab, string> = {
  camping: 'Camping / hôtellerie de plein air',
  hotel: 'Hôtel',
  residence: 'Résidence de tourisme / village vacances',
  'chambres-hotes': "Chambres d'hôtes / gîte"
}
export const LABELS_AMBITION: Record<Ambition, string> = {
  essentiel: 'Essentiel — couvrir la demande actuelle',
  confort: 'Confort — limiter l’attente en haute saison',
  premium: 'Premium — argument commercial et marge de croissance'
}
export const UNITE: Record<TypeEtab, string> = {
  camping: 'emplacements', hotel: 'chambres', residence: 'logements', 'chambres-hotes': 'chambres'
}

/* ── Configuration (versionnée, entièrement paramétrable) ────────────────── */

export const CONFIG = {
  version: '1.0',
  maj: '05/08/2026',

  /** Parc RECHARGEABLE en circulation, pas les immatriculations neuves. [BARÈME] SDES */
  parc: {
    reference: { annee: 2026, part: 0.055 },   // 3,5 % élec + 2,0 % hybr. rechargeables au 01/01/2026
    progressionAnnuelle: 0.015,                // [HYPOTHÈSE] la plus structurante du modèle
    plafond: 0.60
  },

  /** Véhicules par unité d'hébergement. [HYPOTHÈSE] */
  vehiculesParUnite: { camping: 1.0, hotel: 0.75, residence: 1.1, 'chambres-hotes': 0.9 } as Record<TypeEtab, number>,

  /** Part des véhicules déjà sur place qui rechargent quand même. [HYPOTHÈSE] */
  tauxAppoint: { camping: 0.25, hotel: 0.15, residence: 0.22, 'chambres-hotes': 0.18 } as Record<TypeEtab, number>,

  /** Un véhicule qui ARRIVE a roulé : il veut charger. [HYPOTHÈSE] */
  tauxRechargeArrivee: 0.90,

  /** Les arrivées ne sont pas uniformes — le samedi du camping. [HYPOTHÈSE] */
  facteurPointe: 1.4,

  /** Correction de clientèle étrangère (NL/DE/BE plus électrifiées). [HYPOTHÈSE] */
  correctionEtrangere: { min: 1.0, max: 1.4 },

  /**
   * Effet du niveau de gamme sur la part de véhicules rechargeables.
   * NEUTRALISÉ à 1,0 : l'hypothèse (0,9 en camping, 1,15 en hôtel) n'est étayée
   * par aucune donnée, et elle déplaçait le résultat jusqu'à 28 %. On ne fait
   * pas peser un coefficient inventé sur un chiffre que le client va engager.
   * À réactiver le jour où une source la justifie. [À CONFIRMER — spec n° 5]
   */
  correctionGamme: { camping: 1.0, hotel: 1.0, residence: 1.0, 'chambres-hotes': 1.0 } as Record<TypeEtab, number>,

  /** Coefficients d'ambition appliqués au besoin calculé. */
  ambition: { essentiel: 0.7, confort: 1.0, premium: 1.4 } as Record<Ambition, number>,

  /** Énergie par session, en kWh. Arrivée et appoint n'ont rien à voir. [HYPOTHÈSE] */
  energie: { arrivee: 30, appoint: 12 },

  /** Recharge de nuit : fenêtre et rendement. [HYPOTHÈSE] */
  nuit: { fenetreH: 12, rendement: 0.90 },

  /** Puissances unitaires proposées, en kW. */
  puissances: [7.4, 11, 22] as const,
  puissanceParDefaut: 11,

  /** Tout le monde se branche en rentrant. [HYPOTHÈSE] */
  simultaneite: 0.9,

  /** kVA → kW : hypothèse de prudence, PAS une conversion universelle. [HYPOTHÈSE] */
  facteurKvaKw: 0.93,

  /** Coûts HT. [HYPOTHÈSE OTONOM — à caler avec OTONOM avant mise en ligne] */
  couts: {
    point: { 7.4: 1800, 11: 2400, 22: 3200 } as Record<number, number>,
    /** Une borne double coûte moins cher que deux bornes simples. */
    remiseBorneDouble: 0.18,
    tranchee: 80,              // € / m
    forfaitChantier: 1500,
    pilotage: 3500,
    renforcement: 12000,
    preEquipement: 350,        // € par emplacement préparé (fourreau + attente)
    supervisionAn: 180,        // € / point / an
    maintenanceTaux: 0.03      // % de l'investissement / an
  },

  /** Prix de l'énergie. [HYPOTHÈSE / MARCHÉ au 01/01/2026] */
  prix: {
    achat: 0.20,               // € HT / kWh
    revente: 0.40,             // € HT / kWh facturé au client
    fraisVariables: 0.03       // monétique + supervision, € / kWh
  },

  /** Saison : nuits ouvertes et occupation moyenne rapportée à la haute saison. */
  saison: {
    saisonnierMoisDefaut: 5,
    ratioOccupationMoyenne: { saisonnier: 0.78, annuel: 0.62 }  // [HYPOTHÈSE]
  },

  /** Seuils réglementaires. [BARÈME] code de la construction et de l'habitation. */
  reglementaire: {
    seuilExistant: 20,         // > 20 places → L113-13
    parTranche: 20,
    seuilNeufRenovation: 10,   // > 10 places → L113-12
    partPreEquipeeNeuf: 0.20,
    seuilEtudeConception: 50   // étude obligatoire dès 50 places (décret 2021-546)
  },

  /** ADVENIR : plus aucun guichet en métropole pour ce cas. [BARÈME au 05/08/2026] */
  aides: {
    metropole: null,
    zni: { ouvertAuPublic: { taux: 0.30, plafond: null as number | null },
           clientsSeuls: { taux: 0.20, plafond: 900 } }
  }
}

/* ── Entrées ─────────────────────────────────────────────────────────────── */

export interface BornesInput {
  type: TypeEtab
  capacite: number
  places?: number
  occupationHaute?: number       // 0–1
  dureeSejour?: number           // nuits
  partEtrangere?: number         // 0–1
  saisonnier?: boolean
  moisOuverts?: number
  puissanceSouscrite?: number    // kVA
  pointeEtablissement?: number   // kW, ou undefined = « je ne sais pas »
  distanceTableau?: number       // m
  horizonCourt?: number          // année
  horizonLong?: number           // année
  ambition?: Ambition
  usage?: Usage
  puissanceUnitaire?: number
  zone?: Zone
  // Qualification réglementaire
  proprietaire?: Triple
  occupant?: Triple
  moins250?: Triple
  caSup50M?: Triple
  bilanSup43M?: Triple
  groupeLie?: Triple
  etatParking?: EtatParking
}

/* ── Sorties ─────────────────────────────────────────────────────────────── */

export type VerdictPuissance = 'confortable' | 'contraint' | 'insuffisant'
export type StatutPme = 'pme' | 'non-pme' | 'indetermine'

export interface BornesResult {
  input: Required<Pick<BornesInput, 'type' | 'capacite'>> & BornesInput
  /** Demande */
  vehiculesPresents: number
  arriveesParNuit: number
  partVeCourt: number
  partVeLong: number
  sessionsCourt: number
  sessionsLong: number
  /** Points de recharge */
  pointsCourt: number
  pointsLong: number
  preEquiper: number
  niveaux: Record<Ambition, number>
  bornesDoubles: number
  bornesSimples: number
  /** Puissance & énergie */
  puissanceUnitaire: number
  puissanceInstallee: number
  puissanceAppelee: number
  margeDisponible: number | null
  kWhNuit: number
  puissanceMiniEnergie: number
  plafondPilotage: number
  verdictPuissance: VerdictPuissance
  renforcementNecessaire: boolean
  /** Argent */
  investPoints: number
  investGenieCivil: number
  investPilotage: number
  investRenforcement: number
  investPreEquipement: number
  investTotal: number
  aideEstimee: number
  aideCommentaire: string
  kWhAn: number
  recetteAn: number
  chargesAn: number
  margeAn: number
  retourAns: number | null
  nuiteesSupplementaires: number | null
  /** Réglementaire */
  statutPme: StatutPme
  minimumReglementaire: number | null
  texteReglementaire: string
  etudeConceptionObligatoire: boolean
  /** Divers */
  hypotheses: { label: string; valeur: string }[]
  avertissements: string[]
}

/* ── Moteur ──────────────────────────────────────────────────────────────── */

/** Part du parc rechargeable projetée à une année donnée. */
export function partParc(annee: number): number {
  const { reference, progressionAnnuelle, plafond } = CONFIG.parc
  const ans = Math.max(0, annee - reference.annee)
  return Math.min(plafond, reference.part + ans * progressionAnnuelle)
}

/**
 * Qualification PME au sens de la recommandation 2003/361/CE.
 * PME = moins de 250 personnes ET (CA ≤ 50 M€ OU bilan ≤ 43 M€).
 * Toute inconnue, ou l'existence de sociétés liées, rend le statut indéterminé :
 * on ne conclut pas à la place d'un juriste.
 */
export function qualifierPme(i: BornesInput): StatutPme {
  const { moins250, caSup50M, bilanSup43M, groupeLie } = i
  if (groupeLie === 'oui' || groupeLie === 'inconnu') return 'indetermine'
  if (!moins250 || moins250 === 'inconnu') return 'indetermine'
  if (moins250 === 'non') return 'non-pme'                        // ≥ 250 salariés
  if (!caSup50M || !bilanSup43M || caSup50M === 'inconnu' || bilanSup43M === 'inconnu') return 'indetermine'
  // Moins de 250 salariés : reste PME si AU MOINS UN plafond est respecté.
  return (caSup50M === 'oui' && bilanSup43M === 'oui') ? 'non-pme' : 'pme'
}

function sessionsPour(i: BornesInput, annee: number, presents: number, arrivees: number) {
  const etranger = CONFIG.correctionEtrangere.min +
    (CONFIG.correctionEtrangere.max - CONFIG.correctionEtrangere.min) * clamp(num(i.partEtrangere, 0.25), 0, 1)
  const partVe = clamp(partParc(annee) * etranger * CONFIG.correctionGamme[i.type], 0, 1)
  const veArrivants = arrivees * partVe
  const veEnSejour = Math.max(0, presents - arrivees) * partVe
  const sessions = veArrivants * CONFIG.tauxRechargeArrivee + veEnSejour * CONFIG.tauxAppoint[i.type]
  const kWh = veArrivants * CONFIG.tauxRechargeArrivee * CONFIG.energie.arrivee
    + veEnSejour * CONFIG.tauxAppoint[i.type] * CONFIG.energie.appoint
  return { partVe, veArrivants, veEnSejour, sessions, kWh }
}

export function calculerBornes(i: BornesInput): BornesResult {
  const type = i.type
  const capacite = Math.max(1, num(i.capacite, 1))
  const occHaute = clamp(num(i.occupationHaute, 0.8), 0.05, 1)
  const sejourDefaut = type === 'hotel' ? 1.8 : type === 'camping' ? 7 : 5
  const sejour = Math.max(1, num(i.dureeSejour, sejourDefaut))
  const ambition = i.ambition || 'confort'
  const horizonCourt = num(i.horizonCourt, 2030)
  const horizonLong = Math.max(horizonCourt, num(i.horizonLong, horizonCourt + 4))
  const zone = i.zone || 'metropole'
  const usage = i.usage || 'clients'
  const avert: string[] = []

  /* — Demande — */
  const presents = capacite * occHaute * CONFIG.vehiculesParUnite[type]
  const arrivees = presents / sejour                          // ← en VÉHICULES
  const court = sessionsPour(i, horizonCourt, presents, arrivees)
  const long = sessionsPour(i, horizonLong, presents, arrivees)

  const coefAmb = CONFIG.ambition[ambition]
  const pointsDe = (s: number) => Math.max(1, Math.ceil(s * CONFIG.facteurPointe * coefAmb))
  const pointsCourt = pointsDe(court.sessions)
  const pointsLong = pointsDe(long.sessions)
  const preEquiper = Math.max(0, pointsLong - pointsCourt)

  const niveaux = {
    essentiel: Math.max(1, Math.ceil(court.sessions * CONFIG.facteurPointe * CONFIG.ambition.essentiel)),
    confort: Math.max(1, Math.ceil(court.sessions * CONFIG.facteurPointe * CONFIG.ambition.confort)),
    premium: Math.max(1, Math.ceil(court.sessions * CONFIG.facteurPointe * CONFIG.ambition.premium))
  } as Record<Ambition, number>

  // Points ≠ bornes : une borne double alimente deux points.
  const bornesDoubles = Math.floor(pointsCourt / 2)
  const bornesSimples = pointsCourt % 2

  /* — Puissance ET énergie — */
  const pUnit = num(i.puissanceUnitaire, CONFIG.puissanceParDefaut)
  const pInstallee = pointsCourt * pUnit
  const pAppelee = pInstallee * CONFIG.simultaneite
  const souscrite = num(i.puissanceSouscrite, 0)
  const pointe = i.pointeEtablissement
  const marge = souscrite > 0
    ? Math.max(0, souscrite * CONFIG.facteurKvaKw - num(pointe, souscrite * CONFIG.facteurKvaKw * 0.8))
    : null
  if (souscrite <= 0) avert.push("Puissance souscrite inconnue : le verdict électrique n'est qu'indicatif.")
  else if (pointe === undefined) avert.push('Pointe du site estimée à 80 % de la puissance active souscrite, faute de relevé.')

  const kWhNuit = court.kWh
  const pMiniEnergie = kWhNuit / (CONFIG.nuit.fenetreH * CONFIG.nuit.rendement)

  let verdict: VerdictPuissance = 'confortable'
  if (marge !== null) {
    if (marge < pMiniEnergie) verdict = 'insuffisant'
    else if (marge < pAppelee) verdict = 'contraint'
  }
  const renforcement = verdict === 'insuffisant'
  // Le plafond de pilotage se CALCULE : besoin énergétique d'un côté, marge de l'autre.
  const plafondPilotage = marge !== null
    ? Math.max(pMiniEnergie, Math.min(pAppelee, marge))
    : pAppelee

  /* — Investissement — */
  const coutPoint = CONFIG.couts.point[pUnit] ?? CONFIG.couts.point[CONFIG.puissanceParDefaut]!
  const brutPoints = pointsCourt * coutPoint
  const investPoints = Math.round(brutPoints * (1 - CONFIG.couts.remiseBorneDouble * (bornesDoubles * 2) / pointsCourt))
  const investGenieCivil = Math.round(CONFIG.couts.forfaitChantier + num(i.distanceTableau, 60) * CONFIG.couts.tranchee)
  const investPilotage = verdict !== 'confortable' || marge !== null ? CONFIG.couts.pilotage : 0
  const investRenforcement = renforcement ? CONFIG.couts.renforcement : 0
  const investPreEquipement = preEquiper * CONFIG.couts.preEquipement
  const investTotal = investPoints + investGenieCivil + investPilotage + investRenforcement + investPreEquipement

  /* — Aides — */
  let aide = 0
  let aideCom = "Aucune prime nationale identifiée pour ce cas au 05/08/2026 : le guichet ADVENIR « parking privé ouvert au public » est fermé depuis le 30 juin 2023. Des dispositifs régionaux peuvent exister — à vérifier avant d'engager la dépense."
  if (zone === 'corse-om') {
    const g = usage === 'ouvert' ? CONFIG.aides.zni.ouvertAuPublic : CONFIG.aides.zni.clientsSeuls
    const brut = (investPoints + investGenieCivil) * g.taux
    aide = Math.round(g.plafond ? Math.min(brut, g.plafond * pointsCourt) : brut)
    aideCom = `Zone non interconnectée : un guichet ADVENIR reste ouvert (${Math.round(g.taux * 100)} %${g.plafond ? `, plafonné à ${g.plafond} € par point` : ''}). Le pilotage par le signal EDF-SEI y est obligatoire. Montant à confirmer avant dépôt.`
  }

  /* — Recettes — */
  const moisOuverts = i.saisonnier === false ? 12 : clamp(num(i.moisOuverts, CONFIG.saison.saisonnierMoisDefaut), 1, 12)
  const nuitsOuvertes = Math.round(moisOuverts * 30.4)
  const ratioOcc = i.saisonnier === false
    ? CONFIG.saison.ratioOccupationMoyenne.annuel
    : CONFIG.saison.ratioOccupationMoyenne.saisonnier
  // ⚠️ L'occupation est DÉJÀ dans kWhNuit : on la ramène de la haute saison à la
  // moyenne par un RAPPORT, jamais par un second produit.
  const kWhAn = Math.round(kWhNuit * nuitsOuvertes * ratioOcc)
  const margeKwh = Math.max(0, CONFIG.prix.revente - CONFIG.prix.achat - CONFIG.prix.fraisVariables)
  const recetteAn = Math.round(kWhAn * margeKwh)
  const chargesAn = Math.round(pointsCourt * CONFIG.couts.supervisionAn + investTotal * CONFIG.couts.maintenanceTaux)
  const margeAn = recetteAn - chargesAn
  const resteACharge = Math.max(0, investTotal - aide)
  const retourAns = margeAn > 0 ? Math.round((resteACharge / margeAn) * 10) / 10 : null

  /* Ce que la vente d'électricité ne rembourse pas, exprimé en nuitées :
     un gérant sait lire ce chiffre, et nous n'inventons aucune prévision. */
  const prixNuitee = type === 'camping' ? 35 : type === 'hotel' ? 95 : 70   // [HYPOTHÈSE]
  const nonRembourse = retourAns === null || retourAns > 8 ? resteACharge - Math.max(0, margeAn) * 8 : 0
  const nuiteesSupplementaires = nonRembourse > 0 ? Math.ceil(nonRembourse / prixNuitee / 8) : null

  /* — Réglementaire — */
  const places = Math.max(1, num(i.places, capacite))
  const pme = qualifierPme(i)
  const possedeEtOccupe = i.proprietaire === 'oui' && i.occupant === 'oui'
  const etat = i.etatParking || 'existant'
  let minimum: number | null = null
  let texte: string

  if (zone === 'corse-om') {
    texte = "Zone non interconnectée : les obligations peuvent être adaptées par la programmation pluriannuelle de l'énergie de votre territoire. Nous n'appliquons pas le calcul métropolitain — à vérifier localement."
  } else if (pme === 'pme' && possedeEtOccupe) {
    minimum = 0
    texte = "Aucune obligation : l'article L113-14 du code de la construction écarte les parcs dépendant de bâtiments possédés et occupés par une PME au sens de la recommandation 2003/361/CE. Vous n'êtes pas tenu de vous équiper — la question devient commerciale."
  } else if (pme === 'indetermine' || i.proprietaire === 'inconnu' || i.occupant === 'inconnu') {
    texte = "Votre éventuelle exemption PME doit être vérifiée : elle dépend de l'effectif, du chiffre d'affaires, du total de bilan et, le cas échéant, des sociétés partenaires ou liées. Nous ne concluons pas à votre place."
  } else if (etat === 'existant') {
    minimum = places > CONFIG.reglementaire.seuilExistant
      ? 1 + Math.floor((places - CONFIG.reglementaire.seuilExistant) / CONFIG.reglementaire.parTranche) : 0
    texte = minimum > 0
      ? `Parc existant de ${places} places : l'article L113-13 impose au moins ${minimum} point${minimum > 1 ? 's' : ''} de recharge depuis le 1ᵉʳ janvier 2025, dont un sur un emplacement accessible PMR. Des travaux importants en amont du réseau peuvent réduire ce nombre — ils ne suppriment pas l'obligation.`
      : `Parc de ${places} places : sous le seuil de plus de 20 places de l'article L113-13, aucune obligation.`
  } else {
    const preEq = places > CONFIG.reglementaire.seuilNeufRenovation
      ? Math.ceil(places * CONFIG.reglementaire.partPreEquipeeNeuf) : 0
    minimum = places > CONFIG.reglementaire.seuilNeufRenovation ? (places > 200 ? 2 : 1) : 0
    texte = preEq > 0
      ? `Parking ${etat === 'neuf' ? 'neuf' : 'en rénovation importante'} de ${places} places : l'article L113-12 impose une place sur cinq pré-équipée (${preEq} places), au moins ${minimum} point${minimum > 1 ? 's' : ''} installé${minimum > 1 ? 's' : ''} et 2 % des places accessibles PMR. En rénovation, l'obligation tombe si les installations dépassent 7 % du coût total des travaux.`
      : `Parking de ${places} places : sous le seuil de plus de 10 places de l'article L113-12, aucune obligation.`
  }

  const etudeObligatoire = places >= CONFIG.reglementaire.seuilEtudeConception
  if (etudeObligatoire) avert.push(`Parc d'au moins ${CONFIG.reglementaire.seuilEtudeConception} places : une étude de conception électrique par un professionnel qualifié IRVE est obligatoire avant travaux.`)
  if (usage === 'ouvert') avert.push("Ouverture au public : la demande des visiteurs extérieurs n'est PAS intégrée à cette estimation — elle exige une étude de fréquentation. S'y ajoutent des obligations de données, de continuité de service et un contrôle au moins annuel.")

  const hypotheses = [
    { label: 'Parc rechargeable en circulation', valeur: `${(court.partVe * 100).toFixed(1)} % en ${horizonCourt} (base ${(CONFIG.parc.reference.part * 100).toFixed(1)} % en 2026, SDES)` },
    { label: 'Véhicules par ' + UNITE[type].replace(/s$/, ''), valeur: String(CONFIG.vehiculesParUnite[type]) },
    { label: 'Recharge à l’arrivée', valeur: `${Math.round(CONFIG.tauxRechargeArrivee * 100)} % des arrivants` },
    { label: 'Recharge d’appoint en séjour', valeur: `${Math.round(CONFIG.tauxAppoint[type] * 100)} %` },
    { label: 'Facteur de pointe des arrivées', valeur: `× ${CONFIG.facteurPointe}` },
    { label: 'Énergie par session', valeur: `${CONFIG.energie.arrivee} kWh à l’arrivée, ${CONFIG.energie.appoint} kWh en appoint` },
    { label: 'Fenêtre de recharge nocturne', valeur: `${CONFIG.nuit.fenetreH} h, rendement ${Math.round(CONFIG.nuit.rendement * 100)} %` },
    { label: 'Marge sur l’électricité revendue', valeur: `${margeKwh.toFixed(2)} €/kWh` }
  ]

  return {
    input: { ...i, type, capacite },
    vehiculesPresents: presents, arriveesParNuit: arrivees,
    partVeCourt: court.partVe, partVeLong: long.partVe,
    sessionsCourt: court.sessions, sessionsLong: long.sessions,
    pointsCourt, pointsLong, preEquiper, niveaux, bornesDoubles, bornesSimples,
    puissanceUnitaire: pUnit, puissanceInstallee: pInstallee, puissanceAppelee: pAppelee,
    margeDisponible: marge, kWhNuit, puissanceMiniEnergie: pMiniEnergie,
    plafondPilotage, verdictPuissance: verdict, renforcementNecessaire: renforcement,
    investPoints, investGenieCivil, investPilotage, investRenforcement, investPreEquipement, investTotal,
    aideEstimee: aide, aideCommentaire: aideCom,
    kWhAn, recetteAn, chargesAn, margeAn, retourAns, nuiteesSupplementaires,
    statutPme: pme, minimumReglementaire: minimum, texteReglementaire: texte,
    etudeConceptionObligatoire: etudeObligatoire,
    hypotheses, avertissements: avert
  }
}

/** Résumé texte pour l'e-mail de lead. */
export function resumeBornes(r: BornesResult): string {
  const i = r.input
  const l: string[] = []
  l.push(`${LABELS_ETAB[i.type]} — ${i.capacite} ${UNITE[i.type]}`)
  l.push(`Besoin : ${r.pointsCourt} points de recharge (${r.bornesDoubles} borne(s) double(s)${r.bornesSimples ? ' + 1 simple' : ''}), + ${r.preEquiper} emplacement(s) à pré-équiper`)
  l.push(`Puissance : ${r.puissanceUnitaire} kW par point, plafond piloté ${Math.round(r.plafondPilotage)} kW — ${r.verdictPuissance}`)
  l.push(`Investissement : ${Math.round(r.investTotal).toLocaleString('fr-FR')} € HT, aide estimée ${Math.round(r.aideEstimee).toLocaleString('fr-FR')} €`)
  l.push(`Recette nette : ${r.margeAn.toLocaleString('fr-FR')} €/an${r.retourAns ? ` — retour en ${r.retourAns} ans` : ''}`)
  l.push(`Réglementaire : ${r.minimumReglementaire === null ? 'à vérifier' : r.minimumReglementaire + ' point(s) minimum'}`)
  return l.join('\n')
}
