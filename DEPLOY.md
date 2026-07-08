# Déploiement — OTONOM (Nuxt) sur PlanetHoster N0C

App **Nuxt 4** (serveur Node + BDD MySQL). Ce guide liste les actions à faire **dans le panneau N0C**
(Claude n'y a pas accès). Une fois fait, chaque déploiement suivant = rebuild + redémarrage.

---

## 0. Prérequis (déjà en place)
- Boîte email `no-reply@otonom.fr` (serveur SMTP `node251-eu.n0c.com`, port 465 SSL).
- Domaine `otonom.fr` géré chez PlanetHoster.

## 1. Créer la base MySQL
Panneau N0C → **Bases de données → MySQL → Créer** :
1. Créer une base, ex. `otonom`.
2. Créer un utilisateur + mot de passe fort, l'**assigner à la base** avec tous les privilèges.
3. Noter : **hôte** (souvent `localhost` sur N0C), **nom de la base**, **utilisateur**, **mot de passe**.

> Les tables se créent **automatiquement** au premier démarrage de l'app (aucune SQL à écrire).

## 2. Créer l'application Node.js
Panneau N0C → **Langages / Node.js → Créer une application** :
- **Version Node** : 20 ou plus (22+ recommandé).
- **Racine de l'application** : le dossier où sera le code (ex. `otonom`). **Note son chemin exact** (pour l'étape 3).
- **Fichier de démarrage** : **`app.js`** (point d'entrée qui charge le `.env` puis lance le serveur).
- Le port est fourni par l'hébergeur via la variable `PORT` — l'app l'utilise automatiquement.

## 3. Déploiement automatique par FTP (GitHub Action)
Le dépôt contient `.github/workflows/deploy.yml` : à chaque `git push` sur `main`, il **build** l'app et
**envoie le dossier compilé `.output/`** dans l'app Node, puis la **redémarre**. À configurer une fois :

Sur GitHub → **Settings → Secrets and variables → Actions** :
- **Secrets** : `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` (identifiants FTP PlanetHoster).
- **Variable** : `FTP_APP_DIR` = le chemin de la racine de l'app Node (étape 2), ex. `./otonom/`.

> Le build tourne sur GitHub (aucun secret nécessaire au build) ; seul `.output/` (autonome) est envoyé.
> Alternative manuelle : `npm run build` en local puis uploader `.output/` par FTP dans l'app.

## 4. Variables d'environnement — fichier `.env`
N0C n'a pas de champ « variables d'environnement » : on les met dans un **fichier `.env`** à la **racine de l'app**
(`/home/dacqsnbtex/otonom/.env`), via **Fichiers → Gestionnaire de fichiers** (⚠️ jamais dans Git). `app.js` le charge
au démarrage. Contenu :

```
NUXT_ADMIN_PASSWORD      = <mot de passe du back-office>
NUXT_SESSION_PASSWORD    = <32+ caractères aléatoires>
NUXT_DEFAULT_RECIPIENTS  = e.barlet@mc-groupe.com, a.thomas@mc-groupe.com

# Base MySQL (étape 1)
NUXT_MYSQL_HOST          = localhost
NUXT_MYSQL_PORT          = 3306
NUXT_MYSQL_USER          = <utilisateur BDD>
NUXT_MYSQL_PASSWORD      = <mot de passe BDD>
NUXT_MYSQL_DATABASE      = otonom

# SMTP (boîte no-reply@otonom.fr)
NUXT_SMTP_HOST           = node251-eu.n0c.com
NUXT_SMTP_PORT           = 465
NUXT_SMTP_SECURE         = true
NUXT_SMTP_USER           = no-reply@otonom.fr
NUXT_SMTP_PASS           = <mot de passe de la boîte>
NUXT_SMTP_FROM           = no-reply@otonom.fr
NUXT_SMTP_FROM_NAME      = OTONOM — Site
```

> Dès que `NUXT_MYSQL_HOST` est défini, l'app bascule automatiquement sur MySQL.

## 5. Démarrer / redémarrer l'app
Après build + variables → **Redémarrer l'application** dans le panneau. Les tables MySQL sont créées au 1er accès.

## 6. Brancher le domaine
Faire pointer `otonom.fr` (et `www`) vers l'application Node (dans le panneau N0C : domaine/sous-domaine → app).
Les emails (MX) ne changent pas. Vérifier que le **HTTPS** est actif (certificat SSL).

## 7. Vérifications après mise en ligne
- [ ] `https://otonom.fr` s'affiche (accueil), navigation OK.
- [ ] `/simulateur` calcule, le gate déverrouille le détail.
- [ ] **Contact et simulateur** : envoyer un test → l'email arrive sur `e.barlet@mc-groupe.com`,
      et le lead apparaît dans **`/admin`** (mot de passe = `NUXT_ADMIN_PASSWORD`).
- [ ] `/sitemap.xml` et `/robots.txt` répondent.
- [ ] `/admin` redirige vers le login si non connecté.

## Notes
- **Mises à jour** (option Git) : `git pull` → `npm install` (si deps changent) → `npm run build` → redémarrer.
- **Sauvegarde des leads** : base MySQL sauvegardée par N0C + visible dans phpMyAdmin et dans `/admin`.
- **Changer qui reçoit les emails** : directement dans `/admin` (par formulaire, sans redéploiement).
- Si un email n'arrive pas : vérifier `NUXT_SMTP_*` et les logs de l'app ; le lead reste enregistré en base
  même si l'email échoue (aucune perte).
