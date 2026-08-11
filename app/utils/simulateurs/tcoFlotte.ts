/**
 * OTONOM — Moteur du simulateur de TCO flotte électrique (recharge & infra incluses).
 *
 * Fonctions pures, sans DOM. Voir SPEC-SIMULATEUR-TCO.md pour la méthode complète.
 *
 * Trois règles structurantes, à ne jamais contourner :
 *  1. Le calcul est MENSUEL puis agrégé — une mise en service en cours d'année ne
 *     traverse pas des années pleines.
 *  2. La valeur résiduelle ne se soustrait QU'UNE FOIS, au niveau du TCO. Le poste
 *     « détention » porte le coût d'acquisition, jamais la dépréciation nette.
 *  3. TCO économique (quote-part d'infrastructure) et trésorerie (infrastructure
 *     entièrement décaissée au départ) sont deux lectures distinctes.
 */
import {
  type CategorieFiscale, type Motorisation,
  carburantDe, EST_ELECTRIQUE, millesime, millesimesProvisoires,
  taxeCO2, taxePolluants, malusCO2, malusPoids,
  partNonDeductible, tvaCarburant, prixPorte, avantageEnNature, suramortissement, TVA
} from './fiscalite'
import { num, clamp, normaliserParts, basculeDurable, bissection, type Bascule } from './core'

/* ── Catégories & profils ────────────────────────────────────────────────── */

export type CategorieVehicule = 'citadine' | 'compacte' | 'berline' | 'vul'
export type Financement = 'achat' | 'credit' | 'lld' | 'loa'
export type ProfilRecharge = 'depot-nuit' | 'site-journee' | 'domicile' | 'itinerant' | 'mixte'

export const LABELS_CATEGORIE: Record<CategorieVehicule, string> = {
  citadine: 'Citadine', compacte: 'Compacte', berline: 'Berline / SUV', vul: 'Utilitaire léger'
}
export const LABELS_FINANCEMENT: Record<Financement, string> = {
  achat: 'Achat comptant', credit: 'Crédit', lld: 'Location longue durée (LLD)', loa: 'Location avec option d\'achat (LOA)'
}
export const LABELS_PROFIL: Record<ProfilRecharge, string> = {
  'depot-nuit': 'Retour au dépôt chaque nuit',
  'site-journee': 'Stationnement sur site en journée',
  domicile: 'Recharge majoritairement au domicile',
  itinerant: 'Flotte itinérante, recharge publique',
  mixte: 'Organisation mixte'
}

/* ── Configuration (hypothèses par défaut) ───────────────────────────────── */

/**
 * Toute la « science » est ici : un seul endroit, daté, modifiable.
 * [BARÈME] officiel · [MARCHÉ] ordre de grandeur · [HYPOTHÈSE] ratio de travail
 * Les valeurs marquées « à confirmer » dans la spec (§15) restent provisoires.
 */
export const TCO_CONFIG = {
  maj: '01/01/2026',
  version: '1.0',

  /** Prix de l'énergie. [MARCHÉ] */
  energie: {
    gazole: 1.90,            // €/L TTC
    essence: 1.90,           // €/L TTC
    siteHC: 0.158,           // €/kWh HT
    siteHP: 0.207,           // €/kWh HT
    domicile: 0.20,          // €/kWh remboursé
    publicAC: 0.40,
    publicDC: 0.58,
    pertesCharge: 0.12       // [HYPOTHÈSE] l'énergie facturée dépasse l'énergie stockée
  },

  /** Consommations RÉELLES (pas WLTP : l'écart constaté est de +15 à +25 %). [MARCHÉ] */
  conso: {
    citadine: { therm: 5.0, elec: 15.0 },
    compacte: { therm: 5.5, elec: 17.0 },
    berline: { therm: 6.5, elec: 20.0 },
    vul: { therm: 7.0, elec: 22.0 }
  } as Record<CategorieVehicule, { therm: number; elec: number }>,

  /** Prix d'acquisition HT indicatifs. [MARCHÉ] */
  prix: {
    citadine: { therm: 19000, elec: 24000 },
    compacte: { therm: 26000, elec: 32000 },
    berline: { therm: 38000, elec: 45000 },
    vul: { therm: 25000, elec: 33000 }
  } as Record<CategorieVehicule, { therm: number; elec: number }>,

  /** Émissions et masse du thermique de référence. [MARCHÉ] */
  vehicule: {
    citadine: { co2: 115, masse: 1150, ptac: 1600 },
    compacte: { co2: 128, masse: 1350, ptac: 1900 },
    berline: { co2: 150, masse: 1650, ptac: 2200 },
    // Le PTAC (rubrique F.2), pas la masse à vide, pilote le suramortissement.
    // À 3 500 kg exactement le taux est de 115 % ; à 3 499 kg il tombe à 40 %.
    vul: { co2: 165, masse: 1900, ptac: 3500 }
  } as Record<CategorieVehicule, { co2: number; masse: number; ptac: number }>,

  /** Coûts d'usage annuels par véhicule. [MARCHÉ] */
  usage: {
    entretienTherm: 750,
    entretienElec: 380,
    /**
     * Progression de l'entretien avec l'âge. Mise à 0 : une pente identique pour
     * l'électrique et le thermique paraissait scientifique sans l'être. On retient
     * un coût moyen assumé comme hypothèse, que les scénarios font varier.
     */
    entretienCroissanceParAn: 0,
    pneusParKmTherm: 0.015,
    pneusParKmElec: 0.022,
    assuranceTherm: 720,
    assuranceElec: 810,
    gestion: 150
  },

  /** Valeurs résiduelles, en % du prix neuf. [À CONFIRMER — §15.14] */
  valeurResiduelle: {
    therm: { 36: 0.50, 48: 0.42, 60: 0.34 } as Record<number, number>,
    elec: { 36: 0.40, 48: 0.33, 60: 0.26 } as Record<number, number>
  },

  /** Financement. [HYPOTHÈSE] */
  financement: {
    tauxActualisation: 0.05,   // coût du capital, achat comptant uniquement
    tauxCredit: 0.055,
    apportCreditPart: 0.15,
    /**
     * Taux financier mensuel appliqué par le loueur. [HYPOTHÈSE — à calibrer
     * sur quelques offres réelles]. Remplace l'ancien « % fixe du prix » qui
     * ignorait la valeur résiduelle et avantageait donc structurellement
     * l'électrique, dont la revente est plus basse.
     */
    tauxFinancierLoueur: 0.065,   // « taux de financement estimatif », pas un taux de marché observé
    /**
     * Frais de gestion du loueur, en € par mois et par véhicule.
     * Remplace l'ancienne « marge de services » de 12 % : elle doublonnait avec
     * l'entretien, les pneus et l'assurance déjà comptés séparément.
     */
    fraisGestionLoueurMois: 25,
    fraisRestitution: 350,     // [À CONFIRMER — §15.15]
    optionAchatPart: 0.20
  },

  /** Infrastructure de recharge. [MARCHÉ] */
  infra: {
    coutPointAC7: 1400,
    coutPointAC11: 2000,
    coutPointAC22: 2800,
    coutPointDC: 28000,
    genieCivil: { simple: 2000, moyenne: 6000, complexe: 15000 },
    renforcementRaccordement: 12000,
    coutEMS: 3500,
    supervisionParPointAn: 120,
    maintenancePart: 0.03,     // % de l'investissement / an
    dureeAmortissementAns: 8,
    /** Aucune aide générale : ADVENIR ne finance plus le parking privé ordinaire (§15.3). */
    aideParDefaut: 0
  },

  /** Profils de recharge : mix énergétique et partage des points. [HYPOTHÈSE] */
  profils: {
    'depot-nuit': { mix: { siteHC: 0.80, siteHP: 0.05, domicile: 0.05, publicAC: 0.05, publicDC: 0.05 }, vehParPoint: 3.0, partAC22: 0.10, partDC: 0.00 },
    'site-journee': { mix: { siteHC: 0.20, siteHP: 0.55, domicile: 0.05, publicAC: 0.10, publicDC: 0.10 }, vehParPoint: 2.0, partAC22: 0.25, partDC: 0.00 },
    domicile: { mix: { siteHC: 0.10, siteHP: 0.10, domicile: 0.65, publicAC: 0.05, publicDC: 0.10 }, vehParPoint: 6.0, partAC22: 0.10, partDC: 0.00 },
    itinerant: { mix: { siteHC: 0.10, siteHP: 0.05, domicile: 0.10, publicAC: 0.25, publicDC: 0.50 }, vehParPoint: 8.0, partAC22: 0.30, partDC: 0.20 },
    mixte: { mix: { siteHC: 0.40, siteHP: 0.20, domicile: 0.20, publicAC: 0.10, publicDC: 0.10 }, vehParPoint: 2.5, partAC22: 0.20, partDC: 0.00 }
  } as Record<ProfilRecharge, { mix: Record<string, number>; vehParPoint: number; partAC22: number; partDC: number }>,

  /** Facteurs d'émission. [BARÈME ADEME] */
  co2: { gazole: 3.07, essence: 2.79, electricite: 0.056 },

  /** Entreprise. [HYPOTHÈSE] */
  entreprise: { tauxIS: 0.25, chargesPatronales: 0.45 }
}

/* ── Entrées ─────────────────────────────────────────────────────────────── */

export interface TcoInput {
  // Écran 1 — obligatoires
  nbVehicules?: number
  categorie?: CategorieVehicule
  kmAn?: number
  // Écran 1 — préremplis
  dureeMois?: 36 | 48 | 60
  financement?: Financement
  profilRecharge?: ProfilRecharge
  /** 'YYYY-MM' — un projet démarrant en 2026 ou en 2027 ne donne pas le même résultat. */
  moisDebut?: string

  // Mode « avec mes données »
  prixHTElec?: number
  prixHTTherm?: number
  loyerMensuelElec?: number
  loyerMensuelTherm?: number
  surloyerElec?: number
  surloyerTherm?: number
  /** Ce que le loyer comprend — sinon les postes seraient comptés deux fois. */
  loyerInclut?: { entretien?: boolean; pneus?: boolean; assurance?: boolean }
  optionAchatLevee?: boolean
  /** Le loyer saisi est-il HT ou TTC ? (undefined = HT, valeur usuelle des devis) */
  loyerEstTTC?: boolean
  /** Le malus est-il compris dans l'offre ? undefined = inconnu. */
  malusDansLoyer?: boolean
  /** Les taxes annuelles sont-elles comprises dans l'offre ? */
  taxesDansLoyer?: boolean

  // Véhicule
  motorisationTherm?: Motorisation
  co2Therm?: number
  masseTherm?: number
  /** PTAC en kg (rubrique F.2 de la carte grise) — pilote le suramortissement. */
  ptacKg?: number
  /**
   * Certains N1 sont requalifiés en véhicules de tourisme, et pas de la même
   * façon selon la taxe : une camionnette à 3 rangées peut être taxable aux
   * taxes annuelles tout en restant hors du champ du malus.
   */
  typeUtilitaire?: 'classique' | 'pickup-5places' | 'camionnette-3rangees'
  consoTherm?: number
  consoElec?: number

  // Recharge (surcharge le profil)
  mixRecharge?: Partial<Record<'siteHC' | 'siteHP' | 'domicile' | 'publicAC' | 'publicDC', number>>
  prixSiteHC?: number
  prixSiteHP?: number

  // Infrastructure
  nbSites?: number
  complexiteGenieCivil?: 'simple' | 'moyenne' | 'complexe'
  renforcementNecessaire?: boolean
  pilotageEMS?: boolean
  nbPointsForce?: number
  aideInfra?: number
  dureeAmortissementInfraAns?: number

  // Coûts d'usage — surcharges (€/an/véhicule sauf mention)
  entretienTherm?: number
  entretienElec?: number
  pneusKmTherm?: number
  pneusKmElec?: number
  assuranceTherm?: number
  assuranceElec?: number
  gestion?: number

  /** Valeurs résiduelles en part du prix neuf (0–1). Poste le plus déterminant. */
  vrTherm?: number
  vrElec?: number

  // Énergie — surcharges
  prixGazole?: number
  prixEssence?: number
  prixDomicile?: number
  prixPublicAC?: number
  prixPublicDC?: number
  pertesCharge?: number

  /** Coût moyen d'un point de charge, toutes puissances confondues. */
  coutPointMoyen?: number
  supervisionParPointAn?: number

  // Entreprise
  tauxIS?: number
  tauxActualisation?: number
  chargesPatronales?: number
  /** Taux de financement estimatif servant à reconstruire le loyer. */
  tauxFinancierLoueur?: number
  fraisGestionLoueurMois?: number
  coutCapitalActif?: boolean
  partVehiculesFonction?: number
  /** Données de renouvellement — sans elles, aucune taxe incitative n'est chiffrée. */
  flotteTotale?: number
  taiDonnees?: { flotteTaxable: number; vfeActuels: number; tauxRenouvellement: number }
}

/* ── Sorties ─────────────────────────────────────────────────────────────── */

export interface PostesTco {
  detention: number
  coutCapital: number
  energie: number
  entretien: number
  pneus: number
  assurance: number
  taxesAnnuelles: number
  malus: number
  chargesAEN: number
  taxeIncitative: number | null
  gestion: number
  infrastructure: number
  valeurResiduelle: number
}

export interface ScenarioTco {
  motorisation: Motorisation
  postes: PostesTco
  /** TCO opérationnel = Σ postes − valeur résiduelle. */
  tcoOperationnel: number
  /** Économie d'IS + suramortissement, présentée à part (jamais fondue au TCO). */
  impactFiscal: number
  /** Économie d'IS perdue à cause du plafond — informatif, jamais soustrait. */
  isPerduPlafond: number
  /** Charges patronales sur l'avantage en nature — module social, hors TCO. */
  impactEmployeurAEN: number
  /** Suramortissement (art. 39 decies A), nul en LLD et hors électrique. */
  suramortissement: number
  cumulEco: number[]
  cumulTreso: number[]
  investInfraTotal: number
  co2Tonnes: number
  litresOuKwh: number
}

/** Un exercice annuel, pour l'échéancier de trésorerie. */
export interface LigneAnnuelle {
  annee: number
  investissement: number
  coutsElec: number
  coutsTherm: number
  /** Revente encaissée, présentée comme une ENTRÉE positive (jamais un coût négatif). */
  cessionElec: number
  cessionTherm: number
  economie: number
  cumule: number
}

export interface TcoResult {
  input: Required<Pick<TcoInput, 'nbVehicules' | 'categorie' | 'kmAn'>> & TcoInput
  dureeMois: number
  anneeDebut: number
  anneeFin: number
  millesimesProvisoires: number[]
  elec: ScenarioTco
  therm: ScenarioTco
  ecart: number
  ecartPct: number
  tcoMensuelParVehiculeElec: number
  tcoMensuelParVehiculeTherm: number
  prkElec: number
  prkTherm: number
  partInfra: number
  investInfraTotal: number
  basculeEco: Bascule
  basculeTreso: Bascule
  basculeKm: number | null
  basculeKmSens: 'bascule' | 'toujours-gagnant' | 'jamais-gagnant'
  tcoCycleSuivant: number
  /** Quote-part d'infrastructure encore à amortir sur le cycle suivant. */
  infraCycleSuivant: number
  co2EviteTonnes: number
  nbPoints: number
  /** Avantages non modélisés qui joueraient en faveur de l'électrique. */
  avantagesNonModelises: string[]
  echeancier: LigneAnnuelle[]
}

/* ── Utilitaires internes ────────────────────────────────────────────────── */

const VR_DEFAUT = 0.40

function tauxVR(motor: Motorisation, dureeMois: number, i?: TcoInput): number {
  const surcharge = EST_ELECTRIQUE(motor) ? i?.vrElec : i?.vrTherm
  if (typeof surcharge === 'number' && isFinite(surcharge)) return clamp(surcharge, 0, 0.95)
  const table = EST_ELECTRIQUE(motor) ? TCO_CONFIG.valeurResiduelle.elec : TCO_CONFIG.valeurResiduelle.therm
  return table[dureeMois] ?? VR_DEFAUT
}

/**
 * Loyer financier mensuel d'une location.
 *   loyer = (P − VR/(1+i)^n) × i / (1 − (1+i)^−n)   puis marge de services.
 * À taux nul, se réduit à (P − VR) / n.
 */
export function loyerFinancier(prixHT: number, vrHT: number, dureeMois: number, opts: { taux?: number; fraisMois?: number } = {}): number {
  const i = num(opts.taux, TCO_CONFIG.financement.tauxFinancierLoueur) / 12
  const n = Math.max(1, dureeMois)
  const base = i > 0
    ? (prixHT - vrHT / Math.pow(1 + i, n)) * i / (1 - Math.pow(1 + i, -n))
    : (prixHT - vrHT) / n
  return Math.max(0, base) + num(opts.fraisMois, TCO_CONFIG.financement.fraisGestionLoueurMois)
}

function categorieFiscale(cat: CategorieVehicule): CategorieFiscale {
  return cat === 'vul' ? 'utilitaire' : 'tourisme'
}

/**
 * Qualification fiscale fine. Une catégorie unique « tourisme / utilitaire » ne
 * suffit pas : certains N1 sont requalifiés en véhicules de tourisme, et pas de
 * la même façon selon la taxe. Une camionnette à 3 rangées peut être soumise aux
 * taxes annuelles tout en restant hors du champ du malus d'immatriculation.
 * [À CONFIRMER — qualification à valider au cas par cas.]
 */
function qualification(cat: CategorieVehicule, type?: TcoInput['typeUtilitaire']) {
  if (cat !== 'vul') {
    return { taxesAnnuelles: true, malus: true, tvaVehicule: false, plafondAmortissement: true }
  }
  switch (type) {
    case 'pickup-5places':
      // Requalifié en véhicule de tourisme pour l'essentiel.
      return { taxesAnnuelles: true, malus: true, tvaVehicule: false, plafondAmortissement: true }
    case 'camionnette-3rangees':
      // Taxable aux taxes annuelles, mais hors champ du malus.
      return { taxesAnnuelles: true, malus: false, tvaVehicule: true, plafondAmortissement: false }
    default:
      return { taxesAnnuelles: false, malus: false, tvaVehicule: true, plafondAmortissement: false }
  }
}

/** Découpe la période en mois, avec l'année civile de chaque mois. */
function moisDeLaPeriode(debut: string | undefined, dureeMois: number): { annee: number; mois: number }[] {
  const now = new Date()
  let y = now.getFullYear()
  let m = now.getMonth() + 1
  if (debut && /^\d{4}-\d{2}$/.test(debut)) {
    y = Number(debut.slice(0, 4))
    m = Number(debut.slice(5, 7))
  }
  const out: { annee: number; mois: number }[] = []
  for (let i = 0; i < dureeMois; i++) {
    out.push({ annee: y, mois: m })
    m++
    if (m > 12) { m = 1; y++ }
  }
  return out
}

/* ── Infrastructure ──────────────────────────────────────────────────────── */

interface Infra { invest: number; investNet: number; nbPoints: number; recurrentAn: number }

function calculerInfra(i: TcoInput, N: number): Infra {
  const c = TCO_CONFIG.infra
  const profil = TCO_CONFIG.profils[i.profilRecharge || 'depot-nuit']
  const nbSites = Math.max(1, num(i.nbSites, 1))
  const nbPoints = Math.max(1, Math.round(num(i.nbPointsForce, Math.ceil(N / profil.vehParPoint))))

  const nDC = Math.round(nbPoints * profil.partDC)
  const nAC22 = Math.round((nbPoints - nDC) * profil.partAC22)
  const nAC11 = Math.round((nbPoints - nDC - nAC22) * 0.5)
  const nAC7 = Math.max(0, nbPoints - nDC - nAC22 - nAC11)

  const materiel = typeof i.coutPointMoyen === 'number' && isFinite(i.coutPointMoyen)
    ? nbPoints * i.coutPointMoyen
    : nDC * c.coutPointDC + nAC22 * c.coutPointAC22
      + nAC11 * c.coutPointAC11 + nAC7 * c.coutPointAC7
  const genieCivil = nbSites * c.genieCivil[i.complexiteGenieCivil || 'moyenne']
  // Le pilotage évite, dans beaucoup de configurations, le renforcement du raccordement.
  const renforcement = (i.renforcementNecessaire && !i.pilotageEMS) ? nbSites * c.renforcementRaccordement : 0
  const ems = i.pilotageEMS === false ? 0 : nbSites * c.coutEMS

  const invest = materiel + genieCivil + renforcement + ems
  const investNet = Math.max(0, invest - num(i.aideInfra, c.aideParDefaut))
  const recurrentAn = nbPoints * num(i.supervisionParPointAn, c.supervisionParPointAn) + invest * c.maintenancePart

  return { invest, investNet, nbPoints, recurrentAn }
}

/* ── Cœur : un scénario (électrique ou thermique) ────────────────────────── */

function calculerScenario(i: TcoInput, motor: Motorisation): ScenarioTco {
  const N = Math.max(1, num(i.nbVehicules, 20))
  const cat = i.categorie || 'compacte'
  const catFisc = categorieFiscale(cat)
  const q = qualification(cat, i.typeUtilitaire)
  const K = Math.max(0, num(i.kmAn, 22000))
  const dureeMois = num(i.dureeMois, 48)
  const dureeAns = dureeMois / 12
  const elec = EST_ELECTRIQUE(motor)
  const fin = i.financement || 'lld'
  const cfg = TCO_CONFIG
  const periode = moisDeLaPeriode(i.moisDebut, dureeMois)

  /* — Véhicule & prix — */
  const prixHT = elec
    ? num(i.prixHTElec, cfg.prix[cat].elec)
    : num(i.prixHTTherm, cfg.prix[cat].therm)
  // TTC pour un véhicule de tourisme : la TVA n'y est pas récupérable.
  const prix = prixPorte(prixHT, catFisc)
  const co2 = elec ? 0 : num(i.co2Therm, cfg.vehicule[cat].co2)
  const masse = elec ? 0 : num(i.masseTherm, cfg.vehicule[cat].masse)
  const vr = prix * tauxVR(motor, dureeMois, i)

  /* — Détention, selon les quatre modes — */
  let detention = 0
  /* Loyer mensuel par véhicule, remonté à ce niveau : l'avantage en nature en
     location s'assoit dessus, et il ne vivait que dans le bloc de la location. */
  let loyerMensuelVehicule = 0
  let coutCapitalTotal = 0
  let vrFinale = 0
  let decaissementInitial = 0
  const echeanceMensuelle: number[] = new Array(dureeMois).fill(0)

  if (fin === 'achat') {
    detention = prix * N
    vrFinale = vr * N
    decaissementInitial = prix * N
    if (i.coutCapitalActif !== false) {
      // Capital réellement immobilisé : il décroît de `prix` vers `vr`, pas vers zéro.
      for (let m = 0; m < dureeMois; m++) {
        const restant = prix - (prix - vr) * (m / dureeMois)
        coutCapitalTotal += restant * num(i.tauxActualisation, cfg.financement.tauxActualisation) / 12 * N
      }
    }
  } else if (fin === 'credit') {
    const apport = prix * cfg.financement.apportCreditPart
    const capital = prix - apport
    const t = cfg.financement.tauxCredit / 12
    const mensualite = t > 0
      ? capital * t / (1 - Math.pow(1 + t, -dureeMois))
      : capital / dureeMois
    detention = (apport + mensualite * dureeMois) * N
    vrFinale = vr * N
    decaissementInitial = apport * N
    echeanceMensuelle.fill(mensualite * N)
  } else {
    // LLD et LOA : loyer régulier + surloyer initial SUPPLÉMENTAIRE (il ne
    // remplace pas une mensualité, et ne s'y ajoute pas non plus deux fois).
    // Loyer financier : c'est (prix − valeur résiduelle actualisée) qui est
    // financé, pas le prix entier. Un électrique dont la revente est plus basse
    // a donc mécaniquement un loyer plus élevé à prix égal.
    const loyerDefaut = loyerFinancier(prixHT, prixHT * tauxVR(motor, dureeMois, i), dureeMois,
      { taux: i.tauxFinancierLoueur, fraisMois: i.fraisGestionLoueurMois })
    const loyerHT = elec
      ? num(i.loyerMensuelElec, loyerDefaut)
      : num(i.loyerMensuelTherm, loyerDefaut)
    // La TVA sur la location d'un VP n'est pas récupérable non plus.
    // Si l'utilisateur a saisi un loyer déjà TTC, on ne le majore pas.
    const loyer = i.loyerEstTTC ? loyerHT : prixPorte(loyerHT, catFisc)
    const surloyer = elec ? num(i.surloyerElec, 0) : num(i.surloyerTherm, 0)

    loyerMensuelVehicule = loyer
    detention = (surloyer + loyer * dureeMois) * N
    decaissementInitial = (surloyer + loyer) * N
    echeanceMensuelle.fill(loyer * N)
    echeanceMensuelle[0] = (loyer + surloyer) * N

    if (fin === 'lld') {
      detention += cfg.financement.fraisRestitution * N
      vrFinale = 0
    } else if (i.optionAchatLevee) {
      const option = prix * cfg.financement.optionAchatPart
      detention += option * N
      vrFinale = vr * N
    }
  }

  /* — Énergie — */
  const conso = elec
    ? num(i.consoElec, cfg.conso[cat].elec)
    : num(i.consoTherm, cfg.conso[cat].therm)
  let energieAn = 0
  if (elec) {
    const profil = cfg.profils[i.profilRecharge || 'depot-nuit']
    const mix = normaliserParts({ ...profil.mix, ...(i.mixRecharge || {}) } as Record<string, number>)
    const prixMoyen =
      (mix.siteHC || 0) * num(i.prixSiteHC, cfg.energie.siteHC) +
      (mix.siteHP || 0) * num(i.prixSiteHP, cfg.energie.siteHP) +
      (mix.domicile || 0) * num(i.prixDomicile, cfg.energie.domicile) +
      (mix.publicAC || 0) * num(i.prixPublicAC, cfg.energie.publicAC) +
      (mix.publicDC || 0) * num(i.prixPublicDC, cfg.energie.publicDC)
    // L'énergie facturée dépasse l'énergie stockée : pertes de charge.
    const kWh = K * conso / 100 * (1 + num(i.pertesCharge, cfg.energie.pertesCharge))
    energieAn = kWh * prixMoyen * N              // TVA électricité récupérable à 100 %
  } else {
    const litres = K * conso / 100
    const prixL = carburantDe(motor) === 'gazole'
      ? num(i.prixGazole, cfg.energie.gazole) : num(i.prixEssence, cfg.energie.essence)
    const ttc = litres * prixL
    const recup = ttc * (TVA.taux / (1 + TVA.taux)) * tvaCarburant(motor, catFisc)
    energieAn = (ttc - recup) * N
  }

  /* — Usage (neutralisé si compris dans le loyer) — */
  const enLocation = fin === 'lld' || fin === 'loa'
  const inclut = i.loyerInclut || {}
  const entretienBase = elec
    ? num(i.entretienElec, cfg.usage.entretienElec)
    : num(i.entretienTherm, cfg.usage.entretienTherm)
  const pneusAn = (elec
    ? num(i.pneusKmElec, cfg.usage.pneusParKmElec)
    : num(i.pneusKmTherm, cfg.usage.pneusParKmTherm)) * K * N
  const assuranceAn = (elec
    ? num(i.assuranceElec, cfg.usage.assuranceElec)
    : num(i.assuranceTherm, cfg.usage.assuranceTherm)) * N

  const skipEntretien = enLocation && !!inclut.entretien
  const skipPneus = enLocation && !!inclut.pneus
  const skipAssurance = enLocation && !!inclut.assurance

  /* — Boucle mensuelle — */
  let energie = 0, entretien = 0, pneus = 0, assurance = 0, gestion = 0
  let taxesAnnuelles = 0, chargesAEN = 0, taiTotal: number | null = null
  let chargesDeductibles = 0
  const cumulEco: number[] = []
  const cumulTreso: number[] = []
  /* — Malus d'immatriculation : dû au mois 0, donc AVANT la boucle — */
  const anneeDebutM = periode[0]!.annee
  const malusBrut = q.malus
    ? (malusCO2(co2, motor, 'tourisme', anneeDebutM) + malusPoids(masse, motor, 'tourisme', anneeDebutM)) * N
    : 0
  // Le fait générateur est l'immatriculation. En location, le loueur l'acquitte
  // puis le répercute — mais la présentation contractuelle n'est pas
  // standardisée : on demande donc à l'utilisateur ce que contient son offre.
  const malus = (fin === 'achat' || fin === 'credit') ? malusBrut
    : i.malusDansLoyer === false ? malusBrut
      : i.malusDansLoyer === true ? 0
        // Loyer reconstruit par nos soins : le malus n'y est pas, on l'ajoute.
        : (i.loyerMensuelElec || i.loyerMensuelTherm) ? 0 : malusBrut

  // Il entre au mois 0 des DEUX courbes : sans lui, elles se terminaient sous
  // le chiffre principal, et un lecteur attentif l'aurait vu tout de suite.
  let accEco = malus
  let accTreso = decaissementInitial + malus

  const infra = elec ? calculerInfra(i, N) : { invest: 0, investNet: 0, nbPoints: 0, recurrentAn: 0 }
  const dureeInfraMois = Math.max(1, num(i.dureeAmortissementInfraAns, cfg.infra.dureeAmortissementAns) * 12)
  const infraMensuelleEco = infra.investNet / dureeInfraMois
  const infraRecurrentMois = infra.recurrentAn / 12
  if (elec) accTreso += infra.invest

  // Part « détention » de la courbe économique, selon le financement.
  // Une seule formule pour les quatre modes : le poste « détention » réellement
  // retenu au TCO, net de la revente, étalé sur la durée. En achat, `detention`
  // vaut le prix ; en crédit elle contient déjà les intérêts ; en location, les
  // loyers. Distinguer les cas faisait diverger la courbe du chiffre annoncé.
  const detentionEcoMensuelle = (detention - vrFinale) / dureeMois

  const partFonction = clamp(num(i.partVehiculesFonction, 0), 0, 1)

  for (let m = 0; m < dureeMois; m++) {
    const { annee } = periode[m]!
    const ageAns = m / 12

    const energieM = energieAn / 12
    const entretienM = skipEntretien ? 0
      : entretienBase * (1 + cfg.usage.entretienCroissanceParAn * ageAns) * N / 12
    const pneusM = skipPneus ? 0 : pneusAn / 12
    const assuranceM = skipAssurance ? 0 : assuranceAn / 12
    const gestionM = num(i.gestion, cfg.usage.gestion) * N / 12

    const taxesComprises = enLocation && i.taxesDansLoyer === true
    const taxesM = (taxesComprises || !q.taxesAnnuelles) ? 0
      : (taxeCO2(co2, motor, 'tourisme', annee) + taxePolluants(motor, 'tourisme', annee)) * N / 12

    /* En location, l'assiette forfaitaire est le COÛT GLOBAL ANNUEL — loyer,
       entretien, assurance — et non le prix du véhicule, que le locataire ne
       paie jamais. On le reconstitue ici : la fonction fiscale n'a pas
       connaissance des loyers. Montants par véhicule et par an. */
    const coutGlobalAnnuel = enLocation
      ? loyerMensuelVehicule * 12
        + (skipEntretien ? 0 : entretienBase * (1 + cfg.usage.entretienCroissanceParAn * ageAns))
        + (skipAssurance ? 0 : assuranceAn / N)
      : undefined
    const aenAnnuel = partFonction > 0
      ? avantageEnNature(prix, motor, annee, { loue: enLocation, coutGlobalAnnuel }) : 0
    const aenM = aenAnnuel * num(i.chargesPatronales, cfg.entreprise.chargesPatronales) * N * partFonction / 12

    energie += energieM; entretien += entretienM; pneus += pneusM
    assurance += assuranceM; gestion += gestionM
    taxesAnnuelles += taxesM; chargesAEN += aenM

    // Base déductible de l'IS (les loyers y entrent nets de leur part non déductible).
    chargesDeductibles += energieM + entretienM + pneusM + assuranceM + gestionM + taxesM

    const coutCapitalM = fin === 'achat' && i.coutCapitalActif !== false
      ? (prix - (prix - vr) * (m / dureeMois)) * num(i.tauxActualisation, cfg.financement.tauxActualisation) / 12 * N
      : 0

    const usageM = energieM + entretienM + pneusM + assuranceM + gestionM + taxesM

    // Courbe économique : consommation progressive de l'actif.
    accEco += detentionEcoMensuelle + coutCapitalM + usageM + (elec ? infraMensuelleEco + infraRecurrentMois : 0)
    cumulEco.push(accEco)

    // Courbe de trésorerie : décaissements réels.
    accTreso += echeanceMensuelle[m]! + usageM + (elec ? infraRecurrentMois : 0)
    if (m === dureeMois - 1) accTreso -= vrFinale     // la revente est une recette
    cumulTreso.push(accTreso)
  }

  /* — Malus à l'immatriculation (une seule fois) — */
  /* — Taxe incitative : rien plutôt qu'un chiffre faux — */
  if (i.taiDonnees) {
    taiTotal = 0
    for (const { annee } of periode) {
      const t = millesime(annee).taxeIncitative
      const cible = t.quota * i.taiDonnees.flotteTaxable
      const ecart = Math.max(0, cible - i.taiDonnees.vfeActuels)
      const annuel = i.taiDonnees.flotteTaxable >= t.seuilFlotte
        ? ecart * t.tarifUnitaire * clamp(i.taiDonnees.tauxRenouvellement, 0, 1) : 0
      taiTotal += (elec ? 0 : annuel) / 12
    }
    taiTotal = Math.round(taiTotal)
  }

  /* — Infrastructure : quote-part économique — */
  const infraEco = elec ? infra.investNet * (dureeMois / dureeInfraMois) + infra.recurrentAn * dureeAns : 0

  const postes: PostesTco = {
    detention,
    coutCapital: coutCapitalTotal,
    energie, entretien, pneus, assurance,
    taxesAnnuelles, malus, chargesAEN,
    taxeIncitative: taiTotal,
    gestion,
    infrastructure: infraEco,
    valeurResiduelle: vrFinale
  }

  // ⚠️ La valeur résiduelle ne se soustrait QU'ICI.
  // Les charges sur avantage en nature relèvent de l'impact EMPLOYEUR, pas du
  // coût du véhicule : les inclure rendrait incomparables une flotte de service
  // et une flotte de fonction. Elles sont exposées à part (`impactEmployeurAEN`).
  const tcoOperationnel =
    detention + coutCapitalTotal + energie + entretien + pneus + assurance
    + taxesAnnuelles + malus + (taiTotal || 0) + gestion + infraEco
    - vrFinale

  /* — Impact fiscal, à part — */
  const partNonDed = q.plafondAmortissement ? partNonDeductible(prix, co2, 'tourisme') : 0
  let baseAmortissable = 0
  if (fin === 'achat' || fin === 'credit') {
    baseAmortissable = prix * N * (dureeMois / 60)          // amortissement usuel sur 5 ans
  } else {
    baseAmortissable = detention                            // les loyers
  }
  const amortDeductible = baseAmortissable * (1 - partNonDed)
  const isPerduPlafond = q.plafondAmortissement ? baseAmortissable * partNonDed * cfg.entreprise.tauxIS : 0
  // Économie d'IS calculée UNE SEULE FOIS, sur la seule part déductible.
  // Le coût du capital est un coût d'OPPORTUNITÉ : il n'existe pas
  // comptablement, donc il ne génère aucune économie d'impôt. L'inclure ici
  // créerait une déduction sur une charge jamais décaissée.
  const tauxIS = num(i.tauxIS, cfg.entreprise.tauxIS)

  // Suramortissement (art. 39 decies A) : uniquement pour l'électrique, calculé
  // sur le SURCOÛT par rapport au thermique comparable, et réservé à l'entreprise
  // qui porte le bien. En LLD la déduction revient au loueur : la compter ici
  // attribuerait au client un avantage qu'il ne perçoit pas.
  const prixThermRef = num(i.prixHTTherm, cfg.prix[cat].therm)
  const surcoutHT = Math.max(0, num(i.prixHTElec, cfg.prix[cat].elec) - prixThermRef)
  const suramort = elec
    ? suramortissement(motor, num(i.ptacKg, cfg.vehicule[cat].ptac), surcoutHT * N,
        fin, tauxIS, dureeMois / 60)
    : 0

  const impactFiscal = (chargesDeductibles + amortDeductible) * tauxIS + suramort

  /* — CO₂ — */
  const litresOuKwh = elec
    ? K * conso / 100 * (1 + cfg.energie.pertesCharge) * N * dureeAns
    : K * conso / 100 * N * dureeAns
  const facteur = elec ? cfg.co2.electricite
    : carburantDe(motor) === 'gazole' ? cfg.co2.gazole : cfg.co2.essence
  const co2Tonnes = litresOuKwh * facteur / 1000

  return {
    motorisation: motor,
    postes,
    tcoOperationnel,
    impactFiscal,
    isPerduPlafond,
    impactEmployeurAEN: chargesAEN,
    suramortissement: suramort,
    cumulEco,
    cumulTreso,
    investInfraTotal: infra.invest,
    co2Tonnes,
    litresOuKwh
  }
}

/* ── Calcul complet ──────────────────────────────────────────────────────── */

export function calculerTco(input: TcoInput): TcoResult {
  const i: TcoInput = { ...input }
  const N = Math.max(1, num(i.nbVehicules, 20))
  const cat = i.categorie || 'compacte'
  const K = Math.max(0, num(i.kmAn, 22000))
  const dureeMois = num(i.dureeMois, 48)
  const motorTherm = i.motorisationTherm && !EST_ELECTRIQUE(i.motorisationTherm)
    ? i.motorisationTherm : 'diesel'

  const elec = calculerScenario(i, 'electrique')
  const therm = calculerScenario(i, motorTherm)

  const periode = moisDeLaPeriode(i.moisDebut, dureeMois)
  const anneeDebut = periode[0]!.annee
  const anneeFin = periode[periode.length - 1]!.annee

  const ecart = therm.tcoOperationnel - elec.tcoOperationnel
  const ecartPct = therm.tcoOperationnel > 0 ? ecart / therm.tcoOperationnel : 0

  const kmTotal = K * (dureeMois / 12) * N

  // Bascule kilométrique : on vérifie d'abord qu'il existe un changement de
  // signe dans la plage réaliste, sinon la dichotomie renverrait une borne.
  const ecartPourKm = (km: number) => {
    const e = calculerScenario({ ...i, kmAn: km }, 'electrique')
    const t = calculerScenario({ ...i, kmAn: km }, motorTherm)
    return t.tcoOperationnel - e.tcoOperationnel
  }
  const basculeKm = bissection(ecartPourKm, 5000, 80000)
  // Sans changement de signe, « non atteinte » serait ambigu : l'électrique peut
  // gagner sur TOUTE la plage comme n'y gagner jamais. On distingue les deux.
  const basculeKmSens: 'bascule' | 'toujours-gagnant' | 'jamais-gagnant' =
    basculeKm !== null ? 'bascule'
      : ecartPourKm(5000) > 0 ? 'toujours-gagnant' : 'jamais-gagnant'

  // Cycle suivant : les bornes existent toujours et continuent de s'amortir.
  // Seul le DÉCAISSEMENT initial disparaît. On impute donc la quote-part
  // RÉSIDUELLE d'amortissement, pas zéro — « infrastructure gratuite » serait faux.
  const dureeInfraMoisTotal = Math.max(1, num(i.dureeAmortissementInfraAns, TCO_CONFIG.infra.dureeAmortissementAns) * 12)
  const moisRestants = Math.max(0, dureeInfraMoisTotal - dureeMois)
  const partResiduelle = Math.min(dureeMois, moisRestants) / dureeInfraMoisTotal
  const infraCycle2 = elec.investInfraTotal * partResiduelle
    + (elec.postes.infrastructure - elec.investInfraTotal * (dureeMois / dureeInfraMoisTotal))
  const tcoCycleSuivant = elec.tcoOperationnel - elec.postes.infrastructure + Math.max(0, infraCycle2)

  // Échéancier de TRÉSORERIE : ce qui est réellement décaissé, année par année.
  // L'année 1 porte tout l'investissement d'infrastructure — c'est ce qu'un
  // directeur financier veut voir, et ce que la quote-part économique masque.
  const echeancier: LigneAnnuelle[] = []
  {
    let precedentE = 0, precedentT = 0, cumule = 0
    for (let a = anneeDebut; a <= anneeFin; a++) {
      const dernierMois = periode.reduce((acc, m, idx) => (m.annee === a ? idx : acc), -1)
      if (dernierMois < 0) continue
      const e = elec.cumulTreso[dernierMois]!
      const t = therm.cumulTreso[dernierMois]!
      const investissement = a === anneeDebut ? elec.investInfraTotal : 0
      // La revente tombe au dernier mois : on l'extrait pour ne pas afficher
      // une ligne de « coût négatif », illisible pour un directeur financier.
      const derniere = dernierMois === periode.length - 1
      const cessionElec = derniere ? elec.postes.valeurResiduelle : 0
      const cessionTherm = derniere ? therm.postes.valeurResiduelle : 0
      // `cumulTreso` porte déjà l'investissement au mois 0 et déduit la revente
      // au dernier : on neutralise les deux pour isoler les vrais coûts.
      const coutsElec = e - precedentE - investissement + cessionElec
      const coutsTherm = t - precedentT + cessionTherm
      const economie = (coutsTherm - cessionTherm) - (coutsElec - cessionElec) - investissement
      cumule += economie
      echeancier.push({ annee: a, investissement, coutsElec, coutsTherm, cessionElec, cessionTherm, economie, cumule })
      precedentE = e; precedentT = t
    }
  }

  return {
    input: { ...i, nbVehicules: N, categorie: cat, kmAn: K },
    dureeMois,
    anneeDebut,
    anneeFin,
    millesimesProvisoires: millesimesProvisoires(anneeDebut, anneeFin),
    elec,
    therm,
    ecart,
    ecartPct,
    tcoMensuelParVehiculeElec: elec.tcoOperationnel / N / dureeMois,
    tcoMensuelParVehiculeTherm: therm.tcoOperationnel / N / dureeMois,
    prkElec: kmTotal > 0 ? elec.tcoOperationnel / kmTotal : 0,
    prkTherm: kmTotal > 0 ? therm.tcoOperationnel / kmTotal : 0,
    partInfra: elec.tcoOperationnel > 0 ? elec.postes.infrastructure / elec.tcoOperationnel : 0,
    investInfraTotal: elec.investInfraTotal,
    basculeEco: basculeDurable(elec.cumulEco, therm.cumulEco),
    basculeTreso: basculeDurable(elec.cumulTreso, therm.cumulTreso),
    basculeKm,
    basculeKmSens,
    tcoCycleSuivant,
    infraCycleSuivant: Math.max(0, infraCycle2),
    avantagesNonModelises: [
      ...(cat === 'vul'
        ? [(i.financement === 'lld' || i.financement === 'loa')
            ? "Le suramortissement des utilitaires électriques (art. 39 decies A) n'est pas attribué au locataire en LLD : son effet éventuel se répercute par le loueur, dans son loyer."
            : 'Le suramortissement des utilitaires électriques (art. 39 decies A) est intégré au résultat ci-dessus.']
        : []),
      ...(i.taiDonnees ? [] : ['La taxe annuelle incitative évitée n\'est pas chiffrée faute de données de renouvellement.'])
    ],
    co2EviteTonnes: therm.co2Tonnes - elec.co2Tonnes,
    nbPoints: calculerInfra(i, N).nbPoints,
    echeancier
  }
}

/* ── Scénarios de sensibilité ────────────────────────────────────────────── */

/**
 * Les quatre paramètres qui bougent : prix des véhicules, valeur résiduelle,
 * énergie (prix ET mix), coût d'infrastructure. Faire varier seulement la VR et
 * l'énergie serait incohérent alors que notre promesse porte sur l'infrastructure.
 */
export function deriverScenario(i: TcoInput, s: 'prudent' | 'central' | 'favorable'): TcoInput {
  if (s === 'central') return i
  const defavorable = s === 'prudent'
  const cat = i.categorie || 'compacte'
  const k = defavorable ? 1 : -1

  const prixElecBase = num(i.prixHTElec, TCO_CONFIG.prix[cat].elec)
  const profil = TCO_CONFIG.profils[i.profilRecharge || 'depot-nuit']
  const mixBase = { ...profil.mix, ...(i.mixRecharge || {}) } as Record<string, number>
  const dureeMoisScenario = num(i.dureeMois, 48)

  // En scénario prudent, une part de la recharge bascule vers le public (plus cher).
  const glissement = defavorable ? 0.15 : -0.10
  const mix = normaliserParts({
    ...mixBase,
    siteHC: Math.max(0, (mixBase.siteHC || 0) - glissement),
    publicDC: Math.max(0, (mixBase.publicDC || 0) + glissement)
  })

  return {
    ...i,
    prixHTElec: prixElecBase * (1 + 0.10 * k),
    complexiteGenieCivil: defavorable ? 'complexe' : 'simple',
    mixRecharge: mix as TcoInput['mixRecharge'],
    prixSiteHC: num(i.prixSiteHC, TCO_CONFIG.energie.siteHC) * (1 + 0.20 * k),
    prixSiteHP: num(i.prixSiteHP, TCO_CONFIG.energie.siteHP) * (1 + 0.20 * k),
    // La valeur de revente est le paramètre le plus sensible du modèle : la
    // laisser fixe viderait les scénarios d'une bonne part de leur sens.
    // ∓8 points sur l'électrique, l'incertitude portant surtout sur lui.
    vrElec: clamp(tauxVR('electrique', dureeMoisScenario, i) - 0.08 * k, 0, 0.95),
    vrTherm: clamp(tauxVR('diesel', dureeMoisScenario, i) - 0.04 * k, 0, 0.95)
  }
}

/* ── Résumé texte (email de lead) ────────────────────────────────────────── */

export function resumeTco(r: TcoResult): string {
  const f = (n: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(n))
  const l: string[] = []
  l.push(`Simulateur de TCO flotte électrique — ${r.input.nbVehicules} véhicule(s) ${LABELS_CATEGORIE[r.input.categorie]}`)
  l.push(`${f(r.input.kmAn)} km/an · ${r.dureeMois} mois · ${LABELS_FINANCEMENT[r.input.financement || 'lld']}`)
  l.push(`Recharge : ${LABELS_PROFIL[r.input.profilRecharge || 'depot-nuit']}`)
  l.push('')
  l.push(`TCO électrique  : ${f(r.elec.tcoOperationnel)} €`)
  l.push(`TCO thermique   : ${f(r.therm.tcoOperationnel)} €`)
  l.push(`Écart           : ${f(r.ecart)} € (${Math.round(r.ecartPct * 100)} %)`)
  l.push(`Investissement infrastructure à décaisser : ${f(r.investInfraTotal)} €`)
  l.push(`Points de charge estimés : ${r.nbPoints}`)
  l.push(`Coût au km : ${r.prkElec.toFixed(3)} € (élec) / ${r.prkTherm.toFixed(3)} € (therm)`)
  const bt = (b: { valeur: number | null; atteinte: boolean }) =>
    !b.atteinte || b.valeur === null ? 'non atteinte'
      : b.valeur === 0 ? 'dès le 1er mois' : `${b.valeur} mois`
  l.push(`Bascule économique : ${bt(r.basculeEco)}`)
  l.push(`Bascule trésorerie : ${bt(r.basculeTreso)}`)
  l.push(`CO₂ évité : ${r.co2EviteTonnes.toFixed(1)} t`)
  l.push('')
  l.push(`Barèmes ${r.anneeDebut}–${r.anneeFin}${r.millesimesProvisoires.length ? ' (millésimes provisoires : ' + r.millesimesProvisoires.join(', ') + ')' : ''}`)
  l.push('Estimation indicative et non contractuelle.')
  return l.join('\n')
}
