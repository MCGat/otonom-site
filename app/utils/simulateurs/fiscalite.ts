/**
 * OTONOM — Fiscalité française des véhicules d'entreprise, PAR MILLÉSIME.
 *
 * Bien réutilisable par tous les simulateurs : c'est ici, et nulle part ailleurs,
 * que vivent les barèmes. Un changement de loi de finances = ce seul fichier.
 *
 * ⚠️ Les barèmes changent EN COURS DE CONTRAT (la taxe incitative passe de 4 000 €
 * en 2026 à 5 000 € en 2027, son quota de 18 % à 25 %…). Une simulation sur 48 mois
 * traverse donc plusieurs régimes : on n'appelle jamais ces fonctions sans année.
 *
 * Étiquettes : [BARÈME] officiel · [MARCHÉ] ordre de grandeur · [HYPOTHÈSE] ratio
 * Statut : `provisoire: true` = barème non encore publié/vérifié, reconduit depuis
 * l'année précédente. L'interface DOIT le signaler à l'utilisateur.
 * Le drapeau est posé à l'année entière, mais il ne vise en pratique que les
 * barèmes **CO₂ et polluants** : les quotas et tarifs de la taxe incitative
 * 2027-2030 sont inscrits en dur dans la loi (CIBS art. L. 421-132-3 et -4,
 * vérifiés le 05/08/2026). Le message affiché doit rester précis là-dessus,
 * sous peine de faire douter d'un chiffre qui, lui, est certain.
 *
 * Sources et points restant à confirmer : voir SPEC-SIMULATEUR-TCO.md §15.
 */

/* ── Qualification des véhicules ─────────────────────────────────────────── */

/**
 * Catégorie FISCALE, distincte de la catégorie commerciale (citadine, SUV…).
 * Les taxes annuelles ne visent que les véhicules de tourisme taxables : un
 * utilitaire ne doit pas recevoir mécaniquement les taxes d'un VP.
 */
export type CategorieFiscale = 'tourisme' | 'utilitaire'

/** Motorisation — pilote taxes, malus, plafonds et TVA. */
export type Motorisation = 'electrique' | 'essence' | 'diesel' | 'hybride-essence' | 'hybride-diesel'

export const EST_ELECTRIQUE = (m: Motorisation): boolean => m === 'electrique'

/** Le carburant réellement consommé (un hybride reste taxé sur son thermique). */
export const carburantDe = (m: Motorisation): 'electricite' | 'essence' | 'gazole' =>
  m === 'electrique' ? 'electricite'
    : (m === 'diesel' || m === 'hybride-diesel') ? 'gazole' : 'essence'

/* ── Barème par tranches marginales ──────────────────────────────────────── */

/** Une tranche : jusqu'à `max` g/km inclus, chaque gramme coûte `parGramme`. */
export interface Tranche { max: number; parGramme: number }


/** Applique un barème marginal (chaque tranche ne taxe que sa propre fraction). */
export function baremeMarginal(valeur: number, tranches: Tranche[]): number {
  let total = 0
  let precedent = 0
  for (const t of tranches) {
    if (valeur <= precedent) break
    const hauteur = Math.min(valeur, t.max) - precedent
    if (hauteur > 0) total += hauteur * t.parGramme
    precedent = t.max
    if (valeur <= t.max) break
  }
  return Math.round(total)
}

/* ── Configuration fiscale par année ─────────────────────────────────────── */

export interface AnneeFiscale {
  provisoire: boolean
  /** Taxe annuelle sur les émissions de CO₂ — barème marginal WLTP. [BARÈME] */
  taxeCO2: Tranche[]
  /** Taxe annuelle sur les polluants atmosphériques, par catégorie. [BARÈME] */
  taxePolluants: { electrique: number; categorie1: number; autres: number }
  /**
   * Malus CO₂ à l'immatriculation — barème officiel gramme par gramme.
   * `table[g]` donne le montant exact ; hors table : 0 sous le seuil, plafond au-delà.
   */
  malusCO2: { seuil: number; plafond: number; table: Record<number, number> }
  /** Malus au poids. Les 100 % électriques en sont exonérés (LF 2026). [BARÈME] */
  malusPoids: { seuil: number; tranches: Tranche[] }
  /** Taxe annuelle incitative (flottes ≥ 100 véhicules). [BARÈME] */
  taxeIncitative: { seuilFlotte: number; quota: number; tarifUnitaire: number }
  /** Avantage en nature — abattement électrique. [BARÈME] */
  aen: { abattementForfait: number; plafondForfait: number; finFenetre: string }
}

/**
 * Plafonds d'amortissement déductible — régime WLTP (véhicules neufs depuis
 * mars 2020). Le régime NEDC, pour les véhicules antérieurs, utilise d'autres
 * seuils (20/60/155 g) : hors périmètre V1, cf. §15.1. [BARÈME]
 */
export const PLAFONDS_AMORTISSEMENT: { maxCO2: number; plafond: number }[] = [
  { maxCO2: 19, plafond: 30000 },
  { maxCO2: 49, plafond: 20300 },
  { maxCO2: 160, plafond: 18300 },
  { maxCO2: Infinity, plafond: 9900 }
]

/** TVA — taux de récupération. [BARÈME] */
export const TVA = {
  taux: 0.20,
  /** Achat ET location d'un véhicule de tourisme : non récupérable. */
  vehicule: { tourisme: 0, utilitaire: 1 },
  carburant: {
    // VP exclu du droit à déduction : 80 % sur essence et gazole.
    tourisme: { essence: 0.80, gazole: 0.80, electricite: 1 },
    utilitaire: { essence: 1, gazole: 1, electricite: 1 }
  }
}

const BAREME_CO2_2026: Tranche[] = [
  { max: 4, parGramme: 0 },
  { max: 45, parGramme: 1 },
  { max: 53, parGramme: 2 },
  { max: 85, parGramme: 3 },
  { max: 105, parGramme: 4 },
  { max: 125, parGramme: 10 },
  { max: 145, parGramme: 50 },
  { max: 165, parGramme: 60 },
  { max: Infinity, parGramme: 65 }
]

/**
 * Barème OFFICIEL du malus CO₂ 2026 (véhicules réceptionnés UE, WLTP).
 * Les 84 valeurs publiées, gramme par gramme — AUCUNE interpolation : c'est un
 * barème discret, un montant fiscal officiel ne se devine pas à quelques euros près.
 * Source : service-public.gouv.fr. Sous 108 g/km : 0 €. Au-delà de 191 g/km : 80 000 €.
 */
const MALUS_CO2_2026: Record<number, number> = {
  108: 50, 109: 75, 110: 100, 111: 125, 112: 150, 113: 170, 114: 190,
  115: 210, 116: 230, 117: 240, 118: 260, 119: 280, 120: 310, 121: 330,
  122: 360, 123: 400, 124: 450, 125: 540, 126: 650, 127: 740, 128: 818,
  129: 898, 130: 983, 131: 1074, 132: 1172, 133: 1276, 134: 1386, 135: 1504,
  136: 1629, 137: 1761, 138: 1901, 139: 2049, 140: 2205, 141: 2370, 142: 2544,
  143: 2726, 144: 2918, 145: 3119, 146: 3331, 147: 3552, 148: 3784, 149: 4026,
  150: 4279, 151: 4543, 152: 4818, 153: 5105, 154: 5404, 155: 5715, 156: 6126,
  157: 6637, 158: 7248, 159: 7959, 160: 8770, 161: 9681, 162: 10692, 163: 11803,
  164: 13014, 165: 14325, 166: 15736, 167: 17247, 168: 18858, 169: 20569, 170: 22380,
  171: 24291, 172: 26302, 173: 28413, 174: 30624, 175: 32935, 176: 35346, 177: 37857,
  178: 40468, 179: 43179, 180: 45990, 181: 48901, 182: 51912, 183: 55023, 184: 58134,
  185: 61245, 186: 64356, 187: 67467, 188: 70578, 189: 73689, 190: 76800, 191: 79911,
}

const MALUS_POIDS_TRANCHES: Tranche[] = [
  { max: 1699, parGramme: 10 },
  { max: 1799, parGramme: 15 },
  { max: 1899, parGramme: 20 },
  { max: 1999, parGramme: 25 },
  { max: Infinity, parGramme: 30 }
]

/**
 * Barème OFFICIEL de la taxe annuelle CO₂ à compter du 01/01/2027.
 * Source : art. L. 421-120 du CIBS, version en vigueur au 01/01/2027 (Légifrance).
 * Vérifié le 11/08/2026. Contrôle : 128 g/km → 832 € (contre 583 € au barème 2026).
 */
const BAREME_CO2_2027: Tranche[] = [
  { max: 40, parGramme: 1 },
  { max: 48, parGramme: 2 },
  { max: 80, parGramme: 3 },
  { max: 100, parGramme: 4 },
  { max: 120, parGramme: 10 },
  { max: 140, parGramme: 50 },
  { max: 160, parGramme: 60 },
  { max: Infinity, parGramme: 65 }
]

/**
 * Barème OFFICIEL du malus CO₂ à compter du 01/01/2027 (WLTP, réception UE).
 * Source : art. L. 421-62 du CIBS (Légifrance), vérifié le 11/08/2026.
 * Les 87 valeurs, gramme par gramme. Sous 103 g/km : 0 €. Au-delà de 189 : 90 000 €.
 *
 * Ce n'est PAS le barème 2026 décalé de cinq grammes, même si les deux coïncident
 * jusqu'à 151 g/km : le plafond ne recule que de deux grammes (191 → 189), donc le
 * haut du barème diverge. Reconduire 2026 en abaissant le seuil, comme on le
 * faisait, produisait 90 000 € de malus sur un véhicule à 103 g/km.
 */
const MALUS_CO2_2027: Record<number, number> = {
  103: 50, 104: 75, 105: 100, 106: 125, 107: 150, 108: 170, 109: 190,
  110: 210, 111: 230, 112: 240, 113: 260, 114: 280, 115: 310, 116: 330,
  117: 360, 118: 400, 119: 450, 120: 540, 121: 650, 122: 740, 123: 818,
  124: 898, 125: 983, 126: 1074, 127: 1172, 128: 1276, 129: 1386, 130: 1504,
  131: 1629, 132: 1761, 133: 1901, 134: 2049, 135: 2205, 136: 2370, 137: 2544,
  138: 2726, 139: 2918, 140: 3119, 141: 3331, 142: 3552, 143: 3784, 144: 4026,
  145: 4279, 146: 4543, 147: 4818, 148: 5105, 149: 5404, 150: 5715, 151: 6126,
  152: 6637, 153: 7248, 154: 7959, 155: 8770, 156: 9681, 157: 10692, 158: 11803,
  159: 13014, 160: 14325, 161: 15736, 162: 17247, 163: 18858, 164: 20569, 165: 22380,
  166: 24291, 167: 26302, 168: 28413, 169: 30624, 170: 32935, 171: 35346, 172: 37857,
  173: 40468, 174: 43179, 175: 45990, 176: 48901, 177: 51912, 178: 55023, 179: 58134,
  180: 61245, 181: 64356, 182: 67467, 183: 70578, 184: 73689, 185: 76800, 186: 79911,
  187: 83022, 188: 86133, 189: 89244
}

/**
 * Millésimes connus. Les années absentes reconduisent le dernier millésime
 * connu avec `provisoire: true` — jamais en silence : l'interface l'affiche.
 */
export const MILLESIMES: Record<number, AnneeFiscale> = {
  2026: {
    provisoire: false,
    taxeCO2: BAREME_CO2_2026,
    taxePolluants: { electrique: 0, categorie1: 130, autres: 650 },
    malusCO2: { seuil: 108, plafond: 80000, table: MALUS_CO2_2026 },
    malusPoids: { seuil: 1500, tranches: MALUS_POIDS_TRANCHES },
    taxeIncitative: { seuilFlotte: 100, quota: 0.18, tarifUnitaire: 4000 },
    aen: { abattementForfait: 0.70, plafondForfait: 4641.60, finFenetre: '2027-12-31' }
  },
  2027: {
    /* Barèmes CO₂ et malus 2027 saisis depuis Légifrance le 11/08/2026 : ceux-là
       ne sont plus reconduits. Le drapeau reste posé pour la taxe sur les
       polluants (160 € / 800 €), non revérifiée à cette date. */
    provisoire: true,
    taxeCO2: BAREME_CO2_2027,
    taxePolluants: { electrique: 0, categorie1: 160, autres: 800 },
    malusCO2: { seuil: 103, plafond: 90000, table: MALUS_CO2_2027 },
    malusPoids: { seuil: 1500, tranches: MALUS_POIDS_TRANCHES },
    taxeIncitative: { seuilFlotte: 100, quota: 0.25, tarifUnitaire: 5000 },
    aen: { abattementForfait: 0.70, plafondForfait: 4641.60, finFenetre: '2027-12-31' }
  },
  2028: {
    provisoire: true,
    taxeCO2: BAREME_CO2_2027,
    taxePolluants: { electrique: 0, categorie1: 160, autres: 800 },
    malusCO2: { seuil: 103, plafond: 90000, table: MALUS_CO2_2027 },
    malusPoids: { seuil: 1500, tranches: MALUS_POIDS_TRANCHES },
    taxeIncitative: { seuilFlotte: 100, quota: 0.30, tarifUnitaire: 5000 },
    // Hors fenêtre de l'abattement électrique (close au 31/12/2027).
    aen: { abattementForfait: 0, plafondForfait: 0, finFenetre: '2027-12-31' }
  },
  2029: {
    provisoire: true,
    taxeCO2: BAREME_CO2_2027,
    taxePolluants: { electrique: 0, categorie1: 160, autres: 800 },
    malusCO2: { seuil: 103, plafond: 90000, table: MALUS_CO2_2027 },
    malusPoids: { seuil: 1500, tranches: MALUS_POIDS_TRANCHES },
    taxeIncitative: { seuilFlotte: 100, quota: 0.35, tarifUnitaire: 5000 },
    aen: { abattementForfait: 0, plafondForfait: 0, finFenetre: '2027-12-31' }
  },
  2030: {
    provisoire: true,
    taxeCO2: BAREME_CO2_2027,
    taxePolluants: { electrique: 0, categorie1: 160, autres: 800 },
    malusCO2: { seuil: 103, plafond: 90000, table: MALUS_CO2_2027 },
    malusPoids: { seuil: 1500, tranches: MALUS_POIDS_TRANCHES },
    taxeIncitative: { seuilFlotte: 100, quota: 0.48, tarifUnitaire: 5000 },
    aen: { abattementForfait: 0, plafondForfait: 0, finFenetre: '2027-12-31' }
  }
}

const ANNEES_CONNUES = Object.keys(MILLESIMES).map(Number).sort((a, b) => a - b)

/** Millésime d'une année, avec reconduction explicite si non publié. */
export function millesime(annee: number): AnneeFiscale {
  const exact = MILLESIMES[annee]
  if (exact) return exact
  const borne = annee < ANNEES_CONNUES[0]! ? ANNEES_CONNUES[0]! : ANNEES_CONNUES[ANNEES_CONNUES.length - 1]!
  return { ...MILLESIMES[borne]!, provisoire: true }
}

/* ── Fonctions fiscales ──────────────────────────────────────────────────── */

/**
 * Taxe annuelle CO₂. Un véhicule 100 % électrique en est exonéré, ainsi que
 * tout véhicule qui n'est pas de tourisme au sens fiscal.
 */
export function taxeCO2(co2: number, m: Motorisation, cat: CategorieFiscale, annee: number): number {
  if (cat !== 'tourisme' || EST_ELECTRIQUE(m)) return 0
  return baremeMarginal(Math.max(0, co2), millesime(annee).taxeCO2)
}

/**
 * Taxe annuelle sur les polluants atmosphériques.
 * La catégorie dépend du MOTEUR THERMIQUE, pas de l'hybridation : un hybride
 * essence Euro 5/6 relève de la catégorie 1, un hybride diesel non (§15.7).
 */
export function taxePolluants(m: Motorisation, cat: CategorieFiscale, annee: number): number {
  if (cat !== 'tourisme') return 0
  const t = millesime(annee).taxePolluants
  if (EST_ELECTRIQUE(m)) return t.electrique
  if (m === 'essence' || m === 'hybride-essence') return t.categorie1
  return t.autres
}

/** Malus CO₂ à l'immatriculation (une seule fois). */
export function malusCO2(co2: number, m: Motorisation, cat: CategorieFiscale, annee: number): number {
  if (cat !== 'tourisme' || EST_ELECTRIQUE(m)) return 0
  const b = millesime(annee).malusCO2
  const g = Math.round(co2)
  if (g < b.seuil) return 0
  // Lecture directe du barème : aucune interpolation.
  const exact = b.table[g]
  if (exact !== undefined) return exact
  /* Le plafond ne vaut QUE par le haut. Écrit « absent de la table → plafond »,
     ce repli renvoyait 90 000 € pour un véhicule à 103 g/km en 2027 : le seuil
     avait été abaissé à 103 sans que la table suive, et les grammes 103 à 107
     sortaient de la table par le BAS. Un montant fiscal aberrant vaut mieux
     découvert ici qu'affiché à un client. */
  const grammes = Object.keys(b.table).map(Number)
  const haut = Math.max(...grammes)
  if (g > haut) return b.plafond
  const bas = Math.min(...grammes)
  if (g < bas) return b.table[bas]!
  /* Trou au milieu d'un barème : impossible sur une table complète. On rend la
     valeur tabulée immédiatement inférieure plutôt que le plafond. */
  return b.table[Math.max(...grammes.filter((x) => x <= g))]!
}

/**
 * Malus au poids. Les véhicules 100 % électriques en sont TOTALEMENT exonérés :
 * la disposition qui devait leur retirer cette exonération au 01/07/2026 a été
 * abrogée avant d'entrer en vigueur par la loi de finances pour 2026 (§15.2).
 */
export function malusPoids(kg: number, m: Motorisation, cat: CategorieFiscale, annee: number): number {
  if (cat !== 'tourisme' || EST_ELECTRIQUE(m)) return 0
  const b = millesime(annee).malusPoids
  if (kg < b.seuil) return 0
  return baremeMarginal(kg, [{ max: b.seuil - 1, parGramme: 0 }, ...b.tranches])
}

/** Plafond d'amortissement déductible selon les émissions (régime WLTP). */
export function plafondAmortissement(co2: number, cat: CategorieFiscale): number {
  // Le plafond ne vise que les véhicules de tourisme.
  if (cat !== 'tourisme') return Infinity
  return PLAFONDS_AMORTISSEMENT.find(p => co2 <= p.maxCO2)!.plafond
}

/**
 * Part NON déductible d'un amortissement (ou d'un loyer) au regard du plafond.
 * S'applique aussi bien à l'achat qu'à la location : pour une voiture
 * particulière louée, la fraction du loyer correspondant à la part du prix
 * dépassant le plafond n'est pas déductible non plus.
 */
export function partNonDeductible(prixTTC: number, co2: number, cat: CategorieFiscale): number {
  const plafond = plafondAmortissement(co2, cat)
  if (!isFinite(plafond) || prixTTC <= 0) return 0
  return Math.max(0, (prixTTC - plafond) / prixTTC)
}

/** Taux de récupération de TVA sur le carburant, selon la catégorie fiscale. */
export function tvaCarburant(m: Motorisation, cat: CategorieFiscale): number {
  return TVA.carburant[cat][carburantDe(m)]
}

/** La TVA sur le véhicule (achat OU location) est-elle récupérable ? */
export const tvaVehiculeRecuperable = (cat: CategorieFiscale): boolean =>
  TVA.vehicule[cat] === 1

/**
 * Prix à porter dans le TCO : TTC pour un véhicule de tourisme (TVA non
 * récupérable, ~20 % du prix — le plus gros poste fiscal du modèle), HT sinon.
 */
export function prixPorte(prixHT: number, cat: CategorieFiscale): number {
  return tvaVehiculeRecuperable(cat) ? prixHT : prixHT * (1 + TVA.taux)
}

/**
 * Avantage en nature annuel, après abattement électrique.
 * L'abattement est réservé aux 100 % électriques éligibles à l'éco-score, dans
 * une fenêtre qui se ferme au 31/12/2027 : au-delà, le droit commun s'applique.
 * L'électricité payée par l'employeur n'entre pas dans le calcul.
 */
export function avantageEnNature(
  prixTTC: number,
  m: Motorisation,
  annee: number,
  opts: { loue?: boolean; ecoScore?: boolean; coutGlobalAnnuel?: number } = {}
): number {
  /* Bases forfaitaires de l'arrêté du 25/02/2025, sans carburant pris en charge.
     ACHAT : 15 % du coût d'acquisition TTC.
     LOCATION : 50 % du COÛT GLOBAL ANNUEL — loyer, entretien, assurance — et non
     du prix du véhicule, que le locataire ne paie jamais. L'évaluation est
     plafonnée à celle qu'aurait donnée l'achat.
     Sans coût global fourni, on retombe sur l'ancien calcul plutôt que de rendre
     zéro : un appelant qui n'a pas encore été mis à jour doit voir un ordre de
     grandeur, pas une exonération imaginaire. */
  const base = opts.loue
    ? (opts.coutGlobalAnnuel !== undefined
        ? Math.min(opts.coutGlobalAnnuel * 0.50, prixTTC * 0.15)
        : prixTTC * 0.50)
    : prixTTC * 0.15
  if (!EST_ELECTRIQUE(m)) return base
  const a = millesime(annee).aen
  if (!a.abattementForfait || opts.ecoScore === false) return base
  const abattement = Math.min(base * a.abattementForfait, a.plafondForfait)
  return Math.max(0, base - abattement)
}

/**
 * Taxe annuelle incitative. Renvoie `null` — et surtout PAS 0 — quand on ne
 * dispose pas des données de renouvellement de flotte : mieux vaut ne rien
 * chiffrer qu'annoncer un montant faux à un directeur financier (§7.6).
 */
export function taxeIncitative(
  annee: number,
  donnees?: { flotteTaxable: number; vfeActuels: number; tauxRenouvellement: number }
): number | null {
  const t = millesime(annee).taxeIncitative
  if (!donnees) return null
  if (donnees.flotteTaxable < t.seuilFlotte) return 0
  const cible = t.quota * donnees.flotteTaxable
  const ecart = Math.max(0, cible - donnees.vfeActuels)
  return Math.round(ecart * t.tarifUnitaire * Math.max(0, Math.min(1, donnees.tauxRenouvellement)))
}

/** Les millésimes traversés sont-ils tous publiés ? Sinon l'écran le signale. */
export function millesimesProvisoires(anneeDebut: number, anneeFin: number): number[] {
  const out: number[] = []
  for (let a = anneeDebut; a <= anneeFin; a++) if (millesime(a).provisoire) out.push(a)
  return out
}

/* ── Suramortissement des véhicules zéro émission (art. 39 decies A) ──────── */

/**
 * Déduction exceptionnelle pour les véhicules NEUFS exclusivement électriques ou
 * hydrogène acquis entre le 01/01/2025 et le 31/12/2030. Depuis 2025 elle porte
 * sur le SURCOÛT par rapport à un thermique comparable, hors frais financiers.
 *
 * Le taux dépend du PTAC (rubrique F.2 de la carte grise), PAS de la masse à vide :
 * un utilitaire à 3,50 t exactement relève de 115 %, un 3,49 t de 40 %.
 *
 * [À CONFIRMER] Taux issus d'une relecture croisée, à valider sur le texte.
 */
export const SURAMORTISSEMENT_TAUX: { ptacMax: number; taux: number }[] = [
  { ptacMax: 2599, taux: 0 },       // moins de 2,6 t : non éligible
  { ptacMax: 3499, taux: 0.40 },    // 2,6 t à moins de 3,5 t
  { ptacMax: 16000, taux: 1.15 },   // 3,5 t à 16 t inclus
  { ptacMax: Infinity, taux: 0.75 } // au-delà de 16 t
]

/**
 * Économie d'impôt liée au suramortissement.
 *
 * ⚠️ Réservée à l'entreprise qui PORTE le bien : achat, crédit-bail ou LOA.
 * En location longue durée classique, la déduction revient au propriétaire
 * juridique et rien ne garantit qu'elle soit répercutée dans le loyer — la
 * compter côté client reviendrait à lui attribuer un avantage qu'il ne perçoit
 * pas. Son effet éventuel est déjà, indirectement, dans le loyer proposé.
 */
export function suramortissement(
  motorisation: Motorisation,
  ptacKg: number,
  surcoutHT: number,
  financement: 'achat' | 'credit' | 'lld' | 'loa',
  tauxIS: number,
  partPeriode = 1
): number {
  if (!EST_ELECTRIQUE(motorisation)) return 0
  if (financement === 'lld') return 0
  if (surcoutHT <= 0) return 0
  const taux = SURAMORTISSEMENT_TAUX.find(t => ptacKg <= t.ptacMax)!.taux
  if (!taux) return 0
  // La déduction est étalée sur la durée normale d'utilisation : sur une
  // analyse plus courte, seule la fraction correspondante est acquise.
  return surcoutHT * taux * tauxIS * Math.max(0, Math.min(1, partPeriode))
}
