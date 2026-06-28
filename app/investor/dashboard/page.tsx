'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Bond, Holding, Payment } from '@/lib/types'

const fmt = (cents: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)
const fmtDate = (d: string | Date) => new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${(n * 100).toFixed(2)}%`

interface HoldingEnriched extends Holding {
  bond: Bond | null
}

interface PortfolioData {
  holdings: HoldingEnriched[]
  upcoming: Payment[]
  historical: Payment[]
  summary: { totalValue: number; totalCost: number; unrealizedGain: number; holdingsCount: number }
}

const paymentTypeLabel: Record<string, string> = { coupon: 'Cupón', principal: 'Principal', 'early-redemption': 'Redención' }

export default function DashboardPage() {
  const { token } = useAuth()
  const [data, setData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/portfolio', { headers: { Authorization: `Bearer ${token}` } })
    const json = await res.json()
    setData(json)
    setLoading(false)
  }, [token])

  useEffect(() => { void load() }, [load])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
      </div>
    )
  }

  if (!data) return <div style={{ color: '#f87171', textAlign: 'center', padding: 60 }}>Error al cargar portafolio</div>

  const { summary, holdings, upcoming, historical } = data
  const gainPct = summary.totalCost > 0 ? (summary.unrealizedGain / summary.totalCost) : 0
  const isGain = summary.unrealizedGain >= 0

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Mi Portafolio</h1>
          <p className="page-subtitle">Posiciones, pagos y rendimiento histórico</p>
        </div>
        <button className="btn-ghost" onClick={load} style={{ padding: '7px 16px', fontSize: 12 }}>
          ↻ Actualizar
        </button>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: 22, color: '#f59e0b' }}>{fmt(summary.totalValue)}</div>
          <div className="stat-label">Valor Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: 22 }}>{fmt(summary.totalCost)}</div>
          <div className="stat-label">Costo Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: 22, color: isGain ? '#4ade80' : '#f87171' }}>
            {fmt(Math.abs(summary.unrealizedGain))}
          </div>
          <div className="stat-label" style={{ color: isGain ? '#4ade80' : '#f87171' }}>
            {isGain ? '↑' : '↓'} {fmtPct(gainPct)} — {isGain ? 'Ganancia' : 'Pérdida'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{summary.holdingsCount}</div>
          <div className="stat-label">Posiciones</div>
        </div>
      </div>

      {/* Holdings */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Posiciones Actuales</h2>
        {holdings.length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>◈</div>
            <p style={{ fontWeight: 600 }}>No tienes posiciones aún</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>
              <a href="/investor/screener" style={{ color: '#f59e0b', textDecoration: 'none' }}>Explorar bonos disponibles →</a>
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Bono</th>
                  <th>Empresa</th>
                  <th>Cant.</th>
                  <th>Costo Unitario</th>
                  <th>Valor Actual</th>
                  <th>Costo Total</th>
                  <th>Rendimiento</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map(h => {
                  const cost = h.purchasePrice * h.quantity
                  const gain = h.currentValue - cost
                  const pct = cost > 0 ? gain / cost : 0
                  return (
                    <tr key={String(h._id)}>
                      <td className="primary">{h.bond?.bondName || '—'}</td>
                      <td>{h.bond?.companyName || '—'}</td>
                      <td style={{ color: '#fff', fontWeight: 700 }}>{h.quantity.toLocaleString()}</td>
                      <td>{fmt(h.purchasePrice)}</td>
                      <td style={{ color: '#f59e0b', fontWeight: 700 }}>{fmt(h.currentValue)}</td>
                      <td>{fmt(cost)}</td>
                      <td style={{ color: gain >= 0 ? '#4ade80' : '#f87171', fontWeight: 700 }}>
                        {fmtPct(pct)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upcoming payments */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }} className="dash-grid">
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Próximos Pagos</h2>
          {upcoming.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>
              <p style={{ fontSize: 13 }}>No hay pagos próximos</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {upcoming.slice(0, 5).map(p => (
                <div key={String(p._id)} style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 10, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#525252', marginBottom: 2 }}>{fmtDate(p.scheduledDate)}</div>
                    <div style={{ fontSize: 13, color: '#a3a3a3', fontWeight: 600 }}>{paymentTypeLabel[p.paymentType]}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#4ade80' }}>{fmt(p.amount)}</div>
                    <span className="badge badge-scheduled" style={{ fontSize: 10 }}>programado</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Historical */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Pagos Recibidos</h2>
          {historical.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>
              <p style={{ fontSize: 13 }}>Sin historial aún</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {historical.slice(0, 5).map(p => (
                <div key={String(p._id)} style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 10, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#525252', marginBottom: 2 }}>{p.processedDate ? fmtDate(p.processedDate) : '—'}</div>
                    <div style={{ fontSize: 13, color: '#a3a3a3', fontWeight: 600 }}>{paymentTypeLabel[p.paymentType]}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#a3a3a3' }}>{fmt(p.amount)}</div>
                    <span className="badge badge-completed" style={{ fontSize: 10 }}>cobrado</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`@media(max-width:640px){.dash-grid{grid-template-columns:1fr!important}}`}</style>
    </>
  )
}
