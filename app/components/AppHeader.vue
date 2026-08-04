<template>
  <header class="site-header">
    <div class="wrap nav">
      <NuxtLink class="brand" to="/" aria-label="OTONOM — accueil"><OtonomLogo /></NuxtLink>

      <nav class="nav-links" :class="{ open: menuOpen }" aria-label="Navigation principale">
        <NuxtLink to="/expertises">Expertises</NuxtLink>
        <NuxtLink to="/methode">Méthode</NuxtLink>

        <!-- Simulateurs : survol au pointeur, focus au clavier, dépliage sur mobile -->
        <div
          class="nav-sim"
          :class="{ 'is-open': simOpen }"
          @mouseenter="ouvrir"
          @mouseleave="fermer"
        >
          <NuxtLink
            ref="declencheur"
            to="/simulateurs"
            class="nav-sim-trigger"
            :class="{ 'is-current': surSimulateur }"
            :aria-expanded="simOpen"
            aria-haspopup="true"
            @click="fermer"
            @keydown.escape="fermer"
          >
            Simulateurs
            <svg class="nav-sim-chev" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 9l6 6 6-6" /></svg>
          </NuxtLink>
          <!-- Sur mobile il n'y a pas de survol : un bouton dédié déplie la liste. -->
          <button
            type="button"
            class="nav-sim-toggle"
            :aria-expanded="simOpen"
            aria-label="Afficher les simulateurs"
            @click="simOpen = !simOpen"
          >
            <svg class="nav-sim-chev" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 9l6 6 6-6" /></svg>
          </button>

          <div class="nav-sim-panel" @keydown.escape="fermer">
            <div class="nav-sim-inner">
              <span class="nav-sim-eyebrow">Nos simulateurs</span>

              <NuxtLink
                v-for="(s, k) in simulateursDisponibles"
                :key="s.url"
                :to="s.url"
                class="nav-sim-item"
                :style="{ '--i': k }"
                @click="fermer"
              >
                <span class="nav-sim-n">{{ String(k + 1).padStart(2, '0') }}</span>
                <span class="nav-sim-txt">
                  <span class="nav-sim-line">
                    <b>{{ s.titre }}</b>
                    <svg class="nav-sim-go" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </span>
                  <em>{{ s.sous }}</em>
                </span>
              </NuxtLink>

              <span
                v-for="(s, k) in simulateursAVenir"
                :key="s.titre"
                class="nav-sim-item is-soon"
                :style="{ '--i': simulateursDisponibles.length + k }"
                aria-disabled="true"
              >
                <span class="nav-sim-n">{{ String(simulateursDisponibles.length + k + 1).padStart(2, '0') }}</span>
                <span class="nav-sim-txt">
                  <span class="nav-sim-line">
                    <b>{{ s.titre }}</b>
                    <span class="nav-sim-badge">Prochainement</span>
                  </span>
                  <em>{{ s.sous }}</em>
                </span>
              </span>
            </div>
          </div>
        </div>

        <NuxtLink to="/a-propos">À propos</NuxtLink>
        <NuxtLink to="/contact">Contact</NuxtLink>
      </nav>

      <div class="nav-actions">
        <NuxtLink class="btn btn--ghost" to="/contact">Être rappelé</NuxtLink>
        <NuxtLink class="btn btn--primary" to="/contact">Réserver mon audit</NuxtLink>
      </div>

      <button class="nav-toggle" :aria-expanded="menuOpen" aria-label="Ouvrir le menu" @click="menuOpen = !menuOpen">
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
const menuOpen = ref(false)
const simOpen = ref(false)
const declencheur = ref<HTMLElement | null>(null)
const route = useRoute()

const simulateursDisponibles = [
  {
    url: '/simulateurs/transition',
    titre: 'Simulateur de transition',
    sous: 'Économies, investissement, ROI et score de maturité'
  },
  {
    url: '/simulateurs/tco-flotte-electrique',
    titre: 'Simulateur de TCO flotte électrique',
    sous: 'Coût total de possession, recharge et infrastructure comprises'
  }
]

const simulateursAVenir = [
  {
    titre: 'Coût & refacturation de la recharge d\'un collaborateur',
    sous: 'Recharge à domicile, remboursement et traitement social'
  },
  {
    titre: 'Combien de bornes pour mon camping ou mon hôtel ?',
    sous: 'Dimensionnement selon la fréquentation et les rotations'
  }
]

const surSimulateur = computed(() => route.path.startsWith('/simulateurs'))

// Le survol ouvre au pointeur ; le clic sert au tactile et au clavier.
let fermeture: ReturnType<typeof setTimeout> | null = null
function ouvrir() {
  if (fermeture) { clearTimeout(fermeture); fermeture = null }
  simOpen.value = true
}
function fermer() {
  // Petit délai : sans lui, traverser l'espace entre le bouton et le panneau
  // referait disparaître le menu sous le curseur.
  fermeture = setTimeout(() => { simOpen.value = false }, 120)
}
watch(() => route.path, () => {
  menuOpen.value = false
  simOpen.value = false
})
</script>

<style scoped>
.nav-sim { position: relative; display: flex; align-items: center; }

/* ── Déclencheur ─────────────────────────────────────────────────────────── */
.nav-sim-trigger {
  display: inline-flex; align-items: center; gap: 6px;
  background: none; border: 0; padding: 6px 0; cursor: pointer;
  font-family: var(--ff-text); font-size: 14.5px; letter-spacing: .01em;
  color: var(--muted); transition: color .2s ease; position: relative;
}
.nav-sim-trigger:hover,
.nav-sim-trigger.is-current,
.nav-sim.is-open .nav-sim-trigger { color: var(--ink); }

/* Même soulignement que les autres liens de la barre. */
.nav-sim-trigger::after {
  content: ''; position: absolute; left: 0; bottom: -1px; width: 100%; height: 1.5px;
  background: currentColor; border-radius: 2px; opacity: .5;
  transform: scaleX(0); transform-origin: left center; transition: transform .22s ease;
}
.nav-sim-trigger:hover::after,
.nav-sim.is-open .nav-sim-trigger::after { transform: scaleX(1); }
.nav-sim-trigger.is-current::after { transform: scaleX(1); opacity: 1; }

.nav-sim-chev { width: 13px; height: 13px; transition: transform .32s cubic-bezier(.4, 0, .2, 1); }
.nav-sim.is-open .nav-sim-chev { transform: rotate(180deg); }

.nav-sim-toggle { display: none; background: none; border: 0; color: var(--muted); cursor: pointer; padding: 14px 0 14px 12px; }

/* ── Panneau ─────────────────────────────────────────────────────────────── */
.nav-sim-panel {
  position: absolute; top: calc(100% + 18px); left: 50%;
  width: min(468px, calc(100vw - 32px));
  transform: translateX(-50%);
  z-index: 60;
  /* Révélation en rideau, comme le préchargeur du site : le panneau se dévoile
     du haut vers le bas plutôt que d'apparaître d'un bloc. */
  clip-path: inset(0 0 100% 0);
  opacity: 0;
  pointer-events: none;
  transition: clip-path .42s cubic-bezier(.22, 1, .36, 1), opacity .2s ease;
}
.nav-sim.is-open .nav-sim-panel {
  clip-path: inset(0 0 0 0);
  opacity: 1;
  pointer-events: auto;
}

/* Zone tampon : évite que le menu se referme en traversant le vide. */
.nav-sim-panel::before {
  content: ''; position: absolute; left: 0; right: 0; top: -18px; height: 18px;
}

.nav-sim-inner {
  background: var(--bg-1);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 20px 8px 8px;
  box-shadow: 0 24px 60px -28px rgba(0, 0, 0, .55);
}

.nav-sim-eyebrow {
  display: block; padding: 0 16px 14px;
  font-family: var(--ff-mono); font-size: 10.5px; letter-spacing: .18em;
  text-transform: uppercase; color: var(--muted-2);
  border-bottom: 1px solid var(--line-soft); margin-bottom: 6px;
}

/* ── Entrées ─────────────────────────────────────────────────────────────── */
.nav-sim-item {
  display: grid; grid-template-columns: auto 1fr; align-items: start; gap: 14px;
  padding: 13px 16px; border-radius: calc(var(--radius) - 6px);
  text-decoration: none;
  /* Cascade : chaque entrée entre légèrement après la précédente. */
  opacity: 0; transform: translateY(6px);
  transition: opacity .34s ease, transform .34s cubic-bezier(.22, 1, .36, 1), background-color .2s ease;
  transition-delay: 0ms;
}
.nav-sim.is-open .nav-sim-item {
  opacity: 1; transform: none;
  transition-delay: calc(90ms + var(--i) * 55ms);
}
.nav-sim-item::after { display: none; }        /* neutralise le soulignement des liens de nav */

/* Survol : pastille encre pleine. `--bg-2` n'étant pas redéfini par le thème
   clair, il reste sombre — on inverse donc explicitement TOUT le contenu,
   sinon le titre en encre devient illisible sur le fond noir. */
a.nav-sim-item:hover,
a.nav-sim-item:focus-visible {
  background: var(--bg-2);
  outline: none;
}
a.nav-sim-item:hover .nav-sim-txt b,
a.nav-sim-item:focus-visible .nav-sim-txt b { color: #fff; }
a.nav-sim-item:hover .nav-sim-txt em,
a.nav-sim-item:focus-visible .nav-sim-txt em { color: rgba(255, 255, 255, .66); }
a.nav-sim-item:hover .nav-sim-n,
a.nav-sim-item:focus-visible .nav-sim-n { color: rgba(255, 255, 255, .45); }

.nav-sim-n {
  font-family: var(--ff-mono); font-size: 10.5px; color: var(--muted-2);
  padding-top: 3px; letter-spacing: .06em; transition: color .2s ease;
}
.nav-sim-txt { display: grid; gap: 3px; min-width: 0; }
.nav-sim-line { display: flex; align-items: center; gap: 10px; }
.nav-sim-line b { flex: 1; min-width: 0; }
.nav-sim-txt b {
  font-family: var(--ff-display); font-size: 14.5px; font-weight: 500;
  color: var(--ink); line-height: 1.35; transition: color .2s ease;
}
.nav-sim-txt em {
  font-style: normal; font-size: 12.5px; color: var(--muted-2); line-height: 1.45; transition: color .2s ease;
}

.nav-sim-go {
  width: 15px; height: 15px; flex: none; color: var(--muted-2);
  transform: translateX(-4px); opacity: 0;
  transition: transform .24s ease, opacity .24s ease;
}
a.nav-sim-item:hover .nav-sim-go,
a.nav-sim-item:focus-visible .nav-sim-go { transform: none; opacity: 1; color: #fff; }

/* ── À venir ─────────────────────────────────────────────────────────────── */
.nav-sim-item.is-soon { cursor: default; }
.nav-sim-item.is-soon .nav-sim-txt b { color: var(--muted); }
.nav-sim-item.is-soon .nav-sim-txt em { color: var(--muted-2); opacity: .75; }
.nav-sim-item.is-soon .nav-sim-n { opacity: .5; }

.nav-sim-badge {
  flex: none; white-space: nowrap;
  font-family: var(--ff-mono); font-size: 9.5px; letter-spacing: .1em; text-transform: uppercase;
  color: var(--muted-2); border: 1px solid var(--line); border-radius: 999px;
  padding: 4px 9px;
}

/* ── Mobile : plus de survol, le sous-menu se déplie dans le flux ────────── */
@media (max-width: 880px) {
  .nav-sim { display: block; width: 100%; border-bottom: 1px solid var(--line-soft); }
  .nav-sim { display: flex; flex-wrap: wrap; align-items: center; }
  .nav-sim-trigger { flex: 1; padding: 14px 0; font-size: 16px; border-bottom: 0; }
  .nav-sim-trigger::after { display: none; }
  .nav-sim-trigger .nav-sim-chev { display: none; }   /* porté par le bouton dédié */
  .nav-sim-toggle { display: block; }
  .nav-sim-panel { flex-basis: 100%; }

  .nav-sim-panel {
    position: static; transform: none; width: 100%;
    clip-path: none; opacity: 1; pointer-events: auto;
    display: grid; grid-template-rows: 0fr;
    transition: grid-template-rows .38s cubic-bezier(.4, 0, .2, 1);
  }
  .nav-sim.is-open .nav-sim-panel { grid-template-rows: 1fr; }
  .nav-sim-panel > .nav-sim-inner { overflow: hidden; min-height: 0; }

  .nav-sim-inner {
    background: none; border: 0; box-shadow: none;
    padding: 0; border-radius: 0;
  }
  .nav-sim-item:last-child { padding-bottom: 16px; }
  .nav-sim-eyebrow { padding: 0 0 10px; border-bottom: 0; }
  .nav-sim-item { padding: 11px 0; transition-delay: 0ms !important; opacity: 1; transform: none; }
  a.nav-sim-item:hover { background: none; }
  a.nav-sim-item:hover .nav-sim-txt b { color: var(--ink); }
  a.nav-sim-item:hover .nav-sim-txt em { color: var(--muted-2); }
  a.nav-sim-item:hover .nav-sim-n { color: var(--muted-2); }
  .nav-sim-go { display: none; }
}

/* Un utilisateur qui a demandé moins d'animation ne subit pas le rideau. */
@media (prefers-reduced-motion: reduce) {
  .nav-sim-panel, .nav-sim-item, .nav-sim-chev, .nav-sim-go { transition-duration: .01ms !important; }
  .nav-sim-item { transition-delay: 0ms !important; }
}
</style>
