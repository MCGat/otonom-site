<template>
<section class="hero hero--light hero--ems">
  <div class="grid-faint" aria-hidden="true"></div>
  <div class="wrap">
    <span class="kicker reveal">Mobilité · Recharge · Énergie</span>
    <h1 class="reveal hero-title">
      <span class="hl"><span class="hl-i">Toute votre transition mobilité&nbsp;&amp; énergie.</span></span>
      <span class="hl"><span class="hl-i">Un seul partenaire.</span></span>
    </h1>
    <p class="lede reveal">OTONOM orchestre, de A à Z, vos véhicules, votre recharge et votre énergie. Des résultats chiffrés — sans y passer votre temps.</p>
    <div class="hero-cta reveal">
      <a class="btn btn--primary btn--lg" href="/contact">Réserver mon audit gratuit <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
      <a class="btn btn--ghost btn--lg" href="/expertises">Découvrir nos leviers</a>
    </div>
    <p class="hero-note reveal">On ne vend ni matériel ni logiciel — on orchestre votre performance.</p>
    <div class="ems-hero reveal">
      <div ref="stageEl" class="ems-stage">
      <svg class="ems-schema" viewBox="0 0 560 540" role="img" aria-label="Schéma : l'EMS — Energy Management System — pilote les flux d'énergie entre le réseau, le solaire, le stockage, la recharge des véhicules et le bâtiment.">
        <g class="ems-cross" aria-hidden="true">
          <g transform="translate(58,50)"><path d="M-5,0 H5 M0,-5 V5" /></g>
          <g transform="translate(502,50)"><path d="M-5,0 H5 M0,-5 V5" /></g>
          <g transform="translate(58,494)"><path d="M-5,0 H5 M0,-5 V5" /></g>
          <g transform="translate(502,494)"><path d="M-5,0 H5 M0,-5 V5" /></g>
        </g>
        <g aria-hidden="true">
          <circle class="ems-orbit" cx="280" cy="270" r="118" />
          <circle class="ems-halo" cx="280" cy="270" r="88" />
          <circle class="ems-scan" cx="280" cy="270" r="72" pathLength="1" />
        </g>
        <!-- 01 · Réseau → EMS -->
        <g class="ems-branch ems-b1" aria-hidden="true">
          <path class="ems-line" pathLength="1" d="M116,146 C176,178 196,196 226,231" />
          <g class="ems-arr" transform="translate(226,231) rotate(37)"><path d="M-7,-3.5 L0,0 L-7,3.5" /></g>
          <path class="ems-pulse" pathLength="1" d="M116,146 C176,178 196,196 226,231" style="--pd:1.35s" />
          <g transform="translate(84,122)"><g class="ems-node">
            <circle class="ems-node-ring" r="34" />
            <circle class="ems-node-bg" r="28" />
            <g class="ems-ico"><path d="M-2.6,-15 L-9.5,15 M2.6,-15 L9.5,15 M-6.6,4 L6.6,4 M-4.4,-6 L4.4,-6 M-2.6,-15 L2.6,-15" /><path d="M-12,-10 L12,-10" /></g>
          </g></g>
          <text class="ems-lbl" x="84" y="186"><tspan class="ems-idx">01 </tspan>Réseau</text>
        </g>
        <!-- 02 · Solaire → EMS -->
        <g class="ems-branch ems-b2" aria-hidden="true">
          <path class="ems-line" pathLength="1" d="M116,394 C176,362 196,344 226,309" />
          <g class="ems-arr" transform="translate(226,309) rotate(-37)"><path d="M-7,-3.5 L0,0 L-7,3.5" /></g>
          <path class="ems-pulse" pathLength="1" d="M116,394 C176,362 196,344 226,309" style="--pd:1.6s" />
          <g transform="translate(84,418)"><g class="ems-node">
            <circle class="ems-node-ring" r="34" />
            <circle class="ems-node-bg" r="28" />
            <g class="ems-ico"><path d="M-16,5 L-9.5,-9 L16,-9 L9.5,5 Z" /><path d="M-12.8,-2 L12.8,-2" /><path d="M-4.4,-9 L-7.7,5 M3,-9 L-0.3,5 M10.3,-9 L7,5" /><path d="M-1.5,5 L-1.5,11 M-6,11 L3,11" /></g>
          </g></g>
          <text class="ems-lbl" x="84" y="482"><tspan class="ems-idx">02 </tspan>Solaire</text>
        </g>
        <!-- 03 · Stockage ⇄ EMS -->
        <g class="ems-branch ems-b3" aria-hidden="true">
          <path class="ems-line" pathLength="1" d="M288,122 L288,216" />
          <path class="ems-line" pathLength="1" d="M272,216 L272,122" />
          <g class="ems-arr" transform="translate(288,216) rotate(90)"><path d="M-7,-3.5 L0,0 L-7,3.5" /></g>
          <g class="ems-arr" transform="translate(272,122) rotate(-90)"><path d="M-7,-3.5 L0,0 L-7,3.5" /></g>
          <path class="ems-pulse" pathLength="1" d="M288,122 L288,216" style="--pd:1.85s" />
          <path class="ems-pulse" pathLength="1" d="M272,216 L272,122" style="--pd:3.15s" />
          <g transform="translate(280,84)"><g class="ems-node">
            <circle class="ems-node-ring" r="34" />
            <circle class="ems-node-bg" r="28" />
            <g class="ems-ico"><rect x="-15" y="-9.5" width="25" height="19" rx="3" /><rect class="ems-ico--f" x="11" y="-4.5" width="3.5" height="9" rx="1.4" /><path d="M-9,-3.5 L-9,3.5 M-3,-3.5 L-3,3.5 M3,-3.5 L3,3.5" /></g>
          </g></g>
          <text class="ems-lbl ems-lbl--side" x="322" y="88"><tspan class="ems-idx">03 </tspan>Stockage</text>
        </g>
        <!-- 04 · EMS → Recharge VE -->
        <g class="ems-branch ems-b4" aria-hidden="true">
          <path class="ems-line" pathLength="1" d="M328,234 C388,196 408,178 438,152" />
          <g class="ems-arr" transform="translate(438,152) rotate(-37)"><path d="M-7,-3.5 L0,0 L-7,3.5" /></g>
          <path class="ems-pulse" pathLength="1" d="M328,234 C388,196 408,178 438,152" style="--pd:2.1s" />
          <g transform="translate(476,122)"><g class="ems-node">
            <circle class="ems-node-ring" r="34" />
            <circle class="ems-node-bg" r="28" />
            <g class="ems-ico"><rect x="-11" y="-14.5" width="14.5" height="29" rx="3" /><rect x="-7.6" y="-10.5" width="7.7" height="5.5" rx="1.2" /><path d="M4,-6 q6.2,0 6.2,6.2 l0,7" /><circle cx="10.2" cy="9.5" r="2.4" /></g>
          </g></g>
          <text class="ems-lbl" x="476" y="186"><tspan class="ems-idx">04 </tspan>Recharge VE</text>
        </g>
        <!-- 05 · EMS → Bâtiment -->
        <g class="ems-branch ems-b5" aria-hidden="true">
          <path class="ems-line" pathLength="1" d="M328,306 C388,344 408,362 438,388" />
          <g class="ems-arr" transform="translate(438,388) rotate(37)"><path d="M-7,-3.5 L0,0 L-7,3.5" /></g>
          <path class="ems-pulse" pathLength="1" d="M328,306 C388,344 408,362 438,388" style="--pd:2.35s" />
          <g transform="translate(476,418)"><g class="ems-node">
            <circle class="ems-node-ring" r="34" />
            <circle class="ems-node-bg" r="28" />
            <g class="ems-ico"><path d="M-12,13 L-12,-10.5 L12,-10.5 L12,13 M-14.5,13 L14.5,13" /><rect x="-8.25" y="-6.5" width="4.5" height="4.5" /><rect x="0.75" y="-6.5" width="4.5" height="4.5" /><rect x="-8.25" y="1" width="4.5" height="4.5" /><rect x="0.75" y="1" width="4.5" height="4.5" /></g>
          </g></g>
          <text class="ems-lbl" x="476" y="482"><tspan class="ems-idx">05 </tspan>Bâtiment</text>
        </g>
        <!-- hub -->
        <g aria-hidden="true" transform="translate(280,270)"><g class="ems-hub-g">
          <rect class="ems-hub" x="-48" y="-48" width="96" height="96" rx="18" />
          <text class="ems-hub-lbl" y="7">EMS</text>
          <text class="ems-hub-sub" y="27">PILOTAGE</text>
        </g></g>
      </svg>

        <button
          type="button"
          class="ems-info"
          :class="{ open: infoOpen }"
          :aria-expanded="infoOpen"
          aria-controls="ems-usecase"
          aria-label="Voir un cas d'usage de l'EMS"
          @click="infoOpen = !infoOpen"
        >i</button>

        <div v-show="infoOpen" id="ems-usecase" class="ems-pop" role="region" aria-label="Cas d'usage de l'EMS">
          <div class="ems-pop-head">
            <span class="ems-pop-k">Cas d'usage</span>
            <button type="button" class="ems-pop-x" aria-label="Fermer" @click="infoOpen = false">×</button>
          </div>
          <p class="ems-pop-t">18&nbsp;h — la flotte rentre.</p>
          <p>Plutôt que de tout recharger d'un coup et de faire bondir votre pointe de puissance, l'EMS lisse la charge sur la nuit&nbsp;: d'abord le solaire stocké dans la journée, puis le réseau aux heures creuses.</p>
          <p class="ems-pop-out">Au matin, les véhicules sont prêts — au meilleur coût, sans dépasser votre puissance souscrite.</p>
        </div>
      </div>

      <div class="ems-cap2">
        <span class="ems-cap2-k">EMS — Energy Management System</span>
        <p>Le « cerveau » qui arbitre vos flux d'énergie : production (réseau, solaire), stockage et usages (recharge, bâtiment) — pour un kWh toujours au meilleur coût.</p>
      </div>
    </div>
  </div>
</section>

<section class="section section--tight section--light">
  <div class="wrap">
    <div class="statbar reveal">
      <div class="stat"><div class="num"><span class="qual" aria-hidden="true">&nbsp;</span><span data-count="1">1</span></div><div class="lbl">Seul interlocuteur, du diagnostic à l'exploitation</div></div>
      <div class="stat"><div class="num"><span class="qual">Jusqu'à</span><span class="tabnum" data-count="70" data-prefix="−" data-suffix="%">−70%</span></div><div class="lbl">sur le coût de recharge sur site vs borne publique</div></div>
      <div class="stat"><div class="num"><span class="qual">Jusqu'à</span><span class="tabnum" data-count="1500" data-suffix=" €">1 500 €</span></div><div class="lbl">de taxes annuelles (ex-TVS) évitées par véhicule électrique / an</div></div>
      <div class="stat"><div class="num"><span class="qual" aria-hidden="true">&nbsp;</span><span class="tabnum" data-count="3" data-suffix=" ans">3 ans</span></div><div class="lbl">Projection chiffrée avant toute décision</div></div>
    </div>
    <p class="disclaimer reveal">Ordres de grandeur secteur et barèmes fiscaux au 01/01/2026, formulés « jusqu'à » et donnés à titre indicatif — à confirmer selon votre situation.</p>
  </div>
</section>

<!-- Orchestration — 6 échanges continus vs 1 seul interlocuteur (impulsions animées). -->
<section class="section bg-1" id="orchestration-echanges" style="border-top:1px solid var(--line-soft)">
  <div class="wrap">
    <div class="sec-head reveal"><span class="kicker">L'orchestration</span><h2>Un seul interlocuteur, au lieu de six échanges continus.</h2><p class="lede">Aujourd'hui, le vrai coût n'est pas seulement financier : c'est aussi le temps, les relances, les validations et les arbitrages entre plusieurs prestataires. Avec OTONOM, votre entreprise échange avec un seul interlocuteur, qui coordonne les 6 autres à votre place.</p></div>
    <div class="compare compare--v4">
      <!-- CARTE GAUCHE — sans OTONOM : 6 échanges continus, un point fait l'aller-retour sur chaque ligne -->
      <figure class="compare-panel reveal">
        <span class="compare-tag">Sans OTONOM</span>
        <svg class="o4-schema" viewBox="0 0 580 330" role="img" aria-label="Schéma : sans OTONOM, votre entreprise échange en continu avec chacun des six prestataires — installateur, opérateur de bornes, leasing, fournisseur d'énergie, conseil fiscal, maintenance. Six flux de communication permanents à gérer.">
          <g aria-hidden="true">
            <path class="o4-line" d="M188,170 L400,40"/>
            <path class="o4-line" d="M188,170 L400,92"/>
            <path class="o4-line" d="M188,170 L400,144"/>
            <path class="o4-line" d="M188,170 L400,196"/>
            <path class="o4-line" d="M188,170 L400,248"/>
            <path class="o4-line" d="M188,170 L400,300"/>
          </g>
          <g aria-hidden="true">
            <rect class="o4-chip" x="8" y="150" width="180" height="40" rx="10"/>
            <text class="o4-chiplbl" x="98" y="174">VOTRE ENTREPRISE</text>
            <circle class="o4-node" cx="400" cy="40" r="4"/><text class="o4-lbl--r" x="414" y="43.5">INSTALLATEUR</text>
            <circle class="o4-node" cx="400" cy="92" r="4"/><text class="o4-lbl--r" x="414" y="95.5">OPÉRATEUR DE BORNES</text>
            <circle class="o4-node" cx="400" cy="144" r="4"/><text class="o4-lbl--r" x="414" y="147.5">LEASING / LLD</text>
            <circle class="o4-node" cx="400" cy="196" r="4"/><text class="o4-lbl--r" x="414" y="199.5">FOURNISSEUR D'ÉNERGIE</text>
            <circle class="o4-node" cx="400" cy="248" r="4"/><text class="o4-lbl--r" x="414" y="251.5">CONSEIL FISCAL</text>
            <circle class="o4-node" cx="400" cy="300" r="4"/><text class="o4-lbl--r" x="414" y="303.5">MAINTENANCE</text>
          </g>
          <g aria-hidden="true">
            <path class="o4-pulse o4-pulse--ar" pathLength="1" d="M188,170 L400,40" style="animation-delay:-.1s"/>
            <path class="o4-pulse o4-pulse--ar" pathLength="1" d="M188,170 L400,92" style="animation-delay:-.6s"/>
            <path class="o4-pulse o4-pulse--ar" pathLength="1" d="M188,170 L400,144" style="animation-delay:-1.1s"/>
            <path class="o4-pulse o4-pulse--ar" pathLength="1" d="M188,170 L400,196" style="animation-delay:-1.6s"/>
            <path class="o4-pulse o4-pulse--ar" pathLength="1" d="M188,170 L400,248" style="animation-delay:-2.1s"/>
            <path class="o4-pulse o4-pulse--ar" pathLength="1" d="M188,170 L400,300" style="animation-delay:-2.6s"/>
          </g>
        </svg>
        <div class="o4-concl">
          <div class="o4-big"><span class="o4-bignum" data-count="6">6</span><span class="o4-bigtxt">échanges discontinus </span></div>
          <div class="o4-sub2">avec 6 prestataires</div>
          <ul class="o4-recap"><li>6 contrats</li><li>6 factures</li><li>6 négociations</li><li>6 responsabilités</li></ul>
          <p class="o4-cap">Chaque prestataire implique ses propres échanges, validations, documents et responsabilités.</p>
        </div>
      </figure>
      <!-- CARTE DROITE — avec OTONOM : un seul échange actif (entreprise ↔ OTONOM), branches blanches permanentes -->
      <figure class="compare-panel compare-panel--after reveal">
        <span class="compare-tag">Avec OTONOM</span>
        <svg class="o4-schema" viewBox="0 0 580 330" role="img" aria-label="Schéma : avec OTONOM, votre entreprise n'échange qu'avec un seul interlocuteur, OTONOM, qui coordonne les six prestataires. Un seul point de contact côté client.">
          <g aria-hidden="true">
            <path class="o4-line o4-line--main" d="M188,170 L236,170"/>
            <path class="o4-line--branch" d="M340,170 C362,170 362,40 396,40"/>
            <path class="o4-line--branch" d="M340,170 C362,170 362,92 396,92"/>
            <path class="o4-line--branch" d="M340,170 C362,170 362,144 396,144"/>
            <path class="o4-line--branch" d="M340,170 C362,170 362,196 396,196"/>
            <path class="o4-line--branch" d="M340,170 C362,170 362,248 396,248"/>
            <path class="o4-line--branch" d="M340,170 C362,170 362,300 396,300"/>
          </g>
          <g aria-hidden="true">
            <rect class="o4-chip" x="8" y="150" width="180" height="40" rx="10"/>
            <text class="o4-chiplbl" x="98" y="174">VOTRE ENTREPRISE</text>
            <rect class="o4-obox" x="236" y="145" width="104" height="50" rx="12"/>
            <text class="o4-otonom" x="288" y="175">OTONOM</text>
            <circle class="o4-node" cx="400" cy="40" r="4"/><text class="o4-lbl--r" x="414" y="43.5">INSTALLATEUR</text>
            <circle class="o4-node" cx="400" cy="92" r="4"/><text class="o4-lbl--r" x="414" y="95.5">OPÉRATEUR DE BORNES</text>
            <circle class="o4-node" cx="400" cy="144" r="4"/><text class="o4-lbl--r" x="414" y="147.5">LEASING / LLD</text>
            <circle class="o4-node" cx="400" cy="196" r="4"/><text class="o4-lbl--r" x="414" y="199.5">FOURNISSEUR D'ÉNERGIE</text>
            <circle class="o4-node" cx="400" cy="248" r="4"/><text class="o4-lbl--r" x="414" y="251.5">CONSEIL FISCAL</text>
            <circle class="o4-node" cx="400" cy="300" r="4"/><text class="o4-lbl--r" x="414" y="303.5">MAINTENANCE</text>
          </g>
          <g aria-hidden="true">
            <path class="o4-pulse o4-pulse--ar" pathLength="1" d="M188,170 L236,170"/>
            <path class="o4-pulse o4-pulse--branch" pathLength="1" d="M340,170 C362,170 362,40 396,40" style="animation-delay:0s"/>
            <path class="o4-pulse o4-pulse--branch" pathLength="1" d="M340,170 C362,170 362,92 396,92" style="animation-delay:.04s"/>
            <path class="o4-pulse o4-pulse--branch" pathLength="1" d="M340,170 C362,170 362,144 396,144" style="animation-delay:.08s"/>
            <path class="o4-pulse o4-pulse--branch" pathLength="1" d="M340,170 C362,170 362,196 396,196" style="animation-delay:.12s"/>
            <path class="o4-pulse o4-pulse--branch" pathLength="1" d="M340,170 C362,170 362,248 396,248" style="animation-delay:.16s"/>
            <path class="o4-pulse o4-pulse--branch" pathLength="1" d="M340,170 C362,170 362,300 396,300" style="animation-delay:.2s"/>
          </g>
        </svg>
        <div class="o4-concl">
          <div class="o4-big"><span class="o4-bignum">1</span><span class="o4-bigtxt">seul interlocuteur</span></div>
          <div class="o4-sub2">Un échange simple et rapide</div>
          <p class="o4-recap-line">OTONOM centralise, coordonne et suit les 6 prestataires pour vous.</p>
          <p class="o4-cap">Une seule relation à piloter. Le reste est orchestré par OTONOM.</p>
        </div>
      </figure>
    </div>
  </div>
</section>

<section class="photoband" aria-label="Recharge de véhicules électriques sur site">
  <img src="/assets/img/flotte-entreprise-rechargement.png" alt="Recharge d'un véhicule électrique sur site" loading="lazy" decoding="async" />
  <div class="wrap"><span class="cap">Mobilité, recharge, énergie : le tout réunies sur un même site.</span></div>
</section>

<section class="section section--light">
  <div class="wrap">
    <div class="sec-head reveal"><span class="kicker">Ce que nous faisons</span><h2>Piloter, optimiser, déléguer.</h2><p class="lede">Trois promesses qui structurent tout notre accompagnement.</p></div>
    <div class="grid grid--3">
      <article class="card reveal"><div class="idx">01</div><h3>Piloter</h3><p>On coordonne tous les prestataires à votre place. Vous gardez la vision, sans gérer la complexité : méthode A→Z, interlocuteur unique, bilans réguliers.</p></article>
      <article class="card reveal"><div class="idx">02</div><h3>Optimiser</h3><p>On baisse vos coûts financiers, fiscaux, énergétiques et opérationnels. Fiscalité, TCO, avantage en nature, ROI recharge — chiffrés et projetés sur 3 ans.</p></article>
      <article class="card reveal"><div class="idx">03</div><h3>Déléguer</h3><p>Un seul interlocuteur, du diagnostic à l'exploitation. Coordination des prestataires, supervision et maintenance déléguées : zéro panne subie.</p></article>
    </div>
  </div>
</section>

<section class="section bg-1" id="pour-qui">
  <div class="wrap">
    <div class="sec-head reveal"><span class="kicker">Pour qui</span><h2>Un discours par décideur.</h2><p class="lede">La transition mobilité concerne plusieurs métiers de l'entreprise. Nous parlons à chacun son langage — cliquez pour votre page dédiée.</p></div>
    <div class="grid grid--4">
      <a class="persona reveal" href="/dirigeants"><div class="who">Dirigeants</div><h3>Vision &amp; délégation</h3><p>Une transformation pilotée de bout en bout, des économies visibles et une image responsable — sans y consacrer votre temps.</p><span class="more">Voir la page <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>
      <a class="persona reveal" href="/daf"><div class="who">DAF</div><h3>Chiffres &amp; risque</h3><p>TCO, projection 3 ans, ROI en mois, taxes évitées, risque maîtrisé. Vous décidez avec des chiffres, pas des intuitions.</p><span class="more">Voir la page <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>
      <a class="persona reveal" href="/drh"><div class="who">DRH</div><h3>Avantages &amp; attractivité</h3><p>Le véhicule électrique comme avantage moderne et peu fiscalisé : avantage en nature optimisé, charges allégées.</p><span class="more">Voir la page <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>
      <a class="persona reveal" href="/services-generaux"><div class="who">Services généraux</div><h3>Exploitation sereine</h3><p>Moins de prestataires, recharge qui ne sature pas le site, supervision et maintenance déléguées, support utilisateurs.</p><span class="more">Voir la page <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>
    </div>
  </div>
</section>

<!-- Méthode — frise continue « De A à Z » en 5 étapes. -->
<section class="section section--light" id="methode-frise">
  <div class="wrap">
    <div class="sec-head reveal"><span class="kicker">La méthode</span><h2>De A à Z, en cinq étapes.</h2><p class="lede">Un fil continu, du premier diagnostic au suivi dans la durée — sans rupture ni relais perdu.</p></div>
    <ol class="tl reveal">
      <li class="tl-step">
        <span class="tl-tag tl-tag--free">Gratuit</span>
        <span class="tl-node" aria-hidden="true">01</span>
        <h3>Diagnostic</h3>
        <p>État des lieux de votre flotte, de vos sites et de votre facture énergie.</p>
      </li>
      <li class="tl-step">
        <span class="tl-node" aria-hidden="true">02</span>
        <h3>Plan chiffré</h3>
        <p>Recommandations et arbitrages, avec projection financière et fiscale sur 3 ans.</p>
      </li>
      <li class="tl-step">
        <span class="tl-node" aria-hidden="true">03</span>
        <h3>Coordination</h3>
        <p>Nous sélectionnons et pilotons les prestataires à votre place.</p>
      </li>
      <li class="tl-step">
        <span class="tl-node" aria-hidden="true">04</span>
        <h3>Déploiement</h3>
        <p>Mise en œuvre concrète : véhicules, recharge, énergie, financement.</p>
      </li>
      <li class="tl-step">
        <span class="tl-tag tl-tag--loop">En continu</span>
        <span class="tl-node" aria-hidden="true">05</span>
        <h3>Optimisation &amp; suivi</h3>
        <p>Supervision déléguée, bilans réguliers et amélioration continue.</p>
      </li>
    </ol>
    <div style="margin-top:44px" class="reveal"><a class="back-link" href="/methode" style="color:var(--ink)">Voir la méthode en détail <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>
  </div>
</section>

<section class="photoband" aria-label="Recharge de véhicules électriques sur site">
  <img src="/assets/img/flotte-entreprise.png" alt="La transition se vit au quotidien." loading="lazy" decoding="async" />
  <div class="wrap"><span class="cap">La transition se vit au quotidien.</span></div>
</section>

<section class="section bg-1">
  <div class="wrap">
    <div class="sec-head sec-head--center reveal">
      <span class="kicker">Verdissement obligatoire · flottes ≥ 100 véhicules</span>
      <h2>Ne pas électrifier devient un impôt.</h2>
      <p class="lede" style="margin-inline:auto">Depuis 2025, la taxe annuelle incitative (TAI) frappe les flottes qui n'atteignent pas leur quota de véhicules à faibles émissions. Le tarif par véhicule manquant grimpe chaque année.</p>
    </div>
    <div class="statbar reveal" style="margin-top:48px">
      <div class="stat"><div class="num"><span class="tabnum" data-count="2000" data-suffix=" €">2 000 €</span></div><div class="lbl">par véhicule manquant — 2025</div></div>
      <div class="stat"><div class="num"><span class="tabnum" data-count="4000" data-suffix=" €">4 000 €</span></div><div class="lbl">par véhicule manquant — 2026</div></div>
      <div class="stat"><div class="num"><span class="tabnum" data-count="5000" data-suffix=" €">5 000 €</span></div><div class="lbl">par véhicule manquant — dès 2027</div></div>
      <div class="stat"><div class="num"><span class="tabnum" data-count="120000" data-suffix=" €">120 000 €</span></div><div class="lbl">exemple : 30 véhicules manquants × 4 000 € (2026)</div></div>
    </div>
    <p class="disclaimer reveal">Barème TAI au 01/01/2026, indicatif — à confirmer selon votre flotte. OTONOM sécurise votre trajectoire d'électrification pour l'éviter.</p>
    <div class="hero-cta reveal" style="margin-top:8px"><a class="btn btn--primary btn--lg" href="/contact">Évaluer mon exposition à la TAI <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>
  </div>
</section>

<section class="section bg-1">
  <div class="wrap">
    <div class="cta-block reveal">
      <span class="kicker" style="justify-content:center">Diagnostic gratuit · sans engagement</span>
      <h2>L'autonomie de votre entreprise commence par un diagnostic.</h2>
      <p class="lede">Un échange court pour comprendre vos enjeux, puis un plan chiffré. Confidentiel, sans engagement et sans spam.</p>
      <div class="hero-cta"><a class="btn btn--primary btn--lg" href="/contact">Réserver mon audit gratuit <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a><a class="btn btn--ghost btn--lg" href="/contact">Être rappelé</a></div>
    </div>
  </div>
</section>
</template>

<script setup lang="ts">
useSeoMeta({
  "title": "OTONOM — Un seul interlocuteur pour la mobilité, la recharge et l'énergie de votre entreprise",
  "description": "OTONOM orchestre de A à Z la transition mobilité, recharge et énergie des entreprises. Un seul interlocuteur, des résultats chiffrés, sans complexité. Diagnostic gratuit."
})

// Cas d'usage de l'EMS (bouton « i » sur le coin du hub)
const infoOpen = ref(false)
const stageEl = ref<HTMLElement | null>(null)

const onDocClick = (e: MouseEvent) => {
  if (!infoOpen.value) return
  if (stageEl.value && !stageEl.value.contains(e.target as Node)) infoOpen.value = false
}
const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') infoOpen.value = false }

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
})
</script>

<!-- Styles hero V2 (texte + schéma EMS clair) — scopés à cette page -->
<style scoped>
/* — grille du hero : texte à gauche, schéma à droite — */
.hero--ems .wrap { display: grid; grid-template-columns: minmax(0, 1.04fr) minmax(0, .96fr); column-gap: clamp(28px, 4.5vw, 64px); align-items: center; }
.hero--ems .wrap > * { grid-column: 1; min-width: 0; }
.hero--ems h1 { font-size: clamp(30px, 3.5vw, 48px); }
.hero--ems .ems-hero { grid-column: 2; grid-row: 1 / span 5; }
@media (max-width: 980px) {
  .hero--ems .wrap { grid-template-columns: 1fr; }
  .hero--ems .ems-hero { grid-column: 1; grid-row: auto; margin-top: clamp(26px, 5vw, 40px); max-width: 520px; width: 100%; justify-self: center; }
}

/* — schéma (thème clair : traits sombres, hub noir) — */
.ems-schema { width: 100%; height: auto; display: block; }

/* — Cas d'usage : bouton « i » ancré sur le coin haut-droit du hub — */
/* Le hub occupe (232,222)→(328,318) dans un viewBox de 560×540 : son coin
   haut-droit tombe donc à 328/560 = 58.57% et 222/540 = 41.11%. En %, le bouton
   suit le SVG quand il se réduit, tout en gardant une taille de clic fixe. */
.ems-stage { position: relative; }
.ems-info {
  position: absolute; left: 58.57%; top: 41.11%; transform: translate(-50%, -50%);
  width: 26px; height: 26px; border-radius: 50%; z-index: 3; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--ff-display); font-size: 14px; font-weight: 600; line-height: 1;
  color: var(--ink); background: var(--l-bg1); border: 1px solid var(--line);
  box-shadow: 0 2px 10px rgba(0, 0, 0, .16);
  /* Pas d'animation d'apparition : c'est un contrôle cliquable, il doit être
     visible de façon inconditionnelle (une anim qui ne jouerait pas le rendrait
     invisible donc inutilisable). */
  transition: background .2s ease, color .2s ease, border-color .2s ease;
}
.ems-info:hover, .ems-info.open { background: var(--ink); color: var(--l-bg1); border-color: var(--ink); }
.ems-info:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }

.ems-pop {
  position: absolute; top: 47%; right: 0; z-index: 4;
  width: min(300px, 94%);
  background: var(--l-bg1); border: 1px solid var(--line); border-radius: var(--radius);
  padding: 16px 18px 18px; box-shadow: 0 14px 40px -12px rgba(0, 0, 0, .3);
}
.ems-pop-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
.ems-pop-k { font-family: var(--ff-mono); font-size: 10px; letter-spacing: .18em; text-transform: uppercase; color: var(--muted-2); }
.ems-pop-x { background: none; border: 0; padding: 0 2px; font-size: 17px; line-height: 1; color: var(--muted-2); cursor: pointer; }
.ems-pop-x:hover { color: var(--ink); }
.ems-pop-t { font-family: var(--ff-display); font-size: 14.5px; font-weight: 600; color: var(--ink); margin: 0 0 7px; }
.ems-pop p { font-size: 12.5px; line-height: 1.6; color: var(--muted); margin: 0 0 8px; }
.ems-pop-out { color: var(--ink-soft) !important; border-top: 1px solid var(--line-soft); padding-top: 9px; margin-bottom: 0 !important; }
.ems-cross path { stroke: var(--muted-2); stroke-width: 1; opacity: 0; transition: opacity .8s ease 1.5s; }
.ems-orbit { fill: none; stroke: var(--line-soft); stroke-width: 1; stroke-dasharray: 3 7; opacity: 0; transition: opacity 1s ease .9s; transform-origin: center; transform-box: fill-box; }
.ems-halo { fill: none; stroke: var(--line-soft); stroke-width: 1; opacity: 0; transition: opacity 1s ease .75s; }
.ems-scan { fill: none; stroke: rgba(0, 0, 0, .38); stroke-width: 1.4; stroke-linecap: round; stroke-dasharray: .16 .84; opacity: 0; transition: opacity .9s ease .95s; transform-origin: center; transform-box: fill-box; }

.ems-hub { fill: var(--ink); }
.ems-hub-g { opacity: 0; transform: scale(.92); transform-box: fill-box; transform-origin: center; transition: opacity .7s ease .5s, transform .8s cubic-bezier(.16, 1, .3, 1) .5s; }
.ems-corn path { fill: none; stroke: rgba(0, 0, 0, .42); stroke-width: 1.2; }
.ems-hub-lbl { font-family: var(--ff-display); font-weight: 600; font-size: 25px; letter-spacing: .06em; fill: var(--l-bg1); text-anchor: middle; }
.ems-hub-sub { font-family: var(--ff-mono); font-size: 8px; letter-spacing: .3em; fill: rgba(255, 255, 255, .88); text-anchor: middle; }

.ems-line { fill: none; stroke: rgba(0, 0, 0, .30); stroke-width: 1.2; stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 1s cubic-bezier(.4, 0, .2, 1) var(--bd, .8s), stroke .25s ease; }
.ems-arr path { fill: none; stroke: rgba(0, 0, 0, .52); stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
.ems-arr, .ems-node, .ems-lbl { opacity: 0; transition: opacity .7s ease var(--bd, .8s); }
.ems-node { transform-box: fill-box; transform-origin: center; transform: scale(.85); transition: opacity .7s ease var(--bd, .8s), transform .8s cubic-bezier(.16, 1, .3, 1) var(--bd, .8s); }
.ems-b1 { --bd: .75s; } .ems-b2 { --bd: .9s; } .ems-b3 { --bd: 1.05s; } .ems-b4 { --bd: 1.2s; } .ems-b5 { --bd: 1.35s; }

.ems-node-ring { fill: none; stroke: var(--line-soft); stroke-width: 1; }
.ems-node-bg { fill: var(--bg-1); stroke: var(--line); stroke-width: 1; transition: stroke .25s ease; }
.ems-ico, .ems-ico path, .ems-ico rect, .ems-ico circle { fill: none; stroke: var(--ink); stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.ems-ico .ems-ico--f, .ems-ico--f { fill: var(--ink); stroke: none; }
.ems-lbl { font-family: var(--ff-mono); font-size: 12px; letter-spacing: .12em; text-transform: uppercase; fill: var(--ink); text-anchor: middle; }
.ems-lbl--side { text-anchor: start; }
.ems-idx { fill: var(--ink-soft); letter-spacing: .08em; }

.ems-branch:hover .ems-line { stroke: rgba(0, 0, 0, .6); }
.ems-branch:hover .ems-node-bg { stroke: rgba(0, 0, 0, .45); }
.ems-branch:hover .ems-lbl { fill: var(--ink); }

.ems-pulse { fill: none; stroke: var(--ink); stroke-width: 1.8; stroke-linecap: round; stroke-dasharray: .14 3; opacity: 0; filter: drop-shadow(0 0 2.5px rgba(0, 0, 0, .45)); }

/* Sur petit écran le SVG est réduit (~0.6×), donc les libellés tomberaient à ~7px
   réels : on remonte leur taille dans le viewBox pour compenser. */
@media (max-width: 560px) {
  .ems-lbl { font-size: 15px; }
  /* Agrandis, les libellés du haut s'élargissent et frôlent la flèche 04 :
     on les descend (les deux, pour qu'ils restent alignés entre eux). */
  .ems-b1 .ems-lbl, .ems-b4 .ems-lbl { transform: translateY(10px); }
}

/* — légende sous le schéma — */
.ems-cap2 { margin-top: clamp(12px, 1.8vw, 18px); padding-top: 13px; border-top: 1px solid var(--line-soft); }
.ems-cap2-k { display: block; font-family: var(--ff-mono); font-size: 10.5px; letter-spacing: .16em; text-transform: uppercase; color: var(--muted-2); margin-bottom: 6px; }
.ems-cap2 p { font-size: 13px; line-height: 1.55; color: var(--muted); margin: 0; }

/* — repli reduced-motion : tout visible et statique — */
@media (prefers-reduced-motion: reduce) {
  .ems-line { stroke-dashoffset: 0 !important; transition: none; }
  .ems-node, .ems-arr, .ems-lbl, .ems-hub-g, .ems-cross path { opacity: 1 !important; transform: none !important; transition: none; }
  .ems-orbit, .ems-halo { opacity: .5 !important; animation: none !important; }
  .ems-scan, .ems-pulse { animation: none !important; opacity: 0 !important; }
}
</style>

<!-- Révélation du schéma EMS (règles avec ancêtre html.* → bloc non scopé ; tout passe par .ems-hero, propre à cette page) -->
<style>
html.intro-in .hero--ems .wrap > .ems-hero.reveal { transition-delay: .68s; }
html.intro-in .ems-hero.in .ems-cross path { opacity: .45; }
html.intro-in .ems-hero.in .ems-orbit { opacity: .5; animation: ems-rot 80s linear infinite; }
html.intro-in .ems-hero.in .ems-halo { opacity: .55; }
html.intro-in .ems-hero.in .ems-scan { opacity: 1; animation: ems-rot 11s linear infinite; }
html.intro-in .ems-hero.in .ems-hub-g { opacity: 1; transform: scale(1); }
html.intro-in .ems-hero.in .ems-line { stroke-dashoffset: 0; }
html.intro-in .ems-hero.in .ems-arr,
html.intro-in .ems-hero.in .ems-lbl { opacity: 1; }
html.intro-in .ems-hero.in .ems-node { opacity: 1; transform: scale(1); }
html.intro-in .ems-hero.in .ems-pulse { animation: ems-flow 2.6s linear infinite; animation-delay: var(--pd, 1.4s); }
html:not(.js) .ems-hero .ems-line { stroke-dashoffset: 0; }
html:not(.js) .ems-hero .ems-node, html:not(.js) .ems-hero .ems-arr, html:not(.js) .ems-hero .ems-lbl,
html:not(.js) .ems-hero .ems-hub-g, html:not(.js) .ems-hero .ems-cross path { opacity: 1; transform: none; }
@keyframes ems-rot { to { transform: rotate(360deg); } }
@keyframes ems-flow { from { stroke-dashoffset: .14; opacity: 1; } to { stroke-dashoffset: -1.14; opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .ems-hero .ems-scan, .ems-hero .ems-pulse { animation: none !important; opacity: 0 !important; }
  .ems-hero .ems-orbit { animation: none !important; }
}
</style>
