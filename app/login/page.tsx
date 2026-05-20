'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al enviar enlace'); return }
      setSent(true)
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {/* BG grid */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(#1f1f1f 1px, transparent 1px), linear-gradient(90deg, #1f1f1f 1px, transparent 1px)', backgroundSize: '60px 60px', opacity: 0.12, pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, background: '#f59e0b', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#000', fontSize: 15, fontWeight: 900, fontFamily: 'monospace' }}>BV</span>
            </div>
            <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em' }}>BondVault</span>
          </Link>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              {/* Amber checkmark */}
              <div style={{ width: 64, height: 64, background: '#1c1500', border: '2px solid #f59e0b', borderRadius: '50%', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Revisa tu correo</h2>
              <p style={{ fontSize: 14, color: '#737373', lineHeight: 1.6, marginBottom: 24 }}>
                Te enviamos un enlace de acceso a <strong style={{ color: '#a3a3a3' }}>{email}</strong>. El enlace expira en 15 minutos.
              </p>
              <button onClick={() => { setSent(false); setEmail(''); setName('') }} className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                Enviar otro enlace
              </button>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Acceder</h1>
              <p style={{ fontSize: 13, color: '#525252', marginBottom: 28 }}>
                Ingresa tu email y te enviamos un enlace de acceso seguro.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="label">Nombre</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="Tu nombre completo"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Email institucional</label>
                  <input
                    className="input"
                    type="email"
                    placeholder="nombre@empresa.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <div style={{ background: '#1c0505', border: '1px solid #3f1212', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f87171' }}>
                    {error}
                  </div>
                )}

                <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center', padding: '12px', fontSize: 15 }}>
                  {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Enviando...</> : 'Enviar enlace de acceso'}
                </button>
              </form>

              <div style={{ marginTop: 24, padding: '14px', background: '#0d0d0d', borderRadius: 8, border: '1px solid #1f1f1f' }}>
                <p style={{ fontSize: 12, color: '#525252', lineHeight: 1.6, margin: 0 }}>
                  🔐 Sin contraseñas. Tu enlace de acceso es único, seguro y expira en 15 minutos.
                </p>
              </div>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#404040' }}>
          <Link href="/" style={{ color: '#737373', textDecoration: 'none' }}>← Volver al inicio</Link>
        </p>
      </div>
    </div>
  )
}
