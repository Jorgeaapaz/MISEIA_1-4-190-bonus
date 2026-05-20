import { Bond, PaymentFrequency } from './types'

/**
 * All money values are in cents.
 */

export function couponPerPeriod(bond: Bond): number {
  const annualCouponCents = Math.round((bond.faceValue * bond.couponRate) / 10000)
  const periodsPerYear = frequencyToPeriodsPerYear(bond.paymentFrequency)
  return Math.round(annualCouponCents / periodsPerYear)
}

export function frequencyToPeriodsPerYear(freq: PaymentFrequency): number {
  switch (freq) {
    case 'monthly': return 12
    case 'quarterly': return 4
    case 'semi-annual': return 2
    case 'annual': return 1
  }
}

export function paymentDates(bond: Bond): Date[] {
  const dates: Date[] = []
  const periodsPerYear = frequencyToPeriodsPerYear(bond.paymentFrequency)
  const monthsBetween = Math.round(12 / periodsPerYear)

  const current = new Date(bond.issueDate)
  const maturity = new Date(bond.maturityDate)

  current.setMonth(current.getMonth() + monthsBetween)

  while (current <= maturity) {
    dates.push(new Date(current))
    current.setMonth(current.getMonth() + monthsBetween)
  }

  return dates
}

export function ytm(bond: Bond, currentPriceInCents: number): number {
  // Newton-Raphson approximation for YTM
  const periods = frequencyToPeriodsPerYear(bond.paymentFrequency)
  const coupon = couponPerPeriod(bond)
  const face = bond.faceValue
  const price = currentPriceInCents

  const yearsToMaturity =
    (new Date(bond.maturityDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365.25)

  const n = Math.round(yearsToMaturity * periods)
  if (n <= 0) return 0

  // Approximate YTM
  const approx = (coupon + (face - price) / n) / ((face + price) / 2)
  return Math.round(approx * 10000) // return in basis points
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(cents / 100)
}

export function formatBasisPoints(bp: number): string {
  return `${(bp / 100).toFixed(2)}%`
}
