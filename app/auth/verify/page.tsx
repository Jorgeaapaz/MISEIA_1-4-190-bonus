'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { Suspense } from 'react'

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { login } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function verify() {
      const token = searchParams.get('token')
      if (!token) { setStatus('error'); setMessage('Token no encontrado en la URL'); return }
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const data = await res.json()
        if (!res.ok) { setStatus('error'); setMessage(data.error || 'Token inválido o expirado'); return }

        login(data.token)
        setStatus('success')

        // Redirect based on role
        const role = data.user?.role
        setTimeout(() => {
          router.push(role === 'admin' ? '/admin/bonds' : '/investor/screener')
        }, 1200)
      } catch {
        setStatus('error')
        setMessage('Error de conexión')
      }
    }

    verify()
  }, [searchParams, login, router])

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 40 }}>
          <div style={{ width: 32, height: 32, background: '#f59e0b', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#000', fontSize: 13, fontWeight: 900, fontFamily: 'monospace' }}>BV</span>
          </div>
          <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: 18 }}>BondVault</span>
        </div>

        <div className="card" style={{ padding: 40 }}>
          {status === 'loading' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Verificando enlace</h2>
              <p style={{ fontSize: 13, color: '#525252' }}>Por favor espera un momento...</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div style={{ width: 64, height: 64, background: '#052e16', border: '2px solid #22c55e', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Acceso verificado</h2>
              <p style={{ fontSize: 13, color: '#525252' }}>Redirigiendo al dashboard...</p>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div style={{ width: 64, height: 64, background: '#1c0505', border: '2px solid #ef4444', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Enlace inválido</h2>
              <p style={{ fontSize: 13, color: '#737373', marginBottom: 24 }}>{message}</p>
              <Link href="/login" className="btn-primary" style={{ display: 'inline-flex', justifyContent: 'center', width: '100%', padding: 12 }}>
                Solicitar nuevo enlace
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}
