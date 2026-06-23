/**
 * belgiumTaxCalc.js
 * Formules fiscales belges pour indépendants — revenus 2025 (exercice d'imposition 2026)
 *
 * Sources :
 *   INASTI  → https://www.inasti.be/fr/cotisations
 *   IPP     → SPF Finances, barème fédéral 2025
 *
 * ⚠️  SIMULATION INDICATIVE
 *     Ne tient pas compte des réductions fiscales, de la situation familiale,
 *     des revenus de remplacement, etc.
 *     Consultez un comptable agréé (IEC/IAB) avant toute décision.
 */

// ═══════════════════════════════════════════════════════════════
// CONSTANTES 2025
// ═══════════════════════════════════════════════════════════════

const INASTI_TRANCHES = [
  { max: 75_024.54,  taux: 0.2050 }, // 20,5 %
  { max: 110_562.42, taux: 0.1416 }, // 14,16 %
  { max: Infinity,   taux: 0      }, // plafonné
]

const INASTI_MIN_PRINCIPAL      = 3_486.84  // 4 × 871,71 € / trimestre
const INASTI_MIN_COMPLEMENTAIRE =   655.00  // approximatif — vérifier auprès de votre caisse

const IPP_TRANCHES = [
  { max: 16_320,   taux: 0.25 },
  { max: 28_800,   taux: 0.40 },
  { max: 49_840,   taux: 0.45 },
  { max: Infinity, taux: 0.50 },
]

const QUOTITE_EXEMPTEE  = 10_910
const TAXE_COMMUNALE    = 0.07    // additionnel communal moyen
const FORFAIT_FRAIS_MAX = 5_930   // plafond forfait frais 30 %

// ═══════════════════════════════════════════════════════════════
// COTISATIONS INASTI
// ═══════════════════════════════════════════════════════════════

export function calcCotisationsINASTI(revenuNet, statut = 'principal') {
  let cotisation = 0
  let precedentMax = 0

  for (const tranche of INASTI_TRANCHES) {
    if (revenuNet <= precedentMax) break
    cotisation   += (Math.min(revenuNet, tranche.max) - precedentMax) * tranche.taux
    precedentMax  = tranche.max
  }

  return Math.max(
    cotisation,
    statut === 'principal' ? INASTI_MIN_PRINCIPAL : INASTI_MIN_COMPLEMENTAIRE
  )
}

// ═══════════════════════════════════════════════════════════════
// IPP
// ═══════════════════════════════════════════════════════════════

export function calcIPP(revenuImposable) {
  const taxable    = Math.max(0, revenuImposable - QUOTITE_EXEMPTEE)
  let ippFederal   = 0
  let precedentMax = 0

  for (const tranche of IPP_TRANCHES) {
    if (taxable <= precedentMax) break
    ippFederal   += (Math.min(taxable, tranche.max) - precedentMax) * tranche.taux
    precedentMax  = tranche.max
  }

  return ippFederal * (1 + TAXE_COMMUNALE)
}

// ═══════════════════════════════════════════════════════════════
// CALCUL TJM
// ═══════════════════════════════════════════════════════════════

export function calcTJM({
  netMensuelSouhaite,
  joursParAn       = 220,
  semainesConges   = 5,
  pctNonFacturable = 20,
  statut           = 'principal',
}) {
  const netAnnuel       = netMensuelSouhaite * 12
  const joursConges     = semainesConges * 5
  const joursDisponibles = joursParAn - joursConges
  const joursFacturables = Math.max(1, Math.round(joursDisponibles * (1 - pctNonFacturable / 100)))

  // Dichotomie : CA brut → net cible
  const ca = trouverCA(netAnnuel, statut)

  const inasti      = calcCotisationsINASTI(ca, statut)
  const forfait     = Math.min(ca * 0.30, FORFAIT_FRAIS_MAX)
  const imposable   = Math.max(0, ca - inasti - forfait)
  const ipp         = calcIPP(imposable)
  const netReel     = ca - inasti - ipp

  return {
    tjmJour          : Math.ceil(ca / joursFacturables),
    tjmHeure         : Math.ceil(ca / joursFacturables / 8 * 10) / 10,
    caAnnuel         : Math.round(ca),
    netAnnuel        : Math.round(netReel),
    netMensuel       : Math.round(netReel / 12),
    cotisationsINASTI: Math.round(inasti),
    ipp              : Math.round(ipp),
    totalCharges     : Math.round(inasti + ipp),
    tauxChargesTotal : Math.round(((inasti + ipp) / ca) * 100),
    joursFacturables,
    joursDisponibles,
  }
}

function trouverCA(netSouhaite, statut, iterations = 60) {
  let bas  = netSouhaite
  let haut = netSouhaite * 4

  for (let i = 0; i < iterations; i++) {
    const m       = (bas + haut) / 2
    const inasti  = calcCotisationsINASTI(m, statut)
    const forfait = Math.min(m * 0.30, FORFAIT_FRAIS_MAX)
    const ipp     = calcIPP(Math.max(0, m - inasti - forfait))
    const net     = m - inasti - ipp

    if (Math.abs(net - netSouhaite) < 0.5) break
    net < netSouhaite ? (bas = m) : (haut = m)
  }

  return (bas + haut) / 2
}

// ═══════════════════════════════════════════════════════════════
// COMPARATEUR DE STATUTS
// ═══════════════════════════════════════════════════════════════

export function compareStatuts(netMensuelSouhaite, opts = {}) {
  const base = { joursParAn: 220, semainesConges: 5, pctNonFacturable: 20, ...opts }
  return {
    principal     : calcTJM({ ...base, netMensuelSouhaite, statut: 'principal' }),
    complementaire: calcTJM({ ...base, netMensuelSouhaite, statut: 'complementaire' }),
    salarie       : simulerSalarie(netMensuelSouhaite, base),
  }
}

function simulerSalaire(netMensuel, { joursParAn, semainesConges, pctNonFacturable }) {
  const brutAnnuel    = (netMensuel / 0.695) * 12
  const coutEmployeur = brutAnnuel * 1.27

  const joursConges      = semainesConges * 5
  const joursDisponibles = joursParAn - joursConges
  const joursFacturables = Math.max(1, Math.round(joursDisponibles * (1 - pctNonFacturable / 100)))

  return {
    tjmJour          : Math.ceil(coutEmployeur / joursFacturables),
    tjmHeure         : Math.ceil(coutEmployeur / joursFacturables / 8 * 10) / 10,
    caAnnuel         : Math.round(coutEmployeur),
    netAnnuel        : Math.round(netMensuel * 12),
    netMensuel       : Math.round(netMensuel),
    cotisationsINASTI: 0,
    ipp              : Math.round((brutAnnuel * 0.8693) * 0.28),
    totalCharges     : Math.round(coutEmployeur - netMensuel * 12),
    tauxChargesTotal : Math.round(((coutEmployeur - netMensuel * 12) / coutEmployeur) * 100),
    joursFacturables,
    joursDisponibles,
  }
}

// ═══════════════════════════════════════════════════════════════
// UTILITAIRE
// ═══════════════════════════════════════════════════════════════

export function formatEUR(n) {
  return new Intl.NumberFormat('fr-BE', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(n)
}
