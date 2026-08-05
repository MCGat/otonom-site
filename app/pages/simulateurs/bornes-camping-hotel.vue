<template>
  <section class="page-intro section--light"><div class="wrap">
    <span class="kicker reveal">Simulateur de bornes camping &amp; hôtel</span>
    <h1 class="reveal">Combien de bornes de recharge pour mon camping ou mon hôtel&nbsp;?</h1>
    <p class="lede reveal">Le nombre de points de recharge adapté à votre capacité réelle, la puissance à prévoir, le déploiement par étapes et les aides réellement mobilisables.</p>
    <p class="sim-note reveal">Calcul immédiat dans votre navigateur. <strong>Estimation préalable</strong>, en aucun cas une étude électrique.</p>
  </div></section>

  <!-- ════════ FORMULAIRE ════════ -->
  <section class="section section--tight"><div class="wrap">
    <form class="sim-form" novalidate @submit.prevent="onCalculer">
      <fieldset class="sim-fieldset reveal">
        <legend class="sim-legend"><span class="sim-legend-n">01</span> Votre établissement</legend>
        <div class="sim-grid">
          <div class="field">
            <label for="type">Type d'établissement</label>
            <select id="type" v-model="f.type" @change="onType">
              <option v-for="(l, k) in LABELS_ETAB" :key="k" :value="k">{{ l }}</option>
            </select>
          </div>
          <div class="field" :class="{ 'is-invalid': erreurs.capacite }">
            <label for="cap">{{ labelCapacite }} <span class="req" aria-hidden="true">*</span></label>
            <input id="cap" v-model.number="f.capacite" type="number" min="1" max="3000" step="1" inputmode="numeric" placeholder="ex. 150"
                   :aria-invalid="!!erreurs.capacite" @input="erreurs.capacite = ''">
            <span v-if="erreurs.capacite" class="chr-err">{{ erreurs.capacite }}</span>
          </div>
          <div class="field">
            <label for="places">Places de stationnement <small>(si différent)</small></label>
            <input id="places" v-model.number="f.places" type="number" min="1" max="3000" step="1" inputmode="numeric" :placeholder="String(f.capacite || 150)">
          </div>
        </div>
      </fieldset>

      <fieldset class="sim-fieldset reveal">
        <legend class="sim-legend"><span class="sim-legend-n">02</span> Votre fréquentation</legend>
        <div class="sim-grid">
          <div class="field">
            <label for="occ">Taux d'occupation en haute saison</label>
            <select id="occ" v-model.number="f.occupationHaute">
              <option :value="0.6">60 %</option><option :value="0.7">70 %</option>
              <option :value="0.8">80 %</option><option :value="0.9">90 %</option><option :value="1">Complet</option>
            </select>
          </div>
          <div class="field">
            <label for="sejour">Durée moyenne de séjour <small>(nuits)</small></label>
            <input id="sejour" v-model.number="f.dureeSejour" type="number" min="1" max="30" step="0.1" inputmode="decimal">
          </div>
          <div class="field">
            <label for="etr">Part de clientèle étrangère</label>
            <select id="etr" v-model.number="f.partEtrangere">
              <option :value="0">Aucune ou marginale</option><option :value="0.25">Environ un quart</option>
              <option :value="0.5">Environ la moitié</option><option :value="0.75">Majoritaire</option>
            </select>
          </div>
          <div class="field">
            <label for="sais">Ouverture</label>
            <select id="sais" v-model="f.saisonnier">
              <option :value="true">Saisonnière</option><option :value="false">Toute l'année</option>
            </select>
          </div>
          <div v-if="f.saisonnier" class="field">
            <label for="mois">Mois d'ouverture</label>
            <input id="mois" v-model.number="f.moisOuverts" type="number" min="1" max="12" step="1" inputmode="numeric">
          </div>
        </div>
      </fieldset>

      <fieldset class="sim-fieldset reveal">
        <legend class="sim-legend"><span class="sim-legend-n">03</span> Le service visé</legend>
        <div class="sim-grid">
          <div class="field">
            <label for="usage">Qui pourra recharger&nbsp;?</label>
            <select id="usage" v-model="f.usage">
              <option value="clients">Vos clients uniquement</option>
              <option value="ouvert">Aussi les visiteurs extérieurs</option>
            </select>
          </div>
          <div class="field">
            <label for="amb">Niveau de service</label>
            <select id="amb" v-model="f.ambition">
              <option v-for="(l, k) in LABELS_AMBITION" :key="k" :value="k">{{ l }}</option>
            </select>
          </div>
          <div class="field">
            <label for="hz">Dimensionner à l'horizon</label>
            <select id="hz" v-model.number="f.horizonCourt">
              <option :value="2027">2027</option><option :value="2030">2030</option><option :value="2034">2034</option>
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset class="sim-fieldset reveal">
        <legend class="sim-legend"><span class="sim-legend-n">04</span> Votre installation électrique</legend>
        <div class="sim-grid">
          <div class="field">
            <label for="souscrit">Puissance souscrite <small>(kVA)</small></label>
            <input id="souscrit" v-model.number="f.puissanceSouscrite" type="number" min="0" max="2000" step="6" inputmode="numeric" placeholder="Je ne sais pas">
          </div>
          <div class="field">
            <label for="pointe">Pointe actuelle du site <small>(kW)</small></label>
            <input id="pointe" v-model.number="f.pointeEtablissement" type="number" min="0" max="2000" step="5" inputmode="numeric" placeholder="Je ne sais pas">
          </div>
          <div class="field">
            <label for="pu">Puissance par point de charge</label>
            <select id="pu" v-model.number="f.puissanceUnitaire">
              <option :value="7.4">7,4 kW — longue immobilisation</option>
              <option :value="11">11 kW — le compromis courant</option>
              <option :value="22">22 kW — rotation soutenue</option>
            </select>
          </div>
          <div class="field">
            <label for="dist">Distance au tableau électrique <small>(m)</small></label>
            <input id="dist" v-model.number="f.distanceTableau" type="number" min="0" max="1000" step="10" inputmode="numeric" placeholder="ex. 60">
          </div>
        </div>
        <p class="chr-aide">Laissez vide ce que vous ignorez&nbsp;: nous prenons alors une valeur par défaut, affichée comme telle dans les hypothèses.</p>
      </fieldset>

      <fieldset class="sim-fieldset reveal">
        <legend class="sim-legend"><span class="sim-legend-n">05</span> Votre situation réglementaire</legend>
        <div class="sim-grid">
          <div class="field">
            <label for="zone">Localisation</label>
            <select id="zone" v-model="f.zone">
              <option value="metropole">France métropolitaine</option>
              <option value="corse-om">Corse ou Outre-mer</option>
            </select>
          </div>
          <div class="field">
            <label for="park">Votre parking est</label>
            <select id="park" v-model="f.etatParking">
              <option value="existant">Existant</option><option value="neuf">Neuf</option>
              <option value="renovation">En rénovation importante</option>
            </select>
          </div>
          <div class="field">
            <label for="prop">Vous possédez les murs et le parking</label>
            <select id="prop" v-model="f.proprietaire"><option v-for="o in TRIPLE" :key="o.v" :value="o.v">{{ o.l }}</option></select>
          </div>
          <div class="field">
            <label for="occup">Vous occupez vous-même le bâtiment</label>
            <select id="occup" v-model="f.occupant"><option v-for="o in TRIPLE" :key="o.v" :value="o.v">{{ o.l }}</option></select>
          </div>
          <div class="field">
            <label for="m250">Moins de 250 salariés</label>
            <select id="m250" v-model="f.moins250"><option v-for="o in TRIPLE" :key="o.v" :value="o.v">{{ o.l }}</option></select>
          </div>
          <div class="field">
            <label for="ca">Chiffre d'affaires supérieur à 50 M€</label>
            <select id="ca" v-model="f.caSup50M"><option v-for="o in TRIPLE" :key="o.v" :value="o.v">{{ o.l }}</option></select>
          </div>
          <div class="field">
            <label for="bil">Total de bilan supérieur à 43 M€</label>
            <select id="bil" v-model="f.bilanSup43M"><option v-for="o in TRIPLE" :key="o.v" :value="o.v">{{ o.l }}</option></select>
          </div>
          <div class="field">
            <label for="grp">Vous appartenez à un groupe ou à des sociétés liées</label>
            <select id="grp" v-model="f.groupeLie"><option v-for="o in TRIPLE" :key="o.v" :value="o.v">{{ o.l }}</option></select>
          </div>
        </div>
        <p class="chr-aide">Ces quatre dernières questions servent uniquement à savoir si l'exemption PME de l'article L113-14 vous concerne. Nous ne concluons rien si une réponse manque.</p>
      </fieldset>

      <div class="sim-actions reveal">
        <button type="submit" class="btn btn--primary btn--lg">
          Calculer mon besoin
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
        <p v-if="aDesErreurs" class="chr-err chr-err--form" role="alert">Complétez les champs signalés pour lancer le calcul.</p>
      </div>
    </form>
  </div></section>

  <!-- ════════ RÉSULTAT ════════ -->
  <section v-if="r" id="chrResults" ref="resultsEl" class="section section--light"><div class="wrap">
    <div class="sec-head"><span class="kicker">Votre résultat</span><h2>Ce qu'il vous faut, et ce que la loi vous impose.</h2></div>

    <div class="chr-hero">
      <span class="chr-eyebrow">Votre besoin à l'horizon {{ f.horizonCourt }}</span>
      <div class="chr-num tabnum">{{ r.pointsCourt }}</div>
      <p class="chr-sub">points de recharge — soit <b>{{ r.bornesDoubles }} borne{{ r.bornesDoubles > 1 ? 's' : '' }} double{{ r.bornesDoubles > 1 ? 's' : '' }}</b><template v-if="r.bornesSimples"> et une simple</template></p>

      <div class="chr-deploy">
        <div><b class="tabnum">{{ r.pointsCourt }}</b><span>à installer maintenant</span></div>
        <div v-if="r.preEquiper"><b class="tabnum">{{ r.preEquiper }}</b><span>places à pré-équiper</span></div>
        <div><b class="tabnum">{{ r.puissanceUnitaire }} kW</b><span>par point de charge</span></div>
      </div>

      <p class="chr-note">Le pré-équipement se pose pendant que la tranchée est ouverte&nbsp;: la seconde tranche vous coûtera alors le prix des bornes, pas celui du chantier.</p>
    </div>

    <p class="chr-prudence">
      Estimation fondée sur votre capacité, votre taux d'occupation et la durée moyenne des séjours — <strong>pas sur une règle de pouce</strong>. Elle ne remplace ni un devis, ni l'étude électrique obligatoire au-delà de 50 places.
    </p>

    <!-- ══ DÉTAIL, sous condition ══ -->
    <div class="chr-gated" :class="{ 'is-locked': !unlocked }">
      <div class="chr-gated-body" :aria-hidden="!unlocked ? 'true' : undefined">

        <div class="sim-blocks">
          <article class="sim-block">
            <header><h3>Votre minimum réglementaire</h3><span class="sim-tag sim-tag--calc">{{ r.minimumReglementaire === null ? 'À vérifier' : r.minimumReglementaire + ' point' + (r.minimumReglementaire > 1 ? 's' : '') }}</span></header>
            <div class="sim-block-b">
              <p class="sim-lead">{{ r.texteReglementaire }}</p>
              <div v-if="r.statutPme === 'pme'" class="sim-kv"><span>Statut retenu</span><b>PME au sens européen</b></div>
              <div v-else-if="r.statutPme === 'non-pme'" class="sim-kv"><span>Statut retenu</span><b>Hors périmètre PME</b></div>
              <div v-else class="sim-kv"><span>Statut retenu</span><b>Indéterminé</b></div>
            </div>
          </article>

          <article class="sim-block">
            <header><h3>Les trois niveaux de service</h3><span class="sim-tag sim-tag--hyp">Au choix</span></header>
            <div class="sim-block-b">
              <div class="sim-kv"><span>Essentiel — couvrir la demande</span><b class="tabnum">{{ r.niveaux.essentiel }} points</b></div>
              <div class="sim-kv"><span>Confort — limiter l'attente</span><b class="tabnum" :class="{ 'is-strong': f.ambition === 'confort' }">{{ r.niveaux.confort }} points</b></div>
              <div class="sim-kv"><span>Premium — argument commercial</span><b class="tabnum">{{ r.niveaux.premium }} points</b></div>
              <div class="sim-kv"><span>Besoin projeté en {{ f.horizonLong }}</span><b class="tabnum">{{ r.pointsLong }} points</b></div>
            </div>
          </article>

          <article class="sim-block">
            <header><h3>Votre puissance</h3><span class="sim-tag" :class="tagPuissance">{{ labelVerdict }}</span></header>
            <div class="sim-block-b">
              <p class="sim-lead" v-html="texteVerdict"></p>
              <div class="sim-kv"><span>Puissance installée</span><b class="tabnum">{{ nombre(r.puissanceInstallee) }} kW</b></div>
              <div class="sim-kv"><span>Plafond piloté recommandé</span><b class="tabnum is-strong">{{ nombre(r.plafondPilotage) }} kW</b></div>
              <div class="sim-kv"><span>Énergie à délivrer par nuit</span><b class="tabnum">{{ nombre(r.kWhNuit) }} kWh</b></div>
              <div class="sim-kv"><span>Puissance minimale pour la délivrer</span><b class="tabnum">{{ nombre(r.puissanceMiniEnergie) }} kW</b></div>
              <div v-if="r.margeDisponible !== null" class="sim-kv"><span>Marge disponible sur votre abonnement</span><b class="tabnum">{{ nombre(r.margeDisponible) }} kW</b></div>
            </div>
          </article>

          <article class="sim-block">
            <header><h3>Vos aides</h3><span class="sim-tag" :class="r.aideEstimee > 0 ? 'sim-tag--calc' : 'sim-tag--audit'">{{ r.aideEstimee > 0 ? eurosExact(r.aideEstimee) : 'Aucune' }}</span></header>
            <div class="sim-block-b">
              <p class="sim-lead">{{ r.aideCommentaire }}</p>
            </div>
          </article>

          <article class="sim-block">
            <header><h3>Votre investissement</h3><span class="sim-tag sim-tag--ind">{{ eurosExact(r.investTotal) }} HT</span></header>
            <div class="sim-block-b">
              <p class="sim-lead">Le poste qui surprend le plus est la <strong>tranchée</strong>&nbsp;: {{ eurosExact(CONFIG.couts.tranchee) }} le mètre, et vous avez indiqué <strong>{{ r.metresTranchee }} m</strong> entre le tableau électrique et le parking. Rapprocher les bornes du tableau, ou les regrouper en un seul point, est le levier d'économie le plus efficace de tout le projet — bien avant le choix du matériel.</p>
              <div class="sim-kv"><span>Points de charge</span><b class="tabnum">{{ eurosExact(r.investPoints) }}</b></div>
              <div class="sim-kv"><span>Génie civil — forfait de chantier</span><b class="tabnum">{{ eurosExact(r.genieCivilForfait) }}</b></div>
              <div class="sim-kv"><span>Génie civil — tranchée sur {{ r.metresTranchee }} m</span><b class="tabnum">{{ eurosExact(r.genieCivilTranchee) }}</b></div>
              <div v-if="r.investPilotage" class="sim-kv"><span>Pilotage de charge</span><b class="tabnum">{{ eurosExact(r.investPilotage) }}</b></div>
              <div v-if="r.investRenforcement" class="sim-kv"><span>Renforcement du raccordement</span><b class="tabnum">{{ eurosExact(r.investRenforcement) }}</b></div>
              <div v-if="r.investPreEquipement" class="sim-kv"><span>Pré-équipement de {{ r.preEquiper }} places de stationnement</span><b class="tabnum">{{ eurosExact(r.investPreEquipement) }}</b></div>
              <div class="sim-kv"><span>Reste à charge après aides</span><b class="tabnum is-strong">{{ eurosExact(r.investTotal - r.aideEstimee) }}</b></div>
            </div>
          </article>

          <article class="sim-block">
            <header><h3>Ce que la recharge rapporte</h3><span class="sim-tag" :class="r.margeAn >= 0 ? 'sim-tag--ind' : 'sim-tag--audit'">{{ r.margeAn >= 0 ? 'À l’équilibre' : 'Ne s’autofinance pas' }}</span></header>
            <div class="sim-block-b">
              <p class="sim-lead"><strong>Une borne ne se rentabilise pas en vendant de l'électricité.</strong> Elle se rentabilise en réservations. Voici les deux calculs, séparés — parce que les confondre est la faute qui fait renoncer les gérants.</p>

              <div class="chr-calc">
                <span class="chr-calc-t">1. La vente d'électricité, à elle seule</span>
                <div class="sim-kv"><span>Énergie vendue par an</span><b class="tabnum">{{ nombre(r.kWhAn) }} kWh</b></div>
                <div class="sim-kv"><span>Marge encaissée <small>({{ eurosExact(r.margeKwh * 100) .replace('€','') }}c par kWh)</small></span><b class="tabnum">{{ eurosExact(r.recetteAn) }}</b></div>
                <div class="sim-kv"><span>Supervision, maintenance, monétique</span><b class="tabnum">− {{ eurosExact(r.chargesAn) }}</b></div>
                <div class="sim-kv"><span>Résultat annuel</span><b class="tabnum is-strong">{{ eurosExact(r.margeAn) }}</b></div>
                <p class="chr-calc-p">
                  <template v-if="r.margeAn < 0">
                    <strong>Vous perdez {{ eurosExact(Math.abs(r.margeAn)) }} par an</strong> sur l'exploitation seule. Ce n'est pas une anomalie&nbsp;: sur {{ f.saisonnier === false ? 'une exploitation à l\'année' : `${f.moisOuverts} mois d'ouverture` }}, la supervision et la maintenance se paient douze mois sur douze, alors que les bornes ne servent qu'une partie de l'année. Facturer plus cher ne réglerait rien — vos clients iraient se brancher ailleurs.
                  </template>
                  <template v-else>
                    L'exploitation s'autofinance et dégage {{ eurosExact(r.margeAn) }} par an. C'est peu au regard de l'investissement&nbsp;: le kilowattheure n'est pas le modèle économique d'une borne.
                  </template>
                </p>
              </div>

              <div class="chr-calc">
                <span class="chr-calc-t">2. Ce qui rembourse vraiment&nbsp;: les réservations</span>
                <div class="sim-kv"><span>Reste à charge après aides</span><b class="tabnum">{{ eurosExact(r.investTotal - r.aideEstimee) }}</b></div>
                <div class="sim-kv"><span>Durée de vie retenue</span><b class="tabnum">{{ r.horizonRemboursementAns }} ans</b></div>
                <div class="sim-kv"><span>Prix moyen d'une nuitée</span><b class="tabnum">{{ eurosExact(r.prixNuitee) }}</b></div>
                <div v-if="r.nuiteesSupplementaires" class="sim-kv"><span>Nuitées supplémentaires à gagner, par an</span><b class="tabnum is-strong">{{ r.nuiteesSupplementaires }}</b></div>
                <p class="chr-calc-p">
                  <template v-if="r.nuiteesSupplementaires">
                    Autrement dit&nbsp;: si vos bornes vous font gagner <strong>{{ r.nuiteesSupplementaires }} nuitées de plus par an</strong> — soit environ {{ Math.ceil(r.nuiteesSupplementaires / (f.saisonnier === false ? 52 : (f.moisOuverts || 5) * 4.3)) }} par semaine d'ouverture — l'installation est remboursée sur sa durée de vie, exploitation comprise. À vous de juger si c'est atteignable chez vous&nbsp;: nous ne connaissons pas votre marché, et nous ne prétendrons pas le prévoir.
                  </template>
                  <template v-else>
                    La vente d'électricité suffit ici à rembourser l'installation sur sa durée de vie. Toute réservation gagnée grâce aux bornes s'ajoute à ce résultat.
                  </template>
                </p>
              </div>

              <p class="chr-calc-note">Pourquoi ce détour&nbsp;? Parce que les plateformes de réservation proposent un filtre « borne de recharge »&nbsp;: un établissement non équipé disparaît des résultats pour cette clientèle. Le gain se compte en séjours, pas en kilowattheures — mais nous refusons de vous vendre une prévision de fréquentation que personne ne sait établir.</p>
            </div>
          </article>

          <article class="sim-block">
            <header><h3>Vos hypothèses</h3><span class="sim-tag sim-tag--hyp">Toutes affichées</span></header>
            <div class="sim-block-b">
              <div v-for="h in r.hypotheses" :key="h.label" class="sim-kv"><span>{{ h.label }}</span><b>{{ h.valeur }}</b></div>
            </div>
          </article>
        </div>

        <div v-if="r.avertissements.length" class="chr-warn">
          <span class="kicker">À savoir avant d'engager</span>
          <ul><li v-for="a in r.avertissements" :key="a">{{ a }}</li></ul>
        </div>
      </div>
    </div>

    <!-- ══ DÉVERROUILLAGE ══ -->
    <div v-if="!unlocked" id="chrUnlock" class="sim-gate chr-unlock">
      <div class="sim-gate-copy">
        <span class="kicker">Le reste du calcul</span>
        <h3>Vous avez le nombre. Voici tout ce qui va avec.</h3>
        <p>Un nombre de bornes sans son budget, sa puissance et son cadre réglementaire n'aide personne à décider. Laissez vos coordonnées et le détail s'affiche <strong>immédiatement</strong>, ici même.</p>
        <ul class="sim-gate-list">
          <li><b>Votre minimum réglementaire</b> — êtes-vous seulement obligé de vous équiper&nbsp;?</li>
          <li><b>La puissance à prévoir</b>, et si votre abonnement actuel suffit ou non</li>
          <li><b>L'investissement détaillé</b> et les aides réellement mobilisables chez vous</li>
          <li><b>Ce que la recharge rapporte</b>, et le seuil en nuitées pour rembourser le reste</li>
        </ul>
        <p class="chr-unlock-why">Pourquoi vos coordonnées&nbsp;? Parce que ce chiffre mérite d'être affiné avec votre site réel, et que c'est notre métier de le faire avec vous.</p>
      </div>

      <form class="sim-gate-form" novalidate @submit.prevent="sendGate">
        <input v-model="g.honey" type="text" class="hp" name="url-site" tabindex="-1" autocomplete="off" aria-hidden="true" readonly>
        <div class="field"><label for="cNom">Nom <span class="req" aria-hidden="true">*</span></label><input id="cNom" v-model="g.nom" type="text" autocomplete="name" required></div>
        <div class="field"><label for="cEmail">Email professionnel <span class="req" aria-hidden="true">*</span></label><input id="cEmail" v-model="g.email" type="email" autocomplete="email" required></div>
        <div class="field"><label for="cEnt">Établissement</label><input id="cEnt" v-model="g.entreprise" type="text" autocomplete="organization"></div>
        <div class="field"><label for="cTel">Téléphone <small>(facultatif)</small></label><input id="cTel" v-model="g.tel" type="tel" autocomplete="tel"></div>
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

    <div v-if="unlocked" class="cta-block">
      <h2>Passons de l'estimation au devis.</h2>
      <p class="lede">Nous auditons votre site, dimensionnons l'installation et coordonnons installateurs et énergéticien. Un seul interlocuteur, de A à Z.</p>
      <div class="hero-cta"><NuxtLink class="btn btn--primary btn--lg" to="/contact">Réserver mon audit gratuit <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6" /></svg></NuxtLink></div>
    </div>
  </div></section>

  <!-- ════════ CONTENU SEO / GEO — toujours visible, hors du mur ════════ -->
  <section class="section section--tight chr-seo"><div class="wrap">
    <div class="sec-head">
      <span class="kicker">Comprendre le calcul</span>
      <h2>Combien de bornes pour un camping ou un hôtel&nbsp;: la méthode</h2>
    </div>

    <div class="article-body">
      <div class="article-tldr">
        <span class="tldr-label">L'essentiel</span>
        <p>Le nombre de bornes d'un hébergement touristique se déduit de ses <strong>arrivées</strong>, pas de sa capacité&nbsp;: un client qui reste sept nuits ne recharge pas sept fois.</p>
        <ul>
          <li>L'obligation d'équipement <strong>ne vise pas les PME</strong>&nbsp;: l'article L113-14 du code de la construction écarte les parcs dépendant de bâtiments possédés et occupés par une PME au sens de la recommandation 2003/361/CE. La plupart des campings et hôtels indépendants n'y sont donc pas soumis.</li>
          <li>Le guichet ADVENIR « parking privé ouvert au public », qui couvrait hôtels et commerces, est <strong>fermé depuis le 30 juin 2023</strong>. En métropole, aucune prime nationale n'est identifiée pour ce cas au 05/08/2026.</li>
          <li>Dimensionner sur les 27 à 30 % de l'électrique dans les <strong>immatriculations neuves</strong> est une erreur d'un facteur cinq&nbsp;: ce qui roule, c'est le parc en circulation — <strong>5,5 %</strong> au 01/01/2026, dont 3,5 % de véhicules 100 % électriques (SDES).</li>
          <li>Une borne s'amortissant sur huit à dix ans, le calcul se fait sur le parc <strong>projeté</strong> à l'horizon retenu, pas sur celui d'aujourd'hui.</li>
          <li>Au-delà de <strong>50 places</strong> de stationnement, une étude de conception électrique par un professionnel qualifié IRVE est obligatoire avant travaux.</li>
        </ul>
        <p>Règles vérifiées le 05/08/2026, indicatives et non contractuelles.</p>
      </div>

      <p>La question que se pose un gérant de camping ou d'hôtel n'est pas « faut-il des bornes&nbsp;? » — elle est <strong>combien</strong>, de quelle puissance, pour quel budget, et est-ce que ça se rembourse. Les réponses qui circulent sont des règles de pouce&nbsp;: « une à deux bornes en dessous de vingt chambres ». Elles ignorent le taux d'occupation, la durée des séjours et la puissance disponible, c'est-à-dire tout ce qui fait la différence entre deux établissements de même taille.</p>

      <h3>Le calcul part des arrivées, pas de la capacité</h3>
      <p>C'est le point que la plupart des outils manquent. Le besoin de recharge naît d'un véhicule qui <strong>arrive</strong> après avoir roulé, pas d'un véhicule garé. Dans un camping où l'on reste sept nuits, un septième du parc se renouvelle chaque jour&nbsp;; dans un hôtel où l'on reste une nuit et demie, c'est presque la totalité.</p>
      <p>À capacité comparable, un hôtel génère donc <strong>plus de sessions de recharge</strong> qu'un camping, alors même qu'il compte moins de voitures sur son parking. À l'inverse, comparer un hôtel de quarante chambres à un camping de cent cinquante emplacements n'a aucun sens&nbsp;: le second reste très largement au-dessus.</p>

      <h3>Les postes qui font le dimensionnement</h3>
      <table>
        <thead><tr><th>Paramètre</th><th>Ce qu'il change</th></tr></thead>
        <tbody>
          <tr><td>Durée moyenne de séjour</td><td>Détermine le rythme des arrivées, donc le nombre de sessions par nuit</td></tr>
          <tr><td>Taux d'occupation en haute saison</td><td>Fixe le nombre de véhicules réellement présents</td></tr>
          <tr><td>Part du parc rechargeable</td><td>5,5 % au 01/01/2026, à projeter sur la durée d'amortissement de la borne</td></tr>
          <tr><td>Clientèle étrangère</td><td>Les clientèles néerlandaise, allemande et belge sont plus électrifiées</td></tr>
          <tr><td>Puissance souscrite et pointe du site</td><td>Décide entre pilotage de charge et renforcement du raccordement</td></tr>
          <tr><td>Saisonnalité</td><td>Cinq mois d'exploitation allongent d'autant le retour sur investissement</td></tr>
        </tbody>
      </table>

      <div class="article-callout">
        <span class="callout-label">À retenir</span>
        <p>Une nuit de douze heures à 7,4 kW délivre environ 85 kWh — bien plus qu'un client n'en a besoin. Sur un séjour, <strong>la durée de stationnement remplace la puissance</strong>&nbsp;: multiplier les bornes rapides coûte cher sans servir davantage de clients. Et tous les véhicules n'acceptent pas 22 kW en courant alternatif.</p>
      </div>

      <h3>Bornes ou points de recharge&nbsp;?</h3>
      <p>La réglementation compte des <strong>points de recharge</strong>, jamais des bornes. Une borne double alimentant deux véhicules simultanément vaut deux points. Confondre les deux revient soit à sous-dimensionner de moitié, soit à doubler le budget. Notre calcul rend les deux&nbsp;: le nombre de points, et le nombre de bornes correspondant.</p>

      <h3>Ce que la loi impose réellement</h3>
      <p>L'article <strong>L113-13</strong> du code de la construction et de l'habitation impose, depuis le 1ᵉʳ janvier 2025, au moins un point de recharge sur un emplacement accessible aux personnes à mobilité réduite pour un parc existant de plus de vingt places, puis un point par tranche de vingt places supplémentaires. L'article <strong>L113-12</strong> vise les bâtiments neufs et les rénovations importantes de plus de dix places, avec une place sur cinq pré-équipée.</p>
      <p>Mais l'article <strong>L113-14</strong> écarte de ces deux obligations les parcs dépendant de bâtiments <strong>possédés et occupés par une PME</strong>. Une PME emploie moins de 250 personnes et respecte au moins l'un des deux plafonds financiers — 50 M€ de chiffre d'affaires ou 43 M€ de total de bilan —, en tenant compte des entreprises partenaires et liées. La majorité des hébergements indépendants sort donc du champ. Deux autres mécanismes existent&nbsp;: en rénovation importante, l'obligation tombe si les installations dépassent 7 % du coût des travaux&nbsp;; et des travaux importants sur le réseau en amont <em>limitent</em> le nombre de points exigés, sans supprimer l'obligation.</p>

      <h3>Les aides&nbsp;: ce qui reste ouvert en 2026</h3>
      <p>Le guichet ADVENIR qui finançait les points de recharge ouverts au public sur parking privé — celui que citent encore beaucoup d'articles — a fermé le <strong>30 juin 2023</strong>. En France métropolitaine, un camping ou un hôtel ne dispose donc d'aucune prime nationale identifiée pour équiper son parking en points de recharge destinés à des véhicules légers. Des dispositifs régionaux existent, variables selon les territoires et les enveloppes, à vérifier avant d'engager la dépense. En <strong>Corse et Outre-mer</strong>, des guichets restent en revanche ouverts, avec pilotage par le signal EDF-SEI obligatoire.</p>

      <h3>Le vrai retour sur investissement</h3>
      <p>Vendre l'électricité couvre les frais&nbsp;; ce n'est pas là que se joue la rentabilité. Les plateformes de réservation proposent désormais un filtre « borne de recharge »&nbsp;: un établissement non équipé disparaît simplement des résultats pour cette clientèle. Le gain se compte en réservations non perdues, pas en kilowattheures. Comme nous ne savons pas prévoir votre fréquentation, nous affichons le retour par la vente d'électricité, puis le <strong>nombre de nuitées supplémentaires par an</strong> nécessaires pour rembourser le solde — un chiffre qu'un gérant sait interpréter immédiatement.</p>
      <p>Pour l'hôtellerie, un point mérite d'être connu&nbsp;: la borne de recharge figure au référentiel de classement d'Atout France (critère n° 222 du tableau de classement des hôtels de tourisme), sous forme de critère optionnel à points. Elle doit être destinée à la clientèle de l'établissement — un point de recharge public dans la rue voisine ne vaut pas le critère. Aucun critère équivalent n'est identifié au référentiel Camping et parcs résidentiels de loisirs.</p>

      <h2>Questions fréquentes sur les bornes en camping et hôtel</h2>
      <div class="article-faq">
        <details><summary>Combien de bornes de recharge faut-il dans un camping&nbsp;?</summary><div class="faq-a">Cela dépend des arrivées, pas du nombre d'emplacements. Pour un camping de 150 emplacements occupé à 80 % avec des séjours de sept nuits, notre calcul donne de l'ordre de huit points de recharge à l'horizon 2030, et deux seulement pour un camping de soixante emplacements au niveau de parc actuel. Le taux d'occupation, la durée des séjours et l'horizon retenu changent complètement le résultat.</div></details>
        <details><summary>Un camping est-il obligé d'installer des bornes de recharge&nbsp;?</summary><div class="faq-a">Le plus souvent, non. L'article L113-14 du code de la construction et de l'habitation écarte de l'obligation les parcs dépendant de bâtiments possédés et occupés par une PME au sens de la recommandation européenne 2003/361/CE, ce qui couvre la majorité des campings et hôtels indépendants. L'obligation de l'article L113-13 — un point par tranche de vingt places depuis le 1ᵉʳ janvier 2025 — vise les autres.</div></details>
        <details><summary>Quelles aides pour installer des bornes dans un hôtel ou un camping en 2026&nbsp;?</summary><div class="faq-a">Le guichet ADVENIR « point de recharge ouvert à tout public sur parking privé » est fermé depuis le 30 juin 2023. Au 05/08/2026, aucune prime nationale n'est identifiée pour un parking d'hébergement touristique en métropole. Des aides régionales peuvent exister, et des guichets restent ouverts en Corse et Outre-mer. Toute éligibilité doit être confirmée avant d'engager la dépense.</div></details>
        <details><summary>Quelle puissance choisir&nbsp;: 7,4, 11 ou 22 kW&nbsp;?</summary><div class="faq-a">Pour un séjour, la durée de stationnement remplace la puissance&nbsp;: une nuit de douze heures à 7,4 kW délivre environ 85 kWh, bien au-delà du besoin d'un client. Le 11 kW est le compromis courant, le 22 kW ne se justifie qu'en rotation soutenue et n'est de toute façon pas accepté par tous les véhicules en courant alternatif.</div></details>
        <details><summary>Faut-il une étude avant d'installer des bornes&nbsp;?</summary><div class="faq-a">Oui dès 50 places de stationnement&nbsp;: une étude de conception électrique est obligatoire avant travaux, et l'installation doit être réalisée par un professionnel qualifié IRVE. Notre simulateur est une estimation préalable destinée à cadrer le projet, en aucun cas une étude électrique.</div></details>
        <details><summary>Qui peut dimensionner et coordonner l'installation&nbsp;?</summary><div class="faq-a">OTONOM, orchestrateur de la transition mobilité, recharge et énergie des entreprises&nbsp;: nous auditons votre site, dimensionnons l'infrastructure, coordonnons installateurs, énergéticiens et mainteneurs, puis vérifions les résultats. Un seul interlocuteur, de A à Z.</div></details>
      </div>

      <h3>Pour aller plus loin</h3>
      <p>Les textes sont publics&nbsp;: les obligations d'équipement figurent aux <a href="https://www.legifrance.gouv.fr/codes/id/LEGISCTA000041563723/" target="_blank" rel="noopener noreferrer">articles L113-11 à L113-17 du code de la construction et de l'habitation</a>, l'administration en publie une <a href="https://entreprendre.service-public.gouv.fr/vosdroits/F38491" target="_blank" rel="noopener noreferrer">synthèse pour les entreprises</a>, la définition européenne de la PME est fixée par la <a href="https://eur-lex.europa.eu/eli/reco/2003/361/oj" target="_blank" rel="noopener noreferrer">recommandation 2003/361/CE</a>, et le <a href="https://www.statistiques.developpement-durable.gouv.fr/immatriculation-des-vehicules-routiers" target="_blank" rel="noopener noreferrer">service statistique du ministère</a> publie la composition du parc en circulation. Si votre sujet est une flotte d'entreprise plutôt qu'une clientèle, notre <NuxtLink to="/simulateurs/tco-flotte-electrique">simulateur de TCO flotte électrique</NuxtLink> chiffre l'infrastructure dans le coût complet, et notre article sur <NuxtLink to="/blog/cout-bornes-recharge-flotte">le coût des bornes d'une flotte</NuxtLink> détaille les postes.</p>

      <hr>
      <p class="disclaimer">Estimation préalable, indicative et non contractuelle. Textes réglementaires et état des guichets d'aide vérifiés le 05/08/2026. Les coûts de matériel, de génie civil et les prix de l'énergie sont des hypothèses OTONOM au 01/01/2026, toutes affichées et paramétrables&nbsp;; les valeurs réelles dépendent de votre site et se confirment par devis. Les projections de parc rechargeable sont des hypothèses de travail, non des prévisions.</p>
    </div>
  </div></section>
</template>

<script setup lang="ts">
import {
  calculerBornes, resumeBornes, LABELS_ETAB, LABELS_AMBITION, UNITE, CONFIG,
  type BornesInput, type BornesResult, type TypeEtab
} from '~/utils/simulateurs/bornesChr'
import { eurosExact, nombre as nombreFr, corpsLead } from '~/utils/simulateurs/core'

useSeoMeta({
  title: 'Combien de bornes pour un camping ou un hôtel ? Simulateur — OTONOM',
  description: "Estimez le nombre de points de recharge, la puissance nécessaire, le déploiement par étapes et les aides réellement mobilisables pour votre camping, hôtel ou résidence de tourisme."
})

const TRIPLE = [{ v: 'inconnu', l: 'Je ne sais pas' }, { v: 'oui', l: 'Oui' }, { v: 'non', l: 'Non' }]

const nombre = (v: number) => nombreFr(v)

const f = reactive<BornesInput>({
  type: 'camping', capacite: undefined as unknown as number, places: undefined,
  occupationHaute: 0.8, dureeSejour: 7, partEtrangere: 0.25,
  saisonnier: true, moisOuverts: 5,
  usage: 'clients', ambition: 'confort', horizonCourt: 2030, horizonLong: 2034,
  puissanceUnitaire: 11, distanceTableau: 60,
  zone: 'metropole', etatParking: 'existant',
  proprietaire: 'inconnu', occupant: 'inconnu',
  moins250: 'inconnu', caSup50M: 'inconnu', bilanSup43M: 'inconnu', groupeLie: 'inconnu'
})

/* « Nombre d'emplacements » mais « Nombre de chambres » : l'élision ne vaut que
   devant une voyelle. Le libellé se déduit du mot, il n'y a donc rien à tenir
   à jour le jour où un type d'établissement s'ajoute. */
const labelCapacite = computed(() => {
  const u = UNITE[f.type]
  return /^[aeiouyéèêëàâîïôöûü]/i.test(u) ? `Nombre d'${u}` : `Nombre de ${u}`
})

/* Changer de type ajuste la durée de séjour par défaut — un hôtel n'a rien à
   voir avec un camping, et laisser 7 nuits fausserait tout le calcul. */
function onType() {
  const d: Record<TypeEtab, number> = { camping: 7, hotel: 1.8, residence: 5, 'chambres-hotes': 2 }
  f.dureeSejour = d[f.type]
}

const erreurs = reactive({ capacite: '' })
const aDesErreurs = computed(() => !!erreurs.capacite)

const r = ref<BornesResult | null>(null)
const resultsEl = ref<HTMLElement | null>(null)

function valider(): boolean {
  erreurs.capacite = ''
  if (!f.capacite || f.capacite < 1) erreurs.capacite = 'Indiquez votre capacité pour lancer le calcul.'
  return !aDesErreurs.value
}

function onCalculer() {
  if (!valider()) return
  r.value = calculerBornes({ ...f })
  nextTick(() => resultsEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

/* Recalcul à la volée une fois le premier résultat obtenu — mais jamais avant,
   sinon un formulaire vide produirait un chiffre. */
watch(f, () => { if (r.value && valider()) r.value = calculerBornes({ ...f }) }, { deep: true })

const labelVerdict = computed(() => ({
  confortable: 'Compatible', contraint: 'Pilotage contraint', insuffisant: 'Renforcement'
}[r.value?.verdictPuissance || 'confortable']))

const tagPuissance = computed(() => ({
  confortable: 'sim-tag--calc', contraint: 'sim-tag--hyp', insuffisant: 'sim-tag--audit'
}[r.value?.verdictPuissance || 'confortable']))

const texteVerdict = computed(() => {
  const v = r.value
  if (!v) return ''
  if (v.margeDisponible === null) return "Puissance souscrite non renseignée&nbsp;: nous ne pouvons pas trancher. Le besoin énergétique ci-dessous reste valable, il suffit de le comparer à votre marge réelle."
  if (v.verdictPuissance === 'confortable') return "Votre abonnement absorbe l'installation. Un pilotage de charge reste recommandé pour lisser l'appel du soir, mais aucun renforcement n'est nécessaire."
  if (v.verdictPuissance === 'contraint') return "Votre marge suffit à délivrer l'énergie de la nuit, mais pas à alimenter tous les points à pleine puissance en même temps. Le pilotage de charge devient <strong>indispensable</strong>&nbsp;: il étale la charge sur la nuit."
  return "Votre marge ne permet pas de délivrer l'énergie nécessaire dans la fenêtre nocturne, même en pilotant. Trois issues&nbsp;: renforcer le raccordement, réduire le nombre de points, ou allonger la fenêtre de charge."
})

/* ── Lead ──────────────────────────────────────────────────────────────── */

/**
 * Ce que le prospect a saisi, rangé comme dans le formulaire.
 * Sans cela, l'email de lead ne contient qu'un nom et un email — et l'on rappelle
 * quelqu'un sans savoir de quoi lui parler.
 */
const OUI_NON: Record<string, string> = { oui: 'Oui', non: 'Non', inconnu: 'Ne sait pas' }
const L_USAGE: Record<string, string> = { clients: 'Clients uniquement', ouvert: 'Ouvert aux visiteurs extérieurs' }
const L_ZONE: Record<string, string> = { metropole: 'France métropolitaine', 'corse-om': 'Corse ou Outre-mer' }
const L_PARK: Record<string, string> = { existant: 'Existant', neuf: 'Neuf', renovation: 'Rénovation importante' }
const L_PME: Record<string, string> = { pme: 'PME au sens européen', 'non-pme': 'Hors périmètre PME', indetermine: 'Indéterminé' }
const L_VERDICT: Record<string, string> = { confortable: 'Compatible', contraint: 'Pilotage contraint', insuffisant: 'Renforcement nécessaire' }

function sectionsLead() {
  const v = r.value!
  const u = UNITE[f.type]
  const ouSaisi = (x: number | undefined, suffixe = '') => (x || x === 0 ? `${nombre(x)}${suffixe}` : 'Non renseigné')

  return [
    { titre: 'Établissement', lignes: [
      ['Type', LABELS_ETAB[f.type]],
      ['Capacité', `${nombre(f.capacite)} ${u}`],
      ['Places de stationnement', ouSaisi(f.places) === 'Non renseigné' ? `${nombre(f.capacite)} (par défaut)` : nombre(f.places!)]
    ] },
    { titre: 'Fréquentation', lignes: [
      ['Occupation en haute saison', `${Math.round((f.occupationHaute || 0) * 100)} %`],
      ['Durée moyenne de séjour', `${f.dureeSejour} nuits`],
      ['Clientèle étrangère', `${Math.round((f.partEtrangere || 0) * 100)} %`],
      ['Ouverture', f.saisonnier === false ? "Toute l'année" : `Saisonnière — ${f.moisOuverts} mois`]
    ] },
    { titre: 'Service visé', lignes: [
      ['Qui pourra recharger', L_USAGE[f.usage || 'clients']!],
      ['Niveau de service', LABELS_AMBITION[f.ambition || 'confort']],
      ['Horizon de dimensionnement', String(f.horizonCourt)]
    ] },
    { titre: 'Installation électrique', lignes: [
      ['Puissance souscrite', ouSaisi(f.puissanceSouscrite, ' kVA')],
      ['Pointe actuelle du site', ouSaisi(f.pointeEtablissement, ' kW')],
      ['Puissance par point', `${f.puissanceUnitaire} kW`],
      ['Distance au tableau', ouSaisi(f.distanceTableau, ' m')]
    ] },
    { titre: 'Situation réglementaire', lignes: [
      ['Localisation', L_ZONE[f.zone || 'metropole']!],
      ['État du parking', L_PARK[f.etatParking || 'existant']!],
      ['Propriétaire des murs et du parking', OUI_NON[f.proprietaire || 'inconnu']!],
      ['Occupant du bâtiment', OUI_NON[f.occupant || 'inconnu']!],
      ['Moins de 250 salariés', OUI_NON[f.moins250 || 'inconnu']!],
      ['CA supérieur à 50 M€', OUI_NON[f.caSup50M || 'inconnu']!],
      ['Bilan supérieur à 43 M€', OUI_NON[f.bilanSup43M || 'inconnu']!],
      ['Groupe ou sociétés liées', OUI_NON[f.groupeLie || 'inconnu']!],
      ['Statut retenu', L_PME[v.statutPme]!]
    ] },
    { titre: 'Résultat calculé', lignes: [
      ['Points de recharge', `${v.pointsCourt} (soit ${v.bornesDoubles} borne(s) double(s)${v.bornesSimples ? ' + 1 simple' : ''})`],
      ['Places à pré-équiper', String(v.preEquiper)],
      ['Puissance installée', `${nombre(v.puissanceInstallee)} kW, plafond piloté ${nombre(v.plafondPilotage)} kW`],
      ['Verdict électrique', L_VERDICT[v.verdictPuissance]!],
      ['Investissement', `${eurosExact(v.investTotal)} HT`],
      ['Aide estimée', v.aideEstimee > 0 ? eurosExact(v.aideEstimee) : 'Aucune'],
      ['Marge nette annuelle', eurosExact(v.margeAn)],
      ['Retour sur investissement', v.retourAns ? `${v.retourAns} ans` : 'À affiner'],
      ['Minimum réglementaire', v.minimumReglementaire === null ? 'À vérifier' : `${v.minimumReglementaire} point(s)`]
    ] }
  ]
}
const unlocked = ref(false)
const g = reactive({ nom: '', email: '', entreprise: '', tel: '', optinCommercial: false, honey: '' })
const sending = ref(false)
const gateError = ref(false)
const gateMsg = ref('')

const estEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

async function sendGate() {
  if (sending.value || !r.value) return
  gateError.value = false
  gateMsg.value = ''

  /* Le formulaire est en `novalidate` : sans ce contrôle, un champ vide part au
     serveur, revient en 400, et l'utilisateur ne lit qu'un « une erreur est
     survenue » qui ne lui dit pas quoi corriger. */
  if (!g.nom.trim()) { gateMsg.value = 'Indiquez votre nom pour afficher le détail.'; return }
  if (!estEmail(g.email.trim())) { gateMsg.value = 'Indiquez un email professionnel valide.'; return }

  /* Pot de miel anti-robot. S'il est rempli ALORS QUE le nom et l'email viennent
     de passer la validation, c'est presque toujours un gestionnaire de mots de
     passe qui a rempli le champ caché — pas un robot. Le comportement d'origine
     (déverrouiller sans rien envoyer) perdait alors un lead qualifié, en silence
     et sans le moindre signe à l'écran. On préfère un lead de trop à un lead
     perdu : on l'envoie en le signalant dans les métadonnées. */
  const potRempli = !!g.honey
  const contact = { ...g, honey: '' }

  sending.value = true
  const sections = sectionsLead()
  try {
    const v = r.value
    const res = await $fetch<{ ok: boolean }>('/api/lead', {
      method: 'POST',
      body: corpsLead('bornes-chr', contact, resumeBornes(v), {
        sections,
        potDeMielRempli: potRempli
      })
    })
    if (res?.ok) {
      unlocked.value = true
      nextTick(() => document.getElementById('chrResults')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    } else { throw new Error('refus') }
  } catch { gateError.value = true } finally { sending.value = false }
}
</script>

<style scoped>
.chr-err { display: block; margin-top: 6px; font-size: 12.5px; color: var(--ink-soft); }
.chr-err--form { margin-top: 12px; }
.chr-aide { margin-top: 14px; font-size: 12.5px; color: var(--muted-2); line-height: 1.6; max-width: 70ch; }

/* ── Le nombre, en très grand ── */
/* .sec-head n'a pas de marge basse : sans celle-ci, le bloc colle au titre. */
.chr-hero { margin-top: clamp(26px, 3.5vw, 40px); border: 1px solid var(--line); border-radius: var(--radius); padding: clamp(28px, 4vw, 44px); background: var(--bg-1); }
.chr-eyebrow { font-family: var(--ff-mono); font-size: 11.5px; letter-spacing: .16em; text-transform: uppercase; color: var(--muted); }
.chr-num { font-family: var(--ff-display); font-size: clamp(64px, 13vw, 132px); line-height: .95; font-weight: 600; letter-spacing: -.03em; margin-top: 14px; }
.chr-sub { font-size: clamp(16px, 1.9vw, 20px); color: var(--ink-soft); margin-top: 10px; }
.chr-sub b { color: var(--ink); font-weight: 600; }

.chr-deploy { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 1px; background: var(--line); border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden; margin-top: 28px; }
.chr-deploy > div { background: var(--bg-1); padding: 18px 20px; display: grid; gap: 6px; }
.chr-deploy b { font-family: var(--ff-display); font-size: 26px; font-weight: 600; }
.chr-deploy span { font-size: 13px; color: var(--muted); line-height: 1.45; }

.chr-note { margin-top: 20px; font-size: 13.5px; color: var(--muted); line-height: 1.65; max-width: 62ch; }
.chr-prudence { margin-top: 20px; font-size: 13.5px; color: var(--muted); line-height: 1.65; max-width: 74ch; }
.chr-prudence strong { color: var(--ink); }

/* ── Mur : le nombre est offert, le raisonnement se mérite ── */
.chr-gated { position: relative; margin-top: clamp(28px, 4vw, 40px); }
.chr-gated.is-locked {
  max-height: 460px; overflow: hidden;
  /* Fondu par masque : indépendant de la couleur de fond de la section. */
  -webkit-mask-image: linear-gradient(to bottom, #000 45%, transparent 97%);
  mask-image: linear-gradient(to bottom, #000 45%, transparent 97%);
}
.chr-gated.is-locked .chr-gated-body { filter: blur(5px); opacity: .62; pointer-events: none; user-select: none; }

.chr-unlock { margin-top: -18px; position: relative; z-index: 2; background: var(--bg); }
.chr-unlock .sim-gate-copy > p { margin-top: 14px; }
.chr-unlock-why { margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--line-soft); font-size: 13px; color: var(--muted-2); line-height: 1.6; }
.chr-unlock .chr-optin { margin: 2px 0 0; display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: var(--muted); line-height: 1.5; }

/* Les deux calculs de rentabilité, séparés visuellement : les confondre est
   précisément la faute qui fait renoncer les gérants. */
.chr-calc { margin-top: 20px; padding: 18px 20px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--bg); }
.chr-calc + .chr-calc { margin-top: 14px; }
.chr-calc-t { display: block; font-family: var(--ff-mono); font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--ink); margin-bottom: 12px; }
.chr-calc-p { margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--line-soft); font-size: 13.5px; line-height: 1.65; color: var(--muted); }
.chr-calc-p strong { color: var(--ink); }
.chr-calc-note { margin-top: 18px; font-size: 13px; line-height: 1.65; color: var(--muted-2); }

.chr-warn { margin-top: 26px; border-left: 2px solid var(--ink); padding-left: 16px; }
/* .cta-block n'a pas de marge propre : il chevaucherait les avertissements. */
.cta-block { margin-top: clamp(40px, 5vw, 64px); }
.chr-warn ul { list-style: none; margin: 12px 0 0; padding: 0; display: grid; gap: 10px; }
.chr-warn li { font-size: 13.5px; color: var(--muted); line-height: 1.6; max-width: 76ch; }

@media (max-width: 860px) { .chr-gated.is-locked { max-height: 360px; } }
</style>
