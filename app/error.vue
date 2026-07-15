<template>
  <main class="err">
    <div class="err-grid" aria-hidden="true" />

    <button type="button" class="err-brand" aria-label="OTONOM — accueil" @click="goHome"><OtonomLogo /></button>

    <div class="err-inner">
      <span class="err-kicker">Erreur {{ code }}</span>

      <!-- 404 : animation « les deux 4 écrasent le O d'OTONOM → le 0 apparaît » -->
      <div v-if="code === '404'" class="err-code err-code--anim" aria-label="Erreur 404">
        <span class="err-4 err-4--l" aria-hidden="true">4</span>
        <span class="err-mid" aria-hidden="true">
          <span class="err-logo">
            <svg class="err-o-svg" viewBox="340.34 0 77.35 77.35" fill="currentColor" role="presentation">
              <path d="M386.75,0h-30.94v15.47h38.68c4.27,0,7.73,3.46,7.73,7.74v38.68h-46.41V15.47h-15.47v46.41l15.47,15.47h46.41l15.47-15.47V15.47h-15.47l-15.47-15.47Z" />
            </svg>
          </span>
          <span class="err-0">0</span>
        </span>
        <span class="err-4 err-4--r" aria-hidden="true">4</span>
      </div>
      <!-- autres codes : affichage simple -->
      <div v-else class="err-code err-code--plain" :aria-label="`Erreur ${code}`">{{ code }}</div>

      <h1 class="err-title">{{ title }}</h1>
      <p class="err-sub">{{ sub }}</p>

      <div class="err-cta">
        <button type="button" class="btn btn--primary" @click="goHome">Retour à l'accueil
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
        <button type="button" class="btn btn--ghost" @click="goContact">Nous contacter</button>
      </div>
    </div>

    <span class="err-foot">OTONOM — Mobilité · Recharge · Énergie</span>
  </main>
</template>

<script setup lang="ts">
const props = defineProps<{ error: { statusCode?: number; statusMessage?: string } }>()

const code = computed(() => String(props.error?.statusCode || 404))
const is404 = computed(() => props.error?.statusCode === 404)
const title = computed(() => is404.value ? 'Cette page a pris une autre route.' : 'Quelque chose s\'est mal passé.')
const sub = computed(() => is404.value
  ? "La page que vous cherchez n'existe pas ou a été déplacée."
  : (props.error?.statusMessage || 'Une erreur inattendue est survenue.'))

useSeoMeta({ title: () => `Erreur ${code.value} — OTONOM`, robots: 'noindex, nofollow' })

const goHome = () => clearError({ redirect: '/' })
const goContact = () => clearError({ redirect: '/contact' })

onMounted(() => {
  // Pas de préloader sur la page d'erreur : on neutralise l'éventuelle classe.
  document.documentElement.classList.remove('has-loader')
})
</script>

<style scoped>
.err {
  position: relative; height: 100dvh; min-height: 100dvh; overflow: hidden;
  background: var(--bg); color: var(--ink);
  display: grid; place-items: center; padding: 24px; text-align: center;
}
/* grille faible + vignette (DA) */
.err-grid {
  position: absolute; inset: 0; z-index: 0; pointer-events: none; opacity: .5;
  background-image:
    linear-gradient(var(--line-soft) 1px, transparent 1px),
    linear-gradient(90deg, var(--line-soft) 1px, transparent 1px);
  background-size: 58px 58px;
  -webkit-mask-image: radial-gradient(115% 85% at 50% 40%, #000, transparent 78%);
  mask-image: radial-gradient(115% 85% at 50% 40%, #000, transparent 78%);
}
/* logo « retour accueil » — apparaît en haut au moment où le O central est écrasé */
.err-brand {
  position: absolute; top: clamp(18px, 3vw, 30px); left: clamp(18px, 4vw, 40px); z-index: 3;
  background: none; border: 0; padding: 0; cursor: pointer; color: var(--ink);
  animation: err-brand-in .7s cubic-bezier(.16, 1, .3, 1) .95s both;
}
.err-brand :deep(.logo) { height: 20px; width: auto; display: block; }
@keyframes err-brand-in { from { opacity: 0; transform: translateY(-18px) scale(.92); } to { opacity: 1; transform: none; } }

.err-inner { position: relative; z-index: 2; max-width: 640px; display: flex; flex-direction: column; align-items: center; }
.err-inner > * { animation: err-in .85s cubic-bezier(.16, 1, .3, 1) both; }

.err-kicker {
  font-family: var(--ff-mono); font-size: 12px; letter-spacing: .26em; text-transform: uppercase; color: var(--muted);
  margin-bottom: clamp(12px, 2.4vw, 20px); display: inline-flex; align-items: center; gap: 12px; animation-delay: .05s;
}
.err-kicker::before, .err-kicker::after { content: ""; width: 24px; height: 1px; background: var(--line); }

.err-code {
  font-family: var(--ff-display); font-weight: 700; line-height: 1; letter-spacing: -.03em;
  font-size: clamp(96px, 23vw, 190px); color: var(--ink);
}
.err-code--plain { display: inline-block; animation-delay: .14s; }

/* --- Animation crush --- */
.err-code--anim { display: flex; align-items: center; justify-content: center; gap: clamp(2px, .8vw, 8px); animation: none; }
.err-4 { display: inline-block; will-change: transform; }
.err-4--l { animation: err-slam-l 1.3s .3s both; }
.err-4--r { animation: err-slam-r 1.3s .3s both; }

.err-mid { position: relative; display: inline-flex; align-items: center; justify-content: center; width: .58em; height: 1em; }
.err-logo, .err-0 { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.err-logo { transform-origin: center; animation: err-crush 1.3s .3s both; overflow: visible; }
.err-o-svg { height: .72em; width: auto; max-width: none; flex-shrink: 0; display: block; color: var(--ink); }
.err-0 { transform-origin: center; animation: err-zero 1.3s .3s both; }

/* les 4 apparaissent en fondu, tout près, et convergent pour écraser le O */
@keyframes err-slam-l {
  0%   { transform: translateX(-110%); opacity: 0; animation-timing-function: cubic-bezier(.25, .7, .35, 1); }
  36%  { transform: translateX(-38%); opacity: 1; }
  54%  { transform: translateX(48%);  animation-timing-function: cubic-bezier(.32, 1.2, .5, 1); }
  72%  { transform: translateX(-11%); }
  100% { transform: translateX(0); opacity: 1; }
}
@keyframes err-slam-r {
  0%   { transform: translateX(110%);  opacity: 0; animation-timing-function: cubic-bezier(.25, .7, .35, 1); }
  36%  { transform: translateX(38%);   opacity: 1; }
  54%  { transform: translateX(-48%);  animation-timing-function: cubic-bezier(.32, 1.2, .5, 1); }
  72%  { transform: translateX(11%); }
  100% { transform: translateX(0); opacity: 1; }
}
/* le O d'OTONOM se fait compresser (écrasé entre les 4) puis disparaît */
@keyframes err-crush {
  0%, 40% { transform: scaleX(1) scaleY(1); opacity: 1; }
  54%     { transform: scaleX(.14) scaleY(1.14); opacity: 1; }
  64%     { transform: scaleX(.04) scaleY(.7); opacity: 0; }
  100%    { transform: scaleX(.04) scaleY(.7); opacity: 0; }
}
/* le 0 surgit dans l'espace laissé, avec un petit rebond doux */
@keyframes err-zero {
  0%, 58% { transform: scale(0); opacity: 0; }
  72%     { transform: scale(1.13); opacity: 1; }
  86%     { transform: scale(.98); }
  100%    { transform: scale(1); opacity: 1; }
}

.err-title { font-size: clamp(21px, 3.3vw, 33px); line-height: 1.12; letter-spacing: -.01em; margin-top: clamp(8px, 1.8vw, 16px); animation-delay: 1.15s; }
.err-sub { color: var(--muted); font-size: clamp(14.5px, 1.6vw, 17px); line-height: 1.55; margin-top: 13px; max-width: 44ch; animation-delay: 1.28s; }
.err-cta { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-top: clamp(20px, 3.4vw, 30px); animation-delay: 1.4s; }

.err-foot {
  position: absolute; bottom: clamp(14px, 3vw, 26px); left: 0; right: 0; z-index: 2;
  font-family: var(--ff-mono); font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: var(--muted-2);
  animation: err-in 1s ease 1.5s both;
}

@keyframes err-in { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }

@media (prefers-reduced-motion: reduce) {
  .err-4, .err-logo, .err-0, .err-brand, .err-inner > *, .err-foot { animation: none !important; opacity: 1; transform: none; }
  .err-logo { opacity: 0; }
}
</style>
