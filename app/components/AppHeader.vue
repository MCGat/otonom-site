<template>
  <header class="site-header">
    <div class="wrap nav">
      <NuxtLink class="brand" to="/" aria-label="OTONOM — accueil"><OtonomLogo /></NuxtLink>
      <nav class="nav-links" :class="{ open: menuOpen }" aria-label="Navigation principale">
        <NuxtLink to="/expertises">Expertises</NuxtLink>
        <NuxtLink to="/methode">Méthode</NuxtLink>
        <NuxtLink to="/simulateur">Simulateur</NuxtLink>
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
const route = useRoute()
// Referme le menu mobile à chaque changement de page
watch(() => route.path, () => { menuOpen.value = false })
</script>
