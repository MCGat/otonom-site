<template>
  <footer class="site-footer site-footer--light">
    <div class="wrap">
      <div class="foot">
        <div>
          <OtonomLogo />
          <p>L'orchestrateur de la transition mobilité, recharge et énergie des entreprises. Une marque du groupe MC&nbsp;Groupe.</p>
          <ul class="foot-contact">
            <li><a href="mailto:gregory@otonom.fr">gregory@otonom.fr</a></li>
            <li><NuxtLink to="/contact">Réserver un audit gratuit</NuxtLink></li>
          </ul>
        </div>
        <div>
          <h4>Naviguer</h4>
          <ul>
            <li><NuxtLink to="/expertises">Expertises</NuxtLink></li>
            <li><NuxtLink to="/methode">Méthode</NuxtLink></li>
            <li><NuxtLink to="/simulateurs">Simulateurs</NuxtLink></li>
            <li><NuxtLink to="/blog">Blog</NuxtLink></li>
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
          <h4>Simulateurs</h4>
          <ul>
            <li><NuxtLink to="/simulateurs/economies-et-roi">Simulateur d'économies et de ROI</NuxtLink></li>
            <li><NuxtLink to="/simulateurs/tco-flotte-electrique">TCO flotte électrique</NuxtLink></li>
            <li><NuxtLink to="/simulateurs/recharge-domicile-salarie">Recharge à domicile d'un salarié</NuxtLink></li>
            <li><NuxtLink to="/simulateurs/bornes-camping-hotel">Bornes camping &amp; hôtel</NuxtLink></li>
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
/* Contact remonté sous la marque : sa colonne servait à trois liens et n'en
   portait que deux, alors que les simulateurs n'étaient nulle part. */
.foot-contact { margin-top: 20px; }
</style>
