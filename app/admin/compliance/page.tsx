'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { ComplianceDocument, Bond } from '@/lib/types'

const fmtDate = (d: string | Date) => new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })

const docTypeLabel: Record<string, string> = {
  'tax': 'Fiscal',
  'fund-usage': 'Uso de Fondos',
  'covenant-compliance': 'Cumplimiento de Covenants',
}

const docTypeColor: Record<string, string> = {
  'tax': 'badge-BBB',
  'fund-usage': 'badge-A',
  'covenant-compliance': 'badge-active',
}

export default function CompliancePage() {
  const { token } = useAuth()
  const [docs, setDocs] = useState<ComplianceDocument[]>([])
  const [bonds, setBonds] = useState<Bond[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ bondId: '', documentType: 'tax', title: '', period: '' })

  const load = useCallback(async () => {
    setLoading(true)
    const [dRes, bRes] = await Promise.all([
      fetch('/api/compliance', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/bonds', { headers: { Authorization: `Bearer ${token}` } }),
    ])
    const [dData, bData] = await Promise.all([dRes.json(), bRes.json()])
    setDocs(Array.isArray(dData) ? dData : [])
    setBonds(Array.isArray(bData) ? bData : [])
    setLoading(false)
  }, [token])

  useEffect(() => { load() }, [load])

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setShowForm(false)
      setForm({ bondId: '', documentType: 'tax', title: '', period: '' })
      load()
    } catch { setError('Error de conexión') }
    finally { setSaving(false) }
  }

  const bondMap = new Map(bonds.map(b => [String(b._id), b]))
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Portal de Reportes</h1>
          <p className="page-subtitle">Documentos fiscales, de fondos y covenant compliance</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancelar' : '+ Generar Documento'}
        </button>
      </div>

      {/* Generate form */}
      {showForm && (
        <div className="card" style={{ padding: 28, marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Nuevo Documento de Cumplimiento</h2>
          <form onSubmit={handleGenerate}>
            <div className="form-grid" style={{ marginBottom: 16 }}>
              <div>
                <label className="label">Bono</label>
                <select className="select" value={form.bondId} onChange={e => set('bondId', e.target.value)} required>
                  <option value="">Seleccionar bono...</option>
                  {bonds.map(b => <option key={String(b._id)} value={String(b._id)}>{b.bondName} — {b.companyName}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Tipo de Documento</label>
                <select className="select" value={form.documentType} onChange={e => set('documentType', e.target.value)}>
                  <option value="tax">Fiscal / Tax</option>
                  <option value="fund-usage">Uso de Fondos</option>
                  <option value="covenant-compliance">Cumplimiento de Covenants</option>
                </select>
              </div>
              <div>
                <label className="label">Título</label>
                <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Reporte Fiscal Q1 2026" required />
              </div>
              <div>
                <label className="label">Período</label>
                <input className="input" value={form.period} onChange={e => set('period', e.target.value)} placeholder="Q1-2026" required />
              </div>
            </div>
            {error && <div style={{ background: '#1c0505', border: '1px solid #3f1212', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: 16 }}>{error}</div>}
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Generando...</> : 'Generar Documento'}
            </button>
          </form>
        </div>
      )}

      {/* Docs table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
      ) : docs.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 32, marginBottom: 12 }}>◐</div>
          <p style={{ fontWeight: 600, fontSize: 15 }}>No hay documentos generados</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Bono</th>
                <th>Tipo</th>
                <th>Período</th>
                <th>Generado</th>
                <th>Descargar</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(d => {
                const bond = bondMap.get(String(d.bondId))
                return (
                  <tr key={String(d._id)}>
                    <td className="primary">{d.title}</td>
                    <td>{bond?.bondName || String(d.bondId).slice(-8)}</td>
                    <td><span className={`badge ${docTypeColor[d.documentType] || 'badge-draft'}`}>{docTypeLabel[d.documentType] || d.documentType}</span></td>
                    <td style={{ color: '#f59e0b', fontWeight: 600 }}>{d.period}</td>
                    <td>{fmtDate(d.generatedAt)}</td>
                    <td>
                      <button className="btn-ghost" style={{ padding: '4px 12px', fontSize: 12 }} title={`S3 Key: ${d.s3Key}`}>
                        ↓ PDF
                      </button>
                    </td>
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
