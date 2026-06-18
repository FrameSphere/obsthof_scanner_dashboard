'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/', label: 'Übersicht' },
  { href: '/employees', label: 'Mitarbeiter' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      width: '220px',
      minHeight: '100vh',
      background: 'var(--sidebar-bg)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
    }}>
      {/* Brand */}
      <div style={{
        padding: '28px 24px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ fontSize: '11px', letterSpacing: '0.12em', color: 'var(--sidebar-text)', textTransform: 'uppercase', marginBottom: '4px' }}>
          Obsthof
        </div>
        <div style={{ fontSize: '17px', fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>
          Nikolaus
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        <div style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'var(--sidebar-text)', textTransform: 'uppercase', padding: '0 12px', marginBottom: '8px' }}>
          Navigation
        </div>
        {nav.map(({ href, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link key={href} href={href} style={{
              display: 'block',
              padding: '9px 12px',
              borderRadius: '6px',
              color: active ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
              background: active ? 'var(--sidebar-accent)' : 'transparent',
              textDecoration: 'none',
              fontWeight: active ? 600 : 400,
              fontSize: '14px',
              marginBottom: '2px',
              transition: 'background 0.15s, color 0.15s',
            }}>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        fontSize: '11px',
        color: 'var(--sidebar-text)',
        opacity: 0.5,
      }}>
        Saison 2026
      </div>
    </aside>
  )
}
