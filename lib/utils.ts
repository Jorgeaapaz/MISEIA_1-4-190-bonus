export function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export function formatBasisPoints(bp: number): string {
  return `${(bp / 100).toFixed(2)}%`
}

export function formatDate(d: string | Date): string {
  return new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}
