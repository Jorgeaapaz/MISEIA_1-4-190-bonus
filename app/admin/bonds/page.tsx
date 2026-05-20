'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Bond } from '@/lib/types'

const fmt = (cents: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)
const fmtRate = (bp: number) => `${(bp / 100).toFixed(2)}%`
const fmtDate = (d: string | Date) => new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })

const EMPTY_FORM = {
  bondName: '', companyName: '', faceValue: '', totalIssuance: '',
  couponType: 'fixed', couponRate: '', paymentFrequency: 'semi-annual',
  maturityDate: '', issueDate: '', maturityType: 'medium',
  creditRating: 'BBB', sector: 'finance', description: '',
}

export default function AdminBondsPage() {
  const { token } = useAuth()
  const [bonds, setBonds] = useState<Bond[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/bonds', { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setBonds(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [token])

  useEffect(() => { load() }, [load])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const body = {
        ...form,
        faceValue: Math.round(parseFloat(form.faceValue) * 100),
        totalIssuance: Math.round(parseFloat(form.totalIssuance) * 100),
        couponRate: Math.round(parseFloat(form.couponRate) * 100),
      }
      const res = await fetch('/api/bonds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setShowForm(false)
      setForm(EMPTY_FORM)
      load()
    } catch { setError('Error de conexión') }
    finally { setSaving(false) }
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/bonds/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    })
    load()
  }

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Bonos Corporativos</h1>
          <p className="page-subtitle">Estructuración y gestión de emisiones</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancelar' : '+ Crear Bono'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card" style={{ padding: 28, marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 24 }}>Nueva Emisión</h2>
          <form onSubmit={handleCreate}>
            <div className="form-grid" style={{ marginBottom: 16 }}>
              <div>
                <label className="label">Nombre del Bono</label>
                <input className="input" value={form.bondName} onChange={e => set('bondName', e.target.value)} placeholder="PEMEX 2027" required />
              </div>
              <div>
                <label className="label">Empresa Emisora</label>
                <input className="input" value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder="Petróleos Mexicanos" required />
              </div>
              <div>
                <label className="label">Valor Nominal (MXN)</label>
                <input className="input" type="number" value={form.faceValue} onChange={e => set('faceValue', e.target.value)} placeholder="10000" required />
              </div>
              <div>
                <label className="label">Emisión Total (MXN)</label>
                <input className="input" type="number" value={form.totalIssuance} onChange={e => set('totalIssuance', e.target.value)} placeholder="5000000000" required />
              </div>
              <div>
                <label className="label">Tipo de Cupón</label>
                <select className="select" value={form.couponType} onChange={e => set('couponType', e.target.value)}>
                  <option value="fixed">Fija</option>
                  <option value="variable">Variable</option>
                </select>
              </div>
              <div>
                <label className="label">Tasa Cupón (%)</label>
                <input className="input" type="number" step="0.01" value={form.couponRate} onChange={e => set('couponRate', e.target.value)} placeholder="8.75" required />
              </div>
              <div>
                <label className="label">Frecuencia de Pago</label>
                <select className="select" value={form.paymentFrequency} onChange={e => set('paymentFrequency', e.target.value)}>
                  <option value="monthly">Mensual</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="semi-annual">Semestral</option>
                  <option value="annual">Anual</option>
                </select>
              </div>
              <div>
                <label className="label">Plazo</label>
                <select className="select" value={form.maturityType} onChange={e => set('maturityType', e.target.value)}>
                  <option value="short">Corto (≤3 años)</option>
                  <option value="medium">Medio (3-7 años)</option>
                  <option value="long">Largo (&gt;7 años)</option>
                </select>
              </div>
              <div>
                <label className="label">Fecha de Emisión</label>
                <input className="input" type="date" value={form.issueDate} onChange={e => set('issueDate', e.target.value)} required />
              </div>
              <div>
                <label className="label">Fecha de Vencimiento</label>
                <input className="input" type="date" value={form.maturityDate} onChange={e => set('maturityDate', e.target.value)} required />
              </div>
              <div>
                <label className="label">Calificación Crediticia</label>
                <select className="select" value={form.creditRating} onChange={e => set('creditRating', e.target.value)}>
                  {['AAA','AA','A','BBB','BB','B','CCC'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Sector</label>
                <select className="select" value={form.sector} onChange={e => set('sector', e.target.value)}>
                  <option value="energy">Energía</option>
                  <option value="finance">Finanzas</option>
                  <option value="tech">Tecnología</option>
                  <option value="healthcare">Salud</option>
                  <option value="real-estate">Bienes Raíces</option>
                  <option value="consumer">Consumo</option>
                  <option value="industrial">Industrial</option>
                  <option value="utilities">Utilities</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="label">Descripción</label>
              <textarea className="input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descripción del bono y uso de fondos..." style={{ resize: 'vertical' }} />
            </div>
            {error && <div style={{ background: '#1c0505', border: '1px solid #3f1212', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: 16 }}>{error}</div>}
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Guardando...</> : 'Crear Emisión'}
            </button>
          </form>
        </div>
      )}

      {/* Bonds table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
      ) : bonds.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 32, marginBottom: 12 }}>◈</div>
          <p style={{ fontWeight: 600, fontSize: 15 }}>No hay bonos aún</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Crea la primera emisión</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Bono</th>
                <th>Empresa</th>
                <th>Valor Nominal</th>
                <th>Tasa Cupón</th>
                <th>Vencimiento</th>
                <th>Rating</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {bonds.map(b => (
                <tr key={String(b._id)}>
                  <td className="primary">{b.bondName}</td>
                  <td>{b.companyName}</td>
                  <td style={{ color: '#f59e0b', fontWeight: 700 }}>{fmt(b.faceValue)}</td>
                  <td>{fmtRate(b.couponRate)}</td>
                  <td>{fmtDate(b.maturityDate)}</td>
                  <td><span className={`badge badge-${b.creditRating}`}>{b.creditRating}</span></td>
                  <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                  <td>
                    <select
                      className="select"
                      value={b.status}
                      onChange={e => updateStatus(String(b._id), e.target.value)}
                      style={{ width: 'auto', padding: '4px 8px', fontSize: 12 }}
                    >
                      <option value="draft">Draft</option>
                      <option value="offering">Offering</option>
                      <option value="active">Active</option>
                      <option value="matured">Matured</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
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
