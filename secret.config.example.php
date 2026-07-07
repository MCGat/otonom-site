<?php
/**
 * OTONOM — Modèle de configuration SMTP (à copier, NE PAS remplir ici).
 *
 * ┌─ À FAIRE UNE SEULE FOIS SUR LE SERVEUR PlanetHoster ───────────────────┐
 * │ 1. Copier ce fichier en « secret.config.php » (même dossier).          │
 * │ 2. Y mettre le VRAI mot de passe de la boîte no-reply@otonom.fr.       │
 * │ 3. Ne JAMAIS committer secret.config.php (déjà dans .gitignore).       │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 * Où trouver les réglages SMTP exacts : espace PlanetHoster (N0C)
 *   → Messagerie → Comptes de messagerie → à côté du compte, « Configurer
 *     un client de messagerie » / « Voir les paramètres ».
 *   Le serveur d'envoi est souvent « mail.otonom.fr » ou un hôte type
 *   « nodeXX.n0c.com ». Port 465 (SSL) recommandé, sinon 587 (TLS).
 */

return [
    // --- Serveur SMTP (envoi) ---
    'smtp_host'   => 'node251-eu.n0c.com', // cf. « Configurer un client de messagerie »
    'smtp_port'   => 465,                // 465 = SSL (recommandé) · 587 = TLS
    'smtp_secure' => 'ssl',              // 'ssl' pour 465 · 'tls' pour 587
    'smtp_user'   => 'no-reply@otonom.fr',
    'smtp_pass'   => 'METTRE_LE_MOT_DE_PASSE_ICI',

    // --- Expéditeur / destinataires ---
    // to_mail et cc_mail acceptent PLUSIEURS adresses séparées par des virgules.
    'from_mail'   => 'no-reply@otonom.fr',      // doit = smtp_user (alignement SPF/DKIM)
    'from_name'   => 'OTONOM — Site',
    'to_mail'     => 'e.barlet@mc-groupe.com, a.thomas@mc-groupe.com', // destinataires principaux
    'cc_mail'     => '',                         // ex. 'gregory@otonom.fr' pour une copie
];
