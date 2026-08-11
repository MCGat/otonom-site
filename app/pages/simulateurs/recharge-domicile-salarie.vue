<template>
  <section class="page-intro section--light"><div class="wrap">
    <span class="kicker reveal">Simulateur de remboursement de recharge à domicile</span>
    <h1 class="reveal">Combien rembourser à un collaborateur qui recharge son véhicule électrique chez lui&nbsp;?</h1>
    <p class="lede reveal">Le coût réel de la recharge à domicile, le montant à rembourser, et le traitement social de ce remboursement — selon votre situation exacte.</p>
    <p class="sim-note reveal">Calcul immédiat dans votre navigateur. <strong>Estimation préalable</strong>, en aucun cas un conseil en paie.</p>
  </div></section>

  <!-- ════════ FORMULAIRE ════════ -->
  <section class="section section--tight"><div class="wrap">
    <form class="sim-form" novalidate @submit.prevent="onCalculer">

      <fieldset class="sim-fieldset reveal">
        <legend class="sim-legend"><span class="sim-legend-n">01</span> À qui appartient le véhicule&nbsp;?</legend>
        <div class="sim-grid">
          <div class="field">
            <label for="prop">Propriétaire du véhicule</label>
            <select id="prop" v-model="f.proprietaire">
              <option value="entreprise">L'entreprise</option>
              <option value="salarie">Le salarié</option>
            </select>
          </div>

          <template v-if="f.proprietaire === 'entreprise'">
            <div class="field">
              <label for="moto">Motorisation</label>
              <select id="moto" v-model="f.motorisation">
                <option value="electrique">100 % électrique</option>
                <option value="hybride-rechargeable">Hybride rechargeable</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div class="field">
              <label for="priv">Usage privé autorisé&nbsp;?</label>
              <select id="priv" v-model="f.usagePrive">
                <option value="oui">Oui — véhicule de fonction</option>
                <option value="non">Non — véhicule de service</option>
              </select>
            </div>
            <div v-if="f.motorisation === 'electrique' && f.usagePrive === 'oui'" class="field">
              <label for="apres">Mis à disposition à compter du 1<sup>er</sup> février 2025&nbsp;?</label>
              <select id="apres" v-model="f.miseADispoApres2025">
                <option v-for="o in TRIPLE" :key="o.v" :value="o.v">{{ o.l }}</option>
              </select>
            </div>
            <div v-if="f.motorisation === 'electrique' && f.usagePrive === 'oui' && f.miseADispoApres2025 === 'oui'" class="field">
              <label for="eco">Éligible au score environnemental&nbsp;?</label>
              <select id="eco" v-model="f.ecoScore">
                <option v-for="o in TRIPLE" :key="o.v" :value="o.v">{{ o.l }}</option>
              </select>
              <span class="rc-aide">Condition du code de l'énergie exigée depuis le 01/02/2025.</span>
            </div>
          </template>

          <template v-else>
            <div class="field">
              <label for="usage">Pour quels trajets&nbsp;?</label>
              <select id="usage" v-model="f.usageSalarie">
                <option value="professionnel">Déplacements professionnels</option>
                <option value="domicile-travail">Trajet domicile-travail</option>
                <option value="les-deux">Les deux</option>
              </select>
            </div>
            <div v-if="f.usageSalarie !== 'domicile-travail'" class="field">
              <label for="mode">Comment remboursez-vous ces déplacements&nbsp;?</label>
              <select id="mode" v-model="f.modeRemboursement">
                <option value="kilometrique">Indemnités kilométriques</option>
                <option value="frais-reels">Frais réels sur justificatifs</option>
              </select>
            </div>
            <div v-if="f.usageSalarie !== 'domicile-travail' && f.modeRemboursement === 'kilometrique'" class="field">
              <label for="cv">Puissance fiscale <small>(CV)</small></label>
              <input id="cv" v-model.number="f.puissanceFiscale" type="number" min="1" max="20" step="1" inputmode="numeric" placeholder="5">
            </div>
            <div v-if="f.usageSalarie !== 'professionnel'" class="field">
              <label for="tp">Abonnement de transports publics déjà pris en charge&nbsp;?</label>
              <select id="tp" v-model="f.abonnementTransportPublic">
                <option v-for="o in TRIPLE" :key="o.v" :value="o.v">{{ o.l }}</option>
              </select>
            </div>
            <div v-if="f.usageSalarie !== 'professionnel'" class="field">
              <label for="raison">Pourquoi le véhicule personnel est-il nécessaire&nbsp;?</label>
              <select id="raison" v-model="f.raisonVehiculePersonnel">
                <option v-for="o in RAISONS" :key="o.v" :value="o.v">{{ o.l }}</option>
              </select>
              <span class="rc-aide">L'article L.&nbsp;3261-3 ne connaît que ces trois situations. La commodité n'en est pas une.</span>
            </div>
          </template>
        </div>
      </fieldset>

      <fieldset class="sim-fieldset reveal">
        <legend class="sim-legend"><span class="sim-legend-n">02</span> Le véhicule et ses kilomètres</legend>
        <div class="sim-grid">
          <div class="field">
            <label for="cat">Catégorie</label>
            <select id="cat" v-model="f.categorie">
              <option value="citadine">Citadine — 15 kWh/100 km</option>
              <option value="compacte">Compacte — 17 kWh/100 km</option>
              <option value="berline">Berline — 20 kWh/100 km</option>
              <option value="vul">Utilitaire léger — 22 kWh/100 km</option>
            </select>
          </div>
          <div class="field" :class="{ 'is-invalid': erreurs.km }">
            <label for="km">{{ labelKm }} <span class="req" aria-hidden="true">*</span></label>
            <input id="km" v-model.number="f.kmAnnuels" type="number" min="100" max="150000" step="500" inputmode="numeric" placeholder="ex. 15 000"
                   :aria-invalid="!!erreurs.km" @input="erreurs.km = ''">
            <span v-if="erreurs.km" class="rc-err">{{ erreurs.km }}</span>
            <span v-if="aideKm" class="rc-aide">{{ aideKm }}</span>
          </div>
          <div class="field">
            <label for="origine">D'où vient la consommation&nbsp;?</label>
            <select id="origine" v-model="f.origineConso">
              <option value="wltp">Consommation homologuée (WLTP)</option>
              <option value="releve">Relevé de borne ou de sous-compteur</option>
              <option value="tableau-de-bord">Consommation lue au tableau de bord</option>
            </select>
            <span class="rc-aide">La valeur WLTP est mesurée à la prise&nbsp;: elle contient déjà les pertes de recharge. Celle du tableau de bord, non.</span>
          </div>
          <div class="field">
            <label for="consoS">Consommation réelle <small>(kWh/100 km, si connue)</small></label>
            <input id="consoS" v-model.number="f.consoSaisie" type="number" min="5" max="60" step="0.5" inputmode="decimal" :placeholder="String(CONFIG.conso[f.categorie])">
          </div>
        </div>
      </fieldset>

      <fieldset class="sim-fieldset reveal">
        <legend class="sim-legend"><span class="sim-legend-n">03</span> Sa recharge à domicile</legend>
        <div class="sim-grid">
          <div class="field">
            <label for="partD">Part rechargée au domicile</label>
            <select id="partD" v-model.number="f.partDomicile">
              <option :value="1">La totalité</option><option :value="0.8">Environ 80 %</option>
              <option :value="0.6">Environ 60 %</option><option :value="0.4">Environ 40 %</option>
              <option :value="0.2">Environ 20 %</option>
            </select>
          </div>
          <div class="field">
            <label for="opt">Son option tarifaire</label>
            <select id="opt" v-model="f.optionTarif">
              <option value="hp-hc">Heures pleines / heures creuses</option>
              <option value="base">Option base</option>
              <option value="saisi">Je saisis son prix du kWh</option>
            </select>
          </div>
          <div v-if="f.optionTarif === 'hp-hc'" class="field">
            <label for="partHC">Part réellement rechargée en heures creuses</label>
            <select id="partHC" v-model.number="f.partHeuresCreuses">
              <option :value="1">La totalité</option><option :value="0.8">Environ 80 %</option>
              <option :value="0.5">Environ la moitié</option><option :value="0.2">Environ 20 %</option>
            </select>
            <span class="rc-aide">Les plages d'heures creuses sont fixées localement et ne sont pas toujours nocturnes.</span>
          </div>
          <div v-if="f.optionTarif === 'saisi'" class="field">
            <label for="prixS">Prix du kWh <small>(€ TTC)</small></label>
            <input id="prixS" v-model.number="f.prixKwhSaisi" type="number" min="0.05" max="1" step="0.001" inputmode="decimal" placeholder="0,1589">
          </div>
        </div>
      </fieldset>

      <fieldset class="sim-fieldset reveal">
        <legend class="sim-legend"><span class="sim-legend-n">04</span> Comment mesurez-vous ces kilowattheures&nbsp;?</legend>
        <div class="sim-grid">
          <div class="field">
            <label for="mes">Mode de mesure</label>
            <select id="mes" v-model="f.mesureDomicile">
              <option value="supervision">Borne communicante et supervision</option>
              <option value="sous-compteur">Sous-compteur dédié</option>
              <option value="estimation">Estimation par les kilomètres</option>
              <option value="aucune">Aucune mesure pour l'instant</option>
            </select>
            <span class="rc-aide">C'est ce qui détermine la solidité de votre justificatif — et, seule la supervision rattache une session à un véhicule donné.</span>
          </div>
          <div v-if="f.mesureDomicile === 'supervision' || f.mesureDomicile === 'sous-compteur'" class="field">
            <label for="kwhM">Kilowattheures relevés sur l'année</label>
            <input id="kwhM" v-model.number="f.kWhMesuresAn" type="number" min="0" max="60000" step="10" inputmode="numeric" placeholder="ex. 2 040">
            <span class="rc-aide">Si vous les saisissez, ils font autorité&nbsp;: le calcul ne repart pas des kilomètres.</span>
          </div>
          <div v-if="f.mesureDomicile === 'supervision'" class="field">
            <label for="supType">Qui souscrit la supervision&nbsp;?</label>
            <select id="supType" v-model="f.typeSupervision">
              <option value="abonnement-salarie">Abonnement rattaché à la borne du salarié</option>
              <option value="plateforme-employeur">Plateforme de flotte souscrite par l'entreprise</option>
            </select>
          </div>
          <div v-if="f.mesureDomicile === 'supervision'" class="field">
            <label for="supPay">Supervision payée par l'employeur&nbsp;?</label>
            <select id="supPay" v-model="f.supervisionPayeeParEmployeur">
              <option v-for="o in TRIPLE" :key="o.v" :value="o.v">{{ o.l }}</option>
            </select>
          </div>
          <div v-if="f.mesureDomicile === 'supervision' && f.supervisionPayeeParEmployeur === 'oui'" class="field">
            <label for="supCout">Abonnement de supervision <small>(€/mois par point)</small></label>
            <input id="supCout" v-model.number="f.coutSupervisionMois" type="number" min="0" max="200" step="1" inputmode="decimal" :placeholder="String(CONFIG.supervisionMois)">
            <span class="rc-aide">Facturé par borne, donc par collaborateur équipé — ce n'est pas un forfait entreprise.</span>
          </div>
          <div class="field">
            <label for="txCh">Charges patronales <small>(%)</small></label>
            <input id="txCh" v-model.number="tauxPct" type="number" min="0" max="80" step="1" inputmode="numeric" placeholder="42">
            <span class="rc-aide">Appliquées à la seule fraction réintégrée. 42 % est une hypothèse modifiable, pas un calcul de paie.</span>
          </div>
        </div>
      </fieldset>

      <fieldset v-if="f.proprietaire === 'entreprise'" class="sim-fieldset reveal">
        <legend class="sim-legend"><span class="sim-legend-n">05</span> La borne au domicile <small>(facultatif)</small></legend>
        <div class="sim-grid">
          <div class="field">
            <label for="bfin">Financée par l'employeur&nbsp;?</label>
            <select id="bfin" v-model="f.borneFinanceeParEmployeur">
              <option v-for="o in TRIPLE" :key="o.v" :value="o.v">{{ o.l }}</option>
            </select>
          </div>
          <template v-if="f.borneFinanceeParEmployeur === 'oui'">
            <div class="field">
              <label for="bcout">Achat et installation <small>(€)</small></label>
              <input id="bcout" v-model.number="f.coutBorne" type="number" min="0" max="20000" step="100" inputmode="numeric" placeholder="ex. 1 500">
            </div>
            <div class="field">
              <label for="bret">Retirée à la fin du contrat&nbsp;?</label>
              <select id="bret" v-model="f.borneRetireeEnFinDeContrat">
                <option v-for="o in TRIPLE" :key="o.v" :value="o.v">{{ o.l }}</option>
              </select>
            </div>
            <div v-if="f.borneRetireeEnFinDeContrat === 'non'" class="field">
              <label for="banc">Ancienneté à la fin du contrat <small>(ans)</small></label>
              <input id="banc" v-model.number="f.ancienneteBorneAns" type="number" min="0" max="20" step="1" inputmode="numeric" placeholder="ex. 3">
            </div>
          </template>
        </div>
      </fieldset>

      <div class="sim-actions reveal">
        <button type="submit" class="btn btn--primary btn--lg">Calculer le remboursement
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
        <p class="sim-hint">Calcul immédiat dans votre navigateur — aucune donnée transmise à ce stade.</p>
        <p v-if="erreurs.form" class="rc-err rc-err--form" role="alert">{{ erreurs.form }}</p>
      </div>
    </form>
  </div></section>

  <!-- ════════ RÉSULTAT ════════ -->
  <section v-if="r" id="rcResults" class="section section--light"><div class="wrap">
    <div class="sec-head"><span class="kicker">Votre résultat</span><h2>Ce que vous avez le droit de rembourser.</h2></div>

    <!-- Le verdict en tête, le montant ensuite. Le calcul du coût est trivial —
         kilomètres × consommation × prix. Ce que ce simulateur apporte, c'est de
         désigner LAQUELLE des sept situations est la vôtre, et ce qu'elle
         autorise. C'est donc elle qui doit occuper la place. -->
    <div class="rc-hero" :class="`is-${r.verdict}`">
      <span class="rc-hero-l">{{ r.libelleBranche }}</span>
      <div class="rc-hero-v">{{ LIBELLE_VERDICT[r.verdict] }}</div>
      <p class="rc-hero-t">{{ r.texteVerdict }}</p>

      <div class="rc-chiffres">
        <div class="rc-chiffre">
          <span class="rc-chiffre-l">Coût pour le salarié</span>
          <b class="rc-chiffre-v tabnum">{{ eurosExact(r.coutDomicileMois) }}<em>/mois</em></b>
        </div>
        <template v-if="r.montantChiffrable">
          <div class="rc-chiffre">
            <span class="rc-chiffre-l">Remboursement annuel</span>
            <b class="rc-chiffre-v tabnum">{{ eurosExact(r.remboursementAn) }}</b>
          </div>
          <div class="rc-chiffre">
            <span class="rc-chiffre-l">Dont exonéré de cotisations</span>
            <b class="rc-chiffre-v tabnum">{{ eurosExact(r.remboursementExonereAn) }}</b>
          </div>
        </template>
        <div v-else class="rc-chiffre rc-chiffre--nc">
          <span class="rc-chiffre-l">Remboursement annuel</span>
          <b class="rc-chiffre-v">Non calculable en l'état</b>
        </div>
      </div>
      <p class="rc-hero-s">{{ nombre(r.kWhDomicileAn) }} kWh par an au domicile, soit {{ eurosExact(r.coutDomicileAn) }} sur l'année.</p>
    </div>

    <div v-if="r.avertissements.length" class="rc-warn">
      <p v-for="a in r.avertissements" :key="a">{{ a }}</p>
    </div>

    <!-- Détail, derrière le formulaire -->
    <div class="sim-gated" :class="{ 'is-locked': !unlocked }">
      <div class="sim-gated-body" :aria-hidden="!unlocked ? 'true' : undefined">
        <div class="sim-blocks">

          <article class="sim-block">
            <header><h3>Le montant à rembourser</h3></header>
            <div class="sim-block-b">
              <template v-if="r.montantChiffrable">
                <div class="sim-kv"><span>Remboursement annuel</span><b class="tabnum is-strong">{{ eurosExact(r.remboursementAn) }}</b></div>
                <div class="sim-kv"><span>Dont exonéré de cotisations</span><b class="tabnum">{{ eurosExact(r.remboursementExonereAn) }}</b></div>
                <div class="sim-kv"><span>Dont soumis à cotisations</span><b class="tabnum">{{ eurosExact(r.remboursementSoumisAn) }}</b></div>
                <div v-if="r.plafondApplique" class="sim-kv"><span>Plafond applicable</span><b class="tabnum">{{ eurosExact(r.plafondApplique) }} par an</b></div>
              </template>
              <p v-else class="rc-note">Les deux usages relèvent de deux dispositifs distincts, sur deux séries de kilomètres différentes. Reprenez le simulateur une fois pour les trajets professionnels, une fois pour le domicile-travail&nbsp;: chaque calcul est exact, leur addition ne l'est pas.</p>
            </div>
          </article>

          <article class="sim-block sim-block--wide">
            <header><h3>Ce que ça vous coûte, tout compris</h3></header>
            <div class="sim-block-b">
              <div class="sim-kv">
                <span>{{ r.coutEmployeur.libelleVersement }}</span>
                <b v-if="r.montantChiffrable" class="tabnum">{{ eurosExact(r.coutEmployeur.versementAn) }}</b>
                <b v-else>Non chiffrable</b>
              </div>
              <div v-if="r.coutEmployeur.supervisionAn" class="sim-kv"><span>Abonnement de supervision</span><b class="tabnum">{{ eurosExact(r.coutEmployeur.supervisionAn) }}</b></div>
              <div v-if="r.coutEmployeur.chargesRecurrentesAn" class="sim-kv">
                <span>Charges patronales sur la fraction réintégrée <small>({{ Math.round(r.coutEmployeur.tauxCharges * 100) }} %)</small></span>
                <b class="tabnum">{{ eurosExact(r.coutEmployeur.chargesRecurrentesAn) }}</b>
              </div>
              <!-- Sans versement chiffrable, le total ne l'est pas non plus :
                   afficher « 0 € » dirait que ça ne coûte rien, alors qu'on ne
                   sait pas encore combien. -->
              <div class="sim-kv">
                <span>Coût récurrent, par an et par salarié</span>
                <b v-if="r.montantChiffrable" class="tabnum is-strong">{{ eurosExact(r.coutEmployeur.totalRecurrentAn) }}</b>
                <b v-else>Non chiffrable</b>
              </div>
              <template v-if="r.coutEmployeur.borneUnique">
                <div class="sim-kv"><span>Borne — dépense unique</span><b class="tabnum">{{ eurosExact(r.coutEmployeur.borneUnique) }}</b></div>
                <div v-if="r.coutEmployeur.chargesBorneUnique" class="sim-kv"><span>Charges sur la part réintégrée de la borne</span><b class="tabnum">{{ eurosExact(r.coutEmployeur.chargesBorneUnique) }}</b></div>
                <div class="sim-kv">
                  <span>Total la première année</span>
                  <b v-if="r.montantChiffrable" class="tabnum is-strong">{{ eurosExact(r.coutEmployeur.totalPremiereAnnee) }}</b>
                  <b v-else>Non chiffrable</b>
                </div>
                <div class="sim-kv"><span>Borne étalée sur 8 ans</span><b class="tabnum">{{ eurosExact(r.coutEmployeur.borneAnnualisee) }} par an</b></div>
              </template>
              <p class="rc-note">La fraction réintégrée coûte plus que son montant facial&nbsp;: elle entre dans l'assiette, donc elle supporte des charges patronales. Le taux réel dépend notamment du niveau de rémunération, des allègements applicables et de la situation de l'employeur. 42&nbsp;% est une hypothèse modifiable, pas un calcul de paie.</p>
            </div>
          </article>

          <article class="sim-block">
            <header><h3>La qualité de votre preuve</h3></header>
            <div class="sim-block-b">
              <div class="sim-kv is-note"><span>Méthode retenue</span><b>{{ r.preuve.texte }}</b></div>
              <div class="sim-kv"><span>Attribution d'une session à un véhicule</span><b>{{ r.attributionSessions ? 'Possible' : 'Impossible' }}</b></div>
              <p class="rc-note">Aucune doctrine officielle n'impose de méthode de mesure. Un remboursement de frais professionnels doit en revanche correspondre à des dépenses réelles et justifiées.</p>
            </div>
          </article>

          <article v-if="r.supervision" class="sim-block">
            <header><h3>La supervision, et son régime propre</h3></header>
            <div class="sim-block-b">
              <div class="sim-kv"><span>Abonnement annuel</span><b class="tabnum">{{ eurosExact(r.supervision.coutAn) }}</b></div>
              <div class="sim-kv"><span>Exclu de l'assiette</span><b class="tabnum is-strong">{{ eurosExact(r.supervision.exonere) }}</b></div>
              <div class="sim-kv"><span>Soumis à cotisations</span><b class="tabnum">{{ eurosExact(r.supervision.soumis) }}</b></div>
              <div class="sim-kv is-note"><span>Règle appliquée</span><b>{{ r.supervision.regle }}</b></div>
              <p class="rc-note">L'électricité est exclue en totalité. Par prudence, OTONOM traite l'abonnement de supervision rattaché à la borne du salarié comme un «&nbsp;autre frais d'utilisation&nbsp;» au sens de l'article 4, donc dans la limite de 50 %. Aucune doctrine publiée ne tranche explicitement le cas de la supervision.</p>
            </div>
          </article>

          <article v-if="r.borne" class="sim-block">
            <header><h3>La borne installée au domicile</h3></header>
            <div class="sim-block-b">
              <div class="sim-kv"><span>Prise en charge employeur</span><b class="tabnum">{{ eurosExact(r.borne.priseEnCharge) }}</b></div>
              <div class="sim-kv"><span>Exclu de l'assiette</span><b class="tabnum is-strong">{{ eurosExact(r.borne.exonere) }}</b></div>
              <div class="sim-kv"><span>Soumis à cotisations</span><b class="tabnum">{{ eurosExact(r.borne.soumis) }}</b></div>
              <div class="sim-kv is-note"><span>Règle appliquée</span><b>{{ r.borne.regle }}</b></div>
            </div>
          </article>

          <article class="sim-block">
            <header><h3>Le levier des heures creuses</h3></header>
            <div class="sim-block-b">
              <div class="sim-kv"><span>Économie annuelle d'une bascule complète</span><b class="tabnum is-strong">{{ eurosExact(r.gainHeuresCreusesAn) }}</b></div>
              <p class="rc-note">Encore faut-il que le salarié ait souscrit l'option, connaisse ses plages — fixées localement — et programme effectivement la charge.</p>
            </div>
          </article>

          <article class="sim-block sim-block--wide">
            <header><h3>Si toute l'énergie était rechargée de cette façon</h3></header>
            <div class="sim-block-b">
              <div v-for="c in r.comparaison" :key="c.mode" class="sim-kv">
                <span>{{ c.mode }} <small>({{ c.base }})</small></span><b class="tabnum">{{ eurosExact(c.coutAn) }}</b>
              </div>
              <p class="rc-note">Comparaison à périmètre égal, sur la totalité de l'énergie annuelle. Le domicile est un prix TTC — le salarié ne récupère pas la TVA — quand le site d'entreprise est un prix HT&nbsp;: les deux bases sont indiquées.</p>
            </div>
          </article>

          <article class="sim-block sim-block--wide">
            <header><h3>Vos hypothèses</h3></header>
            <div class="sim-block-b">
              <div v-for="h in r.hypotheses" :key="h.label" class="sim-kv is-note">
                <span>{{ h.label }} <small v-if="h.source === 'reglementaire'">— réglementaire</small><small v-else>— hypothèse OTONOM</small></span><b>{{ h.valeur }}</b>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>

    <div v-if="!unlocked" id="rcUnlock" class="sim-gate">
      <div class="sim-gate-copy">
        <span class="kicker">Le reste du calcul</span>
        <h3>Vous avez le coût. Voici ce que vous avez le droit d'en faire.</h3>
        <p>Un montant sans son régime social n'aide personne à décider. Laissez vos coordonnées et le détail s'affiche <strong>immédiatement</strong>, ici même.</p>
        <ul class="sim-gate-list">
          <li><b>Le montant exonéré</b> et la fraction soumise à cotisations</li>
          <li><b>La qualité de votre preuve</b> selon la méthode de mesure</li>
          <li><b>Le régime de la borne</b> installée au domicile</li>
          <li><b>Le levier des heures creuses</b>, chiffré sur votre cas</li>
        </ul>
      </div>

      <form class="sim-gate-form" novalidate @submit.prevent="sendGate">
        <input v-model="g.honey" type="text" class="hp" name="url-site" tabindex="-1" autocomplete="off" aria-hidden="true" readonly>
        <div class="field" :class="{ 'is-invalid': gErr.nom }"><label for="rcNom">Nom <span class="req" aria-hidden="true">*</span></label><input id="rcNom" v-model="g.nom" type="text" autocomplete="name" required :aria-invalid="!!gErr.nom" @input="gErr.nom = ''"><span v-if="gErr.nom" class="field-err">{{ gErr.nom }}</span></div>
        <div class="field" :class="{ 'is-invalid': gErr.email }"><label for="rcEmail">Email professionnel <span class="req" aria-hidden="true">*</span></label><input id="rcEmail" v-model="g.email" type="email" autocomplete="email" required :aria-invalid="!!gErr.email" @input="gErr.email = ''"><span v-if="gErr.email" class="field-err">{{ gErr.email }}</span></div>
        <div class="field"><label for="rcEnt">Entreprise</label><input id="rcEnt" v-model="g.entreprise" type="text" autocomplete="organization"></div>
        <div class="field"><label for="rcTel">Téléphone <small>(facultatif)</small></label><input id="rcTel" v-model="g.tel" type="tel" autocomplete="tel"></div>
        <label class="chr-optin"><input v-model="g.optinCommercial" type="checkbox"> J'accepte de recevoir les actualités et offres d'OTONOM <small>(facultatif)</small></label>
        <button type="submit" class="btn btn--primary btn--block btn--lg" :disabled="sending">
          {{ sending ? 'Affichage…' : 'Afficher le détail complet' }}
          <svg v-if="!sending" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
        <p v-if="gateMsg" class="sim-gate-msg" role="alert">{{ gateMsg }}</p>
        <p v-if="gateError" class="sim-gate-msg" role="alert">Une erreur est survenue. Réessayez, ou écrivez-nous à <a href="mailto:e.barlet@mc-groupe.com">e.barlet@mc-groupe.com</a>.</p>
        <p class="sim-gate-consent">Affichage immédiat, sans engagement. Vos coordonnées restent confidentielles — <NuxtLink to="/confidentialite">politique de confidentialité</NuxtLink>.</p>
      </form>
    </div>

    <p class="sim-disclaimer muted">Estimation OTONOM au 11/08/2026, indicative et non contractuelle. Le régime social des bornes et du véhicule électrique court jusqu'au 31/12/2027 et les plafonds sont revalorisés chaque 1<sup>er</sup> janvier — à confirmer avec votre conseil en paie.</p>
  </div></section>

  <!-- ════════ CONTENU SEO / GEO ════════ -->
  <section class="section"><div class="wrap article-body rc-seo">
    <div class="article-tldr">
      <span class="tldr-label">L'essentiel</span>
      <p>Un salarié qui recharge le véhicule de l'entreprise chez lui avance de l'argent. Ce qu'on peut lui rembourser, et comment, dépend d'abord de qui possède le véhicule.</p>
      <ul>
        <li><strong>Véhicule de l'entreprise, 100 % électrique éligible</strong>&nbsp;: l'employeur peut rembourser <strong>100 % des kilowattheures</strong> sans créer d'avantage en nature. Les frais d'électricité sont expressément exclus de l'assiette.</li>
        <li>Le <strong>plafond de 50 %</strong> qu'on lit partout ne vise <strong>que les frais de borne</strong>, pas l'électricité&nbsp;: le texte le précise entre parenthèses.</li>
        <li>Un <strong>hybride rechargeable</strong> ne fonctionne pas exclusivement à l'électricité&nbsp;: il sort du régime favorable. Depuis le 01/02/2025 s'ajoute une condition de <strong>score environnemental</strong>.</li>
        <li><strong>Borne installée au domicile</strong>&nbsp;: exonérée sans plafond si elle est retirée en fin de contrat&nbsp;; sinon 50 % dans la limite de 1&nbsp;057,10 € (cinq ans ou moins) ou 75 % dans la limite de 1&nbsp;585,50 € (plus de cinq ans), valeurs 2026.</li>
        <li><strong>Véhicule personnel</strong>&nbsp;: la recharge est déjà comprise dans le barème kilométrique, majoré de 20 % pour l'électrique. <strong>Aucun cumul</strong> avec un remboursement séparé des kilowattheures.</li>
        <li>Pour le <strong>trajet domicile-travail</strong>, la prime de transport est exonérée jusqu'à <strong>600 € par an</strong> — mais elle ne se cumule pas avec la prise en charge d'un abonnement de transports publics.</li>
        <li><strong>La supervision, elle, n'est vraisemblablement exonérée qu'à moitié</strong>&nbsp;: faute de doctrine publiée sur ce point, nous rattachons l'abonnement aux frais liés à la borne, plafonnés à 50 % des dépenses réelles. C'est pourtant la méthode qui relie le plus directement une session à un véhicule.</li>
      </ul>
      <p>Règles vérifiées le 11/08/2026, indicatives et non contractuelles.</p>
    </div>

    <h2>Combien coûte vraiment une recharge à domicile&nbsp;?</h2>
    <p>Le calcul tient en trois grandeurs&nbsp;: les kilomètres, la consommation et le prix du kilowattheure. Une compacte électrique consomme environ <strong>17 kWh aux 100 km</strong> au compteur. Sur 15 000 km par an, cela représente 2 550 kWh&nbsp;; si 80 % sont rechargés à la maison, 2 040 kWh passent par le compteur du salarié.</p>
    <p>Au tarif réglementé du 1<sup>er</sup> août 2026, ces 2 040 kWh coûtent <strong>324 € par an en heures creuses</strong> (0,1589 €/kWh) contre <strong>408 € en option base</strong> (0,2001 €/kWh). Soit 27 € ou 34 € par mois — et <strong>84 € d'écart annuel</strong> pour un simple réglage de programmation.</p>

    <div class="article-callout">
      <span class="callout-label">L'erreur de calcul la plus fréquente</span>
      <p>Beaucoup d'estimations ajoutent 10 à 12 % de «&nbsp;pertes de recharge&nbsp;» à la consommation constructeur. C'est un <strong>double comptage</strong>&nbsp;: la consommation homologuée WLTP est mesurée entre le réseau et le véhicule, elle contient déjà ces pertes. Seule la consommation lue au tableau de bord, mesurée côté batterie, doit être corrigée.</p>
    </div>

    <h2>Peut-on rembourser sans créer d'avantage en nature&nbsp;?</h2>
    <p>Oui, et le texte est net. L'arrêté du 25 février 2025 dispose que l'avantage en nature d'un véhicule mis à disposition <strong>«&nbsp;ne tient pas compte des frais d'électricité engagés par l'employeur pour la recharge du véhicule&nbsp;»</strong>. L'employeur peut donc prendre en charge l'énergie sans que cela s'ajoute à l'assiette.</p>
    <p>La confusion vient du plafond de 50 % que l'on cite partout. Il existe bien, mais il concerne les <strong>frais liés à la borne</strong> — location, entretien, autres coûts d'utilisation — et le même texte précise entre parenthèses <strong>«&nbsp;hors frais d'électricité&nbsp;»</strong>. Les deux règles visent deux objets différents&nbsp;: l'énergie du véhicule d'un côté, l'équipement de l'autre.</p>

    <h2>À quelles conditions&nbsp;?</h2>
    <p>Le régime favorable n'est pas automatique. Il vise les véhicules <strong>fonctionnant exclusivement au moyen de l'énergie électrique</strong>&nbsp;: un hybride rechargeable en est exclu, quoi qu'on lise ailleurs. Et pour une mise à disposition postérieure au 1<sup>er</sup> février 2025, s'ajoute le respect d'une condition de <strong>score environnemental</strong> prévue par le code de l'énergie.</p>
    <p>Un véhicule électrique non éligible à ce score, ou un hybride rechargeable, ne relève donc pas du verdict favorable. C'est le premier point à vérifier avant d'écrire une politique de recharge.</p>

    <h2>Et si le salarié utilise sa propre voiture&nbsp;?</h2>
    <p>Tout change. Pour les <strong>déplacements professionnels</strong>, le remboursement passe par les indemnités kilométriques ou par les frais réels. Si l'entreprise applique le barème kilométrique — majoré de 20 % pour un véhicule électrique —, <strong>la recharge y est déjà comprise</strong> au titre des frais de carburant. Rembourser en plus les kilowattheures reviendrait à payer l'énergie deux fois.</p>
    <p>Pour le <strong>trajet domicile-travail</strong>, c'est la prime de transport qui s'applique&nbsp;: les frais d'alimentation d'un véhicule électrique personnel sont exonérés jusqu'à 600 € par an. Mais le dispositif est réservé aux salariés contraints d'utiliser leur véhicule — commune non desservie par un transport collectif régulier, ou horaires particuliers — et <strong>l'article L. 3261-3 du code du travail interdit le cumul</strong> avec la prise en charge d'un abonnement de transports publics.</p>

    <h2>Comment justifier le remboursement&nbsp;?</h2>
    <p>C'est la question que personne ne tranche. Aucune doctrine officielle n'impose de sous-compteur ni de borne communicante. En revanche, un remboursement de frais professionnels doit correspondre à des <strong>dépenses réelles et justifiées</strong>. Quatre méthodes coexistent, et elles ne se valent pas.</p>

    <table>
      <thead><tr><th>Méthode</th><th>Ce qu'elle prouve</th><th>Attribue la session à un véhicule&nbsp;?</th></tr></thead>
      <tbody>
        <tr><td><strong>Borne communicante et supervision</strong></td><td>Sessions horodatées, kilowattheures mesurés</td><td>Oui</td></tr>
        <tr><td>Sous-compteur dédié</td><td>Kilowattheures mesurés au point de charge</td><td>Non</td></tr>
        <tr><td>Estimation par les kilomètres</td><td>Un calcul, si la méthode est écrite</td><td>Non</td></tr>
        <tr><td>Aucune mesure</td><td>Rien d'opposable</td><td>Non</td></tr>
      </tbody>
    </table>

    <h3>Pourquoi la supervision change la nature de la preuve</h3>
    <p>Un sous-compteur mesure <strong>la borne</strong>, pas le véhicule. Chez un salarié dont le conjoint roule aussi en électrique, les kilowattheures ne sont plus séparables — et le remboursement devient indéfendable. La supervision, elle, identifie la session par badge ou par le véhicule, et sort un relevé mensuel par collaborateur. C'est la méthode qui répond le plus directement à la question «&nbsp;qui a rechargé&nbsp;?&nbsp;».</p>

    <div class="article-callout">
      <span class="callout-label">Le piège de la supervision</span>
      <p>L'électricité est exclue <strong>en totalité</strong>. L'abonnement de supervision, <strong>vraisemblablement pas</strong>. L'article 4 de l'arrêté vise les «&nbsp;autres frais liés à l'utilisation&nbsp;» d'une borne installée hors du lieu de travail et les plafonne à <strong>50&nbsp;% des dépenses réelles</strong> — sans nommer un abonnement de supervision. Par prudence, nous l'y rattachons — sans plafond en euros, celui-ci ne valant que pour l'achat et l'installation. La parenthèse «&nbsp;hors frais d'électricité&nbsp;» du même alinéa existe précisément pour séparer les deux. Concrètement, sur 8&nbsp;€ par mois d'abonnement, environ la moitié est réintégrable — quand les 27&nbsp;€ d'électricité du même mois ne le sont pas du tout.</p>
    </div>

    <div class="article-faq">
      <details><summary>Un employeur peut-il rembourser 100 % de l'électricité de recharge&nbsp;?</summary><div class="faq-a">Oui, lorsque le véhicule appartient à l'entreprise, fonctionne exclusivement à l'électricité et respecte, pour une mise à disposition postérieure au 01/02/2025, la condition de score environnemental. Les frais d'électricité sont expressément exclus du calcul de l'avantage en nature, et le plafond de 50 % ne vise que les frais de borne.</div></details>
      <details><summary>Le plafond de 50 % s'applique-t-il à l'électricité&nbsp;?</summary><div class="faq-a">Non. L'arrêté du 25 février 2025 précise entre parenthèses «&nbsp;hors frais d'électricité&nbsp;» à propos des frais liés à l'utilisation d'une borne installée hors du lieu de travail. Le plafond concerne la borne — location, entretien, autres coûts —, pas l'énergie consommée par le véhicule.</div></details>
      <details><summary>Que se passe-t-il pour un hybride rechargeable&nbsp;?</summary><div class="faq-a">Il ne fonctionne pas exclusivement au moyen de l'énergie électrique&nbsp;: le régime favorable ne lui est pas acquis. Le traitement doit être confirmé avec un conseil en paie avant de mettre en place un remboursement.</div></details>
      <details><summary>Peut-on cumuler indemnités kilométriques et remboursement de la recharge&nbsp;?</summary><div class="faq-a">Non. Pour un véhicule personnel, la location de batterie et les frais de recharge sont réputés compris dans le barème kilométrique, majoré de 20 % pour un véhicule électrique. Rembourser séparément les kilowattheures reviendrait à compter l'énergie deux fois.</div></details>
      <details><summary>Combien l'employeur peut-il financer pour une borne au domicile&nbsp;?</summary><div class="faq-a">Si la borne est retirée à la fin du contrat, la prise en charge est exclue de l'assiette sans plafond. Si le salarié la conserve, l'exclusion est de 50 % des dépenses réelles dans la limite de 1 057,10 € lorsque la borne a cinq ans ou moins, et de 75 % dans la limite de 1 585,50 € lorsqu'elle a plus de cinq ans. Valeurs 2026, revalorisées chaque 1<sup>er</sup> janvier.</div></details>
      <details><summary>Faut-il une borne communicante pour rembourser la recharge à domicile&nbsp;?</summary><div class="faq-a">Aucun texte ne l'impose au 11/08/2026. Mais un remboursement de frais professionnels doit correspondre à des dépenses réelles et justifiées, et la supervision est la seule méthode qui rattache une session de recharge à un véhicule donné. Un sous-compteur mesure la borne, pas la voiture : si un second véhicule s'y branche, les kilowattheures ne sont plus séparables.</div></details>
      <details><summary>L'abonnement de supervision est-il exonéré comme l'électricité&nbsp;?</summary><div class="faq-a">Vraisemblablement pas. L'électricité est exclue en totalité du calcul de l'avantage en nature. L'arrêté du 25 février 2025 ne cite pas l'abonnement de supervision : par prudence, nous le rattachons aux « autres frais liés à l'utilisation » de la borne visés à son article 4, exclus dans la limite de 50 % des dépenses réelles. Aucune doctrine publiée ne tranche ce cas précis. Aucun plafond en euros ne s'y applique : les plafonds de 1 057,10 € et 1 585,50 € visent l'achat et l'installation de la borne.</div></details>
      <details><summary>Qu'est-ce qu'OTONOM apporte sur ce sujet&nbsp;?</summary><div class="faq-a">OTONOM est l'orchestrateur A à Z de la transition mobilité, recharge et énergie des entreprises. Nous coordonnons la politique de recharge, l'installation des bornes et le cadrage du remboursement avec un seul interlocuteur, et nous chiffrons vos gains lors d'un audit gratuit.</div></details>
    </div>
  </div></section>
</template>

<script setup lang="ts">
import {
  calculerRecharge, resumeRecharge, CONFIG,
  type EntreeRecharge, type ResultatRecharge, type Verdict
} from '~/utils/simulateurs/rechargeCollaborateur'
import { eurosExact, nombre as nombreFr, corpsLead , focaliserChamp } from '~/utils/simulateurs/core'

useSeoMeta({
  title: 'Simulateur de remboursement de recharge à domicile — OTONOM',
  description: "Simulateur gratuit : coût réel de la recharge à domicile d'un salarié, montant à lui rembourser et traitement social selon votre situation."
})

const TRIPLE = [{ v: 'inconnu', l: 'Je ne sais pas' }, { v: 'oui', l: 'Oui' }, { v: 'non', l: 'Non' }]
/* Les trois situations de L. 3261-3, plus le doute et l'absence. On demande la
   RAISON et non « êtes-vous contraint ? » : à cette dernière question, beaucoup
   répondaient oui parce que la voiture est plus pratique — ce qui n'ouvre aucun
   droit. Les libellés reprennent le texte, pas une paraphrase. */
const RAISONS = [
  { v: 'inconnu', l: 'Je ne sais pas' },
  { v: 'non-desservi', l: 'Commune non desservie par un transport collectif régulier' },
  { v: 'hors-plan-mobilite', l: "Résidence ou lieu de travail hors d'un plan de mobilité obligatoire" },
  { v: 'horaires', l: 'Horaires particuliers empêchant le transport collectif' },
  { v: 'aucune', l: 'Aucune de ces situations' }
]
const LIBELLE_VERDICT: Record<Verdict, string> = {
  favorable: 'Remboursement exonéré',
  encadre: 'Remboursement encadré',
  prudence: 'À faire confirmer',
  /* « Cumul interdit » ne décrivait qu'une des deux causes d'exclusion. L'autre
     est l'inéligibilité pure — aucune situation de L. 3261-3 remplie — et le
     titre annonçait alors un cumul dont il n'était pas question. Le libellé dit
     la conséquence, le texte du verdict dit la cause. */
  exclu: 'Remboursement exclu'
}
const nombre = (v: number) => nombreFr(v)

/*
 * Le même champ ne désigne pas les mêmes kilomètres selon la branche.
 *
 * Sur un véhicule personnel remboursé au barème, l'indemnité porte sur les
 * kilomètres PROFESSIONNELS. Un salarié qui roule 15 000 km dont 4 000 pour son
 * travail et qui saisit 15 000 obtient une indemnité presque quadruple — sans
 * qu'aucune formule soit fausse. Le libellé lève l'ambiguïté à la source.
 */
const labelKm = computed(() => {
  if (f.proprietaire === 'entreprise') return 'Kilométrage annuel du véhicule'
  if (f.usageSalarie === 'professionnel') return 'Kilomètres professionnels par an'
  if (f.usageSalarie === 'domicile-travail') return 'Kilomètres domicile-travail par an'
  return 'Kilométrage annuel du véhicule'
})
const aideKm = computed(() => {
  if (f.proprietaire === 'entreprise') return ''
  if (f.usageSalarie === 'professionnel') return "Les seuls trajets professionnels, pas le kilométrage total du véhicule : c'est sur eux que porte le barème."
  if (f.usageSalarie === 'domicile-travail') return 'Les trajets entre le domicile et le lieu de travail, aller-retour compris.'
  return 'Usage mixte : les deux séries de kilomètres devront être ventilées avant tout remboursement.'
})

const f = reactive<EntreeRecharge>({
  proprietaire: 'entreprise', categorie: 'compacte', origineConso: 'wltp',
  kmAnnuels: undefined as unknown as number, motorisation: 'electrique',
  miseADispoApres2025: 'oui', ecoScore: 'inconnu', usagePrive: 'oui',
  usageSalarie: 'professionnel', modeRemboursement: 'kilometrique', puissanceFiscale: 5,
  abonnementTransportPublic: 'non', raisonVehiculePersonnel: 'inconnu',
  partDomicile: 0.8, optionTarif: 'hp-hc', partHeuresCreuses: 0.8,
  mesureDomicile: 'estimation', supervisionPayeeParEmployeur: 'non',
  typeSupervision: 'abonnement-salarie',
  borneFinanceeParEmployeur: 'non', borneRetireeEnFinDeContrat: 'oui'
})

const erreurs = reactive({ km: '', form: '' })
/* Saisi en pourcentage, transmis en ratio : demander « 0,42 » à un DAF serait
   une coquetterie de développeur. */
const tauxPct = ref<number | undefined>(undefined)
const r = ref<ResultatRecharge | null>(null)
const resultsEl = ref<HTMLElement | null>(null)

function onCalculer() {
  erreurs.km = ''; erreurs.form = ''
  if (!f.kmAnnuels || f.kmAnnuels < 100) {
    erreurs.km = 'Indiquez un kilométrage annuel.'
    erreurs.form = 'Complétez le champ signalé pour lancer le calcul.'
    focaliserChamp('km')
    return
  }
  r.value = calculerRecharge({ ...f,
    tauxChargesPatronales: typeof tauxPct.value === 'number' ? tauxPct.value / 100 : undefined })
  nextTick(() => document.getElementById('rcResults')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

/* ── Formulaire de contact ─────────────────────────────────────────────── */
const unlocked = ref(false)
const g = reactive({ nom: '', email: '', entreprise: '', tel: '', optinCommercial: false, honey: '' })
const sending = ref(false)
const gErr = reactive({ nom: '', email: '' })
const gateMsg = ref('')
const gateError = ref(false)
const estEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

/** Les données saisies, catégorisées comme dans le formulaire. */
function sectionsLead() {
  const v = r.value!
  const oui = (x?: string) => (x === 'oui' ? 'Oui' : x === 'non' ? 'Non' : 'Je ne sais pas')
  const s: { titre: string; lignes: [string, string][] }[] = [
    { titre: 'Situation', lignes: [
      ['Propriétaire du véhicule', f.proprietaire === 'entreprise' ? "L'entreprise" : 'Le salarié'],
      ['Branche retenue', v.libelleBranche],
      ['Verdict', LIBELLE_VERDICT[v.verdict]]
    ] },
    { titre: 'Véhicule', lignes: [
      ['Catégorie', String(f.categorie)],
      ['Kilomètres par an', `${nombre(f.kmAnnuels)} km`],
      ['Consommation retenue', `${v.consoRetenue} kWh/100 km au réseau`],
      ['Origine de la consommation', String(f.origineConso)]
    ] },
    { titre: 'Recharge', lignes: [
      ['Part au domicile', `${Math.round(f.partDomicile * 100)} %`],
      ['Option tarifaire', String(f.optionTarif)],
      ['Prix moyen du kWh', `${v.prixMoyenKwh} €`],
      ['Énergie au domicile', `${nombre(v.kWhDomicileAn)} kWh/an`]
    ] },
    { titre: 'Résultat', lignes: [
      ['Coût mensuel', eurosExact(v.coutDomicileMois)],
      /* Usage mixte : pas de montant défendable sans ventilation des kilomètres.
         Le lead doit dire la même chose que l'écran, sans quoi le commercial
         rappellerait avec un chiffre que le prospect n'a jamais vu. */
      ...(v.montantChiffrable
        ? [['Remboursement annuel', eurosExact(v.remboursementAn)],
            ['Dont exonéré', eurosExact(v.remboursementExonereAn)],
            ['Dont soumis', eurosExact(v.remboursementSoumisAn)]] as Array<[string, string]>
        : [['Remboursement annuel', "Non calculable — usage mixte à ventiler"]] as Array<[string, string]>),
      ['Gain heures creuses', eurosExact(v.gainHeuresCreusesAn)]
    ] }
  ]
  if (f.proprietaire === 'entreprise') {
    s.splice(1, 0, { titre: 'Régime du véhicule', lignes: [
      ['Motorisation', String(f.motorisation)],
      ['Usage privé autorisé', oui(f.usagePrive)],
      ['Mis à disposition après 01/02/2025', oui(f.miseADispoApres2025)],
      ['Éligible au score environnemental', oui(f.ecoScore)]
    ] })
  } else {
    s.splice(1, 0, { titre: 'Usage du véhicule personnel', lignes: [
      ['Trajets', String(f.usageSalarie)],
      ['Mode de remboursement', String(f.modeRemboursement)],
      ['Abonnement transports publics pris en charge', oui(f.abonnementTransportPublic)],
      ['Raison légale invoquée', String(f.raisonVehiculePersonnel)]
    ] })
  }
  s.push({ titre: 'Coût employeur', lignes: [
    [v.coutEmployeur.libelleVersement,
      v.montantChiffrable ? eurosExact(v.coutEmployeur.versementAn) : 'Non chiffrable'],
    ['Supervision', eurosExact(v.coutEmployeur.supervisionAn)],
    ['Charges sur la fraction réintégrée', eurosExact(v.coutEmployeur.chargesRecurrentesAn)],
    ['Coût récurrent par an',
      v.montantChiffrable ? eurosExact(v.coutEmployeur.totalRecurrentAn) : 'Non chiffrable'],
    ['Total première année',
      v.montantChiffrable ? eurosExact(v.coutEmployeur.totalPremiereAnnee) : 'Non chiffrable']
  ] })
  s.push({ titre: 'Mesure et preuve', lignes: [
    ['Mode de mesure', String(f.mesureDomicile)],
    ['kWh relevés saisis', f.kWhMesuresAn ? nombre(f.kWhMesuresAn) + ' kWh' : 'non'],
    ['Niveau de preuve', v.preuve.niveau],
    ['Attribution des sessions', v.attributionSessions ? 'Possible' : 'Impossible']
  ] })
  if (v.supervision) {
    s.push({ titre: 'Supervision', lignes: [
      ['Abonnement annuel', eurosExact(v.supervision.coutAn)],
      ["Exclu de l'assiette", eurosExact(v.supervision.exonere)],
      ['Soumis à cotisations', eurosExact(v.supervision.soumis)]
    ] })
  }
  if (v.borne) {
    s.push({ titre: 'Borne au domicile', lignes: [
      ['Prise en charge', eurosExact(v.borne.priseEnCharge)],
      ["Exclu de l'assiette", eurosExact(v.borne.exonere)],
      ['Soumis à cotisations', eurosExact(v.borne.soumis)],
      ['Règle appliquée', v.borne.regle]
    ] })
  }
  return s
}

async function sendGate() {
  if (sending.value || !r.value) return
  gateError.value = false
  gateMsg.value = ''
  /* On marque le champ fautif et on y amène le curseur : un message seul,
     en bas du formulaire, laisse l'utilisateur chercher. */
  gErr.nom = g.nom.trim() ? '' : 'Indiquez votre nom.'
  gErr.email = estEmail(g.email.trim()) ? '' : 'Indiquez un email professionnel valide.'
  if (gErr.nom || gErr.email) { focaliserChamp(gErr.nom ? 'rcNom' : 'rcEmail'); return }

  /* Pot de miel : rempli alors que nom et email sont valides, c'est presque
     toujours un gestionnaire de mots de passe. On envoie quand même, en le
     signalant — un lead de trop vaut mieux qu'un lead perdu en silence. */
  const potRempli = !!g.honey
  const contact = { ...g, honey: '' }

  sending.value = true
  try {
    const res = await $fetch<{ ok: boolean }>('/api/lead', {
      method: 'POST',
      body: corpsLead('recharge-collaborateur', contact, resumeRecharge(r.value), {
        sections: sectionsLead(), potDeMielRempli: potRempli
      })
    })
    if (res?.ok) {
      unlocked.value = true
      nextTick(() => document.getElementById('rcResults')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    } else { throw new Error('refus') }
  } catch { gateError.value = true } finally { sending.value = false }
}
</script>

<style scoped>
.rc-err { display: block; margin-top: 6px; font-size: 12.5px; color: var(--ink-soft); }
.rc-err--form { margin-top: 12px; }
.rc-aide { display: block; margin-top: 6px; font-size: 12.5px; color: var(--muted-2); line-height: 1.55; }
.rc-note { margin-top: 14px; font-size: 13px; line-height: 1.6; color: var(--muted); }

/* ── Le VERDICT en tête, les montants ensuite ──
   La hiérarchie a été inversée : le coût occupait la grande place alors qu'il
   se calcule de tête (km × conso × prix). Ce que le simulateur apporte, c'est
   de dire laquelle des sept situations est la vôtre et ce qu'elle autorise. */
.rc-hero {
  border: 1px solid var(--line); border-left-width: 3px; border-radius: var(--radius);
  background: var(--bg-1); max-width: 82ch; margin: 0 auto;
  padding: clamp(26px, 3.4vw, 38px) clamp(24px, 3.4vw, 40px);
}
.rc-hero.is-favorable { border-left-color: var(--ink); }
.rc-hero.is-encadre { border-left-color: var(--muted); }
.rc-hero.is-prudence, .rc-hero.is-exclu { border-left-color: var(--ink); border-left-style: dashed; }
.rc-hero-l { display: block; font-family: var(--ff-mono); font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
.rc-hero-v {
  font-family: var(--ff-display); font-size: clamp(28px, 4.4vw, 46px); line-height: 1.1;
  letter-spacing: -.02em; color: var(--ink); margin-top: 12px;
}
.rc-hero-t { margin-top: 14px; font-size: 16.5px; line-height: 1.62; color: var(--ink-soft); max-width: 68ch; }

/* Les montants deviennent une rangée de métriques, pas le titre. */
.rc-chiffres {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
  margin-top: clamp(22px, 3vw, 30px); background: var(--line);
  border: 1px solid var(--line); border-radius: 10px; overflow: hidden;
}
.rc-chiffre { background: var(--bg-1); padding: 16px 18px; }
.rc-chiffre-l { display: block; font-family: var(--ff-mono); font-size: 10.5px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
.rc-chiffre-v { display: block; margin-top: 8px; font-family: var(--ff-display); font-size: clamp(21px, 2.4vw, 27px); line-height: 1.1; color: var(--ink); font-weight: 500; }
.rc-chiffre-v em { font-style: normal; font-size: .5em; letter-spacing: 0; color: var(--muted); margin-left: 2px; }
/* Absence de montant : plus petit et en retrait, pour ne pas se lire comme un
   chiffre. La place reste occupée — un bloc qui disparaît passe inaperçu. */
.rc-chiffre--nc .rc-chiffre-v { font-size: clamp(15px, 1.5vw, 17px); color: var(--muted); }
.rc-hero-s { margin-top: 14px; color: var(--muted); font-size: 14px; }
@media (max-width: 700px) {
  .rc-chiffres { grid-template-columns: 1fr; }
}

.rc-warn { max-width: 78ch; margin: 18px auto 0; }
.rc-warn p { font-size: 13.5px; line-height: 1.6; color: var(--muted); padding-left: 18px; position: relative; }
.rc-warn p + p { margin-top: 8px; }
.rc-warn p::before { content: ""; position: absolute; left: 0; top: .62em; width: 10px; height: 1px; background: var(--ink); opacity: .5; }

.rc-seo { margin-top: clamp(40px, 6vw, 72px); }
@media (max-width: 760px) {
  .rc-verdict, .rc-warn { max-width: none; }
}
</style>
