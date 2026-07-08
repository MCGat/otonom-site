<template>
<section class="page-intro section--light"><div class="wrap">
  <span class="kicker reveal">La méthode</span>
  <h1 class="reveal">Une démarche claire, de A à Z.</h1>
  <p class="lede reveal">Du premier diagnostic au suivi dans la durée, vous gardez un seul interlocuteur et une vision chiffrée à chaque étape.</p>
</div></section>
<section class="section section--tight"><div class="wrap">
  <div class="steps">
    <div class="step reveal"><div class="n">01</div><div><h3>Diagnostic gratuit</h3><p>Nous faisons l'état des lieux de votre flotte, de vos sites et de votre facture d'énergie, et identifions les postes d'économies.</p></div></div>
    <div class="step reveal"><div class="n">02</div><div><h3>Plan chiffré</h3><p>Recommandations, arbitrages véhicules / fiscalité / recharge et projection financière sur 3 ans. Vous décidez avec des chiffres.</p></div></div>
    <div class="step reveal"><div class="n">03</div><div><h3>Coordination des prestataires</h3><p>Nous sélectionnons et pilotons installateurs, énergéticiens, financeurs et mainteneurs — à votre place.</p></div></div>
    <div class="step reveal"><div class="n">04</div><div><h3>Déploiement</h3><p>Mise en œuvre concrète et conduite du changement : véhicules, infrastructure de recharge, énergie, financement.</p></div></div>
    <div class="step reveal"><div class="n">05</div><div><h3>Optimisation &amp; suivi</h3><p>Supervision déléguée, bilans réguliers et amélioration continue pour tenir les gains dans le temps.</p></div></div>
  </div>
</div></section>
<!-- Orchestration (identique à la home) — couleurs INVERSÉES via filter:invert(1)
     pour coller au fond clair de cette page (l'exact négatif de la section d'accueil). -->
<section class="section bg-1" style="border-top:1px solid var(--line-soft);filter:invert(1)">
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
          <div class="o4-big"><span class="o4-bignum" data-count="6">6</span><span class="o4-bigtxt">échanges continus (fragmentés)</span></div>
          <div class="o4-sub2">avec 6 prestataires</div>
          <ul class="o4-recap"><li>6 contrats</li><li>6 factures</li><li>6 négociations</li><li>6 responsabilités</li></ul>
          <p class="o4-cap">Chaque prestataire implique ses propres échanges, validations, documents et responsabilités.</p>
        </div>
      </figure>
      <!-- CARTE DROITE — avec OTONOM : un seul échange actif (entreprise ↔ OTONOM), branches permanentes -->
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
          <div class="o4-sub2">1 échange côté client</div>
          <p class="o4-recap-line">OTONOM centralise, coordonne et suit les 6 prestataires pour vous.</p>
          <p class="o4-cap">Une seule relation à piloter. Le reste est orchestré par OTONOM.</p>
        </div>
      </figure>
    </div>
  </div>
</section>
<section class="section"><div class="wrap"><div class="cta-block reveal"><h2>Prêt à lancer votre diagnostic&nbsp;?</h2><p class="lede">Un échange court, confidentiel et sans engagement pour démarrer.</p><div class="hero-cta"><a class="btn btn--primary btn--lg" href="/contact">Réserver mon audit gratuit <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a><a class="btn btn--ghost btn--lg" href="/expertises">Voir nos expertises</a></div></div></div></section>
</template>

<script setup lang="ts">
useSeoMeta({
  "title": "Méthode — OTONOM | Diagnostic, plan chiffré, coordination, déploiement, suivi",
  "description": "La méthode A→Z d'OTONOM : diagnostic gratuit, plan chiffré sur 3 ans, coordination des prestataires, déploiement, optimisation et suivi. Un seul interlocuteur."
})
</script>
