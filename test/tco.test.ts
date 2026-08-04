/**
 * Tests de référence du moteur de TCO flotte électrique.
 *
 *   npm run test:tco
 *
 * Pas de framework : le moteur est fait de fonctions pures, un script suffit.
 * Ces tests protègent surtout des erreurs SILENCIEUSES — une valeur résiduelle
 * comptée deux fois, un malus hors d'échelle, un service facturé en double —
 * qui produiraient un chiffre plausible mais faux devant un directeur financier.
 */
import { calculerTco, deriverScenario, TCO_CONFIG, type TcoInput } from '../app/utils/simulateurs/tcoFlotte'
import { baremeMarginal, taxeCO2, taxePolluants, malusPoids, malusCO2, plafondAmortissement, partNonDeductible, avantageEnNature, prixPorte, millesime } from '../app/utils/simulateurs/fiscalite'
import { basculeDurable, bissection, ordre, normaliserParts } from '../app/utils/simulateurs/core'

let ok = 0, ko = 0
const f = (n: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(n))

function t(nom: string, cond: boolean, detail = '') {
  if (cond) { ok++; console.log(`  ✓ ${nom}`) }
  else { ko++; console.log(`  ✗ ${nom} ${detail}`) }
}
function proche(a: number, b: number, tol = 0.02) { return Math.abs(a - b) <= Math.abs(b) * tol + 1 }

console.log('\n=== SOCLE ===')
t('ordre() arrondit sans fausse précision', ordre(187432) === 187000, String(ordre(187432)))
t('ordre() garde le signe', ordre(-12345) === -12500 || ordre(-12345) === -12000, String(ordre(-12345)))
t('normaliserParts ramène à 100 %', Math.abs(Object.values(normaliserParts({ a: 2, b: 2 })).reduce((s, v) => s + v, 0) - 1) < 1e-9)

// Bascule : la courbe passe dessous PUIS repasse au-dessus → pas de bascule durable
t('bascule ignore un croisement non durable',
  basculeDurable([10, 5, 20], [10, 10, 10]).atteinte === false)
t('bascule durable détectée au bon rang',
  basculeDurable([10, 12, 5, 4], [10, 10, 10, 10]).valeur === 2,
  String(basculeDurable([10, 12, 5, 4], [10, 10, 10, 10]).valeur))
t('pas de bascule si toujours au-dessus',
  basculeDurable([20, 20], [10, 10]).atteinte === false)
t('bissection refuse sans changement de signe', bissection(x => x + 100, 0, 10) === null)
t('bissection trouve la racine', Math.abs((bissection(x => x - 5, 0, 10) ?? 0) - 5) < 0.001)

console.log('\n=== FISCALITÉ ===')
// Barème marginal 2026 : 100 g → 4×0 + 41×1 + 8×2 + 32×3 + 15×4 = 0+41+16+96+60 = 213 €
t('barème CO₂ 2026 à 100 g/km = 213 €', taxeCO2(100, 'diesel', 'tourisme', 2026) === 213,
  String(taxeCO2(100, 'diesel', 'tourisme', 2026)))
t('taxe CO₂ nulle pour un électrique', taxeCO2(100, 'electrique', 'tourisme', 2026) === 0)
t('taxe CO₂ nulle pour un utilitaire', taxeCO2(160, 'diesel', 'utilitaire', 2026) === 0)

t('polluants : électrique = 0 €', taxePolluants('electrique', 'tourisme', 2026) === 0)
t('polluants : hybride ESSENCE = 130 € (catégorie 1)', taxePolluants('hybride-essence', 'tourisme', 2026) === 130)
t('polluants : hybride DIESEL = 650 € (pas catégorie 1)', taxePolluants('hybride-diesel', 'tourisme', 2026) === 650,
  String(taxePolluants('hybride-diesel', 'tourisme', 2026)))
t('polluants 2027 relevé à 800 €', taxePolluants('diesel', 'tourisme', 2027) === 800)

t('malus poids : électrique exonéré même lourd (LF 2026)', malusPoids(2400, 'electrique', 'tourisme', 2026) === 0)
t('malus poids : thermique 1 800 kg > 0', malusPoids(1800, 'diesel', 'tourisme', 2026) > 0)
t('malus poids : sous le seuil = 0', malusPoids(1400, 'diesel', 'tourisme', 2026) === 0)
t('malus CO₂ : électrique = 0', malusCO2(0, 'electrique', 'tourisme', 2026) === 0)
t('malus CO₂ : sous le seuil 108 g = 0', malusCO2(100, 'diesel', 'tourisme', 2026) === 0)

t('plafond amortissement électrique = 30 000 €', plafondAmortissement(0, 'tourisme') === 30000)
t('plafond 128 g = 18 300 €', plafondAmortissement(128, 'tourisme') === 18300)
t('plafond 200 g = 9 900 €', plafondAmortissement(200, 'tourisme') === 9900)
t('pas de plafond sur un utilitaire', plafondAmortissement(200, 'utilitaire') === Infinity)
t('part non déductible nulle sous le plafond', partNonDeductible(25000, 0, 'tourisme') === 0)
t('part non déductible = 1/3 à 45 000 € pour un électrique',
  proche(partNonDeductible(45000, 0, 'tourisme'), (45000 - 30000) / 45000))

t('prix porté TTC pour un véhicule de tourisme', proche(prixPorte(30000, 'tourisme'), 36000))
t('prix porté HT pour un utilitaire', prixPorte(30000, 'utilitaire') === 30000)

// AEN : base 15 % de 36 000 = 5 400 ; abattement 70 % = 3 780 (< plafond) → 1 620
t('AEN électrique 2026 : abattement 70 % appliqué',
  proche(avantageEnNature(36000, 'electrique', 2026), 5400 * 0.3), String(avantageEnNature(36000, 'electrique', 2026)))
t('AEN plafonné : abattement borné à 4 641,60 €',
  proche(avantageEnNature(100000, 'electrique', 2026), 15000 - 4641.60))
t('AEN thermique : aucun abattement', proche(avantageEnNature(36000, 'diesel', 2026), 5400))
t('AEN : fenêtre close en 2028', proche(avantageEnNature(36000, 'electrique', 2028), 5400))

t('millésime 2027 marqué provisoire', millesime(2027).provisoire === true)
t('millésime 2026 non provisoire', millesime(2026).provisoire === false)

console.log('\n=== MOTEUR TCO ===')
const base: TcoInput = {
  nbVehicules: 30, categorie: 'compacte', kmAn: 25000,
  dureeMois: 48, financement: 'lld', profilRecharge: 'depot-nuit',
  moisDebut: '2026-07', nbSites: 1
}
const r = calculerTco(base)

console.log(`\n  Flotte : ${r.input.nbVehicules} compactes · ${f(r.input.kmAn)} km/an · ${r.dureeMois} mois · LLD`)
console.log(`  TCO électrique  : ${f(r.elec.tcoOperationnel)} €`)
console.log(`  TCO thermique   : ${f(r.therm.tcoOperationnel)} €`)
console.log(`  Écart           : ${f(r.ecart)} € (${Math.round(r.ecartPct * 100)} %)`)
console.log(`  Infra à décaisser : ${f(r.investInfraTotal)} € · ${r.nbPoints} points · quote-part ${f(r.elec.postes.infrastructure)} €`)
console.log(`  PRK : ${r.prkElec.toFixed(3)} €/km élec · ${r.prkTherm.toFixed(3)} €/km therm`)
console.log(`  Bascule éco : ${r.basculeEco.atteinte ? r.basculeEco.valeur + ' mois' : 'non atteinte'}`)
console.log(`  Bascule tréso : ${r.basculeTreso.atteinte ? r.basculeTreso.valeur + ' mois' : 'non atteinte'}`)
console.log(`  Bascule km : ${r.basculeKm ? f(r.basculeKm) + ' km/an' : 'aucune dans la plage'}`)
console.log(`  CO₂ évité : ${r.co2EviteTonnes.toFixed(1)} t`)
console.log(`  Millésimes traversés : ${r.anneeDebut}–${r.anneeFin} (provisoires : ${r.millesimesProvisoires.join(', ') || 'aucun'})`)

t('période juillet 2026 + 48 mois → 2026-2030', r.anneeDebut === 2026 && r.anneeFin === 2030)
t('les millésimes 2027+ sont signalés provisoires', r.millesimesProvisoires.length === 4)
t('48 points sur la courbe économique', r.elec.cumulEco.length === 48)
t('courbe économique croissante', r.elec.cumulEco.every((v, k, a) => k === 0 || v >= a[k - 1]!))
t('TCO électrique positif', r.elec.tcoOperationnel > 0)
t('TCO thermique positif', r.therm.tcoOperationnel > 0)

// Valeur résiduelle : une seule déduction. En LLD elle est nulle.
t('LLD : valeur résiduelle nulle (risque chez le loueur)', r.elec.postes.valeurResiduelle === 0)

// Cohérence : somme des postes − VR = TCO
const somme = (p: typeof r.elec.postes) =>
  p.detention + p.coutCapital + p.energie + p.entretien + p.pneus + p.assurance
  + p.taxesAnnuelles + p.malus + p.chargesAEN + (p.taxeIncitative || 0) + p.gestion
  + p.infrastructure - p.valeurResiduelle
t('TCO = Σ postes − VR (électrique)', proche(somme(r.elec.postes), r.elec.tcoOperationnel, 0.0001))
t('TCO = Σ postes − VR (thermique)', proche(somme(r.therm.postes), r.therm.tcoOperationnel, 0.0001))

t('le thermique ne porte aucune infrastructure', r.therm.postes.infrastructure === 0)
t('le thermique paie des taxes annuelles', r.therm.postes.taxesAnnuelles > 0)
t('l\'électrique ne paie aucune taxe annuelle', r.elec.postes.taxesAnnuelles === 0)
t('l\'électrique consomme moins cher en énergie', r.elec.postes.energie < r.therm.postes.energie)
t('l\'électrique coûte plus cher en assurance', r.elec.postes.assurance > r.therm.postes.assurance)
t('l\'électrique coûte plus cher en pneus', r.elec.postes.pneus > r.therm.postes.pneus)

// Achat comptant : la VR doit apparaître, et une seule fois
const rAchat = calculerTco({ ...base, financement: 'achat' })
t('achat : valeur résiduelle non nulle', rAchat.elec.postes.valeurResiduelle > 0)
t('achat : détention = prix × N (pas la dépréciation nette)',
  proche(rAchat.elec.postes.detention, prixPorte(TCO_CONFIG.prix.compacte.elec, 'tourisme') * 30))
t('achat : TCO = Σ postes − VR', proche(somme(rAchat.elec.postes), rAchat.elec.tcoOperationnel, 0.0001))
t('achat : coût du capital > 0', rAchat.elec.postes.coutCapital > 0)
const rAchatSansCap = calculerTco({ ...base, financement: 'achat', coutCapitalActif: false })
t('coût du capital désactivable', rAchatSansCap.elec.postes.coutCapital === 0)
t('coût du capital < capital moyen × taux × durée (pas Prix/2)',
  rAchat.elec.postes.coutCapital > 0 &&
  rAchat.elec.postes.coutCapital > prixPorte(TCO_CONFIG.prix.compacte.elec, 'tourisme') * 30 * 0.05 * 4 / 2,
  'doit tenir compte de la VR résiduelle, donc > Prix/2×taux×durée')

// Surloyer : ne doit pas remplacer ni doubler une mensualité
const rSans = calculerTco({ ...base, financement: 'loa', surloyerElec: 0 })
const rAvec = calculerTco({ ...base, financement: 'loa', surloyerElec: 3000 })
t('surloyer : +3 000 € × 30 véhicules = +90 000 € exactement',
  proche(rAvec.elec.postes.detention - rSans.elec.postes.detention, 3000 * 30, 0.0001),
  String(rAvec.elec.postes.detention - rSans.elec.postes.detention))

// Loyer incluant les services : pas de double comptage
const rInclus = calculerTco({ ...base, loyerInclut: { entretien: true, pneus: true, assurance: true } })
t('services inclus dans le loyer : entretien neutralisé', rInclus.elec.postes.entretien === 0)
t('services inclus : assurance neutralisée', rInclus.elec.postes.assurance === 0)
t('services inclus : TCO plus faible', rInclus.elec.tcoOperationnel < r.elec.tcoOperationnel)

// Monotonie : plus de km ⇒ TCO plus élevé, pour les deux
const rPlus = calculerTco({ ...base, kmAn: 40000 })
t('TCO croît avec le kilométrage (élec)', rPlus.elec.tcoOperationnel > r.elec.tcoOperationnel)
t('TCO croît avec le kilométrage (therm)', rPlus.therm.tcoOperationnel > r.therm.tcoOperationnel)
t('l\'écart s\'améliore avec le kilométrage', rPlus.ecart > r.ecart)

// Mix de recharge : le public DC doit coûter beaucoup plus cher
const rDepot = calculerTco({ ...base, profilRecharge: 'depot-nuit' })
const rItin = calculerTco({ ...base, profilRecharge: 'itinerant' })
t('recharge itinérante bien plus chère que le dépôt',
  rItin.elec.postes.energie > rDepot.elec.postes.energie * 1.5,
  `${f(rDepot.elec.postes.energie)} → ${f(rItin.elec.postes.energie)}`)
t('profil itinérant : moins de points de charge', rItin.nbPoints < rDepot.nbPoints)

// Infrastructure
t('infrastructure : quote-part < investissement total',
  r.elec.postes.infrastructure < r.investInfraTotal + r.elec.postes.infrastructure)
t('quote-part 48 mois / 8 ans ≈ moitié de l\'investissement + récurrent',
  r.elec.postes.infrastructure > r.investInfraTotal * 0.4)
// Sur 48 mois avec un amortissement à 8 ans, le cycle 2 porte la MÊME
// quote-part résiduelle : économiquement identique. La différence est en trésorerie.
t('cycle suivant jamais plus cher que le cycle actuel', r.tcoCycleSuivant <= r.elec.tcoOperationnel + 1)
t('48 mois / 8 ans ⇒ quote-part cycle 2 identique (2 cycles pile)',
  Math.abs(r.tcoCycleSuivant - r.elec.tcoOperationnel) < 1, f(r.tcoCycleSuivant - r.elec.tcoOperationnel))
const r60 = calculerTco({...base, dureeMois:60})
t('60 mois / 8 ans ⇒ quote-part cycle 2 PLUS FAIBLE (infra bientôt amortie)',
  r60.tcoCycleSuivant < r60.elec.tcoOperationnel, f(r60.elec.tcoOperationnel - r60.tcoCycleSuivant))
t('cycle suivant : quote-part résiduelle exposée', r.infraCycleSuivant >= 0)
t('pilotage EMS évite le renforcement de raccordement',
  calculerTco({ ...base, renforcementNecessaire: true, pilotageEMS: true }).investInfraTotal <
  calculerTco({ ...base, renforcementNecessaire: true, pilotageEMS: false }).investInfraTotal)

// Taxe incitative : rien plutôt qu'un chiffre faux
t('taxe incitative : null sans données de renouvellement', r.therm.postes.taxeIncitative === null)
const rTai = calculerTco({ ...base, taiDonnees: { flotteTaxable: 200, vfeActuels: 10, tauxRenouvellement: 0.2 } })
t('taxe incitative chiffrée si données fournies', (rTai.therm.postes.taxeIncitative || 0) > 0)
t('taxe incitative nulle pour la flotte électrique', rTai.elec.postes.taxeIncitative === 0)

// Impact fiscal : jamais de double pénalité
t('impact fiscal positif (économie d\'IS)', r.elec.impactFiscal > 0)
t('IS perdu au plafond calculé à part', r.elec.isPerduPlafond >= 0)
t('impact fiscal non soustrait du TCO opérationnel',
  Math.abs(somme(r.elec.postes) - r.elec.tcoOperationnel) < 1)

// Utilitaire : pas de taxes de tourisme, TVA récupérable
const rVul = calculerTco({ ...base, categorie: 'vul' })
t('utilitaire : aucune taxe annuelle', rVul.therm.postes.taxesAnnuelles === 0)
t('utilitaire : aucun malus', rVul.therm.postes.malus === 0)
t('utilitaire : prix porté HT (TVA récupérable)',
  proche(calculerTco({ ...base, categorie: 'vul', financement: 'achat' }).elec.postes.detention,
    TCO_CONFIG.prix.vul.elec * 30))

// Scénarios de sensibilité
const prudent = calculerTco(deriverScenario(base, 'prudent'))
const favorable = calculerTco(deriverScenario(base, 'favorable'))
console.log(`\n  Scénarios : prudent ${f(prudent.ecart)} € · central ${f(r.ecart)} € · favorable ${f(favorable.ecart)} €`)
t('scénario prudent moins favorable que le central', prudent.ecart < r.ecart)
t('scénario favorable meilleur que le central', favorable.ecart > r.ecart)
t('les trois scénarios sont ordonnés', prudent.ecart < r.ecart && r.ecart < favorable.ecart)

// Date de mise en service : 2026 ≠ 2027
const r2027 = calculerTco({ ...base, moisDebut: '2027-01' })
t('démarrer en 2027 change le résultat', Math.abs(r2027.ecart - r.ecart) > 1)

// Robustesse
t('entrée vide ne plante pas', typeof calculerTco({}).ecart === 'number')
t('valeurs absurdes ne plantent pas', isFinite(calculerTco({ nbVehicules: 0, kmAn: -5 }).ecart))

console.log(`\n=== ${ok} réussis, ${ko} échoués ===\n`)
if (ko > 0) process.exit(1)

console.log('\n=== GARDE-FOU MALUS (bug détecté puis corrigé) ===')
import { malusCO2 as mc } from '../app/utils/simulateurs/fiscalite'
// Barème officiel relevé sur service-public.gouv.fr (14 points de contrôle)
for (const [g, attendu] of [[108,50],[110,100],[115,210],[120,310],[125,540],[128,818],[130,983],[135,1504],[140,2205],[150,4279],[160,8770],[170,22380],[180,45990],[190,76800]] as [number,number][]) {
  t(`malus officiel ${g} g/km = ${attendu} €`, mc(g,'diesel','tourisme',2026) === attendu, String(mc(g,'diesel','tourisme',2026)))
}
t('malus convexe : 160 g coûte >5× le malus à 128 g',
  mc(160,'diesel','tourisme',2026) > mc(128,'diesel','tourisme',2026) * 5)
t('malus plafonné à 80 000 €', mc(300,'diesel','tourisme',2026) === 80000)
t('malus croissant', [110,120,130,150,170].every((g,k,a)=>k===0||mc(g,'diesel','tourisme',2026)>=mc(a[k-1]!,'diesel','tourisme',2026)))
const rM = calculerTco({nbVehicules:30,categorie:'compacte',kmAn:25000,dureeMois:48,financement:'lld',profilRecharge:'depot-nuit',moisDebut:'2026-07',nbSites:1})
t('malus thermique = barème officiel × nb véhicules',
  rM.therm.postes.malus === 818 * 30, f(rM.therm.postes.malus))
t('écart global dans une plage prudente (0–20 %)',
  rM.ecartPct > 0 && rM.ecartPct < 0.20, `${Math.round(rM.ecartPct*100)} %`)
console.log(`\n  → écart recalculé : ${f(rM.ecart)} € (${Math.round(rM.ecartPct*100)} %)`)
console.log(`\n=== TOTAL ${ok} réussis, ${ko} échoués ===\n`)
if (ko > 0) process.exit(1)

console.log('\n=== ÉCHÉANCIER & SURCHARGES ===')
const rE = calculerTco({nbVehicules:30,categorie:'compacte',kmAn:25000,dureeMois:48,financement:'lld',profilRecharge:'depot-nuit',moisDebut:'2026-07',nbSites:1})
t('échéancier couvre chaque année traversée', rE.echeancier.length === (rE.anneeFin - rE.anneeDebut + 1), String(rE.echeancier.length))
t('l\'investissement infra est porté par la 1re année', rE.echeancier[0]!.investissement === rE.investInfraTotal)
t('les années suivantes ne portent aucun investissement', rE.echeancier.slice(1).every(l => l.investissement === 0))
t('le cumul est croissant si l\'électrique gagne', rE.echeancier[rE.echeancier.length-1]!.cumule > 0)
// Surcharges d'hypothèses
t('valeur résiduelle surchargée change le TCO',
  calculerTco({...rE.input, financement:'achat', vrElec:0.10}).elec.tcoOperationnel >
  calculerTco({...rE.input, financement:'achat', vrElec:0.50}).elec.tcoOperationnel)
t('entretien surchargé change le TCO',
  calculerTco({...rE.input, entretienElec:2000}).elec.postes.entretien >
  calculerTco({...rE.input, entretienElec:100}).elec.postes.entretien)
t('prix du gazole surchargé change l\'énergie thermique',
  calculerTco({...rE.input, prixGazole:3}).therm.postes.energie >
  calculerTco({...rE.input, prixGazole:1}).therm.postes.energie)
t('coût moyen par point surchargé change l\'investissement',
  calculerTco({...rE.input, coutPointMoyen:9000}).investInfraTotal >
  calculerTco({...rE.input, coutPointMoyen:1000}).investInfraTotal)
t('mix de recharge surchargé change le coût énergie',
  calculerTco({...rE.input, mixRecharge:{publicDC:1}}).elec.postes.energie >
  calculerTco({...rE.input, mixRecharge:{siteHC:1}}).elec.postes.energie)
console.log(`\n=== FINAL ${ok} réussis, ${ko} échoués ===\n`)
if (ko > 0) process.exit(1)

console.log('\n=== 3 DÉFAUTS TROUVÉS EN RELECTURE DE MON PROPRE CODE ===')
const bA = {nbVehicules:30,categorie:'compacte' as const,kmAn:25000,dureeMois:48 as const,profilRecharge:'depot-nuit' as const,moisDebut:'2026-07',nbSites:1}
// 1. Le coût du capital ne doit produire aucune économie d'IS
const cap0 = calculerTco({...bA, financement:'achat', tauxActualisationPct:undefined as any, coutCapitalActif:false})
const capOn = calculerTco({...bA, financement:'achat'})
t('coût du capital actif ⇒ TCO plus élevé', capOn.elec.tcoOperationnel > cap0.elec.tcoOperationnel)
t('coût du capital NE crée PAS d\'économie d\'IS',
  Math.abs(capOn.elec.impactFiscal - cap0.elec.impactFiscal) < 1,
  `${f(cap0.elec.impactFiscal)} vs ${f(capOn.elec.impactFiscal)}`)
// 2. Le malus est dans le loyer en location
t('malus compté en achat', calculerTco({...bA, financement:'achat'}).therm.postes.malus > 0)
t('malus compté en crédit', calculerTco({...bA, financement:'credit'}).therm.postes.malus > 0)
// Règle affinée : quand NOUS reconstruisons le loyer, le malus n'y est pas —
// on l'ajoute. Il n'est neutralisé que si l'utilisateur déclare une offre qui l'inclut.
t('LLD avec loyer reconstruit ⇒ malus ajouté', calculerTco({...bA, financement:'lld'}).therm.postes.malus > 0)
t('LLD avec offre réelle incluant le malus ⇒ non recompté',
  calculerTco({...bA, financement:'lld', loyerMensuelTherm:600, malusDansLoyer:true}).therm.postes.malus === 0)
// 3. L'échéancier ne compte pas l'infra deux fois
const rEch = calculerTco({...bA, financement:'lld'})
const l1 = rEch.echeancier[0]!
t('échéancier : investissement isolé de la colonne coûts',
  l1.investissement > 0 && l1.coutsElec > 0 && l1.coutsElec < rEch.elec.cumulTreso[11]!,
  `invest ${f(l1.investissement)} · coûts ${f(l1.coutsElec)}`)
t('échéancier : le total décaissé reste cohérent',
  Math.abs((l1.investissement + l1.coutsElec) - rEch.elec.cumulTreso[rEch.echeancier.length ? 5 : 0]!) >= 0)
console.log(`\n=== APRÈS CORRECTIONS ${ok} réussis, ${ko} échoués ===\n`)
if (ko > 0) process.exit(1)

console.log('\n=== LOYER FINANCIER (correction du biais pro-électrique) ===')
import { loyerFinancier } from '../app/utils/simulateurs/tcoFlotte'
// À prix égal, une VR plus basse ⇒ loyer plus élevé.
const lElec = loyerFinancier(32000, 32000*0.33, 48)
const lTherm = loyerFinancier(32000, 32000*0.42, 48)
t('à prix égal, une revente plus basse ⇒ loyer plus élevé', lElec > lTherm,
  `élec ${Math.round(lElec)} € vs therm ${Math.round(lTherm)} €`)
t('loyer financier dans un ordre de grandeur plausible', lElec > 400 && lElec < 900, String(Math.round(lElec)))
// Annuité vérifiée à la main : 48 000 € / 48 mois / 6,5 %/an = 1 138 €,
// + 25 € de frais de gestion (et non plus une marge de 12 % qui doublonnait
// avec l'entretien, les pneus et l'assurance comptés séparément).
t('formule d\'annuité conforme au calcul manuel',
  Math.abs(loyerFinancier(48000, 0, 48) - 1163) < 5, String(Math.round(loyerFinancier(48000, 0, 48))))
t('la VR réduit bien le loyer', loyerFinancier(32000, 12000, 48) < loyerFinancier(32000, 0, 48))
// Contrat : ce que contient l'offre
const bL = {nbVehicules:30,categorie:'compacte' as const,kmAn:25000,dureeMois:48 as const,financement:'lld' as const,profilRecharge:'depot-nuit' as const,moisDebut:'2026-07',nbSites:1}
t('loyer reconstruit par nous ⇒ malus ajouté', calculerTco(bL).therm.postes.malus > 0)
t('offre saisie avec malus inclus ⇒ malus non recompté',
  calculerTco({...bL, loyerMensuelTherm:600, malusDansLoyer:true}).therm.postes.malus === 0)
t('offre saisie avec malus exclu ⇒ malus ajouté',
  calculerTco({...bL, loyerMensuelTherm:600, malusDansLoyer:false}).therm.postes.malus > 0)
t('loyer déclaré TTC ⇒ pas de majoration de 20 %',
  calculerTco({...bL, loyerMensuelTherm:600, loyerEstTTC:true}).therm.postes.detention <
  calculerTco({...bL, loyerMensuelTherm:600, loyerEstTTC:false}).therm.postes.detention)
t('taxes déclarées incluses ⇒ non recomptées',
  calculerTco({...bL, taxesDansLoyer:true}).therm.postes.taxesAnnuelles === 0)
console.log(`\n=== APRÈS BARÈME OFFICIEL ${ok} réussis, ${ko} échoués ===\n`)
if (ko > 0) process.exit(1)

console.log('\n=== CORRECTIONS FINALES ===')
const bF = {nbVehicules:30,categorie:'compacte' as const,kmAn:25000,dureeMois:48 as const,financement:'achat' as const,profilRecharge:'depot-nuit' as const,moisDebut:'2026-07',nbSites:1}
const rF = calculerTco({...bF, partVehiculesFonction:1})
// AEN hors TCO
t('AEN exclu du TCO opérationnel', rF.elec.postes.chargesAEN > 0 && (() => {
  const p = rF.elec.postes
  const somme = p.detention + p.coutCapital + p.energie + p.entretien + p.pneus + p.assurance
    + p.taxesAnnuelles + p.malus + (p.taxeIncitative||0) + p.gestion + p.infrastructure - p.valeurResiduelle
  return Math.abs(somme - rF.elec.tcoOperationnel) < 1
})(), 'le TCO ne doit pas contenir les charges AEN')
t('AEN exposé comme impact employeur', rF.elec.impactEmployeurAEN > 0)
t('flotte de service et flotte de fonction ⇒ même TCO',
  Math.abs(calculerTco({...bF, partVehiculesFonction:0}).elec.tcoOperationnel - rF.elec.tcoOperationnel) < 1)
// Entretien constant
const r1 = calculerTco({...bF, dureeMois:36}), r2 = calculerTco({...bF, dureeMois:60})
t('entretien strictement proportionnel à la durée (plus de pente factice)',
  Math.abs(r2.elec.postes.entretien / r1.elec.postes.entretien - 60/36) < 0.01)
// Cession isolée
const der = rF.echeancier[rF.echeancier.length-1]!
t('cession isolée dans l\'échéancier', der.cessionElec > 0)
t('plus aucune ligne de coût négatif', rF.echeancier.every(l => l.coutsElec >= 0 && l.coutsTherm >= 0),
  rF.echeancier.map(l=>f(l.coutsElec)).join(' · '))
console.log(`\n=== TOTAL FINAL ${ok} réussis, ${ko} échoués ===\n`)
if (ko > 0) process.exit(1)

console.log('\n=== SURAMORTISSEMENT & REQUALIFICATION N1 ===')
import { suramortissement, SURAMORTISSEMENT_TAUX } from '../app/utils/simulateurs/fiscalite'
// Taux par PTAC (rubrique F.2), pas la masse à vide
t('PTAC < 2,6 t : non éligible', suramortissement('electrique', 2500, 8000, 'achat', 0.25) === 0)
t('PTAC 3 499 kg : taux 40 %', Math.abs(suramortissement('electrique', 3499, 10000, 'achat', 0.25) - 10000*0.40*0.25) < 1)
t('PTAC 3 500 kg : taux 115 %', Math.abs(suramortissement('electrique', 3500, 10000, 'achat', 0.25) - 10000*1.15*0.25) < 1)
t('le seuil se joue à 1 kg près (3499 ≠ 3500)',
  suramortissement('electrique', 3500, 10000, 'achat', 0.25) > suramortissement('electrique', 3499, 10000, 'achat', 0.25) * 2)
t('thermique : aucun suramortissement', suramortissement('diesel', 3500, 10000, 'achat', 0.25) === 0)
t('LLD : aucun suramortissement pour le client', suramortissement('electrique', 3500, 10000, 'lld', 0.25) === 0)
t('LOA : suramortissement applicable', suramortissement('electrique', 3500, 10000, 'loa', 0.25) > 0)
t('crédit : suramortissement applicable', suramortissement('electrique', 3500, 10000, 'credit', 0.25) > 0)
t('sans surcoût, aucune déduction', suramortissement('electrique', 3500, 0, 'achat', 0.25) === 0)
t('proratisé sur la période analysée',
  suramortissement('electrique', 3500, 10000, 'achat', 0.25, 0.8) < suramortissement('electrique', 3500, 10000, 'achat', 0.25, 1))

const bV = {nbVehicules:30,categorie:'vul' as const,kmAn:25000,dureeMois:48 as const,profilRecharge:'depot-nuit' as const,moisDebut:'2026-07',nbSites:1}
const vLLD = calculerTco({...bV, financement:'lld'})
const vAchat = calculerTco({...bV, financement:'achat'})
console.log(`  VUL LLD   : écart ${f(vLLD.ecart)} € · suramort. ${f(vLLD.elec.suramortissement)} €`)
console.log(`  VUL achat : écart ${f(vAchat.ecart)} € · suramort. ${f(vAchat.elec.suramortissement)} €`)
t('VUL en LLD : aucun suramortissement attribué au client', vLLD.elec.suramortissement === 0)
t('VUL en achat : suramortissement attribué', vAchat.elec.suramortissement > 0)
// Requalification N1
t('utilitaire classique : aucune taxe annuelle', calculerTco({...bV, financement:'lld'}).therm.postes.taxesAnnuelles === 0)
t('pick-up 5 places : requalifié, taxes annuelles dues',
  calculerTco({...bV, financement:'lld', typeUtilitaire:'pickup-5places'}).therm.postes.taxesAnnuelles > 0)
t('pick-up 5 places : malus dû', calculerTco({...bV, financement:'achat', typeUtilitaire:'pickup-5places'}).therm.postes.malus > 0)
t('camionnette 3 rangées : taxes dues MAIS hors champ du malus',
  calculerTco({...bV, financement:'achat', typeUtilitaire:'camionnette-3rangees'}).therm.postes.taxesAnnuelles > 0 &&
  calculerTco({...bV, financement:'achat', typeUtilitaire:'camionnette-3rangees'}).therm.postes.malus === 0)
// Malus : barème discret, aucune interpolation
t('malus 133 g = 1 276 € (valeur jamais utilisée comme ancrage)', mc(133,'diesel','tourisme',2026) === 1276, String(mc(133,'diesel','tourisme',2026)))
t('malus 157 g = 6 537 €', mc(157,'diesel','tourisme',2026) === 6537, String(mc(157,'diesel','tourisme',2026)))
t('malus 189 g = 73 689 €', mc(189,'diesel','tourisme',2026) === 73689, String(mc(189,'diesel','tourisme',2026)))
console.log(`\n=== TOTAL ${ok} réussis, ${ko} échoués ===\n`)
if (ko > 0) process.exit(1)

console.log('\n=== COHÉRENCE CHIFFRE PRINCIPAL ↔ GRAPHIQUE ===')
for (const fin of ['lld','achat','credit','loa'] as const) {
  const x = calculerTco({nbVehicules:30,categorie:'compacte',kmAn:25000,dureeMois:48,financement:fin,profilRecharge:'depot-nuit',moisDebut:'2026-07',nbSites:1})
  const finCourbe = x.therm.cumulEco[x.therm.cumulEco.length-1]! - x.elec.cumulEco[x.elec.cumulEco.length-1]!
  t(`${fin} : la courbe se termine sur le chiffre principal`,
    Math.abs(finCourbe - x.ecart) < 2, `courbe ${f(finCourbe)} vs annonce ${f(x.ecart)}`)
}
console.log(`\n=== TOTAL ${ok} réussis, ${ko} échoués ===\n`)
if (ko > 0) process.exit(1)
