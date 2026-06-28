'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Payment } from '@/lib/types'

const fmt = (cents: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)
const fmtDate = (d: string | Date) => new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })

const typeLabel: Record<string, string> = { coupon: 'Cupón', principal: 'Principal', 'early-redemption': 'Redención Anticipada' }

export default function AdminPaymentsPage() {
  const { token } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const url = `/api/payments${filterStatus ? `?status=${filterStatus}` : ''}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setPayments(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [token, filterStatus])

  useEffect(() => { void load() }, [load])

  async function processPayment(paymentId: string, status: string) {
    setProcessing(paymentId)
    await fetch('/api/payments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ paymentId, status }),
    })
    await load()
    setProcessing(null)
  }

  // Stats
  const scheduled = payments.filter(p => p.status === 'scheduled').length
  const completed = payments.filter(p => p.status === 'completed').length
  const totalScheduled = payments.filter(p => p.status === 'scheduled').reduce((s, p) => s + p.amount, 0)

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pagos Automatizados</h1>
          <p className="page-subtitle">Cupones y amortización del principal</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#60a5fa' }}>{scheduled}</div>
          <div className="stat-label">Programados</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#4ade80' }}>{completed}</div>
          <div className="stat-label">Completados</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: 20, color: '#f59e0b' }}>{fmt(totalScheduled)}</div>
          <div className="stat-label">Monto Pendiente</div>
        </div>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
        <label className="label" style={{ margin: 0 }}>Estado:</label>
        <select className="select" style={{ maxWidth: 200 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Todos</option>
          <option value="scheduled">Programados</option>
          <option value="processing">Procesando</option>
          <option value="completed">Completados</option>
          <option value="failed">Fallidos</option>
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
      ) : payments.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 32, marginBottom: 12 }}>◉</div>
          <p style={{ fontWeight: 600, fontSize: 15 }}>No hay pagos</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Referencia</th>
                <th>Bono ID</th>
                <th>Tipo</th>
                <th>Monto</th>
                <th>Fecha Programada</th>
                <th>Fecha Procesado</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={String(p._id)}>
                  <td className="primary" style={{ fontFamily: 'monospace', fontSize: 11 }}>{p.reference}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{String(p.bondId).slice(-8)}</td>
                  <td>
                    <span style={{ fontSize: 12, fontWeight: 600, color: p.paymentType === 'principal' ? '#f59e0b' : '#a3a3a3' }}>
                      {typeLabel[p.paymentType] || p.paymentType}
                    </span>
                  </td>
                  <td style={{ color: '#f59e0b', fontWeight: 700 }}>{fmt(p.amount)}</td>
                  <td>{fmtDate(p.scheduledDate)}</td>
                  <td>{p.processedDate ? fmtDate(p.processedDate) : <span style={{ color: '#525252' }}>—</span>}</td>
                  <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                  <td>
                    {p.status === 'scheduled' && (
                      <button
                        className="btn-primary btn-sm"
                        onClick={() => processPayment(String(p._id), 'completed')}
                        disabled={processing === String(p._id)}
                        style={{ background: '#052e16', color: '#4ade80', border: '1px solid #14532d', fontSize: 11 }}
                      >
                        {processing === String(p._id) ? '...' : '✓ Procesar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
