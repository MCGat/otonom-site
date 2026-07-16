// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Auth admin (sessions par cookie scellé). Nécessite NUXT_SESSION_PASSWORD (≥32 car.) en prod.
  modules: ['nuxt-auth-utils'],

  // Design system OTONOM (repris tel quel du site statique)
  css: ['~/assets/css/main.css'],

  // Config serveur — surchargée en prod via variables d'env NUXT_* (jamais commitées)
  runtimeConfig: {
    adminPassword: '',                                             // NUXT_ADMIN_PASSWORD (login back-office)
    dbFile: './data/otonom.db',                                    // NUXT_DB_FILE (SQLite local)
    // MySQL (prod PlanetHoster N0C) — si "host" renseigné, la BDD bascule sur MySQL.
    // Laisser vide en local → SQLite.
    mysql: {
      host: '',        // NUXT_MYSQL_HOST
      port: '3306',    // NUXT_MYSQL_PORT
      user: '',        // NUXT_MYSQL_USER
      password: '',    // NUXT_MYSQL_PASSWORD
      database: ''     // NUXT_MYSQL_DATABASE
    },
    defaultRecipients: 'e.barlet@mc-groupe.com, a.thomas@mc-groupe.com', // NUXT_DEFAULT_RECIPIENTS
    smtp: {
      host: '',            // NUXT_SMTP_HOST      (ex. node251-eu.n0c.com)
      port: '465',         // NUXT_SMTP_PORT      (465 SSL · 587 TLS)
      secure: 'true',      // NUXT_SMTP_SECURE    ('true' pour 465, 'false' pour 587)
      user: '',            // NUXT_SMTP_USER      (no-reply@otonom.fr)
      pass: '',            // NUXT_SMTP_PASS
      from: 'no-reply@otonom.fr',   // NUXT_SMTP_FROM
      fromName: 'OTONOM — Site'     // NUXT_SMTP_FROM_NAME
    }
  },

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'OTONOM — Orchestrateur mobilité, recharge & énergie des entreprises',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap' },
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ],
      meta: [
        { name: 'theme-color', content: '#f3f3f1' }
      ],
      script: [
        // Décide AVANT le paint si le loader doit jouer. Il joue à CHAQUE chargement/rechargement
        // complet de la page (ce script inline ne s'exécute qu'au full load), mais PAS en navigation
        // interne SPA (le layout + PageLoader ne se remontent pas). Respecte prefers-reduced-motion.
        // ⚠️ Jamais dans l'admin : ce layout n'a pas de PageLoader, donc personne ne retirerait
        // `has-loader` — et son `overflow:hidden` bloquerait le scroll de la page.
        {
          innerHTML:
            ';(function(){try{if(location.pathname.indexOf("/admin")===0)return;' +
            'if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;' +
            'document.documentElement.classList.add("has-loader")}catch(e){}})();',
          tagPosition: 'head'
        },
        // Données structurées (schema.org) : aident Google à comprendre la marque
        // (nom, logo, rattachement MC Groupe) → meilleure présentation du résultat.
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                '@id': 'https://otonom.fr/#organization',
                name: 'OTONOM',
                url: 'https://otonom.fr',
                logo: 'https://otonom.fr/assets/img/icon-512.png',
                description: "OTONOM orchestre de A à Z la transition mobilité, recharge et énergie des entreprises : un seul interlocuteur, des résultats chiffrés.",
                parentOrganization: { '@type': 'Organization', name: 'MC Groupe' },
                contactPoint: {
                  '@type': 'ContactPoint',
                  contactType: 'sales',
                  telephone: '+33668280908',
                  email: 'gregory@otonom.fr',
                  areaServed: 'FR',
                  availableLanguage: 'fr'
                }
              },
              {
                '@type': 'WebSite',
                '@id': 'https://otonom.fr/#website',
                name: 'OTONOM',
                url: 'https://otonom.fr',
                inLanguage: 'fr',
                publisher: { '@id': 'https://otonom.fr/#organization' }
              }
            ]
          })
        }
      ]
    }
  }
})
