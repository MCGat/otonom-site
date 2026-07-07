<?php
/**
 * OTONOM — Traitement du formulaire de contact (SMTP authentifié, sécurisé).
 * Reçoit le POST de contact.html, envoie un email HTML stylisé (DA OTONOM)
 * à e.barlet@mc-groupe.com via la boîte no-reply@otonom.fr (SMTP/TLS),
 * puis redirige vers merci.html.
 *
 * Hébergement PlanetHoster. Librairie : PHPMailer (lib/PHPMailer/).
 * Identifiants SMTP : dans secret.config.php (hors Git, non servi par le web).
 */

date_default_timezone_set('Europe/Paris');

// ---- Garde-fous requête ----
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { header('Location: contact.html'); exit; }
if (!empty($_POST['_honey'])) { header('Location: merci.html'); exit; } // pot de miel : on fait comme si tout allait bien

// ---- Configuration (identifiants hors dépôt) ----
$cfgPath = __DIR__ . '/secret.config.php';
if (!is_file($cfgPath)) {
  error_log('OTONOM contact: secret.config.php introuvable');
  header('Location: contact.html?erreur=1#form'); exit;
}
$cfg = require $cfgPath;

// ---- Lecture + nettoyage des champs ----
function champ($cle) {
  $v = isset($_POST[$cle]) ? trim((string) $_POST[$cle]) : '';
  return str_replace(["\r", "\n"], ' ', $v); // anti-injection d'en-tête
}

$nom        = champ('Nom');
$entreprise = champ('Entreprise');
$email      = champ('Email');
$tel        = champ('Téléphone');
$flotte     = champ('Taille de flotte');
$message    = isset($_POST['Message']) ? trim((string) $_POST['Message']) : '';

// ---- Validation minimale ----
if ($nom === '' || $email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  header('Location: contact.html?erreur=1#form'); exit;
}

function esc($s) { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); }

// ---- Une ligne du tableau récapitulatif (label mono + valeur) ----
function ligne($label, $valeur, $lien = null) {
  if ($valeur === '' || $valeur === null) $valeur = '—';
  $affiche = esc($valeur);
  if ($lien) $affiche = '<a href="' . esc($lien) . '" style="color:#0b0b0d;text-decoration:none;border-bottom:1px solid #cfcfca;">' . esc($valeur) . '</a>';
  return '<tr>'
    . '<td width="36%" style="padding:12px 0;border-bottom:1px solid #eeeeeb;font-family:\'Space Mono\',\'Courier New\',monospace;font-size:10.5px;letter-spacing:1.6px;text-transform:uppercase;color:#86868c;vertical-align:top;">' . esc($label) . '</td>'
    . '<td style="padding:12px 0 12px 16px;border-bottom:1px solid #eeeeeb;font-family:Arial,Helvetica,sans-serif;font-size:15.5px;line-height:1.5;color:#0b0b0d;vertical-align:top;">' . $affiche . '</td>'
    . '</tr>';
}

$date        = date('d/m/Y à H\hi');
$messageHtml = $message !== '' ? nl2br(esc($message)) : '<span style="color:#9a9aa1;">—</span>';

// ================= EMAIL HTML (DA OTONOM, N&B premium) =================
$html = '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"></head>'
. '<body style="margin:0;padding:0;background:#e7e7e3;">'
. '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e7e7e3;"><tr><td align="center" style="padding:30px 12px;">'

  . '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e2e2de;border-radius:16px;overflow:hidden;">'

    // --- En-tête noir ---
    . '<tr><td style="background:#0b0b0d;padding:26px 34px;">'
      . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>'
        . '<td style="font-family:\'Space Grotesk\',Arial,sans-serif;font-weight:700;font-size:19px;letter-spacing:3px;color:#ffffff;">OTONOM</td>'
        . '<td align="right" style="font-family:\'Space Mono\',\'Courier New\',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8a8a90;">Nouvelle demande</td>'
      . '</tr></table>'
    . '</td></tr>'

    // --- Titre ---
    . '<tr><td style="padding:34px 34px 4px;">'
      . '<div style="font-family:\'Space Mono\',\'Courier New\',monospace;font-size:11px;letter-spacing:2.4px;text-transform:uppercase;color:#86868c;margin-bottom:14px;">Demande d\'audit gratuit</div>'
      . '<div style="font-family:\'Space Grotesk\',Arial,sans-serif;font-weight:600;font-size:23px;line-height:1.25;color:#0b0b0d;">Un prospect souhaite être recontacté.</div>'
    . '</td></tr>'

    // --- Champs ---
    . '<tr><td style="padding:24px 34px 6px;">'
      . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">'
        . ligne('Nom', $nom)
        . ligne('Entreprise', $entreprise)
        . ligne('Email', $email, 'mailto:' . $email)
        . ligne('Téléphone', $tel, $tel !== '' ? 'tel:' . preg_replace('/[^0-9+]/', '', $tel) : null)
        . ligne('Taille de flotte', $flotte)
      . '</table>'
    . '</td></tr>'

    // --- Message ---
    . '<tr><td style="padding:16px 34px 6px;">'
      . '<div style="font-family:\'Space Mono\',\'Courier New\',monospace;font-size:10.5px;letter-spacing:2px;text-transform:uppercase;color:#86868c;margin-bottom:10px;">Message</div>'
      . '<div style="border:1px solid #e2e2de;border-radius:12px;padding:16px 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#2a2a2e;background:#fafaf8;">' . $messageHtml . '</div>'
    . '</td></tr>'

    // --- CTA répondre ---
    . '<tr><td style="padding:22px 34px 32px;">'
      . '<a href="mailto:' . esc($email) . '?subject=' . rawurlencode('Votre demande d\'audit — OTONOM') . '" style="display:inline-block;background:#0b0b0d;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;text-decoration:none;padding:13px 26px;border-radius:999px;">Répondre à ' . esc($nom) . ' &rarr;</a>'
    . '</td></tr>'

    // --- Pied ---
    . '<tr><td style="border-top:1px solid #e2e2de;padding:18px 34px;font-family:\'Space Mono\',\'Courier New\',monospace;font-size:11px;letter-spacing:.04em;color:#9a9aa1;">'
      . 'Envoyé depuis <span style="color:#0b0b0d;">otonom.fr</span> · ' . esc($date)
    . '</td></tr>'

  . '</table>'
  . '<div style="font-family:\'Space Mono\',\'Courier New\',monospace;font-size:10px;letter-spacing:.12em;color:#a9a9a4;margin-top:16px;">OTONOM — une marque du groupe MC Groupe</div>'

. '</td></tr></table></body></html>';

// Version texte (fallback + meilleure délivrabilité)
$texte = "Nouvelle demande d'audit — OTONOM\n\n"
  . "Nom : $nom\n"
  . 'Entreprise : ' . ($entreprise !== '' ? $entreprise : '—') . "\n"
  . "Email : $email\n"
  . 'Téléphone : ' . ($tel !== '' ? $tel : '—') . "\n"
  . 'Taille de flotte : ' . ($flotte !== '' ? $flotte : '—') . "\n\n"
  . "Message :\n" . ($message !== '' ? $message : '—') . "\n\n"
  . "— Envoyé depuis otonom.fr · $date";

// ================= Envoi via SMTP (PHPMailer) =================
require __DIR__ . '/lib/PHPMailer/Exception.php';
require __DIR__ . '/lib/PHPMailer/PHPMailer.php';
require __DIR__ . '/lib/PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);
$ok = false;

try {
  // --- Transport SMTP ---
  $mail->isSMTP();
  $mail->Host       = $cfg['smtp_host'];
  $mail->SMTPAuth   = true;
  $mail->Username   = $cfg['smtp_user'];
  $mail->Password   = $cfg['smtp_pass'];
  $mail->Port       = (int) $cfg['smtp_port'];
  $mail->CharSet    = PHPMailer::CHARSET_UTF8;
  $mail->Encoding   = PHPMailer::ENCODING_QUOTED_PRINTABLE;

  // Chiffrement : ssl (465) ou tls (587)
  $mail->SMTPSecure = ($cfg['smtp_secure'] === 'tls')
    ? PHPMailer::ENCRYPTION_STARTTLS
    : PHPMailer::ENCRYPTION_SMTPS;

  // Sécurité TLS stricte (pas de certificat auto-signé accepté)
  $mail->SMTPOptions = ['ssl' => [
    'verify_peer'       => true,
    'verify_peer_name'  => true,
    'allow_self_signed' => false,
  ]];
  $mail->Timeout = 15;

  // --- Enveloppe ---
  // to_mail et cc_mail acceptent plusieurs adresses séparées par des virgules
  //   ex. 'e.barlet@mc-groupe.com, a.thomas@mc-groupe.com'
  $ajouter = function ($liste, $methode) use ($mail) {
    foreach (explode(',', (string) $liste) as $adr) {
      $adr = trim($adr);
      if ($adr !== '' && filter_var($adr, FILTER_VALIDATE_EMAIL)) $mail->$methode($adr);
    }
  };
  $mail->setFrom($cfg['from_mail'], $cfg['from_name']);     // = no-reply@otonom.fr
  $ajouter($cfg['to_mail'], 'addAddress');                  // destinataire(s) principal(aux)
  if (!empty($cfg['cc_mail'])) $ajouter($cfg['cc_mail'], 'addCC'); // copie(s)
  $mail->addReplyTo($email, $nom);                           // « Répondre » va au prospect

  // --- Contenu ---
  $mail->isHTML(true);
  $mail->Subject = 'Nouvelle demande d\'audit — ' . $nom . ($entreprise !== '' ? ' (' . $entreprise . ')' : '');
  $mail->Body    = $html;
  $mail->AltBody = $texte;

  $mail->send();
  $ok = true;
} catch (Exception $e) {
  error_log('OTONOM contact: échec envoi SMTP — ' . $mail->ErrorInfo);
  $ok = false;
}

header('Location: ' . ($ok ? 'merci.html' : 'contact.html?erreur=1#form'));
exit;
