/**
 * Cocons sémantiques du blog OTONOM.
 *
 * Un cocon = un pilier + ses satellites, qui se maillent entre eux et visent une
 * même famille de requêtes. Chaque article déclare le sien (champ `cocon` en
 * base) ; sans déclaration, l'article n'appartient à aucun cocon.
 *
 * Il a existé ici une déduction d'après le slug, pour éviter un tri manuel.
 * Elle a été retirée : un rangement approximatif se lit comme un rangement, et
 * il masquait un vrai défaut — les huit articles du cocon Collaborateurs se sont
 * affichés « Non classé » sans que rien ne signale que la clé était inconnue.
 * Un cocon vide doit se voir, c'est ce qui déclenche la correction.
 *
 * Le plan détaillé du cocon TCO vit dans `COCON-TCO.md`.
 */

export interface Cocon {
  cle: string
  label: string
  /** Slug du pilier, s'il existe déjà. Sert à repérer l'article de tête. */
  pilier?: string
}

export const COCONS: Cocon[] = [
  {
    cle: 'collaborateurs',
    label: 'Recharge des collaborateurs',
    pilier: 'cout-recharge-domicile-salarie'
  },
  {
    cle: 'tco',
    label: 'TCO flotte électrique',
    pilier: 'tco-vehicule-electrique-entreprise'
  },
  {
    cle: 'fiscalite',
    label: 'Fiscalité & avantages',
    pilier: 'fiscalite-vehicule-electrique-2026'
  },
  {
    cle: 'recharge',
    label: 'Recharge & IRVE'
  },
  {
    cle: 'energie',
    label: 'Énergie & pilotage'
  },
  {
    cle: 'flotte',
    label: 'Verdissement de flotte'
  },
  {
    cle: 'tourisme',
    label: 'Camping, hôtel & tourisme',
    pilier: 'combien-de-bornes-camping'
  }
]

const PAR_CLE = new Map(COCONS.map((c) => [c.cle, c]))

/** Libellé affichable d'une clé de cocon (ou undefined si la clé est inconnue). */
export const labelCocon = (cle?: string): string | undefined =>
  cle ? PAR_CLE.get(cle)?.label : undefined

/**
 * Cocon d'un article : celui qu'il déclare, ou rien.
 *
 * Une clé stockée mais absente de COCONS renvoie `null` — l'article s'affiche
 * « Non classé », ce qui est le signal qu'il manque une entrée ici.
 */
export function coconDe(a: { cocon?: string; slug?: string; title?: string }) {
  if (!a.cocon) return null
  const c = PAR_CLE.get(a.cocon)
  return c ? { cle: c.cle, label: c.label } : null
}
