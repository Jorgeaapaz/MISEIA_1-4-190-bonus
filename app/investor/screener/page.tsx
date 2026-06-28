'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Bond } from '@/lib/types'

const fmt = (cents: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)
const fmtRate = (bp: number) => `${(bp / 100).toFixed(2)}%`
const fmtDate = (d: string | Date) => new Date(d).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })

const sectorLabel: Record<string, string> = {
  energy: 'Energía', finance: 'Finanzas', tech: 'Tecnología', healthcare: 'Salud',
  'real-estate': 'Bienes Raíces', consumer: 'Consumo', industrial: 'Industrial', utilities: 'Utilities',
}

const maturityLabel: Record<string, string> = { short: 'Corto', medium: 'Medio', long: 'Largo' }

export default function BondScreenerPage() {
  const { token } = useAuth()
  const [bonds, setBonds] = useState<Bond[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ sector: '', creditRating: '', maturityType: '', minYtm: '', maxMaturity: '' })
  const [buyBond, setBuyBond] = useState<Bond | null>(null)
  const [quantity, setQuantity] = useState('1')
  const [buying, setBuying] = useState(false)
  const [buyError, setBuyError] = useState('')
  const [buySuccess, setBuySuccess] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.sector) params.set('sector', filters.sector)
    if (filters.creditRating) params.set('rating', filters.creditRating)
    if (filters.minYtm) params.set('minYtm', filters.minYtm)
    if (filters.maxMaturity) params.set('maxMaturity', filters.maxMaturity)

    const res = await fetch(`/api/bonds?${params}`)
    const data = await res.json()
    let result: Bond[] = Array.isArray(data) ? data : []
    if (filters.maturityType) result = result.filter(b => b.maturityType === filters.maturityType)
    result = result.filter(b => b.status === 'active' || b.status === 'offering')
    setBonds(result)
    setLoading(false)
  }, [filters])

  useEffect(() => { void load() }, [load])

  async function handleBuy(e: React.FormEvent) {
    e.preventDefault()
    if (!buyBond) return
    setBuyError('')
    setBuying(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bondId: String(buyBond._id), quantity: parseInt(quantity) }),
      })
      const data = await res.json()
      if (!res.ok) { setBuyError(data.error); return }
      setBuySuccess(true)
      setTimeout(() => { setBuyBond(null); setBuySuccess(false); setQuantity('1') }, 2000)
    } catch { setBuyError('Error de conexión') }
    finally { setBuying(false) }
  }

  const setFilter = (k: string, v: string) => setFilters(f => ({ ...f, [k]: v }))

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Bond Screener</h1>
          <p className="page-subtitle">Explora y compra bonos corporativos disponibles</p>
        </div>
        <div style={{ fontSize: 12, color: '#525252', background: '#111', border: '1px solid #1f1f1f', borderRadius: 6, padding: '6px 12px' }}>
          {bonds.length} bono{bonds.length !== 1 ? 's' : ''} encontrado{bonds.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 28, background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, padding: 16 }}>
        <div>
          <label className="label">Sector</label>
          <select className="select" value={filters.sector} onChange={e => setFilter('sector', e.target.value)}>
            <option value="">Todos</option>
            {Object.entries(sectorLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Calificación</label>
          <select className="select" value={filters.creditRating} onChange={e => setFilter('creditRating', e.target.value)}>
            <option value="">Todas</option>
            {['AAA','AA','A','BBB','BB','B','CCC'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Plazo</label>
          <select className="select" value={filters.maturityType} onChange={e => setFilter('maturityType', e.target.value)}>
            <option value="">Todos</option>
            <option value="short">Corto ≤3a</option>
            <option value="medium">Medio 3-7a</option>
            <option value="long">Largo &gt;7a</option>
          </select>
        </div>
        <div>
          <label className="label">YTM Mínimo (pb)</label>
          <input className="input" type="number" value={filters.minYtm} onChange={e => setFilter('minYtm', e.target.value)} placeholder="600" />
        </div>
        <div>
          <label className="label">Vcto. máximo</label>
          <input className="input" type="date" value={filters.maxMaturity} onChange={e => setFilter('maxMaturity', e.target.value)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button className="btn-ghost" onClick={() => setFilters({ sector: '', creditRating: '', maturityType: '', minYtm: '', maxMaturity: '' })} style={{ width: '100%', justifyContent: 'center' }}>
            Limpiar
          </button>
        </div>
      </div>

      {/* Bond cards */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
      ) : bonds.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 32, marginBottom: 12 }}>◈</div>
          <p style={{ fontWeight: 600, fontSize: 15 }}>No se encontraron bonos</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Ajusta los filtros de búsqueda</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {bonds.map(b => (
            <div key={String(b._id)} className="card-hover" style={{ padding: 24 }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%' }} className={`dot-${b.sector}`} />
                    <span style={{ fontSize: 11, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{sectorLabel[b.sector]}</span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{b.bondName}</h3>
                  <p style={{ fontSize: 12, color: '#737373' }}>{b.companyName}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span className={`badge badge-${b.creditRating}`}>{b.creditRating}</span>
                  <span className={`badge badge-${b.status}`}>{b.status}</span>
                </div>
              </div>

              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div style={{ background: '#0d0d0d', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: '#525252', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tasa Cupón</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#f59e0b' }}>{fmtRate(b.couponRate)}</div>
                  <div style={{ fontSize: 10, color: '#404040' }}>{b.couponType === 'fixed' ? 'Fija' : 'Variable'}</div>
                </div>
                <div style={{ background: '#0d0d0d', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: '#525252', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Valor Nominal</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{fmt(b.faceValue)}</div>
                  <div style={{ fontSize: 10, color: '#404040' }}>{maturityLabel[b.maturityType]} plazo</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#525252' }}>Vencimiento</div>
                  <div style={{ fontSize: 13, color: '#a3a3a3', fontWeight: 600 }}>{fmtDate(b.maturityDate)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#525252' }}>Frecuencia</div>
                  <div style={{ fontSize: 12, color: '#a3a3a3' }}>
                    {b.paymentFrequency === 'semi-annual' ? 'Semestral' :
                      b.paymentFrequency === 'quarterly' ? 'Trimestral' :
                      b.paymentFrequency === 'monthly' ? 'Mensual' : 'Anual'}
                  </div>
                </div>
              </div>

              {b.description && (
                <p style={{ fontSize: 12, color: '#525252', lineHeight: 1.5, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {b.description}
                </p>
              )}

              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                onClick={() => { setBuyBond(b); setBuyError(''); setBuySuccess(false); setQuantity('1') }}
              >
                Comprar Bono
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Buy modal */}
      {buyBond && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setBuyBond(null) }}>
          <div className="modal-box">
            {buySuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 60, height: 60, background: '#052e16', border: '2px solid #22c55e', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>¡Orden confirmada!</h3>
                <p style={{ fontSize: 13, color: '#525252' }}>Tu compra ha sido procesada exitosamente.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Comprar {buyBond.bondName}</h3>
                    <p style={{ fontSize: 13, color: '#737373' }}>{buyBond.companyName}</p>
                  </div>
                  <button onClick={() => setBuyBond(null)} style={{ background: 'transparent', border: 'none', color: '#525252', cursor: 'pointer', fontSize: 18 }}>✕</button>
                </div>

                <div style={{ background: '#0d0d0d', borderRadius: 10, padding: 16, marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#525252' }}>Precio por bono</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>{fmt(buyBond.faceValue)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#525252' }}>Tasa cupón</span>
                    <span style={{ fontSize: 14, color: '#4ade80' }}>{fmtRate(buyBond.couponRate)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: '#525252' }}>Vencimiento</span>
                    <span style={{ fontSize: 14, color: '#a3a3a3' }}>{fmtDate(buyBond.maturityDate)}</span>
                  </div>
                </div>

                <form onSubmit={handleBuy}>
                  <div style={{ marginBottom: 16 }}>
                    <label className="label">Cantidad de bonos</label>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={e => setQuantity(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ background: '#1c1500', border: '1px solid #3d2f00', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: '#a3a3a3' }}>Total a invertir</span>
                      <span style={{ fontSize: 18, fontWeight: 800, color: '#f59e0b' }}>
                        {fmt(buyBond.faceValue * (parseInt(quantity) || 0))}
                      </span>
                    </div>
                  </div>

                  {buyError && (
                    <div style={{ background: '#1c0505', border: '1px solid #3f1212', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: 12 }}>{buyError}</div>
                  )}

                  <button type="submit" className="btn-primary" disabled={buying} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                    {buying ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Procesando...</> : 'Confirmar Compra'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
