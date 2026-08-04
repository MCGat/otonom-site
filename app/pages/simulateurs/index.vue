<template>
  <section class="page-intro section--light"><div class="wrap">
    <span class="kicker reveal">Simulateurs</span>
    <h1 class="reveal">Chiffrez votre transition avant de la décider.</h1>
    <p class="lede reveal">Quatre outils pour mettre un montant sur les décisions qui vous attendent&nbsp;: ce que votre transition peut rapporter, ce que coûte vraiment une flotte électrique, comment refacturer la recharge d'un collaborateur, et combien de bornes il vous faut.</p>
    <p class="sim-note reveal">Calcul immédiat dans votre navigateur. Résultats en <strong>ordres de grandeur indicatifs</strong>, affinés lors de votre audit gratuit.</p>
  </div></section>

  <section class="section"><div class="wrap">
    <ul class="sims">
      <li v-for="(s, k) in simulateurs" :key="s.titre" class="sim-card reveal" :class="{ 'is-soon': !s.url }">
        <span class="sim-card-n">{{ String(k + 1).padStart(2, '0') }}</span>

        <div class="sim-card-b">
          <div class="sim-card-h">
            <h2>{{ s.titre }}</h2>
            <span v-if="!s.url" class="sim-card-badge">Prochainement</span>
          </div>
          <p class="sim-card-p">{{ s.description }}</p>

          <ul class="sim-card-list">
            <li v-for="p in s.points" :key="p">{{ p }}</li>
          </ul>

          <NuxtLink v-if="s.url" :to="s.url" class="btn btn--primary sim-card-cta">
            {{ s.cta }}
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </NuxtLink>
          <p v-else class="sim-card-soon">
            En préparation. <NuxtLink to="/contact">Dites-nous si celui-ci vous intéresse</NuxtLink> — nous prévenons en priorité ceux qui l'attendent.
          </p>
        </div>
      </li>
    </ul>

    <div class="cta-block">
      <h2>Un chiffre, c'est un point de départ.</h2>
      <p class="lede">Ces simulateurs donnent des ordres de grandeur. L'audit gratuit les remplace par vos données réelles, et les transforme en plan.</p>
      <div class="hero-cta"><NuxtLink class="btn btn--primary btn--lg" to="/contact">Réserver mon audit gratuit <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6" /></svg></NuxtLink></div>
    </div>
  </div></section>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Simulateurs — OTONOM | Chiffrez votre transition mobilité & énergie',
  description: "Quatre simulateurs pour chiffrer votre transition : économies et ROI, coût total de possession d'une flotte électrique, refacturation de la recharge, dimensionnement des bornes."
})

const simulateurs = [
  {
    url: '/simulateurs/transition',
    titre: 'Simulateur de transition',
    description: "Le diagnostic large : ce que votre transition mobilité, recharge et énergie peut vous rapporter, et où vous en êtes aujourd'hui.",
    points: [
      'Économies annuelles et argent laissé sur la table',
      'Investissement, aides mobilisables et retour sur investissement',
      'Score de maturité sur 100, levier par levier'
    ],
    cta: 'Estimer mes gains'
  },
  {
    url: null,
    titre: 'Simulateur de TCO flotte électrique',
    description: "Le coût total de possession d'une flotte électrique, bornes et raccordement compris — et le moment précis où vous devenez gagnant.",
    points: [
      'Comparaison poste par poste avec la même flotte restée thermique',
      "Infrastructure de recharge incluse, ce qu'aucun autre outil ne fait",
      'Bascule de trésorerie et coût au kilomètre'
    ],
    cta: null
  },
  {
    url: null,
    titre: "Coût & refacturation de la recharge d'un collaborateur",
    description: "Quand un salarié recharge chez lui, qui paie quoi ? Le coût réel, le juste remboursement et son traitement social.",
    points: [
      'Coût réel de la recharge à domicile, heures creuses comprises',
      'Montant de remboursement et traitement en avantage en nature',
      'Comparaison avec la recharge sur site et en itinérance'
    ],
    cta: null
  },
  {
    url: null,
    titre: 'Combien de bornes pour mon camping ou mon hôtel ?',
    description: 'Le dimensionnement d\'une infrastructure de recharge pour accueillir des clients, sans surinvestir ni décevoir.',
    points: [
      'Nombre de points de charge selon la fréquentation et les rotations',
      'Puissance à installer et impact sur votre raccordement',
      'Investissement, exploitation et recettes possibles'
    ],
    cta: null
  }
]
</script>

<style scoped>
.sims { list-style: none; margin: 0; padding: 0; display: grid; gap: 1px; background: var(--line); border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden; }

.sim-card { background: var(--bg); display: grid; grid-template-columns: auto 1fr; gap: clamp(18px, 3vw, 34px); padding: clamp(26px, 4vw, 40px); }
.sim-card.is-soon { background: var(--bg-1); }

.sim-card-n { font-family: var(--ff-mono); font-size: 12px; color: var(--muted-2); letter-spacing: .1em; padding-top: 6px; }

.sim-card-h { display: flex; align-items: baseline; gap: 16px; flex-wrap: wrap; }
.sim-card-h h2 { font-size: clamp(20px, 2.8vw, 27px); line-height: 1.25; }
.sim-card.is-soon .sim-card-h h2 { color: var(--muted); }

.sim-card-badge {
  font-family: var(--ff-mono); font-size: 10px; letter-spacing: .12em; text-transform: uppercase;
  color: var(--muted-2); border: 1px solid var(--line); border-radius: 999px; padding: 5px 11px; white-space: nowrap;
}

.sim-card-p { margin-top: 12px; color: var(--muted); font-size: 15px; line-height: 1.65; max-width: 62ch; }

.sim-card-list { list-style: none; margin: 20px 0 0; padding: 0; display: grid; gap: 9px; }
.sim-card-list li { position: relative; padding-left: 22px; font-size: 14px; color: var(--muted); line-height: 1.55; }
.sim-card-list li::before { content: ''; position: absolute; left: 0; top: .62em; width: 11px; height: 1px; background: var(--ink); opacity: .55; }
.sim-card.is-soon .sim-card-list li::before { opacity: .3; }

.sim-card-cta { margin-top: 26px; }
.sim-card-soon { margin-top: 22px; font-size: 13.5px; color: var(--muted-2); line-height: 1.6; }
.sim-card-soon a { color: var(--ink); text-decoration: underline; text-underline-offset: 3px; }

@media (max-width: 640px) {
  .sim-card { grid-template-columns: 1fr; gap: 10px; }
  .sim-card-n { padding-top: 0; }
}
</style>
