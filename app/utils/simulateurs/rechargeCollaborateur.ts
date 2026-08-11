/**
 * OTONOM — Remboursement de la recharge à domicile d'un salarié.
 *
 * Répond à : « un salarié recharge chez lui, combien ça lui coûte, combien lui
 * rembourser, et comment ce remboursement est-il traité socialement ? »
 *
 * Spécification : SPEC-SIMULATEUR-RECHARGE-COLLABORATEUR.md (v2.1, 11/08/2026).
 *
 * Ce moteur ne calcule PAS l'avantage en nature du véhicule : c'est le rôle du
 * simulateur de TCO. Il se borne à dire que l'électricité en est exclue, et à
 * quelles conditions.
 */

/* ══════════════════════════════════════════════════════════════════════════
   PARAMÈTRES RÉGLEMENTAIRES — datés, jamais en dur dans les calculs.
   Le régime des bornes expire le 31/12/2027 et les plafonds sont revalorisés
   chaque 1er janvier (art. 8 de l'arrêté du 25 février 2025). Une table par
   millésime évite qu'un simulateur devienne faux sans que personne ne s'en
   aperçoive.
   ══════════════════════════════════════════════════════════════════════════ */

export interface ParametresAnnee {
  /** Millésime d'application. */
  annee: number
  /** Fin du régime dérogatoire bornes et véhicule électrique. */
  finRegime: string
  borne: {
    /** Borne conservée par le salarié, ancienneté ≤ 5 ans. */
    jeune: { taux: number; plafond: number }
    /** Borne conservée, ancienneté > 5 ans — comparaison STRICTE. */
    ancienne: { taux: number; plafond: number }
    /** Autres frais d'utilisation ou location, HORS électricité. */
    fraisUtilisation: { taux: number }
  }
  primeTransport: {
    /** Frais d'alimentation VE / hybride rechargeable / hydrogène. */
    plafondAlimentation: number
    /** Sous-plafond propre au carburant thermique. */
    plafondCarburant: number
    /** Plafond global en cumul avec le forfait mobilités durables. */
    plafondAvecFmd: number
  }
  /** Barème kilométrique automobile, par puissance fiscale. */
  bareme: BaremeLigne[]
  /** Majoration applicable aux véhicules 100 % électriques. */
  majorationElectrique: number
}

interface BaremeLigne {
  cv: number            // borne haute de la tranche de puissance (7 = « 7 et plus »)
  petit: number         // ≤ 5 000 km : d × petit
  moyen: [number, number] // 5 001–20 000 : (d × a) + b
  grand: number         // > 20 000 km : d × grand
}

export const PARAMETRES: Record<number, ParametresAnnee> = {
  2026: {
    annee: 2026,
    finRegime: '31/12/2027',
    borne: {
      jeune: { taux: 0.50, plafond: 1057.10 },
      ancienne: { taux: 0.75, plafond: 1585.50 },
      fraisUtilisation: { taux: 0.50 }
    },
    primeTransport: {
      plafondAlimentation: 600,
      plafondCarburant: 300,
      plafondAvecFmd: 600
    },
    bareme: [
      { cv: 3, petit: 0.529, moyen: [0.316, 1065], grand: 0.370 },
      { cv: 4, petit: 0.606, moyen: [0.340, 1330], grand: 0.407 },
      { cv: 5, petit: 0.636, moyen: [0.357, 1395], grand: 0.427 },
      { cv: 6, petit: 0.665, moyen: [0.374, 1457], grand: 0.447 },
      { cv: 7, petit: 0.697, moyen: [0.394, 1515], grand: 0.470 }
    ],
    majorationElectrique: 0.20
  }
}

/** Millésime retenu à défaut. À faire évoluer chaque 1er janvier. */
export const ANNEE_COURANTE = 2026

/* ══════════════════════════════════════════════════════════════════════════
   HYPOTHÈSES OTONOM — modifiables par l'utilisateur, affichées comme telles.
   Ce ne sont PAS des valeurs réglementaires.
   ══════════════════════════════════════════════════════════════════════════ */

export const CONFIG = {
  /** Tarif réglementé de vente, grille du 01/08/2026, 6 kVA, en € TTC. */
  tarifs: {
    base: 0.2001,
    heuresPleines: 0.2142,
    heuresCreuses: 0.1589,
    abonnementAn: 190.32
  },

  /**
   * Consommations de référence, en kWh/100 km AU RÉSEAU.
   *
   * La consommation homologuée WLTP est mesurée entre le réseau et le véhicule :
   * elle INCLUT déjà les pertes de recharge. On ne leur applique donc aucun
   * coefficient supplémentaire — ce serait compter les pertes deux fois.
   * Le coefficient n'intervient que si l'utilisateur saisit une consommation
   * lue au tableau de bord, qui elle est mesurée côté batterie.
   */
  conso: { citadine: 15, compacte: 17, berline: 20, vul: 22 },

  /** Rendement de charge, appliqué UNIQUEMENT à une conso « tableau de bord ». */
  rendementCharge: 0.88,

  /**
   * Abonnement de supervision, par point de charge et par mois. [HYPOTHÈSE]
   * Facturé par borne, donc de fait par collaborateur équipé : ce n'est pas un
   * forfait entreprise. Valeur de marché à caler sur vos devis réels.
   */
  supervisionMois: 8,

  /**
   * Charges patronales appliquées à la fraction réintégrée. [HYPOTHÈSE]
   *
   * Le taux réel dépend du niveau de rémunération, des allègements applicables
   * et de la situation de l'employeur. On n'avance plus de seuil : la réduction
   * générale dégressive a été refondue et l'ancien repère de 1,6 SMIC ne décrit
   * plus le dispositif. 42 % est un ordre de grandeur modifiable, pas un calcul
   * de paie.
   */
  tauxChargesPatronales: 0.42,

  /** Durée sur laquelle on étale le coût d'une borne. [HYPOTHÈSE] */
  dureeAmortissementBorneAns: 8,

  /** Points de comparaison — hypothèses de marché, pas des tarifs nationaux. */
  comparaison: {
    siteHC: 0.158,      // € HT/kWh
    siteHP: 0.207,      // € HT/kWh
    publicAC: 0.40,     // € TTC/kWh
    publicDC: 0.58      // € TTC/kWh
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   ENTRÉES
   ══════════════════════════════════════════════════════════════════════════ */

export type Proprietaire = 'entreprise' | 'salarie'
export type Motorisation = 'electrique' | 'hybride-rechargeable' | 'autre'
export type UsageSalarie = 'professionnel' | 'domicile-travail' | 'les-deux'
export type ModeRemboursement = 'kilometrique' | 'frais-reels'
export type OptionTarif = 'base' | 'hp-hc' | 'saisi'
export type OrigineConso = 'releve' | 'wltp' | 'tableau-de-bord'

/**
 * Comment les kilowattheures du domicile sont-ils constatés ?
 *
 * Distinct de `origineConso`, qui dit d'où vient la VALEUR de consommation.
 * Celui-ci dit comment on constate ce qui a réellement été consommé chez le
 * salarié — donc ce qu'on pourra opposer en cas de contrôle.
 */
export type MesureDomicile = 'supervision' | 'sous-compteur' | 'estimation' | 'aucune'

/** Qui souscrit la supervision, et pour quoi. Le régime n'est pas le même. */
export type TypeSupervision = 'abonnement-salarie' | 'plateforme-employeur'

/**
 * Pourquoi le véhicule personnel est nécessaire, au sens de L. 3261-3.
 *
 * Demander « êtes-vous contraint ? » laissait l'utilisateur juger lui-même :
 * beaucoup répondaient oui parce que la voiture est plus pratique, ce qui n'est
 * pas un critère légal. On demande donc la RAISON, pas l'appréciation.
 *
 * Et on colle au texte : « transport inadapté » n'est pas un critère. L'article
 * vise trois situations précises — non-desserte, hors périmètre d'un plan de
 * mobilité obligatoire, horaires particuliers. Un salarié qui dispose d'un bus
 * qu'il juge peu pratique n'entre dans aucune des trois.
 */
export type RaisonVehiculePersonnel =
  | 'non-desservi'        // commune non desservie par un transport collectif régulier
                          // ou par un transport organisé par l'employeur
  | 'hors-plan-mobilite'  // hors du périmètre d'un plan de mobilité obligatoire
  | 'horaires'            // horaires particuliers interdisant le transport collectif
  | 'aucune'
  | 'inconnu'
export type Triple = 'oui' | 'non' | 'inconnu'
export type Categorie = keyof typeof CONFIG.conso

export interface EntreeRecharge {
  proprietaire: Proprietaire

  // ── Véhicule
  categorie?: Categorie
  /** Consommation saisie, sinon valeur par catégorie. */
  consoSaisie?: number
  origineConso?: OrigineConso
  kmAnnuels: number

  // ── Véhicule de l'entreprise
  motorisation?: Motorisation
  /** Mise à disposition à partir du 01/02/2025 ? conditionne l'éco-score. */
  miseADispoApres2025?: Triple
  ecoScore?: Triple
  /** Usage privé autorisé : véhicule de fonction, sinon véhicule de service. */
  usagePrive?: Triple

  // ── Véhicule personnel
  usageSalarie?: UsageSalarie
  modeRemboursement?: ModeRemboursement
  puissanceFiscale?: number
  /** Bénéficie déjà d'une prise en charge d'abonnement de transports publics. */
  abonnementTransportPublic?: Triple
  /** Raison légale rendant le véhicule personnel nécessaire (L. 3261-3). */
  raisonVehiculePersonnel?: RaisonVehiculePersonnel

  // ── Recharge
  partDomicile: number          // 0–1
  optionTarif: OptionTarif
  /** Part de l'énergie domicile réellement rechargée en heures creuses (0–1). */
  partHeuresCreuses?: number
  /** Prix saisi si optionTarif = 'saisi'. */
  prixKwhSaisi?: number

  // ── Mesure et supervision
  /** Comment les kWh du domicile sont constatés. Défaut : estimation. */
  mesureDomicile?: MesureDomicile
  /** L'employeur prend-il en charge l'abonnement de supervision ? */
  supervisionPayeeParEmployeur?: Triple
  /** Abonnement rattaché à la borne du salarié, ou plateforme de flotte ? */
  typeSupervision?: TypeSupervision
  /** kWh RÉELLEMENT relevés sur l'année, si la mesure existe. */
  kWhMesuresAn?: number
  /** Coût mensuel de la supervision, par point de charge. */
  coutSupervisionMois?: number
  /** Taux de charges patronales, si connu. Sinon hypothèse OTONOM. */
  tauxChargesPatronales?: number

  // ── Borne au domicile
  borneFinanceeParEmployeur?: Triple
  coutBorne?: number
  borneRetireeEnFinDeContrat?: Triple
  /** Ancienneté en années à la fin du contrat. */
  ancienneteBorneAns?: number

  annee?: number
}

/* ══════════════════════════════════════════════════════════════════════════
   SORTIES
   ══════════════════════════════════════════════════════════════════════════ */

export type Branche =
  | 'entreprise-ve-eligible'
  | 'entreprise-hors-regime'
  | 'entreprise-service'
  | 'perso-professionnel-ik'
  | 'perso-professionnel-reels'
  | 'perso-domicile-travail'
  | 'perso-mixte'

export type Verdict = 'favorable' | 'encadre' | 'prudence' | 'exclu'

export interface ResultatRecharge {
  branche: Branche
  libelleBranche: string
  verdict: Verdict
  /** Phrase de verdict, affichable telle quelle. */
  texteVerdict: string

  // Énergie et coût
  consoRetenue: number
  consoAuReseau: number
  kWhAn: number
  kWhDomicileAn: number
  prixMoyenKwh: number
  coutDomicileAn: number
  coutDomicileMois: number

  /** Montant remboursable, et ce qui est exonéré. */
  remboursementAn: number
  remboursementExonereAn: number
  remboursementSoumisAn: number
  plafondApplique: number | null

  /**
   * Un montant de remboursement a-t-il un sens dans cette situation ?
   *
   * Faux quand la saisie ne permet pas d'en calculer un défendable — aujourd'hui
   * le seul cas est l'usage mixte, où deux dispositifs distincts s'appliquent à
   * deux séries de kilomètres que le formulaire ne ventile pas. Afficher zéro
   * serait faux, afficher le coût domicile le serait davantage : la page masque
   * le chiffre et dit pourquoi.
   */
  montantChiffrable: boolean

  // Borne
  borne: { priseEnCharge: number; exonere: number; soumis: number; regle: string } | null

  /**
   * Supervision de la recharge à domicile.
   *
   * Contre-intuitif, et c'est tout l'intérêt de l'isoler : l'électricité est
   * exonérée en totalité, la supervision non. L'article 4 range l'abonnement
   * parmi les « autres frais liés à l'utilisation » de la borne et les plafonne
   * à 50 % — la parenthèse « hors frais d'électricité » du même alinéa sépare
   * précisément les deux.
   */
  supervision: { coutAn: number; exonere: number; soumis: number; regle: string } | null

  /** La méthode retenue permet-elle d'attribuer une session à UN véhicule ? */
  attributionSessions: boolean

  /**
   * Ce que le dispositif coûte à l'employeur, tout compris.
   *
   * Les postes vivaient dans trois blocs séparés et personne ne les additionnait.
   * On distingue le RÉCURRENT du PONCTUEL : la borne se paie une fois, et la
   * fraction réintégrée ne génère des charges que l'année où elle est versée.
   */
  coutEmployeur: {
    electriciteAn: number
    supervisionAn: number
    /** Charges patronales sur la fraction réintégrée récurrente. */
    chargesRecurrentesAn: number
    totalRecurrentAn: number
    /** Borne : dépense unique, et ses charges, l'année du versement. */
    borneUnique: number
    chargesBorneUnique: number
    totalPremiereAnnee: number
    /** Quote-part annuelle de la borne, une fois étalée. */
    borneAnnualisee: number
    tauxCharges: number
  }

  // Comparaisons, à périmètre égal (100 % de l'énergie annuelle)
  comparaison: { mode: string; coutAn: number; base: 'TTC' | 'HT' }[]
  /** Économie annuelle d'un basculement complet en heures creuses. */
  gainHeuresCreusesAn: number

  hypotheses: { label: string; valeur: string; source: 'reglementaire' | 'hypothese' }[]
  avertissements: string[]
  /** Qualité de la preuve selon la méthode de mesure déclarée. */
  preuve: { niveau: 'mesure' | 'estimation' | 'simulation'; texte: string }
}

/* ══════════════════════════════════════════════════════════════════════════
   MOTEUR
   ══════════════════════════════════════════════════════════════════════════ */

const num = (v: unknown, d = 0) => (typeof v === 'number' && isFinite(v) ? v : d)
const borne01 = (v: number) => Math.min(1, Math.max(0, v))
const e2 = (v: number) => Math.round(v * 100) / 100

/** Consommation au réseau, en kWh/100 km. */
export function consoAuReseau(i: EntreeRecharge): number {
  const brute = num(i.consoSaisie, 0) || CONFIG.conso[i.categorie || 'compacte']
  /* Un relevé de borne et une valeur WLTP sont déjà « au compteur » : aucun
     coefficient. Seule une consommation lue au tableau de bord est mesurée
     côté batterie et doit être ramenée au réseau. */
  return i.origineConso === 'tableau-de-bord' ? brute / CONFIG.rendementCharge : brute
}

/** Prix moyen du kWh au domicile, selon l'option tarifaire réelle. */
export function prixMoyenKwh(i: EntreeRecharge): number {
  const t = CONFIG.tarifs
  if (i.optionTarif === 'saisi') return num(i.prixKwhSaisi, t.base)
  if (i.optionTarif === 'base') return t.base
  const partHC = borne01(num(i.partHeuresCreuses, 0.8))
  return partHC * t.heuresCreuses + (1 - partHC) * t.heuresPleines
}

/**
 * Détermine la branche. C'est ici que se joue le verdict social : le régime
 * dépend d'ABORD de qui possède le véhicule, ensuite seulement de l'usage.
 */
export function determinerBranche(i: EntreeRecharge): Branche {
  if (i.proprietaire === 'entreprise') {
    /* Un véhicule de service sans usage privé ne relève pas de la logique
       d'avantage en nature de l'article 3, qui vise la mise à disposition
       permanente avec usage privé. */
    if (i.usagePrive === 'non') return 'entreprise-service'
    /* Le régime favorable exige un véhicule fonctionnant EXCLUSIVEMENT à
       l'électricité. Un hybride rechargeable en est exclu, quoi qu'on lise
       ailleurs. */
    if (i.motorisation !== 'electrique') return 'entreprise-hors-regime'
    /* Pour une mise à disposition postérieure au 01/02/2025 s'ajoute la
       condition d'éco-score (c du 6° du I de l'art. D. 251-1 du code de
       l'énergie). Un doute suffit à sortir du verdict favorable. */
    /* La date décide du régime applicable. Une date INCONNUE ne peut donc pas
       retomber dans le cas favorable : on ne sait pas quel régime s'applique.
       C'était un bug — le doute profitait au verdict, contre notre propre règle. */
    if (i.miseADispoApres2025 !== 'non') {
      // À compter du 01/02/2025, ou date inconnue : l'éco-score conditionne tout.
      if (i.ecoScore !== 'oui') return 'entreprise-hors-regime'
      if (i.miseADispoApres2025 === 'inconnu') return 'entreprise-hors-regime'
    }
    return 'entreprise-ve-eligible'
  }
  if (i.usageSalarie === 'les-deux') return 'perso-mixte'
  if (i.usageSalarie === 'domicile-travail') return 'perso-domicile-travail'
  return i.modeRemboursement === 'frais-reels' ? 'perso-professionnel-reels' : 'perso-professionnel-ik'
}

const LIBELLES: Record<Branche, string> = {
  'entreprise-ve-eligible': "Véhicule de l'entreprise, 100 % électrique éligible",
  'entreprise-hors-regime': "Véhicule de l'entreprise, hors régime électrique",
  'entreprise-service': 'Véhicule de service, sans usage privé',
  'perso-professionnel-ik': 'Véhicule personnel, déplacements professionnels au barème',
  'perso-professionnel-reels': 'Véhicule personnel, déplacements professionnels aux frais réels',
  'perso-domicile-travail': 'Véhicule personnel, trajet domicile-travail',
  'perso-mixte': 'Véhicule personnel, usage professionnel et domicile-travail'
}

/** Indemnités kilométriques, majorées pour un véhicule électrique. */
export function indemniteKilometrique(km: number, cv: number, electrique: boolean, annee = ANNEE_COURANTE): number {
  const p = PARAMETRES[annee] || PARAMETRES[ANNEE_COURANTE]!
  const ligne = p.bareme.find(l => cv <= l.cv) || p.bareme[p.bareme.length - 1]!
  const brut = km <= 5000 ? km * ligne.petit
    : km <= 20000 ? km * ligne.moyen[0] + ligne.moyen[1]
      : km * ligne.grand
  return brut * (electrique ? 1 + p.majorationElectrique : 1)
}

/** Régime de la borne installée au domicile (article 4). */
function calculerBorne(i: EntreeRecharge, p: ParametresAnnee) {
  if (i.borneFinanceeParEmployeur !== 'oui') return null
  const cout = num(i.coutBorne, 0)
  if (cout <= 0) return null
  if (i.borneRetireeEnFinDeContrat === 'oui') {
    return { priseEnCharge: cout, exonere: cout, soumis: 0,
      regle: "Borne retirée à la fin du contrat : prise en charge exclue de l'assiette, sans plafond." }
  }
  /* Le texte dit « plus de cinq ans » : à exactement cinq ans, on reste dans la
     première branche. La comparaison doit donc être STRICTE. */
  const anciennete = num(i.ancienneteBorneAns, 0)
  const r = anciennete > 5 ? p.borne.ancienne : p.borne.jeune
  const exonere = Math.min(cout * r.taux, r.plafond)
  return {
    priseEnCharge: cout, exonere: e2(exonere), soumis: e2(Math.max(0, cout - exonere)),
    regle: anciennete > 5
      ? `Borne conservée, plus de cinq ans : ${Math.round(r.taux * 100)} % des dépenses, plafond ${r.plafond} €.`
      : `Borne conservée, cinq ans ou moins : ${Math.round(r.taux * 100)} % des dépenses, plafond ${r.plafond} €.`
  }
}

export function calculerRecharge(i: EntreeRecharge): ResultatRecharge {
  const annee = i.annee || ANNEE_COURANTE
  const p = PARAMETRES[annee] || PARAMETRES[ANNEE_COURANTE]!
  const avert: string[] = []

  const branche = determinerBranche(i)
  /* Déclaré ici et non plus bas : le tableau des hypothèses, construit avant
     le calcul du coût employeur, s'en sert déjà. */
  const taux = borne01(num(i.tauxChargesPatronales, CONFIG.tauxChargesPatronales))
  const conso = consoAuReseau(i)
  const km = Math.max(0, num(i.kmAnnuels, 0))
  const partDom = borne01(num(i.partDomicile, 0.8))
  /* Si l'utilisateur DISPOSE d'un relevé, on ne l'ignore pas pour recalculer une
     estimation à partir des kilomètres : afficher « mesure réelle » au-dessus
     d'un chiffre estimé était incohérent. Le relevé fait autorité. */
  const mesureReelle: MesureDomicile[] = ['supervision', 'sous-compteur']
  const releve = mesureReelle.includes(i.mesureDomicile || 'estimation') && num(i.kWhMesuresAn, 0) > 0
  const kWhDom = releve ? num(i.kWhMesuresAn, 0) : (conso * km / 100) * partDom
  const kWhAn = releve ? (partDom > 0 ? kWhDom / partDom : kWhDom) : conso * km / 100
  const prix = prixMoyenKwh(i)
  const coutDomAn = kWhDom * prix

  /* ── Remboursement et verdict ─────────────────────────────────────────── */
  let remboursement = coutDomAn
  let exonere = coutDomAn
  let plafond: number | null = null
  let verdict: Verdict = 'favorable'
  let texte = ''
  /* Vrai par défaut : seule une branche sans ventilation possible le retire. */
  let chiffrable = true

  switch (branche) {
    case 'entreprise-ve-eligible':
      /* Article 3 : l'avantage ne tient pas compte des frais d'électricité, et
         l'article 4 exclut expressément l'électricité de son plafond de 50 %.
         Le remboursement des kWh est donc intégralement hors assiette. */
      texte = "Vous pouvez rembourser 100 % des kilowattheures : les frais d'électricité "
        + "sont exclus du calcul de l'avantage en nature, et le plafond de 50 % ne vise "
        + 'que les frais de borne.'
      break

    case 'entreprise-hors-regime':
      verdict = 'prudence'
      remboursement = coutDomAn
      exonere = 0
      texte = i.motorisation === 'hybride-rechargeable'
        ? "Un hybride rechargeable ne fonctionne pas exclusivement à l'électricité : "
          + 'le régime favorable ne lui est pas acquis. À faire confirmer avant de rembourser.'
        : "Véhicule électrique dont l'éligibilité à l'éco-score n'est pas établie pour une "
          + 'mise à disposition postérieure au 01/02/2025 : le régime favorable n\'est pas acquis.'
      avert.push('Verdict de prudence : faites confirmer le régime par votre conseil en paie.')
      break

    case 'entreprise-service':
      texte = "Véhicule de service sans usage privé : l'énergie consommée est une charge "
        + "d'exploitation, remboursable sur justificatifs. L'avantage en nature ne se pose pas."
      break

    case 'perso-professionnel-ik': {
      /* La recharge est réputée comprise dans le barème : rembourser en plus les
         kWh reviendrait à payer l'énergie deux fois. */
      const ik = indemniteKilometrique(km, num(i.puissanceFiscale, 5), i.motorisation !== 'autre', annee)
      remboursement = ik
      exonere = ik
      verdict = 'encadre'
      texte = `Indemnités kilométriques : ${Math.round(ik)} € par an, majoration électrique comprise. `
        + "La recharge est réputée incluse dans le barème — ne remboursez pas les kilowattheures en plus."
      avert.push("Aucun cumul possible entre indemnités kilométriques et remboursement séparé de l'électricité.")
      break
    }

    case 'perso-professionnel-reels':
      verdict = 'encadre'
      texte = 'Remboursement aux frais réels : les kilowattheures effectivement consommés pour '
        + 'les trajets professionnels sont remboursables sur justificatifs.'
      avert.push('Aux frais réels, la qualité du justificatif fait tout : voir la méthode de mesure.')
      break

    case 'perso-domicile-travail': {
      /* L'article L. 3261-3 du code du travail INTERDIT le cumul avec la prise
         en charge des abonnements de transports publics (art. L. 3261-2). Ce
         n'est pas un plafond relevé : c'est une exclusion. */
      if (i.abonnementTransportPublic === 'oui') {
        verdict = 'exclu'
        remboursement = 0
        exonere = 0
        texte = "Le salarié bénéficie déjà d'une prise en charge de son abonnement de transports "
          + "publics : l'article L. 3261-3 interdit le cumul avec la prime de transport."
        break
      }
      plafond = p.primeTransport.plafondAlimentation
      exonere = Math.min(coutDomAn, plafond)
      remboursement = coutDomAn
      verdict = 'encadre'
      texte = `Prime de transport : la prise en charge des frais d'alimentation est exonérée `
        + `jusqu'à ${plafond} € par an et par salarié.`
      /* Le doute ne profite pas au verdict — même principe que pour la date de
         mise à disposition. Le cumul étant interdit et non plafonné, un
         abonnement non vérifié rend le versement conditionnel, pas acquis. */
      if (i.abonnementTransportPublic === 'inconnu') {
        verdict = 'prudence'
        avert.push("Prise en charge d'un abonnement de transports publics non vérifiée : "
          + "l'article L. 3261-3 en interdit le cumul avec la prime de transport. "
          + 'À écarter avant de verser.')
      }
      const raison = i.raisonVehiculePersonnel || 'inconnu'
      /* Liste BLANCHE, pas liste noire. Écrite en « tout sauf aucune et inconnu »,
         la règle rendait éligible n'importe quelle valeur inattendue — un libellé
         renommé, une valeur venue d'ailleurs. On n'ouvre le dispositif que sur
         les trois situations que le texte prévoit. */
      const ELIGIBLES: RaisonVehiculePersonnel[] = ['non-desservi', 'hors-plan-mobilite', 'horaires']
      if (raison !== 'aucune' && !ELIGIBLES.includes(raison)) {
        verdict = 'prudence'
        avert.push("Raison d'éligibilité non reconnue : la prime suppose une commune non "
          + "desservie par un transport collectif régulier ou organisé par l'employeur, une "
          + "résidence ou un lieu de travail hors du périmètre d'un plan de mobilité "
          + 'obligatoire, ou des horaires particuliers interdisant le transport collectif.')
        plafond = p.primeTransport.plafondAlimentation
        exonere = Math.min(coutDomAn, plafond)
        remboursement = coutDomAn
        texte = `Prime de transport : exonérée jusqu'à ${plafond} € par an, mais l'éligibilité `
          + "n'est pas établie."
        break
      }
      if (raison === 'aucune') {
        /* Aucune des situations de L. 3261-3 : le dispositif n'est pas ouvert.
           Ce n'est pas une réserve, c'est une inéligibilité. */
        verdict = 'exclu'
        remboursement = 0
        exonere = 0
        plafond = null
        texte = "Aucune des situations prévues par l'article L. 3261-3 n'est remplie : la prime "
          + "de transport n'est pas ouverte à ce salarié. Le confort ou la commodité ne sont pas "
          + 'des critères légaux.'
        break
      }
      if (coutDomAn > plafond) {
        avert.push(`Au-delà de ${plafond} €, la fraction excédentaire est soumise à cotisations.`)
      }
      break
    }

    case 'perso-mixte':
      /* La branche annonçait « deux usages à traiter séparément » sans les
         traiter : `remboursement` et `exonere` gardaient le coût domicile
         initialisé plus haut, présenté comme intégralement exonéré. Le chiffre
         ne voulait rien dire — il ignorait la ventilation des kilomètres, ne
         calculait aucune indemnité kilométrique, et ne vérifiait même pas
         l'abonnement de transports publics qui exclut la prime.

         On ne le remplace pas par un autre chiffre : additionner barème et
         prime de transport supposerait une règle de cumul que rien n'établit
         dans les textes consultés. Deux calculs séparés sont exacts, leur
         somme ne l'est pas. */
      verdict = 'prudence'
      chiffrable = false
      remboursement = 0
      exonere = 0
      plafond = null
      texte = 'Deux dispositifs distincts portent sur deux séries de kilomètres différentes : '
        + 'le barème kilométrique ou les frais réels pour les trajets professionnels, la prime '
        + "de transport pour le domicile-travail. Sans ventilation des kilomètres, aucun montant "
        + "n'est défendable."
      avert.push('Relancez le simulateur une fois par usage, avec les kilomètres correspondants : '
        + "chaque cas donne un montant fiable, leur addition n'en est pas un.")
      avert.push('Ne remboursez jamais les mêmes kilomètres au titre des deux dispositifs.')
      break
  }

  /* ── Borne ────────────────────────────────────────────────────────────── */
  const borne = calculerBorne(i, p)

  /* ── Comparaisons, à périmètre égal : 100 % de l'énergie annuelle ─────── */
  const c = CONFIG.comparaison
  const comparaison: ResultatRecharge['comparaison'] = [
    { mode: 'Domicile, heures creuses', coutAn: e2(kWhAn * CONFIG.tarifs.heuresCreuses), base: 'TTC' },
    { mode: 'Domicile, option base', coutAn: e2(kWhAn * CONFIG.tarifs.base), base: 'TTC' },
    { mode: 'Site entreprise, heures creuses', coutAn: e2(kWhAn * c.siteHC), base: 'HT' },
    { mode: 'Borne publique AC', coutAn: e2(kWhAn * c.publicAC), base: 'TTC' },
    { mode: 'Borne publique rapide DC', coutAn: e2(kWhAn * c.publicDC), base: 'TTC' }
  ]

  const gainHC = kWhDom * (CONFIG.tarifs.base - CONFIG.tarifs.heuresCreuses)

  /* ── Supervision ──────────────────────────────────────────────────────── */
  const mesure: MesureDomicile = i.mesureDomicile || 'estimation'
  let supervision: ResultatRecharge['supervision'] = null
  if (mesure === 'supervision' && i.supervisionPayeeParEmployeur === 'oui') {
    const coutAn = num(i.coutSupervisionMois, CONFIG.supervisionMois) * 12
    if (i.typeSupervision === 'plateforme-employeur') {
      /* L'article 4 vise les dépenses « que le salarié aurait dû engager ». Une
         plateforme souscrite par l'entreprise pour piloter sa flotte s'analyse
         plutôt comme un outil de l'employeur — mais aucune doctrine ne tranche
         cette configuration. On ne l'exonère donc pas d'office, et on ne la
         réintègre pas non plus : on renvoie au contrat. */
      supervision = {
        coutAn: e2(coutAn), exonere: 0, soumis: 0,
        regle: "Plateforme de supervision souscrite par l'entreprise pour sa flotte : le "
          + "plafond de 50 % vise les dépenses « que le salarié aurait dû engager ». Cette "
          + "configuration n'est pas tranchée par une doctrine publiée — traitement à vérifier "
          + 'selon votre contrat.'
      }
      avert.push("Supervision souscrite par l'entreprise : son traitement social n'est pas "
        + 'tranché par une doctrine publiée. À vérifier selon le contrat.')
    } else {
      /* 50 % des dépenses réelles, et AUCUN plafond en euros : les plafonds de
         1 057,10 € et 1 585,50 € visent l'achat et l'installation, pas les frais
         d'utilisation. Ne pas les appliquer ici. */
      const exo = coutAn * p.borne.fraisUtilisation.taux
      supervision = {
        coutAn: e2(coutAn), exonere: e2(exo), soumis: e2(coutAn - exo),
        regle: `Interprétation prudente de l'article 4, 2° b) — ce n'est pas une règle URSSAF `
          + `certaine. Abonnement de supervision rattaché à la borne du salarié : « autres frais liés `
          + `à l'utilisation », exclus dans la limite de `
          + `${Math.round(p.borne.fraisUtilisation.taux * 100)} % des dépenses réelles. `
          + `Aucun plafond en euros — celui-ci ne vaut que pour l'achat et l'installation.`
      }
      avert.push("L'électricité est exonérée en totalité, la supervision seulement de moitié : "
        + "l'article 4 dit « hors frais d'électricité » pour cette raison.")
    }
  }

  /* Seule une supervision identifie QUI a rechargé : un sous-compteur mesure la
     borne, pas le véhicule. Chez un salarié dont le conjoint roule aussi en
     électrique, la distinction n'est pas théorique. */
  const attributionSessions = mesure === 'supervision'
  if (mesure === 'sous-compteur') {
    avert.push('Un sous-compteur mesure la borne, pas le véhicule : si un second véhicule '
      + "s'y branche, les kilowattheures ne sont pas séparables.")
  }

  /* ── Qualité de la preuve ─────────────────────────────────────────────── */
  const PREUVES: Record<MesureDomicile, ResultatRecharge['preuve']> = {
    supervision: { niveau: 'mesure',
      texte: 'Relevé de supervision : sessions horodatées et rattachées au véhicule. C\'est la trace la plus solide, et la seule qui distingue deux véhicules sur une même borne.' },
    'sous-compteur': { niveau: 'mesure',
      texte: 'Sous-compteur dédié : la dépense est mesurée au point de charge, mais rien ne rattache une session à un véhicule donné.' },
    estimation: { niveau: 'estimation',
      texte: 'Estimation documentée : kilomètres × consommation × tarif. Défendable si la méthode est écrite et appliquée uniformément à tous les salariés.' },
    aucune: { niveau: 'simulation',
      texte: 'Aucune mesure : suffisant pour cadrer un ordre de grandeur, pas pour justifier un remboursement en cas de contrôle.' }
  }
  const preuve = PREUVES[mesure]

  if (i.optionTarif === 'hp-hc' && num(i.partHeuresCreuses, 0.8) >= 0.99) {
    avert.push('Recharge supposée intégralement en heures creuses : vérifiez les plages réelles, '
      + 'qui sont déterminées localement et ne sont pas toujours nocturnes.')
  }

  /* ── Hypothèses, en distinguant le réglementaire de l'hypothétique ────── */
  const hypotheses: ResultatRecharge['hypotheses'] = [
    { label: 'Consommation retenue', valeur: `${e2(conso)} kWh/100 km au réseau`,
      source: 'hypothese' },
    { label: 'Prix moyen du kWh au domicile', valeur: `${e2(prix)} € TTC`, source: 'hypothese' },
    { label: 'Part rechargée au domicile', valeur: `${Math.round(partDom * 100)} %`, source: 'hypothese' },
    { label: 'Plafond borne conservée, cinq ans ou moins', valeur: `${p.borne.jeune.plafond} €`,
      source: 'reglementaire' },
    { label: 'Plafond borne conservée, plus de cinq ans', valeur: `${p.borne.ancienne.plafond} €`,
      source: 'reglementaire' },
    { label: "Prime de transport, frais d'alimentation", valeur: `${p.primeTransport.plafondAlimentation} € par an`,
      source: 'reglementaire' },
    { label: "Plafond des frais d'utilisation de borne", valeur: `${Math.round(p.borne.fraisUtilisation.taux * 100)} % des dépenses, sans plafond en euros`, source: 'reglementaire' },
    { label: 'Charges patronales retenues', valeur: `${Math.round(taux * 100)} % de la fraction réintégrée`, source: 'hypothese' },
    { label: 'Fin du régime dérogatoire', valeur: p.finRegime, source: 'reglementaire' }
  ]

  /* ── Coût employeur, tout compris ─────────────────────────────────────
     Le remboursement de l'électricité n'est qu'un poste sur trois. Ce qui
     manquait, c'est la fraction réintégrée : elle est soumise à cotisations,
     donc elle coûte plus que son montant facial. */
  const supervisionAn = supervision ? supervision.coutAn : 0
  const soumisRecurrent = Math.max(0, remboursement - exonere) + (supervision ? supervision.soumis : 0)
  const chargesRecurrentes = soumisRecurrent * taux
  const borneUnique = borne ? borne.priseEnCharge : 0
  const chargesBorne = borne ? borne.soumis * taux : 0
  const totalRecurrent = coutDomAn + supervisionAn + chargesRecurrentes
  const coutEmployeur = {
    electriciteAn: e2(coutDomAn),
    supervisionAn: e2(supervisionAn),
    chargesRecurrentesAn: e2(chargesRecurrentes),
    totalRecurrentAn: e2(totalRecurrent),
    borneUnique: e2(borneUnique),
    chargesBorneUnique: e2(chargesBorne),
    totalPremiereAnnee: e2(totalRecurrent + borneUnique + chargesBorne),
    borneAnnualisee: e2(borneUnique / CONFIG.dureeAmortissementBorneAns),
    tauxCharges: taux
  }
  if (soumisRecurrent > 0) {
    avert.push(`La fraction réintégrée supporte des charges patronales : `
      + `${Math.round(chargesRecurrentes)} € de plus par an, au taux d'hypothèse de `
      + `${Math.round(taux * 100)} %.`)
  }

  return {
    branche, libelleBranche: LIBELLES[branche], verdict, texteVerdict: texte,
    consoRetenue: e2(conso), consoAuReseau: e2(conso),
    kWhAn: Math.round(kWhAn), kWhDomicileAn: Math.round(kWhDom),
    prixMoyenKwh: e2(prix),
    coutDomicileAn: e2(coutDomAn), coutDomicileMois: e2(coutDomAn / 12),
    remboursementAn: e2(remboursement),
    remboursementExonereAn: e2(exonere),
    montantChiffrable: chiffrable,
    remboursementSoumisAn: e2(Math.max(0, remboursement - exonere)),
    plafondApplique: plafond,
    borne,
    supervision, attributionSessions, coutEmployeur,
    comparaison, gainHeuresCreusesAn: e2(gainHC),
    hypotheses, avertissements: avert, preuve
  }
}

/** Résumé texte, pour l'email de lead. */
export function resumeRecharge(r: ResultatRecharge): string {
  return `${r.libelleBranche} — ${r.kWhDomicileAn} kWh/an à domicile, `
    + `${Math.round(r.coutDomicileMois)} €/mois, remboursement ${Math.round(r.remboursementAn)} €/an `
    + `(exonéré ${Math.round(r.remboursementExonereAn)} €).`
}
