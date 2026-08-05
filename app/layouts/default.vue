<template>
  <PageLoader />
  <a class="skip-link" href="#main">Aller au contenu</a>
  <AppHeader />
  <main id="main"><slot /></main>
  <AppFooter />
  <!-- Explique un lien vers un article pas encore publié, au lieu d'une 404. -->
  <ArticlesAVenir />
</template>
