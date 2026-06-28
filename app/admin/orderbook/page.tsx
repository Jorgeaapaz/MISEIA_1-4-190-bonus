'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Bond, Order } from '@/lib/types'

const fmt = (cents: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)
const fmtDate = (d: string | Date) => new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })

export default function OrderBookPage() {
  const { token } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [bonds, setBonds] = useState<Bond[]>([])
  const [selectedBond, setSelectedBond] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const url = `/api/orders${selectedBond ? `?bondId=${selectedBond}` : ''}`
    const [oRes, bRes] = await Promise.all([
      fetch(url, { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/bonds', { headers: { Authorization: `Bearer ${token}` } }),
    ])
    const [oData, bData] = await Promise.all([oRes.json(), bRes.json()])
    setOrders(Array.isArray(oData) ? oData : [])
    setBonds(Array.isArray(bData) ? bData : [])
    setLoading(false)
  }, [token, selectedBond])

  useEffect(() => { void load() }, [load])

  const bondMap = new Map(bonds.map(b => [String(b._id), b]))

  // Aggregate stats
  const totalDemand = orders.reduce((s, o) => s + o.requestedAmount, 0)
  const confirmedOrders = orders.filter(o => o.status === 'confirmed').length

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Libro de Órdenes</h1>
          <p className="page-subtitle">Bookbuilding — demanda de inversores</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-value">{orders.length}</div>
          <div className="stat-label">Total Órdenes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#f59e0b' }}>{confirmedOrders}</div>
          <div className="stat-label">Confirmadas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: 20 }}>{fmt(totalDemand)}</div>
          <div className="stat-label">Demanda Total</div>
        </div>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
        <label className="label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Filtrar por bono:</label>
        <select className="select" style={{ maxWidth: 280 }} value={selectedBond} onChange={e => setSelectedBond(e.target.value)}>
          <option value="">Todos los bonos</option>
          {bonds.map(b => <option key={String(b._id)} value={String(b._id)}>{b.bondName}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 32, marginBottom: 12 }}>◎</div>
          <p style={{ fontWeight: 600, fontSize: 15 }}>No hay órdenes</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Bono</th>
                <th>Inversor ID</th>
                <th>Cantidad</th>
                <th>Monto Solicitado</th>
                <th>Monto Llenado</th>
                <th>Precio/Bono</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const bond = bondMap.get(String(o.bondId))
                return (
                  <tr key={String(o._id)}>
                    <td className="primary">{bond?.bondName || String(o.bondId).slice(-8)}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{String(o.investorId).slice(-12)}</td>
                    <td>{o.quantity.toLocaleString()}</td>
                    <td style={{ color: '#f59e0b', fontWeight: 700 }}>{fmt(o.requestedAmount)}</td>
                    <td>{fmt(o.filledAmount)}</td>
                    <td>{fmt(o.pricePerBond)}</td>
                    <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                    <td>{fmtDate(o.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
