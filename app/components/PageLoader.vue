<template>
  <div v-if="visible" class="page-loader" :class="{ 'is-out': leaving }" aria-hidden="true">
    <div class="pl-stage">
      <div class="pl-logo"><OtonomLogo /></div>
      <div class="pl-meta">
        <span class="pl-track"><i class="pl-fill" :style="{ transform: `scaleX(${progress / 100})` }" /></span>
        <span class="pl-num">{{ display }}</span>
      </div>
      <div class="pl-tag">Mobilité · Recharge · Énergie</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Loader de première visite. Piloté par la classe html.has-loader posée par le
// script inline (nuxt.config) uniquement au 1er chargement de la session.
const visible = ref(true)
const leaving = ref(false)
const progress = ref(0)
const display = computed(() => String(Math.round(progress.value)).padStart(3, '0'))

onMounted(() => {
  const docEl = document.documentElement
  // Pas de loader (visite déjà vue / reduced-motion / SSR de retour) → on s'efface.
  if (!docEl.classList.contains('has-loader')) { visible.value = false; return }

  const DUR = 2200 // durée du comptage 000 → 100
  const start = performance.now()
  let raf = 0
  let done = false

  const tick = (now: number) => {
    const t = Math.min((now - start) / DUR, 1)
    progress.value = (1 - Math.pow(1 - t, 3)) * 100 // easeOutCubic
    if (t < 1) raf = requestAnimationFrame(tick)
    else setTimeout(reveal, 200)
  }
  raf = requestAnimationFrame(tick)

  function reveal() {
    if (done) return
    done = true
    docEl.classList.add('intro-in') // déclenche l'entrée du hero…
    leaving.value = true            // …pendant que le rideau se lève
    setTimeout(cleanup, 900)
  }
  function cleanup() {
    docEl.classList.remove('has-loader')
    visible.value = false
  }

  // Garde-fou : quoi qu'il arrive, on révèle le site au plus tard à 4,5 s.
  const guard = setTimeout(reveal, 4500)
  onBeforeUnmount(() => { cancelAnimationFrame(raf); clearTimeout(guard) })
})
</script>
