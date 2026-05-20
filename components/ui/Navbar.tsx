'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    router.push('/')
  }

  const isActive = (href: string) =>
    pathname.startsWith(href) ? 'nav-link nav-link-active' : 'nav-link'

  const investorLinks = [
    { href: '/investor/screener', label: 'Screener' },
    { href: '/investor/dashboard', label: 'Portafolio' },
    { href: '/investor/alerts', label: 'Alertas' },
  ]

  const adminLinks = [
    { href: '/admin/bonds', label: 'Bonos' },
    { href: '/admin/orderbook', label: 'Órdenes' },
    { href: '/admin/payments', label: 'Pagos' },
    { href: '/admin/compliance', label: 'Reportes' },
  ]

  const links = user?.role === 'admin' ? adminLinks : investorLinks

  return (
    <nav style={{ background: '#0a0a0a', borderBottom: '1px solid #1f1f1f' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        {/* Logo */}
        <Link href={user ? (user.role === 'admin' ? '/admin/bonds' : '/investor/screener') : '/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: '#f59e0b', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#000', fontSize: 13, fontWeight: 900, fontFamily: 'monospace' }}>BV</span>
          </div>
          <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>BondVault</span>
        </Link>

        {/* Desktop nav */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden-mobile">
            {links.map(link => (
              <Link key={link.href} href={link.href} className={isActive(link.href)}>
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <>
              <div style={{ textAlign: 'right' }} className="hidden-mobile">
                <div style={{ fontSize: 12, color: '#a3a3a3', fontWeight: 600 }}>{user.email}</div>
                <div style={{ fontSize: 10, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{user.role}</div>
              </div>
              <button onClick={handleLogout} className="btn-ghost" style={{ padding: '6px 14px', fontSize: 12 }}>
                Salir
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-primary" style={{ padding: '6px 16px', fontSize: 13 }}>
              Acceder
            </Link>
          )}

          {/* Mobile menu toggle */}
          {user && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'transparent', border: '1px solid #1f1f1f', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#a3a3a3' }}
              className="show-mobile"
            >
              ☰
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && user && (
        <div style={{ borderTop: '1px solid #1f1f1f', padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {links.map(link => (
            <Link key={link.href} href={link.href} className={isActive(link.href)} onClick={() => setMenuOpen(false)} style={{ display: 'block' }}>
              {link.label}
            </Link>
          ))}
          <div style={{ fontSize: 12, color: '#525252', padding: '8px 12px' }}>{user.email}</div>
        </div>
      )}

      <style>{`
        @media (min-width: 640px) { .hidden-mobile { display: flex !important; } .show-mobile { display: none !important; } }
        @media (max-width: 639px) { .hidden-mobile { display: none !important; } .show-mobile { display: flex !important; } }
      `}</style>
    </nav>
  )
}
