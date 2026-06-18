import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'Obsthof Nikolaus — Verwaltung',
  description: 'Mitarbeiter- und Ernteverwaltung',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{
          flex: 1,
          padding: '40px 48px',
          maxWidth: '1100px',
          overflowX: 'hidden',
        }}>
          {children}
        </main>
      </body>
    </html>
  )
}
