/* ============================================================================
   OTONOM — Simulateur d'économies & ROI  (calcul 100 % client, aucun envoi)
   ----------------------------------------------------------------------------
   Résultats = ORDRES DE GRANDEUR INDICATIFS, à confirmer lors de l'audit.
   Toute la « science » du simulateur est dans FISCAL_CONFIG ci-dessous :
   un seul endroit, daté, commenté, facilement modifiable.
   ============================================================================ */

/* ══════════════════════════════════════════════════════════════════════════
   1) CONFIG — hypothèses & barèmes.   ⚠️ SOURCE UNIQUE À FAIRE VALIDER OTONOM
   Dernière mise à jour des barèmes : 01/01/2026
   Nature des valeurs :
     • [BARÈME]     = officiel/réglementaire (fiscalité, taxes) — daté 2026
     • [MARCHÉ]     = ordre de grandeur secteur (prix, coûts) — à ajuster
     • [HYPOTHÈSE]  = ratio de modélisation retenu par OTONOM
     • [INDICATIF]  = fourchette assumée, à affiner impérativement en audit
   ══════════════════════════════════════════════════════════════════════════ */
const FISCAL_CONFIG = {
  maj: '01/01/2026',
  version: '1.0',

  /* ---- FLOTTE : passage thermique → électrique -------------------------- */
  flotte: {
    // Consommation moyenne thermique par type (L/100 km) [MARCHÉ]
    consoThermique:   { vp: 6.5, vul: 8.5, pl: 30 },
    // Consommation électrique équivalente (kWh/100 km) [MARCHÉ]
    consoElec:        { vp: 18,  vul: 25,  pl: 130 },
    // Prix carburant pro TTC (€/L, gazole) [MARCHÉ]
    prixCarburant:    1.75,
    // Coût de recharge sur site (€/kWh, HT, pilotée) [MARCHÉ]
    prixElecRecharge: 0.15,
    // Part réaliste électrifiable immédiatement, par type [HYPOTHÈSE]
    partElectrifiable:{ vp: 0.90, vul: 0.70, pl: 0.25 },
    // Économie d'entretien annuelle par VE (vs thermique) [MARCHÉ]
    gainEntretienParVE: 600,
    // Répartition de flotte par défaut si non renseignée (%) [HYPOTHÈSE]
    mixParDefaut:     { vp: 60, vul: 30, pl: 10 }
  },

  /* ---- TAI : taxe annuelle incitative (verdissement des flottes) --------- */
  // Barème 2026 tel qu'affiché sur expertises.html [BARÈME]
  tai: {
    seuilFlotte:               100,    // s'applique aux flottes ≥ 100 véhicules
    quotaVFE2026:              0.18,   // 18 % de véhicules à faibles émissions attendus
    montantParVehiculeManquant:4000    // € / véhicule manquant en 2026 (5 000 € dès 2027)
  },

  /* ---- AEN : avantage en nature d'un VE --------------------------------- */
  aen: {
    abattement:    0.70,        // abattement forfaitaire [BARÈME]
    plafondAnnuel: 4641.60,     // plafond €/an au 01/01/2026 [BARÈME]
    // Économie annuelle moyenne (employeur + salarié) par VE de fonction [HYPOTHÈSE]
    gainParVEParAn: 2000
  },

  /* ---- ÉNERGIE : optimisation du contrat (courtage) --------------------- */
  energie: {
    prixElecActuel:  0.18,   // €/kWh moyen constaté [MARCHÉ]
    prixElecNegocie: 0.14,   // €/kWh après mise en concurrence [MARCHÉ]
    prixRevente:     0.10,   // €/kWh surplus PV revendu [MARCHÉ]
    // Estimation conso si non renseignée : kWh/an par kVA souscrit [HYPOTHÈSE]
    kWhParKVAParAn:  1600
  },

  /* ---- IRVE : infrastructure de recharge -------------------------------- */
  irve: {
    veParPoint:      1.5,     // nb de VE partageant un point de charge [HYPOTHÈSE]
    partPoints22kW:  0.20,    // part de points en 22 kW (reste en 7 kW) [HYPOTHÈSE]
    coutPoint7kW:    1500,    // € / point 7 kW posé [MARCHÉ]
    coutPoint22kW:   4000,    // € / point 22 kW posé [MARCHÉ]
    genieCivilParSite: 3000,  // € forfait raccordement/génie civil par site [MARCHÉ]
    aideAdvenirParPoint: 1000 // € prime ADVENIR par point (ordre de grandeur) [MARCHÉ]
  },

  /* ---- PHOTOVOLTAÏQUE --------------------------------------------------- */
  pv: {
    kWcParM2:         0.16,   // puissance installable par m² de toiture [MARCHÉ]
    productionParKWc: 1050,   // kWh/an produits par kWc (moyenne France) [MARCHÉ]
    autoconsoPart:    0.70,   // part autoconsommée [HYPOTHÈSE]
    coutParKWc:       1000,   // € investissement par kWc installé [MARCHÉ]
    primeParKWc:      80      // € prime à l'autoconsommation par kWc [MARCHÉ]
  },

  /* ---- BATTERIE (stockage) — INDICATIF ---------------------------------- */
  batterie: {
    // Gain annuel indicatif (effacement / peak shaving / recharge pilotée)
    gainMin: 10000, gainMax: 30000,                 // [INDICATIF]
    seuilConsoKWh: 150000                            // déclenché au-delà de cette conso
  },

  /* ---- EMS (pilotage énergétique) — INDICATIF --------------------------- */
  ems: {
    partFactureMin: 0.10, partFactureMax: 0.15       // % économisé sur la facture énergie [INDICATIF]
  },

  /* ---- CO₂ -------------------------------------------------------------- */
  co2: {
    kgParLitreGazole: 2.51,   // kg CO₂ / L gazole [BARÈME ADEME]
    kgParKWhElec:     0.06,   // kg CO₂ / kWh élec (mix France) [BARÈME ADEME]
    kgParKWhReseauEvitePV: 0.06
  },

  /* ---- SCORE OTONOM (indice de maturité /100) — HEURISTIQUE -------------- */
  // 4 axes × 25 pts. Score « actuel » = ce qui est déjà exploité ; objectif = 80.
  score: { objectif: 80, axePoints: 25 }
};

/* ══════════════════════════════════════════════════════════════════════════
   2) UTILITAIRES
   ══════════════════════════════════════════════════════════════════════════ */
const nf0 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const clampNum = (v, min, max) => Math.max(min, Math.min(max, v));
const num = (id, def) => {
  const el = document.getElementById(id);
  if (!el) return def;
  const v = parseFloat(String(el.value).replace(',', '.'));
  return isFinite(v) ? v : def;
};
// Arrondi « ordre de grandeur » : au millier près au-dessus de 10 k, sinon à la centaine
function ordre(v) {
  v = Math.max(0, v);
  if (v >= 10000) return Math.round(v / 1000) * 1000;
  if (v >= 1000)  return Math.round(v / 100) * 100;
  return Math.round(v / 10) * 10;
}
const euros = v => nf0.format(ordre(v)) + ' €';

/* ══════════════════════════════════════════════════════════════════════════
   3) MOTEUR — lit le formulaire, renvoie tous les résultats
   ══════════════════════════════════════════════════════════════════════════ */
function calculer() {
  const C = FISCAL_CONFIG;

  // ---- Entrées (avec défauts intelligents) ----
  const nbVeh   = Math.max(0, num('nbVehicules', 0));
  let   mVP = num('mixVP', C.flotte.mixParDefaut.vp);
  let   mVUL= num('mixVUL', C.flotte.mixParDefaut.vul);
  let   mPL = num('mixPL', C.flotte.mixParDefaut.pl);
  const mixTot = (mVP + mVUL + mPL) || 1;
  mVP/=mixTot; mVUL/=mixTot; mPL/=mixTot;                 // normalise en parts
  const kmAn    = num('kmAn', 25000);
  const partDeja= clampNum(num('partDejaElec', 0), 0, 100) / 100;
  const nbSites = Math.max(1, num('nbSites', 1));
  const nbCollab= Math.max(0, num('nbCollaborateurs', nbVeh));
  const pSouscr = Math.max(0, num('puissanceSouscrite', 0));
  const consoMWh= num('consoEnergie', 0);
  const surface = Math.max(0, num('surfaceToiture', 0));

  const nb = { vp: nbVeh*mVP, vul: nbVeh*mVUL, pl: nbVeh*mPL };

  // ---- BLOC 1 — Audit flotte ----
  const elecable = {
    vp:  nb.vp  * C.flotte.partElectrifiable.vp  * (1 - partDeja),
    vul: nb.vul * C.flotte.partElectrifiable.vul * (1 - partDeja),
    pl:  nb.pl  * C.flotte.partElectrifiable.pl  * (1 - partDeja)
  };
  const nbElecable = elecable.vp + elecable.vul + elecable.pl;
  const tauxElec   = nbVeh ? (nbElecable + nbVeh*partDeja) / nbVeh : 0;

  const litres = t => kmAn * C.flotte.consoThermique[t] / 100;         // L/an/véh
  const kwh    = t => kmAn * C.flotte.consoElec[t] / 100;              // kWh/an/véh
  const coutCarbVeh = t => litres(t) * C.flotte.prixCarburant;
  const coutElecVeh = t => kwh(t)    * C.flotte.prixElecRecharge;

  // Budget carburant actuel (tous véhicules, avant transition)
  const budgetCarbActuel = nb.vp*coutCarbVeh('vp') + nb.vul*coutCarbVeh('vul') + nb.pl*coutCarbVeh('pl');
  // Budget carburant après électrification de la part électrifiable
  let gainCarburant = 0;
  ['vp','vul','pl'].forEach(t => { gainCarburant += elecable[t] * (coutCarbVeh(t) - coutElecVeh(t)); });
  const budgetCarbFutur = budgetCarbActuel - gainCarburant;

  const gainEntretien = nbElecable * C.flotte.gainEntretienParVE;

  // TAI évitée (flottes ≥ 100)
  let gainTAI = 0;
  if (nbVeh >= C.tai.seuilFlotte) {
    const quota = Math.ceil(C.tai.quotaVFE2026 * nbVeh);
    const manquants = Math.max(0, quota - Math.round(nbVeh * partDeja));
    gainTAI = manquants * C.tai.montantParVehiculeManquant;
  }
  const gainFlotte = gainCarburant + gainEntretien + gainTAI;

  // ---- BLOC 2 — AEN ----
  const nbVEsalaries = Math.min(nbCollab, elecable.vp + nbVeh*partDeja*mVP);
  const gainAEN = nbVEsalaries * C.aen.gainParVEParAn;

  // ---- BLOC 4 — Énergie (courtage) ----
  const consoKWh = consoMWh > 0 ? consoMWh*1000 : pSouscr * C.energie.kWhParKVAParAn;
  const factureEnergie = consoKWh * C.energie.prixElecActuel;
  const gainEnergie = consoKWh * (C.energie.prixElecActuel - C.energie.prixElecNegocie);

  // ---- BLOC 5 — Photovoltaïque ----
  const kWc = surface * C.pv.kWcParM2;
  const prodKWh = kWc * C.pv.productionParKWc;
  const autoKWh = prodKWh * C.pv.autoconsoPart;
  const surplusKWh = prodKWh - autoKWh;
  const gainPV = autoKWh*C.energie.prixElecNegocie + surplusKWh*C.energie.prixRevente;
  const investPV = kWc * C.pv.coutParKWc;
  const primePV  = kWc * C.pv.primeParKWc;

  // ---- BLOC 3 — IRVE ----
  const nbPoints = Math.ceil(nbElecable / C.irve.veParPoint);
  const nb22 = Math.round(nbPoints * C.irve.partPoints22kW);
  const nb7  = Math.max(0, nbPoints - nb22);
  const investIRVE = nb7*C.irve.coutPoint7kW + nb22*C.irve.coutPoint22kW + nbSites*C.irve.genieCivilParSite;
  const aideIRVE = Math.min(investIRVE*0.5, nbPoints*C.irve.aideAdvenirParPoint);

  // ---- BLOC 6 — Batterie (INDICATIF) ----
  const batterieActive = consoKWh >= C.batterie.seuilConsoKWh;
  const gainBatterieMid = batterieActive ? (C.batterie.gainMin + C.batterie.gainMax)/2 : 0;

  // ---- BLOC 7 — EMS (INDICATIF) ----
  const gainEMSmid = factureEnergie * (C.ems.partFactureMin + C.ems.partFactureMax)/2;

  // ---- BLOC 8 — CEE / aides ----
  const aidesTotal = aideIRVE + primePV;

  // ---- BLOC 9 — CO₂ ----
  const litresEvites = elecable.vp*litres('vp') + elecable.vul*litres('vul') + elecable.pl*litres('pl');
  const kwhAjoutes   = elecable.vp*kwh('vp')    + elecable.vul*kwh('vul')    + elecable.pl*kwh('pl');
  const co2Actuel = (nb.vp*litres('vp') + nb.vul*litres('vul') + nb.pl*litres('pl')) * C.co2.kgParLitreGazole / 1000; // t
  const co2EviteFlotte = (litresEvites*C.co2.kgParLitreGazole - kwhAjoutes*C.co2.kgParKWhElec) / 1000;
  const co2EvitePV = autoKWh * C.co2.kgParKWhReseauEvitePV / 1000;
  const co2Evite = Math.max(0, co2EviteFlotte + co2EvitePV);
  const co2Apres = Math.max(0, co2Actuel - co2Evite);
  const co2Pct   = co2Actuel ? co2Evite / co2Actuel : 0;

  // ---- Synthèse financière ----
  // Gains « solides » (défendables) mis en avant :
  const gainSolide = gainFlotte + gainAEN + gainEnergie + gainPV;
  // Potentiel additionnel indicatif (batterie + EMS) — présenté à part :
  const gainIndicatif = gainBatterieMid + gainEMSmid;
  const gainGlobal = gainSolide;                     // le chiffre « choc » reste défendable
  const investissement = investIRVE + investPV;
  const investNet = Math.max(0, investissement - aidesTotal);
  const roiAns = gainGlobal > 0 ? investNet / gainGlobal : 0;

  // ---- BLOC 10 — Score OTONOM (heuristique /100) ----
  const P = C.score.axePoints;
  // Actuel = ce qui est DÉJÀ exploité aujourd'hui
  const sMobiliteNow = P * partDeja;
  const sEnergieNow  = P * 0.30;   // tarif rarement optimisé, pas de PV
  const sInfraNow    = P * partDeja * 0.5;
  const sDecarbNow   = P * partDeja;
  const scoreActuel  = Math.round(sMobiliteNow + sEnergieNow + sInfraNow + sDecarbNow);
  // Potentiel atteignable avec OTONOM
  const sMobilitePot = P * tauxElec;
  const sEnergiePot  = P * (surface>0 ? 0.9 : 0.7);
  const sInfraPot    = P * (nbElecable>0 ? 0.85 : 0.4);
  const sDecarbPot   = P * clampNum(co2Pct*1.4, 0, 1);
  const scorePotentiel = Math.round(sMobilitePot + sEnergiePot + sInfraPot + sDecarbPot);

  return {
    entrees: { nbVeh, nb, kmAn, partDeja, nbSites, nbCollab, pSouscr, consoKWh, surface },
    flotte: { tauxElec, nbElecable, budgetCarbActuel, budgetCarbFutur, gainCarburant, gainEntretien, gainTAI, gainFlotte },
    aen: { nbVEsalaries, gainAEN },
    energie: { consoKWh, factureEnergie, gainEnergie },
    pv: { kWc, prodKWh, autoKWh, gainPV, investPV, primePV, actif: surface>0 },
    irve: { nbPoints, nb7, nb22, investIRVE, aideIRVE },
    batterie: { actif: batterieActive, gainMin: C.batterie.gainMin, gainMax: C.batterie.gainMax, gainMid: gainBatterieMid },
    ems: { gainMid: gainEMSmid, pctMin: C.ems.partFactureMin, pctMax: C.ems.partFactureMax },
    aides: { total: aidesTotal, irve: aideIRVE, pv: primePV },
    co2: { actuel: co2Actuel, apres: co2Apres, evite: co2Evite, pct: co2Pct },
    synth: { gainGlobal, gainSolide, gainIndicatif, investissement, investNet, roiAns },
    score: { actuel: scoreActuel, potentiel: scorePotentiel, objectif: C.score.objectif }
  };
}

/* ══════════════════════════════════════════════════════════════════════════
   4) RENDU — injecte les résultats dans la page (N&B, sobre, éditorial)
   ══════════════════════════════════════════════════════════════════════════ */
function tonnes(v){ return nf0.format(Math.round(v)) + ' t'; }
function tag(kind){
  const map = {
    calc:  ['Calculé', 'sim-tag--calc'],
    hyp:   ['Hypothèse', 'sim-tag--hyp'],
    ind:   ['Estimation indicative', 'sim-tag--ind'],
    audit: ['À affiner en audit', 'sim-tag--audit']
  };
  const [txt, cls] = map[kind] || map.calc;
  return '<span class="sim-tag ' + cls + '">' + txt + '</span>';
}
function bloc(num, titre, kind, corps){
  return '<article class="sim-block">'
    + '<header class="sim-block-h"><span class="sim-block-n">' + num + '</span>'
    + '<h3>' + titre + '</h3>' + tag(kind) + '</header>'
    + '<div class="sim-block-b">' + corps + '</div></article>';
}
function kv(label, val, strong){
  return '<div class="sim-kv"><span>' + label + '</span><b class="tabnum' + (strong?' is-strong':'') + '">' + val + '</b></div>';
}

function rendre(r){
  // ---------- SYNTHÈSE (mise en avant, gratuite) ----------
  const synth = document.getElementById('simSynth');
  synth.innerHTML =
    '<div class="sim-hero-metric">'
      + '<span class="sim-hero-label">Argent laissé sur la table<em>chaque année</em></span>'
      + '<div class="sim-hero-num tabnum">' + euros(r.synth.gainGlobal) + '</div>'
      + '<p class="sim-hero-sub">Économies annuelles potentielles aujourd\'hui non exploitées — ordre de grandeur indicatif, affiné lors de l\'audit.</p>'
    + '</div>'
    + '<div class="sim-metrics">'
      + metric('Gain annuel estimé', euros(r.synth.gainGlobal))
      + metric('Investissement estimé', euros(r.synth.investissement))
      + metric('Aides mobilisables', euros(r.aides.total))
      + metric('Retour sur investissement', (r.synth.roiAns>0 ? r.synth.roiAns.toFixed(1).replace('.',',')+' an'+(r.synth.roiAns>=2?'s':'') : '—'))
      + metric('CO₂ évité', tonnes(r.co2.evite) + '/an')
    + '</div>'
    + scoreBlock(r.score);

  // ---------- POTENTIEL ADDITIONNEL INDICATIF ----------
  let extra = '';
  if (r.batterie.gainMid>0 || r.ems.gainMid>0){
    const lo = r.batterie.gainMin + Math.round(r.ems.gainMid*0.8);
    const hi = r.batterie.gainMax + Math.round(r.ems.gainMid*1.2);
    extra = '<p class="sim-extra">+ potentiel additionnel indicatif (stockage batterie & pilotage EMS) : '
      + '<b class="tabnum">' + euros(lo) + ' à ' + euros(hi) + '/an</b> — à qualifier en audit.</p>';
  }
  document.getElementById('simExtra').innerHTML = extra;

  // ---------- DÉTAIL DES 10 BLOCS ----------
  const b = [];
  b.push(bloc('01', 'Audit flotte', 'calc',
      '<p class="sim-lead"><b class="tabnum">' + Math.round(r.flotte.tauxElec*100) + '%</b> de la flotte électrifiable, soit <b class="tabnum">' + nf0.format(Math.round(r.flotte.nbElecable)) + '</b> véhicules.</p>'
    + kv('Budget carburant aujourd\'hui', euros(r.flotte.budgetCarbActuel))
    + kv('Budget carburant après transition', euros(r.flotte.budgetCarbFutur))
    + kv('Gain carburant', euros(r.flotte.gainCarburant), true)
    + kv('Gain entretien', euros(r.flotte.gainEntretien))
    + (r.flotte.gainTAI>0 ? kv('Évitement taxe incitative (TAI)', euros(r.flotte.gainTAI)) : '')));

  b.push(bloc('02', 'Avantage en nature (AEN)', 'hyp',
      '<p class="sim-lead"><b class="tabnum">' + nf0.format(Math.round(r.aen.nbVEsalaries)) + '</b> VE de fonction éligibles à l\'abattement de 70 %.</p>'
    + kv('Gain AEN estimé', euros(r.aen.gainAEN), true)));

  b.push(bloc('03', 'Infrastructure de recharge (IRVE)', 'calc',
      '<p class="sim-lead">Besoin estimé : <b class="tabnum">' + r.irve.nb7 + '</b> points 7 kW · <b class="tabnum">' + r.irve.nb22 + '</b> points 22 kW.</p>'
    + kv('Investissement IRVE', euros(r.irve.investIRVE))
    + kv('Aides (ADVENIR)', euros(r.irve.aideIRVE))
    + kv('Reste à charge', euros(r.irve.investIRVE - r.irve.aideIRVE), true)));

  b.push(bloc('04', 'Énergie — optimisation du contrat', 'calc',
      '<p class="sim-lead">Consommation estimée : <b class="tabnum">' + nf0.format(Math.round(r.energie.consoKWh/1000)) + ' MWh</b>/an.</p>'
    + kv('Facture énergie actuelle', euros(r.energie.factureEnergie))
    + kv('Gain par mise en concurrence', euros(r.energie.gainEnergie), true)));

  b.push(bloc('05', 'Photovoltaïque', r.pv.actif ? 'calc' : 'audit',
      r.pv.actif
        ? '<p class="sim-lead"><b class="tabnum">' + nf0.format(Math.round(r.pv.kWc)) + ' kWc</b> installables · production <b class="tabnum">' + nf0.format(Math.round(r.pv.prodKWh/1000)) + ' MWh</b>/an.</p>'
          + kv('Gain autoconsommation', euros(r.pv.gainPV), true)
          + kv('Investissement', euros(r.pv.investPV))
          + kv('Prime autoconsommation', euros(r.pv.primePV))
        : '<p class="sim-lead sim-muted">Renseignez une surface de toiture pour estimer le potentiel solaire.</p>'));

  b.push(bloc('06', 'Stockage batterie', 'ind',
      r.batterie.actif
        ? '<p class="sim-lead">Effacement · peak shaving · recharge pilotée.</p>'
          + kv('Gain annuel indicatif', euros(r.batterie.gainMin) + ' à ' + euros(r.batterie.gainMax), true)
        : '<p class="sim-lead sim-muted">Pertinent au-delà d\'un certain volume de consommation — à qualifier en audit.</p>'));

  b.push(bloc('07', 'Pilotage énergétique (EMS)', 'ind',
      '<p class="sim-lead">Délestage, optimisation de la recharge, effacement.</p>'
    + kv('Économie sur la facture énergie', Math.round(r.ems.pctMin*100) + ' à ' + Math.round(r.ems.pctMax*100) + '%')
    + kv('Gain annuel indicatif', euros(r.ems.gainMid), true)));

  b.push(bloc('08', 'CEE & aides mobilisables', 'calc',
      kv('Aide IRVE (ADVENIR)', euros(r.aides.irve))
    + kv('Prime photovoltaïque', euros(r.aides.pv))
    + kv('Total aides estimées', euros(r.aides.total), true)));

  b.push(bloc('09', 'Empreinte CO₂', 'calc',
      '<p class="sim-lead">Aujourd\'hui <b class="tabnum">' + tonnes(r.co2.actuel) + '</b> → après projet <b class="tabnum">' + tonnes(r.co2.apres) + '</b>.</p>'
    + kv('CO₂ évité par an', tonnes(r.co2.evite), true)
    + kv('Réduction', Math.round(r.co2.pct*100) + '%')));

  b.push(bloc('10', 'Score OTONOM', 'hyp',
      '<p class="sim-lead">Indice de maturité énergétique sur 100.</p>'
    + kv('Score actuel', r.score.actuel + '/100')
    + kv('Potentiel avec OTONOM', r.score.potentiel + '/100', true)
    + kv('Objectif cible', r.score.objectif + '/100')));

  document.getElementById('simBlocks').innerHTML = b.join('');
}

function metric(label, val){
  return '<div class="sim-metric"><span class="sim-metric-l">' + label + '</span>'
    + '<b class="sim-metric-v tabnum">' + val + '</b></div>';
}
function scoreBlock(s){
  const pct = clampNum(s.actuel, 0, 100);
  const potPct = clampNum(s.potentiel, 0, 100);
  return '<div class="sim-score">'
    + '<div class="sim-score-head"><span class="sim-metric-l">Score OTONOM</span>'
      + '<span class="sim-score-now tabnum">' + s.actuel + '<em>/100</em></span></div>'
    + '<div class="sim-score-rail">'
      + '<span class="sim-score-fill" style="width:' + pct + '%"></span>'
      + '<span class="sim-score-target" style="left:' + s.objectif + '%" title="Objectif ' + s.objectif + '"></span>'
    + '</div>'
    + '<div class="sim-score-legend"><span>Aujourd\'hui ' + s.actuel + '</span>'
      + '<span>Potentiel ' + s.potentiel + ' · objectif ' + s.objectif + '</span></div>'
  + '</div>';
}

/* ══════════════════════════════════════════════════════════════════════════
   5) CAPTURE EMAIL — résumé envoyé à OTONOM (réutilise contact.php en AJAX)
   ══════════════════════════════════════════════════════════════════════════ */
function resumeMessage(r) {
  const e = r.entrees;
  const L = [
    '— DIAGNOSTIC SIMULATEUR (estimations indicatives) —',
    '',
    'Argent laissé sur la table : ' + euros(r.synth.gainGlobal) + '/an',
    'Gain annuel estimé        : ' + euros(r.synth.gainGlobal),
    'Investissement estimé     : ' + euros(r.synth.investissement),
    'Aides mobilisables        : ' + euros(r.aides.total),
    'ROI                       : ' + (r.synth.roiAns > 0 ? r.synth.roiAns.toFixed(1).replace('.', ',') + ' an' : '—'),
    'CO2 évité                 : ' + tonnes(r.co2.evite) + '/an',
    'Score OTONOM              : ' + r.score.actuel + '/100 → potentiel ' + r.score.potentiel + '/100',
    '',
    'Saisie : ' + nf0.format(e.nbVeh) + ' véhicules · ' + nf0.format(e.kmAn) + ' km/an · '
      + nf0.format(e.nbSites) + ' site(s) · ' + nf0.format(e.nbCollab) + ' collaborateurs',
    'Énergie : ' + nf0.format(Math.round(e.consoKWh / 1000)) + ' MWh/an · ' + nf0.format(e.pSouscr) + ' kVA · toiture ' + nf0.format(e.surface) + ' m²',
    '',
    'Détail : flotte ' + euros(r.flotte.gainFlotte) + ' · AEN ' + euros(r.aen.gainAEN)
      + ' · énergie ' + euros(r.energie.gainEnergie) + ' · PV ' + euros(r.pv.gainPV)
  ];
  return L.join('\n');
}

/* ══════════════════════════════════════════════════════════════════════════
   6) BRANCHEMENT
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  const form = document.getElementById('simForm');
  if (!form) return;

  let SIM_LAST = null;       // dernier résultat calculé
  let SIM_UNLOCKED = false;  // détail déverrouillé après capture email

  function afficherDetail() {
    document.getElementById('simGate').hidden = true;
    const d = document.getElementById('simDetail');
    d.hidden = false;
    d.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const r = calculer();
    SIM_LAST = r;
    rendre(r);

    // Synthèse gratuite toujours visible ; détail derrière la capture email
    document.getElementById('simGate').hidden = SIM_UNLOCKED;
    document.getElementById('simDetail').hidden = !SIM_UNLOCKED;
    if (SIM_UNLOCKED) afficherDetail();

    const out = document.getElementById('simResults');
    out.hidden = false;
    out.classList.add('is-in');
    out.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ---- Gate : envoi du lead puis déverrouillage ----
  const gate = document.getElementById('simGateForm');
  if (gate) gate.addEventListener('submit', function (e) {
    e.preventDefault();
    const err = document.getElementById('gError');
    err.hidden = true;
    if (!gate.checkValidity()) { gate.reportValidity(); return; }
    if (!SIM_LAST) return;

    const btn = gate.querySelector('button[type=submit]');
    const label = btn.innerHTML;
    btn.disabled = true; btn.textContent = 'Envoi…';

    const fd = new FormData(gate);
    fd.append('_ajax', '1');
    fd.append('_contexte', 'simulateur');
    fd.append('Message', resumeMessage(SIM_LAST));

    fetch('contact.php', { method: 'POST', body: fd, headers: { 'Accept': 'application/json' } })
      .then(res => res.json())
      .then(data => {
        if (data && data.ok) {
          SIM_UNLOCKED = true;
          afficherDetail();
          document.getElementById('simDetail').scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else { throw new Error('refus'); }
      })
      .catch(() => {
        btn.disabled = false; btn.innerHTML = label;
        err.hidden = false;
      });
  });

  // ---- Bouton PDF (impression navigateur) ----
  const printBtn = document.getElementById('simPrint');
  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

  // ---- Repli optionnel « affiner » ----
  const more = document.querySelector('.sim-more-toggle');
  if (more) more.addEventListener('click', function () {
    const box = document.getElementById('simMore');
    const open = box.hasAttribute('hidden');
    if (open) box.removeAttribute('hidden'); else box.setAttribute('hidden', '');
    more.setAttribute('aria-expanded', String(open));
  });
})();
