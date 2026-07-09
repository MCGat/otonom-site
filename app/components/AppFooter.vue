<template>
  <footer class="site-footer site-footer--light">
    <div class="wrap">
      <div class="foot">
        <div>
          <OtonomLogo />
          <p>L'orchestrateur de la transition mobilité, recharge et énergie des entreprises. Une marque du groupe MC&nbsp;Groupe.</p>
        </div>
        <div>
          <h4>Naviguer</h4>
          <ul>
            <li><NuxtLink to="/expertises">Expertises</NuxtLink></li>
            <li><NuxtLink to="/methode">Méthode</NuxtLink></li>
            <li><NuxtLink to="/a-propos">À propos</NuxtLink></li>
            <li><NuxtLink to="/contact">Contact</NuxtLink></li>
          </ul>
        </div>
        <div>
          <h4>Pour qui</h4>
          <ul>
            <li><NuxtLink to="/dirigeants">Dirigeants</NuxtLink></li>
            <li><NuxtLink to="/daf">DAF</NuxtLink></li>
            <li><NuxtLink to="/drh">DRH</NuxtLink></li>
            <li><NuxtLink to="/services-generaux">Services généraux</NuxtLink></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li><a href="mailto:gregory@otonom.fr">gregory@otonom.fr</a></li>
            <li><NuxtLink to="/contact">Réserver un audit</NuxtLink></li>
          </ul>
        </div>
      </div>
      <div class="foot-bottom">
        <span>© 2026 OTONOM — MC Groupe. Tous droits réservés.</span>
        <nav class="foot-legal" aria-label="Informations légales">
          <NuxtLink to="/mentions-legales">Mentions légales</NuxtLink>
          <NuxtLink to="/confidentialite">Politique de confidentialité</NuxtLink>
        </nav>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer .logo { height: 18px; width: auto; }
</style>
