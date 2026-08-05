/**
 * Cocons sémantiques du blog OTONOM.
 *
 * Un cocon = un pilier + ses satellites, qui se maillent entre eux et visent une
 * même famille de requêtes. Chaque article en déclare un (champ `cocon` en base) ;
 * quand il est vide, `devinerCocon()` propose une appartenance d'après le slug —
 * assez pour visualiser d'un coup d'œil dans l'admin, sans imposer un tri manuel.
 *
 * Le plan détaillé du cocon TCO vit dans `COCON-TCO.md`.
 */

export interface Cocon {
  cle: string
  label: string
  /** Slug du pilier, s'il existe déjà. Sert à repérer l'article de tête. */
  pilier?: string
  /** Fragments de slug qui trahissent l'appartenance (fallback uniquement). */
  indices: string[]
}

export const COCONS: Cocon[] = [
  {
    cle: 'tco',
    label: 'TCO flotte électrique',
    pilier: 'tco-vehicule-electrique-entreprise',
    indices: ['tco', 'cout-recharge', 'cout-bornes', 'financement', 'valeur-residuelle', 'utilitaire']
  },
  {
    cle: 'fiscalite',
    label: 'Fiscalité & avantages',
    pilier: 'fiscalite-vehicule-electrique-2026',
    indices: ['fiscalite', 'avantage-en-nature', 'amortissement', 'malus', 'taxe']
  },
  {
    cle: 'recharge',
    label: 'Recharge & IRVE',
    indices: ['borne', 'irve', 'recharge-entreprise', 'obligation']
  },
  {
    cle: 'energie',
    label: 'Énergie & pilotage',
    indices: ['energie', 'puissance', 'pilotee', 'pilotage', 'raccordement', 'photovolta']
  },
  {
    cle: 'flotte',
    label: 'Verdissement de flotte',
    indices: ['verdissement', 'lom', 'flotte-entreprise', 'quota']
  },
  {
    cle: 'tourisme',
    label: 'Camping, hôtel & tourisme',
    pilier: 'combien-de-bornes-camping',
    indices: ['camping', 'hotel', 'hebergement', 'tourisme', 'emplacement', 'plein-air']
  }
]

const PAR_CLE = new Map(COCONS.map((c) => [c.cle, c]))

/** Libellé affichable d'une clé de cocon (ou undefined si la clé est inconnue). */
export const labelCocon = (cle?: string): string | undefined =>
  cle ? PAR_CLE.get(cle)?.label : undefined

/**
 * Appartenance déduite du slug, à défaut de cocon déclaré.
 * Volontairement approximative : c'est un repère visuel, pas une vérité.
 */
export function devinerCocon(slug?: string, titre?: string): string | undefined {
  const texte = `${slug || ''} ${titre || ''}`.toLowerCase()
  if (!texte.trim()) return undefined
  for (const c of COCONS) {
    if (c.indices.some((i) => texte.includes(i))) return c.cle
  }
  return undefined
}

/** Cocon déclaré s'il existe, deviné sinon. `devine` dit lequel des deux. */
export function coconDe(a: { cocon?: string; slug?: string; title?: string }) {
  if (a.cocon && PAR_CLE.has(a.cocon)) return { cle: a.cocon, label: PAR_CLE.get(a.cocon)!.label, devine: false }
  const cle = devinerCocon(a.slug, a.title)
  return cle ? { cle, label: PAR_CLE.get(cle)!.label, devine: true } : null
}
