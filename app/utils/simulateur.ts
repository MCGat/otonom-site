/**
 * OTONOM — Moteur du simulateur d'économies & ROI (fonctions pures, sans DOM).
 * Auto-importé par Nuxt (dossier app/utils). Consommé par app/pages/simulateur.vue.
 *
 * Résultats = ORDRES DE GRANDEUR INDICATIFS, à confirmer lors de l'audit.
 * Toute la « science » est dans SIM_CONFIG : un seul endroit, daté, commenté, modifiable.
 */

/* ── 1) CONFIG — hypothèses & barèmes (MAJ 01/01/2026) ──────────────────────
   [BARÈME] officiel · [MARCHÉ] ordre de grandeur · [HYPOTHÈSE] ratio · [INDICATIF] fourchette */
export const SIM_CONFIG = {
  maj: '01/01/2026',
  version: '1.0',
  flotte: {
    consoThermique: { vp: 6.5, vul: 8.5, pl: 30 },   // L/100 km [MARCHÉ]
    consoElec: { vp: 18, vul: 25, pl: 130 },          // kWh/100 km [MARCHÉ]
    prixCarburant: 1.75,                              // €/L gazole [MARCHÉ]
    prixElecRecharge: 0.15,                           // €/kWh sur site [MARCHÉ]
    partElectrifiable: { vp: 0.90, vul: 0.70, pl: 0.25 }, // [HYPOTHÈSE]
    gainEntretienParVE: 600,                          // €/an [MARCHÉ]
    mixParDefaut: { vp: 60, vul: 30, pl: 10 }         // % [HYPOTHÈSE]
  },
  tai: { seuilFlotte: 100, quotaVFE2026: 0.18, montantParVehiculeManquant: 4000 }, // [BARÈME]
  aen: { abattement: 0.70, plafondAnnuel: 4641.60, gainParVEParAn: 2000 },         // [BARÈME]+[HYPOTHÈSE]
  energie: { prixElecActuel: 0.18, prixElecNegocie: 0.14, prixRevente: 0.10, kWhParKVAParAn: 1600 },
  irve: { veParPoint: 1.5, partPoints22kW: 0.20, coutPoint7kW: 1500, coutPoint22kW: 4000, genieCivilParSite: 3000, aideAdvenirParPoint: 1000 },
  pv: { kWcParM2: 0.16, productionParKWc: 1050, autoconsoPart: 0.70, coutParKWc: 1000, primeParKWc: 80 },
  batterie: { gainMin: 10000, gainMax: 30000, seuilConsoKWh: 150000 },  // [INDICATIF]
  ems: { partFactureMin: 0.10, partFactureMax: 0.15 },                   // [INDICATIF]
  co2: { kgParLitreGazole: 2.51, kgParKWhElec: 0.06, kgParKWhReseauEvitePV: 0.06 }, // [BARÈME ADEME]
  score: { objectif: 80, axePoints: 25 }
}

/* ── 2) Utilitaires de format ─────────────────────────────────────────────── */
const nf0 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
export const clampNum = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
function ordre(v: number) {
  v = Math.max(0, v)
  if (v >= 10000) return Math.round(v / 1000) * 1000
  if (v >= 1000) return Math.round(v / 100) * 100
  return Math.round(v / 10) * 10
}
export const euros = (v: number) => nf0.format(ordre(v)) + ' €'
export const tonnes = (v: number) => nf0.format(Math.round(v)) + ' t'
const nombre = (v: number) => nf0.format(Math.round(v))

export interface SimInput {
  nbVehicules?: number; kmAn?: number; mixVP?: number; mixVUL?: number; mixPL?: number
  partDejaElec?: number; nbSites?: number; nbCollaborateurs?: number
  puissanceSouscrite?: number; consoEnergie?: number; surfaceToiture?: number
}
const n = (v: number | undefined, def: number) => (typeof v === 'number' && isFinite(v)) ? v : def

/* ── 3) MOTEUR — calcule tous les résultats à partir des entrées ───────────── */
export function calculerSimulateur(input: SimInput) {
  const C = SIM_CONFIG
  const nbVeh = Math.max(0, n(input.nbVehicules, 0))
  let mVP = n(input.mixVP, C.flotte.mixParDefaut.vp)
  let mVUL = n(input.mixVUL, C.flotte.mixParDefaut.vul)
  let mPL = n(input.mixPL, C.flotte.mixParDefaut.pl)
  const mixTot = (mVP + mVUL + mPL) || 1
  mVP /= mixTot; mVUL /= mixTot; mPL /= mixTot
  const kmAn = n(input.kmAn, 25000)
  const partDeja = clampNum(n(input.partDejaElec, 0), 0, 100) / 100
  const nbSites = Math.max(1, n(input.nbSites, 1))
  const nbCollab = Math.max(0, n(input.nbCollaborateurs, nbVeh))
  const pSouscr = Math.max(0, n(input.puissanceSouscrite, 0))
  const consoMWh = n(input.consoEnergie, 0)
  const surface = Math.max(0, n(input.surfaceToiture, 0))

  const nb = { vp: nbVeh * mVP, vul: nbVeh * mVUL, pl: nbVeh * mPL }

  // BLOC 1 — Flotte
  const elecable = {
    vp: nb.vp * C.flotte.partElectrifiable.vp * (1 - partDeja),
    vul: nb.vul * C.flotte.partElectrifiable.vul * (1 - partDeja),
    pl: nb.pl * C.flotte.partElectrifiable.pl * (1 - partDeja)
  }
  const nbElecable = elecable.vp + elecable.vul + elecable.pl
  const tauxElec = nbVeh ? (nbElecable + nbVeh * partDeja) / nbVeh : 0
  const litres = (t: 'vp' | 'vul' | 'pl') => kmAn * C.flotte.consoThermique[t] / 100
  const kwh = (t: 'vp' | 'vul' | 'pl') => kmAn * C.flotte.consoElec[t] / 100
  const coutCarbVeh = (t: 'vp' | 'vul' | 'pl') => litres(t) * C.flotte.prixCarburant
  const coutElecVeh = (t: 'vp' | 'vul' | 'pl') => kwh(t) * C.flotte.prixElecRecharge
  const budgetCarbActuel = nb.vp * coutCarbVeh('vp') + nb.vul * coutCarbVeh('vul') + nb.pl * coutCarbVeh('pl')
  let gainCarburant = 0
  ;(['vp', 'vul', 'pl'] as const).forEach((t) => { gainCarburant += elecable[t] * (coutCarbVeh(t) - coutElecVeh(t)) })
  const budgetCarbFutur = budgetCarbActuel - gainCarburant
  const gainEntretien = nbElecable * C.flotte.gainEntretienParVE
  let gainTAI = 0
  if (nbVeh >= C.tai.seuilFlotte) {
    const quota = Math.ceil(C.tai.quotaVFE2026 * nbVeh)
    const manquants = Math.max(0, quota - Math.round(nbVeh * partDeja))
    gainTAI = manquants * C.tai.montantParVehiculeManquant
  }
  const gainFlotte = gainCarburant + gainEntretien + gainTAI

  // BLOC 2 — AEN
  const nbVEsalaries = Math.min(nbCollab, elecable.vp + nbVeh * partDeja * mVP)
  const gainAEN = nbVEsalaries * C.aen.gainParVEParAn

  // BLOC 4 — Énergie
  const consoKWh = consoMWh > 0 ? consoMWh * 1000 : pSouscr * C.energie.kWhParKVAParAn
  const factureEnergie = consoKWh * C.energie.prixElecActuel
  const gainEnergie = consoKWh * (C.energie.prixElecActuel - C.energie.prixElecNegocie)

  // BLOC 5 — Photovoltaïque
  const kWc = surface * C.pv.kWcParM2
  const prodKWh = kWc * C.pv.productionParKWc
  const autoKWh = prodKWh * C.pv.autoconsoPart
  const surplusKWh = prodKWh - autoKWh
  const gainPV = autoKWh * C.energie.prixElecNegocie + surplusKWh * C.energie.prixRevente
  const investPV = kWc * C.pv.coutParKWc
  const primePV = kWc * C.pv.primeParKWc

  // BLOC 3 — IRVE
  const nbPoints = Math.ceil(nbElecable / C.irve.veParPoint)
  const nb22 = Math.round(nbPoints * C.irve.partPoints22kW)
  const nb7 = Math.max(0, nbPoints - nb22)
  const investIRVE = nb7 * C.irve.coutPoint7kW + nb22 * C.irve.coutPoint22kW + nbSites * C.irve.genieCivilParSite
  const aideIRVE = Math.min(investIRVE * 0.5, nbPoints * C.irve.aideAdvenirParPoint)

  // BLOC 6 — Batterie (indicatif)
  const batterieActive = consoKWh >= C.batterie.seuilConsoKWh
  const gainBatterieMid = batterieActive ? (C.batterie.gainMin + C.batterie.gainMax) / 2 : 0

  // BLOC 7 — EMS (indicatif)
  const gainEMSmid = factureEnergie * (C.ems.partFactureMin + C.ems.partFactureMax) / 2

  // BLOC 8 — Aides
  const aidesTotal = aideIRVE + primePV

  // BLOC 9 — CO₂
  const litresEvites = elecable.vp * litres('vp') + elecable.vul * litres('vul') + elecable.pl * litres('pl')
  const kwhAjoutes = elecable.vp * kwh('vp') + elecable.vul * kwh('vul') + elecable.pl * kwh('pl')
  const co2Actuel = (nb.vp * litres('vp') + nb.vul * litres('vul') + nb.pl * litres('pl')) * C.co2.kgParLitreGazole / 1000
  const co2EviteFlotte = (litresEvites * C.co2.kgParLitreGazole - kwhAjoutes * C.co2.kgParKWhElec) / 1000
  const co2EvitePV = autoKWh * C.co2.kgParKWhReseauEvitePV / 1000
  const co2Evite = Math.max(0, co2EviteFlotte + co2EvitePV)
  const co2Apres = Math.max(0, co2Actuel - co2Evite)
  const co2Pct = co2Actuel ? co2Evite / co2Actuel : 0

  // Synthèse
  const gainSolide = gainFlotte + gainAEN + gainEnergie + gainPV
  const gainGlobal = gainSolide
  const investissement = investIRVE + investPV
  const investNet = Math.max(0, investissement - aidesTotal)
  const roiAns = gainGlobal > 0 ? investNet / gainGlobal : 0

  // BLOC 10 — Score
  const P = C.score.axePoints
  const scoreActuel = Math.round(P * partDeja + P * 0.30 + P * partDeja * 0.5 + P * partDeja)
  const scorePotentiel = Math.round(
    P * tauxElec + P * (surface > 0 ? 0.9 : 0.7) + P * (nbElecable > 0 ? 0.85 : 0.4) + P * clampNum(co2Pct * 1.4, 0, 1)
  )

  return {
    entrees: { nbVeh, kmAn, nbSites, nbCollab, pSouscr, consoKWh, surface },
    flotte: { tauxElec, nbElecable, budgetCarbActuel, budgetCarbFutur, gainCarburant, gainEntretien, gainTAI, gainFlotte },
    aen: { nbVEsalaries, gainAEN },
    energie: { consoKWh, factureEnergie, gainEnergie },
    pv: { kWc, prodKWh, gainPV, investPV, primePV, actif: surface > 0 },
    irve: { nbPoints, nb7, nb22, investIRVE, aideIRVE },
    batterie: { actif: batterieActive, gainMin: C.batterie.gainMin, gainMax: C.batterie.gainMax, gainMid: gainBatterieMid },
    ems: { gainMid: gainEMSmid, pctMin: C.ems.partFactureMin, pctMax: C.ems.partFactureMax },
    aides: { total: aidesTotal, irve: aideIRVE, pv: primePV },
    co2: { actuel: co2Actuel, apres: co2Apres, evite: co2Evite, pct: co2Pct },
    synth: { gainGlobal, gainSolide, investissement, investNet, roiAns },
    score: { actuel: scoreActuel, potentiel: scorePotentiel, objectif: C.score.objectif }
  }
}
export type SimResult = ReturnType<typeof calculerSimulateur>

/* ── 4) VUE — transforme le résultat en données prêtes à afficher ──────────── */
export type TagKind = 'calc' | 'hyp' | 'ind' | 'audit'
export interface SimRow { label: string; value: string; strong?: boolean }
export interface SimBlock { n: string; title: string; tag: TagKind; leadHtml?: string; leadMuted?: boolean; rows: SimRow[] }

const roiTexte = (r: number) => r > 0 ? r.toFixed(1).replace('.', ',') + ' an' + (r >= 2 ? 's' : '') : '—'

export function construireVueSimulateur(r: SimResult) {
  const metrics = [
    { label: 'Gain annuel estimé', value: euros(r.synth.gainGlobal) },
    { label: 'Investissement estimé', value: euros(r.synth.investissement) },
    { label: 'Aides mobilisables', value: euros(r.aides.total) },
    { label: 'Retour sur investissement', value: roiTexte(r.synth.roiAns) },
    { label: 'CO₂ évité', value: tonnes(r.co2.evite) + '/an' }
  ]

  let extra: string | null = null
  if (r.batterie.gainMid > 0 || r.ems.gainMid > 0) {
    const lo = r.batterie.gainMin + Math.round(r.ems.gainMid * 0.8)
    const hi = r.batterie.gainMax + Math.round(r.ems.gainMid * 1.2)
    extra = `+ potentiel additionnel indicatif (stockage batterie &amp; pilotage EMS) : <b class="tabnum">${euros(lo)} à ${euros(hi)}/an</b> — à qualifier en audit.`
  }

  const blocks: SimBlock[] = [
    {
      n: '01', title: 'Audit flotte', tag: 'calc',
      leadHtml: `<b class="tabnum">${Math.round(r.flotte.tauxElec * 100)}%</b> de la flotte électrifiable, soit <b class="tabnum">${nombre(r.flotte.nbElecable)}</b> véhicules.`,
      rows: [
        { label: "Budget carburant aujourd'hui", value: euros(r.flotte.budgetCarbActuel) },
        { label: 'Budget carburant après transition', value: euros(r.flotte.budgetCarbFutur) },
        { label: 'Gain carburant', value: euros(r.flotte.gainCarburant), strong: true },
        { label: 'Gain entretien', value: euros(r.flotte.gainEntretien) },
        ...(r.flotte.gainTAI > 0 ? [{ label: 'Évitement taxe incitative (TAI)', value: euros(r.flotte.gainTAI) }] : [])
      ]
    },
    {
      n: '02', title: 'Avantage en nature (AEN)', tag: 'hyp',
      leadHtml: `<b class="tabnum">${nombre(r.aen.nbVEsalaries)}</b> VE de fonction éligibles à l'abattement de 70 %.`,
      rows: [{ label: 'Gain AEN estimé', value: euros(r.aen.gainAEN), strong: true }]
    },
    {
      n: '03', title: 'Infrastructure de recharge (IRVE)', tag: 'calc',
      leadHtml: `Besoin estimé : <b class="tabnum">${r.irve.nb7}</b> points 7 kW · <b class="tabnum">${r.irve.nb22}</b> points 22 kW.`,
      rows: [
        { label: 'Investissement IRVE', value: euros(r.irve.investIRVE) },
        { label: 'Aides (ADVENIR)', value: euros(r.irve.aideIRVE) },
        { label: 'Reste à charge', value: euros(r.irve.investIRVE - r.irve.aideIRVE), strong: true }
      ]
    },
    {
      n: '04', title: 'Énergie — optimisation du contrat', tag: 'calc',
      leadHtml: `Consommation estimée : <b class="tabnum">${nombre(r.energie.consoKWh / 1000)} MWh</b>/an.`,
      rows: [
        { label: 'Facture énergie actuelle', value: euros(r.energie.factureEnergie) },
        { label: 'Gain par mise en concurrence', value: euros(r.energie.gainEnergie), strong: true }
      ]
    },
    r.pv.actif
      ? {
          n: '05', title: 'Photovoltaïque', tag: 'calc',
          leadHtml: `<b class="tabnum">${nombre(r.pv.kWc)} kWc</b> installables · production <b class="tabnum">${nombre(r.pv.prodKWh / 1000)} MWh</b>/an.`,
          rows: [
            { label: 'Gain autoconsommation', value: euros(r.pv.gainPV), strong: true },
            { label: 'Investissement', value: euros(r.pv.investPV) },
            { label: 'Prime autoconsommation', value: euros(r.pv.primePV) }
          ]
        }
      : { n: '05', title: 'Photovoltaïque', tag: 'audit', leadHtml: 'Renseignez une surface de toiture pour estimer le potentiel solaire.', leadMuted: true, rows: [] },
    r.batterie.actif
      ? {
          n: '06', title: 'Stockage batterie', tag: 'ind',
          leadHtml: 'Effacement · peak shaving · recharge pilotée.',
          rows: [{ label: 'Gain annuel indicatif', value: `${euros(r.batterie.gainMin)} à ${euros(r.batterie.gainMax)}`, strong: true }]
        }
      : { n: '06', title: 'Stockage batterie', tag: 'ind', leadHtml: "Pertinent au-delà d'un certain volume de consommation — à qualifier en audit.", leadMuted: true, rows: [] },
    {
      n: '07', title: 'Pilotage énergétique (EMS)', tag: 'ind',
      leadHtml: 'Délestage, optimisation de la recharge, effacement.',
      rows: [
        { label: 'Économie sur la facture énergie', value: `${Math.round(r.ems.pctMin * 100)} à ${Math.round(r.ems.pctMax * 100)}%` },
        { label: 'Gain annuel indicatif', value: euros(r.ems.gainMid), strong: true }
      ]
    },
    {
      n: '08', title: 'CEE & aides mobilisables', tag: 'calc',
      rows: [
        { label: 'Aide IRVE (ADVENIR)', value: euros(r.aides.irve) },
        { label: 'Prime photovoltaïque', value: euros(r.aides.pv) },
        { label: 'Total aides estimées', value: euros(r.aides.total), strong: true }
      ]
    },
    {
      n: '09', title: 'Empreinte CO₂', tag: 'calc',
      leadHtml: `Aujourd'hui <b class="tabnum">${tonnes(r.co2.actuel)}</b> → après projet <b class="tabnum">${tonnes(r.co2.apres)}</b>.`,
      rows: [
        { label: 'CO₂ évité par an', value: tonnes(r.co2.evite), strong: true },
        { label: 'Réduction', value: `${Math.round(r.co2.pct * 100)}%` }
      ]
    },
    {
      n: '10', title: 'Score OTONOM', tag: 'hyp',
      leadHtml: 'Indice de maturité énergétique sur 100.',
      rows: [
        { label: 'Score actuel', value: `${r.score.actuel}/100` },
        { label: 'Potentiel avec OTONOM', value: `${r.score.potentiel}/100`, strong: true },
        { label: 'Objectif cible', value: `${r.score.objectif}/100` }
      ]
    }
  ]

  return {
    hero: euros(r.synth.gainGlobal),
    metrics,
    score: { actuel: clampNum(r.score.actuel, 0, 100), potentiel: r.score.potentiel, objectif: r.score.objectif },
    extra,
    blocks
  }
}

/* ── 5) Résumé texte envoyé à OTONOM avec le lead ──────────────────────────── */
export function resumeSimulateur(r: SimResult): string {
  const e = r.entrees
  return [
    '— DIAGNOSTIC SIMULATEUR (estimations indicatives) —', '',
    'Argent laissé sur la table : ' + euros(r.synth.gainGlobal) + '/an',
    'Gain annuel estimé        : ' + euros(r.synth.gainGlobal),
    'Investissement estimé     : ' + euros(r.synth.investissement),
    'Aides mobilisables        : ' + euros(r.aides.total),
    'ROI                       : ' + roiTexte(r.synth.roiAns),
    'CO2 évité                 : ' + tonnes(r.co2.evite) + '/an',
    'Score OTONOM              : ' + r.score.actuel + '/100 → potentiel ' + r.score.potentiel + '/100', '',
    'Saisie : ' + nombre(e.nbVeh) + ' véhicules · ' + nombre(e.kmAn) + ' km/an · ' + nombre(e.nbSites) + ' site(s) · ' + nombre(e.nbCollab) + ' collaborateurs',
    'Énergie : ' + nombre(e.consoKWh / 1000) + ' MWh/an · ' + nombre(e.pSouscr) + ' kVA · toiture ' + nombre(e.surface) + ' m²', '',
    'Détail : flotte ' + euros(r.flotte.gainFlotte) + ' · AEN ' + euros(r.aen.gainAEN) + ' · énergie ' + euros(r.energie.gainEnergie) + ' · PV ' + euros(r.pv.gainPV)
  ].join('\n')
}
