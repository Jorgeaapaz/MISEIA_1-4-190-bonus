'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Alert } from '@/lib/types'

const fmtDate = (d: string | Date) => {
  const date = new Date(d)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffH = Math.floor(diffMs / 3600000)
  if (diffH < 24) return diffH === 0 ? 'Hace menos de 1h' : `Hace ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  return `Hace ${diffD}d`
}

const severityIcon = {
  info: { icon: 'ℹ', color: '#3b82f6', bg: '#0c1a3d', border: '#1e3a7a' },
  warning: { icon: '⚠', color: '#f59e0b', bg: '#1c1500', border: '#3d2f00' },
  critical: { icon: '⚡', color: '#ef4444', bg: '#1c0505', border: '#3f1212' },
}

const typeLabel: Record<string, string> = {
  'rating-change': 'Cambio de Rating',
  'price-fluctuation': 'Fluctuación de Precio',
  'rebalancing': 'Rebalanceo',
  'payment-due': 'Pago Próximo',
  'coupon-paid': 'Cupón Cobrado',
}

export default function AlertsPage() {
  const { token } = useAuth()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('')
  const [marking, setMarking] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/alerts', { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setAlerts(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [token])

  useEffect(() => { void load() }, [load])

  async function markRead(alertId: string) {
    setMarking(alertId)
    await fetch('/api/alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ alertId }),
    })
    setAlerts(a => a.map(x => String(x._id) === alertId ? { ...x, read: true } : x))
    setMarking(null)
  }

  async function markAllRead() {
    const unread = alerts.filter(a => !a.read)
    await Promise.all(unread.map(a => markRead(String(a._id))))
  }

  const filtered = alerts.filter(a => {
    if (filterType && a.alertType !== filterType) return false
    if (filterSeverity && a.severity !== filterSeverity) return false
    return true
  })

  const unreadCount = alerts.filter(a => !a.read).length

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            Alertas
            {unreadCount > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', fontSize: 12, fontWeight: 700, borderRadius: 999, padding: '2px 8px' }}>
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="page-subtitle">Notificaciones de riesgo y eventos de portafolio</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn-ghost" onClick={markAllRead} style={{ padding: '7px 16px', fontSize: 12 }}>
            Marcar todo como leído
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <select className="select" style={{ maxWidth: 200 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">Todos los tipos</option>
          {Object.entries(typeLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="select" style={{ maxWidth: 160 }} value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}>
          <option value="">Toda severidad</option>
          <option value="info">Info</option>
          <option value="warning">Advertencia</option>
          <option value="critical">Crítico</option>
        </select>
        {(filterType || filterSeverity) && (
          <button className="btn-ghost" onClick={() => { setFilterType(''); setFilterSeverity('') }} style={{ padding: '8px 14px', fontSize: 12 }}>
            ✕ Limpiar
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 32, marginBottom: 12 }}>◐</div>
          <p style={{ fontWeight: 600, fontSize: 15 }}>
            {alerts.length === 0 ? 'Sin alertas' : 'No hay alertas con ese filtro'}
          </p>
          {alerts.length === 0 && <p style={{ fontSize: 13, marginTop: 4 }}>Tu portafolio está tranquilo por ahora.</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(alert => {
            const sv = severityIcon[alert.severity]
            return (
              <div
                key={String(alert._id)}
                className={`alert-${alert.severity}`}
                style={{
                  background: alert.read ? '#0d0d0d' : '#111',
                  border: `1px solid ${alert.read ? '#171717' : '#1f1f1f'}`,
                  borderRadius: 12,
                  padding: '16px 20px',
                  display: 'flex',
                  gap: 16,
                  alignItems: 'flex-start',
                  opacity: alert.read ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {/* Icon */}
                <div style={{ width: 38, height: 38, background: sv.bg, border: `1px solid ${sv.border}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {sv.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {typeLabel[alert.alertType] || alert.alertType}
                        </span>
                        <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#2d2d2d', display: 'inline-block' }} />
                        <span style={{ fontSize: 11, color: sv.color, fontWeight: 700, textTransform: 'uppercase' }}>{alert.severity}</span>
                        {!alert.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: sv.color }} />}
                      </div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{alert.title}</h3>
                      <p style={{ fontSize: 13, color: '#737373', lineHeight: 1.5 }}>{alert.message}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 11, color: '#404040', marginBottom: 8, whiteSpace: 'nowrap' }}>{fmtDate(alert.createdAt)}</div>
                      {!alert.read && (
                        <button
                          className="btn-ghost"
                          onClick={() => markRead(String(alert._id))}
                          disabled={marking === String(alert._id)}
                          style={{ padding: '5px 12px', fontSize: 11, whiteSpace: 'nowrap' }}
                        >
                          {marking === String(alert._id) ? '...' : '✓ Leída'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
