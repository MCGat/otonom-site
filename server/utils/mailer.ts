/**
 * OTONOM — Envoi des emails de lead (SMTP authentifié, DA N&B).
 * Identifiants SMTP via runtimeConfig (variables d'env NUXT_SMTP_*).
 */
import nodemailer from 'nodemailer'
import type { Lead } from './db'

function esc(s: string) {
  return String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}

function ligne(label: string, valeur?: string, lien?: string) {
  const v = valeur && valeur.trim() ? valeur : '—'
  const affiche = lien
    ? `<a href="${esc(lien)}" style="color:#0b0b0d;text-decoration:none;border-bottom:1px solid #cfcfca;">${esc(v)}</a>`
    : esc(v)
  return '<tr>'
    + `<td width="36%" style="padding:12px 0;border-bottom:1px solid #eeeeeb;font-family:Arial,Helvetica,sans-serif;font-size:11.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#86868c;vertical-align:top;">${esc(label)}</td>`
    + `<td style="padding:12px 0 12px 16px;border-bottom:1px solid #eeeeeb;font-family:Arial,Helvetica,sans-serif;font-size:15.5px;line-height:1.5;color:#0b0b0d;vertical-align:top;">${affiche}</td>`
    + '</tr>'
}

/** Titre de section dans le corps de l'email. */
function titreSection(t: string) {
  return `<tr><td colspan="2" style="padding:22px 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#0b0b0d;border-bottom:2px solid #0b0b0d;">${esc(t)}</td></tr>`
}

interface Section { titre: string; lignes: [string, string][] }

/**
 * Les données du simulateur, telles que le prospect les a saisies.
 * Sans elles, l'email ne contient qu'un nom et un email : on ne sait pas de quoi
 * parler en rappelant. Deux formats acceptés — `sections` pour un rendu
 * catégorisé comme le formulaire, sinon un simple objet à plat.
 */
function detailsMeta(meta?: string): { html: string; texte: string } {
  if (!meta) return { html: '', texte: '' }
  let data: any
  try { data = typeof meta === 'string' ? JSON.parse(meta) : meta } catch { return { html: '', texte: '' } }
  if (!data || typeof data !== 'object') return { html: '', texte: '' }

  const sections: Section[] = Array.isArray(data.sections) && data.sections.length
    ? data.sections
    : [{
        titre: 'Détail',
        lignes: Object.entries(data)
          .filter(([, v]) => v !== null && v !== undefined && v !== '')
          .map(([k, v]) => [k, String(v)] as [string, string])
      }]

  let html = ''
  let texte = ''
  for (const s of sections) {
    if (!s?.lignes?.length) continue
    html += titreSection(s.titre)
    texte += `\n${s.titre.toUpperCase()}\n`
    for (const [l, v] of s.lignes) {
      html += ligne(l, v)
      texte += `  ${l} : ${v}\n`
    }
  }
  if (!html) return { html: '', texte: '' }
  return {
    html: '<tr><td style="padding:8px 34px 6px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + html + '</table></td></tr>',
    texte
  }
}

export function buildHtml(lead: Lead, kicker: string): string {
  const date = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris', dateStyle: 'short', timeStyle: 'short' })
  const messageHtml = lead.message && lead.message.trim()
    ? esc(lead.message).replace(/\n/g, '<br>')
    : '<span style="color:#9a9aa1;">—</span>'
  const tel = (lead.telephone || '').replace(/[^0-9+]/g, '')
  return '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"></head>'
    + '<body style="margin:0;padding:0;background:#e7e7e3;">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e7e7e3;"><tr><td align="center" style="padding:30px 12px;">'
    + '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e2e2de;border-radius:16px;overflow:hidden;">'
    + '<tr><td style="background:#0b0b0d;padding:26px 34px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>'
    + `<td style="font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:19px;letter-spacing:2px;color:#ffffff;">OTONOM</td>`
    + `<td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.6px;text-transform:uppercase;color:#8a8a90;">${esc(kicker)}</td>`
    + '</tr></table></td></tr>'
    + '<tr><td style="padding:34px 34px 4px;">'
    + `<div style="font-family:Arial,Helvetica,sans-serif;font-size:11.5px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#86868c;margin-bottom:14px;">${esc(kicker)}</div>`
    + `<div style="font-family:Arial,Helvetica,sans-serif;font-weight:600;font-size:23px;line-height:1.25;color:#0b0b0d;">Un prospect souhaite être recontacté.</div>`
    + '</td></tr>'
    + '<tr><td style="padding:24px 34px 6px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">'
    + ligne('Nom', lead.nom)
    + ligne('Entreprise', lead.entreprise)
    + ligne('Email', lead.email, 'mailto:' + lead.email)
    + ligne('Téléphone', lead.telephone, tel ? 'tel:' + tel : undefined)
    + '</table></td></tr>'
    + detailsMeta(lead.meta).html
    + '<tr><td style="padding:16px 34px 34px;">'
    + `<div style="font-family:Arial,Helvetica,sans-serif;font-size:11.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#86868c;margin-bottom:10px;">Message</div>`
    + `<div style="border:1px solid #e2e2de;border-radius:12px;padding:16px 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#2a2a2e;background:#fafaf8;white-space:normal;">${messageHtml}</div>`
    + '</td></tr>'
    + `<tr><td style="border-top:1px solid #e2e2de;padding:18px 34px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.04em;color:#9a9aa1;">Envoyé depuis <span style="color:#0b0b0d;">otonom.fr</span> · ${esc(date)}</td></tr>`
    + '</table>'
    + `<div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.04em;color:#a9a9a4;margin-top:16px;">OTONOM — une marque du groupe MC Groupe</div>`
    + '</td></tr></table></body></html>'
}

function buildText(lead: Lead, kicker: string): string {
  return `${kicker} — OTONOM\n\n`
    + `Nom : ${lead.nom}\n`
    + `Entreprise : ${lead.entreprise || '—'}\n`
    + `Email : ${lead.email}\n`
    + `Téléphone : ${lead.telephone || '—'}\n`
    + detailsMeta(lead.meta).texte
    + `\nMessage :\n${lead.message || '—'}\n`
}

/** Envoie l'email de lead aux destinataires. Renvoie true si envoyé. */
export async function sendLeadEmail(lead: Lead, recipients: string): Promise<boolean> {
  const cfg = useRuntimeConfig()
  const s = cfg.smtp
  if (!s?.host || !s?.pass || !recipients.trim()) {
    console.warn('OTONOM mailer: SMTP non configuré ou aucun destinataire — email non envoyé')
    return false
  }
  /* La source vient du libellé saisi dans l'admin, pas d'une liste en dur :
     un nouveau formulaire porte son nom dès sa création. */
  const kicker = await getFormLabel(lead.formKey)
  const transport = nodemailer.createTransport({
    host: s.host,
    port: Number(s.port) || 465,
    secure: String(s.secure) === 'true',
    auth: { user: s.user, pass: s.pass },
    tls: { minVersion: 'TLSv1.2' }
  })
  await transport.sendMail({
    from: `"${s.fromName}" <${s.from}>`,
    to: recipients,
    replyTo: `"${lead.nom}" <${lead.email}>`,
    subject: `${kicker} — ${lead.nom}${lead.entreprise ? ` (${lead.entreprise})` : ''}`,
    html: buildHtml(lead, kicker),
    text: buildText(lead, kicker)
  })
  return true
}
