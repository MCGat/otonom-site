<template>
  <section class="section center-min section--light"><div class="wrap"><div class="inner reveal">
    <span class="kicker">Demande envoyée</span>
    <h1 style="font-size:clamp(34px,5vw,60px)">Merci, votre demande est bien partie.</h1>
    <p class="lede" style="margin-top:22px">Un membre de l'équipe OTONOM revient vers vous sous 48&nbsp;h ouvrées. En attendant, vous pouvez explorer nos leviers d'optimisation.</p>
    <div class="hero-cta">
      <NuxtLink class="btn btn--primary btn--lg" to="/">Retour à l'accueil <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6" /></svg></NuxtLink>
      <NuxtLink class="btn btn--ghost btn--lg" to="/expertises">Voir nos expertises</NuxtLink>
    </div>
  </div></div></section>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Merci — OTONOM', description: 'Votre demande a bien été envoyée.' })
</script>
