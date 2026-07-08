// OTONOM — point d'entrée production (PlanetHoster N0C / Passenger).
// Charge le .env AVANT le serveur pour que le runtimeConfig lise les variables,
// puis démarre le serveur Nitro compilé (.output).
import 'dotenv/config'
import('./.output/server/index.mjs')
