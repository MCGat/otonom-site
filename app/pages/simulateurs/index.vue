<template>
  <section class="page-intro section--light"><div class="wrap">
    <span class="kicker reveal">Simulateurs</span>
    <h1 class="reveal">Chiffrez votre transition avant de la décider.</h1>
    <p class="lede reveal">Quatre outils pour mettre un montant sur les décisions qui vous attendent&nbsp;: ce que votre transition peut rapporter, ce que coûte vraiment une flotte électrique, comment refacturer la recharge d'un collaborateur, et combien de bornes il vous faut.</p>
    <p class="sim-note reveal">Calcul immédiat dans votre navigateur. Résultats en <strong>ordres de grandeur indicatifs</strong>, affinés lors de votre audit gratuit.</p>
  </div></section>

  <section class="section section--light"><div class="wrap">
    <ul class="sims">
      <li v-for="(s, k) in simulateurs" :key="s.titre" class="scard reveal" :class="{ 'is-soon': !s.url }">
        <div class="scard-top">
          <span class="scard-n">{{ String(k + 1).padStart(2, '0') }}</span>
          <span v-if="!s.url" class="scard-badge">Prochainement</span>
        </div>

        <h2 class="scard-t">{{ s.titre }}</h2>
        <p class="scard-p">{{ s.description }}</p>

        <ul class="scard-list">
          <li v-for="p in s.points" :key="p">{{ p }}</li>
        </ul>

        <div class="scard-foot">
          <NuxtLink v-if="s.url" :to="s.url" class="btn btn--primary scard-cta">
            {{ s.cta }}
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </NuxtLink>
          <p v-else class="scard-soon">
            En préparation. <NuxtLink to="/contact">Dites-nous s'il vous intéresse</NuxtLink> — nous prévenons en priorité ceux qui l'attendent.
          </p>
        </div>
      </li>
    </ul>

    <!-- À quoi sert un simulateur : cadrer l'attente avant de décevoir. -->
    <div class="sims-why">
      <div class="sims-why-c">
        <span class="kicker">Pourquoi ces outils</span>
        <h2>Un ordre de grandeur, tout de suite.</h2>
        <p>La plupart des décisions de transition se prennent sans chiffre — ou avec le chiffre de celui qui vend l'équipement. Ces simulateurs existent pour vous donner <strong>votre propre estimation</strong>, en quelques minutes, avant d'engager quoi que ce soit.</p>
        <p>Le calcul se fait <strong>dans votre navigateur</strong>&nbsp;: rien n'est envoyé tant que vous ne le demandez pas. Vous voyez le résultat, vous testez d'autres hypothèses, vous repartez avec une première idée — sans qu'on vous rappelle.</p>
      </div>

      <div class="sims-why-g">
        <div class="sims-why-i">
          <span class="sims-why-l">Ce qu'ils font</span>
          <p>Ils donnent une <strong>première idée chiffrée</strong>, fondée sur des barèmes officiels datés et des hypothèses de marché affichées. Assez pour savoir si un sujet mérite qu'on s'y attarde, pour arbitrer entre deux directions, ou pour arriver en réunion avec autre chose qu'une intuition.</p>
        </div>
        <div class="sims-why-i">
          <span class="sims-why-l">Ce qu'ils ne font pas</span>
          <p>Ils ne remplacent ni un devis, ni une étude. Les hypothèses sont des moyennes&nbsp;: vos prix négociés, vos usages réels et la configuration de vos sites feront bouger le résultat. C'est exactement ce que l'audit vient corriger.</p>
        </div>
        <div class="sims-why-i">
          <span class="sims-why-l">Comment les lire</span>
          <p>Les hypothèses sont <strong>affichées et modifiables</strong>. Si un chiffre vous semble faux pour votre cas, changez-le&nbsp;: tout se recalcule aussitôt. Un simulateur qu'on ne peut pas contredire ne sert à rien.</p>
        </div>
      </div>
    </div>

    <div class="cta-block">
      <h2>Un chiffre, c'est un point de départ.</h2>
      <p class="lede">L'audit gratuit remplace nos hypothèses par vos données réelles, et transforme l'estimation en plan. Un seul interlocuteur, de A à Z.</p>
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
    url: '/simulateurs/tco-flotte-electrique',
    titre: 'Simulateur de TCO flotte électrique',
    description: "Le coût total de possession d'une flotte électrique, bornes et raccordement compris — et le moment précis où vous devenez gagnant.",
    points: [
      'Comparaison poste par poste avec la même flotte restée thermique',
      'Infrastructure de recharge détaillée : points de charge, travaux, raccordement',
      'Bascule de trésorerie et coût au kilomètre'
    ],
    cta: 'Calculer mon TCO'
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
    description: "Le dimensionnement d'une infrastructure de recharge pour accueillir des clients, sans surinvestir ni décevoir.",
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
/* ── Grille de cartes : 3 par ligne sur ordinateur ── */
.sims {
  list-style: none; margin: 0; padding: 0;
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
}

/* Les cartes sont des îlots SOMBRES posés sur la section claire : on rebascule
   leurs tokens vers le miroir --d-* et tout le contenu s'inverse tout seul. */
.scard {
  --bg: var(--d-bg); --bg-1: var(--d-bg1); --bg-2: var(--d-bg2);
  --ink: var(--d-ink); --ink-soft: var(--d-ink-soft); --muted: var(--d-muted); --muted-2: var(--d-muted2);
  --line: rgba(255, 255, 255, .14); --line-soft: rgba(255, 255, 255, .08);

  display: flex; flex-direction: column;
  background: var(--bg-1); color: var(--ink);
  border: 1px solid var(--line); border-radius: var(--radius);
  padding: clamp(24px, 2.6vw, 32px);
  transition: border-color .22s ease, transform .22s ease, box-shadow .22s ease;
}
/* Une carte disponible réagit au survol ; une carte à venir reste inerte. */
.scard:not(.is-soon):hover { border-color: var(--ink); transform: translateY(-2px); box-shadow: 0 18px 40px -24px rgba(0, 0, 0, .55); }
/* Les cartes à venir s'enfoncent d'un ton au lieu de s'éclaircir. */
.scard.is-soon { background: var(--bg); }
/* La section claire force un bouton noir : dans une carte noire, on le réinverse. */
.scard .btn--primary { background: var(--ink); color: var(--bg); }
.scard .btn--primary:hover { box-shadow: 0 0 30px -8px rgba(255, 255, 255, .35); }

.scard-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 24px; }
/* Sur fond noir, --muted-2 disparaît : le numéro et le badge montent d'un cran. */
.scard-n { font-family: var(--ff-mono); font-size: 13px; letter-spacing: .12em; color: var(--ink-soft); opacity: .75; }
.scard-badge {
  font-family: var(--ff-mono); font-size: 10px; letter-spacing: .14em; text-transform: uppercase;
  color: var(--ink); background: rgba(255, 255, 255, .09);
  border: 1px solid rgba(255, 255, 255, .34); border-radius: 999px;
  padding: 5px 11px; white-space: nowrap;
}

.scard-t { font-size: clamp(19px, 1.9vw, 23px); line-height: 1.28; margin-top: 18px; }
.scard.is-soon .scard-t { color: var(--muted); }

.scard-p { margin-top: 12px; font-size: 14.5px; color: var(--muted); line-height: 1.6; }

.scard-list { list-style: none; margin: 20px 0 0; padding: 0; display: grid; gap: 8px; }
.scard-list li { position: relative; padding-left: 20px; font-size: 13.5px; color: var(--muted); line-height: 1.5; }
.scard-list li::before { content: ''; position: absolute; left: 0; top: .6em; width: 10px; height: 1px; background: var(--ink); opacity: .55; }
.scard.is-soon .scard-list li::before { opacity: .3; }

/* Le pied colle en bas : les boutons s'alignent quelle que soit la hauteur du texte. */
.scard-foot { margin-top: auto; padding-top: 26px; }
.scard-cta { width: 100%; justify-content: center; }
.scard-soon { font-size: 13px; color: var(--muted); line-height: 1.6; }
.scard-soon a { color: var(--ink); text-decoration: underline; text-underline-offset: 3px; }

/* ── À quoi sert un simulateur ── */
.sims-why {
  margin-top: clamp(48px, 6vw, 80px); padding-top: clamp(36px, 4vw, 54px);
  border-top: 1px solid var(--line);
  display: grid; grid-template-columns: 1fr 1.15fr; gap: clamp(28px, 4vw, 56px);
}
.sims-why-c h2 { font-size: clamp(23px, 3vw, 32px); margin-top: 12px; max-width: 18ch; }
.sims-why-c p { margin-top: 16px; font-size: 15px; color: var(--muted); line-height: 1.7; max-width: 52ch; }
.sims-why-c p strong { color: var(--ink); font-weight: 600; }

.sims-why-g {
  display: grid; gap: 1px; align-content: start;
  background: var(--line); border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden;
}
.sims-why-i { background: var(--bg-1); padding: 22px 24px; }
.sims-why-l {
  display: block; font-family: var(--ff-mono); font-size: 10.5px; letter-spacing: .14em;
  text-transform: uppercase; color: var(--muted-2); margin-bottom: 10px;
}
.sims-why-i p { font-size: 14px; color: var(--muted); line-height: 1.65; }
.sims-why-i p strong { color: var(--ink); font-weight: 600; }

/* Le bloc d'appel n'a pas de marge propre : il collerait au bloc précédent. */
.cta-block { margin-top: clamp(48px, 6vw, 80px); }

@media (max-width: 1080px) {
  .sims { grid-template-columns: repeat(2, 1fr); }
  .sims-why { grid-template-columns: 1fr; }
}
@media (max-width: 660px) {
  .sims { grid-template-columns: 1fr; }
}
</style>
