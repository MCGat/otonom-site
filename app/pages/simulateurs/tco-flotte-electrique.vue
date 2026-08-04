<template>
  <section class="page-intro section--light"><div class="wrap">
    <span class="kicker reveal">Simulateur de TCO flotte électrique</span>
    <h1 class="reveal">Ce que votre flotte électrique coûte vraiment&nbsp;: bornes comprises.</h1>
    <p class="lede reveal">Le coût total de possession de votre flotte sur 3 à 5&nbsp;ans, <strong>infrastructure de recharge et raccordement inclus</strong>, comparé à la même flotte restée thermique. Et le moment précis où vous devenez gagnant.</p>
    <p class="sim-note reveal">Résultats en <strong>ordres de grandeur indicatifs</strong> — à confirmer lors de votre audit gratuit.</p>
  </div></section>

  <!-- FORMULAIRE -->
  <section class="section section--tight"><div class="wrap">
    <form class="sim-form" novalidate @submit.prevent="onCalculer">
      <fieldset class="sim-fieldset reveal">
        <legend class="sim-legend"><span class="sim-legend-n">01</span> Votre flotte</legend>
        <div class="sim-grid">
          <div class="field" :class="{ 'is-invalid': erreurs.nbVehicules }">
            <label for="nbVeh">Véhicules à électrifier <span class="req" aria-hidden="true">*</span></label>
            <input id="nbVeh" v-model.number="f.nbVehicules" type="number" min="1" max="2000" step="1" inputmode="numeric" placeholder="ex. 30"
                   :aria-invalid="!!erreurs.nbVehicules" @input="erreurs.nbVehicules = ''">
            <span v-if="erreurs.nbVehicules" class="tco-err">{{ erreurs.nbVehicules }}</span>
          </div>
          <div class="field">
            <label for="cat">Type dominant</label>
            <select id="cat" v-model="f.categorie">
              <option v-for="(l, k) in LABELS_CATEGORIE" :key="k" :value="k">{{ l }}</option>
            </select>
          </div>
          <div class="field" :class="{ 'is-invalid': erreurs.kmAn }">
            <label for="km">Kilométrage annuel <small>(par véhicule)</small> <span class="req" aria-hidden="true">*</span></label>
            <input id="km" v-model.number="f.kmAn" type="number" min="1000" max="120000" step="1000" inputmode="numeric" placeholder="ex. 25 000"
                   :aria-invalid="!!erreurs.kmAn" @input="erreurs.kmAn = ''">
            <span v-if="erreurs.kmAn" class="tco-err">{{ erreurs.kmAn }}</span>
          </div>
          <div class="field">
            <label for="duree">Durée de détention</label>
            <select id="duree" v-model.number="f.dureeMois">
              <option :value="36">36 mois</option><option :value="48">48 mois</option><option :value="60">60 mois</option>
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset class="sim-fieldset reveal">
        <legend class="sim-legend"><span class="sim-legend-n">02</span> Financement &amp; recharge</legend>
        <div class="sim-grid">
          <div class="field">
            <label for="fin">Mode de financement</label>
            <select id="fin" v-model="f.financement">
              <option v-for="(l, k) in LABELS_FINANCEMENT" :key="k" :value="k">{{ l }}</option>
            </select>
          </div>
          <div class="field">
            <label for="prof">Organisation de la recharge</label>
            <select id="prof" v-model="f.profilRecharge">
              <option v-for="(l, k) in LABELS_PROFIL" :key="k" :value="k">{{ l }}</option>
            </select>
          </div>
        </div>
        <label v-if="f.financement === 'loa'" class="tco-optin">
          <input v-model="f.optionAchatLevee" type="checkbox"> Je prévois de lever l'option d'achat en fin de contrat
        </label>
        <template v-if="enLocation">
          <p class="sim-field-help">Un loyer comprend souvent des services. Cochez ce qu'il inclut, sinon ces postes seraient comptés deux fois.</p>
          <div class="tco-checks">
            <label><input v-model="inclut.entretien" type="checkbox"> Entretien inclus</label>
            <label><input v-model="inclut.pneus" type="checkbox"> Pneumatiques inclus</label>
            <label><input v-model="inclut.assurance" type="checkbox"> Assurance incluse</label>
          </div>
        </template>
      </fieldset>

      <div class="sim-actions reveal">
        <button type="submit" class="btn btn--primary btn--lg">
          Calculer mon TCO
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
        <p class="sim-hint">Calcul immédiat dans votre navigateur — aucune donnée transmise à ce stade.</p>
        <p v-if="erreurGlobale" class="tco-err tco-err--form" role="alert">{{ erreurGlobale }}</p>
      </div>
    </form>
  </div></section>

  <!-- RÉSULTATS -->
  <section v-if="r" id="tcoResults" ref="resultsEl" class="section section--light"><div class="wrap">
    <div class="sim-print-head print-only" aria-hidden="true">
      <span class="sim-print-brand">OTONOM</span>
      <span class="sim-print-meta">TCO flotte électrique · estimation indicative · otonom.fr</span>
    </div>
    <div class="sec-head"><span class="kicker">Votre résultat</span><h2>Ce que l'électrique change, véhicule par véhicule.</h2></div>

    <div class="v2-grid">
        <div class="v2-hero">
        <span class="v2-eyebrow">Passer un véhicule à l'électrique</span>
        <div class="v2-num tabnum">{{ eurosExact(Math.abs(v2.economieAnParVeh)) }}</div>
        <p class="v2-sub">
          {{ v2.economieAnParVeh >= 0 ? "d'économies" : 'de surcoût' }}
          <b>chaque année</b>, <b>pour un seul véhicule</b>
        </p>

        <span class="v2-badge" :class="{ 'is-neg': v2.economieAnParVeh < 0 }">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path v-if="v2.economieAnParVeh >= 0" d="M20 6L9 17l-5-5" />
            <path v-else d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          </svg>
          Coût total {{ v2.economieAnParVeh >= 0 ? 'réduit' : 'augmenté' }} de {{ v2.pct }}&nbsp;% face au {{ v2.libelleTherm.toLowerCase() }}
        </span>

        <p class="v2-note">Différence de <b>coût complet</b> entre les deux motorisations, sur une année pleine. Le détail juste en dessous.</p>
        </div>

        <!-- Comparaison des deux motorisations -->
        <div class="v2-compare">
        <div class="v2-card">
          <span class="v2-card-l">Si vous restez en {{ v2.libelleTherm.toLowerCase() }}</span>
          <b class="v2-card-v tabnum">{{ eurosExact(v2.anTherm) }}</b>
          <em>par an, pour un véhicule</em>
          <span class="v2-card-an tabnum">soit {{ eurosExact(v2.moisTherm) }} par mois</span>
        </div>
        <div class="v2-card" :class="{ 'is-best': v2.economieAnParVeh >= 0 }">
          <span v-if="v2.economieAnParVeh >= 0" class="v2-reco">Recommandé</span>
          <span class="v2-card-l">Si vous passez à l'électrique</span>
          <b class="v2-card-v tabnum">{{ eurosExact(v2.anElec) }}</b>
          <em>par an, pour un véhicule</em>
          <span class="v2-card-an tabnum">soit {{ eurosExact(v2.moisElec) }} par mois</span>
        </div>
        </div>

        <!-- D'où sort le total : la multiplication posée à plat -->
        <div class="v2-calc">
        <div class="v2-calc-line">
          <div class="v2-calc-t">
            <b class="tabnum">{{ eurosExact(Math.abs(v2.economieAnParVeh)) }}</b>
            <span>par véhicule<br>et par an</span>
          </div>
          <span class="v2-calc-op" aria-hidden="true">×</span>
          <div class="v2-calc-t">
            <b class="tabnum">{{ r.input.nbVehicules }}</b>
            <span>véhicule{{ r.input.nbVehicules! > 1 ? 's' : '' }}</span>
          </div>
          <span class="v2-calc-op" aria-hidden="true">×</span>
          <div class="v2-calc-t">
            <b class="tabnum">{{ r.dureeMois / 12 }}</b>
            <span>an{{ r.dureeMois > 12 ? 's' : '' }} de détention<br>({{ r.dureeMois }} mois)</span>
          </div>
          <span class="v2-calc-op v2-calc-eq" aria-hidden="true">=</span>
          <div class="v2-calc-t is-res">
            <b class="tabnum">{{ euros(Math.abs(r.ecart)) }}</b>
            <span>{{ r.ecart >= 0 ? "d'économies" : 'de surcoût' }}<br>sur toute la flotte</span>
          </div>
        </div>

        <p class="v2-calc-note">
          <span class="v2-calc-l">À financer au départ</span>
          <b class="tabnum">{{ euros(r.investInfraTotal) }}</b>
          de bornes et de travaux — une dépense ponctuelle, pas une économie.
        </p>
        </div>

        <!-- Ce que « coût complet » recouvre, au moment où le lecteur le lit -->
        <p class="v2-legende">
        Ces montants sont le <b>coût complet</b> d'un véhicule&nbsp;: loyer ou acquisition,
        énergie, entretien, pneumatiques, assurance, taxes et quote-part des bornes.
        Ce n'est <b>pas</b> un loyer — celui-ci n'en représente qu'une partie.
        La soustraction tombe juste&nbsp;: {{ eurosExact(v2.anTherm) }} − {{ eurosExact(v2.anElec) }}
        = <b>{{ eurosExact(Math.abs(v2.economieAnParVeh)) }}</b>, le chiffre annoncé plus haut.
        </p>
    </div>

    <p v-if="r.avantagesNonModelises.length" class="tco-prudence">
      <strong>Ce calcul est prudent.</strong>
      <span v-for="(a, k) in r.avantagesNonModelises" :key="k">{{ a }}</span>
    </p>

    <!-- ══ APERÇU FLOUTÉ ══ Le chiffre est offert ; le raisonnement se mérite. -->
    <div class="tco-gated" :class="{ 'is-locked': !unlocked }">
      <div class="tco-gated-body" :aria-hidden="!unlocked ? 'true' : undefined">
        <div class="tco-metrics-plus">
          <span class="kicker">Les indicateurs de décision</span>
          <div class="sim-metrics">
            <div v-for="m in metricsDetail" :key="m.label" class="sim-metric">
              <span class="sim-metric-l">{{ m.label }}</span><b class="sim-metric-v tabnum">{{ m.value }}</b>
              <em v-if="m.hint" class="tco-metric-hint">{{ m.hint }}</em>
            </div>
          </div>
        </div>

    <!-- Scénarios -->
    <div class="tco-scenarios">
      <span class="kicker">Scénarios de sensibilité</span>
      <div class="tco-scen-row">
        <div v-for="s in scenarios" :key="s.cle" class="tco-scen" :class="{ 'is-central': s.cle === 'central' }">
          <span class="sim-metric-l">{{ s.label }}</span>
          <b class="tabnum">{{ euros(Math.abs(s.ecart)) }}</b>
          <em>{{ s.ecart >= 0 ? 'en votre faveur' : 'de surcoût' }}</em>
          <span class="tco-scen-b">bascule&nbsp;: {{ s.bascule }}</span>
        </div>
      </div>
      <p class="tco-stress"><strong>Scénarios de stress OTONOM, non prédictifs.</strong> Ils testent une variation plus forte de la valeur de revente électrique, encore plus incertaine que celle du thermique, ainsi que le prix des véhicules, le prix et le mix de recharge, et le coût des travaux. Aucune probabilité ne leur est attribuée&nbsp;: ils bornent le résultat, ils ne le prédisent pas.</p>
    </div>

    <!-- ÉCONOMIE CUMULÉE -->
    <div class="tco-chart-wrap">
      <div class="tco-chart-head">
        <div>
          <span class="kicker">Votre économie cumulée</span>
          <h3 class="tco-chart-t">{{ titreGraphique }}</h3>
        </div>
        <div class="tco-tabs" role="tablist" aria-label="Lecture du graphique">
          <button type="button" role="tab" :aria-selected="vue === 'eco'" :class="{ active: vue === 'eco' }" @click="vue = 'eco'">Économique</button>
          <button type="button" role="tab" :aria-selected="vue === 'treso'" :class="{ active: vue === 'treso' }" @click="vue = 'treso'">Trésorerie</button>
        </div>
      </div>
      <p class="tco-vue-note">{{ vue === 'eco'
        ? "Lecture économique : l'infrastructure est répartie sur sa durée de vie. C'est la base de comparaison entre deux scénarios."
        : "Lecture trésorerie : l'infrastructure est intégralement payée au départ. C'est elle qui dit quand vous avez récupéré votre argent." }}</p>

      <svg class="tco-chart" :viewBox="`0 0 ${CW} ${CH}`" role="img" :aria-label="chartAlt">
        <defs>
          <pattern id="tcoHachure" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" class="tco-hatch" />
          </pattern>
        </defs>

        <!-- Repères de montant -->
        <g v-for="rep in reperesY" :key="'y' + rep.v">
          <line :x1="PL" :y1="rep.y" :x2="CW - PR" :y2="rep.y" :class="rep.v === 0 ? 'tco-zero' : 'tco-grid'" />
          <text :x="PL - 8" :y="rep.y + 3.5" text-anchor="end" class="tco-ylab">{{ rep.label }}</text>
        </g>

        <!-- Repères d'année -->
        <g v-for="rep in reperesX" :key="'x' + rep.label">
          <line :x1="rep.x" :y1="PT" :x2="rep.x" :y2="CH - PB" class="tco-grid" />
          <text :x="rep.x" :y="CH - PB + 16" text-anchor="middle" class="tco-xlab">{{ rep.label }}</text>
        </g>
        <text :x="PL" :y="CH - PB + 16" text-anchor="start" class="tco-xlab">départ</text>

        <!-- Phase de déficit : ce qui n'est pas encore récupéré -->
        <path v-if="aireDeficit" :d="aireDeficit" class="tco-deficit" />

        <!-- La courbe -->
        <path :d="cheminEconomie" class="tco-line" />

        <!-- Bascule -->
        <g v-if="pointBascule">
          <line :x1="pointBascule.x" :y1="PT" :x2="pointBascule.x" :y2="CH - PB" class="tco-cross" />
          <circle :cx="pointBascule.x" :cy="pointBascule.y" r="4" class="tco-dot" />
          <text :x="pointBascule.x + 8" :y="PT + 12" class="tco-mark">
            gagnant à partir d'ici
          </text>
        </g>

        <!-- Valeur finale -->
        <g v-if="finSerie">
          <circle :cx="finSerie.x" :cy="finSerie.y" r="3" class="tco-dot" />
          <text :x="CW - PR" :y="finSerie.y - 10" text-anchor="end" class="tco-endlab tabnum">{{ fmtEcart(finSerie.v) }}</text>
        </g>
      </svg>

      <p class="tco-chart-note">{{ noteBascule }}</p>

      <details class="tco-alt">
        <summary>Voir cette courbe sous forme de tableau</summary>
        <div class="table-x"><div class="table-x-scroll" tabindex="0" role="region" aria-label="Données de la courbe">
          <table class="tco-table">
            <thead><tr><th>Mois</th><th>Économie cumulée</th></tr></thead>
            <tbody>
              <tr v-for="p in pointsTable" :key="p.mois"><td>{{ p.mois }}</td><td class="tabnum">{{ p.e }}</td></tr>
            </tbody>
          </table>
        </div></div>
      </details>
    </div>

        <template v-if="unlocked">
    <!-- HYPOTHÈSES MODIFIABLES -->
    <div class="tco-hyp">
      <div class="tco-hyp-head">
        <div>
          <span class="kicker">Nos hypothèses</span>
          <h3>Toutes nos hypothèses sont affichées, et toutes sont modifiables.</h3>
          <p class="sim-field-help">Le résultat se recalcule immédiatement. C'est votre calcul, pas le nôtre.</p>
        </div>
        <button v-if="aDesSurcharges" type="button" class="tco-reset" @click="reinitialiser">Rétablir nos valeurs</button>
      </div>

      <div v-for="pan in panneaux" :key="pan.cle" class="tco-panel">
        <button type="button" class="tco-panel-h" :aria-expanded="ouvert === pan.cle" @click="ouvert = ouvert === pan.cle ? '' : pan.cle">
          <span>{{ pan.titre }}</span>
          <span class="tco-panel-n">{{ champsVisibles(pan).length }}</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        <div v-show="ouvert === pan.cle" class="tco-panel-b">
          <p v-if="pan.note" class="sim-field-help tco-panel-note">{{ pan.note }}</p>
          <div class="sim-grid">
            <div v-for="c in champsVisibles(pan)" :key="c.cle" class="field">
              <label :for="'h-' + c.cle">{{ c.label }} <small v-if="c.unite">({{ c.unite }})</small></label>
              <select v-if="c.options" :id="'h-' + c.cle" :value="lire(c)" @change="ecrire(c, ($event.target as HTMLSelectElement).value)">
                <option v-for="(l, k) in c.options" :key="k" :value="k">{{ l }}</option>
              </select>
              <input v-else :id="'h-' + c.cle" type="number" :min="c.min" :max="c.max" :step="c.step"
                     :value="lire(c)" :placeholder="String(c.defaut())"
                     @input="ecrire(c, ($event.target as HTMLInputElement).value)">
              <span v-if="c.aide" class="sim-field-help">{{ c.aide }}</span>
            </div>
          </div>
          <p v-if="pan.cle === 'recharge'" class="tco-mix-total" :class="{ 'is-off': Math.abs(totalMix - 100) > 0.5 }">
            Total du mix&nbsp;: <b class="tabnum">{{ Math.round(totalMix) }} %</b>
            <span v-if="Math.abs(totalMix - 100) > 0.5"> — les parts sont automatiquement ramenées à 100 %.</span>
          </p>
        </div>
      </div>

      <!-- Taxe incitative : panneau conditionnel -->
      <div class="tco-panel">
        <button type="button" class="tco-panel-h" :aria-expanded="ouvert === 'tai'" @click="ouvert = ouvert === 'tai' ? '' : 'tai'">
          <span>Taxe annuelle incitative</span>
          <span class="tco-panel-n">{{ taiActif ? '3' : '—' }}</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        <div v-show="ouvert === 'tai'" class="tco-panel-b">
          <p class="sim-field-help tco-panel-note">Elle ne concerne que les flottes de plus de 100&nbsp;véhicules. Son montant exige vos données de renouvellement&nbsp;: sans elles, nous préférons ne rien chiffrer plutôt qu'annoncer un montant faux.</p>
          <label class="tco-optin"><input v-model="taiActif" type="checkbox"> Ma flotte totale dépasse 100 véhicules et je connais mes données de renouvellement</label>
          <div v-if="taiActif" class="sim-grid">
            <div class="field"><label for="tai1">Flotte totale taxable</label><input id="tai1" v-model.number="tai.flotteTaxable" type="number" min="0" step="10" placeholder="200"></div>
            <div class="field"><label for="tai2">Véhicules à faibles émissions actuels</label><input id="tai2" v-model.number="tai.vfeActuels" type="number" min="0" step="1" placeholder="10"></div>
            <div class="field"><label for="tai3">Taux de renouvellement annuel <small>(%)</small></label><input id="tai3" v-model.number="tai.tauxRenouvellementPct" type="number" min="0" max="100" step="5" placeholder="20"></div>
          </div>
        </div>
      </div>
    </div>

          <div ref="detailEl">

      <div class="sim-detail-top">
        <div class="sim-blocks-head"><span class="kicker">Le détail, poste par poste</span></div>
        <button type="button" class="btn btn--ghost sim-print-btn" @click="printReport">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" /></svg>
          Enregistrer mon rapport
        </button>
      </div>

      <div class="tco-tables">
        <article class="sim-block">
          <header class="sim-block-h"><span class="sim-block-n">01</span><h3>TCO opérationnel</h3><span class="sim-tag sim-tag--calc">Calculé</span></header>
          <p class="tco-scope">Montants cumulés pour <b>{{ r.input.nbVehicules }} véhicules</b> sur <b>{{ r.dureeMois }} mois</b>.</p>
          <div class="table-x"><div class="table-x-scroll" tabindex="0" role="region" aria-label="Décomposition du TCO (défilement horizontal)">
            <table class="tco-table">
              <thead><tr><th>Poste</th><th>Thermique</th><th>Électrique</th><th>Écart</th></tr></thead>
              <tbody>
                <tr v-for="p in postesRows" :key="p.label" :class="{ 'is-total': p.total }">
                  <td>{{ p.label }}</td><td class="tabnum">{{ p.t }}</td><td class="tabnum">{{ p.e }}</td>
                  <td class="tabnum" :class="{ 'is-strong': p.total }">{{ p.d }}</td>
                </tr>
              </tbody>
            </table>
          </div></div>
          <!-- Barres comparatives, une paire par poste -->
          <div class="tco-bars">
            <div v-for="b in barres" :key="b.label" class="tco-bar-row">
              <span class="tco-bar-l">{{ b.label }}</span>
              <div class="tco-bar-pair">
                <div class="tco-bar tco-bar--t" :style="{ width: b.pt + '%' }"><i></i></div>
                <div class="tco-bar tco-bar--e" :style="{ width: b.pe + '%' }"><i></i></div>
              </div>
              <span class="tco-bar-v tabnum">{{ b.max }}</span>
            </div>
            <p class="sim-field-help">Barre pleine&nbsp;: thermique. Barre hachurée&nbsp;: électrique.</p>
          </div>
        </article>

        <article class="sim-block">
          <header class="sim-block-h"><span class="sim-block-n">02</span><h3>Impact fiscal estimé <small>— hors fiscalité de cession</small></h3><span class="sim-tag sim-tag--ind">Estimation indicative</span></header>
          <div class="sim-block-b">
            <p class="sim-lead">Présenté <strong>à part</strong>&nbsp;: le TCO ci-dessus est un coût opérationnel avant impôt. Mélanger les deux produirait un chiffre ni avant ni après impôt. La <strong>fiscalité de cession</strong> (plus ou moins-value à la revente, ajustée des amortissements non déductibles) n'est <strong>pas modélisée</strong>&nbsp;: elle demande une validation comptable.</p>
            <div v-for="row in fiscalRows" :key="row.label" class="sim-kv">
              <span>{{ row.label }}</span><b class="tabnum" :class="{ 'is-strong': row.strong }">{{ row.value }}</b>
            </div>
          </div>
        </article>

        <article v-if="aenRows.length" class="sim-block">
          <header class="sim-block-h"><span class="sim-block-n">03</span><h3>Impact employeur des véhicules de fonction</h3><span class="sim-tag sim-tag--ind">Estimation indicative</span></header>
          <div class="sim-block-b">
            <p class="sim-lead">Volontairement <strong>hors du TCO du véhicule</strong>&nbsp;: sinon une flotte de fonction et une flotte de service ne seraient plus comparables. L'abattement de 70&nbsp;% réservé à l'électrique joue ici, et l'électricité payée par l'employeur n'entre pas dans l'assiette.</p>
            <div v-for="row in aenRows" :key="row.label" class="sim-kv">
              <span>{{ row.label }}</span><b class="tabnum" :class="{ 'is-strong': row.strong }">{{ row.value }}</b>
            </div>
          </div>
        </article>

        <article class="sim-block">
          <header class="sim-block-h"><span class="sim-block-n">04</span><h3>Échéancier de trésorerie</h3><span class="sim-tag sim-tag--calc">Calculé</span></header>
          <div class="sim-block-b">
            <p class="tco-scope">Montants <b>annuels</b>, pour <b>{{ r.input.nbVehicules }} véhicules</b>.</p>
            <p class="sim-lead">Ce que vous décaissez réellement, année par année. La première année porte <strong>tout l'investissement d'infrastructure</strong> — c'est ce que la quote-part économique masque, et ce qu'un directeur financier veut voir.</p>
            <div class="table-x"><div class="table-x-scroll" tabindex="0" role="region" aria-label="Échéancier (défilement horizontal)">
              <table class="tco-table">
                <thead><tr><th>Année</th><th>Investissement</th><th>Coûts thermique</th><th>Coûts électrique</th><th>Produit de cession</th><th>Économie</th><th>Cumul</th></tr></thead>
                <tbody>
                  <tr v-for="l in r.echeancier" :key="l.annee">
                    <td>{{ l.annee }}</td>
                    <td class="tabnum">{{ l.investissement ? euros(l.investissement) : '—' }}</td>
                    <td class="tabnum">{{ euros(l.coutsTherm) }}</td>
                    <td class="tabnum">{{ euros(l.coutsElec) }}</td>
                    <td class="tabnum">{{ l.cessionElec || l.cessionTherm ? '+' + euros(l.cessionElec) : '—' }}</td>
                    <td class="tabnum">{{ fmtEcart(l.economie) }}</td>
                    <td class="tabnum is-strong">{{ fmtEcart(l.cumule) }}</td>
                  </tr>
                </tbody>
              </table>
            </div></div>
          </div>
        </article>

        <article class="sim-block">
          <header class="sim-block-h"><span class="sim-block-n">05</span><h3>Infrastructure de recharge</h3><span class="sim-tag sim-tag--audit">À affiner en audit</span></header>
          <div class="sim-block-b">
            <p class="sim-lead">Une borne dure 8 à 10&nbsp;ans, un véhicule 4&nbsp;ans. On n'impute donc au cycle analysé que la <strong>quote-part</strong> correspondante — imputer la totalité est l'erreur qui fait conclure à tort que l'électrique n'est pas rentable.</p>
            <div v-for="row in infraRows" :key="row.label" class="sim-kv">
              <span>{{ row.label }}</span><b class="tabnum" :class="{ 'is-strong': row.strong }">{{ row.value }}</b>
            </div>
          </div>
        </article>
      </div>

      <!-- Méthode & limites -->
      <div class="tco-meta">
        <div class="tco-meta-col">
          <span class="kicker">Notre méthode</span>
          <ul>
            <li>Le calcul est <strong>mensuel</strong>, puis agrégé&nbsp;: une mise en service en cours d'année ne traverse pas des années pleines.</li>
            <li>Chaque mois applique le <strong>barème fiscal de son millésime</strong> — taxes, malus et plafonds évoluent en cours de contrat.</li>
            <li>Les consommations retenues sont <strong>réelles</strong>, pas normalisées&nbsp;: l'écart avec le WLTP atteint 15 à 25&nbsp;%.</li>
            <li>L'énergie facturée intègre les <strong>pertes de charge</strong>&nbsp;: elle dépasse l'énergie réellement stockée.</li>
            <li>La <strong>TVA non récupérable</strong> est portée comme un coût&nbsp;: elle ne l'est ni à l'achat ni en location pour un véhicule de tourisme.</li>
            <li>L'<strong>impôt sur les sociétés</strong> est isolé dans son propre tableau, jamais fondu dans le coût opérationnel.</li>
            <li>En location, le loyer est reconstruit à partir du <strong>prix et de la valeur de revente</strong>, non d'un pourcentage forfaitaire&nbsp;: un véhicule qui se revend moins bien coûte plus cher à louer.</li>
          </ul>
        </div>
        <div class="tco-meta-col">
          <span class="kicker">Les limites de ce simulateur</span>
          <ul>
            <li>Les <strong>valeurs de revente</strong> sont l'hypothèse la plus déterminante et la plus incertaine du calcul.</li>
            <li>Les coûts d'infrastructure dépendent fortement de votre site&nbsp;: distance au tableau électrique, génie civil, raccordement.</li>
            <li v-if="r.millesimesProvisoires.length">Les barèmes {{ r.millesimesProvisoires.join(', ') }} ne sont pas encore publiés&nbsp;: ils sont reconduits à titre provisoire.</li>
            <li v-if="!taiActif">La <strong>taxe annuelle incitative</strong> n'est pas chiffrée&nbsp;: son montant exige vos données de renouvellement de flotte.</li>
            <li>La <strong>fiscalité de cession</strong> (plus ou moins-value à la revente) n'est pas modélisée.</li>
            <li>Le <strong>taux financier du loueur</strong> est une hypothèse, à calibrer sur des offres réelles.</li>
          </ul>
        </div>
      </div>

      <p class="disclaimer sim-disclaimer">Estimations en ordres de grandeur, établies sur les barèmes des millésimes {{ r.anneeDebut }}–{{ r.anneeFin }}, données à titre indicatif et non contractuel — à confirmer avec votre expert-comptable. Les montants réels dépendent de votre situation et sont affinés lors de l'audit gratuit OTONOM.</p>

      <p class="tco-cross">Vous cherchez une vue plus large — mobilité, recharge <em>et</em> énergie&nbsp;? Passez par le <NuxtLink to="/simulateurs/transition">simulateur de transition</NuxtLink>.</p>

      <div class="cta-block">
        <h2>Transformons ce calcul en trajectoire.</h2>
        <p class="lede">Un échange court pour affiner ces chiffres avec vos données réelles et bâtir votre plan, sans engagement.</p>
        <div class="hero-cta"><NuxtLink class="btn btn--primary btn--lg" to="/contact">Réserver mon audit gratuit <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6" /></svg></NuxtLink></div>
      </div>
          </div>
        </template>
      </div>
    </div>

    <!-- ══ DÉVERROUILLAGE ══ -->
    <div v-if="!unlocked" id="tcoUnlock" class="sim-gate tco-unlock">
      <div class="sim-gate-copy">
        <span class="kicker">Le détail du calcul</span>
        <h3>Vous avez le chiffre. Voici comment il est construit.</h3>
        <p>Un chiffre sans son raisonnement ne convainc personne — surtout pas une direction financière. Laissez vos coordonnées et le détail s'affiche <strong>immédiatement</strong>, ici même.</p>
        <ul class="sim-gate-list">
          <li><b>La décomposition poste par poste</b>, thermique contre électrique, du loyer jusqu'aux bornes</li>
          <li><b>Vos {{ nbHypotheses }} hypothèses, toutes modifiables</b> — prix, revente, énergie, travaux : le calcul devient le vôtre</li>
          <li><b>L'échéancier de trésorerie</b>, année par année, avec le moment où vous récupérez votre avance</li>
          <li><b>L'impact fiscal détaillé</b> et le rapport imprimable au format OTONOM</li>
        </ul>
        <p class="tco-unlock-why">Pourquoi vous demander vos coordonnées&nbsp;? Parce que ces chiffres méritent d'être affinés avec vos données réelles, et que c'est notre métier de le faire avec vous.</p>
      </div>

      <form class="sim-gate-form" novalidate @submit.prevent="sendGate">
        <input v-model="g.honey" type="text" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        <div class="field"><label for="tNom">Nom <span class="req" aria-hidden="true">*</span></label><input id="tNom" v-model="g.nom" type="text" autocomplete="name" required></div>
        <div class="field"><label for="tEmail">Email professionnel <span class="req" aria-hidden="true">*</span></label><input id="tEmail" v-model="g.email" type="email" autocomplete="email" required></div>
        <div class="field"><label for="tEnt">Entreprise</label><input id="tEnt" v-model="g.entreprise" type="text" autocomplete="organization"></div>
        <div class="field"><label for="tTel">Téléphone <small>(facultatif)</small></label><input id="tTel" v-model="g.tel" type="tel" autocomplete="tel"></div>
        <label class="tco-optin"><input v-model="g.optinCommercial" type="checkbox"> J'accepte de recevoir les actualités et offres d'OTONOM <small>(facultatif)</small></label>
        <button type="submit" class="btn btn--primary btn--block btn--lg" :disabled="sending">
          {{ sending ? 'Affichage…' : 'Afficher le détail complet' }}
          <svg v-if="!sending" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
        <p v-if="gateError" class="sim-gate-msg" role="alert">Une erreur est survenue. Réessayez, ou écrivez-nous à <a href="mailto:e.barlet@mc-groupe.com">e.barlet@mc-groupe.com</a>.</p>
        <p class="sim-gate-consent">Affichage immédiat, sans engagement. Vos coordonnées restent confidentielles — <NuxtLink to="/confidentialite">politique de confidentialité</NuxtLink>.</p>
      </form>
    </div>

  </div></section>

</template>

<script setup lang="ts">
import {
  calculerTco, deriverScenario, resumeTco, TCO_CONFIG,
  LABELS_CATEGORIE, LABELS_FINANCEMENT, LABELS_PROFIL,
  type TcoInput, type TcoResult
} from '~/utils/simulateurs/tcoFlotte'
import { euros, eurosExact, ecart as fmtEcart, nombre as nombreFr, corpsLead, SCENARIO_LABELS, type ScenarioKey } from '~/utils/simulateurs/core'

useSeoMeta({
  title: 'Simulateur de TCO flotte électrique — OTONOM | Recharge & infra comprises',
  description: "Calculez le coût total de possession de votre flotte électrique, bornes et raccordement compris, comparé au thermique. Point de bascule, coût au km, impact fiscal."
})

/* ── État ────────────────────────────────────────────────────────────────── */
const f = reactive<TcoInput>({
  categorie: 'compacte', dureeMois: 48, financement: 'lld',
  profilRecharge: 'depot-nuit', complexiteGenieCivil: 'moyenne'
})
const inclut = reactive({ entretien: false, pneus: false, assurance: false })
/** Surcharges d'hypothèses : vides tant que l'utilisateur n'a rien changé. */
const hyp = reactive<Record<string, number | string>>({})
const mix = reactive<Record<string, number>>({})
const tai = reactive({ flotteTaxable: 200, vfeActuels: 10, tauxRenouvellementPct: 20 })
const taiActif = ref(false)
const ouvert = ref('')
const vue = ref<'eco' | 'treso'>('eco')

const erreurs = reactive<Record<string, string>>({})
const erreurGlobale = ref('')

const enLocation = computed(() => f.financement === 'lld' || f.financement === 'loa')

/* ── Panneaux d'hypothèses ───────────────────────────────────────────────── */
interface Champ {
  cle: string; label: string; unite?: string
  min?: number; max?: number; step?: number; aide?: string
  options?: Record<string, string>
  defaut: () => number | string
  mix?: boolean
  /** Masque le champ quand il n'aurait aucun effet — mieux vaut rien qu'un leurre. */
  visible?: () => boolean
}
interface Panneau { cle: string; titre: string; note?: string; champs: Champ[] }

const cat = () => f.categorie || 'compacte'
const profil = () => TCO_CONFIG.profils[f.profilRecharge || 'depot-nuit']
const dureeVR = () => String(f.dureeMois || 48)

/**
 * L'entreprise ne supporte le risque de revente qu'en achat, en crédit, ou en
 * LOA dont l'option est levée. En LLD, ce risque est porté par le loueur :
 * afficher un champ « valeur de revente » y serait un leurre.
 */
const porteLeRisqueRevente = () =>
  f.financement === 'achat' || f.financement === 'credit' ||
  (f.financement === 'loa' && !!f.optionAchatLevee)

const noteRevente = () => porteLeRisqueRevente()
  ? 'Les valeurs de revente sont l\'hypothèse la plus déterminante du calcul, et la plus incertaine. Si votre loueur ou votre revendeur vous en donne, saisissez-les.'
  : 'En location longue durée, le risque de revente est porté par le loueur : la valeur résiduelle n\'entre pas dans votre coût. Les champs correspondants sont donc masqués.'

const panneaux = computed<Panneau[]>(() => [
  {
    cle: 'vehicules', titre: 'Véhicules et prix',
    champs: [
      { cle: 'prixHTElec', label: 'Prix HT — électrique', unite: '€', step: 500, defaut: () => TCO_CONFIG.prix[cat()].elec },
      { cle: 'prixHTTherm', label: 'Prix HT — thermique', unite: '€', step: 500, defaut: () => TCO_CONFIG.prix[cat()].therm },
      { cle: 'consoElec', label: 'Consommation électrique', unite: 'kWh/100 km', step: 0.5, defaut: () => TCO_CONFIG.conso[cat()].elec },
      { cle: 'consoTherm', label: 'Consommation thermique', unite: 'L/100 km', step: 0.1, defaut: () => TCO_CONFIG.conso[cat()].therm },
      { cle: 'co2Therm', label: 'Émissions du thermique', unite: 'g CO₂/km', step: 1, aide: 'Pilote les taxes annuelles et le malus.', defaut: () => TCO_CONFIG.vehicule[cat()].co2 },
      { cle: 'masseTherm', label: 'Masse du thermique', unite: 'kg', step: 50, aide: 'Pilote le malus au poids. Les électriques en sont exonérés.', defaut: () => TCO_CONFIG.vehicule[cat()].masse },
      { cle: 'motorisationTherm', label: 'Motorisation thermique', options: { diesel: 'Diesel', essence: 'Essence', 'hybride-essence': 'Hybride essence', 'hybride-diesel': 'Hybride diesel' }, defaut: () => 'diesel' },
      { cle: 'ptacKg', label: 'PTAC', unite: 'kg', step: 50, aide: 'Rubrique F.2 de la carte grise. Le suramortissement se joue au kilo près : 3 500 kg donne 115 %, 3 499 kg donne 40 %.', defaut: () => TCO_CONFIG.vehicule[cat()].ptac },
      { cle: 'typeUtilitaire', label: 'Type d\'utilitaire', visible: () => f.categorie === 'vul', aide: 'Certains utilitaires sont requalifiés en véhicules de tourisme, et pas de la même façon selon la taxe.', options: { classique: 'Utilitaire classique', 'pickup-5places': 'Pick-up 5 places ou plus', 'camionnette-3rangees': 'Camionnette 3 rangées' }, defaut: () => 'classique' }
    ]
  },
  {
    cle: 'recharge', titre: 'Recharge et énergie',
    note: 'Le mix de recharge est le premier levier d\'optimisation : recharger sur site en heures creuses ou en borne publique rapide change le coût du simple au double.',
    champs: [
      { cle: 'mix.siteHC', label: 'Sur site, heures creuses', unite: '%', min: 0, max: 100, step: 5, mix: true, defaut: () => Math.round((profil().mix.siteHC || 0) * 100) },
      { cle: 'mix.siteHP', label: 'Sur site, heures pleines', unite: '%', min: 0, max: 100, step: 5, mix: true, defaut: () => Math.round((profil().mix.siteHP || 0) * 100) },
      { cle: 'mix.domicile', label: 'Au domicile', unite: '%', min: 0, max: 100, step: 5, mix: true, defaut: () => Math.round((profil().mix.domicile || 0) * 100) },
      { cle: 'mix.publicAC', label: 'Public lent (AC)', unite: '%', min: 0, max: 100, step: 5, mix: true, defaut: () => Math.round((profil().mix.publicAC || 0) * 100) },
      { cle: 'mix.publicDC', label: 'Public rapide (DC)', unite: '%', min: 0, max: 100, step: 5, mix: true, defaut: () => Math.round((profil().mix.publicDC || 0) * 100) },
      { cle: 'prixSiteHC', label: 'Électricité heures creuses', unite: '€/kWh', step: 0.005, defaut: () => TCO_CONFIG.energie.siteHC },
      { cle: 'prixSiteHP', label: 'Électricité heures pleines', unite: '€/kWh', step: 0.005, defaut: () => TCO_CONFIG.energie.siteHP },
      { cle: 'prixDomicile', label: 'Remboursement domicile', unite: '€/kWh', step: 0.01, defaut: () => TCO_CONFIG.energie.domicile },
      { cle: 'prixPublicAC', label: 'Recharge publique AC', unite: '€/kWh', step: 0.01, defaut: () => TCO_CONFIG.energie.publicAC },
      { cle: 'prixPublicDC', label: 'Recharge publique DC', unite: '€/kWh', step: 0.01, defaut: () => TCO_CONFIG.energie.publicDC },
      { cle: 'prixGazole', label: 'Gazole', unite: '€/L', step: 0.05, defaut: () => TCO_CONFIG.energie.gazole },
      { cle: 'prixEssence', label: 'Essence', unite: '€/L', step: 0.05, defaut: () => TCO_CONFIG.energie.essence },
      { cle: 'pertesChargePct', label: 'Pertes de charge', unite: '%', min: 0, max: 40, step: 1, aide: 'L\'énergie facturée dépasse l\'énergie stockée dans la batterie.', defaut: () => Math.round(TCO_CONFIG.energie.pertesCharge * 100) }
    ]
  },
  {
    cle: 'infra', titre: 'Infrastructure de recharge',
    champs: [
      { cle: 'nbSites', label: 'Sites à équiper', min: 1, step: 1, defaut: () => 1 },
      { cle: 'nbPointsForce', label: 'Points de charge', min: 0, step: 1, aide: 'Laissez vide pour un dimensionnement déduit de votre profil de recharge.', defaut: () => Math.ceil((f.nbVehicules || 20) / profil().vehParPoint) },
      { cle: 'coutPointMoyen', label: 'Coût moyen d\'un point', unite: '€', step: 100, defaut: () => TCO_CONFIG.infra.coutPointAC11 },
      { cle: 'complexiteGenieCivil', label: 'Complexité des travaux', options: { simple: 'Simple', moyenne: 'Moyenne', complexe: 'Complexe' }, defaut: () => 'moyenne' },
      { cle: 'supervisionParPointAn', label: 'Supervision', unite: '€/point/an', step: 10, defaut: () => TCO_CONFIG.infra.supervisionParPointAn },
      { cle: 'dureeAmortissementInfraAns', label: 'Durée d\'amortissement', unite: 'ans', min: 1, max: 20, step: 1, aide: 'Sert à calculer la quote-part imputée à ce cycle de véhicules.', defaut: () => TCO_CONFIG.infra.dureeAmortissementAns },
      { cle: 'aideInfra', label: 'Aides mobilisables', unite: '€', step: 500, aide: 'Zéro par défaut : aucune aide générale ne couvre un parking privé d\'entreprise.', defaut: () => 0 }
    ]
  },
  {
    cle: 'usage', titre: 'Coûts d\'usage et revente',
    note: noteRevente(),
    champs: [
      { cle: 'vrElecPct', label: 'Revente électrique', unite: '% du prix neuf', min: 0, max: 90, step: 1, visible: porteLeRisqueRevente, defaut: () => Math.round((TCO_CONFIG.valeurResiduelle.elec[Number(dureeVR())] || 0.33) * 100) },
      { cle: 'vrThermPct', label: 'Revente thermique', unite: '% du prix neuf', min: 0, max: 90, step: 1, visible: porteLeRisqueRevente, defaut: () => Math.round((TCO_CONFIG.valeurResiduelle.therm[Number(dureeVR())] || 0.42) * 100) },
      { cle: 'entretienElec', label: 'Entretien électrique', unite: '€/an', step: 10, defaut: () => TCO_CONFIG.usage.entretienElec },
      { cle: 'entretienTherm', label: 'Entretien thermique', unite: '€/an', step: 10, defaut: () => TCO_CONFIG.usage.entretienTherm },
      { cle: 'assuranceElec', label: 'Assurance électrique', unite: '€/an', step: 10, defaut: () => TCO_CONFIG.usage.assuranceElec },
      { cle: 'assuranceTherm', label: 'Assurance thermique', unite: '€/an', step: 10, defaut: () => TCO_CONFIG.usage.assuranceTherm },
      { cle: 'pneusKmElec', label: 'Pneumatiques électrique', unite: '€/km', step: 0.001, defaut: () => TCO_CONFIG.usage.pneusParKmElec },
      { cle: 'pneusKmTherm', label: 'Pneumatiques thermique', unite: '€/km', step: 0.001, defaut: () => TCO_CONFIG.usage.pneusParKmTherm },
      { cle: 'gestion', label: 'Gestion administrative', unite: '€/an', step: 10, defaut: () => TCO_CONFIG.usage.gestion }
    ]
  },
  {
    cle: 'entreprise', titre: 'Votre entreprise',
    champs: [
      { cle: 'moisDebut', label: 'Mise en service', options: moisOptions(), defaut: () => moisCourant() },
      { cle: 'tauxISPct', label: 'Impôt sur les sociétés', unite: '%', min: 0, max: 50, step: 1, defaut: () => Math.round(TCO_CONFIG.entreprise.tauxIS * 100) },
      { cle: 'chargesPatronalesPct', label: 'Charges patronales', unite: '%', min: 0, max: 80, step: 1, defaut: () => Math.round(TCO_CONFIG.entreprise.chargesPatronales * 100) },
      { cle: 'partFonctionPct', label: 'Véhicules de fonction', unite: '%', min: 0, max: 100, step: 5, aide: 'Déclenche le calcul de l\'avantage en nature.', defaut: () => 0 },
      { cle: 'tauxFinancierPct', label: 'Taux de financement estimatif', unite: '%/an', min: 0, max: 20, step: 0.5, visible: () => enLocation.value, aide: 'Sert à reconstruire le loyer. Ce n\'est pas un taux de marché observé mais une hypothèse à calibrer sur de vraies offres.', defaut: () => Math.round(TCO_CONFIG.financement.tauxFinancierLoueur * 100 * 10) / 10 },
      { cle: 'fraisGestionLoueurMois', label: 'Frais de gestion du loueur', unite: '€/mois', step: 5, visible: () => enLocation.value, defaut: () => TCO_CONFIG.financement.fraisGestionLoueurMois },
      { cle: 'tauxActualisationPct', label: 'Coût du capital', unite: '%/an', min: 0, max: 20, step: 0.5, visible: () => f.financement === 'achat', aide: 'Appliqué au seul achat comptant. Mettez 0 pour le neutraliser.', defaut: () => Math.round(TCO_CONFIG.financement.tauxActualisation * 100) }
    ]
  }
])

/** Champs réellement applicables au mode de financement choisi. */
function champsVisibles(pan: Panneau): Champ[] {
  return pan.champs.filter(c => !c.visible || c.visible())
}

function moisCourant(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
function moisOptions(): Record<string, string> {
  const out: Record<string, string> = {}
  const d = new Date()
  const noms = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
  for (let k = 0; k < 30; k++) {
    const y = d.getFullYear() + Math.floor((d.getMonth() + k) / 12)
    const m = (d.getMonth() + k) % 12
    out[`${y}-${String(m + 1).padStart(2, '0')}`] = `${noms[m]} ${y}`
  }
  return out
}

function lire(c: Champ): number | string {
  if (c.mix) {
    const k = c.cle.slice(4)
    return mix[k] !== undefined ? mix[k]! : (c.defaut() as number)
  }
  return hyp[c.cle] !== undefined ? hyp[c.cle]! : (c.defaut() as number | string)
}

function ecrire(c: Champ, brut: string) {
  if (c.mix) {
    const k = c.cle.slice(4)
    if (brut === '') delete mix[k]
    else mix[k] = Math.max(0, Number(brut))
    return
  }
  if (brut === '') { delete hyp[c.cle]; return }
  hyp[c.cle] = c.options ? brut : Number(brut)
}

/** Nombre d'hypothèses réellement exposées — sert l'argumentaire du mur. */
const nbHypotheses = computed(() => panneaux.value.reduce((n, p) => n + champsVisibles(p).length, 0))

const aDesSurcharges = computed(() => Object.keys(hyp).length > 0 || Object.keys(mix).length > 0)
function reinitialiser() {
  for (const k of Object.keys(hyp)) delete hyp[k]
  for (const k of Object.keys(mix)) delete mix[k]
}

const totalMix = computed(() => {
  const p = profil().mix
  const cles = ['siteHC', 'siteHP', 'domicile', 'publicAC', 'publicDC']
  return cles.reduce((s, k) => s + (mix[k] !== undefined ? mix[k]! : Math.round((p[k] || 0) * 100)), 0)
})

/* ── Assemblage de l'entrée ──────────────────────────────────────────────── */
function entree(): TcoInput {
  const h = hyp as Record<string, any>
  const pct = (k: string) => (h[k] !== undefined ? Number(h[k]) / 100 : undefined)
  const mixSaisi = Object.keys(mix).length
    ? Object.fromEntries(Object.entries(mix).map(([k, v]) => [k, v / 100]))
    : undefined

  return {
    ...f,
    ...Object.fromEntries(Object.entries(h).filter(([k]) => !k.endsWith('Pct'))),
    loyerInclut: enLocation.value ? { ...inclut } : undefined,
    mixRecharge: mixSaisi as TcoInput['mixRecharge'],
    pertesCharge: pct('pertesChargePct'),
    vrElec: pct('vrElecPct'),
    vrTherm: pct('vrThermPct'),
    tauxIS: pct('tauxISPct'),
    chargesPatronales: pct('chargesPatronalesPct'),
    tauxActualisation: pct('tauxActualisationPct'),
    tauxFinancierLoueur: pct('tauxFinancierPct'),
    partVehiculesFonction: pct('partFonctionPct') ?? 0,
    taiDonnees: taiActif.value
      ? { flotteTaxable: tai.flotteTaxable, vfeActuels: tai.vfeActuels, tauxRenouvellement: tai.tauxRenouvellementPct / 100 }
      : undefined
  }
}

/* ── Validation : jamais de résultat sur des données inventées ───────────── */
function valider(): boolean {
  erreurs.nbVehicules = ''
  erreurs.kmAn = ''
  erreurGlobale.value = ''
  const n = f.nbVehicules
  const k = f.kmAn
  if (typeof n !== 'number' || !isFinite(n) || n < 1) erreurs.nbVehicules = 'Indiquez le nombre de véhicules.'
  else if (n > 2000) erreurs.nbVehicules = 'Au-delà de 2 000 véhicules, parlons-en de vive voix.'
  if (typeof k !== 'number' || !isFinite(k) || k < 1000) erreurs.kmAn = 'Indiquez un kilométrage annuel.'
  else if (k > 120000) erreurs.kmAn = 'Kilométrage inhabituel — vérifiez la valeur.'
  const ok = !erreurs.nbVehicules && !erreurs.kmAn
  if (!ok) erreurGlobale.value = 'Complétez les champs signalés pour lancer le calcul sur vos données.'
  return ok
}

const r = ref<TcoResult | null>(null)
const resultsEl = ref<HTMLElement | null>(null)
const detailEl = ref<HTMLElement | null>(null)

function onCalculer() {
  if (!valider()) return
  r.value = calculerTco(entree())
  nextTick(() => resultsEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

/** Les deux champs obligatoires sont-ils toujours renseignés ? */
const saisieValide = computed(() =>
  typeof f.nbVehicules === 'number' && isFinite(f.nbVehicules) && f.nbVehicules >= 1 &&
  typeof f.kmAn === 'number' && isFinite(f.kmAn) && f.kmAn >= 1000
)

// Recalcul immédiat dès qu'une hypothèse change, mais jamais sur des données
// incomplètes : si l'utilisateur efface un champ obligatoire, on gèle le
// résultat précédent plutôt que de le recalculer sur des valeurs inventées.
watch([hyp, mix, f, inclut, tai, taiActif], () => {
  if (r.value && saisieValide.value) r.value = calculerTco(entree())
}, { deep: true })

/* ── Vues dérivées ───────────────────────────────────────────────────────── */
const favorable = computed(() => (r.value?.ecart ?? 0) >= 0)
const pctTxt = computed(() => {
  const p = Math.abs(Math.round((r.value?.ecartPct ?? 0) * 100))
  return (favorable.value ? '−' : '+') + p + ' % de TCO'
})

/**
 * « Non atteinte » serait ambigu sur la bascule kilométrique : l'électrique peut
 * gagner sur TOUTE la plage comme n'y gagner jamais. On dit lequel des deux.
 */
function texteBasculeKm(v: TcoResult): string {
  if (v.basculeKmSens === 'toujours-gagnant') return 'gagnant dès 5 000 km/an'
  if (v.basculeKmSens === 'jamais-gagnant') return 'jamais atteinte sous 80 000 km/an'
  return nombreFr(v.basculeKm!) + ' km/an'
}

function texteBascule(b: { valeur: number | null; atteinte: boolean }): string {
  if (!b.atteinte || b.valeur === null) return 'non atteinte'
  if (b.valeur === 0) return 'dès le 1ᵉʳ mois'
  return `${b.valeur} mois`
}

const titreGraphique = computed(() => {
  const v = r.value
  if (!v) return ''
  const s = serie.value
  const fin = s[s.length - 1] ?? 0
  return fin >= 0
    ? `${euros(fin)} économisés au bout de ${v.dureeMois} mois`
    : `${euros(Math.abs(fin))} de surcoût au bout de ${v.dureeMois} mois`
})

const noteBascule = computed(() => {
  const v = r.value
  if (!v) return ''
  const b = vue.value === 'eco' ? v.basculeEco : v.basculeTreso
  const s = serie.value
  const creux = Math.min(...s, 0)
  if (!b.atteinte) {
    return `Sur ${v.dureeMois} mois, l'économie cumulée ne devient jamais durablement positive avec ces hypothèses.`
  }
  if (b.valeur === 0) {
    return `L'économie est positive dès le premier mois et le reste jusqu'au terme.`
  }
  return creux < 0
    ? `L'avance à financer atteint ${euros(Math.abs(creux))}, puis l'économie cumulée devient positive au mois ${b.valeur} et ne repasse plus dans le rouge.`
    : `L'économie cumulée devient durablement supérieure au thermique au mois ${b.valeur}.`
})

/** Indicateurs de décision, derrière le mur. */
const metricsDetail = computed(() => {
  const v = r.value
  if (!v) return []
  const km = (n: number) => n.toFixed(3).replace('.', ',') + ' €/km'
  return [
    { label: 'Coût au kilomètre', value: km(v.prkElec), hint: 'électrique · thermique ' + km(v.prkTherm) },
    { label: 'Part de l\'infrastructure', value: Math.round(v.partInfra * 100) + ' %', hint: 'dans le TCO électrique' },
    { label: 'Bascule économique', value: texteBascule(v.basculeEco), hint: 'à partir de la mise en service' },
    { label: 'Bascule de trésorerie', value: texteBascule(v.basculeTreso), hint: 'avance d\'infrastructure récupérée' },
    { label: 'Bascule kilométrique', value: texteBasculeKm(v), hint: 'seuil avec vos hypothèses' },
    { label: 'TCO du cycle suivant', value: euros(v.tcoCycleSuivant), hint: `${v.input.nbVehicules} véhicules · sans nouveau décaissement d'infrastructure` },
    { label: 'CO₂ évité', value: v.co2EviteTonnes.toFixed(1).replace('.', ',') + ' t', hint: `flotte entière · ${v.dureeMois} mois` },
    {
      label: 'Économie, par véhicule',
      value: fmtEcart(v.ecart / v.input.nbVehicules!),
      hint: `sur ${v.dureeMois} mois`
    }
  ]
})

const scenarios = computed(() => {
  const base = entree()
  return (['prudent', 'central', 'favorable'] as ScenarioKey[]).map(cle => {
    const x = calculerTco(deriverScenario(base, cle))
    return {
      cle, label: SCENARIO_LABELS[cle], ecart: x.ecart,
      bascule: texteBasculeKm(x)
    }
  })
})

const LIBELLES_POSTES: [keyof TcoResult['elec']['postes'], string][] = [
  ['detention', 'Acquisition ou loyers'],
  ['coutCapital', 'Coût du capital immobilisé'],
  ['energie', 'Énergie'],
  ['entretien', 'Entretien'],
  ['pneus', 'Pneumatiques'],
  ['assurance', 'Assurance'],
  ['taxesAnnuelles', 'Taxes annuelles'],
  ['malus', 'Malus à l\'immatriculation'],
  ['chargesAEN', 'Charges sur avantage en nature'],
  ['taxeIncitative', 'Taxe annuelle incitative'],
  ['gestion', 'Gestion administrative'],
  ['infrastructure', 'Infrastructure de recharge'],
  ['valeurResiduelle', 'Valeur de revente (déduite)']
]

const postesRows = computed(() => {
  const v = r.value
  if (!v) return []
  const rows = LIBELLES_POSTES
    .filter(([k]) => (v.elec.postes[k] as number) || (v.therm.postes[k] as number))
    .map(([k, label]) => {
      const t = (v.therm.postes[k] as number) || 0
      const e = (v.elec.postes[k] as number) || 0
      const signe = k === 'valeurResiduelle' ? -1 : 1
      return { label, t: euros(t), e: euros(e), d: fmtEcart((t - e) * signe), total: false }
    })
  rows.push({
    label: 'TCO opérationnel',
    t: euros(v.therm.tcoOperationnel), e: euros(v.elec.tcoOperationnel),
    d: fmtEcart(v.ecart), total: true
  })
  return rows
})

/** Barres comparatives : une paire par poste, normalisées au poste le plus lourd. */
const barres = computed(() => {
  const v = r.value
  if (!v) return []
  const items = LIBELLES_POSTES
    .filter(([k]) => k !== 'valeurResiduelle')
    .map(([k, label]) => ({
      label,
      t: Math.abs((v.therm.postes[k] as number) || 0),
      e: Math.abs((v.elec.postes[k] as number) || 0)
    }))
    .filter(i => i.t > 0 || i.e > 0)
  const max = Math.max(...items.map(i => Math.max(i.t, i.e)), 1)
  return items.map(i => ({
    label: i.label,
    pt: (i.t / max) * 100,
    pe: (i.e / max) * 100,
    max: euros(Math.max(i.t, i.e))
  }))
})

const fiscalRows = computed(() => {
  const v = r.value
  if (!v) return []
  return [
    { label: 'Économie d\'impôt sur les sociétés — électrique', value: euros(v.elec.impactFiscal), strong: true },
    { label: 'Économie d\'impôt sur les sociétés — thermique', value: euros(v.therm.impactFiscal), strong: false },
    { label: 'Économie perdue au plafond d\'amortissement — électrique', value: euros(v.elec.isPerduPlafond), strong: false },
    { label: 'Économie perdue au plafond d\'amortissement — thermique', value: euros(v.therm.isPerduPlafond), strong: false },
    { label: 'Taxe annuelle incitative évitée', value: v.therm.postes.taxeIncitative === null ? 'non chiffrée' : euros(v.therm.postes.taxeIncitative), strong: false },
    {
      label: 'Suramortissement des véhicules électriques (art. 39 decies A)',
      value: v.input.financement === 'lld'
        ? 'non applicable en LLD — la déduction revient au loueur'
        : v.elec.suramortissement > 0 ? euros(v.elec.suramortissement) : 'non éligible (PTAC < 2,6 t)',
      strong: v.elec.suramortissement > 0
    }
  ]
})

/** Module social, volontairement hors du TCO du véhicule. */
const aenRows = computed(() => {
  const v = r.value
  if (!v || (!v.elec.impactEmployeurAEN && !v.therm.impactEmployeurAEN)) return []
  return [
    { label: 'Charges patronales sur avantage en nature — thermique', value: euros(v.therm.impactEmployeurAEN), strong: false },
    { label: 'Charges patronales sur avantage en nature — électrique', value: euros(v.elec.impactEmployeurAEN), strong: false },
    { label: 'Écart en faveur de l\'électrique', value: fmtEcart(v.therm.impactEmployeurAEN - v.elec.impactEmployeurAEN), strong: true }
  ]
})

const infraRows = computed(() => {
  const v = r.value
  if (!v) return []
  return [
    { label: 'Points de charge estimés', value: `${v.nbPoints} pour ${v.input.nbVehicules} véhicules`, strong: false },
    { label: 'Investissement total à décaisser', value: euros(v.investInfraTotal), strong: true },
    { label: `Quote-part imputée aux ${v.dureeMois} mois`, value: euros(v.elec.postes.infrastructure), strong: false },
    { label: 'Part dans le TCO électrique', value: Math.round(v.partInfra * 100) + ' %', strong: false },
    { label: 'Quote-part restant à amortir sur le cycle suivant', value: euros(v.infraCycleSuivant), strong: false }
  ]
})

/* ── Graphique : l'économie cumulée ──────────────────────────────────────── */

/**
 * On NE trace PAS les deux coûts cumulés : ils ne diffèrent que de 6 à 7 %, donc
 * à l'écran ils se confondent et l'œil ne lit rien. On trace ce que le lecteur
 * veut savoir : **l'économie cumulée** (thermique − électrique), avec sa ligne
 * zéro. Le passage au-dessus de zéro EST le moment où l'entreprise devient
 * gagnante — c'est la question posée, et elle devient lisible d'un coup d'œil.
 */
const CW = 760, CH = 300
const PL = 68, PR = 14, PT = 18, PB = 34   // marges : à gauche pour les montants

const serie = computed<number[]>(() => {
  const v = r.value
  if (!v) return []
  const t = vue.value === 'eco' ? v.therm.cumulEco : v.therm.cumulTreso
  const e = vue.value === 'eco' ? v.elec.cumulEco : v.elec.cumulTreso
  return t.map((x, k) => x - (e[k] ?? 0))
})

const echelle = computed(() => {
  const s = serie.value
  if (!s.length) return { min: 0, max: 1, x: (_: number) => PL, y: (_: number) => CH - PB }
  const brutMin = Math.min(0, ...s)
  const brutMax = Math.max(0, ...s)
  const marge = (brutMax - brutMin) * 0.12 || 1
  const min = brutMin - (brutMin < 0 ? marge : 0)
  const max = brutMax + marge
  const w = CW - PL - PR
  const h = CH - PT - PB
  return {
    min, max,
    x: (i: number) => PL + (i / Math.max(1, s.length - 1)) * w,
    y: (val: number) => PT + h - ((val - min) / (max - min)) * h
  }
})

const yZero = computed(() => echelle.value.y(0))

const cheminEconomie = computed(() => {
  const s = serie.value, E = echelle.value
  if (!s.length) return ''
  return s.map((v, i) => `${i === 0 ? 'M' : 'L'}${E.x(i).toFixed(1)},${E.y(v).toFixed(1)}`).join(' ')
})

/** Aire hachurée sous zéro : la phase où l'entreprise n'a pas encore récupéré. */
const aireDeficit = computed(() => {
  const s = serie.value, E = echelle.value
  if (!s.length) return ''
  const neg = s.map((v, i) => ({ i, v })).filter(p => p.v < 0)
  if (!neg.length) return ''
  const fin = neg[neg.length - 1]!.i
  const pts = s.slice(0, fin + 1).map((v, i) => `${i === 0 ? 'M' : 'L'}${E.x(i).toFixed(1)},${E.y(Math.min(0, v)).toFixed(1)}`).join(' ')
  return `${pts} L${E.x(fin).toFixed(1)},${yZero.value.toFixed(1)} L${E.x(0).toFixed(1)},${yZero.value.toFixed(1)} Z`
})

/** Le mois où l'économie cumulée devient durablement positive. */
const pointBascule = computed(() => {
  const v = r.value
  if (!v) return null
  const b = vue.value === 'eco' ? v.basculeEco : v.basculeTreso
  if (!b.atteinte || b.valeur === null) return null
  const E = echelle.value
  return { mois: b.valeur, x: E.x(b.valeur), y: E.y(serie.value[b.valeur] ?? 0) }
})

/** Repères de montant : le minimum, zéro, et le maximum. */
const reperesY = computed(() => {
  const E = echelle.value
  const s = serie.value
  if (!s.length) return []
  const out = [{ v: Math.max(...s), label: euros(Math.max(...s)) }]
  if (Math.min(...s) < 0) out.push({ v: Math.min(...s), label: euros(Math.min(...s)) })
  out.push({ v: 0, label: '0 €' })
  return out.map(o => ({ ...o, y: E.y(o.v) }))
})

/** Repères d'année, plus parlants qu'une graduation en mois. */
const reperesX = computed(() => {
  const v = r.value
  const s = serie.value
  if (!v || !s.length) return []
  const E = echelle.value
  const out: { x: number; label: string }[] = []
  for (let i = 12; i < s.length; i += 12) {
    out.push({ x: E.x(i), label: `${Math.round(i / 12)} an${i >= 24 ? 's' : ''}` })
  }
  return out
})

const finSerie = computed(() => {
  const s = serie.value
  if (!s.length) return null
  const E = echelle.value
  return { v: s[s.length - 1]!, x: E.x(s.length - 1), y: E.y(s[s.length - 1]!) }
})

const chartAlt = computed(() => {
  const v = r.value
  if (!v) return ''
  const s = serie.value
  const b = vue.value === 'eco' ? v.basculeEco : v.basculeTreso
  return `Économie cumulée ${vue.value === 'eco' ? 'économique' : 'de trésorerie'} sur ${v.dureeMois} mois : `
    + `${euros(s[s.length - 1] ?? 0)} au terme. `
    + (b.atteinte ? `Devient positive au mois ${b.valeur}.` : 'Reste négative sur toute la période.')
    + ' Tableau de données disponible juste en dessous.'
})

const pointsTable = computed(() => {
  const v = r.value
  const s = serie.value
  if (!v || !s.length) return []
  const pas = Math.max(1, Math.round(s.length / 8))
  const out: { mois: number; e: string }[] = []
  for (let i = pas - 1; i < s.length; i += pas) out.push({ mois: i + 1, e: fmtEcart(s[i]!) })
  if (!out.length || out[out.length - 1]!.mois !== s.length) {
    out.push({ mois: s.length, e: fmtEcart(s[s.length - 1]!) })
  }
  return out
})

/* ── V2 : les mêmes résultats, cadrés par véhicule et par an ────────────── */

const LIBELLES_MOTORISATION: Record<string, string> = {
  diesel: 'Diesel', essence: 'Essence',
  'hybride-essence': 'Hybride essence', 'hybride-diesel': 'Hybride diesel'
}

const v2 = computed(() => {
  const val = r.value
  if (!val) {
    return { economieAnParVeh: 0, pct: 0, moisTherm: 0, moisElec: 0, anTherm: 0, anElec: 0, libelleTherm: 'Thermique', lignes: [] as any[] }
  }
  const N = val.input.nbVehicules!
  const ans = val.dureeMois / 12
  const parVehAn = (x: number) => x / N / ans

  const lignes = LIBELLES_POSTES
    .filter(([k]) => (val.elec.postes[k] as number) || (val.therm.postes[k] as number))
    .map(([k, label]) => {
      const t = parVehAn((val.therm.postes[k] as number) || 0)
      const e = parVehAn((val.elec.postes[k] as number) || 0)
      const signe = k === 'valeurResiduelle' ? -1 : 1
      const ecartExact = (t - e) * signe
      return {
        label, t: eurosExact(t), e: eurosExact(e),
        d: (ecartExact >= 0 ? '+' : '−') + eurosExact(Math.abs(ecartExact)), total: false
      }
    })
  const ec = parVehAn(val.ecart)
  lignes.push({
    label: 'Coût total de détention',
    t: eurosExact(parVehAn(val.therm.tcoOperationnel)),
    e: eurosExact(parVehAn(val.elec.tcoOperationnel)),
    d: (ec >= 0 ? '+' : '−') + eurosExact(Math.abs(ec)),
    total: true
  })

  return {
    economieAnParVeh: parVehAn(val.ecart),
    pct: String(Math.abs(Math.round(val.ecartPct * 1000) / 10)).replace('.', ','),
    moisTherm: val.tcoMensuelParVehiculeTherm,
    moisElec: val.tcoMensuelParVehiculeElec,
    anTherm: parVehAn(val.therm.tcoOperationnel),
    anElec: parVehAn(val.elec.tcoOperationnel),
    libelleTherm: LIBELLES_MOTORISATION[val.input.motorisationTherm || 'diesel'] || 'Thermique',
    lignes
  }
})

/* ── Lead ────────────────────────────────────────────────────────────────── */
const unlocked = ref(false)
const g = reactive({ nom: '', email: '', entreprise: '', tel: '', optinCommercial: false, honey: '' })
const sending = ref(false)
const gateError = ref(false)

async function sendGate() {
  if (sending.value || !r.value) return
  if (g.honey) { unlocked.value = true; return }
  gateError.value = false
  sending.value = true
  try {
    const v = r.value
    const res = await $fetch<{ ok: boolean }>('/api/lead', {
      method: 'POST',
      body: corpsLead('tco-flotte', g, resumeTco(v), {
        tcoElec: Math.round(v.elec.tcoOperationnel),
        tcoTherm: Math.round(v.therm.tcoOperationnel),
        ecart: Math.round(v.ecart),
        investInfra: Math.round(v.investInfraTotal),
        nbVehicules: v.input.nbVehicules,
        dureeMois: v.dureeMois,
        hypothesesModifiees: aDesSurcharges.value
      })
    })
    if (res?.ok) {
      unlocked.value = true
      nextTick(() => document.getElementById('tcoResults')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    } else { throw new Error('refus') }
  } catch { gateError.value = true } finally { sending.value = false }
}

function printReport() {
  if (typeof window !== 'undefined') window.print()
}
</script>

<style scoped>
.tco-checks { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 14px; }
.tco-checks label { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; color: var(--muted); cursor: pointer; }
.tco-checks input { width: auto; margin: 0; }

.tco-err { display: block; margin-top: 6px; font-family: var(--ff-mono); font-size: 12px; color: var(--ink); }
.tco-err--form { margin-top: 14px; }
.field.is-invalid input { border-color: var(--ink); box-shadow: inset 0 -2px 0 var(--ink); }

.tco-invest { margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--line); font-size: 14px; color: var(--muted); }
.tco-invest b { color: var(--ink); }
.tco-invest span { color: var(--muted-2); }

/* ── Mur de conversion ──────────────────────────────────────────────────── */
.tco-metrics-plus .sim-metrics { grid-template-columns: repeat(4, 1fr); }
.sim-metric-v { white-space: nowrap; }
@media (max-width: 900px) { .tco-metrics-plus .sim-metrics { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .tco-metrics-plus .sim-metrics { grid-template-columns: 1fr; } }

.tco-metrics-plus { margin-top: 40px; padding-top: 26px; border-top: 1px solid var(--line); }
.tco-metrics-plus .sim-metrics { margin-top: 18px; }

.tco-gated { position: relative; }
.tco-gated.is-locked {
  max-height: 480px;
  overflow: hidden;
  /* Fondu par masque : indépendant de la couleur de fond de la section. */
  -webkit-mask-image: linear-gradient(to bottom, #000 45%, transparent 97%);
  mask-image: linear-gradient(to bottom, #000 45%, transparent 97%);
}
.tco-gated.is-locked .tco-gated-body {
  filter: blur(5px);
  opacity: .62;
  pointer-events: none;
  user-select: none;
}

/* Le mur reprend la carte du formulaire existant (.sim-gate) : bordure, filet
   séparateur et fond différencié côté saisie. On n'ajoute que le nécessaire. */
.tco-unlock { margin-top: -18px; position: relative; z-index: 2; background: var(--bg); }
.tco-unlock .sim-gate-copy > p { margin-top: 14px; }
.tco-unlock-why {
  margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--line-soft);
  font-size: 13px; color: var(--muted-2); line-height: 1.6;
}
.tco-unlock .tco-optin { margin: 2px 0 0; }

@media (max-width: 860px) {
  .tco-gated.is-locked { max-height: 380px; }
}

@media print { .tco-unlock { display: none !important; } }

.tco-scope {
  margin: 0; padding: 12px 20px; border-bottom: 1px solid var(--line-soft);
  font-family: var(--ff-mono); font-size: 11.5px; letter-spacing: .03em; color: var(--muted-2);
}
.tco-scope b { color: var(--ink); font-weight: 400; }

.tco-prudence { margin-top: 28px; padding: 16px 20px; border-left: 2px solid var(--ink); font-size: 14px; color: var(--muted); }
.tco-prudence strong { color: var(--ink); display: block; margin-bottom: 6px; }
.tco-prudence span { display: block; margin-top: 4px; }

.tco-scenarios { margin-top: 48px; padding-top: 28px; border-top: 1px solid var(--line); }
.tco-scen-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--line); border: 1px solid var(--line); margin: 18px 0 14px; }
.tco-scen { background: var(--bg); padding: 18px 20px; display: flex; flex-direction: column; gap: 6px; }
.tco-scen.is-central { background: var(--bg-1); }
.tco-scen b { font-size: clamp(20px, 3vw, 26px); font-family: var(--ff-display); }
.tco-metric-hint { display: block; font-style: normal; font-family: var(--ff-mono); font-size: 11px; color: var(--muted-2); margin-top: 4px; }
.tco-scen-b { font-family: var(--ff-mono); font-size: 11px; color: var(--muted-2); margin-top: 2px; }
.tco-stress { margin-top: 14px; font-size: 13px; color: var(--muted); max-width: 82ch; line-height: 1.6; }
.tco-stress strong { color: var(--ink); }
.tco-scen em { font-style: normal; font-size: 12px; color: var(--muted-2); font-family: var(--ff-mono); }

.tco-chart-wrap { margin-top: 48px; padding-top: 28px; border-top: 1px solid var(--line); }
.tco-chart-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
.tco-chart-t { font-size: clamp(20px, 3vw, 27px); margin-top: 10px; max-width: 22ch; }
.tco-tabs { display: inline-flex; gap: 1px; background: var(--line); border: 1px solid var(--line); }
.tco-tabs button { background: var(--bg); border: 0; padding: 9px 18px; font-family: var(--ff-mono); font-size: 12px; letter-spacing: .04em; color: var(--muted); cursor: pointer; }
.tco-tabs button.active { background: var(--ink); color: var(--bg); }
.tco-vue-note { margin-top: 16px; font-size: 13px; color: var(--muted-2); max-width: 78ch; line-height: 1.6; }
.tco-chart { width: 100%; height: auto; margin-top: 22px; display: block; overflow: visible; }
.tco-grid { stroke: var(--line); stroke-width: 1; }
.tco-zero { stroke: var(--ink); stroke-width: 1; }
.tco-hatch { stroke: var(--line); stroke-width: 1; }
.tco-deficit { fill: url(#tcoHachure); stroke: none; }
.tco-line { fill: none; stroke: var(--ink); stroke-width: 2; stroke-linejoin: round; }
.tco-cross { stroke: var(--muted-2); stroke-width: 1; stroke-dasharray: 2 3; }
.tco-dot { fill: var(--ink); }
.tco-ylab, .tco-xlab { font-family: var(--ff-mono); font-size: 10.5px; fill: var(--muted-2); }
.tco-mark { font-family: var(--ff-mono); font-size: 10.5px; fill: var(--ink); }
.tco-endlab { font-family: var(--ff-display); font-size: 14px; fill: var(--ink); font-weight: 600; }
.tco-chart-note { margin-top: 14px; font-size: 14px; color: var(--muted); max-width: 78ch; line-height: 1.6; }
.tco-alt { margin-top: 16px; }
.tco-alt summary { font-family: var(--ff-mono); font-size: 12px; color: var(--muted); cursor: pointer; }
.tco-alt summary:hover { color: var(--ink); }
.tco-alt .table-x { margin-top: 14px; }

/* Hypothèses */
.tco-hyp { margin-top: 56px; padding-top: 30px; border-top: 1px solid var(--line); }
.tco-hyp-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; flex-wrap: wrap; margin-bottom: 22px; }
.tco-hyp-head h3 { font-size: clamp(19px, 2.6vw, 24px); margin-top: 10px; }
.tco-reset { background: none; border: 1px solid var(--line); border-radius: 999px; padding: 8px 16px; font-family: var(--ff-mono); font-size: 12px; color: var(--muted); cursor: pointer; white-space: nowrap; }
.tco-reset:hover { color: var(--ink); border-color: var(--ink); }
.tco-panel { border: 1px solid var(--line); border-bottom: 0; }
.tco-panel:last-of-type { border-bottom: 1px solid var(--line); }
.tco-panel-h { width: 100%; display: flex; align-items: center; gap: 14px; background: none; border: 0; padding: 16px 20px; text-align: left; cursor: pointer; font-family: var(--ff-display); font-size: 15px; color: var(--ink); }
.tco-panel-h:hover { background: var(--bg-1); }
.tco-panel-h span:first-child { flex: 1; }
.tco-panel-n { font-family: var(--ff-mono); font-size: 11px; color: var(--muted-2); }
.tco-panel-h svg { width: 18px; height: 18px; transition: transform .2s; }
.tco-panel-h[aria-expanded="true"] svg { transform: rotate(180deg); }
.tco-panel-b { padding: 4px 20px 24px; border-top: 1px solid var(--line-soft); }
.tco-panel-note { margin: 14px 0 18px; max-width: 78ch; }
.tco-mix-total { margin-top: 16px; font-family: var(--ff-mono); font-size: 12px; color: var(--muted); }
.tco-mix-total.is-off { color: var(--ink); }

/* Tableaux & barres */
.tco-tables { display: grid; gap: 20px; margin-top: 8px; }
.tco-table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 520px; }
.tco-table th, .tco-table td { text-align: right; padding: 11px 14px; border-bottom: 1px solid var(--line-soft); }
.tco-table th:first-child, .tco-table td:first-child { text-align: left; }
.tco-table thead th { font-family: var(--ff-mono); font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
.tco-table .is-total td { border-top: 1px solid var(--ink); border-bottom: 0; font-weight: 600; padding-top: 14px; }
.tco-table .is-strong { font-weight: 600; }

.tco-bars { padding: 22px 20px 6px; border-top: 1px solid var(--line-soft); }
.tco-bar-row { display: grid; grid-template-columns: minmax(120px, 1.1fr) 3fr auto; gap: 14px; align-items: center; margin-bottom: 12px; }
.tco-bar-l { font-size: 13px; color: var(--muted); }
.tco-bar-pair { display: flex; flex-direction: column; gap: 3px; }
.tco-bar { height: 7px; min-width: 1px; }
.tco-bar--t { background: var(--ink); }
.tco-bar--e { background: repeating-linear-gradient(90deg, var(--ink) 0 3px, transparent 3px 6px); border-bottom: 1px solid var(--ink); }
.tco-bar-v { font-size: 12px; color: var(--muted-2); white-space: nowrap; }

.tco-optin { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: var(--muted); margin: 4px 0 14px; cursor: pointer; }
.tco-optin input { width: auto; margin: 2px 0 0; }
.tco-optin small { color: var(--muted-2); }

.tco-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--line); border: 1px solid var(--line); margin-top: 44px; }
.tco-meta-col { background: var(--bg); padding: 26px 28px; }
.tco-meta ul { margin: 16px 0 0; padding-left: 18px; }
.tco-meta li { font-size: 14px; color: var(--muted); margin-bottom: 9px; line-height: 1.6; }

.tco-cross { margin-top: 28px; font-size: 14px; color: var(--muted); }

@media (max-width: 720px) {
  .tco-scen-row, .tco-meta { grid-template-columns: 1fr; }
  .tco-bar-row { grid-template-columns: 1fr; gap: 5px; }
  .tco-bar-v { justify-self: end; }
}

/* Impression : le rapport doit tenir debout sur papier. */
@media print {
  .tco-hyp, .tco-tabs, .tco-alt, .tco-reset, .tco-cross { display: none !important; }
  .tco-chart-wrap, .tco-scenarios { break-inside: avoid; page-break-inside: avoid; }
  .tco-panel, .sim-block { break-inside: avoid; page-break-inside: avoid; }
  .tco-meta { grid-template-columns: 1fr 1fr; border-color: #000; }
  .tco-table { min-width: 0; font-size: 11px; }
  .tco-table th, .tco-table td { padding: 5px 7px; }
  .table-x-scroll { overflow: visible !important; }
  .tco-bars { display: none !important; }
  .tco-curve { stroke: #000; }
  .tco-scen-row { border-color: #000; }
}
/* ══════════════════ V2 — mise en forme alternative ══════════════════
   Reprend le cadrage « par véhicule, par an » du marché, mais sans
   couleur : le concurrent s'appuie sur un vert d'accent, interdit ici.
   L'accent se fait donc par l'encre pleine, le filet et l'espace. */


.v2-grid { display: grid; gap: 20px; margin-top: clamp(28px, 4vw, 40px); }

/* ── Chiffre principal ── */
.v2-hero {
  background: var(--ink); color: var(--bg);
  border-radius: var(--radius); padding: clamp(28px, 4vw, 44px);
}
.v2-eyebrow {
  display: block; font-family: var(--ff-mono); font-size: 11px;
  letter-spacing: .16em; text-transform: uppercase; opacity: .6;
}
.v2-num {
  font-family: var(--ff-display); font-size: clamp(44px, 8vw, 78px);
  line-height: 1; letter-spacing: -.02em; margin-top: 16px;
}
.v2-sub { margin-top: 10px; font-size: 16px; opacity: .78; }
.v2-sub b { font-weight: 600; opacity: 1; }

.v2-badge {
  display: inline-flex; align-items: center; gap: 9px; margin-top: 24px;
  padding: 9px 16px; border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, .28); background: rgba(255, 255, 255, .07);
  font-size: 13.5px; font-weight: 500;
}
.v2-badge svg { width: 15px; height: 15px; flex: none; }
.v2-badge.is-neg { border-color: rgba(255, 255, 255, .4); }

.v2-note b { opacity: 1; font-weight: 600; }
.v2-note {
  margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, .16);
  font-size: 13px; opacity: .62; line-height: 1.6; max-width: 62ch;
}

/* ── Comparaison des deux motorisations ── */
.v2-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.v2-card {
  position: relative; border: 1px solid var(--line); border-radius: var(--radius);
  padding: clamp(22px, 3vw, 30px); background: var(--bg);
}
.v2-card.is-best { border-color: var(--ink); border-width: 2px; padding: calc(clamp(22px, 3vw, 30px) - 1px); }

.v2-reco {
  position: absolute; top: -11px; left: clamp(20px, 3vw, 28px);
  background: var(--ink); color: var(--bg); border-radius: 999px; padding: 4px 12px;
  font-family: var(--ff-mono); font-size: 10px; letter-spacing: .1em; text-transform: uppercase;
}
.v2-card-l { display: block; font-family: var(--ff-mono); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--muted-2); }
.v2-card-v { display: block; margin-top: 12px; font-family: var(--ff-display); font-size: clamp(26px, 4vw, 38px); line-height: 1; }
.v2-card em { display: block; margin-top: 8px; font-style: normal; font-size: 13px; color: var(--muted-2); }
.v2-card-an { display: block; margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--line-soft); font-size: 13px; color: var(--muted); }

/* ── L'équation : montrer d'où sort le total ── */
.v2-calc { border: 1px solid var(--line); border-radius: var(--radius); background: var(--bg-1); overflow: hidden; }

/* Grille plutôt que flex : « space-between » creusait des écarts inégaux
   entre les termes selon leur largeur. Ici chaque terme occupe la même part. */
.v2-calc-line {
  display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1.15fr;
  align-items: baseline; gap: clamp(8px, 1.6vw, 20px);
  padding: clamp(24px, 3.5vw, 34px) clamp(20px, 3vw, 32px);
}
.v2-calc-t { display: grid; gap: 7px; min-width: 0; }
.v2-calc-t b { font-family: var(--ff-display); font-size: clamp(22px, 3.4vw, 32px); line-height: 1; color: var(--muted); }
.v2-calc-t span { font-family: var(--ff-mono); font-size: 11px; line-height: 1.45; color: var(--muted-2); }

/* Seul le résultat est en encre pleine : l'œil va droit dessus. */
.v2-calc-t.is-res b { color: var(--ink); font-size: clamp(26px, 4.4vw, 42px); }
.v2-calc-t.is-res span { color: var(--muted); }

.v2-calc-op { font-family: var(--ff-mono); font-size: 17px; color: var(--muted-2); align-self: baseline; }
.v2-calc-eq { color: var(--ink); font-size: 20px; }

.v2-calc-note {
  display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap;
  padding: 16px clamp(20px, 3vw, 32px); border-top: 1px solid var(--line);
  font-size: 13px; color: var(--muted-2); line-height: 1.6;
}
.v2-calc-note b { font-family: var(--ff-display); font-size: 17px; color: var(--muted); }
.v2-calc-l { font-family: var(--ff-mono); font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted-2); }

@media (max-width: 780px) {
  /* En colonne, les opérateurs deviennent des séparateurs centrés. */
  .v2-calc-line { grid-template-columns: 1fr; gap: 14px; }
  .v2-calc-t { grid-template-columns: auto 1fr; align-items: baseline; gap: 14px; }
  .v2-calc-t span br { display: none; }
  .v2-calc-op { align-self: flex-start; padding-left: 2px; }
}

/* ── Légende ── */
.v2-legende {
  font-size: 13.5px; color: var(--muted); line-height: 1.7; max-width: 82ch; padding: 0 4px;
}
.v2-legende b { color: var(--ink); font-weight: 600; }

.v2-scale {
  display: grid; gap: 14px;
  padding: 22px 24px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--bg-1);
}
.v2-scale-row { display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap; }
.v2-scale-row.is-sub { padding-top: 14px; border-top: 1px solid var(--line-soft); }
.v2-scale-row.is-sub b { font-size: clamp(17px, 2.4vw, 21px); color: var(--muted); }
.v2-scale-l { min-width: 190px; font-family: var(--ff-mono); font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted-2); }
.v2-scale b { font-family: var(--ff-display); font-size: clamp(20px, 3vw, 26px); color: var(--ink); }
.v2-scale-x { font-size: 13px; color: var(--muted-2); }

@media (max-width: 720px) {
  .v2-compare { grid-template-columns: 1fr; }
  .v2-scale { flex-direction: column; gap: 6px; }
}

@media print { .tco-v2 { display: none !important; } }
</style>
