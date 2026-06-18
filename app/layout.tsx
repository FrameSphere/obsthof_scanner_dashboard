import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Obsthof Dashboard',
  description: 'Mitarbeiter & Eimer-Verwaltung',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍎</span>
              <span className="font-bold text-gray-800 text-lg">Obsthof Dashboard</span>
            </div>
            <div className="flex gap-6 text-sm font-medium">
              <Link href="/" className="text-gray-600 hover:text-green-600 transition-colors">
                Übersicht
              </Link>
              <Link href="/employees" className="text-gray-600 hover:text-green-600 transition-colors">
                Mitarbeiter
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
