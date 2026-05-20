import Link from 'next/link'

const features = [
  {
    icon: '◈',
    color: '#f59e0b',
    title: 'Estructuración',
    desc: 'Define tasa cupón, valor nominal, frecuencia de pago y vencimiento para cada emisión.',
  },
  {
    icon: '◎',
    color: '#3b82f6',
    title: 'Bookbuilding',
    desc: 'Seguimiento en tiempo real de la demanda de inversores durante el período de oferta.',
  },
  {
    icon: '◉',
    color: '#22c55e',
    title: 'Pagos Automatizados',
    desc: 'Programa cupones y amortización del principal de forma automática y auditable.',
  },
  {
    icon: '◐',
    color: '#8b5cf6',
    title: 'Portafolio',
    desc: 'Dashboard con valor de mercado, rendimientos históricos y análisis de riesgo.',
  },
]

export default function HomePage() {
  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Minimal nav */}
      <nav style={{ borderBottom: '1px solid #1f1f1f', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: '#f59e0b', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#000', fontSize: 13, fontWeight: 900, fontFamily: 'monospace' }}>BV</span>
          </div>
          <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>BondVault</span>
        </div>
        <Link href="/login" className="btn-primary" style={{ padding: '7px 18px', fontSize: 13 }}>
          Acceder →
        </Link>
      </nav>

      {/* Hero */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 60px', textAlign: 'center' }}>
        {/* Decorative grid */}
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(#1f1f1f 1px, transparent 1px), linear-gradient(90deg, #1f1f1f 1px, transparent 1px)', backgroundSize: '60px 60px', opacity: 0.15, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 700 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1c1500', border: '1px solid #3d2f00', borderRadius: 999, padding: '5px 14px', marginBottom: 32 }}>
            <div style={{ width: 6, height: 6, background: '#f59e0b', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            <span style={{ color: '#f59e0b', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Plataforma Institucional</span>
          </div>

          <h1 style={{ fontSize: 'clamp(48px, 8vw, 88px)', fontWeight: 900, color: '#fff', lineHeight: 0.95, letterSpacing: '-0.04em', marginBottom: 24 }}>
            Bond<span style={{ color: '#f59e0b' }}>Vault</span>
          </h1>

          <p style={{ fontSize: 'clamp(16px, 2.5vw, 22px)', color: '#737373', fontWeight: 400, marginBottom: 14, lineHeight: 1.5 }}>
            Gestión de Deuda Corporativa
          </p>
          <p style={{ fontSize: 15, color: '#525252', marginBottom: 48, lineHeight: 1.7, maxWidth: 500, margin: '0 auto 48px' }}>
            Estructuración, colocación, pagos automatizados y seguimiento de portafolio — todo en una plataforma institucional.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" className="btn-primary" style={{ padding: '14px 32px', fontSize: 16, borderRadius: 10 }}>
              Acceder a la plataforma →
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, maxWidth: 900, width: '100%', marginTop: 80 }}>
          {features.map(f => (
            <div key={f.title} className="card-hover" style={{ padding: '24px', textAlign: 'left', position: 'relative' }}>
              <div style={{ width: 40, height: 40, background: f.color + '18', border: `1px solid ${f.color}33`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 20, color: f.color }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: '#525252', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 48, marginTop: 64, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { value: '$50B+', label: 'En Activos Gestionados' },
            { value: '200+', label: 'Emisiones Activas' },
            { value: '99.9%', label: 'Uptime Garantizado' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#f59e0b' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1f1f1f', padding: '20px 24px', textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: '#404040' }}>© 2026 BondVault — Plataforma de Deuda Corporativa</span>
      </footer>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  )
}
